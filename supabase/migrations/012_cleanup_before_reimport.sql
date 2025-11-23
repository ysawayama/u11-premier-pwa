-- ============================================
-- 得点者データの再インポート前にクリーンアップ
-- ============================================

DO $$
DECLARE
  v_season_id UUID;
  v_event_count INT;
  v_player_count INT;
BEGIN
  -- 2025-2026シーズンIDを取得
  SELECT id INTO v_season_id FROM seasons WHERE name = '2025-2026';

  IF v_season_id IS NULL THEN
    RAISE EXCEPTION '2025-2026シーズンが見つかりません';
  END IF;

  -- 既存の得点イベント数をカウント
  SELECT COUNT(*) INTO v_event_count
  FROM match_events me
  JOIN matches m ON me.match_id = m.id
  WHERE m.season_id = v_season_id
    AND me.event_type = 'goal';

  RAISE NOTICE '削除する得点イベント数: %', v_event_count;

  -- このシーズンの得点イベントを削除
  DELETE FROM match_events
  WHERE match_id IN (
    SELECT id FROM matches WHERE season_id = v_season_id
  )
  AND event_type = 'goal';

  RAISE NOTICE '得点イベントを削除しました';

  -- 選手データは削除しない（チームに紐づいているため）
  -- 代わりに、uniform_numberをNULLにリセット
  UPDATE players
  SET uniform_number = NULL
  WHERE team_id IN (
    SELECT id FROM teams
    WHERE prefecture_id = (SELECT id FROM prefectures WHERE name = '神奈川県')
  );

  RAISE NOTICE 'クリーンアップが完了しました';

END $$;
