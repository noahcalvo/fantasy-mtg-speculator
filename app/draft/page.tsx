import { auth } from '@/auth';
import { fetchRecentSets } from '../lib/sets';
import { CreateDraftForm } from './components/createDraftForm';
import { DraftList } from './components/draftList';
import { isAdmin } from '../lib/actions';
import { fetchLeague } from '../lib/leagues';
import { fetchPlayerByEmail } from '../lib/player';

export default async function Page() {
  const sets = await fetchRecentSets();
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  const admin = await isAdmin(userEmail);
  const player = await fetchPlayerByEmail(userEmail);
  const playerId = player.player_id;
  const league = await fetchLeague(playerId)
  const leagueId = league?.league_id ?? 0;
  return (
    <main className="mb-4">
      {admin && <CreateDraftForm sets={sets} leagueId={leagueId} />}
      <DraftList leagueId={leagueId}/>
    </main>
  );
}
