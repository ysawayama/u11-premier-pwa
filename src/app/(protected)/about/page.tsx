'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ExternalLink, Target, Eye, Zap, Calendar, Users } from 'lucide-react';

const mediaLinks = [
  {
    title: '「全員出場」が子どもたちの成長につながることを指導者たちも実感',
    source: 'サカイク',
    date: '2021/8/10',
    url: 'https://www.sakaiku.jp/column/thought/2021/015361.html',
  },
  {
    title: '同じ時間でもトレーニング効果が何倍も違う！カテゴリー分けされたリーグ戦がもたらす成長効果',
    source: 'サカイク',
    date: '2021/8/16',
    url: 'https://www.sakaiku.jp/column/thought/2021/015367.html',
  },
  {
    title: '全員出場の成果も！試合の強度UPのために導入した「３ピリオド制」とは',
    source: 'サカイク',
    date: '2019/5/8',
    url: 'https://www.sakaiku.jp/series/jfa_grassroots/2019/014075.html',
  },
  {
    title: '「補欠ゼロ」を謳いながらも出場時間にバラつきがあることも。全員同じだけプレーさせて強くなる',
    source: 'サカイク',
    date: '2019/4/18',
    url: 'https://www.sakaiku.jp/series/jfa_grassroots/2019/014051.html',
  },
  {
    title: 'なぜ「レギュラー」と「控え」ができるのか？"子どもたちの幸せを生む"育成環境を考える',
    source: 'ジュニアサッカーを応援しよう！',
    date: '2018/5/30',
    url: 'https://jr-soccer.jp/2018/05/30/post93781/',
  },
  {
    title: '「リーグ戦文化」を本気で定着させる！行動する指導者たちが挑む日本の育成課題',
    source: 'COACH UNITED',
    date: '2015/4/9',
    url: 'https://coachunited.jp/column/000407.html',
  },
];

const history = [
  { year: '2015年', content: '７都県でプレミアリーグU-11がスタート' },
  { year: '2018年', content: '３ピリオド制、オフサイドゾーンの導入' },
  { year: '2019年', content: 'アイリスオーヤマ株式会社がチャンピオンシップの協賛企業となる' },
  { year: '2022年', content: 'アンバサダーに佐藤勇人氏と佐藤寿人氏が就任' },
  { year: '2022年', content: '東北初の全国大会、チャンピオンシップを開催' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-gradient-to-r from-navy-light to-navy text-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-lg font-bold">リーグ概要</h1>
              <p className="text-xs text-white/70">アイリスオーヤマ プレミアリーグU-11</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* ミッション・ビジョン・アクション */}
        <section className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary-hover text-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target size={28} />
              <h2 className="text-xl font-bold">ミッション</h2>
            </div>
            <p className="text-lg font-medium mb-2">豊かなサッカー文化を日本中に広める</p>
            <p className="text-white/80">少年サッカーに関わる人を幸せにする環境づくり</p>
          </div>

          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-3">
              <Eye size={24} className="text-primary" />
              <h3 className="text-lg font-bold">ビジョン</h3>
            </div>
            <p className="text-gray-700">参加チームの価値向上に繋がるリーグ</p>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Zap size={24} className="text-primary" />
              <h3 className="text-lg font-bold">アクション</h3>
            </div>
            <p className="text-gray-700 font-medium mb-2">ソフト面のソリューション</p>
            <ul className="text-gray-600 space-y-1 text-sm">
              <li>• 年間リーグ戦の普及と整備</li>
              <li>• 選手育成のためにプレー機会を確保する3ピリオド制</li>
            </ul>
          </div>
        </section>

        {/* 設立趣意 */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            設立趣意
          </h2>
          <p className="text-gray-700 leading-relaxed">
            U-11年代のサッカーにおいて、より高いレベルを目指す選手や指導者たちが、1シーズンを通じて真剣勝負が出来る舞台として、本リーグを整備し、互いに切磋琢磨できる環境を作る。
          </p>
        </section>

        {/* リーグ概要 */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            リーグ概要
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            原則、ホーム＆アウェイの2回戦総当たりで行う。各都県でリーグを行い、リーグ終了後に上位チームが集うチャンピオンシップを開催する。
          </p>

          <h3 className="font-bold text-gray-900 mb-3">特色</h3>
          <p className="text-sm text-gray-600 mb-3">
            下記4点を本リーグが掲げる特色とし、共通のものとして実施する（*特別区域を除く）。
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="font-bold text-primary text-sm">３ピリオド制</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="font-bold text-primary text-sm">最低12名が出場</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="font-bold text-primary text-sm">オフサイドライン設定</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="font-bold text-primary text-sm">2回戦総当たり</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            *特別区域：47FAによるU-11年代の年間リーグが整備されている都道府県を特別区域とし、競技規則の設定について裁量を持たせることとする。
          </p>
        </section>

        {/* 沿革 */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-primary" />
            沿革
          </h2>
          <div className="space-y-4">
            {history.map((item, index) => (
              <div key={index} className="flex gap-4">
                <span className="text-sm font-bold text-primary whitespace-nowrap">{item.year}</span>
                <span className="text-sm text-gray-700">{item.content}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 実行委員会 */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Users size={20} className="text-primary" />
            プレミアリーグU-11実行委員会
          </h2>
          <p className="text-gray-700 mb-4">委員長：幸野 健一</p>

          <h3 className="font-bold text-gray-900 mb-3">アンバサダー</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="font-bold text-gray-900">佐藤 勇人</p>
              <p className="text-xs text-gray-500">元サッカー日本代表</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="font-bold text-gray-900">佐藤 寿人</p>
              <p className="text-xs text-gray-500">元サッカー日本代表</p>
            </div>
          </div>
        </section>

        {/* メディア掲載 */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-primary rounded-full"></div>
            メディア掲載
          </h2>
          <div className="space-y-3">
            {mediaLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">{link.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{link.source}（{link.date}）</p>
                  </div>
                  <ExternalLink size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* 公式リンク */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold mb-4">公式リンク</h2>
          <div className="space-y-3">
            <a
              href="https://pl11.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              <span className="font-medium">公式ホームページ</span>
              <ExternalLink size={18} />
            </a>
            <a
              href="https://www.youtube.com/@pl11"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <span className="font-medium">YouTube チャンネル</span>
              <ExternalLink size={18} />
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
