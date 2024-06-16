import { WeeklyLeaguePerformances } from "@/app/lib/definitions";
import { fetchPlayerWeeklyPointsInLeague } from "@/app/lib/leagues";
import Standings from "@/app/ui/standings";

const perfData:WeeklyLeaguePerformances = {teams: [], league_id: 0}

export default async function Page() {
    const perfData = await fetchPlayerWeeklyPointsInLeague(9, 9)
    return (
      <main className="mb-4 p-2">
          <div>
          <Standings weeklyPerformance={perfData}/>
          </div>
      </main>
    );
  }
  