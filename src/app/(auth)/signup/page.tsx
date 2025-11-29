'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { signupSchema, type SignupFormData, UserType } from '@/types/auth';

/**
 * サインアップページ
 */
export default function SignupPage() {
  const router = useRouter();
  const { signup, user, loading, error, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      userType: UserType.PLAYER_GUARDIAN,
    },
  });

  // サインアップ成功時にダッシュボードへリダイレクト
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

  const onSubmit = async (data: SignupFormData) => {
    await signup(data);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">新規登録</h2>

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              transition-colors
            `}
            placeholder="example@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* 氏名 */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            氏名
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            {...register('fullName')}
            className={`
              w-full px-4 py-3 rounded-lg border
              ${errors.fullName ? 'border-red-300' : 'border-gray-300'}
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              transition-colors
            `}
            placeholder="山田 太郎"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* 電話番号（任意） */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            電話番号 <span className="text-gray-500 text-xs">(任意)</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            {...register('phone')}
            className={`
              w-full px-4 py-3 rounded-lg border
              ${errors.phone ? 'border-red-300' : 'border-gray-300'}
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              transition-colors
            `}
            placeholder="090-1234-5678"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* ユーザータイプ */}
        <div>
          <label
            htmlFor="userType"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            アカウントタイプ
          </label>
          <select
            id="userType"
            {...register('userType')}
            className={`
              w-full px-4 py-3 rounded-lg border
              ${errors.userType ? 'border-red-300' : 'border-gray-300'}
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              transition-colors bg-white
            `}
          >
            <option value={UserType.PLAYER_GUARDIAN}>保護者</option>
            <option value={UserType.COACH}>コーチ</option>
            <option value={UserType.ADMIN}>管理者</option>
          </select>
          {errors.userType && (
            <p className="mt-1 text-sm text-red-600">
              {errors.userType.message}
            </p>
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
            autoComplete="new-password"
            {...register('password')}
            className={`
              w-full px-4 py-3 rounded-lg border
              ${errors.password ? 'border-red-300' : 'border-gray-300'}
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              transition-colors
            `}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            大文字、小文字、数字を含む6文字以上
          </p>
        </div>

        {/* パスワード確認 */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            パスワード（確認）
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            className={`
              w-full px-4 py-3 rounded-lg border
              ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'}
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              transition-colors
            `}
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* 登録ボタン */}
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className={`
            w-full py-3 px-4 rounded-lg font-medium text-white
            transition-colors mt-6
            ${
              isSubmitting || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-hover active:bg-blue-800'
            }
          `}
        >
          {isSubmitting || loading ? '登録中...' : '新規登録'}
        </button>
      </form>

      {/* ログインへのリンク */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          既にアカウントをお持ちですか？{' '}
          <Link
            href="/login"
            className="text-primary hover:text-primary-hover font-medium hover:underline"
          >
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
