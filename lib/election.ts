// Snapshot for the November 3, 2026 midterms.
// Generic-ballot averages: Wikipedia's compilation of five public aggregators,
// updated October 30, 2026.
// Senate chances: lib/senate-live.ts, Polymarket at 4:10 p.m. CT on October 31, 2026,
// averaged with FiftyPlusOne and Electoral-Vote.com where both name the same candidates.
// 2024 presidential margins: certified totals compiled by Wikipedia from the
// Federal Election Commission report.

import {
  SENATE,
  blendsPolls,
  closeness,
  formatChance,
  formatPollMargin,
  namesInRace,
  pollMarginPoints,
  quotedChances,
  type SenateRace,
} from "@/lib/senate-live";

export type { SenateRace };

export const BALLOT_AS_OF = "October 30, 2026";
export const ELECTION_DAY = "2026-11-03";

export const NATIONAL_GENERIC = {
  dem: 51.7,
  rep: 43.1,
  other: 5.2,
  marginD: 8.6,
};

// Democratic minus Republican, 2024 national popular vote: 48.32 − 49.80.
export const PRESIDENTIAL_2024_MARGIN_D = -1.48;

// How many points more Democratic the national generic ballot is than the
// 2024 presidential popular vote.
export const EVEN_SWING = Number(
  (NATIONAL_GENERIC.marginD - PRESIDENTIAL_2024_MARGIN_D).toFixed(2),
);

export type StateRecord = {
  abbr: string;
  name: string;
  /** Trump margin in the 2024 presidential election, in points. Negative means Harris won. */
  trumpMargin2024: number;
  senate: SenateRace | null;
};

export const GENERIC_POLLS: {
  source: string;
  dem: number;
  rep: number;
  other: number;
  marginD: number;
  dates: string;
}[] = [
  {
    source: "Decision Desk HQ",
    dem: 51.5,
    rep: 42.6,
    other: 5.9,
    marginD: 8.9,
    dates: "Jan 9, 2025 – Oct 26, 2026",
  },
  {
    source: "FiftyPlusOne",
    dem: 52.2,
    rep: 43.4,
    other: 4.4,
    marginD: 8.8,
    dates: "Jan 9, 2025 – Oct 26, 2026",
  },
  {
    source: "NBC News",
    dem: 52.0,
    rep: 44.0,
    other: 4.0,
    marginD: 8.0,
    dates: "Jan 9, 2025 – Oct 26, 2026",
  },
  {
    source: "RealClearPolitics",
    dem: 51.4,
    rep: 43.2,
    other: 5.4,
    marginD: 8.2,
    dates: "Oct 8–26, 2026",
  },
  {
    source: "Silver Bulletin",
    dem: 51.3,
    rep: 42.4,
    other: 6.3,
    marginD: 8.9,
    dates: "Jan 9, 2025 – Oct 26, 2026",
  },
];

function live(abbr: string): SenateRace {
  const race = SENATE[abbr];
  if (!race) throw new Error(`No Senate snapshot for ${abbr}`);
  return race;
}

