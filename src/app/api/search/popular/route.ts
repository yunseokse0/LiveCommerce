import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * 인기 검색어 조회
 * GET /api/search/popular?limit=10
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const { data, error } = await supabaseAdmin
      .from('popular_searches')
      .select('*')
      .order('search_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('인기 검색어 조회 오류:', error);
      return NextResponse.json({
        success: true,
        popular: [],
      });
    }

    return NextResponse.json({
      success: true,
      popular: data || [],
    });
  } catch (error) {
    console.error('인기 검색어 조회 오류:', error);
    return NextResponse.json({
      success: true,
      popular: [],
    });
  }
}
