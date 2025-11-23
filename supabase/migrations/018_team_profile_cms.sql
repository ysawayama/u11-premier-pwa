-- ============================================
-- チームプロフィール（公開ページ）CMS機能
-- ============================================

-- ============================================
-- 1. teamsテーブルにCMS用カラム追加
-- ============================================
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS concept TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS philosophy TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS training_schedule TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS practice_location TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS target_age TEXT; -- 対象年齢
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS monthly_fee TEXT; -- 月謝情報
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS entry_fee TEXT; -- 入会費
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS achievements TEXT; -- 実績・受賞歴
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS sns_twitter TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS sns_instagram TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS sns_facebook TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS sns_youtube TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS contact_form_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS accepting_members BOOLEAN DEFAULT true; -- 部員募集中
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS accepting_matches BOOLEAN DEFAULT true; -- 練習試合募集中

-- ============================================
-- 2. チームギャラリー（複数画像）
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_gallery_team ON public.team_gallery(team_id);
CREATE INDEX idx_team_gallery_order ON public.team_gallery(sort_order);

-- RLS
ALTER TABLE public.team_gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view visible gallery images"
  ON public.team_gallery FOR SELECT
  USING (is_visible = true OR public.is_team_manager_of(team_id));

CREATE POLICY "Team managers can manage gallery"
  ON public.team_gallery FOR ALL
  USING (public.is_team_manager_of(team_id));

-- ============================================
-- 3. お問い合わせフォーム
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('join', 'match', 'general', 'other')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  child_name TEXT, -- 入団希望の場合
  child_grade TEXT, -- 学年
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
  replied_at TIMESTAMPTZ,
  replied_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT, -- 管理者メモ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_inquiries_team ON public.team_inquiries(team_id);
CREATE INDEX idx_team_inquiries_status ON public.team_inquiries(status);
CREATE INDEX idx_team_inquiries_type ON public.team_inquiries(inquiry_type);

-- RLS
ALTER TABLE public.team_inquiries ENABLE ROW LEVEL SECURITY;

-- 誰でも問い合わせ可能
CREATE POLICY "Anyone can create inquiries"
  ON public.team_inquiries FOR INSERT
  WITH CHECK (true);

-- チーム代表のみ閲覧・管理可能
CREATE POLICY "Team managers can view and manage inquiries"
  ON public.team_inquiries FOR SELECT
  USING (public.is_team_manager_of(team_id));

CREATE POLICY "Team managers can update inquiries"
  ON public.team_inquiries FOR UPDATE
  USING (public.is_team_manager_of(team_id));

-- ============================================
-- 4. teamsテーブルの更新権限
-- ============================================

-- 既存ポリシーを更新してチーム代表も編集可能に
DROP POLICY IF EXISTS "Coaches and admins can update teams" ON public.teams;

CREATE POLICY "Team managers can update own team"
  ON public.teams FOR UPDATE
  USING (public.is_team_manager_of(id));

-- ============================================
-- 5. トリガー
-- ============================================
CREATE TRIGGER set_updated_at_team_gallery
  BEFORE UPDATE ON public.team_gallery
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_team_inquiries
  BEFORE UPDATE ON public.team_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 完了メッセージ
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'チームプロフィールCMS機能のセットアップが完了しました';
  RAISE NOTICE '追加されたカラム: hero_image_url, description, concept, philosophy, training_schedule, etc.';
  RAISE NOTICE '追加されたテーブル: team_gallery, team_inquiries';
END $$;
