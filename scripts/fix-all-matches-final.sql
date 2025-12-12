-- 全試合データを本サイト（pl11.jp）の画像と完全に一致させる
-- Supabase Dashboard > SQL Editor で実行してください
-- シーズンID: d0efd9f2-bca5-47dd-a70f-7b60f814a1dc

-- ==================================================
-- チームID一覧
-- ==================================================
-- ESFORCO: 8a8da5d6-ed98-48f3-8140-783908399fa0
-- 大豆戸: 7b4c8e6b-2333-4414-8262-a7a05e8193c9
-- あざみ野: 4be41b3d-2712-4db1-ad38-b5c74425db16
-- vinculo: b57cd2ec-38ca-4765-91ce-9f1c920b5d48
-- 横浜: 45e82eee-9428-4b40-8568-bc4af17c48b1
-- 黒滝: 90e69fe7-38b9-4bf7-afaa-e729ef95decc
-- TDFC: fd199536-7747-40f0-b058-ccc8b1b62d38
-- PALAVRA: 7d2c5a9d-3c44-4210-9599-b98dfa8bd626
-- SFAT: 1789a425-ad14-4355-8d71-6793320ef352
-- 東海岸: f6a92320-dad2-48a9-95e0-046e7004fd8b
-- あざみ野K: 2e0cb14e-5a4f-440d-a341-3c9e6112355d

-- ==================================================
-- STEP 1: 既存の全試合データを削除
-- ==================================================
DELETE FROM matches WHERE season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- ==================================================
-- STEP 2: 本サイトの画像から読み取った全データを挿入
-- 行=ホーム、列=アウェイ
-- ==================================================

