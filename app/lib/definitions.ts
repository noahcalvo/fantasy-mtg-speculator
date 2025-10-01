// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Player = {
  player_id: number;
  name: string;
  email: string;
};

export type CardPoint = {
  name: string;
  total_points: number;
  week: number;
  card_id: number;
};

export type RawPerformanceData = {
  card_id: number;
  name: string;
  week: number;
  modern_challenge_champs: number | null;
  modern_challenge_copies: number | null;
  modern_league_copies: number | null;
  standard_challenge_champs: number | null;
  standard_challenge_copies: number | null;
  standard_league_copies: number | null;
};

export type CardPerformances = {
  cards: CardPoint[];
};

export type TeamPerformance = {
  points: number;
  roster: RosterIdMap;
  player_id: number;
  week: number;
};

export type Card = {
  card_id: number;
  name: string;
  origin: string;
};

export type Price = {
  tix: number;
  usd: number;
};

export type CardDetails = {
  card_id: number;
  name: string;
  image: string[];
  price: Price;
  scryfallUri: string;
  colorIdentity: string[];
  typeLine: string;
  set: string;
};

export type CardDetailsWithPoints = CardDetails & {
  points: number;
  week: number;
};

export type Collection = {
  player_id: number;
  cards: CardDetails[];
};

export type Draft = {
  draft_id: number;
  set: string;
  active: boolean;
  participants: number[];
  name: string;
  rounds: number;
  league_id: number;
  paused_at: string;
  current_pick_deadline_at: string;
  pick_time_seconds: number;
  auto_draft: boolean;
};

export type DraftPick = {
  pick_id: number;
  draft_id: number;
  round: number;
  player_id: number;
  card_id: string;
  pick_number: number;
};

export type Roster = {
  roster: RosterIdMap;
  name: string;
};

export type League = {
  league_id: number;
  name: string;
  participants: number[];
  commissioners: number[];
  open: boolean;
};

export type WeeklyLeaguePerformances = {
  teams: TeamPerformance[];
  league_id: number;
};

export type RosterIdMap = {
  [key: string]: string;
};

export type RosterCardDetailsMap = {
  [key: string]: CardDetails | null;
};

export const getCardIdsFromMap = (map: RosterCardDetailsMap) => {
  const cardIds: number[] = [];

  Object.keys(map).forEach((key) => {
    const details = map[key];
    if (details !== null) {
      cardIds.push(details.card_id);
    }
  });
  return cardIds;
};

export const getRosterPositions = () => {
  return [
    'Creature',
    'Instant/Sorcery',
    'Artifact/Enchantment',
    'Land',
    'Flex',
  ];
};

export const getCardTypes = (typeLine: string): string => {
  const allPositions = getRosterPositions();
  let cardApplicablePositions = allPositions.filter((position) => {
    if (position.includes('/')) {
      const splitPositions = position.split('/');
      return splitPositions.some((splitPosition) =>
        typeLine.includes(splitPosition),
      );
    } else {
      return typeLine.includes(position);
    }
  });
  return cardApplicablePositions.join('/');
};

export const getCardTypesList = (typeLine: string): string[] => {
  const allPositions = getRosterPositions();
  let cardApplicablePositions = allPositions.filter((position) => {
    if (position.includes('/')) {
      const splitPositions = position.split('/');
      return splitPositions.some((splitPosition) =>
        typeLine.includes(splitPosition),
      );
    } else {
      return typeLine.includes(position);
    }
  });
  return cardApplicablePositions;
};

export const getCardTypesAbbreviation = (typeLine: string) => {
  const cardTypes = getCardTypesList(typeLine);
  return cardTypes.map((type) => getAbbreviation(type));
};

export const getCardTypesAbbreviationString = (typeLine: string) => {
  const abbreviations = getCardTypesAbbreviation(typeLine);
  return abbreviations.join('/');
};

export const getAbbreviation = (position: string) => {
  switch (position) {
    case 'Creature':
      return 'Cre';
    case 'Instant/Sorcery':
      return 'Ins/Sor';
    case 'Artifact/Enchantment':
      return 'Art/Enc';
    case 'Land':
      return 'Land';
    case 'Flex':
      return 'Flex';
    default:
      return '';
  }
};

