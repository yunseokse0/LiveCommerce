'use client';

import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatMessage {
  id: string;
  userId: string;
  nickname: string;
  message: string;
  timestamp: number;
}

interface LiveChatProps {
  streamId: string;
}

export function LiveChat({ streamId }: LiveChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TODO: WebSocket 연결 구현
    // 현재는 목업 데이터
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        userId: 'user1',
        nickname: '시청자1',
        message: '안녕하세요!',
        timestamp: Date.now(),
      },
    ];
    setMessages(mockMessages);
  }, [streamId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // TODO: WebSocket으로 메시지 전송
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: 'current-user',
      nickname: '나',
      message: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-2.5 sm:p-3 md:p-4 border-b border-zinc-800/80 flex-shrink-0">
        <h3 className="font-semibold text-sm sm:text-base">라이브 채팅</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 md:p-4 space-y-1.5 sm:space-y-2 min-h-0">
        {messages.map((msg) => (
          <div key={msg.id} className="text-xs sm:text-sm break-words">
            <span className="font-medium text-amber-400">{msg.nickname}:</span>
            <span className="ml-1.5 sm:ml-2">{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2.5 sm:p-3 md:p-4 border-t border-zinc-800/80 flex-shrink-0">
        <div className="flex gap-1.5 sm:gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="메시지 입력..."
            className="flex-1 px-2.5 sm:px-3 py-2 text-sm sm:text-base rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 touch-manipulation"
          />
          <Button onClick={handleSend} size="sm" className="flex-shrink-0 touch-manipulation">
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
