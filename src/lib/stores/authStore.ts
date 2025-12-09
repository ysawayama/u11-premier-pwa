import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import type { User, AuthError, LoginFormData, SignupFormData } from '@/types/auth';

/**
 * 認証状態管理ストア（Zustand）
 * persistミドルウェアでlocalStorageに永続化
 */
interface AuthStore {
  // 状態
  user: User | null;
  session: any | null;
  loading: boolean;
  initialized: boolean; // 初期化完了フラグ
  error: AuthError | null;

  // アクション
  login: (data: LoginFormData) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  checkSession: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
  // 初期状態
  user: null,
  session: null,
  loading: true, // 初期はtrue（セッションチェック中）
  initialized: false,
  error: null,

  // ログイン
  login: async (data: LoginFormData) => {
    set({ loading: true, error: null });

    try {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      // ユーザープロフィール情報を取得
      if (authData.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.warn('プロフィール情報の取得に失敗:', profileError);
        }

        set({
          user: profileData,
          session: authData.session,
          loading: false,
        });
      }
    } catch (error: any) {
      set({
        error: {
          message: error.message || 'ログインに失敗しました',
          code: error.code,
        },
        loading: false,
      });
    }
  },

  // サインアップ
  signup: async (data: SignupFormData) => {
    set({ loading: true, error: null });

    try {
      const supabase = createClient();

      // 1. Supabase Authでユーザー作成
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('ユーザーの作成に失敗しました');
      }

      // 2. ユーザープロフィール情報をusersテーブルに保存
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          user_type: data.userType,
          full_name: data.fullName,
          phone: data.phone || null,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      set({
        user: profileData,
        session: authData.session,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: {
          message: error.message || 'サインアップに失敗しました',
          code: error.code,
        },
        loading: false,
      });
    }
  },

  // ログアウト
  logout: async () => {
    set({ loading: true, error: null });

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      set({
        user: null,
        session: null,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: {
          message: error.message || 'ログアウトに失敗しました',
          code: error.code,
        },
        loading: false,
      });
    }
  },

  // エラーをクリア
  clearError: () => set({ error: null }),

  // セッションをチェック（ページ読み込み時など）
  checkSession: async () => {
    const { initialized } = get();

    // 既に初期化済みの場合はスキップ
    if (initialized) {
      return;
    }

    set({ loading: true });

    try {
      const supabase = createClient();

      // まずgetSessionを試す
      let { data: { session }, error: sessionError } = await supabase.auth.getSession();

      // セッションがない場合、refreshSessionを試みる
      if (!session && !sessionError) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (!refreshError && refreshData.session) {
          session = refreshData.session;
        }
      }

      if (sessionError) throw sessionError;

      if (session?.user) {
        // ユーザープロフィール情報を取得
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.warn('プロフィール情報の取得に失敗:', profileError);
        }

        set({
          user: profileData,
          session,
          loading: false,
          initialized: true,
        });
      } else {
        set({
          user: null,
          session: null,
          loading: false,
          initialized: true,
        });
      }
    } catch (error: any) {
      console.error('セッションチェックエラー:', error);
      set({
        user: null,
        session: null,
        loading: false,
        initialized: true,
      });
    }
  },

  // アプリ起動時の認証初期化（onAuthStateChangeを設定）
  initializeAuth: async () => {
    const supabase = createClient();

    // セッション変更を監視
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          set({
            user: profileData,
            session,
            loading: false,
            initialized: true,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        set({
          user: null,
          session: null,
          loading: false,
          initialized: true,
        });
      }
    });

    // 初回セッションチェック
    await get().checkSession();
  },
    }),
    {
      name: 'auth-storage', // localStorage のキー名
      partialize: (state) => ({
        user: state.user,
        // sessionは保存しない（Supabaseが管理）
      }),
    }
  )
);
