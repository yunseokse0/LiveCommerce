'use server';

import { supabaseAdmin } from '@/lib/supabase-server';
import { extractYouTubeChannelId } from '@/lib/utils';
import type { BJ } from '@/types/bj';

export async function addBJ(data: {
  name: string;
  channelUrl: string;
  thumbnailUrl?: string;
  platform?: 'youtube' | 'native';
}): Promise<{ success: boolean; bj?: BJ; error?: string }> {
  try {
    const channelId = data.platform === 'youtube' 
      ? extractYouTubeChannelId(data.channelUrl)
      : null;

    const { data: bj, error } = await supabaseAdmin
      .from('bjs')
      .insert({
        name: data.name,
        platform: data.platform || 'youtube',
        channel_url: data.channelUrl,
        thumbnail_url: data.thumbnailUrl || '',
        youtube_channel_id: channelId,
      })
      .select()
      .single();

    if (error) {
      console.error('크리에이터 추가 오류:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      bj: {
        id: bj.id,
        name: bj.name,
        platform: bj.platform as 'youtube' | 'native',
        thumbnailUrl: bj.thumbnail_url,
        channelUrl: bj.channel_url,
        youtubeChannelId: bj.youtube_channel_id || undefined,
        createdAt: bj.created_at,
      },
    };
  } catch (error) {
    console.error('크리에이터 추가 오류:', error);
    return { success: false, error: '크리에이터 추가에 실패했습니다.' };
  }
}
