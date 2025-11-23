-- ============================================
-- 022: デモ用選手データ作成
-- ============================================
-- 管理者/Webマスターがデモ確認用に使う架空の選手データ

-- ============================================
-- 1. デモ選手を追加（最初のチームに所属）
-- ============================================
DO $$
DECLARE
  v_team_id UUID;
  v_demo_user_id UUID;
  v_player_id UUID;
  v_prefecture_code TEXT;
BEGIN
  -- 最初のアクティブなチームを取得
  SELECT t.id, p.code INTO v_team_id, v_prefecture_code
  FROM public.teams t
  JOIN public.prefectures p ON p.id = t.prefecture_id
  WHERE t.is_active = true
  ORDER BY t.created_at ASC
  LIMIT 1;

  -- デモマスターアカウントのuser_idを取得
  SELECT id INTO v_demo_user_id
  FROM auth.users
  WHERE email = 'demo-master@u11premier.com';

  IF v_team_id IS NULL THEN
    RAISE EXCEPTION 'アクティブなチームが見つかりません';
  END IF;

  -- 既存のデモ選手があれば削除
  DELETE FROM public.players
  WHERE family_name = 'U11' AND given_name = '太郎';

  -- デモ選手データを挿入
  INSERT INTO public.players (
    team_id,
    user_id,
    family_name,
    given_name,
    family_name_kana,
    given_name_kana,
    date_of_birth,
    grade,
    uniform_number,
    position,
    height,
    weight,
    dominant_foot,
    bio,
    is_active
  ) VALUES (
    v_team_id,
    v_demo_user_id,
    'U11',
    '太郎',
    'ゆーいれぶん',
    'たろう',
    '2014-04-15',
    5,
    10,
    'MF',
    138,
    32,
    'right',
    'U11プレミアリーグで活躍するミッドフィールダー。視野の広さとパスセンスが武器。将来の夢はプロサッカー選手！',
    true
  )
  RETURNING id INTO v_player_id;

  -- 選手証番号を生成
  UPDATE public.players
  SET player_card_number = v_prefecture_code || '-' ||
      UPPER(SUBSTRING(REPLACE(v_team_id::text, '-', ''), 1, 4)) || '-' ||
      UPPER(SUBSTRING(REPLACE(v_player_id::text, '-', ''), 1, 6)),
      card_issued_at = NOW(),
      card_expires_at = NOW() + INTERVAL '1 year'
  WHERE id = v_player_id;

  -- デモ用のサッカーノートを作成
  INSERT INTO public.soccer_notes (
    player_id,
    note_date,
    title,
    what_went_well,
    what_to_improve,
    next_goal,
    self_rating,
    is_reviewed
  ) VALUES
  (
    v_player_id,
    CURRENT_DATE - INTERVAL '7 days',
    '練習試合 vs ライバルFC',
    'パスの判断が良くなった。ワンタッチでさばく場面が増えた。',
    'シュートの精度。決定機で外してしまった。',
    'シュート練習を毎日50本以上する。ゴール前での冷静さを身につける。',
    4,
    false
  ),
  (
    v_player_id,
    CURRENT_DATE - INTERVAL '3 days',
    '週末の練習',
    '1対1の守備でボールを奪えるようになってきた。',
    'スタミナが後半落ちてしまう。',
    '毎朝ランニングして体力をつける。',
    3,
    false
  ),
  (
    v_player_id,
    CURRENT_DATE,
    '今日の練習 - ミニゲーム中心',
    'チームメイトとの連携がスムーズだった。声を出してプレーできた。',
    '左足でのパスがまだ苦手。',
    '左足の練習を意識してやる。',
    4,
    false
  );

  -- デモ用のライフログを作成
  INSERT INTO public.soccer_life_logs (
    player_id,
    log_date,
    log_type,
    title,
    content,
    mood,
    duration_minutes,
    is_public
  ) VALUES
  (
    v_player_id,
    CURRENT_DATE - INTERVAL '5 days',
    'practice',
    'チーム練習',
    'パス練習とミニゲームをした。楽しかった！',
    5,
    90,
    true
  ),
  (
    v_player_id,
    CURRENT_DATE - INTERVAL '2 days',
    'training',
    '自主トレ - リフティング',
    '目標100回達成！',
    4,
    30,
    true
  ),
  (
    v_player_id,
    CURRENT_DATE,
    'study',
    'プロの試合を見た',
    'Jリーグの試合を見て、ポジショニングを勉強した。',
    4,
    120,
    false
  );

  RAISE NOTICE 'デモ選手「U11 太郎」を作成しました (player_id: %)', v_player_id;
  RAISE NOTICE 'チーム: %', v_team_id;
  RAISE NOTICE 'ユーザー(demo-master): %', v_demo_user_id;
END $$;

-- ============================================
-- 完了メッセージ
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE 'デモ選手データの作成が完了しました';
  RAISE NOTICE '';
  RAISE NOTICE '【確認方法】';
  RAISE NOTICE '1. demo-master@u11premier.com でログイン';
  RAISE NOTICE '2. チームポータル > マイページ にアクセス';
  RAISE NOTICE '3. 選手情報とサッカーノートが表示されます';
  RAISE NOTICE '================================================';
END $$;
