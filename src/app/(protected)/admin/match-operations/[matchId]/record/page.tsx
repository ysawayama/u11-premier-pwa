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

// 3ピリオド制の定数
const PERIOD_DURATION = 15 * 60; // 15分 = 900秒
const HALF_PERIOD = 7.5 * 60; // 7分30秒でエンド交代
const BREAK1_DURATION = 2 * 60; // 1stピリオド後2分休憩
const BREAK2_DURATION = 4 * 60; // 2ndピリオド後4分休憩

type Period = '1st' | 'break1' | '2nd' | 'break2' | '3rd' | 'finished';

type GameEvent = {
  id: string;
  type: EventType;
  minute: number;
  period: '1st' | '2nd' | '3rd';
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
  periodsPlayed: number[]; // 出場したピリオド番号 (1, 2, 3)
};

// localStorage用のキー生成
const getRosterStorageKey = (matchId: string) => `match-roster-${matchId}`;
const getMatchRecordStorageKey = (matchId: string) => `match-record-${matchId}`;
const getCardHistoryStorageKey = () => `card-history`; // 全試合共通の警告・退場履歴

// localStorage用のデータ型
type StoredRoster = {
  starters: string[]; // player IDs
  starterGK?: string; // GKのplayer ID
  substitutes: string[]; // player IDs
  submittedAt: string;
};

// 試合記録データ型
type StoredMatchRecord = {
  recorderName: string; // 記録者名
  refereeName: string; // 主審名
  savedAt: string;
};

// 警告・退場履歴データ型
type CardHistoryEntry = {
  matchId: string;
  matchDate: string;
  playerId: string;
  playerName: string;
  cardType: 'yellow_card' | 'red_card';
  recordedAt: string;
};

type CardHistory = {
  entries: CardHistoryEntry[];
};

