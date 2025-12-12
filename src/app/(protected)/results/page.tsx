'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { MatchWithTeams, Team } from '@/types/database';

const MY_TEAM_NAME = '大豆戸FC';

// リーグ設定
const LEAGUE_CONFIG = {
  name: '神奈川2部A',
  season: '2025',
};

type MatchResult = {
  homeScore: number | null;
  awayScore: number | null;
  matchDate: string | null;
  matchId: string | null;
};

// 複数試合対応のマトリックス型
type ResultMatrix = {
  [homeTeamId: string]: {
    [awayTeamId: string]: MatchResult[];  // 配列に変更
  };
};

/**
 * 試合結果のセルの背景色を取得
 */
function getResultColor(homeScore: number | null, awayScore: number | null): string {
  if (homeScore === null || awayScore === null) return 'transparent';
  if (homeScore > awayScore) return '#22c55e'; // 緑: 勝ち
  if (homeScore < awayScore) return '#ef4444'; // 赤: 負け
  return '#eab308'; // 黄: 引き分け
}

/**
 * 日付をフォーマット（月/日形式）
 */
function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}`;
}

/**
 * 結果セルコンポーネント（1試合分）
 */
function ResultCell({ result }: { result: MatchResult }) {
  const hasResult = result.homeScore !== null;
  const bgColor = hasResult
    ? getResultColor(result.homeScore, result.awayScore)
    : 'transparent';

  if (result.matchId) {
    return (
      <Link
        href={`/matches/${result.matchId}`}
        className="block p-0.5 rounded transition-opacity hover:opacity-80"
        style={{ background: bgColor }}
      >
        {hasResult ? (
          <>
            <span
              className="block text-[10px] font-bold leading-tight"
              style={{ color: bgColor !== 'transparent' ? 'white' : 'var(--text-primary)' }}
            >
              {result.homeScore}-{result.awayScore}
            </span>
            {result.matchDate && (
              <span
                className="block text-[7px] leading-tight"
                style={{ color: bgColor !== 'transparent' ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}
              >
                {formatShortDate(result.matchDate)}
              </span>
            )}
          </>
        ) : (
          <>
            <span className="block text-[8px] leading-tight" style={{ color: 'var(--text-muted)' }}>
              未定
            </span>
            {result.matchDate && (
              <span className="block text-[7px] leading-tight" style={{ color: 'var(--text-muted)' }}>
                {formatShortDate(result.matchDate)}
              </span>
            )}
          </>
        )}
      </Link>
    );
  }

  return null;
}

/**
 * 戦績表ページ
 */
export default function ResultsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [resultMatrix, setResultMatrix] = useState<ResultMatrix>({});

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      try {
        // 自チーム取得
        const { data: teamData } = await supabase
          .from('teams')
          .select('*')
          .eq('name', MY_TEAM_NAME)
          .single();

        if (teamData) {
          setMyTeam(teamData);
        }

        // 全チーム取得（順位順）
        const { data: currentSeason } = await supabase
          .from('seasons')
          .select('id')
          .eq('is_current', true)
          .single();

        let teamsData: Team[] = [];
        if (currentSeason) {
          // 順位表から順番にチームを取得
          const { data: standingsData } = await supabase
            .from('team_standings')
            .select('team:teams(*)')
            .eq('season_id', currentSeason.id)
            .order('rank', { ascending: true });

          if (standingsData) {
            teamsData = standingsData.map((s: any) => s.team).filter(Boolean);
          }
        }

        // 順位表にチームがない場合はアクティブなチームを取得
        if (teamsData.length === 0) {
          const { data: activeTeams } = await supabase
            .from('teams')
            .select('*')
            .eq('is_active', true)
            .order('name');

          teamsData = activeTeams || [];
        }

        setTeams(teamsData);

        // 全試合取得（日付順）
        const { data: matchesData } = await supabase
          .from('matches')
          .select(`
            *,
            home_team:teams!matches_home_team_id_fkey(*),
            away_team:teams!matches_away_team_id_fkey(*)
          `)
          .order('match_date', { ascending: true });

        if (matchesData) {
          setMatches(matchesData as MatchWithTeams[]);

          // 対戦マトリックスを構築（複数試合対応）
          const matrix: ResultMatrix = {};
          teamsData.forEach((team) => {
            matrix[team.id] = {};
            teamsData.forEach((opponent) => {
              if (team.id !== opponent.id) {
                matrix[team.id][opponent.id] = [];
              }
            });
          });

          matchesData.forEach((match: MatchWithTeams) => {
            if (matrix[match.home_team_id] && matrix[match.home_team_id][match.away_team_id]) {
              matrix[match.home_team_id][match.away_team_id].push({
                homeScore: match.home_score,
                awayScore: match.away_score,
                matchDate: match.match_date,
                matchId: match.id,
              });
            }
          });

          setResultMatrix(matrix);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

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

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* ヘッダー */}
      <header className="sticky top-0 z-40" style={{ background: 'var(--bg-header)' }}>
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg font-bold text-white">戦績表</h1>
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
      <main className="px-2 py-4">
        {teams.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: 'var(--text-secondary)' }}>チームデータがありません</p>
          </div>
        ) : (
          <>
            {/* 戦績マトリックス */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse" style={{ minWidth: '600px' }}>
                  {/* ヘッダー行（相手チーム） */}
                  <thead>
                    <tr>
                      <th
                        className="sticky left-0 z-20 p-1 text-[10px] font-semibold text-left"
                        style={{
                          background: '#4a5568',
                          color: 'rgba(255,255,255,0.9)',
                          minWidth: '100px',
                        }}
                      >
                        戦績表
                      </th>
                      {teams.map((team) => (
                        <th
                          key={team.id}
                          className="p-1 text-center"
                          style={{
                            background: '#4a5568', // グレー系に変更してロゴが見やすく
                            minWidth: '52px',
                            maxWidth: '52px',
                          }}
                        >
                          {team.logo_url ? (
                            <div className="w-6 h-6 mx-auto relative bg-white rounded-full p-0.5">
                              <Image
                                src={team.logo_url}
                                alt={team.short_name || team.name}
                                fill
                                className="object-contain"
                              />
                            </div>
                          ) : (
                            <div
                              className="w-6 h-6 mx-auto rounded-full flex items-center justify-center text-[8px] font-bold"
                              style={{
                                background: team.id === myTeam?.id ? 'var(--color-accent)' : 'rgba(255,255,255,0.9)',
                                color: team.id === myTeam?.id ? 'white' : '#333',
                              }}
                            >
                              {(team.short_name || team.name).slice(0, 2)}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  {/* ボディ（各チームの行） */}
                  <tbody>
                    {teams.map((homeTeam) => {
                      const isMyTeamRow = homeTeam.id === myTeam?.id;
                      return (
                        <tr key={homeTeam.id}>
                          {/* チーム名セル（固定） */}
                          <td
                            className="sticky left-0 z-10 p-1.5 border-b"
                            style={{
                              background: isMyTeamRow ? 'var(--color-accent-light, #e0f2fe)' : 'var(--bg-card)',
                              borderColor: 'var(--border)',
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              {homeTeam.logo_url ? (
                                <div className="w-5 h-5 flex-shrink-0 relative">
                                  <Image
                                    src={homeTeam.logo_url}
                                    alt={homeTeam.name}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              ) : (
                                <div
                                  className="w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-[8px] font-bold"
                                  style={{
                                    background: isMyTeamRow ? 'var(--color-accent)' : 'var(--bg-section)',
                                    color: isMyTeamRow ? 'white' : 'var(--text-secondary)',
                                  }}
                                >
                                  {(homeTeam.short_name || homeTeam.name)[0]}
                                </div>
                              )}
                              <span
                                className="text-[10px] font-medium truncate"
                                style={{
                                  color: isMyTeamRow ? 'var(--color-accent)' : 'var(--text-primary)',
                                  maxWidth: '70px',
                                }}
                              >
                                {homeTeam.short_name || homeTeam.name}
                              </span>
                            </div>
                          </td>

                          {/* 対戦結果セル */}
                          {teams.map((awayTeam) => {
                            const isSameTeam = homeTeam.id === awayTeam.id;
                            const results = resultMatrix[homeTeam.id]?.[awayTeam.id] || [];

                            if (isSameTeam) {
                              // 同じチームの対角線セル
                              return (
                                <td
                                  key={awayTeam.id}
                                  className="p-1 text-center border-b"
                                  style={{
                                    background: 'var(--bg-section)',
                                    borderColor: 'var(--border)',
                                    minWidth: '52px',
                                  }}
                                >
                                  <span className="text-gray-300">-</span>
                                </td>
                              );
                            }

                            return (
                              <td
                                key={awayTeam.id}
                                className="p-0.5 text-center border-b align-top"
                                style={{
                                  borderColor: 'var(--border)',
                                  minWidth: '52px',
                                }}
                              >
                                {results.length > 0 ? (
                                  <div className="flex flex-col gap-0.5">
                                    {results.map((result, idx) => (
                                      <ResultCell key={idx} result={result} />
                                    ))}
                                  </div>
                                ) : (
                                  <span className="block p-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                    -
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 凡例 */}
            <div className="mt-4 card p-4">
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                見方：行のチームがホーム、列のチームがアウェイ
              </p>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>勝ち</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>引き分け</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>負け</span>
                </div>
              </div>
            </div>

            {/* 補足 */}
            <div className="mt-4 p-4 rounded-lg" style={{ background: 'var(--bg-section)' }}>
              <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                ※スコアをタップすると試合詳細を確認できます。
                横スクロールで全チームの対戦結果を確認できます。
                同一対戦相手との複数試合は縦に並んで表示されます。
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
