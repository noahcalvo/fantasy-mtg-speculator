import { auth } from '@/auth';
import { fetchLeague, fetchPlayersInLeague } from '@/app/lib/leagues';
import { Player } from '@/app/lib/definitions';
import { fetchPlayerByEmail } from '@/app/lib/player';
import TeamSelector from '../components/teamSelector';

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
  let teamsInLeague: Player[] = [];
  if (playerId) {
    joinedLeague = await fetchLeague(playerId);
    teamsInLeague = await fetchPlayersInLeague(joinedLeague?.league_id ?? -1);
    console.log(teamsInLeague);
  }

  return (
    <div className="mb-4 p-4">
      <div className="p-2">
        <TeamSelector teams={teamsInLeague} />
        {children}
      </div>
    </div>
  );
}