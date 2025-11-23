-- ============================================
-- 神奈川2部Aリーグへの切り替え
-- 既存データを完全クリアし、新チームを登録
-- ============================================

-- ============================================
-- STEP 1: 既存データの完全削除（外部キー順）
-- ============================================

-- 1-1. 選手統計を削除
DELETE FROM player_stats;

-- 1-2. 順位表を削除
DELETE FROM team_standings;

-- 1-3. 試合イベントを削除
DELETE FROM match_events;

-- 1-4. 試合を削除
DELETE FROM matches;

-- 1-5. 選手を削除
DELETE FROM players;

-- 1-6. チームを削除（神奈川県のみ）
DELETE FROM teams
WHERE prefecture_id IN (SELECT id FROM prefectures WHERE name = '神奈川県');

-- 1-7. シーズンを更新（名前変更）
UPDATE seasons
SET name = '神奈川2部A 2025-2026',
    is_current = true
WHERE name = '2025-2026' OR name LIKE '神奈川%';

-- シーズンがない場合は作成
INSERT INTO seasons (name, start_date, end_date, is_current)
SELECT '神奈川2部A 2025-2026', '2025-04-01', '2026-03-31', true
WHERE NOT EXISTS (SELECT 1 FROM seasons WHERE name LIKE '神奈川2部A%');

-- ============================================
-- STEP 2: 神奈川2部Aリーグ 11チーム登録
-- ============================================

DO $$
DECLARE
  v_kanagawa_id UUID;
BEGIN
  -- 神奈川県IDを取得
  SELECT id INTO v_kanagawa_id FROM prefectures WHERE name = '神奈川県';

  IF v_kanagawa_id IS NULL THEN
    RAISE EXCEPTION '神奈川県が見つかりません。先にprefecturesテーブルにデータを入れてください。';
  END IF;

  -- 11チームを登録
  INSERT INTO teams (prefecture_id, name, short_name, is_active) VALUES
    (v_kanagawa_id, 'ESFORCO F.C.', 'ESFORCO', true),
    (v_kanagawa_id, '大豆戸FC', '大豆戸', true),
    (v_kanagawa_id, 'FC.vinculo', 'vinculo', true),
    (v_kanagawa_id, 'あざみ野FC', 'あざみ野', true),
    (v_kanagawa_id, '横浜ジュニオールSC', '横浜ジュニオール', true),
    (v_kanagawa_id, '黒滝SC', '黒滝', true),
    (v_kanagawa_id, 'TDFC', 'TDFC', true),
    (v_kanagawa_id, 'PALAVRA FC', 'PALAVRA', true),
    (v_kanagawa_id, 'SFAT ISEHARA SC', 'SFAT伊勢原', true),
    (v_kanagawa_id, 'FC東海岸', '東海岸', true),
    (v_kanagawa_id, 'あざみ野キッカーズ', 'あざみ野K', true)
  ON CONFLICT (prefecture_id, name) DO NOTHING;

  RAISE NOTICE '神奈川2部Aリーグ 11チームの登録が完了しました';
END $$;

-- ============================================
-- STEP 3: 順位表の初期化
-- ============================================

DO $$
DECLARE
  v_season_id UUID;
BEGIN
  -- シーズンIDを取得
  SELECT id INTO v_season_id FROM seasons WHERE name LIKE '神奈川2部A%' LIMIT 1;

  IF v_season_id IS NULL THEN
    RAISE EXCEPTION 'シーズンが見つかりません';
  END IF;

  -- 各チームの順位表を初期化
  INSERT INTO team_standings (season_id, team_id, matches_played, wins, draws, losses, goals_for, goals_against, goal_difference, points, rank)
  SELECT
    v_season_id,
    t.id,
    0, 0, 0, 0, 0, 0, 0, 0, 0
  FROM teams t
  JOIN prefectures p ON t.prefecture_id = p.id
  WHERE p.name = '神奈川県'
  ON CONFLICT (season_id, team_id) DO NOTHING;

  RAISE NOTICE '順位表の初期化が完了しました';
END $$;

-- ============================================
-- 確認クエリ
-- ============================================

-- 登録されたチーム一覧
SELECT t.name, t.short_name
FROM teams t
JOIN prefectures p ON t.prefecture_id = p.id
WHERE p.name = '神奈川県'
ORDER BY t.name;
