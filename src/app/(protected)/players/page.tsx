'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllPlayers } from '@/lib/api/players';
import type { PlayerWithTeam } from '@/types/database';

/**
 * 選手一覧ページ
 */
export default function PlayersPage() {
  const [players, setPlayers] = useState<PlayerWithTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      const data = await getAllPlayers();
      setPlayers(data);
    } catch (err: any) {
      setError(err.message || '選手情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // フィルター処理
  const filteredPlayers = players.filter((player) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      player.family_name.toLowerCase().includes(query) ||
      player.given_name.toLowerCase().includes(query) ||
      player.family_name_kana.toLowerCase().includes(query) ||
      player.given_name_kana.toLowerCase().includes(query) ||
      player.team.name.toLowerCase().includes(query);

    const matchesGrade = selectedGrade ? player.grade === selectedGrade : true;
    const matchesPosition = selectedPosition
      ? player.position === selectedPosition
      : true;

    return matchesSearch && matchesGrade && matchesPosition;
  });

  // チームごとにグループ化
  const playersByTeam = filteredPlayers.reduce((acc, player) => {
    const teamName = player.team.name;
    if (!acc[teamName]) {
      acc[teamName] = {
        team: player.team,
        players: [],
      };
    }
    acc[teamName].players.push(player);
    return acc;
  }, {} as Record<string, { team: any; players: PlayerWithTeam[] }>);

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
            onClick={loadPlayers}
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
            <h1 className="text-2xl font-bold text-navy">選手一覧</h1>
            <Link
              href="/dashboard"
              className="text-sm text-primary hover:text-primary-hover"
            >
              ← ダッシュボード
            </Link>
          </div>

          {/* 検索バー */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="選手名、チーム名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* フィルター */}
          <div className="mt-4 flex flex-wrap gap-4">
            {/* 学年フィルター */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedGrade(null)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedGrade === null
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                全学年
              </button>
              {[4, 5, 6].map((grade) => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedGrade === grade
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {grade}年生
                </button>
              ))}
            </div>

            {/* ポジションフィルター */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPosition(null)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedPosition === null
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                全ポジション
              </button>
              {['GK', 'DF', 'MF', 'FW'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setSelectedPosition(pos)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedPosition === pos
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* 統計情報 */}
          <div className="mt-4 flex gap-4 text-sm text-gray-600">
            <span>全{players.length}名</span>
            <span>•</span>
            <span>{Object.keys(playersByTeam).length}チーム</span>
            <span>•</span>
            <span>検索結果: {filteredPlayers.length}名</span>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {searchQuery || selectedGrade || selectedPosition
                ? '検索条件に一致する選手が見つかりませんでした'
                : '選手が登録されていません'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(playersByTeam).map(([teamName, { team, players: teamPlayers }]) => (
              <div key={teamName}>
                {/* チームヘッダー */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Link
                      href={`/teams/${team.id}`}
                      className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm hover:bg-purple-200 transition-colors"
                    >
                      {teamName}
                    </Link>
                    <span className="ml-2 text-sm text-gray-600">
                      {teamPlayers.length}名
                    </span>
                  </h2>
                </div>

                {/* 選手グリッド */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {teamPlayers.map((player) => (
                    <Link
                      key={player.id}
                      href={`/players/${player.id}`}
                      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
                    >
                      {/* 背番号とポジション */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {player.uniform_number && (
                            <span className="text-2xl font-bold text-primary">
                              {player.uniform_number}
                            </span>
                          )}
                          {player.position && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                              {player.position}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {player.grade}年生
                        </span>
                      </div>

                      {/* 選手名 */}
                      <h3 className="text-base font-semibold text-gray-900 mb-1">
                        {player.family_name} {player.given_name}
                      </h3>
                      <p className="text-xs text-gray-600 mb-3">
                        {player.family_name_kana} {player.given_name_kana}
                      </p>

                      {/* アクションボタン */}
                      <div className="flex justify-end">
                        <span className="text-xs text-primary font-medium">
                          選手証を見る →
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
