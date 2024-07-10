'use server';

import { sql } from "@vercel/postgres";
import { Card, CardDetails, CardPoint } from "./definitions";

export async function fetchCard(cardId: number): Promise<CardDetails> {
    let data;
    if (!cardId) {
        return {
            name: "",
            image: "",
            price: {
                tix: 0,
                usd: 0,
            },
            scryfallUri: "",
            colorIdentity: [],
            typeLine: "",
            card_id: -1
        };
    }
    try {
        data = await sql<CardPoint>`
        SELECT name FROM Cards WHERE card_id = ${cardId};
        `;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error(`Failed to fetch card for card_id:${cardId}`);
    }
    try {
        const encodedName = encodeURIComponent(data.rows[0].name);
        const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodedName}`, {
            next: { revalidate: 600 },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const card = await response.json();
        if (card.object === "error") {
            throw new Error(`Card not found: ${data.rows[0].name}`);
        }
        const { name, image_uris, prices, scryfall_uri, color_identity, type_line } = card;
        return {
            name,
            image: image_uris?.png ?? card.card_faces[0].image_uris.png ?? "",
            price: {
                tix: prices.tix,
                usd: prices.usd,
            },
            scryfallUri: scryfall_uri,
            colorIdentity: color_identity,
            typeLine: type_line,
            card_id: cardId
        };
    } catch (error) {
        console.error('scryfall error:', error);
        throw new Error(`Failed to fetch card for cardName:${data.rows[0].name}`);
    }
}

export async function fetchCardName(cardId: string): Promise<string> {
    const data = await sql<Card>`
  SELECT name FROM Cards WHERE card_id = ${cardId};
  `;
    return data.rows[0].name;
}

export async function fetchCardId(cardName: string): Promise<number> {
    try {
        const data = await sql<Card>`
        SELECT * FROM Cards WHERE name = ${cardName};
        `;
        if (data.rows.length === 0) {
            return -1;
        }
        return data.rows[0].card_id;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error(`Failed to fetch card id for card:${cardName}`);
    }
}