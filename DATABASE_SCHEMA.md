# U-11プレミアリーグ データベーススキーマ設計

## 概要

実際のプレミアリーグU-11の構造に基づいたデータベーススキーマ設計。

### 参考情報
- 公式サイト: https://pl11.jp/2025-2026
- 地域構造: 38都道府県を9地域に分割
- 参加規模: 約630チーム、11,000人の選手

---

## テーブル設計

### 1. regions（地域）テーブル

地域マスターデータ（9地域）

```sql
CREATE TABLE IF NOT EXISTS public.regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL, -- '関東', '関西', '九州・沖縄' など
  name_en TEXT UNIQUE NOT NULL, -- 'kanto', 'kansai', 'kyushu-okinawa' など
  display_order INT NOT NULL, -- 表示順序
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. prefectures（都道府県）テーブル

都道府県マスターデータ（38都道府県）

```sql
CREATE TABLE IF NOT EXISTS public.prefectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  name TEXT UNIQUE NOT NULL, -- '東京都', '神奈川県' など
  name_en TEXT UNIQUE NOT NULL, -- 'tokyo', 'kanagawa' など
  code TEXT UNIQUE NOT NULL, -- '13', '14' など（JIS X 0401）
  display_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. teams（チーム）テーブル

サッカーチーム情報

```sql
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prefecture_id UUID NOT NULL REFERENCES public.prefectures(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'バディーSC', 'FC東京U-12' など
  name_kana TEXT, -- 'バディーエスシー' など
  short_name TEXT, -- 'バディー', 'FC東京' など
  logo_url TEXT, -- チームロゴ画像URL
  founded_year INT, -- 設立年
  home_ground TEXT, -- ホームグラウンド
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true, -- アクティブフラグ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(prefecture_id, name)
);

-- インデックス
CREATE INDEX idx_teams_prefecture ON public.teams(prefecture_id);
CREATE INDEX idx_teams_active ON public.teams(is_active);
```

### 4. players（選手）テーブル

選手情報（デジタル選手証）

```sql
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- 保護者アカウント（任意）

  -- 基本情報
  family_name TEXT NOT NULL, -- 姓
  given_name TEXT NOT NULL, -- 名
  family_name_kana TEXT NOT NULL, -- 姓（カナ）
  given_name_kana TEXT NOT NULL, -- 名（カナ）
  date_of_birth DATE NOT NULL, -- 生年月日
  grade INT NOT NULL CHECK (grade >= 1 AND grade <= 6), -- 学年（1-6年生）

  -- 選手情報
  uniform_number INT, -- 背番号
  position TEXT, -- ポジション（FW, MF, DF, GK）
  photo_url TEXT, -- 顔写真URL

  -- デジタル選手証
  player_card_number TEXT UNIQUE, -- 選手証番号（QRコード用）
  qr_code_data TEXT, -- QRコードデータ（JSON形式）
  card_issued_at TIMESTAMPTZ, -- 選手証発行日
  card_expires_at TIMESTAMPTZ, -- 選手証有効期限

  -- メタ情報
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(team_id, family_name, given_name, date_of_birth)
);

-- インデックス
CREATE INDEX idx_players_team ON public.players(team_id);
CREATE INDEX idx_players_user ON public.players(user_id);
CREATE INDEX idx_players_card_number ON public.players(player_card_number);
CREATE INDEX idx_players_active ON public.players(is_active);
```

### 5. seasons（シーズン）テーブル

年度・シーズン管理

```sql
CREATE TABLE IF NOT EXISTS public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL, -- '2025-2026', '2026-2027' など
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN DEFAULT false, -- 現在のシーズン
  championship_date DATE, -- 全国大会日程
  championship_venue TEXT, -- 全国大会会場
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 6. matches（試合）テーブル

試合情報・試合速報

```sql
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,

  -- 試合情報
  match_date TIMESTAMPTZ NOT NULL, -- 試合日時
  venue TEXT NOT NULL, -- 会場
  match_type TEXT NOT NULL CHECK (match_type IN ('league', 'championship', 'friendly')), -- 試合種別
  round TEXT, -- ラウンド（'予選リーグA', '決勝トーナメント1回戦' など）

  -- チーム情報
  home_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  away_team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,

  -- スコア
  home_score INT,
  away_score INT,

  -- 試合状態
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'finished', 'cancelled')),

  -- 詳細情報
  weather TEXT, -- 天候
  temperature DECIMAL(4,1), -- 気温
  attendance INT, -- 観客数
  referee TEXT, -- 主審
  notes TEXT, -- 備考

  -- メタ情報
  created_by UUID REFERENCES public.users(id), -- 作成者
  updated_by UUID REFERENCES public.users(id), -- 更新者
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CHECK (home_team_id != away_team_id)
);

