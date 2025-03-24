import { auth } from '@/auth';
import { fetchPlayerByEmail } from '../../lib/player';
import { League } from '../../lib/definitions';
import { fetchAllOpenLeagues, fetchLeagues } from '../../lib/leagues';
import JoinLeague from './../components/joinLeague';
import LeagueMenu from './../components/leagueMenu';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: {
    leagueId: string;
  };
}) {
  console.log('Layout leagueId:', params.leagueId);
  const leagueId = parseInt(params.leagueId);
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  const player = await fetchPlayerByEmail(userEmail);
  const playerId = player.player_id;

  return (
    <div>
      <LeagueMenu leagueId={leagueId} playerId={playerId}>
        {children}
      </LeagueMenu>
      <footer className="p-4 text-center text-gray-50">
        <div className="h-32"></div>
      </footer>
    </div>
  );
}
