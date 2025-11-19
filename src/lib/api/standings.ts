/**
 * Standings API Client
 * 順位表関連のデータベース操作
 */

import { createClient } from '@/lib/supabase/client';
import type { TeamStanding, TeamStandingWithTeam } from '@/types/database';

/**
 * シーズン別順位表取得
 */
export async function getStandingsBySeason(seasonId: string): Promise<TeamStandingWithTeam[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('team_standings')
    .select(`
      *,
      team:teams(
        *,
        prefecture:prefectures(*)
      )
    `)
    .eq('season_id', seasonId)
    .order('rank', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * 現在のシーズンの順位表取得
 */
export async function getCurrentStandings(): Promise<TeamStandingWithTeam[]> {
  const supabase = createClient();

  // 現在のシーズンを取得
  const { data: currentSeason, error: seasonError } = await supabase
    .from('seasons')
    .select('id')
    .eq('is_current', true)
    .single();

  if (seasonError) throw seasonError;
  if (!currentSeason) return [];

  return getStandingsBySeason(currentSeason.id);
}

/**
 * チーム別順位情報取得
 */
export async function getTeamStanding(teamId: string, seasonId: string): Promise<TeamStanding | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('team_standings')
    .select('*')
    .eq('team_id', teamId)
    .eq('season_id', seasonId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * 得点ランキング取得（上位N件）
 */
export async function getTopScorers(seasonId: string, limit = 10): Promise<TeamStandingWithTeam[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('team_standings')
    .select(`
      *,
      team:teams(*)
    `)
    .eq('season_id', seasonId)
    .order('goals_for', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}
