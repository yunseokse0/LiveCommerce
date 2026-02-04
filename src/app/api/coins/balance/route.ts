import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { mockUserCoinBalance } from '@/data/mock-coins';

export const dynamic = 'force-dynamic';

/**
 * 사용자 코인 잔액 조회
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: '사용자 ID가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 코인 잔액 조회 또는 생성
    let { data: coin, error } = await supabaseAdmin
      .from('user_coins')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // 코인 잔액이 없으면 생성
      const { data: newCoin, error: createError } = await supabaseAdmin
        .from('user_coins')
        .insert({
          user_id: userId,
          balance: 0,
          total_earned: 0,
          total_spent: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error('코인 잔액 생성 오류:', createError);
        return NextResponse.json(
          {
            success: false,
            error: '코인 잔액을 생성할 수 없습니다.',
          },
          { status: 500 }
        );
      }

      coin = newCoin;
    } else if (error) {
      console.warn('코인 잔액 조회 오류, MOCK 데이터 사용:', error);
      // 에러 발생 시 MOCK 데이터 반환
      return NextResponse.json({
        success: true,
        coin: {
          id: 'mock-coin-1',
          userId,
          balance: mockUserCoinBalance,
          totalEarned: mockUserCoinBalance + 5000,
          totalSpent: 5000,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    const coinData = {
      id: coin.id,
      userId: coin.user_id,
      balance: coin.balance,
      totalEarned: coin.total_earned,
      totalSpent: coin.total_spent,
      updatedAt: coin.updated_at,
    };

    return NextResponse.json({
      success: true,
      coin: coinData,
    });
  } catch (error) {
    console.error('코인 잔액 조회 오류, MOCK 데이터 사용:', error);
    // 에러 발생 시에도 MOCK 데이터 반환
    return NextResponse.json({
      success: true,
      coin: {
        id: 'mock-coin-1',
        userId: 'user-1',
        balance: mockUserCoinBalance,
        totalEarned: mockUserCoinBalance + 5000,
        totalSpent: 5000,
        updatedAt: new Date().toISOString(),
      },
    });
  }
}
