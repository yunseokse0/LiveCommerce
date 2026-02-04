import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * 이미지 업로드 (Supabase Storage)
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'reviews';

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: '파일이 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: '파일 크기는 5MB 이하여야 합니다.',
        },
        { status: 400 }
      );
    }

    // 파일 타입 확인
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: '지원하는 이미지 형식: JPEG, PNG, WebP, GIF',
        },
        { status: 400 }
      );
    }

    // 파일명 생성
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${timestamp}-${randomString}.${fileExt}`;

    // Supabase Storage에 업로드
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabaseAdmin.storage
      .from('images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('이미지 업로드 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '이미지 업로드에 실패했습니다.',
        },
        { status: 500 }
      );
    }

    // 공개 URL 생성
    const { data: urlData } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName: data.path,
    });
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '이미지 업로드를 처리할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
