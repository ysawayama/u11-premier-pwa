'use client';

import { useState } from 'react';

type TabType = 'highlights' | 'photos' | 'news';

// Placeholder data - will be replaced with actual data from database
const placeholderHighlights = [
  {
    id: '1',
    title: '大豆戸FC vs あざみ野FC ハイライト',
    thumbnail: null,
    duration: '3:24',
    views: 245,
    date: '2024-12-01',
  },
  {
    id: '2',
    title: '第5節 ベストゴール集',
    thumbnail: null,
    duration: '5:12',
    views: 512,
    date: '2024-11-28',
  },
  {
    id: '3',
    title: 'FC東海岸 vs TDFC 試合ダイジェスト',
    thumbnail: null,
    duration: '4:08',
    views: 189,
    date: '2024-11-25',
  },
];

const placeholderNews = [
  {
    id: '1',
    title: '2024シーズン前期日程が発表されました',
    excerpt: '神奈川2部Aの前期日程が正式に発表されました。開幕戦は4月6日...',
    date: '2024-03-15',
  },
  {
    id: '2',
    title: '新規参加チームのお知らせ',
    excerpt: '2024シーズンより新たに2チームがリーグに参加します...',
    date: '2024-03-01',
  },
  {
    id: '3',
    title: '大会規則の一部改定について',
    excerpt: '選手登録期限および出場資格に関する規則が一部改定されました...',
    date: '2024-02-20',
  },
];

export default function MediaPage() {
  const [activeTab, setActiveTab] = useState<TabType>('highlights');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'highlights', label: 'ハイライト' },
    { id: 'photos', label: 'フォト' },
    { id: 'news', label: 'ニュース' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      {/* Header - ネイビー */}
      <header
        className="sticky top-0 z-40"
        style={{ background: 'var(--bg-header)' }}
      >
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-white">
            メディア
          </h1>
          <p className="text-xs text-white/60">
            試合映像・写真・ニュース
          </p>
        </div>

        {/* Tabs */}
        <div className="flex px-4 gap-2 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                background: activeTab === tab.id ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
                color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.7)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4">
        {/* Highlights Tab */}
        {activeTab === 'highlights' && (
          <div className="space-y-4">
            {placeholderHighlights.map((video) => (
              <div key={video.id} className="card overflow-hidden">
                {/* Video Thumbnail */}
                <div
                  className="relative aspect-video flex items-center justify-center"
                  style={{ background: 'var(--bg-header)' }}
                >
                  {/* Play Button */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--color-accent)' }}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>

                  {/* Duration Badge */}
                  <span
                    className="absolute bottom-2 right-2 px-2 py-1 rounded text-xs font-medium"
                    style={{ background: 'rgba(0,0,0,0.8)', color: 'white' }}
                  >
                    {video.duration}
                  </span>
                </div>

                {/* Video Info */}
                <div className="p-3">
                  <h3
                    className="text-sm font-medium mb-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {video.title}
                  </h3>
                  <div
                    className="flex items-center gap-2 text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <span>{video.views} views</span>
                    <span>•</span>
                    <span>{video.date}</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Coming Soon Notice */}
            <div
              className="card p-6 text-center"
              style={{ border: '1px dashed var(--border-medium)' }}
            >
              <p
                className="text-sm mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                動画コンテンツは準備中です
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                シーズン開始後に試合ハイライトを配信予定
              </p>
            </div>
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="space-y-4">
            {/* Photo Grid Placeholder */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg"
                  style={{ background: 'var(--bg-section)' }}
                />
              ))}
            </div>

            {/* Coming Soon Notice */}
            <div
              className="card p-6 text-center"
              style={{ border: '1px dashed var(--border-medium)' }}
            >
              <p
                className="text-sm mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                フォトギャラリーは準備中です
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                試合写真・チーム写真を公開予定
              </p>
            </div>
          </div>
        )}

        {/* News Tab */}
        {activeTab === 'news' && (
          <div className="space-y-3">
            {placeholderNews.map((news) => (
              <div key={news.id} className="card p-4">
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                  {news.date}
                </p>
                <h3
                  className="text-sm font-medium mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {news.title}
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {news.excerpt}
                </p>
              </div>
            ))}

            {/* Coming Soon Notice */}
            <div
              className="card p-6 text-center"
              style={{ border: '1px dashed var(--border-medium)' }}
            >
              <p
                className="text-sm mb-2"
                style={{ color: 'var(--text-secondary)' }}
              >
                ニュース機能は準備中です
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                大会からのお知らせを配信予定
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
