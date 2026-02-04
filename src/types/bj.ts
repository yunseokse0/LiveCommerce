export type Platform = 'youtube' | 'native';

export interface BJ {
  id: string;
  name: string;
  platform: Platform;
  thumbnailUrl: string;
  channelUrl: string;
  youtubeChannelId?: string;
  profileImageUrl?: string; // 프로필 이미지
  followerCount?: number; // 팔로워 수
  channelId?: string; // 채널 ID
  createdAt: string;
}

export interface LiveEntry {
  id?: string; // 라이브 스트림 ID
  bjId?: string; // 크리에이터 ID
  bj: BJ;
  platform?: Platform; // 플랫폼 (youtube/native)
  title: string;
  description?: string; // 방송 설명
  viewerCount: number;
  isLive: boolean; // 라이브 여부
  startedAt: string;
  endedAt?: string; // 종료 시간 (다시보기용)
  streamUrl: string;
  thumbnailUrl?: string;
  hlsUrl?: string; // 자체 플랫폼 HLS 스트림 URL
  isNativeStream?: boolean; // 자체 플랫폼 스트림 여부
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
