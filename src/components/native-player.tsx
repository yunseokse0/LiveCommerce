'use client';

import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface NativePlayerProps {
  hlsUrl: string;
  autoplay?: boolean;
  controls?: boolean;
  className?: string;
}

/**
 * Video.js 기반 자체 플랫폼 플레이어
 * HLS 스트림 재생 지원
 */
export function NativePlayer({
  hlsUrl,
  autoplay = true,
  controls = true,
  className = '',
}: NativePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    // Video.js 플레이어 초기화
    const player = videojs(videoRef.current, {
      autoplay,
      controls,
      responsive: true,
      fluid: true,
      fill: true,
      playbackRates: [0.5, 1, 1.25, 1.5, 2],
      html5: {
        vhs: {
          overrideNative: true,
        },
        nativeVideoTracks: false,
        nativeAudioTracks: false,
        nativeTextTracks: false,
      },
      sources: [
        {
          src: hlsUrl,
          type: 'application/x-mpegURL',
        },
      ],
      // 다크 모드 테마
      techOrder: ['html5'],
    });

    playerRef.current = player;

    // 에러 핸들링
    player.on('error', () => {
      const error = player.error();
      if (error) {
        console.error('[NativePlayer] Video.js error:', error);
      }
    });

    // 로딩 상태
    player.on('loadstart', () => {
      console.log('[NativePlayer] Loading started');
    });

    player.on('canplay', () => {
      console.log('[NativePlayer] Can play');
    });

    // 정리 함수
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [hlsUrl, autoplay, controls]);

  // HLS URL 변경 시 소스 업데이트
  useEffect(() => {
    if (playerRef.current && hlsUrl) {
      playerRef.current.src({
        src: hlsUrl,
        type: 'application/x-mpegURL',
      });
    }
  }, [hlsUrl]);

  return (
    <div className={`native-player-wrapper ${className}`}>
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered vjs-default-skin"
          playsInline
        />
      </div>
    </div>
  );
}
