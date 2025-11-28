'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getRecentMatches } from '@/lib/api/matches';
import { getAllTeams } from '@/lib/api/teams';
import type { MatchWithTeams, MatchStatus, TeamWithPrefecture } from '@/types/database';
import PageWrapper from '@/components/layout/PageWrapper';

/**
 * 試合結果ページ
 */
export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [teams, setTeams] = useState<TeamWithPrefecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string | 'all'>('all');
  const [selectedTeam, setSelectedTeam] = useState<string | 'all'>('all');
  const [dateSortOrder, setDateSortOrder] = useState<'oldest' | 'newest'>('newest');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [matchesData, teamsData] = await Promise.all([
        getRecentMatches(100),
        getAllTeams(),
      ]);
      setMatches(matchesData);
      setTeams(teamsData);
    } catch (err: any) {
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // フィルターリセット
  const handleResetFilters = () => {
    setSelectedStatus('all');
    setSelectedType('all');
    setSelectedTeam('all');
    setDateSortOrder('newest');
    setSearchQuery('');
  };

  // フィルター処理
  const filteredMatches = matches.filter((match) => {
    const matchesStatus = selectedStatus === 'all' || match.status === selectedStatus;
    const matchesType = selectedType === 'all' || match.match_type === selectedType;
    const matchesTeam = selectedTeam === 'all' ||
      match.home_team.id === selectedTeam ||
      match.away_team.id === selectedTeam;
    const matchesSearch = searchQuery === '' ||
      match.home_team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.away_team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.venue?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesTeam && matchesSearch;
  });

  // 日付でソートとグループ化
  const sortedMatches = [...filteredMatches].sort((a, b) => {
    const dateA = new Date(a.match_date).getTime();
    const dateB = new Date(b.match_date).getTime();
    return dateSortOrder === 'oldest' ? dateA - dateB : dateB - dateA;
  });

  const matchesByDate = sortedMatches.reduce((acc, match) => {
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

  // ヘッダーコンポーネント
  const headerContent = (
    <div className="flex justify-between items-center">
      <h1 className="text-xl font-bold text-white">試合結果</h1>
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
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
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
              onClick={loadData}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
      {/* フィルターセクション */}
      <div className="mb-4 pb-4 border-b border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-600">全{matches.length}試合 / 表示: {filteredMatches.length}試合</span>
          <button
            onClick={handleResetFilters}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            リセット
          </button>
        </div>

        {/* フィルター */}
        <div className="mt-4 space-y-4">
            {/* 検索ボックス */}
            <div className="flex items-center gap-2">
              <label htmlFor="search" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <span>🔍</span>
                <span>検索:</span>
              </label>
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="チーム名や会場名で検索..."
                className="flex-1 max-w-md px-4 py-2 rounded-lg text-sm border border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-sm text-gray-500 hover:text-gray-700"
                  title="検索をクリア"
                >
                  ✕
                </button>
              )}
            </div>

            {/* フィルターボタン群 */}
            <div className="flex flex-wrap gap-2 sm:gap-4">
            {/* ステータスフィルター */}
            <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap min-h-[36px] ${
                  selectedStatus === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                全て
              </button>
              <button
                onClick={() => setSelectedStatus('scheduled')}
                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap min-h-[36px] ${
                  selectedStatus === 'scheduled'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                予定
              </button>
              <button
                onClick={() => setSelectedStatus('in_progress')}
                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap min-h-[36px] ${
                  selectedStatus === 'in_progress'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                進行中
              </button>
              <button
                onClick={() => setSelectedStatus('finished')}
                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap min-h-[36px] ${
                  selectedStatus === 'finished'
                    ? 'bg-gray-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                終了
              </button>
            </div>

            {/* タイプフィルター */}
            <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap min-h-[36px] ${
                  selectedType === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                全タイプ
              </button>
              <button
                onClick={() => setSelectedType('league')}
                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap min-h-[36px] ${
                  selectedType === 'league'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                リーグ
              </button>
              <button
                onClick={() => setSelectedType('championship')}
                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap min-h-[36px] ${
                  selectedType === 'championship'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <span className="hidden sm:inline">チャンピオンシップ</span>
                <span className="sm:hidden">CS</span>
              </button>
              <button
                onClick={() => setSelectedType('friendly')}
                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap min-h-[36px] ${
                  selectedType === 'friendly'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                親善
              </button>
            </div>

            {/* チームフィルター */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="team-filter" className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                チーム:
              </label>
              <select
                id="team-filter"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="flex-1 sm:flex-none px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm border border-gray-300 bg-white hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 min-h-[36px]"
              >
                <option value="all">全チーム</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 日付ソート */}
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:block">
                並び順:
              </label>
              <div className="flex gap-1">
                <button
                  onClick={() => setDateSortOrder('newest')}
                  className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[36px] ${
                    dateSortOrder === 'newest'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  新しい順
                </button>
                <button
                  onClick={() => setDateSortOrder('oldest')}
                  className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors min-h-[36px] ${
                    dateSortOrder === 'oldest'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  古い順
                </button>
              </div>
            </div>

            {/* リセットボタン */}
            <button
              onClick={handleResetFilters}
              className="px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1 sm:gap-2 min-h-[36px]"
            >
              <span>🔄</span>
              <span className="hidden sm:inline">フィルターをリセット</span>
              <span className="sm:hidden">リセット</span>
            </button>
          </div>
        </div>
      </div>

      {/* 試合リスト */}
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
                            <div className="flex-1 flex items-center justify-end gap-2 pr-3">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {match.home_team.short_name || match.home_team.name}
                              </p>
                              {match.home_team.logo_url ? (
                                <div className="w-7 h-7 relative flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
                                  <Image
                                    src={match.home_team.logo_url}
                                    alt={match.home_team.name}
                                    fill
                                    className="object-contain"
                                    sizes="28px"
                                  />
                                </div>
                              ) : (
                                <div className="w-7 h-7 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-xs text-gray-500 font-bold">{(match.home_team.short_name || match.home_team.name).charAt(0)}</span>
                                </div>
                              )}
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
                            <div className="flex-1 flex items-center gap-2 pl-3">
                              {match.away_team.logo_url ? (
                                <div className="w-7 h-7 relative flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
                                  <Image
                                    src={match.away_team.logo_url}
                                    alt={match.away_team.name}
                                    fill
                                    className="object-contain"
                                    sizes="28px"
                                  />
                                </div>
                              ) : (
                                <div className="w-7 h-7 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-xs text-gray-500 font-bold">{(match.away_team.short_name || match.away_team.name).charAt(0)}</span>
                                </div>
                              )}
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {match.away_team.short_name || match.away_team.name}
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
    </PageWrapper>
  );
}
