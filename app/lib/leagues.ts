'use server';

import { sql } from '@vercel/postgres';
import { League, Player, ScoringOption } from './definitions';
import { revalidatePath } from 'next/cache';
import OpenAI from "openai";
import { moderateNameOrThrow } from './moderation';

export async function fetchLeagues(userId: number): Promise<League[]> {
  try {
    const data = await sql<League>`
      SELECT * FROM leaguesV3
      WHERE ${userId} = ANY (participants);
      `;
    if (data.rows.length === 0) {
      return [];
    }
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch leagues for ${userId}`);
  }
}

export async function fetchLeague(leagueId: number): Promise<League> {
  try {
    const data = await sql<League>`
      SELECT * FROM leaguesV3
      WHERE league_id = ${leagueId};
      `;
    if (data.rows.length === 0) {
      throw new Error(`No league for ID ${leagueId}`);
    }
    return data.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch league ${leagueId}`);
  }
}

export async function fetchAllLeagues() {
  try {
    const data = await sql<League>`
        SELECT * FROM leaguesV3;
          `;
    if (data.rows.length === 0) {
      return null;
    }
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch leagues');
  }
}

export async function fetchAllOpenLeagues(): Promise<League[]> {
  try {
    const data = await sql<League>`
        SELECT * FROM leaguesV3 WHERE open = true;
          `;
    if (data.rows.length === 0) {
      return [];
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
    const leagueResult =
      await sql`SELECT participants, open FROM leaguesV3 WHERE league_id = ${leagueId};`;
    if (leagueResult.rowCount === 0) {
      throw new Error('League not found');
    }
    if (leagueResult.rows[0].open === false) {
      console.debug('League is closed');
      return;
    }
    const participants = leagueResult.rows[0].participants;
    if (participants.includes(userId)) {
      console.debug('Player is already a participant');
      return;
    } else {
      await sql`UPDATE leaguesV3 SET participants = array_append(participants, ${userId}) WHERE league_id = ${leagueId};`;
      revalidatePath(`/league/${leagueId}/teams`);
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to join league ${leagueId}`);
  }
}

export async function joinPrivateLeague(userId: number, inviteCode: string) {
  try {
    const deleted =
      await sql`
        DELETE FROM invites
        WHERE code = ${inviteCode}
        AND expires > NOW()
        RETURNING league_id;
      `;

    if (deleted.rowCount === 0) {
      return -1; // Code doesn't exist or expired
    }

    const leagueId = deleted.rows[0].league_id;
    await joinLeagueUnsafe(userId, leagueId);
    return leagueId;
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error(`Failed to join private league`);
  }
}

export async function joinLeagueUnsafe(userId: number, leagueId: number) {
  try {
    const leagueResult =
      await sql`SELECT participants, open FROM leaguesV3 WHERE league_id = ${leagueId};`;
    if (leagueResult.rowCount === 0) {
      throw new Error('League not found');
    }
    const participants = leagueResult.rows[0].participants;
    if (participants.includes(userId)) {
      console.debug('Player is already a participant');
      return;
    } else {
      await sql`UPDATE leaguesV3 SET participants = array_append(participants, ${userId}) WHERE league_id = ${leagueId};`;
      revalidatePath(`/league/${leagueId}/teams`);
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to join league ${leagueId}`);
  }
}

export async function leaveLeague(leagueId: number, playerId: number) {
  try {
    const league = await fetchLeague(leagueId);
    // make sure the player isn't the commissioner of the league
    const commissioner = await isCommissioner(playerId, leagueId);
    if (commissioner) {
      throw new Error(
        `Player ${playerId} is a commissioner of league ${leagueId} and cannot leave`,
      );
    }
    if (!league.participants.includes(playerId)) {
      throw new Error(`Player ${playerId} is not in league ${leagueId}`);
    }
    await sql`UPDATE leaguesV3 SET participants = array_remove(participants, ${playerId}) WHERE league_id = ${leagueId};`;
    revalidatePath(`/league/${leagueId}/teams`);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to leave league ${leagueId}`);
  }
}

export async function addCommissioner(userId: number, leagueId: number) {
  try {
    await sql`UPDATE leaguesV3 SET commissioners = array_append(commissioners, ${userId}) WHERE league_id = ${leagueId};`;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(
      `Failed to add commissioner ${userId} to league ${leagueId}`,
    );
  }
}

export async function createLeague(leagueName: string, userId: number, isPrivate: boolean) {
  try {
    const name = await moderateNameOrThrow(leagueName);  // may throw
    const resp =
      await sql`INSERT INTO leaguesV3 (name, participants, commissioners, open)
                VALUES (${name}, array[]::int[], array[]::int[], ${!isPrivate})
                RETURNING league_id;`;
    const leagueId = resp.rows[0].league_id;
    await joinLeagueUnsafe(userId, leagueId);
    await addCommissioner(userId, leagueId);
    return { ok: true as const, leagueId };
  } catch (e: any) {
    return { ok: false as const, error: e?.message ?? "Failed to create League" };
  }
}

export async function fetchPlayersInLeague(
  leagueId: number,
): Promise<Player[]> {
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
      console.debug(`no league with id ${leagueId}`);
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

export async function isCommissioner(
  playerId: number,
  leagueId: number,
): Promise<boolean> {
  try {
    const data = await sql`
    SELECT commissioners FROM leaguesV3 WHERE league_id=${leagueId};`;
    return data.rows[0].commissioners.includes(playerId);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch players for leagueId ${leagueId}`);
  }
}

