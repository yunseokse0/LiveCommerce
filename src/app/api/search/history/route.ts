import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * 검색 기록 조회
 * GET /api/search/history?limit=10
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = supabaseAdmin
      .from('search_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      // 비회원의 경우 세션 ID 사용
      const cookieStore = await cookies();
      const sessionId = cookieStore.get('session_id')?.value;
      if (sessionId) {
        query = query.eq('session_id', sessionId);
      } else {
        return NextResponse.json({
          success: true,
          history: [],
        });
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('검색 기록 조회 오류:', error);
      return NextResponse.json({
        success: true,
        history: [],
      });
    }

    return NextResponse.json({
      success: true,
      history: data || [],
    });
  } catch (error) {
    console.error('검색 기록 조회 오류:', error);
    return NextResponse.json({
      success: true,
      history: [],
    });
  }
}

/**
 * 검색 기록 저장
 * POST /api/search/history
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { query, resultType, resultCount } = body;

    if (!query || !query.trim()) {
      return NextResponse.json(
        { success: false, error: '검색어가 필요합니다.' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    let sessionId = cookieStore.get('session_id')?.value;

    // 세션 ID가 없으면 생성
    if (!sessionId && !user) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      cookieStore.set('session_id', sessionId, {
        maxAge: 60 * 60 * 24 * 365, // 1년
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
    }

    const { data, error } = await supabaseAdmin
      .from('search_history')
      .insert({
        user_id: user?.id || null,
        session_id: sessionId || null,
        query: query.trim(),
        result_type: resultType || 'all',
        result_count: resultCount || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('검색 기록 저장 오류:', error);
      // 에러가 발생해도 계속 진행 (검색 기록은 중요하지 않음)
      return NextResponse.json({
        success: true,
        message: '검색 기록 저장 실패 (계속 진행)',
      });
    }

    return NextResponse.json({
      success: true,
      history: data,
    });
  } catch (error) {
    console.error('검색 기록 저장 오류:', error);
    return NextResponse.json({
      success: true,
      message: '검색 기록 저장 실패 (계속 진행)',
    });
  }
}

/**
 * 검색 기록 삭제
 * DELETE /api/search/history?id=xxx 또는 DELETE /api/search/history (전체 삭제)
 */
export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    let query = supabaseAdmin.from('search_history').delete();

    if (user) {
      query = query.eq('user_id', user.id);
    } else {
      const cookieStore = await cookies();
      const sessionId = cookieStore.get('session_id')?.value;
      if (sessionId) {
        query = query.eq('session_id', sessionId);
      } else {
        return NextResponse.json({
          success: true,
          message: '삭제할 검색 기록이 없습니다.',
        });
      }
    }

    if (id) {
      query = query.eq('id', id);
    }

    const { error } = await query;

    if (error) {
      console.error('검색 기록 삭제 오류:', error);
      return NextResponse.json(
        { success: false, error: '검색 기록을 삭제할 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '검색 기록이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('검색 기록 삭제 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
