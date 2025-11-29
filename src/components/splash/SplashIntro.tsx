'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';

type SplashIntroProps = {
  /** スプラッシュ完了時のコールバック */
  onFinished?: () => void;
};

type Team = {
  id: string;
  name: string;
  logo_url: string | null;
  short_name: string | null;
};

// チームロゴの位置データ（円形配置用）
const TEAM_POSITIONS = [
  { angle: 0 },
  { angle: 36 },
  { angle: 72 },
  { angle: 108 },
  { angle: 144 },
  { angle: 180 },
  { angle: 216 },
  { angle: 252 },
  { angle: 288 },
  { angle: 324 },
];

/**
 * U-11 PREMIER LEAGUE スプラッシュ画面
 * ユーザーの所属チームロゴ → リーグロゴへの遷移演出
 */
export default function SplashIntro({ onFinished }: SplashIntroProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [phase, setPhase] = useState<'loading' | 'myTeam' | 'transition' | 'leagueLogo' | 'fadeOut'>('loading');
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // ユーザーの所属チームとリーグチームを取得
    const fetchData = async () => {
      // 全チーム取得
      const { data: teamsData } = await supabase
        .from('teams')
        .select('id, name, logo_url, short_name')
        .eq('is_active', true)
        .limit(10);
      if (teamsData) setTeams(teamsData);

      // ログインユーザーの所属チームを取得
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: playerData } = await supabase
          .from('players')
          .select('team:teams(id, name, logo_url, short_name)')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .limit(1)
          .single();

        if (playerData?.team) {
          // teamがオブジェクトの場合の型アサーション
          const teamData = playerData.team as unknown as Team;
          setMyTeam(teamData);
        }
      }
    };
    fetchData();

    // タイムライン:
    // loading(300ms) -> myTeam(1200ms) -> transition(800ms) -> leagueLogo(1500ms) -> fadeOut(500ms)
    const timer1 = setTimeout(() => setPhase('myTeam'), 300);
    const timer2 = setTimeout(() => setPhase('transition'), 1500);
    const timer3 = setTimeout(() => setPhase('leagueLogo'), 2300);
    const timer4 = setTimeout(() => setPhase('fadeOut'), 3800);
    const timer5 = setTimeout(() => {
      setIsVisible(false);
      onFinished?.();
    }, 4300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onFinished]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-500 ${
        phase === 'fadeOut' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* 背景グラデーション - NEO FUTURE STADIUM */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(165deg, #051530 0%, #0a2045 30%, #0d3060 60%, #051530 100%)',
        }}
      />

      {/* スタジアムライト風グロー */}
      <div
        className="absolute -top-20 left-1/2 -translate-x-1/2 w-[150%] h-[40%]"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(79, 217, 255, 0.2) 0%, transparent 70%)',
        }}
      />

      {/* ===== Phase 1: 所属チームロゴ（中央に大きく） ===== */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`transition-all duration-700 ${
            phase === 'myTeam'
              ? 'opacity-100 scale-100'
              : phase === 'transition'
              ? 'opacity-0 scale-50'
              : 'opacity-0 scale-90'
          }`}
        >
          <div className="bg-white rounded-3xl p-8 shadow-2xl">
            {myTeam?.logo_url ? (
              <Image
                src={myTeam.logo_url}
                alt={myTeam.name}
                width={160}
                height={160}
                className="w-40 h-40 object-contain"
                priority
              />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center">
                <span className="text-5xl font-bold text-navy">
                  {myTeam?.short_name?.[0] || myTeam?.name?.[0] || 'U11'}
                </span>
              </div>
            )}
          </div>
          {myTeam && (
            <p className="text-white/90 text-center mt-4 text-lg font-bold tracking-wide">
              {myTeam.name}
            </p>
          )}
        </div>
      </div>

      {/* ===== Phase 2-3: 回転するチームロゴ円 ===== */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`relative w-[320px] h-[320px] transition-all duration-1000 ${
            phase === 'transition' || phase === 'leagueLogo'
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-90'
          }`}
          style={{
            animation: phase === 'leagueLogo' ? 'spin 20s linear infinite' : 'none',
          }}
        >
          {teams.slice(0, 10).map((team, index) => {
            const pos = TEAM_POSITIONS[index] || { angle: 0 };
            const radius = 130;
            const x = Math.cos((pos.angle - 90) * Math.PI / 180) * radius;
            const y = Math.sin((pos.angle - 90) * Math.PI / 180) * radius;
            const isMyTeam = myTeam && team.id === myTeam.id;

            return (
              <div
                key={team.id}
                className={`absolute w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden transition-all duration-500 ${
                  isMyTeam ? 'ring-2 ring-orange-400 ring-offset-2 ring-offset-transparent' : ''
                }`}
                style={{
                  left: `calc(50% + ${x}px - 24px)`,
                  top: `calc(50% + ${y}px - 24px)`,
                  opacity: phase === 'transition' || phase === 'leagueLogo' ? 1 : 0,
                  transform: `scale(${phase === 'transition' || phase === 'leagueLogo' ? 1 : 0})`,
                  transitionDelay: `${index * 50}ms`,
                }}
              >
                {team.logo_url ? (
                  <Image
                    src={team.logo_url}
                    alt={team.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-xs font-bold text-navy">
                    {team.short_name?.[0] || team.name[0]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== Phase 3: リーグロゴ（センター） ===== */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`transition-all duration-700 ${
            phase === 'leagueLogo'
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-90'
          }`}
        >
          <div className="bg-white/95 rounded-3xl px-8 py-6 shadow-2xl backdrop-blur-sm">
            <Image
              src="/images/u11-premier-logo-wide.png"
              alt="U-11 Premier League"
              width={280}
              height={100}
              className="w-[260px] h-auto object-contain"
              priority
            />
          </div>

          {/* サブテキスト */}
          <p className="text-white/70 text-center mt-6 text-sm font-medium tracking-wider">
            デジタル選手証と試合速報
          </p>
        </div>
      </div>

      {/* 粒子 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-particle-float"
            style={{
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              left: `${5 + (i * 5)}%`,
              top: `${10 + (i * 4) % 70}%`,
              background: i % 4 === 0
                ? 'rgba(79, 217, 255, 0.6)'
                : 'rgba(255, 255, 255, 0.4)',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      {/* 下部にローディングインジケーター */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center">
        <div
          className={`flex gap-1 transition-opacity duration-300 ${
            phase === 'loading' || phase === 'myTeam' ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white/50 animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
