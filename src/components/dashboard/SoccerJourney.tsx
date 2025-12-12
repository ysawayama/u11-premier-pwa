'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Star, Sparkles, TrendingUp, Calendar, ChevronRight, Footprints } from 'lucide-react';

// 成長ハイライトの型
type Highlight = {
  id: string;
  type: 'first_goal' | 'first_start' | 'milestone' | 'position_change' | 'streak';
  emoji: string;
  title: string;
  date: string;
  description?: string;
};

// 最近の試合の型
type RecentMatch = {
  id: string;
  date: string;
  opponent: string;
  score: string;
  result: 'win' | 'draw' | 'loss';
  appearance: 'starter' | 'sub' | 'bench';
  playingTime: number;
  note?: string;
};

// フィジカル記録の型
type PhysicalRecord = {
  heightBefore: number;
  heightAfter: number;
  weightBefore: number;
  weightAfter: number;
  lastMeasured: string;
};

// デモデータ（本番ではDBから取得）
const demoSeasonSummary = {
  matchesPlayed: 12,
  totalMinutes: 420,
  goals: 2,
  wins: 9,
};

const demoHighlights: Highlight[] = [
  {
    id: 'h1',
    type: 'first_goal',
    emoji: '🎉',
    title: '初ゴール！',
    date: '9/20',
    description: 'vs FC東海岸',
  },
  {
    id: 'h2',
    type: 'first_start',
    emoji: '🆕',
    title: '初スタメン',
    date: '7/6',
    description: 'vs あざみ野FC',
  },
  {
    id: 'h3',
    type: 'milestone',
    emoji: '🏃',
    title: '出場10試合達成',
    date: '10/13',
    description: '',
  },
];

const demoRecentMatches: RecentMatch[] = [
  {
    id: 'm1',
    date: '12/7',
    opponent: 'あざみ野FC',
    score: '2-1',
    result: 'win',
    appearance: 'sub',
    playingTime: 15,
    note: '後半から出場。守備で体を張れた。次はシュートを打ちたい！',
  },
  {
    id: 'm2',
    date: '10/13',
    opponent: '横浜ジュニオールSC',
    score: '3-1',
    result: 'win',
    appearance: 'starter',
    playingTime: 45,
    note: 'フル出場できた！パスの判断がよくなってきたと思う。',
  },
];

const demoPhysical: PhysicalRecord = {
  heightBefore: 138,
  heightAfter: 142,
  weightBefore: 32,
  weightAfter: 34,
  lastMeasured: '2025/11',
};

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

export default function SoccerJourney() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // アニメーション用
    setIsLoaded(true);
  }, []);

  return (
    <section className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <Footprints size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--color-navy)' }}>
              サッカージャーニー
            </h2>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              この1年の自分のサッカー
            </p>
          </div>
        </div>
      </div>

      {/* メインカード */}
      <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl overflow-hidden border border-orange-100">

        {/* ① シーズンサマリー - PC/タブレットでは横に並べる */}
        <div className="p-4 border-b border-orange-100/50">
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-black text-orange-600">{demoSeasonSummary.matchesPlayed}</p>
              <p className="text-[10px] md:text-xs text-gray-500">試合出場</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-black text-orange-600">{demoSeasonSummary.totalMinutes}</p>
              <p className="text-[10px] md:text-xs text-gray-500">分</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-black text-orange-600">{demoSeasonSummary.goals}</p>
              <p className="text-[10px] md:text-xs text-gray-500">ゴール</p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-black text-orange-600">{demoSeasonSummary.wins}</p>
              <p className="text-[10px] md:text-xs text-gray-500">勝利</p>
            </div>
          </div>
        </div>

        {/* ② 成長ハイライト - PC/タブレットでは3列グリッド */}
        <div className="p-4 border-b border-orange-100/50">
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles size={14} className="text-amber-500" />
            <h3 className="text-xs font-bold text-amber-700">今シーズンのハイライト</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {demoHighlights.map((highlight, index) => (
              <div
                key={highlight.id}
                className={`flex items-center gap-3 bg-white/60 rounded-lg px-3 py-2 transition-all duration-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <span className="text-lg">{highlight.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800">{highlight.title}</p>
                  <p className="text-[10px] text-gray-500">
                    {highlight.date} {highlight.description && `・${highlight.description}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ③ 振り返りメモ - PC/タブレットでは2列 */}
        <div className="p-4 border-b border-orange-100/50">
          <div className="flex items-center gap-1.5 mb-3">
            <Calendar size={14} className="text-amber-500" />
            <h3 className="text-xs font-bold text-amber-700">振り返りメモ（最近の試合から）</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {demoRecentMatches.map((match) => {
              const badge = getResultBadge(match.result);
              return (
                <div key={match.id} className="bg-white/60 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-6 h-6 rounded-full ${badge.className} flex items-center justify-center text-[10px] font-bold`}>
                      {badge.text}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">
                        {match.date} vs {match.opponent}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {match.score} ・ {getAppearanceText(match.appearance, match.playingTime)}
                      </p>
                    </div>
                  </div>
                  {match.note && (
                    <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-orange-100/50">
                      <span className="text-xs">📝</span>
                      <p className="text-xs text-gray-600 leading-relaxed">{match.note}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* すべての振り返りを見るリンク */}
          <Link
            href="/my-reflections"
            className="flex items-center justify-center gap-1 text-xs text-amber-700 hover:text-amber-800 transition-colors mt-3 pt-3 border-t border-orange-100/50"
          >
            すべての振り返りを見る
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* ④ フィジカルの成長 */}
        <div className="p-4 border-b border-orange-100/50">
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp size={14} className="text-amber-500" />
            <h3 className="text-xs font-bold text-amber-700">からだの成長</h3>
          </div>
          <div className="bg-white/60 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-gray-500 mb-1">身長</p>
                <p className="text-sm font-bold text-gray-800">
                  {demoPhysical.heightBefore}cm → {demoPhysical.heightAfter}cm
                  <span className="text-green-600 text-xs ml-1">
                    (+{demoPhysical.heightAfter - demoPhysical.heightBefore}cm)
                  </span>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 mb-1">体重</p>
                <p className="text-sm font-bold text-gray-800">
                  {demoPhysical.weightBefore}kg → {demoPhysical.weightAfter}kg
                  <span className="text-green-600 text-xs ml-1">
                    (+{demoPhysical.weightAfter - demoPhysical.weightBefore}kg)
                  </span>
                </p>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">最終計測: {demoPhysical.lastMeasured}</p>
          </div>
        </div>

      </div>
    </section>
  );
}
