'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { MatchWithTeams, Team } from '@/types/database';

const MY_TEAM_NAME = '大豆戸FC';

type TabType = 'all' | 'upcoming' | 'live' | 'finished';

function formatMatchDate(dateStr: string): string {
  const date = new Date(dateStr);
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  return `${date.getMonth() + 1}/${date.getDate()}(${weekdays[date.getDay()]})`;
}

function formatMatchTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
}

function isToday(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

interface MatchCardProps {
  match: MatchWithTeams;
  myTeamId?: string;
}

function MatchCard({ match, myTeamId }: MatchCardProps) {
  const isLive = match.status === 'in_progress';
  const isFinished = match.status === 'finished';
  const isMyMatch = myTeamId && (match.home_team_id === myTeamId || match.away_team_id === myTeamId);
  const today = isToday(match.match_date);

  // LIVE試合はダークカード、それ以外は白カード
  if (isLive) {
    return (
      <Link href={`/matches/${match.id}`}>
        <div className="live-card p-4 transition-transform hover:scale-[1.02]">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="badge-live">LIVE</span>
              <span className="text-xs text-white/60">
                {match.match_type === 'league' ? 'リーグ戦' : match.match_type === 'championship' ? '選手権' : '練習試合'}
                {match.round && ` / ${match.round}`}
              </span>
            </div>
            <span className="text-xs text-white/60">
              {formatMatchDate(match.match_date)}
            </span>
          </div>

          {/* Teams & Score */}
          <div className="flex items-center justify-between">
            {/* Home Team */}
            <div className="flex-1 text-center">
              <div
                className="w-10 h-10 mx-auto mb-1 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: match.home_team_id === myTeamId ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                }}
              >
                {match.home_team.short_name?.[0] || match.home_team.name[0]}
              </div>
              <p
                className="text-xs font-medium truncate px-1"
                style={{ color: match.home_team_id === myTeamId ? 'var(--color-accent)' : 'white' }}
              >
                {match.home_team.short_name || match.home_team.name}
              </p>
            </div>

            {/* Score */}
            <div className="flex-shrink-0 mx-2 text-center">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-white">
                  {match.home_score ?? 0}
                </span>
                <span className="text-sm text-white/40">-</span>
                <span className="text-3xl font-bold text-white">
                  {match.away_score ?? 0}
                </span>
              </div>
              <span className="text-[10px] mt-1 animate-pulse" style={{ color: 'var(--color-live)' }}>
                試合中
              </span>
            </div>

            {/* Away Team */}
            <div className="flex-1 text-center">
              <div
                className="w-10 h-10 mx-auto mb-1 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: match.away_team_id === myTeamId ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                }}
              >
                {match.away_team.short_name?.[0] || match.away_team.name[0]}
              </div>
              <p
                className="text-xs font-medium truncate px-1"
                style={{ color: match.away_team_id === myTeamId ? 'var(--color-accent)' : 'white' }}
              >
                {match.away_team.short_name || match.away_team.name}
              </p>
            </div>
          </div>

          {/* Venue */}
          <p className="text-[10px] text-center mt-3 truncate text-white/50">
            {match.venue}
          </p>
        </div>
      </Link>
    );
  }

  // 通常の白カード
  return (
    <Link href={`/matches/${match.id}`}>
      <div
        className={`match-card p-4 transition-transform hover:scale-[1.02] ${isMyMatch ? 'my-team-row' : ''}`}
        style={{
          ['--team-color' as string]: isMyMatch ? 'var(--color-accent)' : 'var(--color-navy-light)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {today && <span className="badge-today">TODAY</span>}
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {match.match_type === 'league' ? 'リーグ戦' : match.match_type === 'championship' ? '選手権' : '練習試合'}
              {match.round && ` / ${match.round}`}
            </span>
          </div>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {formatMatchDate(match.match_date)}
          </span>
        </div>

        {/* Teams & Score */}
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="flex-1 text-center">
            <div
              className="w-10 h-10 mx-auto mb-1 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: match.home_team_id === myTeamId ? 'var(--color-accent)' : 'var(--bg-section)',
                color: match.home_team_id === myTeamId ? 'white' : 'var(--text-secondary)',
              }}
            >
              {match.home_team.short_name?.[0] || match.home_team.name[0]}
            </div>
            <p
              className="text-xs font-medium truncate px-1"
              style={{ color: match.home_team_id === myTeamId ? 'var(--color-accent)' : 'var(--text-primary)' }}
            >
              {match.home_team.short_name || match.home_team.name}
            </p>
          </div>

          {/* Score / Time */}
          <div className="flex-shrink-0 mx-2 text-center">
            {isFinished ? (
              <div className="flex items-center gap-2">
                <span className="score-large">{match.home_score ?? 0}</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>-</span>
                <span className="score-large">{match.away_score ?? 0}</span>
              </div>
            ) : (
              <div>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  {formatMatchTime(match.match_date)}
                </p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  KICK OFF
                </p>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 text-center">
            <div
              className="w-10 h-10 mx-auto mb-1 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: match.away_team_id === myTeamId ? 'var(--color-accent)' : 'var(--bg-section)',
                color: match.away_team_id === myTeamId ? 'white' : 'var(--text-secondary)',
              }}
            >
              {match.away_team.short_name?.[0] || match.away_team.name[0]}
            </div>
            <p
              className="text-xs font-medium truncate px-1"
              style={{ color: match.away_team_id === myTeamId ? 'var(--color-accent)' : 'var(--text-primary)' }}
            >
              {match.away_team.short_name || match.away_team.name}
            </p>
          </div>
        </div>

        {/* Venue */}
        <p className="text-[10px] text-center mt-3 truncate" style={{ color: 'var(--text-muted)' }}>
          {match.venue}
        </p>
      </div>
    </Link>
  );
}

export default function GamesPage() {
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');

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

        // Get all matches
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
        }
      } catch (error) {
        console.error('Error fetching games:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'all', label: '全て' },
    { id: 'upcoming', label: '予定' },
    { id: 'live', label: 'LIVE' },
    { id: 'finished', label: '終了' },
  ];

  const filteredMatches = matches.filter((match) => {
    switch (activeTab) {
      case 'upcoming':
        return match.status === 'scheduled';
      case 'live':
        return match.status === 'in_progress';
      case 'finished':
        return match.status === 'finished';
      default:
        return true;
    }
  });

  // Group by date
  const matchesByDate = filteredMatches.reduce((acc, match) => {
    const date = formatMatchDate(match.match_date);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(match);
    return acc;
  }, {} as Record<string, MatchWithTeams[]>);

  const liveCount = matches.filter((m) => m.status === 'in_progress').length;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Header - ネイビー */}
      <header
        className="sticky top-0 z-40"
        style={{ background: 'var(--bg-header)' }}
      >
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-white">
            試合一覧
          </h1>
          <p className="text-xs text-white/60">
            神奈川2部A・2024シーズン
          </p>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-2 pb-3 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap relative"
              style={{
                background: activeTab === tab.id ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.7)',
              }}
            >
              {tab.label}
              {tab.id === 'live' && liveCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold animate-pulse"
                  style={{ background: 'var(--color-live)', color: 'white' }}
                >
                  {liveCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-3 rounded w-1/4 mb-3" style={{ background: 'var(--bg-section)' }} />
                <div className="flex justify-between items-center">
                  <div className="h-10 rounded-full w-10" style={{ background: 'var(--bg-section)' }} />
                  <div className="h-6 rounded w-16" style={{ background: 'var(--bg-section)' }} />
                  <div className="h-10 rounded-full w-10" style={{ background: 'var(--bg-section)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="card text-center py-12">
            <p style={{ color: 'var(--text-secondary)' }}>
              {activeTab === 'live'
                ? '現在進行中の試合はありません'
                : activeTab === 'upcoming'
                ? '予定されている試合はありません'
                : '試合が見つかりませんでした'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(matchesByDate).map(([date, dateMatches]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded"
                    style={{
                      background: 'var(--bg-card)',
                      color: 'var(--text-secondary)',
                      boxShadow: 'var(--shadow-card)',
                    }}
                  >
                    {date}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {dateMatches.length}試合
                  </span>
                </div>
                <div className="space-y-3">
                  {dateMatches.map((match) => (
                    <MatchCard key={match.id} match={match} myTeamId={myTeam?.id} />
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
