'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getRecentMatches } from '@/lib/api/matches';
import { useAuthStore } from '@/lib/stores/authStore';
import type { MatchWithTeams, MatchStatus } from '@/types/database';
import PageWrapper from '@/components/layout/PageWrapper';
import TeamBadge from '@/components/common/TeamBadge';

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

  // ヘッダーコンポーネント
  const headerContent = (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold text-white">試合管理</h1>
        <p className="text-xs text-white/70 mt-0.5">
          コーチ・管理者専用ページ
        </p>
      </div>
      <Link
        href="/dashboard"
        className="text-sm text-white/80 hover:text-white transition-colors"
      >
        ← ダッシュボード
      </Link>
    </div>
  );

  if (loading) {
    return (
      <PageWrapper header={headerContent}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper header={headerContent}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadMatches}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
            >
              再読み込み
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper header={headerContent}>
      {/* フィルター */}
      <div className="flex gap-2 flex-wrap mb-4 pb-4 border-b border-gray-100">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedStatus === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          全て ({matches.length})
        </button>
        <button
          onClick={() => setSelectedStatus('scheduled')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedStatus === 'scheduled'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          予定 ({matches.filter((m) => m.status === 'scheduled').length})
        </button>
        <button
          onClick={() => setSelectedStatus('in_progress')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedStatus === 'in_progress'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          進行中 ({matches.filter((m) => m.status === 'in_progress').length})
        </button>
        <button
          onClick={() => setSelectedStatus('finished')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedStatus === 'finished'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          終了 ({matches.filter((m) => m.status === 'finished').length})
        </button>
      </div>

      {/* 試合リスト */}
      {filteredMatches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            {selectedStatus !== 'all'
              ? 'フィルター条件に一致する試合がありません'
              : '試合が登録されていません'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map((match) => (
            <Link
              key={match.id}
              href={`/admin/matches/${match.id}`}
              className="block bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                      match.status
                    )}`}
                  >
                    {getStatusLabel(match.status)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(match.match_date).toLocaleDateString('ja-JP', {
                      month: 'numeric',
                      day: 'numeric',
                    })}{' '}
                    {new Date(match.match_date).toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {match.status === 'in_progress' && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      LIVE
                    </span>
                  )}
                </div>
                <span className="text-xs text-primary font-medium">
                  管理 →
                </span>
              </div>

              <div className="flex items-center justify-between">
                {/* ホームチーム */}
                <div className="flex-1">
                  <TeamBadge
                    name={match.home_team.name}
                    logoUrl={match.home_team.logo_url}
                    size="sm"
                    logoPosition="right"
                    textAlign="right"
                  />
                </div>

                {/* スコア */}
                <div className="flex items-center gap-3 px-4">
                  <span className="text-2xl font-bold text-gray-900 w-8 text-right">
                    {match.home_score ?? '-'}
                  </span>
                  <span className="text-lg text-gray-400">-</span>
                  <span className="text-2xl font-bold text-gray-900 w-8 text-left">
                    {match.away_score ?? '-'}
                  </span>
                </div>

                {/* アウェイチーム */}
                <div className="flex-1">
                  <TeamBadge
                    name={match.away_team.name}
                    logoUrl={match.away_team.logo_url}
                    size="sm"
                    logoPosition="left"
                    textAlign="left"
                  />
                </div>
              </div>

              {match.venue && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  会場: {match.venue}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
