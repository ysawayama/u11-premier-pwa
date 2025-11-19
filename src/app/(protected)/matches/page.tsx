'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getRecentMatches } from '@/lib/api/matches';
import type { MatchWithTeams, MatchStatus } from '@/types/database';

/**
 * 試合一覧ページ
 */
export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string | 'all'>('all');

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
    const matchesStatus = selectedStatus === 'all' || match.status === selectedStatus;
    const matchesType = selectedType === 'all' || match.match_type === selectedType;
    return matchesStatus && matchesType;
  });

  // 日付でグループ化
  const matchesByDate = filteredMatches.reduce((acc, match) => {
    const date = new Date(match.match_date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(match);
    return acc;
  }, {} as Record<string, MatchWithTeams[]>);

  // ステータス表示用のラベルと色
  const getStatusLabel = (status: MatchStatus) => {
    switch (status) {
      case 'scheduled':
        return { label: '予定', color: 'bg-blue-100 text-blue-800' };
      case 'in_progress':
        return { label: '進行中', color: 'bg-green-100 text-green-800' };
      case 'finished':
        return { label: '終了', color: 'bg-gray-100 text-gray-800' };
      case 'cancelled':
        return { label: '中止', color: 'bg-red-100 text-red-800' };
      case 'postponed':
        return { label: '延期', color: 'bg-yellow-100 text-yellow-800' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  // 試合タイプ表示用のラベル
  const getMatchTypeLabel = (type: string) => {
    switch (type) {
      case 'league':
        return 'リーグ戦';
      case 'championship':
        return 'チャンピオンシップ';
      case 'friendly':
        return '親善試合';
      default:
        return type;
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
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-900">試合一覧</h1>
            <Link
              href="/dashboard"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ← ダッシュボード
            </Link>
          </div>

          {/* フィルター */}
          <div className="mt-4 flex flex-wrap gap-4">
            {/* ステータスフィルター */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                全て
              </button>
              <button
                onClick={() => setSelectedStatus('scheduled')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedStatus === 'scheduled'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                予定
              </button>
              <button
                onClick={() => setSelectedStatus('in_progress')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedStatus === 'in_progress'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                進行中
              </button>
              <button
                onClick={() => setSelectedStatus('finished')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedStatus === 'finished'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                終了
              </button>
            </div>

            {/* タイプフィルター */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedType === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                全タイプ
              </button>
              <button
                onClick={() => setSelectedType('league')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedType === 'league'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                リーグ戦
              </button>
              <button
                onClick={() => setSelectedType('championship')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedType === 'championship'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                チャンピオンシップ
              </button>
              <button
                onClick={() => setSelectedType('friendly')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedType === 'friendly'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                親善試合
              </button>
            </div>
          </div>

          {/* 統計情報 */}
          <div className="mt-4 flex gap-4 text-sm text-gray-600">
            <span>全{matches.length}試合</span>
            <span>•</span>
            <span>表示中: {filteredMatches.length}試合</span>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {selectedStatus !== 'all' || selectedType !== 'all'
                ? 'フィルター条件に一致する試合が見つかりませんでした'
                : '試合が登録されていません'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(matchesByDate).map(([date, dateMatches]) => (
              <div key={date}>
                {/* 日付ヘッダー */}
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {date}
                  </span>
                  <span className="ml-2 text-sm text-gray-600">
                    {dateMatches.length}試合
                  </span>
                </h2>

                {/* 試合カードグリッド */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dateMatches.map((match) => {
                    const status = getStatusLabel(match.status);
                    return (
                      <Link
                        key={match.id}
                        href={`/matches/${match.id}`}
                        className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                      >
                        {/* カードヘッダー */}
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b border-blue-200">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-blue-900 font-medium">
                              {getMatchTypeLabel(match.match_type)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                          {match.venue && (
                            <p className="text-xs text-blue-700 mt-1 truncate">
                              {match.venue}
                            </p>
                          )}
                        </div>

                        {/* スコア表示 */}
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            {/* ホームチーム */}
                            <div className="flex-1 text-right pr-4">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {match.home_team.name}
                              </p>
                            </div>

                            {/* スコア */}
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-gray-900">
                                {match.home_score ?? '-'}
                              </span>
                              <span className="text-gray-400">:</span>
                              <span className="text-2xl font-bold text-gray-900">
                                {match.away_score ?? '-'}
                              </span>
                            </div>

                            {/* アウェイチーム */}
                            <div className="flex-1 text-left pl-4">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {match.away_team.name}
                              </p>
                            </div>
                          </div>

                          {/* 試合時刻 */}
                          <div className="text-center">
                            <p className="text-xs text-gray-600">
                              {new Date(match.match_date).toLocaleTimeString('ja-JP', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                              {' キックオフ'}
                            </p>
                          </div>

                          {/* アクションボタン */}
                          <div className="mt-3 flex justify-center">
                            <span className="text-xs text-blue-600 font-medium">
                              詳細を見る →
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
