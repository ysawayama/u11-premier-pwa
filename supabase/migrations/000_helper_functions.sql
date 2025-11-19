-- ============================================
-- ヘルパー関数
-- RLSポリシーで使用する認証・権限チェック関数
-- ============================================

-- コーチまたは管理者かチェック
CREATE OR REPLACE FUNCTION public.is_coach_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND user_type IN ('coach', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 管理者かチェック
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
