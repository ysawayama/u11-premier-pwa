-- ============================================
-- U-11プレミアリーグ シードデータ
-- 実際のプレミアリーグU-11の地域構造に基づく
-- ============================================

-- ============================================
-- 1. 地域データ（9地域）
-- ============================================
INSERT INTO public.regions (name, name_en, display_order) VALUES
  ('北海道', 'hokkaido', 1),
  ('東北', 'tohoku', 2),
  ('関東', 'kanto', 3),
  ('北陸・信越', 'hokuriku-shinetsu', 4),
  ('東海', 'tokai', 5),
  ('関西', 'kansai', 6),
  ('中国', 'chugoku', 7),
  ('四国', 'shikoku', 8),
  ('九州・沖縄', 'kyushu-okinawa', 9)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. 都道府県データ（38都道府県）
-- ============================================

-- 北海道
INSERT INTO public.prefectures (region_id, name, name_en, code, display_order)
SELECT r.id, '北海道', 'hokkaido', '01', 1
FROM public.regions r WHERE r.name_en = 'hokkaido'
ON CONFLICT (name) DO NOTHING;

-- 東北（6県）
INSERT INTO public.prefectures (region_id, name, name_en, code, display_order)
SELECT r.id, '青森県', 'aomori', '02', 2 FROM public.regions r WHERE r.name_en = 'tohoku'
UNION ALL
SELECT r.id, '岩手県', 'iwate', '03', 3 FROM public.regions r WHERE r.name_en = 'tohoku'
UNION ALL
SELECT r.id, '宮城県', 'miyagi', '04', 4 FROM public.regions r WHERE r.name_en = 'tohoku'
UNION ALL
SELECT r.id, '秋田県', 'akita', '05', 5 FROM public.regions r WHERE r.name_en = 'tohoku'
UNION ALL
SELECT r.id, '山形県', 'yamagata', '06', 6 FROM public.regions r WHERE r.name_en = 'tohoku'
UNION ALL
SELECT r.id, '福島県', 'fukushima', '07', 7 FROM public.regions r WHERE r.name_en = 'tohoku'
ON CONFLICT (name) DO NOTHING;

-- 関東（8都県）※山梨県を含む
INSERT INTO public.prefectures (region_id, name, name_en, code, display_order)
SELECT r.id, '茨城県', 'ibaraki', '08', 8 FROM public.regions r WHERE r.name_en = 'kanto'
UNION ALL
SELECT r.id, '栃木県', 'tochigi', '09', 9 FROM public.regions r WHERE r.name_en = 'kanto'
UNION ALL
SELECT r.id, '群馬県', 'gunma', '10', 10 FROM public.regions r WHERE r.name_en = 'kanto'
UNION ALL
SELECT r.id, '埼玉県', 'saitama', '11', 11 FROM public.regions r WHERE r.name_en = 'kanto'
UNION ALL
SELECT r.id, '千葉県', 'chiba', '12', 12 FROM public.regions r WHERE r.name_en = 'kanto'
UNION ALL
SELECT r.id, '東京都', 'tokyo', '13', 13 FROM public.regions r WHERE r.name_en = 'kanto'
UNION ALL
SELECT r.id, '神奈川県', 'kanagawa', '14', 14 FROM public.regions r WHERE r.name_en = 'kanto'
UNION ALL
SELECT r.id, '山梨県', 'yamanashi', '19', 15 FROM public.regions r WHERE r.name_en = 'kanto'
ON CONFLICT (name) DO NOTHING;

-- 北陸・信越（5県）
INSERT INTO public.prefectures (region_id, name, name_en, code, display_order)
SELECT r.id, '新潟県', 'niigata', '15', 16 FROM public.regions r WHERE r.name_en = 'hokuriku-shinetsu'
UNION ALL
SELECT r.id, '富山県', 'toyama', '16', 17 FROM public.regions r WHERE r.name_en = 'hokuriku-shinetsu'
UNION ALL
SELECT r.id, '石川県', 'ishikawa', '17', 18 FROM public.regions r WHERE r.name_en = 'hokuriku-shinetsu'
UNION ALL
SELECT r.id, '福井県', 'fukui', '18', 19 FROM public.regions r WHERE r.name_en = 'hokuriku-shinetsu'
UNION ALL
SELECT r.id, '長野県', 'nagano', '20', 20 FROM public.regions r WHERE r.name_en = 'hokuriku-shinetsu'
ON CONFLICT (name) DO NOTHING;

