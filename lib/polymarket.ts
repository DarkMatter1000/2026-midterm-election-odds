// Live Polymarket Yes prices from the public Gamma API.
// Polling averages, VoteHub, 2024 results, and the generic-ballot math stay snapshots.

import { GOVERNORS } from "@/lib/governor-live";
import { HOUSE_MARKETS, type HouseMarket } from "@/lib/house-districts";
import {
  GENERIC_BALLOT_MARGIN,
  GOVERNOR_MARGINS,
  SENATE_MARGINS,
  type MarginEvent,
} from "@/lib/margin-live";
import {
  HOUSE_CONTROL,
  SENATE,
  SENATE_CONTROL,
  type MarketCandidate,
  type SenateRace,
} from "@/lib/senate-live";
import {
  TOSSUP_EVENT,
  TOSSUP_MAPS,
  TOSSUP_MAP_ROWS,
  TOSSUP_STATES,
  exactTossupMapFrom,
  rankTossupMaps,
  tossupStatesFromMaps,
  type RankedTossupMap,
  type TossupMap,
  type TossupState,
} from "@/lib/tossup-live";

export const GAMMA_EVENTS_URL = "https://gamma-api.polymarket.com/events";
export const LIVE_REVALIDATE_SECONDS = 45;

export type LiveOutcome = {
  title: string;
  question: string;
  price: number;
};

export type LiveEvent = {
  slug: string;
  outcomes: LiveOutcome[];
};

export type LiveOddsPayload = {
  live: boolean;
  fetchedAt: string | null;
  chicago: string | null;
  events: Record<string, LiveEvent>;
};

export type LiveTossup = {
  states: TossupState[];
  maps: TossupMap[];
  rows: RankedTossupMap[];
};

const NAME_ALIASES: Record<string, string> = {
  "james talarico": "james talafreako",
  talarico: "talafreako",
};

