'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * 保護されたルート用レイアウト
 * 認証チェックとセッション管理を行う
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading, checkSession } = useAuthStore();

  useEffect(() => {
    // セッションをチェック
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    // ローディング完了後、未ログインの場合はログインページへ
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // ローディング中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 未ログイン（リダイレクト中）
  if (!user) {
    return null;
  }

  return <>{children}</>;
}
