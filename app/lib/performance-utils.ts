import { CardPoint, RawPerformanceData, ScoringOption, WeeklyLeaguePerformances } from "./definitions";

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
    const points = team.points / 100;
    thisWeekPointTotal += points;
    pointsMap.set(team.player_id, { thisWeek: points, lastWeek: 0, thisWeekPct: 0, lastWeekPct: 0, id: team.player_id });
  });

  let lastWeekPointTotal = 0;

  // Populate last week points
  lastWeekData.teams.forEach((team) => {
    const points = team.points / 100;
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

// Helper function to calculate total points from all performance types
export function calculatePointsFromPerformances(
  performanceData: RawPerformanceData[],
  scoringOptions: ScoringOption[]
): CardPoint[] {
  return performanceData.map(performance => {
    let totalPoints = 0;
    // Calculate points for each format and event type
    scoringOptions.forEach(scoringRule => {
      totalPoints += calculatePointsForPerformance(performance, scoringRule);
    });
    console.log("totalPoints", totalPoints, "name", performance.name);
    return {
      card_id: performance.card_id,
      name: performance.name,
      total_points: totalPoints,
      week: performance.week
    };
  });
}

// Helper function to calculate points for a single performance type
function calculatePointsForPerformance(
  performance: RawPerformanceData,
  scoringRule: ScoringOption,
): number {
  const typeKey = `${scoringRule.format.toLowerCase()}_${getTournamentKeyFromType(scoringRule.tournament_type)}`;
  // Ensure typeKey is a valid key of RawPerformanceData
  if (typeKey in performance) {
    return parseInt(performance[typeKey as keyof RawPerformanceData] as string) * scoringRule.points || 0;
  } else {
    throw new Error(`Invalid typeKey: ${typeKey}`);
  }
}

function getTournamentKeyFromType(type: string): string {
  switch (type) {
    case 'Challenge Champion':
      return 'challenge_champs';
    case 'Challenge Top 8':
      return 'challenge_copies';
    case 'League 5-0':
      return 'league_copies';
    default:
      throw new Error(`Unknown tournament type: ${type}`);
  }
}