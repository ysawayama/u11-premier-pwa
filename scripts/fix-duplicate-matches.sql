-- 重複している試合データを削除し、正しいデータに修正
-- Supabase Dashboard > SQL Editor で実行してください

-- ステップ1: 重複を確認
SELECT home_team_id, away_team_id, home_score, away_score, COUNT(*) as cnt
FROM matches
WHERE season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
AND status = 'finished'
GROUP BY home_team_id, away_team_id, home_score, away_score
HAVING COUNT(*) > 1;

-- ステップ2: 重複レコードを削除（各対戦カード・スコアで最新のものを残す）
-- PostgreSQL用のCTEを使用

WITH duplicates AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY home_team_id, away_team_id, home_score, away_score
      ORDER BY created_at ASC
    ) as rn
  FROM matches
  WHERE season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
)
DELETE FROM matches
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- ステップ3: 大豆戸 vs 横浜ジュニオールの6/22の試合スコアを5-0に修正
-- (既存が0-5になっている場合、ホーム/アウェイが逆)
-- 確認: SELECT * FROM matches WHERE home_team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9' AND away_team_id = '45e82eee-9428-4b40-8568-bc4af17c48b1';

-- 大豆戸(H) vs 横浜ジュニオール(A) で6/22の試合がなければ追加
-- 画像を見ると大豆戸行の横浜列は「5-0 (6/22)」と「3-1 (10/13)」の2試合
