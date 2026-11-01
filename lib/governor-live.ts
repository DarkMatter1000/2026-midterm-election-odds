// Governor snapshot fetched October 31, 2026.
// Polymarket Yes prices are outcomePrices from the Gamma API at 6:54 p.m. CT
// (2026-10-31T23:54:12Z), rounded half up to one decimal percent.
// Polling averages are the figures FiftyPlusOne published on its 2026 averages
// page (https://fiftyplusone.news/averages) the same day. Shares use the
// Polymarket contract name when FiftyPlusOne’s record adds a middle name,
// so the blend matches the person on the contract.
// Electoral-Vote.com publishes a 2026 governor candidate list
// (https://www.electoral-vote.com/evp2026/Governor/governor_races.html)
// and does not publish a governor polling average. Those notes are not used
// as polls. The Texas governor is Greg Abbott. The Texas Senate Democrat
// stays James Talafreako in the Senate file.

import { genericMargin, formatMargin, type SenateProjection } from "@/lib/election";
import {
  formatPollMargin,
  pollMarginPoints,
  type MarketCandidate,
  type PollSource,
  type SenateRace,
  type Share,
} from "@/lib/senate-live";

export const GOVERNOR_POLYMARKET_AS_OF = "October 31, 2026, 6:54 p.m. CT";

const FIFTY = "https://fiftyplusone.news/averages";

function fifty(shares: Share[]): PollSource {
  return {
    source: "FiftyPlusOne",
    url: FIFTY,
    asOf: "Fetched Oct 31, 2026",
    shares,
  };
}

function s(name: string, pct: number): Share {
  return { name, pct };
}

function person(name: string, party: MarketCandidate["party"], price: number): MarketCandidate {
  return { name, party, price };
}

