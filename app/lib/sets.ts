import { sql } from '@vercel/postgres';
import { Card, CardDetails, CardPoint } from './definitions';
import { fetchCardId } from './card';

const MODERN_LEGAL = ['core', 'expansion'];

const POSITIVE_OUTLIERS = [
  'Modern Horizons 3',
  'Modern Horizons 2',
  "Assassin's Creed",
  'Modern Horizons',
  'The Lord of the Rings: Tales of Middle-earth',
];
const NEGATIVE_OUTLIERS = ['Modern Horizons 2 Timeshifts'];

export async function fetchRecentSets(): Promise<string[]> {
  const response = await fetch('https://api.scryfall.com/sets');

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const sets = await response.json();
  const filteredSets = sets.data.filter((set: any) => {
    const setYear = parseInt(set.released_at.slice(0, 4));
    return (
      setYear > 2008 &&
      ((MODERN_LEGAL.includes(set.set_type) &&
        !NEGATIVE_OUTLIERS.includes(set.name)) ||
        POSITIVE_OUTLIERS.includes(set.name))
    );
  });

  const setNames = filteredSets.map((set: any) => set.name);
  return setNames;
}

export async function fetchSet(set: string): Promise<CardDetails[]> {
  const setCode = await getSetCode(set);
  const response = await fetch(
    `https://api.scryfall.com/cards/search?q=is%3Afirstprint+set%3A${setCode}`,
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} set: ${set}`);
  }

  const setData = await response.json();
  const cardsPromises = setData.data.map(async (card: any) => {
    const { name, prices, scryfall_uri, color_identity, type_line } = card;
    const cardId = await fetchCardId(name);
    return {
      card_id: cardId,
      name,
      image: card.image_uris
        ? [card.image_uris?.png]
        : [
          card.card_faces[0].image_uris.png,
          card.card_faces[1].image_uris.png,
        ],
      price: {
        tix: prices.tix,
        usd: prices.usd,
      },
      scryfallUri: scryfall_uri,
      colorIdentity: color_identity,
      typeLine: type_line,
      set: set,
    };
  });
  while (setData.has_more) {
    const nextResponse = await fetch(setData.next_page);

    if (!nextResponse.ok) {
      throw new Error(`HTTP error! status: ${nextResponse.status}`);
    }

    const nextSetData = await nextResponse.json();
    const nextCards = nextSetData.data.map(async (card: any) => {
      const { name, prices, scryfall_uri, color_identity, type_line } = card;
      const cardId = await fetchCardId(name);
      return {
        card_id: cardId,
        name,
        image: card.image_uris?.png
          ? [card.image_uris.png]
          : [
            card.card_faces[0].image_uris?.png,
            card.card_faces[1].image_uris?.png,
          ],
        price: {
          tix: prices.tix,
          usd: prices.usd,
        },
        scryfallUri: scryfall_uri,
        colorIdentity: color_identity,
        typeLine: type_line,
        set: set,
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
  const setNoPunctuation = set
    .replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~\s]/g, '')
    .toLowerCase();
  const response = await fetch(
    `https://api.scryfall.com/sets/${setNoPunctuation}`,
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const setCode = await response.json();
  return setCode.code;
}

/**
 * Fetches all unreleased MTG sets from Scryfall,
 * excluding tokens/promos/memorabilia and any silver-border sets
 * that aren't Un-sets, then sorts by release date (soonest first).
 * Uses Next.js ISR cache: revalidates every 24 hours by default.
 * Adds a `legalIn` array for standard, modern, pioneer & commander.
 * @returns An array of MTGSet objects with the next upcoming set first.
 * @throws Error if the Scryfall API request fails.
 */
export async function fetchUnreleasedSets(): Promise<MTGSet[]> {
  // Query params to reduce payload: ordered by release and exclude extras/variations
  const url = new URL('https://api.scryfall.com/sets');
  url.searchParams.set('order', 'released');
  url.searchParams.set('include_extras', 'false');
  url.searchParams.set('include_variations', 'false');

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 * 60 * 24 }, // seconds
  });
  if (!res.ok) {
    throw new Error(`Failed to load sets from Scryfall: ${res.status} ${res.statusText}`);
  }

  const json: ScryfallListResponse = await res.json();
  const now = new Date();

  const upcomingSets = json.data
    // only sets with a known release date in the future
    .filter((set) => set.released_at !== null && new Date(set.released_at) > now)
    // exclude token, promo, memorabilia, and silver-border (funny) sets, except Un-sets
    .filter((set) => {
      if (EXCLUDED_SET_TYPES.has(set.set_type)) return false;
      if (set.set_type === 'funny' && !set.name.startsWith('Un')) return false;
      return true;
    })
    // sort by release date ascending
    .sort((a, b) =>
      new Date(a.released_at as string).getTime() - new Date(b.released_at as string).getTime()
    )
    // map to our clean MTGSet interface
    .map<MTGSet>((set) => ({
      id: set.id,
      code: set.code,
      name: set.name,
      releaseDate: set.released_at as string,
      setType: set.set_type,
      scryfall_uri: set.scryfall_uri || '',
      icon: set.icon_svg_uri ? set.icon_svg_uri : undefined,
      legalIn: ['standard', 'modern', 'pioneer', 'commander'],
    }));

  return upcomingSets;
}

/**
 * A minimal representation of a Magic: The Gathering set.
 */
export interface MTGSet {
  /** The Scryfall UUID for this set */
  id: string;
  /** The set code, e.g. "KHM" */
  code: string;
  /** The name of the set, e.g. "Kaldheim" */
  name: string;
  /** Release date in YYYY-MM-DD format */
  releaseDate: string;
  /** Type of the set, e.g. "expansion", "core" */
  setType: string;
  /** Scryfall URI */
  scryfall_uri: string; // optional, not all sets have a URI
  /** URL to the set icon SVG */
  icon?: string; // optional, not all sets have an icon
}

/**
 * Raw set object returned by Scryfall.
 */
interface ScryfallSetRaw {
  id: string;
  code: string;
  name: string;
  released_at: string | null;
  set_type: string;
  scryfall_uri: string | null;
  icon_svg_uri: string | null;
}

/**
 * Scryfall /sets endpoint response.
 * This endpoint returns all MTG sets in one page—no pagination.
 */
interface ScryfallListResponse {
  data: ScryfallSetRaw[];
}

const EXCLUDED_SET_TYPES = new Set<string>([
  'token',
  'promo',
  'memorabilia',
]);
