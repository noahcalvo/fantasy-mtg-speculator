import {
  fetchPlayersInLeague,
  fetchScoringOptions,
  fetchLeague,
} from '@/app/lib/leagues';
import {
  fetchPlayerByEmail,
  fetchMultipleParticipantData,
} from '@/app/lib/player';
import { auth } from '@/auth';
import { AddNewRule } from './components/addNewRule';
import CurrentScoringSettings from './components/currentSettings';
import LeagueSettings from './components/leagueSettings';
import Participants from './components/participants';

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
  const isCommissioner = !!commissioners.find(
    (commissioner) => commissioner.player_id === playerId,
  );
  const isOtherCommissioner = commissioners.length > 1 || !isCommissioner;
  const scoringOptions = await fetchScoringOptions(leagueId);
  const participants = await fetchPlayersInLeague(leagueId);
  return (
    <main className="p-4">
      <div className="mb-4 text-md font-semibold text-gray-950">
        <span className="text-lg">League Settings</span>
      </div>
      <LeagueSettings
        league={league}
        commissioners={commissioners}
        isCommissioner={isCommissioner}
      />
      <CurrentScoringSettings
        scoringOptions={scoringOptions}
        playerId={playerId}
        isCommissioner={isCommissioner}
      />
      {isCommissioner && <AddNewRule leagueId={leagueId} />}
      <Participants
        leagueId={league.league_id}
        participants={participants}
        playerId={playerId}
        isOtherCommissioner={isOtherCommissioner}
        isCommissioner={isCommissioner}
      />
    </main>
  );
}
