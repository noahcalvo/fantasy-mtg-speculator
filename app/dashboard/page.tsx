import PointChart from '@/app/ui/dashboard/point-chart';
import { fetchCardPoints } from '@/app/lib/data';
import WeekPicker from '../ui/week-picker';
import LatestInvoices from '../ui/dashboard/latest-invoices';

const week = 0;
export default async function Page({
  searchParams,
}:{
  searchParams?: {
    week: number;
  }
}) {
  const week = searchParams?.week || 0;

  const cardPoints = await fetchCardPoints(week);
  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl">Dashboard</h1>
      <div>
        <WeekPicker placeholder="Select week" />
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
