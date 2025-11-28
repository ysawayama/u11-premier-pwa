import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClientLayoutWrapper } from "@/components/layouts/ClientLayoutWrapper";

// 動的レンダリングを強制してプリレンダリングを無効化
export const dynamic = 'force-dynamic';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "U-11プレミアリーグ",
  description: "U-11プレミアリーグ公式アプリ - デジタル選手証と試合速報",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "U-11PL",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1e40af",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${inter.variable} antialiased`}
      >
        {children}
        <ClientLayoutWrapper />
      </body>
    </html>
  );
}
