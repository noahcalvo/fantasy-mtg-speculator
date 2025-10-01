'use server';

import { CardDetails, CardDetailsWithPoints, Draft, DraftPick } from './definitions';
import { z } from 'zod';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
import { redirect } from 'next/navigation';
import { updateCollectionWithCompleteDraft } from './collection';
import { fetchLeague, isCommissioner } from './leagues';
import { fetchOwnedCards } from './collection';
import { fetchSet } from './sets';
import { fetchCardName } from './card';
import pg from 'pg';
import { fetchCardPerformances } from './performance';
import { broadcastDraft } from './realtime';
import { sortCardsByPoints } from './utils';
import { cancelAutodraftIfScheduled, scheduleAutodraftOnce } from './qstash';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

const FormSchema = z.object({
  id: z.string(),
  set: z.string().min(1, { message: 'Set cannot be empty.' }),
  name: z.string().min(1, { message: 'Name cannot be empty.' }),
  rounds: z.coerce
    .number()
    .gt(0, { message: 'Rounds must be a number greater than 0.' }),
});

const CreateDraft = FormSchema.omit({ id: true });

export type State = {
  errors?: {
    set?: string[];
    rounds?: string[];
    name?: string[];
  };
  message?: string | null;
};

export async function createDraft(
  prevState: State,
  formData: FormData,
  leagueId: number,
  playerId: number,
  pickDurationSeconds: number = 0,
) {
  const commissioner = await isCommissioner(playerId, leagueId);
  if (!commissioner) {
    return {
      errors: {
        set: ['You are not the commissioner of this league.'],
      },
      message: 'Failed to Create Draft.',
    };
  }

  // validate data from form
  const validatedFields = CreateDraft.safeParse({
    set: formData.get('set'),
    rounds: formData.get('rounds'),
    name: formData.get('name'),
  });

  const autoDraft = pickDurationSeconds > 0;

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  const { set, rounds, name } = validatedFields.data;

  let resp;
  try {
    resp = await pool.query(
      `INSERT INTO draftsV4 (set, active, rounds, name, participants, league_id, auto_draft, pick_time_seconds) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING draft_id;`,
      [set, true, rounds, name, [], leagueId, autoDraft, pickDurationSeconds],
    );
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create draft for {set}');
  }
  revalidatePath(`/league/${leagueId}/draft`);
  redirect(`/league/${leagueId}/draft/${resp.rows[0].draft_id}/view`);
}

const fetchAllDrafts = async (leagueId: number): Promise<Draft[]> => {
  try {
    const res = await pool.query<Draft>(
      `SELECT * FROM draftsV4 WHERE league_id = $1;`,
      [leagueId],
    );
    return res.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch drafts');
  }
};

const fetchDraftsBySet = async (
  leagueId: number,
  set: string,
): Promise<Draft[]> => {
  try {
    const res = await pool.query<Draft>(
      `SELECT * FROM draftsV4 WHERE set = $1 AND league_id = $2;`,
      [set, leagueId],
    );
    return res.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch drafts');
  }
};

export const fetchDrafts = async (
  leagueId: number,
  set?: string,
): Promise<Draft[]> => {
  if (set) {
    return fetchDraftsBySet(leagueId, set);
  }
  return fetchAllDrafts(leagueId);
};

const _fetchDraftUncached = async (draftId: number): Promise<Draft> => {
  try {
    const res = await pool.query<Draft>(
      `SELECT draft_id, CAST(participants AS INT[]) as participants, active, set, name, rounds, league_id, paused_at, current_pick_deadline_at, pick_time_seconds, auto_draft FROM draftsV4 WHERE draft_id = $1;`,
      [draftId],
    );
    return res.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch draft');
  }
};

export const fetchDraft = (draftId: number) => {
  return unstable_cache(
    _fetchDraftUncached,
    [`fetchDraft-${draftId}`],
    {
      tags: [`draft-${draftId}-info`],
      revalidate: false, // Only revalidate when tags are invalidated
    }
  )(draftId);
};

