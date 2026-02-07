'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { CountryCode } from '@/types/country';
import { getRegionsByCountry } from '@/data/country-regions';
import { getSpecialtiesByRegion, getSpecialtyName } from '@/data/country-specialties';
import { useI18n } from '@/store/i18n';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface CountryMapLeafletProps {
  countryCode: CountryCode;
  selectedRegionId?: string | null;
  onRegionSelect?: (region: { id: string }) => void;
}

export function CountryMapLeaflet({ countryCode, selectedRegionId, onRegionSelect }: CountryMapLeafletProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const { locale } = useI18n();

  useEffect(() => {
    const regions = getRegionsByCountry(countryCode);
    if (!containerRef.current || regions.length === 0) return;

    // 기존 맵 제거
    if (mapRef.current) {
      try { mapRef.current.remove(); } catch {}
      mapRef.current = null;
    }

    const container = containerRef.current;
    const avgLat = regions.reduce((acc, r) => acc + (r.latitude || 0), 0) / regions.length;
    const avgLng = regions.reduce((acc, r) => acc + (r.longitude || 0), 0) / regions.length;
    const center: [number, number] = [avgLat || 36.5, avgLng || 127.5];

    const map = L.map(container, {
      center,
      zoom: 5,
      scrollWheelZoom: true,
      preferCanvas: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
      minZoom: 3,
    }).addTo(map);

    mapRef.current = map;

    const controlRoot = container.querySelector('.leaflet-control-container') as HTMLElement | null;
    if (controlRoot) {
      controlRoot.setAttribute('role', 'group');
      controlRoot.setAttribute('aria-label', 'map controls');
      const zoomInEl = container.querySelector('.leaflet-control-zoom-in') as HTMLElement | null;
      const zoomOutEl = container.querySelector('.leaflet-control-zoom-out') as HTMLElement | null;
      if (zoomInEl) {
        zoomInEl.setAttribute('tabindex', '0');
        zoomInEl.setAttribute('role', 'button');
        zoomInEl.setAttribute('aria-label', 'Zoom in');
      }
      if (zoomOutEl) {
        zoomOutEl.setAttribute('tabindex', '0');
        zoomOutEl.setAttribute('role', 'button');
        zoomOutEl.setAttribute('aria-label', 'Zoom out');
      }
      const focusables = Array.from(controlRoot.querySelectorAll('a,button,[tabindex]')) as HTMLElement[];
      const handleKeyDown = (e: KeyboardEvent) => {
        if (focusables.length === 0) return;
        if (e.key === 'Tab') {
          e.preventDefault();
          const active = document.activeElement as HTMLElement | null;
          const idx = active ? focusables.indexOf(active) : -1;
          const nextIdx = e.shiftKey ? (idx <= 0 ? focusables.length - 1 : idx - 1) : (idx === -1 ? 0 : (idx + 1) % focusables.length);
          focusables[nextIdx]?.focus();
        }
        if (e.key === ' ' || e.key === 'Enter') {
          const active = document.activeElement as HTMLElement | null;
          active?.click();
          e.preventDefault();
        }
      };
      controlRoot.addEventListener('keydown', handleKeyDown);
      (map as any).__controlKeyHandler = handleKeyDown;
    }

    // 마커 생성
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    regions.forEach((region) => {
      const position: [number, number] = [
        region.latitude || center[0],
        region.longitude || center[1],
      ];

      const specialties = getSpecialtiesByRegion(region.id, countryCode);
      const topSpecialties = specialties.slice(0, 5);

      let popupContent = `
        <div style="min-width: 260px; max-width: 320px; padding: 12px; background: #18181b; border-radius: 12px;">
          <div style="font-size: 14px; font-weight: 700; color: #e5e7eb; margin-bottom: 8px;">
            ${region.nameLocalized[locale] || region.name}
          </div>
      `;

      if (topSpecialties.length > 0) {
        popupContent += `<div style="display:flex; flex-wrap:wrap; gap:6px;">`;
        topSpecialties.forEach((s) => {
          const name = getSpecialtyName(s, locale);
          popupContent += `
            <div style="
              padding: 4px 8px;
              background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(217,119,6,0.15));
              border: 1px solid rgba(251,191,36,0.3);
              border-radius: 6px;
              font-size: 12px;
              color: #fbbf24;
              font-weight: 600;
            ">
              ${name}
            </div>
          `;
        });
        if (specialties.length > topSpecialties.length) {
          popupContent += `
            <div style="padding:4px 8px; background: rgba(63,63,70,0.3); border-radius:6px; font-size:12px; color:#71717a;">
              +${specialties.length - topSpecialties.length}개 더
            </div>
          `;
        }
        popupContent += `</div>`;
      } else {
        popupContent += `
          <div style="font-size:12px; color:#a1a1aa;">
            특산물 데이터가 없습니다.
          </div>
        `;
      }
      popupContent += `
        <div style="margin-top:10px; display:flex; gap:8px;">
          <a href="/map?country=${countryCode}&region=${region.id}&view=list" style="
            padding:6px 10px; border-radius:8px; font-size:12px; 
            background: rgba(251, 191, 36, 0.2); color:#fbbf24; border:1px solid rgba(251,191,36,0.3);
            text-decoration:none; font-weight:600;
          ">상품 보기</a>
          <a href="/map?country=${countryCode}&region=${region.id}" style="
            padding:6px 10px; border-radius:8px; font-size:12px; 
            background: rgba(63,63,70,0.5); color:#e5e7eb; border:1px solid rgba(113,113,122,0.4);
            text-decoration:none; font-weight:600;
          ">바로 구매</a>
        </div>
      </div>`;

      const marker = L.marker(position);
      marker.bindPopup(popupContent);
      marker.on('click', () => {
        onRegionSelect?.({ id: region.id });
      });
      marker.addTo(map);
      markersRef.current.push(marker);
    });

    // 선택된 지역으로 포커스
    if (selectedRegionId) {
      const region = regions.find((r) => r.id === selectedRegionId);
      if (region) {
        map.setView([region.latitude || center[0], region.longitude || center[1]], 6);
      }
    }

    return () => {
      try {
        markersRef.current.forEach((m) => map.removeLayer(m));
        markersRef.current = [];
        const controlRoot = container.querySelector('.leaflet-control-container') as HTMLElement | null;
        const handler = (map as any).__controlKeyHandler as ((e: KeyboardEvent) => void) | undefined;
        if (controlRoot && handler) {
          controlRoot.removeEventListener('keydown', handler);
        }
        map.remove();
      } catch {}
      mapRef.current = null;
    };
  }, [countryCode, selectedRegionId, locale]);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div ref={containerRef} className="relative w-full aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl" />
      <div className="absolute inset-0 pointer-events-none rounded-3xl bg-gradient-to-br from-amber-900/10 via-transparent to-emerald-900/10" />
      <div className="absolute inset-0 pointer-events-none rounded-3xl shimmer-animation bg-gradient-to-r from-transparent via-amber-500/5 to-transparent" />
    </div>
  );
}
