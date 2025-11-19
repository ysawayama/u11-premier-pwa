-- テーブルの存在確認
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('push_subscriptions', 'notification_preferences');

-- push_subscriptionsテーブルの確認
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'push_subscriptions'
) as push_subscriptions_exists;

-- notification_preferencesテーブルの確認
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'notification_preferences'
) as notification_preferences_exists;
