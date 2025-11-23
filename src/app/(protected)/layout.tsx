import { ProtectedLayoutClient } from '@/components/layouts/ProtectedLayoutClient';

// Force dynamic rendering for all protected routes
export const dynamic = 'force-dynamic';

/**
 * 保護されたルート用レイアウト（Server Component）
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>;
}
