'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllTeams } from '@/lib/api/teams';
import type { TeamWithPrefecture } from '@/types/database';

/**
 * チームエンブレム表示コンポーネント
 */
function TeamLogo({ logoUrl, teamName, size = 32 }: { logoUrl: string | null; teamName: string; size?: number }) {
  if (!logoUrl) {
    return (
      <div
        className="bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-xs font-bold flex-shrink-0"
        style={{ width: size, height: size }}
      >
        {teamName.charAt(0)}
      </div>
    );
  }

  return (
    <Image
      src={logoUrl}
      alt={`${teamName} エンブレム`}
      width={size}
      height={size}
      className="object-contain flex-shrink-0"
    />
  );
}

/**
 * チーム一覧ページ
 */
export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamWithPrefecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await getAllTeams();
      setTeams(data);
    } catch (err: any) {
      setError(err.message || 'チーム情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 検索フィルター
  const filteredTeams = teams.filter((team) => {
    const query = searchQuery.toLowerCase();
    return (
      team.name.toLowerCase().includes(query) ||
      team.name_kana?.toLowerCase().includes(query) ||
      team.prefecture.name.includes(query)
    );
  });

  // 都道府県ごとにグループ化
  const teamsByPrefecture = filteredTeams.reduce((acc, team) => {
    const prefName = team.prefecture.name;
    if (!acc[prefName]) {
      acc[prefName] = [];
    }
    acc[prefName].push(team);
    return acc;
  }, {} as Record<string, TeamWithPrefecture[]>);

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadTeams}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
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
            <h1 className="text-xl sm:text-2xl font-bold text-navy">チーム一覧</h1>
            <Link
              href="/dashboard"
              className="text-xs sm:text-sm text-primary hover:text-primary-hover min-h-[44px] flex items-center"
            >
              <span className="hidden sm:inline">← ダッシュボード</span>
              <span className="sm:hidden">🏠</span>
            </Link>
          </div>

          {/* 検索バー */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="チーム名、都道府県で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* 統計情報 */}
          <div className="mt-4 flex gap-4 text-sm text-gray-600">
            <span>全{teams.length}チーム</span>
            <span>•</span>
            <span>{Object.keys(teamsByPrefecture).length}都道府県</span>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {searchQuery
                ? '検索条件に一致するチームが見つかりませんでした'
                : 'チームが登録されていません'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(teamsByPrefecture).map(([prefName, prefTeams]) => (
              <div key={prefName}>
                {/* 都道府県ヘッダー */}
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {prefName}
                  </span>
                  <span className="ml-2 text-sm text-gray-600">
                    {prefTeams.length}チーム
                  </span>
                </h2>

                {/* チームグリッド */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prefTeams.map((team) => (
                    <Link
                      key={team.id}
                      href={`/teams/${team.id}`}
                      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                    >
                      {/* エンブレムとチーム名 */}
                      <div className="flex items-center gap-4 mb-3">
                        <TeamLogo logoUrl={team.logo_url} teamName={team.name} size={48} />
                        <h3 className="text-lg font-semibold text-gray-900">
                          {team.name}
                        </h3>
                      </div>

                      {/* 基本情報 */}
                      <div className="space-y-1 text-sm text-gray-600">
                        {team.short_name && (
                          <p className="text-primary font-medium">
                            {team.short_name}
                          </p>
                        )}
                        {team.founded_year && (
                          <p>設立: {team.founded_year}年</p>
                        )}
                        {team.home_ground && (
                          <p className="truncate">
                            ホーム: {team.home_ground}
                          </p>
                        )}
                      </div>

                      {/* アクションボタン */}
                      <div className="mt-4 flex justify-end">
                        <span className="text-sm text-primary font-medium">
                          詳細を見る →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
