'use server';

import { supabaseAdmin } from '@/lib/supabase-server';

/**
 * 스트림 상태 조회 서버 액션
 */
export async function getStreamStatus(streamId: string) {
  try {
    // API를 통해 스트림 상태 조회
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/streaming/status?streamId=${streamId}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return { isActive: false, streamId };
    }

    const data = await response.json();
    return {
      isActive: data.isActive || false,
      streamId: data.streamId || streamId,
    };
  } catch (error) {
    console.error('스트림 상태 조회 오류:', error);
    return { isActive: false, streamId };
  }
}

/**
 * HLS 스트림 URL 생성
 */
export function getHLSStreamUrl(streamId: string): string {
  return `/streams/hls/${streamId}/index.m3u8`;
}
