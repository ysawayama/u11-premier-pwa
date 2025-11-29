'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getSoccerNotesByTeam, addCoachComment } from '@/lib/api/soccerNotes';
import type { SoccerNoteWithCoach } from '@/types/database';

type NoteWithPlayer = SoccerNoteWithCoach & {
  player: { id: string; family_name: string; given_name: string };
};

type FilterType = 'all' | 'unreviewed' | 'reviewed';

/**
 * コーチ用サッカーノートレビューページ
 * チームの選手が書いたノートを確認し、コメントを付けられる
 */
export default function TeamNotesPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const [notes, setNotes] = useState<NoteWithPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCoach, setIsCoach] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedNote, setSelectedNote] = useState<NoteWithPlayer | null>(null);
  const [commentText, setCommentText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAccessAndLoadNotes();
  }, [teamId]);

  const checkAccessAndLoadNotes = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // ログインユーザー取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('ログインが必要です');
        return;
      }

      // 管理者かコーチかチェック
      const { data: isAdminOrAbove } = await supabase.rpc('is_admin_or_above');

      if (!isAdminOrAbove) {
        // チームメンバーシップ確認（manager/coachのみ）
        const { data: membership } = await supabase
          .from('team_members')
          .select('role')
          .eq('team_id', teamId)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .in('role', ['manager', 'coach'])
          .single();

        if (!membership) {
          setError('この機能はコーチ・監督のみ利用できます');
          return;
        }
      }

      setIsCoach(true);
      await loadNotes();
    } catch (err) {
      console.error('エラー:', err);
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const data = await getSoccerNotesByTeam(teamId);
      setNotes(data as NoteWithPlayer[]);
    } catch (err) {
      console.error('ノートの読み込みに失敗:', err);
    }
  };

  const handleSaveComment = async () => {
    if (!selectedNote || !commentText.trim()) return;

    try {
      setSaving(true);
      await addCoachComment(selectedNote.id, commentText.trim());
      setSelectedNote(null);
      setCommentText('');
      await loadNotes();
    } catch (err) {
      console.error('コメントの保存に失敗:', err);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  // フィルター適用
  const filteredNotes = notes.filter((note) => {
    if (filter === 'unreviewed') return !note.is_reviewed;
    if (filter === 'reviewed') return note.is_reviewed;
    return true;
  });

  const unreviewedCount = notes.filter((n) => !n.is_reviewed).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  if (error || !isCoach) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">{error || 'アクセス権限がありません'}</p>
        <Link
          href={`/team-portal/${teamId}`}
          className="mt-4 inline-block text-primary hover:underline"
        >
          チームポータルに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">サッカーノートレビュー</h1>
            <p className="text-sm text-gray-600 mt-1">選手のノートを確認し、コメントを送りましょう</p>
          </div>
          {unreviewedCount > 0 && (
            <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              未確認: {unreviewedCount}件
            </span>
          )}
        </div>

        {/* フィルター */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'すべて' },
            { key: 'unreviewed', label: '未確認' },
            { key: 'reviewed', label: '確認済み' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as FilterType)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === item.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ノート一覧 */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-500">
            {filter === 'unreviewed'
              ? '未確認のノートはありません'
              : 'ノートがありません'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`bg-white rounded-lg shadow-sm p-6 ${
                !note.is_reviewed ? 'border-l-4 border-orange-400' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      {note.player.family_name} {note.player.given_name}
                    </span>
                    {!note.is_reviewed && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(note.note_date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {note.title && ` - ${note.title}`}
                  </p>
                </div>
                {note.self_rating && (
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`text-lg ${
                          star <= note.self_rating! ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {note.what_went_well && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs font-medium text-green-700 mb-1">良かった点</p>
                    <p className="text-sm text-gray-700">{note.what_went_well}</p>
                  </div>
                )}
                {note.what_to_improve && (
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-xs font-medium text-orange-700 mb-1">改善点</p>
                    <p className="text-sm text-gray-700">{note.what_to_improve}</p>
                  </div>
                )}
                {note.next_goal && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-medium text-blue-700 mb-1">次の目標</p>
                    <p className="text-sm text-gray-700">{note.next_goal}</p>
                  </div>
                )}
              </div>

              {/* 既存のコメント */}
              {note.coach_comment && (
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-purple-700">あなたのコメント</span>
                    {note.coach_commented_at && (
                      <span className="text-xs text-gray-500">
                        {new Date(note.coach_commented_at).toLocaleDateString('ja-JP')}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{note.coach_comment}</p>
                </div>
              )}

              {/* コメントボタン */}
              <button
                onClick={() => {
                  setSelectedNote(note);
                  setCommentText(note.coach_comment || '');
                }}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {note.coach_comment ? 'コメントを編集' : 'コメントを書く'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* コメント入力モーダル */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSelectedNote(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {selectedNote.player.family_name} {selectedNote.player.given_name}さんへのコメント
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {selectedNote.title ||
                new Date(selectedNote.note_date).toLocaleDateString('ja-JP')}
            </p>

            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="選手へのフィードバック、アドバイス、励ましの言葉などを書いてください"
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={handleSaveComment}
                disabled={saving || !commentText.trim()}
                className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '保存中...' : '送信する'}
              </button>
              <button
                onClick={() => {
                  setSelectedNote(null);
                  setCommentText('');
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