-- 東海（2県）
INSERT INTO public.prefectures (region_id, name, name_en, code, display_order)
SELECT r.id, '愛知県', 'aichi', '23', 21 FROM public.regions r WHERE r.name_en = 'tokai'
UNION ALL
SELECT r.id, '三重県', 'mie', '24', 22 FROM public.regions r WHERE r.name_en = 'tokai'
ON CONFLICT (name) DO NOTHING;

-- 関西（4府県）
INSERT INTO public.prefectures (region_id, name, name_en, code, display_order)
SELECT r.id, '京都府', 'kyoto', '26', 23 FROM public.regions r WHERE r.name_en = 'kansai'
UNION ALL
SELECT r.id, '大阪府', 'osaka', '27', 24 FROM public.regions r WHERE r.name_en = 'kansai'
UNION ALL
SELECT r.id, '兵庫県', 'hyogo', '28', 25 FROM public.regions r WHERE r.name_en = 'kansai'
UNION ALL
SELECT r.id, '奈良県', 'nara', '29', 26 FROM public.regions r WHERE r.name_en = 'kansai'
ON CONFLICT (name) DO NOTHING;

-- 中国（4県）
INSERT INTO public.prefectures (region_id, name, name_en, code, display_order)
SELECT r.id, '鳥取県', 'tottori', '31', 27 FROM public.regions r WHERE r.name_en = 'chugoku'
UNION ALL
SELECT r.id, '島根県', 'shimane', '32', 28 FROM public.regions r WHERE r.name_en = 'chugoku'
UNION ALL
SELECT r.id, '岡山県', 'okayama', '33', 29 FROM public.regions r WHERE r.name_en = 'chugoku'
UNION ALL
SELECT r.id, '山口県', 'yamaguchi', '35', 30 FROM public.regions r WHERE r.name_en = 'chugoku'
ON CONFLICT (name) DO NOTHING;

-- 四国（1県）
INSERT INTO public.prefectures (region_id, name, name_en, code, display_order)
SELECT r.id, '愛媛県', 'ehime', '38', 31
FROM public.regions r WHERE r.name_en = 'shikoku'
ON CONFLICT (name) DO NOTHING;

-- 九州・沖縄（8県）
INSERT INTO public.prefectures (region_id, name, name_en, code, display_order)
SELECT r.id, '福岡県', 'fukuoka', '40', 32 FROM public.regions r WHERE r.name_en = 'kyushu-okinawa'
UNION ALL
SELECT r.id, '佐賀県', 'saga', '41', 33 FROM public.regions r WHERE r.name_en = 'kyushu-okinawa'
UNION ALL
SELECT r.id, '長崎県', 'nagasaki', '42', 34 FROM public.regions r WHERE r.name_en = 'kyushu-okinawa'
UNION ALL
SELECT r.id, '熊本県', 'kumamoto', '43', 35 FROM public.regions r WHERE r.name_en = 'kyushu-okinawa'
UNION ALL
SELECT r.id, '大分県', 'oita', '44', 36 FROM public.regions r WHERE r.name_en = 'kyushu-okinawa'
UNION ALL
SELECT r.id, '宮崎県', 'miyazaki', '45', 37 FROM public.regions r WHERE r.name_en = 'kyushu-okinawa'
UNION ALL
SELECT r.id, '鹿児島県', 'kagoshima', '46', 38 FROM public.regions r WHERE r.name_en = 'kyushu-okinawa'
UNION ALL
SELECT r.id, '沖縄県', 'okinawa', '47', 39 FROM public.regions r WHERE r.name_en = 'kyushu-okinawa'
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 3. サンプルチームデータ
-- ============================================

