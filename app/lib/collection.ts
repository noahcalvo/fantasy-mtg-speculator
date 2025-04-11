'use server';
import { sql } from '@vercel/postgres';
import { Card, CardDetails, CardPoint, Collection, Player } from './definitions';
import { revalidatePath } from 'next/cache';
import { fetchCard } from './card';
import { fetchParticipantData } from './player';
import { fetchScoringOptions } from './leagues';
import { fetchCardPerformances } from './performance';

export async function fetchPlayerCollection(playerId: number, leagueId: number): Promise<number[]> {
  try {
    const data = await sql<{ card_id: number }>`
        SELECT 
          card_id
        FROM
          ownershipV3
        WHERE
          player_id = ${playerId}
        AND
          league_id = ${leagueId}
      `;

    console.log("data", data)

    const cardIds: number[] = data.rows.map(row => {
      console.log(row); return row.card_id
    });
    return cardIds;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch collection for player:${playerId}`);
  }
}

export async function fetchPlayerCollectionWithDetails(playerId: number, league_id: number): Promise<CardDetails[]> {
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
  try {
    const collection = await fetchPlayerCollection(playerId, league_id);
    console.log("collection", collection)
    if (collection.length === 0) {
      return [];
    }
    const cardScores = await fetchCardPerformances(collection, league_id);
    console.log("scores", cardScores)
    return cardScores
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(
      `Failed to fetch collection with performance for player:${playerId}`,
    );
  }
}

export async function updateCollectionWithCompleteDraft(draftId: number) {

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

export async function fetchOwnership(leagueId: number, cardId: number): Promise<Player | null> {

  try {
    const data = await sql`
        SELECT 
          player_id
        FROM
          ownershipV3
        WHERE
          league_id = ${leagueId}
        AND
          card_id = ${cardId}
      `;
    if (data.rows.length === 0) {
      return null;
    }
    const playerId: number = data.rows[0].player_id;
    const player = fetchParticipantData(playerId);
    return player;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch ownership for card:${cardId}`);
  }
}