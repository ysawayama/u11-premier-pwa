'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import NeoFutureBackground from './NeoFutureBackground';
import IntroBall from './IntroBall';
import TeamCircle from './TeamCircle';
import LeagueLogo from './LeagueLogo';

type Team = {
  id: string;
  name: string;
  logo_url: string | null;
};

type SplashIntroProps = {
  /** スプラッシュ完了時のコールバック */
  onFinished?: () => void;
};

/**
 * U-11 PREMIER LEAGUE 扉ページ（スプラッシュ）
 * シネマティックでプロ品質の導入画面
 *
 * タイムライン（3.2秒）:
 * ① 0.0s - 1.2s: イントロ（発光サッカーボール）
 * ② 1.2s - 2.8s: チームロゴ円形配置アニメーション
 * ③ 2.8s - 3.2s: リーグロゴ表示 → フェードアウト
 */
export default function SplashIntro({ onFinished }: SplashIntroProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [phase, setPhase] = useState<
    'loading' | 'intro' | 'logos-appear' | 'logos-rotate' | 'logos-highlight' | 'league' | 'fadeOut'
  >('loading');

  // チームデータを取得
  useEffect(() => {
    async function fetchTeams() {
      const supabase = createClient();
      if (!supabase) return;

      const { data: teamsData } = await supabase
        .from('teams')
        .select('id, name, logo_url')
        .eq('is_active', true)
        .order('name');

      if (teamsData && teamsData.length > 0) {
        setTeams(teamsData);
      }

      const { data: myTeamData } = await supabase
        .from('teams')
        .select('id, name, logo_url')
        .eq('name', '大豆戸FC')
        .single();

      if (myTeamData) {
        setMyTeam(myTeamData);
      }
    }

    fetchTeams();
  }, []);

  // データ取得後にアニメーション開始
  useEffect(() => {
    if (teams.length > 0 && phase === 'loading') {
      setPhase('intro');
    }
  }, [teams, phase]);

  // タイムラインに従ってフェーズを遷移
  useEffect(() => {
    if (phase === 'loading') return;

    const timers: NodeJS.Timeout[] = [];

    switch (phase) {
      case 'intro':
        // 1.2秒後にロゴ出現へ
        timers.push(setTimeout(() => setPhase('logos-appear'), 1200));
        break;
      case 'logos-appear':
        // 0.5秒後に回転へ
        timers.push(setTimeout(() => setPhase('logos-rotate'), 500));
        break;
      case 'logos-rotate':
        // 0.6秒後にハイライトへ
        timers.push(setTimeout(() => setPhase('logos-highlight'), 600));
        break;
      case 'logos-highlight':
        // 0.5秒後にリーグロゴへ
        timers.push(setTimeout(() => setPhase('league'), 500));
        break;
      case 'league':
        // 0.5秒後にフェードアウトへ
        timers.push(setTimeout(() => setPhase('fadeOut'), 500));
        break;
      case 'fadeOut':
        // 0.4秒後に非表示 → コールバック実行
        timers.push(setTimeout(() => {
          setIsVisible(false);
          onFinished?.();
        }, 400));
        break;
    }

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  if (!isVisible) return null;

  // TeamCircle用のphaseマッピング
  const getTeamCirclePhase = () => {
    switch (phase) {
      case 'logos-appear':
        return 'appear';
      case 'logos-rotate':
        return 'rotate';
      case 'logos-highlight':
        return 'highlight';
      case 'league':
      case 'fadeOut':
        return 'fade';
      default:
        return 'hidden';
    }
  };

  const showIntro = phase === 'intro';
  const showTeamCircle = ['logos-appear', 'logos-rotate', 'logos-highlight', 'league', 'fadeOut'].includes(phase);
  const showLeagueLogo = phase === 'league' || phase === 'fadeOut';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'fadeOut' ? 0 : 1 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          {/* 背景 */}
          <NeoFutureBackground />

          {/* ① イントロ: 発光サッカーボール */}
          <AnimatePresence>
            {showIntro && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center z-20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.4 } }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              >
                <IntroBall />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ② チームロゴ円形配置 */}
          <AnimatePresence>
            {showTeamCircle && (
              <motion.div
                className="absolute inset-0 z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TeamCircle
                  teams={teams}
                  myTeam={myTeam}
                  phase={getTeamCirclePhase()}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* ③ リーグロゴ */}
          <AnimatePresence>
            {showLeagueLogo && (
              <div className="absolute inset-0 flex items-center justify-center z-30">
                <LeagueLogo />
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
