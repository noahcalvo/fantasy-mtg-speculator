import {
  CardPerformances,
  getCardTypes,
  getRosterPositions,
} from '@/app/lib/definitions';
import { fetchPlayerRosterWithDetails } from '@/app/lib/rosters';
import LargeCard from './largeCard';
import { fetchPlayerCollectionWithDetails } from '@/app/lib/collection';
import { EmptyPositionPlaceholder } from './largeCard';
import { NumberedListIcon } from '@heroicons/react/24/outline';

export default async function Roster({
  playerId,
  owner,
  multiColumn,
  leagueId,
  mostRecentPoints,
  secondMostRecentPoints,
  week,
}: {
  playerId: number;
  owner?: boolean;
  multiColumn?: boolean;
  leagueId: number;
  mostRecentPoints: CardPerformances;
  secondMostRecentPoints: CardPerformances;
  week: number;
}) {
  const roster = await fetchPlayerRosterWithDetails(playerId, leagueId);
  const positions = getRosterPositions();

  const collection = await fetchPlayerCollectionWithDetails(playerId, leagueId);

  return (
    <div className="p-2 text-gray-50">
      <div className="flex flex-wrap justify-around">
        <div className="flex w-full p-2">
          <NumberedListIcon className="h-5 w-5 text-gray-50" />
          <p className="text-md ml-2">Roster</p>
        </div>
        {positions.map((position, index) => {
          const points = mostRecentPoints.cards.find(
            (element) =>
              element.card_id === roster[position.toLowerCase()]?.card_id,
          ) ?? {
            week: week,
            total_points: 0,
            card_id: roster[position.toLowerCase()]?.card_id ?? -1,
            name: roster[position.toLowerCase()]?.name ?? '',
          };
          const secondPoints = secondMostRecentPoints.cards.find(
            (element) =>
              element.card_id === roster[position.toLowerCase()]?.card_id,
          ) ?? {
            week: week - 1,
            total_points: 0,
            card_id: roster[position.toLowerCase()]?.card_id ?? -1,
            name: roster[position.toLowerCase()]?.name ?? '',
          };
          const replacements = collection.filter((collectionCard) => {
            return (
              getCardTypes(collectionCard.typeLine)
                .toLowerCase()
                .includes(position.toLowerCase()) || position === 'Flex'
            );
          });
          return (
            <div
              className={`h-22 relative mx-2 mb-2 w-full text-sm ${multiColumn ? 'sm:w-80' : ''}`}
              key={index}
            >
              {roster[position.toLowerCase()] ? (
                <LargeCard
                  position={position}
                  card={roster[position.toLowerCase()]}
                  scoreOne={points}
                  scoreTwo={secondPoints}
                  replacements={replacements}
                  playerId={playerId}
                  leagueId={leagueId}
                  owner={owner ?? false}
                />
              ) : (
                <EmptyPositionPlaceholder
                  position={position}
                  owner={owner ?? false}
                  playerId={playerId}
                  leagueId={leagueId}
                  replacements={replacements}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
