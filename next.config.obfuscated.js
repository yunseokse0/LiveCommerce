/**
 * 프로덕션 빌드용 Next.js 설정 (코드 난독화 포함)
 * 
 * 사용법:
 * - 개발: npm run dev (기본 next.config.js 사용)
 * - 프로덕션 빌드 (난독화): npm run build:obfuscated
 */

const JavaScriptObfuscator = require('webpack-obfuscator');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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
  // 프로덕션 빌드 시 소스맵 비활성화
  productionBrowserSourceMaps: false,
  // Webpack 설정 (난독화 포함)
  webpack: (config, { isServer, dev }) => {
    // 서버 사이드에서만 사용되는 패키지들을 외부 모듈로 처리
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@ffmpeg-installer/ffmpeg': 'commonjs @ffmpeg-installer/ffmpeg',
        'fluent-ffmpeg': 'commonjs fluent-ffmpeg',
        'node-media-server': 'commonjs node-media-server',
      });
    }
    
    // 프로덕션 빌드이고 클라이언트 사이드인 경우에만 난독화 적용
    if (!dev && !isServer) {
      config.plugins.push(
        new JavaScriptObfuscator(
          {
            // Control Flow Flattening: 코드 흐름 평탄화 (100%)
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 1,
            
            // Dead Code Injection: 더미 코드 삽입
            deadCodeInjection: true,
            deadCodeInjectionThreshold: 0.4,
            
            // Debug Protection: 디버거 보호
            debugProtection: true,
            debugProtectionInterval: 2000,
            
            // String Array: 모든 문자열 Base64 인코딩
            stringArray: true,
            stringArrayThreshold: 1,
            stringArrayEncoding: ['base64'],
            stringArrayIndexShift: true,
            stringArrayRotate: true,
            stringArrayShuffle: true,
            stringArrayWrappersCount: 5,
            stringArrayWrappersChainedCalls: true,
            stringArrayWrappersParametersMaxCount: 5,
            stringArrayWrappersType: 'function',
            
            // Self Defending: 자체 방어 메커니즘
            selfDefending: true,
            
            // Console Output 제거
            disableConsoleOutput: true,
            
            // 기타 옵션
            compact: true,
            simplify: true,
            transformObjectKeys: true,
            unicodeEscapeSequence: false,
          },
          ['**/node_modules/**', '**/\.next/**']
        )
      );
    }
    
    return config;
  },
  serverExternalPackages: ['@ffmpeg-installer/ffmpeg', 'fluent-ffmpeg', 'node-media-server'],
};

module.exports = nextConfig;
