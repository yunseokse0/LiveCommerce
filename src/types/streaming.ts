/**
 * 스트리밍 관련 타입 정의
 */

export interface StreamConfig {
  streamKey: string;
  streamId: string;
  creatorId: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  status: 'idle' | 'live' | 'ended';
  startedAt?: Date;
  endedAt?: Date;
  viewerCount?: number;
}

export interface RTMPConfig {
  rtmpUrl: string;
  streamKey: string;
  streamId: string;
  hlsUrl: string;
}

export interface StreamStatus {
  isActive: boolean;
  streamId: string;
  viewerCount?: number;
  startedAt?: Date;
}
