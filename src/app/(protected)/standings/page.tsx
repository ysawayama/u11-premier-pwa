'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCurrentStandings } from '@/lib/api/standings';
import type { TeamStandingWithTeam } from '@/types/database';

// リーグ設定（神奈川2部A）
const LEAGUE_CONFIG = {
  name: '神奈川2部A',
  season: '2025',
  totalTeams: 11,
  promotionZone: 1,      // 自動昇格: 1位
  playoffZone: 2,        // 入替戦: 2位
  relegationStart: 7,    // 自動降格: 7-11位
};

/**
 * 順位に応じたゾーンを取得
 */
function getZone(rank: number | null): 'promotion' | 'playoff' | 'safe' | 'relegation' | null {
  if (!rank) return null;
  if (rank <= LEAGUE_CONFIG.promotionZone) return 'promotion';  // 1位: 自動昇格
  if (rank <= LEAGUE_CONFIG.playoffZone) return 'playoff';       // 2位: 入替戦
  if (rank >= LEAGUE_CONFIG.relegationStart) return 'relegation'; // 7-11位: 自動降格
  return 'safe';  // 3-6位: 残留
}

/**
 * ゾーンに応じた色を取得
 */
function getZoneColor(zone: 'promotion' | 'playoff' | 'safe' | 'relegation' | null): string {
  switch (zone) {
    case 'promotion': return '#22c55e'; // 緑: 自動昇格
    case 'playoff': return '#eab308';   // 黄: 入替戦
    case 'relegation': return '#ef4444'; // 赤: 自動降格
    default: return 'transparent';
  }
}

/**
 * チームエンブレム表示コンポーネント
 */
function TeamLogo({ logoUrl, teamName, size = 32 }: { logoUrl: string | null; teamName: string; size?: number }) {
  if (!logoUrl) {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
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
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* ヘッダー */}
      <header className="sticky top-0 z-40" style={{ background: 'var(--bg-header)' }}>
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-bold text-white">順位表</h1>
              <p className="text-xs text-white/60">
                {LEAGUE_CONFIG.name}・{LEAGUE_CONFIG.season}シーズン
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-xs text-white/70 hover:text-white min-h-[44px] flex items-center"
            >
              ← 戻る
            </Link>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="px-4 py-4">
        {standings.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: 'var(--text-secondary)' }}>順位表データがありません</p>
          </div>
        ) : (
          <>
            {/* 順位表 */}
            <div className="card overflow-hidden">
              {/* テーブルヘッダー */}
              <div
                className="flex items-center px-3 py-2 text-[10px] font-semibold"
                style={{
                  background: 'var(--bg-header)',
                  color: 'rgba(255,255,255,0.6)',
                }}
              >
                <span className="w-2"></span>
                <span className="w-7 text-center">順位</span>
                <span className="flex-1 min-w-0 pl-1">クラブ</span>
                <span className="w-8 text-center">勝点</span>
                <span className="w-6 text-center">勝</span>
                <span className="w-6 text-center">分</span>
                <span className="w-6 text-center">負</span>
                <span className="w-8 text-center">得</span>
                <span className="w-8 text-center">失</span>
                <span className="w-8 text-center">差</span>
              </div>

              {/* テーブルボディ */}
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {standings.map((standing, index) => {
                  const rank = standing.rank || index + 1;
                  const zone = getZone(rank);
                  const zoneColor = getZoneColor(zone);
                  const isMyTeam = standing.team?.name === '大豆戸FC';

                  return (
                    <Link
                      key={standing.id}
                      href={`/teams/${standing.team_id}`}
                      className={`flex items-center px-3 py-2.5 transition-colors hover:bg-gray-50 ${isMyTeam ? 'bg-blue-50' : ''}`}
                    >
                      {/* ゾーンインジケーター（左の色付きライン） */}
                      <div
                        className="w-1 h-8 rounded-full mr-1"
                        style={{ backgroundColor: zoneColor }}
                      />

                      {/* 順位 */}
                      <span
                        className="w-7 text-sm font-bold text-center"
                        style={{ color: isMyTeam ? 'var(--color-accent)' : 'var(--text-primary)' }}
                      >
                        {rank}
                      </span>

                      {/* チーム名 */}
                      <div className="flex-1 flex items-center gap-2 min-w-0 pl-1">
                        {standing.team?.logo_url ? (
                          <div className="w-6 h-6 flex-shrink-0 relative">
                            <Image
                              src={standing.team.logo_url}
                              alt={standing.team.name}
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                            style={{
                              background: isMyTeam ? 'var(--color-accent)' : 'var(--bg-section)',
                              color: isMyTeam ? 'white' : 'var(--text-secondary)',
                            }}
                          >
                            {standing.team?.short_name?.[0] || standing.team?.name?.[0] || '?'}
                          </div>
                        )}
                        <span
                          className="text-xs font-medium truncate"
                          style={{
                            color: isMyTeam ? 'var(--color-accent)' : 'var(--text-primary)',
                          }}
                        >
                          {standing.team?.short_name || standing.team?.name}
                        </span>
                      </div>

                      {/* 勝点 */}
                      <span
                        className="w-8 text-sm font-bold text-center"
                        style={{ color: 'var(--color-navy)' }}
                      >
                        {standing.points}
                      </span>

                      {/* 勝 */}
                      <span
                        className="w-6 text-xs text-center"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {standing.wins}
                      </span>

                      {/* 分 */}
                      <span
                        className="w-6 text-xs text-center"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {standing.draws}
                      </span>

                      {/* 負 */}
                      <span
                        className="w-6 text-xs text-center"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {standing.losses}
                      </span>

                      {/* 得点 */}
                      <span
                        className="w-8 text-xs text-center"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {standing.goals_for}
                      </span>

                      {/* 失点 */}
                      <span
                        className="w-8 text-xs text-center"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {standing.goals_against}
                      </span>

                      {/* 得失点差 */}
                      <span
                        className="w-8 text-xs font-medium text-center"
                        style={{
                          color: standing.goal_difference > 0
                            ? 'var(--color-win)'
                            : standing.goal_difference < 0
                            ? 'var(--color-lose)'
                            : 'var(--text-muted)',
                        }}
                      >
                        {standing.goal_difference > 0 ? '+' : ''}
                        {standing.goal_difference}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 凡例 */}
            <div className="mt-4 card p-4">
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#22c55e' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>自動昇格</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#eab308' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>入替戦</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#ef4444' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>自動降格</span>
                </div>
              </div>
            </div>

            {/* 補足情報 */}
            <div className="mt-4 p-4 rounded-lg" style={{ background: 'var(--bg-section)' }}>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                ※シーズン中については年間順位決定の条件のなかで勝点、得失点差、総得点数を考慮した表記となります。
                リーグ戦が終了した時点で、その他の条件を加味した年間順位が決定次第、年間順位に更新いたします。
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
