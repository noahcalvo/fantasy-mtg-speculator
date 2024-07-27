'use server';
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { fetchCard } from './card';
import { fetchParticipantData } from './player';
export function fetchCardPerformanceByWeek(collectionIDs, week) {
    return __awaiter(this, void 0, void 0, function () {
        var queryString, params, result, convertedData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    queryString = "SELECT C.card_id, C.name, SUM(CP.champs * 5 + CP.copies * 0.5 + LP.copies * 0.25) AS total_points, PF.week\n  FROM Cards C\n  JOIN Performance PF ON C.card_id = PF.card_id\n  LEFT JOIN ChallengePerformance CP ON PF.performance_id = CP.performance_id\n  LEFT JOIN LeaguePerformance LP ON PF.performance_id = LP.performance_id\n  WHERE PF.week = $1 AND C.card_id = ANY($2)\n  GROUP BY C.card_id, C.name, PF.week";
                    params = [week, collectionIDs];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, sql.query(queryString, params)];
                case 2:
                    result = _a.sent();
                    convertedData = result.rows.map(function (row) { return (__assign(__assign({}, row), { total_points: Number(row.total_points) })); });
                    return [2 /*return*/, { cards: convertedData }];
                case 3:
                    error_1 = _a.sent();
                    console.error('Database Error:', error_1);
                    throw new Error('Failed to fetch card point data for week');
                case 4: return [2 /*return*/];
            }
        });
    });
}
export function fetchPlayerCollection(playerId, leagueId) {
    return __awaiter(this, void 0, void 0, function () {
        var data, cardIds, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        SELECT \n          card_id\n        FROM\n          ownershipV3\n        WHERE\n          player_id = ", "\n        AND\n          league_id = ", "\n      "], ["\n        SELECT \n          card_id\n        FROM\n          ownershipV3\n        WHERE\n          player_id = ", "\n        AND\n          league_id = ", "\n      "])), playerId, leagueId)];
                case 1:
                    data = _a.sent();
                    cardIds = data.rows.map(function (row) { return row.value; });
                    return [2 /*return*/, cardIds];
                case 2:
                    error_2 = _a.sent();
                    console.error('Database Error:', error_2);
                    throw new Error("Failed to fetch collection for player:".concat(playerId));
                case 3: return [2 /*return*/];
            }
        });
    });
}
export function fetchPlayerCollectionWithDetails(playerId, league_id) {
    return __awaiter(this, void 0, void 0, function () {
        var data, cardDetailsList, _i, _a, card, _b, _c, error_3;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n        SELECT \n          C.card_id\n        FROM\n          Cards C\n        JOIN \n          OwnershipV3 O ON C.card_id = O.card_id\n        WHERE\n          O.player_id = ", "\n        AND\n          O.league_id = ", "\n        GROUP BY \n            C.card_id,\n            C.name,\n            C.origin\n        ORDER BY\n            C.name DESC;\n      "], ["\n        SELECT \n          C.card_id\n        FROM\n          Cards C\n        JOIN \n          OwnershipV3 O ON C.card_id = O.card_id\n        WHERE\n          O.player_id = ", "\n        AND\n          O.league_id = ", "\n        GROUP BY \n            C.card_id,\n            C.name,\n            C.origin\n        ORDER BY\n            C.name DESC;\n      "])), playerId, league_id)];
                case 1:
                    data = _d.sent();
                    cardDetailsList = [];
                    _i = 0, _a = data.rows;
                    _d.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 5];
                    card = _a[_i];
                    _c = (_b = cardDetailsList).push;
                    return [4 /*yield*/, fetchCard(card.card_id)];
                case 3:
                    _c.apply(_b, [_d.sent()]);
                    _d.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, cardDetailsList];
                case 6:
                    error_3 = _d.sent();
                    console.error('Database Error:', error_3);
                    throw new Error("Failed to fetch collection with card details for player:".concat(playerId));
                case 7: return [2 /*return*/];
            }
        });
    });
}
export function fetchPlayerCollectionWithPerformance(playerId, league_id) {
    return __awaiter(this, void 0, void 0, function () {
        var data, convertedData, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n    SELECT \n    C.card_id, \n    C.name, \n    SUM(\n        COALESCE(CP.champs * 5, 0) +\n        COALESCE(CP.copies * 0.5, 0) +\n        COALESCE(LP.copies * 0.25, 0)\n    ) AS total_points,\n    PF.week\n    FROM\n    Cards C\n    JOIN \n        OwnershipV3 O ON C.card_id = O.card_id\n    JOIN \n        Performance PF ON C.card_id = PF.card_id\n    LEFT JOIN \n        ChallengePerformance CP ON PF.performance_id = CP.performance_id\n    LEFT JOIN \n        LeaguePerformance LP ON PF.performance_id = LP.performance_id\n\n    WHERE\n        O.player_id = ", "\n    AND\n        O.league_id = ", "\n    AND PF.week = (\n        SELECT MAX(week) FROM Performance WHERE card_id = C.card_id\n    )\n    GROUP BY \n        C.card_id,\n        C.name,\n        PF.week\n    ORDER BY\n      total_points DESC;        "], ["\n    SELECT \n    C.card_id, \n    C.name, \n    SUM(\n        COALESCE(CP.champs * 5, 0) +\n        COALESCE(CP.copies * 0.5, 0) +\n        COALESCE(LP.copies * 0.25, 0)\n    ) AS total_points,\n    PF.week\n    FROM\n    Cards C\n    JOIN \n        OwnershipV3 O ON C.card_id = O.card_id\n    JOIN \n        Performance PF ON C.card_id = PF.card_id\n    LEFT JOIN \n        ChallengePerformance CP ON PF.performance_id = CP.performance_id\n    LEFT JOIN \n        LeaguePerformance LP ON PF.performance_id = LP.performance_id\n\n    WHERE\n        O.player_id = ", "\n    AND\n        O.league_id = ", "\n    AND PF.week = (\n        SELECT MAX(week) FROM Performance WHERE card_id = C.card_id\n    )\n    GROUP BY \n        C.card_id,\n        C.name,\n        PF.week\n    ORDER BY\n      total_points DESC;        "])), playerId, league_id)];
                case 1:
                    data = _a.sent();
                    convertedData = data.rows.map(function (row) { return (__assign(__assign({}, row), { total_points: Number(row.total_points) })); });
                    return [2 /*return*/, convertedData];
                case 2:
                    error_4 = _a.sent();
                    console.error('Database Error:', error_4);
                    throw new Error('Failed to fetch card point data for week');
                case 3: return [2 /*return*/];
            }
        });
    });
}
export function updateCollectionWithCompleteDraft(draftId) {
    return __awaiter(this, void 0, void 0, function () {
        var leagueIdQuery, leagueId, picks, _i, _a, pick, error_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["SELECT league_id FROM draftsV4 WHERE draft_id = ", ""], ["SELECT league_id FROM draftsV4 WHERE draft_id = ", ""])), draftId)];
                case 1:
                    leagueIdQuery = _b.sent();
                    leagueId = leagueIdQuery.rows[0].league_id;
                    return [4 /*yield*/, sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["SELECT * FROM picksV5 WHERE draft_id = ", ""], ["SELECT * FROM picksV5 WHERE draft_id = ", ""])), draftId)];
                case 2:
                    picks = _b.sent();
                    _i = 0, _a = picks.rows;
                    _b.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    pick = _a[_i];
                    return [4 /*yield*/, sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["INSERT INTO ownershipV3 (player_id, card_id, league_id) VALUES (", ", ", ", ", ");"], ["INSERT INTO ownershipV3 (player_id, card_id, league_id) VALUES (", ", ", ", ", ");"])), pick.player_id, pick.card_id, leagueId)];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    revalidatePath("/dashboard");
                    return [3 /*break*/, 8];
                case 7:
                    error_5 = _b.sent();
                    console.error('Database Error:', error_5);
                    throw new Error('Failed to update collection with draft');
                case 8: return [2 /*return*/];
            }
        });
    });
}
export function fetchPlayerCollectionsWithDetails(playerIds, league_id) {
    return __awaiter(this, void 0, void 0, function () {
        var playerCollections, _i, playerIds_1, playerId, collectionDetails, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    playerCollections = [];
                    _i = 0, playerIds_1 = playerIds;
                    _a.label = 1;
                case 1:
                    if (!(_i < playerIds_1.length)) return [3 /*break*/, 6];
                    playerId = playerIds_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, fetchPlayerCollectionWithDetails(playerId, league_id)];
                case 3:
                    collectionDetails = _a.sent();
                    playerCollections.push({ player_id: playerId, cards: collectionDetails });
                    return [3 /*break*/, 5];
                case 4:
                    error_6 = _a.sent();
                    console.error("Failed to fetch details for playerId ".concat(playerId, ": ").concat(error_6));
                    throw new Error("Failed to get collection for ".concat(playerId));
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6: return [2 /*return*/, playerCollections];
            }
        });
    });
}
export function playerOwnsCards(playerId, cardIds, league_id) {
    return __awaiter(this, void 0, void 0, function () {
        var collection_1, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetchPlayerCollection(playerId, league_id)];
                case 1:
                    collection_1 = _a.sent();
                    cardIds.forEach(function (cardId) {
                        if (!collection_1.includes(cardId)) {
                            return false;
                        }
                    });
                    return [2 /*return*/, true];
                case 2:
                    error_7 = _a.sent();
                    console.error("Failed to check if player ".concat(playerId, " owns ").concat(cardIds), error_7);
                    throw new Error("Failed to check if player ".concat(playerId, " owns ").concat(cardIds));
                case 3: return [2 /*return*/];
            }
        });
    });
}
export function fetchOwnership(leagueId, cardId) {
    return __awaiter(this, void 0, void 0, function () {
        var data, playerId, player, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, sql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["\n        SELECT \n          player_id\n        FROM\n          ownershipV3\n        WHERE\n          league_id = ", "\n        AND\n          card_id = ", "\n      "], ["\n        SELECT \n          player_id\n        FROM\n          ownershipV3\n        WHERE\n          league_id = ", "\n        AND\n          card_id = ", "\n      "])), leagueId, cardId)];
                case 1:
                    data = _a.sent();
                    if (data.rows.length === 0) {
                        return [2 /*return*/, null];
                    }
                    playerId = data.rows[0].player_id;
                    player = fetchParticipantData(playerId);
                    return [2 /*return*/, player];
                case 2:
                    error_8 = _a.sent();
                    console.error('Database Error:', error_8);
                    throw new Error("Failed to fetch ownership for card:".concat(cardId));
                case 3: return [2 /*return*/];
            }
        });
    });
}
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7;
