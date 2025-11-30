import { createClient } from '@/lib/supabase/client';
import type { Announcement } from '@/types/database';

/**
 * お知らせを取得（ページネーション対応）
 */
export async function getAnnouncements(
  page: number = 1,
  perPage: number = 6
): Promise<{ data: Announcement[]; total: number }> {
  const supabase = createClient();

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await supabase
    .from('announcements')
    .select('*', { count: 'exact' })
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }

  return {
    data: data || [],
    total: count || 0,
  };
}

/**
 * 最新のお知らせを取得
 */
export async function getLatestAnnouncements(limit: number = 3): Promise<Announcement[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching latest announcements:', error);
    throw error;
  }

  return data || [];
}

/**
 * お知らせを作成（Webマスター用）
 */
export async function createAnnouncement(
  announcement: Omit<Announcement, 'id' | 'created_at' | 'updated_at' | 'created_by'>
): Promise<Announcement> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('announcements')
    .insert({
      ...announcement,
      created_by: user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }

  return data;
}

/**
 * お知らせを更新（Webマスター用）
 */
export async function updateAnnouncement(
  id: string,
  updates: Partial<Omit<Announcement, 'id' | 'created_at' | 'updated_at' | 'created_by'>>
): Promise<Announcement> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('announcements')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }

  return data;
}

/**
 * お知らせを削除（Webマスター用）
 */
export async function deleteAnnouncement(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
}

/**
 * 全てのお知らせを取得（管理用、非公開含む）
 */
export async function getAllAnnouncements(
  page: number = 1,
  perPage: number = 10
): Promise<{ data: Announcement[]; total: number }> {
  const supabase = createClient();

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await supabase
    .from('announcements')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Error fetching all announcements:', error);
    throw error;
  }

  return {
    data: data || [],
    total: count || 0,
  };
}
