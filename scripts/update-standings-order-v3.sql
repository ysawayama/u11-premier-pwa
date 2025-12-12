-- 順位表の順序を本サイト（https://pl11.jp/kanagawa/2nd_a_2025）と同じに更新
-- Supabase Dashboard > SQL Editor で実行してください
--
-- 本サイトの順序:
-- 1. ESFORCO F.C.
-- 2. 大豆戸FC
-- 3. あざみ野FC
-- 4. FC.vinculo
-- 5. 横浜ジュニオールSC
-- 6. 黒滝SC
-- 7. TDFC
-- 8. PALAVRA FC
-- 9. SFAT ISEHARA SC
-- 10. FC東海岸
-- 11. あざみ野キッカーズ
--
-- 現在のシーズンID: d0efd9f2-bca5-47dd-a70f-7b60f814a1dc

-- 全11チームの順位を一括で更新
-- 1位: ESFORCO (変更なし)
UPDATE team_standings SET rank = 1 WHERE team_id = '8a8da5d6-ed98-48f3-8140-783908399fa0' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 2位: 大豆戸FC (現在3位→2位)
UPDATE team_standings SET rank = 2 WHERE team_id = '7b4c8e6b-2333-4414-8262-a7a05e8193c9' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 3位: あざみ野FC (現在4位→3位)
UPDATE team_standings SET rank = 3 WHERE team_id = '4be41b3d-2712-4db1-ad38-b5c74425db16' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 4位: FC.vinculo (現在2位→4位)
UPDATE team_standings SET rank = 4 WHERE team_id = 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 5位: 横浜ジュニオールSC (変更なし)
UPDATE team_standings SET rank = 5 WHERE team_id = '45e82eee-9428-4b40-8568-bc4af17c48b1' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 6位: 黒滝SC (変更なし)
UPDATE team_standings SET rank = 6 WHERE team_id = '90e69fe7-38b9-4bf7-afaa-e729ef95decc' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 7位: TDFC (変更なし)
UPDATE team_standings SET rank = 7 WHERE team_id = 'fd199536-7747-40f0-b058-ccc8b1b62d38' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 8位: PALAVRA FC (現在9位→8位)
UPDATE team_standings SET rank = 8 WHERE team_id = '7d2c5a9d-3c44-4210-9599-b98dfa8bd626' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 9位: SFAT ISEHARA SC (現在8位→9位)
UPDATE team_standings SET rank = 9 WHERE team_id = '1789a425-ad14-4355-8d71-6793320ef352' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 10位: FC東海岸 (変更なし)
UPDATE team_standings SET rank = 10 WHERE team_id = 'f6a92320-dad2-48a9-95e0-046e7004fd8b' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 11位: あざみ野キッカーズ (変更なし)
UPDATE team_standings SET rank = 11 WHERE team_id = '2e0cb14e-5a4f-440d-a341-3c9e6112355d' AND season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';

-- 確認用クエリ（実行後にこれを実行して確認）
SELECT ts.rank, t.name
FROM team_standings ts
JOIN teams t ON ts.team_id = t.id
WHERE ts.season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc'
ORDER BY ts.rank;
