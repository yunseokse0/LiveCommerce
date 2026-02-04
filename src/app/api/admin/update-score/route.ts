import { NextResponse } from 'next/server';
import { updateBJScore } from '@/lib/actions/update-bj-score';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { bjId, score } = await request.json();

    if (!bjId || typeof score !== 'number') {
      return NextResponse.json(
        { success: false, error: '잘못된 요청입니다.' },
        { status: 400 }
      );
    }

    const result = await updateBJScore(bjId, score);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('점수 업데이트 API 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '점수 업데이트에 실패했습니다.',
      },
      { status: 500 }
    );
  }
}
