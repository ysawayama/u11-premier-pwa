'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type AttendanceStatus = 'pending' | 'attending' | 'not_attending' | 'maybe';

type Schedule = {
  id: string;
  title: string;
  event_type: string;
  start_datetime: string;
  location: string | null;
  is_cancelled: boolean;
};

type Player = {
  id: string;
  name: string;
  jersey_number: number | null;
};

type Attendance = {
  id: string;
  schedule_id: string;
  player_id: string;
  status: AttendanceStatus;
  reason: string | null;
  responded_at: string | null;
};

type ScheduleWithAttendance = Schedule & {
  attendances: (Attendance & { player: Player })[];
  summary: {
    attending: number;
    not_attending: number;
    maybe: number;
    pending: number;
  };
};

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bgColor: string }> = {
  attending: { label: '参加', color: 'text-green-700', bgColor: 'bg-green-100' },
  not_attending: { label: '欠席', color: 'text-red-700', bgColor: 'bg-red-100' },
  maybe: { label: '未定', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  pending: { label: '未回答', color: 'text-gray-500', bgColor: 'bg-gray-100' },
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  match: '試合',
  practice: '練習',
  meeting: 'ミーティング',
  event: 'イベント',
  other: 'その他',
};

/**
 * チームポータル - 出欠管理ページ
 */
export default function AttendancePage() {
  const params = useParams();
  const teamId = params.teamId as string;

  const [schedules, setSchedules] = useState<ScheduleWithAttendance[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [isManager, setIsManager] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleWithAttendance | null>(null);

  useEffect(() => {
    loadData();
  }, [teamId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const supabase = createClient();

      // 権限確認
      const { data: managerCheck } = await supabase.rpc('is_team_manager_of', {
        team_uuid: teamId
      });
      setIsManager(!!managerCheck);

      // チームの選手一覧取得
      const { data: playersData } = await supabase
        .from('players')
        .select('id, name, jersey_number')
        .eq('team_id', teamId)
        .eq('is_active', true)
        .order('jersey_number', { ascending: true });

      setPlayers(playersData || []);

      // 今日以降のスケジュール取得
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: schedulesData } = await supabase
        .from('team_schedules')
        .select('id, title, event_type, start_datetime, location, is_cancelled')
        .eq('team_id', teamId)
        .gte('start_datetime', today.toISOString())
        .order('start_datetime', { ascending: true })
        .limit(20);

      if (!schedulesData || schedulesData.length === 0) {
        setSchedules([]);
        return;
      }

      // 各スケジュールの出欠情報を取得
      const scheduleIds = schedulesData.map((s: Schedule) => s.id);
      const { data: attendancesData } = await supabase
        .from('attendance')
        .select('id, schedule_id, player_id, status, reason, responded_at')
        .in('schedule_id', scheduleIds);

      // スケジュールごとに出欠をまとめる
      const schedulesWithAttendance: ScheduleWithAttendance[] = schedulesData.map((schedule: Schedule) => {
        const scheduleAttendances = (attendancesData || [])
          .filter((a: Attendance) => a.schedule_id === schedule.id)
          .map((a: Attendance) => ({
            ...a,
            player: (playersData || []).find((p: Player) => p.id === a.player_id) || { id: a.player_id, name: '不明', jersey_number: null }
          }));

        // 出欠サマリー計算
        const summary = {
          attending: scheduleAttendances.filter((a: Attendance & { player: Player }) => a.status === 'attending').length,
          not_attending: scheduleAttendances.filter((a: Attendance & { player: Player }) => a.status === 'not_attending').length,
          maybe: scheduleAttendances.filter((a: Attendance & { player: Player }) => a.status === 'maybe').length,
          pending: (playersData?.length || 0) - scheduleAttendances.length,
        };

        return {
          ...schedule,
          attendances: scheduleAttendances,
          summary,
        };
      });

      setSchedules(schedulesWithAttendance);
    } catch (err) {
      console.error('データの取得に失敗:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (scheduleId: string, playerId: string, status: AttendanceStatus, reason?: string) => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // 既存の出欠を確認
      const { data: existing } = await supabase
        .from('attendance')
        .select('id')
        .eq('schedule_id', scheduleId)
        .eq('player_id', playerId)
        .single();

      if (existing) {
        // 更新
        const { error } = await supabase
          .from('attendance')
          .update({
            status,
            reason: reason || null,
            responded_by: user?.id,
            responded_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // 新規作成
        const { error } = await supabase
          .from('attendance')
          .insert({
            schedule_id: scheduleId,
            player_id: playerId,
            status,
            reason: reason || null,
            responded_by: user?.id,
            responded_at: new Date().toISOString(),
          });

        if (error) throw error;
      }

      loadData();
    } catch (err: any) {
      alert('出欠の更新に失敗しました: ' + err.message);
    }
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPlayerAttendance = (scheduleId: string, playerId: string): Attendance | undefined => {
    const schedule = schedules.find(s => s.id === scheduleId);
    return schedule?.attendances.find(a => a.player_id === playerId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">出欠管理</h2>

      {schedules.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">今後の予定はありません</p>
          <p className="text-sm text-gray-400 mt-2">
            スケジュールを追加すると出欠管理ができます
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className={`bg-white rounded-lg shadow-sm overflow-hidden ${schedule.is_cancelled ? 'opacity-50' : ''}`}
            >
              <div className="p-4 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 rounded">
                        {EVENT_TYPE_LABELS[schedule.event_type] || schedule.event_type}
                      </span>
                      {schedule.is_cancelled && (
                        <span className="text-xs font-medium px-2 py-0.5 bg-red-100 text-red-700 rounded">
                          中止
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900">{schedule.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDateTime(schedule.start_datetime)}
                      {schedule.location && ` · ${schedule.location}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedSchedule(selectedSchedule?.id === schedule.id ? null : schedule)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    {selectedSchedule?.id === schedule.id ? '閉じる' : '詳細'}
                  </button>
                </div>

                {/* 出欠サマリー */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3">
                  <span className="text-xs sm:text-sm">
                    <span className="text-green-600 font-medium">{schedule.summary.attending}</span>
                    <span className="text-gray-400 ml-1">参加</span>
                  </span>
                  <span className="text-xs sm:text-sm">
                    <span className="text-red-600 font-medium">{schedule.summary.not_attending}</span>
                    <span className="text-gray-400 ml-1">欠席</span>
                  </span>
                  <span className="text-xs sm:text-sm">
                    <span className="text-yellow-600 font-medium">{schedule.summary.maybe}</span>
                    <span className="text-gray-400 ml-1">未定</span>
                  </span>
                  <span className="text-xs sm:text-sm">
                    <span className="text-gray-500 font-medium">{schedule.summary.pending}</span>
                    <span className="text-gray-400 ml-1">未回答</span>
                  </span>
                </div>
              </div>

              {/* 出欠詳細（展開時） */}
              {selectedSchedule?.id === schedule.id && (
                <div className="p-4 bg-gray-50">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">選手別出欠状況</h4>
                  <div className="space-y-2">
                    {players.map((player) => {
                      const attendance = getPlayerAttendance(schedule.id, player.id);
                      const currentStatus = attendance?.status || 'pending';

                      return (
                        <div
                          key={player.id}
                          className="flex items-center justify-between bg-white p-3 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            {player.jersey_number && (
                              <span className="text-sm font-mono text-gray-500 w-6">
                                #{player.jersey_number}
                              </span>
                            )}
                            <span className="font-medium text-gray-900">{player.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map((status) => {
                              const config = STATUS_CONFIG[status];
                              const isActive = currentStatus === status;
                              return (
                                <button
                                  key={status}
                                  onClick={() => {
                                    if (status === 'not_attending') {
                                      const reason = prompt('欠席理由（任意）');
                                      handleStatusChange(schedule.id, player.id, status, reason || undefined);
                                    } else {
                                      handleStatusChange(schedule.id, player.id, status);
                                    }
                                  }}
                                  className={`px-2 py-1 text-xs rounded transition-colors ${
                                    isActive
                                      ? `${config.bgColor} ${config.color} font-medium`
                                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                  }`}
                                >
                                  {config.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    {players.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        選手が登録されていません
                      </p>
                    )}
                  </div>

                  {/* 欠席者と理由 */}
                  {schedule.attendances.filter(a => a.status === 'not_attending' && a.reason).length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">欠席理由</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {schedule.attendances
                          .filter(a => a.status === 'not_attending' && a.reason)
                          .map(a => (
                            <li key={a.id}>
                              <span className="font-medium">{a.player.name}:</span> {a.reason}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
