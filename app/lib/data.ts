'use server';

import { sql } from '@vercel/postgres';
import { CardPoint } from './definitions';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchTopCards() {
  noStore();
  try {
    const data = await sql<CardPoint>`
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
        GROUP BY 
            Cards.card_id,
            Cards.name
        ORDER BY 
            total_points DESC
        LIMIT 15;
    `;
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
    const data = await sql<CardPoint>`
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
            Performance.week = ${week}
        GROUP BY 
            Cards.card_id,
            Cards.name
        ORDER BY 
            total_points DESC
        LIMIT 15;
    `;

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
    const data = await sql<CardPoint>`
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
            Performance.week = ${week} AND Cards.origin = ${set}
        GROUP BY 
            Cards.card_id,
            Cards.name
        ORDER BY 
            total_points DESC
        LIMIT 15;
    `;
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
    const data = await sql<CardPoint>`
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
            Cards.origin = ${set}
          GROUP BY 
              Cards.card_id,
              Cards.name
          ORDER BY 
              total_points DESC
          LIMIT 15;
      `;
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
      const data = await sql`
          SELECT DISTINCT
              Performance.week
          FROM 
              Performance
          ORDER BY 
              Performance.week;
      `;
  
      // Convert week numbers to numbers
      const convertedData = data.rows.map((row) => Number(row.week));
      return convertedData;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch unique week numbers');
    }
  }