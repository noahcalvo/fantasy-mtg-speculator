import { fetchLeague } from '@/app/lib/leagues';
import LeaguePageClient from './LeaguePageClient';

export default async function Page({
  params,
}: {
  params: { leagueId: string };
}) {
  const leagueId = parseInt(params.leagueId);
  const league = await fetchLeague(leagueId);

  return <LeaguePageClient league={league} />;
}
