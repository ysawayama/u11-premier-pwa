'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getMatchById } from '@/lib/api/matches';
import type { MatchWithTeams, MatchStatus } from '@/types/database';

/**
 * 試合詳細ページ
 */
export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [match, setMatch] = useState<MatchWithTeams | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMatch();
  }, [matchId]);

  const loadMatch = async () => {
    try {
      setLoading(true);
      const data = await getMatchById(matchId);
      setMatch(data);
    } catch (err: any) {
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || '試合が見つかりません'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  const status = getStatusLabel(match.status);
  const isFinished = match.status === 'finished';
  const isInProgress = match.status === 'in_progress';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/matches"
            className="text-sm text-primary hover:text-primary-hover mb-2 inline-block"
          >
            ← 試合一覧
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-navy">試合詳細</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
              {status.label}
            </span>
            {isInProgress && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                LIVE
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 試合情報カード */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          {/* カードヘッダー */}
          <div className="bg-gradient-to-r from-navy-light to-navy text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm opacity-90">
                {getMatchTypeLabel(match.match_type)}
              </span>
              <span className="text-sm opacity-90">
                {new Date(match.match_date).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            {/* スコアボード */}
            <div className="flex items-center justify-center gap-4">
              {/* ホームチーム */}
              <div className="flex-1 text-center">
                <Link
                  href={`/teams/${match.home_team.id}`}
                  className="hover:opacity-80 transition-opacity"
                >
                  <div className="flex flex-col items-center">
                    {match.home_team.logo_url ? (
                      <div className="w-16 h-16 relative mb-2">
                        <Image
                          src={match.home_team.logo_url}
                          alt={match.home_team.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                        <span className="text-2xl font-bold">
                          {match.home_team.short_name?.[0] || match.home_team.name[0]}
                        </span>
                      </div>
                    )}
                    <p className="text-sm font-semibold">
                      {match.home_team.short_name || match.home_team.name}
                    </p>
                  </div>
                  <div className="text-4xl font-bold mt-2">
                    {match.home_score ?? '-'}
                  </div>
                </Link>
              </div>

              {/* VS */}
              <div className="text-xl font-bold opacity-75">VS</div>

              {/* アウェイチーム */}
              <div className="flex-1 text-center">
                <Link
                  href={`/teams/${match.away_team.id}`}
                  className="hover:opacity-80 transition-opacity"
                >
                  <div className="flex flex-col items-center">
                    {match.away_team.logo_url ? (
                      <div className="w-16 h-16 relative mb-2">
                        <Image
                          src={match.away_team.logo_url}
                          alt={match.away_team.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                        <span className="text-2xl font-bold">
                          {match.away_team.short_name?.[0] || match.away_team.name[0]}
                        </span>
                      </div>
                    )}
                    <p className="text-sm font-semibold">
                      {match.away_team.short_name || match.away_team.name}
                    </p>
                  </div>
                  <div className="text-4xl font-bold mt-2">
                    {match.away_score ?? '-'}
                  </div>
                </Link>
              </div>
            </div>

            {/* キックオフ時刻 */}
            <div className="text-center mt-4">
              <p className="text-sm opacity-90">
                キックオフ:{' '}
                {new Date(match.match_date).toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* 試合詳細情報 */}
          <div className="p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {match.venue && (
                <div>
                  <dt className="text-sm font-medium text-gray-600">会場</dt>
                  <dd className="mt-1 text-sm text-gray-900">{match.venue}</dd>
                </div>
              )}
              {match.weather && (
                <div>
                  <dt className="text-sm font-medium text-gray-600">天候</dt>
                  <dd className="mt-1 text-sm text-gray-900">{match.weather}</dd>
                </div>
              )}
              {match.temperature !== null && (
                <div>
                  <dt className="text-sm font-medium text-gray-600">気温</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {match.temperature}°C
                  </dd>
                </div>
              )}
              {match.referee && (
                <div>
                  <dt className="text-sm font-medium text-gray-600">主審</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {match.referee}
                  </dd>
                </div>
              )}
            </dl>

            {match.notes && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{match.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* 試合イベント（将来実装予定） */}
        {isFinished && match.home_score !== null && match.away_score !== null && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              試合結果
            </h2>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                {match.home_score > match.away_score
                  ? `${match.home_team.name}の勝利`
                  : match.home_score < match.away_score
                  ? `${match.away_team.name}の勝利`
                  : '引き分け'}
              </p>
              <div className="flex items-center justify-center gap-4 text-3xl font-bold text-gray-900">
                <span>{match.home_team.short_name || match.home_team.name}</span>
                <span className="text-primary">
                  {match.home_score} - {match.away_score}
                </span>
                <span>{match.away_team.short_name || match.away_team.name}</span>
              </div>
            </div>
          </div>
        )}

        {/* 試合統計（将来実装予定） */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            試合イベント
          </h2>
          <div className="text-center py-12 text-gray-600">
            <p>試合イベント機能は準備中です</p>
            <p className="text-sm mt-2">
              得点、カード、選手交代などの情報を表示予定
            </p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="mt-6 flex gap-4 justify-center">
          <Link
            href={`/teams/${match.home_team.id}`}
            className="px-6 py-3 bg-white text-primary border-2 border-primary rounded-lg hover:bg-blue-50 font-medium transition-colors"
          >
            {match.home_team.short_name || match.home_team.name}の詳細
          </Link>
          <Link
            href={`/teams/${match.away_team.id}`}
            className="px-6 py-3 bg-white text-primary border-2 border-primary rounded-lg hover:bg-blue-50 font-medium transition-colors"
          >
            {match.away_team.short_name || match.away_team.name}の詳細
          </Link>
        </div>
      </main>
    </div>
  );
}
