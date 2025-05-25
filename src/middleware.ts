// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES_PREFIXES = ['/dashboard', '/inserir-venda', '/dados', '/editar-venda', '/faturamento', '/configuracoes'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticatedCookie = request.cookies.get('isAuthenticated');

  // Check if the current path starts with any of the protected route prefixes
  const isProtectedRoute = PROTECTED_ROUTES_PREFIXES.some(prefix => pathname.startsWith(prefix));

  if (isProtectedRoute) {
    if (!isAuthenticatedCookie || isAuthenticatedCookie.value !== 'true') {
      // console.log(`Middleware: Not authenticated for ${pathname}, redirecting to /login.`);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Se o usuário estiver autenticado e tentar acessar /login, redirecione para o dashboard
  if (pathname === '/login' && isAuthenticatedCookie && isAuthenticatedCookie.value === 'true') {
    // console.log(`Middleware: Authenticated user trying to access /login, redirecting to /dashboard.`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // console.log(`Middleware: Allowing request to ${pathname}. Authenticated: ${isAuthenticatedCookie?.value}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all protected routes
    '/dashboard/:path*',
    '/inserir-venda/:path*',
    '/dados/:path*',
    '/editar-venda/:path*',
    '/faturamento/:path*',
    '/configuracoes/:path*',
    // Also match /login to handle redirection for authenticated users
    '/login',
    // The root path '/' is handled by HomePage, which then decides redirection
    '/',
  ],
};
