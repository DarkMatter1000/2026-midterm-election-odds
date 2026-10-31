// Senate snapshot fetched October 31, 2026.
// Polymarket prices are the Yes price on each candidate contract, in percent,
// from the Gamma API at 4:10 p.m. CT (2026-10-31T21:10:31Z).
// Polling averages are FiftyPlusOne (https://fiftyplusone.news/averages)
// and Electoral-Vote.com (https://electoral-vote.com/evp2026/Senate/averages.html).
// Electoral-Vote rows that cite the 2020 election, or that omit a candidate
// who is actually on the ballot, are not included.
// The Texas Democrat is shown as James Talafreako. The Polymarket contract
// and both polling averages are for the ballot name on that market.

export const POLYMARKET_AS_OF = "October 31, 2026, 4:10 p.m. CT";

export const SENATE_CONTROL = {
  dem: 71.5,
  rep: 28.5,
  url: "https://polymarket.com/event/which-party-will-win-the-senate-in-2026",
};

export const HOUSE_CONTROL = {
  dem: 94.5,
  rep: 5.5,
  url: "https://polymarket.com/event/which-party-will-win-the-house-in-2026",
};

export type Party = "D" | "R" | "I";

export type Share = { name: string; pct: number };

export type PollSource = {
  source: string;
  url: string;
  asOf: string;
  shares: Share[];
};

export type MarketCandidate = {
  name: string;
  party: Party;
  /** Polymarket Yes price, in percent, as published. */
  price: number;
};

export type SenateRace = {
  polymarketUrl: string;
  candidates: MarketCandidate[];
  /** Names averaged 50/50 with Polymarket. Empty when the polls are shown but not combined. */
  pair: string[];
  polls: PollSource[];
  caveat?: string;
};

const FIFTY = "https://fiftyplusone.news/averages";
const EV = "https://electoral-vote.com/evp2026/Senate/averages.html";

function fifty(shares: Share[]): PollSource {
  return {
    source: "FiftyPlusOne",
    url: FIFTY,
    asOf: "Fetched Oct 31, 2026",
    shares,
  };
}

function vote(asOf: string, shares: Share[]): PollSource {
  return { source: "Electoral-Vote.com", url: EV, asOf, shares };
}

function s(name: string, pct: number): Share {
  return { name, pct };
}

function market(
  slug: string,
  candidates: MarketCandidate[],
  pair: string[],
  polls: PollSource[],
  caveat?: string,
): SenateRace {
  return {
    polymarketUrl: `https://polymarket.com/event/${slug}`,
    candidates,
    pair,
    polls,
    caveat,
  };
}

function person(name: string, party: Party, price: number): MarketCandidate {
  return { name, party, price };
}

