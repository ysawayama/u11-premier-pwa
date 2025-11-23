-- ============================================
-- Phase 1-2: チームページ機能のテーブル設計
-- ============================================

-- ============================================
-- 1. チームスケジュール
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('match', 'practice', 'meeting', 'event', 'other')),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  location TEXT,
  location_url TEXT, -- Google Mapsリンクなど
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL, -- 試合の場合リンク
  is_all_day BOOLEAN DEFAULT false,
  is_cancelled BOOLEAN DEFAULT false,
  cancellation_reason TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_schedules_team ON public.team_schedules(team_id);
CREATE INDEX idx_team_schedules_date ON public.team_schedules(start_datetime);
CREATE INDEX idx_team_schedules_type ON public.team_schedules(event_type);

-- ============================================
-- 2. 出欠管理
-- ============================================
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.team_schedules(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'attending', 'not_attending', 'maybe')),
  responded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- 回答者（選手本人or保護者）
  responded_at TIMESTAMPTZ,
  reason TEXT, -- 欠席理由など
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(schedule_id, player_id)
);

CREATE INDEX idx_attendance_schedule ON public.attendance(schedule_id);
CREATE INDEX idx_attendance_player ON public.attendance(player_id);
CREATE INDEX idx_attendance_status ON public.attendance(status);

-- ============================================
-- 3. 掲示板（メッセージボード）
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_board_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'general' CHECK (post_type IN ('general', 'announcement', 'important', 'question')),
  is_pinned BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  attachment_urls TEXT[], -- 添付ファイルURL配列
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_board_posts_team ON public.team_board_posts(team_id);
CREATE INDEX idx_team_board_posts_author ON public.team_board_posts(author_id);
CREATE INDEX idx_team_board_posts_pinned ON public.team_board_posts(is_pinned);

-- 掲示板コメント
CREATE TABLE IF NOT EXISTS public.team_board_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.team_board_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.team_board_comments(id) ON DELETE CASCADE, -- 返信の場合
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_board_comments_post ON public.team_board_comments(post_id);
CREATE INDEX idx_team_board_comments_parent ON public.team_board_comments(parent_comment_id);

-- 既読管理
CREATE TABLE IF NOT EXISTS public.team_board_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.team_board_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ============================================
-- 4. アルバム
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  event_date DATE,
  schedule_id UUID REFERENCES public.team_schedules(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT false, -- チーム外にも公開するか
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_albums_team ON public.team_albums(team_id);
CREATE INDEX idx_team_albums_date ON public.team_albums(event_date);

-- アルバム写真
CREATE TABLE IF NOT EXISTS public.team_album_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES public.team_albums(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  taken_at TIMESTAMPTZ,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_album_photos_album ON public.team_album_photos(album_id);

-- ============================================
-- 5. マッチメイク（練習試合募集）
-- ============================================
CREATE TABLE IF NOT EXISTS public.match_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requesting_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('looking', 'offering')), -- 募集 or 提供
  title TEXT NOT NULL,
  description TEXT,
  preferred_dates JSONB, -- [{date: '2025-01-15', time_slots: ['morning', 'afternoon']}]
  location_preference TEXT, -- 'home', 'away', 'either'
  location_details TEXT,
  player_count_min INT,
  player_count_max INT,
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'any')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'matched', 'closed', 'cancelled')),
  matched_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  matched_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_match_requests_team ON public.match_requests(requesting_team_id);
CREATE INDEX idx_match_requests_status ON public.match_requests(status);
CREATE INDEX idx_match_requests_type ON public.match_requests(request_type);

-- マッチメイク応募
CREATE TABLE IF NOT EXISTS public.match_request_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.match_requests(id) ON DELETE CASCADE,
  responding_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  message TEXT,
  proposed_datetime TIMESTAMPTZ,
  proposed_location TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  responded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, responding_team_id)
);

CREATE INDEX idx_match_request_responses_request ON public.match_request_responses(request_id);
CREATE INDEX idx_match_request_responses_team ON public.match_request_responses(responding_team_id);

-- ============================================
-- 6. コミュニケーション（チャット）
-- ============================================

-- チャットルーム（グループ・個人）
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE, -- チーム内チャットの場合
  room_type TEXT NOT NULL CHECK (room_type IN ('team', 'group', 'direct')),
  name TEXT, -- グループ名（directの場合はNULL）
  description TEXT,
  icon_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_rooms_team ON public.chat_rooms(team_id);
CREATE INDEX idx_chat_rooms_type ON public.chat_rooms(room_type);

-- チャットルームメンバー
CREATE TABLE IF NOT EXISTS public.chat_room_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  is_muted BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

CREATE INDEX idx_chat_room_members_room ON public.chat_room_members(room_id);
CREATE INDEX idx_chat_room_members_user ON public.chat_room_members(user_id);

-- チャットメッセージ
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  attachment_url TEXT,
  attachment_name TEXT,
  reply_to_id UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_room ON public.chat_messages(room_id);
CREATE INDEX idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(created_at DESC);

-- メッセージリアクション
CREATE TABLE IF NOT EXISTS public.chat_message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

-- ============================================
-- 7. RLSポリシー
-- ============================================

