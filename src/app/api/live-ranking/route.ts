import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import type { RankingEntry } from '@/types/bj';
import { mockRanking } from '@/data/mock-ranking';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

export async function GET() {
  try {
    // Supabase 환경 변수 확인
    const hasSupabase = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!hasSupabase) {
      // Supabase가 없으면 MOCK 데이터 반환
      return NextResponse.json({
        success: true,
        ranking: mockRanking,
        timestamp: new Date().toISOString(),
        message: 'MOCK 데이터를 사용합니다.',
      });
    }

    const { data: stats, error } = await supabaseAdmin
      .from('bj_stats')
      .select(`
        *,
        bjs (*)
      `)
      .order('current_rank', { ascending: true });

    if (error || !stats || stats.length === 0) {
      console.error('랭킹 조회 오류:', error);
      // 에러가 발생하거나 데이터가 없으면 MOCK 데이터 반환
      return NextResponse.json({
        success: true,
        ranking: mockRanking,
        timestamp: new Date().toISOString(),
        message: '데이터베이스에 데이터가 없어 MOCK 데이터를 사용합니다.',
      });
    }

    const ranking: RankingEntry[] = stats.map((stat: any) => ({
      rank: stat.current_rank,
      bj: {
        id: stat.bjs.id,
        name: stat.bjs.name,
        platform: stat.bjs.platform,
        thumbnailUrl: stat.bjs.thumbnail_url || '',
        channelUrl: stat.bjs.channel_url || '',
        youtubeChannelId: stat.bjs.youtube_channel_id || undefined,
        createdAt: stat.bjs.created_at || new Date().toISOString(),
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
    // 에러 발생 시에도 MOCK 데이터 반환
    return NextResponse.json({
      success: true,
      ranking: mockRanking,
      timestamp: new Date().toISOString(),
      message: '에러 발생으로 MOCK 데이터를 사용합니다.',
    });
  }
}
