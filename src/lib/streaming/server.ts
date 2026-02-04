/**
 * 자체 스트리밍 서버 (RTMP → HLS)
 * Node Media Server를 사용한 RTMP 수신 및 HLS 변환
 */

import NodeMediaServer from 'node-media-server';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

// FFmpeg 경로 자동 감지
function getFFmpegPath(): string {
  try {
    // 동적 require로 빌드 시 오류 방지
    // @ts-ignore - 동적 require
    const ffmpegInstaller = eval('require')('@ffmpeg-installer/ffmpeg');
    return ffmpegInstaller.path || ffmpegInstaller.ffmpegPath || 'ffmpeg';
  } catch (e) {
    // 시스템에 설치된 FFmpeg 사용
    try {
      execSync('ffmpeg -version', { stdio: 'ignore' });
      return 'ffmpeg';
    } catch {
      console.warn('[Streaming] FFmpeg를 찾을 수 없습니다. 시스템에 FFmpeg를 설치하세요.');
      return 'ffmpeg';
    }
  }
}

// 스트림 저장 경로
const STREAM_OUTPUT_DIR = path.join(process.cwd(), 'public', 'streams');
const HLS_OUTPUT_DIR = path.join(STREAM_OUTPUT_DIR, 'hls');

// 디렉토리 생성
if (!fs.existsSync(STREAM_OUTPUT_DIR)) {
  fs.mkdirSync(STREAM_OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(HLS_OUTPUT_DIR)) {
  fs.mkdirSync(HLS_OUTPUT_DIR, { recursive: true });
}

interface StreamConfig {
  streamKey: string;
  streamId: string;
  creatorId: string;
}

// 활성 스트림 추적
const activeStreams = new Map<string, StreamConfig>();
const ffmpegProcesses = new Map<string, any>();

/**
 * RTMP 스트림을 HLS로 변환
 */
function convertToHLS(streamKey: string, streamId: string) {
  const rtmpUrl = `rtmp://localhost:1935/live/${streamKey}`;
  const hlsPath = path.join(HLS_OUTPUT_DIR, streamId);
  const hlsPlaylist = path.join(hlsPath, 'index.m3u8');

  // HLS 출력 디렉토리 생성
  if (!fs.existsSync(hlsPath)) {
    fs.mkdirSync(hlsPath, { recursive: true });
  }

  // FFmpeg 프로세스 시작
  // 다양한 방송 프로그램(OBS, Prism, Streamlabs 등)과 호환되는 인코딩 설정
  const ffmpegProcess = (ffmpeg as any)(rtmpUrl)
    .addOptions([
      // 비디오 코덱 설정 (범용 호환성)
      '-c:v libx264',
      '-preset veryfast', // 인코딩 속도 최적화
      '-tune zerolatency', // 낮은 지연시간 (라이브 스트리밍용)
      '-profile:v baseline', // 최대 호환성 (모든 플레이어 지원)
      '-level 3.1', // H.264 레벨 (호환성 향상)
      '-pix_fmt yuv420p', // 색상 포맷 (최대 호환성)
      '-g 60', // GOP 크기 (2초 @ 30fps)
      '-keyint_min 60', // 최소 키프레임 간격
      '-sc_threshold 0', // 스마트 컷 비활성화
      '-b:v 2500k', // 비디오 비트레이트 (고화질)
      '-maxrate 2500k', // 최대 비트레이트
      '-bufsize 5000k', // 버퍼 크기
      '-r 30', // 프레임레이트 (30fps)
      // 오디오 코덱 설정
      '-c:a aac',
      '-b:a 128k', // 오디오 비트레이트
      '-ar 44100', // 샘플레이트
      '-ac 2', // 스테레오
      '-strict -2', // AAC 코덱 호환성
      // HLS 출력 설정
      '-hls_time 2', // 세그먼트 길이 (2초)
      '-hls_list_size 6', // 플레이리스트 크기 (12초 버퍼)
      '-hls_flags delete_segments+independent_segments', // 세그먼트 자동 삭제
      '-hls_segment_type mpegts', // 세그먼트 타입
      '-f hls', // 출력 포맷
    ])
    .output(hlsPlaylist)
    .on('start', (commandLine: string) => {
      console.log(`[Streaming] FFmpeg started for stream ${streamId}:`, commandLine);
    })
    .on('error', (err: Error, stdout: string, stderr: string) => {
      console.error(`[Streaming] FFmpeg error for stream ${streamId}:`, err.message);
      console.error('[Streaming] FFmpeg stderr:', stderr);
    })
    .on('end', () => {
      console.log(`[Streaming] FFmpeg ended for stream ${streamId}`);
      ffmpegProcesses.delete(streamId);
    })
    .run();

  ffmpegProcesses.set(streamId, ffmpegProcess);
  return ffmpegProcess;
}

/**
 * Node Media Server 설정 및 시작
 */
export function startStreamingServer() {
  const config = {
    rtmp: {
      port: 1935,
      chunk_size: 60000, // 다양한 방송 프로그램 호환을 위한 표준 크기
      gop_cache: true, // GOP 캐시 활성화 (OBS, Prism 등 호환)
      ping: 30,
      ping_timeout: 60,
      // 다양한 방송 프로그램 호환성 향상
      fmsVer: 'FMS/3,0,1,123', // Flash Media Server 버전 (호환성)
      pageUrl: 'http://localhost',
      swfUrl: 'http://localhost',
    },
    http: {
      port: 8000,
      allow_origin: '*', // CORS 허용
      mediaroot: STREAM_OUTPUT_DIR,
      // 다양한 클라이언트 지원
      cors: true,
    },
    relay: {
      // FFmpeg 경로 자동 감지 (Windows/Linux/Mac)
      ffmpeg: getFFmpegPath(),
      tasks: [],
    },
  };

  const nms = new (NodeMediaServer as any)(config);

  // RTMP 연결 이벤트
  nms.on('preConnect', (id: string, args: any) => {
    console.log('[Streaming] PreConnect:', id, args);
  });

  // RTMP 세션 시작
  nms.on('postConnect', (id: string, args: any) => {
    console.log('[Streaming] PostConnect:', id);
  });

  // 스트림 발행 시작
  nms.on('prePublish', (id: string, StreamPath: string, args: any) => {
    console.log('[Streaming] PrePublish:', id, StreamPath, args);
    
    // StreamPath에서 streamKey 추출
    // 예: /live/stream-key → stream-key
    const streamKey = StreamPath.split('/').pop() || '';
    
    // TODO: streamKey로 streamId와 creatorId 조회 (DB에서)
    // 현재는 streamKey를 streamId로 사용
    const streamId = streamKey;
    const creatorId = args.name || 'unknown';

    activeStreams.set(streamId, {
      streamKey,
      streamId,
      creatorId,
    });

    // HLS 변환 시작
    convertToHLS(streamKey, streamId);
  });

  // 스트림 발행 종료
  nms.on('postPublish', (id: string, StreamPath: string, args: any) => {
    console.log('[Streaming] PostPublish:', id, StreamPath);
  });

  // 스트림 발행 종료
  nms.on('donePublish', (id: string, StreamPath: string, args: any) => {
    console.log('[Streaming] DonePublish:', id, StreamPath);
    
    const streamKey = StreamPath.split('/').pop() || '';
    const streamId = streamKey;

    // FFmpeg 프로세스 종료
    const ffmpegProcess = ffmpegProcesses.get(streamId);
    if (ffmpegProcess) {
      ffmpegProcess.kill('SIGTERM');
      ffmpegProcesses.delete(streamId);
    }

    // 활성 스트림에서 제거
    activeStreams.delete(streamId);
  });

  // 서버 시작
  nms.run();

  console.log('[Streaming] Node Media Server started');
  console.log('[Streaming] RTMP: rtmp://localhost:1935/live');
  console.log('[Streaming] HLS: http://localhost:8000/live/{streamId}/index.m3u8');

  return nms;
}

/**
 * 활성 스트림 목록 조회
 */
export function getActiveStreams(): StreamConfig[] {
  return Array.from(activeStreams.values());
}

/**
 * 스트림 HLS URL 생성
 */
export function getHLSStreamUrl(streamId: string): string {
  return `/streams/hls/${streamId}/index.m3u8`;
}

/**
 * 스트림 상태 확인
 */
export function isStreamActive(streamId: string): boolean {
  return activeStreams.has(streamId);
}
