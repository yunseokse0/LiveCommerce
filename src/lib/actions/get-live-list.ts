'use server';

import { supabaseAdmin } from '@/lib/supabase-server';
import { scrapeYouTubeLiveStreams } from '@/lib/youtube-scraper';
import { searchYouTubeLiveStreams } from '@/lib/youtube-api';
import type { LiveEntry, BJ } from '@/types/bj';

export async function getLiveList(): Promise<LiveEntry[]> {
  try {
    // Supabase에서 크리에이터 목록 조회
    const { data: bjs, error: bjError } = await supabaseAdmin
      .from('bjs')
      .select('*')
      .eq('platform', 'youtube')
      .not('youtube_channel_id', 'is', null);

    if (bjError || !bjs) {
      console.error('크리에이터 조회 오류:', bjError);
      return [];
    }

    // YouTube 채널 ID 목록
    const channelIds = bjs
      .map((bj) => bj.youtube_channel_id)
      .filter((id): id is string => !!id);

    if (channelIds.length === 0) {
      return [];
    }

    // YouTube API로 라이브 방송 조회 시도
    let liveStreams: LiveEntry[] = [];
    
    try {
      const apiVideos = await searchYouTubeLiveStreams(channelIds);
      
      for (const video of apiVideos) {
        const bj = bjs.find((b) => b.youtube_channel_id === video.snippet.channelId);
        if (!bj) continue;

        liveStreams.push({
          bj: {
            id: bj.id,
            name: bj.name,
            platform: 'youtube',
            thumbnailUrl: bj.thumbnail_url,
            channelUrl: bj.channel_url,
            youtubeChannelId: bj.youtube_channel_id || undefined,
            createdAt: bj.created_at,
          },
          title: video.snippet.title,
          viewerCount: parseInt(video.liveStreamingDetails?.concurrentViewers || '0', 10),
          startedAt: video.liveStreamingDetails?.actualStartTime || new Date().toISOString(),
          streamUrl: `https://www.youtube.com/watch?v=${video.id}`,
          thumbnailUrl: video.snippet.thumbnails.high.url,
        });
      }
    } catch (apiError) {
      console.warn('YouTube API 실패, 스크래핑으로 전환:', apiError);
    }

    // API 실패 시 스크래핑 사용
    if (liveStreams.length === 0) {
      const scrapedStreams = await scrapeYouTubeLiveStreams(channelIds);
      
      for (const stream of scrapedStreams) {
        const bj = bjs.find((b) => b.youtube_channel_id === stream.channelId);
        if (!bj) continue;

        liveStreams.push({
          bj: {
            id: bj.id,
            name: bj.name,
            platform: 'youtube',
            thumbnailUrl: bj.thumbnail_url,
            channelUrl: bj.channel_url,
            youtubeChannelId: bj.youtube_channel_id || undefined,
            createdAt: bj.created_at,
          },
          title: stream.title,
          viewerCount: stream.viewerCount,
          startedAt: stream.startedAt || new Date().toISOString(),
          streamUrl: `https://www.youtube.com/watch?v=${stream.videoId}`,
          thumbnailUrl: stream.thumbnailUrl,
        });
      }
    }

    // 엑셀 관련 방송 우선 정렬
    liveStreams.sort((a, b) => {
      const aIsExcel = a.title.toLowerCase().includes('엑셀');
      const bIsExcel = b.title.toLowerCase().includes('엑셀');
      
      if (aIsExcel && !bIsExcel) return -1;
      if (!aIsExcel && bIsExcel) return 1;
      
      return b.viewerCount - a.viewerCount;
    });

    return liveStreams;
  } catch (error) {
    console.error('라이브 목록 조회 오류:', error);
    return [];
  }
}
