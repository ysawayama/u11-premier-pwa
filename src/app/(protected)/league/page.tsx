'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { TeamStandingWithTeam, Team } from '@/types/database';

const MY_TEAM_NAME = '大豆戸FC';

type TabType = 'standings' | 'teams' | 'stats';

function getRankIcon(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '';
  }
}

function getRankClass(rank: number): string {
  switch (rank) {
    case 1:
      return 'rank-1';
    case 2:
      return 'rank-2';
    case 3:
      return 'rank-3';
    default:
      return '';
  }
}

export default function LeaguePage() {
  const [standings, setStandings] = useState<TeamStandingWithTeam[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('standings');

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      try {
        // Get my team
        const { data: teamData } = await supabase
          .from('teams')
          .select('*')
          .eq('name', MY_TEAM_NAME)
          .single();

        if (teamData) {
          setMyTeam(teamData);
        }

        // Get all teams
        const { data: teamsData } = await supabase
          .from('teams')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (teamsData) {
          setTeams(teamsData);
        }

        // Get current season standings
        const { data: currentSeason } = await supabase
          .from('seasons')
          .select('id')
          .eq('is_current', true)
          .single();

        if (currentSeason) {
          const { data: standingsData } = await supabase
            .from('team_standings')
            .select(`
              *,
              team:teams(*)
            `)
            .eq('season_id', currentSeason.id)
            .order('rank', { ascending: true });

          if (standingsData) {
            setStandings(standingsData as TeamStandingWithTeam[]);
          }
        }
      } catch (error) {
        console.error('Error fetching league data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'standings', label: '順位表' },
    { id: 'teams', label: 'チーム' },
    { id: 'stats', label: '統計' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Header - ネイビー */}
      <header
        className="sticky top-0 z-40"
        style={{ background: 'var(--bg-header)' }}
      >
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-white">
            リーグ情報
          </h1>
          <p className="text-xs text-white/60">
            神奈川2部A・2024シーズン
          </p>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-2 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                background: activeTab === tab.id ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.7)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded" style={{ background: 'var(--bg-section)' }} />
                  <div className="flex-1 h-4 rounded" style={{ background: 'var(--bg-section)' }} />
                  <div className="w-12 h-4 rounded" style={{ background: 'var(--bg-section)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Standings Tab */}
            {activeTab === 'standings' && (
              <div className="card overflow-hidden">
                {/* Table Header */}
                <div
                  className="flex items-center px-3 py-2 text-[10px] font-semibold"
                  style={{
                    background: 'var(--bg-header)',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  <span className="w-6 text-center">#</span>
                  <span className="flex-1 min-w-0">チーム</span>
                  <span className="w-7 text-center">試</span>
                  <span className="w-7 text-center">勝</span>
                  <span className="w-7 text-center">分</span>
                  <span className="w-7 text-center">負</span>
                  <span className="w-8 text-center">点</span>
                </div>

                {/* Table Body */}
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {standings.map((standing, index) => {
                    const isMyTeam = myTeam && standing.team_id === myTeam.id;
                    const rank = standing.rank || index + 1;
                    const rankIcon = getRankIcon(rank);
                    const rankClass = getRankClass(rank);

                    return (
                      <Link
                        key={standing.id}
                        href={`/teams/${standing.team_id}`}
                        className={`flex items-center px-3 py-2 transition-colors ${rankClass} ${isMyTeam ? 'my-team-row' : ''}`}
                      >
                        {/* Rank */}
                        <span className="w-6 text-sm font-bold text-center">
                          {rankIcon || (
                            <span style={{ color: 'var(--text-secondary)' }}>{rank}</span>
                          )}
                        </span>

                        {/* Team Name */}
                        <div className="flex-1 flex items-center gap-1.5 min-w-0">
                          {standing.team.logo_url ? (
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
                              {standing.team.short_name?.[0] || standing.team.name[0]}
                            </div>
                          )}
                          <span
                            className="text-xs font-medium truncate"
                            style={{
                              color: isMyTeam ? 'var(--color-accent)' : 'var(--text-primary)',
                            }}
                          >
                            {standing.team.short_name || standing.team.name}
                          </span>
                        </div>

                        {/* Stats */}
                        <span
                          className="w-7 text-xs text-center"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {standing.matches_played}
                        </span>
                        <span
                          className="w-7 text-xs text-center"
                          style={{ color: 'var(--color-win)' }}
                        >
                          {standing.wins}
                        </span>
                        <span
                          className="w-7 text-xs text-center"
                          style={{ color: 'var(--color-draw)' }}
                        >
                          {standing.draws}
                        </span>
                        <span
                          className="w-7 text-xs text-center"
                          style={{ color: 'var(--color-lose)' }}
                        >
                          {standing.losses}
                        </span>
                        <span
                          className="w-8 text-sm font-bold text-center"
                          style={{ color: 'var(--color-navy)' }}
                        >
                          {standing.points}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                {standings.length === 0 && (
                  <div className="py-12 text-center">
                    <p style={{ color: 'var(--text-secondary)' }}>
                      順位表データがありません
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Teams Tab */}
            {activeTab === 'teams' && (
              <div className="grid grid-cols-2 gap-3">
                {teams.map((team) => {
                  const isMyTeam = myTeam && team.id === myTeam.id;
                  return (
                    <Link
                      key={team.id}
                      href={`/teams/${team.id}`}
                      className={`card p-4 transition-transform hover:scale-[1.02] ${isMyTeam ? 'my-team-row' : ''}`}
                    >
                      <div
                        className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center text-lg font-bold"
                        style={{
                          background: isMyTeam ? 'var(--color-accent)' : 'var(--bg-section)',
                          color: isMyTeam ? 'white' : 'var(--text-secondary)',
                        }}
                      >
                        {team.short_name?.[0] || team.name[0]}
                      </div>
                      <p
                        className="text-sm font-medium text-center truncate"
                        style={{ color: isMyTeam ? 'var(--color-accent)' : 'var(--text-primary)' }}
                      >
                        {team.short_name || team.name}
                      </p>
                      {team.home_ground && (
                        <p
                          className="text-[10px] text-center truncate mt-1"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {team.home_ground}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                {/* Goals For/Against */}
                <div className="card p-4">
                  <h3
                    className="text-sm font-semibold mb-3"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    得失点ランキング
                  </h3>
                  <div className="space-y-2">
                    {standings.slice(0, 5).map((standing, index) => {
                      const isMyTeam = myTeam && standing.team_id === myTeam.id;
                      return (
                        <div
                          key={standing.id}
                          className="flex items-center gap-3 py-2"
                          style={{
                            borderBottom:
                              index < 4 ? '1px solid var(--border)' : 'none',
                          }}
                        >
                          <span
                            className="text-sm font-bold w-6 text-center"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {index + 1}
                          </span>
                          <span
                            className="flex-1 text-sm truncate"
                            style={{
                              color: isMyTeam
                                ? 'var(--color-accent)'
                                : 'var(--text-primary)',
                            }}
                          >
                            {standing.team.short_name || standing.team.name}
                          </span>
                          <div className="flex items-center gap-2 text-sm">
                            <span style={{ color: 'var(--color-win)' }}>
                              {standing.goals_for}
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}>/</span>
                            <span style={{ color: 'var(--color-lose)' }}>
                              {standing.goals_against}
                            </span>
                            <span
                              className="font-bold ml-2"
                              style={{
                                color:
                                  standing.goal_difference > 0
                                    ? 'var(--color-win)'
                                    : standing.goal_difference < 0
                                    ? 'var(--color-lose)'
                                    : 'var(--text-muted)',
                              }}
                            >
                              {standing.goal_difference > 0 ? '+' : ''}
                              {standing.goal_difference}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Link to full stats */}
                <Link
                  href="/stats"
                  className="block card p-4 text-center transition-colors"
                  style={{ border: '2px solid var(--color-accent)' }}
                >
                  <span style={{ color: 'var(--color-accent)' }}>
                    選手統計を見る →
                  </span>
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
