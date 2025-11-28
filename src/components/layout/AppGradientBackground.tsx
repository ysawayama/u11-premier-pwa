'use client';

import { motion } from 'framer-motion';

type AppGradientBackgroundProps = {
  /** 下部を白にフェードさせるかどうか（ログイン画面用） */
  fadeToWhite?: boolean;
  /** 粒子アニメーションを表示するか */
  showParticles?: boolean;
  /** 光のラインを表示するか */
  showLightLines?: boolean;
  children?: React.ReactNode;
};

/**
 * 共通グラデーション背景
 * 扉ページ・オンボーディング・ログインで再利用
 */
export default function AppGradientBackground({
  fadeToWhite = false,
  showParticles = true,
  showLightLines = true,
  children,
}: AppGradientBackgroundProps) {
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

      {/* 粒子パーティクル */}
      {showParticles && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => {
            const size = 1 + Math.random() * 2;
            const left = Math.random() * 100;
            const top = Math.random() * 70; // 上部70%に集中
            const duration = 4 + Math.random() * 3;
            const delay = Math.random() * 3;
            const yOffset = 3 + Math.random() * 4;
            const isCyan = Math.random() > 0.75;

            return (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: size,
                  height: size,
                  left: `${left}%`,
                  top: `${top}%`,
                  background: isCyan
                    ? 'rgba(79, 217, 255, 0.7)'
                    : 'rgba(255, 255, 255, 0.45)',
                  boxShadow: isCyan
                    ? '0 0 5px rgba(79, 217, 255, 0.5)'
                    : '0 0 3px rgba(255, 255, 255, 0.3)',
                }}
                animate={{
                  y: [-yOffset, yOffset, -yOffset],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  delay,
                  ease: 'easeInOut',
                }}
              />
            );
          })}
        </div>
      )}

      {/* コンテンツ */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
