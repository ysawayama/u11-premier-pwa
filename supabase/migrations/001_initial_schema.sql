-- ============================================
-- U-11プレミアリーグ 初期スキーマ作成
-- ============================================

-- ============================================
-- 1. 地域（regions）テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  name_en TEXT UNIQUE NOT NULL,
  display_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS有効化
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが閲覧可能
CREATE POLICY "Anyone can view regions"
  ON public.regions
  FOR SELECT
  USING (true);

-- 管理者のみ作成・更新可能
CREATE POLICY "Admins can insert regions"
  ON public.regions
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update regions"
  ON public.regions
  FOR UPDATE
  USING (public.is_admin());

-- ============================================
-- 2. 都道府県（prefectures）テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.prefectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  name TEXT UNIQUE NOT NULL,
  name_en TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  display_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS有効化
ALTER TABLE public.prefectures ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが閲覧可能
CREATE POLICY "Anyone can view prefectures"
  ON public.prefectures
  FOR SELECT
  USING (true);

-- 管理者のみ作成・更新可能
CREATE POLICY "Admins can insert prefectures"
  ON public.prefectures
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update prefectures"
  ON public.prefectures
  FOR UPDATE
  USING (public.is_admin());

-- ============================================
-- 3. チーム（teams）テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefecture_id UUID NOT NULL REFERENCES public.prefectures(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_kana TEXT,
  short_name TEXT,
  logo_url TEXT,
  founded_year INT,
  home_ground TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(prefecture_id, name)
);

-- インデックス
CREATE INDEX idx_teams_prefecture ON public.teams(prefecture_id);
CREATE INDEX idx_teams_active ON public.teams(is_active);

-- RLS有効化
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが閲覧可能
CREATE POLICY "Anyone can view teams"
  ON public.teams
  FOR SELECT
  USING (true);

-- コーチ・管理者のみ作成・更新可能
CREATE POLICY "Coaches and admins can insert teams"
  ON public.teams
  FOR INSERT
  WITH CHECK (public.is_coach_or_admin());

CREATE POLICY "Coaches and admins can update teams"
  ON public.teams
  FOR UPDATE
  USING (public.is_coach_or_admin());

-- ============================================
-- 4. 選手（players）テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

  -- 基本情報
  family_name TEXT NOT NULL,
  given_name TEXT NOT NULL,
  family_name_kana TEXT NOT NULL,
  given_name_kana TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  grade INT NOT NULL CHECK (grade >= 1 AND grade <= 6),

  -- 選手情報
  uniform_number INT,
  position TEXT,
  photo_url TEXT,

  -- デジタル選手証
  player_card_number TEXT UNIQUE,
  qr_code_data TEXT,
  card_issued_at TIMESTAMPTZ,
  card_expires_at TIMESTAMPTZ,

  -- メタ情報
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(team_id, family_name, given_name, date_of_birth)
);

-- インデックス
CREATE INDEX idx_players_team ON public.players(team_id);
CREATE INDEX idx_players_user ON public.players(user_id);
CREATE INDEX idx_players_card_number ON public.players(player_card_number);
CREATE INDEX idx_players_active ON public.players(is_active);

-- RLS有効化
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが閲覧可能
CREATE POLICY "Anyone can view players"
  ON public.players
  FOR SELECT
  USING (true);

-- コーチ・管理者のみ作成・更新可能
CREATE POLICY "Coaches and admins can insert players"
  ON public.players
  FOR INSERT
  WITH CHECK (public.is_coach_or_admin());

CREATE POLICY "Coaches and admins can update players"
  ON public.players
  FOR UPDATE
  USING (public.is_coach_or_admin());

-- ============================================
-- 5. シーズン（seasons）テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false,
  championship_date DATE,
  championship_venue TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS有効化
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが閲覧可能
CREATE POLICY "Anyone can view seasons"
  ON public.seasons
  FOR SELECT
  USING (true);

-- 管理者のみ作成・更新可能
CREATE POLICY "Admins can insert seasons"
  ON public.seasons
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update seasons"
  ON public.seasons
  FOR UPDATE
  USING (public.is_admin());

-- ============================================
-- 6. 試合（matches）テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,

  -- 試合情報
  match_date TIMESTAMPTZ NOT NULL,
  venue TEXT NOT NULL,
  match_type TEXT NOT NULL CHECK (match_type IN ('league', 'championship', 'friendly')),
  round TEXT,

  -- チーム情報
  home_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  away_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,

  -- スコア
  home_score INT,
  away_score INT,

  -- 試合状態
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'finished', 'cancelled')),

  -- 詳細情報
  weather TEXT,
  temperature DECIMAL(4,1),
  attendance INT,
  referee TEXT,
  notes TEXT,

  -- メタ情報
  created_by UUID REFERENCES public.users(id),
  updated_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (home_team_id != away_team_id)
);

