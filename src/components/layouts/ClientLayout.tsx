'use client';

import { InstallPrompt } from '@/components/features/pwa/InstallPrompt';

/**
 * クライアントサイドのみで実行されるレイアウトコンポーネント
 */
export function ClientLayout() {
  return <InstallPrompt />;
}
