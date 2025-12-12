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
