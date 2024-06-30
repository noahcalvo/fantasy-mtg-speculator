'use server';

import { CardPoint, RosterIdMap } from './definitions';
import { unstable_noStore as noStore } from 'next/cache';
import pg from 'pg';
import { fetchAllLeagues, fetchPlayersInLeague } from './leagues';
import { getCurrentWeek } from './utils';
import { init } from 'next/dist/compiled/webpack/webpack';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});


export async function fetchTopCards() {
  noStore();
  try {
    const data = await pool.query(
      `SELECT 
            Cards.card_id,
            Cards.name,
            SUM(
                COALESCE(ChallengePerformance.champs * 5, 0) +
                COALESCE(ChallengePerformance.copies * 0.5, 0) +
                COALESCE(LeaguePerformance.copies * 0.25, 0)
            ) AS total_points
        FROM 
            Cards
        JOIN 
            Performance ON Cards.card_id = Performance.card_id
        LEFT JOIN 
            ChallengePerformance ON Performance.performance_id = ChallengePerformance.performance_id
        LEFT JOIN 
            LeaguePerformance ON Performance.performance_id = LeaguePerformance.performance_id
        GROUP BY 
            Cards.card_id,
            Cards.name
        ORDER BY 
            total_points DESC
        LIMIT 15;
    `);
    // Convert points to numbers
    const convertedData = data.rows.map((row) => ({
      ...row,
      total_points: Number(row.total_points),
    }));
    return convertedData;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card point data for week');
  }
}

export async function fetchCardPerformances(cardIds: number[]): Promise<CardPoint[]> {
  if (cardIds.length === 0) {
    return [];
  }
  noStore();
  try {
    const data = await pool.query(
      `SELECT 
      C.card_id, 
      C.name, 
      SUM(
          COALESCE(CP.champs * 5, 0) +
          COALESCE(CP.copies * 0.5, 0) +
          COALESCE(LP.copies * 0.25, 0)
      ) AS total_points,
      PF.week
      FROM
      Cards C
      JOIN 
          Performance PF ON C.card_id = PF.card_id
      LEFT JOIN 
          ChallengePerformance CP ON PF.performance_id = CP.performance_id
      LEFT JOIN 
          LeaguePerformance LP ON PF.performance_id = LP.performance_id
    WHERE
        C.card_id = ANY($1::int[])
      AND PF.week = (
          SELECT MAX(week) FROM Performance WHERE card_id = C.card_id
      )
      GROUP BY 
          C.card_id,
          C.name,
          PF.week
      ORDER BY
        total_points DESC;
      `, [cardIds]);
    // Convert points to numbers
    const convertedData = data.rows.map((row) => ({
      ...row,
      total_points: Number(row.total_points),
    }));
    return convertedData;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card point data for week');
  }
}

export async function fetchCardPerformancesFromWeek(cardIds: number[], week: number): Promise<CardPoint[]> {
  if (cardIds.length === 0) {
    return [];
  }
  noStore();
  try {
    const data = await pool.query(
      `SELECT 
    C.card_id, 
    C.name, 
    SUM(
        COALESCE(CP.champs * 5, 0) +
        COALESCE(CP.copies * 0.5, 0) +
        COALESCE(LP.copies * 0.25, 0)
    ) AS total_points,
    PF.week
    FROM
    Cards C
    JOIN 
        Performance PF ON C.card_id = PF.card_id
    LEFT JOIN 
        ChallengePerformance CP ON PF.performance_id = CP.performance_id
    LEFT JOIN 
        LeaguePerformance LP ON PF.performance_id = LP.performance_id
  WHERE
      C.card_id = ANY($1::int[])
    AND PF.week = $2
    GROUP BY 
        C.card_id,
        C.name,
        PF.week
    ORDER BY
      total_points DESC;
    `, [cardIds, week]);
    // Convert points to numbers
    const convertedData = data.rows.map((row) => ({
      ...row,
      total_points: Number(row.total_points),
    }));
    return convertedData;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card point data for week');
  }
}

