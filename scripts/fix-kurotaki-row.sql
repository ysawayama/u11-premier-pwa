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
