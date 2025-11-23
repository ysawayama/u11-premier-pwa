-- ============================================
-- 神奈川2部Aリーグ 試合データ登録
-- ============================================

DO $$
DECLARE
  v_season_id UUID;
  v_esforco UUID;
  v_omamedofc UUID;
  v_vinculo UUID;
  v_azamino_fc UUID;
  v_yokohama_junior UUID;
  v_kurotaki UUID;
  v_tdfc UUID;
  v_palavra UUID;
  v_sfat UUID;
  v_tokaigan UUID;
  v_azamino_kickers UUID;
BEGIN
  -- シーズンID取得
  SELECT id INTO v_season_id FROM seasons WHERE name LIKE '神奈川2部A%' LIMIT 1;

  IF v_season_id IS NULL THEN
    RAISE EXCEPTION 'シーズンが見つかりません';
  END IF;

  -- チームID取得
  SELECT id INTO v_esforco FROM teams WHERE name = 'ESFORCO F.C.';
  SELECT id INTO v_omamedofc FROM teams WHERE name = '大豆戸FC';
  SELECT id INTO v_vinculo FROM teams WHERE name = 'FC.vinculo';
  SELECT id INTO v_azamino_fc FROM teams WHERE name = 'あざみ野FC';
  SELECT id INTO v_yokohama_junior FROM teams WHERE name = '横浜ジュニオールSC';
  SELECT id INTO v_kurotaki FROM teams WHERE name = '黒滝SC';
  SELECT id INTO v_tdfc FROM teams WHERE name = 'TDFC';
  SELECT id INTO v_palavra FROM teams WHERE name = 'PALAVRA FC';
  SELECT id INTO v_sfat FROM teams WHERE name = 'SFAT ISEHARA SC';
  SELECT id INTO v_tokaigan FROM teams WHERE name = 'FC東海岸';
  SELECT id INTO v_azamino_kickers FROM teams WHERE name = 'あざみ野キッカーズ';

  -- 既存の試合データを削除
  DELETE FROM matches WHERE season_id = v_season_id;

  -- 試合データ挿入（終了済み試合）
  INSERT INTO matches (season_id, match_date, venue, match_type, home_team_id, away_team_id, home_score, away_score, status) VALUES
  -- 4月
  (v_season_id, '2025-04-19 10:00:00', 'かもめパーク', 'league', v_esforco, v_yokohama_junior, 2, 1, 'finished'),
  (v_season_id, '2025-04-19 11:00:00', 'かもめパーク', 'league', v_esforco, v_azamino_kickers, 8, 0, 'finished'),
  (v_season_id, '2025-04-26 10:00:00', '麻溝公園スポーツ広場', 'league', v_vinculo, v_palavra, 6, 1, 'finished'),
  (v_season_id, '2025-04-27 10:00:00', '保木公園', 'league', v_azamino_fc, v_tokaigan, 7, 0, 'finished'),
  (v_season_id, '2025-04-27 11:00:00', '保木公園', 'league', v_tokaigan, v_palavra, 3, 2, 'finished'),
  (v_season_id, '2025-04-27 12:00:00', '保木公園', 'league', v_azamino_fc, v_palavra, 6, 0, 'finished'),
  (v_season_id, '2025-04-29 10:00:00', 'あざみ野西公園', 'league', v_azamino_fc, v_yokohama_junior, 1, 3, 'finished'),

  -- 5月
  (v_season_id, '2025-05-18 10:00:00', 'あざみ野西公園', 'league', v_omamedofc, v_azamino_kickers, 5, 1, 'finished'),
  (v_season_id, '2025-05-18 11:00:00', 'あざみ野西公園', 'league', v_tdfc, v_omamedofc, 0, 2, 'finished'),
  (v_season_id, '2025-05-18 12:00:00', 'あざみ野西公園', 'league', v_azamino_kickers, v_tdfc, 0, 4, 'finished'),
  (v_season_id, '2025-05-24 10:00:00', 'ミーム厚木グランド', 'league', v_tdfc, v_palavra, 2, 0, 'finished'),
  (v_season_id, '2025-05-24 11:00:00', 'ミーム厚木グランド', 'league', v_tdfc, v_kurotaki, 2, 4, 'finished'),
  (v_season_id, '2025-05-25 10:00:00', '新横浜公園第２運動広場', 'league', v_kurotaki, v_azamino_fc, 3, 4, 'finished'),

  -- 6月
  (v_season_id, '2025-06-01 10:00:00', '東俣野中央公園', 'league', v_esforco, v_tokaigan, 9, 0, 'finished'),
  (v_season_id, '2025-06-01 11:00:00', '東俣野中央公園', 'league', v_esforco, v_kurotaki, 3, 2, 'finished'),
  (v_season_id, '2025-06-21 10:00:00', '辻堂海浜公園', 'league', v_kurotaki, v_azamino_kickers, 4, 0, 'finished'),
  (v_season_id, '2025-06-21 10:00:00', 'ミーム厚木グランド', 'league', v_tdfc, v_vinculo, 1, 7, 'finished'),
  (v_season_id, '2025-06-21 11:00:00', '辻堂海浜公園', 'league', v_kurotaki, v_yokohama_junior, 2, 2, 'finished'),
  (v_season_id, '2025-06-22 10:00:00', '金井公園', 'league', v_yokohama_junior, v_palavra, 0, 0, 'finished'),
  (v_season_id, '2025-06-22 11:00:00', '金井公園', 'league', v_omamedofc, v_palavra, 6, 1, 'finished'),
  (v_season_id, '2025-06-22 12:00:00', '金井公園', 'league', v_yokohama_junior, v_omamedofc, 0, 5, 'finished'),
  (v_season_id, '2025-06-28 10:00:00', '新横浜投擲練習場', 'league', v_esforco, v_omamedofc, 8, 0, 'finished'),

  -- 7月
  (v_season_id, '2025-07-06 10:00:00', '小雀公園', 'league', v_azamino_fc, v_azamino_kickers, 9, 0, 'finished'),
  (v_season_id, '2025-07-06 11:00:00', '小雀公園', 'league', v_omamedofc, v_azamino_fc, 6, 3, 'finished'),
  (v_season_id, '2025-07-12 10:00:00', '境川遊水池グラウンド', 'league', v_yokohama_junior, v_azamino_kickers, 12, 2, 'finished'),
  (v_season_id, '2025-07-12 11:00:00', '境川遊水池グラウンド', 'league', v_omamedofc, v_kurotaki, 2, 4, 'finished'),
  (v_season_id, '2025-07-19 10:00:00', '磯野台グランド', 'league', v_palavra, v_kurotaki, 1, 7, 'finished'),
  (v_season_id, '2025-07-19 11:00:00', '磯野台グランド', 'league', v_palavra, v_esforco, 1, 3, 'finished'),
  (v_season_id, '2025-07-20 10:00:00', 'かもめパーク', 'league', v_omamedofc, v_vinculo, 0, 5, 'finished'),
  (v_season_id, '2025-07-20 11:00:00', 'かもめパーク', 'league', v_tdfc, v_azamino_fc, 0, 1, 'finished'),
  (v_season_id, '2025-07-21 10:00:00', 'あざみ野西公園', 'league', v_azamino_kickers, v_vinculo, 0, 4, 'finished'),
  (v_season_id, '2025-07-21 11:00:00', 'あざみ野西公園', 'league', v_azamino_fc, v_vinculo, 0, 4, 'finished'),
  (v_season_id, '2025-07-26 10:00:00', '磯野台グランド', 'league', v_palavra, v_azamino_kickers, 1, 1, 'finished'),

  -- 8月
  (v_season_id, '2025-08-02 10:00:00', '東海岸小学校', 'league', v_tokaigan, v_sfat, 1, 1, 'finished'),
  (v_season_id, '2025-08-02 11:00:00', '東海岸小学校', 'league', v_sfat, v_esforco, 1, 9, 'finished'),
  (v_season_id, '2025-08-23 10:00:00', '東海岸小学校', 'league', v_tokaigan, v_tdfc, 0, 2, 'finished'),
  (v_season_id, '2025-08-24 10:00:00', '伊勢原市こどもスポーツ広場', 'league', v_sfat, v_tdfc, 0, 5, 'finished'),
  (v_season_id, '2025-08-30 10:00:00', '横山公園人工芝', 'league', v_vinculo, v_yokohama_junior, 3, 1, 'finished'),
  (v_season_id, '2025-08-30 10:00:00', '伊勢原市総合運動公園', 'league', v_sfat, v_palavra, 1, 1, 'finished'),
  (v_season_id, '2025-08-31 10:00:00', '伊勢原市こどもスポーツ広場', 'league', v_sfat, v_yokohama_junior, 2, 4, 'finished'),
  (v_season_id, '2025-08-31 11:00:00', '伊勢原市こどもスポーツ広場', 'league', v_sfat, v_kurotaki, 2, 8, 'finished'),

  -- 9月
  (v_season_id, '2025-09-13 10:00:00', 'ミーム厚木グランド', 'league', v_tdfc, v_esforco, 2, 4, 'finished'),
  (v_season_id, '2025-09-14 10:00:00', '三栗山グランド', 'league', v_vinculo, v_esforco, 1, 3, 'finished'),
  (v_season_id, '2025-09-15 10:00:00', '相模原市立中央小学校', 'league', v_vinculo, v_tokaigan, 9, 1, 'finished'),
  (v_season_id, '2025-09-20 10:00:00', '金井公園', 'league', v_yokohama_junior, v_tokaigan, 4, 0, 'finished'),
  (v_season_id, '2025-09-20 11:00:00', '金井公園', 'league', v_yokohama_junior, v_tdfc, 2, 2, 'finished'),
  (v_season_id, '2025-09-20 12:00:00', '金井公園', 'league', v_omamedofc, v_tokaigan, 13, 0, 'finished'),
  (v_season_id, '2025-09-21 10:00:00', '上満寺多目的スポーツ広場', 'league', v_sfat, v_omamedofc, 0, 1, 'finished'),
  (v_season_id, '2025-09-21 11:00:00', '上満寺多目的スポーツ広場', 'league', v_sfat, v_vinculo, 1, 6, 'finished'),
  (v_season_id, '2025-09-21 12:00:00', '上満寺多目的スポーツ広場', 'league', v_vinculo, v_kurotaki, 2, 0, 'finished'),
  (v_season_id, '2025-09-21 10:00:00', 'かやの木公園グラウンド', 'league', v_tokaigan, v_azamino_kickers, 0, 8, 'finished'),
  (v_season_id, '2025-09-27 10:00:00', '太田すこやかスポーツ広場', 'league', v_sfat, v_azamino_kickers, 8, 1, 'finished'),
  (v_season_id, '2025-09-27 11:00:00', '太田すこやかスポーツ広場', 'league', v_sfat, v_azamino_fc, 1, 2, 'finished'),
  (v_season_id, '2025-09-28 10:00:00', '柳島スポーツ公園', 'league', v_tokaigan, v_kurotaki, 1, 1, 'finished'),
  (v_season_id, '2025-09-28 11:00:00', 'あざみ野西公園', 'league', v_azamino_fc, v_esforco, 1, 2, 'finished'),

  -- 10月
  (v_season_id, '2025-10-12 10:00:00', '磯野台グランド', 'league', v_palavra, v_tdfc, 0, 1, 'finished'),
  (v_season_id, '2025-10-12 11:00:00', '磯野台グランド', 'league', v_palavra, v_omamedofc, 0, 3, 'finished'),
  (v_season_id, '2025-10-12 12:00:00', '磯野台グランド', 'league', v_omamedofc, v_tdfc, 2, 1, 'finished'),
  (v_season_id, '2025-10-13 10:00:00', 'あざみ野西公園', 'league', v_azamino_kickers, v_yokohama_junior, 2, 3, 'finished'),
  (v_season_id, '2025-10-13 11:00:00', 'あざみ野西公園', 'league', v_omamedofc, v_yokohama_junior, 3, 1, 'finished'),
  (v_season_id, '2025-10-13 12:00:00', 'あざみ野西公園', 'league', v_azamino_kickers, v_omamedofc, 0, 8, 'finished'),
  (v_season_id, '2025-10-18 10:00:00', '青葉スポーツプラザ', 'league', v_azamino_fc, v_palavra, 3, 1, 'finished'),

  -- 11月（終了済み）
  (v_season_id, '2025-11-03 10:00:00', '磯野台グランド', 'league', v_esforco, v_tokaigan, 22, 0, 'finished'),
  (v_season_id, '2025-11-03 11:00:00', '磯野台グランド', 'league', v_palavra, v_tokaigan, 11, 1, 'finished'),
  (v_season_id, '2025-11-03 12:00:00', '磯野台グランド', 'league', v_palavra, v_esforco, 0, 8, 'finished'),

  -- 11月（予定）
  (v_season_id, '2025-11-16 13:15:00', 'あざみ野西公園', 'league', v_azamino_kickers, v_kurotaki, NULL, NULL, 'scheduled'),
  (v_season_id, '2025-11-16 14:25:00', 'あざみ野西公園', 'league', v_kurotaki, v_tokaigan, NULL, NULL, 'scheduled'),
  (v_season_id, '2025-11-23 14:20:00', '青葉スポーツプラザ', 'league', v_azamino_fc, v_yokohama_junior, NULL, NULL, 'scheduled'),
  (v_season_id, '2025-11-29 10:20:00', 'あざみ野第２小学校', 'league', v_azamino_fc, v_azamino_kickers, NULL, NULL, 'scheduled'),

  -- 12月（予定）
  (v_season_id, '2025-12-07 13:15:00', 'あざみ野西公園', 'league', v_azamino_fc, v_tdfc, NULL, NULL, 'scheduled'),
  (v_season_id, '2025-12-13 10:10:00', '赤田東公園', 'league', v_azamino_fc, v_esforco, NULL, NULL, 'scheduled'),
  (v_season_id, '2025-12-21 09:15:00', 'あざみ野西公園', 'league', v_azamino_kickers, v_tokaigan, NULL, NULL, 'scheduled'),
  (v_season_id, '2025-12-21 10:25:00', 'あざみ野西公園', 'league', v_tdfc, v_tokaigan, NULL, NULL, 'scheduled'),
  (v_season_id, '2025-12-21 11:35:00', 'あざみ野西公園', 'league', v_azamino_kickers, v_tdfc, NULL, NULL, 'scheduled');

  RAISE NOTICE '試合データの登録が完了しました（74試合）';
END $$;

-- 確認
SELECT
  m.match_date,
  ht.name as home_team,
  m.home_score,
  m.away_score,
  at.name as away_team,
  m.venue,
  m.status
FROM matches m
JOIN teams ht ON m.home_team_id = ht.id
JOIN teams at ON m.away_team_id = at.id
ORDER BY m.match_date;
