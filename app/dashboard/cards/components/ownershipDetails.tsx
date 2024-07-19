import { fetchOwnership } from '@/app/lib/collection';
import { fetchLeague } from '@/app/lib/leagues';
import { fetchPlayerByEmail } from '@/app/lib/player';
import { auth } from '@/auth';

export default async function OwnerShipDetails({ cardId }: { cardId: number }) {
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  const player = await fetchPlayerByEmail(userEmail);
  const playerId = player.player_id;
  const league = await fetchLeague(playerId);
  const leagueId = league?.league_id ?? 0;

  const ownedBy = await fetchOwnership(leagueId, cardId);

  return (
    <div className="text-md">
      {ownedBy ? (
        <span>
          owned by{' '}
          <span className="font-bold text-red-900">{ownedBy?.name}</span>
        </span>
      ) : (
        <span>
          <span className="font-bold text-red-900">unowned</span> in{' '}
          {league?.name}
        </span>
      )}
    </div>
  );
}
