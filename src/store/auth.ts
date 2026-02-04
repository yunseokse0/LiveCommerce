import { create } from 'zustand';
import type { User } from '@/types/auth';
import { getCurrentUser, onAuthStateChange } from '@/lib/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialized: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  initialize: async () => {
    if (useAuth.getState().initialized) return;
    
    set({ loading: true });
    
    try {
      const user = await getCurrentUser();
      set({ user, loading: false, initialized: true });
      
      // 인증 상태 변경 감지
      onAuthStateChange((user) => {
        set({ user });
      });
    } catch (error) {
      console.error('인증 초기화 오류:', error);
      set({ user: null, loading: false, initialized: true });
    }
  },
}));
