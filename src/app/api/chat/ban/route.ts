import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * 사용자 차단
 * POST /api/chat/ban
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
    const { streamId, userId, reason, expiresAt } = body;

    if (!streamId || !userId) {
      return NextResponse.json(
        { success: false, error: 'streamId와 userId가 필요합니다.' },
        { status: 400 }
      );
    }

    // 크리에이터 권한 확인
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('bj_id')
      .eq('id', user.id)
      .single();

    if (!profile?.bj_id) {
      return NextResponse.json(
        { success: false, error: '사용자를 차단할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 스트림의 크리에이터 확인
    const { data: stream } = await supabaseAdmin
      .from('live_streams')
      .select('bj_id')
      .eq('id', streamId)
      .single();

    if (!stream || stream.bj_id !== profile.bj_id) {
      return NextResponse.json(
        { success: false, error: '사용자를 차단할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 차단 정보 저장 또는 업데이트
    const { data, error } = await supabaseAdmin
      .from('chat_banned_users')
      .upsert({
        stream_id: streamId,
        user_id: userId,
        banned_by: user.id,
        reason: reason || null,
        expires_at: expiresAt || null,
        is_active: true,
      }, {
        onConflict: 'stream_id,user_id',
      })
      .select()
      .single();

    if (error) {
      console.error('사용자 차단 오류:', error);
      return NextResponse.json(
        { success: false, error: '사용자를 차단할 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bannedUser: data,
    });
  } catch (error) {
    console.error('사용자 차단 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 차단된 사용자 목록 조회
 * GET /api/chat/ban?streamId=xxx
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
    const streamId = searchParams.get('streamId');

    if (!streamId) {
      return NextResponse.json(
        { success: false, error: 'streamId가 필요합니다.' },
        { status: 400 }
      );
    }

    // 크리에이터 권한 확인
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('bj_id')
      .eq('id', user.id)
      .single();

    if (!profile?.bj_id) {
      return NextResponse.json(
        { success: false, error: '차단 목록을 조회할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 스트림의 크리에이터 확인
    const { data: stream } = await supabaseAdmin
      .from('live_streams')
      .select('bj_id')
      .eq('id', streamId)
      .single();

    if (!stream || stream.bj_id !== profile.bj_id) {
      return NextResponse.json(
        { success: false, error: '차단 목록을 조회할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 활성 차단 목록 조회
    const { data, error } = await supabaseAdmin
      .from('chat_banned_users')
      .select('*')
      .eq('stream_id', streamId)
      .eq('is_active', true)
      .order('banned_at', { ascending: false });

    if (error) {
      console.error('차단 목록 조회 오류:', error);
      return NextResponse.json(
        { success: false, error: '차단 목록을 조회할 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bannedUsers: data || [],
    });
  } catch (error) {
    console.error('차단 목록 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
