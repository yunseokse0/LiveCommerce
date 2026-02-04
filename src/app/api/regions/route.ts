import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// 지역 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const parentId = searchParams.get('parent_id');

    let query = supabaseAdmin
      .from('regions')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (type) {
      query = query.eq('type', type);
    }

    if (parentId) {
      query = query.eq('parent_id', parentId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      regions: data,
    });
  } catch (error: any) {
    console.error('지역 목록 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '지역 목록을 불러올 수 없습니다.',
      },
      { status: 500 }
    );
  }
}

// 지역 추가
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, type, parent_id, latitude, longitude, center_x, center_y } = body;

    if (!code || !name || !type) {
      return NextResponse.json(
        {
          success: false,
          error: '코드, 이름, 타입은 필수입니다.',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('regions')
      .insert({
        code,
        name,
        type,
        parent_id,
        latitude,
        longitude,
        center_x,
        center_y,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      region: data,
    });
  } catch (error: any) {
    console.error('지역 추가 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '지역 추가에 실패했습니다.',
      },
      { status: 500 }
    );
  }
}
