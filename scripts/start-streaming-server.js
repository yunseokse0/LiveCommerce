/**
 * 스트리밍 서버 시작 스크립트
 * 별도 프로세스로 실행하여 Next.js와 독립적으로 동작
 * 
 * 사용법: node scripts/start-streaming-server.js
 * 또는: npm run dev:streaming
 */

const NodeMediaServer = require('node-media-server');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// FFmpeg 경로 자동 감지
function getFFmpegPath() {
  try {
    const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
    return ffmpegInstaller.path || ffmpegInstaller.ffmpegPath || 'ffmpeg';
  } catch (e) {
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

// 활성 스트림 추적
const activeStreams = new Map();
const ffmpegProcesses = new Map();

// RTMP 스트림을 HLS로 변환
function convertToHLS(streamKey, streamId) {
  const rtmpUrl = `rtmp://localhost:1935/live/${streamKey}`;
  const hlsPath = path.join(HLS_OUTPUT_DIR, streamId);
  const hlsPlaylist = path.join(hlsPath, 'index.m3u8');

  if (!fs.existsSync(hlsPath)) {
    fs.mkdirSync(hlsPath, { recursive: true });
  }

  // 다양한 방송 프로그램(OBS, Prism, Streamlabs 등)과 호환되는 인코딩 설정
  const ffmpegProcess = ffmpeg(rtmpUrl)
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
    .on('start', (commandLine) => {
      console.log(`[Streaming] FFmpeg started for stream ${streamId}:`, commandLine);
    })
    .on('error', (err, stdout, stderr) => {
      console.error(`[Streaming] FFmpeg error for stream ${streamId}:`, err.message);
      if (stderr) console.error('[Streaming] FFmpeg stderr:', stderr);
    })
    .on('end', () => {
      console.log(`[Streaming] FFmpeg ended for stream ${streamId}`);
      ffmpegProcesses.delete(streamId);
    })
    .run();

  ffmpegProcesses.set(streamId, ffmpegProcess);
  return ffmpegProcess;
}

// Node Media Server 설정 및 시작
function startStreamingServer() {
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
      ffmpeg: getFFmpegPath(),
      tasks: [],
    },
  };

  const nms = new NodeMediaServer(config);

  nms.on('preConnect', (id, args) => {
    console.log('[Streaming] PreConnect:', id, args);
  });

  nms.on('postConnect', (id, args) => {
    console.log('[Streaming] PostConnect:', id);
  });

  nms.on('prePublish', (id, StreamPath, args) => {
    console.log('[Streaming] PrePublish:', id, StreamPath, args);
    
    const streamKey = StreamPath.split('/').pop() || '';
    const streamId = streamKey;
    const creatorId = args.name || 'unknown';

    activeStreams.set(streamId, {
      streamKey,
      streamId,
      creatorId,
    });

    convertToHLS(streamKey, streamId);
  });

  nms.on('postPublish', (id, StreamPath, args) => {
    console.log('[Streaming] PostPublish:', id, StreamPath);
  });

  nms.on('donePublish', (id, StreamPath, args) => {
    console.log('[Streaming] DonePublish:', id, StreamPath);
    
    const streamKey = StreamPath.split('/').pop() || '';
    const streamId = streamKey;

    const ffmpegProcess = ffmpegProcesses.get(streamId);
    if (ffmpegProcess) {
      ffmpegProcess.kill('SIGTERM');
      ffmpegProcesses.delete(streamId);
    }

    activeStreams.delete(streamId);
  });

  nms.run();

  console.log('[Streaming] ✅ Node Media Server started');
  console.log('[Streaming] 📡 RTMP: rtmp://localhost:1935/live');
  console.log('[Streaming] 📺 HLS: http://localhost:8000/live/{streamId}/index.m3u8');
  console.log('[Streaming] 🌐 Next.js: http://localhost:3000/streams/hls/{streamId}/index.m3u8');

  return nms;
}

// 서버 시작
const nms = startStreamingServer();

// 종료 시 정리
process.on('SIGINT', () => {
  console.log('\n[Streaming] 서버 종료 중...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Streaming] 서버 종료 중...');
  process.exit(0);
});
