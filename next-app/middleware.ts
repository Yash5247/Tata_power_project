import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  // Example protected route prefix
  if (url.pathname.startsWith('/admin')) {
    // Rely on next-auth session cookie; if absent, redirect to login
    const hasSession = req.cookies.has('next-auth.session-token') || req.cookies.has('__Secure-next-auth.session-token');
    if (!hasSession) {
      const login = new URL('/auth/login', req.url);
      login.searchParams.set('callbackUrl', url.pathname);
      return NextResponse.redirect(login);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};


