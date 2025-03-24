import { fetchOwnership } from '@/app/lib/collection';
import { fetchLeagues } from '@/app/lib/leagues';
import { fetchPlayerByEmail } from '@/app/lib/player';
import { auth } from '@/auth';

export default async function OwnerShipDetails({ cardId }: { cardId: number }) {
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  const player = await fetchPlayerByEmail(userEmail);
  const playerId = player.player_id;
  const leagues = await fetchLeagues(playerId);

  let ownershipMap: { [key: string]: string } = {};

  for (const l of leagues) {
    const ownership = await fetchOwnership(l.league_id, cardId);
    if (ownership) {
      ownershipMap[l.name] = ownership.name;
    }
  }

  return (
    <div className="text-md">
      {Object.entries(ownershipMap).map(([leagueName, ownerName]) => (
        <div key={leagueName}>
          {ownerName ? (
            <span>
              owned by{' '}
              <span className="font-bold text-red-900">{ownerName}</span> in{' '}
              <span className="font-bold">{leagueName}</span>
            </span>
          ) : (
            <span>
              <span className="font-bold text-red-900">unowned</span> in{' '}
              <span className="font-bold">{leagueName}</span>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
