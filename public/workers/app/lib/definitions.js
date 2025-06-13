export var getCardIdsFromMap = function (map) {
  var cardIds = [];
  Object.keys(map).forEach(function (key) {
    var details = map[key];
    if (details !== null) {
      cardIds.push(details.card_id);
    }
  });
  return cardIds;
};
export var getRosterPositions = function () {
  return [
    'Creature',
    'Instant/Sorcery',
    'Artifact/Enchantment',
    'Land',
    'Flex',
  ];
};
export var getCardTypes = function (typeLine) {
  var allPositions = getRosterPositions();
  var cardApplicablePositions = allPositions.filter(function (position) {
    if (position.includes('/')) {
      var splitPositions = position.split('/');
      return splitPositions.some(function (splitPosition) {
        return typeLine.includes(splitPosition);
      });
    } else {
      return typeLine.includes(position);
    }
  });
  return cardApplicablePositions.join('/');
};
export var getCardTypesList = function (typeLine) {
  var allPositions = getRosterPositions();
  var cardApplicablePositions = allPositions.filter(function (position) {
    if (position.includes('/')) {
      var splitPositions = position.split('/');
      return splitPositions.some(function (splitPosition) {
        return typeLine.includes(splitPosition);
      });
    } else {
      return typeLine.includes(position);
    }
  });
  return cardApplicablePositions;
};
export var getCardTypesAbbreviation = function (typeLine) {
  var cardTypes = getCardTypesList(typeLine);
  return cardTypes.map(function (type) {
    return getAbbreviation(type);
  });
};
export var getCardTypesAbbreviationString = function (typeLine) {
  var abbreviations = getCardTypesAbbreviation(typeLine);
  return abbreviations.join('/');
};
export var getAbbreviation = function (position) {
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
export var calculateTotalPoints = function (cardPoints) {
  return cardPoints.reduce(function (accumulator, cardPoint) {
    return accumulator + cardPoint.total_points;
  }, 0);
};
export function transformTradeOffer(trade) {
  return {
    recipient: trade.recipient.player_id,
    offerer: trade.offerer.player_id,
    offered: trade.offeredCards.map(function (card) {
      return card.card_id;
    }),
    requested: trade.requestedCards.map(function (card) {
      return card.card_id;
    }),
    trade_id: trade.trade_id,
    state: trade.state,
    league_id: trade.league_id,
  };
}
