'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Wifi, WifiOff, Trash2, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/use-chat';
import { useAuth } from '@/store/auth';
import { useFormat } from '@/hooks/use-format';
import { useTranslation } from '@/hooks/use-translation';

interface LiveChatProps {
  streamId: string;
  creatorId?: string; // 크리에이터 ID (권한 확인용)
  onPurchaseNotification?: () => void;
  pinnedNotice?: string; // 고정 공지사항
}

export function LiveChat({ streamId, creatorId, onPurchaseNotification, pinnedNotice }: LiveChatProps) {
  const { user } = useAuth();
  const format = useFormat();
  const { t } = useTranslation();
  const { messages, isConnected, sendMessage, addPurchaseNotification, deleteMessage, banUser, isCreator } = useChat({ 
    streamId, 
    autoConnect: !!user,
    creatorId
  });
  const [input, setInput] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 구매 알림 수신 시 처리
  useEffect(() => {
    if (onPurchaseNotification) {
      // 구매 알림이 발생하면 콜백 호출
      const purchaseMessages = messages.filter((msg) => 
        msg.userId === 'system' && msg.message.includes('님이 방금 구매하셨습니다')
      );
      if (purchaseMessages.length > 0) {
        onPurchaseNotification();
      }
    }
  }, [messages, onPurchaseNotification]);

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
    return format.time(new Date(timestamp));
  };

  const handleDeleteMessage = (messageId: string) => {
    if (confirm(t('chat.confirmDelete'))) {
      deleteMessage(messageId);
    }
  };

  const handleBanUser = (userId: string, nickname: string) => {
    if (confirm(t('chat.confirmBan', { nickname }))) {
      banUser(userId);
    }
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="p-2.5 sm:p-3 md:p-4 border-b border-zinc-800/80 flex-shrink-0 flex items-center justify-between">
        <h3 className="font-semibold text-sm sm:text-base">{t('chat.title')}</h3>
        <div className="flex items-center gap-1.5 text-xs">
          {isConnected ? (
            <>
              <Wifi className="w-3 h-3 text-green-500" />
              <span className="text-zinc-400">{t('chat.connected')}</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-red-500" />
              <span className="text-zinc-400">{t('chat.disconnected')}</span>
            </>
          )}
        </div>
      </div>

      {/* 고정 공지사항 */}
      {pinnedNotice && (
        <div className="px-3 py-2 bg-amber-500/10 border-b border-amber-500/20 flex-shrink-0">
          <div className="flex items-start gap-2">
            <span className="text-xs font-semibold text-amber-400 flex-shrink-0">📌 {t('chat.notice')}</span>
            <p className="text-xs text-amber-300/90 flex-1">{pinnedNotice}</p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 md:p-4 space-y-1.5 sm:space-y-2 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center text-zinc-500 text-xs sm:text-sm py-4">
            {!user ? '로그인 후 채팅에 참여하세요' : isConnected ? '첫 메시지를 입력하세요' : '연결 중...'}
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = user && msg.userId === user.id;
            const isSystemMessage = msg.userId === 'system';
            return (
              <div
                key={msg.id}
                className={`text-xs sm:text-sm break-words ${
                  isOwnMessage ? 'text-right' : ''
                } ${isSystemMessage ? 'text-center text-zinc-500 italic' : ''}`}
              >
                {isSystemMessage ? (
                  <div className={`text-center ${
                    msg.message.includes('구매하셨습니다') 
                      ? 'bg-amber-500/10 border border-amber-500/20 rounded-lg px-2 py-1.5' 
                      : ''
                  }`}>
                    <span className={`${
                      msg.message.includes('구매하셨습니다') 
                        ? 'text-amber-400 font-medium' 
                        : 'text-zinc-500'
                    }`}>
                      {msg.message}
                    </span>
                  </div>
                ) : (
                  <div 
                    className={`flex items-start gap-1.5 sm:gap-2 group ${msg.message === '[삭제된 메시지]' ? 'opacity-50' : ''}`}
                    onMouseEnter={() => setHoveredMessageId(msg.id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    {!isOwnMessage && (
                      <span className="font-medium text-amber-400 flex-shrink-0">
                        {msg.nickname}:
                      </span>
                    )}
                    <div className={`flex-1 ${isOwnMessage ? 'text-right' : ''}`}>
                      <span className={isOwnMessage ? 'text-amber-400' : 'text-zinc-300'}>
                        {msg.message === '[삭제된 메시지]' ? (
                          <span className="italic text-zinc-500">{t('chat.deletedMessage')}</span>
                        ) : (
                          msg.message
                        )}
                      </span>
                      <span className="ml-1.5 text-zinc-500 text-[10px]">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    {isOwnMessage && (
                      <span className="font-medium text-amber-400 flex-shrink-0">{t('chat.me')}</span>
                    )}
                    {/* 크리에이터만 보이는 관리 버튼 */}
                    {isCreator && msg.message !== '[삭제된 메시지]' && msg.userId !== 'system' && hoveredMessageId === msg.id && (
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
                          title={t('chat.deleteMessage')}
                          aria-label={t('chat.deleteMessage')}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        {!isOwnMessage && (
                          <button
                            onClick={() => handleBanUser(msg.userId, msg.nickname)}
                            className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
                            title={t('chat.banUser')}
                            aria-label={t('chat.banUser')}
                          >
                            <Ban className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
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
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={!user ? t('chat.loginRequired') : isConnected ? t('chat.enterMessage') : t('chat.connecting')}
            disabled={!user || !isConnected}
            maxLength={200}
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
