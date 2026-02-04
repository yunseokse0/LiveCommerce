import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 인증 확인
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 라이브 중인 방송 조회
    const { data: liveStreams, error: streamsError } = await supabaseAdmin
      .from('live_streams')
      .select('*')
      .eq('is_live', true);

    if (streamsError) {
      throw streamsError;
    }

    // 각 크리에이터의 점수 계산
    for (const stream of liveStreams || []) {
      // 점수 = 라이브 시간(분) × 시청자 수 × 가중치(0.1)
      const minutes = stream.accumulated_minutes || 0;
      const viewers = stream.viewer_count || 0;
      const score = minutes * viewers * 0.1;

      // bj_stats 업데이트
      await supabaseAdmin
        .from('bj_stats')
        .upsert({
          bj_id: stream.bj_id,
          current_score: score,
          viewer_count: viewers,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'bj_id',
        });
    }

    // 랭킹 업데이트
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('bj_stats')
      .select('*')
      .order('current_score', { ascending: false });

    if (statsError) {
      throw statsError;
    }

    // 순위 업데이트
    for (let i = 0; i < (stats || []).length; i++) {
      await supabaseAdmin
        .from('bj_stats')
        .update({
          current_rank: i + 1,
        })
        .eq('bj_id', stats[i].bj_id);
    }

    return NextResponse.json({
      success: true,
      calculated: liveStreams?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('점수 계산 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '점수 계산에 실패했습니다.',
      },
      { status: 500 }
    );
  }
}
