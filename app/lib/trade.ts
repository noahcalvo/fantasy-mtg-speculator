'use server';
import { playerOwnsCards } from './collection';
import pg from 'pg';
import { fetchPlayerIdInLeague } from './leagues';
import {
  CardDetails,
  TradeOffer,
  TradeOfferWithCardDetails,
} from './definitions';
import { fetchCard } from './card';
import { fetchParticipantData } from './player';
import { redirect } from 'next/navigation';
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
      (await playerOwnsCards(playerId, offeredCards, leagueId)) &&
      (await playerOwnsCards(tradePartnerId, wantedCards, leagueId));
    if (!ownership) {
      throw new Error(
        'Problem with offer. Either cards offered are not owned by you or cards requested are not owned by partner.',
      );
    }
    await pool.query(
      'INSERT into tradesV2 (offerer, recipient, offered, requested, state, league_id) VALUES ($1, $2, $3, $4, $5, $6)',
      [playerId, tradePartnerId, offeredCards, wantedCards, 'pending', leagueId],
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
  leagueId: number
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
                TradesV2
            WHERE
                offerer = $1 OR recipient = $1
            AND
                league_id = $2
        )
        SELECT
            trade_id, offerer, recipient, offered, requested, state, expires
        FROM
            RankedTrades
        WHERE
            rank = 1;
    `;

    const data = await pool.query(query, [playerId, leagueId]);
    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error(`Failed to fetch trade requests`);
  }
}

export async function fetchTradeOffersWithDetails(
  playerId: number,
  leagueId: number,
): Promise<TradeOfferWithCardDetails[]> {
  try {
    const offers = await fetchTradeOffers(playerId, leagueId);
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
          league_id: leagueId,
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
        TradesV2
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
      league_id: offer.league_id,
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
    // check if trade is still pending
    const tradeEntry = await pool.query(
      'SELECT * FROM tradesV2 WHERE trade_id = $1 AND state = $2',
      [trade.trade_id, 'pending'],
    );
    if (tradeEntry.rowCount === 0) {
      console.error('Trade not found or not pending');
      throw new Error(`Trade not found or not pending`);
    }
    const tradeQuery =
      'UPDATE tradesV2 SET state = $1 WHERE trade_id = $2 AND recipient = $3';
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
      'UPDATE OwnershipV3 SET player_id = $1 WHERE card_id = ANY($2::int[]) AND league_id = $3';

    // Update ownership for the offered cards to the recipient
    await pool.query(updateOwnershipQuery, [trade.recipient, trade.offered, trade.league_id]);

    // Update ownership for the requested cards to the offerer
    await pool.query(updateOwnershipQuery, [trade.offerer, trade.requested, trade.league_id]);

    const expireTradesQuery = `
    UPDATE tradesV2
    SET state = 'expired' 
    WHERE state = 'pending' 
    AND trade_id != $1
    AND (offered && $2::int[] OR requested && $3::int[])
    AND league_id = $4
  `;

    // Expire all other pending trades that involve the offered or requested cards
    await pool.query(expireTradesQuery, [
      trade.trade_id,
      trade.offered,
      trade.requested,
      trade.league_id,
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
      'UPDATE tradesV2 SET state = $1 WHERE trade_id = $2 AND recipient = $3';
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
      'UPDATE tradesV2 SET state = $1 WHERE trade_id = $2 AND offerer = $3';
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
