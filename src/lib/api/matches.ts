/**
 * Matches API Client
 * 試合関連のデータベース操作
 */

import { createClient } from '@/lib/supabase/client';
import type { Match, MatchWithTeams, MatchInsert, MatchUpdate, MatchStatus } from '@/types/database';

/**
 * 試合一覧取得（最新順）
 */
export async function getRecentMatches(limit = 20): Promise<MatchWithTeams[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .order('match_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

/**
 * チーム別試合取得
 */
export async function getMatchesByTeam(teamId: string): Promise<MatchWithTeams[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
    .order('match_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * ステータス別試合取得
 */
export async function getMatchesByStatus(status: MatchStatus): Promise<MatchWithTeams[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .eq('status', status)
    .order('match_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * 試合詳細取得
 */
export async function getMatchById(matchId: string): Promise<MatchWithTeams | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey(*),
      away_team:teams!matches_away_team_id_fkey(*)
    `)
    .eq('id', matchId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * 試合作成
 */
export async function createMatch(match: MatchInsert): Promise<Match> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('matches')
    .insert(match)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * 試合更新
 */
export async function updateMatch(matchId: string, updates: MatchUpdate): Promise<Match> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', matchId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * スコア更新
 */
export async function updateMatchScore(
  matchId: string,
  homeScore: number,
  awayScore: number
): Promise<Match> {
  return updateMatch(matchId, {
    home_score: homeScore,
    away_score: awayScore,
  });
}

/**
 * 試合ステータス更新
 */
export async function updateMatchStatus(
  matchId: string,
  status: MatchStatus
): Promise<Match> {
  return updateMatch(matchId, { status });
}
