-- ============================================
-- ヘルパー関数
-- RLSポリシーで使用する認証・権限チェック関数
-- ============================================

-- コーチまたは管理者かチェック
CREATE OR REPLACE FUNCTION public.is_coach_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND user_type IN ('coach', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 管理者かチェック
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
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
-- ============================================
-- U-11プレミアリーグ シードデータ
-- 実際のプレミアリーグU-11の地域構造に基づく
-- ============================================

-- ============================================
-- 1. 地域データ（9地域）
-- ============================================
INSERT INTO public.regions (name, name_en, display_order) VALUES
  ('北海道', 'hokkaido', 1),
  ('東北', 'tohoku', 2),
  ('関東', 'kanto', 3),
  ('北陸・信越', 'hokuriku-shinetsu', 4),
  ('東海', 'tokai', 5),
  ('関西', 'kansai', 6),
  ('中国', 'chugoku', 7),
  ('四国', 'shikoku', 8),
  ('九州・沖縄', 'kyushu-okinawa', 9)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. 都道府県データ（38都道府県）
-- ============================================

-- 北海道
INSERT INTO public.prefectures (region_id, name, name_en, code, display_order)
SELECT r.id, '北海道', 'hokkaido', '01', 1
FROM public.regions r WHERE r.name_en = 'hokkaido'
ON CONFLICT (name) DO NOTHING;

-- 東北（6県）
INSERT INTO public.prefectures (region_id, name, name_en, code, display_order)
SELECT r.id, '青森県', 'aomori', '02', 2 FROM public.regions r WHERE r.name_en = 'tohoku'
UNION ALL
SELECT r.id, '岩手県', 'iwate', '03', 3 FROM public.regions r WHERE r.name_en = 'tohoku'
UNION ALL
SELECT r.id, '宮城県', 'miyagi', '04', 4 FROM public.regions r WHERE r.name_en = 'tohoku'
UNION ALL
SELECT r.id, '秋田県', 'akita', '05', 5 FROM public.regions r WHERE r.name_en = 'tohoku'
UNION ALL
SELECT r.id, '山形県', 'yamagata', '06', 6 FROM public.regions r WHERE r.name_en = 'tohoku'
UNION ALL
SELECT r.id, '福島県', 'fukushima', '07', 7 FROM public.regions r WHERE r.name_en = 'tohoku'
ON CONFLICT (name) DO NOTHING;

-- 関東（8都県）※山梨県を含む
INSERT INTO public.prefectures (region_id, name, name_en, code, display_order)
SELECT r.id, '茨城県', 'ibaraki', '08', 8 FROM public.regions r WHERE r.name_en = 'kanto'
UNION ALL
SELECT r.id, '栃木県', 'tochigi', '09', 9 FROM public.regions r WHERE r.name_en = 'kanto'
UNION ALL
SELECT r.id, '群馬県', 'gunma', '10', 10 FROM public.regions r WHERE r.name_en = 'kanto'
UNION ALL
SELECT r.id, '埼玉県', 'saitama', '11', 11 FROM public.regions r WHERE r.name_en = 'kanto'
UNION ALL
SELECT r.id, '千葉県', 'chiba', '12', 12 FROM public.regions r WHERE r.name_en = 'kanto'
UNION ALL
SELECT r.id, '東京都', 'tokyo', '13', 13 FROM public.regions r WHERE r.name_en = 'kanto'
UNION ALL
SELECT r.id, '神奈川県', 'kanagawa', '14', 14 FROM public.regions r WHERE r.name_en = 'kanto'
UNION ALL
SELECT r.id, '山梨県', 'yamanashi', '19', 15 FROM public.regions r WHERE r.name_en = 'kanto'
ON CONFLICT (name) DO NOTHING;

-- 北陸・信越（5県）
INSERT INTO public.prefectures (region_id, name, name_en, code, display_order)
SELECT r.id, '新潟県', 'niigata', '15', 16 FROM public.regions r WHERE r.name_en = 'hokuriku-shinetsu'
UNION ALL
SELECT r.id, '富山県', 'toyama', '16', 17 FROM public.regions r WHERE r.name_en = 'hokuriku-shinetsu'
UNION ALL
SELECT r.id, '石川県', 'ishikawa', '17', 18 FROM public.regions r WHERE r.name_en = 'hokuriku-shinetsu'
UNION ALL
SELECT r.id, '福井県', 'fukui', '18', 19 FROM public.regions r WHERE r.name_en = 'hokuriku-shinetsu'
UNION ALL
SELECT r.id, '長野県', 'nagano', '20', 20 FROM public.regions r WHERE r.name_en = 'hokuriku-shinetsu'
ON CONFLICT (name) DO NOTHING;

-- 東海（2県）
INSERT INTO public.prefectures (region_id, name, name_en, code, display_order)
SELECT r.id, '愛知県', 'aichi', '23', 21 FROM public.regions r WHERE r.name_en = 'tokai'
UNION ALL
SELECT r.id, '三重県', 'mie', '24', 22 FROM public.regions r WHERE r.name_en = 'tokai'
ON CONFLICT (name) DO NOTHING;

-- 関西（4府県）
INSERT INTO public.prefectures (region_id, name, name_en, code, display_order)
SELECT r.id, '京都府', 'kyoto', '26', 23 FROM public.regions r WHERE r.name_en = 'kansai'
UNION ALL
SELECT r.id, '大阪府', 'osaka', '27', 24 FROM public.regions r WHERE r.name_en = 'kansai'
UNION ALL
SELECT r.id, '兵庫県', 'hyogo', '28', 25 FROM public.regions r WHERE r.name_en = 'kansai'
UNION ALL
SELECT r.id, '奈良県', 'nara', '29', 26 FROM public.regions r WHERE r.name_en = 'kansai'
ON CONFLICT (name) DO NOTHING;

-- 中国（4県）
INSERT INTO public.prefectures (region_id, name, name_en, code, display_order)
SELECT r.id, '鳥取県', 'tottori', '31', 27 FROM public.regions r WHERE r.name_en = 'chugoku'
UNION ALL
SELECT r.id, '島根県', 'shimane', '32', 28 FROM public.regions r WHERE r.name_en = 'chugoku'
UNION ALL
SELECT r.id, '岡山県', 'okayama', '33', 29 FROM public.regions r WHERE r.name_en = 'chugoku'
UNION ALL
SELECT r.id, '山口県', 'yamaguchi', '35', 30 FROM public.regions r WHERE r.name_en = 'chugoku'
ON CONFLICT (name) DO NOTHING;

-- 四国（1県）
INSERT INTO public.prefectures (region_id, name, name_en, code, display_order)
SELECT r.id, '愛媛県', 'ehime', '38', 31
FROM public.regions r WHERE r.name_en = 'shikoku'
ON CONFLICT (name) DO NOTHING;

-- 九州・沖縄（8県）
INSERT INTO public.prefectures (region_id, name, name_en, code, display_order)
SELECT r.id, '福岡県', 'fukuoka', '40', 32 FROM public.regions r WHERE r.name_en = 'kyushu-okinawa'
UNION ALL
SELECT r.id, '佐賀県', 'saga', '41', 33 FROM public.regions r WHERE r.name_en = 'kyushu-okinawa'
UNION ALL
SELECT r.id, '長崎県', 'nagasaki', '42', 34 FROM public.regions r WHERE r.name_en = 'kyushu-okinawa'
UNION ALL
SELECT r.id, '熊本県', 'kumamoto', '43', 35 FROM public.regions r WHERE r.name_en = 'kyushu-okinawa'
UNION ALL
SELECT r.id, '大分県', 'oita', '44', 36 FROM public.regions r WHERE r.name_en = 'kyushu-okinawa'
UNION ALL
SELECT r.id, '宮崎県', 'miyazaki', '45', 37 FROM public.regions r WHERE r.name_en = 'kyushu-okinawa'
UNION ALL
SELECT r.id, '鹿児島県', 'kagoshima', '46', 38 FROM public.regions r WHERE r.name_en = 'kyushu-okinawa'
UNION ALL
SELECT r.id, '沖縄県', 'okinawa', '47', 39 FROM public.regions r WHERE r.name_en = 'kyushu-okinawa'
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 3. サンプルチームデータ
-- ============================================

-- 東京都のサンプルチーム
INSERT INTO public.teams (prefecture_id, name, name_kana, short_name, founded_year, is_active)
SELECT p.id, 'バディーSC', 'バディーエスシー', 'バディー', 1989, true
FROM public.prefectures p WHERE p.name_en = 'tokyo'
ON CONFLICT (prefecture_id, name) DO NOTHING;

INSERT INTO public.teams (prefecture_id, name, name_kana, short_name, founded_year, is_active)
SELECT p.id, 'FC東京U-12', 'エフシートウキョウユーイチニ', 'FC東京', 1999, true
FROM public.prefectures p WHERE p.name_en = 'tokyo'
ON CONFLICT (prefecture_id, name) DO NOTHING;

-- 神奈川県のサンプルチーム
INSERT INTO public.teams (prefecture_id, name, name_kana, short_name, founded_year, is_active)
SELECT p.id, '横浜F・マリノスプライマリー', 'ヨコハマエフマリノスプライマリー', 'F・マリノス', 1972, true
FROM public.prefectures p WHERE p.name_en = 'kanagawa'
ON CONFLICT (prefecture_id, name) DO NOTHING;

INSERT INTO public.teams (prefecture_id, name, name_kana, short_name, founded_year, is_active)
SELECT p.id, '川崎フロンターレU-12', 'カワサキフロンターレユーイチニ', 'フロンターレ', 1997, true
FROM public.prefectures p WHERE p.name_en = 'kanagawa'
ON CONFLICT (prefecture_id, name) DO NOTHING;

-- 大阪府のサンプルチーム
INSERT INTO public.teams (prefecture_id, name, name_kana, short_name, founded_year, is_active)
SELECT p.id, 'セレッソ大阪U-12', 'セレッソオオサカユーイチニ', 'セレッソ', 1957, true
FROM public.prefectures p WHERE p.name_en = 'osaka'
ON CONFLICT (prefecture_id, name) DO NOTHING;

INSERT INTO public.teams (prefecture_id, name, name_kana, short_name, founded_year, is_active)
SELECT p.id, 'ガンバ大阪ジュニア', 'ガンバオオサカジュニア', 'ガンバ', 1980, true
FROM public.prefectures p WHERE p.name_en = 'osaka'
ON CONFLICT (prefecture_id, name) DO NOTHING;

-- ============================================
-- 4. サンプルシーズンデータ
-- ============================================
INSERT INTO public.seasons (name, start_date, end_date, is_current, championship_date, championship_venue) VALUES
  ('2024-2025', '2024-04-01', '2025-03-31', false, '2024-07-28', '未定'),
  ('2025-2026', '2025-04-01', '2026-03-31', true, '2025-07-27', '未定')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 5. サンプル選手データ（テスト用）
-- ============================================

-- バディーSCの選手サンプル
INSERT INTO public.players (
  team_id,
  family_name,
  given_name,
  family_name_kana,
  given_name_kana,
  date_of_birth,
  grade,
  uniform_number,
  position,
  is_active
)
SELECT
  t.id,
  '山田',
  '太郎',
  'ヤマダ',
  'タロウ',
  '2014-05-15',
  5,
  10,
  'FW',
  true
FROM public.teams t
WHERE t.name = 'バディーSC'
ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO NOTHING;

INSERT INTO public.players (
  team_id,
  family_name,
  given_name,
  family_name_kana,
  given_name_kana,
  date_of_birth,
  grade,
  uniform_number,
  position,
  is_active
)
SELECT
  t.id,
  '佐藤',
  '次郎',
  'サトウ',
  'ジロウ',
  '2014-08-20',
  5,
  7,
  'MF',
  true
FROM public.teams t
WHERE t.name = 'バディーSC'
ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO NOTHING;

-- FC東京U-12の選手サンプル
INSERT INTO public.players (
  team_id,
  family_name,
  given_name,
  family_name_kana,
  given_name_kana,
  date_of_birth,
  grade,
  uniform_number,
  position,
  is_active
)
SELECT
  t.id,
  '田中',
  '健太',
  'タナカ',
  'ケンタ',
  '2014-03-10',
  5,
  9,
  'FW',
  true
FROM public.teams t
WHERE t.name = 'FC東京U-12'
ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO NOTHING;
