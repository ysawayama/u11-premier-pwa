'use client';

import Image from 'next/image';
import Link from 'next/link';
import AppGradientBackground from '@/components/layout/AppGradientBackground';

/**
 * 認証ページ用レイアウト
 * 扉ページと同じ世界観のグラデーション背景 + 白カード
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppGradientBackground fadeToWhite showParticles showLightLines>
      <div className="min-h-screen flex flex-col">
        {/* 上部: ロゴエリア */}
        <div className="pt-12 pb-8 px-6 text-center">
          {/* ロゴ */}
          <div className="flex justify-center mb-4">
            <div className="bg-white/95 rounded-2xl px-5 py-3 shadow-lg">
              <Image
                src="/images/u11-premier-logo-wide.png"
                alt="U-11 Premier League"
                width={180}
                height={65}
                className="w-[160px] h-auto object-contain"
                priority
              />
            </div>
          </div>

          {/* キャッチコピー */}
          <p className="text-white/80 text-sm font-medium tracking-wide">
            デジタル選手証と試合速報
          </p>
        </div>

        {/* 中央: コンテンツカード */}
        <div className="flex-1 flex flex-col px-4 pb-6">
          <div
            className="bg-white rounded-3xl shadow-2xl overflow-hidden flex-1 max-w-md mx-auto w-full"
            style={{
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div className="p-6 h-full">
              {children}
            </div>
          </div>

          {/* 注釈テキスト */}
          <p className="text-center text-xs text-gray-500 mt-4 px-4">
            まだチームコードがない方は、
            <br />
            コーチ・チーム代表者から招待を受けてください。
          </p>
        </div>

        {/* フッター */}
        <div className="py-4 px-6 flex justify-center gap-6">
          <Link
            href="/terms"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            利用規約
          </Link>
          <Link
            href="/privacy"
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            プライバシーポリシー
          </Link>
        </div>
      </div>
    </AppGradientBackground>
  );
}
