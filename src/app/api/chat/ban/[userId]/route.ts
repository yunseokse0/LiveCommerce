import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * 사용자 차단 해제
 * DELETE /api/chat/ban/[userId]?streamId=xxx
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { userId } = await params;
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
        { success: false, error: '차단을 해제할 권한이 없습니다.' },
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
        { success: false, error: '차단을 해제할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 차단 해제 처리
    const { error: unbanError } = await supabaseAdmin
      .from('chat_banned_users')
      .update({
        is_active: false,
      })
      .eq('stream_id', streamId)
      .eq('user_id', userId);

    if (unbanError) {
      console.error('차단 해제 오류:', unbanError);
      return NextResponse.json(
        { success: false, error: '차단을 해제할 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '차단이 해제되었습니다.',
    });
  } catch (error) {
    console.error('차단 해제 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
