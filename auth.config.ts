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
      let player = null;
      let playerId = null;
      if (auth?.user?.email) {
        player = await fetchPlayerByEmail(auth?.user?.email);
        playerId = player.player_id;
      }
      let joinedLeagues: League[] = [];
      if (playerId) {
        joinedLeagues = await fetchLeagues(playerId);
      }
      const leagueIds = joinedLeagues.map((league) => league.league_id);

      const isOnLeague = nextUrl.pathname.startsWith('/league');
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const leagueIdMatch = nextUrl.pathname.match(/^\/league\/(\d+)/);
      const leagueId = leagueIdMatch ? parseInt(leagueIdMatch[1]) : null;

      if (isOnLeague) {
        if (!isLoggedIn) {
          const redirectUrl = new URL('/login', nextUrl);
          redirectUrl.searchParams.set('redirect', nextUrl.pathname);
          return Response.redirect(redirectUrl.toString(), 302); // Ensure proper redirect
        }
        if ((leagueId && leagueIds.includes(leagueId)) || leagueId == null) {
          return true;
        }
        return Response.redirect(new URL('/league/new', nextUrl).toString(), 302);
      }

      if (isOnLogin) {
        if (isLoggedIn) {
          const redirectPath = nextUrl.searchParams.get('redirect') || '/dashboard';
          return Response.redirect(new URL(redirectPath, nextUrl).toString(), 302); // Ensure proper redirect
        }
        return true; // Allow access to login page if not logged in
      }

      return true;
    },
  },
  secret: SECRET,
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;