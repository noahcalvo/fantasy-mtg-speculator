import { CardDetails } from "./definitions";

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
    console.log(cards)
    return cards;
}

async function getSetCode(set: string): Promise<string> {
    const setNoSpaces = set.replace(/\s/g, '').toLowerCase();
    const response = await fetch(`https://api.scryfall.com/sets/${setNoSpaces}`, {
        next: { revalidate: 600 },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const setCode = await response.json();
    return setCode.code;
}