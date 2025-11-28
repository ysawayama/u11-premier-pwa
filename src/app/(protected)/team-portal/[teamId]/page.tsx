'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { MatchWithTeams, TeamStanding } from '@/types/database';

/**
 * チームポータル - 戦績ページ
 */
export default function TeamStatsPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const [standing, setStanding] = useState<TeamStanding | null>(null);
  const [recentMatches, setRecentMatches] = useState<MatchWithTeams[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<MatchWithTeams[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [teamId]);

  const loadData = async () => {
    try {
      const supabase = createClient();

      // 順位情報取得
      const { data: standingData } = await supabase
        .from('team_standings')
        .select('*')
        .eq('team_id', teamId)
        .single();

      setStanding(standingData);

      // 最近の試合（終了済み、直近5試合）
      const { data: recentData } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        `)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .eq('status', 'finished')
        .order('match_date', { ascending: false })
        .limit(5);

      setRecentMatches(recentData || []);

      // 今後の試合（予定、直近5試合）
      const { data: upcomingData } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        `)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .eq('status', 'scheduled')
        .order('match_date', { ascending: true })
        .limit(5);

      setUpcomingMatches(upcomingData || []);
    } catch (err) {
      console.error('データ取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  };

  const getMatchResult = (match: MatchWithTeams) => {
    const isHome = match.home_team_id === teamId;
    const myScore = isHome ? match.home_score : match.away_score;
    const opponentScore = isHome ? match.away_score : match.home_score;

    if (myScore === null || opponentScore === null) return null;

    if (myScore > opponentScore) return 'win';
    if (myScore < opponentScore) return 'lose';
    return 'draw';
  };

  const getResultBadge = (result: string | null) => {
    if (!result) return null;
    const styles = {
      win: 'bg-green-100 text-green-800',
      lose: 'bg-red-100 text-red-800',
      draw: 'bg-gray-100 text-gray-800',
    };
    const labels = { win: '勝', lose: '敗', draw: '分' };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${styles[result as keyof typeof styles]}`}>
        {labels[result as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">戦績</h2>

      {/* 成績サマリー */}
      {standing && (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">今シーズンの成績</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">順位</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">{standing.rank || '-'}</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">試合数</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{standing.matches_played}</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg col-span-2 sm:col-span-1">
              <p className="text-xs sm:text-sm text-gray-600">勝/分/敗</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                <span className="text-green-600">{standing.wins}</span>
                <span className="text-gray-400 mx-1">/</span>
                <span>{standing.draws}</span>
                <span className="text-gray-400 mx-1">/</span>
                <span className="text-red-600">{standing.losses}</span>
              </p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">得失点差</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {standing.goal_difference > 0 ? `+${standing.goal_difference}` : standing.goal_difference}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500">{standing.goals_for} - {standing.goals_against}</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">勝点</p>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{standing.points}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 今後の試合 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">今後の試合</h3>
            <Link href={`/team-portal/${teamId}/schedule`} className="text-xs sm:text-sm text-blue-600 hover:underline min-h-[44px] flex items-center">
              全て見る
            </Link>
          </div>
          {upcomingMatches.length === 0 ? (
            <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">予定されている試合はありません</p>
          ) : (
            <ul className="space-y-2 sm:space-y-3">
              {upcomingMatches.map((match) => {
                const isHome = match.home_team_id === teamId;
                const opponent = isHome ? match.away_team : match.home_team;
                return (
                  <li key={match.id} className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="text-center min-w-[50px] sm:min-w-[60px]">
                      <p className="text-xs sm:text-sm font-medium">{formatDate(match.match_date)}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500">{isHome ? 'HOME' : 'AWAY'}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {opponent.logo_url && (
                        <Image src={opponent.logo_url} alt={opponent.name} width={20} height={20} className="object-contain flex-shrink-0 sm:w-6 sm:h-6" />
                      )}
                      <span className="font-medium text-sm sm:text-base truncate">{opponent.name}</span>
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[60px] sm:max-w-[100px] hidden sm:block">{match.venue}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* 最近の試合 */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">最近の試合</h3>
            <Link href={`/matches`} className="text-xs sm:text-sm text-blue-600 hover:underline min-h-[44px] flex items-center">
              全て見る
            </Link>
          </div>
          {recentMatches.length === 0 ? (
            <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">まだ試合結果がありません</p>
          ) : (
            <ul className="space-y-2 sm:space-y-3">
              {recentMatches.map((match) => {
                const isHome = match.home_team_id === teamId;
                const opponent = isHome ? match.away_team : match.home_team;
                const myScore = isHome ? match.home_score : match.away_score;
                const opponentScore = isHome ? match.away_score : match.home_score;
                const result = getMatchResult(match);
                return (
                  <li key={match.id} className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <div className="text-center min-w-[50px] sm:min-w-[60px]">
                      <p className="text-xs sm:text-sm font-medium">{formatDate(match.match_date)}</p>
                      {getResultBadge(result)}
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {opponent.logo_url && (
                        <Image src={opponent.logo_url} alt={opponent.name} width={20} height={20} className="object-contain flex-shrink-0 sm:w-6 sm:h-6" />
                      )}
                      <span className="font-medium text-sm sm:text-base truncate">{opponent.name}</span>
                    </div>
                    <div className="text-base sm:text-lg font-bold flex-shrink-0">
                      {myScore} - {opponentScore}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
