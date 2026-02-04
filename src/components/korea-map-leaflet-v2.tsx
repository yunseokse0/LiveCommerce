'use client';

import { useState, useEffect, useRef } from 'react';
import { useLiveRanking } from '@/store/live-ranking';
import { koreaRegions } from '@/data/korea-regions';
import { getSpecialtiesByRegion } from '@/data/region-specialties';
import type { Region } from '@/types/region';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet 아이콘 설정
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface KoreaMapLeafletProps {
  onRegionSelect?: (region: Region) => void;
  selectedRegionId?: string;
}

// 커스텀 마커 아이콘 생성 함수
function createCustomIcon(isSelected: boolean, isHovered: boolean, liveCount: number) {
  const size = isSelected || isHovered ? 40 : 32;
  const color = isSelected ? '#fbbf24' : isHovered ? '#f59e0b' : '#71717a';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: linear-gradient(135deg, ${color}, ${color}dd);
        border: 2px solid rgba(251, 191, 36, 0.5);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 20px rgba(251, 191, 36, 0.5);
        position: relative;
      ">
        ${liveCount > 0 ? `
          <div style="
            position: absolute;
            top: -4px;
            right: -4px;
            width: 18px;
            height: 18px;
            background: #ef4444;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #000;
            font-size: 10px;
            font-weight: bold;
            color: white;
          ">${liveCount}</div>
        ` : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// 현재 계절 계산 함수
function getCurrentSeason(): '봄' | '여름' | '가을' | '겨울' {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 3 && month <= 5) return '봄';
  if (month >= 6 && month <= 8) return '여름';
  if (month >= 9 && month <= 11) return '가을';
  return '겨울';
}

export function KoreaMapLeaflet({ onRegionSelect, selectedRegionId }: KoreaMapLeafletProps) {
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [regionLiveCounts, setRegionLiveCounts] = useState<Record<string, number>>({});
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const { liveList } = useLiveRanking();

  // 지역별 라이브 방송 수 계산
  useEffect(() => {
    const counts: Record<string, number> = {};
    koreaRegions.forEach((region) => {
      const hash = region.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      counts[region.id] = hash % 5;
    });
    setRegionLiveCounts(counts);
  }, []);

  // 맵 초기화
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const container = containerRef.current;
    
    // 이미 맵이 초기화되어 있는지 확인
    if ((container as any)._leaflet_id) {
      return;
    }

    // 한국 중심 좌표
    const center: [number, number] = [36.5, 127.5];
    const zoom = 7;

    // 맵 생성
    const map = L.map(container, {
      center,
      zoom,
      scrollWheelZoom: true,
      preferCanvas: false,
    });

    // 타일 레이어 추가
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      minZoom: 5,
    }).addTo(map);

    mapRef.current = map;

    // 마커 생성 함수
    const createMarkers = () => {
      // 기존 마커 제거
      markersRef.current.forEach((marker) => {
        map.removeLayer(marker);
      });
      markersRef.current = [];

      koreaRegions.forEach((region) => {
        const isSelected = selectedRegionId === region.id;
        const isHovered = hoveredRegionId === region.id;
        const liveCount = regionLiveCounts[region.id] || 0;
        const specialties = getSpecialtiesByRegion(region.id);
        const landmarkSpecialties = specialties.filter((s) => s.isLandmark);

        const position: [number, number] = [
          region.latitude || 36.5,
          region.longitude || 127.5,
        ];

        const icon = createCustomIcon(isSelected, isHovered, liveCount);
        const marker = L.marker(position, { icon });

        // 팝업 내용 생성 (더 명확하고 보기 좋게)
        const allSpecialties = getSpecialtiesByRegion(region.id);
        const currentSeason = getCurrentSeason();
        const seasonalSpecialties = allSpecialties.filter(s => 
          s.seasons.includes(currentSeason) || s.seasons.includes('연중')
        );

        let popupContent = `
          <div style="min-width: 280px; max-width: 320px; padding: 16px; background: #18181b; border-radius: 12px;">
            <!-- 지역명 헤더 -->
            <div style="font-size: 20px; font-weight: bold; color: #fbbf24; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span>📍</span>
              <span>${region.name}</span>
            </div>
        `;

        // 현재 계절 특산물
        if (seasonalSpecialties.length > 0) {
          popupContent += `
            <div style="margin-bottom: 12px;">
              <div style="font-size: 13px; font-weight: 600; color: #d4d4d8; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                <span>🍃</span>
                <span>${currentSeason} 제철 특산물</span>
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          `;
          seasonalSpecialties.slice(0, 5).forEach((specialty) => {
            const isLandmark = specialty.isLandmark ? '⭐' : '';
            popupContent += `
              <div style="
                padding: 4px 8px; 
                background: ${specialty.isLandmark ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(217, 119, 6, 0.2))' : 'rgba(63, 63, 70, 0.5)'}; 
                border: 1px solid ${specialty.isLandmark ? 'rgba(251, 191, 36, 0.3)' : 'rgba(113, 113, 122, 0.3)'};
                border-radius: 6px;
                font-size: 12px;
                color: ${specialty.isLandmark ? '#fbbf24' : '#a1a1aa'};
                font-weight: ${specialty.isLandmark ? '600' : '400'};
              ">
                ${isLandmark}${specialty.name}${specialty.subRegion ? ` (${specialty.subRegion})` : ''}
              </div>
            `;
          });
          if (seasonalSpecialties.length > 5) {
            popupContent += `
              <div style="padding: 4px 8px; background: rgba(63, 63, 70, 0.3); border-radius: 6px; font-size: 12px; color: #71717a;">
                +${seasonalSpecialties.length - 5}개 더
              </div>
            `;
          }
          popupContent += `</div></div>`;
        }

        // 랜드마크 특산물 (현재 계절이 아닌 경우)
        if (landmarkSpecialties.length > 0 && landmarkSpecialties.filter(s => 
          !seasonalSpecialties.some(ss => ss.id === s.id)
        ).length > 0) {
          const otherLandmarks = landmarkSpecialties.filter(s => 
            !seasonalSpecialties.some(ss => ss.id === s.id)
          );
          popupContent += `
            <div style="margin-bottom: 12px;">
              <div style="font-size: 13px; font-weight: 600; color: #d4d4d8; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
                <span>⭐</span>
                <span>랜드마크 특산물</span>
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          `;
          otherLandmarks.slice(0, 3).forEach((specialty) => {
            popupContent += `
              <div style="
                padding: 4px 8px; 
                background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(217, 119, 6, 0.2)); 
                border: 1px solid rgba(251, 191, 36, 0.3);
                border-radius: 6px;
                font-size: 12px;
                color: #fbbf24;
                font-weight: 600;
              ">
                ${specialty.name}${specialty.subRegion ? ` (${specialty.subRegion})` : ''}
              </div>
            `;
          });
          popupContent += `</div></div>`;
        }

        // 라이브 방송 정보
        if (liveCount > 0) {
          popupContent += `
            <div style="
              padding: 8px 12px; 
              background: rgba(239, 68, 68, 0.1); 
              border: 1px solid rgba(239, 68, 68, 0.3);
              border-radius: 8px;
              margin-bottom: 12px;
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              <span style="font-size: 16px;">🔴</span>
              <span style="font-size: 13px; color: #f87171; font-weight: 600;">
                ${liveCount}개 라이브 방송 중
              </span>
            </div>
          `;
        }

        // 자세히 보기 버튼
        popupContent += `
          <div style="
            padding: 8px 12px; 
            background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(217, 119, 6, 0.2)); 
            border: 1px solid rgba(251, 191, 36, 0.5);
            border-radius: 8px;
            text-align: center;
            font-size: 13px;
            color: #fbbf24;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          " onmouseover="this.style.background='linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(217, 119, 6, 0.3))'" onmouseout="this.style.background='linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(217, 119, 6, 0.2))'">
            👆 클릭하여 자세히 보기
          </div>
        `;

        popupContent += `</div>`;

        // 팝업 옵션 설정 (더 큰 크기, 더 나은 스타일)
        marker.bindPopup(popupContent, {
          maxWidth: 320,
          className: 'custom-popup',
          closeButton: true,
          autoPan: true,
          autoPanPadding: [20, 20],
        });
        
        // 이벤트 핸들러
        marker.on('click', () => {
          onRegionSelect?.(region);
        });

        marker.on('mouseover', () => {
          setHoveredRegionId(region.id);
        });

        marker.on('mouseout', () => {
          setHoveredRegionId(null);
        });

        marker.addTo(map);
        markersRef.current.push(marker);
      });
    };

    // 초기 마커 생성
    createMarkers();

    // cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        // 컨테이너의 leaflet_id 제거
        if ((container as any)._leaflet_id) {
          delete (container as any)._leaflet_id;
        }
      }
    };
  }, []); // 초기화는 한 번만

  // 선택된 지역이나 호버 상태 변경 시 마커 업데이트
  useEffect(() => {
    if (!mapRef.current || markersRef.current.length === 0) return;

    // 마커와 지역을 매칭하여 업데이트
    koreaRegions.forEach((region, index) => {
      const marker = markersRef.current[index];
      if (!marker) return;

      const isSelected = selectedRegionId === region.id;
      const isHovered = hoveredRegionId === region.id;
      const liveCount = regionLiveCounts[region.id] || 0;

      const icon = createCustomIcon(isSelected, isHovered, liveCount);
      marker.setIcon(icon);
    });
  }, [selectedRegionId, hoveredRegionId, regionLiveCounts]);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div 
        ref={containerRef}
        className="relative w-full aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl"
        style={{ background: '#1a1a1a' }}
      />
      
      {/* 커스텀 스타일 오버레이 */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl bg-gradient-to-br from-amber-900/10 via-transparent to-emerald-900/10" />
      <div className="absolute inset-0 pointer-events-none rounded-3xl shimmer-animation bg-gradient-to-r from-transparent via-amber-500/5 to-transparent" />
    </div>
  );
}
