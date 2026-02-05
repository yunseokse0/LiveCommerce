'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useCart } from '@/store/cart';
import { useAuth } from '@/store/auth';
import { PaymentButton } from '@/components/payment/payment-button';
import { CouponInput } from '@/components/payment/coupon-input';
import { CoinPaymentOption } from '@/components/payment/coin-payment-option';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft,
  Package
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/hooks/use-translation';
import { useFormat } from '@/hooks/use-format';
import { useToast } from '@/hooks/use-toast';

export default function CartPage() {
  const { t } = useTranslation();
  const format = useFormat();
  const toast = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [appliedPromotions, setAppliedPromotions] = useState<{
    bogo?: string[];
    freeGifts?: string[];
  }>({});
  const [shippingAddress, setShippingAddress] = useState('');
  const [coinPaymentAmount, setCoinPaymentAmount] = useState(0);

  const totalPrice = getTotalPrice();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (!user) {
      router.push('/auth/login?redirect=/cart');
      return;
    }

    if (items.length === 0) {
      toast.warning(t('cart.empty'), t('cart.emptyDesc'));
      return;
    }

    if (!shippingAddress.trim()) {
      toast.warning(t('cart.shippingAddress'), t('cart.shippingAddressPlaceholder'));
      return;
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-6xl">
            <EmptyState
              icon={ShoppingCart}
              title={t('cart.empty')}
              description={t('cart.emptyDesc')}
              action={{
                label: t('cart.goShopping'),
                onClick: () => router.push('/'),
              }}
            />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-6xl">
          <div className="flex items-center gap-2 mb-6">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold">{t('cart.title')}</h1>
            <span className="text-sm text-zinc-400">({totalItems} {t('cart.items')})</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* 장바구니 아이템 목록 */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm"
                >
                  <div className="flex gap-4">
                    {/* 상품 이미지 */}
                    <Link href={`/products/${item.product.id}`} className="flex-shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-800/80">
                        {item.product.thumbnailUrl || item.product.imageUrl ? (
                          <Image
                            src={item.product.thumbnailUrl || item.product.imageUrl || ''}
                            alt={item.product.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-zinc-600" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* 상품 정보 */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.product.id}`}>
                        <h3 className="font-semibold mb-1 hover:text-amber-400 transition-colors line-clamp-2">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-sm text-zinc-400 mb-2 line-clamp-1">
                        {item.product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            variant="outline"
                            size="sm"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            variant="outline"
                            size="sm"
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-amber-400">
                            {format.currency(item.product.price * item.quantity)}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {format.currency(item.product.price)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      {item.product.stock < item.quantity && (
                        <p className="text-xs text-red-400 mt-2">
                          {t('cart.outOfStock')} ({t('cart.stock')}: {item.product.stock})
                        </p>
                      )}
                    </div>

                    {/* 삭제 버튼 */}
                    <Button
                      onClick={() => removeItem(item.product.id)}
                      variant="outline"
                      size="sm"
                      className="flex-shrink-0 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <Button
                  onClick={clearCart}
                  variant="outline"
                  size="sm"
                  className="text-red-400 hover:text-red-300"
                >
                  {t('cart.removeAll')}
                </Button>
              </div>
            </div>

            {/* 주문 요약 */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm space-y-6">
                <h2 className="text-lg sm:text-xl font-semibold">주문 요약</h2>

                {/* 배송지 입력 */}
                <div>
                  <label className="block text-sm font-medium mb-2">{t('cart.shippingAddress')}</label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder={t('cart.shippingAddressPlaceholder')}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 resize-none text-sm"
                  />
                </div>

                {/* 쿠폰 입력 */}
                <CouponInput
                  onApply={(validation) => setAppliedCoupon(validation)}
                  onRemove={() => setAppliedCoupon(null)}
                  appliedCoupon={appliedCoupon}
                  purchaseAmount={totalPrice}
                  productIds={items.map(item => item.product.id)}
                />

                {/* 코인 결제 옵션 */}
                {user && (
                  <CoinPaymentOption
                    finalAmount={totalPrice}
                    onCoinAmountChange={setCoinPaymentAmount}
                  />
                )}

                {/* 금액 요약 */}
                <div className="space-y-2 pt-4 border-t border-zinc-800/80">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">{t('cart.productPrice')}</span>
                    <span>{format.currency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">{t('cart.discount')}</span>
                    <span className="text-red-400">-{format.currency(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">{t('cart.coinPayment')}</span>
                    <span className="text-amber-400">-{format.currency(coinPaymentAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-zinc-800/80">
                    <span>{t('cart.total')}</span>
                    <span className="text-amber-400">
                      {format.currency(Math.max(0, totalPrice - coinPaymentAmount))}
                    </span>
                  </div>
                </div>

                {/* 결제 버튼 */}
                {user ? (
                  <PaymentButton
                    items={items}
                    shippingAddress={shippingAddress}
                    couponCode={appliedCoupon?.code || undefined}
                    appliedPromotions={appliedPromotions}
                    useTossPayments={!!process.env.NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY}
                    onSuccess={() => {
                      clearCart();
                      router.push('/payment/success');
                    }}
                    onError={(error) => {
                      alert(error);
                    }}
                  />
                ) : (
                  <Button
                    onClick={() => router.push('/auth/login?redirect=/cart')}
                    className="w-full"
                  >
                    {t('cart.loginToCheckout')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
