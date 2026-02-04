'use server';

import { supabaseAdmin } from '@/lib/supabase-server';
import { scrapeYouTubeLiveStreams } from '@/lib/youtube-scraper';
import { searchYouTubeLiveStreams } from '@/lib/youtube-api';
import type { LiveEntry, BJ } from '@/types/bj';
import { mockLiveStreams } from '@/data/mock-live-streams';

export async function getLiveList(): Promise<LiveEntry[]> {
  try {
    // Supabase 환경 변수 확인
    if (!process.env.SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.warn('Supabase가 설정되지 않아 MOCK 데이터를 사용합니다.');
      return mockLiveStreams;
    }

    // Supabase에서 크리에이터 목록 조회
    const { data: bjs, error: bjError } = await supabaseAdmin
      .from('bjs')
      .select('*')
      .eq('platform', 'youtube')
      .not('youtube_channel_id', 'is', null);

    if (bjError || !bjs || bjs.length === 0) {
      console.warn('크리에이터 조회 오류 또는 데이터 없음, MOCK 데이터 사용:', bjError);
      return mockLiveStreams;
    }

    // YouTube 채널 ID 목록
    const channelIds = bjs
      .map((bj) => bj.youtube_channel_id)
      .filter((id): id is string => !!id);

    if (channelIds.length === 0) {
      console.warn('YouTube 채널 ID가 없어 MOCK 데이터를 사용합니다.');
      return mockLiveStreams;
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
            thumbnailUrl: bj.thumbnail_url || '',
            channelUrl: bj.channel_url || '',
            youtubeChannelId: bj.youtube_channel_id || undefined,
            createdAt: bj.created_at || new Date().toISOString(),
          },
          title: video.snippet.title,
          viewerCount: parseInt(video.liveStreamingDetails?.concurrentViewers || '0', 10),
          isLive: true,
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
      try {
        const scrapedStreams = await scrapeYouTubeLiveStreams(channelIds);
        
        for (const stream of scrapedStreams) {
          const bj = bjs.find((b) => b.youtube_channel_id === stream.channelId);
          if (!bj) continue;

          liveStreams.push({
            bj: {
              id: bj.id,
              name: bj.name,
              platform: 'youtube',
              thumbnailUrl: bj.thumbnail_url || '',
              channelUrl: bj.channel_url || '',
              youtubeChannelId: bj.youtube_channel_id || undefined,
              createdAt: bj.created_at || new Date().toISOString(),
            },
            title: stream.title,
            viewerCount: stream.viewerCount,
            isLive: true,
            startedAt: stream.startedAt || new Date().toISOString(),
            streamUrl: `https://www.youtube.com/watch?v=${stream.videoId}`,
            thumbnailUrl: stream.thumbnailUrl,
          });
        }
      } catch (scrapeError) {
        console.warn('스크래핑 실패, MOCK 데이터 사용:', scrapeError);
      }
    }

    // 여전히 데이터가 없으면 MOCK 데이터 사용
    if (liveStreams.length === 0) {
      console.warn('라이브 스트림 데이터가 없어 MOCK 데이터를 사용합니다.');
      return mockLiveStreams;
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
    console.error('라이브 목록 조회 오류, MOCK 데이터 사용:', error);
    return mockLiveStreams;
  }
}
