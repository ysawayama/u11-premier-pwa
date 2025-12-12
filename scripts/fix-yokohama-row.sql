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
