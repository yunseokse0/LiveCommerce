import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { validateCoupon } from '@/lib/utils/coupon';
import type { Coupon } from '@/types/promotion';

export const dynamic = 'force-dynamic';

/**
 * 쿠폰 코드 유효성 검증
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, purchaseAmount, userId, productIds } = body;

    if (!code || purchaseAmount === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: '쿠폰 코드와 구매 금액이 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 쿠폰 조회
    const { data, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (error || !data) {
      return NextResponse.json({
        success: false,
        isValid: false,
        error: '쿠폰을 찾을 수 없습니다.',
      });
    }

    // JSON 필드 파싱
    const coupon: Coupon = {
      ...data,
      productIds: data.product_ids ? JSON.parse(data.product_ids) : [],
      categoryIds: data.category_ids ? JSON.parse(data.category_ids) : [],
      bjId: data.bj_id,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    // 쿠폰 유효성 검증
    const validation = validateCoupon(coupon, purchaseAmount, userId, productIds);

    return NextResponse.json({
      success: true,
      ...validation,
      coupon: validation.isValid ? coupon : undefined,
    });
  } catch (error) {
    console.error('쿠폰 검증 오류:', error);
    return NextResponse.json(
      {
        success: false,
        isValid: false,
        error: '쿠폰 검증 중 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
