import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * 認証ミドルウェア
 * 保護されたルートへのアクセスをチェック
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser()を使用（getSession()よりセキュア）
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // デバッグログ（本番環境でも確認可能）
  console.log('[Middleware]', {
    path: request.nextUrl.pathname,
    hasUser: !!user,
    userEmail: user?.email,
  });

  // 認証が必要なルートの定義
  const protectedRoutes = ['/dashboard', '/profile', '/players', '/matches', '/rankings', '/team-portal', '/admin', '/games', '/league', '/stats', '/player-card'];
  const authRoutes = ['/login', '/signup'];

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  console.log('[Middleware]', {
    isProtectedRoute,
    isAuthRoute,
    willRedirectToLogin: isProtectedRoute && !user,
    willRedirectToDashboard: isAuthRoute && !!user,
  });

  // 認証が必要なページで未ログインの場合はログインページへ
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // ログイン済みでログイン/サインアップページにアクセスした場合はダッシュボードへ
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (manifest, icons, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
