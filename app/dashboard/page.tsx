import PointChart from '@/app/ui/dashboard/point-chart';
import { WeekPicker, SetPicker } from '../ui/picker';
import { fetchRecentSets } from '@/app/lib/sets';
import { Card } from '../ui/dashboard/cards';
import CardTable from "@/app/ui/dashboard/table"
import { auth } from '@/auth';
import { fetchUniqueWeekNumbers } from '@/app/lib/data';
import TotalCardsBadge from './components/total-cards';
import BestPerformingBadge from './components/best-performer';

export default async function Page() {
  const user = await auth().then((res) => res?.user);
  const userName = user?.name || "";
  const userEmail = user?.email || "";  

  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl">Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <TotalCardsBadge email={userEmail} />
        <BestPerformingBadge email={userEmail} />
        <Card title="Weekly Position in League" value={1} type="invoices" />
        <Card
          title="Weekly Points"
          value={0}
          type="customers"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WeekPicker placeholder="This week" availableWeeks={await fetchUniqueWeekNumbers()}/>
        <SetPicker placeholder="All Sets"/>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PointChart/>
        <CardTable email={userEmail} name={userName}/>
        {/* <LatestInvoices collection={collection} /> */}
      </div>
    </main>
  );
}