export const joinDraft = async (
  draftId: number,
  playerId: number,
  leagueId: number,
): Promise<void> => {
  const client = await pool.connect();
  let success = false;
  let redirectTo: string | null = null;

  try {
    // Pre-checks that don't need DB (if fetchLeague is external). Keep them up front.
    const leagueResult = await fetchLeague(leagueId);
    if (!leagueResult.participants.includes(playerId)) {
      throw new Error("Player not in league");
    }

    await client.query("BEGIN"); // start tx

    // Lock the draft row so two people don't modify participants concurrently
    const draftResult = await client.query(
      `
      SELECT participants, active, rounds
      FROM draftsV4
      WHERE draft_id = $1 AND league_id = $2
      FOR UPDATE
      `,
      [draftId, leagueId],
    );

    if (draftResult.rowCount === 0) throw new Error("Draft not found");

    const { participants, active, rounds } = draftResult.rows[0] as {
      participants: number[];
      active: boolean;
      rounds: number;
    };

    if (!active) throw new Error("Draft not active");

    // Already in? Commit no-op and bail.
    if (participants.includes(playerId)) {
      await client.query("COMMIT");
      return;
    }

    // All writes below are part of the same transaction
    await addPicksTx(client, draftId, playerId, participants.length, rounds);

    const newParticipants = [...participants, playerId];
    await snakePicksTx(client, draftId, newParticipants, rounds);

    // Use league_id in the UPDATE where clause to match your SELECT
    // Also guard against dupes under race by asserting NOT already present
    await client.query(
      `
      UPDATE draftsV4
      SET participants = array_append(participants, $1)
      WHERE draft_id = $2 AND league_id = $3
        AND NOT (participants @> ARRAY[$1]::int[])
      `,
      [playerId, draftId, leagueId],
    );

    await client.query("COMMIT");

    // ❗ Do side effects only after COMMIT succeeds
    revalidateTag(`draft-${draftId}-info`);
    revalidateTag(`draft-${draftId}-picks`);
    revalidateTag(`draft-${draftId}-undrafted`);
    revalidatePath(`/league/${leagueId}/draft/${draftId}/view`);
    revalidatePath(`league/${leagueId}/draft`);

    // Redirect only on success; don't put this in finally
    success = true;
    redirectTo = `/league/${leagueId}/draft/${draftId}/live`; // <- set, don't call here
  } catch (error) {
    // Try to rollback; ignore rollback errors if the tx is already aborted
    try {
      await client.query("ROLLBACK");
    } catch { }
    console.error("Database Error:", error);
    throw new Error("Failed to join draft");
  } finally {
    client.release();
  }

  if (success && redirectTo) {
    redirect(redirectTo); // <- OUTSIDE try/catch, won’t be swallowed
  }

};

