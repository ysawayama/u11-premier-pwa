'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { MapPin, Calendar } from 'lucide-react';
import type { MatchWithTeams, TeamStanding } from '@/types/database';

// 練習スケジュール
type PracticeSchedule = {
  dayOfWeek: number; // 0=日, 1=月, ... 6=土
  startTime: string;
  endTime: string;
  location: string;
};

// チームイベント（試合以外）
type TeamEvent = {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  address: string;
  type: 'match' | 'practice' | 'tournament';
};

// 練習スケジュール定義
const practiceSchedules: PracticeSchedule[] = [
  { dayOfWeek: 1, startTime: '16:30', endTime: '18:00', location: 'しんよこFP' },
  { dayOfWeek: 1, startTime: '17:30', endTime: '18:30', location: 'しんよこFP' },
  { dayOfWeek: 2, startTime: '17:00', endTime: '18:30', location: '大豆戸小学校' },
  { dayOfWeek: 6, startTime: '12:00', endTime: '13:30', location: '大豆戸小学校' },
];

// チームイベント（試合・大会）
const teamEvents: TeamEvent[] = [
  {
    id: 'event1',
    title: 'U10湘南 ルベントカップ',
    date: new Date('2025-12-07'),
    startTime: '9:00',
    endTime: '17:00',
    location: '大磯運動公園',
    address: '神奈川県中郡大磯町国府本郷２１２６',
    type: 'tournament',
  },
  {
    id: 'event2',
    title: 'U10ルーキーリーグ',
    date: new Date('2025-12-14'),
    startTime: '14:30',
    endTime: '16:30',
    location: '横浜市立大豆戸小学校',
    address: '神奈川県横浜市港北区大豆戸町７５９',
    type: 'match',
  },
  {
    id: 'event3',
    title: 'u10.12TM vs伊丹FC',
    date: new Date('2025-12-28'),
    startTime: '9:00',
    endTime: '17:00',
    location: '横浜市立大豆戸小学校',
    address: '神奈川県横浜市港北区大豆戸町７５９',
    type: 'match',
  },
];

// 曜日名
const weekdayNames = ['日', '月', '火', '水', '木', '金', '土'];

// 次の練習日を計算
function getNextPractice(schedules: PracticeSchedule[]): { date: Date; schedule: PracticeSchedule } | null {
  if (schedules.length === 0) return null;

  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  let closestDays = Infinity;
  let closestSchedule: PracticeSchedule | null = null;

  for (const schedule of schedules) {
    let daysUntil = schedule.dayOfWeek - currentDay;

    if (daysUntil === 0) {
      const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
      if (currentHour > startHour || (currentHour === startHour && currentMinute >= startMinute)) {
        daysUntil = 7;
      }
    } else if (daysUntil < 0) {
      daysUntil += 7;
    }

    if (daysUntil < closestDays) {
      closestDays = daysUntil;
      closestSchedule = schedule;
    }
  }

  if (!closestSchedule) return null;

  const nextDate = new Date(now);
  nextDate.setDate(now.getDate() + closestDays);
  nextDate.setHours(0, 0, 0, 0);

  return { date: nextDate, schedule: closestSchedule };
}

// 今週のイベントを取得
function getThisWeekEvents(events: TeamEvent[]): TeamEvent[] {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= startOfWeek && eventDate < endOfWeek;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// 今月のイベントを取得
function getThisMonthEvents(events: TeamEvent[]): TeamEvent[] {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= startOfMonth && eventDate <= endOfMonth;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// 日付をフォーマット
function formatEventDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}(${weekdayNames[date.getDay()]})`;
}

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
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">戦績</h2>

      {/* 今週の予定 */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-primary" />
          今週の予定
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 練習カード */}
          <div className="p-3 sm:p-4 rounded-lg bg-green-50 border-l-4 border-green-500">
            <h4 className="text-xs font-medium text-gray-500 mb-2">次の練習</h4>
            {(() => {
              const nextPractice = getNextPractice(practiceSchedules);
              if (!nextPractice) {
                return <p className="text-sm text-gray-500">予定なし</p>;
              }
              return (
                <>
                  <p className="text-base font-bold text-gray-900">
                    {formatEventDate(nextPractice.date)}
                  </p>
                  <p className="text-sm font-medium text-gray-700">
                    {nextPractice.schedule.startTime} - {nextPractice.schedule.endTime}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <MapPin size={12} className="text-gray-400" />
                    <p className="text-xs text-gray-500">
                      {nextPractice.schedule.location}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>

          {/* 試合カード */}
          <div className="p-3 sm:p-4 rounded-lg bg-red-50 border-l-4 border-red-500">
            <h4 className="text-xs font-medium text-gray-500 mb-2">今週の試合</h4>
            {(() => {
              const weekEvents = getThisWeekEvents(teamEvents);
              if (weekEvents.length === 0) {
                return <p className="text-sm text-gray-500">予定なし</p>;
              }
              const event = weekEvents[0];
              return (
                <>
                  <p className="text-base font-bold text-gray-900">
                    {formatEventDate(event.date)}
                  </p>
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {event.title}
                  </p>
                  <p className="text-sm text-gray-600">
                    {event.startTime} - {event.endTime}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={12} className="text-gray-400" />
                    <p className="text-xs text-gray-500 truncate">
                      {event.location}
                    </p>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* 今月の試合・大会 */}
        {(() => {
          const monthEvents = getThisMonthEvents(teamEvents);
          if (monthEvents.length === 0) return null;
          return (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                {new Date().getMonth() + 1}月の試合・大会
              </h4>
              <div className="space-y-2">
                {monthEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-12 text-center">
                      <span className="text-sm font-bold text-primary">
                        {event.date.getMonth() + 1}/{event.date.getDate()}
                      </span>
                      <span className="block text-[10px] text-gray-500">
                        ({weekdayNames[event.date.getDay()]})
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {event.location}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      event.type === 'tournament'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {event.type === 'tournament' ? '大会' : '試合'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* 成績サマリー */}
      {standing && (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">今シーズンの成績</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600">順位</p>
              <p className="text-2xl sm:text-3xl font-bold text-primary">{standing.rank || '-'}</p>
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
            <Link href={`/team-portal/${teamId}/schedule`} className="text-xs sm:text-sm text-primary hover:underline min-h-[44px] flex items-center">
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
            <Link href={`/matches`} className="text-xs sm:text-sm text-primary hover:underline min-h-[44px] flex items-center">
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
