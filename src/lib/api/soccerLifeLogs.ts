/**
 * Soccer Life Logs API Client
 * サッカーライフログ関連のデータベース操作
 */

import { createClient } from '@/lib/supabase/client';
import type { SoccerLifeLog } from '@/types/database';

export type SoccerLifeLogInsert = {
  player_id: string;
  log_date: string;
  log_type: 'practice' | 'match' | 'training' | 'study' | 'other';
  title: string;
  content?: string;
  mood?: number;
  duration_minutes?: number;
  is_public?: boolean;
};

/**
 * 選手のライフログ一覧取得
 */
export async function getLifeLogsByPlayer(playerId: string): Promise<SoccerLifeLog[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('soccer_life_logs')
    .select('*')
    .eq('player_id', playerId)
    .order('log_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * ライフログ作成
 */
export async function createLifeLog(log: SoccerLifeLogInsert): Promise<SoccerLifeLog> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('soccer_life_logs')
    .insert(log)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * ライフログ削除
 */
export async function deleteLifeLog(logId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('soccer_life_logs')
    .delete()
    .eq('id', logId);

  if (error) throw error;
}
