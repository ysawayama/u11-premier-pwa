'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllTeams } from '@/lib/api/teams';
import type { TeamWithPrefecture } from '@/types/database';

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
            onClick={loadTeams}
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
            <h1 className="text-2xl font-bold text-blue-900">チーム一覧</h1>
            <Link
              href="/dashboard"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ← ダッシュボード
            </Link>
          </div>

          {/* 検索バー */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="チーム名、都道府県で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      {/* チーム名 */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {team.name}
                      </h3>

                      {/* 基本情報 */}
                      <div className="space-y-1 text-sm text-gray-600">
                        {team.short_name && (
                          <p className="text-blue-600 font-medium">
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
                        <span className="text-sm text-blue-600 font-medium">
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
