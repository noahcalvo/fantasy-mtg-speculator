import Standings from '@/app/ui/standings';

export default async function Page({
  params,
}: {
  params: { leagueId: string };
}) {
  const leagueId = isNaN(parseInt(params.leagueId, 10))
    ? -1
    : parseInt(params.leagueId, 10);

  return (
    <main className="mb-4 p-2">
        <div>
          <Standings leagueId={leagueId} week={-1}/>
        </div>
    </main>
  );
}
