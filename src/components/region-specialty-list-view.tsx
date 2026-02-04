'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Calendar, MapPin, Filter } from 'lucide-react';
import { getSpecialtiesByRegion, getAllSpecialties, type Specialty, type Season } from '@/data/region-specialties';
import { cn } from '@/lib/utils';

interface RegionSpecialtyListViewProps {
  regionId?: string; // 선택적으로 변경
}

const seasonColors: Record<Season, string> = {
  봄: 'bg-green-500/20 text-green-400 border-green-500/30',
  여름: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  가을: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  겨울: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  연중: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
};

const categoryIcons: Record<Specialty['category'], string> = {
  과일: '🍎',
  채소: '🥬',
  수산물: '🐟',
  축산물: '🥩',
  가공식품: '🍯',
  곡물: '🌾',
  버섯: '🍄',
  기타: '🌿',
};

export function RegionSpecialtyListView({ regionId }: RegionSpecialtyListViewProps) {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | '전체'>('전체');
  const [selectedCategory, setSelectedCategory] = useState<Specialty['category'] | '전체'>('전체');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // regionId가 없으면 전체 특산물, 있으면 해당 지역 특산물
    const allSpecialties = regionId 
      ? getSpecialtiesByRegion(regionId)
      : getAllSpecialties();
    
    let filtered = allSpecialties;
    
    if (selectedSeason !== '전체') {
      filtered = filtered.filter(
        (s) => s.seasons.includes(selectedSeason) || s.seasons.includes('연중')
      );
    }
    
    if (selectedCategory !== '전체') {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }
    
    setSpecialties(filtered);
    setIsLoading(false);
  }, [regionId, selectedSeason, selectedCategory]);

  const allSeasons: (Season | '전체')[] = ['전체', '봄', '여름', '가을', '겨울', '연중'];
  const allCategories: (Specialty['category'] | '전체')[] = [
    '전체',
    '과일',
    '채소',
    '수산물',
    '축산물',
    '가공식품',
    '곡물',
    '버섯',
    '기타',
  ];

  if (isLoading) {
    return (
      <div className="text-center py-8 text-zinc-400">
        <div className="inline-block w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-2" />
        <div>특산물 정보를 불러오는 중...</div>
      </div>
    );
  }

  if (specialties.length === 0) {
    return (
      <div className="text-center py-12 rounded-2xl border border-zinc-800/80 bg-card/50">
        <Sparkles className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
        <p className="text-zinc-400">등록된 특산물이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 필터 */}
      <div className="space-y-3">
        {/* 계절 필터 */}
        <div>
          <label className="block text-sm font-medium mb-2 text-zinc-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            계절별
          </label>
          <div className="flex flex-wrap gap-2">
            {allSeasons.map((season) => (
              <button
                key={season}
                onClick={() => setSelectedSeason(season)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  selectedSeason === season
                    ? season === '전체'
                      ? 'bg-amber-500 text-black'
                      : seasonColors[season as Season]
                    : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700'
                )}
              >
                {season}
              </button>
            ))}
          </div>
        </div>

        {/* 카테고리 필터 */}
        <div>
          <label className="block text-sm font-medium mb-2 text-zinc-400 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            카테고리
          </label>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  selectedCategory === category
                    ? category === '전체'
                      ? 'bg-amber-500 text-black'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700'
                )}
              >
                {category !== '전체' && (
                  <span className="mr-1">{categoryIcons[category as Specialty['category']]}</span>
                )}
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 특산물 리스트 */}
      <div className="space-y-2 sm:space-y-3">
        {specialties.map((specialty) => (
          <div
            key={specialty.id}
            className="group relative p-3 sm:p-4 rounded-lg sm:rounded-xl border border-zinc-800/80 bg-card/50 hover:bg-card/70 transition-all duration-300 hover:border-amber-500/50"
          >
            <div className="flex items-start gap-3 sm:gap-4">
              {/* 아이콘 */}
              <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/20 border border-amber-500/30 flex items-center justify-center text-2xl sm:text-3xl">
                {categoryIcons[specialty.category]}
              </div>

              {/* 내용 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base sm:text-lg font-bold">
                      {specialty.name}
                    </h4>
                    {specialty.isLandmark && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/30 to-amber-700/30 border border-amber-500/50">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span className="text-xs text-amber-300 font-medium">랜드마크</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 세부 지역 */}
                {specialty.subRegion && (
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-zinc-400 mb-1.5">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span>{specialty.subRegion}</span>
                  </div>
                )}

                {/* 설명 */}
                {specialty.description && (
                  <p className="text-xs sm:text-sm text-zinc-400 mb-2 line-clamp-1">
                    {specialty.description}
                  </p>
                )}

                {/* 계절 태그 */}
                <div className="flex flex-wrap gap-1.5">
                  {specialty.seasons.map((season) => (
                    <span
                      key={season}
                      className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium border',
                        seasonColors[season]
                      )}
                    >
                      {season}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-zinc-700/30 text-zinc-400 border border-zinc-700/50">
                    {specialty.category}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
