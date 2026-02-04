import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// 특산물 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get('region_id');
    const category = searchParams.get('category');

    let query = supabaseAdmin
      .from('local_products')
      .select(`
        *,
        regions (*)
      `)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (regionId) {
      query = query.eq('region_id', regionId);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      localProducts: data,
    });
  } catch (error: any) {
    console.error('특산물 목록 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '특산물 목록을 불러올 수 없습니다.',
      },
      { status: 500 }
    );
  }
}

// 특산물 추가
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, image_url, region_id, category, season_start, season_end, price_range } = body;

    if (!name || !region_id) {
      return NextResponse.json(
        {
          success: false,
          error: '이름과 지역 ID는 필수입니다.',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('local_products')
      .insert({
        name,
        description,
        image_url,
        region_id,
        category,
        season_start,
        season_end,
        price_range,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      localProduct: data,
    });
  } catch (error: any) {
    console.error('특산물 추가 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '특산물 추가에 실패했습니다.',
      },
      { status: 500 }
    );
  }
}
