'use server';
import { sql } from "@vercel/postgres";
import { BulletinItem, TradeOffer } from "./definitions";
import { fetchTradeOfferWithDetails } from "./trade";
import { isPlayerInLeague } from "./leagues";
import { revalidatePath } from "next/cache";

export async function completedTradeBulletin(trade: TradeOffer, leagueId: number) {
    try {
        const tradeWithDetails = await fetchTradeOfferWithDetails(trade.trade_id);
        const message = `Trade between ${tradeWithDetails.offerer.name} and ${tradeWithDetails.recipient.name} has been completed.
        \t${tradeWithDetails.offerer.name} recieves ${tradeWithDetails.requestedCards.map(card => card.name).join(', ')}
        \t${tradeWithDetails.recipient.name} recieves ${tradeWithDetails.offeredCards.map(card => card.name).join(', ')}`;
        await sql`INSERT INTO bulletinItems (league_id, player_id, message) VALUES (${leagueId}, 0, ${message}) RETURNING league_id;`;
        revalidatePath(`/league/${leagueId}/bulletin`);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error(`Failed to create bulletin.`);
    }
}

export async function fetchBulletinItems(leagueId: number): Promise<BulletinItem[]> {
    try {
        const data = await sql<BulletinItem>`
            SELECT 
                b.player_id,
                b.message,
                b.created,
                u.name as author
            FROM
                bulletinItems b
            JOIN
                users u
            ON
                b.player_id = u.player_id
            WHERE
                b.league_id = ${leagueId}
            ORDER BY
                created DESC
            LIMIT 10;
        `
        return data.rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error(`Failed to fetch bulletin items`);
    }
}

export async function postBulletinItem(leagueId: number, message: string, playerId: number = 0) {
    try {
        if (message.length > 1000) {
            throw new Error('Message too long');
        }
        if (message.length === 0) {
            throw new Error('Message too short');
        }
        if (playerId !== 0 ) {
            const isValidPlayer = await isPlayerInLeague(playerId, leagueId);
            if (!isValidPlayer) {
                throw new Error('Player not in league');
            }
        }
        await sql`INSERT INTO bulletinItems (league_id, player_id, message) VALUES (${leagueId}, ${playerId}, ${message}) RETURNING league_id;`;
        revalidatePath(`/league/${leagueId}/bulletin`);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error(`Failed to post bulletin item`);
    }
}