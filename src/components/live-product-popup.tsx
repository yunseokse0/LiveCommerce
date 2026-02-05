'use client';

import { useState, useEffect } from 'react';
import { X, ShoppingCart, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/cart';
import { useRouter } from 'next/navigation';
import { useChat } from '@/hooks/use-chat';
import { useAuth } from '@/store/auth';
import Image from 'next/image';
import type { Product } from '@/types/product';

interface LiveProductPopupProps {
  product: Product;
  streamId: string; // 스트림 ID (구매 알림용)
  onClose: () => void;
  onAddToCart?: () => void;
}

export function LiveProductPopup({ product, streamId, onClose, onAddToCart }: LiveProductPopupProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { addPurchaseNotification } = useChat({ streamId, autoConnect: false });
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // 자동 닫기 (10초 후)
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000); // 10초 후 자동 닫기

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem(product, quantity);
    
    // 구매 알림 표시
    const buyerName = user?.name || '익명의 구매자';
    addPurchaseNotification(buyerName, product.name);
    
    if (onAddToCart) {
      setTimeout(() => {
        onAddToCart();
      }, 300);
    }
    
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  const handleViewDetails = () => {
    router.push(`/products/${product.id}`);
    onClose();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-card border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/20 p-3 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-amber-400">지금 소개 중!</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/20 rounded transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* 상품 정보 */}
        <div className="p-4">
          <div className="flex gap-3 mb-3">
            {/* 상품 이미지 */}
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-800 border border-zinc-800/80 flex-shrink-0">
              {product.thumbnailUrl || product.imageUrl ? (
                <Image
                  src={product.thumbnailUrl || product.imageUrl || ''}
                  alt={product.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                  이미지 없음
                </div>
              )}
            </div>

            {/* 상품 정보 */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.name}</h3>
              <p className="text-xs text-zinc-400 mb-2 line-clamp-1">{product.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-amber-400">
                  {product.price.toLocaleString()}원
                </span>
                {product.stock > 0 ? (
                  <span className="text-xs text-zinc-500">재고: {product.stock}개</span>
                ) : (
                  <span className="text-xs text-red-400">품절</span>
                )}
              </div>
            </div>
          </div>

          {/* 수량 선택 */}
          {product.stock > 0 && (
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs text-zinc-400">수량:</span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                <Button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  disabled={quantity >= product.stock}
                >
                  +
                </Button>
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding}
              className="flex-1"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-1.5" />
              {isAdding ? '추가 중...' : '장바구니'}
            </Button>
            <Button
              onClick={handleViewDetails}
              variant="outline"
              size="sm"
              className="flex-shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
