import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * 사용자의 크리에이터 정보 조회
 * GET /api/users/[userId]/creator
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('bj_id')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      return NextResponse.json({
        success: true,
        isCreator: false,
        bjId: null,
      });
    }

    if (!profile.bj_id) {
      return NextResponse.json({
        success: true,
        isCreator: false,
        bjId: null,
      });
    }

    // BJ 정보 조회
    const { data: bj, error: bjError } = await supabaseAdmin
      .from('bjs')
      .select('*')
      .eq('id', profile.bj_id)
      .single();

    if (bjError || !bj) {
      return NextResponse.json({
        success: true,
        isCreator: false,
        bjId: null,
      });
    }

    return NextResponse.json({
      success: true,
      isCreator: true,
      bjId: profile.bj_id,
      bj,
    });
  } catch (error) {
    console.error('크리에이터 정보 조회 오류:', error);
    return NextResponse.json({
      success: true,
      isCreator: false,
      bjId: null,
    });
  }
}

/**
 * 사용자를 크리에이터로 등록
 * POST /api/users/[userId]/creator
 */
export async function POST(
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

    // 관리자 권한 확인 또는 본인인지 확인
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userId !== user.id && profile?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '크리에이터로 등록할 권한이 없습니다.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { bjId } = body;

    if (!bjId) {
      return NextResponse.json(
        { success: false, error: 'bjId가 필요합니다.' },
        { status: 400 }
      );
    }

    // BJ 존재 확인
    const { data: bj, error: bjError } = await supabaseAdmin
      .from('bjs')
      .select('id')
      .eq('id', bjId)
      .single();

    if (bjError || !bj) {
      return NextResponse.json(
        { success: false, error: '유효하지 않은 크리에이터 ID입니다.' },
        { status: 400 }
      );
    }

    // user_profiles 업데이트 또는 생성
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        id: userId,
        bj_id: bjId,
      }, {
        onConflict: 'id',
      })
      .select()
      .single();

    if (error) {
      console.error('크리에이터 등록 오류:', error);
      return NextResponse.json(
        { success: false, error: '크리에이터로 등록할 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: data,
    });
  } catch (error) {
    console.error('크리에이터 등록 오류:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
