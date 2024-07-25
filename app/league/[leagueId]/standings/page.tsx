import { getCurrentWeek } from '@/app/lib/utils';
import Standings from '@/app/ui/standings';

export default async function Page({
  params,
}: {
  params: { leagueId: string };
}) {
  const leagueId = isNaN(parseInt(params.leagueId, 10))
    ? -1
    : parseInt(params.leagueId, 10);

  const week = getCurrentWeek();
  console.log('page: ', week);
  return (
    <main className="mb-4 p-2">
      <div>
        <Standings leagueId={leagueId} week={week} />
      </div>
    </main>
  );
}
