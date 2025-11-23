-- 神奈川プレミアリーグ 2025-2026 データ投入
-- このファイルをSupabase SQL Editorで実行してください

-- 変数準備（神奈川県IDとシーズンIDを取得）
DO $$
DECLARE
  v_kanagawa_id uuid;
  v_season_id uuid;
BEGIN
  -- 神奈川県IDを取得（存在しない場合は作成）
  SELECT id INTO v_kanagawa_id FROM prefectures WHERE name = '神奈川県';
  IF v_kanagawa_id IS NULL THEN
    INSERT INTO prefectures (id, name, name_kana)
    VALUES (gen_random_uuid(), '神奈川県', 'かながわけん')
    RETURNING id INTO v_kanagawa_id;
  END IF;

  -- 2025-2026シーズンIDを取得
  SELECT id INTO v_season_id FROM seasons WHERE name = '2025-2026';

  -- 1部リーグチーム登録（12チーム）
  INSERT INTO teams (id, prefecture_id, name, name_kana, short_name, is_active)
  VALUES
    (gen_random_uuid(), v_kanagawa_id, 'バディーSC', 'ばでぃーえすしー', 'バディー', true),
    (gen_random_uuid(), v_kanagawa_id, 'FC PORTA', 'えふしーぽるた', 'PORTA', true),
    (gen_random_uuid(), v_kanagawa_id, '川崎フロンターレ', 'かわさきふろんたーれ', 'F東京', true),
    (gen_random_uuid(), v_kanagawa_id, 'JFC FUTURO', 'じぇいえふしーふとぅーろ', 'FUTURO', true),
    (gen_random_uuid(), v_kanagawa_id, 'FCパーシモン', 'えふしーぱーしもん', 'パーシモン', true),
    (gen_random_uuid(), v_kanagawa_id, '横浜Ｆ･マリノスプライマリー', 'よこはまえふまりのすぷらいまりー', 'YFM', true),
    (gen_random_uuid(), v_kanagawa_id, '東住吉SC', 'ひがしすみよしえすしー', '東住吉', true),
    (gen_random_uuid(), v_kanagawa_id, '横浜Ｆ･マリノスプライマリー追浜', 'よこはまえふまりのすぷらいまりーおっぱま', 'YFM追浜', true),
    (gen_random_uuid(), v_kanagawa_id, 'FC Testigo', 'えふしーてすてぃご', 'Testigo', true),
    (gen_random_uuid(), v_kanagawa_id, '中野島FC', 'なかのしまえふしー', '中野島', true),
    (gen_random_uuid(), v_kanagawa_id, 'FCゴールデン', 'えふしーごーるでん', 'ゴールデン', true),
    (gen_random_uuid(), v_kanagawa_id, 'Carpesol湘南', 'かるぺそるしょうなん', 'Carpesol', true)
  ON CONFLICT (prefecture_id, name) DO NOTHING;

  -- 1部リーグ順位表データ（2025年11月20日時点）
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
    ('バディーSC', 1, 13, 11, 2, 0, 54, 10, 44, 35),
    ('FC PORTA', 2, 14, 10, 2, 2, 43, 17, 26, 32),
    ('川崎フロンターレ', 3, 13, 10, 0, 3, 67, 19, 48, 30),
    ('JFC FUTURO', 4, 15, 9, 2, 4, 34, 19, 15, 29),
    ('FCパーシモン', 5, 13, 9, 1, 3, 44, 18, 26, 28),
    ('横浜Ｆ･マリノスプライマリー', 6, 14, 5, 3, 6, 35, 37, -2, 18),
    ('東住吉SC', 7, 14, 5, 2, 7, 37, 28, 9, 17),
    ('横浜Ｆ･マリノスプライマリー追浜', 8, 14, 5, 1, 8, 22, 44, -22, 16),
    ('FC Testigo', 9, 13, 4, 2, 7, 18, 38, -20, 14),
    ('中野島FC', 10, 13, 3, 2, 8, 18, 28, -10, 11),
    ('FCゴールデン', 11, 14, 2, 1, 11, 9, 39, -30, 7),
    ('Carpesol湘南', 12, 14, 0, 0, 14, 10, 94, -84, 0)
  ) AS data(team_name, rank, matches_played, wins, draws, losses, goals_for, goals_against, goal_difference, points)
  JOIN teams t ON t.name = data.team_name AND t.prefecture_id = v_kanagawa_id
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

  RAISE NOTICE '神奈川県プレミアリーグ1部データの投入が完了しました';
END $$;
