import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * 알림 읽음 처리
 * PATCH /api/notifications/[id]/read
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 알림 소유자 확인
    const { data: notification, error: checkError } = await supabaseAdmin
      .from('notifications')
      .select('user_id')
      .eq('id', id)
      .single();

    if (checkError || !notification) {
      return NextResponse.json(
        { success: false, error: '알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (notification.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: '알림을 읽을 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 읽음 처리
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('알림 읽음 처리 오류:', error);
      return NextResponse.json(
        { success: false, error: '알림을 읽음 처리할 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notification: data,
    });
  } catch (error) {
    console.error('알림 읽음 처리 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
