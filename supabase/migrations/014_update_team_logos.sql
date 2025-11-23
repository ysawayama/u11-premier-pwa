-- ============================================
-- チームエンブレム（logo_url）の一括更新
-- ============================================

UPDATE teams SET logo_url = '/images/teams/esforco.png' WHERE name = 'ESFORCO F.C.';
UPDATE teams SET logo_url = '/images/teams/omamedofc.png' WHERE name = '大豆戸FC';
UPDATE teams SET logo_url = '/images/teams/vinculo.png' WHERE name = 'FC.vinculo';
UPDATE teams SET logo_url = '/images/teams/azamino-fc.png' WHERE name = 'あざみ野FC';
UPDATE teams SET logo_url = '/images/teams/yokohama-junior.png' WHERE name = '横浜ジュニオールSC';
UPDATE teams SET logo_url = '/images/teams/kurotaki.png' WHERE name = '黒滝SC';
UPDATE teams SET logo_url = '/images/teams/tdfc.png' WHERE name = 'TDFC';
UPDATE teams SET logo_url = '/images/teams/palavra.png' WHERE name = 'PALAVRA FC';
UPDATE teams SET logo_url = '/images/teams/sfat-isehara.png' WHERE name = 'SFAT ISEHARA SC';
UPDATE teams SET logo_url = '/images/teams/tokaigan.png' WHERE name = 'FC東海岸';
UPDATE teams SET logo_url = '/images/teams/azamino-kickers.png' WHERE name = 'あざみ野キッカーズ';

-- 確認
SELECT name, logo_url FROM teams ORDER BY name;
