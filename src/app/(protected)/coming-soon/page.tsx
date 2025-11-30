'use client';

import Link from 'next/link';
import { ArrowLeft, Construction } from 'lucide-react';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-bold">準備中</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6">
            <Construction size={48} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
          <p className="text-gray-600 mb-8">
            このページは現在準備中です。<br />
            今しばらくお待ちください。
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-hover transition-colors"
          >
            <ArrowLeft size={18} />
            ダッシュボードに戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
