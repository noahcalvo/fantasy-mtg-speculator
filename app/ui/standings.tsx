import { WeeklyLeaguePerformances } from "@/app/lib/definitions";
import Link from "next/link";
import { CreatePerformanceMap, TwoWeekStatus } from "../lib/performance-utils";


export default async function Standings({ weeklyPerformance, lastWeekData }: { weeklyPerformance: WeeklyLeaguePerformances, lastWeekData: WeeklyLeaguePerformances }) {
  let performanceMap = CreatePerformanceMap(weeklyPerformance, lastWeekData);
  const sortedPointsArray = Array.from(performanceMap.entries()).sort((a, b) => b[1].thisWeek - a[1].thisWeek);

  return (
    <div>
      <div className="text-xl ml-4 font-bold" >Weekly League Standings</div>
      {sortedPointsArray.map(([playerId, twoWeekStatus], index) => {
        let className = 'grid grid-cols-12 items-center p-2 rounded-md my-1 hover:border-gray-500 border border-white';
        let emojiText = "   "
        if (index === 0) emojiText = '🥇';
        else if (index === 1) emojiText = '🥈';
        else if (index === 2) emojiText = '🥉';
        else if (index === sortedPointsArray.length - 1) emojiText = '💀';
        const arrow = getStatusArrow(twoWeekStatus)
        return (
          <Link key={index} className={className} href={`/league/${weeklyPerformance.league_id}/teams/${playerId}`}>
            <div className="text-right text-lg pr-0.5">{emojiText}</div>
            <div className="col-span-7 text-lg text-bold">{twoWeekStatus.name}</div>
            <div className="col-span-4">{arrow} {twoWeekStatus.thisWeek.toFixed(2)}</div>
          </Link>
        );
      })}      
            </div>
  );
}

function getStatusArrow(twoWeekStatus: TwoWeekStatus): React.ReactElement {
  const pctDifference = twoWeekStatus.thisWeekPct - twoWeekStatus.lastWeekPct;

  let arrow: React.ReactNode;
  switch (true) {
    case pctDifference > 3:
      arrow = <span className="text-lime-600 font-bold">↑</span>
      break;
    case pctDifference > 1:
      arrow = <span className="text-lime-300 font-bold">↑</span>
      break;

    case pctDifference < -3:
      arrow = <span className="text-red-600 font-bold">↓</span>
      break;
    case pctDifference < -1:
      arrow = <span className="text-red-300 font-bold">↓</span>
      break;
    default:
      arrow = <span className="text-gray-500 font-bold">--</span>
      break;
  }

  return arrow
}