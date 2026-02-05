import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * 현재 소개 중인 상품 조회
 * GET /api/streaming/[streamId]/featured-product
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ streamId: string }> }
) {
  try {
    const { streamId } = await params;

    const { data: stream, error } = await supabaseAdmin
      .from('live_streams')
      .select('featured_product_id')
      .eq('id', streamId)
      .single();

    if (error || !stream) {
      return NextResponse.json(
        { success: false, error: '스트림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (!stream.featured_product_id) {
      return NextResponse.json({
        success: true,
        product: null,
      });
    }

    // 상품 정보 조회
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', stream.featured_product_id)
      .eq('is_active', true)
      .single();

    if (productError || !product) {
      return NextResponse.json({
        success: true,
        product: null,
      });
    }

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('소개 상품 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 소개 상품 설정/변경
 * PATCH /api/streaming/[streamId]/featured-product
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ streamId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { streamId } = await params;
    const body = await request.json();
    const { productId } = body;

    // 크리에이터 권한 확인
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('bj_id')
      .eq('id', user.id)
      .single();

    if (!profile?.bj_id) {
      return NextResponse.json(
        { success: false, error: '상품을 설정할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 스트림의 크리에이터 확인
    const { data: stream, error: streamError } = await supabaseAdmin
      .from('live_streams')
      .select('bj_id')
      .eq('id', streamId)
      .single();

    if (streamError || !stream) {
      return NextResponse.json(
        { success: false, error: '스트림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (stream.bj_id !== profile.bj_id) {
      return NextResponse.json(
        { success: false, error: '상품을 설정할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 상품 ID 유효성 확인 (null이면 상품 소개 해제)
    if (productId) {
      const { data: product, error: productError } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('id', productId)
        .eq('is_active', true)
        .single();

      if (productError || !product) {
        return NextResponse.json(
          { success: false, error: '유효하지 않은 상품입니다.' },
          { status: 400 }
        );
      }
    }

    // 소개 상품 설정
    const { data, error } = await supabaseAdmin
      .from('live_streams')
      .update({
        featured_product_id: productId || null,
      })
      .eq('id', streamId)
      .select()
      .single();

    if (error) {
      console.error('소개 상품 설정 오류:', error);
      return NextResponse.json(
        { success: false, error: '상품을 설정할 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stream: data,
    });
  } catch (error) {
    console.error('소개 상품 설정 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
