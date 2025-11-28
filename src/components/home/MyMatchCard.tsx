'use client';

import Link from 'next/link';
import type { MatchWithTeams, Team } from '@/types/database';

interface MyMatchCardProps {
  match: MatchWithTeams | null;
  myTeam: Team | null;
  loading?: boolean;
}

function formatMatchDate(dateStr: string): { day: string; month: string; weekday: string; time: string } {
  const date = new Date(dateStr);
  const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return {
    day: date.getDate().toString(),
    month: (date.getMonth() + 1).toString().padStart(2, '0'),
    weekday: weekdays[date.getDay()],
    time: date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
  };
}

function getDaysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const matchDate = new Date(dateStr);
  matchDate.setHours(0, 0, 0, 0);
  return Math.ceil((matchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function MyMatchCard({ match, myTeam, loading }: MyMatchCardProps) {
  if (loading) {
    return (
      <div className="card-elevated p-4 animate-pulse">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
        <div className="flex justify-between items-center">
          <div className="h-10 bg-white/10 rounded w-24" />
          <div className="h-8 bg-white/10 rounded w-12" />
          <div className="h-10 bg-white/10 rounded w-24" />
        </div>
      </div>
    );
  }

  if (!match || !myTeam) {
    return (
      <div className="card-elevated p-6">
        <p className="text-center" style={{ color: 'var(--color-text-secondary)' }}>
          現在、予定されている試合はありません
        </p>
      </div>
    );
  }

  const isHome = match.home_team_id === myTeam.id;
  const opponent = isHome ? match.away_team : match.home_team;
  const dateInfo = formatMatchDate(match.match_date);
  const daysUntil = getDaysUntil(match.match_date);
  const isLive = match.status === 'in_progress';
  const isFinished = match.status === 'finished';

  return (
    <Link href={`/matches/${match.id}`}>
      <div className="card-elevated p-4 hover:scale-[1.02] transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isLive && <span className="badge-live">LIVE</span>}
            {!isLive && !isFinished && daysUntil <= 7 && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded"
                style={{
                  background: 'var(--color-accent)',
                  color: 'white',
                }}
              >
                {daysUntil === 0 ? 'TODAY' : daysUntil === 1 ? 'TOMORROW' : `${daysUntil}日後`}
              </span>
            )}
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {match.match_type === 'league' ? 'リーグ戦' : match.match_type === 'championship' ? '選手権' : '練習試合'}
              {match.round && ` / ${match.round}`}
            </span>
          </div>
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {match.venue}
          </span>
        </div>

        {/* Match Info */}
        <div className="flex items-center justify-between gap-4">
          {/* My Team */}
          <div className="flex-1 text-center">
            <div
              className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center text-lg font-bold"
              style={{
                background: 'var(--gradient-accent)',
                color: 'white',
              }}
            >
              {myTeam.short_name?.[0] || myTeam.name[0]}
            </div>
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
              {myTeam.short_name || myTeam.name}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {isHome ? 'HOME' : 'AWAY'}
            </p>
          </div>

          {/* Score / Time */}
          <div className="flex flex-col items-center">
            {isFinished || isLive ? (
              <div className="flex items-center gap-2">
                <span
                  className="text-3xl font-bold"
                  style={{
                    color: isHome
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-secondary)',
                  }}
                >
                  {isHome ? match.home_score : match.away_score}
                </span>
                <span className="text-xl" style={{ color: 'var(--color-text-muted)' }}>
                  -
                </span>
                <span
                  className="text-3xl font-bold"
                  style={{
                    color: !isHome
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-secondary)',
                  }}
                >
                  {!isHome ? match.home_score : match.away_score}
                </span>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {dateInfo.time}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {dateInfo.month}/{dateInfo.day} ({dateInfo.weekday})
                </p>
              </div>
            )}
            {isLive && (
              <span
                className="text-xs mt-1 animate-pulse"
                style={{ color: 'var(--color-live)' }}
              >
                試合中
              </span>
            )}
          </div>

          {/* Opponent */}
          <div className="flex-1 text-center">
            <div
              className="w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center text-lg font-bold"
              style={{
                background: 'var(--color-surface)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              {opponent.short_name?.[0] || opponent.name[0]}
            </div>
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
              {opponent.short_name || opponent.name}
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {!isHome ? 'HOME' : 'AWAY'}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
