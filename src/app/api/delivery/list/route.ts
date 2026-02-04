import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * 배송 목록 조회
 * 관리자 또는 크리에이터가 자신의 주문 배송 상태를 조회
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const bjId = searchParams.get('bjId');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (
            *,
            bjs (*)
          )
        )
      `)
      .in('status', ['paid', 'shipped', 'delivered'])
      .order('created_at', { ascending: false });

    // 사용자별 주문 조회
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // 상태별 필터링
    if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('배송 목록 조회 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '배송 목록을 조회할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    // 크리에이터별 필터링 (서버 사이드에서 처리)
    let filteredOrders = orders || [];
    if (bjId && orders) {
      filteredOrders = orders.filter((order: any) => {
        if (!order.order_items) return false;
        return order.order_items.some((item: any) => 
          item.products && item.products.bj_id === bjId
        );
      });
    }

    return NextResponse.json({
      success: true,
      deliveries: filteredOrders.map((order: any) => ({
        orderId: order.id,
        userId: order.user_id,
        totalAmount: order.total_amount,
        status: order.status,
        shippingAddress: order.shipping_address,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        items: order.order_items || [],
      })),
      count: filteredOrders.length,
    });
  } catch (error) {
    console.error('배송 목록 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '배송 목록을 조회할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
