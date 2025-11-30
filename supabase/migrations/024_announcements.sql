-- ============================================
-- お知らせ（Announcements）テーブル
-- ============================================

-- 1. お知らせテーブル作成
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  published_at DATE NOT NULL DEFAULT CURRENT_DATE,
  image_url TEXT,
  is_published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_published ON public.announcements(is_published, published_at DESC);

-- 2. RLSポリシー
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 誰でも公開されたお知らせを閲覧可能
CREATE POLICY "Anyone can view published announcements"
  ON public.announcements FOR SELECT
  USING (is_published = true OR public.is_webmaster());

-- Webマスターのみ作成・編集・削除可能
CREATE POLICY "Webmaster can manage announcements"
  ON public.announcements FOR ALL
  USING (public.is_webmaster());

-- 3. updated_at自動更新トリガー
CREATE TRIGGER set_updated_at_announcements
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. サンプルデータ挿入
INSERT INTO public.announcements (title, content, published_at) VALUES
(
  '取材動画公開のお知らせ：YouTubeチャンネル「小澤一郎 Periodista」',
  E'この度、YouTubeチャンネル「小澤一郎 Periodista」にチャンピオンシップ2025を取材をしていただきました。\n\n本日、その動画2本が公開されましたのでお知らせいたします。\n\nぜひご覧ください。\n\n▼ 動画はこちらからご覧いただけます\n\nプレミアリーグU-11 チャンピオンシップ2025取材レポート\nhttps://www.youtube.com/watch?v=seFQT6sGIT4\n\n幸野健一 実行委員長インタビュー\nhttps://www.youtube.com/watch?v=PCdVBkmsEZs',
  '2025-10-08'
),
(
  'ダイジェスト動画公開のお知らせ：アイリスオーヤマ第10回プレミアリーグU-11チャンピオンシップ2025',
  E'2025年7月30日(水)・31日(木)・ 8月1日(金)の3日間、宮城県女川町で開催された「アイリスオーヤマ第10回プレミアリーグU-11チャンピオンシップ2025」の大会ダイジェスト動画を公開しましたのでお知らせいたします。\n\nぜひご覧ください。\nhttps://www.youtube.com/watch?v=Sg5iwG3nB3w&t=3s',
  '2025-09-01'
),
(
  'バディーSCが大会2連覇！第10回記念大会を制す！',
  E'8月1日(金)に「アイリスオーヤマ第10回プレミアリーグU-11チャンピオンシップ2025」の決勝戦がWACK女川スタジアムで行われ、神奈川県のバディーSCが千葉県のWings U-12と対戦、バディーSCが見事優勝、大会2連覇を飾りました。\n\n大会結果\n\n優　勝　バディーSC（神奈川県）\n準優勝　Wings U-12（千葉県）\n第３位　鹿島アントラーズつくばジュニア（茨城県）、川崎フロンターレU-12（神奈川県）\n\n個人表彰\n最優秀選手賞　吉田　岳巨（バディーSC）\n得点王　　　　一ノ瀬　駿寿（Wings U-12）\nベストＧＫ賞　鈴木　蒼大（バディーSC）\n\n決勝トーナメント\nhttps://pl11.jp/cs/final_round_2025\n\n交流戦\nhttps://pl11.jp/cs/2nd_round_2025',
  '2025-08-01'
),
(
  '1次ラウンドが終了 アイリスオーヤマ第10回プレミアリーグU-11チャンピオンシップ2025',
  E'本日、7月31日(木)に1次ラウンドを試合を実施いたしました。明日は、決勝トーナメントおよび交流戦を行います。決勝戦は女川スタジアムにて11:30キックオフ予定、ライブ配信を行います。\n\nライブ配信ページはこちら\nhttps://onagawasports.nttsportict.co.jp/\n\n大会経過\n決勝トーナメント\nhttps://pl11.jp/cs/final_round_2025\n\n交流戦\nhttps://pl11.jp/cs/2nd_round_2025\n\n得点ランキング\nhttps://pl11.jp/cs/ranking_2025',
  '2025-07-31'
),
(
  '【試合スケジュール変更のお知らせ】アイリスオーヤマ第10回プレミアリーグU-11チャンピオンシップ2025',
  E'カムチャツカ半島付近の地震による津波警報発令により、本日の1次ラウンドは第1試合の第2ピリオドまでを実施した時点で中断、以降再開の目処が立たず、中止といたしました。\n\n明日、7月31日(木)の試合に関しましては、津波警報が解除された場合、予定を変更して、試合を実施いたします。\n\n1次ラウンドの試合時間は10分3ピリオドにて実施します。\n本日7月30日(水)に中断となった第1試合の3ピリオド目は10分で実施します。\n1次ラウンドの1位の中で上位8チームが決勝ラウンドに進出とします。\n決勝ラウンドは上位8チームで15分3ピリオドで実施します。\n\n変更となった試合予定に関しましては、下記ページをご確認くださいますようお願い申し上げます。\n\n今後、追加や変更が生じた場合、都度更新いたします。\n\n＞＞日程・結果\nhttps://pl11.jp/cs/schedule_result_2025',
  '2025-07-30'
),
(
  '「アイリスオーヤマ プレミアリーグU-11」設立10周年 国内最大規模のジュニアサッカーリーグが新たな飛躍へ',
  E'ジュニア年代における国内最大規模のサッカー年間リーグ「アイリスオーヤマ プレミアリーグU-11」を主催・運営するプレミアリーグU-11実行委員会（委員長：幸野健一）は、本リーグが今年で設立10周年を迎えることをお知らせいたします。\n\n「アイリスオーヤマ プレミアリーグU-11」は、未来を担うU-11世代の選手たちが年間を通じて質の高いリーグ戦を経験できる場を提供することを目的に、2015年に設立されました。以来、選手たちの育成と競技力向上に大きく貢献し、数々の才能ある若手選手を輩出してまいりました。\n\n設立当初から着実に規模を拡大し、2025年シーズンには全国38都道府県でリーグが開催され、約630チーム、約11,000人の選手が熱戦を繰り広げるまでに成長しました。',
  '2025-07-29'
),
(
  '10回目の節目 「アイリスオーヤマ第10回プレミアリーグU-11チャンピオンシップ2025」を開催',
  E'2025年7月30日(水)・31日(木)・ 8月1日(金)の3日間、宮城県女川町にて、全国36都府県の代表が一同に集う「アイリスオーヤマ第10回プレミアリーグU-11チャンピオンシップ2025」を開催いたします。\n\n本大会としては10回目、また開催地女川町の町制100年目の節目となる大会となり、女川町政100年目記念枠として地元のコバルトーレ女川・石巻ジュニアも出場いたします。\n\n今年も震災の教訓を後世に語り継ぐ取り組みとして、全参加チームに震災学習プログラムを実施、また、商店街に設置される「エイドステーション」では、地域との交流機会として、蒲鉾・ホタテなどの地場産品が選手たちに振る舞われます。\n\n決勝戦は8月1日(金)11時30分からのWACK女川スタジアムで実施されます。\n\n＞＞大会公式ページはこちら\nhttps://pl11.jp/cs/',
  '2025-07-14'
),
(
  '記事掲載のお知らせ：6月26日 朝日新聞',
  E'2025年(令和7年)6月26日(木)付の朝日新聞 朝刊に「プレミアリーグU-11」の記事が掲載されました。\nぜひご一読ください。\n\nオンライン（＊有料記事）\nhttps://www.asahi.com/articles/AST5L251TT5LUTQP01RM.html',
  '2025-06-26'
),
(
  'なかのFCが無敗で優勝し、チャンピオンシップ出場権を獲得！東北大会2025',
  E'3月28日(金)から30日(日)の三日間、「アイリスオーヤマプレミアリーグU-11東北大会2025」が女川町総合運動公園にて開催されました。\n\n東北６県から計20チームが参加、決勝戦では宮城県のなかのFCとYUKI FOOTBALL ACADEMYが対戦し、なかのFCが初優勝を飾りました。\n\n優勝　なかのFC（宮城県第2位）\n準優勝　YUKI FOOTBALL ACADEMY（宮城県4位）\n第3位　RENUOVENS OGASA FC（岩手県2位）',
  '2025-03-31'
),
(
  '東北大会2025開催のお知らせ',
  E'2025年3月28日(金)から30日(日)の日程で、「アイリスオーヤマプレミアリーグU-11東北大会2025」を女川町総合運動公園にて開催いたします。\n\n大会情報はこちら\nhttps://pl11.jp/tohoku2025',
  '2025-03-28'
);

-- ============================================
-- 完了メッセージ
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'お知らせ（Announcements）テーブルのセットアップが完了しました';
  RAISE NOTICE 'サンプルデータ: 10件';
END $$;
