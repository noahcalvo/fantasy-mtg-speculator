'use server';

import { sql } from "@vercel/postgres";
import { Card, CardDetails } from "./definitions";

export async function fetchCard(cardId: number): Promise<CardDetails> {
    let data;
    if (!cardId) {
        return {
            name: "",
            image: [],
            price: {
                tix: 0,
                usd: 0,
            },
            scryfallUri: "",
            colorIdentity: [],
            typeLine: "",
            card_id: -1,
            set: ""
        };
    }
    try {
        data = await sql<Card>`
        SELECT name FROM Cards WHERE card_id = ${cardId};
        `;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error(`Failed to fetch card for card_id:${cardId}`);
    }
    try {
        const encodedName = encodeURIComponent(data.rows[0].name);
        const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodedName}`, { cache: 'force-cache' });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const cardData = await response.json();
        if (cardData.object === "error") {
            throw new Error(`Card not found: ${data.rows[0].name}`);
        }

        return {
            name: cardData.name,
            image: cardData.image_uris?.png ? [cardData.image_uris.png] : [cardData.card_faces[0].image_uris.png, cardData.card_faces[1].image_uris.png],
            price: {
                tix: cardData.prices.tix,
                usd: cardData.prices.usd,
            },
            scryfallUri: cardData.scryfall_uri,
            colorIdentity: cardData.color_identity,
            typeLine: cardData.type_line,
            card_id: cardId,
            set: cardData.set_name
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
        if (data.rows.length > 0) {
            return data.rows[0].card_id;
        }
        if (cardName.includes('//')) {
            const frontSideName = cardName.split(' //')[0].trim();
            const existingCard = await sql<Card>`SELECT * FROM Cards WHERE LOWER(name) = LOWER(${frontSideName}) LIMIT 1`;
            if (existingCard.rows.length > 0) {
                return existingCard.rows[0].card_id;
            }
        }
        return -1;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error(`Failed to fetch card id for card:${cardName}`);
    }
}

export async function fetchScryfallDataByCardName(cardName: string): Promise<CardDetails> {
    try {
        const encodedName = encodeURIComponent(cardName);
        const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodedName}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const cardData = await response.json();
        if (cardData.object === "error") {
            throw new Error(`Card not found: ${cardName}`);
        }
        const { name, prices, scryfall_uri, color_identity, type_line } = cardData;
        return {
            name,
            image: cardData.card_faces ? [cardData.card_faces[0].image_uris.png, cardData.card_faces[1].image_uris.png] : [cardData.image_uris.png],
            price: {
                tix: prices.tix,
                usd: prices.usd,
            },
            scryfallUri: scryfall_uri,
            colorIdentity: color_identity,
            typeLine: type_line,
            set: cardData.set_name,
            card_id: -1
        };
    } catch (error) {
        console.error('scryfall error:', error);
        throw new Error(`Failed to fetch card for cardName:${cardName}`);
    }
}