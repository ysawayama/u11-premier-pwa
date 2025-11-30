'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Trophy, Award, Play } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'ホーム', href: '/dashboard', icon: Home },
  { id: 'games', label: '試合', href: '/games', icon: Trophy },
  { id: 'league', label: 'リーグ', href: '/league', icon: Award },
  { id: 'media', label: 'メディア', href: '/media', icon: Play },
];

export function BottomNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(href);
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
          const Icon = item.icon;
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
                <Icon
                  size={24}
                  strokeWidth={active ? 2.5 : 2}
                  fill={active ? 'currentColor' : 'none'}
                />
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
