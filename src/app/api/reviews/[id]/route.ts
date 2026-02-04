import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * 리뷰 수정
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { rating, title, content, images } = body;
    const reviewId = params.id;

    const updateData: any = {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return NextResponse.json(
          {
            success: false,
            error: '평점은 1~5 사이여야 합니다.',
          },
          { status: 400 }
        );
      }
      updateData.rating = rating;
    }
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (images !== undefined) updateData.images = images;

    const { data: review, error } = await supabaseAdmin
      .from('product_reviews')
      .update(updateData)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      console.error('리뷰 수정 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '리뷰를 수정할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      review,
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
 * 리뷰 삭제
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const reviewId = params.id;

    const { error } = await supabaseAdmin
      .from('product_reviews')
      .update({ is_visible: false })
      .eq('id', reviewId);

    if (error) {
      console.error('리뷰 삭제 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '리뷰를 삭제할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '리뷰가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('리뷰 삭제 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '리뷰를 삭제할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
