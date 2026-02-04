'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Star, X, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/store/auth';
import Image from 'next/image';

interface ReviewFormProps {
  productId: string;
  orderItemId?: string;
  orderId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ productId, orderItemId, orderId, onSuccess, onCancel }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageInput, setImageInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm text-center">
        <p className="text-zinc-400">리뷰를 작성하려면 로그인이 필요합니다.</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rating || !content.trim()) {
      alert('평점과 리뷰 내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          userId: user.id,
          orderId,
          orderItemId,
          rating,
          title: title.trim() || undefined,
          content: content.trim(),
          images: images.filter(Boolean),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '리뷰 작성 실패');
      }

      // 폼 초기화
      setRating(0);
      setTitle('');
      setContent('');
      setImages([]);
      setImageInput('');

      onSuccess?.();
    } catch (error: any) {
      console.error('리뷰 작성 오류:', error);
      alert(error.message || '리뷰를 작성할 수 없습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addImage = () => {
    if (imageInput.trim() && !images.includes(imageInput.trim())) {
      setImages([...images, imageInput.trim()]);
      setImageInput('');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      setUploadingImages((prev) => [...prev, tempId]);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'reviews');

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success && data.url) {
          setImages((prev) => [...prev, data.url]);
        } else {
          throw new Error(data.error || '업로드 실패');
        }
      } catch (error: any) {
        console.error('이미지 업로드 오류:', error);
        alert(`이미지 업로드 실패: ${error.message || '알 수 없는 오류'}`);
      } finally {
        setUploadingImages((prev) => prev.filter((id) => id !== tempId));
      }
    }

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6 rounded-2xl border border-zinc-800/80 bg-card/50 backdrop-blur-sm space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">리뷰 작성</h3>
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            size="sm"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* 평점 선택 */}
      <div>
        <label className="block text-sm font-medium mb-2">평점 *</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="focus:outline-none"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-none text-zinc-600'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-zinc-400">{rating}점</span>
          )}
        </div>
      </div>

      {/* 리뷰 제목 */}
      <div>
        <label className="block text-sm font-medium mb-2">제목 (선택사항)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="리뷰 제목을 입력하세요"
          maxLength={100}
          className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50"
        />
      </div>

      {/* 리뷰 내용 */}
      <div>
        <label className="block text-sm font-medium mb-2">리뷰 내용 *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="리뷰를 작성해주세요"
          rows={6}
          required
          maxLength={1000}
          className="w-full px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 resize-none"
        />
        <p className="text-xs text-zinc-400 mt-1">{content.length}/1000</p>
      </div>

      {/* 이미지 추가 */}
      <div>
        <label className="block text-sm font-medium mb-2">이미지 (선택사항)</label>
        
        {/* 파일 업로드 */}
        <div className="mb-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="review-image-upload"
          />
          <label
            htmlFor="review-image-upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-zinc-800/80 hover:border-amber-500/50 cursor-pointer transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm">이미지 업로드</span>
          </label>
        </div>

        {/* URL 입력 (대체 방법) */}
        <div className="flex gap-2 mb-2">
          <input
            type="url"
            value={imageInput}
            onChange={(e) => setImageInput(e.target.value)}
            placeholder="또는 이미지 URL 입력"
            className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 text-sm"
          />
          <Button
            type="button"
            onClick={addImage}
            variant="outline"
            size="sm"
            disabled={!imageInput.trim()}
          >
            추가
          </Button>
        </div>

        {/* 업로드 중 표시 */}
        {uploadingImages.length > 0 && (
          <div className="mb-2 flex items-center gap-2 text-sm text-zinc-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>이미지 업로드 중... ({uploadingImages.length})</span>
          </div>
        )}

        {/* 이미지 미리보기 */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {images.map((imageUrl, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-zinc-800 border border-zinc-800/80">
                <Image
                  src={imageUrl}
                  alt={`리뷰 이미지 ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 33vw"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 제출 버튼 */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1"
          >
            취소
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !rating || !content.trim()}
          className="flex-1"
        >
          {isSubmitting ? '작성 중...' : '리뷰 작성'}
        </Button>
      </div>
    </form>
  );
}
