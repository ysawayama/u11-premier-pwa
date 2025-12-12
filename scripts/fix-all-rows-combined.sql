-- =====================================================
-- 全チームの試合結果を修正（本サイト画像から1行ずつ確認）
-- Supabase Dashboard > SQL Editor で実行してください
-- =====================================================

-- 大豆戸FC（ホーム）の試合結果を修正

-- 大豆戸: 7b4c8e6b-2333-4414-8262-a7a05e8193c9
-- シーズン: d0efd9f2-bca5-47dd-a70f-7b60f814a1dc

-- 1. 大豆戸 vs あざみ野: 2-1 を追加（6-3は既存）
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT '7b4c8e6b-2333-4414-8262-a7a05e8193c9', '4be41b3d-2712-4db1-ad38-b5c74425db16', 2, 1, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9'
  AND away_team_id = '4be41b3d-2712-4db1-ad38-b5c74425db16'
  AND home_score = 2 AND away_score = 1
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);

-- 2. 大豆戸 vs 黒滝: 2-1 → 2-4 に修正
UPDATE matches
SET home_score = 2, away_score = 4
WHERE home_team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9'
AND away_team_id = '90e69fe7-38b9-4bf7-afaa-e729ef95decc'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 3. 大豆戸 vs TDFC: 2-0 を追加（2-1は既存）
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 'fd199536-7747-40f0-b058-ccc8b1b62d38', 2, 0, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9'
  AND away_team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38'
  AND home_score = 2 AND away_score = 0
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);

-- 4. 大豆戸 vs PALAVRA: 1-0 を削除して 6-1, 3-0 を追加
DELETE FROM matches
WHERE home_team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9'
AND away_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7b4c8e6b-2333-4414-8262-a7a05e8193c9', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 6, 1, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7b4c8e6b-2333-4414-8262-a7a05e8193c9', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 3, 0, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- 5. 大豆戸 vs SFAT: 5-0 → 1-0 に修正
UPDATE matches
SET home_score = 1, away_score = 0
WHERE home_team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9'
AND away_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
-- あざみ野FC（ホーム）の試合結果を修正
-- Supabase Dashboard > SQL Editor で実行してください

-- あざみ野: 4be41b3d-2712-4db1-ad38-b5c74425db16
-- シーズン: d0efd9f2-bca5-47dd-a70f-7b60f814a1dc

-- 1. あざみ野 vs 大豆戸: 1-2 を追加（3-6は既存）
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT '4be41b3d-2712-4db1-ad38-b5c74425db16', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 1, 2, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = '4be41b3d-2712-4db1-ad38-b5c74425db16'
  AND away_team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9'
  AND home_score = 1 AND away_score = 2
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);

-- 2. あざみ野 vs 横浜: 6-1 を追加（1-3は既存）
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT '4be41b3d-2712-4db1-ad38-b5c74425db16', '45e82eee-9428-4b40-8568-bc4af17c48b1', 6, 1, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = '4be41b3d-2712-4db1-ad38-b5c74425db16'
  AND away_team_id = '45e82eee-9428-4b40-8568-bc4af17c48b1'
  AND home_score = 6 AND away_score = 1
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);

-- 3. あざみ野 vs TDFC: 1-0, 5-0 を追加（現在なし）
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT '4be41b3d-2712-4db1-ad38-b5c74425db16', 'fd199536-7747-40f0-b058-ccc8b1b62d38', 1, 0, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = '4be41b3d-2712-4db1-ad38-b5c74425db16'
  AND away_team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38'
  AND home_score = 1 AND away_score = 0
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT '4be41b3d-2712-4db1-ad38-b5c74425db16', 'fd199536-7747-40f0-b058-ccc8b1b62d38', 5, 0, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = '4be41b3d-2712-4db1-ad38-b5c74425db16'
  AND away_team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38'
  AND home_score = 5 AND away_score = 0
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);

