'use server';

import { sql } from '@vercel/postgres';
import { CardDetails, RosterCardDetailsMap, RosterIdMap } from './definitions';
import { unstable_noStore as noStore, revalidatePath } from 'next/cache';
import { fetchCard } from './sets';

export type RosterSlotToId = {
  [key: string]: number;
};


export async function fetchPlayerRosterWithDetails(
  userEmail: string,
): Promise<RosterCardDetailsMap> {
  noStore();
  try {
    await checkRosterExists(userEmail);
    const data = await sql<RosterSlotToId>`
          SELECT 
              R.roster
          FROM 
              Rosters R
          JOIN 
              Users U ON R.player_id = U.player_id
          WHERE 
              U.email = ${userEmail}
          LIMIT 1
        `;
    // Convert cardId to cardDetails
    let newMap: { [key: string]: CardDetails } = {};

    if (data.rows[0]?.roster) {
      for (const [key, value] of Object.entries(data.rows[0].roster)) {
        if (value) {
          newMap[key] = await fetchCard(value);
        }
      }
    }
    return newMap;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch roster data for ${userEmail}`);
  }
}

async function fetchPlayerRoster(userEmail: string): Promise<RosterIdMap> {
  noStore();
  try {
    await checkRosterExists(userEmail);
    const data = await sql<RosterIdMap>`
          SELECT 
              R.roster
          FROM 
              Rosters R
          JOIN 
              Users U ON R.player_id = U.player_id
          WHERE 
              U.email = ${userEmail}
          LIMIT 1
        `;
        const rosterData = data.rows[0]?.roster;
        if (!rosterData || typeof rosterData !== 'object') {
          throw new Error(`Roster data for ${userEmail} is in an unexpected format`);
        }
        
        return rosterData;
      } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch roster data for ${userEmail}`);
  }
}

export async function playPositionSlot(
  cardId: number,
  userEmail: string,
  position: string,
): Promise<void> {
  noStore();
  position = position.toLowerCase();
  try {
    await checkRosterExists(userEmail);
    let roster = await fetchPlayerRoster(userEmail);

    const foundPositionCollision = Object.keys(roster).filter(key => roster[key] === cardId.toString());
    foundPositionCollision.forEach(async (key) => {
      await removeCardSlotQuery(userEmail, key)
    })
    await createSqlLineupQuery(userEmail, cardId, position);
    revalidatePath(`/dashboard`);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to update position slot for ${userEmail} ${cardId} ${position}`);
  }
}

export async function checkRosterExists(userEmail: string): Promise<void> {
  noStore();
  try {
    // Check if a roster exists for the user
    const rosterExists = await sql`
        SELECT 
            1
        FROM 
            Rosters
        WHERE 
            player_id = (SELECT player_id FROM Users WHERE email = ${userEmail})
    `;

    // If the roster doesn't exist, create an empty one
    if (!rosterExists.rows.length) {
      await sql`
          INSERT INTO 
              Rosters (player_id, roster)
          VALUES 
              ((SELECT player_id FROM Users WHERE email = ${userEmail}), '{}')
      `;
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to confirm roster exists for ${userEmail}`);
  }
}

const createSqlLineupQuery = (userEmail: string, cardId: number, position: string) => {
  switch (position) {
    case 'creature':
      return sql`
        UPDATE 
            Rosters
        SET 
            roster = roster || jsonb_build_object('creature', (${cardId}::text))
        WHERE 
            player_id = (SELECT player_id FROM Users WHERE email = ${userEmail})
      `;
    case 'artifact/enchantment':
      return sql`
        UPDATE 
            Rosters
        SET 
            roster = roster || jsonb_build_object('artifact/enchantment', (${cardId}::text))
        WHERE 
            player_id = (SELECT player_id FROM Users WHERE email = ${userEmail})
      `;
    case 'instant/sorcery':
      return sql`
        UPDATE 
            Rosters
        SET 
            roster = roster || jsonb_build_object('instant/sorcery', (${cardId}::text)))
        WHERE 
            player_id = (SELECT player_id FROM Users WHERE email = ${userEmail})
      `;
    case 'land':
      return sql`
        UPDATE 
            Rosters
        SET 
            roster = roster || jsonb_build_object('land', (${cardId}::text))
        WHERE 
            player_id = (SELECT player_id FROM Users WHERE email = ${userEmail})
      `;
    default:
      return sql`
      UPDATE 
          Rosters
      SET 
          roster = roster || jsonb_build_object('flex', (${cardId}::text))
      WHERE 
          player_id = (SELECT player_id FROM Users WHERE email = ${userEmail})
    `;
  }
}

const removeCardSlotQuery = (userEmail: string, position: string) => {
  switch (position) {
    case 'creature':
      return sql`
        UPDATE 
            Rosters
        SET 
            roster = roster || jsonb_build_object('creature', (''))
        WHERE 
            player_id = (SELECT player_id FROM Users WHERE email = ${userEmail})
      `;
    case 'artifact/enchantment':
      return sql`
        UPDATE 
            Rosters
        SET 
            roster = roster || jsonb_build_object('artifact/enchantment', (''))
        WHERE 
            player_id = (SELECT player_id FROM Users WHERE email = ${userEmail})
      `;
    case 'instant/sorcery':
      return sql`
        UPDATE 
            Rosters
        SET 
            roster = roster || jsonb_build_object('instant/sorcery', (''))
        WHERE 
            player_id = (SELECT player_id FROM Users WHERE email = ${userEmail})
      `;
    case 'land':
      return sql`
        UPDATE 
            Rosters
        SET 
            roster = roster || jsonb_build_object('land', (''))
        WHERE 
            player_id = (SELECT player_id FROM Users WHERE email = ${userEmail})
      `;
    default:
      return sql`
      UPDATE 
          Rosters
      SET 
          roster = roster || jsonb_build_object('flex', (''))
      WHERE 
          player_id = (SELECT player_id FROM Users WHERE email = ${userEmail})
    `;
  }
}