import type { NextAuthConfig } from 'next-auth';

const SECRET = process.env.AUTH_SECRET;

 
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnDraft = nextUrl.pathname.startsWith('/draft');
      const isOnLeague = nextUrl.pathname.startsWith('/league');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isOnDraft) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isOnLeague) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } 
      else if (isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  secret: SECRET,
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;