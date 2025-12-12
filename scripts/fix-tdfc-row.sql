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
