import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * 환불 목록 조회 (관리자)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('order_refunds')
      .select(`
        *,
        order:orders!order_refunds_order_id_fkey (
          id,
          total_amount,
          final_amount,
          status
        )
      `)
      .order('requested_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: refunds, error } = await query;

    if (error) {
      console.error('환불 목록 조회 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '환불 목록을 조회할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      refunds: refunds || [],
    });
  } catch (error) {
    console.error('환불 목록 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '환불 목록을 조회할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
