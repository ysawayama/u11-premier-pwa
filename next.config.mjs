/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ビルド時のESLintエラーを無視
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScriptエラーを無視（一時的）
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },

};

export default nextConfig;
