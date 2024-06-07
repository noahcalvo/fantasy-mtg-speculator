import { getRosterPositions } from '@/app/lib/definitions';
import { fetchPlayerRosterWithDetails } from '@/app/lib/rosters';
import PositionCell from './positionCell';
import Collection from './collection';

export default async function Roster({ email, name }: { email: string, name: string }) {
  const roster = await fetchPlayerRosterWithDetails(email);
  const positions = getRosterPositions();

  return (
    <div className="rounded-md bg-white">
      <p className='text-xl m-2 pl-5'>{name}&apos;s Roster</p>
      <div className='flex flex-wrap justify-around'>
        {positions.map((position, index) => (
          <PositionCell position={position} card={roster[position.toLowerCase()]} key={index}/>
        ))}
      </div>
      <Collection email={email} />
    </div>
  );
}