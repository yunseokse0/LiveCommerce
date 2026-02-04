import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * 리뷰 목록 조회
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('product_reviews')
      .select(`
        *,
        user:user_profiles!product_reviews_user_id_fkey (
          id,
          name,
          avatar_url
        )
      `)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: reviews, error } = await query;

    if (error) {
      console.error('리뷰 조회 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '리뷰를 조회할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reviews: reviews || [],
    });
  } catch (error) {
    console.error('리뷰 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '리뷰를 조회할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}

/**
 * 리뷰 작성
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, userId, orderId, orderItemId, rating, title, content, images } = body;

    if (!productId || !userId || !rating || !content) {
      return NextResponse.json(
        {
          success: false,
          error: '필수 정보가 누락되었습니다.',
        },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          success: false,
          error: '평점은 1~5 사이여야 합니다.',
        },
        { status: 400 }
      );
    }

    // 이미 리뷰가 있는지 확인 (같은 주문 상품에 대해)
    if (orderItemId) {
      const { data: existingReview } = await supabaseAdmin
        .from('product_reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .eq('order_item_id', orderItemId)
        .single();

      if (existingReview) {
        return NextResponse.json(
          {
            success: false,
            error: '이미 리뷰를 작성하셨습니다.',
          },
          { status: 400 }
        );
      }
    }

    const { data: review, error } = await supabaseAdmin
      .from('product_reviews')
      .insert({
        product_id: productId,
        user_id: userId,
        order_id: orderId || null,
        order_item_id: orderItemId || null,
        rating,
        title: title || null,
        content,
        images: images || [],
        is_verified_purchase: !!orderId,
      })
      .select()
      .single();

    if (error) {
      console.error('리뷰 작성 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '리뷰를 작성할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error('리뷰 작성 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '리뷰를 작성할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
