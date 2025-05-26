import {
  fetchScoringOptions,
  isCommissioner,
  fetchLeague,
} from '@/app/lib/leagues';
import { fetchPlayerByEmail } from '@/app/lib/player';
import { auth } from '@/auth';
import { CommissionerSettings } from './components/commissionerSettings';

export default async function Page({
  params,
}: {
  params: { leagueId: string };
}) {
  const leagueId = parseInt(params.leagueId);
  const league = await fetchLeague(leagueId);
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  const player = await fetchPlayerByEmail(userEmail);
  const playerId = player.player_id;
  const commissioner = await isCommissioner(playerId, leagueId);
  if (!commissioner) {
    return (
      <div className="text-center text-red-500">You are not a commissioner</div>
    );
  }
  const scoringOptions = await fetchScoringOptions(leagueId);
  return (
    <main className="p-4">
      <p className="text-lg font-bold">League Settings</p>
      <p className="text-md ml-2 inline-block rounded-sm bg-red-900 px-2 py-1 text-gray-50">
        {league.name}
      </p>
      <CommissionerSettings
        leagueId={leagueId}
        scoringOptions={scoringOptions}
        playerId={playerId}
      />
    </main>
  );
}