function race(
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

export function governorProjection(
  contest: SenateRace,
  trumpMargin2024: number,
  delta = 0,
): SenateProjection {
  const base = pollMarginPoints(contest);
  if (base !== null) {
    const margin = Number((base + delta).toFixed(1));
    return { basis: "poll", margin, text: formatPollMargin(contest, margin) };
  }
  const margin = genericMargin(trumpMargin2024, delta);
  return { basis: "generic", margin, text: formatMargin(margin) };
}

export const GOVERNORS: Record<string, SenateRace> = {

  AL: race(
    "alabama-governor-winner-2026",
    [person("Tommy Tuberville", "R", 94.2), person("Doug Jones", "D", 5.6)],
    [],
    [], "Neither FiftyPlusOne nor Electoral-Vote.com has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  AK: race(
    "alaska-governor-election-winner",
    [person("Jonathan Kreiss-Tomkins", "D", 88.6), person("Bernadette Wilson", "R", 11.0)],
    [],
    [], "Alaska uses ranked-choice voting. Polymarket is the chance that candidate wins the race. FiftyPlusOne has no 2026 average for this race, and Electoral-Vote.com does not publish a governor polling average. The chance is Polymarket only.",
  ),
  AZ: race(
    "arizona-governor-winner-2026",
    [person("Katie Hobbs", "D", 93.0), person("Andy Biggs", "R", 7.0)],
    ["Katie Hobbs", "Andy Biggs"],
    [fifty([s("Katie Hobbs", 49.7), s("Andy Biggs", 42.8)])],
  ),
  AR: race(
    "arkansas-governor-winner-2026",
    [person("Sarah Huckabee Sanders", "R", 97.1), person("Fredrick Love", "D", 2.3)],
    [],
    [], "Neither FiftyPlusOne nor Electoral-Vote.com has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  CA: race(
    "california-governor-election-2026",
    [person("Xavier Becerra", "D", 98.4), person("Steve Hilton", "R", 1.6)],
    ["Xavier Becerra", "Steve Hilton"],
    [fifty([s("Xavier Becerra", 59.3), s("Steve Hilton", 35.8)])],
  ),
  CO: race(
    "colorado-governor-winner-2026",
    [person("Phil Weiser", "D", 96.6), person("Victor Marx", "R", 3.3)],
    [],
    [], "Neither FiftyPlusOne nor Electoral-Vote.com has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  CT: race(
    "connecticut-governor-winner-2026",
    [person("Ned Lamont", "D", 97.6), person("Ryan Fazio", "R", 2.4)],
    ["Ned Lamont", "Ryan Fazio"],
    [fifty([s("Ned Lamont", 54.9), s("Ryan Fazio", 36.3)])],
  ),
  FL: race(
    "florida-governor-winner-2026",
    [person("Byron Donalds", "R", 65.5), person("David Jolly", "D", 35.0)],
    ["Byron Donalds", "David Jolly"],
    [fifty([s("Byron Donalds", 48.8), s("David Jolly", 44.3)])],
  ),
  GA: race(
    "georgia-governor-winner-2026",
    [person("Keisha Lance Bottoms", "D", 67.5), person("Rick Jackson", "R", 31.5)],
    ["Keisha Lance Bottoms", "Rick Jackson"],
    [fifty([s("Keisha Lance Bottoms", 48.1), s("Rick Jackson", 48.0)])],
  ),
  HI: race(
    "hawaii-governor-winner-2026",
    [person("Josh Green", "D", 98.7), person("Gary Cordery", "R", 1.0)],
    [],
    [], "Neither FiftyPlusOne nor Electoral-Vote.com has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  ID: race(
    "idaho-governor-winner-2026",
    [person("Brad Little", "R", 98.5), person("Terri Pickens", "D", 1.9)],
    [],
    [], "Neither FiftyPlusOne nor Electoral-Vote.com has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  IL: race(
    "illinois-governor-winner-2026",
    [person("JB Pritzker", "D", 98.6), person("Darren Bailey", "R", 1.2)],
    [],
    [], "Neither FiftyPlusOne nor Electoral-Vote.com has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  IA: race(
    "iowa-governor-winner-2026",
    [person("Rob Sand", "D", 86.0), person("Zach Lahn", "R", 13.0)],
    ["Rob Sand", "Zach Lahn"],
    [fifty([s("Rob Sand", 51.0), s("Zach Lahn", 44.1)])],
  ),
  KS: race(
    "kansas-governor-winner-2026",
    [person("Ty Masterson", "R", 72.5), person("Cindy Holscher", "D", 27.5)],
    ["Ty Masterson", "Cindy Holscher"],
    [fifty([s("Ty Masterson", 48.8), s("Cindy Holscher", 46.5)])],
  ),
  ME: race(
    "maine-governor-winner-2026",
    [person("Hannah Pingree", "D", 96.5), person("Robert Charles", "R", 3.9)],
    ["Hannah Pingree", "Robert Charles"],
    [fifty([s("Hannah Pingree", 50.0), s("Robert Charles", 39.0), s("Rick Bennett", 7.2)])], "Maine uses ranked-choice voting. FiftyPlusOne includes Rick Bennett, an independent, and lists the Republican as Bobby Charles. The contract name is Robert Charles. The chance blends Hannah Pingree and Robert Charles. The margin is Pingree’s published percentage minus Charles’s, not a ranked-choice final round.",
  ),
  MD: race(
    "maryland-governor-winner-2026",
    [person("Wes Moore", "D", 98.8), person("Dan Cox", "R", 1.2)],
    [],
    [], "Neither FiftyPlusOne nor Electoral-Vote.com has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  MA: race(
    "massachusetts-governor-winner-2026",
    [person("Maura Healey", "D", 98.4), person("Michael Minogue", "R", 1.7)],
    [],
    [], "Neither FiftyPlusOne nor Electoral-Vote.com has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  MI: race(
    "michigan-governor-winner-2026",
    [person("Jocelyn Benson", "D", 93.9), person("John James", "R", 6.1)],
    ["Jocelyn Benson", "John James"],
    [fifty([s("Jocelyn Benson", 50.7), s("John James", 42.5)])],
  ),
  MN: race(
    "minnesota-governor-winner-2026",
    [person("Amy Klobuchar", "D", 97.8), person("Lisa Demuth", "R", 2.3)],
    ["Amy Klobuchar", "Lisa Demuth"],
    [fifty([s("Amy Klobuchar", 51.6), s("Lisa Demuth", 40.2)])],
  ),
  NE: race(
    "nebraska-governor-winner-2026",
    [person("Jim Pillen", "R", 92.5), person("Lynne Walz", "D", 7.0)],
    ["Jim Pillen", "Lynne Walz"],
    [fifty([s("Jim Pillen", 46.9), s("Lynne Walz", 40.5)])],
  ),
  NV: race(
    "nevada-governor-winner-2026",
    [person("Aaron Ford", "D", 77.5), person("Joe Lombardo", "R", 22.0)],
    ["Aaron Ford", "Joe Lombardo"],
    [fifty([s("Aaron Ford", 46.3), s("Joe Lombardo", 45.6)])],
  ),
  NH: race(
    "new-hampshire-governor-winner-2026",
    [person("Kelly Ayotte", "R", 92.0), person("Cinde Warmington", "D", 7.8)],
    ["Kelly Ayotte", "Cinde Warmington"],
    [fifty([s("Kelly Ayotte", 50.0), s("Cinde Warmington", 41.3)])],
  ),
  NM: race(
    "new-mexico-governor-winner-2026",
    [person("Deb Haaland", "D", 95.5), person("Gregg Hull", "R", 4.3)],
    [],
    [], "Neither FiftyPlusOne nor Electoral-Vote.com has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  NY: race(
    "new-york-governor-winner-2026",
    [person("Kathy Hochul", "D", 97.8), person("Bruce Blakeman", "R", 2.2)],
    ["Kathy Hochul", "Bruce Blakeman"],
    [fifty([s("Kathy Hochul", 54.2), s("Bruce Blakeman", 40.8)])],
  ),
  OH: race(
    "ohio-governor-winner-2026",
    [person("Amy Acton", "D", 79.5), person("Vivek Ramaswamy", "R", 19.5)],
    ["Amy Acton", "Vivek Ramaswamy"],
    [fifty([s("Amy Acton", 48.5), s("Vivek Ramaswamy", 45.7)])],
  ),
  OK: race(
    "oklahoma-governor-winner-2026",
    [person("Mike Mazzei", "R", 91.5), person("Cyndi Munson", "D", 9.0)],
    [],
    [], "Neither FiftyPlusOne nor Electoral-Vote.com has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  OR: race(
    "oregon-governor-winner-2026",
    [person("Tina Kotek", "D", 83.0), person("Christine Drazan", "R", 17.0)],
    [],
    [], "Neither FiftyPlusOne nor Electoral-Vote.com has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  PA: race(
    "pennsylvania-governor-winner-2026",
    [person("Josh Shapiro", "D", 98.6), person("Stacy Garrity", "R", 1.6)],
    ["Josh Shapiro", "Stacy Garrity"],
    [fifty([s("Josh Shapiro", 57.7), s("Stacy Garrity", 34.5)])],
  ),
  RI: race(
    "rhode-island-governor-winner-2026",
    [person("Helena Foulkes", "D", 96.7), person("Republican", "R", 1.5)],
    [],
    [], "Polymarket prices Helena Foulkes by name. The Republican contract and a separate independent contract are not nominees by name. The independent contract is left off this pair. No 2026 polling average from these sources is included, so the chance is Polymarket only.",
  ),
  SC: race(
    "south-carolina-governor-winner-2026",
    [person("Alan Wilson", "R", 94.5), person("Jermaine Johnson", "D", 5.4)],
    [],
    [], "Neither FiftyPlusOne nor Electoral-Vote.com has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  SD: race(
    "south-dakota-governor-winner-2026",
    [person("Larry Rhoden", "R", 97.0), person("Dan Ahlers", "D", 2.3)],
    [],
    [], "Neither FiftyPlusOne nor Electoral-Vote.com has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  TN: race(
    "tennessee-governor-winner-2026",
    [person("Marsha Blackburn", "R", 92.9), person("Jerri Green", "D", 4.6)],
    [],
    [], "Neither FiftyPlusOne nor Electoral-Vote.com has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  TX: race(
    "texas-governor-winner-2026",
    [person("Greg Abbott", "R", 66.0), person("Gina Hinojosa", "D", 34.5)],
    ["Greg Abbott", "Gina Hinojosa"],
    [fifty([s("Greg Abbott", 49.2), s("Gina Hinojosa", 47.0)])],
  ),
  VT: race(
    "vermont-governor-winner-2026",
    [person("Phil Scott", "R", 76.5), person("Amanda Janoo", "D", 23.7)],
    [],
    [], "Neither FiftyPlusOne nor Electoral-Vote.com has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  WI: race(
    "wisconsin-governor-winner-2026",
    [person("David Crowley", "D", 85.0), person("Tom Tiffany", "R", 14.0)],
    ["David Crowley", "Tom Tiffany"],
    [fifty([s("David Crowley", 48.9), s("Tom Tiffany", 44.4)])],
  ),
  WY: race(
    "wyoming-governor-winner-2026",
    [person("Eric Barlow", "R", 98.8), person("Kenneth Casner", "D", 1.0)],
    [],
    [], "Neither FiftyPlusOne nor Electoral-Vote.com has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
};
