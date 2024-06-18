import { auth } from '@/auth';
import { fetchLeague, fetchPlayersInLeague } from '@/app/lib/leagues';
import { Player } from '@/app/lib/definitions';
import { fetchPlayerByEmail } from '@/app/lib/player';
import TeamSelector from '../../components/teamSelector';

export default async function Layout({
  children, params
}: {
  children: React.ReactNode,
  params: { leagueId: string };
}) {
  const leagueId = isNaN(parseInt(params.leagueId, 10)) ? -1 : parseInt(params.leagueId, 10);
  const teamsInLeague = await fetchPlayersInLeague(leagueId);

  return (
    <div className="p-2">
    <div className="m-2 ">
      <div className="mt-2 lg:p-2 flex sm:block">
        <div className="sm:overflow-auto">
        <TeamSelector teams={teamsInLeague} leagueId={leagueId} />
        </div>
        {children}
      </div>
    </div>
    </div>
  );
}
