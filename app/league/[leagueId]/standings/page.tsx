import { fetchPlayerWeeklyPointsInLeague, fetchPlayersInLeague } from "@/app/lib/leagues";
import { getCurrentWeek } from "@/app/lib/utils";
import Standings from "@/app/ui/standings";
import MoreAboutStandings from "./components/moreAboutStandings";
import { auth } from "@/auth";
import { fetchPlayerByEmail } from "@/app/lib/player";
import { redirect } from "next/navigation";
// import { fetchPlayerRoster } from "@/app/lib/rosters";
// import { createTeamPerformance } from "@/app/lib/performance";


export default async function Page({ params }: { params: { leagueId: string } }) {
  const user = await auth().then((res) => res?.user);
  const userEmail = user?.email || '';
  const player = await fetchPlayerByEmail(userEmail);
  let playerId = player.player_id;
  const leagueId = isNaN(parseInt(params.leagueId, 10)) ? -1 : parseInt(params.leagueId, 10);
  const teamsInLeague = await fetchPlayersInLeague(leagueId);
  if (!teamsInLeague.find((teamPlayer) => teamPlayer.player_id === playerId))
    {redirect(`/league`)}

  const week = getCurrentWeek();
  const perfData = await fetchPlayerWeeklyPointsInLeague(leagueId, week);
  const lastWeekData = await fetchPlayerWeeklyPointsInLeague(leagueId, week - 1);


  // let roster = await fetchPlayerRoster(playerId, leagueId);

  // for (let p of teamsInLeague) {
  //   for (let week=8; week<12; week++) {
  //     playerId = p.player_id;
  //     roster = await fetchPlayerRoster(playerId, leagueId);
  //     await createTeamPerformance(leagueId, roster, week, playerId)
  //   }
  // }


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