-- ==================== ESFORCO (H) ====================
-- vs 大豆戸: 8-0
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('8a8da5d6-ed98-48f3-8140-783908399fa0', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 8, 0, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs あざみ野: 2-1
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('8a8da5d6-ed98-48f3-8140-783908399fa0', '4be41b3d-2712-4db1-ad38-b5c74425db16', 2, 1, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs vinculo: 3-1 (12/13)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('8a8da5d6-ed98-48f3-8140-783908399fa0', 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48', 3, 1, '2024-12-13', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 横浜: 2-1
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('8a8da5d6-ed98-48f3-8140-783908399fa0', '45e82eee-9428-4b40-8568-bc4af17c48b1', 2, 1, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 黒滝: 3-2
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('8a8da5d6-ed98-48f3-8140-783908399fa0', '90e69fe7-38b9-4bf7-afaa-e729ef95decc', 3, 2, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs TDFC: 4-2 (1試合目)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('8a8da5d6-ed98-48f3-8140-783908399fa0', 'fd199536-7747-40f0-b058-ccc8b1b62d38', 4, 2, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs TDFC: 5-0 (2試合目)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('8a8da5d6-ed98-48f3-8140-783908399fa0', 'fd199536-7747-40f0-b058-ccc8b1b62d38', 5, 0, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs PALAVRA: 3-1 (1試合目)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('8a8da5d6-ed98-48f3-8140-783908399fa0', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 3, 1, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs PALAVRA: 8-0 (2試合目)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('8a8da5d6-ed98-48f3-8140-783908399fa0', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 8, 0, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs SFAT: 9-1
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('8a8da5d6-ed98-48f3-8140-783908399fa0', '1789a425-ad14-4355-8d71-6793320ef352', 9, 1, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 東海岸: 9-0 (1試合目)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('8a8da5d6-ed98-48f3-8140-783908399fa0', 'f6a92320-dad2-48a9-95e0-046e7004fd8b', 9, 0, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 東海岸: 22-0 (2試合目)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('8a8da5d6-ed98-48f3-8140-783908399fa0', 'f6a92320-dad2-48a9-95e0-046e7004fd8b', 22, 0, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs あざみ野K: 8-0
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('8a8da5d6-ed98-48f3-8140-783908399fa0', '2e0cb14e-5a4f-440d-a341-3c9e6112355d', 8, 0, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- ==================== 大豆戸 (H) ====================
-- vs ESFORCO: 0-8
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7b4c8e6b-2333-4414-8262-a7a05e8193c9', '8a8da5d6-ed98-48f3-8140-783908399fa0', 0, 8, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs あざみ野: 6-3
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7b4c8e6b-2333-4414-8262-a7a05e8193c9', '4be41b3d-2712-4db1-ad38-b5c74425db16', 6, 3, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs vinculo: 0-5
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7b4c8e6b-2333-4414-8262-a7a05e8193c9', 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48', 0, 5, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 横浜: 5-0 (6/22)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7b4c8e6b-2333-4414-8262-a7a05e8193c9', '45e82eee-9428-4b40-8568-bc4af17c48b1', 5, 0, '2024-06-22', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 横浜: 3-1 (10/13)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7b4c8e6b-2333-4414-8262-a7a05e8193c9', '45e82eee-9428-4b40-8568-bc4af17c48b1', 3, 1, '2024-10-13', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 黒滝: 2-1
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7b4c8e6b-2333-4414-8262-a7a05e8193c9', '90e69fe7-38b9-4bf7-afaa-e729ef95decc', 2, 1, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs TDFC: 2-1
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7b4c8e6b-2333-4414-8262-a7a05e8193c9', 'fd199536-7747-40f0-b058-ccc8b1b62d38', 2, 1, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs PALAVRA: 1-0
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7b4c8e6b-2333-4414-8262-a7a05e8193c9', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 1, 0, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs SFAT: 5-0
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7b4c8e6b-2333-4414-8262-a7a05e8193c9', '1789a425-ad14-4355-8d71-6793320ef352', 5, 0, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 東海岸: 13-0
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7b4c8e6b-2333-4414-8262-a7a05e8193c9', 'f6a92320-dad2-48a9-95e0-046e7004fd8b', 13, 0, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs あざみ野K: 5-1 (1試合目)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7b4c8e6b-2333-4414-8262-a7a05e8193c9', '2e0cb14e-5a4f-440d-a341-3c9e6112355d', 5, 1, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs あざみ野K: 8-0 (2試合目)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7b4c8e6b-2333-4414-8262-a7a05e8193c9', '2e0cb14e-5a4f-440d-a341-3c9e6112355d', 8, 0, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- ==================== あざみ野 (H) ====================
-- vs ESFORCO: 1-2 (12/13)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('4be41b3d-2712-4db1-ad38-b5c74425db16', '8a8da5d6-ed98-48f3-8140-783908399fa0', 1, 2, '2024-12-13', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 大豆戸: 3-6
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('4be41b3d-2712-4db1-ad38-b5c74425db16', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 3, 6, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs vinculo: 0-4
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('4be41b3d-2712-4db1-ad38-b5c74425db16', 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48', 0, 4, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 横浜: 1-3
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('4be41b3d-2712-4db1-ad38-b5c74425db16', '45e82eee-9428-4b40-8568-bc4af17c48b1', 1, 3, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 黒滝: 4-3
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('4be41b3d-2712-4db1-ad38-b5c74425db16', '90e69fe7-38b9-4bf7-afaa-e729ef95decc', 4, 3, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs TDFC: なし（空欄）

-- vs PALAVRA: 5-1 (1試合目)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('4be41b3d-2712-4db1-ad38-b5c74425db16', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 5, 1, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs PALAVRA: 6-0 (12/28) - 画像を見ると6-0に見える
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('4be41b3d-2712-4db1-ad38-b5c74425db16', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 6, 0, '2024-12-28', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs SFAT: 2-1
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('4be41b3d-2712-4db1-ad38-b5c74425db16', '1789a425-ad14-4355-8d71-6793320ef352', 2, 1, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 東海岸: 10-0
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('4be41b3d-2712-4db1-ad38-b5c74425db16', 'f6a92320-dad2-48a9-95e0-046e7004fd8b', 10, 0, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs あざみ野K: 9-0
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('4be41b3d-2712-4db1-ad38-b5c74425db16', '2e0cb14e-5a4f-440d-a341-3c9e6112355d', 9, 0, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- ==================== vinculo (H) ====================
-- vs ESFORCO: 1-3
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('b57cd2ec-38ca-4765-91ce-9f1c920b5d48', '8a8da5d6-ed98-48f3-8140-783908399fa0', 1, 3, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 大豆戸: 5-0
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('b57cd2ec-38ca-4765-91ce-9f1c920b5d48', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 5, 0, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs あざみ野: 4-0
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('b57cd2ec-38ca-4765-91ce-9f1c920b5d48', '4be41b3d-2712-4db1-ad38-b5c74425db16', 4, 0, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 横浜: 3-1
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('b57cd2ec-38ca-4765-91ce-9f1c920b5d48', '45e82eee-9428-4b40-8568-bc4af17c48b1', 3, 1, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 黒滝: 2-0
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('b57cd2ec-38ca-4765-91ce-9f1c920b5d48', '90e69fe7-38b9-4bf7-afaa-e729ef95decc', 2, 0, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs TDFC: 7-1
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('b57cd2ec-38ca-4765-91ce-9f1c920b5d48', 'fd199536-7747-40f0-b058-ccc8b1b62d38', 7, 1, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs PALAVRA: 6-1
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('b57cd2ec-38ca-4765-91ce-9f1c920b5d48', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 6, 1, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs SFAT: 6-1
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('b57cd2ec-38ca-4765-91ce-9f1c920b5d48', '1789a425-ad14-4355-8d71-6793320ef352', 6, 1, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 東海岸: 7-1 (12/20)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('b57cd2ec-38ca-4765-91ce-9f1c920b5d48', 'f6a92320-dad2-48a9-95e0-046e7004fd8b', 7, 1, '2024-12-20', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs あざみ野K: 4-0
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('b57cd2ec-38ca-4765-91ce-9f1c920b5d48', '2e0cb14e-5a4f-440d-a341-3c9e6112355d', 4, 0, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- ==================== 横浜 (H) ====================
-- vs ESFORCO: 0-5
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('45e82eee-9428-4b40-8568-bc4af17c48b1', '8a8da5d6-ed98-48f3-8140-783908399fa0', 0, 5, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 大豆戸: 3-1
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('45e82eee-9428-4b40-8568-bc4af17c48b1', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 3, 1, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs あざみ野: 1-3
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('45e82eee-9428-4b40-8568-bc4af17c48b1', '4be41b3d-2712-4db1-ad38-b5c74425db16', 1, 3, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs vinculo: 1-3
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('45e82eee-9428-4b40-8568-bc4af17c48b1', 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48', 1, 3, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 黒滝: 2-2
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('45e82eee-9428-4b40-8568-bc4af17c48b1', '90e69fe7-38b9-4bf7-afaa-e729ef95decc', 2, 2, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs TDFC: 2-2 (12/13)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('45e82eee-9428-4b40-8568-bc4af17c48b1', 'fd199536-7747-40f0-b058-ccc8b1b62d38', 2, 2, '2024-12-13', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs PALAVRA: 2-2 (12/21)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('45e82eee-9428-4b40-8568-bc4af17c48b1', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 2, 2, '2024-12-21', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs SFAT: 4-2
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('45e82eee-9428-4b40-8568-bc4af17c48b1', '1789a425-ad14-4355-8d71-6793320ef352', 4, 2, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 東海岸: 4-0 (12/21)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('45e82eee-9428-4b40-8568-bc4af17c48b1', 'f6a92320-dad2-48a9-95e0-046e7004fd8b', 4, 0, '2024-12-21', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs あざみ野K: 13-2 (1試合目)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('45e82eee-9428-4b40-8568-bc4af17c48b1', '2e0cb14e-5a4f-440d-a341-3c9e6112355d', 13, 2, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs あざみ野K: 3-2 (2試合目)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('45e82eee-9428-4b40-8568-bc4af17c48b1', '2e0cb14e-5a4f-440d-a341-3c9e6112355d', 3, 2, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- ==================== 黒滝 (H) ====================
-- vs ESFORCO: 2-3
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('90e69fe7-38b9-4bf7-afaa-e729ef95decc', '8a8da5d6-ed98-48f3-8140-783908399fa0', 2, 3, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 大豆戸: 4-3
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('90e69fe7-38b9-4bf7-afaa-e729ef95decc', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 4, 3, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs あざみ野: 3-4
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('90e69fe7-38b9-4bf7-afaa-e729ef95decc', '4be41b3d-2712-4db1-ad38-b5c74425db16', 3, 4, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs vinculo: 0-2
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('90e69fe7-38b9-4bf7-afaa-e729ef95decc', 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48', 0, 2, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 横浜: 2-2 (12/13)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('90e69fe7-38b9-4bf7-afaa-e729ef95decc', '45e82eee-9428-4b40-8568-bc4af17c48b1', 2, 2, '2024-12-13', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs TDFC: 4-2 (12/14)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('90e69fe7-38b9-4bf7-afaa-e729ef95decc', 'fd199536-7747-40f0-b058-ccc8b1b62d38', 4, 2, '2024-12-14', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs PALAVRA: 8-2 (12/14)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('90e69fe7-38b9-4bf7-afaa-e729ef95decc', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 8, 2, '2024-12-14', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs SFAT: 8-2 (11/16)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('90e69fe7-38b9-4bf7-afaa-e729ef95decc', '1789a425-ad14-4355-8d71-6793320ef352', 8, 2, '2024-11-16', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 東海岸: なし（空欄）

-- vs あざみ野K: 4-0 (11/16)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('90e69fe7-38b9-4bf7-afaa-e729ef95decc', '2e0cb14e-5a4f-440d-a341-3c9e6112355d', 4, 0, '2024-11-16', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- ==================== TDFC (H) ====================
-- vs ESFORCO: 2-4
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('fd199536-7747-40f0-b058-ccc8b1b62d38', '8a8da5d6-ed98-48f3-8140-783908399fa0', 2, 4, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 大豆戸: 0-2
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('fd199536-7747-40f0-b058-ccc8b1b62d38', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 0, 2, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs あざみ野: 0-1
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('fd199536-7747-40f0-b058-ccc8b1b62d38', '4be41b3d-2712-4db1-ad38-b5c74425db16', 0, 1, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs vinculo: 1-7
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('fd199536-7747-40f0-b058-ccc8b1b62d38', 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48', 1, 7, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 横浜: 2-2
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('fd199536-7747-40f0-b058-ccc8b1b62d38', '45e82eee-9428-4b40-8568-bc4af17c48b1', 2, 2, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 黒滝: 2-4
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('fd199536-7747-40f0-b058-ccc8b1b62d38', '90e69fe7-38b9-4bf7-afaa-e729ef95decc', 2, 4, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs PALAVRA: 2-0
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('fd199536-7747-40f0-b058-ccc8b1b62d38', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 2, 0, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs SFAT: 2-0
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('fd199536-7747-40f0-b058-ccc8b1b62d38', '1789a425-ad14-4355-8d71-6793320ef352', 2, 0, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 東海岸: なし（空欄）

-- vs あざみ野K: 4-0
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('fd199536-7747-40f0-b058-ccc8b1b62d38', '2e0cb14e-5a4f-440d-a341-3c9e6112355d', 4, 0, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- ==================== PALAVRA (H) ====================
-- vs ESFORCO: 1-3
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7d2c5a9d-3c44-4210-9599-b98dfa8bd626', '8a8da5d6-ed98-48f3-8140-783908399fa0', 1, 3, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 大豆戸: 0-8
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7d2c5a9d-3c44-4210-9599-b98dfa8bd626', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 0, 8, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs あざみ野: 1-3
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7d2c5a9d-3c44-4210-9599-b98dfa8bd626', '4be41b3d-2712-4db1-ad38-b5c74425db16', 1, 3, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs vinculo: 1-6
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48', 1, 6, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 横浜: 0-0 (12/21)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7d2c5a9d-3c44-4210-9599-b98dfa8bd626', '45e82eee-9428-4b40-8568-bc4af17c48b1', 0, 0, '2024-12-21', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 黒滝: 1-7 (12/14)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7d2c5a9d-3c44-4210-9599-b98dfa8bd626', '90e69fe7-38b9-4bf7-afaa-e729ef95decc', 1, 7, '2024-12-14', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs TDFC: 0-5
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 'fd199536-7747-40f0-b058-ccc8b1b62d38', 0, 5, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs SFAT: 1-1 (12/21)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7d2c5a9d-3c44-4210-9599-b98dfa8bd626', '1789a425-ad14-4355-8d71-6793320ef352', 1, 1, '2024-12-21', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 東海岸: 11-1 (12/21)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 'f6a92320-dad2-48a9-95e0-046e7004fd8b', 11, 1, '2024-12-21', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs あざみ野K: 1-1 (12/21)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7d2c5a9d-3c44-4210-9599-b98dfa8bd626', '2e0cb14e-5a4f-440d-a341-3c9e6112355d', 1, 1, '2024-12-21', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- ==================== SFAT (H) ====================
-- vs ESFORCO: 1-9
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('1789a425-ad14-4355-8d71-6793320ef352', '8a8da5d6-ed98-48f3-8140-783908399fa0', 1, 9, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 大豆戸: 0-5
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('1789a425-ad14-4355-8d71-6793320ef352', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 0, 5, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs あざみ野: 1-2 (12/14)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('1789a425-ad14-4355-8d71-6793320ef352', '4be41b3d-2712-4db1-ad38-b5c74425db16', 1, 2, '2024-12-14', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs vinculo: 1-6
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('1789a425-ad14-4355-8d71-6793320ef352', 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48', 1, 6, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 横浜: 2-4
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('1789a425-ad14-4355-8d71-6793320ef352', '45e82eee-9428-4b40-8568-bc4af17c48b1', 2, 4, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 黒滝: 2-8 (12/14)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('1789a425-ad14-4355-8d71-6793320ef352', '90e69fe7-38b9-4bf7-afaa-e729ef95decc', 2, 8, '2024-12-14', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs TDFC: 0-5
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('1789a425-ad14-4355-8d71-6793320ef352', 'fd199536-7747-40f0-b058-ccc8b1b62d38', 0, 5, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs PALAVRA: 1-1 (12/21)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('1789a425-ad14-4355-8d71-6793320ef352', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 1, 1, '2024-12-21', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 東海岸: 1-1 (12/14)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('1789a425-ad14-4355-8d71-6793320ef352', 'f6a92320-dad2-48a9-95e0-046e7004fd8b', 1, 1, '2024-12-14', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs あざみ野K: 8-1
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('1789a425-ad14-4355-8d71-6793320ef352', '2e0cb14e-5a4f-440d-a341-3c9e6112355d', 8, 1, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- ==================== 東海岸 (H) ====================
-- vs ESFORCO: 0-22
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('f6a92320-dad2-48a9-95e0-046e7004fd8b', '8a8da5d6-ed98-48f3-8140-783908399fa0', 0, 22, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 大豆戸: 0-13 (12/28)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('f6a92320-dad2-48a9-95e0-046e7004fd8b', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 0, 13, '2024-12-28', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs あざみ野: 0-7
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('f6a92320-dad2-48a9-95e0-046e7004fd8b', '4be41b3d-2712-4db1-ad38-b5c74425db16', 0, 7, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs vinculo: 1-9
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('f6a92320-dad2-48a9-95e0-046e7004fd8b', 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48', 1, 9, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 横浜: 0-4
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('f6a92320-dad2-48a9-95e0-046e7004fd8b', '45e82eee-9428-4b40-8568-bc4af17c48b1', 0, 4, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 黒滝: なし（空欄）
-- vs TDFC: なし（空欄）

-- vs PALAVRA: 1-1 (12/21)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('f6a92320-dad2-48a9-95e0-046e7004fd8b', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 1, 1, '2024-12-21', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs SFAT: 1-1 (12/21)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('f6a92320-dad2-48a9-95e0-046e7004fd8b', '1789a425-ad14-4355-8d71-6793320ef352', 1, 1, '2024-12-21', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs あざみ野K: 0-4
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('f6a92320-dad2-48a9-95e0-046e7004fd8b', '2e0cb14e-5a4f-440d-a341-3c9e6112355d', 0, 4, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- ==================== あざみ野K (H) ====================
-- vs ESFORCO: 0-8
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('2e0cb14e-5a4f-440d-a341-3c9e6112355d', '8a8da5d6-ed98-48f3-8140-783908399fa0', 0, 8, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 大豆戸: 1-9
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('2e0cb14e-5a4f-440d-a341-3c9e6112355d', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 1, 9, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs あざみ野: 0-9
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('2e0cb14e-5a4f-440d-a341-3c9e6112355d', '4be41b3d-2712-4db1-ad38-b5c74425db16', 0, 9, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs vinculo: 0-10
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('2e0cb14e-5a4f-440d-a341-3c9e6112355d', 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48', 0, 10, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 横浜: 2-4 (11/16)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('2e0cb14e-5a4f-440d-a341-3c9e6112355d', '45e82eee-9428-4b40-8568-bc4af17c48b1', 2, 4, '2024-11-16', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 黒滝: なし（空欄）

-- vs TDFC: 0-4
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('2e0cb14e-5a4f-440d-a341-3c9e6112355d', 'fd199536-7747-40f0-b058-ccc8b1b62d38', 0, 4, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs PALAVRA: 1-1 (12/21)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('2e0cb14e-5a4f-440d-a341-3c9e6112355d', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 1, 1, '2024-12-21', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs SFAT: 1-8 (12/12)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('2e0cb14e-5a4f-440d-a341-3c9e6112355d', '1789a425-ad14-4355-8d71-6793320ef352', 1, 8, '2024-12-12', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vs 東海岸: 8-0 (12/12)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('2e0cb14e-5a4f-440d-a341-3c9e6112355d', 'f6a92320-dad2-48a9-95e0-046e7004fd8b', 8, 0, '2024-12-12', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- ==================================================
-- 順位も再設定
-- ==================================================
UPDATE team_standings SET rank = 1 WHERE team_id = '8a8da5d6-ed98-48f3-8140-783908399fa0' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
UPDATE team_standings SET rank = 2 WHERE team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
UPDATE team_standings SET rank = 3 WHERE team_id = '4be41b3d-2712-4db1-ad38-b5c74425db16' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
UPDATE team_standings SET rank = 4 WHERE team_id = 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
UPDATE team_standings SET rank = 5 WHERE team_id = '45e82eee-9428-4b40-8568-bc4af17c48b1' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
UPDATE team_standings SET rank = 6 WHERE team_id = '90e69fe7-38b9-4bf7-afaa-e729ef95decc' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
UPDATE team_standings SET rank = 7 WHERE team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
UPDATE team_standings SET rank = 8 WHERE team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
UPDATE team_standings SET rank = 9 WHERE team_id = '1789a425-ad14-4355-8d71-6793320ef352' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
UPDATE team_standings SET rank = 10 WHERE team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
UPDATE team_standings SET rank = 11 WHERE team_id = '2e0cb14e-5a4f-440d-a341-3c9e6112355d' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
