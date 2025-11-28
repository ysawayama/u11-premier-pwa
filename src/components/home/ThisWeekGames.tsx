'use client';

import Link from 'next/link';
import type { MatchWithTeams } from '@/types/database';

interface ThisWeekGamesProps {
  matches: MatchWithTeams[];
  loading?: boolean;
  myTeamId?: string;
}

function formatMatchDate(dateStr: string): { date: string; time: string; isToday: boolean } {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  return {
    date: `${date.getMonth() + 1}/${date.getDate()}(${weekdays[date.getDay()]})`,
    time: date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
    isToday,
  };
}

function MatchCard({ match, isMyMatch }: { match: MatchWithTeams; isMyMatch: boolean }) {
  const dateInfo = formatMatchDate(match.match_date);
  const isLive = match.status === 'in_progress';
  const isFinished = match.status === 'finished';

  return (
    <Link href={`/matches/${match.id}`}>
      <div
        className="p-3 rounded-lg hover:scale-[1.02] transition-transform"
        style={{
          background: isMyMatch ? 'var(--color-surface-elevated)' : 'var(--color-surface)',
          border: isMyMatch ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {isLive && <span className="badge-live">LIVE</span>}
            {dateInfo.isToday && !isLive && (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                style={{ background: 'var(--color-gold)', color: 'var(--color-primary-dark)' }}
              >
                TODAY
              </span>
            )}
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {dateInfo.date}
            </span>
          </div>
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {dateInfo.time}
          </span>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium truncate"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {match.home_team.short_name || match.home_team.name}
            </p>
          </div>

          <div className="flex-shrink-0 mx-3">
            {isFinished || isLive ? (
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {match.home_score}
                </span>
                <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  -
                </span>
                <span className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                  {match.away_score}
                </span>
              </div>
            ) : (
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                vs
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 text-right">
            <p
              className="text-sm font-medium truncate"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {match.away_team.short_name || match.away_team.name}
            </p>
          </div>
        </div>

        {/* Venue */}
        <p className="text-xs mt-2 truncate" style={{ color: 'var(--color-text-muted)' }}>
          {match.venue}
        </p>
      </div>
    </Link>
  );
}

export function ThisWeekGames({ matches, loading, myTeamId }: ThisWeekGamesProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 rounded-lg animate-pulse bg-surface">
            <div className="h-3 bg-white/10 rounded w-1/4 mb-2" />
            <div className="flex justify-between">
              <div className="h-4 bg-white/10 rounded w-1/3" />
              <div className="h-4 bg-white/10 rounded w-8" />
              <div className="h-4 bg-white/10 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="p-6 text-center rounded-lg bg-surface">
        <p style={{ color: 'var(--color-text-secondary)' }}>
          今週の試合予定はありません
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => {
        const isMyMatch =
          myTeamId && (match.home_team_id === myTeamId || match.away_team_id === myTeamId);
        return <MatchCard key={match.id} match={match} isMyMatch={!!isMyMatch} />;
      })}
    </div>
  );
}
