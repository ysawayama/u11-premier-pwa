'use client';

/**
 * オンボーディング2: 選手証カードイラスト
 * デジタル選手証モック（顔写真＋名前＋背番号＋QRコード）
 */
export default function PlayerCardIllustration() {
  return (
    <div className="relative">
      {/* 選手証カード */}
      <div
        className="w-56 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl overflow-hidden"
        style={{ boxShadow: '0 16px 40px rgba(0,0,0,0.25)' }}
      >
        {/* ヘッダー（チームカラー） */}
        <div className="h-3 bg-gradient-to-r from-blue-600 to-blue-400" />

        <div className="p-4">
          {/* 上部: 顔写真と基本情報 */}
          <div className="flex gap-3 mb-3">
            {/* 顔写真プレースホルダー */}
            <div className="w-16 h-20 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>

            {/* 名前と情報 */}
            <div className="flex-1">
              <div className="h-2.5 w-16 bg-gray-200 rounded mb-1" />
              <div className="h-4 w-24 bg-gray-700 rounded mb-2" />
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-blue-600">10</span>
                <div className="h-2 w-12 bg-gray-200 rounded" />
              </div>
            </div>
          </div>

          {/* チーム名 */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
            <div className="w-6 h-6 rounded-full bg-blue-100" />
            <div className="h-2.5 w-20 bg-gray-300 rounded" />
          </div>

          {/* QRコード */}
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-gray-400 font-medium">DIGITAL ID</div>
            <div className="w-12 h-12 bg-gray-800 rounded p-1">
              {/* QRコード風パターン */}
              <div className="w-full h-full grid grid-cols-5 gap-px">
                {[...Array(25)].map((_, i) => (
                  <div
                    key={i}
                    className={`${Math.random() > 0.4 ? 'bg-white' : 'bg-gray-800'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 装飾: 光の反射 */}
      <div
        className="absolute top-0 left-0 right-0 h-1/3 rounded-t-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}
