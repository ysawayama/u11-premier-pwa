'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/stores/authStore';
import type { MatchWithTeams, MatchStatus, Team } from '@/types/database';
import PageWrapper from '@/components/layout/PageWrapper';
import TeamBadge from '@/components/common/TeamBadge';
import { ClipboardList, Users, Play, CheckCircle } from 'lucide-react';

// デモ用の仮想試合データ
const createDemoMatch = (myTeam: Team, opponentTeam: Team): MatchWithTeams => ({
  id: 'demo-match-001',
  season_id: 'demo-season',
  match_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1週間後
  venue: '横浜市立大豆戸小学校',
  match_type: 'league',
  round: '第15節',
  home_team_id: myTeam.id,
  away_team_id: opponentTeam.id,
  home_score: null,
  away_score: null,
  status: 'scheduled',
  weather: null,
  temperature: null,
  attendance: null,
  referee: null,
  notes: null,
  created_by: null,
  updated_by: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  home_team: myTeam,
  away_team: opponentTeam,
});

/**
 * 試合運営ページ（コーチ・管理者専用）
 * - 自チームの試合のみ表示
 * - メンバー選出へ進む
 * - 試合記録へ進む
 */
export default function MatchOperationsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus | 'all'>('scheduled');

  // 権限チェック
  useEffect(() => {
    if (user && user.user_type !== 'coach' && user.user_type !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // 自チーム（大豆戸FC）を取得
      const MY_TEAM_NAME = '大豆戸FC';
      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('name', MY_TEAM_NAME)
        .single();

      if (!teamData) {
        setError('チーム情報が見つかりません');
        return;
      }
      setMyTeam(teamData);

      // 自チームの試合のみを取得
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(*),
          away_team:teams!matches_away_team_id_fkey(*)
        `)
        .or(`home_team_id.eq.${teamData.id},away_team_id.eq.${teamData.id}`)
        .order('match_date', { ascending: true });

      if (matchesError) throw matchesError;

      let myMatches = (matchesData || []) as MatchWithTeams[];

      // 予定の試合がない場合は、デモ用の仮想試合を追加
      const hasScheduledMatch = myMatches.some((m) => m.status === 'scheduled');
      if (!hasScheduledMatch) {
        // 対戦相手として横浜ジュニオールSCを取得
        const { data: opponentTeam } = await supabase
          .from('teams')
          .select('*')
          .eq('name', '横浜ジュニオールSC')
          .single();

        if (opponentTeam) {
          const demoMatch = createDemoMatch(teamData, opponentTeam);
          myMatches = [demoMatch, ...myMatches];
        }
      }

      setMatches(myMatches);
    } catch (err: any) {
      setError(err.message || '試合情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // フィルター処理
  const filteredMatches = matches.filter((match) => {
    return selectedStatus === 'all' || match.status === selectedStatus;
  });

  // ステータス表示用のラベルと色
  const getStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-green-100 text-green-800';
      case 'finished':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'postponed':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: MatchStatus) => {
    switch (status) {
      case 'scheduled':
        return '予定';
      case 'in_progress':
        return '進行中';
      case 'finished':
        return '終了';
      case 'cancelled':
        return '中止';
      case 'postponed':
        return '延期';
      default:
        return status;
    }
  };

  // ヘッダーコンポーネント
  const headerContent = (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ClipboardList size={24} />
          試合運営
        </h1>
        <p className="text-xs text-white/70 mt-0.5">
          {myTeam?.name || 'マイチーム'}の試合
        </p>
      </div>
      <Link
        href="/dashboard"
        className="text-sm text-white/80 hover:text-white transition-colors"
      >
        ← ダッシュボード
      </Link>
    </div>
  );

  if (loading) {
    return (
      <PageWrapper header={headerContent}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper header={headerContent}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadMatches}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
            >
              再読み込み
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper header={headerContent}>
      {/* フロー説明 */}
      <div className="mb-6 p-4 bg-blue-50 rounded-xl">
        <h2 className="text-sm font-bold text-blue-900 mb-2">試合当日の流れ</h2>
        <div className="flex items-center gap-2 text-xs text-blue-700">
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold">1</span>
            <span>メンバー選出</span>
          </div>
          <span className="text-blue-300">→</span>
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold">2</span>
            <span>本部提出</span>
          </div>
          <span className="text-blue-300">→</span>
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold">3</span>
            <span>試合記録</span>
          </div>
          <span className="text-blue-300">→</span>
          <div className="flex items-center gap-1">
            <span className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-blue-800 font-bold">4</span>
            <span>結果反映</span>
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="flex gap-2 flex-wrap mb-4 pb-4 border-b border-gray-100">
        <button
          onClick={() => setSelectedStatus('scheduled')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedStatus === 'scheduled'
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          予定 ({matches.filter((m) => m.status === 'scheduled').length})
        </button>
        <button
          onClick={() => setSelectedStatus('in_progress')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedStatus === 'in_progress'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          進行中 ({matches.filter((m) => m.status === 'in_progress').length})
        </button>
        <button
          onClick={() => setSelectedStatus('finished')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedStatus === 'finished'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          終了 ({matches.filter((m) => m.status === 'finished').length})
        </button>
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedStatus === 'all'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          全て ({matches.length})
        </button>
      </div>

      {/* 試合リスト */}
      {filteredMatches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            {selectedStatus !== 'all'
              ? 'フィルター条件に一致する試合がありません'
              : '試合が登録されていません'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map((match) => (
            <div
              key={match.id}
              className="bg-gray-50 rounded-xl p-4"
            >
              {/* 試合情報ヘッダー */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                      match.status
                    )}`}
                  >
                    {getStatusLabel(match.status)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(match.match_date).toLocaleDateString('ja-JP', {
                      month: 'numeric',
                      day: 'numeric',
                      weekday: 'short',
                    })}{' '}
                    {new Date(match.match_date).toLocaleTimeString('ja-JP', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {match.status === 'in_progress' && (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      LIVE
                    </span>
                  )}
                </div>
              </div>

              {/* 対戦カード */}
              <div className="flex items-center justify-between mb-3">
                {/* ホームチーム */}
                <div className="flex-1">
                  <TeamBadge
                    name={match.home_team.name}
                    logoUrl={match.home_team.logo_url}
                    size="sm"
                    logoPosition="right"
                    textAlign="right"
                  />
                </div>

                {/* スコア */}
                <div className="flex items-center gap-3 px-4">
                  <span className="text-2xl font-bold text-gray-900 w-8 text-right">
                    {match.home_score ?? '-'}
                  </span>
                  <span className="text-lg text-gray-400">-</span>
                  <span className="text-2xl font-bold text-gray-900 w-8 text-left">
                    {match.away_score ?? '-'}
                  </span>
                </div>

                {/* アウェイチーム */}
                <div className="flex-1">
                  <TeamBadge
                    name={match.away_team.name}
                    logoUrl={match.away_team.logo_url}
                    size="sm"
                    logoPosition="left"
                    textAlign="left"
                  />
                </div>
              </div>

              {match.venue && (
                <p className="text-xs text-gray-500 text-center mb-3">
                  会場: {match.venue}
                </p>
              )}

              {/* アクションボタン */}
              <div className="flex gap-2">
                {match.status === 'scheduled' && (
                  <>
                    <Link
                      href={`/admin/match-operations/${match.id}/roster`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <Users size={16} />
                      メンバー選出
                    </Link>
                    <Link
                      href={`/admin/match-operations/${match.id}/record`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium cursor-not-allowed"
                    >
                      <Play size={16} />
                      試合記録
                    </Link>
                  </>
                )}
                {match.status === 'in_progress' && (
                  <>
                    <Link
                      href={`/admin/match-operations/${match.id}/roster`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium"
                    >
                      <CheckCircle size={16} />
                      メンバー確認
                    </Link>
                    <Link
                      href={`/admin/match-operations/${match.id}/record`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <Play size={16} />
                      試合記録
                    </Link>
                  </>
                )}
                {match.status === 'finished' && (
                  <Link
                    href={`/admin/match-operations/${match.id}/record`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    <CheckCircle size={16} />
                    試合結果を確認
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
