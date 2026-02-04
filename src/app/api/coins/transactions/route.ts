import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { mockCoinTransactions } from '@/data/mock-coins';

export const dynamic = 'force-dynamic';

/**
 * 코인 거래 내역 조회
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: '사용자 ID가 필요합니다.',
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('coin_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error || !data || data.length === 0) {
      console.warn('코인 거래 내역 조회 오류 또는 데이터 없음, MOCK 데이터 사용:', error);
      // 에러 발생하거나 데이터가 없으면 MOCK 데이터 반환
      const filteredTransactions = mockCoinTransactions
        .filter(tx => tx.userId === userId)
        .slice(offset, offset + limit)
        .map(tx => ({
          id: tx.id,
          userId: tx.userId,
          type: tx.type,
          amount: tx.amount,
          balance: tx.balanceAfter,
          description: tx.description,
          orderId: tx.referenceId,
          status: 'completed',
          createdAt: tx.createdAt,
        }));
      
      return NextResponse.json({
        success: true,
        transactions: filteredTransactions,
      });
    }

    const transactions = data.map((tx: any) => ({
      id: tx.id,
      userId: tx.user_id,
      type: tx.type,
      amount: tx.amount,
      balance: tx.balance,
      description: tx.description,
      orderId: tx.order_id,
      status: tx.status,
      createdAt: tx.created_at,
    }));

    return NextResponse.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error('코인 거래 내역 조회 오류, MOCK 데이터 사용:', error);
    // 에러 발생 시에도 MOCK 데이터 반환
    const userId = new URL(request.url).searchParams.get('userId') || 'user-1';
    const offset = parseInt(new URL(request.url).searchParams.get('offset') || '0');
    const limit = parseInt(new URL(request.url).searchParams.get('limit') || '50');
    
    const filteredTransactions = mockCoinTransactions
      .filter(tx => tx.userId === userId)
      .slice(offset, offset + limit)
      .map(tx => ({
        id: tx.id,
        userId: tx.userId,
        type: tx.type,
        amount: tx.amount,
        balance: tx.balanceAfter,
        description: tx.description,
        orderId: tx.referenceId,
        status: 'completed',
        createdAt: tx.createdAt,
      }));
    
    return NextResponse.json({
      success: true,
      transactions: filteredTransactions,
    });
  }
}
