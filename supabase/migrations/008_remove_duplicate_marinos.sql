-- 重複している横浜F・マリノスプライマリーを削除
-- short_name='YFM'を残して、他を削除

DO $$
DECLARE
  v_kanagawa_id uuid;
  v_marinos_id_to_delete uuid;
BEGIN
  -- 神奈川県IDを取得
  SELECT id INTO v_kanagawa_id FROM prefectures WHERE name = '神奈川県';

  IF v_kanagawa_id IS NOT NULL THEN
    -- short_nameが'YFM'ではない横浜F・マリノスプライマリーを削除対象として取得
    SELECT id INTO v_marinos_id_to_delete
    FROM teams
    WHERE prefecture_id = v_kanagawa_id
    AND name = '横浜Ｆ･マリノスプライマリー'
    AND short_name != 'YFM'
    LIMIT 1;

    -- 見つからない場合は別の条件で試す（短縮名が異なる場合）
    IF v_marinos_id_to_delete IS NULL THEN
      SELECT id INTO v_marinos_id_to_delete
      FROM teams
      WHERE prefecture_id = v_kanagawa_id
      AND name LIKE '%マリノスプライマリー%'
      AND name NOT LIKE '%追浜%'
      AND short_name != 'YFM'
      LIMIT 1;
    END IF;

    -- 削除対象が見つかった場合、関連データを削除
    IF v_marinos_id_to_delete IS NOT NULL THEN
      -- 試合イベントを削除
      DELETE FROM match_events
      WHERE player_id IN (
        SELECT id FROM players WHERE team_id = v_marinos_id_to_delete
      );

      -- 選手を削除
      DELETE FROM players WHERE team_id = v_marinos_id_to_delete;

      -- 試合を削除
      DELETE FROM matches
      WHERE home_team_id = v_marinos_id_to_delete
      OR away_team_id = v_marinos_id_to_delete;

      -- 順位表データを削除
      DELETE FROM team_standings WHERE team_id = v_marinos_id_to_delete;

      -- チームを削除
      DELETE FROM teams WHERE id = v_marinos_id_to_delete;

      RAISE NOTICE '重複している横浜F・マリノスプライマリーを削除しました（ID: %）', v_marinos_id_to_delete;
    ELSE
      RAISE NOTICE '削除対象の横浜F・マリノスプライマリーが見つかりませんでした';
    END IF;
  END IF;
END $$;
