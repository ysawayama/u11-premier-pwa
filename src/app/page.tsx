import { Button } from '@/components/ui';
import Image from 'next/image';

// 動的レンダリングを強制（SSR時のuseContextエラーを回避）
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(165deg, #051530 0%, #0a2045 30%, #0d3060 60%, #051530 100%)',
      }}
    >
      {/* スタジアムライト風グロー */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[150%] h-[40%] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(79, 217, 255, 0.15) 0%, transparent 70%)',
        }}
      />

      <main className="relative z-10 text-center space-y-6 sm:space-y-8 p-4 sm:p-8 max-w-4xl w-full">
        {/* ロゴ */}
        <div className="flex justify-center mb-4">
          <div className="bg-white/95 rounded-2xl px-6 py-4 shadow-2xl">
            <Image
              src="/images/u11-premier-logo-wide.png"
              alt="U-11 Premier League"
              width={240}
              height={80}
              className="w-[200px] sm:w-[240px] h-auto object-contain"
              priority
            />
          </div>
        </div>

        {/* サブテキスト */}
        <p className="text-lg sm:text-xl text-white/80 font-medium tracking-wide">
          デジタル選手証と試合速報
        </p>

        {/* メイン機能カード */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10 hover:bg-white/15 transition-colors">
            <div className="text-3xl sm:text-4xl mb-3">📱</div>
            <h3 className="text-base font-semibold text-white mb-1">デジタル選手証</h3>
            <p className="text-xs sm:text-sm text-white/60">QRコード付き選手証をスマホで管理</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10 hover:bg-white/15 transition-colors">
            <div className="text-3xl sm:text-4xl mb-3">⚽</div>
            <h3 className="text-base font-semibold text-white mb-1">試合速報</h3>
            <p className="text-xs sm:text-sm text-white/60">リアルタイムで試合結果を確認</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10 hover:bg-white/15 transition-colors">
            <div className="text-3xl sm:text-4xl mb-3">🏆</div>
            <h3 className="text-base font-semibold text-white mb-1">ランキング</h3>
            <p className="text-xs sm:text-sm text-white/60">チーム・選手の順位を自動集計</p>
          </div>
        </div>

        {/* CTAボタン */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-8 sm:mt-10">
          <a
            href="/login"
            className="w-full sm:w-auto px-8 py-3 min-h-[48px] bg-white text-navy font-semibold rounded-xl shadow-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
          >
            ログイン
          </a>
          <a
            href="/signup"
            className="w-full sm:w-auto px-8 py-3 min-h-[48px] bg-transparent text-white font-semibold rounded-xl border-2 border-white/50 hover:bg-white/10 hover:border-white transition-colors flex items-center justify-center"
          >
            新規登録
          </a>
        </div>

        {/* 粒子エフェクト */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-pulse"
              style={{
                width: 2 + (i % 3),
                height: 2 + (i % 3),
                left: `${8 + (i * 6)}%`,
                top: `${15 + (i * 5) % 60}%`,
                background: i % 3 === 0
                  ? 'rgba(79, 217, 255, 0.5)'
                  : 'rgba(255, 255, 255, 0.3)',
                animationDelay: `${i * 0.2}s`,
                animationDuration: '3s',
              }}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
