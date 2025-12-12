-- 残りの差異を修正
-- Supabase Dashboard > SQL Editor で実行してください

-- ==================================================
-- 画像と照合した結果、以下の修正が必要
-- ==================================================

-- SFAT vs 東海岸: 1-1 → 0-4 (12/14)
UPDATE matches
SET home_score = 0, away_score = 4, match_date = '2024-12-14'
WHERE home_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND away_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- あざみ野K vs 東海岸: 追加 8-0 (12/12)
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT '2e0cb14e-5a4f-440d-a341-3c9e6112355d', 'f6a92320-dad2-48a9-95e0-046e7004fd8b', 8, 0, '2024-12-12', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = '2e0cb14e-5a4f-440d-a341-3c9e6112355d'
  AND away_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);

-- 東海岸 vs SFAT: 0-4 → 確認（本サイトでは空欄のはずだが...）
-- 画像を見ると東海岸行のSFAT列は空欄、SFAT行の東海岸列に0-4がある
-- 現在DBには東海岸→SFATが0-4になっているので削除が必要かも
-- → 実際には本サイト画像でSFAT行の東海岸列は「0-4」なので
--   SFAT(H) vs 東海岸(A) = 0-4 が正しい
-- → 東海岸(H) vs SFAT(A) は空欄なので削除

-- 東海岸 vs SFAT を確認して必要なら削除
DELETE FROM matches
WHERE home_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
AND away_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- SFAT vs 東海岸: 存在しなければ追加
INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, venue, match_type, status, season_id)
SELECT '1789a425-ad14-4355-8d71-6793320ef352', 'f6a92320-dad2-48a9-95e0-046e7004fd8b', 0, 4, '2024-12-14', '未定', 'league', 'finished', 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
WHERE NOT EXISTS (
  SELECT 1 FROM matches
  WHERE home_team_id = '1789a425-ad14-4355-8d71-6793320ef352'
  AND away_team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b'
  AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
);
