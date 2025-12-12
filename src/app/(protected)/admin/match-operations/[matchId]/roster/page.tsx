'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/stores/authStore';
import type { MatchWithTeams, Player, Team } from '@/types/database';
import PageWrapper from '@/components/layout/PageWrapper';
import { ArrowLeft, Check, Users, Send, ChevronRight, User, Calendar, Hash, Eye, Star } from 'lucide-react';

type RosterStatus = 'none' | 'starter' | 'starter_gk' | 'substitute';

type SelectedPlayer = Player & {
  rosterStatus: RosterStatus;
  suspensionReason?: string; // 出場停止理由（警告累積2回、または退場）
};

// 競技規則に基づく定数
const STARTER_COUNT = 8; // 競技者の数: 8人（うち1人はGK）
const MIN_TOTAL_PLAYERS = 11; // 試合成立人数: 選手11名以上

// localStorage用のキー生成
const getRosterStorageKey = (matchId: string) => `match-roster-${matchId}`;
const getCardHistoryStorageKey = () => `card-history`; // 全試合共通の警告・退場履歴

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

// 出場停止情報
type SuspensionInfo = {
  playerId: string;
  reason: string;
  yellowCount: number;
  hasRedCard: boolean;
};

// localStorage用のデータ型
type StoredRoster = {
  starters: string[]; // player IDs (FPのみ)
  starterGK?: string; // GKのplayer ID
  substitutes: string[]; // player IDs
  submittedAt: string;
};

/**
 * メンバー選出ページ
 * - チームメンバーから試合当日のメンバーを選出
 * - 先発11人と控えを分けて登録
 * - 本部提出用のリスト作成
 * - 選手確認（写真・生年月日・背番号）
 */
