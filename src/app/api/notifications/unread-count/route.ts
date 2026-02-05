import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * 읽지 않은 알림 개수 조회
 * GET /api/notifications/unread-count
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({
        success: true,
        count: 0,
      });
    }

    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      console.error('읽지 않은 알림 개수 조회 오류:', error);
      return NextResponse.json({
        success: true,
        count: 0,
      });
    }

    return NextResponse.json({
      success: true,
      count: count || 0,
    });
  } catch (error) {
    console.error('읽지 않은 알림 개수 조회 오류:', error);
    return NextResponse.json({
      success: true,
      count: 0,
    });
  }
}
