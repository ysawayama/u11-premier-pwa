'use client';

import { useCallback, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// framer-motionを含むコンポーネントはクライアントサイドのみでロード
const SplashIntro = dynamic(
  () => import('@/components/splash/SplashIntro'),
  { ssr: false }
);

const InstallPrompt = dynamic(
  () => import('@/components/features/pwa/InstallPrompt').then(mod => ({ default: mod.InstallPrompt })),
  { ssr: false }
);

/**
 * クライアントサイドのみで実行されるレイアウトコンポーネント
 */
export function ClientLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // セッションごとにスプラッシュを表示（ブラウザを閉じるとリセット）
    const splashShown = sessionStorage.getItem('splashShown');
    if (!splashShown) {
      setShowSplash(true);
      sessionStorage.setItem('splashShown', 'true');
    }
  }, []);

  // スプラッシュ終了時の遷移ロジック
  const handleSplashFinished = useCallback(() => {
    // 既にオンボーディングやログインページにいる場合はそのまま
    if (pathname?.startsWith('/onboarding') || pathname?.startsWith('/login') || pathname?.startsWith('/signup')) {
      return;
    }

    // オンボーディング完了済みかチェック
    const completed = typeof window !== 'undefined'
      ? window.localStorage.getItem('onboardingCompleted')
      : null;

    if (!completed) {
      // 初回ユーザー: オンボーディングへ
      router.replace('/onboarding');
    }
    // 既存ユーザー: 現在のページにとどまる（または必要に応じてホームへ）
  }, [router, pathname]);

  // SSR時は何もレンダリングしない
  if (!isMounted) {
    return null;
  }

  return (
    <>
      {showSplash && <SplashIntro onFinished={handleSplashFinished} />}
      <InstallPrompt />
    </>
  );
}
