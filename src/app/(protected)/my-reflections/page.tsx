'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, PenLine } from 'lucide-react';

// 振り返りメモの型定義
type ReflectionMatch = {
  id: string;
  date: string;
  opponent: string;
  score: string;
  result: 'win' | 'draw' | 'loss';
  appearance: 'starter' | 'sub' | 'bench';
  playingTime: number;
  reflection: string;
};

// 振り返りメモデータ（my-matchesのcoachCommentを選手視点の振り返りとして表示）
// 本番ではDBから取得する
const reflectionData: ReflectionMatch[] = [
  {
    id: 'ref-2025-12-07',
    date: '2025-12-07',
    opponent: 'あざみ野FC',
    score: '2-1',
    result: 'win',
    appearance: 'sub',
    playingTime: 15,
    reflection: '後半から出場。守備で体を張れた。次はシュートを打ちたい！',
  },
  {
    id: 'ref-2025-10-13b',
    date: '2025-10-13',
    opponent: 'あざみ野キッカーズ',
    score: '8-0',
    result: 'win',
    appearance: 'starter',
    playingTime: 45,
    reflection: 'フル出場できた！パスの判断がよくなってきたと思う。',
  },
  {
    id: 'ref-2025-10-13a',
    date: '2025-10-13',
    opponent: '横浜ジュニオールSC',
    score: '3-1',
    result: 'win',
    appearance: 'starter',
    playingTime: 45,
    reflection: '連戦の2試合目だったけど、集中を切らさずにプレーできた。',
  },
  {
    id: 'ref-2025-10-12b',
    date: '2025-10-12',
    opponent: 'TDFC',
    score: '2-1',
    result: 'win',
    appearance: 'sub',
    playingTime: 20,
    reflection: '逆転勝ちできて嬉しかった。もっと前に出てボールを受けたい。',
  },
  {
    id: 'ref-2025-10-12a',
    date: '2025-10-12',
    opponent: 'PALAVRA FC',
    score: '3-0',
    result: 'win',
    appearance: 'starter',
    playingTime: 40,
    reflection: '完封勝利！守備でしっかり体を寄せられた。',
  },
  {
    id: 'ref-2025-09-21',
    date: '2025-09-21',
    opponent: 'SFAT ISEHARA SC',
    score: '1-0',
    result: 'win',
    appearance: 'sub',
    playingTime: 15,
    reflection: '接戦で緊張したけど、出た時間しっかり走れた。',
  },
  {
    id: 'ref-2025-09-20',
    date: '2025-09-20',
    opponent: 'FC東海岸',
    score: '13-0',
    result: 'win',
    appearance: 'starter',
    playingTime: 45,
    reflection: '大勝できた！味方の動きを見てパスを出せるようになってきた。',
  },
  {
    id: 'ref-2025-07-20',
    date: '2025-07-20',
    opponent: 'FC.vinculo',
    score: '0-5',
    result: 'loss',
    appearance: 'starter',
    playingTime: 40,
    reflection: '強かった…。でも諦めずに最後まで走った。プレスの速さを見習いたい。',
  },
  {
    id: 'ref-2025-07-12',
    date: '2025-07-12',
    opponent: '黒滝SC',
    score: '2-4',
    result: 'loss',
    appearance: 'starter',
    playingTime: 40,
    reflection: '悔しい負け。自分のマークの選手に2点決められた。もっと粘りたい。',
  },
  {
    id: 'ref-2025-07-06',
    date: '2025-07-06',
    opponent: 'あざみ野FC',
    score: '6-3',
    result: 'win',
    appearance: 'starter',
    playingTime: 45,
    reflection: '初めてスタメンで出た試合！緊張したけど楽しかった。',
  },
  {
    id: 'ref-2025-06-28',
    date: '2025-06-28',
    opponent: 'ESFORCO F.C.',
    score: '0-8',
    result: 'loss',
    appearance: 'sub',
    playingTime: 20,
    reflection: '強すぎた。でもこういうチームと戦えるのは勉強になる。',
  },
  {
    id: 'ref-2025-06-22b',
    date: '2025-06-22',
    opponent: '横浜ジュニオールSC',
    score: '5-0',
    result: 'win',
    appearance: 'starter',
    playingTime: 45,
    reflection: '完封勝ち！相手にシュートを打たせなかった。',
  },
  {
    id: 'ref-2025-06-22a',
    date: '2025-06-22',
    opponent: 'PALAVRA FC',
    score: '6-1',
    result: 'win',
    appearance: 'sub',
    playingTime: 25,
    reflection: '途中からだったけどしっかりプレーできた。',
  },
  {
    id: 'ref-2025-05-18b',
    date: '2025-05-18',
    opponent: 'TDFC',
    score: '2-0',
    result: 'win',
    appearance: 'sub',
    playingTime: 15,
    reflection: '後半から出て無失点で守れた！',
  },
  {
    id: 'ref-2025-05-18a',
    date: '2025-05-18',
    opponent: 'あざみ野キッカーズ',
    score: '5-1',
    result: 'win',
    appearance: 'starter',
    playingTime: 45,
    reflection: 'シーズン初戦！いいスタートが切れて嬉しい。',
  },
];

