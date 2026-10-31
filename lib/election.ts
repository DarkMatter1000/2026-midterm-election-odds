// Snapshot for the November 3, 2026 midterms.
// Generic-ballot averages: Wikipedia's compilation of five public aggregators,
// updated October 30, 2026.
// Senate odds: Call the Map, CTMM 2.2, edition ctm-2.2-20261031-f17cb06f835b,
// published October 31, 2026.
// 2024 presidential margins: certified totals compiled by Wikipedia from the
// Federal Election Commission report.

export const FORECAST_AS_OF = "October 31, 2026";
export const BALLOT_AS_OF = "October 30, 2026";
export const ELECTION_DAY = "2026-11-03";
export const EDITION = "ctm-2.2-20261031-f17cb06f835b";

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

export type Rating =
  | "Toss-up"
  | "Tilt D"
  | "Tilt R"
  | "Lean D"
  | "Lean R"
  | "Likely D"
  | "Likely R"
  | "Solid D"
  | "Solid R";

export type Candidate = {
  name: string;
  party: "D" | "R" | "I";
  win: number;
};

export type SenateRace = {
  rating: Rating;
  /** Democratic margin in points. Negative means the Republican leads. */
  marginD: number;
  dem: Candidate | null;
  rep: Candidate;
  ind?: Candidate;
  caveat?: string;
};

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

const race = (
  rating: Rating,
  marginD: number,
  dem: [string, number] | null,
  rep: [string, number],
  caveat?: string,
  ind?: [string, number],
): SenateRace => ({
  rating,
  marginD,
  dem: dem ? { name: dem[0], party: "D", win: dem[1] } : null,
  rep: { name: rep[0], party: "R", win: rep[1] },
  ind: ind ? { name: ind[0], party: "I", win: ind[1] } : undefined,
  caveat,
});

