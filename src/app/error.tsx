'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-light to-blue-50">
      <main className="text-center space-y-6 p-8 max-w-md">
        <div className="text-6xl">500</div>
        <h1 className="text-2xl font-bold text-gray-900">
          エラーが発生しました
        </h1>
        <p className="text-gray-600">
          申し訳ございません。予期せぬエラーが発生しました。
        </p>
        <button
          onClick={reset}
          className="inline-block px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg shadow-md transition-colors"
        >
          もう一度試す
        </button>
      </main>
    </div>
  );
}
