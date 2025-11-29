'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Team } from '@/types/database';

type TeamMember = {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  joined_at: string;
  user: {
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  } | null;
};

type Invitation = {
  id: string;
  email: string;
  team_role: string;
  status: string;
  token: string;
  expires_at: string;
  created_at: string;
};

type ActiveTab = 'members' | 'profile';

/**
 * チームポータル - 設定ページ
 * メンバー管理、招待機能
 */
export default function SettingsPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('members');

  // チームプロフィール
  const [team, setTeam] = useState<Team | null>(null);
  const [profileForm, setProfileForm] = useState({
    hero_image_url: '',
    description: '',
    concept: '',
    philosophy: '',
    representative_name: '',
    address: '',
    website_url: '',
    sns_twitter: '',
    sns_instagram: '',
    sns_facebook: '',
    sns_youtube: '',
    home_ground: '',
    founded_year: '',
    registration_status: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 招待フォーム
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('player');
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    loadData();
  }, [teamId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // 権限確認（管理者以上 OR チームマネージャー）
      const { data: adminCheck } = await supabase.rpc('is_admin_or_above');
      const { data: managerCheck } = await supabase.rpc('is_team_manager_of', {
        team_uuid: teamId
      });
      setIsManager(!!adminCheck || !!managerCheck);

      // チーム情報取得
      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamData) {
        setTeam(teamData as Team);
        setProfileForm({
          hero_image_url: teamData.hero_image_url || '',
          description: teamData.description || '',
          concept: teamData.concept || '',
          philosophy: teamData.philosophy || '',
          representative_name: teamData.representative_name || '',
          address: teamData.address || '',
          website_url: teamData.website_url || '',
          sns_twitter: teamData.sns_twitter || '',
          sns_instagram: teamData.sns_instagram || '',
          sns_facebook: teamData.sns_facebook || '',
          sns_youtube: teamData.sns_youtube || '',
          home_ground: teamData.home_ground || '',
          founded_year: teamData.founded_year?.toString() || '',
          registration_status: teamData.registration_status || '',
        });
      }

      // メンバー一覧取得
      const { data: membersData } = await supabase
        .from('team_members')
        .select('id, user_id, role, is_active, joined_at')
        .eq('team_id', teamId)
        .eq('is_active', true)
        .order('joined_at', { ascending: true });

      if (membersData) {
        // ユーザー情報を個別に取得
        const membersWithUsers = await Promise.all(
          membersData.map(async (member: Omit<TeamMember, 'user'>) => {
            // 注: 実際にはユーザー情報取得のためのAPIが必要
            // 今回は簡略化してemailのみ表示
            return {
              ...member,
              user: null
            };
          })
        );
        setMembers(membersWithUsers);
      }

      // 招待一覧取得（代表のみ）
      if (adminCheck || managerCheck) {
        const { data: invitationsData } = await supabase
          .from('invitations')
          .select('id, email, team_role, status, token, expires_at, created_at')
          .eq('team_id', teamId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        setInvitations(invitationsData || []);
      }
    } catch (err) {
      console.error('データの取得に失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveMessage(null);
      const supabase = createClient();

      const { error } = await supabase
        .from('teams')
        .update({
          hero_image_url: profileForm.hero_image_url || null,
          description: profileForm.description || null,
          concept: profileForm.concept || null,
          philosophy: profileForm.philosophy || null,
          representative_name: profileForm.representative_name || null,
          address: profileForm.address || null,
          website_url: profileForm.website_url || null,
          sns_twitter: profileForm.sns_twitter || null,
          sns_instagram: profileForm.sns_instagram || null,
          sns_facebook: profileForm.sns_facebook || null,
          sns_youtube: profileForm.sns_youtube || null,
          home_ground: profileForm.home_ground || null,
          founded_year: profileForm.founded_year ? parseInt(profileForm.founded_year) : null,
          registration_status: profileForm.registration_status || null,
        })
        .eq('id', teamId);

      if (error) throw error;
      setSaveMessage({ type: 'success', text: 'プロフィールを保存しました' });
      loadData();
    } catch (err: any) {
      console.error('プロフィールの保存に失敗:', err);
      setSaveMessage({ type: 'error', text: 'プロフィールの保存に失敗しました: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    try {
      setInviting(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('ログインが必要です');
        return;
      }

      // 有効期限（7日間）
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { data, error } = await supabase.from('invitations').insert({
        team_id: teamId,
        email: inviteEmail.trim().toLowerCase(),
        team_role: inviteRole,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
      }).select('token').single();

      if (error) throw error;

      alert(`招待を作成しました。\n\n招待URL:\n${window.location.origin}/invite/${data.token}\n\n（このURLを招待者に共有してください）`);
      setInviteEmail('');
      setShowInviteForm(false);
      loadData();
    } catch (err: any) {
      alert('招待の送信に失敗しました: ' + err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm('この招待を取り消しますか？')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) throw error;
      loadData();
    } catch (err: any) {
      alert('招待の取り消しに失敗しました: ' + err.message);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('このメンバーを除外しますか？')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('team_members')
        .update({ is_active: false, left_at: new Date().toISOString() })
        .eq('id', memberId);

      if (error) throw error;
      loadData();
    } catch (err: any) {
      alert('メンバーの除外に失敗しました: ' + err.message);
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
      <div className="flex items-center justify-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">設定</h2>

      {/* タブ切り替え */}
      {isManager && (
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'members'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            メンバー管理
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            チームプロフィール
          </button>
        </div>
      )}

      {/* プロフィール編集タブ */}
      {activeTab === 'profile' && isManager && (
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">チームプロフィール編集</h3>

          {saveMessage && (
            <div className={`mb-4 p-3 rounded-lg ${
              saveMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {saveMessage.text}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            {/* ヒーロー画像 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ヒーロー画像URL
              </label>
              {profileForm.hero_image_url && (
                <div className="mb-2 relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={profileForm.hero_image_url}
                    alt="ヒーロー画像プレビュー"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <input
                type="url"
                value={profileForm.hero_image_url}
                onChange={(e) => setProfileForm({ ...profileForm, hero_image_url: e.target.value })}
                placeholder="https://example.com/hero.jpg"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-gray-500 mt-1">チームページのトップに表示される画像</p>
            </div>

            {/* クラブ概要 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                クラブ概要
              </label>
              <textarea
                value={profileForm.description}
                onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                rows={5}
                placeholder="クラブの歴史や特徴を記入してください"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* チームコンセプト */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                チームコンセプト
              </label>
              <textarea
                value={profileForm.concept}
                onChange={(e) => setProfileForm({ ...profileForm, concept: e.target.value })}
                rows={4}
                placeholder="チームの方針やコンセプトを記入してください"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* チーム理念 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                チーム理念
              </label>
              <textarea
                value={profileForm.philosophy}
                onChange={(e) => setProfileForm({ ...profileForm, philosophy: e.target.value })}
                rows={2}
                placeholder="チームの理念を記入してください"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>

            <hr className="my-6" />

            {/* 基本情報 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  代表者名
                </label>
                <input
                  type="text"
                  value={profileForm.representative_name}
                  onChange={(e) => setProfileForm({ ...profileForm, representative_name: e.target.value })}
                  placeholder="山田 太郎"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  法人格
                </label>
                <input
                  type="text"
                  value={profileForm.registration_status}
                  onChange={(e) => setProfileForm({ ...profileForm, registration_status: e.target.value })}
                  placeholder="NPO法人、一般社団法人など"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  設立年
                </label>
                <input
                  type="number"
                  value={profileForm.founded_year}
                  onChange={(e) => setProfileForm({ ...profileForm, founded_year: e.target.value })}
                  placeholder="2004"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ホームグラウンド
                </label>
                <input
                  type="text"
                  value={profileForm.home_ground}
                  onChange={(e) => setProfileForm({ ...profileForm, home_ground: e.target.value })}
                  placeholder="〇〇公園グラウンド"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  所在地
                </label>
                <input
                  type="text"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  placeholder="神奈川県横浜市〇〇区..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <hr className="my-6" />

            {/* SNS・ウェブサイト */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ウェブサイト
                </label>
                <input
                  type="url"
                  value={profileForm.website_url}
                  onChange={(e) => setProfileForm({ ...profileForm, website_url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter / X
                </label>
                <input
                  type="url"
                  value={profileForm.sns_twitter}
                  onChange={(e) => setProfileForm({ ...profileForm, sns_twitter: e.target.value })}
                  placeholder="https://twitter.com/..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  value={profileForm.sns_instagram}
                  onChange={(e) => setProfileForm({ ...profileForm, sns_instagram: e.target.value })}
                  placeholder="https://instagram.com/..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <input
                  type="url"
                  value={profileForm.sns_facebook}
                  onChange={(e) => setProfileForm({ ...profileForm, sns_facebook: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube
                </label>
                <input
                  type="url"
                  value={profileForm.sns_youtube}
                  onChange={(e) => setProfileForm({ ...profileForm, sns_youtube: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {saving ? '保存中...' : 'プロフィールを保存'}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* メンバー管理タブ */}
      {activeTab === 'members' && (
      <>
        <section className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">メンバー一覧</h3>
            {isManager && (
              <button
                onClick={() => setShowInviteForm(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm"
              >
                メンバーを招待
              </button>
            )}
          </div>

          {members.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              メンバーがいません。招待してください。
            </p>
          ) : (
            <div className="divide-y">
              {members.map((member) => (
                <div key={member.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {member.user?.user_metadata?.full_name || `ユーザー ${member.user_id.slice(0, 8)}...`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getRoleLabel(member.role)} · 参加日: {new Date(member.joined_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  {isManager && member.role !== 'manager' && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      除外
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 招待中 */}
        {isManager && invitations.length > 0 && (
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">招待中</h3>
            <div className="divide-y">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{invitation.email}</p>
                    <p className="text-sm text-gray-500">
                      {getRoleLabel(invitation.team_role)} · 有効期限: {new Date(invitation.expires_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/invite/${invitation.token}`);
                        alert('招待URLをコピーしました');
                      }}
                      className="text-primary hover:text-primary-hover text-sm"
                    >
                      URLコピー
                    </button>
                    <button
                      onClick={() => handleCancelInvitation(invitation.id)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </>
      )}

      {/* 招待モーダル */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">メンバーを招待</h3>
              <button onClick={() => setShowInviteForm(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  placeholder="example@email.com"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  役割 *
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="player">選手</option>
                  <option value="guardian">保護者</option>
                  <option value="coach">コーチ</option>
                </select>
              </div>
              <p className="text-sm text-gray-500">
                招待URLが生成されます。このURLを招待する人に共有してください。
                有効期限は7日間です。
              </p>
              <button
                type="submit"
                disabled={inviting}
                className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {inviting ? '招待中...' : '招待URLを生成'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