-- インデックス
CREATE INDEX idx_matches_season ON public.matches(season_id);
CREATE INDEX idx_matches_home_team ON public.matches(home_team_id);
CREATE INDEX idx_matches_away_team ON public.matches(away_team_id);
CREATE INDEX idx_matches_date ON public.matches(match_date);
CREATE INDEX idx_matches_status ON public.matches(status);
```

### 7. match_events（試合イベント）テーブル

試合中のイベント（得点、警告など）

```sql
CREATE TABLE IF NOT EXISTS public.match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,

  -- イベント情報
  event_type TEXT NOT NULL CHECK (event_type IN ('goal', 'yellow_card', 'red_card', 'substitution')),
  minute INT NOT NULL CHECK (minute >= 0 AND minute <= 120), -- 試合時間（分）
  description TEXT, -- イベント詳細

  -- 交代時の情報
  substitution_player_out_id UUID REFERENCES public.players(id) ON DELETE SET NULL, -- 交代で出た選手
  substitution_player_in_id UUID REFERENCES public.players(id) ON DELETE SET NULL, -- 交代で入った選手

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_match_events_match ON public.match_events(match_id);
CREATE INDEX idx_match_events_player ON public.match_events(player_id);
CREATE INDEX idx_match_events_team ON public.match_events(team_id);
```

### 8. team_standings（順位表）テーブル

チームの成績・順位

```sql
CREATE TABLE IF NOT EXISTS public.team_standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,

  -- 成績
  matches_played INT DEFAULT 0,
  wins INT DEFAULT 0,
  draws INT DEFAULT 0,
  losses INT DEFAULT 0,
  goals_for INT DEFAULT 0, -- 得点
  goals_against INT DEFAULT 0, -- 失点
  goal_difference INT DEFAULT 0, -- 得失点差
  points INT DEFAULT 0, -- 勝ち点

  -- ランキング
  rank INT, -- 順位

  -- メタ情報
  last_calculated_at TIMESTAMPTZ, -- 最終計算日時
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(season_id, team_id)
);

-- インデックス
CREATE INDEX idx_team_standings_season ON public.team_standings(season_id);
CREATE INDEX idx_team_standings_team ON public.team_standings(team_id);
CREATE INDEX idx_team_standings_points ON public.team_standings(points DESC);
```

### 9. player_stats（選手成績）テーブル

選手個人成績

```sql
CREATE TABLE IF NOT EXISTS public.player_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,

  -- 成績
  matches_played INT DEFAULT 0,
  goals INT DEFAULT 0,
  assists INT DEFAULT 0,
  yellow_cards INT DEFAULT 0,
  red_cards INT DEFAULT 0,

  -- メタ情報
  last_calculated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(season_id, player_id)
);

-- インデックス
CREATE INDEX idx_player_stats_season ON public.player_stats(season_id);
CREATE INDEX idx_player_stats_player ON public.player_stats(player_id);
CREATE INDEX idx_player_stats_goals ON public.player_stats(goals DESC);
```

---

## RLS（Row Level Security）ポリシー

### 基本方針
- **読み取り（SELECT）**: 全ユーザーが閲覧可能（公開データ）
- **作成（INSERT）**: コーチ・管理者のみ
- **更新（UPDATE）**: コーチ・管理者のみ
- **削除（DELETE）**: 管理者のみ

### ヘルパー関数

```sql
-- ユーザーロール確認関数
CREATE OR REPLACE FUNCTION public.is_coach_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND user_type IN ('coach', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND user_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## トリガー関数

### updated_at自動更新トリガー

```sql
-- 全テーブルに適用するupdated_atトリガーの作成は、
-- 各テーブル作成後に以下のようなSQLで設定：
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.{table_name}
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

---

## 次のステップ

1. マイグレーションSQLファイルの作成
2. シードデータ（地域・都道府県・サンプルチーム）の作成
3. RLSポリシーの実装
4. Supabase Dashboardでの実行・確認
