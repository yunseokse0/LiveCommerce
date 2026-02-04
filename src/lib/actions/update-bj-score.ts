'use server';

import { supabaseAdmin } from '@/lib/supabase-server';

export async function updateBJScore(
  bjId: string,
  score: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (score < 0) {
      return { success: false, error: '점수는 0 이상이어야 합니다.' };
    }

    const { error } = await supabaseAdmin
      .from('bj_stats')
      .upsert({
        bj_id: bjId,
        current_score: score,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'bj_id',
      });

    if (error) {
      console.error('점수 업데이트 오류:', error);
      return { success: false, error: error.message };
    }

    // 랭킹 재계산
    const { data: stats, error: statsError } = await supabaseAdmin
      .from('bj_stats')
      .select('*')
      .order('current_score', { ascending: false });

    if (statsError) {
      console.error('랭킹 조회 오류:', statsError);
      return { success: false, error: statsError.message };
    }

    // 순위 업데이트
    for (let i = 0; i < (stats || []).length; i++) {
      await supabaseAdmin
        .from('bj_stats')
        .update({
          current_rank: i + 1,
        })
        .eq('bj_id', stats[i].bj_id);
    }

    return { success: true };
  } catch (error) {
    console.error('점수 업데이트 오류:', error);
    return { success: false, error: '점수 업데이트에 실패했습니다.' };
  }
}
