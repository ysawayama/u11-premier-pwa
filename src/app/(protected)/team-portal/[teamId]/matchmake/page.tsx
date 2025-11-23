'use client';

/**
 * チームポータル - マッチメイクページ
 * TODO: 練習試合の募集・応募機能
 */
export default function MatchmakePage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">マッチメイク</h2>

      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="text-6xl mb-4">🤝</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">マッチメイク機能</h3>
        <p className="text-gray-600 mb-4">
          練習試合の相手を探せます
        </p>
        <ul className="text-sm text-gray-500 space-y-1">
          <li>練習試合の募集</li>
          <li>募集中のチームを検索</li>
          <li>マッチング・日程調整</li>
        </ul>
        <p className="mt-6 text-sm text-blue-600">Coming Soon...</p>
      </div>
    </div>
  );
}
