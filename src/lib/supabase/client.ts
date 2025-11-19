import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabaseクライアント（ブラウザ用）
 * クライアントコンポーネントで使用
 */
export const createClient = () => {
  // SSR時には null を返す（クライアントサイドでのみ使用）
  if (typeof window === 'undefined') {
    return null as any;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
