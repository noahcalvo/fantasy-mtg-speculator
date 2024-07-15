'use server';
import { sql } from '@vercel/postgres';
import { Card, CardDetails, CardPerformances, CardPoint, Collection } from './definitions';
import { unstable_noStore as noStore, revalidatePath } from 'next/cache';
import { fetchCard } from './card';

export async function fetchCardPerformanceByWeek(
  collectionIDs: number[],
  week: number,
): Promise<CardPerformances> {
  noStore();
  const queryString = `SELECT C.card_id, C.name, SUM(CP.champs * 5 + CP.copies * 0.5 + LP.copies * 0.25) AS total_points, PF.week
  FROM Cards C
  JOIN Performance PF ON C.card_id = PF.card_id
  LEFT JOIN ChallengePerformance CP ON PF.performance_id = CP.performance_id
  LEFT JOIN LeaguePerformance LP ON PF.performance_id = LP.performance_id
  WHERE PF.week = $1 AND C.card_id = ANY($2)
  GROUP BY C.card_id, C.name, PF.week`;
  let params = [week, collectionIDs];
  try {
    const result = await sql.query(queryString, params);
    // Convert points to numbers
    const convertedData = result.rows.map((row) => ({
      ...row,
      total_points: Number(row.total_points),
    }));
    return { cards: convertedData };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card point data for week');
  }
}

export async function fetchPlayerCollection(playerId: number, leagueId: number): Promise<number[]> {
  noStore();
  try {
    const data = await sql`
        SELECT 
          card_id
        FROM
          ownershipV3
        WHERE
          player_id = ${playerId}
        AND
          league_id = ${leagueId}
      `;

    const cardIds: number[] = data.rows.map(row => row.value);
    return cardIds;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch collection for player:${playerId}`);
  }
}

export async function fetchPlayerCollectionWithDetails(playerId: number, league_id: number): Promise<CardDetails[]> {
  noStore();
  try {
    const data = await sql<Card>`
        SELECT 
          C.card_id
        FROM
          Cards C
        JOIN 
          OwnershipV3 O ON C.card_id = O.card_id
        WHERE
          O.player_id = ${playerId}
        AND
          O.league_id = ${league_id}
        GROUP BY 
            C.card_id,
            C.name,
            C.origin
        ORDER BY
            C.name DESC;
      `;
    // Convert cardId to cardDetails
    const cardDetailsList: CardDetails[] = [];
    for (var card of data.rows) {
      cardDetailsList.push(await fetchCard(card.card_id));
    }
    return cardDetailsList;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(
      `Failed to fetch collection with card details for player:${playerId}`,
    );
  }
}

export async function fetchPlayerCollectionWithPerformance(playerId: number, league_id: number): Promise<CardPoint[]> {
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
    Cards C
    JOIN 
        OwnershipV3 O ON C.card_id = O.card_id
    JOIN 
        Performance PF ON C.card_id = PF.card_id
    LEFT JOIN 
        ChallengePerformance CP ON PF.performance_id = CP.performance_id
    LEFT JOIN 
        LeaguePerformance LP ON PF.performance_id = LP.performance_id

    WHERE
        O.player_id = ${playerId}
    AND
        O.league_id = ${league_id}
    AND PF.week = (
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
    const leagueIdQuery = await sql`SELECT league_id FROM draftsV2 WHERE draft_id = ${draftId}`;
    const leagueId = leagueIdQuery.rows[0].league_id;
    const picks = await sql`SELECT * FROM picksV3 WHERE draft_id = ${draftId}`;
    // for each pick in the draft, update the ownership table with the player_id
    for (const pick of picks.rows) {
      await sql`INSERT INTO ownershipV3 (player_id, card_id, league_id) VALUES (${pick.player_id}, ${pick.card_id}, ${leagueId});`;
    }
    revalidatePath(`/dashboard`);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to update collection with draft');
  }
}

export async function fetchPlayerCollectionsWithDetails(playerIds: number[], league_id: number): Promise<Collection[]> {
  const playerCollections: Collection[] = [];

  for (const playerId of playerIds) {
    try {
      const collectionDetails = await fetchPlayerCollectionWithDetails(playerId, league_id);
      playerCollections.push({ player_id: playerId, cards: collectionDetails });
    } catch (error) {
      console.error(`Failed to fetch details for playerId ${playerId}: ${error}`);
      throw new Error(`Failed to get collection for ${playerId}`);
    }
  }
  return playerCollections;
}

export async function playerOwnsCards(playerId: number, cardIds: number[], league_id: number): Promise<boolean> {
  try {
    const collection = await fetchPlayerCollection(playerId, league_id);
    cardIds.forEach((cardId: number) => {
      if (!collection.includes(cardId)) {
        return false
      }
    })
    return true
  } catch (error) {
    console.error(`Failed to check if player ${playerId} owns ${cardIds}`, error);
    throw new Error(`Failed to check if player ${playerId} owns ${cardIds}`);
  }
}