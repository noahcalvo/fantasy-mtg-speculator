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
      <h1 className="mb-4 text-3xl font-bold">{league.name} League Settings</h1>
      <CommissionerSettings
        leagueId={leagueId}
        scoringOptions={scoringOptions}
        playerId={playerId}
      />
    </main>
  );
}
