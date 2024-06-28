import { InformationCircleIcon, StarIcon } from '@heroicons/react/24/outline';
import { fetchPlayerCollectionWithPerformance } from '@/app/lib/collection';
import { fetchCard } from '@/app/lib/sets';
import Image from 'next/image';

export default async function BestPerformerBadge({ playerId, leagueId }: { playerId: number, leagueId: number }) {
  const collectionPerformance =
    await fetchPlayerCollectionWithPerformance(playerId, leagueId);
  const week = collectionPerformance[0]?.week
    ? ` (week ${collectionPerformance[0]?.week})`
    : '';
  const cardValue = collectionPerformance[0]?.week
    ? `${collectionPerformance[0]?.total_points}`
    : 'no data';
  const cardData = await fetchCard(collectionPerformance[0]?.card_id)
  return (
    <div className="flex flex-col rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-2">
        <div className='w-5'>
          <StarIcon className="h-5 w-5 text-gray-700" />
        </div>
        <p className="ml-2 text-sm font-medium">
          Your Weekly{week} Best Performing Card
        </p>
      </div>
      <div
        className="flex flex-row items-center justify-center bg-white rounded-xl shadow-sm h-full"
      >
        {cardData?.image &&
          <Image src={cardData?.image} alt={cardData?.name} width={100} height={100} className='mx-2 mt-1' />
        }
        {cardData?.name ?
          <p className='mx-2'>{cardValue}pts</p> :
          <p className=''>your cards scored no points :(</p>
        }
      </div>
    </div>
  );
}
