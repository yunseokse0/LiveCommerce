'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { mockProducts } from '@/data/mock-products';
import { useLiveRanking } from '@/store/live-ranking';
import { useTranslation } from '@/hooks/use-translation';

interface SearchResult {
  type: 'product' | 'creator' | 'region';
  id: string;
  title: string;
  subtitle?: string;
  link: string;
}

const MAX_RECENT_SEARCHES = 10;
const STORAGE_KEY = 'recent-searches';

export function GlobalSearch() {
  const { t } = useTranslation();
  const router = useRouter();
  const { liveList } = useLiveRanking();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularSearches] = useState([
    '강원도 옥수수',
    '제주 감귤',
    '전라도 수박',
    '경상도 사과',
  ]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 최근 검색어 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch {
          setRecentSearches([]);
        }
      }
    }
  }, []);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      inputRef.current?.focus();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 검색 실행
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // 상품 검색
    mockProducts
      .filter((product) => {
        const nameMatch = product.name.toLowerCase().includes(searchTerm);
        const descMatch = product.description?.toLowerCase().includes(searchTerm);
        const categoryMatch = product.category?.toLowerCase().includes(searchTerm);
        return nameMatch || descMatch || categoryMatch;
      })
      .slice(0, 5)
      .forEach((product) => {
        searchResults.push({
          type: 'product',
          id: product.id,
          title: product.name,
          subtitle: product.category,
          link: `/products/${product.id}`,
        });
      });

    // 크리에이터 검색
    liveList
      .filter((live) => {
        const nameMatch = live.bj.name.toLowerCase().includes(searchTerm);
        const titleMatch = live.title.toLowerCase().includes(searchTerm);
        return nameMatch || titleMatch;
      })
      .slice(0, 3)
      .forEach((live) => {
        searchResults.push({
          type: 'creator',
          id: live.bj.id,
          title: live.bj.name,
          subtitle: live.title,
          link: `/live?stream=${live.bj.id}`,
        });
      });

    // 지역 검색 (간단한 예시)
    const regions = [
      { name: '강원도', id: 'gangwon', link: '/map?region=gangwon' },
      { name: '제주도', id: 'jeju', link: '/map?region=jeju' },
      { name: '전라도', id: 'jeolla', link: '/map?region=jeolla' },
      { name: '경상도', id: 'gyeongsang', link: '/map?region=gyeongsang' },
    ];

    regions
      .filter((region) => region.name.includes(query))
      .forEach((region) => {
        searchResults.push({
          type: 'region',
          id: region.id,
          title: region.name,
          subtitle: '지역별 특산물',
          link: region.link,
        });
      });

    setResults(searchResults);
  }, [query, liveList]);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    // 최근 검색어 저장
    const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(
      0,
      MAX_RECENT_SEARCHES
    );
    setRecentSearches(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    // 검색 결과가 있으면 첫 번째 결과로 이동, 없으면 검색 페이지로
    if (results.length > 0) {
      router.push(results[0].link);
    } else {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'product':
        return t('search.product');
      case 'creator':
        return t('search.creator');
      case 'region':
        return t('search.region');
      default:
        return '';
    }
  };

  return (
    <div className="relative flex-1 max-w-md mx-4" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyPress={handleKeyPress}
          placeholder={t('search.placeholder')}
          className="w-full pl-10 pr-10 py-2 rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 text-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-zinc-800 rounded transition-colors"
            aria-label="지우기"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-zinc-800/80 rounded-xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
          {query ? (
            // 검색 결과
            results.length > 0 ? (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-zinc-400">
                  {t('search.results')} ({results.length})
                </div>
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSearch(result.title)}
                    className="w-full text-left p-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <span className="text-xs px-2 py-0.5 rounded bg-zinc-800/50 text-zinc-400">
                          {getTypeLabel(result.type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm mb-0.5">{result.title}</p>
                        {result.subtitle && (
                          <p className="text-xs text-zinc-400 line-clamp-1">{result.subtitle}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-400">
                <p>{t('search.noResults')}</p>
              </div>
            )
          ) : (
            // 최근 검색어 및 인기 검색어
            <div className="p-4">
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm font-semibold">{t('search.recentSearches')}</span>
                    </div>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-zinc-400 hover:text-zinc-300"
                    >
                      {t('search.clearRecent')}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="px-3 py-1.5 rounded-lg bg-secondary border border-zinc-800/80 text-sm hover:border-amber-500/30 transition-colors"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm font-semibold">{t('search.popularSearches')}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="px-3 py-1.5 rounded-lg bg-secondary border border-zinc-800/80 text-sm hover:border-amber-500/30 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
