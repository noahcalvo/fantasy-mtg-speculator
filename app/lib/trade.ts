'use server'
import { playerOwnsCards } from "./collection";
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})


export async function makeTradeOffer(offeredCards: number[], playerId: number, wantedCards: number[], tradePartnerId: number) {
  try {
    const ownership = await playerOwnsCards(playerId, offeredCards) && await playerOwnsCards(tradePartnerId, wantedCards)
    console.log("finished checking ownership")
    if (!ownership) {
      throw new Error('Problem with offer. Either cards offered are not owned by you or cards requested are not owned by partner.');
    }
    console.log("ownership passed")
    await pool.query('INSERT into trades (offerer, recipient, offered, requested, state) VALUES ($1, $2, $3, $4, $5)', [playerId, tradePartnerId, offeredCards, wantedCards, "pending"])
    console.log("query ran")
    console.log("no way it got here")
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to create trade request`);
  }
}