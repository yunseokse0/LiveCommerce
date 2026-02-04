import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * 1+1 프로모션 목록 조회
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bjId = searchParams.get('bjId');
    const productId = searchParams.get('productId');

    let query = supabaseAdmin
      .from('buy_one_get_one')
      .select('*')
      .order('created_at', { ascending: false });

    if (bjId) {
      query = query.eq('bj_id', bjId);
    }

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('1+1 프로모션 조회 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '프로모션 목록을 조회할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    const promotions = (data || []).map((promo: any) => ({
      ...promo,
      bjId: promo.bj_id,
      productId: promo.product_id,
      freeProductId: promo.free_product_id,
      isActive: promo.is_active,
      createdAt: promo.created_at,
      updatedAt: promo.updated_at,
    }));

    return NextResponse.json({
      success: true,
      promotions,
    });
  } catch (error) {
    console.error('1+1 프로모션 조회 오류:', error);
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
 * 1+1 프로모션 생성
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      productId,
      freeProductId,
      minQuantity,
      validFrom,
      validUntil,
      usageLimit,
      bjId,
    } = body;

    if (!name || !productId || !minQuantity || !validFrom || !validUntil) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 정보가 누락되었습니다.',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('buy_one_get_one')
      .insert({
        name,
        description,
        product_id: productId,
        free_product_id: freeProductId || productId, // 없으면 같은 상품
        min_quantity: minQuantity,
        valid_from: validFrom,
        valid_until: validUntil,
        usage_limit: usageLimit || null,
        usage_count: 0,
        bj_id: bjId || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('1+1 프로모션 생성 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '프로모션을 생성할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    const promotion = {
      ...data,
      bjId: data.bj_id,
      productId: data.product_id,
      freeProductId: data.free_product_id,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({
      success: true,
      promotion,
    });
  } catch (error) {
    console.error('1+1 프로모션 생성 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '프로모션을 생성할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
