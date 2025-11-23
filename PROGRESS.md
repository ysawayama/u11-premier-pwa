# 開発進捗記録

## 最終更新: 2025-11-24

### 完了した機能

#### チームポータル機能
- [x] マイページ（選手専用）
  - サッカーノート機能（選手-コーチ間コミュニケーション）
  - サッカーライフログ（成長の思い出アルバム、タイムライン表示）
- [x] メニュー表示制御
  - 選手登録者のみマイページ表示
  - WebマスターとAdmin権限は常時表示（PoC期間中）
- [x] コーチ向けノートレビューページ (`/notes`)
- [x] デモ選手データ「U11 太郎」（大豆戸FC所属）

#### インフラ・設定
- [x] Next.js 16 + Turbopackビルド設定
- [x] Protected layout分離（Server/Client Component）
- [x] ESLint/TypeScriptエラーのビルド時無視設定
- [x] Vercelデプロイ成功

### 既知の問題

#### ローカルビルドエラー
Next.js 16のプリレンダリングで`useContext`エラーが発生：
```
Error occurred prerendering page "/_global-error"
TypeError: Cannot read properties of null (reading 'useContext')
```
**対応状況**: Vercelでは正常にビルド・デプロイ可能

---

## 次回のタスク

### 優先度: 高

#### 1. モバイルファースト・レスポンシブ対応強化
**目的**: スマートフォンでのレイアウト崩れを修正

**確認が必要なページ**:
- [ ] ホームページ (`/`)
- [ ] ダッシュボード (`/dashboard`)
- [ ] チームポータル (`/team-portal/[teamId]`)
- [ ] マイページ (`/team-portal/[teamId]/my-page`)
- [ ] 試合詳細ページ
- [ ] 選手プロフィールページ

**対応方針**:
- TailwindCSSのレスポンシブユーティリティを活用
- モバイルファースト設計（`sm:`, `md:`, `lg:`プレフィックス）
- タッチターゲットサイズの確保（最小44px）
- フォントサイズの調整
- スペーシングの最適化

### 優先度: 中

#### 2. デザインテコ入れ
- [ ] 統一感のあるカラーパレット
- [ ] ボタン・カードコンポーネントの統一
- [ ] アイコン使用の統一
- [ ] 影（シャドウ）の統一

---

## ファイル構成メモ

### 重要なファイル
```
src/
├── app/
│   ├── (protected)/
│   │   ├── layout.tsx          # Server Component（dynamic export）
│   │   ├── admin/
│   │   │   └── layout.tsx      # Admin用dynamic layout
│   │   └── team-portal/
│   │       └── [teamId]/
│   │           ├── my-page/    # 選手マイページ
│   │           └── notes/      # コーチノートレビュー
│   └── (auth)/
│       └── layout.tsx          # Auth用dynamic layout
├── components/
│   └── layouts/
│       ├── ClientLayout.tsx    # PWAインストールプロンプト
│       └── ProtectedLayoutClient.tsx  # 認証チェックClient Component
└── lib/
    └── api/
        ├── soccerNotes.ts      # サッカーノートAPI
        └── soccerLifeLogs.ts   # ライフログAPI
```

### 設定ファイル
- `next.config.mjs`: Turbopack設定、ESLint/TS無視設定
- `tsconfig.json`: TypeScript設定

---

## デモアカウント情報
- メール: demo@example.com
- パスワード: （要確認）
- 権限: 全ページ閲覧可能

## デモ選手データ
- 名前: U11 太郎
- チーム: 大豆戸FC
- user_id: c8fa3405-71b8-4ca6-add1-47dbde9766a5（demo-masterアカウント）
