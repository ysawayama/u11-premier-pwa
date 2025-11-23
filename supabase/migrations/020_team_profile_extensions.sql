-- ============================================
-- チームプロフィール拡張フィールド追加
-- 018で追加したフィールドに加えて、追加情報を管理
-- ============================================

-- teamsテーブルに追加フィールドを追加（018にないもの）
ALTER TABLE public.teams
ADD COLUMN IF NOT EXISTS representative_name TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS established_date DATE,
ADD COLUMN IF NOT EXISTS registration_status TEXT;

-- コメント追加
COMMENT ON COLUMN public.teams.representative_name IS '代表者名';
COMMENT ON COLUMN public.teams.address IS '所在地';
COMMENT ON COLUMN public.teams.established_date IS '設立日';
COMMENT ON COLUMN public.teams.registration_status IS '法人格（NPO法人、一般社団法人など）';

-- ============================================
-- RLSポリシーを更新（Admin以上もチーム更新可能に）
-- ============================================

-- 既存ポリシーを削除（018で作成されたもの）
DROP POLICY IF EXISTS "Team managers can update own team" ON public.teams;

-- 新しいポリシーを作成（管理者以上 OR チームマネージャー）
CREATE POLICY "Team managers and admins can update team"
  ON public.teams
  FOR UPDATE
  USING (
    public.is_admin_or_above()
    OR
    public.is_team_manager_of(id)
  )
  WITH CHECK (
    public.is_admin_or_above()
    OR
    public.is_team_manager_of(id)
  );

-- ============================================
-- 大豆戸FCのサンプルデータを更新
-- ============================================
UPDATE public.teams
SET
  hero_image_url = '/images/teams/mamedofc-hero.jpg',
  description = '大豆戸FCは、「一人ひとりが主役になれる環境をつくりたい」という想いから2004年に設立されました。

サッカーを通じて、子どもたちの成長をサポートし、地域に根ざしたクラブとして活動しています。勝利至上主義ではなく、選手一人ひとりの成長と、サッカーを楽しむことを大切にしています。

NPO法人として、サッカースクール、ジュニアチーム、ジュニアユースチームを運営し、幅広い年代の選手が活動しています。',
  concept = '【一人ひとりが主役】
すべての選手が主役になれる環境を目指しています。試合に出場する機会を大切にし、それぞれの成長をサポートします。

【いつでもどこでも誰とでも】
サッカーは仲間と一緒に楽しむスポーツ。年齢や性別、経験に関係なく、誰もがサッカーを楽しめる環境を提供します。

【やって楽しい観て楽しい】
プレーする楽しさだけでなく、観戦する楽しさも大切に。保護者や地域の方々も一緒に楽しめるクラブを目指しています。',
  philosophy = '生活者の日常生活を自分たちの存在により豊かにすることで、地域文化の向上に寄与する',
  representative_name = '末本 亮太',
  address = '神奈川県横浜市港北区大豆戸町951-2-104',
  established_date = '2004-04-01',
  registration_status = 'NPO法人',
  website_url = 'https://mamedofc.com/',
  sns_twitter = 'https://twitter.com/mamedofc',
  sns_instagram = 'https://www.instagram.com/mamedofc/',
  founded_year = 2004,
  home_ground = '大豆戸エリア'
WHERE name = '大豆戸FC';
