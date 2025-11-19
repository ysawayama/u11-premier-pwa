# データベースマイグレーション実行ガイド

## 概要

Step 4で作成したデータベーススキーマをSupabaseに反映させる手順です。

## 作成されたテーブル

### マスターデータ
1. **regions** - 地域（9地域）
2. **prefectures** - 都道府県（38都道府県）
3. **seasons** - シーズン（年度管理）

### コアデータ
4. **teams** - チーム情報
5. **players** - 選手情報（デジタル選手証）
6. **matches** - 試合情報
7. **match_events** - 試合イベント（得点、警告など）

### 集計データ
8. **team_standings** - チーム順位表
9. **player_stats** - 選手個人成績

---

## 実行手順

### 1. Supabase SQL Editorを開く

1. Supabase Dashboard（https://supabase.com/dashboard）にアクセス
2. プロジェクト `u11-premier-pwa` を開く
3. 左サイドバーから「SQL Editor」をクリック
4. 「New query」をクリック

### 2. マイグレーションSQLを実行

1. プロジェクト内の以下のファイルを開く：
   ```
   supabase/migrations/complete_migration.sql
   ```

2. ファイルの内容を全てコピー

3. SQL Editorに貼り付け

4. **「Run」ボタンをクリック**

5. 実行結果を確認
   - エラーが出なければ成功
   - 「Success」メッセージが表示されることを確認

### 3. テーブル作成の確認

1. 左サイドバーから「Table Editor」をクリック

2. 以下のテーブルが作成されていることを確認：
   - ✅ regions（9行のデータ）
   - ✅ prefectures（38行のデータ）
   - ✅ teams（6チームのサンプルデータ）
   - ✅ players（3選手のサンプルデータ）
   - ✅ seasons（2シーズンのデータ）
   - ✅ matches（空）
   - ✅ match_events（空）
   - ✅ team_standings（空）
   - ✅ player_stats（空）

### 4. データ確認

#### 地域データの確認
1. Table Editor で「regions」テーブルを開く
2. 9地域が登録されていることを確認：
   - 北海道
   - 東北
   - 関東
   - 北陸・信越
   - 東海
   - 関西
   - 中国
   - 四国
   - 九州・沖縄

#### 都道府県データの確認
1. Table Editor で「prefectures」テーブルを開く
2. 38都道府県が登録されていることを確認

#### サンプルチームの確認
1. Table Editor で「teams」テーブルを開く
2. 以下のチームが登録されていることを確認：
   - バディーSC（東京都）
   - FC東京U-12（東京都）
   - 横浜F・マリノスプライマリー（神奈川県）
   - 川崎フロンターレU-12（神奈川県）
   - セレッソ大阪U-12（大阪府）
   - ガンバ大阪ジュニア（大阪府）

---

## トラブルシューティング

### エラー: "function public.is_admin() does not exist"
- ヘルパー関数が先に作成されていない
- `000_helper_functions.sql` が先に実行されているか確認
- `complete_migration.sql` を使用している場合は問題なし

### エラー: "relation public.users does not exist"
- usersテーブルが作成されていない
- `SUPABASE_SETUP.md` の手順を先に実行してください

### エラー: "duplicate key value violates unique constraint"
- データが既に存在している
- 同じマイグレーションを2回実行しようとしている
- Table Editorで既存データを削除するか、`ON CONFLICT` 句により無視される

---

## 次のステップ

マイグレーション完了後：

1. ✅ TypeScript型定義の生成
2. ✅ APIクライアントの実装
3. ✅ 基本機能の実装開始
   - デジタル選手証表示
   - チーム一覧
   - 試合速報入力

---

## 参考情報

### 実際のプレミアリーグU-11データ
- 公式サイト: https://pl11.jp/2025-2026
- 地域構造: 9地域 x 38都道府県
- 参加規模: 約630チーム、11,000人の選手
- 2025年優勝チーム: バディーSC

### RLSポリシー
全テーブルにRow Level Securityが有効化されています：

- **SELECT（閲覧）**: 全ユーザー可能
- **INSERT（作成）**: コーチ・管理者のみ
- **UPDATE（更新）**: コーチ・管理者のみ
- **DELETE（削除）**: 管理者のみ
