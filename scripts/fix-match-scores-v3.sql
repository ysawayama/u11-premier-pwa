-- 戦績表のスコアを本サイト（pl11.jp）と照合して修正 v3
-- Supabase Dashboard > SQL Editor で実行してください
-- シーズンID: d0efd9f2-bca5-47dd-a70f-7b60f814a1dc

-- ==================================================
-- STEP 1: 間違っているスコアを修正
-- ==================================================

-- ESFORCO vs vinculo: 5-0 → 2-1 (12/13)
UPDATE matches
SET home_score = 2, away_score = 1, match_date = '2024-12-13'
WHERE home_team_id = '8a8da5d6-ed98-48f3-8140-783908399fa0'
AND away_team_id = 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- ESFORCO vs 黒滝: 3-2 → 4-2
UPDATE matches
SET home_score = 4, away_score = 2
WHERE home_team_id = '8a8da5d6-ed98-48f3-8140-783908399fa0'
AND away_team_id = '90e69fe7-38b9-4bf7-afaa-e729ef95decc'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- ESFORCO vs TDFC: 4-2 → 3-1
UPDATE matches
SET home_score = 3, away_score = 1
WHERE home_team_id = '8a8da5d6-ed98-48f3-8140-783908399fa0'
AND away_team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- ESFORCO vs SFAT: 9-1 → 8-0
UPDATE matches
SET home_score = 8, away_score = 0
WHERE home_team_id = '8a8da5d6-ed98-48f3-8140-783908399fa0'
AND away_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 大豆戸 vs 黒滝: 2-4 → 2-1
UPDATE matches
SET home_score = 2, away_score = 1
WHERE home_team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9'
AND away_team_id = '90e69fe7-38b9-4bf7-afaa-e729ef95decc'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 大豆戸 vs SFAT: 1-0 → 5-0
UPDATE matches
SET home_score = 5, away_score = 0
WHERE home_team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9'
AND away_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- あざみ野 vs PALAVRA: 6-0 → 5-1 (12/28)
UPDATE matches
SET home_score = 5, away_score = 1, match_date = '2024-12-28'
WHERE home_team_id = '4be41b3d-2712-4db1-ad38-b5c74425db16'
AND away_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
AND home_score = 6 AND away_score = 0;

-- あざみ野 vs 東海岸: 7-0 → 10-0
UPDATE matches
SET home_score = 10, away_score = 0
WHERE home_team_id = '4be41b3d-2712-4db1-ad38-b5c74425db16'
AND away_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- vinculo vs 東海岸: 9-1 → 7-1 (12/20)
UPDATE matches
SET home_score = 7, away_score = 1, match_date = '2024-12-20'
WHERE home_team_id = 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48'
AND away_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
AND home_score = 9 AND away_score = 1;

-- 横浜 vs PALAVRA: 0-0 → 1-0 (12/13)
UPDATE matches
SET home_score = 1, away_score = 0, match_date = '2024-12-13'
WHERE home_team_id = '45e82eee-9428-4b40-8568-bc4af17c48b1'
AND away_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 横浜 vs SFAT: 4-2 → 2-2 (12/21)
UPDATE matches
SET home_score = 2, away_score = 2, match_date = '2024-12-21'
WHERE home_team_id = '45e82eee-9428-4b40-8568-bc4af17c48b1'
AND away_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 横浜 vs あざみ野K: 12-2 → 13-2
UPDATE matches
SET home_score = 13, away_score = 2
WHERE home_team_id = '45e82eee-9428-4b40-8568-bc4af17c48b1'
AND away_team_id = '2e0cb14e-5a4f-440d-a341-3c9e6112355d'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
AND home_score = 12 AND away_score = 2;

