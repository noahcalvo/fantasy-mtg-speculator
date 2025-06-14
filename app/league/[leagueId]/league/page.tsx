import { fetchScoringOptions, fetchLeague } from '@/app/lib/leagues';
import {
  fetchPlayerByEmail,
  fetchMultipleParticipantData,
} from '@/app/lib/player';
import { auth } from '@/auth';
import { AddNewRule } from './components/addNewRule';
import CurrentScoringSettings from './components/currentSettings';
import LeagueSettings from './components/leagueSettings';

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
  // for each commissioner, fetch their player data

  const commissioners = await fetchMultipleParticipantData(
    league.commissioners,
  );
  const isAdmin = !!commissioners.find(
    (commissioner) => commissioner.player_id === playerId,
  );
  const scoringOptions = await fetchScoringOptions(leagueId);
  return (
    <main className="p-4">
      <div className="mb-4 text-md font-semibold text-gray-950">
        <span className="text-lg">League Settings</span>
      </div>
      <LeagueSettings
        league={league}
        commissioners={commissioners}
        adminView={isAdmin}
      />
      <CurrentScoringSettings
        scoringOptions={scoringOptions}
        playerId={playerId}
        isAdmin={isAdmin}
      />
      {isAdmin && <AddNewRule leagueId={leagueId} />}
    </main>
  );
}
