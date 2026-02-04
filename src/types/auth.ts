export interface User {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  provider?: 'google' | 'facebook' | 'kakao' | 'email';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}
