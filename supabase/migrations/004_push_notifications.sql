/**
 * プッシュ通知用テーブル作成
 */

-- プッシュ通知サブスクリプションテーブル
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL, -- p256dh と auth キーを格納
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- RLS (Row Level Security) 有効化
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分のサブスクリプションのみ操作可能
CREATE POLICY "Users can manage their own subscriptions"
  ON push_subscriptions
  FOR ALL
  USING (auth.uid() = user_id);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- 通知設定テーブル（ユーザーごとの通知設定）
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

-- ポリシー
CREATE POLICY "Users can manage their own preferences"
  ON notification_preferences
  FOR ALL
  USING (auth.uid() = user_id);

-- updated_at自動更新トリガー
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscriptions_updated_at();