-- 4. あざみ野 vs PALAVRA: 既存を削除して 6-0, 3-1 を追加
DELETE FROM matches
WHERE home_team_id = '4be41b3d-2712-4db1-ad38-b5c74425db16'
AND away_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('4be41b3d-2712-4db1-ad38-b5c74425db16', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 6, 0, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('4be41b3d-2712-4db1-ad38-b5c74425db16', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 3, 1, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- 5. あざみ野 vs 東海岸: 10-0 → 7-0 に修正
UPDATE matches
SET home_score = 7, away_score = 0, match_date = '2024-12-28'
WHERE home_team_id = '4be41b3d-2712-4db1-ad38-b5c74425db16'
AND away_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 6. あざみ野 vs あざみ野K: 10-0 を追加（9-0は既存）
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT '4be41b3d-2712-4db1-ad38-b5c74425db16', '2e0cb14e-5a4f-440d-a341-3c9e6112355d', 10, 0, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = '4be41b3d-2712-4db1-ad38-b5c74425db16'
  AND away_team_id = '2e0cb14e-5a4f-440d-a341-3c9e6112355d'
  AND home_score = 10 AND away_score = 0
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);
-- FC.vinculo（ホーム）の試合結果を修正
-- Supabase Dashboard > SQL Editor で実行してください

-- vinculo: b57cd2ec-38ca-4765-91ce-9f1c920b5d48
-- シーズン: d0efd9f2-bca5-47dd-a70f-7b60f814a1dc

-- 1. vinculo vs PALAVRA: 日付を12/20に更新
UPDATE matches
SET match_date = '2024-12-20'
WHERE home_team_id = 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48'
AND away_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 2. vinculo vs 東海岸: 7-1 → 9-1 に修正
UPDATE matches
SET home_score = 9, away_score = 1
WHERE home_team_id = 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48'
AND away_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
-- 横浜ジュニオールSC（ホーム）の試合結果を修正
-- Supabase Dashboard > SQL Editor で実行してください

-- 横浜: 45e82eee-9428-4b40-8568-bc4af17c48b1
-- シーズン: d0efd9f2-bca5-47dd-a70f-7b60f814a1dc

-- 1. 横浜 vs 大豆戸: 3-1 → 0-5, 1-3 に修正
DELETE FROM matches
WHERE home_team_id = '45e82eee-9428-4b40-8568-bc4af17c48b1'
AND away_team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('45e82eee-9428-4b40-8568-bc4af17c48b1', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 0, 5, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('45e82eee-9428-4b40-8568-bc4af17c48b1', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 1, 3, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- 2. 横浜 vs あざみ野: 1-3 → 3-1, 1-6 に修正
DELETE FROM matches
WHERE home_team_id = '45e82eee-9428-4b40-8568-bc4af17c48b1'
AND away_team_id = '4be41b3d-2712-4db1-ad38-b5c74425db16'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('45e82eee-9428-4b40-8568-bc4af17c48b1', '4be41b3d-2712-4db1-ad38-b5c74425db16', 3, 1, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('45e82eee-9428-4b40-8568-bc4af17c48b1', '4be41b3d-2712-4db1-ad38-b5c74425db16', 1, 6, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- 3. 横浜 vs TDFC: 日付を更新（スコア2-2はOK）
UPDATE matches
SET match_date = '2024-06-01'
WHERE home_team_id = '45e82eee-9428-4b40-8568-bc4af17c48b1'
AND away_team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 4. 横浜 vs PALAVRA: 2-2 → 0-0 に修正
UPDATE matches
SET home_score = 0, away_score = 0
WHERE home_team_id = '45e82eee-9428-4b40-8568-bc4af17c48b1'
AND away_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 5. 横浜 vs あざみ野K: 13-2 → 12-2 に修正（3-2はそのまま）
UPDATE matches
SET home_score = 12, away_score = 2
WHERE home_team_id = '45e82eee-9428-4b40-8568-bc4af17c48b1'
AND away_team_id = '2e0cb14e-5a4f-440d-a341-3c9e6112355d'
AND home_score = 13 AND away_score = 2
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
-- 黒滝SC（ホーム）の試合結果を修正
-- Supabase Dashboard > SQL Editor で実行してください

-- 黒滝: 90e69fe7-38b9-4bf7-afaa-e729ef95decc
-- シーズン: d0efd9f2-bca5-47dd-a70f-7b60f814a1dc

-- 1. 黒滝 vs 大豆戸: 4-3 → 4-2 に修正
UPDATE matches
SET home_score = 4, away_score = 2
WHERE home_team_id = '90e69fe7-38b9-4bf7-afaa-e729ef95decc'
AND away_team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 2. 黒滝 vs PALAVRA: 8-2 → 7-1 に修正
UPDATE matches
SET home_score = 7, away_score = 1
WHERE home_team_id = '90e69fe7-38b9-4bf7-afaa-e729ef95decc'
AND away_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 3. 黒滝 vs SFAT: 日付を 12/14 に修正（スコア8-2はOK）
UPDATE matches
SET match_date = '2024-12-14'
WHERE home_team_id = '90e69fe7-38b9-4bf7-afaa-e729ef95decc'
AND away_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 4. 黒滝 vs 東海岸: 1-1 (11/16) を追加
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT '90e69fe7-38b9-4bf7-afaa-e729ef95decc', 'f6a92320-dad2-48a9-95e0-046e7004fd8b', 1, 1, '2024-11-16', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = '90e69fe7-38b9-4bf7-afaa-e729ef95decc'
  AND away_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);
-- TDFC（ホーム）の試合結果を修正
-- Supabase Dashboard > SQL Editor で実行してください

-- TDFC: fd199536-7747-40f0-b058-ccc8b1b62d38
-- シーズン: d0efd9f2-bca5-47dd-a70f-7b60f814a1dc

-- 1. TDFC vs ESFORCO: 0-5 を追加（2-4は既存）
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT 'fd199536-7747-40f0-b058-ccc8b1b62d38', '8a8da5d6-ed98-48f3-8140-783908399fa0', 0, 5, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38'
  AND away_team_id = '8a8da5d6-ed98-48f3-8140-783908399fa0'
  AND home_score = 0 AND away_score = 5
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);

-- 2. TDFC vs 大豆戸: 1-2 を追加（0-2は既存）
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT 'fd199536-7747-40f0-b058-ccc8b1b62d38', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 1, 2, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38'
  AND away_team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9'
  AND home_score = 1 AND away_score = 2
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);

-- 3. TDFC vs あざみ野: 0-5 を追加（0-1は既存）
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT 'fd199536-7747-40f0-b058-ccc8b1b62d38', '4be41b3d-2712-4db1-ad38-b5c74425db16', 0, 5, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38'
  AND away_team_id = '4be41b3d-2712-4db1-ad38-b5c74425db16'
  AND home_score = 0 AND away_score = 5
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);

-- 4. TDFC vs PALAVRA: 1-0 を追加（2-0は既存）
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT 'fd199536-7747-40f0-b058-ccc8b1b62d38', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 1, 0, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38'
  AND away_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
  AND home_score = 1 AND away_score = 0
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);

