'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Package, Search } from 'lucide-react';
import type { Product } from '@/types/product';
import Link from 'next/link';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 상품 목록 조회
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products?isActive=all');
      if (!response.ok) throw new Error('상품 목록 조회 실패');

      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('상품 목록 조회 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 상품 삭제
  const handleDelete = async (productId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('상품 삭제 실패');

      fetchProducts();
    } catch (error) {
      console.error('상품 삭제 오류:', error);
      alert('상품을 삭제할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 필터링
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 카테고리 목록
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  return (
    <ProtectedRoute requireAuth={false} requireAdmin={false}>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">관리자 - 제품 관리</h1>
            <Link href="/studio">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                제품 추가
              </Button>
            </Link>
          </div>

          {/* 검색 및 필터 */}
          <div className="mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="제품명 또는 설명으로 검색..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
            >
              <option value="all">전체 카테고리</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {isLoading && products.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">로딩 중...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              {searchTerm || selectedCategory !== 'all' ? '검색 결과가 없습니다.' : '등록된 제품이 없습니다.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-4 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm hover:border-amber-500/30 transition-colors"
                >
                  <Link href={`/products/${product.id}`}>
                    {product.thumbnailUrl || product.imageUrl ? (
                      <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-zinc-800">
                        <img
                          src={product.thumbnailUrl || product.imageUrl || ''}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video rounded-lg bg-zinc-800 flex items-center justify-center mb-3">
                        <Package className="w-8 h-8 text-zinc-600" />
                      </div>
                    )}
                  </Link>
                  
                  <Link href={`/products/${product.id}`}>
                    <h4 className="font-semibold mb-1 line-clamp-1 hover:text-amber-400 transition-colors">
                      {product.name}
                    </h4>
                  </Link>
                  
                  <p className="text-sm text-zinc-400 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-amber-400">
                      {product.price.toLocaleString()}원
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      product.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {product.isActive ? '활성' : '비활성'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/products/${product.id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">
                        상세보기
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleDelete(product.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-400 hover:text-red-300"
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
