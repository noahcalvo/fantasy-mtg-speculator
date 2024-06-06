import { getRosterPositions } from '@/app/lib/definitions';
import { fetchPlayerRoster } from '@/app/lib/rosters';
import PositionCell from './positionCell';
import Collection from './collection';

export default async function Roster({ email, name }: { email: string, name: string }) {
  const roster = await fetchPlayerRoster(email);
  const positions = getRosterPositions();

  return (
    <div className="rounded-md bg-white">
      <p className='text-xl m-2'>{name}&apos;s Roster</p>
      <div>
        {positions.map((position, index) => (
          <PositionCell position={position} card={roster[position]} key={index}/>
        ))}
      </div>
      <Collection email={email} />
    </div>
  );
}