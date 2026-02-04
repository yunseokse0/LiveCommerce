import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * 환불 승인 (관리자)
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { adminNote } = body;
    const refundId = params.id;

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
        status: 'approved',
        admin_note: adminNote || refund.admin_note,
        processed_at: new Date().toISOString(),
      })
      .eq('id', refundId);

    if (updateError) {
      console.error('환불 승인 오류:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: '환불 승인을 처리할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    // TODO: 실제 환불 처리 (토스페이먼츠 환불 API 호출 등)
    // 여기서는 상태만 업데이트하고, 실제 환불 처리는 별도 프로세스에서 진행

    return NextResponse.json({
      success: true,
      message: '환불이 승인되었습니다.',
    });
  } catch (error) {
    console.error('환불 승인 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '환불 승인을 처리할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
