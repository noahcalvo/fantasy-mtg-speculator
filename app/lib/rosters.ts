import { sql } from '@vercel/postgres';
import { CardDetails, RosterCardDetailsMap, RosterIdMap } from './definitions';
import { unstable_noStore as noStore } from 'next/cache';
import { fetchCard } from './sets';

export async function fetchPlayerRoster(userEmail: string): Promise<RosterCardDetailsMap> {
  noStore();
  try {
    const data = await sql<RosterIdMap>`
          SELECT 
          R.roster,
          U.name
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
