/**
 * 전역 필터 상태 관리 (Zustand)
 * 페이지 간 필터 상태 유지
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FilterState {
  selectedRegion: string | null;
  selectedCategory: string | null;
  searchQuery: string | null;
  setRegion: (region: string | null) => void;
  setCategory: (category: string | null) => void;
  setSearchQuery: (query: string | null) => void;
  clearFilters: () => void;
}

export const useFilters = create<FilterState>()(
  persist(
    (set) => ({
      selectedRegion: null,
      selectedCategory: null,
      searchQuery: null,

      setRegion: (region) => set({ selectedRegion: region }),
      setCategory: (category) => set({ selectedCategory: category }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      clearFilters: () =>
        set({
          selectedRegion: null,
          selectedCategory: null,
          searchQuery: null,
        }),
    }),
    {
      name: 'filters-storage',
    }
  )
);
