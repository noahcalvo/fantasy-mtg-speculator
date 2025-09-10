'use server';

import { Card, CardDetails, CardDetailsWithPoints, Draft, DraftPick, num } from './definitions';
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
import { priceUsd } from './performance-utils';
import { broadcastDraft } from './realtime';

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
      `SELECT draft_id, CAST(participants AS INT[]) as participants, active, set, name, rounds, league_id, paused_at, current_pick_deadline_at FROM draftsV4 WHERE draft_id = $1;`,
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
  try {
    // Check if player belongs to the league
    const leagueResult = await fetchLeague(leagueId);
    if (!leagueResult.participants.includes(playerId)) {
      throw new Error('Player not in league');
    }
    // Check if the player is already a participant
    const draftResult = await pool.query(
      `SELECT participants, active, rounds FROM draftsV4 WHERE draft_id = $1 AND league_id = $2;`,
      [draftId, leagueId],
    );
    if (draftResult.rowCount === 0) {
      throw new Error('Draft not found');
    }

    const result = draftResult.rows[0];

    if (!result.active) {
      throw new Error('Draft not active');
    }
    const participants = result.participants;
    if (participants.includes(playerId)) {
      console.debug('Player is already a participant');
      return;
    }
    await addPicks(draftId, playerId, participants.length, result.rounds);
    participants.push(playerId);
    await snakePicks(draftId, participants, result.rounds);
    console.log("picks added and snaked")
    await pool.query(
      `UPDATE draftsV4 SET participants = array_append(participants, $1) WHERE draft_id = $2;`,
      [playerId, draftId],
    );

    // Invalidate caches for this specific draft when someone joins
    revalidateTag(`draft-${draftId}-info`); // Draft participants changed
    revalidateTag(`draft-${draftId}-picks`); // New picks were added
    revalidateTag(`draft-${draftId}-undrafted`); // Undrafted cards may change due to owned cards
    revalidatePath(`/league/${leagueId}/draft/${draftId}/view`);
    revalidatePath(`league/${leagueId}/draft`);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to join draft');
  } finally {
    redirect(`/league/${leagueId}/draft/${draftId}/live`);
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

const addPicks = async (draftId: number, playerId: number, position: number, rounds: number) => {
  try {
    console.log('Adding picks for draft:', draftId, 'for player:', playerId);
    console.log('Draft rounds:', rounds, 'Pick number:', position);
    // add picks for each round for this player
    for (let i = 0; i < rounds; i++) {
      await pool.query(
        `INSERT INTO picksv5 (draft_id, player_id, round, pick_number) VALUES ($1, $2, $3, $4);`,
        [draftId, playerId, i, position],
      );
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to add picks');
  }
};

const snakePicks = async (draftId: number, participants: number[], rounds: number) => {
  try {
    for (let i = 1; i < rounds; i = i + 2) {
      // move the last entry out of bounds
      await pool.query(
        `UPDATE picksv5 SET pick_number = $1 WHERE draft_id = $2 AND round = $3 AND player_id = $4;`,
        [participants.length, draftId, i, participants[participants.length - 1]],
      );
      for (let j = 0; j < participants.length; j++) {
        // move pick j over 1
        await pool.query(
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
  try {
    await client.query('BEGIN');

    // Guard: not paused and not past deadline for someone else to auto-pick first
    const { rows: [d] } = await client.query(
      `SELECT current_pick_deadline_at, paused_at FROM DraftsV4 WHERE draft_id = $1 FOR UPDATE;`,
      [draftId]
    );
    if (!d) throw new Error('Draft not found');
    if (d.paused_at) throw new Error('Draft is paused');
    // (Optional) reject if overdue and it's not this player's turn – up to your UX.
    // if (d.current_pick_deadline_at && new Date(d.current_pick_deadline_at) < new Date()) {
    //   console.log('Deadline passed, pick may be auto-drafted first');
    //   return
    // }

    // Get the current active slot FOR UPDATE SKIP LOCKED to serialize
    const { rows: [slot] } = await client.query<DraftPick>(
      `SELECT *
         FROM PicksV5
        WHERE draft_id = $1 AND card_id IS NULL
        ORDER BY round ASC, pick_number ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1;`,
      [draftId]
    );
    if (!slot) throw new Error('Draft complete');
    if (slot.player_id !== playerId) throw new Error('Not your turn');

    const cardId = await getOrCreateCard(cardName, set);
    if (!cardId) throw new Error('Card not found/created');
    console.log("getting here?")
    // Assign the pick
    await client.query(
      `UPDATE PicksV5
        SET card_id = $1
        WHERE draft_id = $2 AND round = $3 AND pick_number = $4 AND player_id = $5 AND card_id IS NULL;`,
      [cardId, draftId, slot.round, slot.pick_number, playerId]
    );

    // Advance the deadline for the next turn
    await startNextTurn(client, draftId);

    // If no more open picks, mark draft inactive
    const { rows: [remain] } = await client.query(
      `SELECT EXISTS(SELECT 1 FROM PicksV5 WHERE draft_id=$1 AND card_id IS NULL) AS has_open;`,
      [draftId]
    );
    if (!remain.has_open) {
      await client.query(`UPDATE DraftsV4 SET active=false WHERE draft_id=$1;`, [draftId]);
    }

    await client.query('COMMIT');

    // Post-commit side effects
    if (!remain.has_open) {
      await updateCollectionWithCompleteDraft(draftId);
      revalidateTag(`draft-${draftId}-info`);
    }
    revalidateTag(`draft-${draftId}-picks`);
    revalidateTag(`draft-${draftId}-undrafted`);
    revalidatePath(`/league/${leagueId}/draft/${draftId}/live`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    await broadcastDraft(draftId, 'pick_made', {});
    client.release();
  }
}

export const getOrCreateCard = async (cardName: string, set: string) => {
  console.error('Getting or creating card:', cardName, set);
  try {
    // Handle "front // back" with or without spaces around //
    const frontSideName = cardName.split(/\s*\/\/\s*/)[0].trim();
    console.error('one more shot', frontSideName);

    // 1) Try exact front side (common for DFCs stored as front only)
    const existingCard = await pool.query<Card>(
      `SELECT * FROM cards WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [frontSideName],
    );
    console.error('Existing card:', existingCard);
    if (existingCard.rows.length > 0) {
      if (existingCard.rows[0].name !== cardName) {
        // upgrade stored name to full DFC name
        await pool.query(`UPDATE cards SET name = $1 WHERE card_id = $2;`, [
          cardName,
          existingCard.rows[0].card_id,
        ]);
      }
      return existingCard.rows[0].card_id;
    }

    // 2) If not a DFC name, just create it
    if (frontSideName === cardName) {
      const newCard = await pool.query<{ card_id: number }>(
        `INSERT INTO cards (name, origin) VALUES ($1, $2) RETURNING card_id;`,
        [cardName, set],
      );
      console.debug('New card created:', newCard);
      return newCard.rows[0].card_id; // ✅ return here
    }

    // 3) Try full DFC name
    const existingDoubleFaceCard = await pool.query<Card>(
      `SELECT * FROM cards WHERE LOWER(name) = LOWER($1) LIMIT 1`,
      [cardName],
    );
    if (existingDoubleFaceCard.rows.length > 0) {
      return existingDoubleFaceCard.rows[0].card_id;
    }

    // 4) Create full DFC name
    const newCard = await pool.query<{ card_id: number }>(
      `INSERT INTO cards (name, origin) VALUES ($1, $2) RETURNING card_id;`,
      [cardName, set],
    );
    console.debug('New card created:', newCard);
    return newCard.rows[0].card_id; // ✅ THIS WAS MISSING
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to get or create card: ${error}`);
  }
};


const isDraftComplete = async (draftId: number) => {
  try {
    const activePick = await getActivePick(draftId);
    if (activePick) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to check if draft is complete');
  }
};

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

export const fetchMostValuableUndraftedCard = async (draftId: number) => {
  try {
    const undraftedCards = await fetchUndraftedCards(draftId);
    const mostValuableCard = undraftedCards.reduce(
      (prev: CardDetails, current: CardDetails) => {
        return prev.price.usd > current.price.usd ? prev : current;
      },
    );
    return mostValuableCard;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch most valuable undrafted card');
  }
};

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
        !draftedCardNames.includes(card.name) &&
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

// export const fetchAutoDraftTime = async (draftId: number): Promise<number | null> => {
//   try {
//     const pick_time_seconds = await pool.query(`SELECT pick_time_seconds, auto_draft FROM draftsV2 WHERE draft_id = $1;`, [draftId]);
//     const pick_time = pick_time_seconds.rows[0].pick_time_seconds;
//     const auto_draft = pick_time_seconds.rows[0].auto_draft;
//     if (auto_draft) {
//       return pick_time;
//     }
//     return null;
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch auto draft time');
//   }
// }

// export const fetchDraftTimer = async (draftId: number): Promise<number | null> => {
//   try {
//     const draft = await pool.query(`SELECT pick_time_seconds, auto_draft, last_pick_timestamp FROM draftsV2 WHERE draft_id = $1;`, [draftId]);
//     if (draft.rowCount === 0) {
//       throw new Error('Draft not found');
//     }
//     if (!draft.rows[0].auto_draft) {
//       return null;
//     }
//     const pick_time = draft.rows[0].pick_time_seconds;
//     const last_pick_timestamp: Date = draft.rows[0].last_pick_timestamp;
//     // add time to last_pick_timestamp to create return object
//     last_pick_timestamp.setSeconds(last_pick_timestamp.getSeconds() + pick_time);

//     return last_pick_timestamp.getTime();
//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch draft timer');
//   }
// }

export async function pauseDraft(draftId: number, leagueId: number) {
  'use client'
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
    if (rowCount > 0) {
      revalidateTag(`draft-${draftId}-info`);
    }
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    await broadcastDraft(draftId, 'paused', {});
    client.release();
  }
}

export async function resumeDraft(draftId: number) {
  'use client'
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
    await client.query(
      `UPDATE DraftsV4
         SET current_pick_deadline_at = current_pick_deadline_at + (NOW() - paused_at),
             paused_at = NULL
       WHERE draft_id = $1;`,
      [draftId]
    );
    await client.query('COMMIT');
    revalidateTag(`draft-${draftId}-info`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    await broadcastDraft(draftId, 'resumed', {});
    client.release();
  }
}

async function startNextTurn(client: pg.PoolClient, draftId: number) {
  // Use pick_time_seconds from the draft row
  await client.query(
    `UPDATE DraftsV4
       SET current_pick_deadline_at = NOW() + make_interval(secs => pick_time_seconds)
     WHERE draft_id = $1;`,
    [draftId]
  );
}

// autodraft comparison function
function cmpAuto(a: CardDetailsWithPoints, b: CardDetailsWithPoints): number {
  // prefer the latest scorer
  if (b.week !== a.week) return b.week - a.week;
  // prefer the highest scorer
  if (b.points !== a.points) return b.points - a.points;
  // prefer the most expensive
  const pa = priceUsd(a), pb = priceUsd(b);
  if (pa !== pb) return pb - pa;
  // alphabetical A-Z, case-insensitive
  const n = a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
  if (n !== 0) return n;
  // final deterministic tiebreaker: lowest card_id wins
  return num(a.card_id, Infinity) - num(b.card_id, Infinity);
}

export async function autoPickIfOverdue(draftId: number, leagueId: number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1) Lock the draft row and check timers
    const { rows: [d] } = await client.query(
      `SELECT current_pick_deadline_at, paused_at, pick_time_seconds, active FROM DraftsV4
       WHERE draft_id = $1 FOR UPDATE;`,
      [draftId]
    );
    if (!d) { await client.query('ROLLBACK'); return; }
    if (d.paused_at) { await client.query('ROLLBACK'); return; }              // paused → do nothing
    if (!d.active) { await client.query('ROLLBACK'); return; }              // inactive → done
    if (!d.current_pick_deadline_at || new Date(d.current_pick_deadline_at) > new Date()) {
      await client.query('ROLLBACK'); return;                                 // not overdue yet
    }

    // 2) Lock the current open slot (first unpicked)
    const { rows: [slot] } = await client.query<DraftPick>(
      `SELECT * FROM PicksV5
         WHERE draft_id = $1 AND card_id IS NULL
         ORDER BY round ASC, pick_number ASC
         FOR UPDATE SKIP LOCKED
         LIMIT 1;`,
      [draftId]
    );
    if (!slot) {
      // no open picks → mark inactive and exit
      await client.query(`UPDATE DraftsV4 SET active=false WHERE draft_id=$1;`, [draftId]);
      await client.query('COMMIT');
      await updateCollectionWithCompleteDraft(draftId);
      revalidateTag(`draft-${draftId}-info`);
      return;
    }

    // 3) Build candidate list (UNCACHED to avoid stale reads)
    const undrafted = await _fetchUndraftedCardsUncached(draftId);
    if (!undrafted.length) {
      await client.query('ROLLBACK'); return;                                  // nothing to pick (shouldn't happen)
    }

    // Enrich with points (your code, slightly tightened)
    const undraftedIds = undrafted
      .filter(c => c.card_id !== undefined && c.card_id !== -1)
      .map(c => c.card_id as number);

    const pointsRows = await fetchCardPerformances(undraftedIds, leagueId); // returns { card_id, total_points, week }
    const withPoints: CardDetailsWithPoints[] = undrafted.map((c) => {
      const p = pointsRows.find((r) => r.card_id === c.card_id);
      return {
        ...c,
        points: p?.total_points ?? 0,
        week: p?.week ?? -1,
      };
    });

    // 4) Choose best by points → price → A-Z (deterministic)
    withPoints.sort(cmpAuto);
    const best = withPoints[0];
    if (!best?.name) { await client.query('ROLLBACK'); return; }

    // 5) Resolve/ensure card_id (your helper)
    const cardId = best.card_id;
    if (!cardId) { await client.query('ROLLBACK'); return; }

    // 6) Atomically assign the pick (guard against races)
    const { rowCount } = await client.query(
      `UPDATE PicksV5
          SET card_id = $1
        WHERE draft_id = $2
          AND round = $3
          AND pick_number = $4
          AND player_id = $5
          AND card_id IS NULL;`,
      [cardId, draftId, slot.round, slot.pick_number, slot.player_id]
    );
    if (rowCount === 0) {
      // someone else picked in parallel
      await client.query('ROLLBACK');
      return;
    }

    await startNextTurn(client, draftId)

    // 8) If no open picks remain, mark inactive
    const { rows: [remain] } = await client.query(
      `SELECT EXISTS(SELECT 1 FROM PicksV5 WHERE draft_id=$1 AND card_id IS NULL) AS has_open;`,
      [draftId]
    );
    if (!remain.has_open) {
      await client.query(`UPDATE DraftsV4 SET active=false WHERE draft_id=$1;`, [draftId]);
    }

    await client.query('COMMIT');

    // 9) Post-commit side effects & cache busting
    if (!remain.has_open) {
      await updateCollectionWithCompleteDraft(draftId);
      revalidateTag(`draft-${draftId}-info`);
    }
    revalidateTag(`draft-${draftId}-picks`);
    revalidateTag(`draft-${draftId}-undrafted`);
    // if your live page depends on server components:
    revalidatePath(`/league/${leagueId}/draft/${draftId}/live`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
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
