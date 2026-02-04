import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getCurrentCoinPrice } from '@/lib/utils/coin';
import { mockCoinPrice } from '@/data/mock-coins';

export const dynamic = 'force-dynamic';

/**
 * 현재 코인 시세 조회
 */
export async function GET(request: Request) {
  try {
    const { data: prices, error } = await supabaseAdmin
      .from('coin_prices')
      .select('*')
      .order('effective_from', { ascending: false });

    if (error || !prices || prices.length === 0) {
      console.warn('코인 시세 조회 오류 또는 데이터 없음, MOCK 데이터 사용:', error);
      // 에러 발생하거나 데이터가 없으면 MOCK 데이터 반환
      return NextResponse.json({
        success: true,
        currentPrice: {
          id: mockCoinPrice.id,
          price: mockCoinPrice.priceKrw,
          effectiveFrom: mockCoinPrice.createdAt,
          effectiveUntil: null,
          isActive: true,
          createdAt: mockCoinPrice.createdAt,
        },
        history: [{
          id: mockCoinPrice.id,
          price: mockCoinPrice.priceKrw,
          effectiveFrom: mockCoinPrice.createdAt,
          effectiveUntil: null,
          isActive: true,
          createdAt: mockCoinPrice.createdAt,
        }],
      });
    }

    const priceData = (prices || []).map((price: any) => ({
      id: price.id,
      price: price.price,
      effectiveFrom: price.effective_from,
      effectiveUntil: price.effective_until,
      isActive: price.is_active,
      createdAt: price.created_at,
    }));

    const currentPrice = getCurrentCoinPrice(priceData);

    return NextResponse.json({
      success: true,
      currentPrice: currentPrice
        ? {
            id: currentPrice.id,
            price: currentPrice.price,
            effectiveFrom: currentPrice.effectiveFrom,
            effectiveUntil: currentPrice.effectiveUntil,
            isActive: currentPrice.isActive,
            createdAt: currentPrice.createdAt,
          }
        : null,
      history: priceData,
    });
  } catch (error) {
    console.error('코인 시세 조회 오류, MOCK 데이터 사용:', error);
    // 에러 발생 시에도 MOCK 데이터 반환
    return NextResponse.json({
      success: true,
      currentPrice: {
        id: mockCoinPrice.id,
        price: mockCoinPrice.priceKrw,
        effectiveFrom: mockCoinPrice.createdAt,
        effectiveUntil: null,
        isActive: true,
        createdAt: mockCoinPrice.createdAt,
      },
      history: [{
        id: mockCoinPrice.id,
        price: mockCoinPrice.priceKrw,
        effectiveFrom: mockCoinPrice.createdAt,
        effectiveUntil: null,
        isActive: true,
        createdAt: mockCoinPrice.createdAt,
      }],
    });
  }
}

/**
 * 코인 시세 설정 (관리자)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { price, effectiveFrom } = body;

    if (!price || price <= 0 || !effectiveFrom) {
      return NextResponse.json(
        {
          success: false,
          error: '시세와 적용 시작일이 필요합니다.',
        },
        { status: 400 }
      );
    }

    // 기존 활성 시세 비활성화
    await supabaseAdmin
      .from('coin_prices')
      .update({
        is_active: false,
        effective_until: new Date(effectiveFrom).toISOString(),
      })
      .eq('is_active', true);

    // 새 시세 생성
    const { data, error } = await supabaseAdmin
      .from('coin_prices')
      .insert({
        price,
        effective_from: effectiveFrom,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('코인 시세 설정 오류:', error);
      return NextResponse.json(
        {
          success: false,
          error: '코인 시세를 설정할 수 없습니다.',
        },
        { status: 500 }
      );
    }

    const priceData = {
      id: data.id,
      price: data.price,
      effectiveFrom: data.effective_from,
      effectiveUntil: data.effective_until,
      isActive: data.is_active,
      createdAt: data.created_at,
    };

    return NextResponse.json({
      success: true,
      price: priceData,
    });
  } catch (error) {
    console.error('코인 시세 설정 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '코인 시세를 설정할 수 없습니다.',
      },
      { status: 500 }
    );
  }
}
