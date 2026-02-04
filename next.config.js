/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Netlify 호환성을 위한 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: '**.youtube.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Turbopack 설정 (Next.js 16 기본)
  turbopack: {},
  // Webpack 설정 (Turbopack 비활성화 시 사용)
  webpack: (config, { isServer }) => {
    // 서버 사이드에서만 사용되는 패키지들을 외부 모듈로 처리
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@ffmpeg-installer/ffmpeg': 'commonjs @ffmpeg-installer/ffmpeg',
        'fluent-ffmpeg': 'commonjs fluent-ffmpeg',
        'node-media-server': 'commonjs node-media-server',
      });
    }
    return config;
  },
}

module.exports = nextConfig
