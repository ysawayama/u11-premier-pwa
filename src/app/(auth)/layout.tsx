import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ログイン - U-11プレミアリーグ',
};

// Force dynamic rendering for all auth pages
export const dynamic = 'force-dynamic';

/**
 * 認証ページ用レイアウト
 * ログイン・サインアップページで共通のスタイルを提供
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴエリア */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">
            U-11プレミアリーグ
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            デジタル選手証と試合速報
          </p>
        </div>

        {/* コンテンツエリア */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {children}
        </div>

        {/* フッター */}
        <p className="text-center text-sm text-gray-600 mt-6">
          © 2024 U-11プレミアリーグ
        </p>
      </div>
    </div>
  );
}
