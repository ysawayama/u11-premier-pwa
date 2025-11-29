'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { getSoccerNotesByPlayer, createSoccerNote, updateSoccerNote, deleteSoccerNote } from '@/lib/api/soccerNotes';
import { getLifeLogsByPlayer } from '@/lib/api/soccerLifeLogs';
import type { Player, TeamSchedule, TeamStandingWithTeam, SoccerNoteWithCoach, SoccerLifeLog } from '@/types/database';

type PlayerPerformance = {
  practice_attendance_count: number;
  matches_played: number;
  goals: number;
  assists: number;
};

type ActiveTab = 'overview' | 'lifelog' | 'note' | 'album';

/**
 * 選手マイページ
 */
export default function MyPlayerPage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const [player, setPlayer] = useState<Player | null>(null);
  const [performance, setPerformance] = useState<PlayerPerformance | null>(null);
  const [upcomingSchedules, setUpcomingSchedules] = useState<TeamSchedule[]>([]);
  const [standings, setStandings] = useState<TeamStandingWithTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // サッカーライフログ関連
  const [lifeLogs, setLifeLogs] = useState<SoccerLifeLog[]>([]);
  const [lifeLogsLoading, setLifeLogsLoading] = useState(false);

  // サッカーノート関連
  const [notes, setNotes] = useState<SoccerNoteWithCoach[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<SoccerNoteWithCoach | null>(null);
  const [noteForm, setNoteForm] = useState({
    title: '',
    what_went_well: '',
    what_to_improve: '',
    next_goal: '',
    self_rating: 3,
  });

  useEffect(() => {
    loadPlayerData();
  }, [teamId]);

  // ライフログタブがアクティブになったらログを読み込む
  useEffect(() => {
    if (activeTab === 'lifelog' && player) {
      loadLifeLogs();
    }
  }, [activeTab, player]);

  // サッカーノートタブがアクティブになったらノートを読み込む
  useEffect(() => {
    if (activeTab === 'note' && player) {
      loadNotes();
    }
  }, [activeTab, player]);

  const loadLifeLogs = async () => {
    if (!player) return;
    try {
      setLifeLogsLoading(true);
      const data = await getLifeLogsByPlayer(player.id);
      setLifeLogs(data);
    } catch (err) {
      console.error('ライフログの読み込みに失敗:', err);
    } finally {
      setLifeLogsLoading(false);
    }
  };

  const loadNotes = async () => {
    if (!player) return;
    try {
      setNotesLoading(true);
      const data = await getSoccerNotesByPlayer(player.id);
      setNotes(data);
    } catch (err) {
      console.error('ノートの読み込みに失敗:', err);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!player) return;
    try {
      if (editingNote) {
        // 更新
        await updateSoccerNote(editingNote.id, {
          title: noteForm.title,
          what_went_well: noteForm.what_went_well,
          what_to_improve: noteForm.what_to_improve,
          next_goal: noteForm.next_goal,
          self_rating: noteForm.self_rating,
        });
      } else {
        // 新規作成
        await createSoccerNote({
          player_id: player.id,
          note_date: new Date().toISOString().split('T')[0],
          title: noteForm.title,
          what_went_well: noteForm.what_went_well,
          what_to_improve: noteForm.what_to_improve,
          next_goal: noteForm.next_goal,
          self_rating: noteForm.self_rating,
        });
      }
      // リセット
      setShowNoteForm(false);
      setEditingNote(null);
      setNoteForm({
        title: '',
        what_went_well: '',
        what_to_improve: '',
        next_goal: '',
        self_rating: 3,
      });
      // 再読み込み
      loadNotes();
    } catch (err) {
      console.error('ノートの保存に失敗:', err);
      alert('保存に失敗しました');
    }
  };

  const handleEditNote = (note: SoccerNoteWithCoach) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title || '',
      what_went_well: note.what_went_well || '',
      what_to_improve: note.what_to_improve || '',
      next_goal: note.next_goal || '',
      self_rating: note.self_rating || 3,
    });
    setShowNoteForm(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('このノートを削除しますか？')) return;
    try {
      await deleteSoccerNote(noteId);
      loadNotes();
    } catch (err) {
      console.error('削除に失敗:', err);
      alert('削除に失敗しました');
    }
  };

  const loadPlayerData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // ログインユーザー取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('ログインが必要です');
        return;
      }

      // 自分の選手情報を取得
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (playerError || !playerData) {
        setError('選手情報が見つかりません。チーム代表に登録を依頼してください。');
        return;
      }

      setPlayer(playerData as Player);

      // パフォーマンス統計を取得
      const { data: statsData } = await supabase
        .from('player_stats')
        .select('matches_played, goals, assists')
        .eq('player_id', playerData.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // 練習参加回数を取得
      const { count: attendanceCount } = await supabase
        .from('attendance')
        .select('id', { count: 'exact', head: true })
        .eq('player_id', playerData.id)
        .eq('status', 'attending');

      setPerformance({
        practice_attendance_count: attendanceCount || 0,
        matches_played: statsData?.matches_played || 0,
        goals: statsData?.goals || 0,
        assists: statsData?.assists || 0,
      });

      // 直近のスケジュールを取得
      const { data: schedulesData } = await supabase
        .from('team_schedules')
        .select('*')
        .eq('team_id', teamId)
        .gte('start_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true })
        .limit(5);

      setUpcomingSchedules(schedulesData || []);

      // チーム順位を取得
      const { data: standingsData } = await supabase
        .from('team_standings')
        .select(`
          *,
          team:teams(id, name, logo_url)
        `)
        .order('points', { ascending: false })
        .limit(10);

      setStandings((standingsData || []) as TeamStandingWithTeam[]);

    } catch (err) {
      console.error('データの取得に失敗:', err);
      setError('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getPositionLabel = (position: string | null) => {
    switch (position) {
      case 'GK': return 'ゴールキーパー';
      case 'DF': return 'ディフェンダー';
      case 'MF': return 'ミッドフィールダー';
      case 'FW': return 'フォワード';
      default: return position || '未設定';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">{error || '選手情報が見つかりません'}</p>
        <Link
          href={`/team-portal/${teamId}`}
          className="mt-4 inline-block text-primary hover:underline"
        >
          チームポータルに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-r from-navy-light to-navy rounded-xl sm:rounded-2xl overflow-hidden">
        {player.hero_image_url && (
          <div className="relative h-32 sm:h-48 w-full">
            <Image
              src={player.hero_image_url}
              alt="ヒーロー画像"
              fill
              className="object-cover opacity-30"
            />
          </div>
        )}
        <div className={`p-4 sm:p-6 ${player.hero_image_url ? '-mt-16 sm:-mt-24 relative' : ''}`}>
          <div className="flex items-end gap-3 sm:gap-6">
            {/* 選手写真 */}
            <div className="relative flex-shrink-0">
              {player.photo_url ? (
                <Image
                  src={player.photo_url}
                  alt={`${player.family_name} ${player.given_name}`}
                  width={80}
                  height={80}
                  className="rounded-full border-3 sm:border-4 border-white shadow-lg object-cover sm:w-[120px] sm:h-[120px]"
                />
              ) : (
                <div className="w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] rounded-full border-3 sm:border-4 border-white shadow-lg bg-gray-200 flex items-center justify-center text-2xl sm:text-4xl font-bold text-gray-500">
                  {player.family_name.charAt(0)}
                </div>
              )}
              {player.uniform_number && (
                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-7 h-7 sm:w-10 sm:h-10 bg-yellow-400 rounded-full flex items-center justify-center text-sm sm:text-lg font-bold text-gray-900 shadow-md">
                  {player.uniform_number}
                </div>
              )}
            </div>

            {/* 選手情報 */}
            <div className="flex-1 text-white pb-1 sm:pb-2 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold truncate">
                {player.family_name} {player.given_name}
              </h1>
              <p className="text-blue-200 text-xs sm:text-sm truncate">
                {player.family_name_kana} {player.given_name_kana}
              </p>
              <div className="mt-1 sm:mt-2 flex flex-wrap gap-1 sm:gap-2">
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 rounded-full text-xs sm:text-sm">
                  {getPositionLabel(player.position)}
                </span>
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 rounded-full text-xs sm:text-sm">
                  {player.grade}年生
                </span>
                {player.height && (
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 rounded-full text-xs sm:text-sm hidden sm:inline-flex">
                    {player.height}cm
                  </span>
                )}
                {player.weight && (
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 rounded-full text-xs sm:text-sm hidden sm:inline-flex">
                    {player.weight}kg
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto scrollbar-hide">
        {[
          { key: 'overview', label: 'ホーム', icon: '🏠' },
          { key: 'lifelog', label: 'ライフログ', icon: '📸' },
          { key: 'note', label: 'ノート', icon: '📝' },
          { key: 'album', label: 'アルバム', icon: '📷' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as ActiveTab)}
            className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] flex items-center justify-center ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="sm:hidden mr-1">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.slice(0, 4)}</span>
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* 左カラム */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* パフォーマンス */}
            <section className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">パフォーマンス</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl sm:text-3xl font-bold text-primary">{performance?.practice_attendance_count || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">練習参加</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">{performance?.matches_played || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">出場試合</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg">
                  <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{performance?.goals || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">ゴール</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">{performance?.assists || 0}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">アシスト</p>
                </div>
              </div>
            </section>

            {/* 自己紹介 */}
            {player.bio && (
              <section className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">自己紹介</h2>
                <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{player.bio}</p>
              </section>
            )}

            {/* チーム順位表 */}
            {standings.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">チーム順位</h2>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full text-xs sm:text-sm min-w-[300px]">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-2 w-8 sm:w-12 px-2 sm:px-0">#</th>
                        <th className="pb-2 px-2 sm:px-0">チーム</th>
                        <th className="pb-2 text-center">試</th>
                        <th className="pb-2 text-center">勝</th>
                        <th className="pb-2 text-center hidden sm:table-cell">分</th>
                        <th className="pb-2 text-center hidden sm:table-cell">負</th>
                        <th className="pb-2 text-center">点</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((standing, index) => (
                        <tr
                          key={standing.id}
                          className={`border-b last:border-0 ${standing.team_id === teamId ? 'bg-blue-50 font-medium' : ''}`}
                        >
                          <td className="py-2 px-2 sm:px-0">{index + 1}</td>
                          <td className="py-2 px-2 sm:px-0">
                            <div className="flex items-center gap-1 sm:gap-2">
                              {standing.team?.logo_url && (
                                <Image
                                  src={standing.team.logo_url}
                                  alt=""
                                  width={16}
                                  height={16}
                                  className="object-contain sm:w-5 sm:h-5"
                                />
                              )}
                              <span className="truncate max-w-[80px] sm:max-w-[120px]">{standing.team?.name}</span>
                            </div>
                          </td>
                          <td className="py-2 text-center">{standing.matches_played}</td>
                          <td className="py-2 text-center">{standing.wins}</td>
                          <td className="py-2 text-center hidden sm:table-cell">{standing.draws}</td>
                          <td className="py-2 text-center hidden sm:table-cell">{standing.losses}</td>
                          <td className="py-2 text-center font-semibold">{standing.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          {/* 右カラム */}
          <div className="space-y-4 sm:space-y-6">
            {/* 直近のスケジュール */}
            <section className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">直近の予定</h2>
              {upcomingSchedules.length === 0 ? (
                <p className="text-gray-500 text-xs sm:text-sm text-center py-4">
                  予定されているイベントはありません
                </p>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {upcomingSchedules.map((schedule) => (
                    <div key={schedule.id} className="p-2 sm:p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{schedule.title}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                            {formatDate(schedule.start_datetime)} {formatTime(schedule.start_datetime)}
                          </p>
                          {schedule.location && (
                            <p className="text-[10px] sm:text-xs text-gray-500 truncate">{schedule.location}</p>
                          )}
                        </div>
                        <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs flex-shrink-0 ${
                          schedule.event_type === 'match' ? 'bg-red-100 text-red-700' :
                          schedule.event_type === 'practice' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {schedule.event_type === 'match' ? '試合' :
                           schedule.event_type === 'practice' ? '練習' :
                           schedule.event_type === 'meeting' ? 'ミーティング' : 'その他'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href={`/team-portal/${teamId}/schedule`}
                className="mt-3 sm:mt-4 block text-center text-xs sm:text-sm text-primary hover:underline py-2"
              >
                スケジュール全体を見る
              </Link>
            </section>

            {/* クイックアクション */}
            <section className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">クイックアクション</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('lifelog')}
                  className="w-full py-3 px-3 sm:px-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs sm:text-sm font-medium text-left min-h-[48px]"
                >
                  + ライフログを記録
                </button>
                <button
                  onClick={() => setActiveTab('note')}
                  className="w-full py-3 px-3 sm:px-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs sm:text-sm font-medium text-left min-h-[48px]"
                >
                  + サッカーノートを書く
                </button>
                <button
                  onClick={() => setActiveTab('album')}
                  className="w-full py-3 px-3 sm:px-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-xs sm:text-sm font-medium text-left min-h-[48px]"
                >
                  + アルバムに追加
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {activeTab === 'lifelog' && (
        <div className="space-y-4 sm:space-y-6">
          {/* ヘッダー */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-4 sm:p-6 text-white">
            <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">サッカーライフログ</h2>
            <p className="text-green-100 text-sm sm:text-base">サッカーを始めてからの思い出と成長の記録</p>
            {player?.date_of_birth && (
              <p className="text-xs sm:text-sm text-green-200 mt-1 sm:mt-2">
                {new Date().getFullYear() - new Date(player.date_of_birth).getFullYear()}歳 / サッカー歴 {new Date().getFullYear() - 2019}年目
              </p>
            )}
          </div>

          {lifeLogsLoading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
            </div>
          ) : lifeLogs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📸</div>
              <p className="text-gray-500 mb-2 sm:mb-4 text-sm sm:text-base">まだ思い出が記録されていません</p>
              <p className="text-xs sm:text-sm text-gray-400">サッカー人生の大切な瞬間を残していきましょう</p>
            </div>
          ) : (
            <div className="relative">
              {/* タイムライン */}
              <div className="absolute left-4 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 via-blue-400 to-purple-400"></div>

              <div className="space-y-4 sm:space-y-6">
                {(() => {
                  // 年ごとにグループ化
                  const logsByYear: Record<string, typeof lifeLogs> = {};
                  lifeLogs.forEach((log) => {
                    const year = new Date(log.log_date).getFullYear().toString();
                    if (!logsByYear[year]) logsByYear[year] = [];
                    logsByYear[year].push(log);
                  });

                  // 年を降順でソート
                  const years = Object.keys(logsByYear).sort((a, b) => Number(b) - Number(a));

                  return years.map((year) => {
                    const birthYear = player?.date_of_birth ? new Date(player.date_of_birth).getFullYear() : 2014;
                    const age = Number(year) - birthYear;

                    return (
                      <div key={year} className="relative">
                        {/* 年ラベル */}
                        <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
                          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg z-10 text-xs sm:text-base">
                            {age}歳
                          </div>
                          <div>
                            <span className="text-base sm:text-lg font-bold text-gray-900">{year}年</span>
                            <span className="text-xs sm:text-sm text-gray-500 ml-1 sm:ml-2 hidden sm:inline">
                              {age === 5 && 'サッカーを始めた年'}
                              {age === 7 && 'チーム入団'}
                              {age === 10 && 'U11プレミアリーグ'}
                            </span>
                          </div>
                        </div>

                        {/* その年の思い出 */}
                        <div className="ml-10 sm:ml-16 space-y-3 sm:space-y-4">
                          {logsByYear[year].map((log) => {
                            const typeEmoji: Record<string, string> = {
                              match: '🏆',
                              training: '💪',
                              study: '📺',
                              other: '⭐',
                            };

                            return (
                              <div
                                key={log.id}
                                className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                              >
                                {/* 画像があれば表示 */}
                                {log.image_urls && log.image_urls.length > 0 && (
                                  <div className="h-32 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <div className="text-center text-gray-400">
                                      <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">📷</div>
                                      <p className="text-xs sm:text-sm">思い出の写真</p>
                                    </div>
                                  </div>
                                )}

                                <div className="p-3 sm:p-4">
                                  <div className="flex items-start justify-between mb-1 sm:mb-2">
                                    <div>
                                      <span className="text-lg sm:text-2xl mr-1 sm:mr-2">{typeEmoji[log.log_type] || '📝'}</span>
                                      <span className="text-xs sm:text-sm text-gray-500">
                                        {new Date(log.log_date).toLocaleDateString('ja-JP', {
                                          month: 'long',
                                          day: 'numeric',
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 sm:mb-2">{log.title}</h3>
                                  {log.content && (
                                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">{log.content}</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'note' && (
        <div className="space-y-4 sm:space-y-6">
          {/* ノート作成/編集フォーム */}
          {showNoteForm ? (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                {editingNote ? 'ノートを編集' : '新規サッカーノート'}
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">タイトル</label>
                  <input
                    type="text"
                    value={noteForm.title}
                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                    placeholder="今日の練習、試合など"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">良かった点</label>
                  <textarea
                    value={noteForm.what_went_well}
                    onChange={(e) => setNoteForm({ ...noteForm, what_went_well: e.target.value })}
                    placeholder="今日うまくいったこと、成長を感じたこと"
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">改善点</label>
                  <textarea
                    value={noteForm.what_to_improve}
                    onChange={(e) => setNoteForm({ ...noteForm, what_to_improve: e.target.value })}
                    placeholder="もっと良くなりたいこと、課題"
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">次の目標</label>
                  <textarea
                    value={noteForm.next_goal}
                    onChange={(e) => setNoteForm({ ...noteForm, next_goal: e.target.value })}
                    placeholder="次はこうする！という目標"
                    rows={2}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">自己評価</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setNoteForm({ ...noteForm, self_rating: rating })}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-base sm:text-lg font-medium transition-colors min-h-[44px] min-w-[44px] ${
                          noteForm.self_rating === rating
                            ? 'bg-yellow-400 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">1:まだまだ ～ 5:とても良かった</p>
                </div>

                <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <button
                    onClick={handleSaveNote}
                    className="flex-1 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm sm:text-base min-h-[48px]"
                  >
                    保存する
                  </button>
                  <button
                    onClick={() => {
                      setShowNoteForm(false);
                      setEditingNote(null);
                      setNoteForm({
                        title: '',
                        what_went_well: '',
                        what_to_improve: '',
                        next_goal: '',
                        self_rating: 3,
                      });
                    }}
                    className="px-4 sm:px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base min-h-[48px]"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">サッカーノート</h2>
                <button
                  onClick={() => setShowNoteForm(true)}
                  className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-xs sm:text-sm min-h-[44px]"
                >
                  + 新規ノート
                </button>
              </div>

              {notesLoading ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">まだノートがありません</p>
                  <button
                    onClick={() => setShowNoteForm(true)}
                    className="text-primary hover:underline text-sm sm:text-base"
                  >
                    最初のノートを書いてみよう！
                  </button>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            {note.title || new Date(note.note_date).toLocaleDateString('ja-JP')}
                          </h3>
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            {new Date(note.note_date).toLocaleDateString('ja-JP', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                          {note.self_rating && (
                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-yellow-100 text-yellow-700 rounded text-xs sm:text-sm font-medium">
                              {note.self_rating}/5
                            </span>
                          )}
                          {note.is_reviewed && (
                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-100 text-green-700 rounded text-[10px] sm:text-xs">
                              コメント済
                            </span>
                          )}
                        </div>
                      </div>

                      {note.what_went_well && (
                        <div className="mb-2">
                          <p className="text-[10px] sm:text-xs font-medium text-green-600 mb-0.5 sm:mb-1">良かった点</p>
                          <p className="text-xs sm:text-sm text-gray-700">{note.what_went_well}</p>
                        </div>
                      )}

                      {note.what_to_improve && (
                        <div className="mb-2">
                          <p className="text-[10px] sm:text-xs font-medium text-orange-600 mb-0.5 sm:mb-1">改善点</p>
                          <p className="text-xs sm:text-sm text-gray-700">{note.what_to_improve}</p>
                        </div>
                      )}

                      {note.next_goal && (
                        <div className="mb-2">
                          <p className="text-[10px] sm:text-xs font-medium text-primary mb-0.5 sm:mb-1">次の目標</p>
                          <p className="text-xs sm:text-sm text-gray-700">{note.next_goal}</p>
                        </div>
                      )}

                      {/* コーチからのコメント */}
                      {note.coach_comment && (
                        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                            <span className="text-purple-600 text-xs sm:text-sm font-medium">
                              コーチからのコメント
                            </span>
                            {note.coach_commented_at && (
                              <span className="text-[10px] sm:text-xs text-gray-500">
                                {new Date(note.coach_commented_at).toLocaleDateString('ja-JP')}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-gray-700">{note.coach_comment}</p>
                        </div>
                      )}

                      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 flex gap-3 sm:gap-4">
                        <button
                          onClick={() => handleEditNote(note)}
                          className="text-xs sm:text-sm text-primary hover:underline py-1 min-h-[32px]"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-xs sm:text-sm text-red-600 hover:underline py-1 min-h-[32px]"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'album' && (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">マイアルバム</h2>
            <button className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-xs sm:text-sm min-h-[44px]">
              + アルバム作成
            </button>
          </div>
          <p className="text-gray-500 text-center py-8 sm:py-12 text-sm sm:text-base">
            アルバム機能は現在準備中です
          </p>
        </div>
      )}
    </div>
  );
}
