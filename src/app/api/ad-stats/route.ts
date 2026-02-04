import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-browser';

export const dynamic = 'force-dynamic';

// 광고 통계 이벤트 기록
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ad_id, event_type, session_id, page_url, user_agent, ip_address } = body;

    if (!ad_id || !event_type) {
      return NextResponse.json(
        {
          success: false,
          error: '광고 ID와 이벤트 타입은 필수입니다.',
        },
        { status: 400 }
      );
    }

    // 사용자 ID 가져오기 (선택사항)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('ad_stats')
      .insert({
        ad_id,
        event_type,
        user_id: user?.id || null,
        session_id,
        page_url,
        user_agent,
        ip_address,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      stat: data,
    });
  } catch (error: any) {
    console.error('광고 통계 기록 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '광고 통계 기록에 실패했습니다.',
      },
      { status: 500 }
    );
  }
}

// 광고 통계 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adId = searchParams.get('ad_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    let query = supabase
      .from('ad_stats')
      .select('*')
      .order('created_at', { ascending: false });

    if (adId) {
      query = query.eq('ad_id', adId);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // 통계 집계
    const impressions = data?.filter((s) => s.event_type === 'impression').length || 0;
    const clicks = data?.filter((s) => s.event_type === 'click').length || 0;
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

    return NextResponse.json({
      success: true,
      stats: data,
      summary: {
        impressions,
        clicks,
        ctr: parseFloat(ctr.toFixed(2)),
      },
    });
  } catch (error: any) {
    console.error('광고 통계 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '광고 통계를 불러올 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
