-- ============================================
-- 順位表自動更新システム
-- ============================================
-- 試合結果が追加・更新されたときに自動的にteam_standingsを更新する
-- 作成日: 2025-11-20

-- ============================================
-- 1. チームの戦績を計算して更新する関数
-- ============================================
CREATE OR REPLACE FUNCTION update_team_standing(
  p_season_id UUID,
  p_team_id UUID
) RETURNS VOID AS $$
DECLARE
  v_matches_played INTEGER;
  v_wins INTEGER;
  v_draws INTEGER;
  v_losses INTEGER;
  v_goals_for INTEGER;
  v_goals_against INTEGER;
  v_goal_difference INTEGER;
  v_points INTEGER;
BEGIN
  -- そのチームの全試合結果を集計（finishedステータスのみ）
  SELECT
    COUNT(*) as matches_played,
    SUM(CASE
      WHEN (home_team_id = p_team_id AND home_score > away_score) OR
           (away_team_id = p_team_id AND away_score > home_score)
      THEN 1 ELSE 0 END) as wins,
    SUM(CASE
      WHEN home_score = away_score
      THEN 1 ELSE 0 END) as draws,
    SUM(CASE
      WHEN (home_team_id = p_team_id AND home_score < away_score) OR
           (away_team_id = p_team_id AND away_score < home_score)
      THEN 1 ELSE 0 END) as losses,
    SUM(CASE
      WHEN home_team_id = p_team_id THEN COALESCE(home_score, 0)
      WHEN away_team_id = p_team_id THEN COALESCE(away_score, 0)
      ELSE 0 END) as goals_for,
    SUM(CASE
      WHEN home_team_id = p_team_id THEN COALESCE(away_score, 0)
      WHEN away_team_id = p_team_id THEN COALESCE(home_score, 0)
      ELSE 0 END) as goals_against
  INTO
    v_matches_played,
    v_wins,
    v_draws,
    v_losses,
    v_goals_for,
    v_goals_against
  FROM matches
  WHERE season_id = p_season_id
    AND (home_team_id = p_team_id OR away_team_id = p_team_id)
    AND status = 'finished'
    AND home_score IS NOT NULL
    AND away_score IS NOT NULL;

  -- NULLの場合は0に設定
  v_matches_played := COALESCE(v_matches_played, 0);
  v_wins := COALESCE(v_wins, 0);
  v_draws := COALESCE(v_draws, 0);
  v_losses := COALESCE(v_losses, 0);
  v_goals_for := COALESCE(v_goals_for, 0);
  v_goals_against := COALESCE(v_goals_against, 0);

  -- 得失点差と勝点を計算
  v_goal_difference := v_goals_for - v_goals_against;
  v_points := (v_wins * 3) + (v_draws * 1);

  -- team_standingsに挿入または更新
  INSERT INTO team_standings (
    season_id,
    team_id,
    matches_played,
    wins,
    draws,
    losses,
    goals_for,
    goals_against,
    goal_difference,
    points,
    rank,
    updated_at
  ) VALUES (
    p_season_id,
    p_team_id,
    v_matches_played,
    v_wins,
    v_draws,
    v_losses,
    v_goals_for,
    v_goals_against,
    v_goal_difference,
    v_points,
    NULL, -- rankは後で計算
    NOW()
  )
  ON CONFLICT (season_id, team_id)
  DO UPDATE SET
    matches_played = EXCLUDED.matches_played,
    wins = EXCLUDED.wins,
    draws = EXCLUDED.draws,
    losses = EXCLUDED.losses,
    goals_for = EXCLUDED.goals_for,
    goals_against = EXCLUDED.goals_against,
    goal_difference = EXCLUDED.goal_difference,
    points = EXCLUDED.points,
    updated_at = NOW();

