'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Settings, ChevronDown, ChevronUp, ExternalLink, ChevronLeft, ChevronRight, Megaphone, Users, User, Trophy, BarChart3, Info, Globe, Award, BookOpen, Mail, Calendar, MapPin, IdCard, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { createClient } from '@/lib/supabase/client';
import { getAnnouncements } from '@/lib/api/announcements';
import type { MatchWithTeams, Team, TeamStandingWithTeam, Player, Announcement } from '@/types/database';

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

// 練習スケジュール
type PracticeSchedule = {
  dayOfWeek: number; // 0=日, 1=月, ... 6=土
  startTime: string;
  endTime: string;
  location: string;
};

// 練習スケジュール定義
const practiceSchedules: PracticeSchedule[] = [
  { dayOfWeek: 1, startTime: '16:30', endTime: '18:00', location: 'しんよこFP' }, // 月曜日
  { dayOfWeek: 1, startTime: '17:30', endTime: '18:30', location: 'しんよこFP' }, // 月曜日（別時間帯）
  { dayOfWeek: 2, startTime: '17:00', endTime: '18:30', location: '大豆戸小学校' }, // 火曜日
  { dayOfWeek: 6, startTime: '12:00', endTime: '13:30', location: '大豆戸小学校' }, // 土曜日
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

// 曜日名を取得
const weekdayNames = ['日', '月', '火', '水', '木', '金', '土'];

// 次の練習日を計算
function getNextPractice(schedules: PracticeSchedule[]): { date: Date; schedule: PracticeSchedule } | null {
  if (schedules.length === 0) return null;

  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // 今日以降で最も近い練習を探す
  let closestDays = Infinity;
  let closestSchedule: PracticeSchedule | null = null;

  for (const schedule of schedules) {
    let daysUntil = schedule.dayOfWeek - currentDay;

    // 同じ曜日の場合、時間をチェック
    if (daysUntil === 0) {
      const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
      // 既に時間が過ぎている場合は来週
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

// 日付をフォーマット
function formatEventDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}(${weekdayNames[date.getDay()]})`;
}

export default function DashboardPage() {
  const { user, clearUser } = useAuthStore();
  const router = useRouter();
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const [nextMatch, setNextMatch] = useState<MatchWithTeams | null>(null);
  const [thisWeekMatches, setThisWeekMatches] = useState<MatchWithTeams[]>([]);
  const [standings, setStandings] = useState<TeamStandingWithTeam[]>([]);
  const [loading, setLoading] = useState(true);

  // お知らせ関連のstate
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsExpanded, setAnnouncementsExpanded] = useState(false);
  const [announcementsPage, setAnnouncementsPage] = useState(1);
  const [announcementsTotal, setAnnouncementsTotal] = useState(0);
  const [isWebmaster, setIsWebmaster] = useState(false);

  // ログアウト処理
  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearUser();
    // スプラッシュから表示されるようにルートにリダイレクト
    router.push('/');
  };

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

          // Webマスター権限チェック
          const { data: isWm } = await supabase.rpc('is_webmaster');
          if (isWm) setIsWebmaster(true);
        }

        // お知らせ取得（初回は3件）
        try {
          const { data: announcementsData, total } = await getAnnouncements(1, 6);
          setAnnouncements(announcementsData);
          setAnnouncementsTotal(total);
        } catch (err) {
          console.error('Error fetching announcements:', err);
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

  // お知らせページ切り替え
  const handleAnnouncementsPageChange = async (newPage: number) => {
    try {
      const { data, total } = await getAnnouncements(newPage, 6);
      setAnnouncements(data);
      setAnnouncementsTotal(total);
      setAnnouncementsPage(newPage);
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  };

  // お知らせの日付フォーマット
  const formatAnnouncementDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // YouTubeのURLからビデオIDを抽出
  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // URLを抽出してリンク化する関数（YouTube対応）
  const renderContentWithLinks = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    const youtubeLinks: { id: string; url: string }[] = [];

    const elements = parts.map((part, index) => {
      if (urlRegex.test(part)) {
        const youtubeId = extractYouTubeId(part);
        if (youtubeId) {
          youtubeLinks.push({ id: youtubeId, url: part });
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              YouTube動画を見る
              <ExternalLink size={12} />
            </a>
          );
        }
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            {part.length > 50 ? part.substring(0, 50) + '...' : part}
            <ExternalLink size={12} />
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });

    // YouTubeサムネイルを追加
    if (youtubeLinks.length > 0) {
      return (
        <>
          <div>{elements}</div>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {youtubeLinks.map((yt, idx) => (
              <a
                key={`yt-${idx}`}
                href={yt.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative rounded-lg overflow-hidden group"
              >
                <Image
                  src={`https://img.youtube.com/vi/${yt.id}/mqdefault.jpg`}
                  alt="YouTube動画"
                  width={320}
                  height={180}
                  className="w-full h-auto object-cover group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </>
      );
    }

    return elements;
  };

  // 表示するお知らせ数
  const displayedAnnouncements = announcementsExpanded ? announcements : announcements.slice(0, 3);
  const totalPages = Math.ceil(announcementsTotal / 6);

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
      {/* Header */}
      <header>
        {/* 上部: リーグロゴエリア（紺色） */}
        <div className="bg-navy px-4 py-3">
          <div className="flex items-center justify-between">
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
            <div className="flex items-center gap-2">
              <Link
                href="/settings"
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)' }}
              >
                <Settings size={20} className="text-white" />
              </Link>
              <button
                onClick={handleLogout}
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                title="ログアウト"
              >
                <LogOut size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* 下部: ユーザー情報帯（チームカラー: 赤） */}
        {myTeam && (
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ backgroundColor: '#c41e3a' }}
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
              {/* デジタル選手証ボタン */}
              <Link
                href="/player-card"
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
              >
                <IdCard size={20} className="text-white" />
                <span className="text-[10px] text-white/90 whitespace-nowrap">選手証</span>
              </Link>
          </div>
        )}
      </header>

      {/* Main Content - 白カードベース */}
      <main className="px-4 py-4 lg:px-8 lg:py-6 max-w-7xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 lg:p-6" style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)' }}>
        {/* PC: 2カラム / モバイル: 1カラム */}
        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6 space-y-5 lg:space-y-0">

        {/* 左カラム: メインコンテンツ */}
        <div className="space-y-5">
        {/* 今週の予定 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Calendar size={16} className="text-accent" />
              今週の予定
            </h2>
            {myTeam && (
              <Link href={`/team-portal/${myTeam.id}/schedule`} className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
                スケジュール →
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="card p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
              </div>
              <div className="card p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {/* 練習カード */}
              <div className="card p-4" style={{ borderLeft: '4px solid var(--color-accent)' }}>
                <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  次の練習
                </h3>
                {(() => {
                  const nextPractice = getNextPractice(practiceSchedules);
                  if (!nextPractice) {
                    return (
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        予定なし
                      </p>
                    );
                  }
                  return (
                    <>
                      <p className="text-base font-bold" style={{ color: 'var(--color-navy)' }}>
                        {formatEventDate(nextPractice.date)}
                      </p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {nextPractice.schedule.startTime} - {nextPractice.schedule.endTime}
                      </p>
                      <div className="flex items-center gap-1 mt-2">
                        <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {nextPractice.schedule.location}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* 試合カード */}
              <div className="card p-4" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                  今週の試合
                </h3>
                {(() => {
                  const weekEvents = getThisWeekEvents(teamEvents);
                  if (weekEvents.length === 0) {
                    return (
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        予定なし
                      </p>
                    );
                  }
                  const event = weekEvents[0];
                  return (
                    <>
                      <p className="text-base font-bold" style={{ color: 'var(--color-navy)' }}>
                        {formatEventDate(event.date)}
                      </p>
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {event.title}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {event.startTime} - {event.endTime}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                          {event.location}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </section>

        {/* This Week's Games */}
        <section className="card-section">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                神奈川2部A　今週の試合
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
                // チームの順位を取得
                const homeTeamRank = standings.find((s) => s.team_id === match.home_team_id)?.rank;
                const awayTeamRank = standings.find((s) => s.team_id === match.away_team_id)?.rank;

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
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
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
                          <div className="flex flex-col min-w-0">
                            <span
                              className="text-sm font-medium truncate"
                              style={{ color: isLive ? 'white' : (isMyMatch && match.home_team_id === myTeam?.id ? 'var(--color-accent)' : 'var(--text-primary)') }}
                            >
                              {match.home_team.short_name || match.home_team.name}
                            </span>
                            {homeTeamRank && (
                              <span className="text-[10px]" style={{ color: isLive ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)' }}>
                                現在{homeTeamRank}位
                              </span>
                            )}
                          </div>
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
                        <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
                          <div className="flex flex-col items-end min-w-0">
                            <span
                              className="text-sm font-medium truncate"
                              style={{ color: isLive ? 'white' : (isMyMatch && match.away_team_id === myTeam?.id ? 'var(--color-accent)' : 'var(--text-primary)') }}
                            >
                              {match.away_team.short_name || match.away_team.name}
                            </span>
                            {awayTeamRank && (
                              <span className="text-[10px]" style={{ color: isLive ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)' }}>
                                現在{awayTeamRank}位
                              </span>
                            )}
                          </div>
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

        {/* マイリーグ セクション */}
        <section>
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Users size={16} className="text-accent" />
            マイリーグ
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {myTeam && (
              <Link
                href={`/team-portal/${myTeam.id}`}
                className="card flex flex-col items-center gap-1.5 p-3 transition-shadow hover:shadow-md"
              >
                <Users size={24} className="text-accent" />
                <span className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                  マイチーム
                </span>
              </Link>
            )}
            {myTeam && (
              <Link
                href={`/team-portal/${myTeam.id}/my-page`}
                className="card flex flex-col items-center gap-1.5 p-3 transition-shadow hover:shadow-md"
              >
                <User size={24} className="text-accent" />
                <span className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                  マイページ
                </span>
              </Link>
            )}
            <Link
              href="/standings"
              className="card flex flex-col items-center gap-1.5 p-3 transition-shadow hover:shadow-md"
            >
              <Trophy size={24} className="text-accent" />
              <span className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
                順位表
              </span>
            </Link>
            <Link
              href="/stats"
              className="card flex flex-col items-center gap-1.5 p-3 transition-shadow hover:shadow-md"
            >
              <BarChart3 size={24} className="text-accent" />
              <span className="text-xs text-center leading-tight" style={{ color: 'var(--text-secondary)' }}>
                個人ランキング
              </span>
            </Link>
          </div>
        </section>

        {/* プレミアリーグU11 セクション */}
        <section className="mt-4">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Award size={16} className="text-primary" />
            アイリスオーヤマ プレミアリーグU11
          </h2>
          <div className="grid grid-cols-5 gap-2">
            <Link
              href="/about"
              className="card flex flex-col items-center gap-1.5 p-3 transition-shadow hover:shadow-md"
            >
              <Info size={22} className="text-primary" />
              <span className="text-[10px] text-center leading-tight" style={{ color: 'var(--text-secondary)' }}>
                リーグ概要
              </span>
            </Link>
            <Link
              href="/coming-soon"
              className="card flex flex-col items-center gap-1.5 p-3 transition-shadow hover:shadow-md"
            >
              <Globe size={22} className="text-primary" />
              <span className="text-[10px] text-center leading-tight" style={{ color: 'var(--text-secondary)' }}>
                全国の結果
              </span>
            </Link>
            <Link
              href="/coming-soon"
              className="card flex flex-col items-center gap-1.5 p-3 transition-shadow hover:shadow-md"
            >
              <Trophy size={22} className="text-primary" />
              <span className="text-[10px] text-center leading-tight" style={{ color: 'var(--text-secondary)' }}>
                チャンピオンシップ
              </span>
            </Link>
            <Link
              href="/coming-soon"
              className="card flex flex-col items-center gap-1.5 p-3 transition-shadow hover:shadow-md"
            >
              <BookOpen size={22} className="text-primary" />
              <span className="text-[10px] text-center leading-tight" style={{ color: 'var(--text-secondary)' }}>
                大会記録
              </span>
            </Link>
            <Link
              href="/contact"
              className="card flex flex-col items-center gap-1.5 p-3 transition-shadow hover:shadow-md"
            >
              <Mail size={22} className="text-primary" />
              <span className="text-[10px] text-center leading-tight" style={{ color: 'var(--text-secondary)' }}>
                問い合わせ
              </span>
            </Link>
          </div>
        </section>

        </div>

        {/* 右カラム: サイドバー（順位表のみ） */}
        <div className="space-y-5">
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
        </div>
        {/* サイドバー終了 */}

        </div>
        {/* 2カラムグリッド終了 */}

        {/* Admin Section - 2カラムの外、フル幅 */}
        {(user?.user_type === 'coach' || user?.user_type === 'admin') && (
          <section className="mt-5 pt-5 border-t border-gray-100">
            <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              管理機能
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
              {isWebmaster && (
                <Link href="/admin/announcements" className="card p-4 flex items-center gap-3" style={{ borderLeft: '4px solid var(--color-accent)' }}>
                  <Megaphone size={24} className="text-accent" />
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>お知らせ投稿</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>新規作成・編集</p>
                  </div>
                </Link>
              )}
            </div>
          </section>
        )}

        {/* お知らせセクション */}
        {announcements.length > 0 && (
          <section className="mt-5 pt-5 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Megaphone size={16} className="text-accent" />
                お知らせ
              </h2>
              {announcementsTotal > 3 && !announcementsExpanded && (
                <button
                  onClick={() => setAnnouncementsExpanded(true)}
                  className="text-xs font-medium flex items-center gap-1"
                  style={{ color: 'var(--color-accent)' }}
                >
                  もっと見る
                  <ChevronDown size={14} />
                </button>
              )}
            </div>

            <div className="space-y-3">
              {displayedAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="card p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {announcement.title}
                    </h3>
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {formatAnnouncementDate(announcement.published_at)}
                    </span>
                  </div>
                  {announcement.image_url && (
                    <div className="mb-3 rounded-lg overflow-hidden">
                      <Image
                        src={announcement.image_url}
                        alt={announcement.title}
                        width={400}
                        height={200}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                    {renderContentWithLinks(announcement.content)}
                  </div>
                </div>
              ))}
            </div>

            {/* アコーディオン展開時の操作 */}
            {announcementsExpanded && (
              <div className="mt-4 flex flex-col items-center gap-3">
                {/* 閉じるボタン */}
                <button
                  onClick={() => {
                    setAnnouncementsExpanded(false);
                    setAnnouncementsPage(1);
                    handleAnnouncementsPageChange(1);
                  }}
                  className="text-xs font-medium flex items-center gap-1"
                  style={{ color: 'var(--text-muted)' }}
                >
                  閉じる
                  <ChevronUp size={14} />
                </button>

                {/* ページネーション */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAnnouncementsPageChange(announcementsPage - 1)}
                      disabled={announcementsPage === 1}
                      className="p-2 rounded-lg disabled:opacity-30"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handleAnnouncementsPageChange(page)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium ${
                            page === announcementsPage
                              ? 'bg-primary text-white'
                              : 'hover:bg-gray-100'
                          }`}
                          style={page !== announcementsPage ? { color: 'var(--text-secondary)' } : {}}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => handleAnnouncementsPageChange(announcementsPage + 1)}
                      disabled={announcementsPage === totalPages}
                      className="p-2 rounded-lg disabled:opacity-30"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* スポンサーセクション */}
        <section className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-center mb-4" style={{ color: 'var(--text-muted)' }}>
            スポンサー
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <a
              href="https://www.irisohyama.co.jp/b2b/sports/"
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-80 transition-opacity"
            >
              <Image
                src="/sponsors/iris-ohyama.png"
                alt="アイリスオーヤマ"
                width={160}
                height={40}
                className="h-8 sm:h-10 w-auto object-contain"
              />
            </a>
            <a
              href="https://www.veo.co/ja/partnership/pl11"
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-80 transition-opacity"
            >
              <Image
                src="/sponsors/veo.png"
                alt="veo"
                width={120}
                height={40}
                className="h-8 sm:h-10 w-auto object-contain"
              />
            </a>
            <a
              href="https://www.mwt.co.jp/grouptour/"
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:opacity-80 transition-opacity"
            >
              <Image
                src="/sponsors/meitetsu.png"
                alt="名鉄観光"
                width={160}
                height={40}
                className="h-8 sm:h-10 w-auto object-contain"
              />
            </a>
          </div>
        </section>
        </div>
      </main>
    </div>
  );
}
