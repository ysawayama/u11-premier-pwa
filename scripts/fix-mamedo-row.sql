-- 大豆戸FC（ホーム）の試合結果を修正
-- Supabase Dashboard > SQL Editor で実行してください

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
