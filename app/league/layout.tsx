import SideNav from '@/app/ui/dashboard/sidenav';
import { auth } from '@/auth';
import LeagueSelector from './components/leagueSelector';
import { fetchPlayerByEmail } from '../lib/player';
import { League, Player } from '../lib/definitions';
import {
  fetchAllLeagues,
  fetchLeague,
  fetchPlayersInLeague,
} from '../lib/leagues';
import JoinLeague from './components/joinLeague';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  const player = await fetchPlayerByEmail(userEmail);
  const playerId = player.player_id;
  let joinedLeague = null;
  let joinedLeagueData = null;
  let teamsInLeague: Player[] = [];
  if (playerId) {
    joinedLeague = await fetchLeague(playerId);
    teamsInLeague = await fetchPlayersInLeague(joinedLeague?.league_id ?? -1);
  }
  let allLeagues: League[] = [];
  if (!joinedLeague) {
    const leagues = await fetchAllLeagues();
    allLeagues = allLeagues.concat(leagues ?? []);
  }

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>
      <div className="flex-grow p-1 md:overflow-y-auto md:p-12">
        {joinedLeague?.name ? (
          <LeagueSelector userId={playerId}>
            <div className="p-4">
              <p className="text-2xl mt-4 ml-4">Welcome to <span className='text-red-900 font-bold'>{joinedLeague?.name}</span></p>
              {children}
            </div>
          </LeagueSelector>
        ) : (
          <div>
            <p className="text-center text-white">You not belong to a league</p>
            <JoinLeague leagues={allLeagues} userId={playerId} />
          </div>
        )}

        <footer className="p-4 text-center text-white">
          <div className="h-32"></div>
        </footer>
      </div>
    </div>
  );
}
