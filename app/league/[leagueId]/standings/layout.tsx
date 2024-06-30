import { fetchPlayersInLeague } from '@/app/lib/leagues';
import MoreAboutStandings from './components/moreAboutStandings';
import { auth } from '@/auth';
import { fetchPlayerByEmail } from '@/app/lib/player';
import { redirect } from 'next/navigation';
import { WeekPickerRouter } from '@/app/ui/picker';
import {
  fetchLeagueWeeks,
} from '@/app/lib/performance';

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { leagueId: string };
}) {
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  const player = await fetchPlayerByEmail(userEmail);
  let playerId = player.player_id;
  const leagueId = isNaN(parseInt(params.leagueId, 10))
    ? -1
    : parseInt(params.leagueId, 10);
  const teamsInLeague = await fetchPlayersInLeague(leagueId);
  if (!teamsInLeague.find((teamPlayer) => teamPlayer.player_id === playerId)) {
    redirect(`/league`);
  }

  return (
    <main className="mb-4 p-2 max-w-full">
      <div className="grid gap-2 md:grid-cols-2 max-w-full overflow-hidden">
        <div className="md:order-last">
          <MoreAboutStandings />
        </div>
        <div className="max-w-full overflow-hidden">
          <div className="max-w-full overflow-x-auto">
            <WeekPickerRouter
              availableWeeks={await fetchLeagueWeeks(leagueId)}
              leagueId={leagueId}
            />
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
