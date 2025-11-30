'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '@/lib/stores/authStore';
import { createClient } from '@/lib/supabase/client';
import type { Team, Player } from '@/types/database';

const MY_TEAM_NAME = '大豆戸FC';

export default function PlayerCardPage() {
  const { user } = useAuthStore();
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      try {
        // チーム情報を取得
        const { data: teamData } = await supabase
          .from('teams')
          .select('*')
          .eq('name', MY_TEAM_NAME)
          .single();

        if (teamData) {
          setMyTeam(teamData);
        }

        // ログインユーザーに紐づくプレイヤー情報を取得
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: playerData } = await supabase
            .from('players')
            .select('*')
            .eq('user_id', authUser.id)
            .single();

          if (playerData) setMyPlayer(playerData as Player);
        }
      } catch (error) {
        console.error('Error fetching player data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // ポジション表示名
  const getPositionLabel = (position: string | null) => {
    if (!position) return '-';
    const positionMap: Record<string, string> = {
      'GK': 'GK',
      'DF': 'DF',
      'MF': 'MF',
      'FW': 'FW',
    };
    return positionMap[position] || position;
  };

  // 生年月日フォーマット
  const formatBirthDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  // 現在のシーズンを計算
  const getCurrentSeason = () => {
    const now = new Date();
    const year = now.getFullYear();
    // 4月始まりで計算
    if (now.getMonth() >= 3) {
      return `${year}`;
    }
    return `${year - 1}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-bold">デジタル選手証</h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* 選手証カード */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* 上部: リーグロゴ + タイトル */}
          <div className="bg-gradient-to-r from-primary to-navy p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-lg px-2 py-1">
                <Image
                  src="/images/u11-premier-logo-wide.png"
                  alt="U-11 Premier League"
                  width={80}
                  height={30}
                  className="h-6 w-auto object-contain"
                />
              </div>
              <div>
                <p className="text-white text-xs opacity-80">IRIS OHYAMA</p>
                <p className="text-white text-sm font-bold">Premier League U-11</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-[10px]">PLAYER</p>
              <p className="text-white text-lg font-bold">選手証</p>
            </div>
          </div>

          {/* メイン情報 */}
          <div className="p-4">
            {/* 上段: 顔写真 + 選手情報 */}
            <div className="flex gap-4">
              {/* 顔写真 */}
              <div className="flex-shrink-0">
                <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 flex items-center justify-center">
                  {myPlayer?.photo_url ? (
                    <Image
                      src={myPlayer.photo_url}
                      alt={myPlayer.name}
                      width={96}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <User size={40} />
                      <span className="text-[10px] mt-1">写真なし</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 選手情報 */}
              <div className="flex-1 min-w-0 space-y-1.5">
                {/* 氏名 */}
                <div>
                  <p className="text-[10px] text-gray-500">氏名</p>
                  <p className="text-base font-bold text-gray-900 truncate">
                    {myPlayer?.name || user?.full_name || 'ゲスト'}
                  </p>
                </div>

                {/* チーム名 */}
                <div>
                  <p className="text-[10px] text-gray-500">所属チーム</p>
                  <div className="flex items-center gap-1.5">
                    {myTeam?.logo_url && (
                      <div className="w-4 h-4 relative flex-shrink-0">
                        <Image
                          src={myTeam.logo_url}
                          alt={myTeam.name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <p className="text-sm font-medium text-gray-900 truncate">{myTeam?.name || '-'}</p>
                  </div>
                </div>

                {/* 背番号・ポジション */}
                <div className="flex gap-4">
                  <div>
                    <p className="text-[10px] text-gray-500">背番号</p>
                    <p className="text-xl font-bold text-primary">
                      {myPlayer?.uniform_number ? `#${myPlayer.uniform_number}` : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500">ポジション</p>
                    <p className="text-lg font-bold text-gray-900">
                      {getPositionLabel(myPlayer?.position || null)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 生年月日・登録シーズン */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 mb-0.5">生年月日</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatBirthDate(myPlayer?.birth_date || null)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 mb-0.5">登録シーズン</p>
                  <p className="text-sm font-medium text-gray-900">{getCurrentSeason()}年度</p>
                </div>
              </div>
            </div>

            {/* リーグ情報 + QRコード */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="mb-2">
                    <p className="text-[10px] text-gray-500 mb-0.5">所属リーグ</p>
                    <p className="text-sm font-medium text-gray-900">神奈川2部A</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5">登録ID</p>
                    <p className="text-xs font-mono text-gray-600">
                      {myPlayer?.id?.substring(0, 8).toUpperCase() || 'XXXXXXXX'}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
                    <QRCodeSVG
                      value={`https://pl11.jp/player/${myPlayer?.id || 'demo'}`}
                      size={56}
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-[8px] text-gray-400 mt-1">選手情報</p>
                </div>
              </div>
            </div>
          </div>

          {/* フッター */}
          <div
            className="px-5 py-3 text-center"
            style={{ backgroundColor: '#c41e3a' }}
          >
            <p className="text-white text-xs opacity-80">
              アイリスオーヤマ プレミアリーグ U-11
            </p>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-6 p-4 bg-white rounded-xl">
          <p className="text-xs text-gray-500 leading-relaxed">
            このデジタル選手証は、アイリスオーヤマ プレミアリーグU-11の登録選手であることを証明するものです。
            試合会場での本人確認にご利用いただけます。
          </p>
        </div>
      </main>
    </div>
  );
}
