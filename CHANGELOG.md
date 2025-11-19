# 変更履歴

## [Unreleased] - 2025-11-20

### 追加機能

#### 1. 試合イベント記録機能
- ゴール、イエローカード、レッドカード、選手交代の記録
- アシスト情報の記録
- イベント一覧表示と削除機能
- コンポーネント: `MatchEventRecorder.tsx`
- API: `src/lib/api/matchEvents.ts`

#### 2. 選手統計機能  
- 個人得点・アシストランキング表示
- TOP 3 表示（金・銀・銅メダルデザイン）
- イエローカード・レッドカード集計
- 全ランキングテーブル
- ページ: `src/app/(protected)/stats/page.tsx`

#### 3. PWA プッシュ通知機能
- Service Worker実装 (`public/sw.js`)
- 通知許可リクエスト機能
- プッシュ通知サブスクリプション管理
- 通知設定ページ (`src/app/(protected)/settings/page.tsx`)
- 自動通知送信:
  - ⚽ ゴール時
  - 🟨 イエローカード時
  - 🟥 レッドカード時
  - 🏁 試合開始時
  - 🏁 試合終了時
- 通知送信API: `src/app/api/notifications/send/route.ts`
- 通知フック: `src/hooks/useNotifications.ts`
- 通知ユーティリティ: `src/lib/notifications/sendNotification.ts`

### データベース変更

- マイグレーション: `004_push_notifications.sql`
  - `push_subscriptions` テーブル追加
  - `notification_preferences` テーブル追加
  - RLS ポリシー設定

### ドキュメント

- `docs/PUSH_NOTIFICATIONS.md` - プッシュ通知完全ガイド
- `docs/PWA_ICONS.md` - PWAアイコン設定ガイド
- `public/icons/README.md` - アイコン配置ガイド

### 環境変数

新規追加（`.env.local`に設定が必要）:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Web Push公開鍵
- `VAPID_PRIVATE_KEY` - Web Push秘密鍵（サーバーサイドのみ）

※ VAPID鍵は `scripts/generate-vapid-keys.js` で生成可能

### その他

- 仮のSVGアイコン追加: `public/icons/icon.svg`
- ダッシュボードに設定ページリンク追加
- ダッシュボードに選手統計ページリンク追加

## セットアップ手順（新規環境）

1. データベースマイグレーション実行
   ```bash
   # Supabase SQL Editorで実行
   supabase/migrations/004_push_notifications_simple.sql
   ```

2. VAPID鍵を生成
   ```bash
   node scripts/generate-vapid-keys.js
   ```

3. `.env.local`に鍵を追加

4. 開発サーバー再起動
   ```bash
   pnpm dev
   ```

## 既知の問題

- PWAアイコン（PNG）が未配置（SVGのみ）
  - 本番デプロイ前に適切なアイコンを配置する必要あり
- macOSローカル環境でプッシュ通知がシステム通知として表示されない場合がある
  - システム設定の通知許可を確認する必要あり
  - 本番環境（HTTPS）では正常に動作する見込み

## 次のステップ

- [ ] PWAアイコン（PNG）の作成と配置
- [ ] 本番環境でのプッシュ通知テスト
- [ ] スマートフォンでのPWAインストールテスト
