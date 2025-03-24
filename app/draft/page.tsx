import { auth } from '@/auth';
import { fetchRecentSets } from '../lib/sets';
import { CreateDraftForm } from './components/createDraftForm';
import { DraftList } from './components/draftList';
import { fetchLeagues, isCommissioner } from '../lib/leagues';
import { fetchPlayerByEmail } from '../lib/player';
import { BeakerIcon } from '@heroicons/react/20/solid';

export default async function Page() {
  const sets = await fetchRecentSets();
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  const player = await fetchPlayerByEmail(userEmail);
  const playerId = player.player_id;
  const leagues = await fetchLeagues(playerId);
  const leagueId = leagues[0]?.league_id ?? 0;
  if (!leagueId) {
    return (
      <div className="py-8 text-center text-gray-50">
        You are not in a league 😶‍🌫️ Please join a league{' '}
        <BeakerIcon className="inline-block w-6" /> before visiting this page.
      </div>
    );
  }
  const commissioner = await isCommissioner(playerId, leagueId);
  return (
    <main>
      {commissioner && (
        <CreateDraftForm sets={sets} leagueId={leagueId} playerId={playerId} />
      )}
      <DraftList leagueId={leagueId} />
    </main>
  );
}
