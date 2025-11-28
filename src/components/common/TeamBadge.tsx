'use client';

import Image from 'next/image';

type TeamBadgeProps = {
  name: string;
  logoUrl?: string | null;
  /** サイズ: 'sm' | 'md' | 'lg' */
  size?: 'sm' | 'md' | 'lg';
  /** ロゴを左に表示（デフォルトは左） */
  logoPosition?: 'left' | 'right';
  /** テキストの配置 */
  textAlign?: 'left' | 'center' | 'right';
  /** クラス名 */
  className?: string;
};

const sizeConfig = {
  sm: { logo: 24, text: 'text-sm', gap: 'gap-1.5' },
  md: { logo: 32, text: 'text-base', gap: 'gap-2' },
  lg: { logo: 40, text: 'text-lg', gap: 'gap-3' },
};

/**
 * チーム名＋ロゴを表示するバッジコンポーネント
 */
export default function TeamBadge({
  name,
  logoUrl,
  size = 'md',
  logoPosition = 'left',
  textAlign = 'left',
  className = '',
}: TeamBadgeProps) {
  const config = sizeConfig[size];

  const logoElement = logoUrl ? (
    <div
      className="relative flex-shrink-0 rounded-full overflow-hidden bg-gray-100"
      style={{ width: config.logo, height: config.logo }}
    >
      <Image
        src={logoUrl}
        alt={`${name}のロゴ`}
        fill
        className="object-contain"
        sizes={`${config.logo}px`}
      />
    </div>
  ) : (
    <div
      className="flex-shrink-0 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
      style={{ width: config.logo, height: config.logo }}
    >
      <span className="text-gray-500 font-bold" style={{ fontSize: config.logo * 0.4 }}>
        {name.charAt(0)}
      </span>
    </div>
  );

  const textElement = (
    <span className={`font-semibold text-gray-900 ${config.text}`}>
      {name}
    </span>
  );

  const justifyClass = textAlign === 'center'
    ? 'justify-center'
    : textAlign === 'right'
      ? 'justify-end'
      : 'justify-start';

  return (
    <div className={`flex items-center ${config.gap} ${justifyClass} ${className}`}>
      {logoPosition === 'left' && logoElement}
      {textElement}
      {logoPosition === 'right' && logoElement}
    </div>
  );
}
