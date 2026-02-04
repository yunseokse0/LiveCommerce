'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Package, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { Product } from '@/types/product';
import { useAuth } from '@/store/auth';
import { koreaRegions } from '@/data/korea-regions';
import { getSpecialtiesByRegion } from '@/data/region-specialties';

interface ProductManagerProps {
  onProductSelect?: (product: Product) => void;
  adminMode?: boolean;
}

export function ProductManager({ onProductSelect, adminMode = false }: ProductManagerProps) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // 폼 상태
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    thumbnailUrl: '',
    imageUrl: '',
    detailImages: [] as string[],
    detailDescription: '',
    category: '',
    tags: [] as string[],
    isSpecialty: false,
    specialtyId: '',
    regionId: '',
  });
  const [detailImageInput, setDetailImageInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  // 상품 목록 조회
  const fetchProducts = async () => {
    if (!adminMode && !user) return;

    setIsLoading(true);
    try {
      const url = adminMode 
        ? '/api/products?isActive=all'
        : `/api/products?bjId=${user!.id}&isActive=true`;
      const response = await fetch(url);
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
  }, [user, adminMode]);

  // 상품 생성/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMode && !user) return;

    setIsLoading(true);
    try {
      const productData = {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock) || 0,
        thumbnailUrl: formData.thumbnailUrl || undefined,
        imageUrl: formData.imageUrl || undefined,
        detailImages: formData.detailImages.length > 0 ? formData.detailImages : undefined,
        detailDescription: formData.detailDescription || undefined,
        category: formData.category || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        isSpecialty: formData.isSpecialty,
        specialtyId: formData.isSpecialty && formData.specialtyId ? formData.specialtyId : undefined,
        regionId: formData.isSpecialty && formData.regionId ? formData.regionId : undefined,
        ...(adminMode ? {} : { bjId: user!.id }),
      };

      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products';
      const method = editingProduct ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!response.ok) throw new Error('상품 저장 실패');

      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        thumbnailUrl: '',
        imageUrl: '',
        detailImages: [],
        detailDescription: '',
        category: '',
        tags: [],
        isSpecialty: false,
        specialtyId: '',
        regionId: '',
      });
      fetchProducts();
    } catch (error) {
      console.error('상품 저장 오류:', error);
      alert('상품을 저장할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

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

  // 수정 모달 열기
  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock.toString(),
      thumbnailUrl: product.thumbnailUrl || '',
      imageUrl: product.imageUrl || '',
      detailImages: product.detailImages || [],
      detailDescription: product.detailDescription || '',
      category: product.category || '',
      tags: product.tags || [],
      isSpecialty: product.isSpecialty || false,
      specialtyId: product.specialtyId || '',
      regionId: product.regionId || '',
    });
    setDetailImageInput('');
    setTagInput('');
    setIsModalOpen(true);
  };

  // 새 상품 모달 열기
  const handleNew = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      thumbnailUrl: '',
      imageUrl: '',
      detailImages: [],
      detailDescription: '',
      category: '',
      tags: [],
      isSpecialty: false,
      specialtyId: '',
      regionId: '',
    });
    setDetailImageInput('');
    setTagInput('');
    setIsModalOpen(true);
  };

  // 선택된 지역의 특산물 목록
  const availableSpecialties = formData.regionId
    ? getSpecialtiesByRegion(formData.regionId)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold">상품 관리</h3>
        </div>
        <Button onClick={handleNew} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          상품 추가
        </Button>
      </div>

      {isLoading && products.length === 0 ? (
        <div className="text-center py-8 text-zinc-400">로딩 중...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-zinc-400">
          등록된 상품이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="p-4 rounded-lg border border-zinc-800/80 bg-card/50 backdrop-blur-sm hover:border-amber-500/30 transition-colors"
            >
              {product.imageUrl && (
                <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-zinc-800">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
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
                <span className="text-sm text-zinc-400">
                  재고: {product.stock}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(product)}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  수정
                </Button>
                <Button
                  onClick={() => handleDelete(product.id)}
                  size="sm"
                  variant="outline"
                  className="flex-1 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  삭제
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 상품 추가/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800/80 bg-card p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingProduct ? '상품 수정' : '상품 추가'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  상품명 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    가격 *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">재고</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    min="0"
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  썸네일 이미지 URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnailUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnailUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  대표 이미지 URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  상세 이미지 URL (여러 개 입력 가능)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={detailImageInput}
                    onChange={(e) => setDetailImageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (detailImageInput.trim()) {
                          setFormData({
                            ...formData,
                            detailImages: [...formData.detailImages, detailImageInput.trim()],
                          });
                          setDetailImageInput('');
                        }
                      }
                    }}
                    placeholder="https://... (Enter로 추가)"
                    className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (detailImageInput.trim()) {
                        setFormData({
                          ...formData,
                          detailImages: [...formData.detailImages, detailImageInput.trim()],
                        });
                        setDetailImageInput('');
                      }
                    }}
                    size="sm"
                    variant="outline"
                  >
                    추가
                  </Button>
                </div>
                {formData.detailImages.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formData.detailImages.map((img, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded bg-zinc-800/50 text-sm"
                      >
                        <span className="truncate flex-1">{img}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              detailImages: formData.detailImages.filter((_, i) => i !== index),
                            });
                          }}
                          className="ml-2 text-red-400 hover:text-red-300"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  상세 설명 (HTML 가능)
                </label>
                <textarea
                  value={formData.detailDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, detailDescription: e.target.value })
                  }
                  rows={6}
                  placeholder="상세 설명을 입력하세요 (HTML 태그 사용 가능)"
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 resize-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">태그</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (tagInput.trim()) {
                          setFormData({
                            ...formData,
                            tags: [...formData.tags, tagInput.trim()],
                          });
                          setTagInput('');
                        }
                      }
                    }}
                    placeholder="태그 입력 (Enter로 추가)"
                    className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (tagInput.trim()) {
                        setFormData({
                          ...formData,
                          tags: [...formData.tags, tagInput.trim()],
                        });
                        setTagInput('');
                      }
                    }}
                    size="sm"
                    variant="outline"
                  >
                    추가
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-zinc-800/50 text-zinc-300 border border-zinc-700/50"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              tags: formData.tags.filter((_, i) => i !== index),
                            });
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">카테고리</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="예: 식품, 의류, 전자제품 등"
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* 특산물 설정 */}
              <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <label className="text-sm font-medium">특산물 설정</label>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isSpecialty}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isSpecialty: e.target.checked,
                          specialtyId: e.target.checked ? formData.specialtyId : '',
                          regionId: e.target.checked ? formData.regionId : '',
                        })
                      }
                      className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500/50"
                    />
                    <span className="text-sm">이 상품을 특산물로 등록</span>
                  </label>

                  {formData.isSpecialty && (
                    <>
                      <div>
                        <label className="block text-xs font-medium mb-1 text-zinc-400">
                          생산 지역
                        </label>
                        <select
                          value={formData.regionId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              regionId: e.target.value,
                              specialtyId: '', // 지역 변경 시 특산물 초기화
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 text-sm"
                        >
                          <option value="">지역 선택</option>
                          {koreaRegions.map((region) => (
                            <option key={region.id} value={region.id}>
                              {region.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {formData.regionId && availableSpecialties.length > 0 && (
                        <div>
                          <label className="block text-xs font-medium mb-1 text-zinc-400">
                            특산물 종류
                          </label>
                          <select
                            value={formData.specialtyId}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                specialtyId: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 text-sm"
                          >
                            <option value="">특산물 선택 (선택사항)</option>
                            {availableSpecialties.map((specialty) => (
                              <option key={specialty.id} value={specialty.id}>
                                {specialty.name}
                                {specialty.subRegion && ` (${specialty.subRegion})`}
                              </option>
                            ))}
                          </select>
                          <p className="text-xs text-zinc-500 mt-1">
                            특산물을 선택하지 않으면 일반 특산물로 등록됩니다.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
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
