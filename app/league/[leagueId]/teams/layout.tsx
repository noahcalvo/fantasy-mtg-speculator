'use server';
import { auth } from '@/auth';
import { fetchPlayersInLeague } from '@/app/lib/leagues';
import { fetchPlayerByEmail } from '@/app/lib/player';
import TeamSelector from '../../components/teamSelector';
import { redirect } from 'next/navigation';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { leagueId: string };
}) {
  const leagueId = isNaN(parseInt(params.leagueId, 10))
    ? -1
    : parseInt(params.leagueId, 10);
  const user = await auth().then((res) => res?.user);
  const player = await fetchPlayerByEmail(user?.email ?? '');
  const playerId = player.player_id;
  const teamsInLeague = await fetchPlayersInLeague(leagueId);
  if (!teamsInLeague.find((teamPlayer) => teamPlayer.player_id === playerId)) {
    redirect(`/league`);
  }

  return (
    <div className="p-2">
      <div className="m-2 ">
        <div className="mt-2 lg:p-2">
          <div className="sm:overflow-auto">
            <TeamSelector teams={teamsInLeague} leagueId={leagueId} />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
