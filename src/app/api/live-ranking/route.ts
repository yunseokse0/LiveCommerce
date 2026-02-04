import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import type { RankingEntry } from '@/types/bj';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

export async function GET() {
  try {
    const { data: stats, error } = await supabaseAdmin
      .from('bj_stats')
      .select(`
        *,
        bjs (*)
      `)
      .order('current_rank', { ascending: true });

    if (error) {
      console.error('랭킹 조회 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '랭킹을 불러올 수 없습니다.',
        },
        { status: 500 }
      );
    }

    const ranking: RankingEntry[] = (stats || []).map((stat: any) => ({
      rank: stat.current_rank,
      bj: {
        id: stat.bjs.id,
        name: stat.bjs.name,
        platform: stat.bjs.platform,
        thumbnailUrl: stat.bjs.thumbnail_url,
        channelUrl: stat.bjs.channel_url,
        youtubeChannelId: stat.bjs.youtube_channel_id || undefined,
        createdAt: stat.bjs.created_at,
      },
      viewerCount: stat.viewer_count || 0,
      currentScore: parseFloat(stat.current_score || 0),
      diffFromYesterday: 0, // TODO: 어제 랭킹과 비교
      donationRevenue: stat.donation_revenue ? parseFloat(stat.donation_revenue) : undefined,
      superchatRevenue: stat.superchat_revenue ? parseFloat(stat.superchat_revenue) : undefined,
      totalRevenue: stat.total_revenue ? parseFloat(stat.total_revenue) : undefined,
    }));

    return NextResponse.json({
      success: true,
      ranking,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('랭킹 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '랭킹을 불러올 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
