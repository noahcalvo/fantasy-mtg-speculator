import { auth } from '@/auth';
import { fetchPlayerByEmail } from '../../lib/player';
import { League } from '../../lib/definitions';
import { fetchAllOpenLeagues, fetchLeagues } from '../../lib/leagues';
import JoinLeague from './../components/joinLeague';
import LeagueMenu from './../components/leagueMenu';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  const player = await fetchPlayerByEmail(userEmail);
  const playerId = player.player_id;
  let joinedLeagues: League[] = [];
  if (playerId) {
    joinedLeagues = await fetchLeagues(playerId);
  }
  let allLeagues: League[] = [];
  const leagues = await fetchAllOpenLeagues();
  allLeagues = allLeagues.concat(leagues ?? []);

  return (
    <div>
      {joinedLeagues[0]?.name ? (
        <div className="p-4">
          <LeagueMenu
            leagueId={joinedLeagues[0]?.league_id ?? -1}
            playerId={playerId}
          >
            {children}
          </LeagueMenu>
        </div>
      ) : (
        <div>
          <p className="text-center text-gray-50">
            You do not belong to a league
          </p>
          <JoinLeague leagues={allLeagues} userId={playerId} />
        </div>
      )}

      <footer className="p-4 text-center text-gray-50">
        <div className="h-32"></div>
      </footer>
    </div>
  );
}