-- 黒滝 vs PALAVRA: 7-1 → 4-2 (12/14)
UPDATE matches
SET home_score = 4, away_score = 2, match_date = '2024-12-14'
WHERE home_team_id = '90e69fe7-38b9-4bf7-afaa-e729ef95decc'
AND away_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 黒滝 vs SFAT: 8-2 → 8-2 (11/16) 日付のみ更新
UPDATE matches
SET match_date = '2024-11-16'
WHERE home_team_id = '90e69fe7-38b9-4bf7-afaa-e729ef95decc'
AND away_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- TDFC vs 大豆戸: 0-2 → 1-2
UPDATE matches
SET home_score = 1, away_score = 2
WHERE home_team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38'
AND away_team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- TDFC vs vinculo: 1-7 → 2-4
UPDATE matches
SET home_score = 2, away_score = 4
WHERE home_team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38'
AND away_team_id = 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- TDFC vs SFAT: 5-0 → 2-0
UPDATE matches
SET home_score = 2, away_score = 0
WHERE home_team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38'
AND away_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- PALAVRA vs 横浜: 0-0 → 0-1 (12/21)
UPDATE matches
SET home_score = 0, away_score = 1, match_date = '2024-12-21'
WHERE home_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND away_team_id = '45e82eee-9428-4b40-8568-bc4af17c48b1'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- PALAVRA vs 黒滝: 1-7 → 2-4 (12/14)
UPDATE matches
SET home_score = 2, away_score = 4, match_date = '2024-12-14'
WHERE home_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND away_team_id = '90e69fe7-38b9-4bf7-afaa-e729ef95decc'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- PALAVRA vs TDFC: 0-1 → 0-2
UPDATE matches
SET home_score = 0, away_score = 2
WHERE home_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND away_team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- PALAVRA vs 東海岸: 11-1 → 3-2 (12/21)
UPDATE matches
SET home_score = 3, away_score = 2, match_date = '2024-12-21'
WHERE home_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND away_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- SFAT vs ESFORCO: 1-9 → 0-8
UPDATE matches
SET home_score = 0, away_score = 8
WHERE home_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND away_team_id = '8a8da5d6-ed98-48f3-8140-783908399fa0'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- SFAT vs 大豆戸: 0-1 → 0-5
UPDATE matches
SET home_score = 0, away_score = 5
WHERE home_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND away_team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- SFAT vs あざみ野: 1-2 → 1-5 (12/14)
UPDATE matches
SET home_score = 1, away_score = 5, match_date = '2024-12-14'
WHERE home_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND away_team_id = '4be41b3d-2712-4db1-ad38-b5c74425db16'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- SFAT vs 横浜: 2-4 → 2-2 (12/21)
UPDATE matches
SET home_score = 2, away_score = 2, match_date = '2024-12-21'
WHERE home_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND away_team_id = '45e82eee-9428-4b40-8568-bc4af17c48b1'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- SFAT vs 黒滝: 2-8 → 2-8 (11/16) 日付のみ更新
UPDATE matches
SET match_date = '2024-11-16'
WHERE home_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND away_team_id = '90e69fe7-38b9-4bf7-afaa-e729ef95decc'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- SFAT vs TDFC: 0-5 → 0-2
UPDATE matches
SET home_score = 0, away_score = 2
WHERE home_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND away_team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 東海岸 vs ESFORCO: 0-9 → 0-22
UPDATE matches
SET home_score = 0, away_score = 22
WHERE home_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND away_team_id = '8a8da5d6-ed98-48f3-8140-783908399fa0'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
AND home_score = 0 AND away_score = 9;

