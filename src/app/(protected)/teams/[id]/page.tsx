'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTeamById } from '@/lib/api/teams';
import { getPlayersByTeam } from '@/lib/api/players';
import type { TeamWithPrefecture, PlayerWithTeam } from '@/types/database';

/**
 * チーム詳細ページ
 */
export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;

  const [team, setTeam] = useState<TeamWithPrefecture | null>(null);
  const [players, setPlayers] = useState<PlayerWithTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [teamId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teamData, playersData] = await Promise.all([
        getTeamById(teamId),
        getPlayersByTeam(teamId),
      ]);
      setTeam(teamData);
      setPlayers(playersData);
    } catch (err: any) {
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
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

  if (error || !team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'チームが見つかりません'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/teams"
            className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
          >
            ← チーム一覧
          </Link>
          <h1 className="text-2xl font-bold text-blue-900">{team.name}</h1>
          {team.short_name && (
            <p className="text-sm text-gray-600 mt-1">{team.short_name}</p>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* チーム情報カード */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            チーム情報
          </h2>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-600">所属</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {team.prefecture.name}
              </dd>
            </div>
            {team.founded_year && (
              <div>
                <dt className="text-sm font-medium text-gray-600">設立年</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {team.founded_year}年
                </dd>
              </div>
            )}
            {team.home_ground && (
              <div>
                <dt className="text-sm font-medium text-gray-600">
                  ホームグラウンド
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {team.home_ground}
                </dd>
              </div>
            )}
            {team.website_url && (
              <div>
                <dt className="text-sm font-medium text-gray-600">
                  ウェブサイト
                </dt>
                <dd className="mt-1 text-sm text-blue-600">
                  <a
                    href={team.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {team.website_url}
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* 選手一覧 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              所属選手 ({players.length}名)
            </h2>
          </div>

          {players.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              選手が登録されていません
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      背番号
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      氏名
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      ポジション
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      学年
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      アクション
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr
                      key={player.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm">
                        {player.uniform_number || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        {player.family_name} {player.given_name}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {player.position || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {player.grade}年生
                      </td>
                      <td className="py-3 px-4 text-sm text-right">
                        <Link
                          href={`/players/${player.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          詳細 →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
