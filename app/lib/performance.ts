'use server';

import { CardPoint } from './definitions';
import { unstable_noStore as noStore } from 'next/cache';
import pg from 'pg';

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
    `,[week]);

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
    `,[week, set]);
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