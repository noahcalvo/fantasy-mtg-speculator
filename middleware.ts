import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const response = NextResponse.next();

  // Don't modify cache headers for API routes or static assets
  if (req.nextUrl.pathname.startsWith('/api/') ||
    req.nextUrl.pathname.startsWith('/_next/')) {
    return response;
  }

  // Public pages that can be cached
  const publicPages = ['/', '/privacy'];
  const isPublicPage = publicPages.includes(req.nextUrl.pathname);

  // For public pages, allow bfcache by setting appropriate headers
  if (isPublicPage) {
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  } else {
    // For authenticated pages, use a more permissive cache policy
    // that still allows bfcache but ensures fresh data on navigation
    response.headers.set('Cache-Control', 'private, max-age=0, must-revalidate');
  }

  return response;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
