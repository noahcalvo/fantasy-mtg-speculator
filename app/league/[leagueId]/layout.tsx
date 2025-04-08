import { auth } from '@/auth';
import { fetchPlayerByEmail } from '../../lib/player';
import { isCommissioner } from '../../lib/leagues';
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
  const leagueId = parseInt(params.leagueId);
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  const player = await fetchPlayerByEmail(userEmail);
  const playerId = player.player_id;
  const commissioner = await isCommissioner(playerId, leagueId);

  return (
    <div>
      <LeagueMenu
        leagueId={leagueId}
        playerId={playerId}
        isCommissioner={commissioner}
      >
        {children}
      </LeagueMenu>
      <footer className="p-4 text-center text-gray-50">
        <div className="h-32"></div>
      </footer>
    </div>
  );
}
