/**
 * Match Events API Client
 * 試合イベント関連のデータベース操作
 */

import { createClient } from '@/lib/supabase/client';

export interface MatchEvent {
  id: string;
  match_id: string;
  event_type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'other';
  event_time: number; // 分
  player_id: string | null;
  team_id: string;
  assisted_by_player_id: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatchEventWithDetails extends MatchEvent {
  player: {
    id: string;
    family_name: string;
    given_name: string;
    uniform_number: number | null;
  } | null;
  assisted_by_player: {
    id: string;
    family_name: string;
    given_name: string;
    uniform_number: number | null;
  } | null;
  team: {
    id: string;
    name: string;
    short_name: string | null;
  };
}

export interface MatchEventInsert {
  match_id: string;
  event_type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'other';
  event_time: number;
  player_id?: string | null;
  team_id: string;
  assisted_by_player_id?: string | null;
  description?: string | null;
}

/**
 * 試合のイベント一覧取得
 */
export async function getMatchEvents(matchId: string): Promise<MatchEventWithDetails[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('match_events')
    .select(`
      *,
      player:players!match_events_player_id_fkey(
        id,
        family_name,
        given_name,
        uniform_number
      ),
      assisted_by_player:players!match_events_assisted_by_player_id_fkey(
        id,
        family_name,
        given_name,
        uniform_number
      ),
      team:teams(
        id,
        name,
        short_name
      )
    `)
    .eq('match_id', matchId)
    .order('event_time', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * イベント作成
 */
export async function createMatchEvent(event: MatchEventInsert): Promise<MatchEvent> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('match_events')
    .insert(event)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * イベント削除
 */
export async function deleteMatchEvent(eventId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('match_events')
    .delete()
    .eq('id', eventId);

  if (error) throw error;
}

/**
 * 選手の得点数を取得
 */
export async function getPlayerGoals(playerId: string, seasonId: string): Promise<number> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('match_events')
    .select('id', { count: 'exact', head: true })
    .eq('player_id', playerId)
    .eq('event_type', 'goal')
    .eq('match_id', seasonId); // season_idでフィルタする場合はJOINが必要

  if (error) throw error;
  return data || 0;
}
