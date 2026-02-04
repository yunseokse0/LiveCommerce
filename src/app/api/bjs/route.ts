import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// 크리에이터 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');
    const isActive = searchParams.get('is_active');

    let query = supabaseAdmin
      .from('bjs')
      .select('*')
      .order('created_at', { ascending: false });

    if (platform) {
      query = query.eq('platform', platform);
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      bjs: data,
    });
  } catch (error: any) {
    console.error('크리에이터 목록 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '크리에이터 목록을 불러올 수 없습니다.',
      },
      { status: 500 }
    );
  }
}

// 크리에이터 추가
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, platform, channel_url, youtube_channel_id, thumbnail_url, description } = body;

    if (!name || !channel_url) {
      return NextResponse.json(
        {
          success: false,
          error: '이름과 채널 URL은 필수입니다.',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('bjs')
      .insert({
        name,
        platform: platform || 'youtube',
        channel_url,
        youtube_channel_id,
        thumbnail_url,
        description,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      bj: data,
    });
  } catch (error: any) {
    console.error('크리에이터 추가 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '크리에이터 추가에 실패했습니다.',
      },
      { status: 500 }
    );
  }
}
