-- ============================================
-- 019: Webマスター権限設定 & デモアカウント作成
-- ============================================

-- ============================================
-- 1. sawayama@2501.world にWebマスター権限を付与
-- ============================================
DO $$
DECLARE
  v_user_id UUID;
  v_role_id UUID;
BEGIN
  -- Webマスターロールのidを取得
  SELECT id INTO v_role_id FROM public.roles WHERE name = 'webmaster';

  -- sawayama@2501.worldのuser_idを取得
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'sawayama@2501.world';

  IF v_user_id IS NOT NULL AND v_role_id IS NOT NULL THEN
    -- user_rolesに追加（既に存在する場合は更新）
    INSERT INTO public.user_roles (user_id, role_id, is_active)
    VALUES (v_user_id, v_role_id, true)
    ON CONFLICT (user_id, role_id) DO UPDATE SET is_active = true;

    RAISE NOTICE 'sawayama@2501.world にWebマスター権限を付与しました';
  ELSE
    RAISE NOTICE 'ユーザーまたはロールが見つかりません。手動で設定してください。';
  END IF;
END $$;

-- ============================================
-- 2. 全チームにWebマスターとして参加
-- ============================================
DO $$
DECLARE
  v_user_id UUID;
  v_team RECORD;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'sawayama@2501.world';

  IF v_user_id IS NOT NULL THEN
    FOR v_team IN SELECT id FROM public.teams LOOP
      INSERT INTO public.team_members (team_id, user_id, role, is_active)
      VALUES (v_team.id, v_user_id, 'manager', true)
      ON CONFLICT (team_id, user_id) DO UPDATE SET role = 'manager', is_active = true;
    END LOOP;
    RAISE NOTICE 'sawayama@2501.world を全チームのマネージャーとして追加しました';
  END IF;
END $$;

-- ============================================
-- 完了メッセージ
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Webマスター権限の設定が完了しました';
  RAISE NOTICE '';
  RAISE NOTICE '【デモ用マスターアカウント作成手順】';
  RAISE NOTICE '';
  RAISE NOTICE '1. Supabase Dashboard > Authentication > Users > Add user';
  RAISE NOTICE '   Email: demo-master@u11premier.com';
  RAISE NOTICE '   Password: Demo2024!Premier';
  RAISE NOTICE '';
  RAISE NOTICE '2. ユーザー作成後、下記の「デモアカウント権限付与SQL」を実行';
  RAISE NOTICE '================================================';
END $$;


-- ============================================
-- 【デモアカウント権限付与SQL】
-- Supabase Dashboardでユーザー作成後にSQL Editorで実行
-- ============================================

-- デモマスターアカウントに権限を付与
DO $$
DECLARE
  v_user_id UUID;
  v_webmaster_role_id UUID;
  v_admin_role_id UUID;
  v_team RECORD;
BEGIN
  -- デモアカウントのuser_idを取得
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'demo-master@u11premier.com';

  -- ロールIDを取得
  SELECT id INTO v_webmaster_role_id FROM public.roles WHERE name = 'webmaster';
  SELECT id INTO v_admin_role_id FROM public.roles WHERE name = 'admin';

  IF v_user_id IS NOT NULL THEN
    -- Webマスター権限を付与
    INSERT INTO public.user_roles (user_id, role_id, is_active)
    VALUES (v_user_id, v_webmaster_role_id, true)
    ON CONFLICT (user_id, role_id) DO UPDATE SET is_active = true;

    -- Admin権限も付与
    INSERT INTO public.user_roles (user_id, role_id, is_active)
    VALUES (v_user_id, v_admin_role_id, true)
    ON CONFLICT (user_id, role_id) DO UPDATE SET is_active = true;

    -- 全チームにマネージャーとして参加
    FOR v_team IN SELECT id FROM public.teams LOOP
      INSERT INTO public.team_members (team_id, user_id, role, is_active)
      VALUES (v_team.id, v_user_id, 'manager', true)
      ON CONFLICT (team_id, user_id) DO UPDATE SET role = 'manager', is_active = true;
    END LOOP;

    RAISE NOTICE 'デモマスターアカウントの設定が完了しました';
  ELSE
    RAISE NOTICE 'デモアカウントが見つかりません。先にSupabase Dashboardでユーザーを作成してください。';
  END IF;
END $$;
