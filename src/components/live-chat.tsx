'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/use-chat';
import { useAuth } from '@/store/auth';

interface LiveChatProps {
  streamId: string;
}

export function LiveChat({ streamId }: LiveChatProps) {
  const { user } = useAuth();
  const { messages, isConnected, sendMessage } = useChat({ streamId, autoConnect: !!user });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !isConnected) return;

    const success = sendMessage(input);
    if (success) {
      setInput('');
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-2.5 sm:p-3 md:p-4 border-b border-zinc-800/80 flex-shrink-0 flex items-center justify-between">
        <h3 className="font-semibold text-sm sm:text-base">라이브 채팅</h3>
        <div className="flex items-center gap-1.5 text-xs">
          {isConnected ? (
            <>
              <Wifi className="w-3 h-3 text-green-500" />
              <span className="text-zinc-400">연결됨</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-red-500" />
              <span className="text-zinc-400">연결 안 됨</span>
            </>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 md:p-4 space-y-1.5 sm:space-y-2 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-zinc-500 text-xs sm:text-sm py-4">
            {!user ? '로그인 후 채팅에 참여하세요' : isConnected ? '첫 메시지를 입력하세요' : '연결 중...'}
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = user && msg.userId === user.id;
            return (
              <div
                key={msg.id}
                className={`text-xs sm:text-sm break-words ${
                  isOwnMessage ? 'text-right' : ''
                }`}
              >
                <div className="flex items-start gap-1.5 sm:gap-2">
                  {!isOwnMessage && (
                    <span className="font-medium text-amber-400 flex-shrink-0">
                      {msg.nickname}:
                    </span>
                  )}
                  <div className={`flex-1 ${isOwnMessage ? 'text-right' : ''}`}>
                    <span className={isOwnMessage ? 'text-amber-400' : ''}>{msg.message}</span>
                    <span className="ml-1.5 text-zinc-500 text-[10px]">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  {isOwnMessage && (
                    <span className="font-medium text-amber-400 flex-shrink-0">나:</span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2.5 sm:p-3 md:p-4 border-t border-zinc-800/80 flex-shrink-0">
        <div className="flex gap-1.5 sm:gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={!user ? '로그인 필요' : isConnected ? '메시지 입력...' : '연결 중...'}
            disabled={!user || !isConnected}
            className="flex-1 px-2.5 sm:px-3 py-2 text-sm sm:text-base rounded-lg bg-secondary border border-zinc-800/80 focus:outline-none focus:border-amber-500/50 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <Button
            onClick={handleSend}
            size="sm"
            className="flex-shrink-0 touch-manipulation"
            disabled={!user || !isConnected || !input.trim()}
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