-- 5. TDFC vs 東海岸: 2-0 (12/21) を追加
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT 'fd199536-7747-40f0-b058-ccc8b1b62d38', 'f6a92320-dad2-48a9-95e0-046e7004fd8b', 2, 0, '2024-12-21', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38'
  AND away_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);

-- 6. TDFC vs あざみ野K: 日付を 12/21 に更新
UPDATE matches
SET match_date = '2024-12-21'
WHERE home_team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38'
AND away_team_id = '2e0cb14e-5a4f-440d-a341-3c9e6112355d'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
-- PALAVRA FC（ホーム）の試合結果を修正
-- Supabase Dashboard > SQL Editor で実行してください

-- PALAVRA: 7d2c5a9d-3c44-4210-9599-b98dfa8bd626
-- シーズン: d0efd9f2-bca5-47dd-a70f-7b60f814a1dc

-- 1. PALAVRA vs ESFORCO: 0-8 を追加（1-3は既存）
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', '8a8da5d6-ed98-48f3-8140-783908399fa0', 0, 8, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
  AND away_team_id = '8a8da5d6-ed98-48f3-8140-783908399fa0'
  AND home_score = 0 AND away_score = 8
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);

-- 2. PALAVRA vs 大豆戸: 0-8 → 1-6, 0-3 に修正
DELETE FROM matches
WHERE home_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND away_team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7d2c5a9d-3c44-4210-9599-b98dfa8bd626', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 1, 6, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7d2c5a9d-3c44-4210-9599-b98dfa8bd626', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 0, 3, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- 3. PALAVRA vs あざみ野: 0-6 を追加（1-3は既存）
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', '4be41b3d-2712-4db1-ad38-b5c74425db16', 0, 6, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
  AND away_team_id = '4be41b3d-2712-4db1-ad38-b5c74425db16'
  AND home_score = 0 AND away_score = 6
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);

