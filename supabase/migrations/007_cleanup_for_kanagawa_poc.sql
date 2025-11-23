-- 神奈川県1部PoC用データクリーンアップ
-- 東京都、大阪府のデータと不要な神奈川県チームを削除

-- 不要なチームとその関連データを削除
DO $$
DECLARE
  v_tokyo_id uuid;
  v_osaka_id uuid;
  v_kanagawa_id uuid;
BEGIN
  -- 都道府県IDを取得
  SELECT id INTO v_tokyo_id FROM prefectures WHERE name = '東京都';
  SELECT id INTO v_osaka_id FROM prefectures WHERE name = '大阪府';
  SELECT id INTO v_kanagawa_id FROM prefectures WHERE name = '神奈川県';

  -- 東京都のチームとその関連データを削除
  IF v_tokyo_id IS NOT NULL THEN
    -- 試合イベントを削除（東京都チームの選手が関わるもの）
    DELETE FROM match_events
    WHERE player_id IN (
      SELECT id FROM players WHERE team_id IN (
        SELECT id FROM teams WHERE prefecture_id = v_tokyo_id
      )
    );

    -- 選手を削除
    DELETE FROM players WHERE team_id IN (
      SELECT id FROM teams WHERE prefecture_id = v_tokyo_id
    );

    -- 試合を削除（東京都チームが関わるもの）
    DELETE FROM matches WHERE home_team_id IN (
      SELECT id FROM teams WHERE prefecture_id = v_tokyo_id
    ) OR away_team_id IN (
      SELECT id FROM teams WHERE prefecture_id = v_tokyo_id
    );

    -- 順位表データを削除
    DELETE FROM team_standings WHERE team_id IN (
      SELECT id FROM teams WHERE prefecture_id = v_tokyo_id
    );

    -- チームを削除
    DELETE FROM teams WHERE prefecture_id = v_tokyo_id;

    RAISE NOTICE '東京都のデータを削除しました';
  END IF;

  -- 大阪府のチームとその関連データを削除
  IF v_osaka_id IS NOT NULL THEN
    -- 試合イベントを削除
    DELETE FROM match_events
    WHERE player_id IN (
      SELECT id FROM players WHERE team_id IN (
        SELECT id FROM teams WHERE prefecture_id = v_osaka_id
      )
    );

    -- 選手を削除
    DELETE FROM players WHERE team_id IN (
      SELECT id FROM teams WHERE prefecture_id = v_osaka_id
    );

    -- 試合を削除
    DELETE FROM matches WHERE home_team_id IN (
      SELECT id FROM teams WHERE prefecture_id = v_osaka_id
    ) OR away_team_id IN (
      SELECT id FROM teams WHERE prefecture_id = v_osaka_id
    );

    -- 順位表データを削除
    DELETE FROM team_standings WHERE team_id IN (
      SELECT id FROM teams WHERE prefecture_id = v_osaka_id
    );

    -- チームを削除
    DELETE FROM teams WHERE prefecture_id = v_osaka_id;

    RAISE NOTICE '大阪府のデータを削除しました';
  END IF;

  -- 神奈川県の不要なチームを削除
  IF v_kanagawa_id IS NOT NULL THEN
    -- 川崎フロンターレU-12を削除（1部は「川崎フロンターレ」のみ）
    DELETE FROM match_events
    WHERE player_id IN (
      SELECT id FROM players WHERE team_id IN (
        SELECT id FROM teams WHERE prefecture_id = v_kanagawa_id AND name = '川崎フロンターレU-12'
      )
    );

    DELETE FROM players WHERE team_id IN (
      SELECT id FROM teams WHERE prefecture_id = v_kanagawa_id AND name = '川崎フロンターレU-12'
    );

    DELETE FROM matches WHERE home_team_id IN (
      SELECT id FROM teams WHERE prefecture_id = v_kanagawa_id AND name = '川崎フロンターレU-12'
    ) OR away_team_id IN (
      SELECT id FROM teams WHERE prefecture_id = v_kanagawa_id AND name = '川崎フロンターレU-12'
    );

    DELETE FROM team_standings WHERE team_id IN (
      SELECT id FROM teams WHERE prefecture_id = v_kanagawa_id AND name = '川崎フロンターレU-12'
    );

    DELETE FROM teams WHERE prefecture_id = v_kanagawa_id AND name = '川崎フロンターレU-12';

    RAISE NOTICE '川崎フロンターレU-12を削除しました';

    -- 重複している横浜F・マリノスプライマリーを確認して1つに統合
    -- まず、重複しているかチェック
    DECLARE
      v_marinos_count integer;
      v_marinos_id_to_keep uuid;
    BEGIN
      SELECT COUNT(*) INTO v_marinos_count
      FROM teams
      WHERE prefecture_id = v_kanagawa_id
      AND name LIKE '横浜Ｆ･マリノスプライマリー%'
      AND name NOT LIKE '%追浜%';

      IF v_marinos_count > 1 THEN
        -- 最初の1つのIDを取得
        SELECT id INTO v_marinos_id_to_keep
        FROM teams
        WHERE prefecture_id = v_kanagawa_id
        AND name LIKE '横浜Ｆ･マリノスプライマリー%'
        AND name NOT LIKE '%追浜%'
        ORDER BY created_at
        LIMIT 1;
        -- 重複がある場合、最初の1つを残して他を削除
        DELETE FROM match_events
        WHERE player_id IN (
          SELECT id FROM players WHERE team_id IN (
            SELECT id FROM teams
            WHERE prefecture_id = v_kanagawa_id
            AND name LIKE '横浜Ｆ･マリノスプライマリー%'
            AND name NOT LIKE '%追浜%'
            AND id != v_marinos_id_to_keep
          )
        );

        DELETE FROM players WHERE team_id IN (
          SELECT id FROM teams
          WHERE prefecture_id = v_kanagawa_id
          AND name LIKE '横浜Ｆ･マリノスプライマリー%'
          AND name NOT LIKE '%追浜%'
          AND id != v_marinos_id_to_keep
        );

        DELETE FROM matches WHERE home_team_id IN (
          SELECT id FROM teams
          WHERE prefecture_id = v_kanagawa_id
          AND name LIKE '横浜Ｆ･マリノスプライマリー%'
          AND name NOT LIKE '%追浜%'
          AND id != v_marinos_id_to_keep
        ) OR away_team_id IN (
          SELECT id FROM teams
          WHERE prefecture_id = v_kanagawa_id
          AND name LIKE '横浜Ｆ･マリノスプライマリー%'
          AND name NOT LIKE '%追浜%'
          AND id != v_marinos_id_to_keep
        );

        DELETE FROM team_standings WHERE team_id IN (
          SELECT id FROM teams
          WHERE prefecture_id = v_kanagawa_id
          AND name LIKE '横浜Ｆ･マリノスプライマリー%'
          AND name NOT LIKE '%追浜%'
          AND id != v_marinos_id_to_keep
        );

        DELETE FROM teams
        WHERE prefecture_id = v_kanagawa_id
        AND name LIKE '横浜Ｆ･マリノスプライマリー%'
        AND name NOT LIKE '%追浜%'
        AND id != v_marinos_id_to_keep;

        RAISE NOTICE '重複している横浜F・マリノスプライマリーを統合しました';
      END IF;
    END;
  END IF;

  RAISE NOTICE 'クリーンアップが完了しました。神奈川県1部の12チームのみ残っています。';
END $$;
