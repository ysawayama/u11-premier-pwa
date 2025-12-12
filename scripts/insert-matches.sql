-- 不足している試合データを追加するSQL
-- Supabase Dashboard > SQL Editor で実行してください

-- シーズンID (2025シーズン)
-- SELECT id FROM seasons WHERE is_current = true;
-- 結果: d0efd9f2-bca5-47dd-a70f-7b60f814a1dc

-- チームID一覧
-- ESFORCO: 8a8da5d6-ed98-48f3-8140-783908399fa0
-- vinculo: b57cd2ec-38ca-4765-91ce-9f1c920b5d48
-- 東海岸: f6a92320-dad2-48a9-95e0-046e7004fd8b
-- PALAVRA: 7d2c5a9d-3c44-4210-9599-b98dfa8bd626
-- SFAT伊勢原: 1789a425-ad14-4355-8d71-6793320ef352
-- TDFC: fd199536-7747-40f0-b058-ccc8b1b62d38
-- あざみ野: 4be41b3d-2712-4db1-ad38-b5c74425db16
-- あざみ野K: 2e0cb14e-5a4f-440d-a341-3c9e6112355d
-- 大豆戸: 7b4c8e6b-2333-4414-8262-a7a05e8193c9
-- 横浜ジュニオール: 45e82eee-9428-4b40-8568-bc4af17c48b1
-- 黒滝: 90e69fe7-38b9-4bf7-afaa-e729ef95decc

INSERT INTO matches (season_id, home_team_id, away_team_id, home_score, away_score, match_date, status, match_type, venue) VALUES
-- ESFORCO (H) の不足分
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '8a8da5d6-ed98-48f3-8140-783908399fa0', 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48', 5, 0, NULL, 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '8a8da5d6-ed98-48f3-8140-783908399fa0', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 8, 0, '2025-11-03T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '8a8da5d6-ed98-48f3-8140-783908399fa0', '1789a425-ad14-4355-8d71-6793320ef352', 9, 1, '2025-08-02T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '8a8da5d6-ed98-48f3-8140-783908399fa0', 'fd199536-7747-40f0-b058-ccc8b1b62d38', 4, 2, '2025-09-13T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '8a8da5d6-ed98-48f3-8140-783908399fa0', '4be41b3d-2712-4db1-ad38-b5c74425db16', 2, 1, '2025-09-28T14:00:00+09:00', 'finished', 'league', '会場未定'),

-- vinculo (H) の不足分
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48', '1789a425-ad14-4355-8d71-6793320ef352', 6, 1, '2025-09-21T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48', 'fd199536-7747-40f0-b058-ccc8b1b62d38', 7, 1, '2025-06-21T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48', '4be41b3d-2712-4db1-ad38-b5c74425db16', 4, 0, '2025-07-21T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48', '2e0cb14e-5a4f-440d-a341-3c9e6112355d', 4, 0, '2025-07-21T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 5, 0, '2025-07-20T14:00:00+09:00', 'finished', 'league', '会場未定'),

-- 東海岸 (H) の不足分
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', 'f6a92320-dad2-48a9-95e0-046e7004fd8b', '8a8da5d6-ed98-48f3-8140-783908399fa0', 0, 9, '2025-06-01T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', 'f6a92320-dad2-48a9-95e0-046e7004fd8b', 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48', 1, 9, '2025-09-15T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', 'f6a92320-dad2-48a9-95e0-046e7004fd8b', '4be41b3d-2712-4db1-ad38-b5c74425db16', 0, 7, '2025-04-27T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', 'f6a92320-dad2-48a9-95e0-046e7004fd8b', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 0, 13, '2025-09-20T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', 'f6a92320-dad2-48a9-95e0-046e7004fd8b', '45e82eee-9428-4b40-8568-bc4af17c48b1', 0, 4, '2025-09-20T14:00:00+09:00', 'finished', 'league', '会場未定'),

-- PALAVRA (H) の不足分
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48', 1, 6, '2025-04-26T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', '1789a425-ad14-4355-8d71-6793320ef352', 1, 1, '2025-08-30T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', '4be41b3d-2712-4db1-ad38-b5c74425db16', 0, 6, '2025-04-27T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', '45e82eee-9428-4b40-8568-bc4af17c48b1', 0, 0, '2025-06-22T14:00:00+09:00', 'finished', 'league', '会場未定'),

-- SFAT伊勢原 (H) の不足分
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '1789a425-ad14-4355-8d71-6793320ef352', 'f6a92320-dad2-48a9-95e0-046e7004fd8b', 1, 1, '2025-08-02T14:00:00+09:00', 'finished', 'league', '会場未定'),

