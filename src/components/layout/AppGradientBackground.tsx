'use client';

import { useState, useEffect, useMemo } from 'react';

type AppGradientBackgroundProps = {
  /** 下部を白にフェードさせるかどうか（ログイン画面用） */
  fadeToWhite?: boolean;
  /** 粒子アニメーションを表示するか */
  showParticles?: boolean;
  /** 光のラインを表示するか */
  showLightLines?: boolean;
  children?: React.ReactNode;
};

// パーティクルの事前計算された位置（SSRで安定させるため固定値）
const PARTICLE_CONFIGS = [
  { size: 2.1, left: 15, top: 25, duration: 5.2, delay: 0.3, yOffset: 4.5, isCyan: false },
  { size: 1.5, left: 45, top: 12, duration: 4.8, delay: 1.2, yOffset: 3.8, isCyan: true },
  { size: 2.8, left: 72, top: 38, duration: 6.1, delay: 0.8, yOffset: 5.2, isCyan: false },
  { size: 1.2, left: 8, top: 55, duration: 4.3, delay: 2.1, yOffset: 3.2, isCyan: false },
  { size: 1.9, left: 88, top: 18, duration: 5.7, delay: 0.5, yOffset: 4.8, isCyan: true },
  { size: 2.4, left: 33, top: 42, duration: 4.9, delay: 1.8, yOffset: 4.1, isCyan: false },
  { size: 1.3, left: 62, top: 8, duration: 5.4, delay: 2.5, yOffset: 3.5, isCyan: false },
  { size: 2.6, left: 25, top: 65, duration: 6.3, delay: 0.2, yOffset: 5.5, isCyan: false },
  { size: 1.7, left: 78, top: 52, duration: 4.6, delay: 1.5, yOffset: 3.9, isCyan: true },
  { size: 2.2, left: 52, top: 28, duration: 5.8, delay: 0.9, yOffset: 4.3, isCyan: false },
  { size: 1.4, left: 95, top: 35, duration: 4.2, delay: 2.8, yOffset: 3.3, isCyan: false },
  { size: 2.9, left: 18, top: 48, duration: 6.5, delay: 0.4, yOffset: 5.8, isCyan: false },
  { size: 1.6, left: 42, top: 60, duration: 5.1, delay: 1.1, yOffset: 4.0, isCyan: true },
  { size: 2.0, left: 68, top: 15, duration: 4.7, delay: 2.3, yOffset: 4.6, isCyan: false },
  { size: 1.8, left: 5, top: 32, duration: 5.9, delay: 0.7, yOffset: 4.2, isCyan: false },
];

/**
 * 共通グラデーション背景
 * 扉ページ・オンボーディング・ログインで再利用
 *
 * NOTE: SSR対応のため、framer-motionではなくCSSアニメーションを使用
 */
export default function AppGradientBackground({
  fadeToWhite = false,
  showParticles = true,
  showLightLines = true,
  children,
}: AppGradientBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ベースグラデーション */}
      <div
        className="absolute inset-0"
        style={{
          background: fadeToWhite
            ? 'linear-gradient(180deg, #051530 0%, #0a2045 25%, #0d3060 45%, #ffffff 100%)'
            : 'linear-gradient(165deg, #051530 0%, #0a2045 30%, #0d3060 60%, #051530 100%)',
        }}
      />

      {/* スタジアムライト風グロー */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[150%] h-[40%]"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(79, 217, 255, 0.12) 0%, transparent 70%)',
        }}
      />

      {/* 中央グロー */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 40% at 50% 30%, rgba(30, 80, 140, 0.2) 0%, transparent 60%)',
        }}
      />

      {/* 斜めの光のライン */}
      {showLightLines && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="bgLightLine1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(79, 217, 255, 0)" />
              <stop offset="20%" stopColor="rgba(79, 217, 255, 0.06)" />
              <stop offset="50%" stopColor="rgba(79, 217, 255, 0.1)" />
              <stop offset="80%" stopColor="rgba(79, 217, 255, 0.06)" />
              <stop offset="100%" stopColor="rgba(79, 217, 255, 0)" />
            </linearGradient>
            <linearGradient id="bgLightLine2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(0, 175, 255, 0)" />
              <stop offset="30%" stopColor="rgba(0, 175, 255, 0.05)" />
              <stop offset="50%" stopColor="rgba(0, 175, 255, 0.08)" />
              <stop offset="70%" stopColor="rgba(0, 175, 255, 0.05)" />
              <stop offset="100%" stopColor="rgba(0, 175, 255, 0)" />
            </linearGradient>
            <filter id="bgLineBlur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.4" />
            </filter>
          </defs>

          <line
            x1="-10" y1="15"
            x2="50" y2="75"
            stroke="url(#bgLightLine1)"
            strokeWidth="6"
            filter="url(#bgLineBlur)"
          />
          <line
            x1="25" y1="-5"
            x2="85" y2="55"
            stroke="url(#bgLightLine2)"
            strokeWidth="10"
            filter="url(#bgLineBlur)"
          />
          <line
            x1="55" y1="10"
            x2="105" y2="60"
            stroke="url(#bgLightLine1)"
            strokeWidth="4"
            filter="url(#bgLineBlur)"
          />
        </svg>
      )}

      {/* 粒子パーティクル - CSSアニメーションで実装 */}
      {showParticles && mounted && (
        <div className="absolute inset-0 pointer-events-none">
          {PARTICLE_CONFIGS.map((config, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-particle-float"
              style={{
                width: config.size,
                height: config.size,
                left: `${config.left}%`,
                top: `${config.top}%`,
                background: config.isCyan
                  ? 'rgba(79, 217, 255, 0.7)'
                  : 'rgba(255, 255, 255, 0.45)',
                boxShadow: config.isCyan
                  ? '0 0 5px rgba(79, 217, 255, 0.5)'
                  : '0 0 3px rgba(255, 255, 255, 0.3)',
                animationDuration: `${config.duration}s`,
                animationDelay: `${config.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* コンテンツ */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
