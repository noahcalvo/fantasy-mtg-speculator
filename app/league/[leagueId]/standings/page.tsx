import { fetchPlayerWeeklyPointsInLeague } from "@/app/lib/leagues";
import { getCurrentWeek } from "@/app/lib/utils";
import Standings from "@/app/ui/standings";
import MoreAboutStandings from "./components/moreAboutStandings";

export default async function Page({ params }: { params: { leagueId: string } }) {
  const leagueId = isNaN(parseInt(params.leagueId, 10)) ? -1 : parseInt(params.leagueId, 10);
  const week = getCurrentWeek();
  const perfData = await fetchPlayerWeeklyPointsInLeague(leagueId, week);
  const lastWeekData = await fetchPlayerWeeklyPointsInLeague(leagueId, week - 1);
  return (
    <main className="mb-4 p-2">
      <div className="grid md:grid-cols-2 gap-2">
        <div className="md:order-last">
          <MoreAboutStandings />
        </div>
        <Standings weeklyPerformance={perfData} lastWeekData={lastWeekData} />
      </div>
    </main>
  );
}
