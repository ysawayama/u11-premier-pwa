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
