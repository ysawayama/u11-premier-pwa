import { createBrowserClient } from '@supabase/ssr';

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Supabaseクライアント（ブラウザ用）- シングルトン
 * クライアントコンポーネントで使用
 */
export const createClient = () => {
  // SSR時には null を返す（クライアントサイドでのみ使用）
  if (typeof window === 'undefined') {
    return null as any;
  }

  // シングルトン: 既存のクライアントがあれば再利用
  if (supabaseClient) {
    return supabaseClient;
  }

  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return supabaseClient;
};
