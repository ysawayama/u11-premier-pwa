-- ============================================
-- 選手ページ機能
-- ============================================

-- ============================================
-- 1. playersテーブルに追加フィールド
-- ============================================
ALTER TABLE public.players
ADD COLUMN IF NOT EXISTS height INT,
ADD COLUMN IF NOT EXISTS weight INT,
ADD COLUMN IF NOT EXISTS dominant_foot TEXT CHECK (dominant_foot IN ('right', 'left', 'both')),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

COMMENT ON COLUMN public.players.height IS '身長（cm）';
COMMENT ON COLUMN public.players.weight IS '体重（kg）';
COMMENT ON COLUMN public.players.dominant_foot IS '利き足';
COMMENT ON COLUMN public.players.bio IS '自己紹介';
COMMENT ON COLUMN public.players.hero_image_url IS 'ヒーロー画像URL';

-- ============================================
-- 2. サッカーライフログ（活動記録）
-- ============================================
CREATE TABLE IF NOT EXISTS public.soccer_life_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  log_type TEXT NOT NULL CHECK (log_type IN ('practice', 'match', 'training', 'study', 'other')),
  title TEXT NOT NULL,
  content TEXT,
  mood INT CHECK (mood >= 1 AND mood <= 5), -- 1-5のコンディション
  duration_minutes INT,
  image_urls TEXT[], -- 複数画像対応
  is_public BOOLEAN DEFAULT false, -- チーム内公開フラグ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_soccer_life_logs_player ON public.soccer_life_logs(player_id);
CREATE INDEX idx_soccer_life_logs_date ON public.soccer_life_logs(log_date DESC);
CREATE INDEX idx_soccer_life_logs_type ON public.soccer_life_logs(log_type);

-- RLS
ALTER TABLE public.soccer_life_logs ENABLE ROW LEVEL SECURITY;

-- 本人は全て閲覧可能
CREATE POLICY "Players can view own logs"
  ON public.soccer_life_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.players p
      WHERE p.id = soccer_life_logs.player_id
      AND p.user_id = auth.uid()
    )
  );

-- チームメンバーは公開ログのみ閲覧可能
CREATE POLICY "Team members can view public logs"
  ON public.soccer_life_logs FOR SELECT
  USING (
    is_public = true
    AND EXISTS (
      SELECT 1 FROM public.players p
      JOIN public.team_members tm ON tm.team_id = p.team_id
      WHERE p.id = soccer_life_logs.player_id
      AND tm.user_id = auth.uid()
      AND tm.is_active = true
    )
  );

-- 本人のみ作成・更新・削除可能
CREATE POLICY "Players can insert own logs"
  ON public.soccer_life_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.players p
      WHERE p.id = soccer_life_logs.player_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Players can update own logs"
  ON public.soccer_life_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.players p
      WHERE p.id = soccer_life_logs.player_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Players can delete own logs"
  ON public.soccer_life_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.players p
      WHERE p.id = soccer_life_logs.player_id
      AND p.user_id = auth.uid()
    )
  );

-- ============================================
-- 3. サッカーノート（振り返りシート）
-- ============================================
CREATE TABLE IF NOT EXISTS public.soccer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.team_schedules(id) ON DELETE SET NULL,
  match_id UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  note_date DATE NOT NULL,

  -- 振り返り内容
  title TEXT,
  what_went_well TEXT, -- 良かった点
  what_to_improve TEXT, -- 改善点
  next_goal TEXT, -- 次の目標
  self_rating INT CHECK (self_rating >= 1 AND self_rating <= 5), -- 自己評価

  -- コーチからのコメント
  coach_comment TEXT,
  coach_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  coach_commented_at TIMESTAMPTZ,

  -- メタ情報
  is_reviewed BOOLEAN DEFAULT false, -- コーチ確認済みフラグ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_soccer_notes_player ON public.soccer_notes(player_id);
CREATE INDEX idx_soccer_notes_date ON public.soccer_notes(note_date DESC);
CREATE INDEX idx_soccer_notes_schedule ON public.soccer_notes(schedule_id);
CREATE INDEX idx_soccer_notes_match ON public.soccer_notes(match_id);
CREATE INDEX idx_soccer_notes_reviewed ON public.soccer_notes(is_reviewed);

-- RLS
ALTER TABLE public.soccer_notes ENABLE ROW LEVEL SECURITY;

-- 本人とコーチ/代表が閲覧可能
CREATE POLICY "Players and coaches can view notes"
  ON public.soccer_notes FOR SELECT
  USING (
    -- 本人
    EXISTS (
      SELECT 1 FROM public.players p
      WHERE p.id = soccer_notes.player_id
      AND p.user_id = auth.uid()
    )
    OR
    -- コーチ・代表
    EXISTS (
      SELECT 1 FROM public.players p
      JOIN public.team_members tm ON tm.team_id = p.team_id
      WHERE p.id = soccer_notes.player_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('manager', 'coach')
      AND tm.is_active = true
    )
    OR
    -- 管理者
    public.is_admin_or_above()
  );

