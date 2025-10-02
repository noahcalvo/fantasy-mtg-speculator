// lib/moderation.ts
import { openai } from "./openai";

// Tight allowlist: tweak for your UX
const ALLOWED = /^[a-z0-9 _\-\.\(\)\[\]]+$/i;

// Keep this list short and surgical; you can expand over time.
// (Don't check in slurs to public repos—load from env or a private file IRL.)
const BLOCKLIST = ["nazi", "hitler", "kkk", "rape", "slur1", "slur2"];

export function sanitizeName(raw: string) {
  return raw.normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
}

export function basicValidateName(name: string, min = 3, max = 30) {
  if (name.length < min || name.length > max) {
    return { ok: false, reason: `Name must be ${min}–${max} characters.` };
  }
  if (!ALLOWED.test(name)) {
    return { ok: false, reason: "Only letters, numbers, spaces, _-.()[] allowed." };
  }
  const lower = name.toLowerCase();
  if (BLOCKLIST.some(w => lower.includes(w))) {
    return { ok: false, reason: "That name isn’t allowed." };
  }
  return { ok: true as const };
}

// optional quick heuristic
const PRAISE = /\b(good|great|love|like|based|awesome|support|endorse|admire|defend)\b/;
const EXTREMIST = /\b(hitler|nazi|kkk|third\s?reich|heil|gestapo)\b/;

const STRICT_THRESHOLD = 0.2;

function categoriesAtOrAbove(result: unknown, threshold = STRICT_THRESHOLD) {
  const hits: string[] = [];
  const scores = (result as any)?.category_scores as Record<string, unknown> | undefined;
  if (!scores) return hits;
  for (const [cat, val] of Object.entries(scores)) {
    const num = Number(val);
    if (!Number.isNaN(num) && num >= threshold) hits.push(`${cat}:${num.toFixed(3)}`);
  }
  return hits;
}

function toPlainScores(scores: unknown): Record<string, number> | null {
  if (!scores) return null;
  return Object.fromEntries(
    Object.entries(scores as Record<string, unknown>).map(([k, v]) => [k, Number(v)])
  );
}

function logForReview(
  name: string,
  norm: string,
  reason: string,
  scores: unknown // <-- was Record<string, number>
) {
  console.warn("[USERNAME_REVIEW]", {
    name_raw: name,
    name_normalized: norm,
    reason,
    category_scores: toPlainScores(scores),
    ts: new Date().toISOString(),
  });
}

export async function moderateNameOrThrow(nameRaw: string) {
  const name = sanitizeName(nameRaw);
  const basic = basicValidateName(name);
  if (!basic.ok) throw new Error(basic.reason);

  const norm = normalizeForSafety(name);

  // backstop before any API
  if (EXTREMIST.test(norm) && PRAISE.test(norm)) {
    logForReview(name, norm, "extremist+praise backstop", undefined);
    throw new Error("That name isn’t allowed.");
  }

  // 1) Call the API inside try/catch
  let r1: any, r2: any;
  try {
    [r1, r2] = await Promise.all([
      openai.moderations.create({ model: "omni-moderation-latest", input: name }),
      openai.moderations.create({ model: "omni-moderation-latest", input: norm }),
    ]);
  } catch (err: any) {
    // Decide your policy on 429s; keeping your previous behavior:
    if (err?.status === 429) return name; // allow on transient rate limit
    throw new Error("Unable to validate name right now. Please try again.");
  }

  // 2) Evaluate results OUTSIDE the catch so we don't swallow our own block
  const modelFlagged =
    (r1.results?.some((x: any) => x.flagged) ?? false) ||
    (r2.results?.some((x: any) => x.flagged) ?? false);

  if (modelFlagged) {
    logForReview(name, norm, "model_flagged_true", r1.results?.[0]?.category_scores);
    throw new Error("That name isn’t allowed.");
  }

  const hits1 = r1.results?.flatMap((x: any) => categoriesAtOrAbove(x)) ?? [];
  const hits2 = r2.results?.flatMap((x: any) => categoriesAtOrAbove(x)) ?? [];
  const strictHits = [...new Set([...hits1, ...hits2])];

  if (strictHits.length > 0) {
    logForReview(
      name,
      norm,
      `strict_threshold_${STRICT_THRESHOLD}_hit: ${strictHits.join(", ")}`,
      r1.results?.[0]?.category_scores
    );
    throw new Error("That name isn’t allowed.");
  }

  // 3) If we got here, approve
  return name;
}

// safety-normalize.ts
const LEET_MAP: Record<string, string> = {
  "0": "o", "1": "i", "2": "z", "3": "e", "4": "a", "5": "s", "6": "g", "7": "t", "8": "b", "9": "g",
  "$": "s", "@": "a", "!": "i", "|": "l", "+": "t", "€": "e", "£": "l", "¥": "y"
};

// very common Latin homoglyphs → ASCII
const HOMO_MAP: Record<string, string> = {
  "¡": "i", "¿": "?", "ß": "ss", "æ": "ae", "œ": "oe", "ø": "o", "ð": "d", "þ": "p",
  "ª": "a", "º": "o", "ç": "c", "ł": "l", "đ": "d", "ŧ": "t", "ħ": "h", "ı": "i", "ŋ": "n",
};

const memo = new Map<string, string>();

export function normalizeForSafety(input: string): string {
  if (memo.has(input)) return memo.get(input)!;

  // 1) Unicode fold + lowercase
  let s = input.normalize("NFKD").toLowerCase();

  // 2) strip combining marks (diacritics)
  s = s.replace(/[\u0300-\u036f]/g, "");

  // 3) homoglyphs → ascii
  s = s.replace(/[^a-z0-9\s]/g, ch => HOMO_MAP[ch] ?? ch);

  // 4) leet/hacks → ascii letters
  s = s.replace(/[0-9$@!|+€£¥]/g, ch => LEET_MAP[ch] ?? ch);

  // 5) collapse repeats: cooool → cool (but keep 2 for natural words)
  s = s.replace(/([a-z])\1{2,}/g, "$1$1");

  // 6) drop remaining punctuation to spaces, collapse whitespace
  s = s.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

  // 7) cap length (defense-in-depth for absurd inputs)
  if (s.length > 128) s = s.slice(0, 128);

  memo.set(input, s);
  return s;
}
