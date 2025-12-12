-- 得点ランキングテーブルを作成
-- Supabase Dashboard > SQL Editor で実行してください

-- 得点ランキングテーブル（シンプル版）
CREATE TABLE IF NOT EXISTS public.scoring_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  team_name TEXT NOT NULL,
  goals INT NOT NULL DEFAULT 0,
  rank INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS有効化
ALTER TABLE public.scoring_rankings ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが閲覧可能
CREATE POLICY "Anyone can view scoring_rankings"
  ON public.scoring_rankings
  FOR SELECT
  USING (true);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_scoring_rankings_season ON public.scoring_rankings(season_id);
CREATE INDEX IF NOT EXISTS idx_scoring_rankings_goals ON public.scoring_rankings(goals DESC);
CREATE INDEX IF NOT EXISTS idx_scoring_rankings_rank ON public.scoring_rankings(rank);

-- 現在のシーズンID: d0efd9f2-bca5-47dd-a70f-7b60f814a1dc

-- 得点ランキングデータを挿入
INSERT INTO scoring_rankings (season_id, player_name, team_name, goals, rank) VALUES
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '永井　悠策', 'ESFORCO F.C.', 41, 1),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '渋谷　祈真', 'FC.vinculo', 13, 2),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '宮前　耀多', '大豆戸FC', 12, 3),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '植木　寿真', 'あざみ野FC', 12, 3),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '村山　慶次', '黒滝SC', 11, 5),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '秋山　湊', '横浜ジュニオールSC', 11, 5),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '橋爪　理人', 'FC.vinculo', 10, 7),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '掛橋　颯', 'ESFORCO F.C.', 10, 7),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '藤井　悠翔', 'あざみ野FC', 10, 7),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '矢嶋　光駈', '大豆戸FC', 9, 10),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '安達　海音', '大豆戸FC', 8, 11),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '白岩　淳', 'ESFORCO F.C.', 8, 11),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '宇山　忠希', '横浜ジュニオールSC', 7, 13),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '奥田　至誠', '大豆戸FC', 7, 13),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '小田原　翔生', 'TDFC', 7, 13),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '酒井　悠翔', 'ESFORCO F.C.', 6, 16),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '小山　晴', 'SFAT ISEHARA SC', 6, 16),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '小野澤　由翔', '黒滝SC', 6, 16),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '吉田　歩音', 'TDFC', 6, 16),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '吉見　海翔', '大豆戸FC', 6, 16),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '慶田　海', 'あざみ野FC', 6, 16),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '音喜多　悠馬', 'あざみ野FC', 5, 22),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '星　奈々希', 'あざみ野FC', 5, 22),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '河村　陽里', 'あざみ野FC', 5, 22),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '大窪　蒼波', 'ESFORCO F.C.', 5, 22),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '阿部　紘人', '黒滝SC', 5, 22),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '辻　睦晨', 'あざみ野キッカーズ', 5, 22),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '和泉　朋樹', 'FC.vinculo', 5, 22),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '森田　朝日', 'FC.vinculo', 5, 22),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '石田　誠太郎', '横浜ジュニオールSC', 4, 30),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '栢沼　悠', 'PALAVRA FC', 4, 30),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '齋藤　駿弥', 'FC.vinculo', 4, 30),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '熊谷　輝', '黒滝SC', 4, 30),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '有馬　希一', 'あざみ野FC', 4, 30),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '伊澤　一晟', 'SFAT ISEHARA SC', 3, 35),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '落合　翔太', 'PALAVRA FC', 3, 35),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '佐藤　源仁', '黒滝SC', 3, 35),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '藤澤　楓馬', 'ESFORCO F.C.', 3, 35),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '黒須　拓哉', '大豆戸FC', 3, 35),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '鈴木　煌', 'あざみ野FC', 3, 35),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '木下　湊友', 'FC東海岸', 3, 35),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '中馬　鼓太朗', 'SFAT ISEHARA SC', 3, 35),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '阿部　聖那', 'ESFORCO F.C.', 3, 35),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '佐藤　瀬梛', 'あざみ野FC', 3, 35),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', 'コーイアン', 'ESFORCO F.C.', 3, 35),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '古園　颯亮', 'あざみ野FC', 3, 35),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '代蔵　涼真', '横浜ジュニオールSC', 3, 35),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '山﨑　颯真', 'TDFC', 2, 48),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '知場　蒼大', 'あざみ野キッカーズ', 2, 48),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '安藤　朝柊', 'SFAT ISEHARA SC', 2, 48),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '渡辺　利夢斗', 'FC.vinculo', 2, 48),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '松浦　元', 'TDFC', 2, 48),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '窪田　惺也', 'FC.vinculo', 2, 48),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '野津山　瞬太', '大豆戸FC', 2, 48),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '水野　駿', 'FC.vinculo', 2, 48),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', 'アジャ　愛絆', 'PALAVRA FC', 2, 48),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '稲生　薫', 'PALAVRA FC', 2, 48),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '橘内　理', '横浜ジュニオールSC', 2, 48),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '深澤　暖', 'PALAVRA FC', 2, 48),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '中根　亮介', '黒滝SC', 2, 48),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '河村　伊織', 'FC東海岸', 2, 48),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '雨宮　優凛', 'PALAVRA FC', 2, 48),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '大政　健一郎', 'あざみ野キッカーズ', 2, 48),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '山本　祐士', '大豆戸FC', 2, 48),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '佐藤　壮真', '大豆戸FC', 2, 48),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '伴　泰良', '大豆戸FC', 2, 48),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '佐久間　達也', '横浜ジュニオールSC', 2, 48),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '尾関　英斗', 'FC.vinculo', 2, 48),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '高良　政宗', 'SFAT ISEHARA SC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '沼田　彩寿', 'あざみ野キッカーズ', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '小堀　陽雪', 'あざみ野キッカーズ', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '渡邉　玄', 'TDFC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '檀浦　恭一郎', 'SFAT ISEHARA SC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '石塚　晴梛', 'TDFC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '小野　成士', '横浜ジュニオールSC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '植村　賢惺', 'ESFORCO F.C.', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '藤原　大志', '黒滝SC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '飯田　和真', 'あざみ野キッカーズ', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '池田　海翔', 'ESFORCO F.C.', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '村山　絢信', 'FC東海岸', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '伊東　光哉', 'FC.vinculo', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '舟田　快成', '横浜ジュニオールSC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '久保　夢翔', '黒滝SC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '吉川　日那太', 'あざみ野FC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '浦野　圭祐', 'TDFC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '楠本　涼馬', '大豆戸FC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '梅沢　裕', '黒滝SC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '櫻田　心優', '横浜ジュニオールSC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '緒形　陸央', 'TDFC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '金　抿賢', 'TDFC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '今井　旭', 'PALAVRA FC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '中澤　瑛太', 'あざみ野キッカーズ', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '木原　翔人', 'FC.vinculo', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '布山　隼誠', '大豆戸FC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '齋藤　和希', 'PALAVRA FC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '今関　倖太', 'PALAVRA FC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '武藤　篤月', 'あざみ野FC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '野原　悠利', 'あざみ野キッカーズ', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '松村　航志', '大豆戸FC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '森田　大地', '横浜ジュニオールSC', 1, 69),
('d0efd9f2-bca5-47dd-a70f-7b60f814a1dc', '黒澤　慶輝', 'FC東海岸', 1, 69);
