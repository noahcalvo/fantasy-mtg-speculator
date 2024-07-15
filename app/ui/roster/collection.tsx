import { fetchPlayerCollectionWithDetails } from '@/app/lib/collection';
import CollectionCardCell from './collectionCardCell';
import { fetchLeague } from '@/app/lib/leagues';
import { fetchPlayerRosterWithDetails } from '@/app/lib/rosters';

export default async function Collection({ playerId }: { playerId: number }) {
  const league = await fetchLeague(playerId);
  const leagueId = league?.league_id ?? 0;
  const collection = await fetchPlayerCollectionWithDetails(playerId, leagueId);
  const roster = await fetchPlayerRosterWithDetails(playerId, leagueId);
  // only show collection cards that are not in the roster
  let fileteredCollection = collection;
  if (roster) {
    fileteredCollection = collection.filter((collectionCard) => {
      // check if card id matches a card object in the roster map
      return !Object.values(roster).some(
        (rosterCard) => rosterCard?.card_id === collectionCard.card_id,
      );
    });
  }

  return (
    <div className="rounded-md bg-white">
      <div>
        {fileteredCollection.map((card, index) => (
          <CollectionCardCell
            card={card}
            key={index}
            playerId={playerId}
            leagueId={leagueId}
          />
        ))}
      </div>
    </div>
  );
}
