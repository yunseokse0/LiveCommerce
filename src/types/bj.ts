export type Platform = 'youtube' | 'native';

export interface BJ {
  id: string;
  name: string;
  platform: Platform;
  thumbnailUrl: string;
  channelUrl: string;
  youtubeChannelId?: string;
  createdAt: string;
}

export interface LiveEntry {
  bj: BJ;
  title: string;
  viewerCount: number;
  startedAt: string;
  streamUrl: string;
  thumbnailUrl?: string;
}

export interface RankingEntry {
  rank: number;
  bj: BJ;
  viewerCount: number;
  currentScore: number;
  diffFromYesterday: number;
  donationRevenue?: number;
  superchatRevenue?: number;
  totalRevenue?: number;
}