export const calculateTotalPoints = (cardPoints: CardPoint[]): number => {
  return cardPoints.reduce((accumulator, cardPoint) => {
    return accumulator + cardPoint.total_points;
  }, 0);
};

export type TradeOffer = {
  trade_id: number;
  offerer: number;
  recipient: number;
  offered: number[];
  requested: number[];
  state: string;
  league_id: number;
};

export type TradeOfferWithCardDetails = {
  trade_id: number;
  offerer: Player;
  recipient: Player;
  offeredCards: CardDetails[];
  requestedCards: CardDetails[];
  state: string;
  league_id: number;
};

export function transformTradeOffer(
  trade: TradeOfferWithCardDetails,
): TradeOffer {
  return {
    recipient: trade.recipient.player_id,
    offerer: trade.offerer.player_id,
    offered: trade.offeredCards.map((card) => card.card_id),
    requested: trade.requestedCards.map((card) => card.card_id),
    trade_id: trade.trade_id,
    state: trade.state,
    league_id: trade.league_id,
  };
}

export type BulletinItem = {
  player_id: number;
  message: string;
  created: Date;
  author: string;
};

export type ScryfallSearchResult = {
  object: string;
  id: string;
  oracle_id: string;
  multiverse_ids: number[];
  mtgo_id: number;
  tcgplayer_id: number;
  cardmarket_id: number;
  name: string;
  lang: string;
  released_at: string;
  uri: string;
  scryfall_uri: string;
  layout: string;
  highres_image: boolean;
  image_status: string;
  image_uris: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
  mana_cost: string;
  cmc: number;
  type_line: string;
  oracle_text: string;
  colors: string[];
  color_identity: string[];
  keywords: string[];
  legalities: {
    standard: string;
    future: string;
    historic: string;
    timeless: string;
    gladiator: string;
    pioneer: string;
    explorer: string;
    modern: string;
    legacy: string;
    pauper: string;
    vintage: string;
    penny: string;
    commander: string;
    oathbreaker: string;
    standardbrawl: string;
    brawl: string;
    alchemy: string;
    paupercommander: string;
    duel: string;
    oldschool: string;
    premodern: string;
    predh: string;
  };
  games: string[];
  reserved: boolean;
  foil: boolean;
  nonfoil: boolean;
  finishes: string[];
  oversized: boolean;
  promo: boolean;
  reprint: boolean;
  variation: boolean;
  set_id: string;
  set: string;
  set_name: string;
  set_type: string;
  set_uri: string;
  set_search_uri: string;
  scryfall_set_uri: string;
  rulings_uri: string;
  prints_search_uri: string;
  collector_number: string;
  digital: boolean;
  rarity: string;
  card_back_id: string;
  artist: string;
  artist_ids: string[];
  illustration_id: string;
  border_color: string;
  frame: string;
  security_stamp: string;
  full_art: boolean;
  textless: boolean;
  booster: boolean;
  story_spotlight: boolean;
  edhrec_rank: number;
  penny_rank: number;
  prices: {
    usd: string | null;
    usd_foil: string | null;
    usd_etched: string | null;
    eur: string | null;
    eur_foil: string | null;
    tix: string | null;
  };
  related_uris: {
    gatherer: string;
    tcgplayer_infinite_articles: string;
    tcgplayer_infinite_decks: string;
    edhrec: string;
  };
  purchase_uris: {
    tcgplayer: string;
    cardmarket: string;
    cardhoarder: string;
  };
};

export type ScryfallSearchResponse = {
  object: string;
  total_cards: number;
  has_more: boolean;
  next_page: string;
  data: ScryfallSearchResult[];
};

export type ScoringOption = {
  scoring_id?: number;
  format: string;
  tournament_type: string;
  is_per_copy: boolean;
  points: number;
  league_id: number;
};

export type format =
  | 'modern'
  | 'standard'
  | 'pioneer'
  | 'explorer'
  | 'legacy'
  | 'vintage'
  | 'commander'
  | 'alchemist'
  | 'historic'
  | 'pauper'
  | 'duel'
  | 'oldschool'
  | 'premodern';

export const supportedFormats: format[] = ['modern', 'standard'];

export function num(v: unknown, fallback = 0): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : fallback;
}