// Governor snapshot fetched October 31, 2026.
// Polymarket Yes prices are outcomePrices from the Gamma API at 6:54 p.m. CT
// (2026-10-31T23:54:12Z), rounded half up to one decimal percent.
// Polling averages are FiftyPlusOne (https://fiftyplusone.news/averages),
// 270toWin state governor pages, and RealClearPolling where that site
// publishes an RCP Average. Shares use the Polymarket contract name when
// an aggregator adds a middle name, so the blend matches the person on
// the contract. 270toWin and RealClearPolling were fetched November 1, 2026.
// Electoral-Vote.com publishes a 2026 governor candidate list
// (https://www.electoral-vote.com/evp2026/Governor/governor_races.html)
// and does not publish a governor polling average. Those notes are not used
// as polls. The chance is still half the Polymarket Yes price and half the
// average of those two-candidate shares. The Texas governor is Greg Abbott.
// The Texas Senate Democrat stays James Talafreako in the Senate file.

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

function twowin(slug: string, shares: Share[]): PollSource {
  return {
    source: "270toWin",
    url: `https://www.270towin.com/2026-governor-polls/${slug}`,
    asOf: "Fetched Nov 1, 2026",
    shares,
  };
}

function rcp(url: string, asOf: string, shares: Share[]): PollSource {
  return { source: "RealClearPolling", url, asOf, shares };
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
    ["Doug Jones", "Tommy Tuberville"],
    [twowin("alabama", [s("Doug Jones", 40.3), s("Tommy Tuberville", 50.0)])],
  ),
  AK: race(
    "alaska-governor-election-winner",
    [person("Jonathan Kreiss-Tomkins", "D", 88.6), person("Bernadette Wilson", "R", 11.0)],
    [],
    [], "Alaska uses ranked-choice voting. Polymarket is the chance that candidate wins the race. FiftyPlusOne, 270toWin, and RealClearPolling have no 2026 average for this race, and Electoral-Vote.com does not publish a governor polling average. The chance is Polymarket only.",
  ),
  AZ: race(
    "arizona-governor-winner-2026",
    [person("Katie Hobbs", "D", 93.0), person("Andy Biggs", "R", 7.0)],
    ["Katie Hobbs", "Andy Biggs"],
    [
      fifty([s("Katie Hobbs", 49.7), s("Andy Biggs", 42.8)]),
      twowin("arizona", [s("Katie Hobbs", 49.8), s("Andy Biggs", 41.0)]),
    ],
  ),
  AR: race(
    "arkansas-governor-winner-2026",
    [person("Sarah Huckabee Sanders", "R", 97.1), person("Fredrick Love", "D", 2.3)],
    [],
    [], "Neither FiftyPlusOne, 270toWin, nor RealClearPolling has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  CA: race(
    "california-governor-election-2026",
    [person("Xavier Becerra", "D", 98.4), person("Steve Hilton", "R", 1.6)],
    ["Xavier Becerra", "Steve Hilton"],
    [
      fifty([s("Xavier Becerra", 59.3), s("Steve Hilton", 35.8)]),
      twowin("california", [s("Xavier Becerra", 59.8), s("Steve Hilton", 36.2)]),
    ],
  ),
  CO: race(
    "colorado-governor-winner-2026",
    [person("Phil Weiser", "D", 96.6), person("Victor Marx", "R", 3.3)],
    [],
    [], "Neither FiftyPlusOne, 270toWin, nor RealClearPolling has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  CT: race(
    "connecticut-governor-winner-2026",
    [person("Ned Lamont", "D", 97.6), person("Ryan Fazio", "R", 2.4)],
    ["Ned Lamont", "Ryan Fazio"],
    [
      fifty([s("Ned Lamont", 54.9), s("Ryan Fazio", 36.3)]),
      twowin("connecticut", [s("Ned Lamont", 56.6), s("Ryan Fazio", 36.4)]),
    ],
  ),
  FL: race(
    "florida-governor-winner-2026",
    [person("Byron Donalds", "R", 65.5), person("David Jolly", "D", 35.0)],
    ["Byron Donalds", "David Jolly"],
    [
      fifty([s("Byron Donalds", 48.8), s("David Jolly", 44.3)]),
      twowin("florida", [s("Byron Donalds", 49.7), s("David Jolly", 45.3)]),
      rcp(
        "https://www.realclearpolling.com/elections/governor/2026/florida",
        "Polls Sep 24 – Oct 20, 2026",
        [s("Byron Donalds", 48.6), s("David Jolly", 43.0)],
      ),
    ],
  ),
  GA: race(
    "georgia-governor-winner-2026",
    [person("Keisha Lance Bottoms", "D", 67.5), person("Rick Jackson", "R", 31.5)],
    ["Keisha Lance Bottoms", "Rick Jackson"],
    [
      fifty([s("Keisha Lance Bottoms", 48.1), s("Rick Jackson", 48.0)]),
      twowin("georgia", [s("Keisha Lance Bottoms", 47.6), s("Rick Jackson", 48.8)]),
      rcp(
        "https://www.realclearpolling.com/elections/governor/2026/toss-ups",
        "Polls Sep 15 – Oct 17, 2026",
        [s("Keisha Lance Bottoms", 46.6), s("Rick Jackson", 47.8)],
      ),
    ],
  ),
  HI: race(
    "hawaii-governor-winner-2026",
    [person("Josh Green", "D", 98.7), person("Gary Cordery", "R", 1.0)],
    [],
    [], "Neither FiftyPlusOne, 270toWin, nor RealClearPolling has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  ID: race(
    "idaho-governor-winner-2026",
    [person("Brad Little", "R", 98.5), person("Terri Pickens", "D", 1.9)],
    [],
    [], "Neither FiftyPlusOne, 270toWin, nor RealClearPolling has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  IL: race(
    "illinois-governor-winner-2026",
    [person("JB Pritzker", "D", 98.6), person("Darren Bailey", "R", 1.2)],
    ["JB Pritzker", "Darren Bailey"],
    [twowin("illinois", [s("JB Pritzker", 56.5), s("Darren Bailey", 37.5)])],
  ),
  IA: race(
    "iowa-governor-winner-2026",
    [person("Rob Sand", "D", 86.0), person("Zach Lahn", "R", 13.0)],
    ["Rob Sand", "Zach Lahn"],
    [
      fifty([s("Rob Sand", 51.0), s("Zach Lahn", 44.1)]),
      twowin("iowa", [s("Rob Sand", 51.0), s("Zach Lahn", 44.8)]),
      rcp(
        "https://www.realclearpolling.com/elections/governor/2026/toss-ups",
        "Polls Oct 5 – Oct 19, 2026",
        [s("Rob Sand", 50.6), s("Zach Lahn", 44.4)],
      ),
    ],
  ),
  KS: race(
    "kansas-governor-winner-2026",
    [person("Ty Masterson", "R", 72.5), person("Cindy Holscher", "D", 27.5)],
    ["Ty Masterson", "Cindy Holscher"],
    [
      fifty([s("Ty Masterson", 48.8), s("Cindy Holscher", 46.5)]),
      twowin("kansas", [s("Ty Masterson", 48.2), s("Cindy Holscher", 46.0)]),
    ],
  ),
  ME: race(
    "maine-governor-winner-2026",
    [person("Hannah Pingree", "D", 96.5), person("Robert Charles", "R", 3.9)],
    ["Hannah Pingree", "Robert Charles"],
    [
      fifty([s("Hannah Pingree", 50.0), s("Robert Charles", 39.0), s("Rick Bennett", 7.2)]),
      twowin("maine", [s("Hannah Pingree", 48.4), s("Robert Charles", 39.2), s("Rick Bennett", 7.4)]),
    ],
    "Maine uses ranked-choice voting. FiftyPlusOne includes Rick Bennett, an independent, and lists the Republican as Bobby Charles. The contract name is Robert Charles. The chance blends Hannah Pingree and Robert Charles. The margin is Pingree’s published percentage minus Charles’s, not a ranked-choice final round.",
  ),
  MD: race(
    "maryland-governor-winner-2026",
    [person("Wes Moore", "D", 98.8), person("Dan Cox", "R", 1.2)],
    [],
    [], "Neither FiftyPlusOne, 270toWin, nor RealClearPolling has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  MA: race(
    "massachusetts-governor-winner-2026",
    [person("Maura Healey", "D", 98.4), person("Michael Minogue", "R", 1.7)],
    ["Maura Healey", "Michael Minogue"],
    [twowin("massachusetts", [s("Maura Healey", 56.8), s("Michael Minogue", 32.3)])],
  ),
  MI: race(
    "michigan-governor-winner-2026",
    [person("Jocelyn Benson", "D", 93.9), person("John James", "R", 6.1)],
    ["Jocelyn Benson", "John James"],
    [
      fifty([s("Jocelyn Benson", 50.7), s("John James", 42.5)]),
      twowin("michigan", [s("Jocelyn Benson", 51.6), s("John James", 43.2)]),
      rcp(
        "https://www.realclearpolling.com/elections/governor/2026/michigan",
        "Polls Sep 24 – Oct 18, 2026",
        [s("Jocelyn Benson", 49.8), s("John James", 43.5)],
      ),
    ],
  ),
  MN: race(
    "minnesota-governor-winner-2026",
    [person("Amy Klobuchar", "D", 97.8), person("Lisa Demuth", "R", 2.3)],
    ["Amy Klobuchar", "Lisa Demuth"],
    [
      fifty([s("Amy Klobuchar", 51.6), s("Lisa Demuth", 40.2)]),
      twowin("minnesota", [s("Amy Klobuchar", 50.8), s("Lisa Demuth", 40.2)]),
    ],
  ),
  NE: race(
    "nebraska-governor-winner-2026",
    [person("Jim Pillen", "R", 92.5), person("Lynne Walz", "D", 7.0)],
    ["Jim Pillen", "Lynne Walz"],
    [
      fifty([s("Jim Pillen", 46.9), s("Lynne Walz", 40.5)]),
      twowin("nebraska", [s("Jim Pillen", 46.2), s("Lynne Walz", 40.2)]),
    ],
  ),
  NV: race(
    "nevada-governor-winner-2026",
    [person("Aaron Ford", "D", 77.5), person("Joe Lombardo", "R", 22.0)],
    ["Aaron Ford", "Joe Lombardo"],
    [
      fifty([s("Aaron Ford", 46.3), s("Joe Lombardo", 45.6)]),
      rcp(
        "https://www.realclearpolling.com/polls/governor/general/2026/nevada/lombardo-vs-ford",
        "Polls Sep 5 – Sep 26, 2026",
        [s("Aaron Ford", 42.0), s("Joe Lombardo", 42.0)],
      ),
    ],
  ),
  NH: race(
    "new-hampshire-governor-winner-2026",
    [person("Kelly Ayotte", "R", 92.0), person("Cinde Warmington", "D", 7.8)],
    ["Kelly Ayotte", "Cinde Warmington"],
    [
      fifty([s("Kelly Ayotte", 50.0), s("Cinde Warmington", 41.3)]),
      twowin("new-hampshire", [s("Kelly Ayotte", 50.3), s("Cinde Warmington", 40.5)]),
    ],
  ),
  NM: race(
    "new-mexico-governor-winner-2026",
    [person("Deb Haaland", "D", 95.5), person("Gregg Hull", "R", 4.3)],
    ["Deb Haaland", "Gregg Hull"],
    [twowin("new-mexico", [s("Deb Haaland", 48.0), s("Gregg Hull", 41.5)])],
  ),
  NY: race(
    "new-york-governor-winner-2026",
    [person("Kathy Hochul", "D", 97.8), person("Bruce Blakeman", "R", 2.2)],
    ["Kathy Hochul", "Bruce Blakeman"],
    [
      fifty([s("Kathy Hochul", 54.2), s("Bruce Blakeman", 40.8)]),
      twowin("new-york", [s("Kathy Hochul", 53.4), s("Bruce Blakeman", 38.8)]),
    ],
  ),
  OH: race(
    "ohio-governor-winner-2026",
    [person("Amy Acton", "D", 79.5), person("Vivek Ramaswamy", "R", 19.5)],
    ["Amy Acton", "Vivek Ramaswamy"],
    [
      fifty([s("Amy Acton", 48.5), s("Vivek Ramaswamy", 45.7)]),
      twowin("ohio", [s("Amy Acton", 48.2), s("Vivek Ramaswamy", 46.2)]),
      rcp(
        "https://www.realclearpolling.com/elections/governor/2026/toss-ups",
        "Polls Sep 29 – Oct 19, 2026",
        [s("Amy Acton", 48.7), s("Vivek Ramaswamy", 44.3)],
      ),
    ],
  ),
  OK: race(
    "oklahoma-governor-winner-2026",
    [person("Mike Mazzei", "R", 91.5), person("Cyndi Munson", "D", 9.0)],
    [],
    [], "Neither FiftyPlusOne, 270toWin, nor RealClearPolling has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  OR: race(
    "oregon-governor-winner-2026",
    [person("Tina Kotek", "D", 83.0), person("Christine Drazan", "R", 17.0)],
    [],
    [], "Neither FiftyPlusOne, 270toWin, nor RealClearPolling has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  PA: race(
    "pennsylvania-governor-winner-2026",
    [person("Josh Shapiro", "D", 98.6), person("Stacy Garrity", "R", 1.6)],
    ["Josh Shapiro", "Stacy Garrity"],
    [
      fifty([s("Josh Shapiro", 57.7), s("Stacy Garrity", 34.5)]),
      twowin("pennsylvania", [s("Josh Shapiro", 56.8), s("Stacy Garrity", 33.6)]),
    ],
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
    ["Jermaine Johnson", "Alan Wilson"],
    [twowin("south-carolina", [s("Jermaine Johnson", 38.7), s("Alan Wilson", 48.0)])],
  ),
  SD: race(
    "south-dakota-governor-winner-2026",
    [person("Larry Rhoden", "R", 97.0), person("Dan Ahlers", "D", 2.3)],
    ["Dan Ahlers", "Larry Rhoden"],
    [twowin("south-dakota", [s("Dan Ahlers", 37.0), s("Larry Rhoden", 56.0)])],
  ),
  TN: race(
    "tennessee-governor-winner-2026",
    [person("Marsha Blackburn", "R", 92.9), person("Jerri Green", "D", 4.6)],
    [],
    [], "Neither FiftyPlusOne, 270toWin, nor RealClearPolling has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  TX: race(
    "texas-governor-winner-2026",
    [person("Greg Abbott", "R", 66.0), person("Gina Hinojosa", "D", 34.5)],
    ["Greg Abbott", "Gina Hinojosa"],
    [
      fifty([s("Greg Abbott", 49.2), s("Gina Hinojosa", 47.0)]),
      twowin("texas", [s("Greg Abbott", 49.6), s("Gina Hinojosa", 46.8)]),
      rcp(
        "https://www.realclearpolling.com/polls/governor/general/2026/texas/abbott-vs-hinojosa",
        "Polls Oct 5 – Oct 21, 2026",
        [s("Greg Abbott", 49.6), s("Gina Hinojosa", 46.4)],
      ),
    ],
  ),
  VT: race(
    "vermont-governor-winner-2026",
    [person("Phil Scott", "R", 76.5), person("Amanda Janoo", "D", 23.7)],
    [],
    [], "Neither FiftyPlusOne, 270toWin, nor RealClearPolling has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
  WI: race(
    "wisconsin-governor-winner-2026",
    [person("David Crowley", "D", 85.0), person("Tom Tiffany", "R", 14.0)],
    ["David Crowley", "Tom Tiffany"],
    [
      fifty([s("David Crowley", 48.9), s("Tom Tiffany", 44.4)]),
      twowin("wisconsin", [s("David Crowley", 48.7), s("Tom Tiffany", 43.3)]),
      rcp(
        "https://www.realclearpolling.com/elections/governor/2026/toss-ups",
        "Polls Jul 20 – Sep 23, 2026",
        [s("David Crowley", 47.5), s("Tom Tiffany", 44.0)],
      ),
    ],
  ),
  WY: race(
    "wyoming-governor-winner-2026",
    [person("Eric Barlow", "R", 98.8), person("Kenneth Casner", "D", 1.0)],
    [],
    [], "Neither FiftyPlusOne, 270toWin, nor RealClearPolling has a 2026 polling average for this race. Electoral-Vote.com’s governor page is a candidate list, not an average. The chance is Polymarket only.",
  ),
};
