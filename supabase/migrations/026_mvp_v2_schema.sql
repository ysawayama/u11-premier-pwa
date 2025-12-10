-- ============================================
-- MVP v2（リーグ体験版）スキーマ追加
-- ============================================

-- ============================================
-- 1. matches テーブルに会場詳細カラム追加
-- ============================================
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS venue_address TEXT,
  ADD COLUMN IF NOT EXISTS venue_map_url TEXT,
  ADD COLUMN IF NOT EXISTS venue_parking_info TEXT;

COMMENT ON COLUMN public.matches.venue_address IS '会場住所';
COMMENT ON COLUMN public.matches.venue_map_url IS 'Google Maps等のURL';
COMMENT ON COLUMN public.matches.venue_parking_info IS '駐車場情報・注意事項';

-- ============================================
-- 2. 試合出場記録（match_lineups）テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.match_lineups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,

  -- 出場情報（ピリオド単位で簡略化）
  is_starter BOOLEAN DEFAULT false,
  played_first_half BOOLEAN DEFAULT false,
  played_second_half BOOLEAN DEFAULT false,

  -- 選手情報（試合時点）
  position VARCHAR(10),
  jersey_number INT,

  -- メタ情報
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(match_id, player_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_match_lineups_match ON public.match_lineups(match_id);
CREATE INDEX IF NOT EXISTS idx_match_lineups_player ON public.match_lineups(player_id);
CREATE INDEX IF NOT EXISTS idx_match_lineups_team ON public.match_lineups(team_id);

-- RLS有効化
ALTER TABLE public.match_lineups ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが閲覧可能
CREATE POLICY "Anyone can view match_lineups"
  ON public.match_lineups
  FOR SELECT
  USING (true);

-- コーチ・管理者のみ作成可能
CREATE POLICY "Coaches and admins can insert match_lineups"
  ON public.match_lineups
  FOR INSERT
  WITH CHECK (public.is_coach_or_admin());

-- コーチ・管理者のみ更新可能
CREATE POLICY "Coaches and admins can update match_lineups"
  ON public.match_lineups
  FOR UPDATE
  USING (public.is_coach_or_admin());

-- コーチ・管理者のみ削除可能
CREATE POLICY "Coaches and admins can delete match_lineups"
  ON public.match_lineups
  FOR DELETE
  USING (public.is_coach_or_admin());

-- updated_at自動更新トリガー
CREATE TRIGGER set_updated_at_match_lineups
  BEFORE UPDATE ON public.match_lineups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 3. 選手シーズンサマリー（ビュー）
-- match_lineupsベースで出場数等を集計
-- ============================================
CREATE OR REPLACE VIEW public.player_season_summary AS
SELECT
  p.id as player_id,
  p.family_name,
  p.given_name,
  p.team_id,
  p.uniform_number,
  p.position,
  t.name as team_name,
  t.short_name as team_short_name,
  s.id as season_id,
  s.name as season_name,
  -- 出場統計
  COUNT(DISTINCT ml.match_id) as matches_played,
  COUNT(DISTINCT CASE WHEN ml.is_starter THEN ml.match_id END) as starts,
  -- ゴール・アシスト（match_eventsから）
  COALESCE(SUM(CASE WHEN me.event_type = 'goal' AND me.player_id = p.id THEN 1 ELSE 0 END), 0) as goals,
  -- 初ゴール日
  MIN(CASE WHEN me.event_type = 'goal' AND me.player_id = p.id THEN m.match_date END) as first_goal_date,
  -- 勝敗（チームとして）
  COUNT(DISTINCT CASE
    WHEN m.status = 'finished' AND (
      (ml.team_id = m.home_team_id AND m.home_score > m.away_score) OR
      (ml.team_id = m.away_team_id AND m.away_score > m.home_score)
    ) THEN m.id
  END) as wins,
  COUNT(DISTINCT CASE
    WHEN m.status = 'finished' AND m.home_score = m.away_score THEN m.id
  END) as draws,
  COUNT(DISTINCT CASE
    WHEN m.status = 'finished' AND (
      (ml.team_id = m.home_team_id AND m.home_score < m.away_score) OR
      (ml.team_id = m.away_team_id AND m.away_score < m.home_score)
    ) THEN m.id
  END) as losses
FROM public.players p
INNER JOIN public.teams t ON p.team_id = t.id
CROSS JOIN public.seasons s
LEFT JOIN public.match_lineups ml ON p.id = ml.player_id
LEFT JOIN public.matches m ON ml.match_id = m.id AND m.season_id = s.id
LEFT JOIN public.match_events me ON m.id = me.match_id AND me.player_id = p.id
WHERE p.is_active = true
GROUP BY p.id, p.family_name, p.given_name, p.team_id, p.uniform_number, p.position,
         t.name, t.short_name, s.id, s.name;

COMMENT ON VIEW public.player_season_summary IS '選手のシーズン成績サマリー（出場数・ゴール・勝敗等）';