export async function fetchTopWeeklyCards(week: number) {
  noStore();
  try {
    const data = await pool.query(
      `
        SELECT 
            Cards.card_id,
            Cards.name,
            SUM(
                COALESCE(ChallengePerformance.champs * 5, 0) +
                COALESCE(ChallengePerformance.copies * 0.5, 0) +
                COALESCE(LeaguePerformance.copies * 0.25, 0)
            ) AS total_points
        FROM 
            Cards
        JOIN 
            Performance ON Cards.card_id = Performance.card_id
        LEFT JOIN 
            ChallengePerformance ON Performance.performance_id = ChallengePerformance.performance_id
        LEFT JOIN 
            LeaguePerformance ON Performance.performance_id = LeaguePerformance.performance_id
        WHERE 
            Performance.week = $1
        GROUP BY 
            Cards.card_id,
            Cards.name
        ORDER BY 
            total_points DESC
        LIMIT 15;
    `, [week]);

    // Convert points to numbers
    const convertedData = data.rows.map((row) => ({
      ...row,
      total_points: Number(row.total_points),
    }));
    return convertedData;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card point data for week');
  }
}

export async function fetchTopWeeklyCardsFromSet(week: number, set: string) {
  noStore();
  try {
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    const data = await pool.query(
      `
        SELECT 
            Cards.card_id,
            Cards.name,
            SUM(
                COALESCE(ChallengePerformance.champs * 5, 0) +
                COALESCE(ChallengePerformance.copies * 0.5, 0) +
                COALESCE(LeaguePerformance.copies * 0.25, 0)
            ) AS total_points
        FROM 
            Cards
        JOIN 
            Performance ON Cards.card_id = Performance.card_id
        LEFT JOIN 
            ChallengePerformance ON Performance.performance_id = ChallengePerformance.performance_id
        LEFT JOIN 
            LeaguePerformance ON Performance.performance_id = LeaguePerformance.performance_id
        WHERE 
            Performance.week = $1 AND Cards.origin = $2
        GROUP BY 
            Cards.card_id,
            Cards.name
        ORDER BY 
            total_points DESC
        LIMIT 15;
    `, [week, set]);
    // Convert points to numbers
    const convertedData = data.rows.map((row) => ({
      ...row,
      total_points: Number(row.total_points),
    }));
    return convertedData;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card point data for week');
  }
}

export async function fetchTopCardsFromSet(set: string) {
  noStore();
  try {
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    const data = await pool.query(`
          SELECT 
              Cards.card_id,
              Cards.name,
              SUM(
                  COALESCE(ChallengePerformance.champs * 5, 0) +
                  COALESCE(ChallengePerformance.copies * 0.5, 0) +
                  COALESCE(LeaguePerformance.copies * 0.25, 0)
              ) AS total_points
          FROM 
              Cards
          JOIN 
              Performance ON Cards.card_id = Performance.card_id
          LEFT JOIN 
              ChallengePerformance ON Performance.performance_id = ChallengePerformance.performance_id
          LEFT JOIN 
              LeaguePerformance ON Performance.performance_id = LeaguePerformance.performance_id
          WHERE 
            Cards.origin = $1
          GROUP BY 
              Cards.card_id,
              Cards.name
          ORDER BY 
              total_points DESC
          LIMIT 15;
    `, [set]);
    // Convert points to numbers
    const convertedData = data.rows.map((row) => ({
      ...row,
      total_points: Number(row.total_points),
    }));
    return convertedData;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card point data for week');
  }
}

export async function fetchUniqueWeekNumbers() {
  noStore();
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

export async function fetchRosterFromTeamPerformance(playerId: number, leagueId: number, week: number): Promise<RosterIdMap> {
  noStore();
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

    return data.rows[0]?.roster ?? {} ;
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

    const performances = await fetchCardPerformancesFromWeek(cardIds, week);
    console.log(performances)
    let points = 0;

    performances.forEach((performance: CardPoint) => {
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
        const roster = await fetchRosterFromTeamPerformance(player.player_id, leagueId, week);
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
        const roster = await fetchRosterFromTeamPerformance(player.player_id, leagueId, week);
        await upsertWeeklyTeamPerformance(leagueId, roster, week, player.player_id, 0);
      }
    }
  }
}

export async function runMondayTask() {
  try{
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