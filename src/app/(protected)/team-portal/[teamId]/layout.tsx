'use client';

import { useEffect, useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { getTeamById } from '@/lib/api/teams';
import type { TeamWithPrefecture } from '@/types/database';
import {
  BarChart3,
  User,
  Calendar,
  ClipboardList,
  Hand,
  Users,
  FileText,
  Camera,
  MessageCircle,
  Handshake,
  Settings,
  Lock,
  Home,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * チームポータル用レイアウト
 * サイドナビゲーションとメインコンテンツエリア
 * チームメンバーのみアクセス可能
 */

type MenuItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  requiresPlayer?: boolean; // 選手登録が必要なメニュー
  adminOnly?: boolean; // 管理者のみ
  coachOnly?: boolean; // コーチ/マネージャーのみ
};

const baseMenuItems: MenuItem[] = [
  { href: '', label: '戦績', icon: BarChart3 },
  { href: '/my-page', label: 'マイページ', icon: User, requiresPlayer: true },
  { href: '/schedule', label: 'スケジュール', icon: Calendar },
  { href: '/board', label: '掲示板', icon: ClipboardList },
  { href: '/attendance', label: '出欠管理', icon: Hand },
  { href: '/roster', label: '選手名簿', icon: Users },
  { href: '/notes', label: 'ノートレビュー', icon: FileText, coachOnly: true },
  { href: '/album', label: 'アルバム', icon: Camera },
  { href: '/chat', label: 'チャット', icon: MessageCircle },
  { href: '/matchmake', label: 'マッチメイク', icon: Handshake },
  { href: '/settings', label: '設定', icon: Settings },
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
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
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
          <Link href="/teams" className="mt-4 text-primary hover:underline">
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
          <div className="flex justify-center mb-6">
            <Lock size={64} className="text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">アクセス権限がありません</h1>
          <p className="text-gray-600 mb-6">
            このチームポータルは、チームメンバーのみがアクセスできます。
            チーム代表から招待を受けてください。
          </p>
          <div className="space-y-3">
            <Link
              href={`/teams/${teamId}`}
              className="block w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
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
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* モバイルメニューボタン */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Menu size={24} />
              </button>

              {/* チームロゴ・名前（クリックでポータルトップへ） */}
              <Link href={basePath} className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
                {team.logo_url ? (
                  <Image
                    src={team.logo_url}
                    alt={team.name}
                    width={36}
                    height={36}
                    className="object-contain sm:w-10 sm:h-10"
                  />
                ) : (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm sm:text-base">
                    {team.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate max-w-[140px] sm:max-w-none">{team.name}</h1>
                  <p className="text-[10px] sm:text-xs text-gray-500">チームポータル</p>
                </div>
              </Link>
            </div>

            <Link
              href="/dashboard"
              className="text-xs sm:text-sm text-primary hover:text-primary-hover min-h-[44px] flex items-center px-2 gap-1"
            >
              <Home size={18} className="sm:hidden" />
              <span className="hidden sm:inline">ダッシュボード</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* サイドナビゲーション（デスクトップ） */}
        <aside className="hidden lg:block w-64 bg-white shadow-sm min-h-[calc(100vh-64px)] sticky top-16">
          <nav className="p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={`${basePath}${item.href}`}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[48px] ${
                        isActive(item.href)
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
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
                    <X size={20} />
                  </button>
                </div>
              </div>
              <nav className="p-4">
                <ul className="space-y-1">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={`${basePath}${item.href}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[48px] ${
                            isActive(item.href)
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon size={20} />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>
          </div>
        )}

        {/* メインコンテンツ */}
        <main className="flex-1 p-3 sm:p-4 lg:p-8 min-w-0">
          {/* パンくずリスト */}
          {currentPage && (
            <nav className="mb-3 sm:mb-4 flex items-center text-xs sm:text-sm text-gray-500">
              <Link
                href={basePath}
                className="hover:text-primary transition-colors"
              >
                トップ
              </Link>
              <ChevronRight size={16} className="mx-2 text-gray-400" />
              <span className="text-gray-900 font-medium flex items-center gap-1.5">
                {(() => {
                  const Icon = currentPage.icon;
                  return <Icon size={16} />;
                })()}
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
