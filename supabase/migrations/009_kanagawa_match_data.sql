-- ============================================
-- 神奈川プレミアリーグ 2025-2026 試合データ投入
-- 50試合のマッチデータをインポート
-- ============================================

DO $$
DECLARE
  v_kanagawa_id uuid;
  v_season_id uuid;
  v_home_team_id uuid;
  v_away_team_id uuid;
  v_count int := 0;
BEGIN
  -- 神奈川県IDを取得
  SELECT id INTO v_kanagawa_id FROM prefectures WHERE name = '神奈川県';

  IF v_kanagawa_id IS NULL THEN
    RAISE EXCEPTION '神奈川県が見つかりません。先に prefectures テーブルに神奈川県を登録してください。';
  END IF;

  -- 2025-2026シーズンIDを取得
  SELECT id INTO v_season_id FROM seasons WHERE name = '2025-2026';

  IF v_season_id IS NULL THEN
    RAISE EXCEPTION '2025-2026シーズンが見つかりません。先に seasons テーブルにシーズンを登録してください。';
  END IF;

  -- 既存の神奈川県の試合データを削除（同じシーズンのもののみ）
  DELETE FROM matches
  WHERE season_id = v_season_id
    AND (home_team_id IN (SELECT id FROM teams WHERE prefecture_id = v_kanagawa_id)
      OR away_team_id IN (SELECT id FROM teams WHERE prefecture_id = v_kanagawa_id));

  -- 試合データを投入
  -- 1
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-04-26'::timestamptz, '等々力補助競技場', 'league',
    (SELECT id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id),
    2, 0, 'finished';

  -- 2
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-04-27'::timestamptz, '玄海田公園', 'league',
    (SELECT id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id),
    0, 4, 'finished';

  -- 3
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-04-27'::timestamptz, '柳島しおさい公園', 'league',
    (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id),
    0, 4, 'finished';

  -- 4
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-04-29'::timestamptz, 'しんよこフットボールパーク', 'league',
    (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id),
    2, 2, 'finished';

  -- 5
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-04-29'::timestamptz, 'しんよこフットボールパーク', 'league',
    (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id),
    0, 2, 'finished';

  -- 6
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-04-29'::timestamptz, 'しんよこフットボールパーク', 'league',
    (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id),
    1, 1, 'finished';

  -- 7
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-05-04'::timestamptz, 'Anker フロンタウン生田', 'league',
    (SELECT id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id),
    8, 0, 'finished';

  -- 8
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-05-04'::timestamptz, 'Anker フロンタウン生田', 'league',
    (SELECT id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id),
    5, 0, 'finished';

  -- 9
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-05-04'::timestamptz, 'Anker フロンタウン生田', 'league',
    (SELECT id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id),
    4, 1, 'finished';

  -- 10
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-05-05'::timestamptz, 'Anker フロンタウン生田', 'league',
    (SELECT id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id),
    5, 1, 'finished';

  -- 11
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-05-05'::timestamptz, '横山公園人工芝', 'league',
    (SELECT id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id),
    0, 1, 'finished';

  -- 12
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-05-10'::timestamptz, '綾瀬スポーツ公園', 'league',
    (SELECT id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id),
    2, 2, 'finished';

  -- 13
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-05-10'::timestamptz, 'マリノス追浜グランド', 'league',
    (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id),
    6, 0, 'finished';

  -- 14
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-05-11'::timestamptz, '谷本公園', 'league',
    (SELECT id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id),
    3, 0, 'finished';

  -- 15
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-05-17'::timestamptz, 'マリノス追浜グランド', 'league',
    (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id),
    1, 6, 'finished';

  -- 16
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-05-18'::timestamptz, '横山公園人工芝', 'league',
    (SELECT id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id),
    1, 4, 'finished';

  -- 17
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-05-18'::timestamptz, 'マリノス追浜グランド', 'league',
    (SELECT id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id),
    1, 3, 'finished';

  -- 18
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-05-24'::timestamptz, '寒川田端スポーツ公園', 'league',
    (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id),
    3, 0, 'finished';

  -- 19
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-05-25'::timestamptz, '辻堂海浜公園', 'league',
    (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id),
    0, 0, 'finished';

  -- 20
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-05-31'::timestamptz, 'マリノス追浜グランド', 'league',
    (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id),
    3, 2, 'finished';

  -- 21
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-05-31'::timestamptz, 'マリノス追浜グランド', 'league',
    (SELECT id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id),
    3, 0, 'finished';

  -- 22
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-05-31'::timestamptz, 'マリノス追浜グランド', 'league',
    (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id),
    1, 4, 'finished';

  -- 23
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-06-01'::timestamptz, '相模原スポーツレクリエーションパーク', 'league',
    (SELECT id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id),
    1, 1, 'finished';

  -- 24
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-06-07'::timestamptz, '綾瀬ノーブルスタジアム', 'league',
    (SELECT id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id),
    4, 0, 'finished';

  -- 25
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-06-07'::timestamptz, '綾瀬ノーブルスタジアム', 'league',
    (SELECT id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id),
    0, 9, 'finished';

  -- 26
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-06-08'::timestamptz, '綾瀬ノーブルスタジアム', 'league',
    (SELECT id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id),
    3, 2, 'finished';

  -- 27
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-06-14'::timestamptz, '秋葉台球技場', 'league',
    (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id),
    1, 0, 'finished';

  -- 28
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-06-21'::timestamptz, '辻堂海浜公園', 'league',
    (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id),
    3, 2, 'finished';

  -- 29
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-06-21'::timestamptz, 'マリノス追浜グランド', 'league',
    (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id),
    1, 2, 'finished';

  -- 30
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-06-21'::timestamptz, 'マリノス追浜グランド', 'league',
    (SELECT id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id),
    0, 7, 'finished';

  -- 31
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-06-21'::timestamptz, 'マリノス追浜グランド', 'league',
    (SELECT id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id),
    1, 2, 'finished';

  -- 32
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-06-22'::timestamptz, '辻堂海浜公園', 'league',
    (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id),
    4, 1, 'finished';

  -- 33
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-06-28'::timestamptz, '柳島しおさい公園', 'league',
    (SELECT id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id),
    2, 8, 'finished';

  -- 34
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-06-28'::timestamptz, '柳島しおさい公園', 'league',
    (SELECT id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id),
    5, 1, 'finished';

  -- 35
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-06-28'::timestamptz, '柳島しおさい公園', 'league',
    (SELECT id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id),
    1, 8, 'finished';

  -- 36
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-06-29'::timestamptz, '辻堂海浜公園', 'league',
    (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id),
    5, 0, 'finished';

  -- 37
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-07-06'::timestamptz, 'しんよこフットボールパーク', 'league',
    (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id),
    1, 5, 'finished';

  -- 38
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-07-12'::timestamptz, '綾瀬スポーツ公園', 'league',
    (SELECT id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id),
    1, 0, 'finished';

  -- 39
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-07-13'::timestamptz, '等々力第１グランド', 'league',
    (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id),
    0, 2, 'finished';

  -- 40
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-07-13'::timestamptz, '鶴間公園', 'league',
    (SELECT id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'JFC FUTURO' AND prefecture_id = v_kanagawa_id),
    1, 4, 'finished';

  -- 41
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-07-19'::timestamptz, 'マリノス追浜グランド', 'league',
    (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id),
    2, 1, 'finished';

  -- 42
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-07-21'::timestamptz, 'Anker フロンタウン生田', 'league',
    (SELECT id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id),
    1, 3, 'finished';

  -- 43
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-07-21'::timestamptz, 'Anker フロンタウン生田', 'league',
    (SELECT id FROM teams WHERE name = 'FCゴールデン' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id),
    0, 2, 'finished';

  -- 44
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-08-17'::timestamptz, '等々力第１グランド', 'league',
    (SELECT id FROM teams WHERE name = 'バディーSC' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id),
    3, 0, 'finished';

  -- 45
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-08-24'::timestamptz, 'しんよこフットボールパーク', 'league',
    (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id),
    1, 1, 'finished';

  -- 46
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-08-24'::timestamptz, '新横浜公園第２運動広場', 'league',
    (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = '東住吉SC' AND prefecture_id = v_kanagawa_id),
    4, 1, 'finished';

  -- 47
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-08-31'::timestamptz, '柳島しおさい公園', 'league',
    (SELECT id FROM teams WHERE name = 'Carpesol湘南' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = '中野島FC' AND prefecture_id = v_kanagawa_id),
    0, 5, 'finished';

  -- 48
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-09-06'::timestamptz, 'Anker フロンタウン生田', 'league',
    (SELECT id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'FC Testigo' AND prefecture_id = v_kanagawa_id),
    11, 0, 'finished';

  -- 49
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-09-07'::timestamptz, 'Anker フロンタウン生田', 'league',
    (SELECT id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'FCパーシモン' AND prefecture_id = v_kanagawa_id),
    1, 3, 'finished';

  -- 50
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-09-14'::timestamptz, 'Anker フロンタウン生田', 'league',
    (SELECT id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = 'FC PORTA' AND prefecture_id = v_kanagawa_id),
    6, 2, 'finished';

  -- 51
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status)
  SELECT v_season_id, '2025-09-14'::timestamptz, 'Anker フロンタウン生田', 'league',
    (SELECT id FROM teams WHERE name = '川崎フロンターレ' AND prefecture_id = v_kanagawa_id),
    (SELECT id FROM teams WHERE name = '横浜Ｆ･マリノスプライマリー追浜' AND prefecture_id = v_kanagawa_id),
    7, 1, 'finished';

  RAISE NOTICE '神奈川県プレミアリーグ試合データ（51試合）の投入が完了しました';
END $$;
