import type { NextAuthConfig } from 'next-auth';
import { fetchLeagues } from './app/lib/leagues';
import { fetchPlayerByEmail } from './app/lib/player';
import { League } from './app/lib/definitions';

const SECRET = process.env.AUTH_SECRET;

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const isAuthPage = pathname === "/login";
      const isProtected =
        pathname.startsWith("/dashboard") || pathname.startsWith("/league");

      // If they're on /login and already authed, bounce to /dashboard
      if (isAuthPage && isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl.origin));
      }

      // For protected pages, force login
      if (isProtected && !isLoggedIn) {
        const url = new URL("/login", nextUrl.origin);
        url.searchParams.set("redirect", pathname);
        return Response.redirect(url);
      }

      // Otherwise allow
      return true;
    },

    // Optional: normalize/allow relative callback URLs
    redirect({ url, baseUrl }) {
      try {
        // relative URLs
        if (url.startsWith("/")) return new URL(url, baseUrl).toString();
        // same-origin absolute
        const u = new URL(url);
        if (u.origin === baseUrl) return url;
      } catch { }
      // default fallback
      return baseUrl;
    },
  },
  secret: SECRET,
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
