-- ============================================
-- Webマスター権限の付与
-- sawayama@2501.worldとdemo-masterにWebマスター権限を付与
-- ============================================

-- 1. sawayama@2501.worldにWebマスター権限を付与
INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM auth.users u
CROSS JOIN public.roles r
WHERE u.email = 'sawayama@2501.world'
AND r.name = 'webmaster'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- 2. demo-masterアカウント用（既存のdemo@example.comがある場合）
-- demo@example.comにWebマスター権限を付与
INSERT INTO public.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM auth.users u
CROSS JOIN public.roles r
WHERE u.email = 'demo@example.com'
AND r.name = 'webmaster'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- ============================================
-- 確認用クエリ（コメントアウト）
-- ============================================
-- SELECT u.email, r.name as role_name, ur.is_active
-- FROM public.user_roles ur
-- JOIN auth.users u ON ur.user_id = u.id
-- JOIN public.roles r ON ur.role_id = r.id
-- WHERE r.name = 'webmaster';

-- ============================================
-- 完了メッセージ
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Webマスター権限の付与が完了しました';
  RAISE NOTICE '対象アカウント: sawayama@2501.world, demo@example.com';
END $$;
