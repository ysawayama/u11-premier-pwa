/**
 * Teams API Client
 * チーム関連のデータベース操作
 */

import { createClient } from '@/lib/supabase/client';
import type { Team, TeamWithPrefecture, TeamInsert, TeamUpdate } from '@/types/database';

/**
 * 全チーム取得
 */
export async function getAllTeams(): Promise<TeamWithPrefecture[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      prefecture:prefectures(*)
    `)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * 都道府県別チーム取得
 */
export async function getTeamsByPrefecture(prefectureId: string): Promise<TeamWithPrefecture[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      prefecture:prefectures(*)
    `)
    .eq('prefecture_id', prefectureId)
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * チーム詳細取得
 */
export async function getTeamById(teamId: string): Promise<TeamWithPrefecture | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      prefecture:prefectures(*)
    `)
    .eq('id', teamId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * チーム作成
 */
export async function createTeam(team: TeamInsert): Promise<Team> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('teams')
    .insert(team)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * チーム更新
 */
export async function updateTeam(teamId: string, updates: TeamUpdate): Promise<Team> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('teams')
    .update(updates)
    .eq('id', teamId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
