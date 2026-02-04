import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase 환경 변수 확인
const hasSupabaseConfig = 
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' && 
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'string' && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// 개발 환경에서만 경고 표시
if (process.env.NODE_ENV === 'development' && !hasSupabaseConfig) {
  console.warn('⚠️ Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.');
  console.warn('⚠️ 프론트엔드 UI만 확인하려면 이 상태로도 작동합니다.');
}

// Supabase 클라이언트 생성 (환경 변수가 없어도 에러 없이 생성)
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
