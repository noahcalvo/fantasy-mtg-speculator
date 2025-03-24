import { auth } from '@/auth';
import { CreateDraftForm } from './components/createDraftForm';
import { DraftList } from './components/draftList';
import { fetchRecentSets } from '@/app/lib/sets';
import { fetchPlayerByEmail } from '@/app/lib/player';
import { isCommissioner } from '@/app/lib/leagues';

export default async function Page({
  params,
}: {
  params: { leagueId: string };
}) {
  const leagueId = parseInt(params.leagueId);
  const sets = await fetchRecentSets();
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  const player = await fetchPlayerByEmail(userEmail);
  const playerId = player.player_id;
  const commissioner = await isCommissioner(playerId, leagueId);
  return (
    <main className="p-4">
      {commissioner && (
        <CreateDraftForm sets={sets} leagueId={leagueId} playerId={playerId} />
      )}
      <DraftList leagueId={leagueId} />
    </main>
  );
}
