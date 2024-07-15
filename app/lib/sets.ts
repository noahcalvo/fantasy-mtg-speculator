import { sql } from "@vercel/postgres";
import { Card, CardDetails, CardPoint } from "./definitions";
import { fetchCardId } from "./card";

const MODERN_LEGAL = ["core", "expansion"]

const POSITIVE_OUTLIERS = ["Modern Horizons 3", "Modern Horizons 2", "Assassin's Creed", "Modern Horizons", "The Lord of the Rings: Tales of Middle-earth"]
const NEGATIVE_OUTLIERS = ["Modern Horizons 2 Timeshifts"]

export async function fetchRecentSets(): Promise<string[]> {
    const response = await fetch('https://api.scryfall.com/sets', {
        next: { revalidate: 600 },
    })

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const sets = await response.json();
    const filteredSets = sets.data.filter((set: any) => {
        const setYear = parseInt(set.released_at.slice(0, 4));
        return setYear > 2008 && ((MODERN_LEGAL.includes(set.set_type) && !NEGATIVE_OUTLIERS.includes(set.name)) || POSITIVE_OUTLIERS.includes(set.name));
    });

    const setNames = filteredSets.map((set: any) => set.name);
    return setNames;
}

export async function fetchSet(set: string): Promise<CardDetails[]> {
    const setCode = await getSetCode(set);
    const response = await fetch(`https://api.scryfall.com/cards/search?q=is%3Afirstprint+set%3A${setCode}`, {
        next: { revalidate: 600 },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} set: ${set}`);
    }

    const setData = await response.json();
    const cardsPromises = setData.data.map(async (card: any) => {
        const { name, prices, scryfall_uri, color_identity, type_line } = card;
        const cardId = await fetchCardId(name);
        return {
            "card_id": cardId,
            name,
            image: card.image_uris ? [card.image_uris?.png] : [card.card_faces[0].image_uris.png, card.card_faces[1].image_uris.png],
            price: {
                tix: prices.tix,
                usd: prices.usd,
            },
            scryfallUri: scryfall_uri,
            colorIdentity: color_identity,
            typeLine: type_line,
            set: set
        };
    });
    while (setData.has_more) {
        const nextResponse = await fetch(setData.next_page, {
            next: { revalidate: 600 },
        });

        if (!nextResponse.ok) {
            throw new Error(`HTTP error! status: ${nextResponse.status}`);
        }

        const nextSetData = await nextResponse.json();
        const nextCards = nextSetData.data.map((card: any) => {
            const { name, prices, scryfall_uri, color_identity, type_line } = card;
            return {
                name,
                image: card.card_faces ? [card.card_faces[0].image_uris.png, card.card_faces[1].image_uris.png] : [card.image_uris.png],
                price: {
                    tix: prices.tix,
                    usd: prices.usd,
                },
                scryfallUri: scryfall_uri,
                colorIdentity: color_identity,
                typeLine: type_line,
                set: set
            };
        });
        cardsPromises.push(...nextCards);
        setData.has_more = nextSetData.has_more;
        setData.next_page = nextSetData.next_page;
    }

    const cards: CardDetails[] = await Promise.all(cardsPromises);

    return cards;
}

async function getSetCode(set: string): Promise<string> {
    const setNoPunctuation = set.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~\s]/g, '').toLowerCase();
    const response = await fetch(`https://api.scryfall.com/sets/${setNoPunctuation}`, {
        next: { revalidate: 600 },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const setCode = await response.json();
    return setCode.code;
}

export async function fetchOwnedCards(set: string, league_id: number): Promise<Card[]> {
    const data = await sql<Card>`
        SELECT c.card_id, c.name, c.origin 
        FROM Cards AS c
        JOIN OwnershipV2 AS o ON c.card_id = o.card_id
        WHERE c.origin = ${set}
        AND o.league_id = ${league_id};
    `;
    return data.rows;
}
