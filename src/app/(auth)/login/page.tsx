'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { loginSchema, type LoginFormData } from '@/types/auth';

/**
 * ログインページ（新デザイン）
 * タブ切り替えでログイン/新規登録を表示
 */
export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading, error, clearError } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

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
    <div className="flex flex-col h-full">
      {/* タブ切り替え */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('login')}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'login'
              ? 'text-[#0D47FF]'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          ログイン
          {activeTab === 'login' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0D47FF]" />
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab('signup');
            router.push('/signup');
          }}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'signup'
              ? 'text-[#0D47FF]'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          新規登録
          {activeTab === 'signup' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0D47FF]" />
          )}
        </button>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
        <div className="space-y-5 flex-1">
          {/* メールアドレス */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className={`
                w-full px-4 py-3 rounded-xl border bg-gray-50
                ${errors.email ? 'border-red-300' : 'border-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-[#0D47FF]/30 focus:border-[#0D47FF]
                transition-all text-sm
              `}
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* パスワード */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              パスワード
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              className={`
                w-full px-4 py-3 rounded-xl border bg-gray-50
                ${errors.password ? 'border-red-300' : 'border-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-[#0D47FF]/30 focus:border-[#0D47FF]
                transition-all text-sm
              `}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* パスワードを忘れた場合 */}
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-gray-500 hover:text-[#0D47FF] transition-colors"
            >
              パスワードをお忘れですか？
            </Link>
          </div>
        </div>

        {/* ログインボタン */}
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className={`
            w-full py-3.5 rounded-full font-bold text-white text-sm
            transition-all shadow-lg
            ${
              isSubmitting || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#0D47FF] hover:bg-[#0a3ad4] active:scale-[0.98]'
            }
          `}
        >
          {isSubmitting || loading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>
    </div>
  );
}
