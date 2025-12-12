'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ChevronDown, ChevronUp, Clock, Play, PenLine, MapPin, Trophy, Target } from 'lucide-react';

// 試合データの型定義
type MatchScore = {
  first: number;
  second: number;
  third: number;
  total: number;
};

type Scorer = {
  name: string;
  number: number;
  goals: number;
};

type PastMatch = {
  id: string;
  date: string;
  opponent: string;
  opponentLogo: string | null;
  homeScore: MatchScore;
  awayScore: MatchScore;
  isHome: boolean;
  result: 'win' | 'draw' | 'loss';
  venue: string;
  playingTime: number;
  coachComment: string;
  videoUrl: string | null;
  scorers: Scorer[];
};

// 大豆戸FCの実際の試合データ（公式サイトpl11.jpより）
// 15試合: 12勝0分3敗
const pastMatchesData: PastMatch[] = [
  // 2025年12月7日: あざみ野FC 1-2 大豆戸FC（アウェイ）
  {
    id: 'match-2025-12-07',
    date: '2025-12-07',
    opponent: 'あざみ野FC',
    opponentLogo: '/images/teams/azamino-fc.png',
    homeScore: { first: 0, second: 0, third: 1, total: 1 },
    awayScore: { first: 0, second: 2, third: 0, total: 2 },
    isHome: false,
    result: 'win',
    venue: 'あざみ野西公園',
    playingTime: 45,
    coachComment: '最終節、見事な勝利！2ndピリオドで奥田と楠本が決めてくれた。3rdで1点返されたけど、最後まで集中を切らさず守り切れた。シーズン2位という素晴らしい結果、みんなよく頑張った！',
    videoUrl: null,
    scorers: [
      { name: '奥田　至誠', number: 71, goals: 1 },
      { name: '楠本　涼馬', number: 68, goals: 1 },
    ],
  },
  // 2025年10月13日: あざみ野キッカーズ 0-8 大豆戸FC（アウェイ）
  {
    id: 'match-2025-10-13b',
    date: '2025-10-13',
    opponent: 'あざみ野キッカーズ',
    opponentLogo: '/images/teams/azamino-kickers.png',
    homeScore: { first: 0, second: 0, third: 0, total: 0 },
    awayScore: { first: 3, second: 4, third: 1, total: 8 },
    isHome: false,
    result: 'win',
    venue: 'あざみ野西公園',
    playingTime: 45,
    coachComment: '8得点の大勝！全ピリオドで得点を奪い、守備も完封。チーム全員が攻守で貢献できた理想的な試合だった。この勢いを維持していこう！',
    videoUrl: null,
    scorers: [
      { name: '宮前　耀多', number: 50, goals: 2 },
      { name: '黒須　拓哉', number: 80, goals: 2 },
      { name: '安達　海音', number: 36, goals: 1 },
      { name: '矢嶋　光駈', number: 47, goals: 1 },
      { name: '吉見　海翔', number: 49, goals: 1 },
      { name: '佐藤　壮真', number: 64, goals: 1 },
    ],
  },
  // 2025年10月13日: 大豆戸FC 3-1 横浜ジュニオールSC（ホーム）
  {
    id: 'match-2025-10-13a',
    date: '2025-10-13',
    opponent: '横浜ジュニオールSC',
    opponentLogo: '/images/teams/yokohama-junior.png',
    homeScore: { first: 2, second: 1, third: 0, total: 3 },
    awayScore: { first: 0, second: 0, third: 1, total: 1 },
    isHome: true,
    result: 'win',
    venue: 'あざみ野西公園',
    playingTime: 45,
    coachComment: '6月の対戦では5-0で勝利したけど、今回は接戦。相手も成長していた。前半で2点リードを作れたのが大きかった。しっかり勝ち切れた！',
    videoUrl: null,
    scorers: [
      { name: '矢嶋　光駈', number: 47, goals: 1 },
      { name: '吉見　海翔', number: 49, goals: 1 },
      { name: '宮前　耀多', number: 50, goals: 1 },
    ],
  },
  // 2025年10月12日: 大豆戸FC 2-1 TDFC（ホーム）
  {
    id: 'match-2025-10-12b',
    date: '2025-10-12',
    opponent: 'TDFC',
    opponentLogo: '/images/teams/tdfc.png',
    homeScore: { first: 0, second: 1, third: 1, total: 2 },
    awayScore: { first: 1, second: 0, third: 0, total: 1 },
    isHome: true,
    result: 'win',
    venue: '磯野台グランド',
    playingTime: 45,
    coachComment: '1stで先制されたけど、2nd・3rdで逆転！5月に続いてTDFCに連勝。最後まで集中力を切らさなかったのが勝因。',
    videoUrl: null,
    scorers: [
      { name: '矢嶋　光駈', number: 47, goals: 1 },
      { name: '奥田　至誠', number: 71, goals: 1 },
    ],
  },
  // 2025年10月12日: PALAVRA FC 0-3 大豆戸FC（アウェイ）
  {
    id: 'match-2025-10-12a',
    date: '2025-10-12',
    opponent: 'PALAVRA FC',
    opponentLogo: '/images/teams/palavra.png',
    homeScore: { first: 0, second: 0, third: 0, total: 0 },
    awayScore: { first: 2, second: 0, third: 1, total: 3 },
    isHome: false,
    result: 'win',
    venue: '磯野台グランド',
    playingTime: 40,
    coachComment: '6月に続いてPALAVRA相手に連勝。1stで2点取って主導権を握り、完封勝利。攻守のバランスが取れた試合だった！',
    videoUrl: null,
    scorers: [
      { name: '宮前　耀多', number: 50, goals: 2 },
      { name: '山本　祐士', number: 63, goals: 1 },
    ],
  },
  // 2025年9月21日: SFAT ISEHARA SC 0-1 大豆戸FC（アウェイ）
  {
    id: 'match-2025-09-21',
    date: '2025-09-21',
    opponent: 'SFAT ISEHARA SC',
    opponentLogo: '/images/teams/sfat-isehara.png',
    homeScore: { first: 0, second: 0, third: 0, total: 0 },
    awayScore: { first: 0, second: 1, third: 0, total: 1 },
    isHome: false,
    result: 'win',
    venue: '上満寺多目的スポーツ広場',
    playingTime: 40,
    coachComment: '1-0の僅差での勝利。相手の堅い守備に苦しんだけど、2ndピリオドで吉見が決めてくれた。こういう接戦を勝ちきる経験は大きい！',
    videoUrl: null,
    scorers: [
      { name: '吉見　海翔', number: 49, goals: 1 },
    ],
  },
  // 2025年9月20日: 大豆戸FC 13-0 FC東海岸（ホーム）
  {
    id: 'match-2025-09-20',
    date: '2025-09-20',
    opponent: 'FC東海岸',
    opponentLogo: '/images/teams/tokaigan.png',
    homeScore: { first: 5, second: 5, third: 3, total: 13 },
    awayScore: { first: 0, second: 0, third: 0, total: 0 },
    isHome: true,
    result: 'win',
    venue: '金井公園',
    playingTime: 45,
    coachComment: '13得点の大勝！全員がゴールに向かう姿勢を見せてくれた。大量リードでも最後まで集中を切らさず、守備も無失点。チームとしての完成度を感じた試合だった！',
    videoUrl: null,
    scorers: [
      { name: '矢嶋　光駈', number: 47, goals: 4 },
      { name: '安達　海音', number: 36, goals: 3 },
      { name: '吉見　海翔', number: 49, goals: 1 },
      { name: '宮前　耀多', number: 50, goals: 1 },
      { name: '奥田　至誠', number: 71, goals: 1 },
      { name: '布山　隼誠', number: 57, goals: 1 },
      { name: '山本　祐士', number: 63, goals: 1 },
    ],
  },
  // 2025年7月20日: 大豆戸FC 0-5 FC.vinculo（ホーム）※敗戦
  {
    id: 'match-2025-07-20',
    date: '2025-07-20',
    opponent: 'FC.vinculo',
    opponentLogo: '/images/teams/vinculo.png',
    homeScore: { first: 0, second: 0, third: 0, total: 0 },
    awayScore: { first: 1, second: 3, third: 1, total: 5 },
    isHome: true,
    result: 'loss',
    venue: 'かもめパーク',
    playingTime: 40,
    coachComment: '強豪vinculo相手に完敗。相手の速い展開についていけず、全ピリオドで失点。でもこの悔しさを忘れずに。強いチームと戦えることは成長のチャンス。プレスの強度と切り替えの速さを改善していこう！',
    videoUrl: null,
    scorers: [],
  },
  // 2025年7月12日: 大豆戸FC 2-4 黒滝SC（ホーム）※敗戦
  {
    id: 'match-2025-07-12',
    date: '2025-07-12',
    opponent: '黒滝SC',
    opponentLogo: '/images/teams/kurotaki.png',
    homeScore: { first: 1, second: 0, third: 1, total: 2 },
    awayScore: { first: 2, second: 0, third: 2, total: 4 },
    isHome: true,
    result: 'loss',
    venue: '境川遊水池グラウンド',
    playingTime: 40,
    coachComment: '2点差での敗戦。1stと3rdで失点が多かった。宮前と伴が1点ずつ返したけど、追いつくには至らず。でも最後まで諦めない姿勢は良かった！次に活かそう。',
    videoUrl: null,
    scorers: [
      { name: '宮前　耀多', number: 50, goals: 1 },
      { name: '伴　泰良', number: 70, goals: 1 },
    ],
  },
  // 2025年7月6日: 大豆戸FC 6-3 あざみ野FC（ホーム）
  {
    id: 'match-2025-07-06',
    date: '2025-07-06',
    opponent: 'あざみ野FC',
    opponentLogo: '/images/teams/azamino-fc.png',
    homeScore: { first: 3, second: 3, third: 0, total: 6 },
    awayScore: { first: 1, second: 1, third: 1, total: 3 },
    isHome: true,
    result: 'win',
    venue: '小雀公園',
    playingTime: 45,
    coachComment: 'ホームで6得点の勝利！前半で6点取り切れたのは素晴らしい。宮前と野津山が2点ずつ。守備でも3失点に抑えられた。この勢いを次に繋げよう！',
    videoUrl: null,
    scorers: [
      { name: '宮前　耀多', number: 50, goals: 2 },
      { name: '野津山　瞬太', number: 46, goals: 2 },
      { name: '安達　海音', number: 36, goals: 1 },
      { name: '矢嶋　光駈', number: 47, goals: 1 },
    ],
  },
  // 2025年6月28日: ESFORCO F.C. 8-0 大豆戸FC（アウェイ）※敗戦
  {
    id: 'match-2025-06-28',
    date: '2025-06-28',
    opponent: 'ESFORCO F.C.',
    opponentLogo: '/images/teams/esforco.png',
    homeScore: { first: 3, second: 4, third: 1, total: 8 },
    awayScore: { first: 0, second: 0, third: 0, total: 0 },
    isHome: false,
    result: 'loss',
    venue: '新横浜投擲練習場',
    playingTime: 35,
    coachComment: 'リーグ首位のESFORCO相手に完敗。永井選手を中心とした攻撃を止められなかった。でも強いチームと戦えることは貴重な経験。この悔しさを忘れずに、次のステップへ進もう！',
    videoUrl: null,
    scorers: [],
  },
  // 2025年6月22日: 横浜ジュニオールSC 0-5 大豆戸FC（アウェイ）
  {
    id: 'match-2025-06-22b',
    date: '2025-06-22',
    opponent: '横浜ジュニオールSC',
    opponentLogo: '/images/teams/yokohama-junior.png',
    homeScore: { first: 0, second: 0, third: 0, total: 0 },
    awayScore: { first: 1, second: 3, third: 1, total: 5 },
    isHome: false,
    result: 'win',
    venue: '金井公園',
    playingTime: 45,
    coachComment: 'アウェイで5得点の完勝！守備も無失点で完璧だった。奥田が2点、攻守のバランスが取れた理想的な試合。この調子を維持していこう！',
    videoUrl: null,
    scorers: [
      { name: '奥田　至誠', number: 71, goals: 2 },
      { name: '矢嶋　光駈', number: 47, goals: 1 },
      { name: '伴　泰良', number: 70, goals: 1 },
    ],
  },
  // 2025年6月22日: 大豆戸FC 6-1 PALAVRA FC（ホーム）
  {
    id: 'match-2025-06-22a',
    date: '2025-06-22',
    opponent: 'PALAVRA FC',
    opponentLogo: '/images/teams/palavra.png',
    homeScore: { first: 2, second: 3, third: 1, total: 6 },
    awayScore: { first: 0, second: 0, third: 1, total: 1 },
    isHome: true,
    result: 'win',
    venue: '金井公園',
    playingTime: 45,
    coachComment: 'ホームで快勝！6人が得点に絡み、チーム全体で攻めることができた。1失点はあったけど、チームとしてのまとまりを感じた試合だった！',
    videoUrl: null,
    scorers: [
      { name: '安達　海音', number: 36, goals: 1 },
      { name: '吉見　海翔', number: 49, goals: 1 },
      { name: '宮前　耀多', number: 50, goals: 1 },
      { name: '奥田　至誠', number: 71, goals: 1 },
      { name: '黒須　拓哉', number: 80, goals: 1 },
      { name: '佐藤　壮真', number: 64, goals: 1 },
    ],
  },
  // 2025年5月18日: TDFC 0-2 大豆戸FC（アウェイ）
  {
    id: 'match-2025-05-18b',
    date: '2025-05-18',
    opponent: 'TDFC',
    opponentLogo: '/images/teams/tdfc.png',
    homeScore: { first: 0, second: 0, third: 0, total: 0 },
    awayScore: { first: 0, second: 0, third: 2, total: 2 },
    isHome: false,
    result: 'win',
    venue: 'あざみ野西公園',
    playingTime: 40,
    coachComment: 'アウェイで完封勝利！前半は0-0で耐え、3rdで宮前と奥田が決めてくれた。守備の集中力が光った試合だった。',
    videoUrl: null,
    scorers: [
      { name: '宮前　耀多', number: 50, goals: 1 },
      { name: '奥田　至誠', number: 71, goals: 1 },
    ],
  },
  // 2025年5月18日: 大豆戸FC 5-1 あざみ野キッカーズ（ホーム）
  {
    id: 'match-2025-05-18a',
    date: '2025-05-18',
    opponent: 'あざみ野キッカーズ',
    opponentLogo: '/images/teams/azamino-kickers.png',
    homeScore: { first: 1, second: 2, third: 2, total: 5 },
    awayScore: { first: 0, second: 0, third: 1, total: 1 },
    isHome: true,
    result: 'win',
    venue: 'あざみ野西公園',
    playingTime: 45,
    coachComment: 'シーズン初戦を勝利で飾れた！安達の2得点を筆頭に5得点は素晴らしい。1失点はあったけど、チーム全体で攻守にバランスの取れた試合ができた。いいスタートが切れた！',
    videoUrl: null,
    scorers: [
      { name: '安達　海音', number: 36, goals: 2 },
      { name: '吉見　海翔', number: 49, goals: 1 },
      { name: '宮前　耀多', number: 50, goals: 1 },
      { name: '松村　航志', number: 60, goals: 1 },
    ],
  },
];

