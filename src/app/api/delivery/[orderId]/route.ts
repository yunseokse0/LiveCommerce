import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

/**
 * 주문별 배송 정보 조회
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json(
        {
          success: false,
          error: '주문을 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // 배송 정보 구성
    const deliveryInfo = {
      orderId: order.id,
      shippingAddress: order.shipping_address || '',
      status: order.status as 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled',
      // TODO: 배송 상세 정보는 별도 테이블에서 조회
      // 현재는 orders 테이블의 정보만 반환
    };

    return NextResponse.json({
      success: true,
      delivery: deliveryInfo,
    });
  } catch (error) {
    console.error('배송 정보 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '배송 정보를 조회할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}

/**
 * 배송 상태 업데이트
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const { status, trackingNumber, carrier, notes } = body;

    if (!status) {
      return NextResponse.json(
        {
          success: false,
          error: '배송 상태가 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 주문 조회
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        {
          success: false,
          error: '주문을 찾을 수 없습니다.',
        },
        { status: 404 }
      );
    }

    // 배송 상태 업데이트
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // 배송 시작 시 배송 정보 추가
    if (status === 'shipped' && trackingNumber) {
      // TODO: 배송 상세 정보를 별도 테이블에 저장
      // 현재는 orders 테이블의 shipping_address에 추가 정보 저장
      updateData.shipping_address = `${order.shipping_address || ''}\n[택배사: ${carrier || '미지정'}]\n[송장번호: ${trackingNumber}]`;
    }

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('배송 상태 업데이트 오류:', updateError);
      return NextResponse.json(
        {
          success: false,
          error: '배송 상태를 업데이트할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: '배송 상태가 업데이트되었습니다.',
    });
  } catch (error) {
    console.error('배송 상태 업데이트 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '배송 상태를 업데이트할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
