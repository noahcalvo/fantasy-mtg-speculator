'use server';

import { Card, CardDetails, Draft, DraftPick } from './definitions';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { updateCollectionWithCompleteDraft } from './collection';
import { fetchLeague, isCommissioner } from './leagues';
import { fetchOwnedCards, fetchSet } from './sets';
import { fetchCardName } from './card';
import pg from 'pg';

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

export async function createDraft(prevState: State, formData: FormData, leagueId: number, playerId: number, auto_draft: boolean = false) {
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
    resp = await pool.query(`INSERT INTO draftsV2 (set, active, rounds, name, participants, league_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING draft_id;`, [set, true, rounds, name, [], leagueId]);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create draft for {set}');
  }
  revalidatePath(`/league/${leagueId}/draft`);
  redirect(`/league/${leagueId}/draft/${resp.rows[0].draft_id}/view`);
};

const fetchAllDrafts = async (leagueId: number): Promise<Draft[]> => {
  try {
    const res = await pool.query<Draft>(`SELECT * FROM draftsV2 WHERE league_id = $1;`, [leagueId]);
    return res.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch drafts');
  }
};

const fetchDraftsBySet = async (leagueId: number, set: string): Promise<Draft[]> => {
  try {
    const res = await pool.query<Draft>(`SELECT * FROM draftsV2 WHERE set = $1 AND league_id = $2;`, [set, leagueId]);
    return res.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch drafts');
  }
};

export const fetchDrafts = async (leagueId: number, set?: string): Promise<Draft[]> => {
  if (set) {
    return fetchDraftsBySet(leagueId, set);
  }
  return fetchAllDrafts(leagueId);
};

export const fetchDraft = async (draftId: number): Promise<Draft> => {
  try {
    const res = await pool.query<Draft>(`SELECT draft_id, CAST(participants AS INT[]) as participants, active, set, name, rounds, league_id FROM draftsV2 WHERE draft_id = $1;`, [draftId]);
    return res.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch draft');
  }
}

export const joinDraft = async (draftId: number, playerId: number, leagueId: number): Promise<void> => {
  try {
    // Check if the player is already a participant
    const draftResult = await pool.query(`SELECT participants, active FROM draftsV2 WHERE draft_id = $1 AND league_id = $2;`, [draftId, leagueId]);
    if (draftResult.rowCount === 0) {
      throw new Error('Draft not found');
    }

    if (!draftResult.rows[0].active) {
      throw new Error('Draft not active');
    }
    const participants = draftResult.rows[0].participants;
    if (participants.includes(playerId)) {
      console.log('Player is already a participant');
      return
    }
    // Check if player belongs to the league
    const leagueResult = await fetchLeague(leagueId);
    if (!leagueResult.participants.includes(playerId)) {
      throw new Error('Player not in league');
    }
    await pool.query(`UPDATE draftsV2 SET participants = array_append(participants, $1) WHERE draft_id = $2;`, [playerId, draftId]);
    await addPicks(draftId, playerId);
    await snakePicks(draftId);
    revalidatePath(`/league/${leagueId}/draft/${draftId}/view`);
    revalidatePath(`league/${leagueId}/draft`);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to join draft');
  } finally {
    redirect(`/league/${leagueId}/draft/${draftId}/live`);
  }
}

export const redirectIfJoined = async (participants: number[], playerId: number, draftId: number, leagueId: number) => {
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
}

