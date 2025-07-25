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
export function fetchParticipantData(id) {
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
                    '\n      SELECT  player_id, name, email from users WHERE player_id = ',
                    ';\n        ',
                  ],
                  [
                    '\n      SELECT  player_id, name, email from users WHERE player_id = ',
                    ';\n        ',
                  ],
                )),
              id,
            ),
          ];
        case 1:
          data = _a.sent();
          if (data.rows.length === 0) {
            throw new Error('No player found with the given id '.concat(id));
          }
          return [2 /*return*/, data.rows[0]];
        case 2:
          error_1 = _a.sent();
          console.error('Database Error:', error_1);
          throw new Error('Failed to fetch player: '.concat(id));
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
export function fetchMultipleParticipantData(ids) {
  return __awaiter(this, void 0, void 0, function () {
    var participants, _i, ids_1, id, _a, _b, error_2;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          participants = [];
          _c.label = 1;
        case 1:
          _c.trys.push([1, 6, 7, 8]);
          (_i = 0), (ids_1 = ids);
          _c.label = 2;
        case 2:
          if (!(_i < ids_1.length)) return [3 /*break*/, 5];
          id = ids_1[_i];
          _b = (_a = participants).concat;
          return [4 /*yield*/, fetchParticipantData(id)];
        case 3:
          participants = _b.apply(_a, [_c.sent()]);
          _c.label = 4;
        case 4:
          _i++;
          return [3 /*break*/, 2];
        case 5:
          return [3 /*break*/, 8];
        case 6:
          error_2 = _c.sent();
          console.error('Database Error:', error_2);
          throw new Error('Failed to fetch multiple participants');
        case 7:
          return [2 /*return*/, participants];
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
export function fetchPlayerByEmail(email) {
  return __awaiter(this, void 0, void 0, function () {
    var data, error_3;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            sql(
              templateObject_2 ||
                (templateObject_2 = __makeTemplateObject(
                  [
                    '\n      SELECT player_id, name, email from users WHERE email = ',
                    ';\n        ',
                  ],
                  [
                    '\n      SELECT player_id, name, email from users WHERE email = ',
                    ';\n        ',
                  ],
                )),
              email,
            ),
          ];
        case 1:
          data = _a.sent();
          if (data.rows.length === 0) {
            throw new Error('No player found');
          }
          if (data.rows.length > 1) {
            throw new Error('Uh oh. Multiple players found for '.concat(email));
          }
          return [2 /*return*/, data.rows[0]];
        case 2:
          error_3 = _a.sent();
          console.error('Database Error:', error_3);
          throw new Error('Failed to fetch drafts');
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
var templateObject_1, templateObject_2;
