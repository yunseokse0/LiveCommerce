'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowLeft, Package, Tag } from 'lucide-react';
import Image from 'next/image';
import type { Product } from '@/types/product';
import { mockProducts } from '@/data/mock-products';
import { useCart } from '@/store/cart';
import { ReviewList } from '@/components/reviews/review-list';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  useEffect(() => {
    if (!productId) return;

    setIsLoading(true);
    // 먼저 MOCK 데이터에서 찾기
    const mockProduct = mockProducts.find((p) => p.id === productId);
    if (mockProduct) {
      setProduct(mockProduct);
      setIsLoading(false);
      return;
    }

    // MOCK 데이터에 없으면 API 호출
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          // API 실패 시 MOCK 데이터 사용
          const fallbackProduct = mockProducts.find((p) => p.id === productId);
          if (fallbackProduct) {
            setProduct(fallbackProduct);
          }
        }
      })
      .catch((error) => {
        console.error('제품 조회 오류, MOCK 데이터 사용:', error);
        // 에러 발생 시 MOCK 데이터 사용
        const fallbackProduct = mockProducts.find((p) => p.id === productId);
        if (fallbackProduct) {
          setProduct(fallbackProduct);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, quantity);
    alert('장바구니에 추가되었습니다.');
  };

  const handleBuyNow = () => {
    // TODO: 바로 구매 기능
    router.push(`/checkout?product=${productId}&quantity=${quantity}`);
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
            <div className="text-center py-12 text-zinc-400">로딩 중...</div>
          </div>
        </main>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
            <div className="text-center py-12">
              <p className="text-zinc-400 mb-4">제품을 찾을 수 없습니다.</p>
              <Button onClick={() => router.push('/')} variant="outline">
                홈으로 돌아가기
              </Button>
            </div>
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
          {/* 뒤로가기 버튼 */}
          <Button
            onClick={() => router.back()}
            variant="outline"
            size="sm"
            className="mb-4 sm:mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* 제품 이미지 */}
            <div className="space-y-4">
              {/* 대표 이미지 */}
              <div className="aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80">
                {product.thumbnailUrl || product.imageUrl ? (
                  <Image
                    src={product.thumbnailUrl || product.imageUrl || ''}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500">
                    <Package className="w-16 h-16" />
                  </div>
                )}
              </div>

              {/* 상세 이미지 */}
              {product.detailImages && product.detailImages.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-zinc-400">상세 이미지</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {product.detailImages.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800/80"
                      >
                        <Image
                          src={imageUrl}
                          alt={`${product.name} 상세 ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 33vw"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 제품 정보 */}
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{product.name}</h1>
                {product.category && (
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm text-zinc-400">{product.category}</span>
                  </div>
                )}
              </div>

              {/* 가격 */}
              <div className="py-4 border-y border-zinc-800/80">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-amber-400">
                    {product.price.toLocaleString()}
                  </span>
                  <span className="text-lg text-zinc-400">원</span>
                </div>
                {product.stock > 0 ? (
                  <p className="text-sm text-zinc-400 mt-2">재고: {product.stock}개</p>
                ) : (
                  <p className="text-sm text-red-400 mt-2">품절</p>
                )}
              </div>

              {/* 간단 설명 */}
              {product.description && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 mb-2">제품 설명</h3>
                  <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* 태그 */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-400 mb-2">태그</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-xs bg-zinc-800/50 text-zinc-300 border border-zinc-700/50"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 수량 선택 */}
              {product.stock > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-zinc-400 mb-2">
                    수량
                  </label>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      variant="outline"
                      size="sm"
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setQuantity(Math.max(1, Math.min(val, product.stock)));
                      }}
                      min="1"
                      max={product.stock}
                      className="w-20 px-3 py-2 text-center rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                    />
                    <Button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      variant="outline"
                      size="sm"
                      disabled={quantity >= product.stock}
                    >
                      +
                    </Button>
                  </div>
                </div>
              )}

              {/* 구매 버튼 */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  className="flex-1"
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  장바구니
                </Button>
                <Button
                  onClick={handleBuyNow}
                  className="flex-1"
                  disabled={product.stock === 0}
                >
                  바로 구매
                </Button>
              </div>
            </div>
          </div>

          {/* 상세 설명 */}
          {product.detailDescription && (
            <div className="mt-8 sm:mt-12 pt-8 border-t border-zinc-800/80">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">상세 정보</h2>
              <div
                className="prose prose-invert max-w-none text-zinc-300"
                dangerouslySetInnerHTML={{ __html: product.detailDescription }}
              />
            </div>
          )}

          {/* 리뷰 섹션 */}
          <div className="mt-8 sm:mt-12 pt-8 border-t border-zinc-800/80">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">리뷰</h2>
            <ReviewList productId={product.id} />
          </div>
        </div>
      </main>
    </>
  );
}
