'use client';

/**
 * オンボーディング3: チームポータルイラスト
 * チームページモック（チームロゴ＋試合カード＋写真サムネ）
 */
export default function TeamPortalIllustration() {
  return (
    <div className="relative w-60">
      {/* メインカード */}
      <div
        className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ boxShadow: '0 16px 40px rgba(0,0,0,0.25)' }}
      >
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4">
          <div className="flex items-center gap-3">
            {/* チームロゴ */}
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white/80" />
            </div>
            <div>
              <div className="h-2 w-20 bg-white/40 rounded mb-1.5" />
              <div className="h-3 w-28 bg-white/80 rounded" />
            </div>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* 今週の試合 */}
          <div>
            <div className="h-2 w-16 bg-gray-200 rounded mb-2" />
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100" />
                  <span className="font-medium text-gray-700">vs</span>
                  <div className="w-6 h-6 rounded-full bg-red-100" />
                </div>
                <div className="text-xs text-gray-400">12/15 10:00</div>
              </div>
            </div>
          </div>

          {/* ギャラリー */}
          <div>
            <div className="h-2 w-12 bg-gray-200 rounded mb-2" />
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-14 h-14 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 装飾: 浮遊するアイコン */}
      <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-400 rounded-xl shadow-lg flex items-center justify-center transform rotate-12">
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      </div>
    </div>
  );
}
