'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /league → /standings へリダイレクト
 */
export default function LeaguePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/standings');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-page)' }}>
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>リダイレクト中...</p>
      </div>
    </div>
  );
}
