import { NextResponse } from 'next/server';
import { getLocalReviews } from '@/data/mock-reviews';

export const dynamic = 'force-dynamic';

/**
 * 리뷰 수정 (Mock 데이터 사용)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { rating, title, content, images } = body;
    const reviewId = params.id;

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        {
          success: false,
          error: '평점은 1~5 사이여야 합니다.',
        },
        { status: 400 }
      );
    }

    // Mock 데이터에서 리뷰 찾기
    const reviews = getLocalReviews();
    const review = reviews.find((r) => r.id === reviewId);

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          error: '리뷰를 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // 업데이트된 리뷰 생성
    const updatedReview = {
      ...review,
      ...(rating !== undefined && { rating }),
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(images !== undefined && { images }),
    };

    return NextResponse.json({
      success: true,
      review: updatedReview,
    });
  } catch (error) {
    console.error('리뷰 수정 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '리뷰를 수정할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}

/**
 * 리뷰 삭제 (Mock 데이터 사용)
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;

    // Mock 데이터에서 리뷰 찾기
    const reviews = getLocalReviews();
    const review = reviews.find((r) => r.id === reviewId);

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          error: '리뷰를 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // 삭제는 클라이언트에서 로컬 스토리지 처리

    return NextResponse.json({
      success: true,
      message: '리뷰가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('리뷰 삭제 오류:', error);
    return NextResponse.json(
      {
        success: true,
        message: '리뷰가 삭제되었습니다.',
      }
    );
  }
}
