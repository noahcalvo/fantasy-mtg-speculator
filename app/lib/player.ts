'use server';

import { sql } from '@vercel/postgres';
import { Player } from './definitions';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchParticipantData(id: number) {
  try {
    const data = await sql<Player>`
      SELECT  player_id, name, email from users WHERE player_id = ${id};
        `;
    if (data.rows.length === 0) {
      throw new Error(`No player found with the given id ${id}`);
    }
    return data.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch player: ${id}`);
  }
}

export async function fetchMultipleParticipantData(ids: number[]) {
  noStore();
  let participants: Player[] = [];
  try {
    for (const id of ids) {
      participants = participants.concat(await fetchParticipantData(id));
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch multiple participants');
  } finally {
    return participants;
  }
}

export async function fetchPlayerByEmail(email: string) {
  try {
    const data = await sql<Player>`
      SELECT player_id, name, email from users WHERE email = ${email};
        `;
    if (data.rows.length === 0) {
      throw new Error('No player found');
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