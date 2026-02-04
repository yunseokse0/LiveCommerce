import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const envStatus = {
    youtube: {
      apiKey: !!process.env.YOUTUBE_API_KEY,
    },
    supabase: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  };

  return NextResponse.json({
    success: true,
    envStatus,
    timestamp: new Date().toISOString(),
  });
}
