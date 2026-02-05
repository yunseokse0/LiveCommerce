import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * 채팅 메시지 삭제
 * DELETE /api/chat/messages/[messageId]
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ messageId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { messageId } = await params;

    // 메시지 정보 조회
    const { data: message, error: messageError } = await supabaseAdmin
      .from('chat_messages')
      .select('stream_id, user_id')
      .eq('id', messageId)
      .single();

    if (messageError || !message) {
      return NextResponse.json(
        { success: false, error: '메시지를 찾을 수 없습니다.' },
        { status: 404 }
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
        { success: false, error: '메시지를 삭제할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 스트림의 크리에이터 확인
    const { data: stream } = await supabaseAdmin
      .from('live_streams')
      .select('bj_id')
      .eq('id', message.stream_id)
      .single();

    if (!stream || stream.bj_id !== profile.bj_id) {
      return NextResponse.json(
        { success: false, error: '메시지를 삭제할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    // 메시지 삭제 처리
    const { error: deleteError } = await supabaseAdmin
      .from('chat_messages')
      .update({
        is_deleted: true,
        deleted_by: user.id,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', messageId);

    if (deleteError) {
      console.error('메시지 삭제 오류:', deleteError);
      return NextResponse.json(
        { success: false, error: '메시지를 삭제할 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '메시지가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('메시지 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
