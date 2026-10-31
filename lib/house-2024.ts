// 2024 U.S. House statewide popular vote, Democratic and Republican shares,
// and the total ballots counted for House candidates.
// Shares are taken from each state's Wikipedia House election page (statewide
// table when that page prints one, otherwise the election infobox). Percentages
// and the Democratic minus Republican margin are rounded half up to one decimal.
// `votes` is every ballot counted for a House candidate in that state, including
// candidates who were not Democratic or Republican. It is not the presidential
// popular vote, and it leaves out blank, void, and over/under votes. Where the
// page prints a statewide total that matches the sum of those candidate columns,
// that integer is used. Where it does not, the integer is the sum of the
// general-election totals on the same page. At-large states are that one race.
// Alaska is the first-round total, not the ranked-choice final round.
// Oklahoma's 3rd district was unopposed and was not printed on the ballot, so
// those votes were not cast.

export type HouseVote = {
  dem: number;
  rep: number;
  /** Democratic percentage minus Republican percentage, in points. */
  marginD: number;
  /** Ballots counted for U.S. House candidates, all parties and write-ins. */
  votes: number;
  url: string;
  note?: string;
};

export const HOUSE_2024: Record<string, HouseVote> = {
  AL: { votes: 2_048_663, dem: 25.3, rep: 73.7, marginD: -48.4, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Alabama" },
  AK: { votes: 329_555, dem: 46.4, rep: 48.4, marginD: -2.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_election_in_Alaska", note: "First-round popular vote. Alaska uses ranked-choice voting; the final-round tally is not the popular vote." },
  AZ: { votes: 3_253_920, dem: 47.7, rep: 51.7, marginD: -4.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Arizona" },
  AR: { votes: 1_144_800, dem: 31.3, rep: 66.8, marginD: -35.5, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Arkansas" },
  CA: { votes: 15_111_243, dem: 60.5, rep: 39.2, marginD: 21.3, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_California" },
  CO: { votes: 3_073_391, dem: 54.3, rep: 42.5, marginD: 11.8, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Colorado" },
  CT: { votes: 1_701_914, dem: 58.9, rep: 40.4, marginD: 18.5, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Connecticut" },
  DE: { votes: 497_436, dem: 57.9, rep: 42.1, marginD: 15.8, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_election_in_Delaware" },
  FL: { votes: 10_327_922, dem: 42.0, rep: 57.9, marginD: -15.9, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Florida" },
  GA: { votes: 5_147_328, dem: 46.9, rep: 53.1, marginD: -6.2, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Georgia" },
  HI: { votes: 478_766, dem: 69.0, rep: 29.2, marginD: 39.8, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Hawaii" },
  ID: { votes: 873_694, dem: 28.0, rep: 66.5, marginD: -38.5, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Idaho" },
  IL: { votes: 5_360_054, dem: 52.8, rep: 47.0, marginD: 5.8, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Illinois" },
  IN: { votes: 2_868_107, dem: 38.5, rep: 58.2, marginD: -19.7, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Indiana" },
  IA: { votes: 1_609_609, dem: 43.2, rep: 56.2, marginD: -13.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Iowa" },
  KS: { votes: 1_305_649, dem: 40.3, rep: 57.4, marginD: -17.1, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Kansas" },
  KY: { votes: 1_905_534, dem: 26.9, rep: 73.1, marginD: -46.2, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Kentucky" },
  LA: { votes: 1_905_718, dem: 34.2, rep: 65.5, marginD: -31.3, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Louisiana" },
  ME: { votes: 817_126, dem: 54.7, rep: 42.8, marginD: 11.9, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Maine" },
  MD: { votes: 2_935_328, dem: 63.5, rep: 34.7, marginD: 28.8, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Maryland" },
  MA: { votes: 2_976_163, dem: 80.2, rep: 10.2, marginD: 70.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Massachusetts" },
  MI: { votes: 5_516_896, dem: 48.0, rep: 48.8, marginD: -0.8, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Michigan" },
  MN: { votes: 3_146_762, dem: 50.2, rep: 49.3, marginD: 0.9, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Minnesota" },
  MS: { votes: 1_163_152, dem: 30.1, rep: 69.9, marginD: -39.8, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Mississippi" },
  MO: { votes: 2_924_863, dem: 38.5, rep: 58.5, marginD: -20.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Missouri" },
  MT: { votes: 598_918, dem: 39.7, rep: 58.5, marginD: -18.8, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Montana" },
  NE: { votes: 929_392, dem: 36.4, rep: 63.6, marginD: -27.2, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Nebraska" },
  NV: { votes: 1_427_077, dem: 37.4, rep: 48.5, marginD: -11.1, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Nevada" },
  NH: { votes: 804_626, dem: 53.5, rep: 46.5, marginD: 7.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_New_Hampshire" },
  NJ: { votes: 4_037_126, dem: 52.4, rep: 45.3, marginD: 7.1, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_New_Jersey" },
  NM: { votes: 896_498, dem: 55.1, rep: 44.9, marginD: 10.2, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_New_Mexico" },
  NY: { votes: 7_913_946, dem: 57.2, rep: 42.5, marginD: 14.7, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_New_York" },
  NC: { votes: 5_483_155, dem: 42.8, rep: 52.8, marginD: -10.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_North_Carolina" },
  ND: { votes: 359_787, dem: 30.4, rep: 69.2, marginD: -38.8, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_election_in_North_Dakota" },
  OH: { votes: 5_570_784, dem: 43.4, rep: 56.6, marginD: -13.2, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Ohio" },
  OK: { votes: 1_282_106, dem: 31.0, rep: 65.1, marginD: -34.1, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Oklahoma" },
  OR: { votes: 2_156_972, dem: 53.4, rep: 42.3, marginD: 11.1, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Oregon" },
  PA: { votes: 6_819_484, dem: 49.0, rep: 51.1, marginD: -2.1, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Pennsylvania" },
  RI: { votes: 484_598, dem: 60.4, rep: 37.2, marginD: 23.2, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Rhode_Island" },
  SC: { votes: 2_474_904, dem: 39.5, rep: 60.5, marginD: -21.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_South_Carolina" },
  SD: { votes: 421_448, dem: 28.0, rep: 72.0, marginD: -44.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_election_in_South_Dakota" },
  TN: { votes: 2_926_955, dem: 33.4, rep: 64.4, marginD: -31.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Tennessee" },
  TX: { votes: 10_609_048, dem: 40.4, rep: 58.4, marginD: -18.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Texas" },
  UT: { votes: 1_448_677, dem: 32.5, rep: 62.8, marginD: -30.3, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Utah" },
  VT: { votes: 350_616, dem: 62.3, rep: 29.8, marginD: 32.5, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_election_in_Vermont" },
  VA: { votes: 4_425_762, dem: 51.4, rep: 47.6, marginD: 3.8, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Virginia" },
  WA: { votes: 3_768_180, dem: 57.2, rep: 42.3, marginD: 14.9, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Washington" },
  WV: { votes: 723_284, dem: 27.8, rep: 68.7, marginD: -40.9, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_West_Virginia" },
  WI: { votes: 3_325_606, dem: 48.2, rep: 51.2, marginD: -3.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Wisconsin" },
  WY: { votes: 261_548, dem: 23.2, rep: 70.6, marginD: -47.4, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_election_in_Wyoming" },
};
