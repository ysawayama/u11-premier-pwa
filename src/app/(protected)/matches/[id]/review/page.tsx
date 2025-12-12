'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ChevronDown, ChevronUp, Clock, MapPin, Trophy, Target, PenLine, MessageSquare, Save } from 'lucide-react';
import { useParams } from 'next/navigation';

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

type MatchReview = {
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
  scorers: Scorer[];
};

// デモ用: 2025年10月13日 あざみ野キッカーズ戦のデータ
const demoReviewMatch: MatchReview = {
  id: 'demo-review-match',
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
  scorers: [
    { name: '宮前　耀多', number: 50, goals: 2 },
    { name: '黒須　拓哉', number: 80, goals: 2 },
    { name: '安達　海音', number: 36, goals: 1 },
    { name: '矢嶋　光駈', number: 47, goals: 1 },
    { name: '吉見　海翔', number: 49, goals: 1 },
    { name: '佐藤　壮真', number: 64, goals: 1 },
  ],
};

// 曜日名
const weekdayNames = ['日', '月', '火', '水', '木', '金', '土'];

// 日付フォーマット
function formatDate(dateStr: string): { month: number; day: number; weekday: string } {
  const date = new Date(dateStr);
  return {
    month: date.getMonth() + 1,
    day: date.getDate(),
    weekday: weekdayNames[date.getDay()],
  };
}

// 結果バッジ
function getResultBadge(result: 'win' | 'draw' | 'loss') {
  switch (result) {
    case 'win': return { text: '勝', className: 'bg-green-500 text-white' };
    case 'draw': return { text: '分', className: 'bg-gray-400 text-white' };
    case 'loss': return { text: '負', className: 'bg-red-500 text-white' };
  }
}

export default function MatchReviewPage() {
  const params = useParams();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isScoreExpanded, setIsScoreExpanded] = useState(true);
  const [reflectionNote, setReflectionNote] = useState('フル出場できた！パスの判断がよくなってきたと思う。');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // デモ用データ使用
  const match = demoReviewMatch;
  const dateInfo = formatDate(match.date);
  const badge = getResultBadge(match.result);

  // スコア表示用
  const myScore = match.isHome ? match.homeScore : match.awayScore;
  const oppScore = match.isHome ? match.awayScore : match.homeScore;

  // 振り返りメモ保存（デモ用）
  const handleSaveReflection = async () => {
    setIsSaving(true);
    // 本番ではDBに保存
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
  };

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
              試合結果
            </h1>
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className={`px-4 py-4 pb-24 transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* 試合結果ヘッダー */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          {/* 結果サマリー */}
          <div className="p-4">
            <div className="flex items-center gap-3">
              <span className={`w-10 h-10 rounded-full ${badge.className} flex items-center justify-center text-sm font-bold shrink-0`}>
                {badge.text}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {match.opponentLogo && (
                    <div className="w-6 h-6 relative">
                      <Image src={match.opponentLogo} alt={match.opponent} fill className="object-contain" />
                    </div>
                  )}
                  <span className="text-base font-bold text-gray-800">vs {match.opponent}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {dateInfo.month}/{dateInfo.day}({dateInfo.weekday}) ・ {match.isHome ? 'H' : 'A'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black" style={{ color: 'var(--color-navy)' }}>
                  {myScore.total} - {oppScore.total}
                </p>
              </div>
            </div>
          </div>

          {/* スコア詳細（折りたたみ） */}
          <div className="border-t border-gray-100">
            <button
              onClick={() => setIsScoreExpanded(!isScoreExpanded)}
              className="w-full flex items-center justify-between px-4 py-2 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
            >
              <span>スコア詳細</span>
              {isScoreExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isScoreExpanded && (
              <div className="px-4 pb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  {/* テーブルヘッダー */}
                  <div className="flex items-center text-[10px] text-gray-400 mb-2">
                    <span className="w-16">チーム</span>
                    <span className="flex-1 text-center">1st</span>
                    <span className="flex-1 text-center">2nd</span>
                    <span className="flex-1 text-center">3rd</span>
                    <span className="w-10 text-center font-bold">合計</span>
                  </div>
                  {/* 大豆戸 */}
                  <div className="flex items-center text-sm mb-1">
                    <span className="w-16 font-bold text-blue-600">大豆戸</span>
                    <span className="flex-1 text-center">{myScore.first}</span>
                    <span className="flex-1 text-center">{myScore.second}</span>
                    <span className="flex-1 text-center">{myScore.third}</span>
                    <span className="w-10 text-center font-black">{myScore.total}</span>
                  </div>
                  {/* 相手チーム */}
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="w-16 truncate">{match.opponent.slice(0, 4)}...</span>
                    <span className="flex-1 text-center">{oppScore.first}</span>
                    <span className="flex-1 text-center">{oppScore.second}</span>
                    <span className="flex-1 text-center">{oppScore.third}</span>
                    <span className="w-10 text-center font-black">{oppScore.total}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 得点者 */}
        {match.scorers.length > 0 && (
          <div className="bg-green-50 rounded-2xl p-4 mb-4 border border-green-100">
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-green-600" />
              <h3 className="text-sm font-bold text-green-700">得点者</h3>
            </div>
            <div className="space-y-1">
              {match.scorers.map((scorer, index) => (
                <p key={index} className="text-sm text-gray-700">
                  <span className="text-green-600 font-medium">#{scorer.number}</span>{' '}
                  {scorer.name}
                  {scorer.goals > 1 && <span className="text-green-600 font-bold"> ×{scorer.goals}</span>}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* 会場 & 出場時間 */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin size={14} className="text-gray-400" />
              <span className="text-[10px] text-gray-400">会場</span>
            </div>
            <p className="text-sm font-medium text-gray-700">{match.venue}</p>
          </div>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock size={14} className="text-blue-500" />
              <span className="text-[10px] text-gray-400">私の出場時間</span>
            </div>
            <p className="text-lg font-bold text-blue-600">{match.playingTime}分</p>
          </div>
        </div>

        {/* 監督・コーチからのコメント */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={16} className="text-blue-600" />
            <h3 className="text-sm font-bold text-blue-700">監督・コーチからのコメント</h3>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {match.coachComment}
          </p>
        </div>

        {/* 振り返りノート */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <div className="flex items-center gap-2 mb-3">
            <PenLine size={16} className="text-amber-600" />
            <h3 className="text-sm font-bold text-amber-700">振り返りノート</h3>
          </div>
          <textarea
            value={reflectionNote}
            onChange={(e) => setReflectionNote(e.target.value)}
            placeholder="この試合で学んだこと、次に活かしたいことを書いてみよう..."
            className="w-full p-3 rounded-xl border border-amber-200 bg-white text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent"
            rows={3}
          />
          <p className="text-[10px] text-gray-400 mt-2">
            ※ 自分だけのメモとして保存されます
          </p>
          <button
            onClick={handleSaveReflection}
            disabled={isSaving}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition-all bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? '保存中...' : 'メモを保存する'}
          </button>
        </div>

      </main>
    </div>
  );
}