export function slugFromUrl(url: string): string {
  return url.replace(/^https?:\/\/polymarket\.com\/event\//, "");
}

export function allPolymarketSlugs(): string[] {
  const slugs = new Set<string>();
  slugs.add(slugFromUrl(SENATE_CONTROL.url));
  slugs.add(slugFromUrl(HOUSE_CONTROL.url));
  slugs.add(GENERIC_BALLOT_MARGIN.slug);
  slugs.add(TOSSUP_EVENT.slug);
  for (const race of Object.values(SENATE)) slugs.add(slugFromUrl(race.polymarketUrl));
  for (const race of Object.values(GOVERNORS)) slugs.add(slugFromUrl(race.polymarketUrl));
  for (const events of Object.values(SENATE_MARGINS)) {
    for (const event of events) slugs.add(event.slug);
  }
  for (const events of Object.values(GOVERNOR_MARGINS)) {
    for (const event of events) slugs.add(event.slug);
  }
  for (const market of Object.values(HOUSE_MARKETS)) slugs.add(market.slug);
  return [...slugs];
}

export function formatChicago(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

/** Yes price in 100, one decimal, half up. */
export function yesToPercent(yes: number): number {
  return Math.round(yes * 1000) / 10;
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[“”"‘’]/g, "'")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function applyAlias(value: string): string {
  const key = normalize(value);
  return NAME_ALIASES[key] ?? key;
}

function stripPartySuffix(value: string): string {
  return value.replace(/\s*\(([dri]|dem|rep|ind)\)$/i, "").trim();
}

function lastWord(value: string): string {
  const parts = normalize(value).split(" ").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

function isPlaceholder(title: string): boolean {
  return /^(person [a-z]|other)$/i.test(title.trim());
}

function partyFromTitle(title: string): "D" | "R" | "I" | null {
  const text = normalize(stripPartySuffix(title));
  if (/^(democrat(ic)?( party)?|democrats)$/.test(text)) return "D";
  if (/^(republican( party)?|republicans)$/.test(text)) return "R";
  if (/^(independent( party)?|independents)$/.test(text)) return "I";
  return null;
}

function outcomeKeys(outcome: LiveOutcome): string[] {
  const title = stripPartySuffix(outcome.title);
  const keys = new Set<string>();
  keys.add(normalize(title));
  keys.add(applyAlias(title));
  const last = lastWord(applyAlias(title));
  if (last) keys.add(last);
  return [...keys];
}

function candidateKeys(candidate: MarketCandidate, extras: string[] = []): string[] {
  const keys = new Set<string>();
  keys.add(normalize(candidate.name));
  keys.add(applyAlias(candidate.name));
  const last = lastWord(applyAlias(candidate.name));
  if (last) keys.add(last);
  for (const extra of extras) {
    keys.add(normalize(extra));
    keys.add(applyAlias(extra));
  }
  return [...keys];
}

export function matchCandidatePrice(
  candidate: MarketCandidate,
  outcomes: LiveOutcome[],
  extras: string[] = [],
): number | null {
  const wanted = new Set(candidateKeys(candidate, extras));
  const named = outcomes.filter((outcome) => outcomeKeys(outcome).some((key) => wanted.has(key)));
  if (named.length === 1) return named[0].price;
  if (named.length > 1) {
    const exact = named.filter((outcome) => {
      const title = applyAlias(stripPartySuffix(outcome.title));
      return title === applyAlias(candidate.name) || extras.some((extra) => title === applyAlias(extra));
    });
    if (exact.length === 1) return exact[0].price;
  }
  const partyHits = outcomes.filter((outcome) => partyFromTitle(outcome.title) === candidate.party);
  if (partyHits.length === 1) return partyHits[0].price;
  return null;
}

export function parseGammaEvent(raw: unknown): LiveEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const event = raw as { slug?: unknown; markets?: unknown };
  if (typeof event.slug !== "string" || !event.slug) return null;
  if (!Array.isArray(event.markets)) return null;
  const outcomes: LiveOutcome[] = [];
  for (const item of event.markets) {
    if (!item || typeof item !== "object") continue;
    const market = item as {
      active?: unknown;
      groupItemTitle?: unknown;
      question?: unknown;
      outcomePrices?: unknown;
    };
    if (market.active === false) continue;
    const title = typeof market.groupItemTitle === "string" ? market.groupItemTitle : "";
    const question = typeof market.question === "string" ? market.question : "";
    if (isPlaceholder(title)) continue;
    const price = parseYesPrice(market.outcomePrices);
    if (price === null) continue;
    if (!title && !question) continue;
    outcomes.push({ title: title || question, question, price });
  }
  if (outcomes.length === 0) return null;
  return { slug: event.slug, outcomes };
}

function parseYesPrice(raw: unknown): number | null {
  let prices = raw;
  if (typeof prices === "string") {
    try {
      prices = JSON.parse(prices);
    } catch {
      return null;
    }
  }
  if (!Array.isArray(prices) || prices.length === 0) return null;
  const yes = Number(prices[0]);
  if (!Number.isFinite(yes)) return null;
  return yesToPercent(yes);
}

export function applyRacePrices(race: SenateRace, events: Record<string, LiveEvent>): SenateRace {
  const event = events[slugFromUrl(race.polymarketUrl)];
  if (!event) return race;
  return {
    ...race,
    candidates: race.candidates.map((candidate) => {
      const price = matchCandidatePrice(candidate, event.outcomes);
      return price === null ? candidate : { ...candidate, price };
    }),
  };
}

export function applyRaces(
  races: Record<string, SenateRace>,
  events: Record<string, LiveEvent>,
): Record<string, SenateRace> {
  return Object.fromEntries(
    Object.entries(races).map(([abbr, race]) => [abbr, applyRacePrices(race, events)]),
  );
}

export function applyHouseMarkets(
  markets: Record<string, HouseMarket>,
  events: Record<string, LiveEvent>,
): Record<string, HouseMarket> {
  return Object.fromEntries(
    Object.entries(markets).map(([id, market]) => {
      const event = events[market.slug];
      if (!event) return [id, market];
      return [
        id,
        {
          ...market,
          candidates: market.candidates.map((candidate) => {
            const price = matchCandidatePrice(candidate, event.outcomes, [candidate.label]);
            return price === null ? candidate : { ...candidate, price };
          }),
        },
      ];
    }),
  );
}

export function applyMarginEvent(event: MarginEvent, events: Record<string, LiveEvent>): MarginEvent {
  const live = events[event.slug];
  if (!live) return event;
  return {
    ...event,
    brackets: event.brackets.map((bracket) => {
      const hit = live.outcomes.find(
        (outcome) => normalize(outcome.title) === normalize(bracket.label),
      );
      return hit ? { ...bracket, price: hit.price } : bracket;
    }),
  };
}

export function applyMarginEvents(
  byState: Record<string, MarginEvent[]>,
  events: Record<string, LiveEvent>,
): Record<string, MarginEvent[]> {
  return Object.fromEntries(
    Object.entries(byState).map(([abbr, list]) => [
      abbr,
      list.map((event) => applyMarginEvent(event, events)),
    ]),
  );
}

export function applyControl(
  control: { dem: number; rep: number; url: string },
  events: Record<string, LiveEvent>,
): { dem: number; rep: number; url: string } {
  const event = events[slugFromUrl(control.url)];
  if (!event) return control;
  const dem = event.outcomes.find((outcome) => partyFromTitle(outcome.title) === "D");
  const rep = event.outcomes.find((outcome) => partyFromTitle(outcome.title) === "R");
  return {
    ...control,
    dem: dem?.price ?? control.dem,
    rep: rep?.price ?? control.rep,
  };
}

export function applyTossup(event: LiveEvent | undefined): LiveTossup {
  if (!event) {
    return {
      states: TOSSUP_STATES,
      maps: TOSSUP_MAPS,
      rows: TOSSUP_MAP_ROWS,
    };
  }
  const maps = TOSSUP_MAPS.map((map) => {
    const hit = event.outcomes.find(
      (outcome) =>
        normalize(outcome.question) === normalize(map.question) ||
        normalize(outcome.title) === normalize(map.label),
    );
    return hit ? { ...map, price: hit.price } : map;
  });
  return {
    states: tossupStatesFromMaps(maps),
    maps,
    rows: rankTossupMaps(maps),
  };
}

export function emptyLivePayload(): LiveOddsPayload {
  return { live: false, fetchedAt: null, chicago: null, events: {} };
}

export function withLiveSenate<T extends { abbr: string; senate: SenateRace | null }>(
  state: T,
  senate: Record<string, SenateRace>,
): T {
  const race = senate[state.abbr];
  if (!state.senate || !race) return state;
  return { ...state, senate: race };
}

export { exactTossupMapFrom };