-- 東京都のサンプルチーム
INSERT INTO public.teams (prefecture_id, name, name_kana, short_name, founded_year, is_active)
SELECT p.id, 'バディーSC', 'バディーエスシー', 'バディー', 1989, true
FROM public.prefectures p WHERE p.name_en = 'tokyo'
ON CONFLICT (prefecture_id, name) DO NOTHING;

INSERT INTO public.teams (prefecture_id, name, name_kana, short_name, founded_year, is_active)
SELECT p.id, 'FC東京U-12', 'エフシートウキョウユーイチニ', 'FC東京', 1999, true
FROM public.prefectures p WHERE p.name_en = 'tokyo'
ON CONFLICT (prefecture_id, name) DO NOTHING;

-- 神奈川県のサンプルチーム
INSERT INTO public.teams (prefecture_id, name, name_kana, short_name, founded_year, is_active)
SELECT p.id, '横浜F・マリノスプライマリー', 'ヨコハマエフマリノスプライマリー', 'F・マリノス', 1972, true
FROM public.prefectures p WHERE p.name_en = 'kanagawa'
ON CONFLICT (prefecture_id, name) DO NOTHING;

INSERT INTO public.teams (prefecture_id, name, name_kana, short_name, founded_year, is_active)
SELECT p.id, '川崎フロンターレU-12', 'カワサキフロンターレユーイチニ', 'フロンターレ', 1997, true
FROM public.prefectures p WHERE p.name_en = 'kanagawa'
ON CONFLICT (prefecture_id, name) DO NOTHING;

-- 大阪府のサンプルチーム
INSERT INTO public.teams (prefecture_id, name, name_kana, short_name, founded_year, is_active)
SELECT p.id, 'セレッソ大阪U-12', 'セレッソオオサカユーイチニ', 'セレッソ', 1957, true
FROM public.prefectures p WHERE p.name_en = 'osaka'
ON CONFLICT (prefecture_id, name) DO NOTHING;

INSERT INTO public.teams (prefecture_id, name, name_kana, short_name, founded_year, is_active)
SELECT p.id, 'ガンバ大阪ジュニア', 'ガンバオオサカジュニア', 'ガンバ', 1980, true
FROM public.prefectures p WHERE p.name_en = 'osaka'
ON CONFLICT (prefecture_id, name) DO NOTHING;

-- ============================================
-- 4. サンプルシーズンデータ
-- ============================================
INSERT INTO public.seasons (name, start_date, end_date, is_current, championship_date, championship_venue) VALUES
  ('2024-2025', '2024-04-01', '2025-03-31', false, '2024-07-28', '未定'),
  ('2025-2026', '2025-04-01', '2026-03-31', true, '2025-07-27', '未定')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 5. サンプル選手データ（テスト用）
-- ============================================

-- バディーSCの選手サンプル
INSERT INTO public.players (
  team_id,
  family_name,
  given_name,
  family_name_kana,
  given_name_kana,
  date_of_birth,
  grade,
  uniform_number,
  position,
  is_active
)
SELECT
  t.id,
  '山田',
  '太郎',
  'ヤマダ',
  'タロウ',
  '2014-05-15',
  5,
  10,
  'FW',
  true
FROM public.teams t
WHERE t.name = 'バディーSC'
ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO NOTHING;

INSERT INTO public.players (
  team_id,
  family_name,
  given_name,
  family_name_kana,
  given_name_kana,
  date_of_birth,
  grade,
  uniform_number,
  position,
  is_active
)
SELECT
  t.id,
  '佐藤',
  '次郎',
  'サトウ',
  'ジロウ',
  '2014-08-20',
  5,
  7,
  'MF',
  true
FROM public.teams t
WHERE t.name = 'バディーSC'
ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO NOTHING;

-- FC東京U-12の選手サンプル
INSERT INTO public.players (
  team_id,
  family_name,
  given_name,
  family_name_kana,
  given_name_kana,
  date_of_birth,
  grade,
  uniform_number,
  position,
  is_active
)
SELECT
  t.id,
  '田中',
  '健太',
  'タナカ',
  'ケンタ',
  '2014-03-10',
  5,
  9,
  'FW',
  true
FROM public.teams t
WHERE t.name = 'FC東京U-12'
ON CONFLICT (team_id, family_name, given_name, date_of_birth) DO NOTHING;
