'use client';

import { useState, useEffect } from 'react';
import { getMatchEvents, createMatchEvent, deleteMatchEvent, type MatchEventWithDetails, type MatchEventInsert } from '@/lib/api/matchEvents';
import { getPlayersByTeam } from '@/lib/api/players';
import type { PlayerWithTeam, MatchWithTeams } from '@/types/database';
import {
  sendGoalNotification,
  sendYellowCardNotification,
  sendRedCardNotification,
} from '@/lib/notifications/sendNotification';

interface MatchEventRecorderProps {
  match: MatchWithTeams;
}

export default function MatchEventRecorder({ match }: MatchEventRecorderProps) {
  const [events, setEvents] = useState<MatchEventWithDetails[]>([]);
  const [homePlayers, setHomePlayers] = useState<PlayerWithTeam[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<PlayerWithTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // フォーム状態
  const [eventType, setEventType] = useState<'goal' | 'yellow_card' | 'red_card' | 'substitution'>('goal');
  const [eventTime, setEventTime] = useState<number>(0);
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away'>('home');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [assistedById, setAssistedById] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    loadData();
  }, [match.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, homePlayersData, awayPlayersData] = await Promise.all([
        getMatchEvents(match.id),
        getPlayersByTeam(match.home_team.id),
        getPlayersByTeam(match.away_team.id),
      ]);
      setEvents(eventsData);
      setHomePlayers(homePlayersData);
      setAwayPlayers(awayPlayersData);
    } catch (err: any) {
      alert('データの取得に失敗しました: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!selectedPlayerId && eventType !== 'substitution') {
      alert('選手を選択してください');
      return;
    }

    const teamId = selectedTeam === 'home' ? match.home_team.id : match.away_team.id;
    const teamName = selectedTeam === 'home' ? match.home_team.name : match.away_team.name;

    const newEvent: MatchEventInsert = {
      match_id: match.id,
      event_type: eventType,
      event_time: eventTime,
      player_id: selectedPlayerId || null,
      team_id: teamId,
      assisted_by_player_id: assistedById || null,
      description: description || null,
    };

    try {
      setSaving(true);
      await createMatchEvent(newEvent);

      // 通知を送信
      const currentPlayer = (selectedTeam === 'home' ? homePlayers : awayPlayers).find(
        (p) => p.id === selectedPlayerId
      );
      const playerName = currentPlayer
        ? `${currentPlayer.family_name} ${currentPlayer.given_name}`
        : '';

      // イベントタイプに応じて通知を送信
      if (eventType === 'goal' && playerName) {
        await sendGoalNotification(playerName, teamName, match.id, eventTime);
      } else if (eventType === 'yellow_card' && playerName) {
        await sendYellowCardNotification(playerName, teamName, match.id, eventTime);
      } else if (eventType === 'red_card' && playerName) {
        await sendRedCardNotification(playerName, teamName, match.id, eventTime);
      }

      alert('イベントを記録しました');
      await loadData();
      // フォームリセット
      setEventTime(0);
      setSelectedPlayerId('');
      setAssistedById('');
      setDescription('');
    } catch (err: any) {
      alert('イベントの記録に失敗しました: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('このイベントを削除しますか？')) return;

    try {
      await deleteMatchEvent(eventId);
      alert('イベントを削除しました');
      await loadData();
    } catch (err: any) {
      alert('イベントの削除に失敗しました: ' + err.message);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'goal':
        return '⚽';
      case 'yellow_card':
        return '🟨';
      case 'red_card':
        return '🟥';
      case 'substitution':
        return '🔄';
      default:
        return '📝';
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'goal':
        return 'ゴール';
      case 'yellow_card':
        return 'イエローカード';
      case 'red_card':
        return 'レッドカード';
      case 'substitution':
        return '選手交代';
      default:
        return 'その他';
    }
  };

  const currentPlayers = selectedTeam === 'home' ? homePlayers : awayPlayers;

  if (loading) {
    return <div className="text-center py-4">読み込み中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* イベント記録フォーム */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          イベント記録
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* イベントタイプ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              イベントタイプ
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="goal">⚽ ゴール</option>
              <option value="yellow_card">🟨 イエローカード</option>
              <option value="red_card">🟥 レッドカード</option>
              <option value="substitution">🔄 選手交代</option>
            </select>
          </div>

          {/* 時間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              時間（分）
            </label>
            <input
              type="number"
              min="0"
              max="90"
              value={eventTime}
              onChange={(e) => setEventTime(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* チーム選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              チーム
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => {
                setSelectedTeam(e.target.value as 'home' | 'away');
                setSelectedPlayerId('');
                setAssistedById('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="home">{match.home_team.name}</option>
              <option value="away">{match.away_team.name}</option>
            </select>
          </div>

          {/* 選手選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              選手
            </label>
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">選手を選択</option>
              {currentPlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.uniform_number ? `#${player.uniform_number} ` : ''}
                  {player.family_name} {player.given_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* アシスト（ゴールの場合のみ） */}
        {eventType === 'goal' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              アシスト（任意）
            </label>
            <select
              value={assistedById}
              onChange={(e) => setAssistedById(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">アシストなし</option>
              {currentPlayers
                .filter((p) => p.id !== selectedPlayerId)
                .map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.uniform_number ? `#${player.uniform_number} ` : ''}
                    {player.family_name} {player.given_name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* メモ */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            メモ（任意）
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="詳細情報を入力"
          />
        </div>

        <button
          onClick={handleAddEvent}
          disabled={saving}
          className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium transition-colors disabled:bg-gray-400"
        >
          {saving ? '記録中...' : 'イベントを記録'}
        </button>
      </div>

      {/* イベント一覧 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          記録されたイベント ({events.length})
        </h3>

        {events.length === 0 ? (
          <p className="text-center text-gray-600 py-8">
            まだイベントが記録されていません
          </p>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{getEventIcon(event.event_type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-primary">
                          {event.event_time}'
                        </span>
                        <span className="text-sm text-gray-600">
                          {getEventLabel(event.event_type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">
                        {event.team.short_name || event.team.name}
                        {event.player && (
                          <>
                            {' - '}
                            {event.player.uniform_number && `#${event.player.uniform_number} `}
                            {event.player.family_name} {event.player.given_name}
                          </>
                        )}
                      </p>
                      {event.assisted_by_player && (
                        <p className="text-xs text-gray-600 mt-1">
                          アシスト: {event.assisted_by_player.uniform_number && `#${event.assisted_by_player.uniform_number} `}
                          {event.assisted_by_player.family_name} {event.assisted_by_player.given_name}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
