'use client';

/**
 * オンボーディング1: アプリ概要イラスト
 * スマホ画面モック（試合速報カード＋ランキングカード）
 */
export default function AppOverviewIllustration() {
  return (
    <div className="relative w-64 h-44">
      {/* 背面カード（ランキング） */}
      <div
        className="absolute top-0 right-0 w-40 h-32 bg-white rounded-2xl shadow-xl transform rotate-6"
        style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
      >
        <div className="p-3">
          <div className="h-2 w-16 bg-gray-200 rounded mb-2" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                  {i}
                </div>
                <div className="h-2 flex-1 bg-gray-100 rounded" />
                <div className="h-2 w-6 bg-blue-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 前面カード（試合速報） */}
      <div
        className="absolute bottom-0 left-0 w-44 h-36 bg-white rounded-2xl shadow-2xl transform -rotate-3"
        style={{ boxShadow: '0 12px 32px rgba(0,0,0,0.25)' }}
      >
        <div className="p-3">
          <div className="h-2 w-20 bg-gray-200 rounded mb-3" />

          {/* 試合カード風 */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-blue-200" />
                <div className="h-2 w-12 bg-gray-300 rounded" />
              </div>
              <div className="text-lg font-bold text-gray-700">2</div>
            </div>
            <div className="h-px bg-gray-200 my-2" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-red-200" />
                <div className="h-2 w-10 bg-gray-300 rounded" />
              </div>
              <div className="text-lg font-bold text-gray-700">1</div>
            </div>
          </div>

          <div className="mt-2 flex justify-center">
            <div className="h-1.5 w-8 bg-green-400 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
