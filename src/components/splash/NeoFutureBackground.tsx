'use client';

import { motion } from 'framer-motion';

/**
 * スタジアムライティング背景
 * 参考: 画像B - UEFAトーンの深いネイビー〜ブルー
 * - 斜めに走る細いライトライン
 * - 微粒子パーティクル
 */
export default function NeoFutureBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* ベースグラデーション（深いネイビー〜ブルー） */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(165deg, #051530 0%, #0a2045 30%, #0d3060 60%, #051530 100%)',
        }}
      />

      {/* スタジアムライト風のグロー（上部） */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[150%] h-[50%]"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(79, 217, 255, 0.15) 0%, transparent 70%)',
        }}
      />

      {/* 中央の淡いグロー */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(30, 80, 140, 0.25) 0%, transparent 60%)',
        }}
      />

      {/* 斜めの光のライン - SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lightLine1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(79, 217, 255, 0)" />
            <stop offset="20%" stopColor="rgba(79, 217, 255, 0.08)" />
            <stop offset="50%" stopColor="rgba(79, 217, 255, 0.15)" />
            <stop offset="80%" stopColor="rgba(79, 217, 255, 0.08)" />
            <stop offset="100%" stopColor="rgba(79, 217, 255, 0)" />
          </linearGradient>
          <linearGradient id="lightLine2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(0, 175, 255, 0)" />
            <stop offset="30%" stopColor="rgba(0, 175, 255, 0.06)" />
            <stop offset="50%" stopColor="rgba(0, 175, 255, 0.12)" />
            <stop offset="70%" stopColor="rgba(0, 175, 255, 0.06)" />
            <stop offset="100%" stopColor="rgba(0, 175, 255, 0)" />
          </linearGradient>
          <filter id="lineBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
          </filter>
        </defs>

        {/* 斜め光線1 - 左上から右下 */}
        <motion.line
          x1="-10" y1="20"
          x2="60" y2="90"
          stroke="url(#lightLine1)"
          strokeWidth="8"
          filter="url(#lineBlur)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />

        {/* 斜め光線2 */}
        <motion.line
          x1="30" y1="-10"
          x2="100" y2="60"
          stroke="url(#lightLine2)"
          strokeWidth="12"
          filter="url(#lineBlur)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: 'easeOut', delay: 0.2 }}
        />

        {/* 斜め光線3 - 細い */}
        <motion.line
          x1="50" y1="5"
          x2="105" y2="55"
          stroke="url(#lightLine1)"
          strokeWidth="4"
          filter="url(#lineBlur)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
        />

        {/* 斜め光線4 - 下部 */}
        <motion.line
          x1="-5" y1="60"
          x2="45" y2="110"
          stroke="url(#lightLine2)"
          strokeWidth="6"
          filter="url(#lineBlur)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: 'easeOut', delay: 0.1 }}
        />
      </svg>

      {/* 微粒子パーティクル */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => {
          const size = 1 + Math.random() * 2.5;
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const duration = 4 + Math.random() * 3;
          const delay = Math.random() * 3;
          const yOffset = 3 + Math.random() * 5;
          const isCyan = Math.random() > 0.7;

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
                  ? 'rgba(79, 217, 255, 0.8)'
                  : 'rgba(255, 255, 255, 0.5)',
                boxShadow: isCyan
                  ? '0 0 6px rgba(79, 217, 255, 0.6)'
                  : '0 0 3px rgba(255, 255, 255, 0.3)',
              }}
              animate={{
                y: [-yOffset, yOffset, -yOffset],
                opacity: [0.3, 0.8, 0.3],
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

      {/* 下部のビネット（暗くする） */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          background: 'linear-gradient(to top, rgba(5, 15, 30, 0.6) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
