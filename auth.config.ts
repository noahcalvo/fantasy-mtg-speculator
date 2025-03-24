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
      const player = await fetchPlayerByEmail(auth?.user?.email || '');
      const playerId = player.player_id;
      let joinedLeagues: League[] = [];
      if (playerId) {
        joinedLeagues = await fetchLeagues(playerId);
      }
      // Extract the league IDs from the leagueBelongings array
      const leagueIds = joinedLeagues.map((league) => league.league_id);

      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnDraft = nextUrl.pathname.startsWith('/draft');
      const isOnLeague = nextUrl.pathname.startsWith('/league');
      // Extract the leagueId from the path if it's on a league page
      const leagueIdMatch = nextUrl.pathname.match(/^\/league\/(\d+)/);
      const leagueId = leagueIdMatch ? parseInt(leagueIdMatch[1]) : null;
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isOnDraft) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isOnLeague) {
        // Check if the user is logged in and if they belong to the league they're trying to access
        if (isLoggedIn) {
          if ((leagueId && leagueIds.includes(leagueId)) || leagueId == null) {
            return true; // The user is authorized to access this league page
          } else {
            // Redirect to the "new league" page if the user does not belong to the league
            return Response.redirect(new URL('/league/new', nextUrl));
          }
        }
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