export const redirectIfJoined = async (
  participants: number[],
  playerId: number,
  draftId: number,
  leagueId: number,
) => {
  let shouldRedirect = false;
  try {
    if (participants.includes(playerId)) {
      shouldRedirect = true;
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to check if already joined draft');
  } finally {
    if (shouldRedirect) {
      redirect(`/league/${leagueId}/draft/${draftId}/live`);
    }
  }
};

const addPicksTx = async (connection: pg.PoolClient, draftId: number, playerId: number, position: number, rounds: number) => {
  try {
    // add picks for each round for this player
    for (let i = 0; i < rounds; i++) {
      await connection.query(
        `INSERT INTO picksv5 (draft_id, player_id, round, pick_number) VALUES ($1, $2, $3, $4);`,
        [draftId, playerId, i, position],
      );
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to add picks');
  }
};

const snakePicksTx = async (connection: pg.PoolClient, draftId: number, participants: number[], rounds: number) => {
  try {
    for (let i = 1; i < rounds; i = i + 2) {
      // move the last entry out of bounds
      await connection.query(
        `UPDATE picksv5 SET pick_number = $1 WHERE draft_id = $2 AND round = $3 AND player_id = $4;`,
        [participants.length, draftId, i, participants[participants.length - 1]],
      );
      for (let j = 0; j < participants.length; j++) {
        // move pick j over 1
        await connection.query(
          `UPDATE picksv5 SET pick_number = $1 WHERE draft_id = $2 AND round = $3 AND player_id = $4;`,
          [participants.length - j - 1, draftId, i, participants[j]],
        );
      }
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to snake picks');
  }
};

const _fetchPicksUncached = async (draftId: number) => {
  try {
    const res = await pool.query<DraftPick>(
      `SELECT * FROM picksv5 WHERE draft_id = $1;`,
      [draftId],
    );
    return res.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch picks');
  }
};

export const fetchPicksUncached = _fetchPicksUncached;

export const fetchPicks = (draftId: number) => {
  return unstable_cache(
    _fetchPicksUncached,
    [`fetchPicks-${draftId}`],
    {
      tags: [`draft-${draftId}-picks`],
      revalidate: false, // Only revalidate when tags are invalidated
    }
  )(draftId);
};

export async function makePick(
  draftId: number,
  playerId: number,
  cardName: string,
  set: string,
  leagueId: number,
) {
  const client = await pool.connect();
  let pickId = null;
  let cardId = null;
  try {
    await client.query('BEGIN');

    const d = await lockDraftForTurn(client, draftId, "manual");
    if (!d) throw new Error('Draft not available for picking (paused/inactive/locked)');

    // Lock the active slot
    const slot = await getActivePickLocked(client, draftId);
    if (!slot) throw new Error('Draft complete');
    if (slot.player_id !== playerId) {
      throw new Error('Not your turn');
    }

    cardId = await getOrCreateCardTx(client, { name: cardName, origin: set });

    if (!(cardId > 0)) {
      await client.query('ROLLBACK');
      throw new Error(`invalid card id for ${cardName}`);
    }

    // Race-safe assignment: if autopick (or another tab) won, this returns null
    const maybePickId = await assignPickIfStillOpen(client, draftId, slot, cardId);
    if (!maybePickId) {
      await client.query('ROLLBACK');
      return;
    }
    pickId = maybePickId;

    let deadline: string | null = null;
    if (d.auto_draft) {
      deadline = await startNextTurn(client, draftId);
    }

    // If no more open picks, mark draft inactive
    const { rows: [remain] } = await client.query(
      `SELECT EXISTS(SELECT 1 FROM PicksV5 WHERE draft_id=$1 AND card_id IS NULL) AS has_open;`,
      [draftId]
    );
    if (!remain.has_open) {
      await client.query(`UPDATE DraftsV4 SET active=false WHERE draft_id=$1;`, [draftId]);
    }

    await client.query('COMMIT');
    await broadcastDraft(draftId, 'pick_made', { cardId, pickId });
    if (deadline) {
      await scheduleAutodraftOnce(client, draftId, deadline);
    }

    // Post-commit side effects
    if (!remain.has_open) {
      await updateCollectionWithCompleteDraft(client, draftId);
      revalidateTag(`draft-${draftId}-info`);
    }
    revalidateTag(`draft-${draftId}-picks`);
    revalidateTag(`draft-${draftId}-undrafted`);
    revalidatePath(`/league/${leagueId}/draft/${draftId}/live`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

function frontSide(cardName: string) {
  return cardName.split(/\s*\/\/\s*/)[0].trim();
}

export async function createCardTx(
  connection: pg.PoolClient,
  { name, origin }: { name: string; origin: string }
): Promise<number> {
  // If you can, add a UNIQUE constraint (see note below) and switch to ON CONFLICT.
  const { rows } = await connection.query<{ card_id: number }>(
    `INSERT INTO cards (name, origin) VALUES ($1, $2) RETURNING card_id`,
    [name, origin]
  );
  return rows[0].card_id;
}

/** Get by name (case-insensitive), upgrade to full DFC name if needed. */
export async function getOrCreateCardTx(
  connection: pg.PoolClient,
  { name, origin }: { name: string; origin: string }
): Promise<number> {
  const front = frontSide(name);

  // 1) Try exact front (typical when DB has only front side)
  let q = await connection.query(
    `SELECT card_id, name FROM cards WHERE LOWER(name) = LOWER($1) LIMIT 1`,
    [front]
  );
  if (q.rows.length) {
    const row = q.rows[0] as { card_id: number; name: string };
    if (row.name !== name) {
      await connection.query(`UPDATE cards SET name = $1 WHERE card_id = $2`, [name, row.card_id]);
    }
    return row.card_id;
  }

  // 2) If not DFC (front === full), create new
  if (front === name) return await createCardTx(connection, { name, origin });

  // 3) Try full DFC name
  q = await connection.query(
    `SELECT card_id FROM cards WHERE LOWER(name) = LOWER($1) LIMIT 1`,
    [name]
  );
  if (q.rows.length) return q.rows[0].card_id as number;

  // 4) Create full DFC name
  return await createCardTx(connection, { name, origin });
}

export async function getOrCreateCard(name: string, origin: string): Promise<number> {
  const client = await pool.connect();
  try {
    return await getOrCreateCardTx(client, { name, origin });
  } finally {
    client.release();
  }
}

export const getActivePick = async (
  draftId: number,
): Promise<DraftPick | null> => {
  try {
    const activePick = await pool.query<DraftPick>(
      `
    SELECT p.*
    FROM picksv5 p
    JOIN draftsV4 d ON p.draft_id = d.draft_id
    WHERE d.draft_id = $1 AND p.card_id IS NULL
    ORDER BY p.round ASC, p.pick_number ASC
    LIMIT 1;
  `,
      [draftId],
    );
    // return null if no active pick
    if (activePick.rows.length === 0) {
      return null;
    }
    return activePick.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to get active pick');
  }
};

async function getActivePickLocked(client: pg.PoolClient, draftId: number) {
  const { rows: [slot] } = await client.query<DraftPick>(
    `SELECT *
       FROM PicksV5
      WHERE draft_id = $1 AND card_id IS NULL
      ORDER BY round ASC, pick_number ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1;`,
    [draftId]
  );
  return slot ?? null;
}


const _fetchUndraftedCardsUncached = async (draftId: number) => {
  try {
    const draft = await fetchDraft(draftId);
    const cards = await fetchSet(draft.set);
    // get all owned cards
    const alreadyOwnedCards = await fetchOwnedCards(draft.set, draft.league_id);
    const picks = await fetchPicks(draftId);

    const draftedCardNames = await Promise.all(
      picks.map((pick: DraftPick) =>
        pick.card_id ? fetchCardName(pick.card_id) : null,
      ),
    );

    const undraftedCards = cards.filter(
      (card: CardDetails) =>
        !(draftedCardNames.includes(card.name) || draftedCardNames.includes(frontSide(card.name))) &&
        !alreadyOwnedCards.some((ownedCard) => ownedCard.name === card.name),
    );
    return undraftedCards;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch undrafted cards');
  }
};

export const fetchUndraftedCards = (draftId: number) => {
  return unstable_cache(
    _fetchUndraftedCardsUncached,
    [`fetchUndraftedCards-${draftId}`],
    {
      tags: [`draft-${draftId}-undrafted`],
      revalidate: false, // Only revalidate when tags are invalidated
    }
  )(draftId);
};

export async function pauseDraft(draftId: number, leagueId: number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rowCount } = await client.query(
      `UPDATE DraftsV4
         SET paused_at = COALESCE(paused_at, NOW())
       WHERE draft_id = $1
         AND active = true;`, // if you add a status enum later, use status='live'
      [draftId]
    );
    await client.query('COMMIT');
    await broadcastDraft(draftId, 'paused', {});
    if (rowCount) {
      revalidateTag(`draft-${draftId}-info`);
      await cancelAutodraftIfScheduled(client, draftId);
    }
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function resumeDraft(draftId: number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      `SELECT paused_at FROM DraftsV4 WHERE draft_id = $1 FOR UPDATE;`,
      [draftId]
    );
    if (!rows.length || !rows[0].paused_at) {
      await client.query('ROLLBACK'); return; // not paused
    }
    const { rows: updatedRows } = await client.query<{ current_pick_deadline_at: string }>(
      `UPDATE DraftsV4
         SET current_pick_deadline_at = current_pick_deadline_at + (NOW() - paused_at),
             paused_at = NULL
       WHERE draft_id = $1
       RETURNING current_pick_deadline_at;`,
      [draftId]
    );
    await client.query('COMMIT');
    revalidateTag(`draft-${draftId}-info`);
    await broadcastDraft(draftId, 'resumed', {});
    await scheduleAutodraftOnce(client, draftId, updatedRows[0]?.current_pick_deadline_at || "");
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function startNextTurn(client: pg.PoolClient, draftId: number): Promise<string | null> {
  // Use pick_time_seconds from the draft row
  const { rows } = await client.query<{ current_pick_deadline_at: string }>(
    `UPDATE DraftsV4
       SET current_pick_deadline_at = NOW() + make_interval(secs => pick_time_seconds)
     WHERE draft_id = $1
     RETURNING current_pick_deadline_at;`,
    [draftId]
  );
  return rows[0]?.current_pick_deadline_at || null;
}

export async function getPausedStatus(draftId: number): Promise<string> {
  const client = await pool.connect();
  try {
    const { rows: [draft] } = await client.query<{ paused_at: string | null }>(
      `SELECT paused_at FROM DraftsV4 WHERE draft_id = $1;`,
      [draftId]
    );
    return draft.paused_at ?? '';
  } finally {
    client.release();
  }
}

export async function fetchUndraftedWithPoints(
  draftId: number,
  leagueId: number
): Promise<CardDetailsWithPoints[]> {
  const undrafted = await _fetchUndraftedCardsUncached(draftId); // uncached on purpose
  if (!undrafted.length) return [];

  const ids = undrafted
    .filter(c => c.card_id !== undefined && c.card_id !== -1)
    .map(c => c.card_id as number);

  const perf = await fetchCardPerformances(ids, leagueId); // [{card_id,total_points,week}]
  return undrafted.map((c) => {
    const p = perf.find(r => r.card_id === c.card_id);
    return { ...c, points: p?.total_points ?? 0, week: p?.week ?? -1 };
  });
}

async function assignPickIfStillOpen(
  client: pg.PoolClient,
  draftId: number,
  pick: DraftPick,
  cardId: number
): Promise<number | null> {
  if (!(cardId > 0)) throw new Error('cardId must be > 0 before insert');

  const { rows, rowCount } = await client.query(
    `UPDATE PicksV5
        SET card_id = $1
      WHERE draft_id = $2
        AND round = $3
        AND pick_number = $4
        AND player_id = $5
        AND card_id IS NULL
      RETURNING pick_id;`,
    [cardId, draftId, pick.round, pick.pick_number, pick.player_id]
  );
  return rowCount ? (rows[0].pick_id as number) : null;
}

export async function autopickIfDue(draftId: number): Promise<void> {
  const client = await pool.connect();
  let pickId: number | null = null;
  let leagueId: number | null = null;

  try {
    await client.query('BEGIN');

    const d = await lockDraftForTurn(client, draftId, "auto");
    if (!d) { await client.query('ROLLBACK'); return; }

    leagueId = d.league_id as number;

    const pick = await getActivePickLocked(client, draftId);
    if (!pick) {
      await client.query(`UPDATE DraftsV4 SET active=false WHERE draft_id = $1;`, [draftId]);
      await client.query('COMMIT');
      return;
    }

    const candidates = await fetchUndraftedWithPoints(draftId, leagueId);
    if (!candidates.length) {
      console.error('No cards left to draft for draftId:', draftId);
      await client.query(`UPDATE DraftsV4 SET active=false WHERE draft_id = $1;`, [draftId]);
      await client.query('COMMIT');
      return;
    }

    const sortedCandidates = sortCardsByPoints(candidates);
    const best = sortedCandidates[0];
    if (!best?.card_id) { await client.query('ROLLBACK'); return; }
    const ensuredCardId =
      best.card_id > 0
        ? best.card_id
        : await getOrCreateCardTx(client, { name: best.name, origin: best.set });


    if (!(ensuredCardId > 0)) {
      await client.query('ROLLBACK');
      throw new Error(`invalid card id for ${best.name}`);
    }

    const maybePickId = await assignPickIfStillOpen(client, draftId, pick, ensuredCardId);
    if (!maybePickId) { await client.query('ROLLBACK'); return; } // lost race

    pickId = maybePickId;
    const deadline = await startNextTurn(client, draftId);

    // If no more open picks, mark draft inactive
    const { rows: [remain] } = await client.query(
      `SELECT EXISTS(SELECT 1 FROM PicksV5 WHERE draft_id=$1 AND card_id IS NULL) AS has_open;`,
      [draftId]
    );
    if (!remain.has_open) {
      await client.query(`UPDATE DraftsV4 SET active=false WHERE draft_id=$1;`, [draftId]);
    }

    await client.query('COMMIT');
    await broadcastDraft(draftId, 'pick_made', { cardId: ensuredCardId, pickId });
    await scheduleAutodraftOnce(client, draftId, deadline || "");


    // Post-commit side effects
    if (!remain.has_open) {
      await updateCollectionWithCompleteDraft(client, draftId);
    }
    revalidateTag(`draft-${draftId}-picks`);
    revalidateTag(`draft-${draftId}-undrafted`);
    revalidatePath(`/league/${leagueId}/draft/${draftId}/live`);
    revalidatePath(`draft-${draftId}-info`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// are we past deadline?
function nowDue(deadline: string | null): boolean {
  return !!deadline && new Date(deadline) <= new Date();
}

type LockMode = "auto" | "manual";

type LockedDraft = {
  league_id: number;
  active: boolean;
  paused_at: string | null;
  current_pick_deadline_at: string | null;
  pick_time_seconds: number;
  auto_draft: boolean;
};

/**
 * Grabs a per-draft advisory lock and locks the draft row.
 * - mode="auto": requires `active && !paused && isDue(deadline)`
 * - mode="manual": requires `active && !paused` (deadline may be past; race will be decided by the slot UPDATE)
 *
 * Returns the locked draft row or null if preconditions fail (no throw).
 */
export async function lockDraftForTurn(
  client: pg.PoolClient,
  draftId: number,
  mode: LockMode
): Promise<LockedDraft | null> {
  // Per-draft advisory lock (serialize all work on a draft)
  const { rows: [lock] } = await client.query<{ locked: boolean }>(
    `SELECT pg_try_advisory_xact_lock($1::bigint) AS locked;`,
    [draftId]
  );
  if (!lock?.locked) return null;

  // Lock the draft row
  const { rows: [d] } = await client.query<LockedDraft>(
    `SELECT league_id, active, paused_at, current_pick_deadline_at, pick_time_seconds, auto_draft
       FROM DraftsV4
      WHERE draft_id = $1
      FOR UPDATE;`,
    [draftId]
  );
  if (!d) return null;

  // Shared guards
  if (!d.active || d.paused_at) return null;

  // Mode-specific guard
  if (mode === "auto" && !nowDue(d.current_pick_deadline_at)) return null;

  return d;
}