// 選手の出場時間追跡
type PlayerPlayTime = {
  playerId: string;
  periodTimes: {
    1: number; // 1stピリオドの出場秒数
    2: number; // 2ndピリオドの出場秒数
    3: number; // 3rdピリオドの出場秒数
  };
  enteredAt: number | null; // 現在出場中の場合、入った時の経過秒数
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

  // タイマー状態（3ピリオド制）
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [period, setPeriod] = useState<Period>('1st');
  const [breakSeconds, setBreakSeconds] = useState(0);
  const [currentPeriodNumber, setCurrentPeriodNumber] = useState(1); // 1, 2, 3
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // スコア（各ピリオドと合計）
  const [homeScores, setHomeScores] = useState({ '1st': 0, '2nd': 0, '3rd': 0 });
  const [awayScores, setAwayScores] = useState({ '1st': 0, '2nd': 0, '3rd': 0 });
  const homeTotal = homeScores['1st'] + homeScores['2nd'] + homeScores['3rd'];
  const awayTotal = awayScores['1st'] + awayScores['2nd'] + awayScores['3rd'];

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

  // 試合開始前の設定
  const [showSetupModal, setShowSetupModal] = useState(true);
  const [recorderName, setRecorderName] = useState('');
  const [refereeName, setRefereeName] = useState('');
  const [setupComplete, setSetupComplete] = useState(false);

  // 出場時間追跡
  const [playerPlayTimes, setPlayerPlayTimes] = useState<PlayerPlayTime[]>([]);

  // GK情報
  const [starterGKId, setStarterGKId] = useState<string | null>(null);

  // 権限チェック
  useEffect(() => {
    if (user && user.user_type !== 'coach' && user.user_type !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    loadData();
  }, [resolvedParams.matchId]);

  // タイマー処理（3ピリオド制）
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        if (period === 'break1' || period === 'break2') {
          setBreakSeconds((prev) => prev + 1);
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
  }, [timerRunning, period]);

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
          // スコアは初期状態のままで良い（homeScores/awayScoresは{ '1st': 0, '2nd': 0, '3rd': 0 }で初期化済み）
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
        // 既存のスコアがあれば1stピリオドに設定（詳細な3ピリオドスコアは後で個別に取得する必要あり）
        if (matchData.home_score) {
          setHomeScores((prev) => ({ ...prev, '1st': matchData.home_score || 0 }));
        }
        if (matchData.away_score) {
          setAwayScores((prev) => ({ ...prev, '1st': matchData.away_score || 0 }));
        }

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
            const gkId = parsed.starterGK;
            const substituteIds = parsed.substitutes || [];

            // GK情報を保存
            if (gkId) {
              setStarterGKId(gkId);
            }

            // 先発IDにGKも含める
            const allStarterIds = gkId ? [...starterIds, gkId] : starterIds;

            // 選手にステータスを設定（3ピリオド制対応）
            const playersWithStatus: PlayerWithStatus[] = playersData
              .filter((p) => allStarterIds.includes(p.id) || substituteIds.includes(p.id))
              .map((p) => ({
                ...p,
                isStarter: allStarterIds.includes(p.id),
                isOnField: allStarterIds.includes(p.id), // 先発は最初から出場中
                periodsPlayed: allStarterIds.includes(p.id) ? [1] : [], // 先発は1stピリオドに出場
              }));

            setPlayers(playersWithStatus);

            // 出場時間追跡を初期化
            const initialPlayTimes: PlayerPlayTime[] = playersWithStatus.map((p) => ({
              playerId: p.id,
              periodTimes: { 1: 0, 2: 0, 3: 0 },
              enteredAt: allStarterIds.includes(p.id) ? 0 : null, // 先発は0秒から出場開始
            }));
            setPlayerPlayTimes(initialPlayTimes);
          } catch {
            setRosterNotFound(true);
            setPlayers([]);
          }
        }

        // 試合記録設定を復元
        const storedRecord = localStorage.getItem(getMatchRecordStorageKey(resolvedParams.matchId));
        if (storedRecord) {
          try {
            const recordData: StoredMatchRecord = JSON.parse(storedRecord);
            setRecorderName(recordData.recorderName || '');
            setRefereeName(recordData.refereeName || '');
            if (recordData.recorderName && recordData.refereeName) {
              setSetupComplete(true);
              setShowSetupModal(false);
            }
          } catch {
            // パースエラーは無視
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

  // 現在の分数を取得（3ピリオド制）
  const getCurrentMinute = () => {
    // 各ピリオドは0分からスタート、15分まで
    return Math.floor(elapsedSeconds / 60);
  };

  // 現在のピリオド名を取得
  const getPeriodName = (p: Period): string => {
    switch (p) {
      case '1st': return '1st';
      case 'break1': return '1st後インターバル';
      case '2nd': return '2nd';
      case 'break2': return '2nd後インターバル';
      case '3rd': return '3rd';
      case 'finished': return '試合終了';
    }
  };

  // ピリオドの色を取得
  const getPeriodColor = (p: Period): string => {
    switch (p) {
      case '1st': return 'bg-green-500';
      case 'break1': return 'bg-yellow-500 text-yellow-900';
      case '2nd': return 'bg-blue-500';
      case 'break2': return 'bg-yellow-500 text-yellow-900';
      case '3rd': return 'bg-orange-500';
      case 'finished': return 'bg-gray-500';
    }
  };

  // タイマー制御
  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    if (period === 'break1' || period === 'break2') {
      setBreakSeconds(0);
    } else {
      setElapsedSeconds(0);
    }
  };

  // 出場時間を集計（ピリオド終了時）
  const calculatePlayTime = (periodNumber: 1 | 2 | 3) => {
    setPlayerPlayTimes(prev => prev.map(pt => {
      if (pt.enteredAt !== null) {
        // 出場中の選手の時間を確定
        const playedTime = elapsedSeconds - pt.enteredAt;
        return {
          ...pt,
          periodTimes: {
            ...pt.periodTimes,
            [periodNumber]: pt.periodTimes[periodNumber] + playedTime
          },
          enteredAt: null // ピリオド終了でリセット
        };
      }
      return pt;
    }));
  };

  // 選手の総出場時間を取得（秒）
  const getPlayerTotalPlayTime = (playerId: string): number => {
    const pt = playerPlayTimes.find(p => p.playerId === playerId);
    if (!pt) return 0;
    return pt.periodTimes[1] + pt.periodTimes[2] + pt.periodTimes[3];
  };

  // ピリオド終了 → インターバルへ
  const endPeriod = () => {
    setTimerRunning(false);

    if (period === '1st') {
      // 出場時間を集計
      calculatePlayTime(1);

      setPeriod('break1');
      setBreakSeconds(0);
      // 出場中の選手の1stピリオド出場を確定
      setPlayers(prev => prev.map(p => ({
        ...p,
        periodsPlayed: p.isOnField && !p.periodsPlayed.includes(1)
          ? [...p.periodsPlayed, 1]
          : p.periodsPlayed
      })));
    } else if (period === '2nd') {
      // 出場時間を集計
      calculatePlayTime(2);

      setPeriod('break2');
      setBreakSeconds(0);
      // 出場中の選手の2ndピリオド出場を確定
      setPlayers(prev => prev.map(p => ({
        ...p,
        periodsPlayed: p.isOnField && !p.periodsPlayed.includes(2)
          ? [...p.periodsPlayed, 2]
          : p.periodsPlayed
      })));

      // 2nd終了時のチェック：未出場選手と出場時間不足選手
      setTimeout(() => {
        checkPlayTimeAlerts();
      }, 500);
    } else if (period === '3rd') {
      // 出場時間を集計
      calculatePlayTime(3);

      // 出場中の選手の3rdピリオド出場を確定
      setPlayers(prev => prev.map(p => ({
        ...p,
        periodsPlayed: p.isOnField && !p.periodsPlayed.includes(3)
          ? [...p.periodsPlayed, 3]
          : p.periodsPlayed
      })));
      setPeriod('finished');
    }
  };

  // 2nd終了時の出場時間チェック
  const checkPlayTimeAlerts = () => {
    const alerts: string[] = [];
    const requiredTime = PERIOD_DURATION; // 最低1ピリオド分 = 15分 = 900秒

    players.forEach(player => {
      const totalTime = getPlayerTotalPlayTime(player.id);
      const isGK = player.id === starterGKId;

      if (totalTime < requiredTime && !isGK) {
        const remainingTime = requiredTime - totalTime;
        const remainingMins = Math.ceil(remainingTime / 60);
        alerts.push(`${player.family_name}選手が、このピリオドであと${remainingMins}分出場する必要があります`);
      }
    });

    if (alerts.length > 0) {
      alert(alerts.join('\n'));
    }
  };

  // 3rd開始前の未出場選手チェック
  const checkUnplayedPlayersAlert = (): boolean => {
    const unplayedPlayers = players.filter(p => p.periodsPlayed.length === 0);

    if (unplayedPlayers.length > 0) {
      const names = unplayedPlayers.map(p => p.family_name).join('、');
      alert(`${names}選手がまだ1ピリオドも出場していないので、次のピリオドで出場してください`);
      return true; // アラートを表示した
    }
    return false;
  };

  // 次のピリオドをスタート
  const startNextPeriod = () => {
    setTimerRunning(false);
    setElapsedSeconds(0);
    setBreakSeconds(0);

    if (period === 'break1') {
      setPeriod('2nd');
      setCurrentPeriodNumber(2);

      // 出場中の選手の出場時間追跡を開始
      setPlayerPlayTimes(prev => prev.map(pt => {
        const player = players.find(p => p.id === pt.playerId);
        if (player?.isOnField) {
          return { ...pt, enteredAt: 0 };
        }
        return pt;
      }));

      // 現在出場中の選手に2ndピリオドを記録
      setPlayers(prev => prev.map(p => ({
        ...p,
        periodsPlayed: p.isOnField && !p.periodsPlayed.includes(2)
          ? [...p.periodsPlayed, 2]
          : p.periodsPlayed
      })));
    } else if (period === 'break2') {
      // 3rd開始前に未出場選手をチェック
      checkUnplayedPlayersAlert();

      setPeriod('3rd');
      setCurrentPeriodNumber(3);

      // 出場中の選手の出場時間追跡を開始
      setPlayerPlayTimes(prev => prev.map(pt => {
        const player = players.find(p => p.id === pt.playerId);
        if (player?.isOnField) {
          return { ...pt, enteredAt: 0 };
        }
        return pt;
      }));

      // 現在出場中の選手に3rdピリオドを記録
      setPlayers(prev => prev.map(p => ({
        ...p,
        periodsPlayed: p.isOnField && !p.periodsPlayed.includes(3)
          ? [...p.periodsPlayed, 3]
          : p.periodsPlayed
      })));
    }
  };

  // 試合終了
  const endMatch = () => {
    setTimerRunning(false);
    // 3rdピリオドの出場を確定
    setPlayers(prev => prev.map(p => ({
      ...p,
      periodsPlayed: p.isOnField && !p.periodsPlayed.includes(3)
        ? [...p.periodsPlayed, 3]
        : p.periodsPlayed
    })));
    setPeriod('finished');
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

  // 現在のピリオドを取得（イベント記録用）
  const getCurrentPeriodForEvent = (): '1st' | '2nd' | '3rd' => {
    if (period === '1st' || period === 'break1') return '1st';
    if (period === '2nd' || period === 'break2') return '2nd';
    return '3rd';
  };

  // イベントを追加（3ピリオド制対応）
  const addEvent = useCallback(() => {
    if (!eventType || !selectedTeamId) return;

    const player = players.find((p) => p.id === selectedPlayerId);
    const playerOut = players.find((p) => p.id === selectedPlayerOutId);
    const currentPeriod = getCurrentPeriodForEvent();

    const newEvent: GameEvent = {
      id: `temp-${Date.now()}`,
      type: eventType,
      minute: getCurrentMinute(),
      period: currentPeriod,
      teamId: selectedTeamId,
      playerId: selectedPlayerId || undefined,
      playerName: player ? `${player.family_name} ${player.given_name}` : undefined,
      playerOutId: selectedPlayerOutId || undefined,
      playerOutName: playerOut ? `${playerOut.family_name} ${playerOut.given_name}` : undefined,
    };

    setEvents((prev) => [...prev, newEvent].sort((a, b) => {
      // ピリオド順 → 分順でソート
      const periodOrder = { '1st': 1, '2nd': 2, '3rd': 3 };
      if (periodOrder[a.period] !== periodOrder[b.period]) {
        return periodOrder[a.period] - periodOrder[b.period];
      }
      return a.minute - b.minute;
    }));

    // スコア更新（ピリオド別）
    if (eventType === 'goal') {
      if (match) {
        if (selectedTeamId === match.home_team_id) {
          setHomeScores(prev => ({ ...prev, [currentPeriod]: prev[currentPeriod] + 1 }));
        } else {
          setAwayScores(prev => ({ ...prev, [currentPeriod]: prev[currentPeriod] + 1 }));
        }
      }
    }

    // 交代処理：出場状態を更新 + ピリオド出場記録 + 出場時間追跡
    if (eventType === 'substitution' && selectedPlayerId && selectedPlayerOutId) {
      // 出場時間追跡を更新
      setPlayerPlayTimes(prev => prev.map(pt => {
        if (pt.playerId === selectedPlayerOutId && pt.enteredAt !== null) {
          // 退場する選手の出場時間を確定
          const playedTime = elapsedSeconds - pt.enteredAt;
          return {
            ...pt,
            periodTimes: {
              ...pt.periodTimes,
              [currentPeriodNumber as 1 | 2 | 3]: pt.periodTimes[currentPeriodNumber as 1 | 2 | 3] + playedTime
            },
            enteredAt: null
          };
        }
        if (pt.playerId === selectedPlayerId) {
          // 入場する選手の出場開始時間を記録
          return { ...pt, enteredAt: elapsedSeconds };
        }
        return pt;
      }));

      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === selectedPlayerId) {
            // 入る選手：出場中にして、現在ピリオドを記録
            return {
              ...p,
              isOnField: true,
              periodsPlayed: p.periodsPlayed.includes(currentPeriodNumber)
                ? p.periodsPlayed
                : [...p.periodsPlayed, currentPeriodNumber]
            };
          }
          if (p.id === selectedPlayerOutId) {
            return { ...p, isOnField: false };
          }
          return p;
        })
      );
    }

    // 警告・退場の記録を保存
    if ((eventType === 'yellow_card' || eventType === 'red_card') && player && match) {
      const cardEntry: CardHistoryEntry = {
        matchId: match.id,
        matchDate: match.match_date,
        playerId: player.id,
        playerName: `${player.family_name} ${player.given_name}`,
        cardType: eventType,
        recordedAt: new Date().toISOString(),
      };

      // localStorageに保存
      const storedHistory = localStorage.getItem(getCardHistoryStorageKey());
      let history: CardHistory = { entries: [] };
      if (storedHistory) {
        try {
          history = JSON.parse(storedHistory);
        } catch {
          // パースエラーは無視
        }
      }
      history.entries.push(cardEntry);
      localStorage.setItem(getCardHistoryStorageKey(), JSON.stringify(history));
    }

    setShowEventModal(false);
    setEventType(null);
    setSelectedTeamId(null);
    setSelectedPlayerId(null);
    setSelectedPlayerOutId(null);
  }, [eventType, selectedTeamId, selectedPlayerId, selectedPlayerOutId, players, match, period, currentPeriodNumber]);

  // イベント削除（3ピリオド制対応）
  const removeEvent = (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    if (event.type === 'goal') {
      // スコアを戻す（ピリオド別）
      if (match) {
        if (event.teamId === match.home_team_id) {
          setHomeScores(prev => ({ ...prev, [event.period]: Math.max(0, prev[event.period] - 1) }));
        } else {
          setAwayScores(prev => ({ ...prev, [event.period]: Math.max(0, prev[event.period] - 1) }));
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

      // 試合スコアを更新（合計スコア）
      const { error: matchError } = await supabase
        .from('matches')
        .update({
          home_score: homeTotal,
          away_score: awayTotal,
          status: period === 'finished' ? 'finished' : 'in_progress',
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
      {/* スコアボード（3ピリオド制） */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-4 mb-4 text-white">
        {/* ピリオド表示 */}
        <div className="text-center mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPeriodColor(period)}`}>
            {getPeriodName(period)}
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

          {/* スコア（合計） */}
          <div className="flex items-center gap-4">
            <span className="text-5xl font-bold">{homeTotal}</span>
            <span className="text-2xl text-white/50">-</span>
            <span className="text-5xl font-bold">{awayTotal}</span>
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

        {/* ピリオド別スコア */}
        <div className="mt-3 flex justify-center gap-4 text-xs">
          <div className="text-center">
            <p className="text-white/50">1st</p>
            <p className="font-bold">{homeScores['1st']} - {awayScores['1st']}</p>
          </div>
          <div className="text-center">
            <p className="text-white/50">2nd</p>
            <p className="font-bold">{homeScores['2nd']} - {awayScores['2nd']}</p>
          </div>
          <div className="text-center">
            <p className="text-white/50">3rd</p>
            <p className="font-bold">{homeScores['3rd']} - {awayScores['3rd']}</p>
          </div>
        </div>

        {/* タイマー */}
        <div className="mt-4 text-center">
          {(period === 'break1' || period === 'break2') ? (
            <>
              <p className="text-4xl font-mono font-bold text-yellow-300">{formatTime(breakSeconds)}</p>
              <p className="text-xs text-yellow-200 mt-1">
                インターバル（{period === 'break1' ? '2分' : '4分'}）
              </p>
            </>
          ) : period !== 'finished' ? (
            <>
              <p className="text-4xl font-mono font-bold">{formatTime(elapsedSeconds)}</p>
              <p className="text-xs text-white/60 mt-1">{getCurrentMinute()}分 / 15分</p>
            </>
          ) : (
            <p className="text-2xl font-bold text-white/80">試合終了</p>
          )}
        </div>
      </div>

      {/* タイマーコントロール（3ピリオド制） */}
      {period !== 'finished' && (
        <div className="flex gap-2 mb-4">
          {(period === 'break1' || period === 'break2') ? (
            /* インターバル中 */
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
                onClick={startNextPeriod}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Play size={18} />
                {period === 'break1' ? '2ndスタート' : '3rdスタート'}
              </button>
            </>
          ) : (
            /* ピリオド中 */
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
              {period === '3rd' ? (
                <button
                  onClick={endMatch}
                  className="px-4 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors"
                >
                  試合終了
                </button>
              ) : (
                <button
                  onClick={endPeriod}
                  className="px-4 py-3 bg-yellow-500 text-yellow-900 rounded-xl font-bold text-sm hover:bg-yellow-600 transition-colors"
                >
                  {period === '1st' ? '1st終了' : '2nd終了'}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* 出場中メンバー表示（ピリオド出場数付き） */}
      <div className="mb-4 p-3 bg-green-50 rounded-xl">
        <p className="text-xs font-bold text-green-800 mb-2">出場中 ({playersOnField.length}人)</p>
        <div className="flex flex-wrap gap-1">
          {playersOnField.map((player) => {
            const periodCount = player.periodsPlayed.length;
            const isMaxPeriods = periodCount >= 2 && !player.position?.includes('GK');
            return (
              <span
                key={player.id}
                className={`px-2 py-1 rounded text-[10px] font-medium ${
                  isMaxPeriods
                    ? 'bg-orange-200 text-orange-800'
                    : 'bg-green-200 text-green-800'
                }`}
              >
                #{player.uniform_number} {player.family_name}
                <span className="ml-1 opacity-70">({periodCount}P)</span>
              </span>
            );
          })}
        </div>
        <p className="text-[10px] text-green-600 mt-2">
          ※ GKとFP1名のみ3P出場可。その他は最大2P
        </p>
      </div>

      {/* 控えメンバー表示（ピリオド出場数付き） */}
      {substitutes.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded-xl">
          <p className="text-xs font-bold text-gray-600 mb-2">控え ({substitutes.length}人)</p>
          <div className="flex flex-wrap gap-1">
            {substitutes.map((player) => {
              const periodCount = player.periodsPlayed.length;
              const isMaxPeriods = periodCount >= 2 && !player.position?.includes('GK');
              const notYetPlayed = periodCount === 0;
              return (
                <span
                  key={player.id}
                  className={`px-2 py-1 rounded text-[10px] font-medium ${
                    isMaxPeriods
                      ? 'bg-red-100 text-red-600 line-through'
                      : notYetPlayed
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  #{player.uniform_number} {player.family_name}
                  {periodCount > 0 && <span className="ml-1 opacity-70">({periodCount}P)</span>}
                  {notYetPlayed && <span className="ml-1">⚠️</span>}
                </span>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-500 mt-2">
            ⚠️ 未出場 ・ 取消線 = 出場上限到達
          </p>
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

      {/* イベントタイムライン（3ピリオド制） */}
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
                    <span className="text-xs text-gray-400 mr-1">[{event.period}]</span>
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
                <span className="font-medium text-blue-600">[{getCurrentPeriodForEvent()}]</span> {getCurrentMinute()}分 -{' '}
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

      {/* 記録者・主審設定モーダル */}
      {showSetupModal && !setupComplete && !rosterNotFound && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-600 text-white p-4">
              <h3 className="text-lg font-bold">試合記録の設定</h3>
              <p className="text-xs text-blue-100 mt-1">記録開始前に以下の情報を入力してください</p>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  記録者名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={recorderName}
                  onChange={(e) => setRecorderName(e.target.value)}
                  placeholder="例: 山田太郎"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">スコア記録を行う方のお名前</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  主審氏名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={refereeName}
                  onChange={(e) => setRefereeName(e.target.value)}
                  placeholder="例: 佐藤次郎"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">この試合の主審のお名前</p>
              </div>

              <button
                onClick={() => {
                  if (!recorderName.trim() || !refereeName.trim()) {
                    alert('記録者名と主審氏名を入力してください');
                    return;
                  }
                  // localStorageに保存
                  const recordData: StoredMatchRecord = {
                    recorderName: recorderName.trim(),
                    refereeName: refereeName.trim(),
                    savedAt: new Date().toISOString(),
                  };
                  localStorage.setItem(getMatchRecordStorageKey(resolvedParams.matchId), JSON.stringify(recordData));
                  setSetupComplete(true);
                  setShowSetupModal(false);
                }}
                disabled={!recorderName.trim() || !refereeName.trim()}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                記録を開始する
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
