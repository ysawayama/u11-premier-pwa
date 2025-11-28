'use client';

import { motion } from 'framer-motion';

type OnboardingSlideProps = {
  /** アイキャッチ要素（SVGイラストやモック画像） */
  illustration: React.ReactNode;
  /** 見出し */
  title: string;
  /** 本文 */
  description: string;
  /** チェック付きポイントリスト */
  points: string[];
  /** Primary ボタンテキスト */
  primaryButtonText: string;
  /** Primary ボタンクリック */
  onPrimaryClick: () => void;
  /** Secondary ボタンテキスト（オプション） */
  secondaryButtonText?: string;
  /** Secondary ボタンクリック */
  onSecondaryClick?: () => void;
  /** スキップボタンを表示するか */
  showSkip?: boolean;
  /** スキップクリック */
  onSkipClick?: () => void;
};

/**
 * オンボーディング各スライドの共通レイアウト
 */
export default function OnboardingSlide({
  illustration,
  title,
  description,
  points,
  primaryButtonText,
  onPrimaryClick,
  secondaryButtonText,
  onSecondaryClick,
  showSkip,
  onSkipClick,
}: OnboardingSlideProps) {
  return (
    <div className="flex flex-col h-full">
      {/* 上部: アイキャッチ領域（背景が見える部分） */}
      <div className="flex-shrink-0 h-[30vh] min-h-[180px] flex items-center justify-center px-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {illustration}
        </motion.div>
      </div>

      {/* 下部: 白カード */}
      <motion.div
        className="flex-1 mx-4 mb-4 rounded-3xl bg-white shadow-2xl overflow-hidden"
        style={{
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
        }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex flex-col h-full px-6 py-6">
          {/* 見出し */}
          <h2 className="text-xl font-bold text-gray-900 text-center mb-3">
            {title}
          </h2>

          {/* 本文 */}
          <p className="text-sm text-gray-600 text-center leading-relaxed mb-5">
            {description}
          </p>

          {/* チェックポイントリスト */}
          <div className="flex-1 space-y-3 mb-6">
            {points.map((point, index) => (
              <motion.div
                key={index}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
              >
                {/* チェックアイコン */}
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center mt-0.5">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-700">{point}</span>
              </motion.div>
            ))}
          </div>

          {/* ボタン領域 */}
          <div className="space-y-3">
            {/* Primaryボタン */}
            <button
              onClick={onPrimaryClick}
              className="w-full py-3.5 rounded-full bg-[#0D47FF] text-white font-bold text-base shadow-lg hover:bg-[#0a3ad4] transition-colors"
            >
              {primaryButtonText}
            </button>

            {/* Secondaryボタン or スキップ */}
            {secondaryButtonText && onSecondaryClick ? (
              <button
                onClick={onSecondaryClick}
                className="w-full py-3 text-[#0D47FF] font-medium text-sm hover:underline"
              >
                {secondaryButtonText}
              </button>
            ) : showSkip && onSkipClick ? (
              <button
                onClick={onSkipClick}
                className="w-full py-3 text-gray-400 font-medium text-sm hover:text-gray-600"
              >
                スキップ
              </button>
            ) : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
