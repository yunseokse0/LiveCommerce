import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * 모든 알림 읽음 처리
 * PATCH /api/notifications/read-all
 */
export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 모든 읽지 않은 알림 읽음 처리
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .select();

    if (error) {
      console.error('알림 일괄 읽음 처리 오류:', error);
      return NextResponse.json(
        { success: false, error: '알림을 읽음 처리할 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updatedCount: data?.length || 0,
    });
  } catch (error) {
    console.error('알림 일괄 읽음 처리 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
