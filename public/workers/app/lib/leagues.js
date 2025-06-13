'use server';
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
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
export function fetchLeague(userId) {
  return __awaiter(this, void 0, void 0, function () {
    var data, error_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            sql(
              templateObject_1 ||
                (templateObject_1 = __makeTemplateObject(
                  [
                    '\n      SELECT * FROM leaguesV3\n      WHERE ',
                    ' = ANY (participants);\n      ',
                  ],
                  [
                    '\n      SELECT * FROM leaguesV3\n      WHERE ',
                    ' = ANY (participants);\n      ',
                  ],
                )),
              userId,
            ),
          ];
        case 1:
          data = _a.sent();
          if (data.rows.length === 0) {
            console.log('No leagues found for '.concat(userId));
            return [2 /*return*/, null];
          }
          if (data.rows.length > 1) {
            throw new Error(
              'Uh oh. Multiple leagues found for '.concat(userId),
            );
          }
          return [2 /*return*/, data.rows[0]];
        case 2:
          error_1 = _a.sent();
          console.error('Database Error:', error_1);
          throw new Error('Failed to fetch leagues for '.concat(userId));
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
export function fetchAllLeagues() {
  return __awaiter(this, void 0, void 0, function () {
    var data, error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            sql(
              templateObject_2 ||
                (templateObject_2 = __makeTemplateObject(
                  ['\n        SELECT * FROM leaguesV3;\n          '],
                  ['\n        SELECT * FROM leaguesV3;\n          '],
                )),
            ),
          ];
        case 1:
          data = _a.sent();
          if (data.rows.length === 0) {
            console.log('No leagues found');
            return [2 /*return*/, null];
          }
          return [2 /*return*/, data.rows];
        case 2:
          error_2 = _a.sent();
          console.error('Database Error:', error_2);
          throw new Error('Failed to fetch leagues');
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
export function fetchAllOpenLeagues() {
  return __awaiter(this, void 0, void 0, function () {
    var data, error_3;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            sql(
              templateObject_3 ||
                (templateObject_3 = __makeTemplateObject(
                  [
                    '\n        SELECT * FROM leaguesV3 WHERE open = true;\n          ',
                  ],
                  [
                    '\n        SELECT * FROM leaguesV3 WHERE open = true;\n          ',
                  ],
                )),
            ),
          ];
        case 1:
          data = _a.sent();
          if (data.rows.length === 0) {
            console.log('No leagues found');
            return [2 /*return*/, null];
          }
          return [2 /*return*/, data.rows];
        case 2:
          error_3 = _a.sent();
          console.error('Database Error:', error_3);
          throw new Error('Failed to fetch leagues');
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
export function joinExistingLeague(userId, leagueId) {
  return __awaiter(this, void 0, void 0, function () {
    var err_1;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [4 /*yield*/, joinLeague(userId, leagueId)];
        case 1:
          _a.sent();
          return [3 /*break*/, 3];
        case 2:
          err_1 = _a.sent();
          console.error(
            'failed to join existing league. leagueId,userId: ',
            leagueId,
            userId,
          );
          return [3 /*break*/, 3];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
export function joinLeague(userId, leagueId) {
  return __awaiter(this, void 0, void 0, function () {
    var leagueResult, participants, error_4;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 5, , 6]);
          return [
            4 /*yield*/,
            sql(
              templateObject_4 ||
                (templateObject_4 = __makeTemplateObject(
                  [
                    'SELECT participants, open FROM leaguesV3 WHERE league_id = ',
                    ';',
                  ],
                  [
                    'SELECT participants, open FROM leaguesV3 WHERE league_id = ',
                    ';',
                  ],
                )),
              leagueId,
            ),
          ];
        case 1:
          leagueResult = _a.sent();
          if (leagueResult.rowCount === 0) {
            throw new Error('League not found');
          }
          if (leagueResult.rows[0].open === false) {
            console.log('League is closed');
            return [2 /*return*/];
          }
          participants = leagueResult.rows[0].participants;
          if (!participants.includes(userId)) return [3 /*break*/, 2];
          console.log('Player is already a participant');
          return [2 /*return*/];
        case 2:
          return [
            4 /*yield*/,
            sql(
              templateObject_5 ||
                (templateObject_5 = __makeTemplateObject(
                  [
                    'UPDATE leaguesV3 SET participants = array_append(participants, ',
                    ') WHERE league_id = ',
                    ';',
                  ],
                  [
                    'UPDATE leaguesV3 SET participants = array_append(participants, ',
                    ') WHERE league_id = ',
                    ';',
                  ],
                )),
              userId,
              leagueId,
            ),
          ];
        case 3:
          _a.sent();
          revalidatePath('/league/teams');
          _a.label = 4;
        case 4:
          return [3 /*break*/, 6];
        case 5:
          error_4 = _a.sent();
          console.error('Database Error:', error_4);
          throw new Error('Failed to join league '.concat(leagueId));
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
export function addCommissioner(userId, leagueId) {
  return __awaiter(this, void 0, void 0, function () {
    var error_5;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            sql(
              templateObject_6 ||
                (templateObject_6 = __makeTemplateObject(
                  [
                    'UPDATE leaguesV3 SET commissioners = array_append(commissioners, ',
                    ') WHERE league_id = ',
                    ';',
                  ],
                  [
                    'UPDATE leaguesV3 SET commissioners = array_append(commissioners, ',
                    ') WHERE league_id = ',
                    ';',
                  ],
                )),
              userId,
              leagueId,
            ),
          ];
        case 1:
          _a.sent();
          return [3 /*break*/, 3];
        case 2:
          error_5 = _a.sent();
          console.error('Database Error:', error_5);
          throw new Error(
            'Failed to add commissioner '
              .concat(userId, ' to league ')
              .concat(leagueId),
          );
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
export function createLeague(leagueName, userId) {
  return __awaiter(this, void 0, void 0, function () {
    var resp, error_6;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, 3, 4]);
          return [
            4 /*yield*/,
            sql(
              templateObject_7 ||
                (templateObject_7 = __makeTemplateObject(
                  [
                    'INSERT INTO leaguesV3 (name, participants, commissioners, open) VALUES (',
                    ', array[]::int[], array[]::int[], true) RETURNING league_id;',
                  ],
                  [
                    'INSERT INTO leaguesV3 (name, participants, commissioners, open) VALUES (',
                    ', array[]::int[], array[]::int[], true) RETURNING league_id;',
                  ],
                )),
              leagueName,
            ),
          ];
        case 1:
          resp = _a.sent();
          joinLeague(userId, resp.rows[0].league_id);
          addCommissioner(userId, resp.rows[0].league_id);
          return [3 /*break*/, 4];
        case 2:
          error_6 = _a.sent();
          console.error('Database Error:', error_6);
          throw new Error('Failed to create League '.concat(leagueName));
        case 3:
          redirect(
            '/league/'.concat(
              resp === null || resp === void 0
                ? void 0
                : resp.rows[0].league_id,
              '/teams',
            ),
          );
          return [7 /*endfinally*/];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
export function fetchPlayersInLeague(leagueId) {
  return __awaiter(this, void 0, void 0, function () {
    var data, error_7;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            sql(
              templateObject_8 ||
                (templateObject_8 = __makeTemplateObject(
                  [
                    '\n    SELECT p.name, p.email, p.player_id\n    FROM users p\n    WHERE p.player_id = ANY (\n      SELECT UNNEST(l.participants)\n      FROM leaguesV3 l\n      WHERE l.league_id = ',
                    '\n    );',
                  ],
                  [
                    '\n    SELECT p.name, p.email, p.player_id\n    FROM users p\n    WHERE p.player_id = ANY (\n      SELECT UNNEST(l.participants)\n      FROM leaguesV3 l\n      WHERE l.league_id = ',
                    '\n    );',
                  ],
                )),
              leagueId,
            ),
          ];
        case 1:
          data = _a.sent();
          if (data.rows.length === 0) {
            console.log('no league with id '.concat(leagueId));
            return [2 /*return*/, []];
          }
          return [2 /*return*/, data.rows];
        case 2:
          error_7 = _a.sent();
          console.error('Database Error:', error_7);
          throw new Error(
            'Failed to fetch players for leagueId '.concat(leagueId),
          );
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
export function fetchPlayerIdInLeague(leagueId) {
  return __awaiter(this, void 0, void 0, function () {
    var data, error_8;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            sql(
              templateObject_9 ||
                (templateObject_9 = __makeTemplateObject(
                  [
                    '\n    SELECT participants FROM leaguesV3 WHERE league_id=',
                    ' LIMIT 1;',
                  ],
                  [
                    '\n    SELECT participants FROM leaguesV3 WHERE league_id=',
                    ' LIMIT 1;',
                  ],
                )),
              leagueId,
            ),
          ];
        case 1:
          data = _a.sent();
          return [2 /*return*/, data.rows[0].participants];
        case 2:
          error_8 = _a.sent();
          console.error('Database Error:', error_8);
          throw new Error(
            'Failed to fetch players for leagueId '.concat(leagueId),
          );
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
export function isPlayerInLeague(playerId, leagueId) {
  return __awaiter(this, void 0, void 0, function () {
    var data, error_9;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            sql(
              templateObject_10 ||
                (templateObject_10 = __makeTemplateObject(
                  [
                    '\n    SELECT participants FROM leaguesV3 WHERE league_id=',
                    ';',
                  ],
                  [
                    '\n    SELECT participants FROM leaguesV3 WHERE league_id=',
                    ';',
                  ],
                )),
              leagueId,
            ),
          ];
        case 1:
          data = _a.sent();
          return [2 /*return*/, data.rows[0].participants.includes(playerId)];
        case 2:
          error_9 = _a.sent();
          console.error('Database Error:', error_9);
          throw new Error(
            'Failed to fetch players for leagueId '.concat(leagueId),
          );
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
export function isCommissioner(playerId, leagueId) {
  return __awaiter(this, void 0, void 0, function () {
    var data, error_10;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            sql(
              templateObject_11 ||
                (templateObject_11 = __makeTemplateObject(
                  [
                    '\n    SELECT commissioners FROM leaguesV3 WHERE league_id=',
                    ';',
                  ],
                  [
                    '\n    SELECT commissioners FROM leaguesV3 WHERE league_id=',
                    ';',
                  ],
                )),
              leagueId,
            ),
          ];
        case 1:
          data = _a.sent();
          return [2 /*return*/, data.rows[0].commissioners.includes(playerId)];
        case 2:
          error_10 = _a.sent();
          console.error('Database Error:', error_10);
          throw new Error(
            'Failed to fetch players for leagueId '.concat(leagueId),
          );
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
var templateObject_1,
  templateObject_2,
  templateObject_3,
  templateObject_4,
  templateObject_5,
  templateObject_6,
  templateObject_7,
  templateObject_8,
  templateObject_9,
  templateObject_10,
  templateObject_11;
