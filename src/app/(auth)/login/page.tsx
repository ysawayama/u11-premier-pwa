'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { loginSchema, type LoginFormData } from '@/types/auth';

/**
 * ログインページ
 */
export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // ログイン成功時にダッシュボードへリダイレクト
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // エラーメッセージをクリア
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const onSubmit = async (data: LoginFormData) => {
    await login(data);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">ログイン</h2>

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* メールアドレス */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className={`
              w-full px-4 py-3 rounded-lg border
              ${errors.email ? 'border-red-300' : 'border-gray-300'}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-colors
            `}
            placeholder="example@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* パスワード */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            パスワード
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className={`
              w-full px-4 py-3 rounded-lg border
              ${errors.password ? 'border-red-300' : 'border-gray-300'}
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-colors
            `}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* パスワードを忘れた場合 */}
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            パスワードをお忘れですか？
          </Link>
        </div>

        {/* ログインボタン */}
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className={`
            w-full py-3 px-4 rounded-lg font-medium text-white
            transition-colors
            ${
              isSubmitting || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }
          `}
        >
          {isSubmitting || loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>

      {/* サインアップへのリンク */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          アカウントをお持ちでないですか？{' '}
          <Link
            href="/signup"
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
