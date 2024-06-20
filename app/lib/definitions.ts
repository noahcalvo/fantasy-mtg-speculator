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

export type CardPerformances = {
  cards: CardPoint[];
}

export type TeamPerformance = {
  cards: CardPerformances;
  name: string;
  player_id: number;
  week: number;
}

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
    image: string;
    price: Price;
    scryfallUri: string;
    colorIdentity: string[];
    typeLine: string;
}

export type Collection = {
  player_id: number;
  cards: CardDetails[];
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

export type League = {
  league_id: number;
  name: string;
  participants: number[];
};

export type WeeklyLeaguePerformances = {
  teams: TeamPerformance[];
  league_id: number;
}

export type RosterIdMap = {
  [key: string]: string;
};

export type RosterCardDetailsMap = {
  [key: string]: CardDetails | null;
};

export const getCardIdsFromMap = (map: RosterCardDetailsMap) =>
  {
    const cardIds: number[] = [];

    Object.keys(map).forEach(key => {
      const details = map[key];
      if (details !== null) {
        cardIds.push(details.card_id)
      }
    });
    return cardIds
  }

export const getRosterPositions = () => {
  return [
    'Creature',
    'Instant/Sorcery',
    'Artifact/Enchantment',
    'Land',
    'Flex'
  ];
}

export const getCardTypes = (typeLine: string) => {
  const allPositions = getRosterPositions();
  let cardApplicablePositions = allPositions.filter((position) => {
    if (position.includes('/')) {
      const splitPositions = position.split('/');
      return splitPositions.some(
        (splitPosition) => typeLine.includes(splitPosition),
      );
    } else {
      return typeLine.includes(position);
    }
  });
  return cardApplicablePositions;
}

export const getCardTypesAbbreviation = (typeLine: string) => {
  const cardTypes = getCardTypes(typeLine);
  return cardTypes.map((type) => getAbbreviation(type));
}

export const getCardTypesAbbreviationString = (typeLine: string) => {
  const abbreviations = getCardTypesAbbreviation(typeLine)
  return abbreviations.join("/")
}

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
}

export const calculateTotalPoints = (cardPoints: CardPoint[]): number => {
  return cardPoints.reduce((accumulator, cardPoint) => {
    return accumulator + cardPoint.total_points;
  }, 0);
};