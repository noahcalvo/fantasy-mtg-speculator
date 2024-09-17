'use server';
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
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { updateCollectionWithCompleteDraft } from './collection';
import { isCommissioner } from './leagues';
import { fetchOwnedCards, fetchSet } from './sets';
import { fetchCardName } from './card';
import pg from 'pg';
var Pool = pg.Pool;
var pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});
var FormSchema = z.object({
    id: z.string(),
    set: z.string().min(1, { message: 'Set cannot be empty.' }),
    name: z.string().min(1, { message: 'Name cannot be empty.' }),
    rounds: z.coerce
        .number()
        .gt(0, { message: 'Rounds must be a number greater than 0.' }),
});
var CreateDraft = FormSchema.omit({ id: true });
export function createDraft(prevState, formData, league_id, playerId, auto_draft) {
    if (auto_draft === void 0) { auto_draft = false; }
    return __awaiter(this, void 0, void 0, function () {
        var commissioner, validatedFields, _a, set, rounds, name, resp, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, isCommissioner(playerId, league_id)];
                case 1:
                    commissioner = _b.sent();
                    if (!commissioner) {
                        return [2 /*return*/, {
                                errors: {
                                    set: ['You are not the commissioner of this league.'],
                                },
                                message: 'Failed to Create Draft.',
                            }];
                    }
                    validatedFields = CreateDraft.safeParse({
                        set: formData.get('set'),
                        rounds: formData.get('rounds'),
                        name: formData.get('name'),
                    });
                    // If form validation fails, return errors early. Otherwise, continue.
                    if (!validatedFields.success) {
                        return [2 /*return*/, {
                                errors: validatedFields.error.flatten().fieldErrors,
                                message: 'Missing Fields. Failed to Create Invoice.',
                            }];
                    }
                    _a = validatedFields.data, set = _a.set, rounds = _a.rounds, name = _a.name;
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, pool.query("INSERT INTO draftsV4 (set, active, rounds, name, participants, league_id, auto_draft) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING draft_id;", [set, true, rounds, name, [], league_id, auto_draft])];
                case 3:
                    resp = _b.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    console.error('Database Error:', error_1);
                    throw new Error('Failed to create draft for {set}');
                case 5:
                    revalidatePath('/draft');
                    redirect("/draft/".concat(resp.rows[0].draft_id, "/view"));
                    return [2 /*return*/];
            }
        });
    });
}
;
var fetchAllDrafts = function (leagueId) { return __awaiter(void 0, void 0, void 0, function () {
    var res, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, pool.query("SELECT * FROM draftsV4 WHERE league_id = $1;", [leagueId])];
            case 1:
                res = _a.sent();
                return [2 /*return*/, res.rows];
            case 2:
                error_2 = _a.sent();
                console.error('Database Error:', error_2);
                throw new Error('Failed to fetch drafts');
            case 3: return [2 /*return*/];
        }
    });
}); };
var fetchDraftsBySet = function (leagueId, set) { return __awaiter(void 0, void 0, void 0, function () {
    var res, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, pool.query("SELECT * FROM draftsV4 WHERE set = $1 AND league_id = $2;", [set, leagueId])];
            case 1:
                res = _a.sent();
                return [2 /*return*/, res.rows];
            case 2:
                error_3 = _a.sent();
                console.error('Database Error:', error_3);
                throw new Error('Failed to fetch drafts');
            case 3: return [2 /*return*/];
        }
    });
}); };
export var fetchDrafts = function (leagueId, set) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (set) {
            return [2 /*return*/, fetchDraftsBySet(leagueId, set)];
        }
        return [2 /*return*/, fetchAllDrafts(leagueId)];
    });
}); };
export var fetchDraft = function (draftId) { return __awaiter(void 0, void 0, void 0, function () {
    var res, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, pool.query("SELECT draft_id, CAST(participants AS INT[]) as participants, active, set, name, rounds, league_id FROM draftsV4 WHERE draft_id = $1;", [draftId])];
            case 1:
                res = _a.sent();
                return [2 /*return*/, res.rows[0]];
            case 2:
                error_4 = _a.sent();
                console.error('Database Error:', error_4);
                throw new Error('Failed to fetch draft');
            case 3: return [2 /*return*/];
        }
    });
}); };
export var joinDraft = function (draftId, playerId) { return __awaiter(void 0, void 0, void 0, function () {
    var draftResult, participants, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, 8, 9]);
                return [4 /*yield*/, pool.query("SELECT participants, active FROM draftsV4 WHERE draft_id = $1;", [draftId])];
            case 1:
                draftResult = _a.sent();
                if (draftResult.rowCount === 0) {
                    throw new Error('Draft not found');
                }
                if (!draftResult.rows[0].active) {
                    throw new Error('Draft not active');
                }
                participants = draftResult.rows[0].participants;
                if (!participants.includes(playerId)) return [3 /*break*/, 2];
                console.log('Player is already a participant');
                return [3 /*break*/, 6];
            case 2: return [4 /*yield*/, pool.query("UPDATE draftsV4 SET participants = array_append(participants, $1) WHERE draft_id = $2;", [playerId, draftId])];
            case 3:
                _a.sent();
                return [4 /*yield*/, addPicks(draftId, playerId)];
            case 4:
                _a.sent();
                return [4 /*yield*/, snakePicks(draftId)];
            case 5:
                _a.sent();
                revalidatePath("/draft/".concat(draftId, "/view"));
                revalidatePath("/draft");
                _a.label = 6;
            case 6: return [3 /*break*/, 9];
            case 7:
                error_5 = _a.sent();
                console.error('Database Error:', error_5);
                throw new Error('Failed to join draft');
            case 8:
                redirect("/draft/".concat(draftId, "/live"));
                return [7 /*endfinally*/];
            case 9: return [2 /*return*/];
        }
    });
}); };
export var redirectIfJoined = function (participants, playerId, draftId) { return __awaiter(void 0, void 0, void 0, function () {
    var shouldRedirect;
    return __generator(this, function (_a) {
        shouldRedirect = false;
        try {
            if (participants.includes(playerId)) {
                shouldRedirect = true;
            }
        }
        catch (error) {
            console.error('Database Error:', error);
            throw new Error('Failed to check if already joined draft');
        }
        finally {
            if (shouldRedirect) {
                redirect("/draft/".concat(draftId, "/live"));
            }
        }
        return [2 /*return*/];
    });
}); };
var addPicks = function (draftId, playerId) { return __awaiter(void 0, void 0, void 0, function () {
    var draft, rounds, pick, i, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                return [4 /*yield*/, fetchDraft(draftId)];
            case 1:
                draft = _a.sent();
                rounds = draft.rounds;
                pick = draft.participants.length - 1;
                i = 0;
                _a.label = 2;
            case 2:
                if (!(i < rounds)) return [3 /*break*/, 5];
                return [4 /*yield*/, pool.query("INSERT INTO picksV5 (draft_id, player_id, round, pick_number) VALUES ($1, $2, $3, $4);", [draftId, playerId, i, pick])];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                i++;
                return [3 /*break*/, 2];
            case 5: return [3 /*break*/, 7];
            case 6:
                error_6 = _a.sent();
                console.error('Database Error:', error_6);
                throw new Error('Failed to add picks');
            case 7: return [2 /*return*/];
        }
    });
}); };
var snakePicks = function (draftId) { return __awaiter(void 0, void 0, void 0, function () {
    var draft, participants, rounds, picksPerRound, i, j, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 9, , 10]);
                return [4 /*yield*/, fetchDraft(draftId)];
            case 1:
                draft = _a.sent();
                participants = draft.participants;
                rounds = draft.rounds;
                picksPerRound = participants.length;
                i = 1;
                _a.label = 2;
            case 2:
                if (!(i < rounds)) return [3 /*break*/, 8];
                // move the last entry out of bounds
                return [4 /*yield*/, pool.query("UPDATE picksV5 SET pick_number = $1 WHERE draft_id = $2 AND round = $2 AND player_id = $4;", [picksPerRound, draftId, i, participants[picksPerRound - 1]])];
            case 3:
                // move the last entry out of bounds
                _a.sent();
                j = 0;
                _a.label = 4;
            case 4:
                if (!(j < picksPerRound)) return [3 /*break*/, 7];
                // move pick j over 1
                return [4 /*yield*/, pool.query("UPDATE picksV5 SET pick_number = $1 WHERE draft_id = $2 AND round = $3 AND player_id = $4;", [picksPerRound - j - 1, draftId, i, participants[j]])];
            case 5:
                // move pick j over 1
                _a.sent();
                _a.label = 6;
            case 6:
                j++;
                return [3 /*break*/, 4];
            case 7:
                i = i + 2;
                return [3 /*break*/, 2];
            case 8: return [3 /*break*/, 10];
            case 9:
                error_7 = _a.sent();
                console.error('Database Error:', error_7);
                throw new Error('Failed to snake picks');
            case 10: return [2 /*return*/];
        }
    });
}); };
export var fetchPicks = function (draftId) { return __awaiter(void 0, void 0, void 0, function () {
    var res, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, pool.query("SELECT * FROM picksV5 WHERE draft_id = $1;", [draftId])];
            case 1:
                res = _a.sent();
                revalidatePath("/draft/".concat(draftId, "/live"));
                return [2 /*return*/, res.rows];
            case 2:
                error_8 = _a.sent();
                console.error('Database Error:', error_8);
                throw new Error('Failed to fetch picks');
            case 3: return [2 /*return*/];
        }
    });
}); };
export var fetchAvailableCards = function (cards, draftId) { return __awaiter(void 0, void 0, void 0, function () {
    var res_1, undraftedCards, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, pool.query("SELECT * FROM picksV5 WHERE draft_id = $1);", [draftId])];
            case 1:
                res_1 = _a.sent();
                undraftedCards = cards.filter(function (card) { return !res_1.rows.some(function (pick) { return pick.card_id === card.name; }); });
                return [2 /*return*/, undraftedCards];
            case 2:
                error_9 = _a.sent();
                console.error('Database Error:', error_9);
                throw new Error('Failed to fetch available cards');
            case 3: return [2 /*return*/];
        }
    });
}); };
export function makePick(draftId, playerId, cardName, set) {
    return __awaiter(this, void 0, void 0, function () {
        var cardId, activePick, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.error('Making pick:', draftId, playerId, cardName, set);
                    console.error('using pool:', pool);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 10, , 11]);
                    return [4 /*yield*/, getOrCreateCard(cardName, set)];
                case 2:
                    cardId = _a.sent();
                    if (!cardId) {
                        throw new Error('Failed to get or create card');
                    }
                    return [4 /*yield*/, getActivePick(draftId)];
                case 3:
                    activePick = _a.sent();
                    if ((activePick === null || activePick === void 0 ? void 0 : activePick.player_id) !== playerId) {
                        console.log('Not your turn', activePick, playerId);
                        throw new Error('Not your turn');
                    }
                    return [4 /*yield*/, pool.query("UPDATE picksV5 SET card_id = $1 WHERE draft_id = $2 AND player_id = $3 AND round = $4 AND pick_number = $5;", [cardId, draftId, playerId, activePick.round, activePick.pick_number])];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, pool.query("UPDATE draftsV4 SET last_pick_timestamp = NOW() WHERE draft_id = $1;", [draftId])];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, isDraftComplete(draftId)];
                case 6:
                    if (!_a.sent()) return [3 /*break*/, 9];
                    return [4 /*yield*/, pool.query("UPDATE draftsV4 SET active = false WHERE draft_id = ".concat(draftId, ";"))];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, updateCollectionWithCompleteDraft(draftId)];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9:
                    revalidatePath("/draft/".concat(draftId, "/live"));
                    return [3 /*break*/, 11];
                case 10:
                    error_10 = _a.sent();
                    console.error('Database Error:', error_10);
                    throw new Error('Failed to make pick');
                case 11: return [2 /*return*/];
            }
        });
    });
}
export var getOrCreateCard = function (cardName, set) { return __awaiter(void 0, void 0, void 0, function () {
    var frontSideName, existingCard, newCard_1, existingDoubleFaceCard, newCard, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.error('Getting or creating card:', cardName, set);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 10, , 11]);
                frontSideName = cardName.split(' //')[0].trim();
                console.error("one more shot", frontSideName);
                return [4 /*yield*/, pool.query("SELECT * FROM cards WHERE LOWER(name) = LOWER($1) LIMIT 1", [frontSideName])];
            case 2:
                existingCard = _a.sent();
                console.error('Existing card:', existingCard);
                if (!(existingCard.rows.length > 0)) return [3 /*break*/, 5];
                if (!(existingCard.rows[0].name !== cardName)) return [3 /*break*/, 4];
                // update the name to include the full, double sided name
                return [4 /*yield*/, pool.query("UPDATE cards SET name = $1 WHERE card_id = $1;", [cardName, existingCard.rows[0].card_id])];
            case 3:
                // update the name to include the full, double sided name
                _a.sent();
                _a.label = 4;
            case 4: return [2 /*return*/, existingCard.rows[0].card_id];
            case 5:
                if (!(frontSideName === cardName)) return [3 /*break*/, 7];
                return [4 /*yield*/, pool.query("INSERT INTO cards (name, origin) VALUES ($1, $2) RETURNING card_id;", [cardName, set])];
            case 6:
                newCard_1 = _a.sent();
                console.log('New card created:', newCard_1);
                return [2 /*return*/, newCard_1.rows[0].card_id];
            case 7: return [4 /*yield*/, pool.query("SELECT * FROM cards WHERE LOWER(name) = LOWER($1) LIMIT 1", [cardName])];
            case 8:
                existingDoubleFaceCard = _a.sent();
                if (existingDoubleFaceCard.rows.length > 0) {
                    return [2 /*return*/, existingDoubleFaceCard.rows[0].card_id];
                }
                return [4 /*yield*/, pool.query("INSERT INTO cards (name, origin) VALUES ($1, $2) RETURNING card_id;", [cardName, set])];
            case 9:
                newCard = _a.sent();
                console.log('New card created:', newCard);
                return [3 /*break*/, 11];
            case 10:
                error_11 = _a.sent();
                console.error('Database Error:', error_11);
                throw new Error("Failed to get or create card: ".concat(error_11));
            case 11: return [2 /*return*/];
        }
    });
}); };
var isDraftComplete = function (draftId) { return __awaiter(void 0, void 0, void 0, function () {
    var activePick, error_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, getActivePick(draftId)];
            case 1:
                activePick = _a.sent();
                if (activePick) {
                    return [2 /*return*/, false];
                }
                return [2 /*return*/, true];
            case 2:
                error_12 = _a.sent();
                console.error('Database Error:', error_12);
                throw new Error('Failed to check if draft is complete');
            case 3: return [2 /*return*/];
        }
    });
}); };
export var getActivePick = function (draftId) { return __awaiter(void 0, void 0, void 0, function () {
    var activePick, error_13;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, pool.query("\n    SELECT p.*\n    FROM picksV5 p\n    JOIN draftsV4 d ON p.draft_id = d.draft_id\n    WHERE d.draft_id = $1 AND p.card_id IS NULL\n    ORDER BY p.round ASC, p.pick_number ASC\n    LIMIT 1;\n  ", [draftId])];
            case 1:
                activePick = _a.sent();
                // return null if no active pick
                if (activePick.rows.length === 0) {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, activePick.rows[0]];
            case 2:
                error_13 = _a.sent();
                console.error('Database Error:', error_13);
                throw new Error('Failed to get active pick');
            case 3: return [2 /*return*/];
        }
    });
}); };
export var fetchMostValuableUndraftedCard = function (draftId) { return __awaiter(void 0, void 0, void 0, function () {
    var undraftedCards, mostValuableCard, error_14;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, fetchUndrafterCards(draftId)];
            case 1:
                undraftedCards = _a.sent();
                mostValuableCard = undraftedCards.reduce(function (prev, current) {
                    return prev.price.usd > current.price.usd ? prev : current;
                });
                return [2 /*return*/, mostValuableCard];
            case 2:
                error_14 = _a.sent();
                console.error('Database Error:', error_14);
                throw new Error('Failed to fetch most valuable undrafted card');
            case 3: return [2 /*return*/];
        }
    });
}); };
export var fetchUndrafterCards = function (draftId) { return __awaiter(void 0, void 0, void 0, function () {
    var draft, cards, alreadyOwnedCards_1, picks, draftedCardNames_1, undraftedCards, error_15;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                return [4 /*yield*/, fetchDraft(draftId)];
            case 1:
                draft = _a.sent();
                return [4 /*yield*/, fetchSet(draft.set)];
            case 2:
                cards = _a.sent();
                return [4 /*yield*/, fetchOwnedCards(draft.set, draft.league_id)];
            case 3:
                alreadyOwnedCards_1 = _a.sent();
                return [4 /*yield*/, fetchPicks(draftId)];
            case 4:
                picks = _a.sent();
                return [4 /*yield*/, Promise.all(picks.map(function (pick) {
                        return pick.card_id ? fetchCardName(pick.card_id) : null;
                    }))];
            case 5:
                draftedCardNames_1 = _a.sent();
                undraftedCards = cards.filter(function (card) {
                    return !draftedCardNames_1.includes(card.name) &&
                        !alreadyOwnedCards_1.some(function (ownedCard) { return ownedCard.name === card.name; });
                });
                return [2 /*return*/, undraftedCards];
            case 6:
                error_15 = _a.sent();
                console.error('Database Error:', error_15);
                throw new Error('Failed to fetch undrafted cards');
            case 7: return [2 /*return*/];
        }
    });
}); };
export var fetchAutoDraftTime = function (draftId) { return __awaiter(void 0, void 0, void 0, function () {
    var pick_time_seconds, pick_time, auto_draft, error_16;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, pool.query("SELECT pick_time_seconds, auto_draft FROM draftsV4 WHERE draft_id = $1;", [draftId])];
            case 1:
                pick_time_seconds = _a.sent();
                pick_time = pick_time_seconds.rows[0].pick_time_seconds;
                auto_draft = pick_time_seconds.rows[0].auto_draft;
                if (auto_draft) {
                    return [2 /*return*/, pick_time];
                }
                return [2 /*return*/, null];
            case 2:
                error_16 = _a.sent();
                console.error('Database Error:', error_16);
                throw new Error('Failed to fetch auto draft time');
            case 3: return [2 /*return*/];
        }
    });
}); };
export var fetchDraftTimer = function (draftId) { return __awaiter(void 0, void 0, void 0, function () {
    var draft, pick_time, last_pick_timestamp, error_17;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, pool.query("SELECT pick_time_seconds, auto_draft, last_pick_timestamp FROM draftsV4 WHERE draft_id = $1;", [draftId])];
            case 1:
                draft = _a.sent();
                if (draft.rowCount === 0) {
                    throw new Error('Draft not found');
                }
                if (!draft.rows[0].auto_draft) {
                    return [2 /*return*/, null];
                }
                pick_time = draft.rows[0].pick_time_seconds;
                last_pick_timestamp = draft.rows[0].last_pick_timestamp;
                // add time to last_pick_timestamp to create return object
                last_pick_timestamp.setSeconds(last_pick_timestamp.getSeconds() + pick_time);
                return [2 /*return*/, last_pick_timestamp.getTime()];
            case 2:
                error_17 = _a.sent();
                console.error('Database Error:', error_17);
                throw new Error('Failed to fetch draft timer');
            case 3: return [2 /*return*/];
        }
    });
}); };
