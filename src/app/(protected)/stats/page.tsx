'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Medal } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface ScoringRanking {
  id: string;
  player_name: string;
  team_name: string;
  goals: number;
  rank: number;
}

function getRankDisplay(rank: number): { icon: string | null; className: string } {
  if (rank === 1) return { icon: '🥇', className: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' };
  if (rank === 2) return { icon: '🥈', className: 'bg-gradient-to-r from-gray-300 to-gray-400 text-white' };
  if (rank === 3) return { icon: '🥉', className: 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' };
  return { icon: null, className: 'bg-gray-100 text-gray-700' };
}

export default function StatsPage() {
  const [rankings, setRankings] = useState<ScoringRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(20);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // 現在のシーズンを取得
      const { data: currentSeason } = await supabase
        .from('seasons')
        .select('id')
        .eq('is_current', true)
        .single();

      if (!currentSeason) {
        setError('現在のシーズンが見つかりません');
        return;
      }

      // 得点ランキングを取得
      const { data, error: fetchError } = await supabase
        .from('scoring_rankings')
        .select('*')
        .eq('season_id', currentSeason.id)
        .order('rank', { ascending: true });

      if (fetchError) throw fetchError;

      setRankings(data || []);
    } catch (err: any) {
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const topThree = rankings.slice(0, 3);
  const restRankings = rankings.slice(3, displayCount);
  const hasMore = rankings.length > displayCount;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadRankings}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
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
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-navy flex items-center gap-2">
                <Trophy size={24} className="text-yellow-500" />
                得点ランキング
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">神奈川2部A</p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {rankings.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <Medal size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">まだデータがありません</p>
            <p className="text-sm text-gray-400 mt-2">
              SQLを実行してデータを登録してください
            </p>
          </div>
        ) : (
          <>
            {/* TOP 3 表彰台 */}
            <div className="mb-6">
              <div className="flex items-end justify-center gap-2 sm:gap-4">
                {/* 2位 */}
                {topThree[1] && (
                  <div className="flex flex-col items-center flex-1 max-w-[120px]">
                    <div className="bg-white rounded-xl shadow-md p-3 w-full text-center mb-2">
                      <span className="text-2xl">🥈</span>
                      <p className="font-bold text-sm mt-1 truncate">{topThree[1].player_name}</p>
                      <p className="text-xs text-gray-500 truncate">{topThree[1].team_name}</p>
                      <p className="text-xl font-black text-primary mt-2">{topThree[1].goals}</p>
                      <p className="text-[10px] text-gray-400">ゴール</p>
                    </div>
                    <div className="w-full h-16 bg-gradient-to-t from-gray-300 to-gray-200 rounded-t-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">2</span>
                    </div>
                  </div>
                )}

                {/* 1位 */}
                {topThree[0] && (
                  <div className="flex flex-col items-center flex-1 max-w-[140px] -mb-2">
                    <div className="bg-white rounded-xl shadow-lg p-4 w-full text-center mb-2 border-2 border-yellow-400">
                      <span className="text-3xl">🥇</span>
                      <p className="font-bold text-base mt-1 truncate">{topThree[0].player_name}</p>
                      <p className="text-xs text-gray-500 truncate">{topThree[0].team_name}</p>
                      <p className="text-3xl font-black text-primary mt-2">{topThree[0].goals}</p>
                      <p className="text-xs text-gray-400">ゴール</p>
                    </div>
                    <div className="w-full h-24 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-t-lg flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">1</span>
                    </div>
                  </div>
                )}

                {/* 3位 */}
                {topThree[2] && (
                  <div className="flex flex-col items-center flex-1 max-w-[120px]">
                    <div className="bg-white rounded-xl shadow-md p-3 w-full text-center mb-2">
                      <span className="text-2xl">🥉</span>
                      <p className="font-bold text-sm mt-1 truncate">{topThree[2].player_name}</p>
                      <p className="text-xs text-gray-500 truncate">{topThree[2].team_name}</p>
                      <p className="text-xl font-black text-primary mt-2">{topThree[2].goals}</p>
                      <p className="text-[10px] text-gray-400">ゴール</p>
                    </div>
                    <div className="w-full h-12 bg-gradient-to-t from-orange-400 to-orange-300 rounded-t-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">3</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4位以下のリスト */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-navy">
                <h2 className="text-sm font-semibold text-white">全選手ランキング</h2>
              </div>

              {/* ヘッダー行 */}
              <div className="flex items-center px-4 py-2 bg-gray-50 border-b text-xs font-medium text-gray-500">
                <span className="w-12 text-center">順位</span>
                <span className="flex-1">選手名</span>
                <span className="w-20 text-center">ゴール</span>
              </div>

              {/* ランキング行 */}
              <div className="divide-y divide-gray-100">
                {restRankings.map((player, index) => {
                  const rankDisplay = getRankDisplay(player.rank);
                  const isEvenRow = index % 2 === 1;

                  return (
                    <div
                      key={player.id}
                      className={`flex items-center px-4 py-3 ${isEvenRow ? 'bg-gray-50/50' : ''}`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${rankDisplay.className}`}>
                        {rankDisplay.icon || player.rank}
                      </span>
                      <div className="flex-1 ml-3 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {player.player_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {player.team_name}
                        </p>
                      </div>
                      <span className="w-20 text-center text-lg font-bold text-primary">
                        {player.goals}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* もっと見るボタン */}
              {hasMore && (
                <div className="px-4 py-4 border-t bg-gray-50">
                  <button
                    onClick={() => setDisplayCount(prev => prev + 20)}
                    className="w-full py-3 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-sm transition-colors"
                  >
                    もっと見る（残り{rankings.length - displayCount}人）
                  </button>
                </div>
              )}

              {/* 全員表示後 */}
              {!hasMore && rankings.length > 20 && (
                <div className="px-4 py-3 border-t bg-gray-50 text-center">
                  <p className="text-xs text-gray-500">
                    全 {rankings.length} 選手を表示中
                  </p>
                </div>
              )}
            </div>

            {/* 注釈 */}
            <p className="text-xs text-gray-400 text-center mt-4">
              ※ データは公式サイト（pl11.jp）に基づく
            </p>
          </>
        )}
      </main>
    </div>
  );
}