-- 4. PALAVRA vs vinculo: 日付を 12/20 に更新
UPDATE matches
SET match_date = '2024-12-20'
WHERE home_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND away_team_id = 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 5. PALAVRA vs TDFC: 0-5 → 0-2, 0-1 に修正
DELETE FROM matches
WHERE home_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND away_team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 'fd199536-7747-40f0-b058-ccc8b1b62d38', 0, 2, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 'fd199536-7747-40f0-b058-ccc8b1b62d38', 0, 1, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- 6. PALAVRA vs SFAT: 日付を 12/14 に修正
UPDATE matches
SET match_date = '2024-12-14'
WHERE home_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND away_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 7. PALAVRA vs 東海岸: 2-3 を追加（11-1は既存）
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 'f6a92320-dad2-48a9-95e0-046e7004fd8b', 2, 3, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
  AND away_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
  AND home_score = 2 AND away_score = 3
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);
-- SFAT ISEHARA SC（ホーム）の試合結果を修正
-- Supabase Dashboard > SQL Editor で実行してください

-- SFAT: 1789a425-ad14-4355-8d71-6793320ef352
-- シーズン: d0efd9f2-bca5-47dd-a70f-7b60f814a1dc

-- 1. SFAT vs 大豆戸: 0-5 → 0-1 に修正
UPDATE matches
SET home_score = 0, away_score = 1
WHERE home_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND away_team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 2. SFAT vs あざみ野: 日付を通常に戻す
UPDATE matches
SET match_date = '2024-06-01'
WHERE home_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND away_team_id = '4be41b3d-2712-4db1-ad38-b5c74425db16'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 3. SFAT vs 横浜: 日付を 12/14 に更新
UPDATE matches
SET match_date = '2024-12-14'
WHERE home_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND away_team_id = '45e82eee-9428-4b40-8568-bc4af17c48b1'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 4. SFAT vs 黒滝: 日付を通常に戻す
UPDATE matches
SET match_date = '2024-06-01'
WHERE home_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND away_team_id = '90e69fe7-38b9-4bf7-afaa-e729ef95decc'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 5. SFAT vs 東海岸: 日付を通常に戻す
UPDATE matches
SET match_date = '2024-06-01'
WHERE home_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND away_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
-- FC東海岸（ホーム）の試合結果を修正
-- Supabase Dashboard > SQL Editor で実行してください

-- 東海岸: f6a92320-dad2-48a9-95e0-046e7004fd8b
-- シーズン: d0efd9f2-bca5-47dd-a70f-7b60f814a1dc

-- 1. 東海岸 vs ESFORCO: 0-9 を追加（0-22は既存）
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT 'f6a92320-dad2-48a9-95e0-046e7004fd8b', '8a8da5d6-ed98-48f3-8140-783908399fa0', 0, 9, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
  AND away_team_id = '8a8da5d6-ed98-48f3-8140-783908399fa0'
  AND home_score = 0 AND away_score = 9
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);

-- 2. 東海岸 vs 大豆戸: 日付を通常に戻す
UPDATE matches
SET match_date = '2024-06-01'
WHERE home_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND away_team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 3. 東海岸 vs あざみ野: 日付を 12/28 に更新
UPDATE matches
SET match_date = '2024-12-28'
WHERE home_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND away_team_id = '4be41b3d-2712-4db1-ad38-b5c74425db16'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 4. 東海岸 vs 黒滝: 1-1 (11/16) を追加
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT 'f6a92320-dad2-48a9-95e0-046e7004fd8b', '90e69fe7-38b9-4bf7-afaa-e729ef95decc', 1, 1, '2024-11-16', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
  AND away_team_id = '90e69fe7-38b9-4bf7-afaa-e729ef95decc'
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);

