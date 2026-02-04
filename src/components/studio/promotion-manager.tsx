'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  Gift, 
  ShoppingBag,
  Calendar,
  Hash
} from 'lucide-react';
import { useAuth } from '@/store/auth';
import type { Coupon, BuyOneGetOne, FreeGift } from '@/types/promotion';
import type { Product } from '@/types/product';

interface PromotionManagerProps {
  className?: string;
  adminMode?: boolean;
}

export function PromotionManager({ className, adminMode = false }: PromotionManagerProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'coupon' | 'bogo' | 'gift'>('coupon');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Coupon | BuyOneGetOne | FreeGift | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 쿠폰 상태
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponForm, setCouponForm] = useState({
    name: '',
    code: '',
    description: '',
    type: 'percentage' as 'percentage' | 'fixed' | 'free_shipping',
    value: '',
    minPurchaseAmount: '',
    maxDiscountAmount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
    perUserLimit: '',
  });

  // 1+1 상태
  const [bogoPromotions, setBogoPromotions] = useState<BuyOneGetOne[]>([]);
  const [bogoForm, setBogoForm] = useState({
    name: '',
    description: '',
    productId: '',
    freeProductId: '',
    minQuantity: '2',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
  });

  // 사은품 상태
  const [giftPromotions, setGiftPromotions] = useState<FreeGift[]>([]);
  const [giftForm, setGiftForm] = useState({
    name: '',
    description: '',
    giftProductId: '',
    minPurchaseAmount: '',
    minQuantity: '',
    validFrom: '',
    validUntil: '',
    stock: '',
    usageLimit: '',
  });

  const [products, setProducts] = useState<Product[]>([]);

  // 상품 목록 조회
  useEffect(() => {
    if (!adminMode && !user) return;

    const url = adminMode 
      ? '/api/products?isActive=all'
      : `/api/products?bjId=${user!.id}`;
    
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success || data.products) {
          setProducts(data.products || []);
        }
      })
      .catch((error) => {
        console.error('상품 목록 조회 오류:', error);
      });
  }, [user, adminMode]);

  // 쿠폰 목록 조회
  const fetchCoupons = async () => {
    if (!adminMode && !user) return;

    setIsLoading(true);
    try {
      const url = adminMode 
        ? '/api/coupons'
        : `/api/coupons?bjId=${user!.id}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('쿠폰 목록 조회 실패');

      const data = await response.json();
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error('쿠폰 목록 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 1+1 목록 조회
  const fetchBogo = async () => {
    if (!adminMode && !user) return;

    setIsLoading(true);
    try {
      const url = adminMode 
        ? '/api/promotions/buy-one-get-one'
        : `/api/promotions/buy-one-get-one?bjId=${user!.id}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('1+1 목록 조회 실패');

      const data = await response.json();
      setBogoPromotions(data.promotions || []);
    } catch (error) {
      console.error('1+1 목록 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 사은품 목록 조회
  const fetchGifts = async () => {
    if (!adminMode && !user) return;

    setIsLoading(true);
    try {
      const url = adminMode 
        ? '/api/promotions/free-gifts'
        : `/api/promotions/free-gifts?bjId=${user!.id}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('사은품 목록 조회 실패');

      const data = await response.json();
      setGiftPromotions(data.promotions || []);
    } catch (error) {
      console.error('사은품 목록 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'coupon') {
      fetchCoupons();
    } else if (activeTab === 'bogo') {
      fetchBogo();
    } else if (activeTab === 'gift') {
      fetchGifts();
    }
  }, [activeTab, user, adminMode]);

  // 쿠폰 생성/수정
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMode && !user) return;

    setIsLoading(true);
    try {
      const url = editingPromotion
        ? `/api/coupons/${editingPromotion.id}`
        : '/api/coupons';
      const method = editingPromotion ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...couponForm,
          value: parseFloat(couponForm.value),
          minPurchaseAmount: couponForm.minPurchaseAmount ? parseFloat(couponForm.minPurchaseAmount) : undefined,
          maxDiscountAmount: couponForm.maxDiscountAmount ? parseFloat(couponForm.maxDiscountAmount) : undefined,
          usageLimit: couponForm.usageLimit ? parseInt(couponForm.usageLimit) : undefined,
          perUserLimit: couponForm.perUserLimit ? parseInt(couponForm.perUserLimit) : undefined,
          ...(adminMode ? {} : { bjId: user!.id }),
        }),
      });

      if (!response.ok) throw new Error('쿠폰 저장 실패');

      setIsModalOpen(false);
      setEditingPromotion(null);
      setCouponForm({
        name: '',
        code: '',
        description: '',
        type: 'percentage',
        value: '',
        minPurchaseAmount: '',
        maxDiscountAmount: '',
        validFrom: '',
        validUntil: '',
        usageLimit: '',
        perUserLimit: '',
      });
      fetchCoupons();
    } catch (error) {
      console.error('쿠폰 저장 오류:', error);
      alert('쿠폰을 저장할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 1+1 생성/수정
  const handleBogoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMode && !user) return;

    setIsLoading(true);
    try {
      const url = editingPromotion
        ? `/api/promotions/buy-one-get-one/${editingPromotion.id}`
        : '/api/promotions/buy-one-get-one';
      const method = editingPromotion ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bogoForm,
          minQuantity: parseInt(bogoForm.minQuantity),
          usageLimit: bogoForm.usageLimit ? parseInt(bogoForm.usageLimit) : undefined,
          ...(adminMode ? {} : { bjId: user!.id }),
        }),
      });

      if (!response.ok) throw new Error('1+1 프로모션 저장 실패');

      setIsModalOpen(false);
      setEditingPromotion(null);
      setBogoForm({
        name: '',
        description: '',
        productId: '',
        freeProductId: '',
        minQuantity: '2',
        validFrom: '',
        validUntil: '',
        usageLimit: '',
      });
      fetchBogo();
    } catch (error) {
      console.error('1+1 프로모션 저장 오류:', error);
      alert('프로모션을 저장할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 사은품 생성/수정
  const handleGiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMode && !user) return;

    setIsLoading(true);
    try {
      const url = editingPromotion
        ? `/api/promotions/free-gifts/${editingPromotion.id}`
        : '/api/promotions/free-gifts';
      const method = editingPromotion ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...giftForm,
          minPurchaseAmount: giftForm.minPurchaseAmount ? parseFloat(giftForm.minPurchaseAmount) : undefined,
          minQuantity: giftForm.minQuantity ? parseInt(giftForm.minQuantity) : undefined,
          stock: parseInt(giftForm.stock),
          usageLimit: giftForm.usageLimit ? parseInt(giftForm.usageLimit) : undefined,
          ...(adminMode ? {} : { bjId: user!.id }),
        }),
      });

      if (!response.ok) throw new Error('사은품 프로모션 저장 실패');

      setIsModalOpen(false);
      setEditingPromotion(null);
      setGiftForm({
        name: '',
        description: '',
        giftProductId: '',
        minPurchaseAmount: '',
        minQuantity: '',
        validFrom: '',
        validUntil: '',
        stock: '',
        usageLimit: '',
      });
      fetchGifts();
    } catch (error) {
      console.error('사은품 프로모션 저장 오류:', error);
      alert('프로모션을 저장할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold">프로모션 관리</h3>
        </div>
        <Button
          onClick={() => {
            setEditingPromotion(null);
            setIsModalOpen(true);
          }}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          프로모션 추가
        </Button>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 mb-4 border-b border-zinc-800/80">
        <button
          onClick={() => setActiveTab('coupon')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'coupon'
              ? 'border-b-2 border-amber-400 text-amber-400'
              : 'text-zinc-400 hover:text-zinc-300'
          }`}
        >
          <Tag className="w-4 h-4 inline mr-1" />
          쿠폰
        </button>
        <button
          onClick={() => setActiveTab('bogo')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'bogo'
              ? 'border-b-2 border-amber-400 text-amber-400'
              : 'text-zinc-400 hover:text-zinc-300'
          }`}
        >
          <ShoppingBag className="w-4 h-4 inline mr-1" />
          1+1
        </button>
        <button
          onClick={() => setActiveTab('gift')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'gift'
              ? 'border-b-2 border-amber-400 text-amber-400'
              : 'text-zinc-400 hover:text-zinc-300'
          }`}
        >
          <Gift className="w-4 h-4 inline mr-1" />
          사은품
        </button>
      </div>

      {/* 쿠폰 목록 */}
      {activeTab === 'coupon' && (
        <div className="space-y-3">
          {isLoading && coupons.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">로딩 중...</div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">등록된 쿠폰이 없습니다.</div>
          ) : (
            coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="p-4 rounded-lg border border-zinc-800/80 bg-card/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{coupon.name}</h4>
                      <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400 font-mono">
                        {coupon.code}
                      </span>
                      {coupon.isActive ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                          활성
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">
                          비활성
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400 mb-2">{coupon.description}</p>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <span>
                        {coupon.type === 'percentage' && `${coupon.value}% 할인`}
                        {coupon.type === 'fixed' && `${coupon.value.toLocaleString()}원 할인`}
                        {coupon.type === 'free_shipping' && '무료배송'}
                      </span>
                      <span>사용: {coupon.usageCount}회</span>
                      {coupon.usageLimit && <span>제한: {coupon.usageLimit}회</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setEditingPromotion(coupon);
                        setCouponForm({
                          name: coupon.name,
                          code: coupon.code,
                          description: coupon.description || '',
                          type: coupon.type,
                          value: coupon.value.toString(),
                          minPurchaseAmount: coupon.minPurchaseAmount?.toString() || '',
                          maxDiscountAmount: coupon.maxDiscountAmount?.toString() || '',
                          validFrom: coupon.validFrom.split('T')[0],
                          validUntil: coupon.validUntil.split('T')[0],
                          usageLimit: coupon.usageLimit?.toString() || '',
                          perUserLimit: coupon.perUserLimit?.toString() || '',
                        });
                        setIsModalOpen(true);
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={async () => {
                        if (!confirm('정말 삭제하시겠습니까?')) return;
                        await fetch(`/api/coupons/${coupon.id}`, { method: 'DELETE' });
                        fetchCoupons();
                      }}
                      size="sm"
                      variant="outline"
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 1+1 목록 */}
      {activeTab === 'bogo' && (
        <div className="space-y-3">
          {isLoading && bogoPromotions.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">로딩 중...</div>
          ) : bogoPromotions.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">등록된 1+1 프로모션이 없습니다.</div>
          ) : (
            bogoPromotions.map((promo) => (
              <div
                key={promo.id}
                className="p-4 rounded-lg border border-zinc-800/80 bg-card/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{promo.name}</h4>
                    <p className="text-sm text-zinc-400 mb-2">{promo.description}</p>
                    <div className="text-xs text-zinc-500">
                      {promo.minQuantity}개 이상 구매 시 1개 추가 증정
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 사은품 목록 */}
      {activeTab === 'gift' && (
        <div className="space-y-3">
          {isLoading && giftPromotions.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">로딩 중...</div>
          ) : giftPromotions.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">등록된 사은품 프로모션이 없습니다.</div>
          ) : (
            giftPromotions.map((promo) => (
              <div
                key={promo.id}
                className="p-4 rounded-lg border border-zinc-800/80 bg-card/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{promo.name}</h4>
                    <p className="text-sm text-zinc-400 mb-2">{promo.description}</p>
                    <div className="text-xs text-zinc-500">
                      재고: {promo.stock}개 | 사용: {promo.usageCount}회
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 모달 - 쿠폰 생성/수정 */}
      {isModalOpen && activeTab === 'coupon' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-800/80 bg-card p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingPromotion ? '쿠폰 수정' : '쿠폰 생성'}
            </h3>

            <form onSubmit={handleCouponSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">쿠폰명 *</label>
                  <input
                    type="text"
                    value={couponForm.name}
                    onChange={(e) => setCouponForm({ ...couponForm, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">쿠폰 코드</label>
                  <input
                    type="text"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    placeholder="자동 생성 (비워두면 자동 생성)"
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">설명</label>
                <textarea
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">할인 타입 *</label>
                  <select
                    value={couponForm.type}
                    onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value as any })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="percentage">퍼센트 할인</option>
                    <option value="fixed">정액 할인</option>
                    <option value="free_shipping">무료배송</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    할인 값 * {couponForm.type === 'percentage' ? '(%)' : '(원)'}
                  </label>
                  <input
                    type="number"
                    value={couponForm.value}
                    onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                    required
                    min="0"
                    step={couponForm.type === 'percentage' ? '1' : '100'}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {couponForm.type === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">최대 할인 금액 (원)</label>
                    <input
                      type="number"
                      value={couponForm.maxDiscountAmount}
                      onChange={(e) => setCouponForm({ ...couponForm, maxDiscountAmount: e.target.value })}
                      min="0"
                      step="100"
                      className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">최소 구매 금액 (원)</label>
                  <input
                    type="number"
                    value={couponForm.minPurchaseAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minPurchaseAmount: e.target.value })}
                    min="0"
                    step="100"
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">사용자당 제한</label>
                  <input
                    type="number"
                    value={couponForm.perUserLimit}
                    onChange={(e) => setCouponForm({ ...couponForm, perUserLimit: e.target.value })}
                    min="1"
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">유효 시작일 *</label>
                  <input
                    type="date"
                    value={couponForm.validFrom}
                    onChange={(e) => setCouponForm({ ...couponForm, validFrom: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">유효 종료일 *</label>
                  <input
                    type="date"
                    value={couponForm.validUntil}
                    onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">사용 횟수 제한</label>
                <input
                  type="number"
                  value={couponForm.usageLimit}
                  onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                  min="1"
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingPromotion(null);
                  }}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? '저장 중...' : '저장'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 모달 - 1+1 생성/수정 */}
      {isModalOpen && activeTab === 'bogo' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-800/80 bg-card p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingPromotion ? '1+1 프로모션 수정' : '1+1 프로모션 생성'}
            </h3>

            <form onSubmit={handleBogoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">프로모션명 *</label>
                <input
                  type="text"
                  value={bogoForm.name}
                  onChange={(e) => setBogoForm({ ...bogoForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">설명</label>
                <textarea
                  value={bogoForm.description}
                  onChange={(e) => setBogoForm({ ...bogoForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">상품 *</label>
                  <select
                    value={bogoForm.productId}
                    onChange={(e) => setBogoForm({ ...bogoForm, productId: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="">상품 선택</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">무료 상품 (비워두면 같은 상품)</label>
                  <select
                    value={bogoForm.freeProductId}
                    onChange={(e) => setBogoForm({ ...bogoForm, freeProductId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="">같은 상품</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">최소 구매 수량 *</label>
                <input
                  type="number"
                  value={bogoForm.minQuantity}
                  onChange={(e) => setBogoForm({ ...bogoForm, minQuantity: e.target.value })}
                  required
                  min="2"
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">유효 시작일 *</label>
                  <input
                    type="date"
                    value={bogoForm.validFrom}
                    onChange={(e) => setBogoForm({ ...bogoForm, validFrom: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">유효 종료일 *</label>
                  <input
                    type="date"
                    value={bogoForm.validUntil}
                    onChange={(e) => setBogoForm({ ...bogoForm, validUntil: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">사용 횟수 제한</label>
                <input
                  type="number"
                  value={bogoForm.usageLimit}
                  onChange={(e) => setBogoForm({ ...bogoForm, usageLimit: e.target.value })}
                  min="1"
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingPromotion(null);
                  }}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? '저장 중...' : '저장'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 모달 - 사은품 생성/수정 */}
      {isModalOpen && activeTab === 'gift' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-800/80 bg-card p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingPromotion ? '사은품 프로모션 수정' : '사은품 프로모션 생성'}
            </h3>

            <form onSubmit={handleGiftSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">프로모션명 *</label>
                <input
                  type="text"
                  value={giftForm.name}
                  onChange={(e) => setGiftForm({ ...giftForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">설명</label>
                <textarea
                  value={giftForm.description}
                  onChange={(e) => setGiftForm({ ...giftForm, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">사은품 상품 *</label>
                <select
                  value={giftForm.giftProductId}
                  onChange={(e) => setGiftForm({ ...giftForm, giftProductId: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                >
                  <option value="">상품 선택</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">최소 구매 금액 (원)</label>
                  <input
                    type="number"
                    value={giftForm.minPurchaseAmount}
                    onChange={(e) => setGiftForm({ ...giftForm, minPurchaseAmount: e.target.value })}
                    min="0"
                    step="100"
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">최소 구매 수량</label>
                  <input
                    type="number"
                    value={giftForm.minQuantity}
                    onChange={(e) => setGiftForm({ ...giftForm, minQuantity: e.target.value })}
                    min="1"
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">사은품 재고 *</label>
                <input
                  type="number"
                  value={giftForm.stock}
                  onChange={(e) => setGiftForm({ ...giftForm, stock: e.target.value })}
                  required
                  min="1"
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">유효 시작일 *</label>
                  <input
                    type="date"
                    value={giftForm.validFrom}
                    onChange={(e) => setGiftForm({ ...giftForm, validFrom: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">유효 종료일 *</label>
                  <input
                    type="date"
                    value={giftForm.validUntil}
                    onChange={(e) => setGiftForm({ ...giftForm, validUntil: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">사용 횟수 제한</label>
                <input
                  type="number"
                  value={giftForm.usageLimit}
                  onChange={(e) => setGiftForm({ ...giftForm, usageLimit: e.target.value })}
                  min="1"
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingPromotion(null);
                  }}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? '저장 중...' : '저장'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
