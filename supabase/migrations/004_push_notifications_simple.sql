-- プッシュ通知用テーブル作成（シンプル版）
-- Supabase SQL Editorで直接実行してください

-- 1. push_subscriptionsテーブル
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- RLS有効化
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLSポリシー削除（既存の場合）
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON push_subscriptions;

-- RLSポリシー作成
CREATE POLICY "Users can manage their own subscriptions"
  ON push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id);

-- 2. notification_preferencesテーブル
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  goals_enabled BOOLEAN NOT NULL DEFAULT true,
  cards_enabled BOOLEAN NOT NULL DEFAULT true,
  match_start_enabled BOOLEAN NOT NULL DEFAULT true,
  match_end_enabled BOOLEAN NOT NULL DEFAULT true,
  team_updates_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- RLS有効化
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLSポリシー削除（既存の場合）
DROP POLICY IF EXISTS "Users can manage their own preferences" ON notification_preferences;

-- RLSポリシー作成
CREATE POLICY "Users can manage their own preferences"
  ON notification_preferences
  FOR ALL
  USING (auth.uid() = user_id);

-- 3. updated_atトリガー関数（既存でない場合のみ）
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- push_subscriptionsのトリガー削除（既存の場合）
DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON push_subscriptions;

-- push_subscriptionsのトリガー作成
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- notification_preferencesのトリガー削除（既存の場合）
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;

-- notification_preferencesのトリガー作成
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE '✅ プッシュ通知用テーブルの作成が完了しました';
  RAISE NOTICE '📋 作成されたテーブル: push_subscriptions, notification_preferences';
END $$;
