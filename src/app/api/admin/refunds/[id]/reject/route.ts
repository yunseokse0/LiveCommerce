import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * 환불 거부 (관리자)
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { adminNote } = body;
    const refundId = params.id;

    if (!adminNote || !adminNote.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: '거부 사유를 입력해주세요.',
        },
        { status: 400 }
      );
    }

    // 환불 조회
    const { data: refund, error: refundError } = await supabaseAdmin
      .from('order_refunds')
      .select('*')
      .eq('id', refundId)
      .single();

    if (refundError || !refund) {
      return NextResponse.json(
        {
          success: false,
          error: '환불 요청을 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    if (refund.status !== 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: '이미 처리된 환불 요청입니다.',
        },
        { status: 400 }
      );
    }

    // 환불 상태 업데이트
    const { error: updateError } = await supabaseAdmin
      .from('order_refunds')
      .update({
        status: 'rejected',
        admin_note: adminNote.trim(),
        processed_at: new Date().toISOString(),
      })
      .eq('id', refundId);

    if (updateError) {
      console.error('환불 거부 오류:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: '환불 거부를 처리할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '환불이 거부되었습니다.',
    });
  } catch (error) {
    console.error('환불 거부 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '환불 거부를 처리할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
