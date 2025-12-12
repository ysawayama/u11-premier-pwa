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
