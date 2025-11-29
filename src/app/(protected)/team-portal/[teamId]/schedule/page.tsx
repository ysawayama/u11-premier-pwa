'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type EventType = 'match' | 'practice' | 'meeting' | 'event' | 'other';
type ViewMode = 'list' | 'calendar';

type Schedule = {
  id: string;
  team_id: string;
  title: string;
  description: string | null;
  event_type: EventType;
  start_datetime: string;
  end_datetime: string | null;
  location: string | null;
  location_url: string | null;
  is_all_day: boolean;
  is_cancelled: boolean;
  cancellation_reason: string | null;
  notes: string | null;
  created_at: string;
};

type Match = {
  id: string;
  match_date: string;
  venue: string;
  match_type: string;
  round: string | null;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
  home_team: { id: string; name: string; logo_url: string | null };
  away_team: { id: string; name: string; logo_url: string | null };
};

// 統合スケジュールアイテム
type ScheduleItem = {
  id: string;
  type: 'schedule' | 'match';
  datetime: string;
  title: string;
  location: string | null;
  eventType: EventType;
  isCancelled: boolean;
  originalData: Schedule | Match;
};

const EVENT_TYPE_CONFIG: Record<EventType, { label: string; color: string; bgColor: string; dotColor: string }> = {
  match: { label: '試合', color: 'text-red-700', bgColor: 'bg-red-100', dotColor: 'bg-red-500' },
  practice: { label: '練習', color: 'text-green-700', bgColor: 'bg-green-100', dotColor: 'bg-green-500' },
  meeting: { label: 'ミーティング', color: 'text-purple-700', bgColor: 'bg-purple-100', dotColor: 'bg-purple-500' },
  event: { label: 'イベント', color: 'text-blue-700', bgColor: 'bg-blue-100', dotColor: 'bg-blue-500' },
  other: { label: 'その他', color: 'text-gray-700', bgColor: 'bg-gray-100', dotColor: 'bg-gray-500' },
};

/**
 * チームポータル - スケジュールページ
 * リスト表示とカレンダー表示を切り替え可能
 * チームの予定と試合予定を統合表示
 */
