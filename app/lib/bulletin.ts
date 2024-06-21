import { sql } from "@vercel/postgres";
import { TradeOffer } from "./definitions";
import { fetchTradeOfferWithDetails } from "./trade";

export async function completedTradeBulletin(trade: TradeOffer, leagueId: number) {
    try {
        const tradeWithDetails = await fetchTradeOfferWithDetails(trade.trade_id);
        const message = `Trade between ${tradeWithDetails.offerer.name} and ${tradeWithDetails.recipient.name} has been completed.
        \t${tradeWithDetails.offerer.name} recieves ${tradeWithDetails.requestedCards.map(card => card.name).join(', ')}
        \t${tradeWithDetails.recipient.name} recieves ${tradeWithDetails.offeredCards.map(card => card.name).join(', ')}`;
        await sql`INSERT INTO bulletinItems (league_id, player_id, message) VALUES (${leagueId}, 0, ${message}) RETURNING league_id;`;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error(`Failed to create bulletin.`);
    }
}

export async function fetchBulletinItems(leagueId: number) {
    try {
        const data = await sql`
            SELECT 
                player_id,
                message
            FROM
                bulletinItems
            WHERE
                league_id = ${leagueId}
            ORDER BY
                created DESC
            LIMIT 10;
        `;
        return data.rows;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error(`Failed to fetch bulletin items`);
    }
}