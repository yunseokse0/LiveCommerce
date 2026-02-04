export interface User {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  provider?: 'google' | 'facebook' | 'kakao' | 'email';
  isSeller?: boolean; // 셀러 여부
  role?: 'user' | 'admin' | 'seller'; // 사용자 역할
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
