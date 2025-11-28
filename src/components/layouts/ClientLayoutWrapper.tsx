'use client';

import dynamic from 'next/dynamic';

// ClientLayoutを完全にクライアントサイドのみでロード（サーバーサイドでは何もレンダリングしない）
const ClientLayout = dynamic(
  () => import('./ClientLayout').then(mod => ({ default: mod.ClientLayout })),
  {
    ssr: false,
    loading: () => null
  }
);

/**
 * ClientLayoutのラッパー
 * 'use client'ディレクティブによりクライアントコンポーネントとして扱われる
 */
export function ClientLayoutWrapper() {
  return <ClientLayout />;
}
