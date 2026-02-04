import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { mockProducts } from '@/data/mock-products';

export const dynamic = 'force-dynamic';

/**
 * 상품 목록 조회
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bjId = searchParams.get('bjId');
    const isActive = searchParams.get('isActive');

    let query = supabaseAdmin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (bjId) {
      query = query.eq('bj_id', bjId);
    }

    if (isActive === 'all') {
      // 모든 상품 조회 (관리자용)
    } else if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    } else {
      // 기본적으로 활성 상품만 조회
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    // JSON 필드 파싱
    const parseProduct = (product: any) => {
      if (product.detail_images) {
        try {
          product.detail_images = JSON.parse(product.detail_images);
        } catch {
          product.detail_images = [];
        }
      }
      if (product.tags) {
        try {
          product.tags = JSON.parse(product.tags);
        } catch {
          product.tags = [];
        }
      }
      // 필드명 변환 (snake_case -> camelCase)
      return {
        ...product,
        thumbnailUrl: product.thumbnail_url,
        imageUrl: product.image_url,
        detailImages: product.detail_images || [],
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

    // 에러 발생하거나 데이터가 없으면 MOCK 데이터 사용
    if (error || !data || data.length === 0) {
      console.warn('상품 조회 오류 또는 데이터 없음, MOCK 데이터 사용:', error);
      const products = mockProducts;
      return NextResponse.json({
        success: true,
        products,
      });
    }

    const products = data.map(parseProduct);

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error('상품 목록 조회 오류, MOCK 데이터 사용:', error);
    // 에러 발생 시에도 MOCK 데이터 반환
    return NextResponse.json({
      success: true,
      products: mockProducts,
    });
  }
}

/**
 * 상품 생성
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      stock,
      thumbnailUrl,
      imageUrl,
      detailImages,
      detailDescription,
      bjId,
      regionId,
      localProductId,
      category,
      tags,
      isSpecialty,
      specialtyId,
    } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: '상품명과 가격은 필수입니다.',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        description,
        price,
        stock: stock || 0,
        thumbnail_url: thumbnailUrl,
        image_url: imageUrl,
        detail_images: detailImages ? JSON.stringify(detailImages) : null,
        detail_description: detailDescription,
        bj_id: bjId,
        region_id: regionId,
        local_product_id: localProductId,
        category,
        tags: tags ? JSON.stringify(tags) : null,
        is_specialty: isSpecialty || false,
        specialty_id: specialtyId || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('상품 생성 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '상품을 생성할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      product: data,
    });
  } catch (error) {
    console.error('상품 생성 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '상품을 생성할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
