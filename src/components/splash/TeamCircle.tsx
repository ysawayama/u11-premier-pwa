'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

type Team = {
  id: string;
  name: string;
  logo_url: string | null;
};

type TeamCircleProps = {
  teams: Team[];
  myTeam: Team | null;
  phase: 'hidden' | 'appear' | 'rotate' | 'highlight' | 'fade';
};

/**
 * チームロゴ円形配置コンポーネント
 * 11チームを360度等間隔で配置し、回転・ハイライト演出を行う
 */
export default function TeamCircle({ teams, myTeam, phase }: TeamCircleProps) {
  // スタガー用のランダム遅延を生成（マウント時に固定）
  const staggerDelays = useMemo(() => {
    return teams.map(() => Math.random() * 0.08);
  }, [teams.length]);

  // 円形配置の計算
  const getCirclePosition = (index: number, total: number) => {
    const angleDeg = (360 / total) * index - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const radius = 38;
    const x = Math.cos(angleRad) * radius;
    const y = Math.sin(angleRad) * radius;
    return { x, y };
  };

  // 回転角度
  const rotationDeg = phase === 'rotate' || phase === 'highlight' || phase === 'fade' ? 10 : 0;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <motion.div
        className="relative"
        style={{ width: '76vw', height: '76vw', maxWidth: '380px', maxHeight: '380px' }}
        animate={{ rotate: rotationDeg }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
      >
        {teams.map((team, index) => {
          const pos = getCirclePosition(index, teams.length);
          const isMyTeam = team.id === myTeam?.id;
          const isHighlightPhase = phase === 'highlight' || phase === 'fade';
          const shouldDim = isHighlightPhase && !isMyTeam;
          const shouldHighlight = isHighlightPhase && isMyTeam;

          return (
            <motion.div
              key={team.id}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
              }}
              initial={{
                opacity: 0,
                scale: 0.7,
                x: `calc(-50% + ${pos.x}vw)`,
                y: `calc(-50% + ${pos.y}vw)`,
              }}
              animate={{
                opacity: phase === 'hidden' ? 0 : shouldDim ? 0.3 : 1,
                scale: phase === 'hidden' ? 0.7 : shouldDim ? 0.8 : shouldHighlight ? 1.2 : 1,
                x: shouldHighlight ? '-50%' : `calc(-50% + ${pos.x}vw)`,
                y: shouldHighlight ? '-50%' : `calc(-50% + ${pos.y}vw)`,
              }}
              transition={{
                opacity: { duration: 0.3, delay: phase === 'appear' ? staggerDelays[index] : 0 },
                scale: { duration: 0.4, ease: 'easeOut' },
                x: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
                y: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
              }}
            >
              {/* ロゴバッジ - 白背景で視認性確保 */}
              <motion.div
                className="relative flex items-center justify-center rounded-full"
                style={{
                  width: isMyTeam ? '76px' : '68px',
                  height: isMyTeam ? '76px' : '68px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: shouldHighlight
                    ? '3px solid rgba(255, 215, 0, 1)'
                    : '1px solid rgba(200, 210, 230, 0.6)',
                  boxShadow: shouldHighlight
                    ? '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4)'
                    : '0 4px 16px rgba(0, 0, 0, 0.3), 0 0 20px rgba(79, 217, 255, 0.15)',
                }}
                animate={{
                  rotate: -rotationDeg,
                }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                {team.logo_url ? (
                  <Image
                    src={team.logo_url}
                    alt={team.name}
                    width={52}
                    height={52}
                    className="w-[44px] h-[44px] object-contain"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {team.name.charAt(0)}
                  </div>
                )}

                {/* ハイライト時のグローリング */}
                {shouldHighlight && (
                  <motion.div
                    className="absolute inset-[-8px] rounded-full"
                    style={{
                      border: '3px solid rgba(255, 215, 0, 0.8)',
                      boxShadow: '0 0 30px rgba(255, 215, 0, 0.7), 0 0 60px rgba(255, 215, 0, 0.4)',
                    }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: [0.6, 1, 0.6],
                      scale: [0.97, 1.03, 0.97],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </motion.div>

              {/* 自チーム名テキスト */}
              {shouldHighlight && phase === 'highlight' && (
                <motion.p
                  className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm font-bold tracking-wide"
                  style={{
                    color: '#FFD54F',
                    textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
                  }}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.35 }}
                >
                  {team.name}
                </motion.p>
              )}
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
