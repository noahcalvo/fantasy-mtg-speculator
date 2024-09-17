'use server';
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { sql } from "@vercel/postgres";
export function fetchCard(cardId) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var data, error_1, encodedName, response, card, cardData, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!cardId) {
                        return [2 /*return*/, {
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
                            }];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        SELECT name FROM Cards WHERE card_id = ", ";\n        "], ["\n        SELECT name FROM Cards WHERE card_id = ", ";\n        "])), cardId)];
                case 2:
                    data = _b.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    console.error('Database Error:', error_1);
                    throw new Error("Failed to fetch card for card_id:".concat(cardId));
                case 4:
                    _b.trys.push([4, 7, , 8]);
                    encodedName = encodeURIComponent(data.rows[0].name);
                    return [4 /*yield*/, fetch("https://api.scryfall.com/cards/search?q=is%3Afirstprint+".concat(encodedName))];
                case 5:
                    response = _b.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 6:
                    card = _b.sent();
                    if (card.object === "error") {
                        throw new Error("Card not found: ".concat(data.rows[0].name));
                    }
                    cardData = card.data[0];
                    return [2 /*return*/, {
                            name: cardData.name,
                            image: ((_a = cardData.image_uris) === null || _a === void 0 ? void 0 : _a.png) ? [cardData.image_uris.png] : [cardData.card_faces[0].image_uris.png, cardData.card_faces[1].image_uris.png],
                            price: {
                                tix: cardData.prices.tix,
                                usd: cardData.prices.usd,
                            },
                            scryfallUri: cardData.scryfall_uri,
                            colorIdentity: cardData.color_identity,
                            typeLine: cardData.type_line,
                            card_id: cardId,
                            set: cardData.set_name
                        }];
                case 7:
                    error_2 = _b.sent();
                    console.error('scryfall error:', error_2);
                    throw new Error("Failed to fetch card for cardName:".concat(data.rows[0].name));
                case 8: return [2 /*return*/];
            }
        });
    });
}
export function fetchCardName(cardId) {
    return __awaiter(this, void 0, void 0, function () {
        var data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n  SELECT name FROM Cards WHERE card_id = ", ";\n  "], ["\n  SELECT name FROM Cards WHERE card_id = ", ";\n  "])), cardId)];
                case 1:
                    data = _a.sent();
                    return [2 /*return*/, data.rows[0].name];
            }
        });
    });
}
export function fetchCardId(cardName) {
    return __awaiter(this, void 0, void 0, function () {
        var data, frontSideName, existingCard, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n        SELECT * FROM Cards WHERE name = ", ";\n        "], ["\n        SELECT * FROM Cards WHERE name = ", ";\n        "])), cardName)];
                case 1:
                    data = _a.sent();
                    if (data.rows.length > 0) {
                        return [2 /*return*/, data.rows[0].card_id];
                    }
                    if (!cardName.includes('//')) return [3 /*break*/, 3];
                    frontSideName = cardName.split(' //')[0].trim();
                    return [4 /*yield*/, sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["SELECT * FROM Cards WHERE LOWER(name) = LOWER(", ") LIMIT 1"], ["SELECT * FROM Cards WHERE LOWER(name) = LOWER(", ") LIMIT 1"])), frontSideName)];
                case 2:
                    existingCard = _a.sent();
                    if (existingCard.rows.length > 0) {
                        return [2 /*return*/, existingCard.rows[0].card_id];
                    }
                    _a.label = 3;
                case 3: return [2 /*return*/, -1];
                case 4:
                    error_3 = _a.sent();
                    console.error('Database Error:', error_3);
                    throw new Error("Failed to fetch card id for card:".concat(cardName));
                case 5: return [2 /*return*/];
            }
        });
    });
}
export function fetchScryfallDataByCardName(cardName) {
    return __awaiter(this, void 0, void 0, function () {
        var encodedName, response, card, cardData, name_1, prices, scryfall_uri, color_identity, type_line, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    encodedName = encodeURIComponent(cardName);
                    return [4 /*yield*/, fetch("https://api.scryfall.com/cards/search?q=is%3Afirstprint+".concat(encodedName))];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    card = _a.sent();
                    if (card.object === "error") {
                        throw new Error("Card not found: ".concat(cardName));
                    }
                    cardData = card.data[0];
                    name_1 = cardData.name, prices = cardData.prices, scryfall_uri = cardData.scryfall_uri, color_identity = cardData.color_identity, type_line = cardData.type_line;
                    return [2 /*return*/, {
                            name: name_1,
                            image: cardData.card_faces ? [cardData.card_faces[0].image_uris.png, cardData.card_faces[1].image_uris.png] : [cardData.image_uris.png],
                            price: {
                                tix: prices.tix,
                                usd: prices.usd,
                            },
                            scryfallUri: scryfall_uri,
                            colorIdentity: color_identity,
                            typeLine: type_line,
                            set: card.set_name,
                            card_id: -1
                        }];
                case 3:
                    error_4 = _a.sent();
                    console.error('scryfall error:', error_4);
                    throw new Error("Failed to fetch card for cardName:".concat(cardName));
                case 4: return [2 /*return*/];
            }
        });
    });
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4;