-- 本人のみ作成可能
CREATE POLICY "Players can insert own notes"
  ON public.soccer_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.players p
      WHERE p.id = soccer_notes.player_id
      AND p.user_id = auth.uid()
    )
  );

-- 本人は自分のノートを更新可能（コーチコメント部分以外）
CREATE POLICY "Players can update own notes"
  ON public.soccer_notes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.players p
      WHERE p.id = soccer_notes.player_id
      AND p.user_id = auth.uid()
    )
  );

-- コーチは担当チームのノートにコメント可能
CREATE POLICY "Coaches can update notes for comment"
  ON public.soccer_notes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.players p
      JOIN public.team_members tm ON tm.team_id = p.team_id
      WHERE p.id = soccer_notes.player_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('manager', 'coach')
      AND tm.is_active = true
    )
  );

-- ============================================
-- 4. 選手アルバム（個人アルバム）
-- ============================================
CREATE TABLE IF NOT EXISTS public.player_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  event_date DATE,
  is_public BOOLEAN DEFAULT false, -- チーム内公開フラグ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_player_albums_player ON public.player_albums(player_id);
CREATE INDEX idx_player_albums_date ON public.player_albums(event_date DESC);

-- アルバム内の写真・動画
CREATE TABLE IF NOT EXISTS public.player_album_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES public.player_albums(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  caption TEXT,
  taken_at TIMESTAMPTZ,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_player_album_media_album ON public.player_album_media(album_id);
CREATE INDEX idx_player_album_media_order ON public.player_album_media(sort_order);

-- RLS
ALTER TABLE public.player_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_album_media ENABLE ROW LEVEL SECURITY;

-- アルバム閲覧ポリシー
CREATE POLICY "Players can view own albums"
  ON public.player_albums FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.players p
      WHERE p.id = player_albums.player_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can view public albums"
  ON public.player_albums FOR SELECT
  USING (
    is_public = true
    AND EXISTS (
      SELECT 1 FROM public.players p
      JOIN public.team_members tm ON tm.team_id = p.team_id
      WHERE p.id = player_albums.player_id
      AND tm.user_id = auth.uid()
      AND tm.is_active = true
    )
  );

-- アルバム作成・更新・削除ポリシー
CREATE POLICY "Players can manage own albums"
  ON public.player_albums FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.players p
      WHERE p.id = player_albums.player_id
      AND p.user_id = auth.uid()
    )
  );

-- メディア閲覧ポリシー
CREATE POLICY "Can view media of accessible albums"
  ON public.player_album_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.player_albums pa
      JOIN public.players p ON p.id = pa.player_id
      WHERE pa.id = player_album_media.album_id
      AND (
        p.user_id = auth.uid()
        OR (
          pa.is_public = true
          AND EXISTS (
            SELECT 1 FROM public.team_members tm
            WHERE tm.team_id = p.team_id
            AND tm.user_id = auth.uid()
            AND tm.is_active = true
          )
        )
      )
    )
  );

-- メディア管理ポリシー
CREATE POLICY "Players can manage own album media"
  ON public.player_album_media FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.player_albums pa
      JOIN public.players p ON p.id = pa.player_id
      WHERE pa.id = player_album_media.album_id
      AND p.user_id = auth.uid()
    )
  );

-- ============================================
-- 5. トリガー
-- ============================================
CREATE TRIGGER set_updated_at_soccer_life_logs
  BEFORE UPDATE ON public.soccer_life_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_soccer_notes
  BEFORE UPDATE ON public.soccer_notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_player_albums
  BEFORE UPDATE ON public.player_albums
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 6. 選手のパフォーマンスを取得するビュー
-- ============================================
CREATE OR REPLACE VIEW public.player_performance AS
SELECT
  p.id AS player_id,
  p.team_id,
  p.family_name,
  p.given_name,
  p.uniform_number,
  p.position,
  -- 出欠統計
  COUNT(DISTINCT CASE WHEN a.status = 'attending' THEN a.schedule_id END) AS practice_attendance_count,
  -- 試合統計（player_statsから）
  COALESCE(ps.matches_played, 0) AS matches_played,
  COALESCE(ps.goals, 0) AS goals,
  COALESCE(ps.assists, 0) AS assists,
  COALESCE(ps.yellow_cards, 0) AS yellow_cards,
  COALESCE(ps.red_cards, 0) AS red_cards
FROM public.players p
LEFT JOIN public.attendance a ON a.player_id = p.id
LEFT JOIN public.player_stats ps ON ps.player_id = p.id
  AND ps.season_id = (SELECT id FROM public.seasons WHERE is_current = true LIMIT 1)
WHERE p.is_active = true
GROUP BY p.id, p.team_id, p.family_name, p.given_name, p.uniform_number, p.position,
         ps.matches_played, ps.goals, ps.assists, ps.yellow_cards, ps.red_cards;

-- ============================================
-- 完了メッセージ
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '選手ページ機能のセットアップが完了しました';
  RAISE NOTICE '追加されたカラム: height, weight, dominant_foot, bio, hero_image_url';
  RAISE NOTICE '追加されたテーブル: soccer_life_logs, soccer_notes, player_albums, player_album_media';
END $$;
