'use server';

import { sql } from '@vercel/postgres';
import { League, Player } from './definitions';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function fetchLeague(userId: number):Promise<League | null> {
  try {
    const data = await sql<League>`
      SELECT * FROM leagues 
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
        SELECT * FROM leagues;
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
    console.error("failed to join existing league. leagueId,userId: ", leagueId, userId)
  }
}

export async function joinLeague(userId: number, leagueId: number) {
  try {
    // Check if the player is already a participant
    const leagueResult =
      await sql`SELECT participants FROM leagues WHERE league_id = ${leagueId};`;
    if (leagueResult.rowCount === 0) {
      throw new Error('League not found');
    }
    const participants = leagueResult.rows[0].participants;
    if (participants.includes(userId)) {
      console.log('Player is already a participant');
      return;
    } else {
      await sql`UPDATE leagues SET participants = array_append(participants, ${userId}) WHERE league_id = ${leagueId};`;
      revalidatePath(`/league/teams`);
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to join league ${leagueId}`);
  } 
}

export async function createLeague(leagueName: string, userId: number) {
  let resp;
  try {
    resp =
      await sql`INSERT INTO leagues (name, participants) VALUES (${leagueName}, array[]::int[]) RETURNING league_id;`;
      joinLeague(userId, resp.rows[0].league_id);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to create League ${leagueName}`);
  } finally {
    redirect(`/league/teams`);
  }
}

export async function fetchPlayersInLeague(leagueId: number):Promise<Player[]> {
  try {
    const data = await sql<Player>`
    SELECT p.name, p.email, p.player_id
    FROM users p
    WHERE p.player_id = ANY (
      SELECT UNNEST(l.participants)
      FROM leagues l
      WHERE l.league_id = ${leagueId}
    );`;
    if (data.rows.length === 0) {
      console.log(`no league with id ${leagueId}`)
      return []
    }
    console.log(data.rows)
    return data.rows
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch players for leagueId ${leagueId}`)
  }
}