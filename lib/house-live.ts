// House district chances follow the Senate rule in lib/senate-live.ts.
// A polling average, when one is stored on the race, is half the chance.
// This snapshot has no FiftyPlusOne House district average, so the chance
// is the Polymarket price and does not move with the generic ballot.
// The generic-ballot estimate is a separate number: the district's 2024
// presidential margin, swung by EVEN_SWING, then the national slider and
// the parent state's custom delta.

import { finalGenericMargin, formatMargin } from "@/lib/election";
import {
  HOUSE_2024_DISTRICT,
  HOUSE_MARKETS,
  HOUSE_POLYMARKET_AS_OF,
  HOUSE_PRES_PAGE,
  HOUSE_PRES_SOURCE,
  HOUSE_RESULT_SOURCE,
  PRES_2024,
  type HouseMarket,
  type HouseResult2024,
} from "@/lib/house-districts";
import {
  formatPollMargin,
  pollMarginPoints,
  quotedChances,
  type QuotedChance,
  type SenateRace,
} from "@/lib/senate-live";

export {
  HOUSE_2024_DISTRICT,
  HOUSE_MARKETS,
  HOUSE_POLYMARKET_AS_OF,
  HOUSE_PRES_PAGE,
  HOUSE_PRES_SOURCE,
  HOUSE_RESULT_SOURCE,
  PRES_2024,
};
export type { HouseMarket, HouseResult2024 };

export function houseRace(market: HouseMarket): SenateRace {
  return {
    polymarketUrl: `https://polymarket.com/event/${market.slug}`,
    candidates: market.candidates.map((candidate) => ({
      name: candidate.name,
      party: candidate.party,
      price: candidate.price,
    })),
    pair: [],
    polls: [],
  };
}

/** District generic-ballot estimate. Null when this outline has no 2024 presidential margin. */
export function districtGeneric(id: string, shift: number): number | null {
  const trump = PRES_2024[id];
  if (trump === undefined) return null;
  return finalGenericMargin(trump, shift, 0).margin;
}

/**
 * Democratic price minus Republican price after the snapshot prices are scaled
 * to about 100. Does not move with the generic ballot. Null when the market
 * has no Democrat and no Republican.
 */
export function priceGap(market: HouseMarket): number | null {
  const quoted = quotedChances(houseRace(market), 0);
  const democrats = quoted.filter((candidate) => candidate.party === "D");
  const republicans = quoted.filter((candidate) => candidate.party === "R");
  if (democrats.length > 0 && republicans.length > 0) {
    const dem = democrats.reduce((sum, candidate) => sum + candidate.chance, 0);
    const rep = republicans.reduce((sum, candidate) => sum + candidate.chance, 0);
    return Number((dem - rep).toFixed(1));
  }
  return market.partyColor ? market.partyColor.margin : null;
}

export type DistrictShade = {
  margin: number;
  /** projection: a Polymarket price gap or a polled vote margin. generic: the district estimate. */
  basis: "projection" | "generic";
  kind: "poll" | "price" | "generic";
};

export function districtShade(
  id: string,
  shift: number,
  markets: Record<string, HouseMarket> = HOUSE_MARKETS,
): DistrictShade | null {
  const generic = districtGeneric(id, shift);
  if (generic === null) return null;
  const market = markets[id];
  if (!market) return { margin: generic, basis: "generic", kind: "generic" };
  const base = pollMarginPoints(houseRace(market));
  if (base !== null) {
    return {
      margin: Number((base + shift).toFixed(1)),
      basis: "projection",
      kind: "poll",
    };
  }
  const gap = priceGap(market);
  if (gap === null) return { margin: generic, basis: "generic", kind: "generic" };
  return { margin: gap, basis: "projection", kind: "price" };
}

export function houseChances(market: HouseMarket, shift: number): QuotedChance[] {
  return quotedChances(houseRace(market), shift);
}

/** Vote-share margin. Only present when a polling average is on the race. */
export function housePollMargin(
  market: HouseMarket,
  shift: number,
): { margin: number; text: string } | null {
  const race = houseRace(market);
  const base = pollMarginPoints(race);
  if (base === null) return null;
  const margin = Number((base + shift).toFixed(1));
  return { margin, text: formatPollMargin(race, margin) };
}

export function formatHouseMargin(marginD: number | null): string {
  if (marginD === null) return "No Republican-versus-Democrat margin";
  return formatMargin(marginD);
}
