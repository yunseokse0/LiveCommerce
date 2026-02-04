import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { generateCouponCode } from '@/lib/utils/coupon';

export const dynamic = 'force-dynamic';

/**
 * 쿠폰 목록 조회
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bjId = searchParams.get('bjId');
    const isActive = searchParams.get('isActive');

    let query = supabaseAdmin
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (bjId) {
      query = query.eq('bj_id', bjId);
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;

    if (error) {
      console.error('쿠폰 목록 조회 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '쿠폰 목록을 조회할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    // JSON 필드 파싱
    const coupons = (data || []).map((coupon: any) => ({
      ...coupon,
      productIds: coupon.product_ids ? JSON.parse(coupon.product_ids) : [],
      categoryIds: coupon.category_ids ? JSON.parse(coupon.category_ids) : [],
      bjId: coupon.bj_id,
      isActive: coupon.is_active,
      createdAt: coupon.created_at,
      updatedAt: coupon.updated_at,
    }));

    return NextResponse.json({
      success: true,
      coupons,
    });
  } catch (error) {
    console.error('쿠폰 목록 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '쿠폰 목록을 조회할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}

/**
 * 쿠폰 생성
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      code,
      description,
      type,
      value,
      minPurchaseAmount,
      maxDiscountAmount,
      validFrom,
      validUntil,
      usageLimit,
      perUserLimit,
      bjId,
      productIds,
      categoryIds,
    } = body;

    if (!name || !type || value === undefined || !validFrom || !validUntil) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 정보가 누락되었습니다.',
        },
        { status: 400 }
      );
    }

    // 쿠폰 코드 생성 (없으면 자동 생성)
    const couponCode = code || generateCouponCode();

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .insert({
        name,
        code: couponCode,
        description,
        type,
        value,
        min_purchase_amount: minPurchaseAmount || null,
        max_discount_amount: maxDiscountAmount || null,
        valid_from: validFrom,
        valid_until: validUntil,
        usage_limit: usageLimit || null,
        per_user_limit: perUserLimit || null,
        bj_id: bjId || null,
        product_ids: productIds && productIds.length > 0 ? JSON.stringify(productIds) : null,
        category_ids: categoryIds && categoryIds.length > 0 ? JSON.stringify(categoryIds) : null,
        usage_count: 0,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('쿠폰 생성 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '쿠폰을 생성할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    // JSON 필드 파싱
    const coupon = {
      ...data,
      productIds: data.product_ids ? JSON.parse(data.product_ids) : [],
      categoryIds: data.category_ids ? JSON.parse(data.category_ids) : [],
      bjId: data.bj_id,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({
      success: true,
      coupon,
    });
  } catch (error) {
    console.error('쿠폰 생성 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '쿠폰을 생성할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
