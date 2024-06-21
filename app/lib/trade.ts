'use server';
import { playerOwnsCards } from './collection';
import pg from 'pg';
import { fetchPlayerIdInLeague, fetchPlayersInLeague } from './leagues';
import {
  CardDetails,
  TradeOffer,
  TradeOfferWithCardDetails,
} from './definitions';
import { fetchCard } from './sets';
import { fetchParticipantData } from './player';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { completedTradeBulletin } from './bulletin';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export async function makeTradeOffer(
  offeredCards: number[],
  playerId: number,
  wantedCards: number[],
  tradePartnerId: number,
  leagueId: number,
) {
  if (offeredCards.length === 0 || wantedCards.length === 0) {
    throw new Error(
      'Problem with offer. Either no cards offered or no cards requested.',
    );
  }
  try {
    const playersInLeague = await fetchPlayerIdInLeague(leagueId);
    if (
      !playersInLeague.includes(playerId) ||
      !playersInLeague.includes(tradePartnerId)
    ) {
      throw new Error(
        `Problem with offer. Either you or partner do not belong to league ${leagueId}`,
      );
    }
    const ownership =
      (await playerOwnsCards(playerId, offeredCards)) &&
      (await playerOwnsCards(tradePartnerId, wantedCards));
    if (!ownership) {
      throw new Error(
        'Problem with offer. Either cards offered are not owned by you or cards requested are not owned by partner.',
      );
    }
    await pool.query(
      'INSERT into trades (offerer, recipient, offered, requested, state) VALUES ($1, $2, $3, $4, $5)',
      [playerId, tradePartnerId, offeredCards, wantedCards, 'pending'],
    );
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to create trade request`);
  } finally {
    redirect(`/league/${leagueId}/trade`);
  }
}

export async function fetchTradeOffers(
  playerId: number,
): Promise<TradeOffer[]> {
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
                            WHEN 'pending' THEN 1
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
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch trade requests`);
  }
}

export async function fetchTradeOffersWithDetails(
  playerId: number,
): Promise<TradeOfferWithCardDetails[]> {
  try {
    const offers = await fetchTradeOffers(playerId);
    const offerWithCardDetails = await Promise.all(
      offers.map(async (offer) => {
        const offeredCardDetails: CardDetails[] = [];
        for (var cardId of offer.offered ?? []) {
          offeredCardDetails.push(await fetchCard(cardId));
        }
        const recievingCards: CardDetails[] = [];
        for (var cardId of offer.requested ?? []) {
          recievingCards.push(await fetchCard(cardId));
        }
        const offerer = await fetchParticipantData(offer.offerer);
        const recipient = await fetchParticipantData(offer.recipient);
        return {
          offeredCards: offeredCardDetails,
          requestedCards: recievingCards,
          trade_id: offer.trade_id,
          offerer: offerer,
          recipient: recipient,
          state: offer.state,
        };
      }),
    );
    return offerWithCardDetails;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch trade requests`);
  }
}

export async function fetchTradeOfferWithDetails(
  tradeId: number,
): Promise<TradeOfferWithCardDetails> {
  try {
    const query = `
    SELECT
        trade_id, offerer, recipient, offered, requested, state
    FROM
        Trades
    WHERE
        trade_id = $1;
    `;

    const data = await pool.query(query, [tradeId]);
    const offer = data.rows[0];
    const offeredCardDetails: CardDetails[] = [];
    for (var cardId of offer.offered ?? []) {
      offeredCardDetails.push(await fetchCard(cardId));
    }
    const recievingCards: CardDetails[] = [];
    for (var cardId of offer.requested ?? []) {
      recievingCards.push(await fetchCard(cardId));
    }
    const offerer = await fetchParticipantData(offer.offerer);
    const recipient = await fetchParticipantData(offer.recipient);
    return {
      offeredCards: offeredCardDetails,
      requestedCards: recievingCards,
      trade_id: offer.trade_id,
      offerer: offerer,
      recipient: recipient,
      state: offer.state,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch trade request`);
  }
}

export async function acceptTrade(
  trade: TradeOffer,
  playerId: number,
  leagueId: number,
) {
  try {
    const tradeQuery =
      'UPDATE trades SET state = $1 WHERE trade_id = $2 AND recipient = $3';
    const res = await pool.query(tradeQuery, [
      'completed',
      trade.trade_id,
      playerId,
    ]);

    if (res.rowCount === 0) {
      console.error('Trade not found');
      throw new Error(`Trade not found`);
    }

    const updateOwnershipQuery =
      'UPDATE Ownership SET player_id = $1 WHERE card_id = ANY($2::int[])';

    // Update ownership for the offered cards to the recipient
    await pool.query(updateOwnershipQuery, [trade.recipient, trade.offered]);

    // Update ownership for the requested cards to the offerer
    await pool.query(updateOwnershipQuery, [trade.offerer, trade.requested]);

    const expireTradesQuery = `
    UPDATE trades 
    SET state = 'expired' 
    WHERE state = 'pending' 
    AND trade_id != $1
    AND (offered && $2::int[] OR requested && $3::int[])
  `;

    // Expire all other pending trades that involve the offered or requested cards
    await pool.query(expireTradesQuery, [
      trade.trade_id,
      trade.offered,
      trade.requested,
    ]);

    await completedTradeBulletin(trade, leagueId);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to accept trade`);
  } finally {
    redirect(`/league/${leagueId}/trade`);
  }
}

export async function declineTrade(
  trade: TradeOffer,
  playerId: number,
  leagueId: number,
) {
  try {
    const tradeQuery =
      'UPDATE trades SET state = $1 WHERE trade_id = $2 AND recipient = $3';
    const res = await pool.query(tradeQuery, [
      'declined',
      trade.trade_id,
      playerId,
    ]);

    if (res.rowCount === 0) {
      console.error('Trade not found');
      throw new Error(`Trade not found`);
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to decline trade`);
  } finally {
    redirect(`/league/${leagueId}/trade`);
  }
}

export async function revokeTrade(
  trade: TradeOffer,
  playerId: number,
  leagueId: number,
) {
  try {
    const tradeQuery =
      'UPDATE trades SET state = $1 WHERE trade_id = $2 AND offerer = $3';
    const res = await pool.query(tradeQuery, [
      'expired',
      trade.trade_id,
      playerId,
    ]);

    if (res.rowCount === 0) {
      console.error('Trade not found');
      throw new Error(`Trade not found`);
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to revoke trade`);
  } finally {
    redirect(`/league/${leagueId}/trade`);
  }
}
