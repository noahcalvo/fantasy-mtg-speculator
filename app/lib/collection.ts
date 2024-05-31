'use server';
import { sql } from '@vercel/postgres';
import { Card, CardPoint } from './definitions';
import { unstable_noStore as noStore, revalidatePath } from 'next/cache';

export async function fetchCardPerformanceByWeek(
  collectionIDs: number[],
  week: number,
) {
  noStore();
  const queryString = `SELECT C.card_id, C.name, SUM(CP.champs * 5 + CP.copies * 0.5 + LP.copies * 0.25) AS total_points
  FROM Cards C
  JOIN Performance PF ON C.card_id = PF.card_id
  LEFT JOIN ChallengePerformance CP ON PF.performance_id = CP.performance_id
  LEFT JOIN LeaguePerformance LP ON PF.performance_id = LP.performance_id
  WHERE PF.week = $1 AND C.card_id = ANY($2)
  GROUP BY C.card_id, C.name`;
  let params = [week, collectionIDs];
  try {
    const result = await sql.query(queryString, params);
    // Convert points to numbers
    const convertedData = result.rows.map((row) => ({
      ...row,
      total_points: Number(row.total_points),
    }));
    return convertedData;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card point data for week');
  }
}

export async function fetchPlayerCollection(userEmail: string) {
  noStore();
  try {
    const data = await sql<Card>`
        SELECT 
        C.card_id, 
        C.name
        FROM 
            Users U
        JOIN 
            Ownership O ON U.player_id = O.player_id
        JOIN 
            Cards C ON O.card_id = C.card_id
        WHERE 
            U.email = ${userEmail}
        GROUP BY 
            C.card_id,
            C.name
        ORDER BY
            C.name DESC;
      `;
    // Convert points to numbers
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card point data for week');
  }
}

export async function fetchPlayerCollectionWithPerformance(userEmail: string) {
  noStore();
  try {
    const data = await sql<CardPoint>`
    SELECT 
    C.card_id, 
    C.name, 
    SUM(
        COALESCE(CP.champs * 5, 0) +
        COALESCE(CP.copies * 0.5, 0) +
        COALESCE(LP.copies * 0.25, 0)
    ) AS total_points,
    PF.week
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
      U.email = ${userEmail} AND PF.week = (
        SELECT MAX(week) FROM Performance WHERE card_id = C.card_id
      )
    GROUP BY 
        C.card_id,
        C.name,
        PF.week
    ORDER BY
      total_points DESC;        `;
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

export async function updateCollectionWithCompleteDraft(draftId: string) {
  noStore();
  try {
    const picks = await sql`SELECT * FROM Picks WHERE draft_id = ${draftId}`
    // for each pick in the draft, update the ownership table with the player_id
    for (const pick of picks.rows) {
      await sql`INSERT INTO ownership (player_id, card_id) VALUES (${pick.player_id}, ${pick.card_id});`;
    }
    console.log(picks)
    revalidatePath(`/dashboard`);  
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to update collection with draft');
  }
}