-- team_schedules
ALTER TABLE public.team_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view schedules"
  ON public.team_schedules FOR SELECT
  USING (public.is_team_member_of(team_id) OR public.is_admin_or_above());

CREATE POLICY "Team managers can manage schedules"
  ON public.team_schedules FOR ALL
  USING (public.is_team_manager_of(team_id));

-- attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view attendance"
  ON public.attendance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_schedules ts
      WHERE ts.id = attendance.schedule_id
      AND public.is_team_member_of(ts.team_id)
    )
  );

CREATE POLICY "Team members can update own attendance"
  ON public.attendance FOR UPDATE
  USING (responded_by = auth.uid() OR public.is_team_manager_of(
    (SELECT ts.team_id FROM team_schedules ts WHERE ts.id = schedule_id)
  ));

CREATE POLICY "Team managers can manage attendance"
  ON public.attendance FOR ALL
  USING (public.is_team_manager_of(
    (SELECT ts.team_id FROM team_schedules ts WHERE ts.id = schedule_id)
  ));

-- team_board_posts
ALTER TABLE public.team_board_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view posts"
  ON public.team_board_posts FOR SELECT
  USING (public.is_team_member_of(team_id));

CREATE POLICY "Team members can create posts"
  ON public.team_board_posts FOR INSERT
  WITH CHECK (public.is_team_member_of(team_id));

CREATE POLICY "Authors and managers can update posts"
  ON public.team_board_posts FOR UPDATE
  USING (author_id = auth.uid() OR public.is_team_manager_of(team_id));

CREATE POLICY "Authors and managers can delete posts"
  ON public.team_board_posts FOR DELETE
  USING (author_id = auth.uid() OR public.is_team_manager_of(team_id));

-- team_board_comments
ALTER TABLE public.team_board_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view comments"
  ON public.team_board_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_board_posts p
      WHERE p.id = team_board_comments.post_id
      AND public.is_team_member_of(p.team_id)
    )
  );

CREATE POLICY "Team members can create comments"
  ON public.team_board_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_board_posts p
      WHERE p.id = post_id
      AND public.is_team_member_of(p.team_id)
    )
  );

-- team_albums
ALTER TABLE public.team_albums ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view albums"
  ON public.team_albums FOR SELECT
  USING (public.is_team_member_of(team_id) OR is_public = true);

CREATE POLICY "Team members can create albums"
  ON public.team_albums FOR INSERT
  WITH CHECK (public.is_team_member_of(team_id));

CREATE POLICY "Managers can manage albums"
  ON public.team_albums FOR UPDATE
  USING (public.is_team_manager_of(team_id));

-- team_album_photos
ALTER TABLE public.team_album_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view photos"
  ON public.team_album_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_albums a
      WHERE a.id = team_album_photos.album_id
      AND (public.is_team_member_of(a.team_id) OR a.is_public = true)
    )
  );

CREATE POLICY "Team members can add photos"
  ON public.team_album_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_albums a
      WHERE a.id = album_id
      AND public.is_team_member_of(a.team_id)
    )
  );

-- match_requests
ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open match requests"
  ON public.match_requests FOR SELECT
  USING (status = 'open' OR public.is_team_member_of(requesting_team_id));

CREATE POLICY "Team managers can create requests"
  ON public.match_requests FOR INSERT
  WITH CHECK (public.is_team_manager_of(requesting_team_id));

CREATE POLICY "Team managers can update own requests"
  ON public.match_requests FOR UPDATE
  USING (public.is_team_manager_of(requesting_team_id));

-- chat_rooms
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their rooms"
  ON public.chat_rooms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_room_members crm
      WHERE crm.room_id = chat_rooms.id
      AND crm.user_id = auth.uid()
    )
  );

-- chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room members can view messages"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_room_members crm
      WHERE crm.room_id = chat_messages.room_id
      AND crm.user_id = auth.uid()
    )
  );

CREATE POLICY "Room members can send messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_room_members crm
      WHERE crm.room_id = room_id
      AND crm.user_id = auth.uid()
    )
  );

-- ============================================
-- 8. トリガー
-- ============================================
CREATE TRIGGER set_updated_at_team_schedules
  BEFORE UPDATE ON public.team_schedules
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_attendance
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_team_board_posts
  BEFORE UPDATE ON public.team_board_posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_team_albums
  BEFORE UPDATE ON public.team_albums
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_match_requests
  BEFORE UPDATE ON public.match_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_chat_rooms
  BEFORE UPDATE ON public.chat_rooms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 完了メッセージ
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'チームページ機能のテーブルセットアップが完了しました';
  RAISE NOTICE '作成されたテーブル:';
  RAISE NOTICE '- team_schedules (スケジュール)';
  RAISE NOTICE '- attendance (出欠管理)';
  RAISE NOTICE '- team_board_posts, team_board_comments, team_board_reads (掲示板)';
  RAISE NOTICE '- team_albums, team_album_photos (アルバム)';
  RAISE NOTICE '- match_requests, match_request_responses (マッチメイク)';
  RAISE NOTICE '- chat_rooms, chat_room_members, chat_messages, chat_message_reactions (コミュニケーション)';
END $$;
