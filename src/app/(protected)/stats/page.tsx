'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface PlayerStats {
  player_id: string;
  player: {
    id: string;
    family_name: string;
    given_name: string;
    uniform_number: number | null;
    team: {
      id: string;
      name: string;
      short_name: string | null;
    };
  };
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
}

/**
 * 選手統計ページ
 */
export default function StatsPage() {
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'goals' | 'assists'>('goals');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // 得点ランキングを取得
      const { data: goalsData, error: goalsError } = await supabase
        .from('match_events')
        .select(`
          player_id,
          player:players(
            id,
            family_name,
            given_name,
            uniform_number,
            team:teams(id, name, short_name)
          )
        `)
        .eq('event_type', 'goal')
        .not('player_id', 'is', null);

      if (goalsError) throw goalsError;

      // アシストランキングを取得
      const { data: assistsData, error: assistsError } = await supabase
        .from('match_events')
        .select(`
          assisted_by_player_id,
          player:players!match_events_assisted_by_player_id_fkey(
            id,
            family_name,
            given_name,
            uniform_number,
            team:teams(id, name, short_name)
          )
        `)
        .eq('event_type', 'goal')
        .not('assisted_by_player_id', 'is', null);

      if (assistsError) throw assistsError;

      // イエローカード集計
      const { data: yellowCardsData, error: yellowCardsError } = await supabase
        .from('match_events')
        .select(`
          player_id,
          player:players(
            id,
            family_name,
            given_name,
            uniform_number,
            team:teams(id, name, short_name)
          )
        `)
        .eq('event_type', 'yellow_card')
        .not('player_id', 'is', null);

      if (yellowCardsError) throw yellowCardsError;

      // レッドカード集計
      const { data: redCardsData, error: redCardsError } = await supabase
        .from('match_events')
        .select(`
          player_id,
          player:players(
            id,
            family_name,
            given_name,
            uniform_number,
            team:teams(id, name, short_name)
          )
        `)
        .eq('event_type', 'red_card')
        .not('player_id', 'is', null);

      if (redCardsError) throw redCardsError;

      // データを集計
      const statsMap = new Map<string, PlayerStats>();

      // ゴールを集計
      goalsData?.forEach((item: any) => {
        if (!item.player) return;
        const playerId = item.player_id;
        if (!statsMap.has(playerId)) {
          statsMap.set(playerId, {
            player_id: playerId,
            player: item.player,
            goals: 0,
            assists: 0,
            yellow_cards: 0,
            red_cards: 0,
          });
        }
        statsMap.get(playerId)!.goals++;
      });

      // アシストを集計
      assistsData?.forEach((item: any) => {
        if (!item.player) return;
        const playerId = item.assisted_by_player_id;
        if (!statsMap.has(playerId)) {
          statsMap.set(playerId, {
            player_id: playerId,
            player: item.player,
            goals: 0,
            assists: 0,
            yellow_cards: 0,
            red_cards: 0,
          });
        }
        statsMap.get(playerId)!.assists++;
      });

      // イエローカードを集計
      yellowCardsData?.forEach((item: any) => {
        if (!item.player) return;
        const playerId = item.player_id;
        if (!statsMap.has(playerId)) {
          statsMap.set(playerId, {
            player_id: playerId,
            player: item.player,
            goals: 0,
            assists: 0,
            yellow_cards: 0,
            red_cards: 0,
          });
        }
        statsMap.get(playerId)!.yellow_cards++;
      });

      // レッドカードを集計
      redCardsData?.forEach((item: any) => {
        if (!item.player) return;
        const playerId = item.player_id;
        if (!statsMap.has(playerId)) {
          statsMap.set(playerId, {
            player_id: playerId,
            player: item.player,
            goals: 0,
            assists: 0,
            yellow_cards: 0,
            red_cards: 0,
          });
        }
        statsMap.get(playerId)!.red_cards++;
      });

      const statsArray = Array.from(statsMap.values());
      setStats(statsArray);
    } catch (err: any) {
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const sortedStats = [...stats].sort((a, b) => {
    if (sortBy === 'goals') {
      return b.goals - a.goals || b.assists - a.assists;
    } else {
      return b.assists - a.assists || b.goals - a.goals;
    }
  });

  const topScorers = sortedStats.filter((s) => s.goals > 0).slice(0, 3);
  const topAssisters = [...stats]
    .sort((a, b) => b.assists - a.assists || b.goals - a.goals)
    .filter((s) => s.assists > 0)
    .slice(0, 3);

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
            onClick={loadStats}
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
            <h1 className="text-2xl font-bold text-blue-900">選手統計</h1>
            <Link
              href="/dashboard"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ← ダッシュボード
            </Link>
          </div>

          {/* フィルター */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setSortBy('goals')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                sortBy === 'goals'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              得点ランキング
            </button>
            <button
              onClick={() => setSortBy('assists')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                sortBy === 'assists'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              アシストランキング
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TOP 3 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {sortBy === 'goals' ? '得点王争い TOP 3' : 'アシスト王争い TOP 3'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(sortBy === 'goals' ? topScorers : topAssisters).map((stat, index) => (
              <Link
                key={stat.player_id}
                href={`/players/${stat.player.id}`}
                className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 text-center"
              >
                <div className="flex justify-center mb-3">
                  <span
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-lg ${
                      index === 0
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                        : index === 1
                        ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                        : 'bg-gradient-to-br from-orange-400 to-orange-600'
                    }`}
                  >
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {stat.player.family_name} {stat.player.given_name}
                </h3>
                {stat.player.uniform_number && (
                  <p className="text-sm text-gray-600 mb-2">
                    #{stat.player.uniform_number}
                  </p>
                )}
                <p className="text-xs text-gray-600 mb-4">
                  {stat.player.team.short_name || stat.player.team.name}
                </p>
                <div className="text-3xl font-bold text-blue-600">
                  {sortBy === 'goals' ? stat.goals : stat.assists}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {sortBy === 'goals' ? 'ゴール' : 'アシスト'}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* 全ランキング */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-800">
            <h2 className="text-lg font-semibold text-white">
              全選手ランキング
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                    順位
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                    選手名
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                    チーム
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                    ゴール
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                    アシスト
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                    🟨
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                    🟥
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedStats.map((stat, index) => (
                  <tr
                    key={stat.player_id}
                    className={`hover:bg-gray-50 transition-colors ${
                      index < 3 ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-center font-semibold">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/players/${stat.player.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                      >
                        {stat.player.uniform_number && `#${stat.player.uniform_number} `}
                        {stat.player.family_name} {stat.player.given_name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      <Link
                        href={`/teams/${stat.player.team.id}`}
                        className="hover:text-blue-600"
                      >
                        {stat.player.team.short_name || stat.player.team.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-blue-600">
                      {stat.goals}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-green-600">
                      {stat.assists}
                    </td>
                    <td className="py-3 px-4 text-center text-sm">
                      {stat.yellow_cards || '-'}
                    </td>
                    <td className="py-3 px-4 text-center text-sm">
                      {stat.red_cards || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedStats.length === 0 && (
            <div className="text-center py-12 text-gray-600">
              <p>まだ記録されたデータがありません</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