-- TDFC (H) の不足分
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', 'fd199536-7747-40f0-b058-ccc8b1b62d38', '1789a425-ad14-4355-8d71-6793320ef352', 5, 0, '2025-08-24T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', 'fd199536-7747-40f0-b058-ccc8b1b62d38', '2e0cb14e-5a4f-440d-a341-3c9e6112355d', 4, 0, '2025-05-18T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', 'fd199536-7747-40f0-b058-ccc8b1b62d38', '45e82eee-9428-4b40-8568-bc4af17c48b1', 2, 2, '2025-09-20T14:00:00+09:00', 'finished', 'league', '会場未定'),

-- あざみ野 (H) の不足分
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '4be41b3d-2712-4db1-ad38-b5c74425db16', '1789a425-ad14-4355-8d71-6793320ef352', 2, 1, '2025-09-27T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '4be41b3d-2712-4db1-ad38-b5c74425db16', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 3, 6, '2025-07-06T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '4be41b3d-2712-4db1-ad38-b5c74425db16', '90e69fe7-38b9-4bf7-afaa-e729ef95decc', 4, 3, '2025-05-25T14:00:00+09:00', 'finished', 'league', '会場未定'),

-- あざみ野K (H) の不足分
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '2e0cb14e-5a4f-440d-a341-3c9e6112355d', '8a8da5d6-ed98-48f3-8140-783908399fa0', 0, 8, '2025-04-19T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '2e0cb14e-5a4f-440d-a341-3c9e6112355d', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 1, 1, '2025-07-26T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '2e0cb14e-5a4f-440d-a341-3c9e6112355d', '1789a425-ad14-4355-8d71-6793320ef352', 1, 8, '2025-09-27T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '2e0cb14e-5a4f-440d-a341-3c9e6112355d', '4be41b3d-2712-4db1-ad38-b5c74425db16', 0, 9, '2025-07-06T14:00:00+09:00', 'finished', 'league', '会場未定'),

-- 大豆戸 (H) の不足分
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', '8a8da5d6-ed98-48f3-8140-783908399fa0', 0, 8, '2025-06-28T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', '1789a425-ad14-4355-8d71-6793320ef352', 1, 0, '2025-09-21T14:00:00+09:00', 'finished', 'league', '会場未定'),

-- 横浜ジュニオール (H) の不足分
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '45e82eee-9428-4b40-8568-bc4af17c48b1', '8a8da5d6-ed98-48f3-8140-783908399fa0', 1, 2, '2025-04-19T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '45e82eee-9428-4b40-8568-bc4af17c48b1', 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48', 1, 3, '2025-08-30T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '45e82eee-9428-4b40-8568-bc4af17c48b1', '1789a425-ad14-4355-8d71-6793320ef352', 4, 2, '2025-08-31T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '45e82eee-9428-4b40-8568-bc4af17c48b1', '4be41b3d-2712-4db1-ad38-b5c74425db16', 3, 1, '2025-04-29T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '45e82eee-9428-4b40-8568-bc4af17c48b1', '90e69fe7-38b9-4bf7-afaa-e729ef95decc', 2, 2, '2025-06-21T14:00:00+09:00', 'finished', 'league', '会場未定'),

-- 黒滝 (H) の不足分
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '90e69fe7-38b9-4bf7-afaa-e729ef95decc', '8a8da5d6-ed98-48f3-8140-783908399fa0', 2, 3, '2025-06-01T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '90e69fe7-38b9-4bf7-afaa-e729ef95decc', 'b57cd2ec-38ca-4765-91ce-9f1c920b5d48', 0, 2, '2025-09-21T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '90e69fe7-38b9-4bf7-afaa-e729ef95decc', '7d2c5a9d-3c44-4210-9599-b98dfa8bd626', 7, 1, '2025-07-19T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '90e69fe7-38b9-4bf7-afaa-e729ef95decc', '1789a425-ad14-4355-8d71-6793320ef352', 8, 2, '2025-08-31T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '90e69fe7-38b9-4bf7-afaa-e729ef95decc', 'fd199536-7747-40f0-b058-ccc8b1b62d38', 4, 2, '2025-05-24T14:00:00+09:00', 'finished', 'league', '会場未定'),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '90e69fe7-38b9-4bf7-afaa-e729ef95decc', '7b4c8e6b-2333-4414-8262-a7a05e8193c9', 4, 2, '2025-07-12T14:00:00+09:00', 'finished', 'league', '会場未定');

-- 確認用クエリ
-- SELECT COUNT(*) FROM matches WHERE season_id = 'd0efd9f2-bca5-47dd-a70f-7b60f814a1dc';
