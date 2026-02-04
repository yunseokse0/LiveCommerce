const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';

export interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    channelId: string;
    channelTitle: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
    liveBroadcastContent: string;
  };
  liveStreamingDetails?: {
    actualStartTime: string;
    concurrentViewers: string;
  };
  statistics?: {
    viewCount: string;
  };
}

export async function searchYouTubeLiveStreams(
  channelIds: string[]
): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.warn('YouTube API 키가 설정되지 않았습니다.');
    return [];
  }

  try {
    const allVideos: YouTubeVideo[] = [];

    for (const channelId of channelIds) {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
          `part=snippet&channelId=${channelId}&eventType=live&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`
      );

      if (!response.ok) {
        console.error(`YouTube API 오류: ${response.status}`);
        continue;
      }

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
        
        const videoResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?` +
            `part=snippet,liveStreamingDetails,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
        );

        if (videoResponse.ok) {
          const videoData = await videoResponse.json();
          allVideos.push(...videoData.items);
        }
      }
    }

    return allVideos;
  } catch (error) {
    console.error('YouTube API 호출 오류:', error);
    return [];
  }
}
