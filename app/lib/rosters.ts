'use server';

import { sql } from '@vercel/postgres';
import { CardDetails, RosterCardDetailsMap, RosterIdMap } from './definitions';
import { unstable_noStore as noStore, revalidatePath } from 'next/cache';
import { fetchCard } from './sets';

export type RosterSlotToId = {
  [key: string]: number;
};


export async function fetchPlayerRosterWithDetails(
  userId: number,
): Promise<RosterCardDetailsMap> {
  noStore();
  try {
    await checkRosterExists(userId);
    const data = await sql<RosterSlotToId>`
          SELECT 
              roster
          FROM 
              Rosters
          WHERE 
              player_id = ${userId}
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

async function fetchPlayerRoster(userId: number): Promise<RosterIdMap> {
  noStore();
  try {
    await checkRosterExists(userId);
    const data = await sql<RosterIdMap>`
          SELECT 
              roster
          FROM 
              Rosters
          WHERE 
              player_id = ${userId}
          LIMIT 1
        `;
        const rosterData = data.rows[0]?.roster;
        if (!rosterData || typeof rosterData !== 'object') {
          throw new Error(`Roster data for user:${userId} is in an unexpected format`);
        }
        
        return rosterData;
      } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch roster data for user:${userId}`);
  }
}

export async function playPositionSlot(
  cardId: number,
  userId: number,
  position: string,
): Promise<void> {
  noStore();
  position = position.toLowerCase();
  try {
    await checkRosterExists(userId);
    let roster = await fetchPlayerRoster(userId);

    const foundPositionCollision = Object.keys(roster).filter(key => roster[key] === cardId.toString());
    foundPositionCollision.forEach(async (key) => {
      await removeCardSlotQuery(userId, key)
    })
    await createSqlLineupQuery(userId, cardId, position);
    revalidatePath(`/dashboard`);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to update position slot for user:${userId} card:${cardId} position:${position}`);
  }
}

export async function checkRosterExists(userId: number): Promise<void> {
  noStore();
  try {
    // Check if a roster exists for the user
    const rosterExists = await sql`
        SELECT 
            1
        FROM 
            Rosters
        WHERE 
            player_id = ${userId};
    `;

    // If the roster doesn't exist, create an empty one
    if (!rosterExists.rows.length) {
      await sql`
          INSERT INTO 
              Rosters (player_id, roster)
          VALUES 
              (${userId}, '{}')
      `;
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to confirm roster exists for ${userId}`);
  }
}

const createSqlLineupQuery = (userId: number, cardId: number, position: string) => {
  switch (position) {
    case 'creature':
      return sql`
        UPDATE 
            Rosters
        SET 
            roster = roster || jsonb_build_object('creature', (${cardId}::text))
        WHERE 
            player_id = ${userId}
      `;
    case 'artifact/enchantment':
      return sql`
        UPDATE 
            Rosters
        SET 
            roster = roster || jsonb_build_object('artifact/enchantment', (${cardId}::text))
        WHERE 
            player_id = ${userId}
      `;
    case 'instant/sorcery':
      return sql`
        UPDATE 
            Rosters
        SET 
            roster = roster || jsonb_build_object('instant/sorcery', (${cardId}::text))
        WHERE 
            player_id = ${userId}
      `;
    case 'land':
      return sql`
        UPDATE 
            Rosters
        SET 
            roster = roster || jsonb_build_object('land', (${cardId}::text))
        WHERE 
            player_id = ${userId}
      `;
    default:
      return sql`
      UPDATE 
          Rosters
      SET 
          roster = roster || jsonb_build_object('flex', (${cardId}::text))
      WHERE 
          player_id = ${userId}
    `;
  }
}

const removeCardSlotQuery = (userId: number, position: string) => {
  switch (position) {
    case 'creature':
      return sql`
        UPDATE 
            Rosters
        SET 
            roster = roster || jsonb_build_object('creature', (''))
        WHERE 
            player_id = ${userId}
      `;
    case 'artifact/enchantment':
      return sql`
        UPDATE 
            Rosters
        SET 
            roster = roster || jsonb_build_object('artifact/enchantment', (''))
        WHERE 
            player_id = ${userId}
      `;
    case 'instant/sorcery':
      return sql`
        UPDATE 
            Rosters
        SET 
            roster = roster || jsonb_build_object('instant/sorcery', (''))
        WHERE 
            player_id = ${userId}
      `;
    case 'land':
      return sql`
        UPDATE 
            Rosters
        SET 
            roster = roster || jsonb_build_object('land', (''))
        WHERE 
            player_id = ${userId}
      `;
    default:
      return sql`
      UPDATE 
          Rosters
      SET 
          roster = roster || jsonb_build_object('flex', (''))
      WHERE 
          player_id = ${userId}
    `;
  }
}