import PointChart from '@/app/ui/dashboard/point-chart';
import { WeekPicker, SetPicker, FormatPicker } from '../ui/picker';
import { fetchUniqueWeekNumbers } from '@/app/lib/performance';

export default async function Page() {
  return (
    <main>
      <div className="mb-4 text-2xl text-gray-50 md:text-3xl">Leaderboards</div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <WeekPicker
              placeholder="This week"
              availableWeeks={await fetchUniqueWeekNumbers()}
            />
            <SetPicker placeholder="All sets" />
            <FormatPicker placeholder="Modern" />
          </div>
          <PointChart />
        </div>
      </div>
    </main>
  );
}
