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
      // 데모 모드: 실제 사용자 없으면 로컬 스토리지의 데모 사용자 사용
      let finalUser = user;
      if (!finalUser && typeof window !== 'undefined') {
        const demoMode = window.localStorage.getItem('demoMode') === 'true';
        const demoRole = (window.localStorage.getItem('demoRole') || 'user') as User['role'];
        if (demoMode) {
          finalUser = {
            id: 'demo-user',
            email: 'demo@example.com',
            name: demoRole === 'admin' ? '데모 관리자' : demoRole === 'seller' ? '데모 셀러' : '데모 사용자',
            avatarUrl: undefined,
            provider: 'email',
            isSeller: demoRole === 'seller',
            role: demoRole || 'user',
            createdAt: new Date().toISOString(),
          };
        }
      }
      set({ user: finalUser, loading: false, initialized: true });
      
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