export async function fetchScoringOptions(
  leagueId: number,
): Promise<ScoringOption[]> {
  try {
    const data = await sql<ScoringOption>`
    SELECT * FROM ScoringOptions WHERE league_id=${leagueId};`;
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch players for leagueId ${leagueId}`);
  }
}

export async function addScoringSetting(
  leagueId: number,
  scoringOption: ScoringOption,
) {
  if (scoringOption.scoring_id) {
    console.debug(
      'should not provide scoring_id when adding a scoring setting',
      scoringOption.scoring_id,
    );
    throw new Error(`Failed to add scoring setting due to inproper parameters`);
  }
  try {
    await sql`
    INSERT INTO ScoringOptions (league_id, format, tournament_type, is_per_copy, points)
    VALUES (${leagueId}, ${scoringOption.format}, ${scoringOption.tournament_type}, ${scoringOption.is_per_copy}, ${scoringOption.points});`;
    revalidatePath(`/league/${leagueId}/settings`);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to add scoring option for leagueId ${leagueId}`);
  }
}

export async function deleteScoringSetting(
  scoringOption: ScoringOption,
  playerId: number,
) {
  // authenticate that the user is the commissioner of the league
  // if not, throw an error
  const commissioner = await isCommissioner(playerId, scoringOption.league_id);
  if (!commissioner) {
    throw new Error(
      `Player ${playerId} is not a commissioner of league ${scoringOption.league_id}`,
    );
  }
  try {
    await sql`
    DELETE FROM ScoringOptions WHERE scoring_id=${scoringOption.scoring_id};`;
    revalidatePath(`/league/${scoringOption.league_id}/settings`);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to delete scoring option ${scoringOption}`);
  }
}

export async function openLeague(leagueId: number) {
  try {
    await sql`
    UPDATE leaguesV3 SET open = true WHERE league_id = ${leagueId};`;
    revalidatePath(`/league/${leagueId}/settings`);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to open league ${leagueId}`);
  }
}

export async function closeLeague(leagueId: number) {
  try {
    await sql`
    UPDATE leaguesV3 SET open = false WHERE league_id = ${leagueId};`;
    revalidatePath(`/league/${leagueId}/settings`);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to close league ${leagueId}`);
  }
}

export async function createInviteCode(leagueId: number): Promise<string> {
  try {
    const code = Math.random().toString(36).substring(2, 10);
    await sql`
      INSERT INTO Invites (league_id, code, expires)
      VALUES (${leagueId}, ${code}, NOW() + INTERVAL '24 hour');
    `;
    return code;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to create invite code for league ${leagueId}`);
  }
}

export async function invalidateInviteCode(code: string): Promise<void> {
  try {
    await sql`
      DELETE FROM Invites WHERE code = ${code};
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to invalidate invite code ${code}`);
  }
}