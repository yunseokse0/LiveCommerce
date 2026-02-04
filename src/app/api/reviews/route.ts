import { NextResponse } from 'next/server';
import { getLocalReviews } from '@/data/mock-reviews';

export const dynamic = 'force-dynamic';

/**
 * 리뷰 목록 조회 (Mock 데이터 사용)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Mock 데이터 사용 (프론트엔드 전용)
    let reviews = getLocalReviews().filter((r) => r.is_visible);

    if (productId) {
      reviews = reviews.filter((r) => r.product_id === productId);
    }

    if (userId) {
      reviews = reviews.filter((r) => r.user_id === userId);
    }

    // 정렬 및 페이징
    reviews.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const paginatedReviews = reviews.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      reviews: paginatedReviews,
    });
  } catch (error) {
    console.error('리뷰 조회 오류:', error);
    // 에러 발생 시에도 mock 데이터 반환
    return NextResponse.json({
      success: true,
      reviews: [],
    });
  }
}

/**
 * 리뷰 작성 (Mock 데이터 사용)
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

    // Mock 데이터로 리뷰 생성
    const review = {
      id: `review-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      product_id: productId,
      user_id: userId,
      order_id: orderId || undefined,
      order_item_id: orderItemId || undefined,
      rating,
      title: title || undefined,
      content,
      images: images || [],
      is_verified_purchase: !!orderId,
      helpful_count: 0,
      is_visible: true,
      created_at: new Date().toISOString(),
      user: {
        id: userId,
        name: '사용자',
        avatar_url: undefined,
      },
    };

    // 로컬 스토리지에 저장 (클라이언트에서 처리)
    // 여기서는 성공 응답만 반환

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
