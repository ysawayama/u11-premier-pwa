'use client';

import { useEffect, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { getTeamById } from '@/lib/api/teams';
import type { TeamWithPrefecture } from '@/types/database';

/**
 * チームポータル用レイアウト
 * サイドナビゲーションとメインコンテンツエリア
 * チームメンバーのみアクセス可能
 */

type MenuItem = {
  href: string;
  label: string;
  icon: string;
  requiresPlayer?: boolean; // 選手登録が必要なメニュー
  adminOnly?: boolean; // 管理者のみ
  coachOnly?: boolean; // コーチ/マネージャーのみ
};

const baseMenuItems: MenuItem[] = [
  { href: '', label: '戦績', icon: '📊' },
  { href: '/my-page', label: 'マイページ', icon: '👤', requiresPlayer: true },
  { href: '/schedule', label: 'スケジュール', icon: '📅' },
  { href: '/board', label: '掲示板', icon: '📋' },
  { href: '/attendance', label: '出欠管理', icon: '✋' },
  { href: '/roster', label: '選手名簿', icon: '👥' },
  { href: '/notes', label: 'ノートレビュー', icon: '📝', coachOnly: true },
  { href: '/album', label: 'アルバム', icon: '📷' },
  { href: '/chat', label: 'チャット', icon: '💬' },
  { href: '/matchmake', label: 'マッチメイク', icon: '🤝' },
  { href: '/settings', label: '設定', icon: '⚙️' },
];

export default function TeamPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const teamId = params.teamId as string;

  const [team, setTeam] = useState<TeamWithPrefecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [memberRole, setMemberRole] = useState<string | null>(null);
  const [hasPlayerProfile, setHasPlayerProfile] = useState(false);
  const [isAdminOrWebmaster, setIsAdminOrWebmaster] = useState(false);

  useEffect(() => {
    loadTeamAndCheckAccess();
  }, [teamId]);

  const loadTeamAndCheckAccess = async () => {
    try {
      const supabase = createClient();

      // ログインユーザー取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsMember(false);
        setLoading(false);
        return;
      }

      // まず管理者以上かチェック（Webマスター/Admin）
      const { data: isAdminOrAbove } = await supabase.rpc('is_admin_or_above');
      if (isAdminOrAbove) {
        setIsMember(true);
        setMemberRole('admin');
        setIsAdminOrWebmaster(true);
      } else {
        // チームメンバーシップ確認
        const { data: membership } = await supabase
          .from('team_members')
          .select('role, is_active')
          .eq('team_id', teamId)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (membership) {
          setIsMember(true);
          setMemberRole(membership.role);
        } else {
          // チーム代表かどうかも確認（team_membersに登録がなくても代表権限がある場合）
          const { data: isManager } = await supabase.rpc('is_team_manager_of', {
            team_uuid: teamId
          });
          if (isManager) {
            setIsMember(true);
            setMemberRole('manager');
          }
        }
      }

      // チーム情報取得
      const data = await getTeamById(teamId);
      setTeam(data);

      // 選手として登録されているかチェック
      const { data: playerData } = await supabase
        .from('players')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (playerData) {
        setHasPlayerProfile(true);
      }
    } catch (err) {
      console.error('チーム情報の取得に失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const basePath = `/team-portal/${teamId}`;

  // メニューをフィルター
  const menuItems = baseMenuItems.filter((item) => {
    // 選手登録が必要なメニュー
    if (item.requiresPlayer) {
      // 管理者/Webマスターは常に表示（PoC確認用）
      if (isAdminOrWebmaster) return true;
      // 選手登録がある場合のみ表示
      return hasPlayerProfile;
    }
    // コーチ/マネージャー限定メニュー
    if (item.coachOnly) {
      // 管理者は常に表示
      if (isAdminOrWebmaster) return true;
      // manager または coach のみ表示
      return memberRole === 'manager' || memberRole === 'coach';
    }
    return true;
  });

  const isActive = (href: string) => {
    const fullPath = `${basePath}${href}`;
    if (href === '') {
      return pathname === basePath;
    }
    return pathname.startsWith(fullPath);
  };

  // 現在のページ情報を取得（パンくずリスト用）
  const getCurrentPageInfo = () => {
    const relativePath = pathname.replace(basePath, '');
    if (!relativePath || relativePath === '') {
      return null; // トップページの場合はパンくず不要
    }
    const menuItem = menuItems.find(item => item.href && relativePath.startsWith(item.href));
    return menuItem || null;
  };

  const currentPage = getCurrentPageInfo();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">チームが見つかりません</p>
          <Link href="/teams" className="mt-4 text-blue-600 hover:underline">
            チーム一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  // メンバーでない場合はアクセス拒否
  if (!isMember) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">アクセス権限がありません</h1>
          <p className="text-gray-600 mb-6">
            このチームポータルは、チームメンバーのみがアクセスできます。
            チーム代表から招待を受けてください。
          </p>
          <div className="space-y-3">
            <Link
              href={`/teams/${teamId}`}
              className="block w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              チーム公開ページを見る
            </Link>
            <Link
              href="/teams"
              className="block w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              チーム一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* モバイルメニューボタン */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* チームロゴ・名前（クリックでポータルトップへ） */}
              <Link href={basePath} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                {team.logo_url ? (
                  <Image
                    src={team.logo_url}
                    alt={team.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold">
                    {team.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{team.name}</h1>
                  <p className="text-xs text-gray-500">チームポータル</p>
                </div>
              </Link>
            </div>

            <Link
              href="/dashboard"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              ダッシュボード
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* サイドナビゲーション（デスクトップ） */}
        <aside className="hidden lg:block w-64 bg-white shadow-sm min-h-[calc(100vh-64px)] sticky top-16">
          <nav className="p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={`${basePath}${item.href}`}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* モバイルメニュー */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-30">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">メニュー</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-md hover:bg-gray-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <nav className="p-4">
                <ul className="space-y-1">
                  {menuItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={`${basePath}${item.href}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isActive(item.href)
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          </div>
        )}

        {/* メインコンテンツ */}
        <main className="flex-1 p-4 lg:p-8">
          {/* パンくずリスト */}
          {currentPage && (
            <nav className="mb-4 flex items-center text-sm text-gray-500">
              <Link
                href={basePath}
                className="hover:text-blue-600 transition-colors"
              >
                トップ
              </Link>
              <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-medium flex items-center gap-1.5">
                <span>{currentPage.icon}</span>
                {currentPage.label}
              </span>
            </nav>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
