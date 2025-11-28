'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/lib/stores/authStore';
import { createClient } from '@/lib/supabase/client';
import type { MatchWithTeams, Team, TeamStandingWithTeam, Player } from '@/types/database';

const MY_TEAM_NAME = '大豆戸FC';

function formatMatchDate(dateStr: string): { day: string; month: string; weekday: string; time: string; full: string } {
  const date = new Date(dateStr);
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  return {
    day: date.getDate().toString(),
    month: (date.getMonth() + 1).toString(),
    weekday: weekdays[date.getDay()],
    time: date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
    full: `${date.getMonth() + 1}/${date.getDate()}(${weekdays[date.getDay()]})`,
  };
}

function isToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

function getRankIcon(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return rank.toString();
}

function getRankClass(rank: number): string {
  if (rank === 1) return 'rank-1';
  if (rank === 2) return 'rank-2';
  if (rank === 3) return 'rank-3';
  return '';
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const [nextMatch, setNextMatch] = useState<MatchWithTeams | null>(null);
  const [thisWeekMatches, setThisWeekMatches] = useState<MatchWithTeams[]>([]);
  const [standings, setStandings] = useState<TeamStandingWithTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      try {
        const { data: teamData } = await supabase
          .from('teams')
          .select('*')
          .eq('name', MY_TEAM_NAME)
          .single();

        if (teamData) {
          setMyTeam(teamData);

          const now = new Date().toISOString();
          const { data: nextMatchData } = await supabase
            .from('matches')
            .select(`*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)`)
            .or(`home_team_id.eq.${teamData.id},away_team_id.eq.${teamData.id}`)
            .gte('match_date', now)
            .eq('status', 'scheduled')
            .order('match_date', { ascending: true })
            .limit(1)
            .single();

          if (nextMatchData) setNextMatch(nextMatchData as MatchWithTeams);
        }

        const startOfWeek = new Date();
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        const { data: weekMatches } = await supabase
          .from('matches')
          .select(`*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)`)
          .gte('match_date', startOfWeek.toISOString())
          .lte('match_date', endOfWeek.toISOString())
          .order('match_date', { ascending: true })
          .limit(10);

        if (weekMatches) setThisWeekMatches(weekMatches as MatchWithTeams[]);

        const { data: currentSeason } = await supabase
          .from('seasons')
          .select('id')
          .eq('is_current', true)
          .single();

        if (currentSeason) {
          const { data: standingsData } = await supabase
            .from('team_standings')
            .select(`*, team:teams(*)`)
            .eq('season_id', currentSeason.id)
            .order('rank', { ascending: true });

          if (standingsData) setStandings(standingsData as TeamStandingWithTeam[]);
        }

        // ログインユーザーに紐づくプレイヤー情報を取得
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: playerData } = await supabase
            .from('players')
            .select('*')
            .eq('user_id', authUser.id)
            .single();

          if (playerData) setMyPlayer(playerData as Player);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const myTeamStanding = standings.find((s) => s.team_id === myTeam?.id);

  // ポジション表示名
  const getPositionLabel = (position: string | null) => {
    if (!position) return '';
    const positionMap: Record<string, string> = {
      'GK': 'GK',
      'DF': 'DF',
      'MF': 'MF',
      'FW': 'FW',
    };
    return positionMap[position] || position;
  };

  return (
    <div className="min-h-screen">
      {/* Header - 背景と馴染むようにやや透過 */}
      <header className="bg-black/20 backdrop-blur-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            {/* リーグロゴ（白地付き） */}
            <div className="bg-white rounded-lg px-3 py-1.5 shadow-sm">
              <Image
                src="/images/u11-premier-logo-wide.png"
                alt="U-11 Premier League"
                width={120}
                height={40}
                className="h-8 w-auto object-contain"
                priority
              />
            </div>
            <Link
              href="/settings"
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </Link>
          </div>

          {/* User Card in Header */}
          {myTeam && (
            <div
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.1)' }}
            >
              {/* チームロゴ */}
              {myTeam.logo_url ? (
                <div className="w-11 h-11 relative flex-shrink-0 rounded-full overflow-hidden bg-white">
                  <Image
                    src={myTeam.logo_url}
                    alt={myTeam.name}
                    fill
                    className="object-contain p-0.5"
                    sizes="44px"
                  />
                </div>
              ) : (
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'var(--color-accent)', color: 'white' }}
                >
                  {myTeam.short_name?.[0] || myTeam.name[0]}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-inverse)' }}>
                    {user?.full_name || 'ゲスト'}さん
                  </p>
                  {/* ポジション・背番号 */}
                  {myPlayer && (myPlayer.position || myPlayer.uniform_number) && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white/90">
                      {myPlayer.position && getPositionLabel(myPlayer.position)}
                      {myPlayer.position && myPlayer.uniform_number && ' / '}
                      {myPlayer.uniform_number && `#${myPlayer.uniform_number}`}
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {myTeam.name}
                  <span className="ml-2 opacity-70">神奈川2部A</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - 白カードベース */}
      <main className="px-4 py-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 space-y-5" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)' }}>
        {/* My Next Match */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              次の試合
            </h2>
            {myTeam && (
              <Link href={`/teams/${myTeam.id}`} className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
                チームページ →
              </Link>
            )}
          </div>

          {loading ? (
            <div className="card p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="flex justify-between items-center">
                <div className="h-10 bg-gray-200 rounded w-24" />
                <div className="h-8 bg-gray-200 rounded w-12" />
                <div className="h-10 bg-gray-200 rounded w-24" />
              </div>
            </div>
          ) : nextMatch && myTeam ? (
            <Link href={`/matches/${nextMatch.id}`}>
              <div className="match-card p-4" style={{ '--team-color': 'var(--color-accent)' } as React.CSSProperties}>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: 'var(--color-accent)', color: 'white' }}
                  >
                    {myTeam.short_name?.[0] || myTeam.name[0]}
                  </div>
                  <div>
                    <p className="font-bold" style={{ color: 'var(--color-navy)' }}>
                      {myTeam.name}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {nextMatch.home_team_id === myTeam.id ? 'HOME' : 'AWAY'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-xl font-bold" style={{ color: 'var(--color-navy)' }}>
                      {formatMatchDate(nextMatch.match_date).full} {formatMatchDate(nextMatch.match_date).time}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      vs {nextMatch.home_team_id === myTeam.id ? nextMatch.away_team.name : nextMatch.home_team.name}
                    </p>
                  </div>
                </div>

                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  📍 {nextMatch.venue}
                </p>
              </div>
            </Link>
          ) : (
            <div className="card p-6 text-center">
              <p style={{ color: 'var(--text-secondary)' }}>現在、予定されている試合はありません</p>
            </div>
          )}
        </section>

        {/* This Week's Games */}
        <section className="card-section">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                今週の試合
              </h2>
              {thisWeekMatches.some((m) => isToday(m.match_date)) && (
                <span className="highlight-badge">★ 注目試合あり</span>
              )}
            </div>
            <Link href="/games" className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
              すべて見る →
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="card p-3 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-1/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : thisWeekMatches.length === 0 ? (
            <div className="card p-4 text-center">
              <p style={{ color: 'var(--text-secondary)' }}>今週の試合予定はありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {thisWeekMatches.slice(0, 5).map((match) => {
                const isMyMatch = myTeam && (match.home_team_id === myTeam.id || match.away_team_id === myTeam.id);
                const today = isToday(match.match_date);
                const isLive = match.status === 'in_progress';

                return (
                  <Link key={match.id} href={`/matches/${match.id}`}>
                    <div
                      className={isLive ? 'live-card p-4' : 'card p-4'}
                      style={isMyMatch && !isLive ? { borderLeft: '4px solid var(--color-accent)' } : {}}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {isLive && <span className="badge-live">LIVE</span>}
                          {today && !isLive && <span className="badge-today">TODAY</span>}
                          <span className={`text-xs ${isLive ? '' : ''}`} style={{ color: isLive ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>
                            {formatMatchDate(match.match_date).full}
                          </span>
                        </div>
                        <span className="text-xs" style={{ color: isLive ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)' }}>
                          {formatMatchDate(match.match_date).time}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* ホームチーム */}
                        <div className="flex items-center gap-1.5 flex-1">
                          {match.home_team.logo_url ? (
                            <div className="w-5 h-5 relative flex-shrink-0 rounded-full overflow-hidden bg-white">
                              <Image
                                src={match.home_team.logo_url}
                                alt={match.home_team.name}
                                fill
                                className="object-contain"
                                sizes="20px"
                              />
                            </div>
                          ) : (
                            <div className="w-5 h-5 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-[10px] text-gray-500 font-bold">{(match.home_team.short_name || match.home_team.name).charAt(0)}</span>
                            </div>
                          )}
                          <span
                            className="text-sm font-medium truncate"
                            style={{ color: isLive ? 'white' : (isMyMatch && match.home_team_id === myTeam?.id ? 'var(--color-accent)' : 'var(--text-primary)') }}
                          >
                            {match.home_team.short_name || match.home_team.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mx-3">
                          {match.status === 'finished' || isLive ? (
                            <>
                              <span className="score-large" style={{ color: isLive ? 'white' : undefined }}>
                                {match.home_score ?? 0}
                              </span>
                              <span style={{ color: isLive ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)' }}>-</span>
                              <span className="score-large" style={{ color: isLive ? 'white' : undefined }}>
                                {match.away_score ?? 0}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>vs</span>
                          )}
                        </div>

                        {/* アウェイチーム */}
                        <div className="flex items-center gap-1.5 flex-1 justify-end">
                          <span
                            className="text-sm font-medium truncate"
                            style={{ color: isLive ? 'white' : (isMyMatch && match.away_team_id === myTeam?.id ? 'var(--color-accent)' : 'var(--text-primary)') }}
                          >
                            {match.away_team.short_name || match.away_team.name}
                          </span>
                          {match.away_team.logo_url ? (
                            <div className="w-5 h-5 relative flex-shrink-0 rounded-full overflow-hidden bg-white">
                              <Image
                                src={match.away_team.logo_url}
                                alt={match.away_team.name}
                                fill
                                className="object-contain"
                                sizes="20px"
                              />
                            </div>
                          ) : (
                            <div className="w-5 h-5 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-[10px] text-gray-500 font-bold">{(match.away_team.short_name || match.away_team.name).charAt(0)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-xs mt-2 truncate" style={{ color: isLive ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)' }}>
                        📍 {match.venue}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Standings */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              順位表
            </h2>
            <Link href="/league" className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
              すべて見る →
            </Link>
          </div>

          <div className="card overflow-hidden">
            {/* Header */}
            <div
              className="grid grid-cols-[32px_1fr_40px_48px_48px] gap-1 px-3 py-2 text-xs font-medium"
              style={{ background: 'var(--bg-section)', color: 'var(--text-muted)' }}
            >
              <span className="text-center">#</span>
              <span>チーム</span>
              <span className="text-center">試</span>
              <span className="text-center">得失</span>
              <span className="text-center">勝点</span>
            </div>

            {/* Rows */}
            <div>
              {standings.slice(0, 5).map((standing) => {
                const isMyTeam = myTeam && standing.team_id === myTeam.id;
                const rank = standing.rank || 0;

                return (
                  <Link key={standing.id} href={`/teams/${standing.team_id}`}>
                    <div
                      className={`grid grid-cols-[32px_1fr_40px_48px_48px] gap-1 px-3 py-3 items-center border-b ${getRankClass(rank)} ${isMyTeam ? 'my-team-row' : ''}`}
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <span className="text-center font-bold" style={{ color: rank <= 3 ? (rank === 1 ? 'var(--color-gold)' : rank === 2 ? 'var(--color-silver)' : 'var(--color-bronze)') : 'var(--text-secondary)' }}>
                        {getRankIcon(rank)}
                      </span>
                      <div className={`flex items-center gap-2 ${isMyTeam ? 'team-name' : ''}`}>
                        {standing.team.logo_url ? (
                          <div className="w-6 h-6 relative flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
                            <Image
                              src={standing.team.logo_url}
                              alt={standing.team.name}
                              fill
                              className="object-contain"
                              sizes="24px"
                            />
                          </div>
                        ) : (
                          <div className="w-6 h-6 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs text-gray-500 font-bold">{(standing.team.short_name || standing.team.name).charAt(0)}</span>
                          </div>
                        )}
                        <span className="text-sm font-medium truncate" style={{ color: isMyTeam ? 'var(--color-accent)' : 'var(--text-primary)' }}>
                          {standing.team.short_name || standing.team.name}
                        </span>
                      </div>
                      <span className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
                        {standing.matches_played}
                      </span>
                      <span className="text-sm text-center font-medium" style={{ color: standing.goal_difference > 0 ? 'var(--color-win)' : standing.goal_difference < 0 ? 'var(--color-lose)' : 'var(--text-secondary)' }}>
                        {standing.goal_difference > 0 ? '+' : ''}{standing.goal_difference}
                      </span>
                      <span className="points-large text-center">
                        {standing.points}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* My Team Status */}
            {myTeamStanding && (
              <div className="px-4 py-3" style={{ background: 'var(--color-accent-light)' }}>
                <p className="text-sm font-medium text-center" style={{ color: 'var(--color-accent)' }}>
                  ★ あなたのチームは現在 {myTeamStanding.rank}位 です！
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            クイックアクセス
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {myTeam && (
              <Link
                href={`/team-portal/${myTeam.id}`}
                className="card flex flex-col items-center gap-1 p-3 transition-shadow"
              >
                <span className="text-2xl">🏟️</span>
                <span className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                  チーム
                </span>
              </Link>
            )}
            {myTeam && (
              <Link
                href={`/team-portal/${myTeam.id}/my-page`}
                className="card flex flex-col items-center gap-1 p-3 transition-shadow"
              >
                <span className="text-2xl">👤</span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  マイページ
                </span>
              </Link>
            )}
            <Link
              href="/stats"
              className="card flex flex-col items-center gap-1 p-3 transition-shadow"
            >
              <span className="text-2xl">📊</span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                統計
              </span>
            </Link>
            <Link
              href="/standings"
              className="card flex flex-col items-center gap-1 p-3 transition-shadow"
            >
              <span className="text-2xl">🏆</span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                順位表
              </span>
            </Link>
          </div>
        </section>

        {/* Admin Section */}
        {(user?.user_type === 'coach' || user?.user_type === 'admin') && (
          <section>
            <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              管理機能
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/matches" className="card p-4 flex items-center gap-3" style={{ borderLeft: '4px solid var(--color-accent)' }}>
                <span className="text-2xl">📝</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>試合結果一覧</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>スコア入力</p>
                </div>
              </Link>
              <Link href="/teams" className="card p-4 flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>チーム一覧</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>リーグ所属チーム</p>
                </div>
              </Link>
            </div>
          </section>
        )}
        </div>
      </main>
    </div>
  );
}
