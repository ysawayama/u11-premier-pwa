'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { TeamWithPrefecture, TeamStanding, Player } from '@/types/database';

/**
 * チームエンブレム表示コンポーネント
 */
function TeamLogo({ logoUrl, teamName, size = 32 }: { logoUrl: string | null; teamName: string; size?: number }) {
  if (!logoUrl) {
    return (
      <div
        className="bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-xl font-bold flex-shrink-0"
        style={{ width: size, height: size }}
      >
        {teamName.charAt(0)}
      </div>
    );
  }

  return (
    <Image
      src={logoUrl}
      alt={`${teamName} エンブレム`}
      width={size}
      height={size}
      className="object-contain flex-shrink-0"
    />
  );
}

/**
 * チーム詳細ページ（公開プロフィール）
 */
export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;

  const [team, setTeam] = useState<TeamWithPrefecture | null>(null);
  const [standing, setStanding] = useState<TeamStanding | null>(null);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryType, setInquiryType] = useState<'join' | 'match' | 'general'>('general');
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    loadData();
    checkEditPermission();
  }, [teamId]);

  const checkEditPermission = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 権限チェック
      const { data: isManager } = await supabase.rpc('is_team_manager_of', {
        team_uuid: teamId
      });
      setCanEdit(!!isManager);
    } catch {
      // エラーは無視（編集ボタンが表示されないだけ）
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // チーム情報
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select(`*, prefecture:prefectures(*)`)
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;
      setTeam(teamData);

      // 順位情報
      const { data: standingData } = await supabase
        .from('team_standings')
        .select('*')
        .eq('team_id', teamId)
        .single();
      setStanding(standingData);

      // 選手数
      const { count } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', teamId)
        .eq('is_active', true);
      setPlayerCount(count || 0);

    } catch (err: any) {
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();

    try {
      const { error } = await supabase.from('team_inquiries').insert({
        team_id: teamId,
        inquiry_type: inquiryType,
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone') || null,
        child_name: formData.get('child_name') || null,
        child_grade: formData.get('child_grade') || null,
        message: formData.get('message'),
      });

      if (error) throw error;
      alert('お問い合わせを送信しました。担当者からの連絡をお待ちください。');
      setShowInquiryForm(false);
    } catch (err: any) {
      alert('送信に失敗しました: ' + err.message);
    }
  };

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

  if (error || !team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'チームが見つかりません'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヒーローセクション */}
      <div className="relative">
        {team.hero_image_url ? (
          <div className="h-64 md:h-80 relative">
            <Image
              src={team.hero_image_url}
              alt={team.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
        ) : (
          <div className="h-64 md:h-80 bg-gradient-to-r from-blue-600 to-blue-800" />
        )}

        {/* ヘッダーオーバーレイ */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-start">
            <Link
              href="/teams"
              className="text-white/80 hover:text-white text-sm flex items-center gap-1"
            >
              ← チーム一覧
            </Link>
            <div className="flex items-center gap-2">
              {canEdit && (
                <Link
                  href={`/teams/${team.id}/edit`}
                  className="px-4 py-2 bg-yellow-500/90 backdrop-blur text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
                >
                  編集
                </Link>
              )}
              <Link
                href={`/team-portal/${team.id}`}
                className="px-4 py-2 bg-white/20 backdrop-blur text-white rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
              >
                チームポータル
              </Link>
            </div>
          </div>
        </div>

        {/* チーム情報オーバーレイ */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="max-w-7xl mx-auto flex items-end gap-6">
            <div className="bg-white p-2 rounded-xl shadow-lg">
              <TeamLogo logoUrl={team.logo_url} teamName={team.name} size={80} />
            </div>
            <div className="text-white pb-2">
              <h1 className="text-3xl font-bold drop-shadow-lg">{team.name}</h1>
              <p className="text-white/80">{team.prefecture.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* バッジセクション */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap gap-3">
          {team.accepting_members && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              部員募集中
            </span>
          )}
          {team.accepting_matches && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              練習試合募集中
            </span>
          )}
          {team.founded_year && (
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
              創立 {team.founded_year}年
            </span>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-8">
            {/* チーム紹介 */}
            {(team.description || team.concept) && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">チーム紹介</h2>
                {team.description && (
                  <p className="text-gray-700 whitespace-pre-wrap">{team.description}</p>
                )}
                {team.concept && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">コンセプト</h3>
                    <p className="text-blue-800">{team.concept}</p>
                  </div>
                )}
              </section>
            )}

            {/* 指導方針 */}
            {team.philosophy && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">指導方針</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{team.philosophy}</p>
              </section>
            )}

            {/* 戦績 */}
            {standing && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">今シーズン戦績</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-gray-600">順位</p>
                    <p className="text-3xl font-bold text-yellow-600">{standing.rank || '-'}</p>
                    <p className="text-xs text-gray-500">/ 11チーム</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">試合数</p>
                    <p className="text-3xl font-bold text-gray-900">{standing.matches_played}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">勝/分/敗</p>
                    <p className="text-xl font-bold">
                      <span className="text-green-600">{standing.wins}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-gray-600">{standing.draws}</span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-red-600">{standing.losses}</span>
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">勝点</p>
                    <p className="text-3xl font-bold text-blue-600">{standing.points}</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <Link href="/standings" className="text-blue-600 hover:underline text-sm">
                    全順位表を見る →
                  </Link>
                </div>
              </section>
            )}

            {/* 実績 */}
            {team.achievements && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">実績・受賞歴</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{team.achievements}</p>
              </section>
            )}
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 基本情報カード */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">基本情報</h2>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm text-gray-500">所属選手数</dt>
                  <dd className="font-semibold text-gray-900">{playerCount}名</dd>
                </div>
                {team.target_age && (
                  <div>
                    <dt className="text-sm text-gray-500">対象年齢</dt>
                    <dd className="font-semibold text-gray-900">{team.target_age}</dd>
                  </div>
                )}
                {team.practice_location && (
                  <div>
                    <dt className="text-sm text-gray-500">練習場所</dt>
                    <dd className="font-semibold text-gray-900">{team.practice_location}</dd>
                  </div>
                )}
                {team.training_schedule && (
                  <div>
                    <dt className="text-sm text-gray-500">練習スケジュール</dt>
                    <dd className="font-semibold text-gray-900 whitespace-pre-wrap">{team.training_schedule}</dd>
                  </div>
                )}
                {team.monthly_fee && (
                  <div>
                    <dt className="text-sm text-gray-500">月謝</dt>
                    <dd className="font-semibold text-gray-900">{team.monthly_fee}</dd>
                  </div>
                )}
                {team.entry_fee && (
                  <div>
                    <dt className="text-sm text-gray-500">入会費</dt>
                    <dd className="font-semibold text-gray-900">{team.entry_fee}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* SNSリンク */}
            {(team.sns_twitter || team.sns_instagram || team.sns_facebook || team.sns_youtube || team.website_url) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">リンク</h2>
                <div className="space-y-2">
                  {team.website_url && (
                    <a href={team.website_url} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 text-blue-600 hover:underline">
                      <span>🌐</span> ウェブサイト
                    </a>
                  )}
                  {team.sns_twitter && (
                    <a href={team.sns_twitter} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 text-blue-600 hover:underline">
                      <span>𝕏</span> Twitter / X
                    </a>
                  )}
                  {team.sns_instagram && (
                    <a href={team.sns_instagram} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 text-blue-600 hover:underline">
                      <span>📷</span> Instagram
                    </a>
                  )}
                  {team.sns_facebook && (
                    <a href={team.sns_facebook} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 text-blue-600 hover:underline">
                      <span>📘</span> Facebook
                    </a>
                  )}
                  {team.sns_youtube && (
                    <a href={team.sns_youtube} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 text-blue-600 hover:underline">
                      <span>▶️</span> YouTube
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* お問い合わせボタン */}
            {team.contact_form_enabled && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">お問い合わせ</h2>
                <div className="space-y-2">
                  {team.accepting_members && (
                    <button
                      onClick={() => { setInquiryType('join'); setShowInquiryForm(true); }}
                      className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      入団について問い合わせる
                    </button>
                  )}
                  {team.accepting_matches && (
                    <button
                      onClick={() => { setInquiryType('match'); setShowInquiryForm(true); }}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      練習試合を申し込む
                    </button>
                  )}
                  <button
                    onClick={() => { setInquiryType('general'); setShowInquiryForm(true); }}
                    className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                  >
                    その他のお問い合わせ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* お問い合わせモーダル */}
      {showInquiryForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {inquiryType === 'join' && '入団のお問い合わせ'}
                  {inquiryType === 'match' && '練習試合のお申し込み'}
                  {inquiryType === 'general' && 'お問い合わせ'}
                </h2>
                <button onClick={() => setShowInquiryForm(false)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">お名前 *</label>
                  <input name="name" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス *</label>
                  <input name="email" type="email" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                  <input name="phone" type="tel" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                {inquiryType === 'join' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">お子様のお名前</label>
                      <input name="child_name" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">学年</label>
                      <select name="child_grade" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">選択してください</option>
                        <option value="年中">年中</option>
                        <option value="年長">年長</option>
                        <option value="1年生">1年生</option>
                        <option value="2年生">2年生</option>
                        <option value="3年生">3年生</option>
                        <option value="4年生">4年生</option>
                        <option value="5年生">5年生</option>
                        <option value="6年生">6年生</option>
                      </select>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">メッセージ *</label>
                  <textarea name="message" required rows={4} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={
                      inquiryType === 'join' ? '体験入団を希望します。いつ見学に行けますか？' :
                      inquiryType === 'match' ? '練習試合を希望します。希望日程: ...' :
                      'お問い合わせ内容をご記入ください'
                    }
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  送信する
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
