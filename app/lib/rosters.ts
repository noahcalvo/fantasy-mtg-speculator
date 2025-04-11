'use server';

import { sql } from '@vercel/postgres';
import { CardDetails, CardPerformances, RosterCardDetailsMap, RosterIdMap } from './definitions';
import { revalidatePath } from 'next/cache';
import { fetchCard } from './card';
import { fetchCardPerformanceByWeek } from './performance';

export type RosterSlotToId = {
  [key: string]: number;
};

export async function fetchPlayerRosterWithDetails(
  userId: number,
  league_id: number,
): Promise<RosterCardDetailsMap> {

  try {
    await checkRosterExists(userId, league_id);
    const data = await sql<RosterSlotToId>`
          SELECT 
              roster
          FROM 
              RostersV2
          WHERE 
              player_id = ${userId}
          AND
              league_id = ${league_id}
          LIMIT 1
        `;
    // Convert cardId to cardDetails
    let newMap: { [key: string]: CardDetails } = {};

    if (data.rows[0]?.roster) {
      for (const [key, value] of Object.entries(data.rows[0].roster)) {
        if (value) {
          const valueNumber = parseInt(value);
          newMap[key] = await fetchCard(valueNumber);
        }
      }
    }
    return newMap;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch roster data for user:${userId}`);
  }
}

export async function fetchPlayerRoster(userId: number, leagueId: number): Promise<RosterIdMap> {

  try {
    await checkRosterExists(userId, leagueId);
    const data = await sql<RosterIdMap>`
          SELECT 
              roster
          FROM 
              RostersV2
          WHERE 
              player_id = ${userId}
          AND
              league_id = ${leagueId}
          LIMIT 1
        `;
    const rosterData = data.rows[0]?.roster;
    if (rosterData === undefined) {
      return {} as RosterIdMap;
    }
    if (!rosterData || typeof rosterData !== 'object') {
      throw new Error(
        `Roster data for user:${userId} is in an unexpected format`,
      );
    }
    return rosterData;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch roster data for user:${userId}`);
  }
}

export async function fetchPlayerRosterScore(
  userId: number,
  week: number,
  leagueId: number,
): Promise<CardPerformances> {
  try {
    const roster = await fetchPlayerRoster(userId, leagueId);

    // Assuming roster is an object with card IDs as keys
    const cardIds = Object.values(roster).map((card) => {
      const parsedId = parseInt(card, 10);
      return isNaN(parsedId) ? -1 : parsedId;
    });
    if (cardIds.length === 0) {
      return { cards: [] } as CardPerformances
    }
    const performances = await fetchCardPerformanceByWeek(cardIds, leagueId, week);
    return performances;
  } catch (error) {
    console.error('Error fetching player roster scores:', error);
    throw new Error(`Failed to fetch roster scores for user:${userId}`);
  }
}

export async function playPositionSlot(
  cardId: number,
  userId: number,
  position: string,
  leagueId: number
): Promise<void> {

  position = position.toLowerCase();
  try {
    await checkRosterExists(userId, leagueId);
    let roster = await fetchPlayerRoster(userId, leagueId);

    const foundPositionCollision = Object.keys(roster).filter(
      (key) => roster[key] === cardId.toString(),
    );
    foundPositionCollision.forEach(async (key) => {
      await removeCardSlotQuery(userId, key, leagueId);
    });
    await createSqlLineupQuery(userId, cardId, position, leagueId);
    revalidatePath(`/dashboard`);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(
      `Failed to update position slot for user:${userId} card:${cardId} position:${position}`,
    );
  }
}

export async function checkRosterExists(userId: number, leagueId: number): Promise<void> {

  try {
    // Check if a roster exists for the user
    const rosterExists = await sql`
        SELECT 
            1
        FROM 
            RostersV2
        WHERE 
            player_id = ${userId}
        AND
            league_id = ${leagueId};
    `;

    // If the roster doesn't exist, create an empty one
    if (!rosterExists.rows.length) {
      await sql`
          INSERT INTO 
              RostersV2 (player_id, roster, league_id)
          VALUES 
              (${userId}, '{}', ${leagueId})
      `;
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to confirm roster exists for ${userId}`);
  }
}

const createSqlLineupQuery = (
  userId: number,
  cardId: number,
  position: string,
  leagueId: number
) => {
  switch (position) {
    case 'creature':
      return sql`
        UPDATE 
            RostersV2
        SET 
            roster = roster || jsonb_build_object('creature', (${cardId}::text))
        WHERE 
            player_id = ${userId}
        AND
            league_id = ${leagueId}
      `;
    case 'artifact/enchantment':
      return sql`
        UPDATE 
            RostersV2
        SET 
            roster = roster || jsonb_build_object('artifact/enchantment', (${cardId}::text))
        WHERE 
            player_id = ${userId}
        AND
            league_id = ${leagueId}
      `;
    case 'instant/sorcery':
      return sql`
        UPDATE 
            RostersV2
        SET 
            roster = roster || jsonb_build_object('instant/sorcery', (${cardId}::text))
        WHERE 
            player_id = ${userId}
        AND
            league_id = ${leagueId}
      `;
    case 'land':
      return sql`
        UPDATE 
            RostersV2
        SET 
            roster = roster || jsonb_build_object('land', (${cardId}::text))
        WHERE 
            player_id = ${userId}
        AND
            league_id = ${leagueId}
      `;
    default:
      return sql`
      UPDATE 
          RostersV2
      SET 
          roster = roster || jsonb_build_object('flex', (${cardId}::text))
      WHERE 
          player_id = ${userId}
      AND
          league_id = ${leagueId}
    `;
  }
};

const removeCardSlotQuery = (userId: number, position: string, leagueId: number) => {
  switch (position) {
    case 'creature':
      return sql`
        UPDATE 
            RostersV2
        SET 
            roster = roster || jsonb_build_object('creature', (''))
        WHERE 
            player_id = ${userId}
        AND
            league_id = ${leagueId}
      `;
    case 'artifact/enchantment':
      return sql`
        UPDATE 
            RostersV2
        SET 
            roster = roster || jsonb_build_object('artifact/enchantment', (''))
        WHERE 
            player_id = ${userId}
        AND
            league_id = ${leagueId}
      `;
    case 'instant/sorcery':
      return sql`
        UPDATE 
            RostersV2
        SET 
            roster = roster || jsonb_build_object('instant/sorcery', (''))
        WHERE 
            player_id = ${userId}
        AND
            league_id = ${leagueId}
      `;
    case 'land':
      return sql`
        UPDATE 
            RostersV2
        SET 
            roster = roster || jsonb_build_object('land', (''))
        WHERE 
            player_id = ${userId}
        AND
            league_id = ${leagueId}
      `;
    default:
      return sql`
      UPDATE 
          RostersV2
      SET 
          roster = roster || jsonb_build_object('flex', (''))
      WHERE 
          player_id = ${userId}
      AND
          league_id = ${leagueId}
    `;
  }
};
