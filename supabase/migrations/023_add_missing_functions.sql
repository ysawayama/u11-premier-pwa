-- ============================================
-- 023: 不足しているRPC関数を追加
-- ============================================

-- ============================================
-- is_team_manager_of: 指定チームのマネージャーかどうか確認
-- ============================================
CREATE OR REPLACE FUNCTION public.is_team_manager_of(_team_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = _team_id
      AND user_id = auth.uid()
      AND role IN ('manager', 'coach')
      AND is_active = true
  );
END;
$$;

-- 関数に実行権限を付与
GRANT EXECUTE ON FUNCTION public.is_team_manager_of(UUID) TO authenticated;

-- ============================================
-- is_admin_or_above: 管理者以上かどうか確認（存在しない場合は作成）
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin_or_above()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND ur.is_active = true
      AND r.name IN ('webmaster', 'admin')
  );
END;
$$;

-- 関数に実行権限を付与
GRANT EXECUTE ON FUNCTION public.is_admin_or_above() TO authenticated;

-- ============================================
-- 完了メッセージ
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '不足していたRPC関数を追加しました:';
  RAISE NOTICE '- is_team_manager_of(UUID)';
  RAISE NOTICE '- is_admin_or_above()';
END $$;
