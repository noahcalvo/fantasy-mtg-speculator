import { sql } from "@vercel/postgres";
import { Card, CardDetails, CardPoint } from "./definitions";

const MODERN_LEGAL = ["core", "expansion"]

const OUTLIERS = ["Modern Horizons 3", "Modern Horizons 2", "Assassin's Creed", "Modern Horizons", "The Lord of the Rings: Tales of Middle-earth"]

export async function fetchRecentSets(): Promise<string[]>{
    const response = await fetch('https://api.scryfall.com/sets', {
        next: { revalidate: 600 },
    })
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const sets = await response.json();
    const filteredSets = sets.data.filter((set: any) => {
        const setYear = parseInt(set.released_at.slice(0, 4));
        return setYear > 2008 && (MODERN_LEGAL.includes(set.set_type) || OUTLIERS.includes(set.name));
    });

    const setNames = filteredSets.map((set: any) => set.name);
    return setNames;
}

export async function fetchSet(set: string): Promise<any> {
    const setCode = await getSetCode(set);
    const response = await fetch(`https://api.scryfall.com/cards/search?q=is%3Afirstprint+set%3A${setCode}`, {
        next: { revalidate: 600 },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const setData = await response.json();
    const cards: CardDetails[] = setData.data.map((card: any) => {
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
            typeLine: type_line
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
                typeLine: type_line
            };
        });
        cards.push(...nextCards);
        setData.has_more = nextSetData.has_more;
        setData.next_page = nextSetData.next_page;
    }

    return cards;
}

async function getSetCode(set: string): Promise<string> {
    const setNoPunctuation = set.replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~\s]/g, '').toLowerCase();
    console.log(setNoPunctuation)
        const response = await fetch(`https://api.scryfall.com/sets/${setNoPunctuation}`, {
        next: { revalidate: 600 },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const setCode = await response.json();
    return setCode.code;
}

export async function fetchCard(cardId: number): Promise<CardDetails> {
    console.log(cardId)
    const data = await sql<CardPoint>`
    SELECT name FROM Cards WHERE card_id = ${cardId};
    `;
    const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${data.rows[0].name}`, {
        next: { revalidate: 600 },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const card = await response.json();
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
        typeLine: type_line
    };
}

export async function fetchCardName(cardId: string): Promise<string> {
    const data = await sql<Card>`
    SELECT name FROM Cards WHERE card_id = ${cardId};
    `;
    return data.rows[0].name;
}