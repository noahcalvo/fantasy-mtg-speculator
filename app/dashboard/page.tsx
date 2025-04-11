import PointChart from '@/app/ui/dashboard/point-chart';

export default async function Page() {
  return (
    <main>
      <div className="mb-4 text-2xl text-gray-50 md:text-3xl">Leaderboards</div>
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PointChart />
      </div>
    </main>
  );
}
