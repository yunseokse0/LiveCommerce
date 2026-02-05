import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * 알림 목록 조회
 * GET /api/notifications?isRead=true&type=live&limit=20&offset=0
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const isRead = searchParams.get('isRead');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (isRead !== null) {
      query = query.eq('is_read', isRead === 'true');
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) {
      console.error('알림 조회 오류:', error);
      return NextResponse.json(
        { success: false, error: '알림을 조회할 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notifications: data || [],
    });
  } catch (error) {
    console.error('알림 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 알림 생성
 * POST /api/notifications
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, type, title, message, link, linkText } = body;

    if (!userId || !type || !title) {
      return NextResponse.json(
        { success: false, error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 관리자 권한 확인 (시스템 알림 생성 시)
    if (userId !== user.id) {
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        return NextResponse.json(
          { success: false, error: '알림을 생성할 권한이 없습니다.' },
          { status: 403 }
        );
      }
    }

    const { data, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message: message || null,
        link: link || null,
        link_text: linkText || null,
      })
      .select()
      .single();

    if (error) {
      console.error('알림 생성 오류:', error);
      return NextResponse.json(
        { success: false, error: '알림을 생성할 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notification: data,
    });
  } catch (error) {
    console.error('알림 생성 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
