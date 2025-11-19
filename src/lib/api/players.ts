/**
 * Players API Client
 * 選手関連のデータベース操作
 */

import { createClient } from '@/lib/supabase/client';
import type { Player, PlayerWithTeam, PlayerInsert, PlayerUpdate } from '@/types/database';

/**
 * 全選手取得
 */
export async function getAllPlayers(): Promise<PlayerWithTeam[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('players')
    .select(`
      *,
      team:teams(*)
    `)
    .eq('is_active', true)
    .order('family_name_kana', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * チーム別選手取得
 */
export async function getPlayersByTeam(teamId: string): Promise<PlayerWithTeam[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('players')
    .select(`
      *,
      team:teams(*)
    `)
    .eq('team_id', teamId)
    .eq('is_active', true)
    .order('uniform_number', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * 選手詳細取得
 */
export async function getPlayerById(playerId: string): Promise<PlayerWithTeam | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('players')
    .select(`
      *,
      team:teams(
        *,
        prefecture:prefectures(*)
      )
    `)
    .eq('id', playerId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * 選手証番号で選手取得
 */
export async function getPlayerByCardNumber(cardNumber: string): Promise<PlayerWithTeam | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('players')
    .select(`
      *,
      team:teams(
        *,
        prefecture:prefectures(*)
      )
    `)
    .eq('player_card_number', cardNumber)
    .single();

  if (error) throw error;
  return data;
}

/**
 * ユーザーに紐づく選手取得（保護者が自分の子供を確認）
 */
export async function getPlayersByUser(userId: string): Promise<PlayerWithTeam[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('players')
    .select(`
      *,
      team:teams(*)
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('family_name_kana', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * 選手作成
 */
export async function createPlayer(player: PlayerInsert): Promise<Player> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('players')
    .insert(player)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * 選手更新
 */
export async function updatePlayer(playerId: string, updates: PlayerUpdate): Promise<Player> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('players')
    .update(updates)
    .eq('id', playerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * 選手証番号を生成
 */
export function generatePlayerCardNumber(
  prefectureCode: string,
  teamId: string,
  playerId: string
): string {
  // 形式: [都道府県コード]-[チームID上4桁]-[選手ID上6桁]
  const teamShort = teamId.replace(/-/g, '').slice(0, 4).toUpperCase();
  const playerShort = playerId.replace(/-/g, '').slice(0, 6).toUpperCase();
  return `${prefectureCode}-${teamShort}-${playerShort}`;
}
