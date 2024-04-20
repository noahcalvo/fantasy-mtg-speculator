import PointChart from '@/app/ui/dashboard/point-chart';
import { fetchTopWeeklyCards, fetchTopWeeklyCardsFromSet } from '@/app/lib/data';
import WeekPicker from '../ui/week-picker';
import SetPicker from '../ui/set-picker';
import LatestInvoices from '../ui/dashboard/latest-invoices';
import { fetchRecentSets } from '@/app/lib/sets';

const week = 0;
export default async function Page({
  searchParams,
}:{
  searchParams?: {
    week: number;
    set: string;
  }
}) {
  const week = searchParams?.week || 0;
  const set = searchParams?.set || "";
  let cardPoints = [];
  if(set.length > 0) {
    // fetch data for the selected set
    cardPoints = await fetchTopWeeklyCardsFromSet(week, set);
  } else {
    // or fetch all sets
    cardPoints = await fetchTopWeeklyCards(week);
  }
  const sets = await fetchRecentSets()

  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl">Dashboard</h1>
      <div className='space-x-5'>
        <WeekPicker placeholder="Select week" />
        <SetPicker placeholder="Select set" sets={sets} />
        {/* <Card title="Collected" value={totalPaidInvoices} type="collected" /> */}
        {/* <Card title="Pending" value={totalPendingInvoices} type="pending" /> */}
        {/* <Card title="Total Invoices" value={numberOfInvoices} type="invoices" /> */}
        {/* <Card
          title="Total Customers"
          value={numberOfCustomers}
          type="customers"
        /> */}
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2 2xl:grid-cols-3">
        {/* form to select a date*/}        
        <PointChart cardPoints={cardPoints} week={week}/>
        <LatestInvoices latestInvoices={[]} />
      </div>
    </main>
  );
}
