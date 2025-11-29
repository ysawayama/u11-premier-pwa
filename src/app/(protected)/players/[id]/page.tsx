'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import { getPlayerById } from '@/lib/api/players';
import type { PlayerWithTeam } from '@/types/database';

/**
 * 選手詳細ページ（デジタル選手証）
 */
export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const playerId = params.id as string;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [player, setPlayer] = useState<PlayerWithTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlayer();
  }, [playerId]);

  useEffect(() => {
    if (player && canvasRef.current) {
      generateQRCode();
    }
  }, [player]);

  const loadPlayer = async () => {
    try {
      setLoading(true);
      const data = await getPlayerById(playerId);
      setPlayer(data);
    } catch (err: any) {
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!player || !canvasRef.current) return;

    // QRコードデータ（選手証番号またはプレイヤーID）
    const qrData = player.player_card_number || player.id;

    try {
      await QRCode.toCanvas(canvasRef.current, qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#1e40af', // 青色
          light: '#ffffff',
        },
      });
    } catch (err) {
      console.error('QRコード生成エラー:', err);
    }
  };

  // 年齢計算
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || '選手が見つかりません'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  const age = calculateAge(player.date_of_birth);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-blue-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-4 text-sm text-primary">
            <Link href="/players" className="hover:text-primary-hover">
              ← 選手一覧
            </Link>
            <Link
              href={`/teams/${player.team.id}`}
              className="hover:text-primary-hover"
            >
              チーム詳細
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* デジタル選手証カード */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* カードヘッダー */}
          <div className="bg-gradient-to-r from-navy-light to-navy text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">U-11プレミアリーグ</p>
                <h1 className="text-2xl font-bold mt-1">デジタル選手証</h1>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">背番号</p>
                <p className="text-4xl font-bold">
                  {player.uniform_number || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* カードボディ */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 左側：選手情報 */}
              <div className="space-y-6">
                {/* 選手名 */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {player.family_name} {player.given_name}
                  </h2>
                  <p className="text-lg text-gray-600">
                    {player.family_name_kana} {player.given_name_kana}
                  </p>
                </div>

                {/* 基本情報 */}
                <dl className="space-y-4">
                  <div className="flex items-center gap-4">
                    <dt className="text-sm font-medium text-gray-600 w-24">
                      所属チーム
                    </dt>
                    <dd className="text-sm text-gray-900 font-medium">
                      <Link
                        href={`/teams/${player.team.id}`}
                        className="text-primary hover:text-primary-hover hover:underline"
                      >
                        {player.team.name}
                      </Link>
                    </dd>
                  </div>

                  {player.position && (
                    <div className="flex items-center gap-4">
                      <dt className="text-sm font-medium text-gray-600 w-24">
                        ポジション
                      </dt>
                      <dd>
                        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {player.position}
                        </span>
                      </dd>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <dt className="text-sm font-medium text-gray-600 w-24">
                      学年
                    </dt>
                    <dd className="text-sm text-gray-900 font-medium">
                      {player.grade}年生
                    </dd>
                  </div>

                  <div className="flex items-center gap-4">
                    <dt className="text-sm font-medium text-gray-600 w-24">
                      生年月日
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(player.date_of_birth).toLocaleDateString(
                        'ja-JP',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )}
                      <span className="ml-2 text-gray-600">({age}歳)</span>
                    </dd>
                  </div>

                  {player.player_card_number && (
                    <div className="flex items-center gap-4">
                      <dt className="text-sm font-medium text-gray-600 w-24">
                        選手証番号
                      </dt>
                      <dd className="text-sm font-mono text-gray-900">
                        {player.player_card_number}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* 右側：QRコード */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <canvas ref={canvasRef} />
                </div>
                <p className="mt-4 text-sm text-gray-600 text-center">
                  この QR コードで選手証を表示
                </p>
              </div>
            </div>

            {/* 有効期限 */}
            {player.card_expires_at && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">有効期限</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(player.card_expires_at).toLocaleDateString(
                      'ja-JP',
                      {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* 発行日 */}
            {player.card_issued_at && (
              <div className="mt-2 text-right text-xs text-gray-500">
                発行日:{' '}
                {new Date(player.card_issued_at).toLocaleDateString('ja-JP')}
              </div>
            )}
          </div>

          {/* カードフッター */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              このデジタル選手証は U-11 プレミアリーグ公式のものです
            </p>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="mt-6 flex gap-4 justify-center">
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-white text-primary border-2 border-primary rounded-lg hover:bg-blue-50 font-medium transition-colors"
          >
            印刷する
          </button>
        </div>
      </main>
    </div>
  );
}
