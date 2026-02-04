import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * 이미지 업로드 (프론트엔드 전용 - Base64 변환)
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

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

    // Base64로 변환 (프론트엔드 전용)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // 또는 임시 URL 생성 (브라우저에서만 사용)
    // 실제 프로덕션에서는 외부 이미지 호스팅 서비스 사용 권장

    return NextResponse.json({
      success: true,
      url: dataUrl, // Base64 데이터 URL
      fileName: file.name,
      // 참고: Base64는 큰 파일에 비효율적이므로, 실제 서비스에서는 외부 호스팅 권장
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
