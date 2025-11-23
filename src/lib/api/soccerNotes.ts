/**
 * Soccer Notes API Client
 * サッカーノート関連のデータベース操作
 */

import { createClient } from '@/lib/supabase/client';
import type { SoccerNote, SoccerNoteWithCoach } from '@/types/database';

// 内部型定義
type NoteWithPlayerFromDB = SoccerNote & {
  player: {
    id: string;
    family_name: string;
    given_name: string;
    team_id: string;
  };
};

export type SoccerNoteInsert = {
  player_id: string;
  note_date: string;
  title?: string;
  what_went_well?: string;
  what_to_improve?: string;
  next_goal?: string;
  self_rating?: number;
  schedule_id?: string;
  match_id?: string;
};

export type SoccerNoteUpdate = Partial<SoccerNoteInsert> & {
  coach_comment?: string;
  is_reviewed?: boolean;
};

/**
 * 選手のサッカーノート一覧取得
 */
export async function getSoccerNotesByPlayer(playerId: string): Promise<SoccerNoteWithCoach[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('soccer_notes')
    .select('*')
    .eq('player_id', playerId)
    .order('note_date', { ascending: false });

  if (error) throw error;

  // コーチ情報は別途取得が必要だが、今はシンプルに
  return (data || []).map((note) => ({
    ...note,
    coach: note.coach_id
      ? {
          id: note.coach_id,
          full_name: 'コーチ',
        }
      : null,
  }));
}

/**
 * サッカーノート詳細取得
 */
export async function getSoccerNoteById(noteId: string): Promise<SoccerNoteWithCoach | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('soccer_notes')
    .select('*')
    .eq('id', noteId)
    .single();

  if (error) throw error;

  if (!data) return null;

  return {
    ...data,
    coach: data.coach_id
      ? {
          id: data.coach_id,
          full_name: 'コーチ',
        }
      : null,
  };
}

/**
 * サッカーノート作成
 */
export async function createSoccerNote(note: SoccerNoteInsert): Promise<SoccerNote> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('soccer_notes')
    .insert(note)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * サッカーノート更新
 */
export async function updateSoccerNote(
  noteId: string,
  updates: SoccerNoteUpdate
): Promise<SoccerNote> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('soccer_notes')
    .update(updates)
    .eq('id', noteId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * コーチがコメントを追加
 */
export async function addCoachComment(
  noteId: string,
  comment: string
): Promise<SoccerNote> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('ログインが必要です');

  const { data, error } = await supabase
    .from('soccer_notes')
    .update({
      coach_comment: comment,
      coach_id: user.id,
      coach_commented_at: new Date().toISOString(),
      is_reviewed: true,
    })
    .eq('id', noteId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * チームのコーチとして、選手のノート一覧を取得
 */
export async function getSoccerNotesByTeam(
  teamId: string,
  options?: { unreviewedOnly?: boolean }
): Promise<(SoccerNoteWithCoach & { player: { id: string; family_name: string; given_name: string } })[]> {
  const supabase = createClient();

  let query = supabase
    .from('soccer_notes')
    .select(`
      *,
      player:player_id(id, family_name, given_name, team_id)
    `)
    .order('note_date', { ascending: false });

  if (options?.unreviewedOnly) {
    query = query.eq('is_reviewed', false);
  }

  const { data, error } = await query;

  if (error) throw error;

  // チームでフィルターし、整形
  return (data || [])
    .filter((note: NoteWithPlayerFromDB) => note.player?.team_id === teamId)
    .map((note: NoteWithPlayerFromDB) => ({
      ...note,
      coach: note.coach_id
        ? {
            id: note.coach_id,
            full_name: 'コーチ',
          }
        : null,
      player: {
        id: note.player.id,
        family_name: note.player.family_name,
        given_name: note.player.given_name,
      },
    }));
}

/**
 * サッカーノート削除
 */
export async function deleteSoccerNote(noteId: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('soccer_notes')
    .delete()
    .eq('id', noteId);

  if (error) throw error;
}
