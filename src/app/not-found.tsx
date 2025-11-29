import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-light to-blue-50">
      <main className="text-center space-y-6 p-8 max-w-md">
        <div className="text-6xl">404</div>
        <h1 className="text-2xl font-bold text-gray-900">
          ページが見つかりません
        </h1>
        <p className="text-gray-600">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg shadow-md transition-colors"
        >
          ホームに戻る
        </Link>
      </main>
    </div>
  );
}
