# 자체 스트리밍 서버 구축 가이드

## 1단계: 자체 스트리밍 서버 (RTMP → HLS) ✅

### 개요
Node Media Server를 사용하여 RTMP 스트림을 수신하고, FFmpeg로 HLS로 변환하는 자체 스트리밍 서버입니다.

### 아키텍처
```
크리에이터 (OBS/Streamlabs)
    ↓ RTMP
Node Media Server (포트 1935)
    ↓
FFmpeg (RTMP → HLS 변환)
    ↓
HLS 파일 (public/streams/hls/{streamId}/index.m3u8)
    ↓
Video.js 플레이어 (2단계에서 구현) ✅
```

### 설치 및 설정

#### 1. FFmpeg 설치
**Windows:**
```bash
# Chocolatey 사용
choco install ffmpeg

# 또는 직접 다운로드
# https://ffmpeg.org/download.html
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg  # Ubuntu/Debian
sudo yum install ffmpeg      # CentOS/RHEL
```

#### 2. 스트리밍 서버 시작

**방법 1: 별도 프로세스로 실행 (권장)**
```bash
npm run dev:streaming
```

**방법 2: Next.js와 함께 실행**
- 개발 환경에서는 수동으로 별도 터미널에서 실행
- 프로덕션에서는 PM2 등으로 관리

### RTMP 스트림 키 생성

크리에이터가 방송을 시작할 때 RTMP 스트림 키를 생성합니다:

```typescript
// API 호출
POST /api/streaming/rtmp-key
{
  "creatorId": "creator-123"
}

// 응답
{
  "success": true,
  "streamKey": "abc123...",
  "streamId": "stream-1234567890-creator-123",
  "rtmpUrl": "rtmp://localhost:1935/live/abc123...",
  "hlsUrl": "/streams/hls/stream-1234567890-creator-123/index.m3u8"
}
```

### 지원하는 방송 프로그램

다음 방송 프로그램들을 지원합니다:

- **OBS Studio** (권장)
- **Prism Live Studio**
- **Streamlabs Desktop**
- **XSplit Broadcaster**
- **Wirecast**

각 프로그램의 상세 설정 가이드는 크리에이터 스튜디오(`/studio`) 페이지에서 확인할 수 있습니다.

### OBS Studio 설정

1. **방송 설정 열기**
   - OBS Studio → 설정 → 방송

2. **서비스 선택**
   - 서비스: "사용자 지정"

3. **서버 설정**
   - 서버: `rtmp://localhost:1935/live` (또는 API에서 받은 전체 RTMP URL)
   - 스트림 키: API에서 받은 `streamKey`

4. **출력 설정 (선택사항)**
   - 출력 → 인코더: "x264" 또는 "NVENC H.264"
   - 비트레이트: 2500 kbps (권장)
   - 해상도: 1920x1080 (1080p) 또는 1280x720 (720p)
   - 프레임레이트: 30 fps

5. **방송 시작**
   - OBS에서 "방송 시작" 클릭

### Prism Live Studio 설정

1. **RTMP 설정 열기**
   - Prism Live Studio → 설정 → RTMP 설정

2. **RTMP 서버 추가**
   - 서버 URL: `rtmp://localhost:1935/live`
   - 스트림 키: API에서 받은 `streamKey`

3. **방송 시작**
   - "라이브 시작" 버튼 클릭

### Streamlabs Desktop 설정

1. **방송 설정 열기**
   - Streamlabs Desktop → 설정 → 방송

2. **서비스 선택**
   - 서비스: "사용자 지정"

3. **서버 설정**
   - 서버: `rtmp://localhost:1935/live`
   - 스트림 키: API에서 받은 `streamKey`

4. **방송 시작**
   - "Go Live" 버튼 클릭

### HLS 스트림 확인

스트림이 시작되면 다음 URL에서 확인할 수 있습니다:
- HLS Playlist: `http://localhost:3000/streams/hls/{streamId}/index.m3u8`
- 스트림 상태: `GET /api/streaming/status?streamId={streamId}`

## 2단계: Video.js 기반 자체 플레이어 ✅

### 구현 완료

1. **NativePlayer 컴포넌트**
   - Video.js 기반 HLS 스트림 재생
   - 자동 재생, 컨트롤, 반응형 지원
   - 다크 모드 테마 적용

2. **UniversalPlayer 통합**
   - YouTube 스트림과 자체 플랫폼 스트림 모두 지원
   - 플랫폼에 따라 자동으로 적절한 플레이어 사용

3. **스타일링**
   - 골드 & 블랙 다크 모드 테마
   - 모바일 최적화
   - 커스텀 컨트롤 바

### 사용 방법

```tsx
import { NativePlayer } from '@/components/native-player';

<NativePlayer
  hlsUrl="/streams/hls/{streamId}/index.m3u8"
  autoplay={true}
  controls={true}
/>
```

### 파일 구조

```
public/
  streams/
    hls/
      {streamId}/
        index.m3u8      # HLS 플레이리스트
        *.ts            # HLS 세그먼트 파일
```

### 문제 해결

1. **FFmpeg를 찾을 수 없음**
   - 시스템에 FFmpeg가 설치되어 있는지 확인
   - PATH 환경 변수에 FFmpeg가 포함되어 있는지 확인

2. **포트 1935가 이미 사용 중**
   - 다른 RTMP 서버가 실행 중인지 확인
   - 포트를 변경하려면 `scripts/start-streaming-server.js` 수정

3. **HLS 파일이 생성되지 않음**
   - RTMP 스트림이 정상적으로 수신되는지 확인
   - FFmpeg 로그 확인

4. **Video.js 플레이어가 스트림을 재생하지 않음**
   - HLS URL이 올바른지 확인
   - 브라우저 콘솔에서 에러 확인
   - CORS 설정 확인

### 다음 단계

- [ ] 3단계: WebSocket 기반 실시간 채팅 시스템
- [ ] 4단계: 크리에이터 스튜디오 개발
- [ ] 5단계: 상품 관리 및 결제 시스템 통합
- [ ] 6단계: 배송 관리 시스템 구축