'use server';

import { CardPerformances, CardPoint, RawPerformanceData, RosterIdMap, ScoringOption, TeamPerformance, WeeklyLeaguePerformances } from './definitions';
import pg from 'pg';
import { fetchAllLeagues, fetchPlayersInLeague, fetchScoringOptions } from './leagues';
import { getCurrentWeek } from './utils';
import { fetchPlayerRoster } from './rosters';
import { revalidatePath } from 'next/cache';
import { calculatePointsFromPerformances } from './performance-utils';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

function getPerformanceTableNames(format: string) {
  let challengeTable = '';
  let leagueTable = '';

  if (format === 'standard') {
    challengeTable = 'StandardChallengePerformance';
    leagueTable = 'StandardLeaguePerformance';
  } else if (format === 'modern') {
    challengeTable = 'ModernChallengePerformance';
    leagueTable = 'ModernLeaguePerformance';
  } else {
    throw new Error('Invalid format specified');
  }

  return { challengeTable, leagueTable };
}

function getFormatsFromScoringOptions(scoringOptions: ScoringOption[]): string[] {
  return Array.from(new Set(scoringOptions.map(option => option.format)));
}

function addPointsFromFormat(cardsWithPoints: CardPoint[], pointsFromFormat: CardPoint[]) {
  pointsFromFormat.forEach(point => {
    const existingCard = cardsWithPoints.find(card => card.card_id === point.card_id && card.week === point.week);
    if (existingCard) {
      existingCard.total_points += point.total_points;
    } else {
      cardsWithPoints.push(point);
    }
  })
}

export async function fetchTopCards(scoringOptions: ScoringOption[], week: number, set: string): Promise<CardPerformances> {
  let weekToFetch = week
  if (week == -1) {
    weekToFetch = getCurrentWeek()
  }
  const cardPerformances = await fetchCardPerformanceByScoringOptWeekSet(scoringOptions, weekToFetch, set);
  // return the top 20 performers
  cardPerformances.cards.sort((a, b) => b.total_points - a.total_points);
  return { cards: cardPerformances.cards.slice(0, 20) };
}

export async function fetchCardPerformanceByScoringOptWeekSet(scoringOptions: ScoringOption[], week: number, set: string): Promise<CardPerformances> {
  try {
    const formats = getFormatsFromScoringOptions(scoringOptions);
    if (formats.length === 0) {
      throw new Error('No formats found in scoring options');
    }
    let cardsWithPoints: CardPoint[] = [];
    for (const format of formats) {
      if (!['modern', 'standard'].includes(format)) {
        throw new Error(`Invalid format: ${format}`);
      }
      const { challengeTable, leagueTable } = getPerformanceTableNames(format);
      const query = `
        SELECT 
            C.card_id, 
            C.name,
            PF.week,
            ${challengeTable}.champs AS ${format}_challenge_champs,
            ${challengeTable}.copies AS ${format}_challenge_copies,
            ${leagueTable}.copies AS ${format}_league_copies
        FROM
            Cards C
        JOIN 
            Performance PF ON C.card_id = PF.card_id
        LEFT JOIN 
            ${challengeTable} ON PF.performance_id = ${challengeTable}.performance_id
        LEFT JOIN 
            ${leagueTable} ON PF.performance_id = ${leagueTable}.performance_id
        WHERE
            PF.week = $1
            ${set ? 'AND C.set = $2' : ''}
        GROUP BY 
            C.card_id,
            C.name,
            PF.week,
            ${challengeTable}.champs,
            ${challengeTable}.copies,
            ${leagueTable}.copies
        ORDER BY
            C.name;
      `;

      const params = set ? [week, set] : [week];
      const data = await pool.query(query, params);

      const pointsFromFormat = calculatePointsFromPerformances(data.rows, scoringOptions);
      addPointsFromFormat(cardsWithPoints, pointsFromFormat);
    }


    return { cards: cardsWithPoints };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch top cards');
  }
}

export async function fetchUniqueWeekNumbers() {

  try {
    const data = await pool.query(`
          SELECT DISTINCT
              week
          FROM 
              Performance
          ORDER BY 
              week;
      `);

    // Convert week numbers to numbers
    const convertedData = data.rows.map((row) => Number(row.week));
    return convertedData;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch unique week numbers');
  }
}

export async function fetchLeagueWeeks(leagueId: number) {

  try {
    const data = await pool.query(`
          SELECT DISTINCT
              week
          FROM 
              TeamPerformancesv3
          WHERE
              league_id = $1
          ORDER BY 
              week DESC;
      `, [leagueId]);
    // Convert week numbers to numbers
    const convertedData = data.rows.map((row) => Number(row.week));
    return convertedData;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch unique week numbers');
  }
}