export default function RosterPage({ params }: { params: Promise<{ matchId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const [match, setMatch] = useState<MatchWithTeams | null>(null);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<SelectedPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'select' | 'confirm' | 'submitted'>('select');
  const [submitting, setSubmitting] = useState(false);
  const [suspensions, setSuspensions] = useState<SuspensionInfo[]>([]); // 出場停止選手リスト

  // 権限チェック
  useEffect(() => {
    if (user && user.user_type !== 'coach' && user.user_type !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    loadData();
  }, [resolvedParams.matchId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // 自分のチームを特定（大豆戸FCをデフォルトとする）
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
      }

      // チームの選手を取得
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', teamData.id)
        .eq('is_active', true)
        .order('uniform_number', { ascending: true });

      if (playersError) throw playersError;

      // 警告・退場履歴から出場停止選手をチェック
      const storedCardHistory = localStorage.getItem(getCardHistoryStorageKey());
      const suspensionList: SuspensionInfo[] = [];

      if (storedCardHistory) {
        try {
          const cardHistory: CardHistory = JSON.parse(storedCardHistory);

          // 選手ごとにカード履歴を集計
          const playerCardCounts = new Map<string, { yellow: number; red: number; lastMatchId: string }>();

          cardHistory.entries.forEach((entry) => {
            const current = playerCardCounts.get(entry.playerId) || { yellow: 0, red: 0, lastMatchId: '' };
            if (entry.cardType === 'yellow_card') {
              current.yellow++;
            } else if (entry.cardType === 'red_card') {
              current.red++;
            }
            current.lastMatchId = entry.matchId;
            playerCardCounts.set(entry.playerId, current);
          });

          // 出場停止判定
          playerCardCounts.forEach((counts, playerId) => {
            const player = playersData?.find((p) => p.id === playerId);
            if (!player) return;

            // 退場を受けた選手：次の1試合出場停止
            // ※現在の試合が退場後の最初の試合かどうかをチェック
            if (counts.red > 0) {
              // 退場を受けた試合が直前の試合（= 現在の試合ではない）場合、出場停止
              if (counts.lastMatchId !== resolvedParams.matchId) {
                suspensionList.push({
                  playerId,
                  reason: '退場による出場停止（次の1試合）',
                  yellowCount: counts.yellow,
                  hasRedCard: true,
                });
              }
            }
            // 警告累積2回：次の1試合出場停止
            else if (counts.yellow >= 2) {
              suspensionList.push({
                playerId,
                reason: `警告累積${counts.yellow}回による出場停止（次の1試合）`,
                yellowCount: counts.yellow,
                hasRedCard: false,
              });
            }
          });

          setSuspensions(suspensionList);
        } catch {
          // パースエラーは無視
        }
      }

      // 既存のロスター情報をlocalStorageから復元
      const storedRoster = localStorage.getItem(getRosterStorageKey(resolvedParams.matchId));
      let starterIds: string[] = [];
      let starterGKId: string | undefined;
      let substituteIds: string[] = [];

      if (storedRoster) {
        try {
          const parsed: StoredRoster = JSON.parse(storedRoster);
          starterIds = parsed.starters || [];
          starterGKId = parsed.starterGK;
          substituteIds = parsed.substitutes || [];
        } catch {
          // パースエラーは無視
        }
      }

      // 選手に選択状態と出場停止情報を追加
      const playersWithSelection: SelectedPlayer[] = (playersData || []).map((p) => {
        const suspension = suspensionList.find((s) => s.playerId === p.id);
        return {
          ...p,
          rosterStatus: p.id === starterGKId
            ? 'starter_gk'
            : starterIds.includes(p.id)
            ? 'starter'
            : substituteIds.includes(p.id)
            ? 'substitute'
            : 'none',
          suspensionReason: suspension?.reason,
        };
      });
      setPlayers(playersWithSelection);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 選手のステータスを切り替え（none → starter → substitute → none）
  const cyclePlayerStatus = (playerId: string) => {
    setPlayers((prev) => {
      const player = prev.find((p) => p.id === playerId);
      if (!player) return prev;

      const starterCount = prev.filter((p) => p.rosterStatus === 'starter' || p.rosterStatus === 'starter_gk').length;

      // 現在のステータスに応じて次のステータスを決定
      let nextStatus: RosterStatus;
      if (player.rosterStatus === 'none') {
        // 先発が8人未満なら先発、そうでなければ控えに
        nextStatus = starterCount < STARTER_COUNT ? 'starter' : 'substitute';
      } else if (player.rosterStatus === 'starter' || player.rosterStatus === 'starter_gk') {
        nextStatus = 'substitute';
      } else {
        nextStatus = 'none';
      }

      return prev.map((p) =>
        p.id === playerId ? { ...p, rosterStatus: nextStatus } : p
      );
    });
  };

  // 先発に追加
  const setAsStarter = (playerId: string) => {
    setPlayers((prev) => {
      const starterCount = prev.filter((p) => p.rosterStatus === 'starter' || p.rosterStatus === 'starter_gk').length;
      if (starterCount >= STARTER_COUNT) return prev;

      return prev.map((p) =>
        p.id === playerId ? { ...p, rosterStatus: 'starter' as RosterStatus } : p
      );
    });
  };

  // GKとして先発に設定
  const setAsStarterGK = (playerId: string) => {
    setPlayers((prev) => {
      // 既にGKがいる場合は、そのGKを通常の先発に変更
      const prevWithoutGK = prev.map((p) =>
        p.rosterStatus === 'starter_gk' ? { ...p, rosterStatus: 'starter' as RosterStatus } : p
      );

      const starterCount = prevWithoutGK.filter((p) => p.rosterStatus === 'starter' || p.rosterStatus === 'starter_gk').length;
      const isAlreadyStarter = prevWithoutGK.find((p) => p.id === playerId && (p.rosterStatus === 'starter' || p.rosterStatus === 'starter_gk'));

      // 先発でない選手をGKにする場合、先発が満員なら追加できない
      if (!isAlreadyStarter && starterCount >= STARTER_COUNT) return prev;

      return prevWithoutGK.map((p) =>
        p.id === playerId ? { ...p, rosterStatus: 'starter_gk' as RosterStatus } : p
      );
    });
  };

  // 控えに追加
  const setAsSubstitute = (playerId: string) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId ? { ...p, rosterStatus: 'substitute' as RosterStatus } : p
      )
    );
  };

  // 選択解除
  const removeFromRoster = (playerId: string) => {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId ? { ...p, rosterStatus: 'none' as RosterStatus } : p
      )
    );
  };

  // 先発選手（GK含む）
  const starters = players.filter((p) => p.rosterStatus === 'starter' || p.rosterStatus === 'starter_gk');
  // GK
  const starterGK = players.find((p) => p.rosterStatus === 'starter_gk');
  // 控え選手
  const substitutes = players.filter((p) => p.rosterStatus === 'substitute');
  // 未選択選手
  const unselectedPlayers = players.filter((p) => p.rosterStatus === 'none');
  // 選択された全選手
  const selectedPlayers = [...starters, ...substitutes];
  // 試合成立可否
  const canEstablishMatch = selectedPlayers.length >= MIN_TOTAL_PLAYERS;
  // 先発完了（8名かつGKあり）
  const startersComplete = starters.length === STARTER_COUNT && !!starterGK;

  // 生年月日をフォーマット
  const formatBirthDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // 年齢を計算
  const calculateAge = (dateStr: string) => {
    const birth = new Date(dateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // 本部提出
  const handleSubmit = async () => {
    if (starters.length !== STARTER_COUNT) {
      alert(`先発メンバーは${STARTER_COUNT}人を選択してください`);
      return;
    }
    if (!starterGK) {
      alert('先発にGKを1名選択してください');
      return;
    }
    if (!canEstablishMatch) {
      alert('控え選手も含めて11名以上を設定してください');
      return;
    }

    setSubmitting(true);

    // localStorageに保存
    const rosterData: StoredRoster = {
      starters: starters.filter((p) => p.rosterStatus !== 'starter_gk').map((p) => p.id),
      starterGK: starterGK?.id,
      substitutes: substitutes.map((p) => p.id),
      submittedAt: new Date().toISOString(),
    };
    localStorage.setItem(getRosterStorageKey(resolvedParams.matchId), JSON.stringify(rosterData));

    // デモ用に少し待機
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitting(false);
    setViewMode('submitted');
  };

  // ヘッダーコンポーネント
  const headerContent = (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Users size={24} />
          メンバー選出
        </h1>
        <p className="text-xs text-white/70 mt-0.5">
          {match ? `${new Date(match.match_date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })} vs ${match.home_team.name === myTeam?.name ? match.away_team.name : match.home_team.name}` : ''}
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

  if (error) {
    return (
      <PageWrapper header={headerContent}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
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

  return (
    <PageWrapper header={headerContent}>
      {/* 進行ステップ */}
      <div className="mb-6 flex items-center justify-center gap-2">
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${viewMode === 'select' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
          <span className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[10px]">1</span>
          選出
        </div>
        <ChevronRight size={16} className="text-gray-400" />
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${viewMode === 'confirm' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
          <span className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[10px]">2</span>
          確認
        </div>
        <ChevronRight size={16} className="text-gray-400" />
        <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium ${viewMode === 'submitted' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
          <span className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center text-[10px]">3</span>
          提出完了
        </div>
      </div>

      {/* 選出モード */}
      {viewMode === 'select' && (
        <>
          {/* 選択状態サマリー */}
          <div className={`mb-4 p-4 rounded-xl ${startersComplete && canEstablishMatch ? 'bg-green-50' : 'bg-blue-50'}`}>
            <div className="flex flex-col gap-2">
              <div>
                <p className={`text-sm font-bold ${startersComplete ? 'text-green-900' : 'text-blue-900'}`}>
                  先発: {starters.length}/{STARTER_COUNT}人 {starterGK ? '(GK ✓)' : '(GK未選択)'} / 控え: {substitutes.length}人
                </p>
                <p className={`text-xs ${startersComplete ? 'text-green-700' : 'text-blue-700'}`}>
                  {starters.length < STARTER_COUNT
                    ? `先発をあと${STARTER_COUNT - starters.length}人選択してください`
                    : !starterGK
                    ? 'GKを1名選択してください'
                    : '✓ 先発選択完了'}
                </p>
              </div>
              <div className={`text-xs ${canEstablishMatch ? 'text-green-700' : 'text-orange-600'}`}>
                {canEstablishMatch
                  ? `✓ 試合成立（計${selectedPlayers.length}名）`
                  : `⚠ 試合成立には計${MIN_TOTAL_PLAYERS}名以上必要（現在${selectedPlayers.length}名）`}
              </div>
            </div>
          </div>

          {/* 先発メンバー */}
          {starters.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-1">
                <Star size={14} className="fill-current" />
                先発 ({starters.length}/{STARTER_COUNT}人)
                {starterGK && <span className="ml-2 px-2 py-0.5 bg-yellow-400 text-yellow-900 rounded text-[10px]">GK: #{starterGK.uniform_number} {starterGK.family_name}</span>}
              </h3>
              <p className="text-xs text-gray-500 mb-2">タップで解除、GKボタンでGK設定</p>
              <div className="grid grid-cols-4 gap-2">
                {starters.map((player) => (
                  <div
                    key={player.id}
                    className={`p-2 rounded-xl text-center transition-all relative ${
                      player.rosterStatus === 'starter_gk'
                        ? 'bg-yellow-100 border-2 border-yellow-500'
                        : 'bg-green-100 border-2 border-green-500'
                    }`}
                  >
                    {player.rosterStatus === 'starter_gk' && (
                      <div className="absolute -top-1 -left-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">GK</span>
                      </div>
                    )}
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <Star size={12} className="text-white fill-current" />
                    </div>
                    <button
                      onClick={() => removeFromRoster(player.id)}
                      className="w-full"
                    >
                      <div className="w-10 h-10 mx-auto mb-1 rounded-full overflow-hidden bg-white">
                        {player.photo_url ? (
                          <Image
                            src={player.photo_url}
                            alt={player.family_name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={20} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <p className={`text-xs font-bold ${player.rosterStatus === 'starter_gk' ? 'text-yellow-800' : 'text-green-800'}`}>
                        {player.uniform_number && `#${player.uniform_number}`}
                      </p>
                      <p className={`text-[10px] truncate ${player.rosterStatus === 'starter_gk' ? 'text-yellow-700' : 'text-green-700'}`}>
                        {player.family_name}
                      </p>
                    </button>
                    {/* GKボタン */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (player.rosterStatus === 'starter_gk') {
                          // GKを解除して通常の先発に
                          setPlayers((prev) =>
                            prev.map((p) =>
                              p.id === player.id ? { ...p, rosterStatus: 'starter' as RosterStatus } : p
                            )
                          );
                        } else {
                          setAsStarterGK(player.id);
                        }
                      }}
                      className={`mt-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        player.rosterStatus === 'starter_gk'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-yellow-200'
                      }`}
                    >
                      {player.rosterStatus === 'starter_gk' ? 'GK ✓' : 'GK'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 控えメンバー */}
          {substitutes.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-blue-700 mb-2 flex items-center gap-1">
                <Users size={14} />
                控え ({substitutes.length}人)
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {substitutes.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => removeFromRoster(player.id)}
                    className="p-2 bg-blue-100 border-2 border-blue-400 rounded-xl text-center transition-all"
                  >
                    <div className="w-10 h-10 mx-auto mb-1 rounded-full overflow-hidden bg-white">
                      {player.photo_url ? (
                        <Image
                          src={player.photo_url}
                          alt={player.family_name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={20} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-bold text-blue-800">
                      {player.uniform_number && `#${player.uniform_number}`}
                    </p>
                    <p className="text-[10px] text-blue-700 truncate">
                      {player.family_name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 出場停止選手がいる場合の警告 */}
          {suspensions.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm font-bold text-red-700 mb-2">⚠️ 出場停止選手</p>
              <div className="space-y-1">
                {suspensions.map((s) => {
                  const player = players.find((p) => p.id === s.playerId);
                  return (
                    <p key={s.playerId} className="text-xs text-red-600">
                      {player ? `#${player.uniform_number} ${player.family_name}` : '選手'}: {s.reason}
                    </p>
                  );
                })}
              </div>
            </div>
          )}

          {/* 未選択選手リスト */}
          <div className="mb-20">
            <h3 className="text-sm font-bold text-gray-700 mb-2">
              選手一覧 ({unselectedPlayers.length}人)
            </h3>
            <p className="text-xs text-gray-500 mb-2">
              タップで先発に追加、長押しで控えに追加
            </p>
            <div className="space-y-2">
              {unselectedPlayers.map((player) => {
                const isSuspended = !!player.suspensionReason;
                return (
                  <div
                    key={player.id}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      isSuspended ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                    }`}
                  >
                    {/* 写真 */}
                    <div className={`w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ${isSuspended ? 'bg-red-100 opacity-50' : 'bg-gray-200'}`}>
                      {player.photo_url ? (
                        <Image
                          src={player.photo_url}
                          alt={`${player.family_name} ${player.given_name}`}
                          width={48}
                          height={48}
                          className={`w-full h-full object-cover ${isSuspended ? 'grayscale' : ''}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={24} className="text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* 選手情報 */}
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-bold ${isSuspended ? 'text-red-700 line-through' : 'text-gray-900'}`}>
                        {player.uniform_number && (
                          <span className={isSuspended ? 'text-red-500' : 'text-blue-600'}>#{player.uniform_number}</span>
                        )}
                        {' '}{player.family_name} {player.given_name}
                      </p>
                      {isSuspended ? (
                        <p className="text-xs text-red-600 font-medium">
                          🚫 {player.suspensionReason}
                        </p>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {player.position && (
                            <span className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600">
                              {player.position}
                            </span>
                          )}
                          <span>{calculateAge(player.date_of_birth)}歳</span>
                        </div>
                      )}
                    </div>

                    {/* アクションボタン */}
                    {isSuspended ? (
                      <div className="text-xs text-red-500 font-medium">
                        出場不可
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAsStarter(player.id)}
                          disabled={starters.length >= STARTER_COUNT}
                          className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <Star size={12} className="fill-current" />
                          先発
                        </button>
                        <button
                          onClick={() => setAsSubstitute(player.id)}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors"
                        >
                          控え
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 次へボタン（固定） */}
          {selectedPlayers.length > 0 && (
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t">
              <button
                onClick={() => {
                  // バリデーション
                  if (!canEstablishMatch) {
                    alert('控え選手も含めて11名以上を設定してください');
                    return;
                  }
                  if (starters.length !== STARTER_COUNT) {
                    alert(`先発は${STARTER_COUNT}名を選択してください`);
                    return;
                  }
                  if (!starterGK) {
                    alert('先発にGKを1名選択してください');
                    return;
                  }
                  setViewMode('confirm');
                }}
                disabled={!startersComplete || !canEstablishMatch}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {starters.length !== STARTER_COUNT
                  ? `先発をあと${STARTER_COUNT - starters.length}人選択`
                  : !starterGK
                  ? 'GKを選択してください'
                  : !canEstablishMatch
                  ? `あと${MIN_TOTAL_PLAYERS - selectedPlayers.length}名選択で試合成立`
                  : 'メンバー確認へ'}
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {/* 確認モード */}
      {viewMode === 'confirm' && (
        <>
          <div className="mb-4 p-4 bg-green-50 rounded-xl">
            <p className="text-sm font-bold text-green-900 flex items-center gap-2">
              <Eye size={16} />
              本部提出前の最終確認
            </p>
            <p className="text-xs text-green-700 mt-1">
              以下のメンバーで間違いないか確認してください
            </p>
          </div>

          {/* 先発選手詳細リスト */}
          <div className="mb-4">
            <h3 className="text-sm font-bold text-green-700 mb-2 flex items-center gap-1">
              <Star size={14} className="fill-current" />
              先発メンバー ({starters.length}人)
            </h3>
            <div className="space-y-3">
              {starters.map((player, index) => (
                <div
                  key={player.id}
                  className="bg-white rounded-xl border-2 border-green-300 overflow-hidden"
                >
                  <div className="flex items-stretch">
                    {/* 番号 */}
                    <div className="w-10 bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>

                    {/* 写真 */}
                    <div className="w-20 h-24 bg-gray-100 flex-shrink-0">
                      {player.photo_url ? (
                        <Image
                          src={player.photo_url}
                          alt={`${player.family_name} ${player.given_name}`}
                          width={80}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User size={32} className="text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* 選手情報 */}
                    <div className="flex-1 p-3">
                      <p className="text-base font-bold text-gray-900 mb-1">
                        {player.family_name} {player.given_name}
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Hash size={12} />
                          <span>背番号: <strong>{player.uniform_number || '-'}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar size={12} />
                          <span>{formatBirthDate(player.date_of_birth)} ({calculateAge(player.date_of_birth)}歳)</span>
                        </div>
                        {player.position && (
                          <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                            {player.position}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 控え選手詳細リスト */}
          {substitutes.length > 0 && (
            <div className="mb-20">
              <h3 className="text-sm font-bold text-blue-700 mb-2 flex items-center gap-1">
                <Users size={14} />
                控えメンバー ({substitutes.length}人)
              </h3>
              <div className="space-y-3">
                {substitutes.map((player, index) => (
                  <div
                    key={player.id}
                    className="bg-white rounded-xl border border-blue-200 overflow-hidden"
                  >
                    <div className="flex items-stretch">
                      {/* 番号 */}
                      <div className="w-10 bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>

                      {/* 写真 */}
                      <div className="w-20 h-24 bg-gray-100 flex-shrink-0">
                        {player.photo_url ? (
                          <Image
                            src={player.photo_url}
                            alt={`${player.family_name} ${player.given_name}`}
                            width={80}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User size={32} className="text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* 選手情報 */}
                      <div className="flex-1 p-3">
                        <p className="text-base font-bold text-gray-900 mb-1">
                          {player.family_name} {player.given_name}
                        </p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Hash size={12} />
                            <span>背番号: <strong>{player.uniform_number || '-'}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Calendar size={12} />
                            <span>{formatBirthDate(player.date_of_birth)} ({calculateAge(player.date_of_birth)}歳)</span>
                          </div>
                          {player.position && (
                            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                              {player.position}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* アクションボタン（固定） */}
          <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t">
            <div className="flex gap-3">
              <button
                onClick={() => setViewMode('select')}
                className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-300 transition-colors"
              >
                戻る
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    送信中...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    本部へ提出
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* 提出完了モード */}
      {viewMode === 'submitted' && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <Check size={40} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            メンバー提出完了
          </h2>
          <p className="text-sm text-gray-600 mb-2">
            先発{starters.length}名、控え{substitutes.length}名を本部へ提出しました
          </p>
          <p className="text-xs text-gray-500 mb-6">
            試合記録画面でこのメンバー情報が使用されます
          </p>

          <div className="space-y-3">
            <Link
              href={`/admin/match-operations/${resolvedParams.matchId}/record`}
              className="block w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors"
            >
              試合記録へ進む
            </Link>
            <Link
              href="/admin/match-operations"
              className="block w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-300 transition-colors"
            >
              試合運営に戻る
            </Link>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
