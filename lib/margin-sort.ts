import type { MarginBracket } from "@/lib/margin-live";
import type { MarketCandidate, Party } from "@/lib/senate-live";

/** Odds lists the highest Yes price first. Democrat to Republican runs the spectrum. */
export type MarginSort = "odds" | "dem-rep";

const PARTY_WORD: Record<string, Party> = {
  democrat: "D",
  democratic: "D",
  democrats: "D",
  republican: "R",
  republicans: "R",
  independent: "I",
};

/**
 * "Sand 3-6%" / "Sand 3–6%", "Lahn 12%+", "Nixon 3%+", and Alaska's "Peltola 12+%".
 * An open band has no upper bound. "Name Wins" has no band.
 */
const BAND = /^(.+?)\s+(\d+)(?:\s*[–−-]\s*(\d+))?(\+%|%\+|%)$/;
const WINS = /^(.+?)\s+wins$/i;

type ParsedBand = {
  who: string;
  lower: number;
  upper: number;
};

function foldName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .toLowerCase();
}

export function parseMarginLabel(label: string): ParsedBand | null {
  const band = label.trim().match(BAND);
  if (band) {
    const lower = Number(band[2]);
    const upper =
      band[3] !== undefined
        ? Number(band[3])
        : band[4].includes("+")
          ? Number.POSITIVE_INFINITY
          : lower;
    if (!Number.isFinite(lower) || lower < 0 || upper < lower) return null;
    return { who: band[1].trim(), lower, upper };
  }
  const wins = label.trim().match(WINS);
  if (!wins) return null;
  // A bare "Wins" contract is that side's closest outcome: no stated margin.
  return { who: wins[1].trim(), lower: 0, upper: 0 };
}

function nameMatches(candidateName: string, who: string): boolean {
  const key = foldName(who);
  const full = foldName(candidateName);
  if (!key || !full) return false;
  if (full === key || full.endsWith(` ${key}`)) return true;
  return full.split(/\s+/).includes(key);
}

function partiesFor(brackets: MarginBracket[], candidates: MarketCandidate[]): Map<string, Party> {
  const whos = new Set<string>();
  for (const bracket of brackets) {
    const parsed = parseMarginLabel(bracket.label);
    if (parsed) whos.add(parsed.who);
  }

  const resolved = new Map<string, Party>();
  const matched = new Set<number>();

  for (const who of whos) {
    const word = PARTY_WORD[foldName(who)];
    if (word) {
      resolved.set(who, word);
      candidates.forEach((candidate, index) => {
        if (candidate.party === word) matched.add(index);
      });
      continue;
    }
    const hits = candidates.flatMap((candidate, index) =>
      nameMatches(candidate.name, who) ? [index] : [],
    );
    if (hits.length === 1) {
      resolved.set(who, candidates[hits[0]].party);
      matched.add(hits[0]);
    }
  }

  const unknown = [...whos].filter((who) => !resolved.has(who));
  const unmatched = candidates.flatMap((candidate, index) => (matched.has(index) ? [] : [candidate]));
  if (unknown.length === 1 && unmatched.length === 1) {
    resolved.set(unknown[0], unmatched[0].party);
  }
  return resolved;
}

function spectrumKey(party: Party, lower: number, upper: number): [number, number, number] {
  const rank = party === "D" ? 0 : party === "I" ? 1 : 2;
  // Democrats and independents: wider margin first. Republicans: narrower margin first.
  if (party === "R") return [rank, lower, upper];
  return [rank, -lower, -upper];
}

function compareKey(a: [number, number, number], b: [number, number, number]): number {
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] === b[i]) continue;
    return a[i] < b[i] ? -1 : 1;
  }
  return 0;
}

export function sortMarginBrackets(
  brackets: MarginBracket[],
  candidates: MarketCandidate[],
  mode: MarginSort,
): MarginBracket[] {
  const tagged = brackets.map((bracket, index) => ({ bracket, index }));
  if (mode === "odds") {
    tagged.sort((a, b) => b.bracket.price - a.bracket.price || a.index - b.index);
    return tagged.map((item) => item.bracket);
  }

  const parties = partiesFor(brackets, candidates);
  tagged.sort((a, b) => {
    const parsedA = parseMarginLabel(a.bracket.label);
    const parsedB = parseMarginLabel(b.bracket.label);
    const partyA = parsedA ? parties.get(parsedA.who) : undefined;
    const partyB = parsedB ? parties.get(parsedB.who) : undefined;
    const rankedA = parsedA && partyA ? spectrumKey(partyA, parsedA.lower, parsedA.upper) : null;
    const rankedB = parsedB && partyB ? spectrumKey(partyB, parsedB.lower, parsedB.upper) : null;
    if (rankedA && rankedB) {
      const compared = compareKey(rankedA, rankedB);
      return compared === 0 ? a.index - b.index : compared;
    }
    if (rankedA) return -1;
    if (rankedB) return 1;
    return a.index - b.index;
  });
  return tagged.map((item) => item.bracket);
}
