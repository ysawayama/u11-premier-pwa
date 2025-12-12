'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ChevronLeft,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Swords,
  MessageSquare,
  Users,
  Award,
  Calendar,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Player } from '@/types/database';

// 過去対戦成績の型
type HeadToHead = {
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  lastMatches: {
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    isHome: boolean;
    result: 'win' | 'draw' | 'loss';
  }[];
};

// 相手チームの今季成績
type OpponentStats = {
  rank: number;
  totalTeams: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  recentMatches: {
    opponent: string;
    homeScore: number;
    awayScore: number;
    result: 'win' | 'draw' | 'loss';
    isHome: boolean;
  }[];
};

// 監督コメントの型
type CoachComment = {
  author: string;
  role: string;
  content: string;
  postedAt: string;
};

// チーム情報の型
type TeamInfo = {
  id: string;
  name: string;
  shortName: string;
  logoUrl: string | null;
};

export default function OpponentPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<Player | null>(null);

  // デモ用のチーム情報
  const myTeam: TeamInfo = {
    id: 'demo-mamedo',
    name: '大豆戸FC',
    shortName: '大豆戸',
    logoUrl: '/images/teams/omamedofc.png',
  };

  const opponent: TeamInfo = {
    id: 'demo-azamino',
    name: 'あざみ野FC',
    shortName: 'あざみ野',
    logoUrl: '/images/teams/azamino-fc.png',
  };

  // デモ用の過去対戦成績
  const headToHead: HeadToHead = {
    wins: 3,
    draws: 2,
    losses: 1,
    goalsFor: 12,
    goalsAgainst: 7,
    lastMatches: [
      {
        date: '2025-06-15',
        homeTeam: '大豆戸FC',
        awayTeam: 'あざみ野FC',
        homeScore: 3,
        awayScore: 1,
        isHome: true,
        result: 'win',
      },
      {
        date: '2024-11-23',
        homeTeam: 'あざみ野FC',
        awayTeam: '大豆戸FC',
        homeScore: 2,
        awayScore: 2,
        isHome: false,
        result: 'draw',
      },
      {
        date: '2024-05-12',
        homeTeam: '大豆戸FC',
        awayTeam: 'あざみ野FC',
        homeScore: 2,
        awayScore: 1,
        isHome: true,
        result: 'win',
      },
      {
        date: '2023-12-03',
        homeTeam: 'あざみ野FC',
        awayTeam: '大豆戸FC',
        homeScore: 1,
        awayScore: 0,
        isHome: false,
        result: 'loss',
      },
    ],
  };

  // デモ用の相手チーム今季成績（順位表データに基づく: 4位、11試合、7勝0分4敗、勝点21）
  const opponentStats: OpponentStats = {
    rank: 4,
    totalTeams: 11,
    played: 11,
    wins: 7,
    draws: 0,
    losses: 4,
    goalsFor: 22,
    goalsAgainst: 14,
    goalDifference: 8,
    points: 21,
    recentMatches: [
      { opponent: 'ESFORCO', homeScore: 1, awayScore: 3, result: 'loss', isHome: false },
      { opponent: '大豆戸FC', homeScore: 0, awayScore: 2, result: 'loss', isHome: true },
      { opponent: 'vinculo', homeScore: 2, awayScore: 1, result: 'win', isHome: false },
      { opponent: '横浜ジュニオール', homeScore: 3, awayScore: 1, result: 'win', isHome: true },
      { opponent: '黒滝SC', homeScore: 2, awayScore: 0, result: 'win', isHome: false },
      { opponent: 'TDFC', homeScore: 1, awayScore: 2, result: 'loss', isHome: true },
      { opponent: 'PALAVRA', homeScore: 3, awayScore: 0, result: 'win', isHome: false },
      { opponent: 'SFAT伊勢原', homeScore: 2, awayScore: 1, result: 'win', isHome: true },
      { opponent: '東海岸', homeScore: 4, awayScore: 1, result: 'win', isHome: false },
      { opponent: 'あざみ野K', homeScore: 3, awayScore: 2, result: 'win', isHome: true },
      { opponent: 'ESFORCO', homeScore: 1, awayScore: 3, result: 'loss', isHome: true },
    ],
  };

  // デモ用の監督コメント
  const coachComments: CoachComment[] = [
    {
      author: '田中コーチ',
      role: '監督',
      content: 'あざみ野FCは攻撃力があるチームです。特に10番の選手は要注意。\n\n今回は守備からしっかりブロックを作り、カウンターで仕留める戦術でいきましょう。\n\n前半は相手の出方を見て、後半勝負です。焦らずにいこう！',
      postedAt: '2025-12-05T20:00:00+09:00',
    },
    {
      author: '佐藤コーチ',
      role: 'アシスタントコーチ',
      content: 'セットプレーのチャンスを大事にしよう。相手はコーナーキックからの失点が多いので、しっかり練習した形を出していこう。',
      postedAt: '2025-12-04T19:30:00+09:00',
    },
  ];

  useEffect(() => {
    loadData();
  }, [matchId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

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
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  // 結果に応じた色とアイコン
  const getResultStyle = (result: 'win' | 'draw' | 'loss') => {
    switch (result) {
      case 'win':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: <TrendingUp size={14} /> };
      case 'draw':
        return { bg: 'bg-gray-100', text: 'text-gray-600', icon: <Minus size={14} /> };
      case 'loss':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: <TrendingDown size={14} /> };
    }
  };

  const totalMatches = headToHead.wins + headToHead.draws + headToHead.losses;

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
          <h1 className="text-lg font-bold text-white">対戦相手について知る</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* 対戦カード */}
        <section
          className="rounded-2xl p-6 text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--color-navy) 0%, #1e3a5f 100%)',
          }}
        >
          <div className="flex items-center justify-center gap-4">
            {/* 自チーム */}
            <div className="flex flex-col items-center flex-1">
              {myTeam.logoUrl ? (
                <div className="w-16 h-16 relative rounded-full overflow-hidden bg-white mb-2">
                  <Image
                    src={myTeam.logoUrl}
                    alt={myTeam.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold">{myTeam.name[0]}</span>
                </div>
              )}
              <p className="text-sm font-medium text-center">{myTeam.shortName}</p>
            </div>

            <div className="flex flex-col items-center">
              <Swords size={24} className="text-white/60" />
            </div>

            {/* 相手チーム */}
            <div className="flex flex-col items-center flex-1">
              {opponent.logoUrl ? (
                <div className="w-16 h-16 relative rounded-full overflow-hidden bg-white mb-2">
                  <Image
                    src={opponent.logoUrl}
                    alt={opponent.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold">{opponent.name[0]}</span>
                </div>
              )}
              <p className="text-sm font-medium text-center">{opponent.shortName}</p>
            </div>
          </div>
        </section>

        {/* 過去対戦成績 */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" />
            過去対戦成績
          </h2>

          {/* 勝敗サマリー */}
          <div className="flex items-center justify-center gap-6 mb-4 p-4 bg-gray-50 rounded-xl">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{headToHead.wins}</p>
              <p className="text-xs text-gray-500">勝ち</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-400">{headToHead.draws}</p>
              <p className="text-xs text-gray-500">引分</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{headToHead.losses}</p>
              <p className="text-xs text-gray-500">負け</p>
            </div>
          </div>

          {/* 得失点 */}
          <div className="flex items-center justify-center gap-4 mb-4 text-sm">
            <span className="text-gray-600">
              総得点 <span className="font-bold text-green-600">{headToHead.goalsFor}</span>
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-600">
              総失点 <span className="font-bold text-red-600">{headToHead.goalsAgainst}</span>
            </span>
          </div>

          {/* 過去の試合結果 */}
          <h3 className="text-sm font-medium text-gray-700 mb-2">直近の対戦</h3>
          <div className="space-y-2">
            {headToHead.lastMatches.map((match, index) => {
              const style = getResultStyle(match.result);
              return (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${style.bg}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 text-xs font-medium ${style.text}`}>
                      {style.icon}
                      {match.result === 'win' ? '勝' : match.result === 'draw' ? '分' : '負'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(match.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">
                      {match.isHome ? myTeam.shortName : opponent.shortName}
                    </span>
                    <span className="font-bold text-gray-900">
                      {match.homeScore} - {match.awayScore}
                    </span>
                    <span className="text-sm text-gray-700">
                      {match.isHome ? opponent.shortName : myTeam.shortName}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 相手チームの今季成績 */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target size={18} className="text-blue-500" />
            {opponent.shortName}の今季成績
          </h2>

          {/* 順位・ポイント */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">{opponentStats.rank}位</p>
              <p className="text-xs text-gray-500">{opponentStats.totalTeams}チーム中</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{opponentStats.points}</p>
              <p className="text-xs text-gray-500">勝ち点</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-gray-700">{opponentStats.goalsFor}</p>
              <p className="text-xs text-gray-500">総得点</p>
            </div>
          </div>

          {/* 戦績 */}
          <div className="flex items-center justify-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg text-sm">
            <span>{opponentStats.played}試合</span>
            <span className="text-green-600 font-medium">{opponentStats.wins}勝</span>
            <span className="text-gray-500">{opponentStats.draws}分</span>
            <span className="text-red-600 font-medium">{opponentStats.losses}敗</span>
            <span className={`font-medium ${opponentStats.goalDifference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              得失点差 {opponentStats.goalDifference > 0 ? '+' : ''}{opponentStats.goalDifference}
            </span>
          </div>

          {/* 今季の対戦結果 */}
          <h3 className="text-sm font-medium text-gray-700 mb-2">今季のリーグ戦結果</h3>
          <div className="space-y-1.5">
            {opponentStats.recentMatches.map((match, index) => {
              const style = getResultStyle(match.result);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${style.bg} ${style.text}`}>
                      {match.result === 'win' ? '○' : match.result === 'draw' ? '△' : '●'}
                    </span>
                    <span className="text-sm text-gray-700">{match.opponent}</span>
                    <span className="text-xs text-gray-400">
                      {match.isHome ? '(H)' : '(A)'}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900">
                    {match.homeScore} - {match.awayScore}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 監督・コーチコメント */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-green-500" />
            監督・コーチからのメッセージ
          </h2>

          <div className="space-y-4">
            {coachComments.map((comment, index) => (
              <div
                key={index}
                className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center">
                    <Users size={18} className="text-green-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{comment.author}</p>
                    <p className="text-xs text-gray-500">{comment.role}</p>
                  </div>
                  <span className="ml-auto text-xs text-gray-400">
                    {new Date(comment.postedAt).toLocaleDateString('ja-JP', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 試合準備に戻る */}
        <div className="pt-4">
          <button
            onClick={() => router.back()}
            className="w-full py-4 bg-navy text-white rounded-xl font-medium"
            style={{ background: 'var(--color-navy)' }}
          >
            試合準備画面に戻る
          </button>
        </div>
      </main>
    </div>
  );
}