export const STATES: StateRecord[] = [
  { abbr: "AL", name: "Alabama", trumpMargin2024: 30.47, senate: live("AL") },
  {
    abbr: "AK",
    name: "Alaska",
    trumpMargin2024: 13.13,
    senate: live("AK"),
  },
  { abbr: "AZ", name: "Arizona", trumpMargin2024: 5.53, senate: null },
  { abbr: "AR", name: "Arkansas", trumpMargin2024: 30.64, senate: live("AR") },
  { abbr: "CA", name: "California", trumpMargin2024: -20.14, senate: null },
  { abbr: "CO", name: "Colorado", trumpMargin2024: -10.99, senate: live("CO") },
  { abbr: "CT", name: "Connecticut", trumpMargin2024: -14.51, senate: null },
  { abbr: "DE", name: "Delaware", trumpMargin2024: -14.7, senate: live("DE") },
  { abbr: "FL", name: "Florida", trumpMargin2024: 13.1, senate: live("FL") },
  {
    abbr: "GA",
    name: "Georgia",
    trumpMargin2024: 2.2,
    senate: live("GA"),
  },
  { abbr: "HI", name: "Hawaii", trumpMargin2024: -23.11, senate: null },
  { abbr: "ID", name: "Idaho", trumpMargin2024: 36.49, senate: live("ID") },
  { abbr: "IL", name: "Illinois", trumpMargin2024: -10.9, senate: live("IL") },
  { abbr: "IN", name: "Indiana", trumpMargin2024: 18.96, senate: null },
  { abbr: "IA", name: "Iowa", trumpMargin2024: 13.21, senate: live("IA") },
  { abbr: "KS", name: "Kansas", trumpMargin2024: 16.12, senate: live("KS") },
  { abbr: "KY", name: "Kentucky", trumpMargin2024: 30.53, senate: live("KY") },
  { abbr: "LA", name: "Louisiana", trumpMargin2024: 22.01, senate: live("LA") },
  {
    abbr: "ME",
    name: "Maine",
    trumpMargin2024: -6.94,
    senate: live("ME"),
  },
  { abbr: "MD", name: "Maryland", trumpMargin2024: -28.54, senate: null },
  { abbr: "MA", name: "Massachusetts", trumpMargin2024: -25.2, senate: live("MA") },
  { abbr: "MI", name: "Michigan", trumpMargin2024: 1.42, senate: live("MI") },
  { abbr: "MN", name: "Minnesota", trumpMargin2024: -4.24, senate: live("MN") },
  { abbr: "MS", name: "Mississippi", trumpMargin2024: 22.89, senate: live("MS") },
  { abbr: "MO", name: "Missouri", trumpMargin2024: 18.41, senate: null },
  { abbr: "MT", name: "Montana", trumpMargin2024: 19.93, senate: live("MT") },
  {
    abbr: "NE",
    name: "Nebraska",
    trumpMargin2024: 20.46,
    senate: live("NE"),
  },
  { abbr: "NV", name: "Nevada", trumpMargin2024: 3.1, senate: null },
  { abbr: "NH", name: "New Hampshire", trumpMargin2024: -2.78, senate: live("NH") },
  { abbr: "NJ", name: "New Jersey", trumpMargin2024: -5.91, senate: live("NJ") },
  { abbr: "NM", name: "New Mexico", trumpMargin2024: -6.0, senate: live("NM") },
  { abbr: "NY", name: "New York", trumpMargin2024: -12.6, senate: null },
  { abbr: "NC", name: "North Carolina", trumpMargin2024: 3.21, senate: live("NC") },
  { abbr: "ND", name: "North Dakota", trumpMargin2024: 36.45, senate: null },
  { abbr: "OH", name: "Ohio", trumpMargin2024: 11.21, senate: live("OH") },
  { abbr: "OK", name: "Oklahoma", trumpMargin2024: 34.26, senate: live("OK") },
  { abbr: "OR", name: "Oregon", trumpMargin2024: -14.3, senate: live("OR") },
  { abbr: "PA", name: "Pennsylvania", trumpMargin2024: 1.71, senate: null },
  { abbr: "RI", name: "Rhode Island", trumpMargin2024: -13.78, senate: live("RI") },
  {
    abbr: "SC",
    name: "South Carolina",
    trumpMargin2024: 17.87,
    senate: live("SC"),
  },
  { abbr: "SD", name: "South Dakota", trumpMargin2024: 29.19, senate: live("SD") },
  { abbr: "TN", name: "Tennessee", trumpMargin2024: 29.72, senate: live("TN") },
  { abbr: "TX", name: "Texas", trumpMargin2024: 13.68, senate: live("TX") },
  { abbr: "UT", name: "Utah", trumpMargin2024: 21.59, senate: null },
  { abbr: "VT", name: "Vermont", trumpMargin2024: -31.51, senate: null },
  { abbr: "VA", name: "Virginia", trumpMargin2024: -5.78, senate: live("VA") },
  { abbr: "WA", name: "Washington", trumpMargin2024: -18.22, senate: null },
  { abbr: "WV", name: "West Virginia", trumpMargin2024: 41.87, senate: live("WV") },
  { abbr: "WI", name: "Wisconsin", trumpMargin2024: 0.86, senate: null },
  { abbr: "WY", name: "Wyoming", trumpMargin2024: 45.76, senate: live("WY") },
];

