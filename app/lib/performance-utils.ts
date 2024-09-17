import { WeeklyLeaguePerformances } from "./definitions";

export type TwoWeekStatus = {
  thisWeek: number;
  lastWeek: number;
  thisWeekPct: number;
  lastWeekPct: number;
  id: number;
}
export function CreatePerformanceMap(
  thisWeekData: WeeklyLeaguePerformances,
  lastWeekData: WeeklyLeaguePerformances
): Map<number, TwoWeekStatus> {

  const pointsMap = new Map<number, TwoWeekStatus>();
  let thisWeekPointTotal = 0;

  // Populate this week points
  thisWeekData.teams.forEach((team) => {
    const points = team.points/100;
    thisWeekPointTotal += points;
    pointsMap.set(team.player_id, { thisWeek: points, lastWeek: 0, thisWeekPct: 0, lastWeekPct: 0, id: team.player_id });
  });

  let lastWeekPointTotal = 0;

  // Populate last week points
  lastWeekData.teams.forEach((team) => {
    const points = team.points/100;
    lastWeekPointTotal += points;
    if (pointsMap.has(team.player_id)) {
      pointsMap.get(team.player_id)!.lastWeek = points;
    } else {
      pointsMap.set(team.player_id, { thisWeek: 0, lastWeek: points, thisWeekPct: 0, lastWeekPct: 0, id: team.player_id });
    }
  });

  // Calculate percentage for each player
  pointsMap.forEach((value, key) => {
    const thisWeekPct = (value.thisWeek / thisWeekPointTotal) * 100;
    const lastWeekPct = (value.lastWeek / lastWeekPointTotal) * 100;
    pointsMap.set(key, { ...value, thisWeekPct, lastWeekPct });
  });

  return pointsMap;
}