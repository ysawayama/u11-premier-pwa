'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

/**
 * リーグロゴ表示コンポーネント
 * 白カード + inner shadow + 淡い発光
 */
export default function LeagueLogo() {
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* 白いカード（inner shadow + 発光） */}
      <motion.div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,245,250,0.95) 100%)',
          borderRadius: '20px',
          width: '72vw',
          maxWidth: '300px',
          padding: '24px 28px',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.3),
            0 0 60px rgba(79, 217, 255, 0.15),
            inset 0 2px 4px rgba(255, 255, 255, 0.8),
            inset 0 -2px 4px rgba(0, 0, 0, 0.05)
          `,
          border: '1px solid rgba(255, 255, 255, 0.5)',
        }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        {/* 上部のハイライト */}
        <div
          className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)',
          }}
        />

        <Image
          src="/images/u11-premier-logo-wide.png"
          alt="U-11 Premier League"
          width={280}
          height={100}
          className="w-full h-auto object-contain relative z-10"
          priority
        />
      </motion.div>

      {/* MATCHDAY READY. テキスト */}
      <motion.p
        className="mt-6 text-base font-bold uppercase tracking-[0.2em]"
        style={{
          color: 'rgba(255, 255, 255, 0.9)',
          textShadow: '0 0 20px rgba(79, 217, 255, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)',
        }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
      >
        Matchday Ready.
      </motion.p>

      {/* 装飾ライン */}
      <motion.div
        className="mt-3 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        style={{ width: '120px' }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 0.7 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      />
    </motion.div>
  );
}
