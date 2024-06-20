import { sql } from "@vercel/postgres";
import { playerOwnsCards } from "./collection";

export async function makeTradeOffer(offeredCards: number[], playerId: number, wantedCards: number[], tradePartnerId: number) {
  try {
    const ownership = await playerOwnsCards(playerId, offeredCards) && await playerOwnsCards(tradePartnerId, wantedCards)
    console.log("finished checking ownership")
    if (!ownership) {
      throw new Error('Problem with offer. Either cards offered are not owned by you or cards requested are not owned by partner.');
    }
    console.log("ownership passed")
    await sql`INSERT into trades (offerer, recipient, offered, requested, state, expires)`;
    console.log("no way it got here")
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to create trade request`);
  }
}