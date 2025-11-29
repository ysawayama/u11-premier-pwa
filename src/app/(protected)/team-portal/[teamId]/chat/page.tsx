'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type ChatRoom = {
  id: string;
  team_id: string;
  room_type: 'team' | 'group' | 'direct';
  name: string | null;
  description: string | null;
  created_at: string;
};

type Message = {
  id: string;
  room_id: string;
  sender_id: string;
  content: string | null;
  message_type: 'text' | 'image' | 'file' | 'system';
  attachment_url: string | null;
  created_at: string;
  is_edited: boolean;
  is_deleted: boolean;
};

/**
 * チームポータル - チャットページ
 */
export default function ChatPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initChat();
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [teamId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initChat = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // ユーザー情報取得
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      if (!user) return;

      // チームチャットルームを取得または作成
      let { data: existingRoom } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('team_id', teamId)
        .eq('room_type', 'team')
        .single();

      if (!existingRoom) {
        // チームチャットルームを作成
        const { data: newRoom, error: createError } = await supabase
          .from('chat_rooms')
          .insert({
            team_id: teamId,
            room_type: 'team',
            name: 'チーム全体',
            created_by: user.id,
          })
          .select()
          .single();

        if (createError) throw createError;
        existingRoom = newRoom;

        // 作成者をメンバーとして追加
        await supabase.from('chat_room_members').insert({
          room_id: newRoom.id,
          user_id: user.id,
          role: 'admin',
        });
      }

      setRoom(existingRoom);

      // メンバーとして追加されているか確認
      const { data: membership } = await supabase
        .from('chat_room_members')
        .select('id')
        .eq('room_id', existingRoom.id)
        .eq('user_id', user.id)
        .single();

      if (!membership) {
        // メンバーとして追加
        await supabase.from('chat_room_members').insert({
          room_id: existingRoom.id,
          user_id: user.id,
          role: 'member',
        });
      }

      // メッセージを取得
      await loadMessages(existingRoom.id);

      // ポーリングで新しいメッセージを取得
      pollingRef.current = setInterval(() => {
        loadMessages(existingRoom.id);
      }, 5000);

    } catch (err) {
      console.error('チャットの初期化に失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('メッセージの取得に失敗:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || !newMessage.trim() || sending) return;

    try {
      setSending(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: room.id,
          sender_id: user?.id,
          content: newMessage.trim(),
          message_type: 'text',
        });

      if (error) throw error;

      setNewMessage('');
      await loadMessages(room.id);
    } catch (err: any) {
      alert('メッセージの送信に失敗しました: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = '';

    messages.forEach((message) => {
      const messageDate = new Date(message.created_at).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (messageDate !== currentDate) {
        groups.push({ date: messageDate, messages: [message] });
        currentDate = messageDate;
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">チャットルームを読み込めませんでした</p>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[400px]">
      {/* ヘッダー */}
      <div className="bg-white rounded-t-lg shadow-sm p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">{room.name || 'チームチャット'}</h2>
        <p className="text-sm text-gray-500">チームメンバー全員とのチャット</p>
      </div>

      {/* メッセージエリア */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>まだメッセージがありません</p>
            <p className="text-sm mt-1">最初のメッセージを送信しましょう</p>
          </div>
        ) : (
          <div className="space-y-6">
            {messageGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* 日付セパレーター */}
                <div className="flex items-center justify-center mb-4">
                  <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-500 shadow-sm">
                    {group.date}
                  </span>
                </div>

                {/* メッセージ */}
                <div className="space-y-2">
                  {group.messages.map((message) => {
                    const isOwn = message.sender_id === currentUserId;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] ${
                            isOwn
                              ? 'bg-primary text-white rounded-l-lg rounded-tr-lg'
                              : 'bg-white text-gray-900 rounded-r-lg rounded-tl-lg shadow-sm'
                          } px-4 py-2`}
                        >
                          {message.message_type === 'system' ? (
                            <p className="text-sm text-gray-500 italic">{message.content}</p>
                          ) : (
                            <>
                              <p className="whitespace-pre-wrap break-words">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isOwn ? 'text-blue-200' : 'text-gray-400'
                                }`}
                              >
                                {formatTime(message.created_at)}
                                {message.is_edited && ' (編集済み)'}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 入力エリア */}
      <form onSubmit={handleSendMessage} className="bg-white rounded-b-lg shadow-sm p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? '...' : '送信'}
          </button>
        </div>
      </form>
    </div>
  );
}
