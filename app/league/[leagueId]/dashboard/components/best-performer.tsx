import { StarIcon } from '@heroicons/react/24/outline';
import { fetchPlayerCollectionWithPerformance } from '@/app/lib/collection';
import { fetchCard } from '@/app/lib/card';
import ClickableCard from '@/app/ui/clickableCard';

export default async function BestPerformerBadge({
  playerId,
  leagueId,
}: {
  playerId: number;
  leagueId: number;
}) {
  const collectionPerformance = await fetchPlayerCollectionWithPerformance(
    playerId,
    leagueId,
  );
  const week = collectionPerformance[0]?.week
    ? ` (week ${collectionPerformance[0]?.week})`
    : '';
  const cardValue = collectionPerformance[0]?.week
    ? `${collectionPerformance[0]?.total_points}`
    : 'no data';
  const cardData = await fetchCard(collectionPerformance[0]?.card_id);
  return (
    <div className="flex flex-col rounded-xl bg-gray-950 p-2 text-gray-50 shadow-sm">
      <div className="flex p-2">
        <div className="w-5">
          <StarIcon className="h-5 w-5" />
        </div>
        <p className="ml-2 text-md">Top Card This Week</p>
      </div>
      <div className="flex h-full flex-row items-center justify-center rounded-xl shadow-sm">
        {cardData?.image.length > 0 && (
          <ClickableCard
            source={cardData?.image[0]}
            id={collectionPerformance[0]?.card_id}
            name={collectionPerformance[0]?.name}
          />
        )}
        {cardData?.name ? (
          <div className="mx-2">
            <p>{collectionPerformance[0]?.name}</p>
            <p className="text-sm">
              {cardValue}pts, week {collectionPerformance[0]?.week}
            </p>
          </div>
        ) : (
          <p className="text-sm">your cards scored no points :(</p>
        )}
      </div>
    </div>
  );
}
