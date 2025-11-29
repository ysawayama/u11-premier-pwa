'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMatchById, updateMatchScore, updateMatchStatus } from '@/lib/api/matches';
import { useAuthStore } from '@/lib/stores/authStore';
import MatchEventRecorder from '@/components/MatchEventRecorder';
import type { MatchWithTeams, MatchStatus } from '@/types/database';
import {
  sendMatchStartNotification,
  sendMatchEndNotification,
} from '@/lib/notifications/sendNotification';

/**
 * 試合編集ページ（コーチ・管理者専用）
 */
export default function AdminMatchEditPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const matchId = params.id as string;

  const [match, setMatch] = useState<MatchWithTeams | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // スコア入力用の状態
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus>('scheduled');

  // 権限チェック
  useEffect(() => {
    if (user && user.user_type !== 'coach' && user.user_type !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    loadMatch();
  }, [matchId]);

  useEffect(() => {
    if (match) {
      setHomeScore(match.home_score ?? 0);
      setAwayScore(match.away_score ?? 0);
      setSelectedStatus(match.status);
    }
  }, [match]);

  const loadMatch = async () => {
    try {
      setLoading(true);
      const data = await getMatchById(matchId);
      setMatch(data);
    } catch (err: any) {
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveScore = async () => {
    if (!match) return;

    try {
      setSaving(true);
      await updateMatchScore(matchId, homeScore, awayScore);
      alert('スコアを更新しました');
      await loadMatch();
    } catch (err: any) {
      alert('スコアの更新に失敗しました: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: MatchStatus) => {
    if (!match) return;

    try {
      setSaving(true);
      const oldStatus = match.status;
      await updateMatchStatus(matchId, newStatus);
      setSelectedStatus(newStatus);

      // 通知を送信
      if (oldStatus !== 'in_progress' && newStatus === 'in_progress') {
        // 試合開始通知
        await sendMatchStartNotification(
          match.home_team.name,
          match.away_team.name,
          matchId
        );
      } else if (oldStatus === 'in_progress' && newStatus === 'finished') {
        // 試合終了通知
        await sendMatchEndNotification(
          match.home_team.name,
          match.away_team.name,
          match.home_score ?? 0,
          match.away_score ?? 0,
          matchId
        );
      }

      alert('ステータスを変更しました');
      await loadMatch();
    } catch (err: any) {
      alert('ステータスの変更に失敗しました: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-primary hover:bg-primary-hover';
      case 'in_progress':
        return 'bg-green-600 hover:bg-green-700';
      case 'finished':
        return 'bg-gray-600 hover:bg-gray-700';
      case 'cancelled':
        return 'bg-red-600 hover:bg-red-700';
      case 'postponed':
        return 'bg-yellow-600 hover:bg-yellow-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || '試合が見つかりません'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/admin/matches"
            className="text-sm text-primary hover:text-primary-hover mb-2 inline-block"
          >
            ← 試合管理
          </Link>
          <h1 className="text-2xl font-bold text-navy">試合編集</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 試合情報カード */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-2">
              {new Date(match.match_date).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}{' '}
              {new Date(match.match_date).toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            {match.venue && (
              <p className="text-sm text-gray-600">会場: {match.venue}</p>
            )}
          </div>

          {/* チーム名表示 */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="text-center flex-1">
              <Link
                href={`/teams/${match.home_team.id}`}
                className="text-lg font-semibold text-primary hover:text-primary-hover"
              >
                {match.home_team.name}
              </Link>
              <p className="text-xs text-gray-500 mt-1">ホーム</p>
            </div>
            <div className="text-2xl font-bold text-gray-400">VS</div>
            <div className="text-center flex-1">
              <Link
                href={`/teams/${match.away_team.id}`}
                className="text-lg font-semibold text-primary hover:text-primary-hover"
              >
                {match.away_team.name}
              </Link>
              <p className="text-xs text-gray-500 mt-1">アウェイ</p>
            </div>
          </div>
        </div>

        {/* スコア入力セクション */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            スコア入力
          </h2>

          <div className="flex items-center justify-center gap-8 mb-6">
            {/* ホームスコア */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                {match.home_team.short_name || match.home_team.name}
              </p>
              <input
                type="number"
                min="0"
                value={homeScore}
                onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                className="w-24 h-24 text-4xl font-bold text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>

            <div className="text-3xl font-bold text-gray-400">-</div>

            {/* アウェイスコア */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                {match.away_team.short_name || match.away_team.name}
              </p>
              <input
                type="number"
                min="0"
                value={awayScore}
                onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                className="w-24 h-24 text-4xl font-bold text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            onClick={handleSaveScore}
            disabled={saving}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium transition-colors disabled:bg-gray-400"
          >
            {saving ? '保存中...' : 'スコアを保存'}
          </button>
        </div>

        {/* ステータス変更セクション */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            試合ステータス
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              onClick={() => handleStatusChange('scheduled')}
              disabled={saving || selectedStatus === 'scheduled'}
              className={`px-4 py-3 rounded-lg text-white font-medium transition-colors ${
                selectedStatus === 'scheduled'
                  ? 'bg-blue-800'
                  : 'bg-primary hover:bg-primary-hover'
              } disabled:opacity-50`}
            >
              予定
            </button>

            <button
              onClick={() => handleStatusChange('in_progress')}
              disabled={saving || selectedStatus === 'in_progress'}
              className={`px-4 py-3 rounded-lg text-white font-medium transition-colors ${
                selectedStatus === 'in_progress'
                  ? 'bg-green-800'
                  : 'bg-green-600 hover:bg-green-700'
              } disabled:opacity-50`}
            >
              進行中
            </button>

            <button
              onClick={() => handleStatusChange('finished')}
              disabled={saving || selectedStatus === 'finished'}
              className={`px-4 py-3 rounded-lg text-white font-medium transition-colors ${
                selectedStatus === 'finished'
                  ? 'bg-gray-800'
                  : 'bg-gray-600 hover:bg-gray-700'
              } disabled:opacity-50`}
            >
              終了
            </button>

            <button
              onClick={() => handleStatusChange('postponed')}
              disabled={saving || selectedStatus === 'postponed'}
              className={`px-4 py-3 rounded-lg text-white font-medium transition-colors ${
                selectedStatus === 'postponed'
                  ? 'bg-yellow-800'
                  : 'bg-yellow-600 hover:bg-yellow-700'
              } disabled:opacity-50`}
            >
              延期
            </button>

            <button
              onClick={() => handleStatusChange('cancelled')}
              disabled={saving || selectedStatus === 'cancelled'}
              className={`px-4 py-3 rounded-lg text-white font-medium transition-colors ${
                selectedStatus === 'cancelled'
                  ? 'bg-red-800'
                  : 'bg-red-600 hover:bg-red-700'
              } disabled:opacity-50`}
            >
              中止
            </button>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-navy">
              <strong>現在のステータス:</strong>{' '}
              {selectedStatus === 'scheduled' && '予定'}
              {selectedStatus === 'in_progress' && '進行中'}
              {selectedStatus === 'finished' && '終了'}
              {selectedStatus === 'postponed' && '延期'}
              {selectedStatus === 'cancelled' && '中止'}
            </p>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            クイックアクション
          </h2>

          <div className="space-y-3">
            <button
              onClick={async () => {
                if (confirm('試合を開始しますか？')) {
                  await handleStatusChange('in_progress');
                }
              }}
              disabled={saving || selectedStatus !== 'scheduled'}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:bg-gray-400"
            >
              試合開始
            </button>

            <button
              onClick={async () => {
                if (confirm('試合を終了しますか？')) {
                  await handleStatusChange('finished');
                }
              }}
              disabled={saving || selectedStatus !== 'in_progress'}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors disabled:bg-gray-400"
            >
              試合終了
            </button>
          </div>
        </div>

        {/* イベント記録セクション */}
        {(selectedStatus === 'in_progress' || selectedStatus === 'finished') && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              試合イベント
            </h2>
            <MatchEventRecorder match={match} />
          </div>
        )}
      </main>
    </div>
  );
}
