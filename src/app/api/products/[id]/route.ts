import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * 상품 상세 조회
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('상품 조회 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '상품을 조회할 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // JSON 필드 파싱 및 필드명 변환
    const parseProduct = (product: Record<string, unknown>) => {
      let detailImages: string[] = [];
      let tags: string[] = [];
      
      if (product.detail_images && typeof product.detail_images === 'string') {
        try {
          detailImages = JSON.parse(product.detail_images) as string[];
        } catch {
          detailImages = [];
        }
      }
      if (product.tags && typeof product.tags === 'string') {
        try {
          tags = JSON.parse(product.tags) as string[];
        } catch {
          tags = [];
        }
      }
      return {
        ...product,
        thumbnailUrl: product.thumbnail_url,
        imageUrl: product.image_url,
        detailImages,
        detailDescription: product.detail_description,
        bjId: product.bj_id,
        regionId: product.region_id,
        localProductId: product.local_product_id,
        isSpecialty: product.is_specialty || false,
        specialtyId: product.specialty_id,
        isActive: product.is_active,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
      };
    };

    return NextResponse.json({
      success: true,
      product: parseProduct(data),
    });
  } catch (error) {
    console.error('상품 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '상품을 조회할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}

/**
 * 상품 수정
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
      price?: number;
      stock?: number;
      thumbnail_url?: string | null;
      image_url?: string | null;
      detail_images?: string | null;
      detail_description?: string | null;
      category?: string | null;
      tags?: string | null;
      is_specialty?: boolean;
      specialty_id?: string | null;
      region_id?: string | null;
      is_active?: boolean;
      updated_at: string;
    } = {
      updated_at: new Date().toISOString(),
    };
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.stock !== undefined) updateData.stock = body.stock;
    if (body.thumbnailUrl !== undefined) updateData.thumbnail_url = body.thumbnailUrl;
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl;
    if (body.detailImages !== undefined) updateData.detail_images = body.detailImages ? JSON.stringify(body.detailImages) : null;
    if (body.detailDescription !== undefined) updateData.detail_description = body.detailDescription;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.tags !== undefined) updateData.tags = body.tags ? JSON.stringify(body.tags) : null;
    if (body.isSpecialty !== undefined) updateData.is_specialty = body.isSpecialty;
    if (body.specialtyId !== undefined) updateData.specialty_id = body.specialtyId || null;
    if (body.regionId !== undefined) updateData.region_id = body.regionId || null;
    if (body.isActive !== undefined) updateData.is_active = body.isActive;

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('상품 수정 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '상품을 수정할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      product: data,
    });
  } catch (error) {
    console.error('상품 수정 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '상품을 수정할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}

/**
 * 상품 삭제
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 실제 삭제 대신 비활성화
    const { error } = await supabaseAdmin
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('상품 삭제 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '상품을 삭제할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '상품이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('상품 삭제 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '상품을 삭제할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
