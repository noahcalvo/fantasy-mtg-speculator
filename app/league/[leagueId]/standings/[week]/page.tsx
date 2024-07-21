import { getCurrentWeek } from '@/app/lib/utils';
import Standings from '@/app/ui/standings';

export default async function Page({
  params,
}: {
  params: { leagueId: string; week: string };
}) {
  const leagueId = isNaN(parseInt(params.leagueId, 10))
    ? -1
    : parseInt(params.leagueId, 10);

  const week =
    params.week === 'alltime'
      ? -1
      : isNaN(parseInt(params.week, 10))
        ? getCurrentWeek()
        : parseInt(params.week, 10);

  return (
    <main className="mb-4 p-2">
      <div>
        <Standings leagueId={leagueId} week={week} />
      </div>
    </main>
  );
}
