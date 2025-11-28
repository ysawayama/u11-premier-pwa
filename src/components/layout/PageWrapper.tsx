'use client';

import AppGradientBackground from './AppGradientBackground';

type PageWrapperProps = {
  children: React.ReactNode;
  /** ヘッダーコンテンツ（タイトル、戻るボタンなど） */
  header?: React.ReactNode;
  /** パディングなしでコンテンツを表示（カスタムレイアウト用） */
  noPadding?: boolean;
  /** 背景のパーティクルを表示 */
  showParticles?: boolean;
};

/**
 * 共通ページラッパー
 * NEO-FUTURE STADIUM風の紺色グラデーション背景 + 白カード
 */
export default function PageWrapper({
  children,
  header,
  noPadding = false,
  showParticles = false,
}: PageWrapperProps) {
  return (
    <AppGradientBackground showParticles={showParticles} showLightLines>
      <div className="min-h-screen flex flex-col">
        {/* ヘッダー（あれば） */}
        {header && (
          <div className="px-4 pt-4 pb-2">
            {header}
          </div>
        )}

        {/* メインコンテンツ：白カード */}
        <div className="flex-1 px-4 pb-4">
          <div
            className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl min-h-full ${
              noPadding ? '' : 'p-4'
            }`}
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </AppGradientBackground>
  );
}
