'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getRecentMatches } from '@/lib/api/matches';
import { useAuthStore } from '@/lib/stores/authStore';
import type { MatchWithTeams, MatchStatus } from '@/types/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * 試合管理ページ（コーチ・管理者専用）
 */
export default function AdminMatchesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus | 'all'>('all');

  // 権限チェック
  useEffect(() => {
    if (user && user.user_type !== 'coach' && user.user_type !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const data = await getRecentMatches(100);
      setMatches(data);
    } catch (err: any) {
      setError(err.message || '試合情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // フィルター処理
  const filteredMatches = matches.filter((match) => {
    return selectedStatus === 'all' || match.status === selectedStatus;
  });

  // ステータス表示用のラベルと色
  const getStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'finished':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'postponed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: MatchStatus) => {
    switch (status) {
      case 'scheduled':
        return '予定';
      case 'in_progress':
        return '進行中';
      case 'finished':
        return '終了';
      case 'cancelled':
        return '中止';
      case 'postponed':
        return '延期';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadMatches}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">試合管理</h1>
              <p className="text-sm text-gray-600 mt-1">
                コーチ・管理者専用ページ
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ← ダッシュボード
            </Link>
          </div>

          {/* フィルター */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              全て ({matches.length})
            </button>
            <button
              onClick={() => setSelectedStatus('scheduled')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedStatus === 'scheduled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              予定 ({matches.filter((m) => m.status === 'scheduled').length})
            </button>
            <button
              onClick={() => setSelectedStatus('in_progress')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedStatus === 'in_progress'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              進行中 ({matches.filter((m) => m.status === 'in_progress').length})
            </button>
            <button
              onClick={() => setSelectedStatus('finished')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedStatus === 'finished'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              終了 ({matches.filter((m) => m.status === 'finished').length})
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {selectedStatus !== 'all'
                ? 'フィルター条件に一致する試合がありません'
                : '試合が登録されていません'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <Link
                key={match.id}
                href={`/admin/matches/${match.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                        match.status
                      )}`}
                    >
                      {getStatusLabel(match.status)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(match.match_date).toLocaleDateString('ja-JP', {
                        month: 'long',
                        day: 'numeric',
                      })}{' '}
                      {new Date(match.match_date).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {match.status === 'in_progress' && (
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        LIVE
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-blue-600 font-medium">
                    管理 →
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  {/* ホームチーム */}
                  <div className="flex-1 text-right pr-8">
                    <p className="text-lg font-semibold text-gray-900">
                      {match.home_team.name}
                    </p>
                  </div>

                  {/* スコア */}
                  <div className="flex items-center gap-4 px-6">
                    <span className="text-3xl font-bold text-gray-900">
                      {match.home_score ?? '-'}
                    </span>
                    <span className="text-2xl text-gray-400">-</span>
                    <span className="text-3xl font-bold text-gray-900">
                      {match.away_score ?? '-'}
                    </span>
                  </div>

                  {/* アウェイチーム */}
                  <div className="flex-1 text-left pl-8">
                    <p className="text-lg font-semibold text-gray-900">
                      {match.away_team.name}
                    </p>
                  </div>
                </div>

                {match.venue && (
                  <p className="text-sm text-gray-600 text-center mt-4">
                    会場: {match.venue}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
