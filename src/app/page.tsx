import { Button } from '@/components/ui';
import { Card, CardTitle, CardContent } from '@/components/ui';

// 動的レンダリングを強制（SSR時のuseContextエラーを回避）
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-light to-blue-50">
      <main className="text-center space-y-6 sm:space-y-8 p-4 sm:p-8 max-w-4xl w-full">
        {/* ヘッダー */}
        <div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-navy mb-2 sm:mb-4">
            U-11プレミアリーグ
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-navy-light">
            デジタル選手証と試合速報
          </p>
        </div>

        {/* メイン機能カード */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
          <Card variant="elevated" padding="lg" className="text-center">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">📱</div>
            <CardTitle className="text-base mb-1">デジタル選手証</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600">QRコード付き選手証をスマホで管理</p>
          </Card>
          <Card variant="elevated" padding="lg" className="text-center">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">⚽</div>
            <CardTitle className="text-base mb-1">試合速報</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600">リアルタイムで試合結果を確認</p>
          </Card>
          <Card variant="elevated" padding="lg" className="text-center">
            <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🏆</div>
            <CardTitle className="text-base mb-1">ランキング</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600">チーム・選手の順位を自動集計</p>
          </Card>
        </div>

        {/* CTAボタン */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-8 sm:mt-12">
          <Button href="/login" size="lg" fullWidth className="sm:w-auto">
            ログイン
          </Button>
          <Button href="/signup" variant="outline" size="lg" fullWidth className="sm:w-auto">
            新規登録
          </Button>
        </div>

        {/* ステータス */}
        <Card variant="elevated" padding="lg" className="mt-8 sm:mt-12">
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
        </Card>
      </main>
    </div>
  );
}
