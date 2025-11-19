# Supabaseプロジェクトのセットアップ手順

## 1. Supabaseプロジェクトの作成

### ステップ1: Supabaseにアクセス
1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. GitHubアカウントでログイン（または新規アカウント作成）

### ステップ2: 新しいプロジェクトを作成
1. 「New Project」をクリック
2. 以下の情報を入力：
   - **Project Name**: `u11-premier-pwa`
   - **Database Password**: 強力なパスワードを設定（後で使用するので保存してください）
   - **Region**: `Northeast Asia (Tokyo)` を選択
   - **Pricing Plan**: `Free` を選択
3. 「Create new project」をクリック
4. プロジェクトの作成を待つ（2-3分かかります）

### ステップ3: API キーを取得
プロジェクトが作成されたら：

1. 左サイドバーから「Settings」→「API」をクリック
2. 以下の情報をコピー：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** キー（長い文字列）
   - **service_role** キー（長い文字列）※本番環境では厳重に管理

### ステップ4: 環境変数を設定

`.env.local` ファイルを開いて、以下の値を更新：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co  # ← Project URLに置き換え
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...  # ← anon publicキーに置き換え
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...  # ← service_roleキーに置き換え
```

---

## 2. 初期データベーススキーマの作成

### ステップ1: SQL Editorにアクセス
1. Supabase Dashboard左サイドバーから「SQL Editor」をクリック
2. 「New query」をクリック

### ステップ2: 初期スキーマを実行

以下のSQLを貼り付けて実行（「Run」ボタンをクリック）：

```sql
-- ユーザープロフィールテーブル（Supabase Authと連携）
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('player_guardian', 'coach', 'admin')),
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS（Row Level Security）を有効化
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分のデータのみ閲覧・更新可能
CREATE POLICY "Users can view their own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- トリガー: updated_at自動更新
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

### ステップ3: 認証設定の確認

#### Email Confirmation設定（開発中はOFF推奨）
1. 左サイドバーから「Authentication」→「Sign In / Providers」をクリック
2. 「User Signups」セクションで以下を確認：
   - **Allow new users to sign up**: ON（緑色）
   - **Confirm email**: OFF（グレー）← 開発中はOFFを推奨、本番ではON
3. 変更した場合は「Save changes」をクリック

#### URL設定
1. 左サイドバーから「Authentication」→「URL Configuration」をクリック
2. 以下を設定：
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: `http://localhost:3000/**` を追加（ワイルドカード）
3. 「Save changes」をクリック

---

## 3. 動作確認

### 開発サーバーを再起動
環境変数を更新したので、開発サーバーを再起動：

```bash
# Ctrl+C で停止してから
pnpm dev
```

### 接続テスト
ブラウザのコンソールで以下を実行して接続確認：

```javascript
// localhost:3000を開いて、ブラウザのコンソールで実行
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
```

エラーが出なければ成功です！

---

## トラブルシューティング

### エラー: "Invalid API key"
- `.env.local`のキーが正しいか確認
- 開発サーバーを再起動

### エラー: "Database connection failed"
- Supabaseプロジェクトが起動しているか確認（Dashboard上で緑色のステータス）
- Region設定を確認

### エラー: "CORS error"
- Supabase DashboardでSite URLが正しく設定されているか確認

### エラー: "new row violates row-level security policy"
- INSERTポリシーが設定されているか確認
- SQL Editorで以下を実行：
  ```sql
  CREATE POLICY "Users can insert their own data"
    ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);
  ```

### エラー: "User already registered"
- 前回のサインアップ試行でauth.usersにレコードが作成された状態
- Authentication → Users から既存ユーザーを削除
- または、別のメールアドレスで試す

---

## 次のステップ

Supabaseプロジェクトの作成が完了したら、チャットで報告してください。
認証システムの実装を開始します！
