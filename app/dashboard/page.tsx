import PointChart from '@/app/ui/dashboard/point-chart';

export default async function Page() {
  return (
    <main className="md:m-8">
      <div className="mb-4 text-lg text-gray-50 md:text-xl">Leaderboards</div>
      <div className="mt-6">
        <PointChart />
      </div>
    </main>
  );
}
