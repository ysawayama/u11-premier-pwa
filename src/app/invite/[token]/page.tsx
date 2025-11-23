'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

type InvitationData = {
  id: string;
  team_id: string;
  email: string;
  team_role: string;
  status: string;
  expires_at: string;
  team: {
    id: string;
    name: string;
    logo_url: string | null;
  };
};

/**
 * 招待受諾ページ
 * 招待URLからアクセスし、チームに参加する
 */
export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // ログイン状態確認
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      setCurrentUserEmail(user?.email || null);

      // 招待情報取得
      const { data: invitationData, error: invError } = await supabase
        .from('invitations')
        .select(`
          id, team_id, email, team_role, status, expires_at,
          team:teams(id, name, logo_url)
        `)
        .eq('token', token)
        .single();

      if (invError) {
        setError('招待が見つかりません');
        return;
      }

      // ステータスチェック
      if (invitationData.status !== 'pending') {
        if (invitationData.status === 'accepted') {
          setError('この招待は既に使用されています');
        } else if (invitationData.status === 'cancelled') {
          setError('この招待は取り消されています');
        } else {
          setError('この招待は無効です');
        }
        return;
      }

      // 有効期限チェック
      if (new Date(invitationData.expires_at) < new Date()) {
        setError('この招待は有効期限が切れています');
        return;
      }

      setInvitation({
        ...invitationData,
        team: invitationData.team as any
      });
    } catch (err: any) {
      setError('招待情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!invitation) return;

    try {
      setAccepting(true);
      const supabase = createClient();

      // ログインチェック
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // ログインページにリダイレクト（招待トークンを保持）
        router.push(`/login?redirect=/invite/${token}`);
        return;
      }

      // メールアドレス確認（オプション：厳密に一致させる場合）
      // if (user.email?.toLowerCase() !== invitation.email.toLowerCase()) {
      //   setError(`この招待は ${invitation.email} 宛てです。正しいアカウントでログインしてください。`);
      //   return;
      // }

      // 既にメンバーかチェック
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', invitation.team_id)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (existingMember) {
        setError('既にこのチームのメンバーです');
        router.push(`/team-portal/${invitation.team_id}`);
        return;
      }

      // チームメンバーとして追加
      const { error: memberError } = await supabase.from('team_members').insert({
        team_id: invitation.team_id,
        user_id: user.id,
        role: invitation.team_role,
        is_active: true,
        joined_at: new Date().toISOString(),
      });

      if (memberError) throw memberError;

      // 招待ステータスを更新
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_by: user.id,
          accepted_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

      if (updateError) throw updateError;

      // チームポータルにリダイレクト
      router.push(`/team-portal/${invitation.team_id}`);
    } catch (err: any) {
      setError('参加に失敗しました: ' + err.message);
    } finally {
      setAccepting(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'manager': return '代表';
      case 'coach': return 'コーチ';
      case 'player': return '選手';
      case 'guardian': return '保護者';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">招待情報を確認中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-6">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">招待エラー</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          {/* チームロゴ */}
          <div className="flex justify-center mb-4">
            {invitation.team.logo_url ? (
              <Image
                src={invitation.team.logo_url}
                alt={invitation.team.name}
                width={80}
                height={80}
                className="object-contain"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-3xl font-bold">
                {invitation.team.name.charAt(0)}
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            チームへの招待
          </h1>
          <p className="text-gray-600">
            <span className="font-semibold text-blue-600">{invitation.team.name}</span>
            {' '}に招待されています
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">役割</dt>
              <dd className="font-medium text-gray-900">{getRoleLabel(invitation.team_role)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">招待先メール</dt>
              <dd className="font-medium text-gray-900">{invitation.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">有効期限</dt>
              <dd className="font-medium text-gray-900">
                {new Date(invitation.expires_at).toLocaleDateString('ja-JP')}
              </dd>
            </div>
          </dl>
        </div>

        {isLoggedIn ? (
          <div className="space-y-4">
            {currentUserEmail && (
              <p className="text-sm text-gray-500 text-center">
                <span className="font-medium">{currentUserEmail}</span> としてログイン中
              </p>
            )}
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {accepting ? '参加処理中...' : 'チームに参加する'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 text-center">
              参加するにはログインが必要です
            </p>
            <Link
              href={`/login?redirect=/invite/${token}`}
              className="block w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
            >
              ログインして参加
            </Link>
            <Link
              href={`/signup?redirect=/invite/${token}`}
              className="block w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-center"
            >
              新規登録して参加
            </Link>
          </div>
        )}

        <p className="mt-6 text-xs text-gray-400 text-center">
          招待を受け入れると、チームポータルにアクセスできるようになります。
        </p>
      </div>
    </div>
  );
}
