import { getCardIdsFromMap, getRosterPositions } from '@/app/lib/definitions';
import { fetchPlayerRosterWithDetails } from '@/app/lib/rosters';
import PositionCell from './positionCell';
import Collection from './collection';
import { fetchCardPerformanceByWeek } from '@/app/lib/collection';
import { getCurrentWeek } from '@/app/lib/utils';

export default async function Roster({ playerId, name }: { playerId: number, name: string }) {
  const roster = await fetchPlayerRosterWithDetails(playerId);
  const cardIds = getCardIdsFromMap(roster);
  const week = getCurrentWeek();
  const mostRecentPoints = await fetchCardPerformanceByWeek(cardIds, week)

  const positions = getRosterPositions();

  return (
    <div className="rounded-md bg-white">
      <p className='text-xl m-2 pl-5'>{name}&apos;s Roster</p>
      <div className='flex flex-wrap justify-around'>
        {positions.map((position, index) =>
          {
            const points = mostRecentPoints.cards.find(element => element.card_id === roster[position.toLowerCase()]?.card_id) ?? {week: week}
            console.log(points);
            return (
              <PositionCell position={position} card={roster[position.toLowerCase()]} key={index} score={points}/>
            )
          }
        )}
      </div>
      <Collection playerId={playerId} />
    </div>
  );
}