const byAbbr = new Map(STATES.map((state) => [state.abbr, state]));

export function getState(abbr: string): StateRecord | undefined {
  return byAbbr.get(abbr);
}

/** Even-swing generic margin before the national slider or a state adjustment. */
export function evenSwingMargin(trumpMargin2024: number): number {
  return Number((-trumpMargin2024 + EVEN_SWING).toFixed(1));
}

/** Democratic and Republican shares cannot leave the two-party remainder. */
export const GENERIC_MARGIN_CAP = Number((100 - NATIONAL_GENERIC.other).toFixed(1));

export function finalGenericMargin(
  trumpMargin2024: number,
  sliderDelta: number,
  customDelta = 0,
): { margin: number; raw: number; clamped: boolean } {
  const raw = Number((evenSwingMargin(trumpMargin2024) + sliderDelta + customDelta).toFixed(1));
  const margin = Math.max(-GENERIC_MARGIN_CAP, Math.min(GENERIC_MARGIN_CAP, raw));
  return { margin, raw, clamped: margin !== raw };
}

export function genericMargin(trumpMargin2024: number, delta = 0): number {
  return finalGenericMargin(trumpMargin2024, delta, 0).margin;
}

/** Other stays at the national generic's other share. D and R split the rest around M. */
export function ballotShares(margin: number): { dem: number; rep: number; other: number } {
  const other = NATIONAL_GENERIC.other;
  const span = 100 - other;
  return {
    dem: (span + margin) / 2,
    rep: (span - margin) / 2,
    other,
  };
}

export function votesForShare(turnout: number, pct: number): number {
  return Math.round((turnout * pct) / 100);
}

/** Expected ballots at a whole-number percent of a 2022 House baseline. 100 leaves the certified total unchanged. */
export function scaledTurnout(baseline: number, percent: number): number {
  return Math.round((baseline * percent) / 100);
}

export type StateBallot = {
  margin: number;
  raw: number;
  clamped: boolean;
  demPct: number;
  repPct: number;
  demVotes: number;
  repVotes: number;
  turnout: number;
};

export function stateBallot(
  trumpMargin2024: number,
  turnout: number,
  sliderDelta: number,
  customDelta = 0,
): StateBallot {
  const { margin, raw, clamped } = finalGenericMargin(trumpMargin2024, sliderDelta, customDelta);
  const shares = ballotShares(margin);
  return {
    margin,
    raw,
    clamped,
    demPct: shares.dem,
    repPct: shares.rep,
    demVotes: votesForShare(turnout, shares.dem),
    repVotes: votesForShare(turnout, shares.rep),
    turnout,
  };
}

export type WeightedNational = {
  demVotes: number;
  repVotes: number;
  turnout: number;
  demPct: number;
  repPct: number;
  margin: number;
};

export function weightedNational(
  rows: { demVotes: number; repVotes: number; turnout: number }[],
): WeightedNational {
  const demVotes = rows.reduce((sum, row) => sum + row.demVotes, 0);
  const repVotes = rows.reduce((sum, row) => sum + row.repVotes, 0);
  const turnout = rows.reduce((sum, row) => sum + row.turnout, 0);
  const demPct = (demVotes / turnout) * 100;
  const repPct = (repVotes / turnout) * 100;
  return { demVotes, repVotes, turnout, demPct, repPct, margin: demPct - repPct };
}

export function formatVotes(count: number): string {
  return count.toLocaleString("en-US");
}

/** Slider value minus the calculated national margin, in points. Positive favors Democrats. */
export function genericDelta(sliderMargin: number): number {
  return Number((sliderMargin - NATIONAL_GENERIC.marginD).toFixed(1));
}

