# 開発引き継ぎドキュメント

最終更新: 2025-11-20

## 📋 現在の状態

### ✅ 完了した機能

#### 1. 試合イベント記録機能
- ゴール、イエローカード、レッドカード、選手交代の記録
- アシスト情報の記録
- イベント一覧表示と削除機能
- **ファイル**: `src/components/MatchEventRecorder.tsx`
- **API**: `src/lib/api/matchEvents.ts`

#### 2. 選手統計機能
- 個人得点・アシストランキング表示
- TOP 3 表示（金・銀・銅メダルデザイン）
- イエローカード・レッドカード集計
- 全ランキングテーブル
- **ページ**: `src/app/(protected)/stats/page.tsx`

#### 3. PWA プッシュ通知機能
- Service Worker実装 (`public/sw.js`)
- 通知許可リクエスト機能
- プッシュ通知サブスクリプション管理
- 通知設定ページ (`src/app/(protected)/settings/page.tsx`)
- 自動通知送信（ゴール、カード、試合開始/終了）
- **API**: `src/app/api/notifications/send/route.ts`
- **Hook**: `src/hooks/useNotifications.ts`

#### 4. PWAアイコン
- カスタムアイコン（PNG）の生成と配置
- 192x192, 512x512, 180x180 の各サイズ
- apple-touch-icon.png も配置済み
- **スクリプト**: `scripts/resize-icon.mjs`

### 🚀 デプロイ状況

- **GitHub**: https://github.com/ysawayama/u11-premier-pwa
- **本番環境**: https://u11-premier-pwa.vercel.app
- **デプロイ**: Vercel自動デプロイ設定済み

### 📊 データベース状態

実行済みマイグレーション：
1. `001_initial_schema.sql` - 初期スキーマ
2. `002_seed_data.sql` - シードデータ
3. `003_tokyo_league_data.sql` - 東京リーグデータ
4. `004_push_notifications_simple.sql` - プッシュ通知テーブル
5. `005_add_assisted_by_column.sql` - アシストカラム追加

### 🔧 環境変数

必要な環境変数（`.env.local` と Vercel に設定済み）：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`

---

## 🔄 次回のタスク

### 1. 本番環境テスト（最優先）

#### プッシュ通知の動作確認
- [ ] 設定ページで通知を有効化
- [ ] テスト通知を送信して表示を確認
- [ ] 試合でゴール/カードを記録して自動通知を確認
- [ ] 通知の内容と表示形式を確認

**期待される動作**:
- HTTPS環境では通知が正常に表示される
- システム通知として表示される
- 通知をクリックするとアプリが開く

#### スマートフォンでPWAインストール
- [ ] **iOS (Safari)**: 共有ボタン → 「ホーム画面に追加」
- [ ] **Android (Chrome)**: メニュー → 「アプリをインストール」
- [ ] カスタムアイコンが正しく表示されるか確認
- [ ] PWAとして独立したウィンドウで起動するか確認
- [ ] オフライン動作を確認（Service Workerのキャッシュ）

### 2. 改善・調整項目

#### UI/UX改善
- [ ] 選手統計ページのデザイン調整
- [ ] モバイル表示の最適化
- [ ] ローディング状態の改善
- [ ] エラーメッセージの改善

#### 機能拡張候補
- [ ] 試合詳細ページの充実
- [ ] 選手詳細ページの作成
- [ ] チーム詳細ページの作成
- [ ] 順位表の実装
- [ ] フィルター・検索機能

#### パフォーマンス最適化
- [ ] 画像最適化
- [ ] Service Workerキャッシュ戦略の調整
- [ ] バンドルサイズの確認と最適化

---

## 🐛 既知の問題と解決済み問題

### 解決済み

#### 1. TypeScriptビルドエラー
- **問題**: 型定義の不足や型の不一致
- **解決**: 各種型定義を追加・修正
- **詳細**: `docs/TROUBLESHOOTING.md` 参照

#### 2. SSR/プリレンダリングエラー
- **問題**: Zustand storeとSupabase clientがSSR環境で動作しない
- **解決**: `createClient` にSSRチェックを追加、dynamic renderingを設定
- **詳細**: `docs/TROUBLESHOOTING.md` 参照

#### 3. Supabaseクエリエラー
- **問題**: 複数の外部キーリレーションシップで曖昧性エラー
- **解決**: カラム名で明示的に指定（`players!player_id`）
- **詳細**: `docs/TROUBLESHOOTING.md` 参照

#### 4. assisted_by_player_idカラム不足
- **問題**: アシスト情報を記録するカラムが存在しない
- **解決**: マイグレーション `005_add_assisted_by_column.sql` を実行
- **ステータス**: ✅ 完了

### 未解決（要確認）

#### 1. macOSローカル環境での通知表示
- **問題**: テスト通知が成功するがmacOSで表示されない
- **原因**: システム通知設定の問題の可能性
- **対応**: 本番環境（HTTPS）でのテスト待ち
- **優先度**: 低（本番環境では問題なく動作する見込み）

---

## 📚 重要な技術情報

### プロジェクト構成

```
u11-premier-pwa/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (protected)/        # 認証必須ルート
│   │   │   ├── admin/          # 管理者専用ページ
│   │   │   ├── stats/          # 選手統計
│   │   │   └── settings/       # 通知設定
│   │   └── api/                # API Routes
│   │       └── notifications/  # 通知送信API
│   ├── components/             # Reactコンポーネント
│   ├── hooks/                  # カスタムフック
│   ├── lib/                    # ユーティリティ
│   │   ├── api/               # Supabase API呼び出し
│   │   ├── stores/            # Zustand ストア
│   │   └── supabase/          # Supabaseクライアント
│   └── types/                  # TypeScript型定義
├── public/
│   ├── icons/                  # PWAアイコン
│   └── sw.js                   # Service Worker
├── supabase/
│   └── migrations/             # データベースマイグレーション
├── scripts/                    # ユーティリティスクリプト
└── docs/                       # ドキュメント
```

### キーとなる技術スタック

- **フレームワーク**: Next.js 16 (App Router + Turbopack)
- **データベース**: Supabase (PostgreSQL + RLS)
- **認証**: Supabase Auth
- **状態管理**: Zustand
- **スタイリング**: Tailwind CSS
- **PWA**: @ducanh2912/next-pwa
- **通知**: Web Push API + web-push
- **デプロイ**: Vercel

### 開発コマンド

```bash
# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# Lintチェック
pnpm lint

