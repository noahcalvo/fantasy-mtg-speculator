import { sql } from "@vercel/postgres";
import { League } from "./definitions";

export async function fetchLeague(email: string) {
    try {
      const data = await sql<League>`
      SELECT * FROM leagues 
      WHERE ARRAY (
          SELECT player_id FROM users WHERE email = ${email}
      ) <@ participants;
      `;
      if (data.rows.length === 0) {
        console.log(`No leagues found for ${email}`);
        return null;
      }
      if (data.rows.length > 1) {
        throw new Error(`Uh oh. Multiple players found for ${email}`);
      }
      return data.rows[0];
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch drafts');
    }
  }

  export async function fetchAllLeagues() {
    try {
      const data = await sql<League>`
        SELECT * FROM leagues;
          `;
      if (data.rows.length === 0) {
        console.log('No leagues found');
        return null;
      }
      return data.rows;
    } catch (error) {
      console.error('Database Error:', error);
      throw new Error('Failed to fetch drafts');
    }
  }