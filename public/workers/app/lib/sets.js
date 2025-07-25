var __makeTemplateObject =
  (this && this.__makeTemplateObject) ||
  function (cooked, raw) {
    if (Object.defineProperty) {
      Object.defineProperty(cooked, 'raw', { value: raw });
    } else {
      cooked.raw = raw;
    }
    return cooked;
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                    ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
import { sql } from '@vercel/postgres';
import { fetchCardId } from './card';
var MODERN_LEGAL = ['core', 'expansion'];
var POSITIVE_OUTLIERS = [
  'Modern Horizons 3',
  'Modern Horizons 2',
  "Assassin's Creed",
  'Modern Horizons',
  'The Lord of the Rings: Tales of Middle-earth',
];
var NEGATIVE_OUTLIERS = ['Modern Horizons 2 Timeshifts'];
export function fetchRecentSets() {
  return __awaiter(this, void 0, void 0, function () {
    var response, sets, filteredSets, setNames;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, fetch('https://api.scryfall.com/sets')];
        case 1:
          response = _a.sent();
          if (!response.ok) {
            throw new Error('HTTP error! status: '.concat(response.status));
          }
          return [4 /*yield*/, response.json()];
        case 2:
          sets = _a.sent();
          filteredSets = sets.data.filter(function (set) {
            var setYear = parseInt(set.released_at.slice(0, 4));
            return (
              setYear > 2008 &&
              ((MODERN_LEGAL.includes(set.set_type) &&
                !NEGATIVE_OUTLIERS.includes(set.name)) ||
                POSITIVE_OUTLIERS.includes(set.name))
            );
          });
          setNames = filteredSets.map(function (set) {
            return set.name;
          });
          return [2 /*return*/, setNames];
      }
    });
  });
}
export function fetchSet(set) {
  return __awaiter(this, void 0, void 0, function () {
    var setCode,
      response,
      setData,
      cardsPromises,
      nextResponse,
      nextSetData,
      nextCards,
      cards;
    var _this = this;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, getSetCode(set)];
        case 1:
          setCode = _a.sent();
          return [
            4 /*yield*/,
            fetch(
              'https://api.scryfall.com/cards/search?q=is%3Afirstprint+set%3A'.concat(
                setCode,
              ),
            ),
          ];
        case 2:
          response = _a.sent();
          if (!response.ok) {
            throw new Error(
              'HTTP error! status: '
                .concat(response.status, ' set: ')
                .concat(set),
            );
          }
          return [4 /*yield*/, response.json()];
        case 3:
          setData = _a.sent();
          cardsPromises = setData.data.map(function (card) {
            return __awaiter(_this, void 0, void 0, function () {
              var name, prices, scryfall_uri, color_identity, type_line, cardId;
              var _a;
              return __generator(this, function (_b) {
                switch (_b.label) {
                  case 0:
                    (name = card.name),
                      (prices = card.prices),
                      (scryfall_uri = card.scryfall_uri),
                      (color_identity = card.color_identity),
                      (type_line = card.type_line);
                    return [4 /*yield*/, fetchCardId(name)];
                  case 1:
                    cardId = _b.sent();
                    return [
                      2 /*return*/,
                      {
                        card_id: cardId,
                        name: name,
                        image: card.image_uris
                          ? [
                              (_a = card.image_uris) === null || _a === void 0
                                ? void 0
                                : _a.png,
                            ]
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
                      },
                    ];
                }
              });
            });
          });
          _a.label = 4;
        case 4:
          if (!setData.has_more) return [3 /*break*/, 7];
          return [4 /*yield*/, fetch(setData.next_page)];
        case 5:
          nextResponse = _a.sent();
          if (!nextResponse.ok) {
            throw new Error('HTTP error! status: '.concat(nextResponse.status));
          }
          return [4 /*yield*/, nextResponse.json()];
        case 6:
          nextSetData = _a.sent();
          nextCards = nextSetData.data.map(function (card) {
            return __awaiter(_this, void 0, void 0, function () {
              var name, prices, scryfall_uri, color_identity, type_line, cardId;
              var _a, _b, _c;
              return __generator(this, function (_d) {
                switch (_d.label) {
                  case 0:
                    (name = card.name),
                      (prices = card.prices),
                      (scryfall_uri = card.scryfall_uri),
                      (color_identity = card.color_identity),
                      (type_line = card.type_line);
                    return [4 /*yield*/, fetchCardId(name)];
                  case 1:
                    cardId = _d.sent();
                    return [
                      2 /*return*/,
                      {
                        card_id: cardId,
                        name: name,
                        image: (
                          (_a = card.image_uris) === null || _a === void 0
                            ? void 0
                            : _a.png
                        )
                          ? [card.image_uris.png]
                          : [
                              (_b = card.card_faces[0].image_uris) === null ||
                              _b === void 0
                                ? void 0
                                : _b.png,
                              (_c = card.card_faces[1].image_uris) === null ||
                              _c === void 0
                                ? void 0
                                : _c.png,
                            ],
                        price: {
                          tix: prices.tix,
                          usd: prices.usd,
                        },
                        scryfallUri: scryfall_uri,
                        colorIdentity: color_identity,
                        typeLine: type_line,
                        set: set,
                      },
                    ];
                }
              });
            });
          });
          cardsPromises.push.apply(cardsPromises, nextCards);
          setData.has_more = nextSetData.has_more;
          setData.next_page = nextSetData.next_page;
          return [3 /*break*/, 4];
        case 7:
          return [4 /*yield*/, Promise.all(cardsPromises)];
        case 8:
          cards = _a.sent();
          return [2 /*return*/, cards];
      }
    });
  });
}
function getSetCode(set) {
  return __awaiter(this, void 0, void 0, function () {
    var setNoPunctuation, response, setCode;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          setNoPunctuation = set
            .replace(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~\s]/g, '')
            .toLowerCase();
          return [
            4 /*yield*/,
            fetch('https://api.scryfall.com/sets/'.concat(setNoPunctuation)),
          ];
        case 1:
          response = _a.sent();
          if (!response.ok) {
            throw new Error('HTTP error! status: '.concat(response.status));
          }
          return [4 /*yield*/, response.json()];
        case 2:
          setCode = _a.sent();
          return [2 /*return*/, setCode.code];
      }
    });
  });
}
export function fetchOwnedCards(set, league_id) {
  return __awaiter(this, void 0, void 0, function () {
    var data;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [
            4 /*yield*/,
            sql(
              templateObject_1 ||
                (templateObject_1 = __makeTemplateObject(
                  [
                    '\n        SELECT c.card_id, c.name, c.origin \n        FROM Cards AS c\n        JOIN OwnershipV3 AS o ON c.card_id = o.card_id\n        WHERE c.origin = ',
                    '\n        AND o.league_id = ',
                    ';\n    ',
                  ],
                  [
                    '\n        SELECT c.card_id, c.name, c.origin \n        FROM Cards AS c\n        JOIN OwnershipV3 AS o ON c.card_id = o.card_id\n        WHERE c.origin = ',
                    '\n        AND o.league_id = ',
                    ';\n    ',
                  ],
                )),
              set,
              league_id,
            ),
          ];
        case 1:
          data = _a.sent();
          return [2 /*return*/, data.rows];
      }
    });
  });
}
var templateObject_1;