# アイコンリサイズ（新しいアイコンを追加する場合）
node scripts/resize-icon.mjs <画像パス>

# VAPID鍵生成（新規セットアップ時のみ）
node scripts/generate-vapid-keys.js
```

---

## 🔐 セキュリティ・重要事項

### 環境変数の管理

- **重要**: `.env.local` はgitにコミットしない（`.gitignore`に含まれている）
- **VAPID秘密鍵**: 絶対に公開しない
- **Supabase Service Role Key**: サーバーサイドのみで使用

### RLS (Row Level Security)

- 全てのテーブルでRLSポリシーが設定済み
- ユーザーは自分のデータのみアクセス可能
- コーチ・管理者は追加権限あり

### 認証フロー

1. Supabase Authでメール/パスワード認証
2. `useAuthStore` (Zustand) でセッション管理
3. `(protected)` layoutで認証チェック
4. 未認証ユーザーは `/login` にリダイレクト

---

## 📝 開発のヒント

### Supabaseクエリのベストプラクティス

```typescript
// ✅ 良い例: カラム名で明示的に指定
.select('player:players!player_id(...)')

// ❌ 悪い例: 外部キー制約名に依存
.select('player:players!match_events_player_id_fkey(...)')

// ✅ 良い例: 複数のリレーションがある場合はエイリアスを使う
.select(`
  scorer:players!player_id(...),
  assister:players!assisted_by_player_id(...)
`)
```

### TypeScript型定義

- 全ての型は `src/types/database.ts` に集約
- Supabaseのスキーマと一致させる
- `Insert`, `Update` 型も定義済み

### Service Worker開発

- 開発環境では無効化されている（`next.config.mjs`）
- 本番環境でのみ有効
- ローカルテストする場合は `disable: false` に変更

---

## 🆘 トラブルシューティング

詳細は `docs/TROUBLESHOOTING.md` を参照してください。

### よくある問題

1. **ビルドエラー**: 型定義を確認、`pnpm install` を実行
2. **通知が表示されない**: ブラウザの通知許可を確認
3. **Supabaseエラー**: RLSポリシーを確認
4. **SSRエラー**: `typeof window === 'undefined'` チェックを追加

---

## 📞 参考リンク

- **Next.js ドキュメント**: https://nextjs.org/docs
- **Supabase ドキュメント**: https://supabase.com/docs
- **Web Push API**: https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- **PWA ガイド**: https://web.dev/progressive-web-apps/

---

## 🎯 今後の展開候補

### 短期的な改善

- [ ] 通知の種類を増やす（試合リマインダー、コメント通知など）
- [ ] ダークモード対応
- [ ] 多言語対応（i18n）
- [ ] データエクスポート機能（CSV/PDF）

### 長期的な機能拡張

- [ ] リアルタイムスコアボード
- [ ] チャット機能
- [ ] ファイル共有機能
- [ ] カレンダー統合
- [ ] 分析・レポート機能

---

**次回の開発セッションでは、本番環境でのテストから始めることをお勧めします！**
