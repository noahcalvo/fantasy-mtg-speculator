import { auth } from '@/auth';
import { fetchPlayerByEmail } from '../../lib/player';
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

  return (
    <div>
      <LeagueMenu leagueId={leagueId} playerId={playerId}>
        {children}
      </LeagueMenu>
    </div>
  );
}
