'use client';

import { useEffect, useState, useRef, use, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/stores/authStore';
import type { MatchWithTeams, Player, Team, MatchEvent, EventType } from '@/types/database';
import PageWrapper from '@/components/layout/PageWrapper';
import { ArrowLeft, Play, Pause, RotateCcw, Target, Square, AlertTriangle, RefreshCw, Check, User, X, Save, Clock, Users, AlertCircle } from 'lucide-react';

type GameEvent = {
  id: string;
  type: EventType;
  minute: number;
  half: 'first' | 'second';
  teamId: string;
  playerId?: string;
  playerName?: string;
  playerOutId?: string;
  playerOutName?: string;
  description?: string;
};

type PlayerWithStatus = Player & {
  isStarter: boolean;
  isOnField: boolean; // 現在出場中
};

// localStorage用のキー生成
const getRosterStorageKey = (matchId: string) => `match-roster-${matchId}`;

// localStorage用のデータ型
type StoredRoster = {
  starters: string[]; // player IDs
  substitutes: string[]; // player IDs
  submittedAt: string;
};

/**
 * 試合記録ページ
 * - メンバー選出ページで登録したスタメン・控えを使用
 * - タイマー（前半・後半）
 * - ゴール記録（出場中選手のみ）
 * - カード記録（出場中選手のみ）
 * - 交代記録（出場中→控えへ）
 * - 試合結果反映
 */
export default function RecordPage({ params }: { params: Promise<{ matchId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const [match, setMatch] = useState<MatchWithTeams | null>(null);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<PlayerWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rosterNotFound, setRosterNotFound] = useState(false);

  // タイマー状態
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [half, setHalf] = useState<'first' | 'halftime' | 'second' | 'finished'>('first');
  const [halftimeSeconds, setHalftimeSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // スコア
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  // イベント
  const [events, setEvents] = useState<GameEvent[]>([]);

  // モーダル
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventType, setEventType] = useState<EventType | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [selectedPlayerOutId, setSelectedPlayerOutId] = useState<string | null>(null);

  // 保存状態
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 権限チェック
  useEffect(() => {
    if (user && user.user_type !== 'coach' && user.user_type !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    loadData();
  }, [resolvedParams.matchId]);

  // タイマー処理
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        if (half === 'halftime') {
          setHalftimeSeconds((prev) => prev + 1);
        } else {
          setElapsedSeconds((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerRunning, half]);

  const loadData = async () => {
    try {
      setLoading(true);
      setRosterNotFound(false);
      const supabase = createClient();

      // 自分のチームを特定
      const MY_TEAM_NAME = '大豆戸FC';
      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('name', MY_TEAM_NAME)
        .single();

      if (!teamData) {
        setError('チーム情報が見つかりません');
        return;
      }
      setMyTeam(teamData);

      // デモ用の試合IDかどうかをチェック
      const isDemo = resolvedParams.matchId.startsWith('demo-');

      if (isDemo) {
        // デモ用の試合データを作成
        const { data: opponentTeam } = await supabase
          .from('teams')
          .select('*')
          .eq('name', '横浜ジュニオールSC')
          .single();

        if (opponentTeam) {
          const demoMatch: MatchWithTeams = {
            id: resolvedParams.matchId,
            season_id: 'demo-season',
            match_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            venue: '横浜市立大豆戸小学校',
            match_type: 'league',
            round: '第15節',
            home_team_id: teamData.id,
            away_team_id: opponentTeam.id,
            home_score: null,
            away_score: null,
            status: 'scheduled',
            weather: null,
            temperature: null,
            attendance: null,
            referee: null,
            notes: null,
            created_by: null,
            updated_by: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            home_team: teamData,
            away_team: opponentTeam,
          };
          setMatch(demoMatch);
          setHomeScore(0);
          setAwayScore(0);
        }
      } else {
        // 通常の試合情報を取得
        const { data: matchData, error: matchError } = await supabase
          .from('matches')
          .select(`
            *,
            home_team:teams!matches_home_team_id_fkey(*),
            away_team:teams!matches_away_team_id_fkey(*)
          `)
          .eq('id', resolvedParams.matchId)
          .single();

        if (matchError) throw matchError;
        setMatch(matchData as MatchWithTeams);
        setHomeScore(matchData.home_score || 0);
        setAwayScore(matchData.away_score || 0);

        // 既存のイベントを取得（通常の試合のみ）
        const { data: eventsData } = await supabase
          .from('match_events')
          .select('*')
          .eq('match_id', resolvedParams.matchId)
          .order('minute', { ascending: true });

        if (eventsData) {
          const formattedEvents: GameEvent[] = eventsData.map((e: MatchEvent) => ({
            id: e.id,
            type: e.event_type,
            minute: e.minute,
            half: e.minute >= 20 ? 'second' : 'first',
            teamId: e.team_id,
            playerId: e.player_id || undefined,
            playerOutId: e.substitution_player_out_id || undefined,
            description: e.description || undefined,
          }));
          setEvents(formattedEvents);
        }
      }

      // チームの選手を取得
      const { data: playersData } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', teamData.id)
        .eq('is_active', true)
        .order('uniform_number', { ascending: true });

      if (playersData) {
        // localStorageからロスター情報を取得
        const storedRoster = localStorage.getItem(getRosterStorageKey(resolvedParams.matchId));

        if (!storedRoster) {
          // ロスターが未登録
          setRosterNotFound(true);
          setPlayers([]);
        } else {
          try {
            const parsed: StoredRoster = JSON.parse(storedRoster);
            const starterIds = parsed.starters || [];
            const substituteIds = parsed.substitutes || [];

            // 選手にステータスを設定
            const playersWithStatus: PlayerWithStatus[] = playersData
              .filter((p) => starterIds.includes(p.id) || substituteIds.includes(p.id))
              .map((p) => ({
                ...p,
                isStarter: starterIds.includes(p.id),
                isOnField: starterIds.includes(p.id), // 先発は最初から出場中
              }));

            setPlayers(playersWithStatus);
          } catch {
            setRosterNotFound(true);
            setPlayers([]);
          }
        }
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // タイマー表示フォーマット
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 現在の分数を取得
  const getCurrentMinute = () => {
    const baseMinute = half === 'second' ? 20 : 0;
    return baseMinute + Math.floor(elapsedSeconds / 60);
  };

  // タイマー制御
  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    if (half === 'halftime') {
      setHalftimeSeconds(0);
    } else {
      setElapsedSeconds(0);
    }
  };

  // 前半終了 → ハーフタイムへ
  const endFirstHalf = () => {
    setTimerRunning(false);
    setHalf('halftime');
    setHalftimeSeconds(0);
    setTimeout(() => setTimerRunning(true), 100);
  };

  // 後半スタート
  const startSecondHalf = () => {
    setTimerRunning(false);
    setElapsedSeconds(0);
    setHalf('second');
  };

  // 試合終了
  const endMatch = () => {
    setTimerRunning(false);
    setHalf('finished');
  };

  // 出場中の選手リスト
  const playersOnField = players.filter((p) => p.isOnField);

  // 控えの選手リスト
  const substitutes = players.filter((p) => !p.isOnField);

  // イベント追加モーダルを開く
  const openEventModal = (type: EventType, teamId: string) => {
    setEventType(type);
    setSelectedTeamId(teamId);
    setSelectedPlayerId(null);
    setSelectedPlayerOutId(null);
    setShowEventModal(true);
  };

  // イベントを追加
  const addEvent = useCallback(() => {
    if (!eventType || !selectedTeamId) return;

    const player = players.find((p) => p.id === selectedPlayerId);
    const playerOut = players.find((p) => p.id === selectedPlayerOutId);

    const newEvent: GameEvent = {
      id: `temp-${Date.now()}`,
      type: eventType,
      minute: getCurrentMinute(),
      half: half === 'second' ? 'second' : 'first',
      teamId: selectedTeamId,
      playerId: selectedPlayerId || undefined,
      playerName: player ? `${player.family_name} ${player.given_name}` : undefined,
      playerOutId: selectedPlayerOutId || undefined,
      playerOutName: playerOut ? `${playerOut.family_name} ${playerOut.given_name}` : undefined,
    };

    setEvents((prev) => [...prev, newEvent].sort((a, b) => a.minute - b.minute));

    // スコア更新
    if (eventType === 'goal') {
      if (match) {
        if (selectedTeamId === match.home_team_id) {
          setHomeScore((prev) => prev + 1);
        } else {
          setAwayScore((prev) => prev + 1);
        }
      }
    }

    // 交代処理：出場状態を更新
    if (eventType === 'substitution' && selectedPlayerId && selectedPlayerOutId) {
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === selectedPlayerId) {
            return { ...p, isOnField: true };
          }
          if (p.id === selectedPlayerOutId) {
            return { ...p, isOnField: false };
          }
          return p;
        })
      );
    }

    setShowEventModal(false);
    setEventType(null);
    setSelectedTeamId(null);
    setSelectedPlayerId(null);
    setSelectedPlayerOutId(null);
  }, [eventType, selectedTeamId, selectedPlayerId, selectedPlayerOutId, players, match, half]);

  // イベント削除
  const removeEvent = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    if (event.type === 'goal') {
      // スコアを戻す
      if (match) {
        if (event.teamId === match.home_team_id) {
          setHomeScore((prev) => Math.max(0, prev - 1));
        } else {
          setAwayScore((prev) => Math.max(0, prev - 1));
        }
      }
    }

    if (event.type === 'substitution' && event.playerId && event.playerOutId) {
      // 交代を取り消し：出場状態を戻す
      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === event.playerId) {
            return { ...p, isOnField: false };
          }
          if (p.id === event.playerOutId) {
            return { ...p, isOnField: true };
          }
          return p;
        })
      );
    }

    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  // 試合結果を保存
  const saveMatch = async () => {
    if (!match) return;

    // デモ試合の場合は保存をシミュレート
    if (match.id.startsWith('demo-')) {
      setSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();

      // 試合スコアを更新
      const { error: matchError } = await supabase
        .from('matches')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          status: half === 'finished' ? 'finished' : 'in_progress',
        })
        .eq('id', match.id);

      if (matchError) throw matchError;

      // イベントを保存（新規のみ）
      const newEvents = events.filter((e) => e.id.startsWith('temp-'));
      for (const event of newEvents) {
        const { error: eventError } = await supabase
          .from('match_events')
          .insert({
            match_id: match.id,
            team_id: event.teamId,
            player_id: event.playerId || null,
            event_type: event.type,
            minute: event.minute,
            substitution_player_out_id: event.playerOutId || null,
            description: event.description || null,
          });

        if (eventError) {
          console.error('Error saving event:', eventError);
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      // データを再読み込み
      await loadData();
    } catch (err: any) {
      console.error('Error saving match:', err);
      alert('保存に失敗しました: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // イベントタイプの表示
  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'goal':
        return '⚽';
      case 'yellow_card':
        return '🟨';
      case 'red_card':
        return '🟥';
      case 'substitution':
        return '🔄';
      default:
        return '📝';
    }
  };

  const getEventLabel = (type: EventType) => {
    switch (type) {
      case 'goal':
        return 'ゴール';
      case 'yellow_card':
        return 'イエローカード';
      case 'red_card':
        return 'レッドカード';
      case 'substitution':
        return '交代';
      default:
        return type;
    }
  };

  // ヘッダーコンポーネント
  const headerContent = (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Clock size={24} />
          試合記録
        </h1>
        <p className="text-xs text-white/70 mt-0.5">
          {match ? `${match.home_team.short_name || match.home_team.name} vs ${match.away_team.short_name || match.away_team.name}` : ''}
        </p>
      </div>
      <Link
        href="/admin/match-operations"
        className="text-sm text-white/80 hover:text-white transition-colors flex items-center gap-1"
      >
        <ArrowLeft size={16} />
        戻る
      </Link>
    </div>
  );

  if (loading) {
    return (
      <PageWrapper header={headerContent}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error || !match) {
    return (
      <PageWrapper header={headerContent}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-600">{error || '試合が見つかりません'}</p>
            <button
              onClick={loadData}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
            >
              再読み込み
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // ロスターが未登録の場合
  if (rosterNotFound) {
    return (
      <PageWrapper header={headerContent}>
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertCircle size={40} className="text-yellow-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            メンバー未登録
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            先にメンバー選出を行ってください。<br />
            先発11人と控えを登録後、試合記録が可能になります。
          </p>

          <Link
            href={`/admin/match-operations/${resolvedParams.matchId}/roster`}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
          >
            メンバー選出へ
          </Link>
        </div>
      </PageWrapper>
    );
  }

  // 試合記録画面
  return (
    <PageWrapper header={headerContent}>
      {/* スコアボード */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-4 mb-4 text-white">
        {/* ハーフ表示 */}
        <div className="text-center mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            half === 'first' ? 'bg-green-500' :
            half === 'halftime' ? 'bg-yellow-500 text-yellow-900' :
            half === 'second' ? 'bg-orange-500' :
            'bg-gray-500'
          }`}>
            {half === 'first' ? '前半' :
             half === 'halftime' ? 'ハーフタイム' :
             half === 'second' ? '後半' : '試合終了'}
          </span>
        </div>

        {/* チーム & スコア */}
        <div className="flex items-center justify-between">
          {/* ホームチーム */}
          <div className="flex-1 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full overflow-hidden bg-white">
              {match.home_team.logo_url ? (
                <Image
                  src={match.home_team.logo_url}
                  alt={match.home_team.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-blue-900 font-bold">
                  {match.home_team.name[0]}
                </div>
              )}
            </div>
            <p className="text-xs font-medium truncate px-2">
              {match.home_team.short_name || match.home_team.name}
            </p>
          </div>

          {/* スコア */}
          <div className="flex items-center gap-4">
            <span className="text-5xl font-bold">{homeScore}</span>
            <span className="text-2xl text-white/50">-</span>
            <span className="text-5xl font-bold">{awayScore}</span>
          </div>

          {/* アウェイチーム */}
          <div className="flex-1 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full overflow-hidden bg-white">
              {match.away_team.logo_url ? (
                <Image
                  src={match.away_team.logo_url}
                  alt={match.away_team.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-blue-900 font-bold">
                  {match.away_team.name[0]}
                </div>
              )}
            </div>
            <p className="text-xs font-medium truncate px-2">
              {match.away_team.short_name || match.away_team.name}
            </p>
          </div>
        </div>

        {/* タイマー */}
        <div className="mt-4 text-center">
          {half === 'halftime' ? (
            <>
              <p className="text-4xl font-mono font-bold text-yellow-300">{formatTime(halftimeSeconds)}</p>
              <p className="text-xs text-yellow-200 mt-1">ハーフタイム経過</p>
            </>
          ) : (
            <>
              <p className="text-4xl font-mono font-bold">{formatTime(elapsedSeconds)}</p>
              <p className="text-xs text-white/60 mt-1">{getCurrentMinute()}分</p>
            </>
          )}
        </div>
      </div>

      {/* タイマーコントロール */}
      {half !== 'finished' && (
        <div className="flex gap-2 mb-4">
          {half === 'halftime' ? (
            <>
              <button
                onClick={toggleTimer}
                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                  timerRunning
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-yellow-500 text-yellow-900 hover:bg-yellow-600'
                }`}
              >
                {timerRunning ? <Pause size={18} /> : <Play size={18} />}
                {timerRunning ? '一時停止' : '再開'}
              </button>
              <button
                onClick={startSecondHalf}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Play size={18} />
                後半スタート
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleTimer}
                className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                  timerRunning
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {timerRunning ? <Pause size={18} /> : <Play size={18} />}
                {timerRunning ? '一時停止' : 'スタート'}
              </button>
              <button
                onClick={resetTimer}
                className="px-4 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
              >
                <RotateCcw size={18} />
              </button>
              {half === 'first' ? (
                <button
                  onClick={endFirstHalf}
                  className="px-4 py-3 bg-yellow-500 text-yellow-900 rounded-xl font-bold text-sm hover:bg-yellow-600 transition-colors"
                >
                  前半終了
                </button>
              ) : (
                <button
                  onClick={endMatch}
                  className="px-4 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors"
                >
                  試合終了
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* 出場中メンバー表示 */}
      <div className="mb-4 p-3 bg-green-50 rounded-xl">
        <p className="text-xs font-bold text-green-800 mb-2">出場中 ({playersOnField.length}人)</p>
        <div className="flex flex-wrap gap-1">
          {playersOnField.map((player) => (
            <span
              key={player.id}
              className="px-2 py-1 bg-green-200 text-green-800 rounded text-[10px] font-medium"
            >
              #{player.uniform_number} {player.family_name}
            </span>
          ))}
        </div>
      </div>

      {/* 控えメンバー表示 */}
      {substitutes.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
          <p className="text-xs font-bold text-gray-600 mb-2">控え ({substitutes.length}人)</p>
          <div className="flex flex-wrap gap-1">
            {substitutes.map((player) => (
              <span
                key={player.id}
                className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-[10px] font-medium"
              >
                #{player.uniform_number} {player.family_name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* イベント入力ボタン */}
      <div className="mb-4">
        <h3 className="text-sm font-bold text-gray-700 mb-2">イベント記録</h3>

        {/* ホームチーム用 */}
        <div className="mb-2">
          <p className="text-xs text-gray-500 mb-1">{match.home_team.short_name || match.home_team.name}</p>
          <div className="flex gap-2">
            <button
              onClick={() => openEventModal('goal', match.home_team_id)}
              className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors flex items-center justify-center gap-1"
            >
              <Target size={14} />
              ゴール
            </button>
            <button
              onClick={() => openEventModal('yellow_card', match.home_team_id)}
              className="flex-1 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium hover:bg-yellow-200 transition-colors flex items-center justify-center gap-1"
            >
              <Square size={14} fill="currentColor" />
              イエロー
            </button>
            <button
              onClick={() => openEventModal('red_card', match.home_team_id)}
              className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
            >
              <AlertTriangle size={14} />
              レッド
            </button>
            <button
              onClick={() => openEventModal('substitution', match.home_team_id)}
              className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-1"
            >
              <RefreshCw size={14} />
              交代
            </button>
          </div>
        </div>

        {/* アウェイチーム用 */}
        <div>
          <p className="text-xs text-gray-500 mb-1">{match.away_team.short_name || match.away_team.name}</p>
          <div className="flex gap-2">
            <button
              onClick={() => openEventModal('goal', match.away_team_id)}
              className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors flex items-center justify-center gap-1"
            >
              <Target size={14} />
              ゴール
            </button>
            <button
              onClick={() => openEventModal('yellow_card', match.away_team_id)}
              className="flex-1 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium hover:bg-yellow-200 transition-colors flex items-center justify-center gap-1"
            >
              <Square size={14} fill="currentColor" />
              イエロー
            </button>
            <button
              onClick={() => openEventModal('red_card', match.away_team_id)}
              className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
            >
              <AlertTriangle size={14} />
              レッド
            </button>
            <button
              onClick={() => openEventModal('substitution', match.away_team_id)}
              className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-1"
            >
              <RefreshCw size={14} />
              交代
            </button>
          </div>
        </div>
      </div>

      {/* イベントタイムライン */}
      <div className="mb-20">
        <h3 className="text-sm font-bold text-gray-700 mb-2">タイムライン</h3>
        {events.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500">まだイベントが記録されていません</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
              >
                <span className="text-2xl">{getEventIcon(event.type)}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {event.minute}' {getEventLabel(event.type)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {event.teamId === match.home_team_id
                      ? match.home_team.short_name || match.home_team.name
                      : match.away_team.short_name || match.away_team.name}
                    {event.playerName && ` - ${event.playerName}`}
                    {event.type === 'substitution' && event.playerOutName && (
                      <span className="text-gray-400"> (OUT: {event.playerOutName})</span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => removeEvent(event.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 保存ボタン（固定） */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t">
        <button
          onClick={saveMatch}
          disabled={saving}
          className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50`}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              保存中...
            </>
          ) : saved ? (
            <>
              <Check size={18} />
              保存しました
            </>
          ) : (
            <>
              <Save size={18} />
              試合結果を保存
            </>
          )}
        </button>
      </div>

      {/* イベント入力モーダル */}
      {showEventModal && eventType && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-2xl w-full max-w-lg max-h-[80vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {getEventIcon(eventType)} {getEventLabel(eventType)}を記録
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3">
                {getCurrentMinute()}分 -{' '}
                {selectedTeamId === match.home_team_id
                  ? match.home_team.name
                  : match.away_team.name}
              </p>

              {/* 自チームの場合のみ選手選択を表示 */}
              {selectedTeamId === myTeam?.id && (
                <>
                  {eventType === 'substitution' ? (
                    /* 交代の場合：出場中からOUT、控えからIN */
                    <>
                      <p className="text-xs font-medium text-red-600 mb-2">
                        OUT: ピッチを出る選手（出場中から選択）
                      </p>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {playersOnField.map((player) => (
                          <button
                            key={player.id}
                            onClick={() => setSelectedPlayerOutId(player.id)}
                            className={`p-2 rounded-lg text-center transition-colors ${
                              selectedPlayerOutId === player.id
                                ? 'bg-red-500 text-white'
                                : 'bg-red-50 text-red-700 hover:bg-red-100'
                            }`}
                          >
                            <p className="text-xs font-bold">
                              {player.uniform_number && `#${player.uniform_number}`}
                            </p>
                            <p className="text-[10px] truncate">
                              {player.family_name}
                            </p>
                          </button>
                        ))}
                      </div>

                      <p className="text-xs font-medium text-blue-600 mb-2">
                        IN: ピッチに入る選手（控えから選択）
                      </p>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {substitutes.map((player) => (
                          <button
                            key={player.id}
                            onClick={() => setSelectedPlayerId(player.id)}
                            className={`p-2 rounded-lg text-center transition-colors ${
                              selectedPlayerId === player.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            }`}
                          >
                            <p className="text-xs font-bold">
                              {player.uniform_number && `#${player.uniform_number}`}
                            </p>
                            <p className="text-[10px] truncate">
                              {player.family_name}
                            </p>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    /* ゴール・カードの場合：出場中の選手のみ */
                    <>
                      <p className="text-xs font-medium text-gray-500 mb-2">
                        選手を選択（出場中のみ）
                      </p>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {playersOnField.map((player) => (
                          <button
                            key={player.id}
                            onClick={() => setSelectedPlayerId(player.id)}
                            className={`p-2 rounded-lg text-center transition-colors ${
                              selectedPlayerId === player.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <p className="text-xs font-bold">
                              {player.uniform_number && `#${player.uniform_number}`}
                            </p>
                            <p className="text-[10px] truncate">
                              {player.family_name}
                            </p>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}

              {/* 相手チームの場合は選手選択なし */}
              {selectedTeamId !== myTeam?.id && (
                <p className="text-sm text-gray-500 mb-4">
                  相手チームのイベントとして記録します
                </p>
              )}

              <button
                onClick={addEvent}
                disabled={
                  (selectedTeamId === myTeam?.id && eventType === 'substitution' && (!selectedPlayerId || !selectedPlayerOutId)) ||
                  (selectedTeamId === myTeam?.id && eventType !== 'substitution' && !selectedPlayerId)
                }
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                記録する
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
