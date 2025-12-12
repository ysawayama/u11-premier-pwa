-- 順位表の順序を本サイト（https://pl11.jp/kanagawa/2nd_a_2025）と同じに更新
-- Supabase Dashboard > SQL Editor で実行してください

-- 現在のシーズンIDを確認
-- SELECT id FROM seasons WHERE is_current = true;
-- 結果: d0efd9f2-bca5-47dd-a70f-7b60f814a1dc

-- 変更が必要な順位のみ更新（team_idは上記で確認済み）
-- 2位: 大豆戸FC
-- 3位: あざみ野FC
-- 4位: FC.vinculo
-- 8位: PALAVRA FC
-- 9位: SFAT ISEHARA SC

UPDATE team_standings
SET rank = 2
WHERE team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

UPDATE team_standings
SET rank = 3
WHERE team_id = '4be41b3d-2712-4db1-ad38-b5c74425db16'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

UPDATE team_standings
SET rank = 4
WHERE team_id = 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

UPDATE team_standings
SET rank = 8
WHERE team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

UPDATE team_standings
SET rank = 9
WHERE team_id = '1789a425-ad14-4355-8d71-6793320ef352'
AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 確認用クエリ（実行後にこれを実行して確認）
SELECT ts.rank, t.name
FROM team_standings ts
JOIN teams t ON ts.team_id = t.id
WHERE ts.season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
ORDER BY ts.rank;
