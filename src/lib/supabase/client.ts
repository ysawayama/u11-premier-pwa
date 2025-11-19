import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabaseクライアント（ブラウザ用）
 * クライアントコンポーネントで使用
 */
export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
