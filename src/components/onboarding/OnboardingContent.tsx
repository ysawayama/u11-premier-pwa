'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppGradientBackground from '@/components/layout/AppGradientBackground';
import OnboardingSlide from '@/components/onboarding/OnboardingSlide';
import AppOverviewIllustration from '@/components/onboarding/illustrations/AppOverviewIllustration';
import PlayerCardIllustration from '@/components/onboarding/illustrations/PlayerCardIllustration';
import TeamPortalIllustration from '@/components/onboarding/illustrations/TeamPortalIllustration';

const slides = [
  {
    id: 1,
    illustration: <AppOverviewIllustration />,
    title: 'U-11プレミアリーグ公式アプリ',
    description: '試合速報・ランキング・デジタル選手証。\nあなたのサッカーライフを、ひとつのアプリで。',
    points: [
      '試合の結果がすぐ分かる',
      'チームや選手のランキングがひと目で分かる',
      'デジタル選手証で大会運営もスムーズ',
    ],
  },
  {
    id: 2,
    illustration: <PlayerCardIllustration />,
    title: '自分だけのマイページ',
    description: '出場試合・ゴール数・所属チーム。\n自分の成長を、いつでも見返せます。',
    points: [
      'デジタル選手証（QRコード付き）',
      '自分のシーズン成績',
      'フォロー中のチームの情報',
    ],
  },
  {
    id: 3,
    illustration: <TeamPortalIllustration />,
    title: 'チームの情報がひとつに',
    description: 'スケジュールも結果も、チーム写真も。\nチームポータルで全部まとまります。',
    points: [
      '今週の試合と結果',
      'スタメン / ラインナップ',
      'チームの写真・動画ギャラリー',
    ],
  },
];

export default function OnboardingContent() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === slides.length - 1;

  const completeOnboarding = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('onboardingCompleted', 'true');
    }
    router.replace('/login');
  }, [router]);

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      completeOnboarding();
    } else if (!isTransitioning) {
      setIsTransitioning(true);
      setDirection(1);
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsTransitioning(false);
      }, 200);
    }
  }, [isLastSlide, completeOnboarding, isTransitioning]);

  const handleBack = useCallback(() => {
    if (!isFirstSlide && !isTransitioning) {
      setIsTransitioning(true);
      setDirection(-1);
      setTimeout(() => {
        setCurrentIndex((prev) => prev - 1);
        setIsTransitioning(false);
      }, 200);
    }
  }, [isFirstSlide, isTransitioning]);

  const handleSkip = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  const handleDotClick = useCallback((index: number) => {
    if (!isTransitioning && index !== currentIndex) {
      setIsTransitioning(true);
      setDirection(index > currentIndex ? 1 : -1);
      setTimeout(() => {
        setCurrentIndex(index);
        setIsTransitioning(false);
      }, 200);
    }
  }, [currentIndex, isTransitioning]);

  const currentSlide = slides[currentIndex];

  return (
    <AppGradientBackground showParticles showLightLines>
      <div className="min-h-screen flex flex-col">
        {/* スライドコンテンツ */}
        <div className="flex-1 relative overflow-hidden">
          <div
            key={currentIndex}
            className={`absolute inset-0 transition-all duration-300 ease-out ${
              isTransitioning
                ? direction > 0
                  ? 'opacity-0 translate-x-[-50%]'
                  : 'opacity-0 translate-x-[50%]'
                : 'opacity-100 translate-x-0'
            }`}
          >
            <OnboardingSlide
              illustration={currentSlide.illustration}
              title={currentSlide.title}
              description={currentSlide.description}
              points={currentSlide.points}
              primaryButtonText={isLastSlide ? 'はじめる' : '次へ'}
              onPrimaryClick={handleNext}
              secondaryButtonText={!isFirstSlide ? '戻る' : undefined}
              onSecondaryClick={!isFirstSlide ? handleBack : undefined}
              showSkip={isFirstSlide}
              onSkipClick={handleSkip}
            />
          </div>
        </div>

        {/* ページインジケーター */}
        <div className="flex justify-center gap-2 pb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-[#0D47FF] w-6'
                  : 'bg-white/40 hover:bg-white/60 w-2.5'
              }`}
              aria-label={`スライド ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </AppGradientBackground>
  );
}