export async function fetchRosterFromTeamPerformance(playerId: number, leagueId: number, week: number): Promise<RosterIdMap> {

  try {
    const data = await pool.query(`
          SELECT 
              roster
          FROM 
              TeamPerformancesV3
          WHERE 
              player_id = $1
          AND 
              league_id = $2
          AND 
              week = $3;
      `, [playerId, leagueId, week]);

    return data.rows[0]?.roster ?? {};
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch unique week numbers');
  }
}

export async function updateWeeklyTeamPerformance(leagueId: number, week: number, player: number) {
  'use client'
  try {
    const roster = await fetchRosterFromTeamPerformance(player, leagueId, week);
    let cardIds = [];
    for (let rosterPosition in roster) {
      const cardId = roster[rosterPosition];
      const parseCardId = parseInt(cardId);
      // turn cardId into a number and push it to the cardIds array if it is a number
      if (typeof parseCardId === 'number' && parseCardId != 0 && !isNaN(parseCardId)) {
        cardIds.push(parseInt(cardId));
      }
    }

    const performances = await fetchCardPerformanceByWeek(cardIds, leagueId, week);
    let points = 0;

    performances.cards.forEach((performance: CardPoint) => {
      points += performance.total_points;
    })

    const performanceId = await upsertWeeklyTeamPerformance(leagueId, roster, week, player, points);

    const performanceIdValue = performanceId.rows[0].performance_id;
    return performanceIdValue;
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
}

async function updateWeeklyPerformance(week: number) {
  const leagues = await fetchAllLeagues();
  if (leagues != null) {
    const leagueIds = leagues.map(league => league.league_id);
    for (let leagueId of leagueIds) {
      const players = await fetchPlayersInLeague(leagueId);
      for (let player of players) {
        await updateWeeklyTeamPerformance(leagueId, week, player.player_id);
      }
    }
  }

}

async function initWeeklyPerformnceRoster(week: number) {
  const leagues = await fetchAllLeagues();
  if (leagues != null) {
    const leagueIds = leagues.map(league => league.league_id);
    for (let leagueId of leagueIds) {
      const players = await fetchPlayersInLeague(leagueId);
      for (let player of players) {
        const roster = await fetchPlayerRoster(player.player_id, leagueId);
        await upsertWeeklyTeamPerformance(leagueId, roster, week, player.player_id, 0);
        revalidatePath(`/league/${leagueId}/teams/${player.player_id}`);
      }
    }
  }
}

export async function runMondayTask() {
  try {
    const week = getCurrentWeek();
    const lastWeek = week - 1
    await updateWeeklyPerformance(lastWeek);
    await initWeeklyPerformnceRoster(week);
  } catch (error) {
    console.error('Database Error:', error);
    throw error
  }
}

async function upsertWeeklyTeamPerformance(leagueId: number, roster: RosterIdMap, week: number, player: number, points: number) {
  try {
    const performanceId = await pool.query(
      `INSERT INTO
      TeamPerformancesV3 (league_id, player_id, week, points, roster)
    VALUES
      ($1, $2, $3, $4, $5)
    ON CONFLICT (league_id, player_id, week) 
    DO UPDATE SET
      points = EXCLUDED.points,
      roster = EXCLUDED.roster
    RETURNING performance_id;
      `, [leagueId, player, week, points * 100, JSON.stringify(roster)]);
    return performanceId
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
}

export async function fetchWeeklyLeaguePerformance(leagueId: number, week: number): Promise<WeeklyLeaguePerformances> {

  if (week == getCurrentWeek()) {
    try {
      const data = await fetchOngoingWeekPerformance(leagueId);
      return {
        league_id: leagueId,
        teams: data
      }
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch ongoing week performance');
    }
  }
  try {
    const data = await pool.query(`
          SELECT 
              player_id,
              points,
              roster,
              week
          FROM 
              TeamPerformancesV3
          WHERE 
              league_id = $1
          AND 
              week = $2;
      `, [leagueId, week]);

    return {
      league_id: leagueId,
      teams: data.rows
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch unique week numbers');
  }
}

export async function fetchAlltimeLeaguePerformance(leagueId: number): Promise<WeeklyLeaguePerformances> {

  try {
    const data = await pool.query(`
          SELECT 
              player_id,
              SUM(points) as points
          FROM 
              TeamPerformancesV3
          WHERE 
              league_id = $1
          GROUP BY
              player_id;
      `, [leagueId]);

    const ongoingData = await fetchOngoingWeekPerformance(leagueId);
    const allTimeData: TeamPerformance[] = data.rows.map((row) => {
      const player = ongoingData.find((team) => team.player_id === row.player_id);
      return {
        player_id: row.player_id,
        points: +row.points + (player?.points ?? 0),
        week: -1,
        roster: player?.roster ?? {}
      }
    })

    return {
      league_id: leagueId,
      teams: allTimeData
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch unique week numbers');
  }
}

export async function fetchAlltimeLeaguePerformanceLastWeek(leagueId: number): Promise<WeeklyLeaguePerformances> {

  try {
    const data = await pool.query(`
          WITH LatestWeek AS (
              SELECT MAX(week) as max_week
              FROM TeamPerformancesV3
              WHERE league_id = $1
              AND points > 0
          )
          SELECT 
              tp.player_id,
              SUM(tp.points) as points
          FROM 
              TeamPerformancesV3 tp
          JOIN LatestWeek lw ON tp.week < lw.max_week
          WHERE 
              tp.league_id = $1
          GROUP BY
              tp.player_id;
      `, [leagueId]);

    return {
      league_id: leagueId,
      teams: data.rows
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch unique week numbers');
  }
}

export async function fetchOngoingWeekPerformance(leagueId: number): Promise<TeamPerformance[]> {

  const week = getCurrentWeek();
  let performances: TeamPerformance[] = [];
  try {
    const players = await fetchPlayersInLeague(leagueId);
    for (let player of players) {
      const roster = await fetchRosterFromTeamPerformance(player.player_id, leagueId, week);
      let cardIds = [];
      for (let rosterPosition in roster) {
        const cardId = roster[rosterPosition];
        const parseCardId = parseInt(cardId);
        // turn cardId into a number and push it to the cardIds array if it is a number
        if (typeof parseCardId === 'number' && parseCardId != 0 && !isNaN(parseCardId)) {
          cardIds.push(parseInt(cardId));
        }
      }

      const rosterPerformances = await fetchCardPerformanceByWeek(cardIds, leagueId, week);
      let points = 0;

      rosterPerformances.cards.forEach((cardPerformance: CardPoint) => {
        points += cardPerformance.total_points;
      })
      performances.push({
        player_id: player.player_id,
        points: points * 100,
        week: week,
        roster: roster
      });
    }
    return performances;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch unique week numbers');
  }
}

export async function fetchCardPerformances(cardIds: number[], leagueId: number): Promise<CardPoint[]> {
  if (cardIds.length === 0) {
    return [];
  }

  try {
    // Get the custom scoring options for this league
    const scoringOptions = await fetchScoringOptions(leagueId);

    // Fetch raw performance data
    const rawPerformanceData = await fetchRawPerformanceData(cardIds);

    // Calculate points and format the response
    const cardsWithPoints = calculatePointsFromPerformances(rawPerformanceData, scoringOptions);

    // Sort by points after calculation
    return cardsWithPoints.sort((a, b) => b.total_points - a.total_points);

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card point data for week');
  }
}

// Helper function for fetching raw performance data
async function fetchRawPerformanceData(cardIds: number[]): Promise<RawPerformanceData[]> {
  const data = await pool.query(
    `SELECT 
      C.card_id, 
      C.name,
      PF.week,
      
      -- Format-specific performance data with clear naming for easy processing
      
      -- Modern Format
      MCP.champs AS modern_challenge_champs,
      MCP.copies AS modern_challenge_copies,
      MLP.copies AS modern_league_copies,
      
      -- Standard Format
      SCP.champs AS standard_challenge_champs,
      SCP.copies AS standard_challenge_copies,
      SLP.copies AS standard_league_copies
      
      -- Additional formats can be added here following the same pattern
      
    FROM
      Cards C
    JOIN 
      Performance PF ON C.card_id = PF.card_id
    LEFT JOIN 
      ModernChallengePerformance MCP ON PF.performance_id = MCP.performance_id
    LEFT JOIN 
      ModernLeaguePerformance MLP ON PF.performance_id = MLP.performance_id
    LEFT JOIN 
      StandardChallengePerformance SCP ON PF.performance_id = SCP.performance_id
    LEFT JOIN 
      StandardLeaguePerformance SLP ON PF.performance_id = SLP.performance_id
    WHERE
      C.card_id = ANY($1::int[])
      AND PF.week = (
        SELECT MAX(week) FROM Performance WHERE card_id = C.card_id
      )
    GROUP BY 
      C.card_id,
      C.name,
      PF.week,
      MCP.champs,
      MCP.copies,
      MLP.copies,
      SCP.champs,
      SCP.copies,
      SLP.copies
    ORDER BY
      C.name;
    `, [cardIds]);

  return data.rows;
}

// Helper function for fetching raw performance data
export async function fetchRawPerformanceDataByWeek(cardIds: number[], week: number): Promise<any[]> {
  const data = await pool.query(
    `SELECT 
      C.card_id, 
      C.name,
      PF.week,
      
      -- Format-specific performance data with clear naming for easy processing
      
      -- Modern Format
      MCP.champs AS modern_challenge_champs,
      MCP.copies AS modern_challenge_copies,
      MLP.copies AS modern_league_copies,
      
      -- Standard Format
      SCP.champs AS standard_challenge_champs,
      SCP.copies AS standard_challenge_copies,
      SLP.copies AS standard_league_copies
      
      -- Additional formats can be added here following the same pattern
      
    FROM
      Cards C
    JOIN 
      Performance PF ON C.card_id = PF.card_id
    LEFT JOIN 
      ModernChallengePerformance MCP ON PF.performance_id = MCP.performance_id
    LEFT JOIN 
      ModernLeaguePerformance MLP ON PF.performance_id = MLP.performance_id
    LEFT JOIN 
      StandardChallengePerformance SCP ON PF.performance_id = SCP.performance_id
    LEFT JOIN 
      StandardLeaguePerformance SLP ON PF.performance_id = SLP.performance_id
    WHERE
      C.card_id = ANY($1::int[])
      AND PF.week = $2
    GROUP BY 
      C.card_id,
      C.name,
      PF.week,
      MCP.champs,
      MCP.copies,
      MLP.copies,
      SCP.champs,
      SCP.copies,
      SLP.copies
    ORDER BY
      C.name;
    `, [cardIds, week]);

  return data.rows;
}

export async function fetchCardPerformanceByWeek(collectionIDs: number[], leagueId: number, week: number): Promise<CardPerformances> {
  if (collectionIDs.length === 0) {
    return { cards: [] };
  }

  try {
    // Fetch scoring options and raw performance data concurrently
    const [scoringOptions, rawPerformanceData] = await Promise.all([
      fetchScoringOptions(leagueId),
      fetchRawPerformanceDataByWeek(collectionIDs, week)
    ]);

    // Calculate points and format the response
    const cardsWithPoints = calculatePointsFromPerformances(rawPerformanceData, scoringOptions);


    // Sort by points after calculation
    const sortedPerformances = cardsWithPoints.sort((a, b) => b.total_points - a.total_points);
    return { cards: sortedPerformances };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card point data for week');
  }
}

export async function fetchLastNWeeksCardPerformance(cardId: number, weeks: number, scoringOptions: ScoringOption[]): Promise<CardPoint[]> {
  try {
    const formats = getFormatsFromScoringOptions(scoringOptions);
    if (formats.length === 0) {
      throw new Error('No formats found in scoring options');
    }
    let weeksOfPoints: CardPoint[] = [];
    for (const format of formats) {
      if (!['modern', 'standard'].includes(format)) {
        throw new Error(`Invalid format: ${format}`);
      }
      const { challengeTable, leagueTable } = getPerformanceTableNames(format);
      const query = `
      SELECT 
          C.card_id, 
          C.name,
          PF.week,
          ${challengeTable}.champs AS ${format}_challenge_champs,
          ${challengeTable}.copies AS ${format}_challenge_copies,
          ${leagueTable}.copies AS ${format}_league_copies
      FROM
          Cards C
      JOIN 
          Performance PF ON C.card_id = PF.card_id
      LEFT JOIN 
          ${challengeTable} ON PF.performance_id = ${challengeTable}.performance_id
      LEFT JOIN 
          ${leagueTable} ON PF.performance_id = ${leagueTable}.performance_id
      WHERE
          C.card_id = $1
          AND PF.week >= (
              SELECT MAX(week) - $2 FROM Performance WHERE card_id = $1
          )
      GROUP BY 
          C.card_id,
          C.name,
          PF.week,
          ${challengeTable}.champs,
          ${challengeTable}.copies,
          ${leagueTable}.copies
      ORDER BY
          PF.week DESC;
    `;


      const data = await pool.query(query, [cardId, weeks - 1]);

      const pointsFromFormat = calculatePointsFromPerformances(data.rows, scoringOptions);
      addPointsFromFormat(weeksOfPoints, pointsFromFormat);
    }
    // Fill in missing weeks with zeros
    const filledData = [];
    for (let i = 0; i < weeks; i++) {
      const weekData = weeksOfPoints.find((row) => row.week === getCurrentWeek() - i);
      if (weekData) {
        filledData.push(weekData);
      } else {
        filledData.push({
          card_id: cardId,
          name: '',
          total_points: 0,
          week: getCurrentWeek() - i,
        });
      }
    }
    return weeksOfPoints
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch last N weeks card performance');
  }
}