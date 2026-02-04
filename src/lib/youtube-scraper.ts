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
      let ytInitialData: Record<string, unknown> | null = null;

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
      const ytData = ytInitialData as Record<string, unknown>;
      const contents = ytData?.contents as Record<string, unknown> | undefined;
      const twoColumnBrowseResultsRenderer = contents?.twoColumnBrowseResultsRenderer as Record<string, unknown> | undefined;
      const tabs = twoColumnBrowseResultsRenderer?.tabs as Array<Record<string, unknown>> | undefined;
      if (!tabs) continue;

      for (const tab of tabs) {
        const tabObj = tab as Record<string, unknown>;
        const tabRenderer = tabObj?.tabRenderer as Record<string, unknown> | undefined;
        if (!tabRenderer) continue;

        const content = tabRenderer?.content as Record<string, unknown> | undefined;
        if (!content) continue;

        // 라이브 방송 찾기
        const items = extractLiveItems(content);
        for (const item of items) {
          const itemObj = item as Record<string, unknown>;
          const videoId = itemObj?.videoId as string | undefined;
          const titleObj = itemObj?.title as Record<string, unknown> | undefined;
          const titleRuns = titleObj?.runs as Array<Record<string, unknown>> | undefined;
          const title = titleRuns?.[0]?.text as string | undefined || (titleObj?.simpleText as string | undefined) || '';
          const thumbnailObj = itemObj?.thumbnail as Record<string, unknown> | undefined;
          const thumbnails = thumbnailObj?.thumbnails as Array<Record<string, unknown>> | undefined;
          const thumbnailUrl = thumbnails?.[0]?.url as string | undefined || '';
          const viewCountText = itemObj?.viewCountText as Record<string, unknown> | undefined;
          const viewerCount = parseViewerCount((viewCountText?.simpleText as string | undefined) || '');
          const publishedTimeText = itemObj?.publishedTimeText as Record<string, unknown> | undefined;
          const startedAt = (publishedTimeText?.simpleText as string | undefined) || '';
          const ownerText = itemObj?.ownerText as Record<string, unknown> | undefined;
          const ownerRuns = ownerText?.runs as Array<Record<string, unknown>> | undefined;
          const channelName = ownerRuns?.[0]?.text as string | undefined || '';

          if (videoId && title) {
            liveStreams.push({
              videoId,
              title,
              channelId,
              channelName,
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

function extractLiveItems(content: Record<string, unknown>): Array<Record<string, unknown>> {
  const items: Array<Record<string, unknown>> = [];

  // 다양한 패턴으로 라이브 방송 찾기
  const richGridRenderer = content?.richGridRenderer as Record<string, unknown> | undefined;
  const sectionListRenderer = content?.sectionListRenderer as Record<string, unknown> | undefined;
  const sectionContents = sectionListRenderer?.contents as Array<Record<string, unknown>> | undefined;
  const firstSection = sectionContents?.[0] as Record<string, unknown> | undefined;
  const itemSectionRenderer = firstSection?.itemSectionRenderer as Record<string, unknown> | undefined;
  const shelfRenderer = firstSection?.shelfRenderer as Record<string, unknown> | undefined;
  const shelfContent = shelfRenderer?.content as Record<string, unknown> | undefined;
  const expandedShelfContentsRenderer = shelfContent?.expandedShelfContentsRenderer as Record<string, unknown> | undefined;
  
  const patterns = [
    richGridRenderer?.contents as Array<Record<string, unknown>> | undefined,
    itemSectionRenderer?.contents as Array<Record<string, unknown>> | undefined,
    expandedShelfContentsRenderer?.items as Array<Record<string, unknown>> | undefined,
  ];

  for (const pattern of patterns) {
    if (Array.isArray(pattern)) {
      for (const item of pattern) {
        const itemObj = item as Record<string, unknown>;
        const richItemRenderer = itemObj?.richItemRenderer as Record<string, unknown> | undefined;
        const richContent = richItemRenderer?.content as Record<string, unknown> | undefined;
        const videoRenderer1 = richContent?.videoRenderer as Record<string, unknown> | undefined;
        const videoRenderer2 = itemObj?.videoRenderer as Record<string, unknown> | undefined;
        const videoRenderer = videoRenderer1 || videoRenderer2;
        
        if (videoRenderer) {
          // 라이브 방송 확인
          const badges = videoRenderer?.badges as Array<Record<string, unknown>> | undefined;
          const isLive = Array.isArray(badges) && badges.some((badge: unknown) => {
            const b = badge as Record<string, unknown>;
            return b?.liveBadgeRenderer || 
                   (b?.metadataBadgeRenderer as Record<string, unknown>)?.label === 'LIVE';
          });

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
