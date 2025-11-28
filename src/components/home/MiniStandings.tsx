'use client';

import Link from 'next/link';
import type { TeamStandingWithTeam } from '@/types/database';

interface MiniStandingsProps {
  standings: TeamStandingWithTeam[];
  myTeamId?: string;
  loading?: boolean;
}

export function MiniStandings({ standings, myTeamId, loading }: MiniStandingsProps) {
  if (loading) {
    return (
      <div className="card p-4">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-6 h-6 bg-white/10 rounded" />
              <div className="flex-1 h-4 bg-white/10 rounded" />
              <div className="w-8 h-4 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const top5 = standings.slice(0, 5);
  const myTeamStanding = myTeamId
    ? standings.find((s) => s.team_id === myTeamId)
    : null;
  const myTeamInTop5 = myTeamStanding && (myTeamStanding.rank || 0) <= 5;

  return (
    <div className="card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          順位表
        </h3>
        <Link
          href="/standings"
          className="text-xs font-medium"
          style={{ color: 'var(--color-accent)' }}
        >
          すべて見る →
        </Link>
      </div>

      {/* Table Header */}
      <div
        className="grid grid-cols-[24px_1fr_40px_40px_40px] gap-2 pb-2 mb-2 text-xs font-medium"
        style={{
          color: 'var(--color-text-muted)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span>#</span>
        <span>チーム</span>
        <span className="text-center">試</span>
        <span className="text-center">得</span>
        <span className="text-center">勝点</span>
      </div>

      {/* Standings */}
      <div className="space-y-2">
        {top5.map((standing) => {
          const isMyTeam = myTeamId && standing.team_id === myTeamId;
          return (
            <Link
              key={standing.id}
              href={`/teams/${standing.team_id}`}
              className="grid grid-cols-[24px_1fr_40px_40px_40px] gap-2 items-center py-1.5 rounded transition-colors"
              style={{
                background: isMyTeam ? 'var(--color-surface-elevated)' : 'transparent',
              }}
            >
              <span
                className="text-sm font-bold text-center"
                style={{
                  color:
                    standing.rank === 1
                      ? 'var(--color-gold)'
                      : standing.rank === 2
                      ? '#C0C0C0'
                      : standing.rank === 3
                      ? '#CD7F32'
                      : 'var(--color-text-secondary)',
                }}
              >
                {standing.rank}
              </span>
              <span
                className="text-sm font-medium truncate"
                style={{
                  color: isMyTeam ? 'var(--color-accent)' : 'var(--color-text-primary)',
                }}
              >
                {standing.team.short_name || standing.team.name}
              </span>
              <span
                className="text-sm text-center"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {standing.matches_played}
              </span>
              <span
                className="text-sm text-center"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {standing.goal_difference >= 0 ? '+' : ''}
                {standing.goal_difference}
              </span>
              <span
                className="text-sm font-bold text-center"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {standing.points}
              </span>
            </Link>
          );
        })}

        {/* My Team (if not in top 5) */}
        {myTeamStanding && !myTeamInTop5 && (
          <>
            <div className="py-1 text-center" style={{ color: 'var(--color-text-muted)' }}>
              ・・・
            </div>
            <Link
              href={`/teams/${myTeamStanding.team_id}`}
              className="grid grid-cols-[24px_1fr_40px_40px_40px] gap-2 items-center py-1.5 rounded"
              style={{ background: 'var(--color-surface-elevated)' }}
            >
              <span
                className="text-sm font-bold text-center"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {myTeamStanding.rank}
              </span>
              <span
                className="text-sm font-medium truncate"
                style={{ color: 'var(--color-accent)' }}
              >
                {myTeamStanding.team.short_name || myTeamStanding.team.name}
              </span>
              <span
                className="text-sm text-center"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {myTeamStanding.matches_played}
              </span>
              <span
                className="text-sm text-center"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {myTeamStanding.goal_difference >= 0 ? '+' : ''}
                {myTeamStanding.goal_difference}
              </span>
              <span
                className="text-sm font-bold text-center"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {myTeamStanding.points}
              </span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
