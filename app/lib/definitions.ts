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
    name: string;
    image: string;
    price: Price;
    scryfallUri: string;
    colorIdentity: string[];
    typeLine: string;
}

export type Draft = {
  draft_id: string;
  set: string;
  active: boolean;
  participants: number[];
  name: string;
  rounds: number;
};

export type DraftPick = {
  pick_id: string;
  draft_id: string;
  round: number;
  player_id: number;
  card_id: string;
  pick_number: number;
};

export type Roster = {
  roster: RosterIdMap;
  name: string;
};

export type RosterIdMap = {
  [key: string]: number | null;
};

export type RosterCardDetailsMap = {
  [key: string]: CardDetails | null;
};

export const getRosterPositions = () => {
  return [
    'Creature',
    'Instant/Sorcery',
    'Enchantment/Artifact',
    'Land',
    'Flex'
  ];
}