export default function SchedulePage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showForm, setShowForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // フォームの状態
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'practice' as EventType,
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    location: '',
    location_url: '',
    is_all_day: false,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, [teamId, selectedMonth]);

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // 権限確認（Webマスター/管理者 OR チーム代表）
      const { data: isAdminOrAbove } = await supabase.rpc('is_admin_or_above');
      const { data: isTeamManager } = await supabase.rpc('is_team_manager_of', {
        team_uuid: teamId
      });
      setCanEdit(!!isAdminOrAbove || !!isTeamManager);

      // 選択月の範囲を計算
      const [year, month] = selectedMonth.split('-').map(Number);
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59);

      // チームスケジュール取得
      const { data: schedulesData, error: scheduleError } = await supabase
        .from('team_schedules')
        .select('*')
        .eq('team_id', teamId)
        .gte('start_datetime', startOfMonth.toISOString())
        .lte('start_datetime', endOfMonth.toISOString())
        .order('start_datetime', { ascending: true });

      if (scheduleError) throw scheduleError;
      setSchedules(schedulesData || []);

      // このチームの試合予定を取得（ホームまたはアウェイ）
      const { data: matchesData, error: matchError } = await supabase
        .from('matches')
        .select(`
          id,
          match_date,
          venue,
          match_type,
          round,
          home_team_id,
          away_team_id,
          home_score,
          away_score,
          status,
          home_team:teams!matches_home_team_id_fkey(id, name, logo_url),
          away_team:teams!matches_away_team_id_fkey(id, name, logo_url)
        `)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .gte('match_date', startOfMonth.toISOString())
        .lte('match_date', endOfMonth.toISOString())
        .order('match_date', { ascending: true });

      if (matchError) throw matchError;
      setMatches((matchesData || []).map((m: Match) => ({
        ...m,
        home_team: m.home_team as unknown as Match['home_team'],
        away_team: m.away_team as unknown as Match['away_team'],
      })));
    } catch (err) {
      console.error('スケジュールの取得に失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  // スケジュールと試合を統合してソート
  const getCombinedItems = (): ScheduleItem[] => {
    const items: ScheduleItem[] = [];

    // チームスケジュールを変換
    schedules.forEach(schedule => {
      items.push({
        id: `schedule-${schedule.id}`,
        type: 'schedule',
        datetime: schedule.start_datetime,
        title: schedule.title,
        location: schedule.location,
        eventType: schedule.event_type,
        isCancelled: schedule.is_cancelled,
        originalData: schedule,
      });
    });

    // 試合を変換
    matches.forEach(match => {
      const isHome = match.home_team_id === teamId;
      const opponent = isHome ? match.away_team : match.home_team;
      const homeAway = isHome ? 'vs' : '@';

      items.push({
        id: `match-${match.id}`,
        type: 'match',
        datetime: match.match_date,
        title: `${homeAway} ${opponent.name}`,
        location: match.venue,
        eventType: 'match',
        isCancelled: match.status === 'cancelled',
        originalData: match,
      });
    });

    // 日時でソート
    return items.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
  };

  const combinedItems = getCombinedItems();

  // 日付でグループ化
  const itemsByDate = combinedItems.reduce((acc, item) => {
    const dateKey = new Date(item.datetime).toISOString().split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);
    return acc;
  }, {} as Record<string, ScheduleItem[]>);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      event_type: 'practice',
      start_date: '',
      start_time: '',
      end_date: '',
      end_time: '',
      location: '',
      location_url: '',
      is_all_day: false,
      notes: '',
    });
    setEditingSchedule(null);
  };

  const openEditForm = (schedule: Schedule) => {
    const startDate = new Date(schedule.start_datetime);
    const endDate = schedule.end_datetime ? new Date(schedule.end_datetime) : null;

    setFormData({
      title: schedule.title,
      description: schedule.description || '',
      event_type: schedule.event_type,
      start_date: startDate.toISOString().split('T')[0],
      start_time: schedule.is_all_day ? '' : startDate.toTimeString().slice(0, 5),
      end_date: endDate ? endDate.toISOString().split('T')[0] : '',
      end_time: endDate && !schedule.is_all_day ? endDate.toTimeString().slice(0, 5) : '',
      location: schedule.location || '',
      location_url: schedule.location_url || '',
      is_all_day: schedule.is_all_day,
      notes: schedule.notes || '',
    });
    setEditingSchedule(schedule);
    setShowForm(true);
  };

  const openNewFormWithDate = (date: string) => {
    resetForm();
    setFormData(prev => ({ ...prev, start_date: date }));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const startDatetime = formData.is_all_day
        ? `${formData.start_date}T00:00:00`
        : `${formData.start_date}T${formData.start_time}:00`;

      const endDatetime = formData.end_date
        ? (formData.is_all_day
          ? `${formData.end_date}T23:59:59`
          : `${formData.end_date}T${formData.end_time || '23:59'}:00`)
        : null;

      const scheduleData = {
        team_id: teamId,
        title: formData.title,
        description: formData.description || null,
        event_type: formData.event_type,
        start_datetime: startDatetime,
        end_datetime: endDatetime,
        location: formData.location || null,
        location_url: formData.location_url || null,
        is_all_day: formData.is_all_day,
        notes: formData.notes || null,
        created_by: user?.id,
      };

      if (editingSchedule) {
        const { error } = await supabase
          .from('team_schedules')
          .update(scheduleData)
          .eq('id', editingSchedule.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('team_schedules')
          .insert(scheduleData);
        if (error) throw error;
      }

      setShowForm(false);
      resetForm();
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '不明なエラー';
      alert('保存に失敗しました: ' + message);
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('この予定を削除しますか？')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('team_schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '不明なエラー';
      alert('削除に失敗しました: ' + message);
    }
  };

  const handleCancel = async (schedule: Schedule) => {
    const reason = prompt('中止理由を入力してください（任意）');

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('team_schedules')
        .update({
          is_cancelled: true,
          cancellation_reason: reason || null,
        })
        .eq('id', schedule.id);

      if (error) throw error;
      loadData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '不明なエラー';
      alert('中止処理に失敗しました: ' + message);
    }
  };

  const formatDateTime = (datetime: string, isAllDay: boolean) => {
    const date = new Date(datetime);
    const dateStr = date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
    if (isAllDay) return dateStr;
    return `${dateStr} ${date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  // 月の変更
  const changeMonth = (delta: number) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const newDate = new Date(year, month - 1 + delta, 1);
    setSelectedMonth(`${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`);
  };

  const [selectedYear, selectedMonthNum] = selectedMonth.split('-').map(Number);
  const monthLabel = new Date(selectedYear, selectedMonthNum - 1).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
  });

  // カレンダー用: 月のカレンダーデータを生成
  const generateCalendarDays = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
    const daysInMonth = lastDay.getDate();

    const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];

    // 前月の日を追加
    const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      days.push({
        date: `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        day,
        isCurrentMonth: false,
      });
    }

    // 当月の日を追加
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        day,
        isCurrentMonth: true,
      });
    }

    // 次月の日を追加（6週間分になるように）
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      days.push({
        date: `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        day,
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date().toISOString().split('T')[0];
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  // 選択日のアイテムを取得
  const selectedDateItems = selectedDate ? itemsByDate[selectedDate] || [] : [];

  // 試合のステータスラベル
  const getMatchStatusLabel = (match: Match) => {
    if (match.status === 'finished') {
      return `${match.home_score} - ${match.away_score}`;
    }
    if (match.status === 'cancelled') return '中止';
    if (match.status === 'in_progress') return '試合中';
    return '予定';
  };

  // 試合のステータスカラー
  const getMatchStatusColor = (match: Match) => {
    if (match.status === 'finished') return 'bg-gray-100 text-gray-700';
    if (match.status === 'cancelled') return 'bg-red-100 text-red-700';
    if (match.status === 'in_progress') return 'bg-yellow-100 text-yellow-700';
    return 'bg-blue-100 text-blue-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  // スケジュールアイテムの表示コンポーネント
  const ScheduleItemView = ({ item, showDate = false }: { item: ScheduleItem; showDate?: boolean }) => {
    const config = EVENT_TYPE_CONFIG[item.eventType];

    if (item.type === 'match') {
      const match = item.originalData as Match;
      const isHome = match.home_team_id === teamId;

      return (
        <div className={`p-4 ${item.isCancelled ? 'opacity-50' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${config.bgColor} ${config.color}`}>
                  {config.label}
                </span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${getMatchStatusColor(match)}`}>
                  {getMatchStatusLabel(match)}
                </span>
                {match.round && (
                  <span className="text-xs text-gray-500">{match.round}</span>
                )}
              </div>
              <h5 className={`font-semibold text-gray-900 ${item.isCancelled ? 'line-through' : ''}`}>
                {isHome ? (
                  <>vs {match.away_team.name}</>
                ) : (
                  <>@ {match.home_team.name}</>
                )}
              </h5>
              <p className="text-sm text-gray-600 mt-1">
                {showDate ? formatDateTime(item.datetime, false) : formatTime(item.datetime)}
              </p>
              {item.location && (
                <p className="text-sm text-gray-500 mt-1">
                  📍 {item.location}
                </p>
              )}
            </div>
            <Link
              href={`/matches/${match.id}`}
              className="text-primary hover:text-primary-hover text-sm"
            >
              詳細
            </Link>
          </div>
        </div>
      );
    }

    // 通常のスケジュール
    const schedule = item.originalData as Schedule;
    return (
      <div className={`p-4 ${item.isCancelled ? 'opacity-50' : ''}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${config.bgColor} ${config.color}`}>
                {config.label}
              </span>
              {schedule.is_cancelled && (
                <span className="px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700">
                  中止
                </span>
              )}
            </div>
            <h5 className={`font-semibold text-gray-900 ${item.isCancelled ? 'line-through' : ''}`}>
              {schedule.title}
            </h5>
            <p className="text-sm text-gray-600 mt-1">
              {showDate
                ? formatDateTime(schedule.start_datetime, schedule.is_all_day)
                : (schedule.is_all_day ? '終日' : formatTime(schedule.start_datetime))
              }
              {schedule.end_datetime && !schedule.is_all_day && ` 〜 ${formatTime(schedule.end_datetime)}`}
            </p>
            {schedule.location && (
              <p className="text-sm text-gray-500 mt-1">
                📍 {schedule.location}
                {schedule.location_url && (
                  <a
                    href={schedule.location_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-primary hover:underline"
                  >
                    地図
                  </a>
                )}
              </p>
            )}
            {schedule.description && (
              <p className="text-sm text-gray-600 mt-2">{schedule.description}</p>
            )}
            {schedule.cancellation_reason && (
              <p className="text-sm text-red-600 mt-1">
                中止理由: {schedule.cancellation_reason}
              </p>
            )}
          </div>
          {canEdit && (
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => openEditForm(schedule)}
                className="text-primary hover:text-primary-hover text-sm"
              >
                編集
              </button>
              {!schedule.is_cancelled && (
                <button
                  onClick={() => handleCancel(schedule)}
                  className="text-orange-600 hover:text-orange-700 text-sm"
                >
                  中止
                </button>
              )}
              <button
                onClick={() => handleDelete(schedule.id)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                削除
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">スケジュール</h2>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 表示切替 */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md transition-colors min-h-[36px] ${
                viewMode === 'list'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              リスト
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md transition-colors min-h-[36px] ${
                viewMode === 'calendar'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              カレンダー
            </button>
          </div>
          {canEdit && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="px-3 sm:px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-xs sm:text-sm min-h-[36px]"
            >
              <span className="hidden sm:inline">予定を追加</span>
              <span className="sm:hidden">+ 追加</span>
            </button>
          )}
        </div>
      </div>

      {/* 月選択 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-lg font-semibold">{monthLabel}</h3>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* カレンダー表示 */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 border-b">
            {weekDays.map((day, i) => (
              <div
                key={day}
                className={`py-2 text-center text-sm font-medium ${
                  i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-700'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* カレンダーグリッド */}
          <div className="grid grid-cols-7">
            {calendarDays.map((dayInfo, index) => {
              const dayItems = itemsByDate[dayInfo.date] || [];
              const isToday = dayInfo.date === today;
              const isSelected = dayInfo.date === selectedDate;
              const dayOfWeek = index % 7;

              return (
                <div
                  key={dayInfo.date}
                  onClick={() => setSelectedDate(dayInfo.date)}
                  className={`min-h-[80px] sm:min-h-[100px] border-b border-r p-1 cursor-pointer transition-colors ${
                    !dayInfo.isCurrentMonth ? 'bg-gray-50' : ''
                  } ${isSelected ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset' : 'hover:bg-gray-50'}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-primary text-white'
                          : !dayInfo.isCurrentMonth
                          ? 'text-gray-400'
                          : dayOfWeek === 0
                          ? 'text-red-500'
                          : dayOfWeek === 6
                          ? 'text-blue-500'
                          : 'text-gray-700'
                      }`}
                    >
                      {dayInfo.day}
                    </span>
                    {canEdit && dayInfo.isCurrentMonth && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openNewFormWithDate(dayInfo.date);
                        }}
                        className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-blue-100 rounded opacity-0 group-hover:opacity-100 sm:opacity-100"
                        title="予定を追加"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {dayItems.slice(0, 3).map((item) => {
                      const config = EVENT_TYPE_CONFIG[item.eventType];
                      return (
                        <div
                          key={item.id}
                          className={`text-xs px-1 py-0.5 rounded truncate ${config.bgColor} ${config.color} ${
                            item.isCancelled ? 'opacity-50 line-through' : ''
                          }`}
                          title={item.title}
                        >
                          {formatTime(item.datetime)} {item.title}
                        </div>
                      );
                    })}
                    {dayItems.length > 3 && (
                      <div className="text-xs text-gray-500 px-1">
                        +{dayItems.length - 3}件
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 凡例 */}
          <div className="px-4 py-2 border-t bg-gray-50 flex flex-wrap gap-3">
            {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-1.5 text-xs">
                <span className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`}></span>
                <span className="text-gray-600">{config.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 選択日の予定詳細（カレンダー表示時） */}
      {viewMode === 'calendar' && selectedDate && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">
              {new Date(selectedDate).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </h4>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {selectedDateItems.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-3">この日の予定はありません</p>
              {canEdit && (
                <button
                  onClick={() => openNewFormWithDate(selectedDate)}
                  className="text-primary hover:text-primary-hover text-sm"
                >
                  予定を追加する
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {selectedDateItems.map((item) => (
                <ScheduleItemView key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* リスト表示 */}
      {viewMode === 'list' && (
        <>
          {combinedItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">この月の予定はありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(itemsByDate).map(([date, dayItems]) => (
                <div key={date} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
                    <h4 className="font-medium text-gray-700">
                      {new Date(date).toLocaleDateString('ja-JP', {
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long',
                      })}
                    </h4>
                    {canEdit && (
                      <button
                        onClick={() => openNewFormWithDate(date)}
                        className="text-primary hover:text-primary-hover text-sm"
                      >
                        + 追加
                      </button>
                    )}
                  </div>
                  <div className="divide-y">
                    {dayItems.map((item) => (
                      <ScheduleItemView key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 追加・編集モーダル */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  {editingSchedule ? '予定を編集' : '予定を追加'}
                </h3>
                <button onClick={() => { setShowForm(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">タイトル *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="例: U11リーグ 第5節"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">種別 *</label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value as EventType })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    {Object.entries(EVENT_TYPE_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_all_day"
                    checked={formData.is_all_day}
                    onChange={(e) => setFormData({ ...formData, is_all_day: e.target.checked })}
                    className="rounded text-primary"
                  />
                  <label htmlFor="is_all_day" className="text-sm text-gray-700">終日</label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">開始日 *</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  {!formData.is_all_day && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">開始時刻 *</label>
                      <input
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        required={!formData.is_all_day}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  {!formData.is_all_day && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">終了時刻</label>
                      <input
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">場所</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="例: ○○グラウンド"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">地図URL</label>
                  <input
                    type="url"
                    value={formData.location_url}
                    onChange={(e) => setFormData({ ...formData, location_url: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="https://maps.google.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">詳細</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="予定の詳細を入力"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">備考（管理者用）</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="内部メモなど"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
                >
                  {editingSchedule ? '更新する' : '追加する'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