export function scenarioGeneric(sliderMargin: number): {
  marginD: number;
  delta: number;
  dem: number;
  rep: number;
  other: number;
} {
  const delta = genericDelta(sliderMargin);
  const marginD = Number(sliderMargin.toFixed(1));
  if (delta === 0) {
    return {
      marginD,
      delta,
      dem: NATIONAL_GENERIC.dem,
      rep: NATIONAL_GENERIC.rep,
      other: NATIONAL_GENERIC.other,
    };
  }
  return {
    marginD,
    delta,
    dem: Math.round((NATIONAL_GENERIC.dem + delta / 2) * 10) / 10,
    rep: Math.round((NATIONAL_GENERIC.rep - delta / 2) * 10) / 10,
    other: NATIONAL_GENERIC.other,
  };
}

export type SenateProjection = {
  basis: "poll" | "generic";
  /** Positive means the Democrat, or the independent challenger, is ahead. For a generic-ballot estimate, positive means Democrats. */
  margin: number;
  text: string;
};

export function senateProjection(state: StateRecord, delta = 0): SenateProjection | null {
  const race = state.senate;
  if (!race) return null;
  const base = pollMarginPoints(race);
  if (base !== null) {
    const margin = Number((base + delta).toFixed(1));
    return { basis: "poll", margin, text: formatPollMargin(race, margin) };
  }
  const margin = genericMargin(state.trumpMargin2024, delta);
  return { basis: "generic", margin, text: formatMargin(margin) };
}

export function formatMargin(marginD: number, digits = 1): string {
  const rounded = Number(marginD.toFixed(digits));
  if (rounded === 0) return "Even";
  const abs = Math.abs(rounded).toFixed(digits);
  return rounded > 0 ? `D+${abs}` : `R+${abs}`;
}

export function comparisonCopy(state: StateRecord, delta = 0): string {
  const race = state.senate;
  if (!race) {
    return "No U.S. Senate seat is on the November 3 ballot in this state.";
  }
  const quoted = quotedChances(race, delta);
  const leader = [...quoted].sort((a, b) => b.chance - a.chance)[0];
  if (blendsPolls(race) && leader.poll !== null) {
    const shift =
      delta === 0
        ? ""
        : ` The polling half includes the generic-ballot shift of ${delta > 0 ? "+" : ""}${delta.toFixed(1)}.`;
    return `${leader.name} is ${formatChance(leader.chance)} after splitting the Polymarket price, ${formatChance(leader.polymarket)}, with that candidate’s share of the two-candidate polling average, ${formatChance(leader.poll)}.${shift}`;
  }
  return `${leader.name} is ${formatChance(leader.polymarket)} on Polymarket. The polling table does not supply a matching 2026 average, so that price is not averaged with a poll and does not move with the generic-ballot shift.`;
}

export function stateHaystack(state: StateRecord): string {
  const names = state.senate ? namesInRace(state.senate) : [];
  return [state.name, state.abbr, ...names].join(" ").toLowerCase();
}

export function matchesQuery(state: StateRecord, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return stateHaystack(state).includes(q);
}

export const SENATE_RACES = STATES.filter((state) => state.senate).sort(
  (a, b) => closeness(a.senate!) - closeness(b.senate!),
);

const PAPER: [number, number, number] = [239, 230, 212];
const DEM: [number, number, number] = [30, 79, 143];
const REP: [number, number, number] = [143, 45, 45];
export const NEUTRAL_FILL = "#d9d1c3";

export function marginFill(marginD: number): string {
  const t = Math.max(-1, Math.min(1, marginD / 28));
  const target = t >= 0 ? DEM : REP;
  const u = Math.abs(t);
  const rgb = PAPER.map((channel, index) =>
    Math.round(channel + (target[index] - channel) * u),
  );
  return `rgb(${rgb.join(",")})`;
}

export function daysUntilElection(now = new Date()): number {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const election = Date.UTC(2026, 10, 3);
  return Math.round((election - today) / 86_400_000);
}
