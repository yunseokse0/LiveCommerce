import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { calculateCoinEarn } from '@/lib/utils/coin';

export const dynamic = 'force-dynamic';

/**
 * 코인 적립
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, orderId, purchaseAmount, description } = body;

    if (!userId || purchaseAmount === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: '사용자 ID와 구매 금액이 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 활성 코인 적립 규칙 조회
    const { data: earnRules, error: rulesError } = await supabaseAdmin
      .from('coin_earn_rules')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (rulesError) {
      console.error('코인 적립 규칙 조회 오류:', rulesError);
      return NextResponse.json(
        {
          success: false,
          error: '코인 적립 규칙을 조회할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    // 적립 규칙이 없으면 0 코인
    if (!earnRules || earnRules.length === 0) {
      return NextResponse.json({
        success: true,
        earned: 0,
        message: '적립 규칙이 없습니다.',
      });
    }

    // 첫 번째 활성 규칙 사용 (우선순위는 나중에 추가 가능)
    const earnRule = {
      ...earnRules[0],
      isActive: earnRules[0].is_active,
      createdAt: earnRules[0].created_at,
      updatedAt: earnRules[0].updated_at,
    };

    // 적립 코인 계산
    const earnedCoins = calculateCoinEarn(purchaseAmount, earnRule);

    if (earnedCoins === 0) {
      return NextResponse.json({
        success: true,
        earned: 0,
        message: '적립 가능한 코인이 없습니다.',
      });
    }

    // 코인 잔액 조회 또는 생성
    let { data: coin, error: coinError } = await supabaseAdmin
      .from('user_coins')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (coinError && coinError.code === 'PGRST116') {
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
    } else if (coinError) {
      console.error('코인 잔액 조회 오류:', coinError);
      return NextResponse.json(
        {
          success: false,
          error: '코인 잔액을 조회할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    // 코인 잔액 업데이트
    const newBalance = coin.balance + earnedCoins;
    const { error: updateError } = await supabaseAdmin
      .from('user_coins')
      .update({
        balance: newBalance,
        total_earned: coin.total_earned + earnedCoins,
        updated_at: new Date().toISOString(),
      })
      .eq('id', coin.id);

    if (updateError) {
      console.error('코인 잔액 업데이트 오류:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: '코인 잔액을 업데이트할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    // 거래 내역 기록
    const { error: txError } = await supabaseAdmin
      .from('coin_transactions')
      .insert({
        user_id: userId,
        type: 'earn',
        amount: earnedCoins,
        balance: newBalance,
        description: description || `구매 적립 (${purchaseAmount.toLocaleString()}원)`,
        order_id: orderId || null,
        status: 'completed',
      });

    if (txError) {
      console.error('코인 거래 내역 기록 오류:', txError);
      // 거래 내역 기록 실패는 치명적이지 않으므로 계속 진행
    }

    return NextResponse.json({
      success: true,
      earned: earnedCoins,
      balance: newBalance,
    });
  } catch (error) {
    console.error('코인 적립 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '코인을 적립할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
