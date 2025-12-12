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
