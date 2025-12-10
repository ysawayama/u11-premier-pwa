'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ExternalLink, CheckSquare, Square, Clock, Trophy, TrendingUp, TrendingDown, Minus, ChevronRight, Users } from 'lucide-react';
import { getMatchById } from '@/lib/api/matches';
import { createClient } from '@/lib/supabase/client';
import type { MatchWithTeams, MatchStatus, MatchEvent, TeamStanding } from '@/types/database';

/**
 * 試合詳細ページ（MVP v2: 試合準備 + マッチレポート機能追加）
 */
export default function MatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [match, setMatch] = useState<MatchWithTeams | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [homeStanding, setHomeStanding] = useState<TeamStanding | null>(null);
  const [awayStanding, setAwayStanding] = useState<TeamStanding | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 試合準備チェックリスト（ローカルストレージで管理）
  const [checklist, setChecklist] = useState({
    uniform: false,
    shinpads: false,
    drinks: false,
    playerCard: false,
  });

  useEffect(() => {
    loadMatch();
    loadChecklist();
  }, [matchId]);

  const loadMatch = async () => {
    try {
      setLoading(true);
      const data = await getMatchById(matchId);
      setMatch(data);

      // 試合イベントと順位情報を取得
      const supabase = createClient();

      // イベント取得
      const { data: eventsData } = await supabase
        .from('match_events')
        .select('*')
        .eq('match_id', matchId)
        .order('minute', { ascending: true });

      if (eventsData) setEvents(eventsData);

      // 順位取得
      if (data) {
        const { data: currentSeason } = await supabase
          .from('seasons')
          .select('id')
          .eq('is_current', true)
          .single();

        if (currentSeason) {
          const { data: homeStandingData } = await supabase
            .from('team_standings')
            .select('*')
            .eq('season_id', currentSeason.id)
            .eq('team_id', data.home_team_id)
            .single();

          const { data: awayStandingData } = await supabase
            .from('team_standings')
            .select('*')
            .eq('season_id', currentSeason.id)
            .eq('team_id', data.away_team_id)
            .single();

          if (homeStandingData) setHomeStanding(homeStandingData);
          if (awayStandingData) setAwayStanding(awayStandingData);
        }
      }
    } catch (err: any) {
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const loadChecklist = () => {
    const saved = localStorage.getItem(`match-checklist-${matchId}`);
    if (saved) {
      setChecklist(JSON.parse(saved));
    }
  };

  const toggleCheckItem = (key: keyof typeof checklist) => {
    const newChecklist = { ...checklist, [key]: !checklist[key] };
    setChecklist(newChecklist);
    localStorage.setItem(`match-checklist-${matchId}`, JSON.stringify(newChecklist));
  };

  // ステータス表示用のラベルと色
  const getStatusLabel = (status: MatchStatus) => {
    switch (status) {
      case 'scheduled':
        return { label: '予定', color: 'bg-blue-100 text-blue-800' };
      case 'in_progress':
        return { label: '進行中', color: 'bg-green-100 text-green-800' };
      case 'finished':
        return { label: '終了', color: 'bg-gray-100 text-gray-800' };
      case 'cancelled':
        return { label: '中止', color: 'bg-red-100 text-red-800' };
      case 'postponed':
        return { label: '延期', color: 'bg-yellow-100 text-yellow-800' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  // 試合タイプ表示用のラベル
  const getMatchTypeLabel = (type: string) => {
    switch (type) {
      case 'league':
        return 'リーグ戦';
      case 'championship':
        return 'チャンピオンシップ';
      case 'friendly':
        return '親善試合';
      default:
        return type;
    }
  };

  // 試合までの日数
  const getDaysUntil = () => {
    if (!match) return 0;
    const matchDate = new Date(match.match_date);
    const now = new Date();
    matchDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return Math.ceil((matchDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || '試合が見つかりません'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  const status = getStatusLabel(match.status);
  const isFinished = match.status === 'finished';
  const isInProgress = match.status === 'in_progress';
  const isScheduled = match.status === 'scheduled';
  const daysUntil = getDaysUntil();

  // チェックリストアイテム
  const checklistItems = [
    { key: 'uniform' as const, label: 'ユニフォーム' },
    { key: 'shinpads' as const, label: 'すね当て' },
    { key: 'drinks' as const, label: 'ドリンク（2本以上）' },
    { key: 'playerCard' as const, label: '選手証' },
  ];

  const checkedCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/matches"
            className="text-sm text-primary hover:text-primary-hover mb-2 inline-block"
          >
            ← 試合一覧
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-navy">試合詳細</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
              {status.label}
            </span>
            {isInProgress && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                LIVE
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 試合情報カード */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          {/* カードヘッダー */}
          <div className="bg-gradient-to-r from-navy-light to-navy text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm opacity-90">
                {getMatchTypeLabel(match.match_type)}
              </span>
              <span className="text-sm opacity-90">
                {new Date(match.match_date).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>

            {/* スコアボード */}
            <div className="flex items-center justify-center gap-4">
              {/* ホームチーム */}
              <div className="flex-1 text-center">
                <Link
                  href={`/teams/${match.home_team.id}`}
                  className="hover:opacity-80 transition-opacity"
                >
                  <div className="flex flex-col items-center">
                    {match.home_team.logo_url ? (
                      <div className="w-16 h-16 relative mb-2">
                        <Image
                          src={match.home_team.logo_url}
                          alt={match.home_team.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                        <span className="text-2xl font-bold">
                          {match.home_team.short_name?.[0] || match.home_team.name[0]}
                        </span>
                      </div>
                    )}
                    <p className="text-sm font-semibold">
                      {match.home_team.short_name || match.home_team.name}
                    </p>
                    {homeStanding && (
                      <p className="text-xs opacity-70">現在{homeStanding.rank}位</p>
                    )}
                  </div>
                  <div className="text-4xl font-bold mt-2">
                    {match.home_score ?? '-'}
                  </div>
                </Link>
              </div>

              {/* VS */}
              <div className="text-xl font-bold opacity-75">VS</div>

              {/* アウェイチーム */}
              <div className="flex-1 text-center">
                <Link
                  href={`/teams/${match.away_team.id}`}
                  className="hover:opacity-80 transition-opacity"
                >
                  <div className="flex flex-col items-center">
                    {match.away_team.logo_url ? (
                      <div className="w-16 h-16 relative mb-2">
                        <Image
                          src={match.away_team.logo_url}
                          alt={match.away_team.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                        <span className="text-2xl font-bold">
                          {match.away_team.short_name?.[0] || match.away_team.name[0]}
                        </span>
                      </div>
                    )}
                    <p className="text-sm font-semibold">
                      {match.away_team.short_name || match.away_team.name}
                    </p>
                    {awayStanding && (
                      <p className="text-xs opacity-70">現在{awayStanding.rank}位</p>
                    )}
                  </div>
                  <div className="text-4xl font-bold mt-2">
                    {match.away_score ?? '-'}
                  </div>
                </Link>
              </div>
            </div>

            {/* キックオフ時刻 */}
            <div className="text-center mt-4">
              <p className="text-sm opacity-90">
                キックオフ:{' '}
                {new Date(match.match_date).toLocaleTimeString('ja-JP', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* 試合詳細情報 */}
          <div className="p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {match.venue && (
                <div>
                  <dt className="text-sm font-medium text-gray-600">会場</dt>
                  <dd className="mt-1 text-sm text-gray-900">{match.venue}</dd>
                </div>
              )}
              {match.weather && (
                <div>
                  <dt className="text-sm font-medium text-gray-600">天候</dt>
                  <dd className="mt-1 text-sm text-gray-900">{match.weather}</dd>
                </div>
              )}
              {match.temperature !== null && (
                <div>
                  <dt className="text-sm font-medium text-gray-600">気温</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {match.temperature}°C
                  </dd>
                </div>
              )}
              {match.referee && (
                <div>
                  <dt className="text-sm font-medium text-gray-600">主審</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {match.referee}
                  </dd>
                </div>
              )}
            </dl>

            {match.notes && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{match.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* ========================================== */}
        {/* MVP v2: 試合準備セクション（試合前のみ表示） */}
        {/* ========================================== */}
        {isScheduled && daysUntil >= 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock size={20} className="text-primary" />
                  試合準備
                </h2>
                {daysUntil <= 3 && (
                  <span className="px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-700">
                    {daysUntil === 0 ? '今日！' : daysUntil === 1 ? '明日！' : `あと${daysUntil}日`}
                  </span>
                )}
              </div>

              {/* 会場情報 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <MapPin size={14} />
                  会場情報
                </h3>
                <p className="text-sm text-gray-900 font-medium">{match.venue}</p>
                {match.venue_address && (
                  <p className="text-xs text-gray-600 mt-1">{match.venue_address}</p>
                )}
                {match.venue_map_url && (
                  <a
                    href={match.venue_map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                  >
                    Google Mapで開く
                    <ExternalLink size={12} />
                  </a>
                )}
                {match.venue_parking_info && (
                  <div className="mt-2 text-xs text-gray-600">
                    🅿 {match.venue_parking_info}
                  </div>
                )}
              </div>

              {/* 持ち物チェックリスト */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  持ち物チェックリスト ({checkedCount}/{checklistItems.length})
                </h3>
                <div className="space-y-2">
                  {checklistItems.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => toggleCheckItem(item.key)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border transition-colors"
                      style={{
                        borderColor: checklist[item.key] ? 'var(--color-primary)' : '#e5e7eb',
                        backgroundColor: checklist[item.key] ? 'rgba(30, 64, 175, 0.05)' : 'white',
                      }}
                    >
                      {checklist[item.key] ? (
                        <CheckSquare size={20} className="text-primary" />
                      ) : (
                        <Square size={20} className="text-gray-400" />
                      )}
                      <span className={`text-sm ${checklist[item.key] ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 選手証への導線 */}
              <Link
                href="/player-card"
                className="block w-full p-4 rounded-lg border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">デジタル選手証</p>
                      <p className="text-xs text-gray-500">会場受付で提示</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400" />
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MVP v2: マッチレポートセクション（試合後のみ表示） */}
        {/* ========================================== */}
        {isFinished && match.home_score !== null && match.away_score !== null && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                <Trophy size={20} className="text-yellow-500" />
                マッチレポート
              </h2>

              {/* 試合結果 */}
              <div className="text-center py-4 mb-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {match.home_score > match.away_score
                    ? `${match.home_team.short_name || match.home_team.name}の勝利`
                    : match.home_score < match.away_score
                    ? `${match.away_team.short_name || match.away_team.name}の勝利`
                    : '引き分け'}
                </p>
                <div className="flex items-center justify-center gap-4 text-4xl font-bold">
                  <span className="text-gray-700">{match.home_score}</span>
                  <span className="text-gray-400">-</span>
                  <span className="text-gray-700">{match.away_score}</span>
                </div>
              </div>

              {/* 順位への影響（簡易版） */}
              {(homeStanding || awayStanding) && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">順位への影響</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {homeStanding && (
                      <div className="p-3 rounded-lg bg-gray-50">
                        <p className="text-xs text-gray-500 mb-1">{match.home_team.short_name || match.home_team.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">{homeStanding.rank}位</span>
                          <span className="text-sm text-gray-500">/ 勝点{homeStanding.points}</span>
                        </div>
                      </div>
                    )}
                    {awayStanding && (
                      <div className="p-3 rounded-lg bg-gray-50">
                        <p className="text-xs text-gray-500 mb-1">{match.away_team.short_name || match.away_team.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">{awayStanding.rank}位</span>
                          <span className="text-sm text-gray-500">/ 勝点{awayStanding.points}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* タイムライン */}
              {events.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">タイムライン</h3>
                  <div className="space-y-2">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                        <span className="w-8 text-center text-sm font-mono text-gray-500">
                          {event.minute}&apos;
                        </span>
                        <span className="text-lg">
                          {event.event_type === 'goal' && '⚽'}
                          {event.event_type === 'yellow_card' && '🟨'}
                          {event.event_type === 'red_card' && '🟥'}
                          {event.event_type === 'substitution' && '🔄'}
                        </span>
                        <span className="text-sm text-gray-900">
                          {event.description || event.event_type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {events.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">タイムラインはまだ登録されていません</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 試合イベント（進行中・準備中表示） */}
        {!isFinished && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              試合イベント
            </h2>
            {events.length > 0 ? (
              <div className="space-y-2">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <span className="w-8 text-center text-sm font-mono text-gray-500">
                      {event.minute}&apos;
                    </span>
                    <span className="text-lg">
                      {event.event_type === 'goal' && '⚽'}
                      {event.event_type === 'yellow_card' && '🟨'}
                      {event.event_type === 'red_card' && '🟥'}
                      {event.event_type === 'substitution' && '🔄'}
                    </span>
                    <span className="text-sm text-gray-900">
                      {event.description || event.event_type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                <p>試合イベントはまだありません</p>
                {isScheduled && (
                  <p className="text-sm mt-2">試合開始後に更新されます</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* アクションボタン */}
        <div className="mt-6 flex gap-4 justify-center">
          <Link
            href={`/teams/${match.home_team.id}`}
            className="px-6 py-3 bg-white text-primary border-2 border-primary rounded-lg hover:bg-blue-50 font-medium transition-colors"
          >
            {match.home_team.short_name || match.home_team.name}の詳細
          </Link>
          <Link
            href={`/teams/${match.away_team.id}`}
            className="px-6 py-3 bg-white text-primary border-2 border-primary rounded-lg hover:bg-blue-50 font-medium transition-colors"
          >
            {match.away_team.short_name || match.away_team.name}の詳細
          </Link>
        </div>
      </main>
    </div>
  );
}
