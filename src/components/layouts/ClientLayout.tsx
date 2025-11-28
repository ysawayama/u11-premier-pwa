'use client';

import { useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { InstallPrompt } from '@/components/features/pwa/InstallPrompt';
import SplashIntro from '@/components/splash/SplashIntro';

/**
 * クライアントサイドのみで実行されるレイアウトコンポーネント
 */
export function ClientLayout() {
  const router = useRouter();
  const pathname = usePathname();

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

  return (
    <>
      <SplashIntro onFinished={handleSplashFinished} />
      <InstallPrompt />
    </>
  );
}
