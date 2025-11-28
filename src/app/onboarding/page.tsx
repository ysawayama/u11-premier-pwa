'use client';

import dynamic from 'next/dynamic';

// 動的レンダリングを強制
export const dynamicConfig = 'force-dynamic';

// framer-motionを含むコンポーネント全体をSSR無効でロード
const OnboardingContent = dynamic(
  () => import('@/components/onboarding/OnboardingContent'),
  { ssr: false }
);

export default function OnboardingPage() {
  return <OnboardingContent />;
}
