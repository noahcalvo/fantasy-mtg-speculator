import PointChart from '@/app/ui/dashboard/point-chart';
import { WeekPicker, SetPicker } from '../ui/picker';
import Roster from "@/app/ui/roster/roster"
import { auth } from '@/auth';
import { fetchUniqueWeekNumbers } from '@/app/lib/data';
import TotalCardsBadge from './components/total-cards';
import BestPerformingBadge from './components/best-performer';
import MoreAboutScoring from './components/more-about-scoring';
import { fetchPlayerByEmail } from '../lib/player';
import Collection from '../ui/roster/collection';

export default async function Page() {
  const user = await auth().then((res) => res?.user);
  const userName = user?.name || "";
  const userEmail = user?.email || "";  
  const player = await fetchPlayerByEmail(userEmail);

  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl">Dashboard</h1>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className='grid gap-6 sm:grid-cols-2'>
        <TotalCardsBadge playerId={player.player_id} />
        <BestPerformingBadge playerId={player.player_id} />
        </div>
        <MoreAboutScoring />
      </div>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WeekPicker placeholder="This week" availableWeeks={await fetchUniqueWeekNumbers()}/>
        <SetPicker placeholder="All Sets"/>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PointChart/>
        <div className="rounded-md bg-white">
        <Roster playerId={player.player_id} name={userName}/>
        <Collection playerId={player.player_id} />
      </div>
      </div>
    </main>
  );
}