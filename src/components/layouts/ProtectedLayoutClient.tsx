'use client';

import { useEffect, useRef } from 'react';
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
  const { user, loading, initialized, initializeAuth } = useAuthStore();
  const initRef = useRef(false);

  // ボトムナビを表示しないページ（チームポータルの詳細ページなど）
  const hideBottomNav = pathname.includes('/team-portal/') || pathname.includes('/admin');

  // ダッシュボードはカスタムレイアウトを使用
  const useCustomLayout = pathname === '/dashboard';

  useEffect(() => {
    // 認証を初期化（一度だけ実行）
    if (!initRef.current) {
      initRef.current = true;
      initializeAuth();
    }
  }, [initializeAuth]);

  useEffect(() => {
    // 初期化完了後、未ログインの場合はログインページへ
    if (initialized && !loading && !user) {
      router.push('/login');
    }
  }, [user, loading, initialized, router]);

  // 初期化中またはローディング中
  if (!initialized || loading) {
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
