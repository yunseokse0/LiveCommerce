import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * 1+1 프로모션 수정
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
      product_id?: string | null;
      free_product_id?: string | null;
      min_quantity?: number;
      valid_from?: string | null;
      valid_until?: string | null;
      usage_limit?: number | null;
      is_active?: boolean;
      updated_at: string;
    } = {
      updated_at: new Date().toISOString(),
    };
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.productId !== undefined) updateData.product_id = body.productId;
    if (body.freeProductId !== undefined) updateData.free_product_id = body.freeProductId;
    if (body.minQuantity !== undefined) updateData.min_quantity = body.minQuantity;
    if (body.validFrom !== undefined) updateData.valid_from = body.validFrom;
    if (body.validUntil !== undefined) updateData.valid_until = body.validUntil;
    if (body.usageLimit !== undefined) updateData.usage_limit = body.usageLimit;
    if (body.isActive !== undefined) updateData.is_active = body.isActive;

    const { data, error } = await supabaseAdmin
      .from('buy_one_get_one')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('1+1 프로모션 수정 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '프로모션을 수정할 수 없습니다.',
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
    console.error('1+1 프로모션 수정 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '프로모션을 수정할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}

/**
 * 1+1 프로모션 삭제
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('buy_one_get_one')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('1+1 프로모션 삭제 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '프로모션을 삭제할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '프로모션이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('1+1 프로모션 삭제 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '프로모션을 삭제할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
