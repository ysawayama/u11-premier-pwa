-- FC.vinculo（ホーム）の試合結果を修正
-- Supabase Dashboard > SQL Editor で実行してください

-- vinculo: b57cd2ec-38ca-4765-91ce-9f1c920b5d48
-- シーズン: d0efd9f2-bca5-47dd-a70f-7b60f814a1dc

-- 1. vinculo vs PALAVRA: 日付を12/20に更新
UPDATE matches
SET match_date = '2024-12-20'
WHERE home_team_id = 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48'
AND away_team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 2. vinculo vs 東海岸: 7-1 → 9-1 に修正
UPDATE matches
SET home_score = 9, away_score = 1
WHERE home_team_id = 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48'
AND away_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
