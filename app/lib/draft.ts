'use server';

import { sql } from '@vercel/postgres';
import { Card, CardDetails, Draft, DraftPick } from './definitions';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';
import { getActivePick } from './clientActions';
import { updateCollectionWithCompleteDraft } from './collection';
import { isCommissioner } from './leagues';

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

export async function createDraft(prevState: State, formData: FormData, league_id: number, playerId: number) {
  const commissioner = await isCommissioner(playerId, league_id);
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
    resp = await sql`INSERT INTO draftsV2 (set, active, rounds, name, participants, league_id) VALUES (${set}, true, ${rounds}, ${name}, array[]::int[], ${league_id}) RETURNING draft_id;`;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create draft for {set}');
  }
  revalidatePath('/draft');
  redirect(`/draft/${resp.rows[0].draft_id}/view`);
};

const fetchAllDrafts = async (leagueId: number): Promise<Draft[]> => {
  try {
    const res = await sql<Draft>`SELECT * FROM draftsV2 WHERE league_id = ${leagueId};`;
    return res.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch drafts');
  }
};

const fetchDraftsBySet = async (leagueId: number, set: string): Promise<Draft[]> => {
  try {
    const res = await sql<Draft>`SELECT * FROM draftsV2 WHERE set = ${set} AND league_id = ${leagueId};`;
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

export const fetchDraft = async (id: string): Promise<Draft> => {
  noStore();

  try {
    const res = await sql<Draft>`SELECT draft_id, CAST(participants AS INT[]) as participants, active, set, name, rounds FROM draftsV2 WHERE draft_id = ${id};`;
    return res.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch draft');
  }
}

export const joinDraft = async (draftId: string, playerId: number): Promise<void> => {
  try {
    // Check if the player is already a participant
    const draftResult = await sql`SELECT participants, active FROM draftsV2 WHERE draft_id = ${draftId};`;
    if (draftResult.rowCount === 0) {
      throw new Error('Draft not found');
    }
    if (!draftResult.rows[0].active) {
      throw new Error('Draft not active');
    }
    const participants = draftResult.rows[0].participants;
    if (participants.includes(playerId)) {
      console.log('Player is already a participant');
    } else {
      await sql`UPDATE draftsV2 SET participants = array_append(participants, ${playerId}) WHERE draft_id = ${draftId};`;
      await addPicks(draftId, playerId);
      await snakePicks(draftId);
      revalidatePath(`/draft/${draftId}/view`);
      revalidatePath(`/draft`);
    }

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to join draft');
  } finally {
    redirect(`/draft/${draftId}/live`);
  }
}

export const redirectIfJoined = async (participants: number[], playerId: number, draftId: string) => {
  noStore();

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
      redirect(`/draft/${draftId}/live`);
    }
  }
}

const addPicks = async (draftId: string, playerId: number) => {
  try {
    const draft = await fetchDraft(draftId);
    const rounds = draft.rounds;
    const pick = draft.participants.length - 1;
    for (let i = 0; i < rounds; i++) {
      await sql`INSERT INTO picksV3 (draft_id, player_id, round, pick_number) VALUES (${draftId}, ${playerId}, ${i}, ${pick});`;
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to add picks');
  }
}

const snakePicks = async (draftId: string) => {
  try {
    const draft = await fetchDraft(draftId);
    const participants = draft.participants;
    const rounds = draft.rounds;
    const picksPerRound = participants.length;
    // even numbered rounds are reversed (2nd, 4th, etc.)
    for (let i = 1; i < rounds; i = i + 2) {
      // move the last entry out of bounds
      await sql`UPDATE picksV3 SET pick_number = ${picksPerRound} WHERE draft_id = ${draftId} AND round = ${i} AND player_id = ${participants[picksPerRound - 1]};`;
      for (let j = 0; j < picksPerRound; j++) {
        // move pick j over 1
        await sql`UPDATE picksV3 SET pick_number = ${picksPerRound - j - 1} WHERE draft_id = ${draftId} AND round = ${i} AND player_id = ${participants[j]};`;
      }
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to snake picks');
  }
}

export const fetchPicks = async (draftId: string) => {
  noStore();
  try {
    const res = await sql<DraftPick>`SELECT * FROM picksV3 WHERE draft_id = ${draftId};`;
    revalidatePath(`/draft/${draftId}/live`);
    return res.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch picks');
  }
}

export const fetchAvailableCards = async (cards: CardDetails[], draftId: string) => {
  try {
    const res = await sql`SELECT * FROM picksV3 WHERE draft_id = ${draftId});`;
    const undraftedCards = cards.filter(card => !res.rows.some(pick => pick.card_id === card.name));
    return undraftedCards;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch available cards');
  }
}

export const makePick = async (draftId: string, playerId: number, cardName: string, set: string) => {
  try {
    const cardId = await getOrCreateCard(cardName, set);
    if (!cardId) {
      throw new Error('Failed to get or create card');
    }
    const activePick = await getActivePick(await fetchPicks(draftId));
    if (activePick?.player_id !== playerId) {
      console.log('Not your turn', activePick, playerId)
      throw new Error('Not your turn');
    }
    await sql`UPDATE picksV3 SET card_id = ${cardId} WHERE draft_id = ${draftId} AND player_id = ${playerId} AND round = ${activePick.round} AND pick_number = ${activePick.pick_number};`;
    if (await isDraftComplete(draftId)) {
      await sql`UPDATE draftsV2 SET active = false WHERE draft_id = ${draftId};`;
      await updateCollectionWithCompleteDraft(draftId);
    }
    revalidatePath(`/draft/${draftId}/live`);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to make pick');
  }
}

export const getOrCreateCard = async (cardName: string, set: string) => {
  try {
    // Check if card exists in the database
    // remove '//'  and everything after it
    const frontSideName = cardName.split(' //')[0].trim();
    const existingCard = await sql<Card>`SELECT * FROM cards WHERE LOWER(name) = LOWER(${frontSideName}) LIMIT 1`;
    if (existingCard.rows.length > 0) {
      if (existingCard.rows[0].name !== cardName) {
        // update the name to include the full, double sided name
        await sql`UPDATE cards SET name = ${cardName} WHERE card_id = ${existingCard.rows[0].card_id};`;
      }
      return existingCard.rows[0].card_id;
    }
    if (frontSideName === cardName) {
      const newCard = await sql<Card>`INSERT INTO cards (name, origin) VALUES (${cardName}, ${set}) RETURNING card_id;`;
      console.log('New card created:', newCard)
      return newCard.rows[0].card_id;
    }
    const existingDoubleFaceCard = await sql<Card>`SELECT * FROM cards WHERE LOWER(name) = LOWER(${cardName}) LIMIT 1`;
    if (existingDoubleFaceCard.rows.length > 0) {
      return existingDoubleFaceCard.rows[0].card_id;
    }
    const newCard = await sql<Card>`INSERT INTO cards (name, origin) VALUES (${cardName}, ${set}) RETURNING card_id;`;
    console.log('New card created:', newCard)
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to get or create card: ${error}`);
  }
}

const isDraftComplete = async (draftId: string) => {
  try {
    const picks = await fetchPicks(draftId);
    const activePick = getActivePick(picks);
    if (activePick) {
      return false;
    }
    return true;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to check if draft is complete');
  }
}