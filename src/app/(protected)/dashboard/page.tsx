'use client';

import { useAuthStore } from '@/lib/stores/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * ダッシュボードページ（仮実装）
 * 認証後のメインページ
 */
export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-900">
              U-11プレミアリーグ
            </h1>
            <div className="flex items-center gap-2">
              <Link
                href="/settings"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ⚙️ 設定
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ウェルカムセクション */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ようこそ、{user?.full_name}さん
          </h2>
          <p className="text-gray-600">
            アカウントタイプ:{' '}
            <span className="font-medium">
              {user?.user_type === 'player_guardian'
                ? '保護者'
                : user?.user_type === 'coach'
                ? 'コーチ'
                : '管理者'}
            </span>
          </p>
          <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
        </div>

        {/* クイックアクションカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* チーム一覧 */}
          <Link
            href="/teams"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              チーム一覧
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              登録チームを確認・検索
            </p>
            <span className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              開く →
            </span>
          </Link>

          {/* デジタル選手証 */}
          <Link
            href="/players"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              選手一覧
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              QRコード付き選手証を表示・管理
            </p>
            <span className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              開く →
            </span>
          </Link>

          {/* 試合速報 */}
          <Link
            href="/matches"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              試合速報
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              リアルタイムで試合結果を確認
            </p>
            <span className="text-green-600 hover:text-green-700 text-sm font-medium">
              開く →
            </span>
          </Link>

          {/* ランキング */}
          <Link
            href="/standings"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-4">
              <svg
                className="w-6 h-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              順位表
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              チームの順位とスタッツを表示
            </p>
            <span className="text-yellow-600 hover:text-yellow-700 text-sm font-medium">
              開く →
            </span>
          </Link>

          {/* 選手統計 */}
          <Link
            href="/stats"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              選手統計
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              得点・アシストランキング
            </p>
            <span className="text-orange-600 hover:text-orange-700 text-sm font-medium">
              開く →
            </span>
          </Link>
        </div>

        {/* コーチ・管理者用セクション */}
        {(user?.user_type === 'coach' || user?.user_type === 'admin') && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              管理機能
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 試合管理 */}
              <Link
                href="/admin/matches"
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border-2 border-orange-200"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  試合管理
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  スコア入力・ステータス変更
                </p>
                <span className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                  管理画面へ →
                </span>
              </Link>
            </div>
          </div>
        )}

        {/* インフォメーション */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            Step 5 完了！基本機能が利用可能になりました
          </h3>
          <div className="text-sm text-green-700 space-y-1">
            <p>✅ プロジェクトセットアップ完了</p>
            <p>✅ PWA基盤構築完了</p>
            <p>✅ 認証システム完了</p>
            <p>✅ データベースモデリング完了</p>
            <p>✅ チーム一覧・詳細ページ完了</p>
            <p>✅ 選手一覧・デジタル選手証完了</p>
            <p>✅ 試合一覧・詳細ページ完了</p>
            <p>✅ 順位表ページ完了</p>
            <p className="pt-2">🎉 全ての基本機能が利用可能です！</p>
          </div>
        </div>
      </main>
    </div>
  );
}