export const STATES: StateRecord[] = [
  { abbr: "AL", name: "Alabama", trumpMargin2024: 30.47, senate: race("Solid R", -18.5, ["Everett Wess", 1], ["Barry Moore", 99]) },
  {
    abbr: "AK",
    name: "Alaska",
    trumpMargin2024: 13.13,
    senate: race(
      "Toss-up",
      1.0,
      ["Mary Peltola", 52],
      ["Dan S. Sullivan", 48],
      "Alaska uses ranked-choice voting. 52 in 100 is Peltola’s chance after transfers.",
    ),
  },
  { abbr: "AZ", name: "Arizona", trumpMargin2024: 5.53, senate: null },
  { abbr: "AR", name: "Arkansas", trumpMargin2024: 30.64, senate: race("Likely R", -12.1, ["Hallie Shoffner", 5], ["Tom Cotton", 95]) },
  { abbr: "CA", name: "California", trumpMargin2024: -20.14, senate: null },
  { abbr: "CO", name: "Colorado", trumpMargin2024: -10.99, senate: race("Solid D", 26.6, ["John Hickenlooper", 99], ["Mark Baisley", 1]) },
  { abbr: "CT", name: "Connecticut", trumpMargin2024: -14.51, senate: null },
  { abbr: "DE", name: "Delaware", trumpMargin2024: -14.7, senate: race("Solid D", 32.7, ["Chris Coons", 99.6], ["Michael Katz", 0.4]) },
  { abbr: "FL", name: "Florida", trumpMargin2024: 13.1, senate: race("Likely R", -8.5, ["Angie Nixon", 7], ["Ashley Moody", 93]) },
  {
    abbr: "GA",
    name: "Georgia",
    trumpMargin2024: 2.2,
    senate: race(
      "Likely D",
      8.8,
      ["Jon Ossoff", 93],
      ["Mike Collins", 7],
      "93 in 100 is Ossoff’s chance to finish ahead on November 3. If nobody passes 50 percent, a runoff is December 1. This forecast does not call the runoff.",
    ),
  },
  { abbr: "HI", name: "Hawaii", trumpMargin2024: -23.11, senate: null },
  { abbr: "ID", name: "Idaho", trumpMargin2024: 36.49, senate: race("Likely R", -9.6, ["Todd Achilles", 8], ["Jim Risch", 92]) },
  { abbr: "IL", name: "Illinois", trumpMargin2024: -10.9, senate: race("Likely D", 14.8, ["Juliana Stratton", 97], ["Don Tracy", 3]) },
  { abbr: "IN", name: "Indiana", trumpMargin2024: 18.96, senate: null },
  { abbr: "IA", name: "Iowa", trumpMargin2024: 13.21, senate: race("Tilt R", -1.0, ["Josh Turek", 43], ["Ashley Hinson", 57]) },
  { abbr: "KS", name: "Kansas", trumpMargin2024: 16.12, senate: race("Toss-up", 0.3, ["Adam Hamilton", 52], ["Roger Marshall", 48]) },
  { abbr: "KY", name: "Kentucky", trumpMargin2024: 30.53, senate: race("Likely R", -13.9, ["Charles Booker", 7], ["Andy Barr", 93]) },
  { abbr: "LA", name: "Louisiana", trumpMargin2024: 22.01, senate: race("Likely R", -15.3, ["Jamie Davis", 5], ["Julia Letlow", 95]) },
  {
    abbr: "ME",
    name: "Maine",
    trumpMargin2024: -6.94,
    senate: race(
      "Tilt D",
      0.8,
      ["Troy Jackson", 56],
      ["Susan Collins", 44],
      "Maine uses ranked-choice voting. 56 in 100 is Jackson’s chance in the final round.",
    ),
  },
  { abbr: "MD", name: "Maryland", trumpMargin2024: -28.54, senate: null },
  { abbr: "MA", name: "Massachusetts", trumpMargin2024: -25.2, senate: race("Solid D", 30.7, ["Ed Markey", 99.6], ["John Deaton", 0.4]) },
  { abbr: "MI", name: "Michigan", trumpMargin2024: 1.42, senate: race("Tilt D", 1.9, ["Abdul El-Sayed", 63], ["Mike Rogers", 37]) },
  { abbr: "MN", name: "Minnesota", trumpMargin2024: -4.24, senate: race("Lean D", 3.5, ["Peggy Flanagan", 74], ["Michele Tafoya", 26]) },
  { abbr: "MS", name: "Mississippi", trumpMargin2024: 22.89, senate: race("Likely R", -9.0, ["Scott Colom", 15], ["Cindy Hyde-Smith", 85]) },
  { abbr: "MO", name: "Missouri", trumpMargin2024: 18.41, senate: null },
  { abbr: "MT", name: "Montana", trumpMargin2024: 19.93, senate: race("Likely R", -16.6, ["Seth Bodnar", 6], ["Kurt Alme", 94]) },
  {
    abbr: "NE",
    name: "Nebraska",
    trumpMargin2024: 20.46,
    senate: race(
      "Lean R",
      -2.6,
      null,
      ["Pete Ricketts", 68],
      "Dan Osborn is an independent, not a Democratic nominee.",
      ["Dan Osborn", 32],
    ),
  },
  { abbr: "NV", name: "Nevada", trumpMargin2024: 3.1, senate: null },
  { abbr: "NH", name: "New Hampshire", trumpMargin2024: -2.78, senate: race("Lean D", 5.0, ["Chris Pappas", 81], ["John Sununu", 19]) },
  { abbr: "NJ", name: "New Jersey", trumpMargin2024: -5.91, senate: race("Solid D", 24.7, ["Cory Booker", 99], ["Justin Murphy", 1]) },
  { abbr: "NM", name: "New Mexico", trumpMargin2024: -6.0, senate: race("Solid D", 17.6, ["Ben Ray Luján", 99], ["Larry Marker", 1]) },
  { abbr: "NY", name: "New York", trumpMargin2024: -12.6, senate: null },
  { abbr: "NC", name: "North Carolina", trumpMargin2024: 3.21, senate: race("Likely D", 8.7, ["Roy Cooper", 93], ["Michael Whatley", 7]) },
  { abbr: "ND", name: "North Dakota", trumpMargin2024: 36.45, senate: null },
  { abbr: "OH", name: "Ohio", trumpMargin2024: 11.21, senate: race("Tilt D", 1.7, ["Sherrod Brown", 62], ["Jon Husted", 38]) },
  { abbr: "OK", name: "Oklahoma", trumpMargin2024: 34.26, senate: race("Solid R", -22.5, ["N'Kiyla Thomas", 1], ["Kevin Hern", 99]) },
  { abbr: "OR", name: "Oregon", trumpMargin2024: -14.3, senate: race("Solid D", 29.8, ["Jeff Merkley", 99.6], ["David Brock Smith", 0.4]) },
  { abbr: "PA", name: "Pennsylvania", trumpMargin2024: 1.71, senate: null },
  { abbr: "RI", name: "Rhode Island", trumpMargin2024: -13.78, senate: race("Solid D", 30.3, ["Jack Reed", 99.6], ["Raymond McKay", 0.4]) },
  {
    abbr: "SC",
    name: "South Carolina",
    trumpMargin2024: 17.87,
    senate: race(
      "Lean R",
      -4.0,
      ["Annie Andrews", 24],
      ["Darline Graham", 76],
      "Lindsey Graham died on July 11, 2026, after winning the Republican nomination. Darline Graham is the Republican on the November ballot.",
    ),
  },
  { abbr: "SD", name: "South Dakota", trumpMargin2024: 29.19, senate: race("Solid R", -15.0, ["Brian Bengs", 1], ["Mike Rounds", 99]) },
  { abbr: "TN", name: "Tennessee", trumpMargin2024: 29.72, senate: race("Solid R", -26.2, ["Marquita Bradshaw", 0.4], ["Bill Hagerty", 99.6]) },
  { abbr: "TX", name: "Texas", trumpMargin2024: 13.68, senate: race("Tilt D", 1.1, ["James Talafreako", 58], ["Ken Paxton", 42]) },
  { abbr: "UT", name: "Utah", trumpMargin2024: 21.59, senate: null },
  { abbr: "VT", name: "Vermont", trumpMargin2024: -31.51, senate: null },
  { abbr: "VA", name: "Virginia", trumpMargin2024: -5.78, senate: race("Solid D", 23.1, ["Mark Warner", 99], ["Bert Mizusawa", 1]) },
  { abbr: "WA", name: "Washington", trumpMargin2024: -18.22, senate: null },
  { abbr: "WV", name: "West Virginia", trumpMargin2024: 41.87, senate: race("Solid R", -34.6, ["Rachel Fetty Anderson", 0.4], ["Shelley Moore Capito", 99.6]) },
  { abbr: "WI", name: "Wisconsin", trumpMargin2024: 0.86, senate: null },
  { abbr: "WY", name: "Wyoming", trumpMargin2024: 45.76, senate: race("Solid R", -32.4, ["James Byrd", 0.4], ["Harriet Hageman", 99.6]) },
];

