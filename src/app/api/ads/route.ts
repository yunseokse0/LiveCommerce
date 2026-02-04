import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// 광고 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isActive = searchParams.get('is_active');

    let query = supabaseAdmin
      .from('ads')
      .select('*')
      .order('display_order', { ascending: true });

    if (type) {
      query = query.eq('type', type);
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
      ads: data,
    });
  } catch (error: any) {
    console.error('광고 목록 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '광고 목록을 불러올 수 없습니다.',
      },
      { status: 500 }
    );
  }
}

// 광고 추가
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type,
      title,
      image_url,
      link_url,
      is_active,
      start_date,
      end_date,
      display_order,
      cpm,
      cpc,
      ab_test_group,
      ab_test_variant,
      ab_test_weight,
      target_pages,
      target_user_groups,
      schedule_days,
      schedule_start_time,
      schedule_end_time,
      timezone,
    } = body;

    if (!type || !title || !image_url) {
      return NextResponse.json(
        {
          success: false,
          error: '타입, 제목, 이미지 URL은 필수입니다.',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('ads')
      .insert({
        type,
        title,
        image_url,
        link_url,
        is_active: is_active !== undefined ? is_active : true,
        start_date,
        end_date,
        display_order: display_order || 0,
        cpm,
        cpc,
        ab_test_group,
        ab_test_variant,
        ab_test_weight,
        target_pages,
        target_user_groups,
        schedule_days,
        schedule_start_time,
        schedule_end_time,
        timezone: timezone || 'Asia/Seoul',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      ad: data,
    });
  } catch (error: any) {
    console.error('광고 추가 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '광고 추가에 실패했습니다.',
      },
      { status: 500 }
    );
  }
}
