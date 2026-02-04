# 실시간 채팅 시스템 구축 가이드

## 3단계: WebSocket 기반 실시간 채팅 시스템 ✅

### 개요
Socket.io를 사용한 실시간 채팅 시스템으로, 각 스트림별로 독립적인 채팅방을 제공합니다.

### 아키텍처
```
클라이언트 (Next.js)
    ↓ WebSocket
Socket.io 서버 (포트 3001)
    ↓
채팅방 관리 (스트림별)
    ↓
메시지 브로드캐스트
```

### 설치 및 설정

#### 1. 채팅 서버 시작

**별도 프로세스로 실행 (권장)**
```bash
npm run dev:chat
```

또는 직접 실행:
```bash
node scripts/start-chat-server.js
```

#### 2. 환경 변수 설정 (선택사항)

`.env.local` 파일에 추가:
```env
NEXT_PUBLIC_CHAT_SERVER_URL=http://localhost:3001
CHAT_SERVER_PORT=3001
```

### 기능

1. **실시간 메시지 전송/수신**
   - WebSocket을 통한 양방향 통신
   - 스트림별 독립적인 채팅방

2. **메시지 히스토리**
   - 최근 100개 메시지 자동 저장
   - 채팅방 입장 시 히스토리 자동 로드

3. **사용자 인증 연동**
   - Supabase Auth와 연동
   - 로그인한 사용자만 채팅 가능

4. **연결 상태 표시**
   - 실시간 연결 상태 표시
   - 재연결 자동 처리

### 사용 방법

#### 클라이언트 측

```tsx
import { useChat } from '@/hooks/use-chat';

function MyComponent() {
  const { messages, isConnected, sendMessage } = useChat({
    streamId: 'stream-123',
    autoConnect: true,
  });

  const handleSend = () => {
    sendMessage('안녕하세요!');
  };

  return (
    <div>
      {messages.map((msg) => (
        <div key={msg.id}>{msg.nickname}: {msg.message}</div>
      ))}
    </div>
  );
}
```

#### LiveChat 컴포넌트

```tsx
import { LiveChat } from '@/components/live-chat';

<LiveChat streamId="stream-123" />
```

### 파일 구조

```
src/lib/chat/
  ├── server.ts          # Socket.io 서버 로직 (TypeScript)
  ├── client.ts          # Socket.io 클라이언트 유틸리티
  └── README.md          # 사용 가이드

src/hooks/
  └── use-chat.ts        # 실시간 채팅 훅

src/components/
  └── live-chat.tsx      # 채팅 UI 컴포넌트

scripts/
  └── start-chat-server.js  # 채팅 서버 실행 스크립트
```

### API 이벤트

#### 클라이언트 → 서버

- `join-room`: 채팅방 입장
  ```typescript
  socket.emit('join-room', {
    streamId: 'stream-123',
    user: {
      userId: 'user-123',
      nickname: '사용자명',
      avatarUrl: 'https://...',
    },
  });
  ```

- `send-message`: 메시지 전송
  ```typescript
  socket.emit('send-message', {
    streamId: 'stream-123',
    message: '안녕하세요!',
  });
  ```

- `leave-room`: 채팅방 퇴장
  ```typescript
  socket.emit('leave-room', 'stream-123');
  ```

#### 서버 → 클라이언트

- `message-history`: 메시지 히스토리 수신
- `new-message`: 새 메시지 수신
- `user-joined`: 사용자 입장 알림
- `user-left`: 사용자 퇴장 알림
- `error`: 에러 메시지

### 문제 해결

1. **채팅 서버에 연결되지 않음**
   - 채팅 서버가 실행 중인지 확인: `npm run dev:chat`
   - 포트가 올바른지 확인 (기본값: 3001)
   - CORS 설정 확인

2. **메시지가 전송되지 않음**
   - 사용자가 로그인되어 있는지 확인
   - 연결 상태 확인 (`isConnected`)
   - 브라우저 콘솔에서 에러 확인

3. **메시지 히스토리가 로드되지 않음**
   - 채팅방에 정상적으로 입장했는지 확인
   - 서버 로그 확인

### 다음 단계

- [ ] 4단계: 크리에이터 스튜디오 개발
- [ ] 5단계: 상품 관리 및 결제 시스템 통합
- [ ] 6단계: 배송 관리 시스템 구축