END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. 全チームの順位を再計算する関数
-- ============================================
CREATE OR REPLACE FUNCTION recalculate_all_standings(
  p_season_id UUID
) RETURNS VOID AS $$
BEGIN
  -- 順位を計算して更新
  -- 勝点 > 得失点差 > 総得点 の順で順位を決定
  WITH ranked_teams AS (
    SELECT
      id,
      ROW_NUMBER() OVER (
        ORDER BY
          points DESC,
          goal_difference DESC,
          goals_for DESC,
          team_id ASC -- 同点の場合はチームIDでソート（一貫性のため）
      ) as new_rank
    FROM team_standings
    WHERE season_id = p_season_id
  )
  UPDATE team_standings ts
  SET
    rank = rt.new_rank::INTEGER,
    updated_at = NOW()
  FROM ranked_teams rt
  WHERE ts.id = rt.id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. 試合結果が変更されたときに実行されるトリガー関数
-- ============================================
CREATE OR REPLACE FUNCTION on_match_result_change()
RETURNS TRIGGER AS $$
DECLARE
  v_season_id UUID;
  v_home_team_id UUID;
  v_away_team_id UUID;
BEGIN
  -- INSERTまたはUPDATEの場合
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
    v_season_id := NEW.season_id;
    v_home_team_id := NEW.home_team_id;
    v_away_team_id := NEW.away_team_id;

    -- finishedステータスかつスコアが入力されている場合のみ更新
    IF NEW.status = 'finished' AND NEW.home_score IS NOT NULL AND NEW.away_score IS NOT NULL THEN
      -- 両チームの戦績を更新
      PERFORM update_team_standing(v_season_id, v_home_team_id);
      PERFORM update_team_standing(v_season_id, v_away_team_id);

      -- 全チームの順位を再計算
      PERFORM recalculate_all_standings(v_season_id);
    END IF;
  END IF;

  -- DELETEの場合
  IF (TG_OP = 'DELETE') THEN
    v_season_id := OLD.season_id;
    v_home_team_id := OLD.home_team_id;
    v_away_team_id := OLD.away_team_id;

    -- 両チームの戦績を更新
    PERFORM update_team_standing(v_season_id, v_home_team_id);
    PERFORM update_team_standing(v_season_id, v_away_team_id);

    -- 全チームの順位を再計算
    PERFORM recalculate_all_standings(v_season_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. トリガーを作成
-- ============================================
-- 既存のトリガーがあれば削除
DROP TRIGGER IF EXISTS matches_result_trigger ON matches;

-- 新しいトリガーを作成
CREATE TRIGGER matches_result_trigger
  AFTER INSERT OR UPDATE OR DELETE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION on_match_result_change();

-- ============================================
-- 5. 既存データで順位表を初期化
-- ============================================
-- 現在のシーズンを取得して全チームの戦績を計算
DO $$
DECLARE
  v_current_season_id UUID;
  v_team_record RECORD;
BEGIN
  -- 現在のシーズンを取得
  SELECT id INTO v_current_season_id
  FROM seasons
  WHERE is_current = true
  LIMIT 1;

  IF v_current_season_id IS NOT NULL THEN
    RAISE NOTICE '現在のシーズンID: %', v_current_season_id;

    -- シーズンに参加している全チームの戦績を更新
    FOR v_team_record IN
      SELECT DISTINCT team_id
      FROM (
        SELECT home_team_id as team_id FROM matches WHERE season_id = v_current_season_id
        UNION
        SELECT away_team_id as team_id FROM matches WHERE season_id = v_current_season_id
      ) teams
    LOOP
      RAISE NOTICE 'チーム % の戦績を更新中...', v_team_record.team_id;
      PERFORM update_team_standing(v_current_season_id, v_team_record.team_id);
    END LOOP;

    -- 順位を再計算
    RAISE NOTICE '順位を再計算中...';
    PERFORM recalculate_all_standings(v_current_season_id);

    RAISE NOTICE '順位表の初期化が完了しました！';
  ELSE
    RAISE NOTICE '現在のシーズンが見つかりませんでした';
  END IF;
END $$;

-- ============================================
-- 完了メッセージ
-- ============================================
-- 結果を確認
SELECT
  rank,
  t.name as team_name,
  matches_played,
  wins,
  draws,
  losses,
  goals_for,
  goals_against,
  goal_difference,
  points
FROM team_standings ts
JOIN teams t ON ts.team_id = t.id
JOIN seasons s ON ts.season_id = s.id
WHERE s.is_current = true
ORDER BY rank ASC;