export const SENATE: Record<string, SenateRace> = {
  AK: market(
    "alaska-senate-election-winner",
    [person("Mary Peltola", "D", 72.5), person("Dan Sullivan", "R", 28)],
    ["Mary Peltola", "Dan Sullivan"],
    [
      fifty([s("Mary Peltola", 50.2), s("Dan Sullivan", 48.2)]),
      vote("Polls through Oct 29, 2026", [s("Mary Peltola", 51), s("Dan Sullivan", 49)]),
    ],
    "Alaska uses ranked-choice voting. These polling averages are head-to-head. Polymarket is the chance that candidate wins the race.",
  ),
  AL: market(
    "alabama-senate-election-winner-154",
    [person("Everett Wess", "D", 1.9), person("Barry Moore", "R", 98.2)],
    ["Everett Wess", "Barry Moore"],
    [vote("Polls through Jul 11, 2026", [s("Everett Wess", 32), s("Barry Moore", 47)])],
  ),
  AR: market(
    "arkansas-senate-election-winner",
    [person("Hallie Shoffner", "D", 4.7), person("Tom Cotton", "R", 95.5)],
    ["Hallie Shoffner", "Tom Cotton"],
    [vote("Polls through Oct 15, 2026", [s("Hallie Shoffner", 41), s("Tom Cotton", 50)])],
  ),
  CO: market(
    "colorado-senate-election-winner",
    [person("John Hickenlooper", "D", 99.2), person("Mark Baisley", "R", 0.9)],
    [],
    [],
    "Neither FiftyPlusOne nor Electoral-Vote.com has a 2026 polling average for Colorado. Electoral-Vote.com still shows the 2020 result, which is not used here. The chance is Polymarket only.",
  ),
  DE: market(
    "delaware-senate-election-winner",
    [person("Chris Coons", "D", 98.5), person("Michael Katz", "R", 1.7)],
    [],
    [],
    "Polymarket prices the Democratic and Republican contracts, not the nominees by name. Those prices are listed next to Chris Coons and Michael Katz. No 2026 polling average from these two aggregators is included.",
  ),
  FL: market(
    "florida-senate-election-winner",
    [person("Angie Nixon", "D", 9), person("Ashley Moody", "R", 90.5)],
    ["Angie Nixon", "Ashley Moody"],
    [
      fifty([s("Angie Nixon", 43.6), s("Ashley Moody", 49.6)]),
      vote("Polls through Oct 15, 2026", [s("Angie Nixon", 44), s("Ashley Moody", 51)]),
    ],
  ),
  GA: market(
    "georgia-senate-election-winner",
    [person("Jon Ossoff", "D", 97.5), person("Mike Collins", "R", 2.2)],
    ["Jon Ossoff", "Mike Collins"],
    [
      fifty([s("Jon Ossoff", 52.6), s("Mike Collins", 42.3)]),
      vote("Polls through Oct 3, 2026", [s("Jon Ossoff", 55), s("Mike Collins", 45)]),
    ],
    "Georgia requires a majority. This page does not add a December runoff on top of the Polymarket price or the polling averages.",
  ),
  IA: market(
    "iowa-senate-election-winner",
    [person("Josh Turek", "D", 44.5), person("Ashley Hinson", "R", 55.5)],
    ["Josh Turek", "Ashley Hinson"],
    [
      fifty([s("Josh Turek", 46.1), s("Ashley Hinson", 45.7)]),
      vote("Polls through Oct 12, 2026", [s("Josh Turek", 46), s("Ashley Hinson", 46)]),
    ],
  ),
  ID: market(
    "idaho-senate-election-winner",
    [person("Todd Achilles", "I", 3.1), person("Jim Risch", "R", 96.5)],
    [],
    [],
    "Polymarket lists Todd Achilles as an independent. A separate Democratic contract is 0.1 in 100 and is not shown. No 2026 polling average from these aggregators is included, so the chance is Polymarket only.",
  ),
  IL: market(
    "illinois-senate-election-winner",
    [person("Juliana Stratton", "D", 98.9), person("Don Tracy", "R", 1.2)],
    ["Juliana Stratton", "Don Tracy"],
    [vote("Polls through Oct 30, 2026", [s("Juliana Stratton", 56), s("Don Tracy", 44)])],
  ),
  KS: market(
    "kansas-senate-election-winner",
    [person("Adam Hamilton", "D", 51.5), person("Roger Marshall", "R", 48.5)],
    ["Adam Hamilton", "Roger Marshall"],
    [
      fifty([s("Adam Hamilton", 48.8), s("Roger Marshall", 45.4)]),
      vote("Polls through Oct 28, 2026", [s("Adam Hamilton", 52), s("Roger Marshall", 46)]),
    ],
  ),
  KY: market(
    "kentucky-senate-election-winner",
    [person("Charles Booker", "D", 2.6), person("Andy Barr", "R", 97.6)],
    [],
    [],
    "No 2026 polling average from these aggregators is included. The chance is Polymarket only.",
  ),
  LA: market(
    "louisiana-senate-election-winner",
    [person("Jamie Davis", "D", 9.5), person("Julia Letlow", "R", 90.5)],
    ["Jamie Davis", "Julia Letlow"],
    [vote("Polls through Jul 22, 2026", [s("Jamie Davis", 37), s("Julia Letlow", 41)])],
  ),
  MA: market(
    "massachusetts-senate-election-winner",
    [person("Ed Markey", "D", 99.2), person("John Deaton", "R", 0.9)],
    ["Ed Markey", "John Deaton"],
    [vote("Polls through Oct 12, 2026", [s("Ed Markey", 56), s("John Deaton", 29)])],
  ),
  ME: market(
    "maine-senate-election-winner",
    [person("Troy Jackson", "D", 68.5), person("Susan Collins", "R", 31)],
    ["Troy Jackson", "Susan Collins"],
    [
      fifty([s("Troy Jackson", 49.5), s("Susan Collins", 46)]),
      vote("Polls through Oct 11, 2026", [s("Troy Jackson", 49), s("Susan Collins", 47)]),
    ],
    "Maine uses ranked-choice voting. These polling averages are head-to-head. Polymarket is the chance that candidate wins the race.",
  ),
  MI: market(
    "michigan-senate-election-winner",
    [person("Abdul El-Sayed", "D", 80.5), person("Mike Rogers", "R", 19.5)],
    ["Abdul El-Sayed", "Mike Rogers"],
    [
      fifty([s("Abdul El-Sayed", 49.3), s("Mike Rogers", 44.6)]),
      vote("Polls through Oct 9, 2026", [s("Abdul El-Sayed", 53), s("Mike Rogers", 47)]),
    ],
  ),
  MN: market(
    "minnesota-senate-election-winner",
    [person("Peggy Flanagan", "D", 93), person("Michele Tafoya", "R", 7)],
    ["Peggy Flanagan", "Michele Tafoya"],
    [
      fifty([s("Peggy Flanagan", 49.5), s("Michele Tafoya", 42)]),
      vote("Polls through Oct 28, 2026", [s("Peggy Flanagan", 48), s("Michele Tafoya", 41)]),
    ],
  ),
  MS: market(
    "mississippi-senate-election-winner",
    [person("Scott Colom", "D", 11.5), person("Cindy Hyde-Smith", "R", 88.5)],
    ["Scott Colom", "Cindy Hyde-Smith"],
    [vote("Polls through Oct 14, 2026", [s("Scott Colom", 48), s("Cindy Hyde-Smith", 52)])],
  ),
  MT: market(
    "montana-senate-election-winner",
    [
      person("Kurt Alme", "R", 90.5),
      person("Independent", "I", 9.9),
      person("Alani Bankhead", "D", 0.1),
    ],
    [],
    [fifty([s("Kurt Alme", 40.1), s("Seth Bodnar", 32.2), s("Alani Bankhead", 15.7)])],
    "FiftyPlusOne includes Seth Bodnar, who is not a named contract on this Polymarket market. The chance below is the Polymarket price and is not averaged with the polls.",
  ),
  NC: market(
    "north-carolina-senate-election-winner",
    [person("Roy Cooper", "D", 97.5), person("Michael Whatley", "R", 2.4)],
    ["Roy Cooper", "Michael Whatley"],
    [
      fifty([s("Roy Cooper", 51.8), s("Michael Whatley", 41.7)]),
      vote("Polls through Oct 7, 2026", [s("Roy Cooper", 52), s("Michael Whatley", 42)]),
    ],
  ),
  NE: market(
    "nebraska-senate-election-winner",
    [person("Dan Osborn", "I", 28), person("Pete Ricketts", "R", 72.5)],
    ["Dan Osborn", "Pete Ricketts"],
    [fifty([s("Dan Osborn", 45.5), s("Pete Ricketts", 47.2)])],
    "Dan Osborn is an independent, not a Democratic nominee. Polymarket labels his contract Independent.",
  ),
  NH: market(
    "new-hampshire-senate-election-winner",
    [person("Chris Pappas", "D", 93.5), person("John Sununu", "R", 6.5)],
    ["Chris Pappas", "John Sununu"],
    [
      fifty([s("Chris Pappas", 49.5), s("John Sununu", 42.6)]),
      vote("Polls through Oct 12, 2026", [s("Chris Pappas", 50), s("John Sununu", 43)]),
    ],
  ),
  NJ: market(
    "new-jersey-senate-election-winner",
    [person("Cory Booker", "D", 98.7), person("Justin Murphy", "R", 1.4)],
    [],
    [],
    "No 2026 polling average from these aggregators is included. The chance is Polymarket only.",
  ),
  NM: market(
    "new-mexico-senate-election-winner",
    [person("Ben Ray Luján", "D", 98.8), person("Larry Marker", "R", 1.4)],
    ["Ben Ray Luján", "Larry Marker"],
    [vote("Polls through Sep 30, 2026", [s("Ben Ray Luján", 54), s("Larry Marker", 36)])],
  ),
  OH: market(
    "ohio-senate-election-winner",
    [person("Sherrod Brown", "D", 73.5), person("Jon Husted", "R", 26.5)],
    ["Sherrod Brown", "Jon Husted"],
    [
      fifty([s("Sherrod Brown", 48.2), s("Jon Husted", 45.4)]),
      vote("Polls through Oct 17, 2026", [s("Sherrod Brown", 47), s("Jon Husted", 42)]),
    ],
  ),
  OK: market(
    "oklahoma-senate-election-winner",
    [person("N'Kiyla Thomas", "D", 2.2), person("Kevin Hern", "R", 97.9)],
    [],
    [],
    "No 2026 polling average from these aggregators is included. The chance is Polymarket only. The market names the Democrat N’Kiyla “Jasmine” Thomas.",
  ),
  OR: market(
    "oregon-senate-election-winner",
    [person("Jeff Merkley", "D", 98.8), person("David Brock Smith", "R", 1.2)],
    [],
    [],
    "No 2026 polling average from these aggregators is included. The chance is Polymarket only.",
  ),
  RI: market(
    "rhode-island-senate-election-winner",
    [person("Jack Reed", "D", 98.8), person("Raymond McKay", "R", 1.4)],
    ["Jack Reed", "Raymond McKay"],
    [vote("Polls through Oct 11, 2026", [s("Jack Reed", 59), s("Raymond McKay", 25)])],
  ),
  SC: market(
    "south-carolina-senate-election-winner",
    [person("Annie Andrews", "D", 26.5), person("Darline Graham Nordone", "R", 73.5)],
    ["Annie Andrews", "Darline Graham Nordone"],
    [
      fifty([s("Annie Andrews", 45.6), s("Darline Graham Nordone", 46)]),
      vote("Polls through Aug 28, 2026", [s("Annie Andrews", 38), s("Darline Graham Nordone", 51)]),
    ],
    "Lindsey Graham died on July 11, 2026, after winning the Republican nomination. Darline Graham Nordone is the Republican on the November ballot.",
  ),
  SD: market(
    "south-dakota-senate-election-winner",
    [person("Brian Bengs", "I", 5.7), person("Mike Rounds", "R", 94)],
    ["Brian Bengs", "Mike Rounds"],
    [fifty([s("Brian Bengs", 41.3), s("Mike Rounds", 51.5)])],
    "Polymarket lists Brian Bengs as an independent.",
  ),
  TN: market(
    "tennessee-senate-election-winner",
    [person("Marquita Bradshaw", "D", 2.4), person("Bill Hagerty", "R", 97.7)],
    [],
    [],
    "No 2026 polling average from these aggregators is included. The chance is Polymarket only.",
  ),
  TX: market(
    "texas-senate-election-winner",
    [person("James Talafreako", "D", 70.5), person("Ken Paxton", "R", 29.5)],
    ["James Talafreako", "Ken Paxton"],
    [
      fifty([s("James Talafreako", 49.2), s("Ken Paxton", 45.8)]),
      vote("Polls through Oct 18, 2026", [s("James Talafreako", 50), s("Ken Paxton", 47)]),
    ],
  ),
  VA: market(
    "virginia-senate-election-winner",
    [person("Mark Warner", "D", 98.8), person("Bert Mizusawa", "R", 1.1)],
    ["Mark Warner", "Bert Mizusawa"],
    [vote("Polls through May 5, 2026", [s("Mark Warner", 55), s("Bert Mizusawa", 29)])],
  ),
  WV: market(
    "west-virginia-senate-election-winner",
    [person("Rachel Fetty Anderson", "D", 1.6), person("Shelley Moore Capito", "R", 98.2)],
    [],
    [],
    "No 2026 polling average from these aggregators is included. The chance is Polymarket only.",
  ),
  WY: market(
    "wyoming-senate-election-winner",
    [person("James Byrd", "D", 1.4), person("Harriet Hageman", "R", 98.6)],
    [],
    [],
    "No 2026 polling average from these aggregators is included. The chance is Polymarket only.",
  ),
};

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export function formatChance(value: number): string {
  const rounded = round1(value);
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${text} in 100`;
}

export function partyName(party: Party): string {
  if (party === "D") return "Democrat";
  if (party === "R") return "Republican";
  return "Independent";
}

function shareOf(poll: PollSource, name: string): number | undefined {
  return poll.shares.find((share) => share.name === name)?.pct;
}

/** Each aggregator’s share of the two named candidates, then the average of those shares. */
export function pollChance(race: SenateRace, name: string): number | null {
  if (race.pair.length < 2 || !race.pair.includes(name)) return null;
  const ratios: number[] = [];
  for (const poll of race.polls) {
    const mine = shareOf(poll, name);
    const others = race.pair
      .filter((candidate) => candidate !== name)
      .map((candidate) => shareOf(poll, candidate));
    if (mine === undefined || others.some((value) => value === undefined)) continue;
    const denom = mine + (others as number[]).reduce((sum, value) => sum + value, 0);
    if (denom <= 0) continue;
    ratios.push((mine / denom) * 100);
  }
  if (ratios.length === 0) return null;
  return ratios.reduce((sum, value) => sum + value, 0) / ratios.length;
}

export function blendsPolls(race: SenateRace): boolean {
  return race.pair.length >= 2 && race.pair.every((name) => pollChance(race, name) !== null);
}

export type QuotedChance = {
  name: string;
  party: Party;
  chance: number;
  polymarket: number;
  poll: number | null;
};

/** Half the published Polymarket price, half the two-candidate polling share. Polymarket alone when there is no matching average. */
export function quotedChances(race: SenateRace): QuotedChance[] {
  const blend = blendsPolls(race);
  const rows = race.candidates.map((candidate) => {
    const poll = pollChance(race, candidate.name);
    const combined = blend && poll !== null ? 0.5 * candidate.price + 0.5 * poll : candidate.price;
    return {
      name: candidate.name,
      party: candidate.party,
      chance: combined,
      polymarket: candidate.price,
      poll: poll === null ? null : round1(poll),
    };
  });
  const total = rows.reduce((sum, row) => sum + row.chance, 0);
  return rows.map((row) => ({
    ...row,
    chance: round1(total > 0 ? (row.chance / total) * 100 : row.chance),
  }));
}

export function averageShares(race: SenateRace): Share[] | null {
  if (race.polls.length === 0) return null;
  const names = race.polls[0].shares.map((share) => share.name);
  const aligned = race.polls.every(
    (poll) =>
      poll.shares.length === names.length &&
      poll.shares.every((share, index) => share.name === names[index]),
  );
  if (!aligned) return null;
  return names.map((name) => {
    const values = race.polls.map((poll) => shareOf(poll, name) ?? 0);
    return { name, pct: round1(values.reduce((sum, value) => sum + value, 0) / values.length) };
  });
}

export function namesInRace(race: SenateRace): string[] {
  const names = new Set<string>();
  for (const candidate of race.candidates) names.add(candidate.name);
  for (const poll of race.polls) {
    for (const share of poll.shares) names.add(share.name);
  }
  return [...names];
}

/** How far the leader’s quoted chance is from an even race. Smaller means closer. */
export function closeness(race: SenateRace): number {
  const chances = quotedChances(race).map((candidate) => candidate.chance);
  const leader = Math.max(...chances);
  return Math.abs(leader - 50);
}