-- 東海岸 vs あざみ野: 0-7 → 0-10
UPDATE matches
SET home_score = 0, away_score = 10
WHERE home_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND away_team_id = '4be41b3d-2712-4db1-ad38-b5c74425db16'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 東海岸 vs vinculo: 1-9 → 1-7 (12/20)
UPDATE matches
SET home_score = 1, away_score = 7, match_date = '2024-12-20'
WHERE home_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND away_team_id = 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 東海岸 vs PALAVRA: 3-2 → 2-3 (12/21)
UPDATE matches
SET home_score = 2, away_score = 3, match_date = '2024-12-21'
WHERE home_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND away_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 東海岸 vs SFAT: 1-1 → 0-4
UPDATE matches
SET home_score = 0, away_score = 4
WHERE home_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND away_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 東海岸 vs あざみ野K: 0-8 → 1-1 (12/21)
UPDATE matches
SET home_score = 1, away_score = 1, match_date = '2024-12-21'
WHERE home_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND away_team_id = '2e0cb14e-5a4f-440d-a341-3c9e6112355d'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- あざみ野K vs 横浜: 2-3 → 2-12
UPDATE matches
SET home_score = 2, away_score = 12
WHERE home_team_id = '2e0cb14e-5a4f-440d-a341-3c9e6112355d'
AND away_team_id = '45e82eee-9428-4b40-8568-bc4af17c48b1'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- ==================================================
-- STEP 2: 不足している試合を追加（venue, match_typeを含む）
-- ==================================================

-- 大豆戸 vs 横浜: 5-0 (6/22) を追加
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT '7b4c8e6b-2333-4414-8262-a7a05e8193c9', '45e82eee-9428-4b40-8568-bc4af17c48b1', 5, 0, '2024-06-22', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9'
  AND away_team_id = '45e82eee-9428-4b40-8568-bc4af17c48b1'
  AND home_score = 5 AND away_score = 0
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);

-- 大豆戸 vs PALAVRA: DBから6-1と3-0を削除して1-0を追加
DELETE FROM matches
WHERE home_team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9'
AND away_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7b4c8e6b-2333-4414-8262-a7a05e8193c9', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 1, 0, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- vinculo vs 東海岸: 10-0を削除（7-1のみ残す）
DELETE FROM matches
WHERE home_team_id = 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48'
AND away_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND home_score = 10 AND away_score = 0
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 黒滝 vs あざみ野K: 4-0 (11/16) を追加
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT '90e69fe7-38b9-4bf7-afaa-e729ef95decc', '2e0cb14e-5a4f-440d-a341-3c9e6112355d', 4, 0, '2024-11-16', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = '90e69fe7-38b9-4bf7-afaa-e729ef95decc'
  AND away_team_id = '2e0cb14e-5a4f-440d-a341-3c9e6112355d'
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);

-- ==================================================
-- STEP 3: 不要な試合を削除
-- ==================================================

-- PALAVRA vs ESFORCO: 0-8を削除（1-3のみ残す）
DELETE FROM matches
WHERE home_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND away_team_id = '8a8da5d6-ed98-48f3-8140-783908399fa0'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
AND home_score = 0 AND away_score = 8;

-- ESFORCO vs PALAVRA: 8-0 → 本サイトでは空欄なので削除
DELETE FROM matches
WHERE home_team_id = '8a8da5d6-ed98-48f3-8140-783908399fa0'
AND away_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- ESFORCO vs あざみ野K: 8-0 → 本サイトでは空欄なので削除
DELETE FROM matches
WHERE home_team_id = '8a8da5d6-ed98-48f3-8140-783908399fa0'
AND away_team_id = '2e0cb14e-5a4f-440d-a341-3c9e6112355d'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- ESFORCO vs 東海岸: 9-0を削除（22-0のみ残す）
DELETE FROM matches
WHERE home_team_id = '8a8da5d6-ed98-48f3-8140-783908399fa0'
AND away_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND home_score = 9 AND away_score = 0
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 東海岸 vs 黒滝: 1-1 → 本サイトでは空欄なので削除
DELETE FROM matches
WHERE home_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND away_team_id = '90e69fe7-38b9-4bf7-afaa-e729ef95decc'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 東海岸 vs TDFC: 0-2 → 本サイトでは空欄なので削除
DELETE FROM matches
WHERE home_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND away_team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
