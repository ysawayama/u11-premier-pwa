# PWAプッシュ通知機能

U-11プレミアリーグアプリのプッシュ通知機能の実装ガイド

## 概要

このアプリは、Web Push API を使用してプッシュ通知を実装しています。以下のイベントで自動的に通知が送信されます:

- ⚽ ゴール
- 🟨 イエローカード
- 🟥 レッドカード
- 🏁 試合開始
- 🏁 試合終了

## アーキテクチャ

### 構成要素

1. **Service Worker** (`/public/sw.js`)
   - プッシュ通知の受信と表示を処理
   - バックグラウンドでの通知管理

2. **通知フック** (`/src/hooks/useNotifications.ts`)
   - 通知許可のリクエスト
   - プッシュ通知へのサブスクライブ/アンサブスクライブ
   - テスト通知の送信

3. **通知API** (`/src/app/api/notifications/send/route.ts`)
   - サーバーサイドでのプッシュ通知送信
   - web-pushライブラリを使用

4. **通知ユーティリティ** (`/src/lib/notifications/sendNotification.ts`)
   - イベント別の通知送信関数
   - クライアントサイドからAPIを呼び出し

5. **データベーステーブル**
   - `push_subscriptions`: ユーザーのプッシュ通知サブスクリプション情報
   - `notification_preferences`: ユーザーごとの通知設定

## セットアップ

### 1. データベースマイグレーション

Supabase ダッシュボードで以下のマイグレーションを実行:

```bash
# Supabase CLIを使用する場合
supabase db push
```

または、Supabase ダッシュボードの SQL Editor で `004_push_notifications.sql` を実行。

### 2. VAPID鍵の生成

プッシュ通知にはVAPID鍵が必要です。以下のスクリプトで生成できます:

```bash
node scripts/generate-vapid-keys.js
```

出力された鍵を `.env.local` にコピーしてください（既に設定済みの場合はスキップ）:

```env
# Web Push通知用のVAPIDキー
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key-here
VAPID_PRIVATE_KEY=your-private-key-here
```

⚠️ **重要**:
- `VAPID_PRIVATE_KEY` は絶対に公開しないでください
- 本番環境では必ず異なるキーを使用してください
- `.env.local` が `.gitignore` に含まれていることを確認してください

### 3. 開発サーバーの再起動

環境変数を追加した後は、開発サーバーを再起動してください:

```bash
pnpm dev
```

## 使い方

### ユーザー側の設定

1. ダッシュボードから「⚙️ 設定」をクリック
2. 「プッシュ通知」セクションで「登録する」ボタンをクリック
3. ブラウザの通知許可ダイアログで「許可」を選択
4. 「テスト通知を送信」で動作確認
5. 不要な通知は個別にオフにできます

### コーチ/管理者による通知送信

試合イベントを記録すると、自動的に通知が全ユーザーに送信されます:

1. 試合管理ページで試合を選択
2. 「試合イベント」セクションでイベントを記録
   - ゴール、カード、交代などを記録
3. イベント記録後、自動的に通知が送信されます

## 対応ブラウザ

プッシュ通知は以下のブラウザでサポートされています:

✅ **完全サポート**
- Chrome 42+ (デスクトップ・Android)
- Firefox 44+ (デスクトップ・Android)
- Edge 17+
- Opera 37+
- Samsung Internet 4+

⚠️ **制限付きサポート**
- Safari 16+ (macOS 13+, iOS 16.4+)
  - iOS/iPadOSではホーム画面に追加後のみ動作

❌ **未サポート**
- Internet Explorer
- 古いバージョンのブラウザ

## トラブルシューティング

### 通知が届かない

1. **ブラウザの通知許可を確認**
   - ブラウザの設定で通知がブロックされていないか確認
   - 設定 > プライバシーとセキュリティ > 通知

2. **Service Workerの登録を確認**
   - DevTools > Application > Service Workers
   - Service Workerが登録されているか確認

3. **サブスクリプションを確認**
   - 設定ページで「プッシュ通知の登録」が「登録済み」になっているか確認
   - なっていない場合は「登録する」をクリック

4. **VAPID鍵を確認**
   - `.env.local` にVAPID鍵が正しく設定されているか確認
   - 開発サーバーを再起動

5. **データベースを確認**
   - `push_subscriptions` テーブルにデータが入っているか確認
   - RLSポリシーが正しく設定されているか確認

### Service Workerが登録されない

1. **HTTPSで動作しているか確認**
   - Service WorkerはHTTPS環境でのみ動作します
   - localhost は例外として HTTP でも動作します

2. **Service Workerファイルのパスを確認**
   - `/public/sw.js` が存在するか確認
   - ブラウザで `/sw.js` にアクセスしてファイルが読み込めるか確認

3. **キャッシュをクリア**
   - DevTools > Application > Clear storage
   - 「Clear site data」をクリック

### 通知が届くが表示されない

1. **通知設定を確認**
   - 設定ページで該当する通知タイプがオンになっているか確認
   - `notification_preferences` テーブルを確認

2. **ブラウザの通知表示設定を確認**
   - OSの通知設定でブラウザの通知が有効か確認
   - macOS: システム設定 > 通知 > [ブラウザ名]
   - Windows: 設定 > システム > 通知

## API リファレンス

### POST /api/notifications/send

プッシュ通知を送信します。

**認証**: Bearer Token（コーチまたは管理者のみ）

**リクエストボディ**:
```json
{
  "userId": "user-uuid", // 特定ユーザーに送信（オプション）
  "userIds": ["uuid1", "uuid2"], // 複数ユーザーに送信（オプション）
  "all": true, // 全ユーザーに送信（オプション）
  "notification": {
    "title": "通知タイトル",
    "body": "通知本文",
    "icon": "/icons/icon-192x192.png", // オプション
    "badge": "/icons/icon-192x192.png", // オプション
    "tag": "notification-tag", // オプション
    "url": "/dashboard", // クリック時のURL（オプション）
    "data": {} // 追加データ（オプション）
  }
}
```

**レスポンス**:
```json
{
  "message": "Notifications sent",
  "sent": 10, // 送信成功数
  "total": 12 // 送信試行数
}
```

## セキュリティ

1. **VAPID秘密鍵の管理**
   - `.env.local` に保存（Gitに含めない）
   - 本番環境では環境変数として設定
   - 定期的にローテーション

2. **通知送信権限**
   - コーチと管理者のみが通知を送信可能
   - API routeで認証と権限チェックを実施

3. **RLS (Row Level Security)**
   - ユーザーは自分のサブスクリプションのみ操作可能
   - 通知設定も同様に保護

## パフォーマンス

- Service Workerはバックグラウンドで動作するため、アプリのパフォーマンスに影響しません
- 通知送信は非同期で実行され、アプリの操作をブロックしません
- 無効なサブスクリプションは自動的に削除されます

## 今後の拡張

- [ ] 通知のスケジュール送信
- [ ] リッチ通知（画像、アクション付き）
- [ ] ユーザーグループ別の通知
- [ ] 通知履歴の表示
- [ ] メール通知との統合

## 参考リンク

- [Web Push API (MDN)](https://developer.mozilla.org/ja/docs/Web/API/Push_API)
- [Service Worker API (MDN)](https://developer.mozilla.org/ja/docs/Web/API/Service_Worker_API)
- [web-push (npm)](https://www.npmjs.com/package/web-push)
- [VAPID Specification](https://datatracker.ietf.org/doc/html/rfc8292)
