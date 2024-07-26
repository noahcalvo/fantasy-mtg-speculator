'use server';

import { sql } from '@vercel/postgres';
import {
  League,
  Player,
} from './definitions';
import { unstable_noStore as noStore, revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function fetchLeague(userId: number): Promise<League | null> {
  try {
    const data = await sql<League>`
      SELECT * FROM leaguesV3
      WHERE ${userId} = ANY (participants);
      `;
    if (data.rows.length === 0) {
      console.log(`No leagues found for ${userId}`);
      return null;
    }
    if (data.rows.length > 1) {
      throw new Error(`Uh oh. Multiple leagues found for ${userId}`);
    }
    return data.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch leagues for ${userId}`);
  }
}

export async function fetchAllLeagues() {
  try {
    const data = await sql<League>`
        SELECT * FROM leaguesV3;
          `;
    if (data.rows.length === 0) {
      console.log('No leagues found');
      return null;
    }
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch leagues');
  }
}

export async function fetchAllOpenLeagues() {
  try {
    const data = await sql<League>`
        SELECT * FROM leaguesV3 WHERE open = true;
          `;
    if (data.rows.length === 0) {
      console.log('No leagues found');
      return null;
    }
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch leagues');
  }
}

export async function joinExistingLeague(userId: number, leagueId: number) {
  try {
    await joinLeague(userId, leagueId);
  } catch (err) {
    console.error(
      'failed to join existing league. leagueId,userId: ',
      leagueId,
      userId,
    );
  }
}

export async function joinLeague(userId: number, leagueId: number) {
  try {
    // Check if the player is already a participant
    const leagueResult =
      await sql`SELECT participants, open FROM leaguesV3 WHERE league_id = ${leagueId};`;
    if (leagueResult.rowCount === 0) {
      throw new Error('League not found');
    }
    if (leagueResult.rows[0].open === false) {
      console.log('League is closed');
      return;
    }
    const participants = leagueResult.rows[0].participants;
    if (participants.includes(userId)) {
      console.log('Player is already a participant');
      return;
    } else {
      await sql`UPDATE leaguesV3 SET participants = array_append(participants, ${userId}) WHERE league_id = ${leagueId};`;
      revalidatePath(`/league/teams`);
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to join league ${leagueId}`);
  }
}

export async function addCommissioner(userId: number, leagueId: number) {
  try {
    await sql`UPDATE leaguesV3 SET commissioners = array_append(commissioners, ${userId}) WHERE league_id = ${leagueId};`;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to add commissioner ${userId} to league ${leagueId}`);
  }
}

export async function createLeague(leagueName: string, userId: number) {
  let resp;
  try {
    resp =
      await sql`INSERT INTO leaguesV3 (name, participants, commissioners, open) VALUES (${leagueName}, array[]::int[], array[]::int[], true) RETURNING league_id;`;
    joinLeague(userId, resp.rows[0].league_id);
    addCommissioner(userId, resp.rows[0].league_id);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to create League ${leagueName}`);
  } finally {
    redirect(`/league/${resp?.rows[0].league_id}/teams`);
  }
}

export async function fetchPlayersInLeague(
  leagueId: number,
): Promise<Player[]> {
  noStore();
  try {
    const data = await sql<Player>`
    SELECT p.name, p.email, p.player_id
    FROM users p
    WHERE p.player_id = ANY (
      SELECT UNNEST(l.participants)
      FROM leaguesV3 l
      WHERE l.league_id = ${leagueId}
    );`;
    if (data.rows.length === 0) {
      console.log(`no league with id ${leagueId}`);
      return [];
    }
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch players for leagueId ${leagueId}`);
  }
}

export async function fetchPlayerIdInLeague(
  leagueId: number,
): Promise<number[]> {
  noStore();
  try {
    const data = await sql`
    SELECT participants FROM leaguesV3 WHERE league_id=${leagueId} LIMIT 1;`;
    return data.rows[0].participants;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch players for leagueId ${leagueId}`);
  }
}

export async function isPlayerInLeague(playerId: number, leagueId: number) {
  try {
    const data = await sql`
    SELECT participants FROM leaguesV3 WHERE league_id=${leagueId};`;
    return data.rows[0].participants.includes(playerId);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch players for leagueId ${leagueId}`);
  }
}

export async function isCommissioner(playerId: number, leagueId: number) {
  try {
    const data = await sql`
    SELECT commissioners FROM leaguesV3 WHERE league_id=${leagueId};`;
    return data.rows[0].commissioners.includes(playerId);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch players for leagueId ${leagueId}`);
  }
}