-- 5. 東海岸 vs TDFC: 0-2 (12/21) を追加
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT 'f6a92320-dad2-48a9-95e0-046e7004fd8b', 'fd199536-7747-40f0-b058-ccc8b1b62d38', 0, 2, '2024-12-21', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
  AND away_team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38'
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);

-- 6. 東海岸 vs PALAVRA: 1-1 → 3-2, 1-11 に修正
DELETE FROM matches
WHERE home_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND away_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('f6a92320-dad2-48a9-95e0-046e7004fd8b', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 3, 2, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('f6a92320-dad2-48a9-95e0-046e7004fd8b', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 1, 11, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- 7. 東海岸 vs SFAT: 日付を通常に戻す
UPDATE matches
SET match_date = '2024-06-01'
WHERE home_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND away_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 8. 東海岸 vs あざみ野K: 0-4 → 0-8 に修正、日付 12/21
UPDATE matches
SET home_score = 0, away_score = 8, match_date = '2024-12-21'
WHERE home_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND away_team_id = '2e0cb14e-5a4f-440d-a341-3c9e6112355d'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
-- あざみ野キッカーズ（ホーム）の試合結果を修正
-- Supabase Dashboard > SQL Editor で実行してください

-- あざみ野K: 2e0cb14e-5a4f-440d-a341-3c9e6112355d
-- シーズン: d0efd9f2-bca5-47dd-a70f-7b60f814a1dc

-- 1. あざみ野K vs 大豆戸: 1-9 → 1-5, 0-8 に修正
DELETE FROM matches
WHERE home_team_id = '2e0cb14e-5a4f-440d-a341-3c9e6112355d'
AND away_team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('2e0cb14e-5a4f-440d-a341-3c9e6112355d', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 1, 5, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('2e0cb14e-5a4f-440d-a341-3c9e6112355d', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 0, 8, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- 2. あざみ野K vs あざみ野: 0-10 を追加（0-9は既存）
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT '2e0cb14e-5a4f-440d-a341-3c9e6112355d', '4be41b3d-2712-4db1-ad38-b5c74425db16', 0, 10, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = '2e0cb14e-5a4f-440d-a341-3c9e6112355d'
  AND away_team_id = '4be41b3d-2712-4db1-ad38-b5c74425db16'
  AND home_score = 0 AND away_score = 10
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);

-- 3. あざみ野K vs 横浜: 2-4 → 2-12, 2-3 に修正
DELETE FROM matches
WHERE home_team_id = '2e0cb14e-5a4f-440d-a341-3c9e6112355d'
AND away_team_id = '45e82eee-9428-4b40-8568-bc4af17c48b1'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('2e0cb14e-5a4f-440d-a341-3c9e6112355d', '45e82eee-9428-4b40-8568-bc4af17c48b1', 2, 12, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('2e0cb14e-5a4f-440d-a341-3c9e6112355d', '45e82eee-9428-4b40-8568-bc4af17c48b1', 2, 3, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- 4. あざみ野K vs 黒滝: 0-4 (11/16) を追加
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT '2e0cb14e-5a4f-440d-a341-3c9e6112355d', '90e69fe7-38b9-4bf7-afaa-e729ef95decc', 0, 4, '2024-11-16', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = '2e0cb14e-5a4f-440d-a341-3c9e6112355d'
  AND away_team_id = '90e69fe7-38b9-4bf7-afaa-e729ef95decc'
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);

-- 5. あざみ野K vs TDFC: 日付を 12/21 に更新
UPDATE matches
SET match_date = '2024-12-21'
WHERE home_team_id = '2e0cb14e-5a4f-440d-a341-3c9e6112355d'
AND away_team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 6. あざみ野K vs PALAVRA: 日付を通常に戻す
UPDATE matches
SET match_date = '2024-06-01'
WHERE home_team_id = '2e0cb14e-5a4f-440d-a341-3c9e6112355d'
AND away_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 7. あざみ野K vs 東海岸: 日付を 12/21 に更新
UPDATE matches
SET match_date = '2024-12-21'
WHERE home_team_id = '2e0cb14e-5a4f-440d-a341-3c9e6112355d'
AND away_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
