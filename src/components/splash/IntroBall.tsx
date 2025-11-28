'use client';

import { motion } from 'framer-motion';

/**
 * 発光する未来的なサッカーボール
 * 参考: 画像A - ネオンブルーで光るボール
 */
export default function IntroBall() {
  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56">
      {/* 外側のグロー */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(79, 217, 255, 0.4) 0%, rgba(0, 175, 255, 0.1) 50%, transparent 70%)',
          filter: 'blur(20px)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* サッカーボールSVG */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full relative z-10"
        style={{ filter: 'drop-shadow(0 0 20px rgba(79, 217, 255, 0.8))' }}
      >
        <defs>
          {/* 発光グラデーション */}
          <linearGradient id="glowLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4FD9FF" />
            <stop offset="50%" stopColor="#00AFFF" />
            <stop offset="100%" stopColor="#4FD9FF" />
          </linearGradient>

          {/* ボール表面のグラデーション */}
          <radialGradient id="ballSurface" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="rgba(100, 150, 180, 0.3)" />
            <stop offset="50%" stopColor="rgba(20, 40, 60, 0.6)" />
            <stop offset="100%" stopColor="rgba(5, 15, 30, 0.9)" />
          </radialGradient>

          {/* グローフィルター */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ボール本体（暗い球体） */}
        <circle cx="100" cy="100" r="85" fill="url(#ballSurface)" />

        {/* ペンタゴン模様の発光ライン */}
        <g fill="none" stroke="url(#glowLine)" strokeWidth="2.5" filter="url(#glow)">
          {/* 中央のペンタゴン */}
          <motion.polygon
            points="100,40 130,62 120,95 80,95 70,62"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />

          {/* 上部のライン */}
          <motion.path
            d="M100,40 L100,15"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          />
          <motion.path
            d="M130,62 L155,45"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          />
          <motion.path
            d="M70,62 L45,45"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          />

          {/* 下部のライン */}
          <motion.path
            d="M120,95 L140,120"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          />
          <motion.path
            d="M80,95 L60,120"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          />

          {/* 左側のペンタゴン */}
          <motion.polygon
            points="45,45 70,62 60,120 25,100 30,60"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />

          {/* 右側のペンタゴン */}
          <motion.polygon
            points="155,45 170,60 175,100 140,120 130,62"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.8 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />

          {/* 下部のペンタゴン */}
          <motion.polygon
            points="60,120 80,95 120,95 140,120 100,150"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          />

          {/* 下部の接続線 */}
          <motion.path
            d="M100,150 L100,185"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          />
          <motion.path
            d="M25,100 L15,115"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          />
          <motion.path
            d="M175,100 L185,115"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          />
        </g>

        {/* 光の粒子（ボール表面） */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * 45) * Math.PI / 180;
          const r = 60 + Math.random() * 20;
          const cx = 100 + Math.cos(angle) * r;
          const cy = 100 + Math.sin(angle) * r;
          return (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r="2"
              fill="#4FD9FF"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          );
        })}
      </svg>

      {/* 回転する光の軌跡 */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="absolute top-1/2 left-0 w-1/2 h-[2px]"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(79, 217, 255, 0.6) 100%)',
            transformOrigin: 'right center',
            filter: 'blur(1px)',
          }}
        />
      </motion.div>
    </div>
  );
}
