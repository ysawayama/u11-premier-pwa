'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Team } from '@/types/database';

/**
 * チーム情報編集ページ
 * チーム代表のみアクセス可能
 */
export default function TeamEditPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // フォームの状態
  const [formData, setFormData] = useState({
    hero_image_url: '',
    description: '',
    concept: '',
    philosophy: '',
    training_schedule: '',
    practice_location: '',
    target_age: '',
    monthly_fee: '',
    entry_fee: '',
    achievements: '',
    sns_twitter: '',
    sns_instagram: '',
    sns_facebook: '',
    sns_youtube: '',
    website_url: '',
    contact_form_enabled: true,
    accepting_members: true,
    accepting_matches: true,
  });

  useEffect(() => {
    loadData();
  }, [teamId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // ログインユーザー取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('ログインが必要です');
        return;
      }

      // 権限チェック（RPC経由でis_team_manager_of関数を呼び出し）
      const { data: isManager } = await supabase.rpc('is_team_manager_of', {
        team_uuid: teamId
      });

      if (!isManager) {
        setError('このチームを編集する権限がありません');
        setCanEdit(false);
        return;
      }

      setCanEdit(true);

      // チーム情報取得
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;
      setTeam(teamData);

      // フォームデータ初期化
      setFormData({
        hero_image_url: teamData.hero_image_url || '',
        description: teamData.description || '',
        concept: teamData.concept || '',
        philosophy: teamData.philosophy || '',
        training_schedule: teamData.training_schedule || '',
        practice_location: teamData.practice_location || '',
        target_age: teamData.target_age || '',
        monthly_fee: teamData.monthly_fee || '',
        entry_fee: teamData.entry_fee || '',
        achievements: teamData.achievements || '',
        sns_twitter: teamData.sns_twitter || '',
        sns_instagram: teamData.sns_instagram || '',
        sns_facebook: teamData.sns_facebook || '',
        sns_youtube: teamData.sns_youtube || '',
        website_url: teamData.website_url || '',
        contact_form_enabled: teamData.contact_form_enabled ?? true,
        accepting_members: teamData.accepting_members ?? true,
        accepting_matches: teamData.accepting_matches ?? true,
      });
    } catch (err: any) {
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSuccessMessage(null);
      const supabase = createClient();

      const { error: updateError } = await supabase
        .from('teams')
        .update({
          hero_image_url: formData.hero_image_url || null,
          description: formData.description || null,
          concept: formData.concept || null,
          philosophy: formData.philosophy || null,
          training_schedule: formData.training_schedule || null,
          practice_location: formData.practice_location || null,
          target_age: formData.target_age || null,
          monthly_fee: formData.monthly_fee || null,
          entry_fee: formData.entry_fee || null,
          achievements: formData.achievements || null,
          sns_twitter: formData.sns_twitter || null,
          sns_instagram: formData.sns_instagram || null,
          sns_facebook: formData.sns_facebook || null,
          sns_youtube: formData.sns_youtube || null,
          website_url: formData.website_url || null,
          contact_form_enabled: formData.contact_form_enabled,
          accepting_members: formData.accepting_members,
          accepting_matches: formData.accepting_matches,
        })
        .eq('id', teamId);

      if (updateError) throw updateError;
      setSuccessMessage('保存しました');

      // 3秒後にメッセージをクリア
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

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

  if (error || !canEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || '権限がありません'}</p>
          <Link
            href={`/teams/${teamId}`}
            className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
          >
            チームページに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link href={`/teams/${teamId}`} className="text-primary hover:underline text-sm">
              ← チームページに戻る
            </Link>
            {successMessage && (
              <span className="text-green-600 text-sm font-medium">{successMessage}</span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {team?.name} - プロフィール編集
          </h1>
          <p className="text-gray-600 mt-2">
            チームの公開プロフィールを編集できます。入力内容はチーム一覧や詳細ページで表示されます。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 募集状況 */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">募集状況</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="accepting_members"
                  checked={formData.accepting_members}
                  onChange={handleChange}
                  className="w-5 h-5 rounded text-green-600 focus:ring-green-500"
                />
                <span className="text-gray-700">部員募集中</span>
                <span className="text-sm text-gray-500">（チェックするとバッジが表示されます）</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="accepting_matches"
                  checked={formData.accepting_matches}
                  onChange={handleChange}
                  className="w-5 h-5 rounded text-primary focus:ring-primary"
                />
                <span className="text-gray-700">練習試合募集中</span>
                <span className="text-sm text-gray-500">（チェックするとバッジが表示されます）</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="contact_form_enabled"
                  checked={formData.contact_form_enabled}
                  onChange={handleChange}
                  className="w-5 h-5 rounded text-gray-600 focus:ring-gray-500"
                />
                <span className="text-gray-700">お問い合わせフォームを有効にする</span>
              </label>
            </div>
          </section>

          {/* ヒーロー画像 */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">ヒーロー画像</h2>
            <p className="text-sm text-gray-500 mb-4">
              チームページ上部に表示される大きな画像です。チームの活動風景などがおすすめです。
            </p>
            {formData.hero_image_url && (
              <div className="mb-4 relative h-48 rounded-lg overflow-hidden">
                <Image
                  src={formData.hero_image_url}
                  alt="ヒーロー画像プレビュー"
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <input
              type="url"
              name="hero_image_url"
              value={formData.hero_image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-gray-400 mt-2">
              ※ 画像URLを入力してください。推奨サイズ: 1920x600px以上
            </p>
          </section>

          {/* チーム紹介 */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">チーム紹介</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">チーム紹介文</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="チームの特徴や雰囲気を紹介してください"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">コンセプト</label>
                <textarea
                  name="concept"
                  value={formData.concept}
                  onChange={handleChange}
                  rows={2}
                  placeholder="例: 「楽しみながら上達する」をモットーに活動しています"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">指導方針</label>
                <textarea
                  name="philosophy"
                  value={formData.philosophy}
                  onChange={handleChange}
                  rows={3}
                  placeholder="チームの指導方針や大切にしていることを記載してください"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">実績・受賞歴</label>
                <textarea
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleChange}
                  rows={3}
                  placeholder="過去の大会実績や受賞歴を記載してください"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </section>

          {/* 基本情報 */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">基本情報</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">対象年齢</label>
                <input
                  type="text"
                  name="target_age"
                  value={formData.target_age}
                  onChange={handleChange}
                  placeholder="例: 小学1年生〜6年生"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">練習場所</label>
                <input
                  type="text"
                  name="practice_location"
                  value={formData.practice_location}
                  onChange={handleChange}
                  placeholder="例: ○○小学校グラウンド"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">練習スケジュール</label>
                <textarea
                  name="training_schedule"
                  value={formData.training_schedule}
                  onChange={handleChange}
                  rows={2}
                  placeholder="例: 土曜日 9:00-12:00、日曜日 13:00-16:00"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">月謝</label>
                <input
                  type="text"
                  name="monthly_fee"
                  value={formData.monthly_fee}
                  onChange={handleChange}
                  placeholder="例: 3,000円/月"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">入会費</label>
                <input
                  type="text"
                  name="entry_fee"
                  value={formData.entry_fee}
                  onChange={handleChange}
                  placeholder="例: 5,000円（初回のみ）"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </section>

          {/* SNS・リンク */}
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">SNS・リンク</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ウェブサイト</label>
                <input
                  type="url"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Twitter / X</label>
                  <input
                    type="url"
                    name="sns_twitter"
                    value={formData.sns_twitter}
                    onChange={handleChange}
                    placeholder="https://twitter.com/..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                  <input
                    type="url"
                    name="sns_instagram"
                    value={formData.sns_instagram}
                    onChange={handleChange}
                    placeholder="https://instagram.com/..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                  <input
                    type="url"
                    name="sns_facebook"
                    value={formData.sns_facebook}
                    onChange={handleChange}
                    placeholder="https://facebook.com/..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
                  <input
                    type="url"
                    name="sns_youtube"
                    value={formData.sns_youtube}
                    onChange={handleChange}
                    placeholder="https://youtube.com/..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 保存ボタン */}
          <div className="flex justify-end gap-4">
            <Link
              href={`/teams/${teamId}`}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
