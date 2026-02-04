import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * 쿠폰 조회
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          error: '쿠폰을 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // JSON 필드 파싱
    let productIds: string[] = [];
    let categoryIds: string[] = [];
    
    if (data.product_ids && typeof data.product_ids === 'string') {
      try {
        productIds = JSON.parse(data.product_ids) as string[];
      } catch {
        productIds = [];
      }
    }
    if (data.category_ids && typeof data.category_ids === 'string') {
      try {
        categoryIds = JSON.parse(data.category_ids) as string[];
      } catch {
        categoryIds = [];
      }
    }
    
    const coupon = {
      ...data,
      productIds,
      categoryIds,
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
    console.error('쿠폰 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '쿠폰을 조회할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}

/**
 * 쿠폰 수정
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: {
      name?: string;
      description?: string | null;
      type?: string;
      value?: number;
      min_purchase_amount?: number | null;
      max_discount_amount?: number | null;
      valid_from?: string | null;
      valid_until?: string | null;
      usage_limit?: number | null;
      per_user_limit?: number | null;
      product_ids?: string | null;
      category_ids?: string | null;
      is_active?: boolean;
      updated_at: string;
    } = {
      updated_at: new Date().toISOString(),
    };
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.value !== undefined) updateData.value = body.value;
    if (body.minPurchaseAmount !== undefined) updateData.min_purchase_amount = body.minPurchaseAmount;
    if (body.maxDiscountAmount !== undefined) updateData.max_discount_amount = body.maxDiscountAmount;
    if (body.validFrom !== undefined) updateData.valid_from = body.validFrom;
    if (body.validUntil !== undefined) updateData.valid_until = body.validUntil;
    if (body.usageLimit !== undefined) updateData.usage_limit = body.usageLimit;
    if (body.perUserLimit !== undefined) updateData.per_user_limit = body.perUserLimit;
    if (body.productIds !== undefined) updateData.product_ids = body.productIds && body.productIds.length > 0 ? JSON.stringify(body.productIds) : null;
    if (body.categoryIds !== undefined) updateData.category_ids = body.categoryIds && body.categoryIds.length > 0 ? JSON.stringify(body.categoryIds) : null;
    if (body.isActive !== undefined) updateData.is_active = body.isActive;

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('쿠폰 수정 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '쿠폰을 수정할 수 없습니다.',
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
    console.error('쿠폰 수정 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '쿠폰을 수정할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}

/**
 * 쿠폰 삭제
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 실제 삭제 대신 비활성화
    const { error } = await supabaseAdmin
      .from('coupons')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('쿠폰 삭제 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '쿠폰을 삭제할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '쿠폰이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('쿠폰 삭제 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '쿠폰을 삭제할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
