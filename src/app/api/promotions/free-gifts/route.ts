import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * 사은품 프로모션 목록 조회
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bjId = searchParams.get('bjId');
    const productId = searchParams.get('productId');

    let query = supabaseAdmin
      .from('free_gifts')
      .select('*')
      .order('created_at', { ascending: false });

    if (bjId) {
      query = query.eq('bj_id', bjId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('사은품 프로모션 조회 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '프로모션 목록을 조회할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    // JSON 필드 파싱
    const promotions = (data || []).map((promo: any) => ({
      ...promo,
      productIds: promo.product_ids ? JSON.parse(promo.product_ids) : [],
      bjId: promo.bj_id,
      giftProductId: promo.gift_product_id,
      isActive: promo.is_active,
      createdAt: promo.created_at,
      updatedAt: promo.updated_at,
    }));

    // 상품 ID 필터링 (서버 사이드)
    let filteredPromotions = promotions;
    if (productId) {
      filteredPromotions = promotions.filter((promo: any) => {
        if (!promo.productIds || promo.productIds.length === 0) return true;
        return promo.productIds.includes(productId);
      });
    }

    return NextResponse.json({
      success: true,
      promotions: filteredPromotions,
    });
  } catch (error) {
    console.error('사은품 프로모션 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '프로모션 목록을 조회할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}

/**
 * 사은품 프로모션 생성
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      giftProductId,
      minPurchaseAmount,
      minQuantity,
      productIds,
      validFrom,
      validUntil,
      stock,
      usageLimit,
      bjId,
    } = body;

    if (!name || !giftProductId || !validFrom || !validUntil || stock === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 정보가 누락되었습니다.',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('free_gifts')
      .insert({
        name,
        description,
        gift_product_id: giftProductId,
        min_purchase_amount: minPurchaseAmount || null,
        min_quantity: minQuantity || null,
        product_ids: productIds && productIds.length > 0 ? JSON.stringify(productIds) : null,
        valid_from: validFrom,
        valid_until: validUntil,
        stock,
        usage_limit: usageLimit || null,
        usage_count: 0,
        bj_id: bjId || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('사은품 프로모션 생성 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '프로모션을 생성할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    // JSON 필드 파싱
    const promotion = {
      ...data,
      productIds: data.product_ids ? JSON.parse(data.product_ids) : [],
      bjId: data.bj_id,
      giftProductId: data.gift_product_id,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({
      success: true,
      promotion,
    });
  } catch (error) {
    console.error('사은품 프로모션 생성 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '프로모션을 생성할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