// 曜日名
const weekdayNames = ['日', '月', '火', '水', '木', '金', '土'];

// 日付フォーマット
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}(${weekdayNames[date.getDay()]})`;
}

// 結果バッジ
function getResultBadge(result: 'win' | 'draw' | 'loss') {
  switch (result) {
    case 'win': return { text: '勝', bg: 'bg-green-500', color: 'text-white' };
    case 'draw': return { text: '分', bg: 'bg-gray-400', color: 'text-white' };
    case 'loss': return { text: '負', bg: 'bg-red-500', color: 'text-white' };
  }
}

// MessageSquareアイコン
const MessageSquare = ({ size, className }: { size: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

export default function MyMatchesPage() {
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  // ローカルストレージからノートを読み込み
  useEffect(() => {
    const savedNotes: Record<string, string> = {};
    pastMatchesData.forEach(match => {
      const saved = localStorage.getItem(`match-note-${match.id}`);
      if (saved) {
        savedNotes[match.id] = saved;
      }
    });
    setNotes(savedNotes);
  }, []);

  // ノートを保存
  const saveNote = (matchId: string, note: string) => {
    setNotes(prev => ({ ...prev, [matchId]: note }));
    localStorage.setItem(`match-note-${matchId}`, note);
  };

  // 戦績サマリー
  const wins = pastMatchesData.filter(m => m.result === 'win').length;
  const draws = pastMatchesData.filter(m => m.result === 'draw').length;
  const losses = pastMatchesData.filter(m => m.result === 'loss').length;
  const totalGoalsFor = pastMatchesData.reduce((acc, m) => {
    return acc + (m.isHome ? m.homeScore.total : m.awayScore.total);
  }, 0);
  const totalGoalsAgainst = pastMatchesData.reduce((acc, m) => {
    return acc + (m.isHome ? m.awayScore.total : m.homeScore.total);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-navy flex items-center gap-2">
                <Trophy size={24} className="text-accent" />
                大豆戸FCの試合結果
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">2025シーズン 神奈川2部A</p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* 戦績サマリー */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-2xl font-black text-navy">{pastMatchesData.length}</p>
              <p className="text-xs text-gray-500">試合</p>
            </div>
            <div>
              <p className="text-2xl font-black text-green-600">{wins}</p>
              <p className="text-xs text-gray-500">勝</p>
            </div>
            <div>
              <p className="text-2xl font-black text-gray-500">{draws}</p>
              <p className="text-xs text-gray-500">分</p>
            </div>
            <div>
              <p className="text-2xl font-black text-red-500">{losses}</p>
              <p className="text-xs text-gray-500">敗</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-center gap-6">
            <div className="text-center">
              <p className="text-lg font-bold text-primary">{totalGoalsFor}</p>
              <p className="text-xs text-gray-500">得点</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-red-500">{totalGoalsAgainst}</p>
              <p className="text-xs text-gray-500">失点</p>
            </div>
            <div className="text-center">
              <p className={`text-lg font-bold ${totalGoalsFor - totalGoalsAgainst >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {totalGoalsFor - totalGoalsAgainst >= 0 ? '+' : ''}{totalGoalsFor - totalGoalsAgainst}
              </p>
              <p className="text-xs text-gray-500">得失点差</p>
            </div>
          </div>
        </div>

        {/* 試合リスト */}
        <div className="space-y-3">
          {pastMatchesData.map((match) => {
            const isExpanded = expandedMatchId === match.id;
            const badge = getResultBadge(match.result);
            const myScore = match.isHome ? match.homeScore : match.awayScore;
            const oppScore = match.isHome ? match.awayScore : match.homeScore;

            return (
              <div key={match.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* 試合概要（クリックで展開） */}
                <button
                  onClick={() => setExpandedMatchId(isExpanded ? null : match.id)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  {/* 結果バッジ */}
                  <span className={`w-10 h-10 rounded-full ${badge.bg} ${badge.color} flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                    {badge.text}
                  </span>

                  {/* 対戦相手 */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {match.opponentLogo ? (
                      <div className="w-10 h-10 relative flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
                        <Image
                          src={match.opponentLogo}
                          alt={match.opponent}
                          fill
                          className="object-contain p-1"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-500">{match.opponent[0]}</span>
                      </div>
                    )}
                    <div className="text-left min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        vs {match.opponent}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatDate(match.date)} {match.isHome ? '(H)' : '(A)'}
                      </p>
                    </div>
                  </div>

                  {/* スコア */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {myScore.total} - {oppScore.total}
                    </p>
                  </div>

                  {/* 展開アイコン */}
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp size={20} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-400" />
                    )}
                  </div>
                </button>

                {/* 詳細（展開時） */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-4">
                    {/* スコア詳細 */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">スコア詳細</p>
                      <div className="grid grid-cols-5 gap-1 text-center text-sm">
                        <div className="text-xs text-gray-400">チーム</div>
                        <div className="text-xs text-gray-400">1st</div>
                        <div className="text-xs text-gray-400">2nd</div>
                        <div className="text-xs text-gray-400">3rd</div>
                        <div className="text-xs text-gray-400 font-medium">合計</div>

                        <div className="font-medium text-primary">大豆戸</div>
                        <div>{myScore.first}</div>
                        <div>{myScore.second}</div>
                        <div>{myScore.third}</div>
                        <div className="font-bold">{myScore.total}</div>

                        <div className="font-medium text-gray-600 truncate">{match.opponent.length > 6 ? match.opponent.substring(0, 6) : match.opponent}</div>
                        <div>{oppScore.first}</div>
                        <div>{oppScore.second}</div>
                        <div>{oppScore.third}</div>
                        <div className="font-bold">{oppScore.total}</div>
                      </div>
                    </div>

                    {/* 得点者（自チームのみ） */}
                    {match.scorers.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center gap-1 mb-2">
                          <Target size={14} className="text-blue-600" />
                          <p className="text-xs font-medium text-blue-700">得点者</p>
                        </div>
                        <div className="space-y-1">
                          {match.scorers.map((scorer, idx) => (
                            <p key={idx} className="text-sm text-blue-800">
                              #{scorer.number} {scorer.name} {scorer.goals > 1 ? `×${scorer.goals}` : ''}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 試合情報 */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <MapPin size={12} className="text-gray-500" />
                          <p className="text-xs text-gray-500">会場</p>
                        </div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                          {match.venue}
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center gap-1 mb-1">
                          <Clock size={12} className="text-blue-500" />
                          <p className="text-xs text-blue-600">私の出場時間</p>
                        </div>
                        <p className="text-sm font-bold text-blue-700">
                          {match.playingTime}分
                        </p>
                      </div>
                    </div>

                    {/* 監督コーチコメント */}
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-2">
                        <MessageSquare size={14} className="text-green-600" />
                        <p className="text-xs font-medium text-green-700">監督・コーチからのコメント</p>
                      </div>
                      <p className="text-sm text-green-800 leading-relaxed">
                        {match.coachComment}
                      </p>
                    </div>

                    {/* 動画リンク */}
                    {match.videoUrl && (
                      <a
                        href={match.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Play size={18} className="text-red-600" />
                        <span className="text-sm font-medium text-red-700">試合動画を見る</span>
                      </a>
                    )}

                    {/* 振り返りノート */}
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-2">
                        <PenLine size={14} className="text-yellow-600" />
                        <p className="text-xs font-medium text-yellow-700">振り返りノート</p>
                      </div>
                      <textarea
                        value={notes[match.id] || ''}
                        onChange={(e) => saveNote(match.id, e.target.value)}
                        placeholder="この試合で学んだこと、次に活かしたいことを書いてみよう..."
                        className="w-full p-3 rounded-lg border border-yellow-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-300 placeholder:text-gray-300"
                        style={{ minHeight: '80px' }}
                      />
                      <p className="text-xs text-yellow-600 mt-1">
                        ※ 自分だけのメモとして保存されます
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 注釈 */}
        <p className="text-xs text-gray-400 text-center mt-6">
          ※ データは公式サイト（pl11.jp）に基づく
        </p>
      </main>
    </div>
  );
}