const byAbbr = new Map(STATES.map((state) => [state.abbr, state]));

export function getState(abbr: string): StateRecord | undefined {
  return byAbbr.get(abbr);
}

export function genericMargin(trumpMargin2024: number): number {
  return Number((-trumpMargin2024 + EVEN_SWING).toFixed(1));
}

export function formatMargin(marginD: number, digits = 1): string {
  const rounded = Number(marginD.toFixed(digits));
  if (rounded === 0) return "Even";
  const abs = Math.abs(rounded).toFixed(digits);
  return rounded > 0 ? `D+${abs}` : `R+${abs}`;
}

export function formatIn100(win: number): string {
  if (win >= 99.5) return ">99 in 100";
  if (win < 0.5) return "<1 in 100";
  return `${Math.round(win)} in 100`;
}

export function senateSlug(name: string): string {
  return name.toLowerCase().replace(/ /g, "-");
}

export function senateUrl(state: StateRecord): string | null {
  if (!state.senate) return null;
  return `https://www.callthemap.com/senate/${senateSlug(state.name)}`;
}

export function comparisonCopy(state: StateRecord): string {
  const race = state.senate;
  if (!race) {
    return "No U.S. Senate seat is on the November 3 ballot in this state.";
  }
  const generic = genericMargin(state.trumpMargin2024);
  if (race.ind) {
    return `${race.ind.name} is an independent, not a Democratic nominee, so this is not a Democrat-versus-Republican generic ballot. ${race.rep.name} leads by ${Math.abs(race.marginD).toFixed(1)} points.`;
  }
  if (race.rating.startsWith("Solid")) {
    return `This seat is not competitive. The forecast margin is ${formatMargin(race.marginD)}, against a generic-ballot estimate of ${formatMargin(generic)}.`;
  }
  const gap = Number((race.marginD - generic).toFixed(1));
  if (Math.abs(gap) < 1) {
    return "The Senate forecast sits within a point of the generic-ballot estimate.";
  }
  const who = gap > 0 ? race.dem!.name : race.rep.name;
  return `${who} is ${Math.abs(gap).toFixed(1)} points ahead of the generic-ballot estimate.`;
}

export function stateHaystack(state: StateRecord): string {
  const race = state.senate;
  return [
    state.name,
    state.abbr,
    race?.rating,
    race?.dem?.name,
    race?.rep.name,
    race?.ind?.name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function matchesQuery(state: StateRecord, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return stateHaystack(state).includes(q);
}

export const SENATE_RACES = STATES.filter((state) => state.senate).sort(
  (a, b) => Math.abs(a.senate!.marginD) - Math.abs(b.senate!.marginD),
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
