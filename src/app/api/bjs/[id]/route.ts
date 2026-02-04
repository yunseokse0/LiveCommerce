import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

// 크리에이터 상세 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('bjs')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      bj: data,
    });
  } catch (error: any) {
    console.error('크리에이터 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '크리에이터를 찾을 수 없습니다.',
      },
      { status: 404 }
    );
  }
}

// 크리에이터 수정
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, platform, channel_url, youtube_channel_id, thumbnail_url, description, is_active } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (platform) updateData.platform = platform;
    if (channel_url) updateData.channel_url = channel_url;
    if (youtube_channel_id !== undefined) updateData.youtube_channel_id = youtube_channel_id;
    if (thumbnail_url !== undefined) updateData.thumbnail_url = thumbnail_url;
    if (description !== undefined) updateData.description = description;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabaseAdmin
      .from('bjs')
      .update(updateData)
      .eq('id', params.id)
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
    console.error('크리에이터 수정 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '크리에이터 수정에 실패했습니다.',
      },
      { status: 500 }
    );
  }
}

// 크리에이터 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from('bjs')
      .delete()
      .eq('id', params.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('크리에이터 삭제 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || '크리에이터 삭제에 실패했습니다.',
      },
      { status: 500 }
    );
  }
}
