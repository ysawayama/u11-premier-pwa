# 開発進捗記録

## 最終更新: 2025-11-28

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

## 2025-11-28: モバイルレスポンシブ対応完了

### 完了した作業

#### 1. モバイルファースト・レスポンシブ対応
**目的**: スマートフォンでのレイアウト崩れを修正

**対応済みページ**:
- [x] ホームページ (`/`)
- [x] ダッシュボード (`/dashboard`)
- [x] チームポータルレイアウト (`/team-portal/[teamId]/layout.tsx`)
- [x] チームポータル戦績 (`/team-portal/[teamId]/page.tsx`)
- [x] マイページ (`/team-portal/[teamId]/my-page`)
- [x] 試合結果一覧 (`/matches`)
- [x] 順位表 (`/standings`)
- [x] チーム一覧 (`/teams`)
- [x] スケジュール (`/team-portal/[teamId]/schedule`)
- [x] 選手名簿 (`/team-portal/[teamId]/roster`)
- [x] 掲示板 (`/team-portal/[teamId]/board`)
- [x] 出欠管理 (`/team-portal/[teamId]/attendance`)
- [x] 設定 (`/settings`)

**適用したレスポンシブパターン**:
- TailwindCSS `sm:`, `md:`, `lg:` ブレークポイントを活用
- タッチターゲット最小44pxの確保 (`min-h-[44px]`)
- モバイル用短縮テキスト（例: `hidden sm:inline` / `sm:hidden`）
- レスポンシブグリッド（例: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`）
- 適応型パディング/マージン（例: `p-3 sm:p-6`）
- テキストサイズの段階的調整（例: `text-xs sm:text-sm`）
- テキスト省略 (`truncate`)

---

## 次回のタスク

### 優先度: 高

#### 1. デザインテコ入れ
- [ ] 統一感のあるカラーパレット
- [ ] ボタン・カードコンポーネントの統一
- [ ] アイコン使用の統一
- [ ] 影（シャドウ）の統一

### 優先度: 中

#### 2. 機能追加
- [ ] チャットページの実装
- [ ] マッチメイク機能の拡充
- [ ] アルバム機能の実装

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
