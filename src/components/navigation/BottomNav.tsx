'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  id: string;
  label: string;
  href: string;
}

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 9.5L12 3L21 9.5V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9.5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={active ? 'currentColor' : 'none'}
    />
    <path
      d="M9 22V12H15V22"
      stroke={active ? 'var(--bg-card)' : 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GamesIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="2"
      fill={active ? 'currentColor' : 'none'}
    />
    <path
      d="M12 2C12 2 14.5 5 14.5 8.5C14.5 12 12 14 12 14C12 14 9.5 12 9.5 8.5C9.5 5 12 2 12 2Z"
      stroke={active ? 'var(--bg-card)' : 'currentColor'}
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M2 12C2 12 5 9.5 8.5 9.5C12 9.5 14 12 14 12C14 12 12 14.5 8.5 14.5C5 14.5 2 12 2 12Z"
      stroke={active ? 'var(--bg-card)' : 'currentColor'}
      strokeWidth="1.5"
      fill="none"
    />
    <path
      d="M22 12C22 12 19 14.5 15.5 14.5C12 14.5 10 12 10 12C10 12 12 9.5 15.5 9.5C19 9.5 22 12 22 12Z"
      stroke={active ? 'var(--bg-card)' : 'currentColor'}
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

const LeagueIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M8 21V16M8 16V11M8 16H16M8 11V6M8 11H4M8 6H12M16 21V16M16 16V11M16 11V6M16 11H20M16 6H12M12 6V3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="6"
      y="2"
      width="12"
      height="4"
      rx="1"
      stroke="currentColor"
      strokeWidth="2"
      fill={active ? 'currentColor' : 'none'}
    />
  </svg>
);

const MediaIcon = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect
      x="2"
      y="4"
      width="20"
      height="16"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      fill={active ? 'currentColor' : 'none'}
    />
    <path
      d="M10 9L15 12L10 15V9Z"
      stroke={active ? 'var(--bg-card)' : 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={active ? 'var(--bg-card)' : 'none'}
    />
  </svg>
);

const navItems: NavItem[] = [
  { id: 'home', label: 'ホーム', href: '/dashboard' },
  { id: 'games', label: '試合', href: '/games' },
  { id: 'league', label: 'リーグ', href: '/league' },
  { id: 'media', label: 'メディア', href: '/media' },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const getIcon = (id: string, active: boolean) => {
    switch (id) {
      case 'home':
        return <HomeIcon active={active} />;
      case 'games':
        return <GamesIcon active={active} />;
      case 'league':
        return <LeagueIcon active={active} />;
      case 'media':
        return <MediaIcon active={active} />;
      default:
        return null;
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'var(--safe-area-bottom)',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
      }}
    >
      <div className="flex justify-around items-center h-[72px] max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all duration-200"
              style={{
                color: active ? 'var(--color-accent)' : 'var(--text-muted)',
              }}
            >
              <div className="relative">
                {getIcon(item.id, active)}
              </div>
              <span
                className="text-[10px] font-semibold tracking-wider"
                style={{
                  color: active ? 'var(--color-accent)' : 'var(--text-muted)',
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
