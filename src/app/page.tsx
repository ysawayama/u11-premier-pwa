import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <main className="text-center space-y-6 sm:space-y-8 p-4 sm:p-8 max-w-4xl w-full">
        {/* ヘッダー */}
        <div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-blue-900 mb-2 sm:mb-4">
            U-11プレミアリーグ
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-blue-700">
            デジタル選手証と試合速報
          </p>
        </div>

        {/* メイン機能カード */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📱</div>
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2">デジタル選手証</h3>
            <p className="text-xs sm:text-sm text-gray-600">QRコード付き選手証をスマホで管理</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">⚽</div>
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2">試合速報</h3>
            <p className="text-xs sm:text-sm text-gray-600">リアルタイムで試合結果を確認</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🏆</div>
            <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2">ランキング</h3>
            <p className="text-xs sm:text-sm text-gray-600">チーム・選手の順位を自動集計</p>
          </div>
        </div>

        {/* CTAボタン */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-8 sm:mt-12">
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 min-h-[48px] bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors flex items-center justify-center"
          >
            ログイン
          </Link>
          <Link
            href="/signup"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 min-h-[48px] bg-white hover:bg-gray-50 text-blue-600 font-medium rounded-lg shadow-md border-2 border-blue-600 transition-colors flex items-center justify-center"
          >
            新規登録
          </Link>
        </div>

        {/* ステータス */}
        <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">
            実装完了機能
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 text-left">
            <p>✅ Next.js 16 + TypeScript</p>
            <p>✅ TailwindCSS</p>
            <p>✅ Supabase 認証</p>
            <p>✅ PWA 設定</p>
            <p>✅ ログイン・サインアップ</p>
            <p>✅ 保護されたルート</p>
          </div>
        </div>
      </main>
    </div>
  );
}
