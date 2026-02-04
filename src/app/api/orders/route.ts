import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { mockOrders } from '@/data/mock-orders';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * 주문 목록 조회
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: '사용자 ID가 필요합니다.',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (*)
        ),
        order_free_gifts (
          *,
          products (*)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('주문 목록 조회 오류 또는 데이터 없음, MOCK 데이터 사용:', error);
      // 에러 발생하거나 데이터가 없으면 MOCK 데이터 반환
      const filteredOrders = mockOrders.filter(order => order.userId === userId);
      return NextResponse.json({
        success: true,
        orders: filteredOrders,
      });
    }

    return NextResponse.json({
      success: true,
      orders: data || [],
    });
  } catch (error) {
    console.error('주문 목록 조회 오류, MOCK 데이터 사용:', error);
    // 에러 발생 시에도 MOCK 데이터 반환
    const userId = new URL(request.url).searchParams.get('userId') || 'user-1';
    const filteredOrders = mockOrders.filter(order => order.userId === userId);
    return NextResponse.json({
      success: true,
      orders: filteredOrders,
    });
  }
}

/**
 * 주문 생성 및 결제 요청
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, items, shippingAddress, couponCode, appliedPromotions, coinPaymentAmount } = body;

    if (!userId || !items || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '사용자 ID와 주문 상품이 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 총 금액 계산
    let totalAmount = items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );

    // 쿠폰 할인 적용
    let discountAmount = 0;
    let appliedCouponId = null;
    if (couponCode) {
      const { validateCoupon } = await import('@/lib/utils/coupon');
      const productIds = items.map((item: any) => item.productId);
      
      const { data: couponData } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .single();

      if (couponData) {
        const coupon = {
          ...couponData,
          productIds: couponData.product_ids ? JSON.parse(couponData.product_ids) : [],
          categoryIds: couponData.category_ids ? JSON.parse(couponData.category_ids) : [],
          bjId: couponData.bj_id,
          isActive: couponData.is_active,
        };

        const validation = validateCoupon(coupon, totalAmount, userId, productIds);
        if (validation.isValid && validation.discountAmount) {
          discountAmount = validation.discountAmount;
          appliedCouponId = couponData.id;
          
          // 쿠폰 사용 횟수 증가
          await supabaseAdmin
            .from('coupons')
            .update({ usage_count: couponData.usage_count + 1 })
            .eq('id', couponData.id);
        }
      }
    }

    // 1+1 프로모션 적용
    const freeItems: any[] = [];
    if (appliedPromotions?.bogo && appliedPromotions.bogo.length > 0) {
      for (const bogoId of appliedPromotions.bogo) {
        const { data: bogo } = await supabaseAdmin
          .from('buy_one_get_one')
          .select('*')
          .eq('id', bogoId)
          .eq('is_active', true)
          .single();

        if (bogo) {
          const orderItem = items.find((item: any) => item.productId === bogo.product_id);
          if (orderItem && orderItem.quantity >= bogo.min_quantity) {
            const freeQuantity = Math.floor(orderItem.quantity / bogo.min_quantity);
            freeItems.push({
              productId: bogo.free_product_id || bogo.product_id,
              quantity: freeQuantity,
              price: 0, // 무료
              isFreeGift: true,
            });
          }
        }
      }
    }

    // 사은품 프로모션 적용
    const giftItems: any[] = [];
    if (appliedPromotions?.freeGifts && appliedPromotions.freeGifts.length > 0) {
      for (const giftId of appliedPromotions.freeGifts) {
        const { data: gift } = await supabaseAdmin
          .from('free_gifts')
          .select('*')
          .eq('id', giftId)
          .eq('is_active', true)
          .single();

        if (gift && gift.stock > gift.usage_count) {
          const productIds = gift.product_ids ? JSON.parse(gift.product_ids) : [];
          const hasValidProduct = productIds.length === 0 || 
            items.some((item: any) => productIds.includes(item.productId));
          
          const meetsMinAmount = !gift.min_purchase_amount || totalAmount >= gift.min_purchase_amount;
          const meetsMinQuantity = !gift.min_quantity || 
            items.reduce((sum: number, item: any) => sum + item.quantity, 0) >= gift.min_quantity;

          if (hasValidProduct && meetsMinAmount && meetsMinQuantity) {
            giftItems.push({
              productId: gift.gift_product_id,
              quantity: 1,
              price: 0, // 무료
              isFreeGift: true,
              freeGiftId: giftId,
            });

            // 사은품 사용 횟수 증가 및 재고 감소
            await supabaseAdmin
              .from('free_gifts')
              .update({ 
                usage_count: gift.usage_count + 1,
                stock: gift.stock - 1,
              })
              .eq('id', giftId);
          }
        }
      }
    }

    // 코인 결제 처리
    let coinPaymentAmountFinal = 0;
    let coinSpent = 0;
    if (coinPaymentAmount && coinPaymentAmount > 0) {
      // coinPaymentAmount는 원화 금액
      // 코인 시세 조회
      const { data: prices } = await supabaseAdmin
        .from('coin_prices')
        .select('*')
        .eq('is_active', true)
        .order('effective_from', { ascending: false })
        .limit(1);

      if (prices && prices.length > 0) {
        const currentPrice = prices[0].price;
        // 원화 금액을 코인 수로 변환
        coinSpent = Math.ceil(coinPaymentAmount / currentPrice);
        
        // 코인 잔액 확인 및 사용
        const { data: coin } = await supabaseAdmin
          .from('user_coins')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (coin && coin.balance >= coinSpent) {
          coinPaymentAmountFinal = coinSpent * currentPrice; // 실제 차감될 금액 (코인 수 * 시세)
          
          // 코인 사용
          await supabaseAdmin
            .from('user_coins')
            .update({
              balance: coin.balance - coinSpent,
              total_spent: coin.total_spent + coinSpent,
              updated_at: new Date().toISOString(),
            })
            .eq('id', coin.id);

          // 거래 내역 기록
          await supabaseAdmin
            .from('coin_transactions')
            .insert({
              user_id: userId,
              type: 'spend',
              amount: -coinSpent,
              balance: coin.balance - coinSpent,
              description: `주문 결제 (${coinPaymentAmountFinal.toLocaleString()}원)`,
              order_id: null, // 주문 ID는 나중에 업데이트
              status: 'pending',
            });
        } else {
          // 코인 잔액 부족
          return NextResponse.json(
            {
              success: false,
              error: '코인 잔액이 부족합니다.',
            },
            { status: 400 }
          );
        }
      }
    }

    // 최종 금액 계산 (할인 - 코인 결제)
    const finalAmount = Math.max(0, totalAmount - discountAmount - coinPaymentAmountFinal);

    // 주문 생성
    const orderId = crypto.randomUUID();
    const sessionId = `session-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        id: orderId,
        user_id: userId,
        session_id: sessionId,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        coin_payment_amount: coinPaymentAmountFinal,
        final_amount: finalAmount,
        status: 'pending',
        shipping_address: shippingAddress,
        coupon_code: couponCode || null,
      })
      .select()
      .single();

    if (orderError) {
      console.error('주문 생성 오류:', orderError);
      return NextResponse.json(
        {
          success: false,
          error: '주문을 생성할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    // 주문 상품 생성 (일반 상품 + 무료 상품)
    const allOrderItems = [
      ...items.map((item: any) => ({
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
      })),
      ...freeItems.map((item: any) => ({
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        price: 0, // 무료
      })),
      ...giftItems.map((item: any) => ({
        order_id: orderId,
        product_id: item.productId,
        quantity: item.quantity,
        price: 0, // 무료
      })),
    ];

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(allOrderItems);

    // 쿠폰 사용 기록
    if (appliedCouponId) {
      await supabaseAdmin
        .from('order_coupons')
        .insert({
          order_id: orderId,
          coupon_id: appliedCouponId,
          coupon_code: couponCode,
          discount_amount: discountAmount,
        });
    }

    // 사은품 사용 기록
    if (giftItems.length > 0) {
      const giftRecords = giftItems.map((item: any) => ({
        order_id: orderId,
        free_gift_id: item.freeGiftId,
        gift_product_id: item.productId,
        quantity: item.quantity,
      }));
      await supabaseAdmin
        .from('order_free_gifts')
        .insert(giftRecords);
    }

    // 코인 결제 거래 내역 업데이트 (주문 ID 추가)
    if (coinSpent > 0) {
      await supabaseAdmin
        .from('coin_transactions')
        .update({ order_id: orderId, status: 'completed' })
        .eq('user_id', userId)
        .eq('type', 'spend')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);
    }

    if (itemsError) {
      console.error('주문 상품 생성 오류:', itemsError);
      // 주문 삭제
      await supabaseAdmin.from('orders').delete().eq('id', orderId);
      return NextResponse.json(
        {
          success: false,
          error: '주문 상품을 생성할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    // 결제 정보 반환 (토스페이먼츠 연동 준비)
    return NextResponse.json({
      success: true,
      order: {
        ...order,
        items: allOrderItems,
        discountAmount,
        finalAmount,
        couponCode: couponCode || undefined,
        freeGifts: giftItems,
      },
      payment: {
        orderId,
        amount: finalAmount, // 할인 적용된 최종 금액
        originalAmount: totalAmount, // 원래 금액
        discountAmount,
        coinPaymentAmount: coinPaymentAmountFinal,
        coinSpent,
        orderName: `주문 ${orderId.substring(0, 8)}`,
        // 토스페이먼츠 연동 시 필요한 정보
        customerName: userId, // 실제로는 사용자 이름 필요
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success`,
        failUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/fail`,
      },
    });
  } catch (error) {
    console.error('주문 생성 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '주문을 생성할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
