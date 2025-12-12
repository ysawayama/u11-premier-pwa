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
