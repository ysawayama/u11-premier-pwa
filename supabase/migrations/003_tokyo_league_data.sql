-- 東京プレミアリーグ 2025-2026 データ投入
-- このファイルをSupabase SQL Editorで実行してください

-- 変数準備（東京都IDとシーズンIDを取得）
DO $$
DECLARE
  v_tokyo_id uuid;
  v_season_id uuid;
  v_team_id uuid;
  v_home_team_id uuid;
  v_away_team_id uuid;
BEGIN
  -- 東京都IDを取得
  SELECT id INTO v_tokyo_id FROM prefectures WHERE name = '東京都';

  -- 2025-2026シーズンIDを取得
  SELECT id INTO v_season_id FROM seasons WHERE name = '2025-2026';

  -- 1部リーグチーム登録
  INSERT INTO teams (id, prefecture_id, name, name_kana, short_name, is_active)
  VALUES
    (gen_random_uuid(), v_tokyo_id, 'ヴィトーリア目黒FC', 'ゔぃとーりあめぐろえふしー', 'ヴィトーリア目黒', true),
    (gen_random_uuid(), v_tokyo_id, '和魂SC', 'わこんえすしー', '和魂', true),
    (gen_random_uuid(), v_tokyo_id, 'FC.GLAUNA', 'えふしーぐらうな', 'GLAUNA', true),
    (gen_random_uuid(), v_tokyo_id, 'FC85 All Stars', 'えふしーはちごーおーるすたーず', 'FC85', true),
    (gen_random_uuid(), v_tokyo_id, 'ヴィルトゥスSC', 'ゔぃるとぅすえすしー', 'ヴィルトゥス', true),
    (gen_random_uuid(), v_tokyo_id, 'リバティーFC', 'りばてぃーえふしー', 'リバティー', true),
    (gen_random_uuid(), v_tokyo_id, 'FCトリプレッタ渋谷', 'えふしーとりぷれったしぶや', 'トリプレッタ', true),
    (gen_random_uuid(), v_tokyo_id, '大森FC', 'おおもりえふしー', '大森', true)
  ON CONFLICT (prefecture_id, name) DO NOTHING;

  -- 2部リーグチーム登録
  INSERT INTO teams (id, prefecture_id, name, name_kana, short_name, is_active)
  VALUES
    (gen_random_uuid(), v_tokyo_id, 'GROW FC', 'ぐろうえふしー', 'GROW', true),
    (gen_random_uuid(), v_tokyo_id, 'MITA SC', 'みたえすしー', 'MITA', true),
    (gen_random_uuid(), v_tokyo_id, 'FCキントバリオ', 'えふしーきんとばりお', 'キントバリオ', true),
    (gen_random_uuid(), v_tokyo_id, 'FRIENDLY SC', 'ふれんどりーえすしー', 'FRIENDLY', true),
    (gen_random_uuid(), v_tokyo_id, 'フウガドールすみだエッグス', 'ふうがどーるすみだえっぐす', 'すみだエッグス', true),
    (gen_random_uuid(), v_tokyo_id, 'BOA SC', 'ぼあえすしー', 'BOA', true),
    (gen_random_uuid(), v_tokyo_id, '五本木FC', 'ごほんぎえふしー', '五本木', true),
    (gen_random_uuid(), v_tokyo_id, '瑞穂三小SC', 'みずほさんしょうえすしー', '瑞穂三小', true)
  ON CONFLICT (prefecture_id, name) DO NOTHING;

  -- 1部リーグ順位表データ
  INSERT INTO team_standings (season_id, team_id, rank, matches_played, wins, draws, losses, goals_for, goals_against, goal_difference, points)
  SELECT
    v_season_id,
    t.id,
    data.rank,
    data.matches_played,
    data.wins,
    data.draws,
    data.losses,
    data.goals_for,
    data.goals_against,
    data.goal_difference,
    data.points
  FROM (VALUES
    ('ヴィトーリア目黒FC', 1, 6, 4, 1, 1, 25, 7, 18, 13),
    ('和魂SC', 2, 5, 3, 1, 1, 14, 9, 5, 10),
    ('FC.GLAUNA', 3, 8, 3, 0, 5, 14, 22, -8, 9),
    ('FC85 All Stars', 4, 2, 2, 0, 0, 10, 1, 9, 6),
    ('ヴィルトゥスSC', 5, 6, 1, 2, 3, 6, 11, -5, 5),
    ('リバティーFC', 6, 3, 1, 1, 1, 7, 5, 2, 4),
    ('FCトリプレッタ渋谷', 7, 3, 1, 1, 1, 6, 7, -1, 4),
    ('大森FC', 8, 3, 0, 0, 3, 0, 20, -20, 0)
  ) AS data(team_name, rank, matches_played, wins, draws, losses, goals_for, goals_against, goal_difference, points)
  JOIN teams t ON t.name = data.team_name AND t.prefecture_id = v_tokyo_id
  ON CONFLICT (season_id, team_id) DO UPDATE SET
    rank = EXCLUDED.rank,
    matches_played = EXCLUDED.matches_played,
    wins = EXCLUDED.wins,
    draws = EXCLUDED.draws,
    losses = EXCLUDED.losses,
    goals_for = EXCLUDED.goals_for,
    goals_against = EXCLUDED.goals_against,
    goal_difference = EXCLUDED.goal_difference,
    points = EXCLUDED.points;

  -- 2部リーグ順位表データ（ランクは9位から開始して1部と区別）
  INSERT INTO team_standings (season_id, team_id, rank, matches_played, wins, draws, losses, goals_for, goals_against, goal_difference, points)
  SELECT
    v_season_id,
    t.id,
    data.rank + 8, -- 1部が8チームなので、2部は9位から開始
    data.matches_played,
    data.wins,
    data.draws,
    data.losses,
    data.goals_for,
    data.goals_against,
    data.goal_difference,
    data.points
  FROM (VALUES
    ('GROW FC', 1, 9, 7, 2, 0, 27, 7, 20, 23),
    ('MITA SC', 2, 8, 6, 1, 1, 27, 5, 22, 19),
    ('FCキントバリオ', 3, 7, 4, 1, 2, 18, 9, 9, 13),
    ('FRIENDLY SC', 4, 6, 4, 0, 2, 20, 11, 9, 12),
    ('フウガドールすみだエッグス', 5, 7, 1, 2, 4, 11, 24, -13, 5),
    ('BOA SC', 6, 6, 1, 1, 4, 6, 14, -8, 4),
    ('五本木FC', 7, 5, 0, 2, 3, 3, 9, -6, 2),
    ('瑞穂三小SC', 8, 8, 0, 1, 7, 3, 36, -33, 1)
  ) AS data(team_name, rank, matches_played, wins, draws, losses, goals_for, goals_against, goal_difference, points)
  JOIN teams t ON t.name = data.team_name AND t.prefecture_id = v_tokyo_id
  ON CONFLICT (season_id, team_id) DO UPDATE SET
    rank = EXCLUDED.rank,
    matches_played = EXCLUDED.matches_played,
    wins = EXCLUDED.wins,
    draws = EXCLUDED.draws,
    losses = EXCLUDED.losses,
    goals_for = EXCLUDED.goals_for,
    goals_against = EXCLUDED.goals_against,
    goal_difference = EXCLUDED.goal_difference,
    points = EXCLUDED.points;

  -- 試合結果登録（1部リーグの主要な試合）
  -- ヴィトーリア目黒FC vs 和魂SC (6-0)
  SELECT id INTO v_home_team_id FROM teams WHERE name = 'ヴィトーリア目黒FC' AND prefecture_id = v_tokyo_id;
  SELECT id INTO v_away_team_id FROM teams WHERE name = '和魂SC' AND prefecture_id = v_tokyo_id;
  INSERT INTO matches (season_id, home_team_id, away_team_id, match_date, match_type, status, home_score, away_score, venue)
  VALUES (v_season_id, v_home_team_id, v_away_team_id, '2025-11-01 10:00:00'::timestamp, 'league', 'finished', 6, 0, '東京都内グラウンド')
  ON CONFLICT DO NOTHING;

  -- ヴィトーリア目黒FC vs 大森FC (10-0)
  SELECT id INTO v_away_team_id FROM teams WHERE name = '大森FC' AND prefecture_id = v_tokyo_id;
  INSERT INTO matches (season_id, home_team_id, away_team_id, match_date, match_type, status, home_score, away_score, venue)
  VALUES (v_season_id, v_home_team_id, v_away_team_id, '2025-10-15 10:00:00'::timestamp, 'league', 'finished', 10, 0, '東京都内グラウンド')
  ON CONFLICT DO NOTHING;

  -- FC85 All Stars vs リバティーFC (5-0) ※推定
  SELECT id INTO v_home_team_id FROM teams WHERE name = 'FC85 All Stars' AND prefecture_id = v_tokyo_id;
  SELECT id INTO v_away_team_id FROM teams WHERE name = 'リバティーFC' AND prefecture_id = v_tokyo_id;
  INSERT INTO matches (season_id, home_team_id, away_team_id, match_date, match_type, status, home_score, away_score, venue)
  VALUES (v_season_id, v_home_team_id, v_away_team_id, '2025-10-20 10:00:00'::timestamp, 'league', 'finished', 5, 0, '東京都内グラウンド')
  ON CONFLICT DO NOTHING;

  -- FC85 All Stars vs ヴィルトゥスSC (5-1) ※推定
  SELECT id INTO v_away_team_id FROM teams WHERE name = 'ヴィルトゥスSC' AND prefecture_id = v_tokyo_id;
  INSERT INTO matches (season_id, home_team_id, away_team_id, match_date, match_type, status, home_score, away_score, venue)
  VALUES (v_season_id, v_home_team_id, v_away_team_id, '2025-10-25 10:00:00'::timestamp, 'league', 'finished', 5, 1, '東京都内グラウンド')
  ON CONFLICT DO NOTHING;

  -- 2部リーグの試合
  -- GROW FC vs MITA SC (2-1)
  SELECT id INTO v_home_team_id FROM teams WHERE name = 'GROW FC' AND prefecture_id = v_tokyo_id;
  SELECT id INTO v_away_team_id FROM teams WHERE name = 'MITA SC' AND prefecture_id = v_tokyo_id;
  INSERT INTO matches (season_id, home_team_id, away_team_id, match_date, match_type, status, home_score, away_score, venue)
  VALUES (v_season_id, v_home_team_id, v_away_team_id, '2025-11-05 10:00:00'::timestamp, 'league', 'finished', 2, 1, '東京都内グラウンド')
  ON CONFLICT DO NOTHING;

  -- MITA SC vs 瑞穂三小SC (9-0)
  SELECT id INTO v_home_team_id FROM teams WHERE name = 'MITA SC' AND prefecture_id = v_tokyo_id;
  SELECT id INTO v_away_team_id FROM teams WHERE name = '瑞穂三小SC' AND prefecture_id = v_tokyo_id;
  INSERT INTO matches (season_id, home_team_id, away_team_id, match_date, match_type, status, home_score, away_score, venue)
  VALUES (v_season_id, v_home_team_id, v_away_team_id, '2025-10-18 10:00:00'::timestamp, 'league', 'finished', 9, 0, '東京都内グラウンド')
  ON CONFLICT DO NOTHING;

  -- FRIENDLY SC vs BOA SC (4-2) ※推定
  SELECT id INTO v_home_team_id FROM teams WHERE name = 'FRIENDLY SC' AND prefecture_id = v_tokyo_id;
  SELECT id INTO v_away_team_id FROM teams WHERE name = 'BOA SC' AND prefecture_id = v_tokyo_id;
  INSERT INTO matches (season_id, home_team_id, away_team_id, match_date, match_type, status, home_score, away_score, venue)
  VALUES (v_season_id, v_home_team_id, v_away_team_id, '2025-10-22 10:00:00'::timestamp, 'league', 'finished', 4, 2, '東京都内グラウンド')
  ON CONFLICT DO NOTHING;

  -- FCキントバリオ vs 五本木FC (3-1) ※推定
  SELECT id INTO v_home_team_id FROM teams WHERE name = 'FCキントバリオ' AND prefecture_id = v_tokyo_id;
  SELECT id INTO v_away_team_id FROM teams WHERE name = '五本木FC' AND prefecture_id = v_tokyo_id;
  INSERT INTO matches (season_id, home_team_id, away_team_id, match_date, match_type, status, home_score, away_score, venue)
  VALUES (v_season_id, v_home_team_id, v_away_team_id, '2025-10-28 10:00:00'::timestamp, 'league', 'finished', 3, 1, '東京都内グラウンド')
  ON CONFLICT DO NOTHING;

  -- 進行中の試合（デモ用）
  SELECT id INTO v_home_team_id FROM teams WHERE name = 'ヴィトーリア目黒FC' AND prefecture_id = v_tokyo_id;
  SELECT id INTO v_away_team_id FROM teams WHERE name = 'FC.GLAUNA' AND prefecture_id = v_tokyo_id;
  INSERT INTO matches (season_id, home_team_id, away_team_id, match_date, match_type, status, home_score, away_score, venue)
  VALUES (v_season_id, v_home_team_id, v_away_team_id, NOW(), 'league', 'in_progress', 2, 1, '東京都内グラウンド')
  ON CONFLICT DO NOTHING;

  -- 今後の予定試合
  SELECT id INTO v_home_team_id FROM teams WHERE name = 'GROW FC' AND prefecture_id = v_tokyo_id;
  SELECT id INTO v_away_team_id FROM teams WHERE name = 'FCキントバリオ' AND prefecture_id = v_tokyo_id;
  INSERT INTO matches (season_id, home_team_id, away_team_id, match_date, match_type, status, venue)
  VALUES (v_season_id, v_home_team_id, v_away_team_id, '2025-12-14 10:00:00'::timestamp, 'league', 'scheduled', '東京都内グラウンド')
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_home_team_id FROM teams WHERE name = '和魂SC' AND prefecture_id = v_tokyo_id;
  SELECT id INTO v_away_team_id FROM teams WHERE name = 'FCトリプレッタ渋谷' AND prefecture_id = v_tokyo_id;
  INSERT INTO matches (season_id, home_team_id, away_team_id, match_date, match_type, status, venue)
  VALUES (v_season_id, v_home_team_id, v_away_team_id, '2025-12-14 13:00:00'::timestamp, 'league', 'scheduled', '東京都内グラウンド')
  ON CONFLICT DO NOTHING;

  SELECT id INTO v_home_team_id FROM teams WHERE name = 'MITA SC' AND prefecture_id = v_tokyo_id;
  SELECT id INTO v_away_team_id FROM teams WHERE name = 'FRIENDLY SC' AND prefecture_id = v_tokyo_id;
  INSERT INTO matches (season_id, home_team_id, away_team_id, match_date, match_type, status, venue)
  VALUES (v_season_id, v_home_team_id, v_away_team_id, '2025-12-21 10:00:00'::timestamp, 'league', 'scheduled', '東京都内グラウンド')
  ON CONFLICT DO NOTHING;

END $$;

-- 完了メッセージ
SELECT '東京プレミアリーグ 2025-2026 データ投入完了！' AS result;
SELECT 'チーム数: ' || COUNT(*) || '件' AS teams_count FROM teams WHERE prefecture_id = (SELECT id FROM prefectures WHERE name = '東京都');
SELECT '順位表データ: ' || COUNT(*) || '件' AS standings_count FROM team_standings WHERE season_id = (SELECT id FROM seasons WHERE name = '2025-2026');
SELECT '試合データ: ' || COUNT(*) || '件' AS matches_count FROM matches WHERE season_id = (SELECT id FROM seasons WHERE name = '2025-2026');
