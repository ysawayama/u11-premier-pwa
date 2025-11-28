'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

type SplashIntroProps = {
  /** スプラッシュ完了時のコールバック */
  onFinished?: () => void;
};

/**
 * U-11 PREMIER LEAGUE スプラッシュ画面
 * CSSアニメーション版（SSR対応）
 */
export default function SplashIntro({ onFinished }: SplashIntroProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [phase, setPhase] = useState<'loading' | 'logo' | 'fadeOut'>('loading');

  useEffect(() => {
    // シンプルなタイムライン: ロゴ表示 -> フェードアウト
    const timer1 = setTimeout(() => setPhase('logo'), 500);
    const timer2 = setTimeout(() => setPhase('fadeOut'), 2500);
    const timer3 = setTimeout(() => {
      setIsVisible(false);
      onFinished?.();
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onFinished]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-500 ${
        phase === 'fadeOut' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* 背景グラデーション */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(165deg, #051530 0%, #0a2045 30%, #0d3060 60%, #051530 100%)',
        }}
      />

      {/* スタジアムライト風グロー */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[150%] h-[40%]"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(79, 217, 255, 0.15) 0%, transparent 70%)',
        }}
      />

      {/* センターロゴ */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`transition-all duration-700 ${
            phase === 'logo'
              ? 'opacity-100 scale-100'
              : phase === 'loading'
              ? 'opacity-0 scale-95'
              : 'opacity-0 scale-105'
          }`}
        >
          <div className="bg-white/95 rounded-3xl px-8 py-6 shadow-2xl">
            <Image
              src="/images/u11-premier-logo-wide.png"
              alt="U-11 Premier League"
              width={280}
              height={100}
              className="w-[260px] h-auto object-contain"
              priority
            />
          </div>

          {/* サブテキスト */}
          <p className="text-white/70 text-center mt-6 text-sm font-medium tracking-wider">
            デジタル選手証と試合速報
          </p>
        </div>
      </div>

      {/* 粒子 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-particle-float"
            style={{
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              left: `${10 + (i * 6)}%`,
              top: `${15 + (i * 4) % 60}%`,
              background: i % 4 === 0
                ? 'rgba(79, 217, 255, 0.6)'
                : 'rgba(255, 255, 255, 0.4)',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
