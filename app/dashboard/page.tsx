import PointChart from '@/app/ui/dashboard/point-chart';
import { fetchTopWeeklyCards, fetchTopWeeklyCardsFromSet, fetchTopCards, fetchTopCardsFromSet } from '@/app/lib/data';
import { WeekPicker, SetPicker } from '../ui/picker';
import LatestInvoices from '../ui/dashboard/latest-invoices';
import { fetchRecentSets } from '@/app/lib/sets';
import { fetchPlayerCollection } from '../lib/collection';
import { Card } from '../ui/dashboard/cards';
import CardTable from "@/app/ui/dashboard/table"

const week = 0;
export default async function Page({
  searchParams,
}:{
  searchParams?: {
    week: number;
    set: string;
  }
}) {
  const week = searchParams?.week || null;
  const set = searchParams?.set || "";
  let cardPoints = [];
  if (week === null && set === "") {
    // Both week and set are null
    cardPoints = await fetchTopCards();
  } else if (week === null) {
    // Only week is null
    cardPoints = await fetchTopCardsFromSet(set);
  } else if (set === "") {
    // Only set is null
    cardPoints = await fetchTopWeeklyCards(week);
  } else {
    // Neither week nor set is null
    cardPoints = await fetchTopWeeklyCardsFromSet(week, set);
  }
  const collection = await fetchPlayerCollection('noah', 1);
  console.log(collection)
  const sets = await fetchRecentSets()

  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl">Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Total Cards In Your Collection" value={5} type="collected" />
        <Card title="Weekly Best Performing Card" value={"ragavan"} type="pending" />
        <Card title="Weekly Position in League" value={1} type="invoices" />
        <Card
          title="Weekly Points"
          value={200}
          type="customers"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WeekPicker placeholder="Select week" />
        <SetPicker placeholder="Select set" sets={sets} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PointChart cardPoints={cardPoints} week={week}/>
        <CardTable collection={collection} />
        {/* <LatestInvoices collection={collection} /> */}
      </div>
    </main>
  );
}
