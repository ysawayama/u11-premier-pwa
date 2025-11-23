-- ============================================
-- 選手データと得点イベントを完全クリーンアップ
-- ============================================

DO $$
DECLARE
  v_season_id UUID;
  v_kanagawa_id UUID;
  v_event_count INT;
  v_player_count INT;
BEGIN
  -- 神奈川県IDを取得
  SELECT id INTO v_kanagawa_id FROM prefectures WHERE name = '神奈川県';

  -- 2025-2026シーズンIDを取得
  SELECT id INTO v_season_id FROM seasons WHERE name = '2025-2026';

  IF v_season_id IS NULL THEN
    RAISE EXCEPTION '2025-2026シーズンが見つかりません';
  END IF;

  -- 1. 得点イベント削除
  SELECT COUNT(*) INTO v_event_count
  FROM match_events me
  JOIN matches m ON me.match_id = m.id
  WHERE m.season_id = v_season_id
    AND me.event_type = 'goal';

  RAISE NOTICE 'ステップ1: 得点イベント削除 (件数: %)', v_event_count;

  DELETE FROM match_events
  WHERE match_id IN (
    SELECT id FROM matches WHERE season_id = v_season_id
  )
  AND event_type = 'goal';

  -- 2. 神奈川県のチームに所属する選手を削除
  SELECT COUNT(*) INTO v_player_count
  FROM players
  WHERE team_id IN (
    SELECT id FROM teams WHERE prefecture_id = v_kanagawa_id
  );

  RAISE NOTICE 'ステップ2: 選手データ削除 (件数: %)', v_player_count;

  DELETE FROM players
  WHERE team_id IN (
    SELECT id FROM teams WHERE prefecture_id = v_kanagawa_id
  );

  RAISE NOTICE '完全クリーンアップが完了しました';
  RAISE NOTICE '削除された得点イベント: %件', v_event_count;
  RAISE NOTICE '削除された選手: %件', v_player_count;

END $$;
