'use server'
import { playerOwnsCards } from "./collection";
import pg from 'pg';
import { fetchPlayerIdInLeague, fetchPlayersInLeague } from "./leagues";
import { TradeOffer } from "./definitions";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
})


export async function makeTradeOffer(offeredCards: number[], playerId: number, wantedCards: number[], tradePartnerId: number, leagueId: number) {
  try {
    const playersInLeague = await fetchPlayerIdInLeague(leagueId);
    if (!playersInLeague.includes(playerId) || !playersInLeague.includes(tradePartnerId)) {
      throw new Error(`Problem with offer. Either you or partner do not belong to league ${leagueId}`);
    }
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

export async function fetchTradeOffers(playerId: number): Promise<TradeOffer[]> {
  try {

    // complicated query that chat gpt made
    // only selects on entry if there are multiple of the same playerIds and cards
    // ranks them based on state, where active is the highest priority
    const query = `
        WITH RankedTrades AS (
            SELECT
                *,
                ROW_NUMBER() OVER (
                    PARTITION BY offerer, recipient, offered, requested
                    ORDER BY
                        CASE state
                            WHEN 'active' THEN 1
                            WHEN 'completed' THEN 2
                            WHEN 'expired' THEN 3
                            WHEN 'declined' THEN 4
                            ELSE 5
                        END
                ) AS rank
            FROM
                Trades
            WHERE
                offerer = $1 OR recipient = $1
        )
        SELECT
            trade_id, offerer, recipient, offered, requested, state, expires
        FROM
            RankedTrades
        WHERE
            rank = 1;
    `;

    const data = await pool.query(query, [playerId]);
    return data.rows
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch trade requests`);
  }
}