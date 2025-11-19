import { z } from 'zod';

/**
 * ユーザータイプの定義
 */
export const UserType = {
  PLAYER_GUARDIAN: 'player_guardian',
  COACH: 'coach',
  ADMIN: 'admin',
} as const;

export type UserType = (typeof UserType)[keyof typeof UserType];

/**
 * ユーザー情報の型定義
 */
export interface User {
  id: string;
  email: string;
  user_type: UserType;
  full_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

/**
 * ログインフォームのバリデーションスキーマ
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(6, 'パスワードは6文字以上で入力してください'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * サインアップフォームのバリデーションスキーマ
 */
export const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('有効なメールアドレスを入力してください'),
  password: z
    .string()
    .min(6, 'パスワードは6文字以上で入力してください')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'パスワードは大文字、小文字、数字を含む必要があります'
    ),
  confirmPassword: z.string(),
  fullName: z
    .string()
    .min(2, '氏名は2文字以上で入力してください'),
  userType: z.enum([UserType.PLAYER_GUARDIAN, UserType.COACH, UserType.ADMIN]),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'パスワードが一致しません',
  path: ['confirmPassword'],
});

export type SignupFormData = z.infer<typeof signupSchema>;

/**
 * 認証エラーの型定義
 */
export interface AuthError {
  message: string;
  code?: string;
}

/**
 * 認証状態の型定義
 */
export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: AuthError | null;
}
