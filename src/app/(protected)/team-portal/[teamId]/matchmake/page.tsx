'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui';
import { Card, CardTitle, CardContent } from '@/components/ui';

type MatchRequest = {
  id: string;
  requesting_team_id: string;
  request_type: 'looking' | 'offering';
  title: string;
  description: string | null;
  preferred_dates: Array<{ date: string; time_slots: string[] }> | null;
  location_preference: string | null;
  location_details: string | null;
  player_count_min: number | null;
  player_count_max: number | null;
  skill_level: string | null;
  status: 'open' | 'matched' | 'closed' | 'cancelled';
  expires_at: string | null;
  created_at: string;
  requesting_team?: {
    id: string;
    name: string;
    short_name: string | null;
    logo_url: string | null;
  };
};

type Team = {
  id: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
};

/**
 * チームポータル - マッチメイクページ
 */
export default function MatchmakePage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [myRequests, setMyRequests] = useState<MatchRequest[]>([]);
  const [openRequests, setOpenRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'myRequests'>('browse');

  // 新規募集フォーム
  const [formData, setFormData] = useState({
    request_type: 'looking' as 'looking' | 'offering',
    title: '',
    description: '',
    preferred_date: '',
    time_slot: 'morning',
    location_preference: 'either',
    location_details: '',
    player_count_min: 8,
    player_count_max: 11,
    skill_level: 'any',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [teamId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // 自チーム情報
      const { data: teamData } = await supabase
        .from('teams')
        .select('id, name, short_name, logo_url')
        .eq('id', teamId)
        .single();
      setMyTeam(teamData);

      // 自チームの募集
      const { data: myData } = await supabase
        .from('match_requests')
        .select('*, requesting_team:teams(id, name, short_name, logo_url)')
        .eq('requesting_team_id', teamId)
        .order('created_at', { ascending: false });
      setMyRequests(myData || []);

      // 他チームのオープン募集
      const { data: openData } = await supabase
        .from('match_requests')
        .select('*, requesting_team:teams(id, name, short_name, logo_url)')
        .eq('status', 'open')
        .neq('requesting_team_id', teamId)
        .order('created_at', { ascending: false });
      setOpenRequests(openData || []);

    } catch (err) {
      console.error('データの取得に失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const preferredDates = formData.preferred_date
        ? [{ date: formData.preferred_date, time_slots: [formData.time_slot] }]
        : null;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 14); // 2週間後に期限切れ

      const { error } = await supabase.from('match_requests').insert({
        requesting_team_id: teamId,
        request_type: formData.request_type,
        title: formData.title,
        description: formData.description || null,
        preferred_dates: preferredDates,
        location_preference: formData.location_preference,
        location_details: formData.location_details || null,
        player_count_min: formData.player_count_min,
        player_count_max: formData.player_count_max,
        skill_level: formData.skill_level,
        status: 'open',
        expires_at: expiresAt.toISOString(),
        created_by: user?.id,
      });

      if (error) throw error;

      setShowCreateModal(false);
      setFormData({
        request_type: 'looking',
        title: '',
        description: '',
        preferred_date: '',
        time_slot: 'morning',
        location_preference: 'either',
        location_details: '',
        player_count_min: 8,
        player_count_max: 11,
        skill_level: 'any',
      });
      await loadData();
    } catch (err: any) {
      alert('募集の作成に失敗しました: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('この募集を取り消しますか？')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('match_requests')
        .update({ status: 'cancelled' })
        .eq('id', requestId);

      if (error) throw error;
      await loadData();
    } catch (err: any) {
      alert('募集の取り消しに失敗しました: ' + err.message);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeSlotLabel = (slot: string) => {
    const labels: Record<string, string> = {
      morning: '午前',
      afternoon: '午後',
      evening: '夕方',
    };
    return labels[slot] || slot;
  };

  const getLocationLabel = (pref: string | null) => {
    const labels: Record<string, string> = {
      home: 'ホーム',
      away: 'アウェイ',
      either: 'どちらでも',
    };
    return pref ? labels[pref] || pref : '未定';
  };

  const getSkillLabel = (level: string | null) => {
    const labels: Record<string, string> = {
      beginner: '初心者',
      intermediate: '中級',
      advanced: '上級',
      any: '指定なし',
    };
    return level ? labels[level] || level : '指定なし';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-green-100 text-green-800',
      matched: 'bg-blue-100 text-blue-800',
      closed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      open: '募集中',
      matched: 'マッチング成立',
      closed: '終了',
      cancelled: '取り消し',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status] || status}
      </span>
    );
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">マッチメイク</h2>
        <Button onClick={() => setShowCreateModal(true)}>
          新規募集
        </Button>
      </div>

      {/* タブ */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'browse'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          募集を探す
        </button>
        <button
          onClick={() => setActiveTab('myRequests')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'myRequests'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          自チームの募集 ({myRequests.length})
        </button>
      </div>

      {/* 募集一覧 */}
      {activeTab === 'browse' ? (
        <div className="space-y-4">
          {openRequests.length === 0 ? (
            <Card padding="lg" className="text-center">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-600">現在、募集中のマッチリクエストはありません</p>
              <p className="text-sm text-gray-500 mt-2">最初の募集を作成してみましょう！</p>
            </Card>
          ) : (
            openRequests.map((request) => (
              <Card key={request.id} padding="md" hover>
                <div className="flex items-start gap-4">
                  {/* チームロゴ */}
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {request.requesting_team?.logo_url ? (
                      <img
                        src={request.requesting_team.logo_url}
                        alt={request.requesting_team.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-lg font-bold text-gray-400">
                        {request.requesting_team?.name?.[0] || '?'}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        request.request_type === 'looking'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {request.request_type === 'looking' ? '対戦相手募集' : '練習試合提供'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {request.requesting_team?.name}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 truncate">{request.title}</h3>

                    {request.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{request.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                      {request.preferred_dates?.[0] && (
                        <span>📅 {formatDate(request.preferred_dates[0].date)} {getTimeSlotLabel(request.preferred_dates[0].time_slots[0])}</span>
                      )}
                      <span>📍 {getLocationLabel(request.location_preference)}</span>
                      <span>👥 {request.player_count_min}〜{request.player_count_max}人</span>
                      <span>⚽ {getSkillLabel(request.skill_level)}</span>
                    </div>
                  </div>

                  <Button size="sm" variant="outline">
                    応募する
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {myRequests.length === 0 ? (
            <Card padding="lg" className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-gray-600">まだ募集を作成していません</p>
              <Button onClick={() => setShowCreateModal(true)} className="mt-4">
                最初の募集を作成
              </Button>
            </Card>
          ) : (
            myRequests.map((request) => (
              <Card key={request.id} padding="md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        request.request_type === 'looking'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {request.request_type === 'looking' ? '対戦相手募集' : '練習試合提供'}
                      </span>
                      {getStatusBadge(request.status)}
                    </div>

                    <h3 className="font-semibold text-gray-900">{request.title}</h3>

                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                      {request.preferred_dates?.[0] && (
                        <span>📅 {formatDate(request.preferred_dates[0].date)}</span>
                      )}
                      <span>📍 {getLocationLabel(request.location_preference)}</span>
                      <span>作成: {formatDate(request.created_at)}</span>
                    </div>
                  </div>

                  {request.status === 'open' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancelRequest(request.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      取り消し
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* 新規募集モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">新規募集を作成</h3>
            </div>

            <form onSubmit={handleCreateRequest} className="p-4 space-y-4">
              {/* 募集タイプ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">募集タイプ</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, request_type: 'looking' })}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                      formData.request_type === 'looking'
                        ? 'bg-orange-100 border-orange-300 text-orange-800'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    対戦相手募集
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, request_type: 'offering' })}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                      formData.request_type === 'offering'
                        ? 'bg-blue-100 border-blue-300 text-blue-800'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    練習試合提供
                  </button>
                </div>
              </div>

              {/* タイトル */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例: 12月の練習試合相手募集中！"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* 詳細 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">詳細</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="チームの特徴や希望する条件など"
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* 希望日程 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">希望日</label>
                  <input
                    type="date"
                    value={formData.preferred_date}
                    onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">時間帯</label>
                  <select
                    value={formData.time_slot}
                    onChange={(e) => setFormData({ ...formData, time_slot: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="morning">午前</option>
                    <option value="afternoon">午後</option>
                    <option value="evening">夕方</option>
                  </select>
                </div>
              </div>

              {/* 場所 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">開催場所</label>
                <select
                  value={formData.location_preference}
                  onChange={(e) => setFormData({ ...formData, location_preference: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="home">ホーム（こちらで開催）</option>
                  <option value="away">アウェイ（相手先で開催）</option>
                  <option value="either">どちらでも</option>
                </select>
              </div>

              {/* 人数 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最少人数</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.player_count_min}
                    onChange={(e) => setFormData({ ...formData, player_count_min: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">最大人数</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={formData.player_count_max}
                    onChange={(e) => setFormData({ ...formData, player_count_max: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* レベル */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">希望レベル</label>
                <select
                  value={formData.skill_level}
                  onChange={(e) => setFormData({ ...formData, skill_level: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="any">指定なし</option>
                  <option value="beginner">初心者</option>
                  <option value="intermediate">中級</option>
                  <option value="advanced">上級</option>
                </select>
              </div>

              {/* ボタン */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowCreateModal(false)}
                >
                  キャンセル
                </Button>
                <Button type="submit" fullWidth loading={submitting}>
                  募集を作成
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
