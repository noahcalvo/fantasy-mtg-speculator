import { fetchOwnership } from '@/app/lib/collection';
import { fetchLeagues } from '@/app/lib/leagues';
import { fetchPlayerByEmail } from '@/app/lib/player';
import { auth } from '@/auth';

export default async function OwnerShipDetails({ cardId }: { cardId: number }) {
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  if (!userEmail) {
    return;
  }
  const player = await fetchPlayerByEmail(userEmail);
  const playerId = player.player_id;
  const leagues = await fetchLeagues(playerId);

  let ownershipMap: { [key: number]: number } = {};

  let ownerIdToName: { [key: number]: string } = {};
  let leagueIdToName: { [key: number]: string } = {};

  for (const l of leagues) {
    const ownership = await fetchOwnership(l.league_id, cardId);
    ownershipMap[l.league_id] = ownership?.player_id ?? -1;
    if (ownership) {
      ownerIdToName[ownership?.player_id] = ownership?.name;
    }
    leagueIdToName[l.league_id] = l.name;
  }

  return (
    <div className="text-md">
      {Object.entries(ownershipMap).map(([leagueId, ownerId]) => {
        const numericLeagueId = Number(leagueId); // Convert leagueId back to a number
        return (
          <div key={numericLeagueId}>
            {ownerId > -1 ? (
              <span>
                owned by{' '}
                <a
                  className="font-bold text-red-900"
                  href={`/league/${leagueId}/teams/${ownerId}`}
                >
                  {ownerIdToName[ownerId]}
                </a>{' '}
                in{' '}
                <a className="font-bold" href={`/league/${leagueId}`}>
                  {leagueIdToName[numericLeagueId]}
                </a>
              </span>
            ) : (
              <span>
                <span className="font-bold text-red-900">unowned</span> in{' '}
                <a className="font-bold" href={`/league/${leagueId}`}>
                  {leagueIdToName[numericLeagueId]}
                </a>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
