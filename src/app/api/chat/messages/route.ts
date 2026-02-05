import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * 채팅 메시지 저장
 * POST /api/chat/messages
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
    const { streamId, message, nickname } = body;

    if (!streamId || !message || !nickname) {
      return NextResponse.json(
        { success: false, error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 채팅 메시지 저장
    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .insert({
        stream_id: streamId,
        user_id: user.id,
        nickname: nickname,
        message: message.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('채팅 메시지 저장 오류:', error);
      return NextResponse.json(
        { success: false, error: '메시지를 저장할 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: data,
    });
  } catch (error) {
    console.error('채팅 메시지 저장 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 채팅 메시지 히스토리 조회
 * GET /api/chat/messages?streamId=xxx&limit=100
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get('streamId');
    const limit = parseInt(searchParams.get('limit') || '100');

    if (!streamId) {
      return NextResponse.json(
        { success: false, error: 'streamId가 필요합니다.' },
        { status: 400 }
      );
    }

    // 삭제되지 않은 메시지만 조회
    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('stream_id', streamId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('채팅 메시지 조회 오류:', error);
      return NextResponse.json(
        { success: false, error: '메시지를 조회할 수 없습니다.' },
        { status: 500 }
      );
    }

    // 최신순으로 정렬 (오름차순)
    const messages = (data || []).reverse();

    return NextResponse.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('채팅 메시지 조회 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