const addPicks = async (draftId: number, playerId: number) => {
  try {
    const draft = await fetchDraft(draftId);
    const rounds = draft.rounds;
    const pick = draft.participants.length - 1;
    for (let i = 0; i < rounds; i++) {
      await pool.query(`INSERT INTO picksV3 (draft_id, player_id, round, pick_number) VALUES ($1, $2, $3, $4);`, [draftId, playerId, i, pick]);
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to add picks');
  }
}

const snakePicks = async (draftId: number) => {
  try {
    const draft = await fetchDraft(draftId);
    const participants = draft.participants;
    const rounds = draft.rounds;
    const picksPerRound = participants.length;
    // even numbered rounds are reversed (2nd, 4th, etc.)
    for (let i = 1; i < rounds; i = i + 2) {
      // move the last entry out of bounds
      await pool.query(`UPDATE picksV3 SET pick_number = $1 WHERE draft_id = $2 AND round = $3 AND player_id = $4;`, [picksPerRound, draftId, i, participants[picksPerRound - 1]]);
      for (let j = 0; j < picksPerRound; j++) {
        // move pick j over 1
        await pool.query(`UPDATE picksV3 SET pick_number = $1 WHERE draft_id = $2 AND round = $3 AND player_id = $4;`, [picksPerRound - j - 1, draftId, i, participants[j]]);
      }
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to snake picks');
  }
}

export const fetchPicks = async (draftId: number) => {
  try {
    const res = await pool.query<DraftPick>(`SELECT * FROM picksV3 WHERE draft_id = $1;`, [draftId]);
    return res.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch picks');
  }
}

export const fetchAvailableCards = async (cards: CardDetails[], draftId: number) => {
  try {
    const res = await pool.query(`SELECT * FROM picksV3 WHERE draft_id = $1);`, [draftId]);
    const undraftedCards = cards.filter(card => !res.rows.some(pick => pick.card_id === card.name));
    return undraftedCards;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch available cards');
  }
}

export async function makePick(draftId: number, playerId: number, cardName: string, set: string, leagueId: number) {
  console.error('Making pick:', draftId, playerId, cardName, set);
  console.error('using pool:', pool);
  try {
    const cardId = await getOrCreateCard(cardName, set);
    if (!cardId) {
      throw new Error('Failed to get or create card');
    }
    const activePick = await getActivePick(draftId);
    if (activePick?.player_id !== playerId) {
      console.log('Not your turn', activePick, playerId)
      throw new Error('Not your turn');
    }
    await pool.query(`UPDATE picksV3 SET card_id = $1 WHERE draft_id = $2 AND player_id = $3 AND round = $4 AND pick_number = $5;`, [cardId, draftId, playerId, activePick.round, activePick.pick_number]);
    // await pool.query(`UPDATE draftsV2 SET last_pick_timestamp = NOW() WHERE draft_id = $1;`, [draftId]);
    if (await isDraftComplete(draftId)) {
      await pool.query(`UPDATE draftsV2 SET active = false WHERE draft_id = ${draftId};`);
      await updateCollectionWithCompleteDraft(draftId);
    }
    revalidatePath(`/league/${leagueId}/draft/${draftId}/live`);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to make pick');
  }
}

export const getOrCreateCard = async (cardName: string, set: string) => {
  console.error('Getting or creating card:', cardName, set);
  try {
    // Check if card exists in the database
    // remove '//'  and everything after it
    const frontSideName = cardName.split(' //')[0].trim();
    console.error("one more shot", frontSideName);
    const existingCard = await pool.query<Card>(`SELECT * FROM cards WHERE LOWER(name) = LOWER($1) LIMIT 1`, [frontSideName]);
    console.error('Existing card:', existingCard);
    if (existingCard.rows.length > 0) {
      if (existingCard.rows[0].name !== cardName) {
        // update the name to include the full, double sided name
        await pool.query(`UPDATE cards SET name = $1 WHERE card_id = $1;`, [cardName, existingCard.rows[0].card_id]);
      }
      return existingCard.rows[0].card_id;
    }
    if (frontSideName === cardName) {
      const newCard = await pool.query<Card>(`INSERT INTO cards (name, origin) VALUES ($1, $2) RETURNING card_id;`, [cardName, set]);
      console.log('New card created:', newCard)
      return newCard.rows[0].card_id;
    }
    const existingDoubleFaceCard = await pool.query<Card>(`SELECT * FROM cards WHERE LOWER(name) = LOWER($1) LIMIT 1`, [cardName]);
    if (existingDoubleFaceCard.rows.length > 0) {
      return existingDoubleFaceCard.rows[0].card_id;
    }
    const newCard = await pool.query<Card>(`INSERT INTO cards (name, origin) VALUES ($1, $2) RETURNING card_id;`, [cardName, set]);
    console.log('New card created:', newCard)
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to get or create card: ${error}`);
  }
}

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
}

export const getActivePick = async (draftId: number): Promise<DraftPick | null> => {
  try {
    const activePick = await pool.query<DraftPick>(`
    SELECT p.*
    FROM picksV3 p
    JOIN draftsV2 d ON p.draft_id = d.draft_id
    WHERE d.draft_id = $1 AND p.card_id IS NULL
    ORDER BY p.round ASC, p.pick_number ASC
    LIMIT 1;
  `, [draftId]);
    // return null if no active pick
    if (activePick.rows.length === 0) {
      return null;
    }
    return activePick.rows[0];
  }
  catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to get active pick');
  }
}

export const fetchMostValuableUndraftedCard = async (draftId: number) => {
  try {
    const undraftedCards = await fetchUndrafterCards(draftId);
    const mostValuableCard = undraftedCards.reduce((prev: CardDetails, current: CardDetails) => {
      return prev.price.usd > current.price.usd ? prev : current;
    });
    return mostValuableCard;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch most valuable undrafted card');
  }
}

export const fetchUndrafterCards = async (draftId: number) => {
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
}

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