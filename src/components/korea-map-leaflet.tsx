'use client';

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useLiveRanking } from '@/store/live-ranking';
import { koreaRegions } from '@/data/korea-regions';
import { getSpecialtiesByRegion } from '@/data/region-specialties';
import type { Region } from '@/types/region';
import { Sparkles, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet 맵 인스턴스 추적 (중복 초기화 방지)
// 컨테이너 ID 기반으로 관리하여 더 안정적인 추적
const mapInstances = new Map<string, L.Map>();
const initializedContainerIds = new Set<string>();

// Leaflet 아이콘 설정 (기본 마커 아이콘 문제 해결)
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

// 지도 중심 조정 컴포넌트
function MapCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [map, center]);
  return null;
}


export function KoreaMapLeaflet({ onRegionSelect, selectedRegionId }: KoreaMapLeafletProps) {
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [regionLiveCounts, setRegionLiveCounts] = useState<Record<string, number>>({});
  const [isMounted, setIsMounted] = useState(false);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // 컴포넌트 인스턴스별 고유 ID 생성 (리렌더링 시에도 유지)
  const mapContainerIdRef = useRef<string>(`map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const isInitializedRef = useRef(false);
  const { liveList } = useLiveRanking();

  // 클라이언트에서만 실행되도록 useEffect 사용
  useEffect(() => {
    // 즉시 마운트 상태 설정
    setIsMounted(true);
    
    // 지역별 라이브 방송 수 계산 (프론트엔드 확인용 고정값)
    const counts: Record<string, number> = {};
    koreaRegions.forEach((region) => {
      // 지역 ID를 기반으로 일관된 값 생성 (Hydration 에러 방지)
      const hash = region.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      counts[region.id] = hash % 5; // 0-4 사이의 고정값
    });
    setRegionLiveCounts(counts);
  }, []);

  // cleanup: 맵 인스턴스 제거
  useEffect(() => {
    const containerId = mapContainerIdRef.current;
    
    return () => {
      // 맵 인스턴스 정리
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // 이미 제거된 경우 무시
        }
        mapInstanceRef.current = null;
      }
      
      // 전역 맵 인스턴스 정리
      if (mapInstances.has(containerId)) {
        const map = mapInstances.get(containerId);
        if (map) {
          try {
            map.remove();
          } catch (e) {
            // 이미 제거된 경우 무시
          }
          mapInstances.delete(containerId);
        }
      }
      
      // 초기화 상태 리셋
      initializedContainerIds.delete(containerId);
      isInitializedRef.current = false;
    };
  }, []);

  // 지역별 라이브 방송 수 계산
  const getRegionLiveCount = (regionId: string) => {
    return regionLiveCounts[regionId] || 0;
  };

  const handleRegionClick = (region: Region) => {
    onRegionSelect?.(region);
  };

  // 한국 중심 좌표
  const center: [number, number] = [36.5, 127.5];
  const zoom = 7;

  // 맵이 이미 초기화되었는지 확인
  const containerId = mapContainerIdRef.current;
  const shouldRenderMap = isMounted && !isInitializedRef.current && !initializedContainerIds.has(containerId);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* 한국 지도 Leaflet 컨테이너 */}
      <div 
        ref={containerRef}
        id={containerId}
        className="relative w-full aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl"
      >
        {shouldRenderMap && (
          <MapContainer
            key={containerId} // 고유한 key로 재생성 방지
            center={center}
            zoom={zoom}
            scrollWheelZoom={true}
            className="w-full h-full rounded-3xl"
            style={{ background: '#1a1a1a' }}
            preferCanvas={false} // 성능 최적화
            whenReady={() => {
              // 맵 인스턴스 저장 (한 번만 실행되도록 보장)
              const currentContainerId = mapContainerIdRef.current;
              if (!isInitializedRef.current && !initializedContainerIds.has(currentContainerId)) {
                // whenReady는 맵 인스턴스를 직접 전달하지 않으므로 ref를 통해 접근
                // 이 파일은 더 이상 사용되지 않으므로 빈 함수로 처리
                initializedContainerIds.add(currentContainerId);
                isInitializedRef.current = true;
              }
            }}
          >
          {/* 다크 모드 타일 레이어 - 로딩 최적화 */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="dark-mode-tiles"
            maxZoom={19}
            minZoom={5}
            maxNativeZoom={18}
            tileSize={256}
            zoomOffset={0}
            updateWhenZooming={false}
            updateWhenIdle={true}
            keepBuffer={2}
          />
          
          {/* 지역 마커들 */}
          {koreaRegions.map((region) => {
            const isSelected = selectedRegionId === region.id;
            const isHovered = hoveredRegionId === region.id;
            const liveCount = getRegionLiveCount(region.id);
            const specialties = getSpecialtiesByRegion(region.id);
            const landmarkSpecialties = specialties.filter((s) => s.isLandmark);
            
            // 지역 좌표 (실제 위도/경도 사용)
            const position: [number, number] = [
              region.latitude || 36.5,
              region.longitude || 127.5,
            ];

            return (
              <Marker
                key={region.id}
                position={position}
                icon={createCustomIcon(isSelected, isHovered, liveCount)}
                eventHandlers={{
                  click: () => handleRegionClick(region),
                  mouseover: () => setHoveredRegionId(region.id),
                  mouseout: () => setHoveredRegionId(null),
                }}
              >
                <Popup className="custom-popup" maxWidth={250}>
                  <div className="p-3 min-w-[200px]">
                    <div className="text-base font-bold text-amber-300 mb-2">
                      {region.name}
                    </div>
                    {landmarkSpecialties.length > 0 && (
                      <div className="space-y-1 mb-2">
                        <div className="text-xs font-semibold text-zinc-300 mb-1">
                          랜드마크 특산물
                        </div>
                        {landmarkSpecialties.slice(0, 3).map((specialty) => (
                          <div key={specialty.id} className="text-xs text-zinc-400 flex items-center gap-1">
                            <span className="text-amber-400">•</span>
                            <span>{specialty.name}</span>
                            {specialty.subRegion && (
                              <span className="text-zinc-500">({specialty.subRegion})</span>
                            )}
                          </div>
                        ))}
                        {landmarkSpecialties.length > 3 && (
                          <div className="text-xs text-zinc-500">
                            +{landmarkSpecialties.length - 3}개 더
                          </div>
                        )}
                      </div>
                    )}
                    {liveCount > 0 && (
                      <div className="text-xs text-red-400 font-semibold pt-2 border-t border-zinc-700">
                        🔴 {liveCount}개 방송 중
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
          </MapContainer>
        )}
        
        {/* 커스텀 스타일 오버레이 */}
        <div className="absolute inset-0 pointer-events-none rounded-3xl bg-gradient-to-br from-amber-900/10 via-transparent to-emerald-900/10" />
        <div className="absolute inset-0 pointer-events-none rounded-3xl shimmer-animation bg-gradient-to-r from-transparent via-amber-500/5 to-transparent" />
      </div>
    </div>
  );
}
