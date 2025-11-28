'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { BottomNav } from '@/components/navigation/BottomNav';

/**
 * 保護されたルート用のクライアントコンポーネント
 * 認証チェックとセッション管理を行う
 */
export function ProtectedLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, checkSession } = useAuthStore();

  // ボトムナビを表示しないページ（チームポータルの詳細ページなど）
  const hideBottomNav = pathname.includes('/team-portal/') || pathname.includes('/admin');

  // ダッシュボードはカスタムレイアウトを使用
  const useCustomLayout = pathname === '/dashboard';

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
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-r-transparent"
            style={{ borderColor: 'white', borderRightColor: 'transparent' }}
          />
          <p className="mt-4 text-white/70">
            読み込み中...
          </p>
        </div>
      </div>
    );
  }

  // 未ログイン（リダイレクト中）
  if (!user) {
    return null;
  }

  return (
    <>
      <main className={hideBottomNav ? '' : 'pb-nav'}>
        {useCustomLayout ? (
          children
        ) : (
          <div className="min-h-screen">
            {children}
          </div>
        )}
      </main>
      {!hideBottomNav && <BottomNav />}
    </>
  );
}
