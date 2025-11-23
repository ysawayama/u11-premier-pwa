-- ============================================
-- 神奈川プレミアリーグ 2025年 得点者データ投入
-- 選手登録と得点イベント作成（エラーハンドリング付き）
-- ============================================

DO $$
DECLARE
  v_kanagawa_id uuid;
  v_season_id uuid;
  v_team_id uuid;
  v_match_id uuid;
  v_player_id uuid;
  v_player_count int := 0;
  v_event_count int := 0;
  v_skipped_matches int := 0;
  i int;
BEGIN
  -- 神奈川県IDを取得
  SELECT id INTO v_kanagawa_id FROM prefectures WHERE name = '神奈川県';
  IF v_kanagawa_id IS NULL THEN
    RAISE EXCEPTION '神奈川県が見つかりません。';
  END IF;

  -- 2025-2026シーズンIDを取得
  SELECT id INTO v_season_id FROM seasons WHERE name = '2025-2026';
  IF v_season_id IS NULL THEN
    RAISE EXCEPTION '2025-2026シーズンが見つかりません。';
  END IF;

  -- ============================================
  -- 2025-04-26: バディーSC vs 東住吉SC (2-0)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-04-26'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-04-26 - バディーSC vs 東住吉SC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- バディーSCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id;

    -- 矢内一輝 (#4) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '矢内', '一輝', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 4, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 4
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 飯森葉良 (#13) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '飯森', '葉良', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 13, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 13
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-04-27: JFC FUTURO vs バディーSC (0-4)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-04-27'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-04-27 - JFC FUTURO vs バディーSC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- バディーSCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id;

    -- 小田島愛一郎 (#2) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小田', '島愛一郎', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 2, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 2
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 岸太陽 (#8) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '岸', '太陽', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 8, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 8
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 長田琉空 (#10) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '長田', '琉空', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 10, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 10
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-04-27: FCゴールデン vs FCパーシモン (0-4)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-04-27'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-04-27 - FCゴールデン vs FCパーシモン';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- FCパーシモンの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id;

    -- 下岡冬和 (#7) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '下岡', '冬和', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 春川翔輝 (#13) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '春川', '翔輝', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 13, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 13
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 常盤丈介 (#38) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '常盤', '丈介', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 38, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 38
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 金丸晴馬 (#28) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '金丸', '晴馬', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 28, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 28
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-04-29: 横浜Ｆ･マリノスプライマリー vs FCゴールデン (2-2)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-04-29'
    AND home_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-04-29 - 横浜Ｆ･マリノスプライマリー vs FCゴールデン';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 横浜Ｆ･マリノスプライマリーの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id;

    -- 長田直輝 (#18) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '長田', '直輝', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 18, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 18
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 臼井大揮 (#26) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '臼井', '大揮', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 26, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 26
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- FCゴールデンの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id;

    -- 今野翔太 (#17) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '今野', '翔太', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 17, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 17
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 小野晃太朗 (#47) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小野', '晃太朗', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 47, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 47
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-04-29: FCゴールデン vs 中野島FC (0-2)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-04-29'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-04-29 - FCゴールデン vs 中野島FC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 中野島FCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id;

    -- 岩田史登 (#7) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '岩田', '史登', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 長崎幹太 (#23) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '長崎', '幹太', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 23, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 23
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-04-29: 横浜Ｆ･マリノスプライマリー vs 中野島FC (1-1)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-04-29'
    AND home_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-04-29 - 横浜Ｆ･マリノスプライマリー vs 中野島FC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 横浜Ｆ･マリノスプライマリーの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id;

    -- 山口龍之介 (#24) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '山口', '龍之介', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 24, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 24
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 中野島FCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id;

    -- 西川丈燿 (#80) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '西川', '丈燿', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 80, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 80
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-05-04: 川崎フロンターレ vs FCゴールデン (8-0)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-05-04'
    AND home_team_id = (SELECT id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-05-04 - 川崎フロンターレ vs FCゴールデン';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 川崎フロンターレの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id;

    -- 鴨川澄空 (#17) - 3ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '鴨川', '澄空', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 17, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 17
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..3 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 崔雲泡 (#18) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '崔', '雲泡', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 18, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 18
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 田中正人 (#22) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '田中', '正人', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 22, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 22
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 長野悠斗 (#25) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '長野', '悠斗', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 25, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 25
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 成瀬文弥 (#26) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '成瀬', '文弥', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 26, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 26
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-05-04: 川崎フロンターレ vs 東住吉SC (5-0)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-05-04'
    AND home_team_id = (SELECT id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-05-04 - 川崎フロンターレ vs 東住吉SC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 川崎フロンターレの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id;

    -- 鴨川澄空 (#17) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '鴨川', '澄空', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 17, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 17
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 崔雲泡 (#18) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '崔', '雲泡', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 18, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 18
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 田中正人 (#22) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '田中', '正人', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 22, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 22
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 成瀬文弥 (#26) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '成瀬', '文弥', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 26, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 26
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-05-04: 東住吉SC vs FCゴールデン (4-1)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-05-04'
    AND home_team_id = (SELECT id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-05-04 - 東住吉SC vs FCゴールデン';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 東住吉SCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id;

    -- 枩埜希登 (#11) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '枩埜', '希登', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 11, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 11
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 浅倉悠太 (#20) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '浅倉', '悠太', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 20, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 20
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 齋藤幹也 (#23) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '齋藤', '幹也', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 23, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 23
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 早坂直起 (#42) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '早坂', '直起', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 42, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 42
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- FCゴールデンの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id;

    -- 小野晃太朗 (#47) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小野', '晃太朗', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 47, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 47
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-05-05: 川崎フロンターレ vs 中野島FC (5-1)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-05-05'
    AND home_team_id = (SELECT id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-05-05 - 川崎フロンターレ vs 中野島FC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 川崎フロンターレの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id;

    -- 長野悠斗 (#25) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '長野', '悠斗', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 25, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 25
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 鴨川澄空 (#17) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '鴨川', '澄空', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 17, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 17
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 崔雲泡 (#18) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '崔', '雲泡', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 18, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 18
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 高桑湊人 (#23) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '高桑', '湊人', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 23, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 23
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 中野島FCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id;

    -- 平本直太朗 (#77) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '平本', '直太朗', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 77, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 77
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-05-05: FC Testigo vs FC PORTA (0-1)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-05-05'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-05-05 - FC Testigo vs FC PORTA';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- FC PORTAの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id;

    -- 菊池舜人 (#5) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '菊池', '舜人', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 5, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 5
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-05-10: 東住吉SC vs JFC FUTURO (2-2)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-05-10'
    AND home_team_id = (SELECT id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-05-10 - 東住吉SC vs JFC FUTURO';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 東住吉SCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id;

    -- 枩埜希登 (#11) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '枩埜', '希登', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 11, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 11
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- JFC FUTUROの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id;

    -- 小林叶芽 (#9) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小林', '叶芽', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 9, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 9
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

  END IF;

  -- ============================================
  -- 2025-05-10: FC PORTA vs 横浜Ｆ･マリノスプライマリー追浜 (6-0)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-05-10'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-05-10 - FC PORTA vs 横浜Ｆ･マリノスプライマリー追浜';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- FC PORTAの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id;

    -- 菊池舜人 (#5) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '菊池', '舜人', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 5, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 5
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 川端莉太 (#28) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '川端', '莉太', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 28, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 28
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 関岡祐馬 (#29) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '関岡', '祐馬', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 29, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 29
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- ウィリアムス天馬 (#88) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, 'ウィ', 'リアムス天馬', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 88, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 88
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-05-11: JFC FUTURO vs 横浜Ｆ･マリノスプライマリー (3-0)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-05-11'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-05-11 - JFC FUTURO vs 横浜Ｆ･マリノスプライマリー';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- JFC FUTUROの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id;

    -- 中野峻輔 (#6) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '中野', '峻輔', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 6, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 6
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 小林叶芽 (#9) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小林', '叶芽', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 9, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 9
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

  END IF;

  -- ============================================
  -- 2025-05-17: 横浜Ｆ･マリノスプライマリー追浜 vs バディーSC (1-6)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-05-17'
    AND home_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-05-17 - 横浜Ｆ･マリノスプライマリー追浜 vs バディーSC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 横浜Ｆ･マリノスプライマリー追浜の得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id;

    -- 中山太陽 (#20) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '中山', '太陽', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 20, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 20
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- バディーSCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id;

    -- 小田島愛一郎 (#2) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小田', '島愛一郎', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 2, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 2
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 矢内一輝 (#4) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '矢内', '一輝', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 4, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 4
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 廣瀬陽 (#7) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '廣', '瀬陽', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 小川碧 (#21) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小', '川碧', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 21, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 21
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-05-18: FC Testigo vs FCパーシモン (1-4)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-05-18'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-05-18 - FC Testigo vs FCパーシモン';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- FC Testigoの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id;

    -- 平木扗昊 (#7) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '平木', '扗昊', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- FCパーシモンの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id;

    -- 下岡冬和 (#7) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '下岡', '冬和', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 岡野稜 (#4) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '岡', '野稜', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 4, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 4
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 萩原響 (#5) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '萩', '原響', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 5, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 5
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-05-18: Carpesol湘南 vs 横浜Ｆ･マリノスプライマリー追浜 (1-3)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-05-18'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-05-18 - Carpesol湘南 vs 横浜Ｆ･マリノスプライマリー追浜';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- Carpesol湘南の得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id;

    -- 眞司龍太 (#4) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '眞司', '龍太', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 4, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 4
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 横浜Ｆ･マリノスプライマリー追浜の得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id;

    -- 中山太陽 (#20) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '中山', '太陽', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 20, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 20
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 山本達央 (#23) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '山本', '達央', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 23, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 23
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 福島龍騎 (#30) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '福島', '龍騎', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 30, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 30
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-05-24: FCゴールデン vs Carpesol湘南 (3-0)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-05-24'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-05-24 - FCゴールデン vs Carpesol湘南';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- FCゴールデンの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id;

    -- 秋葉康成 (#18) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '秋葉', '康成', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 18, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 18
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 越田善仁 (#77) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '越田', '善仁', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 77, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 77
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

  END IF;

  -- ============================================
  -- 2025-05-25: FC PORTA vs JFC FUTURO (0-0)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-05-25'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-05-25 - FC PORTA vs JFC FUTURO';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
  END IF;

  -- ============================================
  -- 2025-05-31: 横浜Ｆ･マリノスプライマリー追浜 vs 中野島FC (3-2)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-05-31'
    AND home_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-05-31 - 横浜Ｆ･マリノスプライマリー追浜 vs 中野島FC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 横浜Ｆ･マリノスプライマリー追浜の得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id;

    -- 福島龍騎 (#30) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '福島', '龍騎', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 30, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 30
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 上田英士朗 (#13) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '上田', '英士朗', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 13, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 13
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 澤村智裕 (#17) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '澤村', '智裕', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 17, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 17
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 中野島FCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id;

    -- 平本直太朗 (#77) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '平本', '直太朗', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 77, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 77
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 石野旭晃 (#88) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '石野', '旭晃', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 88, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 88
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-05-31: 中野島FC vs FCパーシモン (3-0)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-05-31'
    AND home_team_id = (SELECT id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-05-31 - 中野島FC vs FCパーシモン';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 中野島FCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id;

    -- 岩田史登 (#7) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '岩田', '史登', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 平本直太朗 (#77) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '平本', '直太朗', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 77, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 77
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 西川丈燿 (#80) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '西川', '丈燿', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 80, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 80
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-05-31: 横浜Ｆ･マリノスプライマリー追浜 vs FCパーシモン (1-4)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-05-31'
    AND home_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-05-31 - 横浜Ｆ･マリノスプライマリー追浜 vs FCパーシモン';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 横浜Ｆ･マリノスプライマリー追浜の得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id;

    -- 小野口和虹 (#15) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小野', '口和虹', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 15, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 15
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- FCパーシモンの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id;

    -- 増田蛍人 (#14) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '増田', '蛍人', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 14, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 14
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 小川景虎 (#25) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小川', '景虎', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 25, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 25
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 林颯真 (#36) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '林', '颯真', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 36, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 36
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 山口瑛士 (#55) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '山口', '瑛士', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 55, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 55
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-06-01: FC Testigo vs バディーSC (1-1)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-06-01'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-06-01 - FC Testigo vs バディーSC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- FC Testigoの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id;

    -- 秋本蒼介 (#8) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '秋本', '蒼介', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 8, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 8
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- バディーSCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id;

    -- 矢内一輝 (#4) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '矢内', '一輝', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 4, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 4
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-06-07: JFC FUTURO vs Carpesol湘南 (4-0)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-06-07'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-06-07 - JFC FUTURO vs Carpesol湘南';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- JFC FUTUROの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id;

    -- 小林叶芽 (#9) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小林', '叶芽', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 9, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 9
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 相良駿太 (#25) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '相良', '駿太', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 25, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 25
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 田村尋 (#66) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '田', '村尋', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 66, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 66
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-06-07: Carpesol湘南 vs FCパーシモン (0-9)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-06-07'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-06-07 - Carpesol湘南 vs FCパーシモン';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- FCパーシモンの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id;

    -- 春川翔輝 (#13) - 3ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '春川', '翔輝', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 13, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 13
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..3 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 小川景虎 (#25) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小川', '景虎', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 25, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 25
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 林颯真 (#36) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '林', '颯真', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 36, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 36
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 山口瑛士 (#55) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '山口', '瑛士', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 55, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 55
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 吉屋祐璃 (#30) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '吉屋', '祐璃', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 30, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 30
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 下岡冬和 (#7) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '下岡', '冬和', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-06-08: JFC FUTURO vs FCパーシモン (3-2)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-06-08'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-06-08 - JFC FUTURO vs FCパーシモン';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- JFC FUTUROの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id;

    -- 相良駿太 (#25) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '相良', '駿太', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 25, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 25
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 小林叶芽 (#9) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小林', '叶芽', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 9, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 9
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- FCパーシモンの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id;

    -- 春川翔輝 (#13) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '春川', '翔輝', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 13, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 13
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 林颯真 (#36) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '林', '颯真', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 36, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 36
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-06-14: FCゴールデン vs FC Testigo (1-0)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-06-14'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-06-14 - FCゴールデン vs FC Testigo';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- FCゴールデンの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id;

    -- 小野晃太朗 (#47) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小野', '晃太朗', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 47, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 47
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-06-21: FC PORTA vs 横浜Ｆ･マリノスプライマリー (3-2)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-06-21'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-06-21 - FC PORTA vs 横浜Ｆ･マリノスプライマリー';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- FC PORTAの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id;

    -- 関岡祐馬 (#29) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '関岡', '祐馬', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 29, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 29
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 山口煌矢 (#33) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '山口', '煌矢', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 33, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 33
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 横浜Ｆ･マリノスプライマリーの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id;

    -- 長田直輝 (#18) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '長田', '直輝', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 18, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 18
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 二宮海翔 (#22) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '二宮', '海翔', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 22, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 22
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-06-21: 横浜Ｆ･マリノスプライマリー追浜 vs FC Testigo (1-2)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-06-21'
    AND home_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-06-21 - 横浜Ｆ･マリノスプライマリー追浜 vs FC Testigo';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 横浜Ｆ･マリノスプライマリー追浜の得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id;

    -- 中里有 (#19) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '中', '里有', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 19, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 19
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- FC Testigoの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id;

    -- 石樵悠仁 (#9) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '石樵', '悠仁', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 9, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 9
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 南外悠汰 (#13) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '南外', '悠汰', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 13, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 13
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-06-21: FC Testigo vs 東住吉SC (0-7)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-06-21'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-06-21 - FC Testigo vs 東住吉SC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 東住吉SCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id;

    -- 枩埜希登 (#11) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '枩埜', '希登', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 11, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 11
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 浅倉悠太 (#20) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '浅倉', '悠太', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 20, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 20
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 齋藤幹也 (#23) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '齋藤', '幹也', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 23, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 23
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 早坂直起 (#42) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '早坂', '直起', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 42, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 42
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 土田心遙 (#2) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '土田', '心遙', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 2, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 2
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 鈴木塁 (#13) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '鈴', '木塁', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 13, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 13
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 菅田琉晴 (#10) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '菅田', '琉晴', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 10, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 10
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-06-21: 東住吉SC vs 横浜Ｆ･マリノスプライマリー追浜 (1-2)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-06-21'
    AND home_team_id = (SELECT id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-06-21 - 東住吉SC vs 横浜Ｆ･マリノスプライマリー追浜';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 東住吉SCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id;

    -- 早坂直起 (#42) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '早坂', '直起', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 42, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 42
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 横浜Ｆ･マリノスプライマリー追浜の得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id;

    -- 上田英士朗 (#13) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '上田', '英士朗', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 13, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 13
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 中山太陽 (#20) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '中山', '太陽', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 20, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 20
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-06-22: FC PORTA vs FCパーシモン (4-1)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-06-22'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-06-22 - FC PORTA vs FCパーシモン';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- FC PORTAの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id;

    -- 清水拓海 (#6) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '清水', '拓海', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 6, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 6
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 坂本晴哉 (#7) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '坂本', '晴哉', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 山口煌矢 (#33) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '山口', '煌矢', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 33, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 33
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- FCパーシモンの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id;

    -- 小川景虎 (#25) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小川', '景虎', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 25, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 25
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-06-28: Carpesol湘南 vs バディーSC (2-8)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-06-28'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-06-28 - Carpesol湘南 vs バディーSC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- Carpesol湘南の得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id;

    -- 野村瑠杜 (#7) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '野村', '瑠杜', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 遠藤遵行 (#5) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '遠藤', '遵行', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 5, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 5
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- バディーSCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id;

    -- 矢内一輝 (#4) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '矢内', '一輝', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 4, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 4
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 長田琉空 (#10) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '長田', '琉空', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 10, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 10
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 廣瀬陽 (#7) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '廣', '瀬陽', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 飯森葉良 (#13) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '飯森', '葉良', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 13, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 13
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 遠藤俊介 (#18) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '遠藤', '俊介', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 18, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 18
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 安藤颯太朗 (#16) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '安藤', '颯太朗', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 16, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 16
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-06-28: バディーSC vs FC PORTA (5-1)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-06-28'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-06-28 - バディーSC vs FC PORTA';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- バディーSCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id;

    -- 矢内一輝 (#4) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '矢内', '一輝', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 4, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 4
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 廣瀬陽 (#7) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '廣', '瀬陽', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 遠藤俊介 (#18) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '遠藤', '俊介', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 18, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 18
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- FC PORTAの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id;

    -- 山上陽大 (#41) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '山上', '陽大', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 41, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 41
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-06-28: Carpesol湘南 vs FC PORTA (1-8)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-06-28'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-06-28 - Carpesol湘南 vs FC PORTA';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- Carpesol湘南の得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id;

    -- 野村瑠杜 (#7) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '野村', '瑠杜', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- FC PORTAの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id;

    -- 坂本晴哉 (#7) - 4ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '坂本', '晴哉', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..4 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 山口煌矢 (#33) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '山口', '煌矢', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 33, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 33
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 山上陽大 (#41) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '山上', '陽大', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 41, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 41
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-06-29: FC PORTA vs FCゴールデン (5-0)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-06-29'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-06-29 - FC PORTA vs FCゴールデン';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- FC PORTAの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id;

    -- 坂本晴哉 (#7) - 4ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '坂本', '晴哉', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..4 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 山口煌矢 (#33) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '山口', '煌矢', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 33, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 33
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-07-06: 横浜Ｆ･マリノスプライマリー vs FCパーシモン (1-5)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-07-06'
    AND home_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-07-06 - 横浜Ｆ･マリノスプライマリー vs FCパーシモン';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 横浜Ｆ･マリノスプライマリーの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id;

    -- 市川慶一 (#13) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '市川', '慶一', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 13, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 13
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- FCパーシモンの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id;

    -- 下岡冬和 (#7) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '下岡', '冬和', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 増田蛍人 (#14) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '増田', '蛍人', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 14, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 14
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 吉屋祐璃 (#30) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '吉屋', '祐璃', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 30, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 30
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 比嘉王祐 (#23) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '比嘉', '王祐', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 23, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 23
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-07-12: JFC FUTURO vs 中野島FC (1-0)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-07-12'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-07-12 - JFC FUTURO vs 中野島FC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- JFC FUTUROの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id;

    -- 鈴木達也 (#13) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '鈴木', '達也', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 13, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 13
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-07-13: 横浜Ｆ･マリノスプライマリー vs 東住吉SC (0-2)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-07-13'
    AND home_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-07-13 - 横浜Ｆ･マリノスプライマリー vs 東住吉SC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 東住吉SCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id;

    -- 菅田琉晴 (#10) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '菅田', '琉晴', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 10, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 10
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

  END IF;

  -- ============================================
  -- 2025-07-13: FC Testigo vs JFC FUTURO (1-4)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-07-13'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-07-13 - FC Testigo vs JFC FUTURO';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- FC Testigoの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id;

    -- 來安康 (#2) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '來', '安康', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 2, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 2
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- JFC FUTUROの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id;

    -- 田村尋 (#66) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '田', '村尋', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 66, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 66
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 鈴木達也 (#13) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '鈴木', '達也', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 13, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 13
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 柳瀬夏樹 (#21) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '柳瀬', '夏樹', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 21, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 21
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-07-19: 横浜Ｆ･マリノスプライマリー追浜 vs FCゴールデン (2-1)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-07-19'
    AND home_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-07-19 - 横浜Ｆ･マリノスプライマリー追浜 vs FCゴールデン';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 横浜Ｆ･マリノスプライマリー追浜の得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id;

    -- 青木亮太 (#12) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '青木', '亮太', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 12, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 12
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- FCゴールデンの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id;

    -- 越田善仁 (#77) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '越田', '善仁', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 77, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 77
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-07-21: 川崎フロンターレ vs バディーSC (1-3)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-07-21'
    AND home_team_id = (SELECT id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-07-21 - 川崎フロンターレ vs バディーSC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 川崎フロンターレの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id;

    -- 宮内櫂 (#14) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '宮', '内櫂', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 14, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 14
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- バディーSCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id;

    -- 矢内一輝 (#4) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '矢内', '一輝', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 4, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 4
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 飯森葉良 (#13) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '飯森', '葉良', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 13, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 13
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 小川碧 (#21) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小', '川碧', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 21, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 21
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-07-21: FCゴールデン vs バディーSC (0-2)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-07-21'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-07-21 - FCゴールデン vs バディーSC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- バディーSCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id;

    -- 飯森葉良 (#13) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '飯森', '葉良', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 13, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 13
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-08-17: バディーSC vs 中野島FC (3-0)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-08-17'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-08-17 - バディーSC vs 中野島FC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- バディーSCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id;

    -- 廣瀬陽 (#7) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '廣', '瀬陽', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 小川碧 (#21) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小', '川碧', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 21, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 21
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-08-24: 横浜Ｆ･マリノスプライマリー vs 横浜Ｆ･マリノスプライマリー追浜 (1-1)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-08-24'
    AND home_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-08-24 - 横浜Ｆ･マリノスプライマリー vs 横浜Ｆ･マリノスプライマリー追浜';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 横浜Ｆ･マリノスプライマリーの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id;

    -- 山口龍之介 (#24) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '山口', '龍之介', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 24, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 24
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 横浜Ｆ･マリノスプライマリー追浜の得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id;

    -- 大野悠惺 (#27) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '大野', '悠惺', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 27, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 27
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-08-24: FC PORTA vs 東住吉SC (4-1)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-08-24'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-08-24 - FC PORTA vs 東住吉SC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- FC PORTAの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id;

    -- 菊池舜人 (#5) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '菊池', '舜人', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 5, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 5
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 坂本晴哉 (#7) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '坂本', '晴哉', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 山上陽大 (#41) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '山上', '陽大', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 41, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 41
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 東住吉SCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id;

    -- 浅倉悠太 (#20) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '浅倉', '悠太', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 20, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 20
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-08-31: Carpesol湘南 vs 中野島FC (0-5)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-08-31'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-08-31 - Carpesol湘南 vs 中野島FC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 中野島FCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id;

    -- 成瀬朱翔 (#99) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '成瀬', '朱翔', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 99, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 99
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 岩田史登 (#7) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '岩田', '史登', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 長崎幹太 (#23) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '長崎', '幹太', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 23, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 23
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 笹原泰晴 (#11) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '笹原', '泰晴', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 11, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 11
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-09-06: 川崎フロンターレ vs FC Testigo (11-0)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-09-06'
    AND home_team_id = (SELECT id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-09-06 - 川崎フロンターレ vs FC Testigo';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 川崎フロンターレの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id;

    -- 鴨川澄空 (#17) - 3ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '鴨川', '澄空', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 17, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 17
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..3 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 菊地晴臣 (#8) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '菊地', '晴臣', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 8, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 8
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 高桑湊人 (#23) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '高桑', '湊人', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 23, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 23
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 武田煌 (#5) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '武', '田煌', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 5, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 5
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 福原暖太 (#9) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '福原', '暖太', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 9, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 9
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- ケーサーニコ (#10) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, 'ケー', 'サーニコ', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 10, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 10
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 浅野玲偉 (#11) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '浅野', '玲偉', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 11, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 11
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 山口堂真 (#29) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '山口', '堂真', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 29, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 29
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-09-07: 川崎フロンターレ vs FCパーシモン (1-3)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-09-07'
    AND home_team_id = (SELECT id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-09-07 - 川崎フロンターレ vs FCパーシモン';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 川崎フロンターレの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id;

    -- 島田凌迅 (#27) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '島田', '凌迅', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 27, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 27
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- FCパーシモンの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id;

    -- 春川翔輝 (#13) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '春川', '翔輝', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 13, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 13
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 吉屋祐璃 (#30) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '吉屋', '祐璃', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 30, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 30
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 林颯真 (#36) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '林', '颯真', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 36, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 36
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-09-14: 川崎フロンターレ vs FC PORTA (6-2)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-09-14'
    AND home_team_id = (SELECT id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-09-14 - 川崎フロンターレ vs FC PORTA';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 川崎フロンターレの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id;

    -- 崔雲泡 (#18) - 4ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '崔', '雲泡', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 18, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 18
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..4 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 長野悠斗 (#25) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '長野', '悠斗', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 25, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 25
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 島田凌迅 (#27) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '島田', '凌迅', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 27, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 27
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- FC PORTAの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id;

    -- ウィリアムス天馬 (#88) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, 'ウィ', 'リアムス天馬', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 88, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 88
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 長谷拓馬 (#44) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '長谷', '拓馬', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 44, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 44
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-09-14: 川崎フロンターレ vs 横浜Ｆ･マリノスプライマリー追浜 (7-1)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-09-14'
    AND home_team_id = (SELECT id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-09-14 - 川崎フロンターレ vs 横浜Ｆ･マリノスプライマリー追浜';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 川崎フロンターレの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id;

    -- 宮内櫂 (#14) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '宮', '内櫂', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 14, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 14
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 鴨川澄空 (#17) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '鴨川', '澄空', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 17, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 17
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 崔雲泡 (#18) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '崔', '雲泡', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 18, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 18
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 高桑湊人 (#23) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '高桑', '湊人', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 23, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 23
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 芳賀洋人 (#15) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '芳賀', '洋人', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 15, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 15
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 田口理欧斗 (#24) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '田口', '理欧斗', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 24, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 24
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 横浜Ｆ･マリノスプライマリー追浜の得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id;

    -- 藤平絢紀 (#22) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '藤平', '絢紀', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 22, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 22
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-09-15: JFC FUTURO vs FCゴールデン (2-0)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-09-15'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-09-15 - JFC FUTURO vs FCゴールデン';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- JFC FUTUROの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id;

    -- 中野峻輔 (#6) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '中野', '峻輔', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 6, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 6
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-09-15: 横浜Ｆ･マリノスプライマリー vs FC Testigo (4-1)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-09-15'
    AND home_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-09-15 - 横浜Ｆ･マリノスプライマリー vs FC Testigo';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 横浜Ｆ･マリノスプライマリーの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id;

    -- 二宮海翔 (#22) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '二宮', '海翔', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 22, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 22
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 山口龍之介 (#24) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '山口', '龍之介', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 24, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 24
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 横田彧把 (#25) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '横田', '彧把', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 25, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 25
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- FC Testigoの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id;

    -- 平木扗昊 (#7) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '平木', '扗昊', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-09-15: 東住吉SC vs Carpesol湘南 (14-1)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-09-15'
    AND home_team_id = (SELECT id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-09-15 - 東住吉SC vs Carpesol湘南';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 東住吉SCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id;

    -- 土田心遙 (#2) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '土田', '心遙', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 2, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 2
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 枩埜希登 (#11) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '枩埜', '希登', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 11, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 11
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 浅倉悠太 (#20) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '浅倉', '悠太', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 20, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 20
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 齋藤幹也 (#23) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '齋藤', '幹也', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 23, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 23
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 早坂直起 (#42) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '早坂', '直起', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 42, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 42
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 菅田琉晴 (#10) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '菅田', '琉晴', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 10, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 10
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 村田慶一郎 (#7) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '村田', '慶一郎', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 三木遙人 (#30) - 3ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '三木', '遙人', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 30, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 30
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..3 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 杉本稜真 (#38) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '杉本', '稜真', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 38, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 38
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 東慶一郎 (#88) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '東慶', '一郎', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 88, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 88
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- Carpesol湘南の得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id;

    -- 妻福結太 (#26) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '妻福', '結太', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 26, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 26
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-09-20: FCパーシモン vs バディーSC (2-2)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-09-20'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-09-20 - FCパーシモン vs バディーSC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- FCパーシモンの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id;

    -- 比嘉王祐 (#23) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '比嘉', '王祐', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 23, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 23
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 小川景虎 (#25) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小川', '景虎', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 25, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 25
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- バディーSCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id;

    -- 小川碧 (#21) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小', '川碧', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 21, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 21
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

  END IF;

  -- ============================================
  -- 2025-09-20: FC Testigo vs Carpesol湘南 (6-0)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-09-20'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-09-20 - FC Testigo vs Carpesol湘南';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- FC Testigoの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id;

    -- 石樵悠仁 (#10) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '石樵', '悠仁', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 10, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 10
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 平木杜昊 (#15) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '平木', '杜昊', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 15, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 15
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 秋本蒼介 (#4) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '秋本', '蒼介', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 4, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 4
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 角田俊哉 (#9) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '角田', '俊哉', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 9, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 9
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 荒川佑 (#7) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '荒', '川佑', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-09-20: 中野島FC vs FC PORTA (0-2)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-09-20'
    AND home_team_id = (SELECT id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-09-20 - 中野島FC vs FC PORTA';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- FC PORTAの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id;

    -- 菊池舜人 (#5) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '菊池', '舜人', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 5, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 5
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 崔悠士 (#3) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '崔', '悠士', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 3, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 3
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-09-20: 横浜Ｆ･マリノスプライマリー追浜 vs JFC FUTURO (0-6)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-09-20'
    AND home_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-09-20 - 横浜Ｆ･マリノスプライマリー追浜 vs JFC FUTURO';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- JFC FUTUROの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id;

    -- 小林叶芽 (#9) - 3ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小林', '叶芽', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 9, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 9
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..3 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 柳瀬夏樹 (#21) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '柳瀬', '夏樹', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 21, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 21
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 兵藤健吾 (#11) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '兵藤', '健吾', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 11, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 11
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-09-21: 横浜Ｆ･マリノスプライマリー vs Carpesol湘南 (4-1)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-09-21'
    AND home_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-09-21 - 横浜Ｆ･マリノスプライマリー vs Carpesol湘南';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 横浜Ｆ･マリノスプライマリーの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id;

    -- 横田彧把 (#25) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '横田', '彧把', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 25, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 25
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 村岡怜旺 (#34) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '村岡', '怜旺', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 34, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 34
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 松永英亮 (#37) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '松永', '英亮', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 37, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 37
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- Carpesol湘南の得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id;

    -- 藤巻叶太 (#9) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '藤巻', '叶太', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 9, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 9
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-09-21: 東住吉SC vs 中野島FC (1-1)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-09-21'
    AND home_team_id = (SELECT id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-09-21 - 東住吉SC vs 中野島FC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 東住吉SCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id;

    -- 早坂直起 (#42) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '早坂', '直起', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 42, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 42
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 中野島FCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id;

    -- 長崎幹太 (#23) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '長崎', '幹太', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 23, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 23
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-09-23: 横浜Ｆ･マリノスプライマリー vs バディーSC (0-10)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-09-23'
    AND home_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-09-23 - 横浜Ｆ･マリノスプライマリー vs バディーSC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- バディーSCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id;

    -- 小川碧 (#21) - 3ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小', '川碧', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 21, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 21
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..3 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 中村奏芽 (#14) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '中村', '奏芽', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 14, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 14
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 長田琉空 (#10) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '長田', '琉空', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 10, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 10
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 小田島愛一郎 (#2) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小田', '島愛一郎', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 2, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 2
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 矢内一輝 (#4) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '矢内', '一輝', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 4, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 4
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 竹本怜 (#5) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '竹', '本怜', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 5, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 5
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-09-23: 川崎フロンターレ vs Carpesol湘南 (7-0)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-09-23'
    AND home_team_id = (SELECT id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-09-23 - 川崎フロンターレ vs Carpesol湘南';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 川崎フロンターレの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id;

    -- 崔雲泡 (#18) - 3ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '崔', '雲泡', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 18, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 18
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..3 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 高桑湊人 (#23) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '高桑', '湊人', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 23, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 23
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 田口理欧斗 (#24) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '田口', '理欧斗', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 24, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 24
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 島田凌迅 (#27) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '島田', '凌迅', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 27, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 27
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 藤木乃以 (#20) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '藤木', '乃以', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 20, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 20
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-09-23: FC Testigo vs 中野島FC (2-1)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-09-23'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-09-23 - FC Testigo vs 中野島FC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- FC Testigoの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id;

    -- 平木杜㚖 (#15) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '平木', '杜㚖', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 15, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 15
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

  END IF;

  -- ============================================
  -- 2025-09-29: 川崎フロンターレ vs JFC FUTURO (5-1)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-09-29'
    AND home_team_id = (SELECT id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-09-29 - 川崎フロンターレ vs JFC FUTURO';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 川崎フロンターレの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id;

    -- 芳賀洋人 (#15) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '芳賀', '洋人', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 15, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 15
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 崔雲泡 (#18) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '崔', '雲泡', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 18, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 18
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 島田凌迅 (#27) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '島田', '凌迅', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 27, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 27
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- JFC FUTUROの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id;

    -- 田村尋 (#66) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '田', '村尋', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 66, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 66
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-10-19: Carpesol湘南 vs FCパーシモン (2-3)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-10-19'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-10-19 - Carpesol湘南 vs FCパーシモン';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- Carpesol湘南の得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id;

    -- 遠藤遵行 (#5) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '遠藤', '遵行', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 5, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 5
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- FCパーシモンの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id;

    -- 春川翔輝 (#13) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '春川', '翔輝', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 13, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 13
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 林颯真 (#36) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '林', '颯真', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 36, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 36
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 五百茂木慶悟 (#16) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '五百', '茂木慶悟', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 16, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 16
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-09-28: FCゴールデン vs 東住吉SC (0-2)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-09-28'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-09-28 - FCゴールデン vs 東住吉SC';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 東住吉SCの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id;

    -- 菅田琉晴 (#10) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '菅田', '琉晴', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 10, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 10
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 枩埜希登 (#11) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '枩埜', '希登', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 11, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 11
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-10-04: FC PORTA vs FCゴールデン (1-0)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-10-04'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-10-04 - FC PORTA vs FCゴールデン';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- FC PORTAの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id;

    -- 山上陽大 (#41) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '山上', '陽大', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 41, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 41
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-11-08: JFC FUTURO vs FC Testigo (2-3)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-11-08'
    AND home_team_id = (SELECT id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-11-08 - JFC FUTURO vs FC Testigo';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- JFC FUTUROの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id;

    -- 小林叶芽 (#9) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '小林', '叶芽', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 9, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 9
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 田村尋 (#66) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '田', '村尋', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 66, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 66
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- FC Testigoの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id;

    -- 秋本蒼介 (#4) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '秋本', '蒼介', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 4, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 4
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 平木扗昊 (#7) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '平木', '扗昊', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 平木杜㚖 (#15) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '平木', '杜㚖', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 15, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 15
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-10-05: 横浜Ｆ･マリノスプライマリー vs JFC FUTURO (1-0)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-10-05'
    AND home_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-10-05 - 横浜Ｆ･マリノスプライマリー vs JFC FUTURO';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 横浜Ｆ･マリノスプライマリーの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id;

    -- 山口龍之介 (#24) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '山口', '龍之介', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 24, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 24
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-11-15: 横浜Ｆ･マリノスプライマリー vs Carpesol湘南 (13-1)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-11-15'
    AND home_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-11-15 - 横浜Ｆ･マリノスプライマリー vs Carpesol湘南';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 横浜Ｆ･マリノスプライマリーの得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id;

    -- 横田彧把 (#25) - 5ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '横田', '彧把', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 25, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 25
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..5 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 山口龍之介 (#24) - 4ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '山口', '龍之介', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 24, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 24
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..4 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 市川慶一 (#13) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '市川', '慶一', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 13, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 13
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 臼井大揮 (#26) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '臼井', '大揮', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 26, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 26
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 村岡怜旺 (#34) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '村岡', '怜旺', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 34, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 34
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 大平奏 (#17) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '大', '平奏', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 17, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 17
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- Carpesol湘南の得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id;

    -- 野村瑠杜 (#7) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '野村', '瑠杜', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 7, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 7
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  -- ============================================
  -- 2025-10-19: 横浜Ｆ･マリノスプライマリー追浜 vs Carpesol湘南 (7-1)
  -- ============================================

  -- 試合IDを取得
  SELECT id INTO v_match_id FROM matches
  WHERE season_id = v_season_id
    AND match_date::date = '2025-10-19'
    AND home_team_id = (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id)
    AND away_team_id = (SELECT id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id);

  IF v_match_id IS NULL THEN
    RAISE WARNING '試合が見つかりません（スキップ）: 2025-10-19 - 横浜Ｆ･マリノスプライマリー追浜 vs Carpesol湘南';
    v_skipped_matches := v_skipped_matches + 1;
  ELSE
    -- 横浜Ｆ･マリノスプライマリー追浜の得点者
    SELECT id INTO v_team_id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id;

    -- 青木亮太 (#12) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '青木', '亮太', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 12, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 12
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 中里有 (#19) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '中', '里有', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 19, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 19
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 藤平絢紀 (#22) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '藤平', '絢紀', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 22, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 22
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- 大野悠惺 (#27) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '大野', '悠惺', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 27, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 27
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

    -- 平間來龍 (#29) - 2ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '平間', '來龍', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 29, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 29
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    FOR i IN 1..2 LOOP
      INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
      VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
      v_event_count := v_event_count + 1;
    END LOOP;

    -- Carpesol湘南の得点者
    SELECT id INTO v_team_id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id;

    -- 遠藤遵行 (#5) - 1ゴール
    INSERT INTO players (team_id, family_name, given_name, family_name_kana, given_name_kana, date_of_birth, grade, uniform_number, is_active)
    VALUES (v_team_id, '遠藤', '遵行', 'ミョウジ', 'ナマエ', '2014-01-01', 5, 5, true)
    ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO UPDATE SET uniform_number = 5
    RETURNING id INTO v_player_id;
    v_player_count := v_player_count + 1;

    INSERT INTO match_events (match_id, player_id, team_id, event_type, minute)
    VALUES (v_match_id, v_player_id, v_team_id, 'goal', 45);
    v_event_count := v_event_count + 1;

  END IF;

  RAISE NOTICE '選手登録数: %, 得点イベント数: %, スキップした試合数: %', v_player_count, v_event_count, v_skipped_matches;
  RAISE NOTICE '神奈川県プレミアリーグ 2025年 得点者データの投入が完了しました';

END $$;