'use server';

import { sql } from '@vercel/postgres';
import { CardDetails, Draft, DraftPick } from './definitions';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { unstable_noStore as noStore } from 'next/cache';

const FormSchema = z.object({
  id: z.string(),
  set: z.string({
    invalid_type_error: 'Please select a set.',
  }),
  name: z.string({
    invalid_type_error: 'Please provide a name.',
  }),
  rounds: z.coerce
    .number()
    .gt(0, { message: 'Please enter an number greater than 0.' }),
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

export async function createDraft(prevState: State, formData: FormData) {
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
      resp = await sql`INSERT INTO drafts (set, active, rounds, name, participants) VALUES (${set}, true, ${rounds}, ${name}, array[]::int[]) RETURNING draft_id;`;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create draft for {set}');
  }
  revalidatePath('/draft');
  redirect(`/draft/${resp.rows[0].draft_id}/view`);
};

const fetchAllDrafts = async (): Promise<Draft[]> => {
  try {
    const res = await sql<Draft>`SELECT * FROM drafts;`;
    return res.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch drafts');
  }
};

const fetchDraftsBySet = async (set: string): Promise<Draft[]> => {
  try {
    const res = await sql<Draft>`SELECT * FROM drafts WHERE set = ${set};`;
    return res.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch drafts');
  }
};

export const fetchDrafts = async (set?: string): Promise<Draft[]> => {
  if (set) {
    return fetchDraftsBySet(set);
  }
  return fetchAllDrafts();
};

export const fetchDraft = async (id: string): Promise<Draft> => {
  noStore();

  try {
    const res = await sql<Draft>`SELECT draft_id, CAST(participants AS INT[]) as participants, active, set, name, rounds FROM drafts WHERE draft_id = ${id};`;
    return res.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch draft');
  }
}

export const joinDraft = async (draftId: string, playerId: number): Promise<void> => {
  try {
    // Check if the player is already a participant
    const draftResult = await sql`SELECT participants FROM drafts WHERE draft_id = ${draftId};`;
    if (draftResult.rowCount === 0) {
      throw new Error('Draft not found');
    }
    const participants = draftResult.rows[0].participants;
    if (participants.includes(playerId)) {
      console.log('Player is already a participant');
    } else {
      await sql`UPDATE drafts SET participants = array_append(participants, ${playerId}) WHERE draft_id = ${draftId};`;
      addPicks(draftId, playerId);
      revalidatePath(`/draft/${draftId}/view`);  
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
    const pick = draft.participants.length;
    for (let i = 0; i < rounds; i++) {
      await sql`INSERT INTO picks (draft_id, player_id, round, pick_number) VALUES (${draftId}, ${playerId}, ${i}, ${pick});`;
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to add picks');
  }
}

export const fetchPicks = async (draftId: string) => {
  try {
    const res = await sql<DraftPick>`SELECT * FROM picks WHERE draft_id = ${draftId};`;
    return res.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch picks');
  }
}

export const fetchAvailableCards = async (cards: CardDetails[], draftId: string) => {
  try {
    const res = await sql`SELECT * FROM picks WHERE draft_id = ${draftId});`;
    const undraftedCards = cards.filter(card => !res.rows.some(pick => pick.card_id === card.name));
    return undraftedCards;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch available cards');
  }
}