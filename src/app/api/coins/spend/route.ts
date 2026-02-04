import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { hasEnoughCoins } from '@/lib/utils/coin';

export const dynamic = 'force-dynamic';

/**
 * 코인 사용
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, amount, orderId, description } = body;

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: '사용자 ID와 사용할 코인 수가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 코인 잔액 조회
    const { data: coin, error: coinError } = await supabaseAdmin
      .from('user_coins')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (coinError || !coin) {
      return NextResponse.json(
        {
          success: false,
          error: '코인 잔액을 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // 잔액 확인
    if (!hasEnoughCoins(coin.balance, amount)) {
      return NextResponse.json(
        {
          success: false,
          error: '코인 잔액이 부족합니다.',
        },
        { status: 400 }
      );
    }

    // 코인 잔액 업데이트
    const newBalance = coin.balance - amount;
    const { error: updateError } = await supabaseAdmin
      .from('user_coins')
      .update({
        balance: newBalance,
        total_spent: coin.total_spent + amount,
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
        type: 'spend',
        amount: -amount, // 음수로 기록
        balance: newBalance,
        description: description || `코인 사용 (${amount}코인)`,
        order_id: orderId || null,
        status: 'completed',
      });

    if (txError) {
      console.error('코인 거래 내역 기록 오류:', txError);
      // 거래 내역 기록 실패는 치명적이지 않으므로 계속 진행
    }

    return NextResponse.json({
      success: true,
      spent: amount,
      balance: newBalance,
    });
  } catch (error) {
    console.error('코인 사용 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '코인을 사용할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
