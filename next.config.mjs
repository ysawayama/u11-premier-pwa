import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  // 開発環境ではService Workerを無効化（デバッグしやすくするため）
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,

  // Workboxの設定
  workboxOptions: {
    disableDevLogs: true,

    // キャッシュ戦略（要件：常時オンライン前提、軽量なキャッシュ）
    runtimeCaching: [
      {
        // 画像のキャッシュ（Supabase Storageなど）
        urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'images-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7日間
          },
        },
      },
      {
        // API呼び出し（短時間キャッシュでリアルタイム性確保）
        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 5 * 60, // 5分
          },
        },
      },
      {
        // その他のAPIリクエスト
        urlPattern: /^https:\/\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'external-cache',
          networkTimeoutSeconds: 10,
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA設定
  reactStrictMode: true,

  // Turbopack設定（Next.js 16でPWAプラグインとの競合を回避）
  turbopack: {},

  // 画像最適化設定（Supabase Storageのドメインを許可）
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
};

export default withPWA(nextConfig);
