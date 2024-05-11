import { sql } from '@vercel/postgres';
import { CardPoint } from './definitions';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchPlayerCollection(userEmail: string, week: number) {
  noStore();
  try {
    // await new Promise((resolve) => setTimeout(resolve, 3000));
    const data = await sql<CardPoint>`
        SELECT 
        C.card_id, 
        C.name, 
        SUM(
            COALESCE(CP.champs * 5, 0) +
            COALESCE(CP.decks * 0.5, 0) +
            COALESCE(LP.copies * 0.25, 0)
        ) AS total_points
        FROM 
            Users U
        JOIN 
            Ownership O ON U.player_id = O.player_id
        JOIN 
            Cards C ON O.card_id = C.card_id
        JOIN 
            Performance PF ON C.card_id = PF.card_id
        LEFT JOIN 
            ChallengePerformance CP ON PF.performance_id = CP.performance_id
        LEFT JOIN 
            LeaguePerformance LP ON PF.performance_id = LP.performance_id
        WHERE 
            U.email = ${userEmail} AND PF.week = ${week}
        GROUP BY 
            C.card_id,
            C.name
        ORDER BY
            total_points DESC;
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
