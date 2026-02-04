import { NextResponse } from 'next/server';
import { getLiveList } from '@/lib/actions/get-live-list';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 인증 확인 (선택사항: API 키 또는 헤더 검증)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const liveList = await getLiveList();

    // Supabase에 라이브 상태 업데이트
    for (const live of liveList) {
      await supabaseAdmin
        .from('live_streams')
        .upsert({
          bj_id: live.bj.id,
          is_live: true,
          stream_url: live.streamUrl,
          viewer_count: live.viewerCount,
          started_at: live.startedAt,
          last_viewer_count: live.viewerCount,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'bj_id',
        });
    }

    // 라이브 종료된 방송 업데이트
    const { data: allBjs } = await supabaseAdmin
      .from('bjs')
      .select('id');

    if (allBjs) {
      const liveBjIds = new Set(liveList.map((l) => l.bj.id));
      
      for (const bj of allBjs) {
        if (!liveBjIds.has(bj.id)) {
          await supabaseAdmin
            .from('live_streams')
            .update({
              is_live: false,
              updated_at: new Date().toISOString(),
            })
            .eq('bj_id', bj.id);
        }
      }
    }

    return NextResponse.json({
      success: true,
      synced: liveList.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('YouTube 동기화 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '동기화에 실패했습니다.',
      },
      { status: 500 }
    );
  }
}