// 曜日名
const weekdayNames = ['日', '月', '火', '水', '木', '金', '土'];

// 日付フォーマット（月/日のみ）
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

// 結果バッジ
function getResultBadge(result: 'win' | 'draw' | 'loss') {
  switch (result) {
    case 'win': return { text: '勝', className: 'bg-green-500 text-white' };
    case 'draw': return { text: '分', className: 'bg-gray-400 text-white' };
    case 'loss': return { text: '負', className: 'bg-red-500 text-white' };
  }
}

// 出場状況テキスト
function getAppearanceText(appearance: 'starter' | 'sub' | 'bench', playingTime: number) {
  switch (appearance) {
    case 'starter': return playingTime >= 45 ? 'フル出場' : `先発（${playingTime}分）`;
    case 'sub': return `途中出場（${playingTime}分）`;
    case 'bench': return 'ベンチ';
  }
}

export default function MyReflectionsPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // 統計情報
  const totalMatches = reflectionData.length;
  const wins = reflectionData.filter(m => m.result === 'win').length;
  const losses = reflectionData.filter(m => m.result === 'loss').length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background-cream)' }}>
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center px-4 py-3">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} style={{ color: 'var(--color-navy)' }} />
          </Link>
          <div className="flex-1 text-center">
            <h1 className="text-base font-bold" style={{ color: 'var(--color-navy)' }}>
              振り返りメモ
            </h1>
            <p className="text-[10px] text-gray-500">
              {totalMatches}試合 ・ {wins}勝{losses}敗
            </p>
          </div>
          <div className="w-10" /> {/* バランス用 */}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="px-4 py-4 pb-24">
        <div className="space-y-3">
          {reflectionData.map((match, index) => {
            const badge = getResultBadge(match.result);
            return (
              <div
                key={match.id}
                className={`bg-white rounded-2xl p-4 shadow-sm transition-all duration-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${Math.min(index * 50, 500)}ms` }}
              >
                {/* 試合情報 */}
                <div className="flex items-center gap-3 mb-3">
                  <span className={`w-8 h-8 rounded-full ${badge.className} flex items-center justify-center text-xs font-bold shrink-0`}>
                    {badge.text}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-gray-800">
                      {formatDate(match.date)} vs {match.opponent}
                    </p>
                    <p className="text-xs text-gray-500">
                      {match.score} ・ {getAppearanceText(match.appearance, match.playingTime)}
                    </p>
                  </div>
                </div>

                {/* 振り返りメモ */}
                <div className="flex items-start gap-2 pt-3 border-t border-gray-100">
                  <PenLine size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {match.reflection}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 下部余白 */}
        <div className="h-8" />
      </main>
    </div>
  );
}