-- インデックス
CREATE INDEX idx_matches_season ON public.matches(season_id);
CREATE INDEX idx_matches_home_team ON public.matches(home_team_id);
CREATE INDEX idx_matches_away_team ON public.matches(away_team_id);
CREATE INDEX idx_matches_date ON public.matches(match_date);
CREATE INDEX idx_matches_status ON public.matches(status);

-- RLS有効化
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが閲覧可能
CREATE POLICY "Anyone can view matches"
  ON public.matches
  FOR SELECT
  USING (true);

-- コーチ・管理者のみ作成・更新可能
CREATE POLICY "Coaches and admins can insert matches"
  ON public.matches
  FOR INSERT
  WITH CHECK (public.is_coach_or_admin());

CREATE POLICY "Coaches and admins can update matches"
  ON public.matches
  FOR UPDATE
  USING (public.is_coach_or_admin());

-- ============================================
-- 7. 試合イベント（match_events）テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,

  -- イベント情報
  event_type TEXT NOT NULL CHECK (event_type IN ('goal', 'yellow_card', 'red_card', 'substitution')),
  minute INT NOT NULL CHECK (minute >= 0 AND minute <= 120),
  description TEXT,

  -- 交代時の情報
  substitution_player_out_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  substitution_player_in_id UUID REFERENCES public.players(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_match_events_match ON public.match_events(match_id);
CREATE INDEX idx_match_events_player ON public.match_events(player_id);
CREATE INDEX idx_match_events_team ON public.match_events(team_id);

-- RLS有効化
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが閲覧可能
CREATE POLICY "Anyone can view match_events"
  ON public.match_events
  FOR SELECT
  USING (true);

-- コーチ・管理者のみ作成・更新可能
CREATE POLICY "Coaches and admins can insert match_events"
  ON public.match_events
  FOR INSERT
  WITH CHECK (public.is_coach_or_admin());

-- ============================================
-- 8. 順位表（team_standings）テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.team_standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,

  -- 成績
  matches_played INT DEFAULT 0,
  wins INT DEFAULT 0,
  draws INT DEFAULT 0,
  losses INT DEFAULT 0,
  goals_for INT DEFAULT 0,
  goals_against INT DEFAULT 0,
  goal_difference INT DEFAULT 0,
  points INT DEFAULT 0,

  -- ランキング
  rank INT,

  -- メタ情報
  last_calculated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(season_id, team_id)
);

-- インデックス
CREATE INDEX idx_team_standings_season ON public.team_standings(season_id);
CREATE INDEX idx_team_standings_team ON public.team_standings(team_id);
CREATE INDEX idx_team_standings_points ON public.team_standings(points DESC);

-- RLS有効化
ALTER TABLE public.team_standings ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが閲覧可能
CREATE POLICY "Anyone can view team_standings"
  ON public.team_standings
  FOR SELECT
  USING (true);

-- 管理者のみ作成・更新可能（自動計算される想定）
CREATE POLICY "Admins can insert team_standings"
  ON public.team_standings
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update team_standings"
  ON public.team_standings
  FOR UPDATE
  USING (public.is_admin());

-- ============================================
-- 9. 選手成績（player_stats）テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,

  -- 成績
  matches_played INT DEFAULT 0,
  goals INT DEFAULT 0,
  assists INT DEFAULT 0,
  yellow_cards INT DEFAULT 0,
  red_cards INT DEFAULT 0,

  -- メタ情報
  last_calculated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(season_id, player_id)
);

-- インデックス
CREATE INDEX idx_player_stats_season ON public.player_stats(season_id);
CREATE INDEX idx_player_stats_player ON public.player_stats(player_id);
CREATE INDEX idx_player_stats_goals ON public.player_stats(goals DESC);

-- RLS有効化
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが閲覧可能
CREATE POLICY "Anyone can view player_stats"
  ON public.player_stats
  FOR SELECT
  USING (true);

-- 管理者のみ作成・更新可能（自動計算される想定）
CREATE POLICY "Admins can insert player_stats"
  ON public.player_stats
  FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update player_stats"
  ON public.player_stats
  FOR UPDATE
  USING (public.is_admin());

-- ============================================
-- トリガー: updated_at自動更新
-- ============================================
CREATE TRIGGER set_updated_at_regions
  BEFORE UPDATE ON public.regions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_prefectures
  BEFORE UPDATE ON public.prefectures
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_teams
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_players
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_seasons
  BEFORE UPDATE ON public.seasons
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_matches
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_team_standings
  BEFORE UPDATE ON public.team_standings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_player_stats
  BEFORE UPDATE ON public.player_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
