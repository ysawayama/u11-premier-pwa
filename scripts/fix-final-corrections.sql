-- 最終修正
-- Supabase Dashboard > SQL Editor で実行してください

-- 1. 大豆戸 vs TDFC: 1戦目と2戦目の順序を修正
-- 現在: 上段2-1、下段2-0 → 正しくは: 上段2-0、下段2-1
-- match_dateを入れ替えることで順序を修正

-- まず既存を削除
DELETE FROM matches
WHERE home_team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9'
AND away_team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 2-0を先（上段）、2-1を後（下段）で挿入
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7b4c8e6b-2333-4414-8262-a7a05e8193c9', 'fd199536-7747-40f0-b058-ccc8b1b62d38', 2, 0, '2024-06-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
VALUES ('7b4c8e6b-2333-4414-8262-a7a05e8193c9', 'fd199536-7747-40f0-b058-ccc8b1b62d38', 2, 1, '2024-10-01', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc');

-- 2. あざみ野K vs vinculo: 0-10 → 0-4 に修正
UPDATE matches
SET home_score = 0, away_score = 4
WHERE home_team_id = '2e0cb14e-5a4f-440d-a341-3c9e6112355d'
AND away_team_id = 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
