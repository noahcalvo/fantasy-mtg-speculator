import Link from 'next/link';
import { CreatePerformanceMap, TwoWeekStatus } from '../lib/performance-utils';
import {
  fetchAlltimeLeaguePerformance,
  fetchAlltimeLeaguePerformanceLastWeek,
  fetchWeeklyLeaguePerformance,
} from '../lib/performance';
import { fetchParticipantData } from '../lib/player';
import { WeeklyLeaguePerformances } from '../lib/definitions';

export default async function Standings({
  leagueId,
  week,
}: {
  leagueId: number;
  week: number;
}) {
  const thisWeek =
    week < 0
      ? await fetchAlltimeLeaguePerformance(leagueId)
      : await fetchWeeklyLeaguePerformance(leagueId, week);
  const lastWeek =
    week < 0
      ? ((await fetchAlltimeLeaguePerformanceLastWeek(
          leagueId,
        )) as WeeklyLeaguePerformances)
      : await fetchWeeklyLeaguePerformance(leagueId, week - 1);

  let performanceMap = CreatePerformanceMap(thisWeek, lastWeek);
  const sortedPointsArray = Array.from(performanceMap.entries()).sort(
    (a, b) => b[1].thisWeek - a[1].thisWeek,
  );

  const lastPosition = sortedPointsArray.length - 1;

  return (
    <div className="text-gray-50">
      <div className="ml-4 text-lg font-semibold">
        {week > 0 ? `Week ${week} Standings` : 'Total Historical Standings'}
      </div>
      {sortedPointsArray.map(async ([playerId, twoWeekStatus], index) => {
        let className =
          'grid grid-cols-12 items-center p-2 rounded-md my-2 hover:border-gray-500 border border-gray-950';
        let emojiText = '   ';
        if (sortedPointsArray[0][1].thisWeek == 0) emojiText = ' ';
        else if (
          index === 0 ||
          sortedPointsArray[index][1].thisWeek ==
            sortedPointsArray[0][1].thisWeek
        )
          emojiText = '🥇';
        else if (
          index === 1 ||
          sortedPointsArray[index][1].thisWeek ==
            sortedPointsArray[1][1].thisWeek
        )
          emojiText = '🥈';
        else if (
          index === 2 ||
          sortedPointsArray[index][1].thisWeek ==
            sortedPointsArray[2][1].thisWeek
        )
          emojiText = '🥉';
        else if (
          index === lastPosition ||
          sortedPointsArray[index][1].thisWeek ==
            sortedPointsArray[lastPosition][1].thisWeek
        )
          emojiText = '💀';
        const arrow = getStatusArrow(twoWeekStatus);
        const player = await fetchParticipantData(twoWeekStatus.id);
        const playerName = player?.name ?? 'Unknown Player';
        return (
          <Link
            key={index}
            className={className}
            href={`/league/${leagueId}/teams/${playerId}`}
          >
            <div className="text-md pr-0.5 text-right">{emojiText}</div>
            <div className="text-bold text-md col-span-7">{playerName}</div>
            <div className="col-span-4">
              {arrow} {twoWeekStatus.thisWeek.toFixed(2)}
            </div>
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
      arrow = <span className="font-bold text-lime-600">↑</span>;
      break;
    case pctDifference > 1:
      arrow = <span className="font-bold text-lime-300">↑</span>;
      break;

    case pctDifference < -3:
      arrow = <span className="font-bold text-red-600">↓</span>;
      break;
    case pctDifference < -1:
      arrow = <span className="font-bold text-red-300">↓</span>;
      break;
    default:
      arrow = <span className="font-bold text-gray-500">--</span>;
      break;
  }

  return arrow;
}
