'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentStandings } from '@/lib/api/standings';
import type { TeamStandingWithTeam } from '@/types/database';

/**
 * チームエンブレム表示コンポーネント
 */
function TeamLogo({ logoUrl, teamName, size = 32 }: { logoUrl: string | null; teamName: string; size?: number }) {
  if (!logoUrl) {
    // エンブレムがない場合はプレースホルダー
    return (
      <div
        className="bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-xs font-bold"
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
      className="object-contain"
    />
  );
}

/**
 * 順位表ページ
 */
export default function StandingsPage() {
  const [standings, setStandings] = useState<TeamStandingWithTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStandings();
  }, []);

  const loadStandings = async () => {
    try {
      setLoading(true);
      const data = await getCurrentStandings();
      setStandings(data);
    } catch (err: any) {
      setError(err.message || '順位表の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ランクに応じたバッジを表示
  const getRankBadge = (rank: number | null) => {
    if (!rank) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 text-gray-400 font-semibold">
          -
        </span>
      );
    }
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-white font-bold shadow-md">
          {rank}
        </span>
      );
    } else if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-white font-bold shadow-md">
          {rank}
        </span>
      );
    } else if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold shadow-md">
          {rank}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 text-gray-700 font-semibold">
          {rank}
        </span>
      );
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadStandings}
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
            <h1 className="text-xl sm:text-2xl font-bold text-navy">順位表</h1>
            <Link
              href="/dashboard"
              className="text-xs sm:text-sm text-primary hover:text-primary-hover min-h-[44px] flex items-center"
            >
              <span className="hidden sm:inline">← ダッシュボード</span>
              <span className="sm:hidden">🏠</span>
            </Link>
          </div>

          {/* シーズン情報 */}
          <div className="mt-2 text-sm text-gray-600">
            <span>2025-2026 シーズン</span>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {standings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">順位表データがありません</p>
          </div>
        ) : (
          <>
            {/* トップ3チーム */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                TOP 3
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {standings.slice(0, 3).map((standing) => (
                  <Link
                    key={standing.id}
                    href={`/teams/${standing.team.id}`}
                    className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 text-center"
                  >
                    <div className="flex justify-center mb-3">
                      {getRankBadge(standing.rank)}
                    </div>
                    <div className="flex justify-center mb-3">
                      <TeamLogo logoUrl={standing.team.logo_url} teamName={standing.team.name} size={48} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {standing.team.name}
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-gray-600">勝点</p>
                        <p className="text-2xl font-bold text-primary">
                          {standing.points}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">試合</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {standing.matches_played}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">得失点差</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {standing.goal_difference > 0
                            ? `+${standing.goal_difference}`
                            : standing.goal_difference}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 全順位表 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-navy-light to-navy">
                <h2 className="text-lg font-semibold text-white">
                  全チーム順位表
                </h2>
              </div>

              {/* デスクトップ表示 */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-center py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        順位
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        チーム名
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        試合数
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        勝
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        分
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        敗
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        得点
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        失点
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        得失点差
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-gray-600 uppercase tracking-wider">
                        勝点
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {standings.map((standing) => (
                      <tr
                        key={standing.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          standing.rank && standing.rank <= 3 ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-center">
                          {getRankBadge(standing.rank)}
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/teams/${standing.team.id}`}
                            className="flex items-center gap-3 text-primary hover:text-primary-hover font-medium hover:underline"
                          >
                            <TeamLogo logoUrl={standing.team.logo_url} teamName={standing.team.name} size={28} />
                            {standing.team.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          {standing.matches_played}
                        </td>
                        <td className="py-3 px-4 text-center text-sm font-medium text-green-600">
                          {standing.wins}
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-gray-600">
                          {standing.draws}
                        </td>
                        <td className="py-3 px-4 text-center text-sm text-red-600">
                          {standing.losses}
                        </td>
                        <td className="py-3 px-4 text-center text-sm font-medium">
                          {standing.goals_for}
                        </td>
                        <td className="py-3 px-4 text-center text-sm">
                          {standing.goals_against}
                        </td>
                        <td className="py-3 px-4 text-center text-sm font-medium">
                          {standing.goal_difference > 0
                            ? `+${standing.goal_difference}`
                            : standing.goal_difference}
                        </td>
                        <td className="py-3 px-4 text-center text-lg font-bold text-primary">
                          {standing.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* モバイル表示 */}
              <div className="md:hidden divide-y divide-gray-200">
                {standings.map((standing) => (
                  <Link
                    key={standing.id}
                    href={`/teams/${standing.team.id}`}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {getRankBadge(standing.rank)}
                      <TeamLogo logoUrl={standing.team.logo_url} teamName={standing.team.name} size={32} />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {standing.team.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {standing.points}
                        </p>
                        <p className="text-xs text-gray-600">pts</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-sm">
                      <div>
                        <p className="text-xs text-gray-600">試合</p>
                        <p className="font-medium">{standing.matches_played}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">勝/分/敗</p>
                        <p className="font-medium">
                          {standing.wins}/{standing.draws}/{standing.losses}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">得/失</p>
                        <p className="font-medium">
                          {standing.goals_for}/{standing.goals_against}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">得失差</p>
                        <p className="font-medium">
                          {standing.goal_difference > 0
                            ? `+${standing.goal_difference}`
                            : standing.goal_difference}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 凡例 */}
            <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                順位表の見方
              </h3>
              <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <dt className="text-gray-600 mb-1">勝点</dt>
                  <dd className="text-gray-900">勝利3点、引分1点、敗北0点</dd>
                </div>
                <div>
                  <dt className="text-gray-600 mb-1">得失点差</dt>
                  <dd className="text-gray-900">得点 - 失点</dd>
                </div>
                <div>
                  <dt className="text-gray-600 mb-1">同勝点の場合</dt>
                  <dd className="text-gray-900">
                    1. 得失点差 2. 総得点 3. 直接対決
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-600 mb-1">チャンピオンシップ</dt>
                  <dd className="text-gray-900">上位チームが進出</dd>
                </div>
              </dl>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
