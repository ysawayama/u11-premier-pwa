# 開発進捗記録

## 最終更新: 2025-11-29

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

## 2025-11-29: UI改善（小学生向けUX）

### 完了した作業

#### 1. フッターナビゲーション日本語化
**ファイル**: `src/components/navigation/BottomNav.tsx`
- HOME → ホーム
- GAMES → 試合
- LEAGUE → リーグ
- MEDIA → メディア

#### 2. リーグ順位表のレイアウト修正
**ファイル**: `src/app/(protected)/league/page.tsx`
- **問題**: グリッドレイアウトが崩れて縦一列になっていた
- **解決**: `grid` → `flex` に変更し、固定幅を設定
- チームロゴ表示対応（`logo_url`がある場合）
- コンパクトなデザインで10チーム一覧可能

#### 3. 試合一覧にチームロゴ追加
**ファイル**: `src/app/(protected)/games/page.tsx`
- LIVE試合カードと通常カードの両方でロゴ表示対応
- `logo_url`がない場合は頭文字フォールバック

#### 4. 試合詳細ページにチームロゴ追加
**ファイル**: `src/app/(protected)/matches/[id]/page.tsx`
- スコアボード上にチームロゴを表示
- ロゴがない場合は頭文字フォールバック

#### 5. スプラッシュ画面のロゴ背景修正
**ファイル**: `src/components/splash/SplashIntro.tsx`
- `bg-white/90` → `bg-white` で完全白背景に
- 黒っぽいロゴ（大豆戸FCなど）の視認性向上

#### 6. PWAアイコン背景色設定
**ファイル**: `public/manifest.json`
- `background_color`をオレンジ（#f97316）に設定
- ※既存インストール済みアプリには即時反映されない

---

## 2025-11-29: スプラッシュ演出改善

### 完了した作業

#### 1. スプラッシュ演出の改善（所属チームロゴ → リーグロゴ遷移）
**ファイル**: `src/components/splash/SplashIntro.tsx`
- **新しい演出フロー**:
  1. `myTeam` - ユーザーの所属チームロゴを中央に大きく表示（例：大豆戸FC）
  2. `transition` - 所属チームロゴが縮小、10チームのロゴが円形で登場
  3. `leagueLogo` - リーグロゴが中央に表示、チームロゴ円は回転
  4. `fadeOut` - フェードアウト
- **ハイライト機能**: 円形配置で所属チームはオレンジの枠で強調表示
- **フォールバック**: 未ログイン/所属チームなしの場合はデフォルト表示

#### 2. カラーパレット統一
**ファイル**: `src/app/globals.css` + 全コンポーネント
- **Tailwind @theme拡張**でDesign Systemカラーを定義：
  - `primary` / `primary-hover` / `primary-light` - ボタン・リンク用
  - `navy` / `navy-light` - ヘッダー・タイトル用
  - `accent` / `accent-light` - U-11ブランドカラー
  - `success` / `warning` / `error` - ステータス用
  - `gold` / `silver` / `bronze` - ランキング用
- **一括置換**:
  - `bg-blue-600` → `bg-primary`
  - `text-blue-900` → `text-navy`
  - `from-blue-600 to-blue-800` → `from-navy-light to-navy`
  - `focus:ring-blue-*` → `focus:ring-primary`

---

### 未着手・次回タスク候補

#### PWA関連
- [ ] ホーム画面アイコンの背景色が反映されていない可能性（再インストール必要）

#### デザイン統一
- [x] 統一感のあるカラーパレット
- [ ] ボタン・カードコンポーネントの統一
- [ ] アイコン使用の統一

#### 機能追加
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
