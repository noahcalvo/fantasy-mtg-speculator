import { getCardIdsFromMap, getRosterPositions } from '@/app/lib/definitions';
import { fetchPlayerRosterWithDetails } from '@/app/lib/rosters';
import LargeCard from './largeCard';
import { fetchCardPerformanceByWeek } from '@/app/lib/collection';
import { getCurrentWeek } from '@/app/lib/utils';
import { fetchLeague } from '@/app/lib/leagues';

export default async function Roster({ playerId, name }: { playerId: number, name: string }) {
  const league = await fetchLeague(playerId)
  const roster = await fetchPlayerRosterWithDetails(playerId, league?.league_id ?? 0);
  const cardIds = getCardIdsFromMap(roster);
  const week = getCurrentWeek();
  const mostRecentPoints = await fetchCardPerformanceByWeek(cardIds, week)
  const secondMostRecentPoints = await fetchCardPerformanceByWeek(cardIds, week-1);
  const positions = getRosterPositions();

  return (
    <div>
      <p className='text-xl m-2 pl-5'><span className='text-red-900 font-bold'>{name}&apos;s</span> Roster</p>
      <div className='flex flex-wrap justify-around'>
        {positions.map((position, index) =>
          {
            const points = mostRecentPoints.cards.find(element => element.card_id === roster[position.toLowerCase()]?.card_id) ?? {week: week, total_points: 0, card_id: roster[position.toLowerCase()]?.card_id ?? -1, name: roster[position.toLowerCase()]?.name ?? ''}
            const secondPoints = secondMostRecentPoints.cards.find(element => element.card_id === roster[position.toLowerCase()]?.card_id) ?? {week: week-1, total_points: 0, card_id: roster[position.toLowerCase()]?.card_id ?? -1, name: roster[position.toLowerCase()]?.name ?? ''}
            return (
              <LargeCard position={position} card={roster[position.toLowerCase()]} key={index} scoreOne={points} scoreTwo={secondPoints}/>
            )
          }
        )}
      </div>
    </div>
  );
}