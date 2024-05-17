import PointChart from '@/app/ui/dashboard/point-chart';
import { fetchTopWeeklyCards, fetchTopWeeklyCardsFromSet, fetchTopCards, fetchTopCardsFromSet } from '@/app/lib/data';
import { WeekPicker, SetPicker } from '../ui/picker';
import LatestInvoices from '../ui/dashboard/latest-invoices';
import { fetchRecentSets } from '@/app/lib/sets';
import { fetchPlayerCollection } from '../lib/collection';
import { Card } from '../ui/dashboard/cards';
import CardTable from "@/app/ui/dashboard/table"
import { auth } from '@/auth';
import { EPOCH } from '@/app/page';
import { fetchUniqueWeekNumbers } from '@/app/lib/data';


// const week = 0;
export default async function Page({
  searchParams,
}:{
  searchParams?: {
    week: number;
    set: string;
  }
}) {
  const week = searchParams?.week || getCurrentWeek();
  const set = searchParams?.set || "";

  const user = await auth().then((res) => res?.user);
  const userName = user?.name || "";
  const userEmail = user?.email || "";


  let cardPointsPromise;
  if (week === null && set === "") {
    cardPointsPromise = fetchTopCards();
  } else if (week === null) {
    cardPointsPromise = fetchTopCardsFromSet(set);
  } else if (set === "") {
    cardPointsPromise = fetchTopWeeklyCards(week);
  } else {
    cardPointsPromise = fetchTopWeeklyCardsFromSet(week, set);
  }
  
  const collectionPromise = fetchPlayerCollection(userEmail, 1);
  
  const [cardPoints, collection] = await Promise.all([cardPointsPromise, collectionPromise]);
  
  const totalCollectionPoints = collection.reduce((acc, card) => acc + card.total_points, 0);
  const sets = await fetchRecentSets()

  return (
    <main>
      <h1 className="mb-4 text-xl md:text-2xl">Dashboard</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Total Cards In Your Collection" value={collection.length} type="collected" />
        <Card title="Your Weekly Best Performing Card" value={collection[0]?.name || "-"} type="pending" />
        <Card title="Weekly Position in League" value={1} type="invoices" />
        <Card
          title="Weekly Points"
          value={totalCollectionPoints}
          type="customers"
        />
      </div>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WeekPicker placeholder="This week" availableWeeks={await fetchUniqueWeekNumbers()}/>
        <SetPicker placeholder="All sets" sets={sets} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PointChart cardPoints={cardPoints} week={week}/>
        <CardTable collection={collection} userName={userName}/>
        {/* <LatestInvoices collection={collection} /> */}
      </div>
    </main>
  );
}

function getCurrentWeek() {
  const startDate = new Date(EPOCH);
  const today = new Date();

  const timeDiff = Math.abs(today.getTime() - startDate.getTime());
  const diffWeeks = Math.ceil(timeDiff / (1000 * 60 * 60 * 24 * 7));
  const weekNo = diffWeeks - 1;
  return weekNo;
}