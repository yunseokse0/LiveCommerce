import * as cheerio from 'cheerio';

export interface ScrapedLiveStream {
  videoId: string;
  title: string;
  channelId: string;
  channelName: string;
  thumbnailUrl: string;
  viewerCount: number;
  startedAt?: string;
}

export async function scrapeYouTubeLiveStreams(
  channelIds: string[]
): Promise<ScrapedLiveStream[]> {
  const liveStreams: ScrapedLiveStream[] = [];

  for (const channelId of channelIds) {
    try {
      const channelUrl = `https://www.youtube.com/channel/${channelId}/live`;
      const response = await fetch(channelUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      if (!response.ok) continue;

      const html = await response.text();
      const $ = cheerio.load(html);

      // ytInitialData JSON 파싱
      const scriptTags = $('script');
      let ytInitialData: any = null;

      for (let i = 0; i < scriptTags.length; i++) {
        const scriptContent = $(scriptTags[i]).html() || '';
        if (scriptContent.includes('var ytInitialData')) {
          const match = scriptContent.match(/var ytInitialData = ({.+?});/);
          if (match) {
            try {
              ytInitialData = JSON.parse(match[1]);
              break;
            } catch (e) {
              // JSON 파싱 실패 시 다음 패턴 시도
            }
        }
        }
      }

      // 대체 패턴: window["ytInitialData"]
      if (!ytInitialData) {
        const match = html.match(/window\["ytInitialData"\] = ({.+?});/);
        if (match) {
          try {
            ytInitialData = JSON.parse(match[1]);
          } catch (e) {
            console.error('ytInitialData 파싱 실패:', e);
          }
        }
      }

      if (!ytInitialData) continue;

      // 라이브 방송 추출
      const tabs = ytInitialData?.contents?.twoColumnBrowseResultsRenderer?.tabs;
      if (!tabs) continue;

      for (const tab of tabs) {
        const tabRenderer = tab?.tabRenderer;
        if (!tabRenderer) continue;

        const content = tabRenderer?.content;
        if (!content) continue;

        // 라이브 방송 찾기
        const items = extractLiveItems(content);
        for (const item of items) {
          const videoId = item?.videoId;
          const title = item?.title?.runs?.[0]?.text || item?.title?.simpleText || '';
          const thumbnailUrl = item?.thumbnail?.thumbnails?.[0]?.url || '';
          const viewerCount = parseViewerCount(item?.viewCountText?.simpleText || '');
          const startedAt = item?.publishedTimeText?.simpleText || '';

          if (videoId && title) {
            liveStreams.push({
              videoId,
              title,
              channelId,
              channelName: item?.ownerText?.runs?.[0]?.text || '',
              thumbnailUrl,
              viewerCount,
              startedAt,
            });
          }
        }
      }
    } catch (error) {
      console.error(`채널 ${channelId} 스크래핑 오류:`, error);
      continue;
    }
  }

  return liveStreams;
}

function extractLiveItems(content: any): any[] {
  const items: any[] = [];

  // 다양한 패턴으로 라이브 방송 찾기
  const patterns = [
    content?.richGridRenderer?.contents,
    content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents,
    content?.sectionListRenderer?.contents?.[0]?.shelfRenderer?.content?.expandedShelfContentsRenderer?.items,
  ];

  for (const pattern of patterns) {
    if (Array.isArray(pattern)) {
      for (const item of pattern) {
        const videoRenderer = item?.richItemRenderer?.content?.videoRenderer ||
                            item?.videoRenderer;
        
        if (videoRenderer) {
          // 라이브 방송 확인
          const badges = videoRenderer?.badges;
          const isLive = badges?.some((badge: any) => 
            badge?.liveBadgeRenderer || 
            badge?.metadataBadgeRenderer?.label === 'LIVE'
          );

          if (isLive) {
            items.push(videoRenderer);
          }
        }
      }
    }
  }

  return items;
}

function parseViewerCount(text: string): number {
  if (!text) return 0;

  const match = text.match(/([\d,]+)/);
  if (!match) return 0;

  const numStr = match[1].replace(/,/g, '');
  return parseInt(numStr, 10) || 0;
}
