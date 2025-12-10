'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  MapPin,
  ExternalLink,
  CheckCircle2,
  Circle,
  Zap,
  Clock,
  Car,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { getMatchById } from '@/lib/api/matches';
import { createClient } from '@/lib/supabase/client';
import type { MatchWithTeams, Player } from '@/types/database';

/**
 * 試合準備専用画面
 * - 会場情報・地図
 * - 持ち物チェックリスト
 * - 選手証表示
 * - 注意事項
 */
export default function MatchPreparePage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [match, setMatch] = useState<MatchWithTeams | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // チェックリスト状態（ローカルストレージで永続化）
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    uniform: false,
    shinpads: false,
    drinks: false,
    playerCard: false,
    towel: false,
  });

  // 選手証モーダル
  const [showPlayerCard, setShowPlayerCard] = useState(false);

  useEffect(() => {
    loadData();
    loadChecklist();
  }, [matchId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // ログインユーザーの選手情報を取得
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: playerData } = await supabase
          .from('players')
          .select('*, team:teams(*)')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (playerData) {
          setPlayer(playerData);

          // デモ用IDの場合はダミーデータを使用
          if (matchId === 'demo-match-1') {
            const demoMatch: MatchWithTeams = {
              id: 'demo-match-1',
              home_team_id: playerData.team_id,
              away_team_id: 'demo-azamino',
              match_date: '2025-12-07T14:00:00+09:00',
              venue: 'あざみ野西公園',
              venue_address: '神奈川県横浜市青葉区あざみ野南',
              venue_map_url: 'https://maps.google.com/?q=あざみ野西公園',
              venue_parking_info: '近隣コインパーキングをご利用ください',
              status: 'scheduled',
              match_type: 'league',
              home_score: null,
              away_score: null,
              weather: null,
              temperature: null,
              referee: null,
              notes: '最終節！優勝をかけた大一番\n集合時間: 13:00\n持ち物忘れに注意',
              season_id: null,
              round: 10,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              home_team: playerData.team || {
                id: playerData.team_id,
                name: '大豆戸FC',
                short_name: '大豆戸',
                logo_url: null,
                prefecture_id: null,
                founded_year: null,
                home_ground: null,
                description: null,
                website_url: null,
                contact_email: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              away_team: {
                id: 'demo-azamino',
                name: 'あざみ野FC',
                short_name: 'あざみ野',
                logo_url: null,
                prefecture_id: null,
                founded_year: null,
                home_ground: null,
                description: null,
                website_url: null,
                contact_email: null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            };
            setMatch(demoMatch);
          } else {
            // 通常の試合情報を取得
            const matchData = await getMatchById(matchId);
            setMatch(matchData);
          }
        }
      } else {
        // 未ログインの場合もデモ表示
        if (matchId === 'demo-match-1') {
          const demoMatch: MatchWithTeams = {
            id: 'demo-match-1',
            home_team_id: 'demo-mamedo',
            away_team_id: 'demo-azamino',
            match_date: '2025-12-07T14:00:00+09:00',
            venue: 'あざみ野西公園',
            venue_address: '神奈川県横浜市青葉区あざみ野南',
            venue_map_url: 'https://maps.google.com/?q=あざみ野西公園',
            venue_parking_info: '近隣コインパーキングをご利用ください',
            status: 'scheduled',
            match_type: 'league',
            home_score: null,
            away_score: null,
            weather: null,
            temperature: null,
            referee: null,
            notes: '最終節！優勝をかけた大一番\n集合時間: 13:00\n持ち物忘れに注意',
            season_id: null,
            round: 10,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            home_team: {
              id: 'demo-mamedo',
              name: '大豆戸FC',
              short_name: '大豆戸',
              logo_url: null,
              prefecture_id: null,
              founded_year: null,
              home_ground: null,
              description: null,
              website_url: null,
              contact_email: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            away_team: {
              id: 'demo-azamino',
              name: 'あざみ野FC',
              short_name: 'あざみ野',
              logo_url: null,
              prefecture_id: null,
              founded_year: null,
              home_ground: null,
              description: null,
              website_url: null,
              contact_email: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          };
          setMatch(demoMatch);
        } else {
          const matchData = await getMatchById(matchId);
          setMatch(matchData);
        }
      }
    } catch (err: any) {
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const loadChecklist = () => {
    const saved = localStorage.getItem(`match-prepare-${matchId}`);
    if (saved) {
      setChecklist(JSON.parse(saved));
    }
  };

  const toggleCheck = (key: string) => {
    const newChecklist = { ...checklist, [key]: !checklist[key] };
    setChecklist(newChecklist);
    localStorage.setItem(`match-prepare-${matchId}`, JSON.stringify(newChecklist));
  };

  // 試合までの日数計算
  // MVP v2 デモ用: 2025年12月1日時点での表示をシミュレート
  const getDaysUntil = () => {
    if (!match) return 0;
    const matchDate = new Date(match.match_date);
    // デモ用: 実際の今日の代わりに12月1日を基準日として使用
    const demoToday = new Date('2025-12-01T00:00:00+09:00');
    matchDate.setHours(0, 0, 0, 0);
    return Math.ceil((matchDate.getTime() - demoToday.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getCountdownText = () => {
    const days = getDaysUntil();
    if (days === 0) return '今日';
    if (days === 1) return '明日';
    if (days < 0) return '終了';
    return `あと${days}日`;
  };

  const getCountdownColor = () => {
    const days = getDaysUntil();
    if (days <= 1) return 'bg-red-500';
    if (days <= 3) return 'bg-orange-500';
    return 'bg-blue-500';
  };

  // チェックリストアイテム定義
  const checklistItems = [
    { key: 'uniform', label: 'ユニフォーム', description: 'ホーム or アウェイ確認' },
    { key: 'shinpads', label: 'すね当て', description: '必須装備' },
    { key: 'drinks', label: 'ドリンク', description: '2本以上推奨' },
    { key: 'playerCard', label: '選手証', description: '受付で提示' },
    { key: 'towel', label: 'タオル', description: '汗拭き用' },
  ];

  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const totalItems = checklistItems.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || '試合が見つかりません'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  const daysUntil = getDaysUntil();
  const isUpcoming = daysUntil >= 0 && match.status === 'scheduled';

  // 相手チームを特定
  const userTeamId = player?.team_id;
  const isHome = userTeamId === match.home_team_id;
  const opponent = isHome ? match.away_team : match.home_team;
  const myTeam = isHome ? match.home_team : match.away_team;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* ヘッダー */}
      <header
        className="sticky top-0 z-50 px-4 py-3"
        style={{
          background: 'linear-gradient(135deg, var(--color-navy) 0%, #1e3a5f 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-white/80 hover:text-white"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-white">試合準備</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* カウントダウン & 試合情報 */}
        <section
          className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--color-navy) 0%, #1e3a5f 100%)',
          }}
        >
          {/* カウントダウンバッジ */}
          <div className="absolute top-4 right-4">
            <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${getCountdownColor()}`}>
              <Zap size={16} />
              {getCountdownText()}
            </div>
          </div>

          {/* 日時 */}
          <div className="mb-6">
            <p className="text-white/70 text-sm mb-1">
              {new Date(match.match_date).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short',
              })}
            </p>
            <p className="text-2xl font-bold flex items-center gap-2">
              <Clock size={20} />
              {new Date(match.match_date).toLocaleTimeString('ja-JP', {
                hour: '2-digit',
                minute: '2-digit',
              })}
              <span className="text-sm font-normal text-white/70">キックオフ</span>
            </p>
          </div>

          {/* 対戦カード */}
          <div className="flex items-center justify-center gap-4 py-4 bg-white/10 rounded-xl">
            {/* 自チーム */}
            <div className="flex flex-col items-center flex-1">
              {myTeam?.logo_url ? (
                <div className="w-16 h-16 relative rounded-full overflow-hidden bg-white mb-2">
                  <Image
                    src={myTeam.logo_url}
                    alt={myTeam.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold">{myTeam?.name[0]}</span>
                </div>
              )}
              <p className="text-sm font-medium text-center">
                {myTeam?.short_name || myTeam?.name}
              </p>
            </div>

            <span className="text-xl font-bold text-white/60">vs</span>

            {/* 相手チーム */}
            <div className="flex flex-col items-center flex-1">
              {opponent?.logo_url ? (
                <div className="w-16 h-16 relative rounded-full overflow-hidden bg-white mb-2">
                  <Image
                    src={opponent.logo_url}
                    alt={opponent.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold">{opponent?.name[0]}</span>
                </div>
              )}
              <p className="text-sm font-medium text-center">
                {opponent?.short_name || opponent?.name}
              </p>
            </div>
          </div>
        </section>

        {/* 会場情報 */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-red-500" />
            会場
          </h2>

          <div className="space-y-3">
            <div>
              <p className="text-lg font-semibold text-gray-900">{match.venue}</p>
              {match.venue_address && (
                <p className="text-sm text-gray-500 mt-1">{match.venue_address}</p>
              )}
            </div>

            {/* Google Map リンク */}
            {match.venue_map_url ? (
              <a
                href={match.venue_map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors"
              >
                <MapPin size={18} />
                Google Mapで開く
                <ExternalLink size={14} />
              </a>
            ) : (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.venue || '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors"
              >
                <MapPin size={18} />
                Google Mapで検索
                <ExternalLink size={14} />
              </a>
            )}

            {/* 駐車場情報 */}
            {match.venue_parking_info && (
              <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
                <Car size={18} className="text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-700">駐車場</p>
                  <p className="text-sm text-gray-500">{match.venue_parking_info}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 持ち物チェックリスト */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              持ち物チェック
            </h2>
            <span className="text-sm font-medium text-gray-500">
              {checkedCount}/{totalItems}
            </span>
          </div>

          {/* プログレスバー */}
          <div className="w-full h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${(checkedCount / totalItems) * 100}%` }}
            />
          </div>

          <div className="space-y-2">
            {checklistItems.map((item) => (
              <button
                key={item.key}
                onClick={() => toggleCheck(item.key)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                  checklist[item.key]
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                }`}
              >
                {checklist[item.key] ? (
                  <CheckCircle2 size={24} className="text-green-500 flex-shrink-0" />
                ) : (
                  <Circle size={24} className="text-gray-300 flex-shrink-0" />
                )}
                <div className="text-left flex-1">
                  <p className={`font-medium ${checklist[item.key] ? 'text-green-700' : 'text-gray-700'}`}>
                    {item.label}
                  </p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </button>
            ))}
          </div>

          {checkedCount === totalItems && (
            <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm font-medium text-green-700 text-center">
                準備完了！試合頑張ってください！
              </p>
            </div>
          )}
        </section>

        {/* 選手証 */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-purple-500" />
            選手証
          </h2>

          {player ? (
            <div>
              <button
                onClick={() => setShowPlayerCard(true)}
                className="w-full"
              >
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-4 text-white">
                  <div className="flex items-center gap-4">
                    {/* 顔写真 */}
                    <div className="w-16 h-20 bg-white/20 rounded-lg flex items-center justify-center overflow-hidden">
                      {player.photo_url ? (
                        <Image
                          src={player.photo_url}
                          alt={`${player.family_name} ${player.given_name}`}
                          width={64}
                          height={80}
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{player.family_name?.[0]}</span>
                      )}
                    </div>

                    {/* 選手情報 */}
                    <div className="flex-1 text-left">
                      <p className="text-lg font-bold">
                        {player.family_name} {player.given_name}
                      </p>
                      <p className="text-sm text-white/70">
                        {player.family_name_kana} {player.given_name_kana}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="px-2 py-0.5 bg-white/20 rounded text-xs">
                          #{player.uniform_number || '-'}
                        </span>
                        <span className="text-xs text-white/70">
                          {player.position || 'ポジション未設定'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-center text-xs text-white/60 mt-3">
                    タップして拡大表示
                  </p>
                </div>
              </button>

              <Link
                href="/player-card"
                className="block mt-3 text-center text-sm text-primary font-medium hover:underline"
              >
                選手証ページを開く →
              </Link>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">選手情報が登録されていません</p>
            </div>
          )}
        </section>

        {/* 注意事項 */}
        {match.notes && (
          <section className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
            <h2 className="text-base font-bold text-yellow-800 mb-3 flex items-center gap-2">
              <AlertCircle size={18} />
              注意事項
            </h2>
            <p className="text-sm text-yellow-700 whitespace-pre-wrap">{match.notes}</p>
          </section>
        )}

        {/* 試合詳細へのリンク */}
        <div className="pt-4">
          <Link
            href={`/matches/${matchId}`}
            className="block text-center text-sm text-gray-500 hover:text-gray-700"
          >
            試合詳細を見る →
          </Link>
        </div>
      </main>

      {/* 選手証モーダル */}
      {showPlayerCard && player && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowPlayerCard(false)}
        >
          <div
            className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 w-full max-w-sm text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <p className="text-xs text-white/70">U-11プレミアリーグ</p>
              <p className="text-sm font-bold">選手証</p>
            </div>

            <div className="flex flex-col items-center">
              {/* 顔写真 */}
              <div className="w-24 h-32 bg-white/20 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                {player.photo_url ? (
                  <Image
                    src={player.photo_url}
                    alt={`${player.family_name} ${player.given_name}`}
                    width={96}
                    height={128}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-4xl">{player.family_name?.[0]}</span>
                )}
              </div>

              {/* 選手情報 */}
              <p className="text-2xl font-bold">
                {player.family_name} {player.given_name}
              </p>
              <p className="text-sm text-white/70 mb-4">
                {player.family_name_kana} {player.given_name_kana}
              </p>

              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <p className="text-3xl font-bold">#{player.uniform_number || '-'}</p>
                  <p className="text-xs text-white/70">背番号</p>
                </div>
                <div className="w-px h-10 bg-white/30" />
                <div className="text-center">
                  <p className="text-lg font-bold">{player.position || '-'}</p>
                  <p className="text-xs text-white/70">ポジション</p>
                </div>
              </div>

              {myTeam && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
                  {myTeam.logo_url && (
                    <Image
                      src={myTeam.logo_url}
                      alt={myTeam.name}
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  )}
                  <span className="text-sm">{myTeam.name}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowPlayerCard(false)}
              className="w-full mt-6 py-3 bg-white/20 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
