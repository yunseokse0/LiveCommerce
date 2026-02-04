'use server';

import { supabaseAdmin } from '@/lib/supabase-server';
import type { LiveEntry } from '@/types/bj';

export async function getRegionStreams(regionId: string): Promise<LiveEntry[]> {
  try {
    // 지역별 크리에이터 조회
    const { data: creatorRegions, error: crError } = await supabaseAdmin
      .from('creator_regions')
      .select(`
        bj_id,
        bjs (*)
      `)
      .eq('region_id', regionId);

    if (crError || !creatorRegions || creatorRegions.length === 0) {
      return [];
    }

    const bjIds = creatorRegions.map((cr: any) => cr.bj_id);

    // 해당 지역 크리에이터의 라이브 방송 조회
    const { data: liveStreams, error: streamsError } = await supabaseAdmin
      .from('live_streams')
      .select(`
        *,
        bjs (*)
      `)
      .eq('is_live', true)
      .in('bj_id', bjIds);

    if (streamsError || !liveStreams) {
      return [];
    }

    return liveStreams.map((stream: any) => ({
      bj: {
        id: stream.bjs.id,
        name: stream.bjs.name,
        platform: stream.bjs.platform as 'youtube' | 'native',
        thumbnailUrl: stream.bjs.thumbnail_url || '',
        channelUrl: stream.bjs.channel_url || '',
        youtubeChannelId: stream.bjs.youtube_channel_id || undefined,
        createdAt: stream.bjs.created_at || new Date().toISOString(),
      },
      title: stream.title || `지역 특산물 소개 방송`,
      viewerCount: stream.viewer_count || 0,
      isLive: stream.is_live !== false, // 기본값 true
      startedAt: stream.started_at || new Date().toISOString(),
      streamUrl: stream.stream_url || '',
      thumbnailUrl: stream.thumbnail_url || stream.bjs.thumbnail_url,
    }));
  } catch (error) {
    console.error('지역 방송 조회 오류:', error);
    return [];
  }
}
