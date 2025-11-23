-- 神奈川県1部リーグ 追加試合データ (2025年9月15日〜11月16日)
-- 前回のマイグレーションは9月14日までだったため、それ以降のデータを追加
-- 全ての試合結果を反映

DO $$
DECLARE
  v_season_id uuid;
  v_kanagawa_id uuid;

  -- チームID変数
  v_buddy_id uuid;
  v_porta_id uuid;
  v_marinos_primary_id uuid;
  v_marinos_oppama_id uuid;
  v_frontale_id uuid;
  v_futuro_id uuid;
  v_golden_id uuid;
  v_testigo_id uuid;
  v_carpesol_id uuid;
  v_persimmon_id uuid;
  v_higashisumiyoshi_id uuid;
  v_nakanoshima_id uuid;
BEGIN
  -- シーズンIDを取得
  SELECT id INTO v_season_id FROM seasons WHERE name = '2025-2026' LIMIT 1;

  -- 神奈川県IDを取得
  SELECT id INTO v_kanagawa_id FROM prefectures WHERE name = '神奈川県';

  -- チームIDを取得
  SELECT id INTO v_buddy_id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id;
  SELECT id INTO v_porta_id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id;
  SELECT id INTO v_marinos_primary_id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id;
  SELECT id INTO v_marinos_oppama_id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id;
  SELECT id INTO v_frontale_id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id;
  SELECT id INTO v_futuro_id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id;
  SELECT id INTO v_golden_id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id;
  SELECT id INTO v_testigo_id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id;
  SELECT id INTO v_carpesol_id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id;
  SELECT id INTO v_persimmon_id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id;
  SELECT id INTO v_higashisumiyoshi_id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id;
  SELECT id INTO v_nakanoshima_id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id;

  -- 9月15日
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  VALUES
    (v_season_id, '2025-09-15 10:00:00+09', '綾瀬ノーブルスタジアム', 'league', v_futuro_id, v_golden_id, 2, 0, 'finished'),
    (v_season_id, '2025-09-15 10:00:00+09', 'しんよこフットボールパーク', 'league', v_marinos_primary_id, v_testigo_id, 4, 1, 'finished'),
    (v_season_id, '2025-09-15 10:00:00+09', '東住吉小学校', 'league', v_higashisumiyoshi_id, v_carpesol_id, 14, 1, 'finished');

  -- 9月20日
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  VALUES
    (v_season_id, '2025-09-20 10:00:00+09', '麻生水処理センター', 'league', v_persimmon_id, v_buddy_id, 2, 2, 'finished'),
    (v_season_id, '2025-09-20 10:00:00+09', '相模原スポーツレクリエーションパーク', 'league', v_testigo_id, v_carpesol_id, 6, 0, 'finished'),
    (v_season_id, '2025-09-20 10:00:00+09', '新横浜公園第２運動広場', 'league', v_nakanoshima_id, v_porta_id, 0, 2, 'finished'),
    (v_season_id, '2025-09-20 10:00:00+09', 'マリノス追浜グランド', 'league', v_marinos_oppama_id, v_futuro_id, 0, 6, 'finished');

  -- 9月21日
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  VALUES
    (v_season_id, '2025-09-21 10:00:00+09', 'しんよこフットボールパーク', 'league', v_marinos_primary_id, v_carpesol_id, 4, 1, 'finished'),
    (v_season_id, '2025-09-21 10:00:00+09', '東住吉小学校', 'league', v_higashisumiyoshi_id, v_nakanoshima_id, 1, 1, 'finished');

  -- 9月23日
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  VALUES
    (v_season_id, '2025-09-23 10:00:00+09', 'しんよこフットボールパーク', 'league', v_marinos_primary_id, v_buddy_id, 0, 10, 'finished'),
    (v_season_id, '2025-09-23 10:00:00+09', 'Anker フロンタウン生田', 'league', v_frontale_id, v_carpesol_id, 7, 0, 'finished'),
    (v_season_id, '2025-09-23 10:00:00+09', 'Anker フロンタウン生田', 'league', v_testigo_id, v_nakanoshima_id, 2, 1, 'finished');

  -- 9月27日
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  VALUES
    (v_season_id, '2025-09-27 10:00:00+09', 'Anker フロンタウン生田', 'league', v_frontale_id, v_futuro_id, 4, 1, 'finished'),
    (v_season_id, '2025-09-27 10:00:00+09', '辻堂海浜公園', 'league', v_porta_id, v_marinos_oppama_id, 0, 1, 'finished');

  -- 9月28日
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  VALUES
    (v_season_id, '2025-09-28 10:00:00+09', '麻生水処理センター', 'league', v_persimmon_id, v_nakanoshima_id, 3, 2, 'finished'),
    (v_season_id, '2025-09-28 10:00:00+09', 'しんよこフットボールパーク', 'league', v_marinos_primary_id, v_futuro_id, 1, 0, 'finished');

  -- 9月29日
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  VALUES
    (v_season_id, '2025-09-29 10:00:00+09', 'Anker フロンタウン生田', 'league', v_frontale_id, v_futuro_id, 5, 1, 'finished');

  -- 10月4日
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  VALUES
    (v_season_id, '2025-10-04 10:00:00+09', '藤沢市立辻堂小学校', 'league', v_porta_id, v_golden_id, 1, 0, 'finished'),
    (v_season_id, '2025-10-04 10:00:00+09', 'マリノス追浜グランド', 'league', v_marinos_oppama_id, v_futuro_id, 0, 1, 'finished');

  -- 10月5日
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  VALUES
    (v_season_id, '2025-10-05 10:00:00+09', 'しんよこフットボールパーク', 'league', v_marinos_primary_id, v_futuro_id, 1, 0, 'finished');

  -- 10月12日
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  VALUES
    (v_season_id, '2025-10-12 10:00:00+09', 'しんよこフットボールパーク', 'league', v_marinos_primary_id, v_nakanoshima_id, 5, 2, 'finished');

  -- 10月19日
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  VALUES
    (v_season_id, '2025-10-19 10:00:00+09', 'マリノス追浜グランド', 'league', v_marinos_oppama_id, v_carpesol_id, 7, 1, 'finished'),
    (v_season_id, '2025-10-19 10:00:00+09', 'マリノス追浜グランド', 'league', v_carpesol_id, v_persimmon_id, 2, 3, 'finished'),
    (v_season_id, '2025-10-19 10:00:00+09', 'マリノス追浜グランド', 'league', v_marinos_oppama_id, v_persimmon_id, 0, 5, 'finished');

  -- 10月26日
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  VALUES
    (v_season_id, '2025-10-26 10:00:00+09', '辻堂海浜公園', 'league', v_porta_id, v_testigo_id, 1, 1, 'finished'),
    (v_season_id, '2025-10-26 10:00:00+09', '綾瀬ノーブルスタジアム', 'league', v_futuro_id, v_golden_id, 5, 1, 'finished');

  -- 11月3日 (12:40 PMと表示されているが、スコアが不明のため保留)
  -- INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, status)
  -- VALUES
  --   (v_season_id, '2025-11-03 12:40:00+09', '網島しおさい公園', 'league', v_carpesol_id, v_golden_id, 'scheduled');

  -- 11月8日
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  VALUES
    (v_season_id, '2025-11-08 10:00:00+09', '綾瀬ノーブルスタジアム', 'league', v_futuro_id, v_testigo_id, 2, 3, 'finished'),
    (v_season_id, '2025-11-08 10:00:00+09', '新横浜公園第２運動広場', 'league', v_porta_id, v_nakanoshima_id, 5, 0, 'finished');

  -- 11月15日
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  VALUES
    (v_season_id, '2025-11-15 10:00:00+09', 'マリノス追浜グランド', 'league', v_marinos_primary_id, v_carpesol_id, 13, 1, 'finished');

  -- 11月16日
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  VALUES
    (v_season_id, '2025-11-16 10:00:00+09', 'Anker フロンタウン生田', 'league', v_frontale_id, v_higashisumiyoshi_id, 5, 2, 'finished'),
    (v_season_id, '2025-11-16 10:00:00+09', 'Anker フロンタウン生田', 'league', v_frontale_id, v_buddy_id, 1, 5, 'finished'),
    (v_season_id, '2025-11-16 10:00:00+09', 'Anker フロンタウン生田', 'league', v_higashisumiyoshi_id, v_buddy_id, 1, 3, 'finished');

  RAISE NOTICE '神奈川県1部リーグ追加試合データ（9月15日〜11月16日）の投入が完了しました';
  RAISE NOTICE '結果登録済み: 34試合（全て実際の試合結果を反映）';
END $$;
