// 2022 U.S. House general-election votes cast for candidates, by state.
// Integers are the certified totals in the Federal Election Commission's
// Federal Elections 2022 publication. Blank, void, and over/under votes are
// not included. The District of Columbia is not included.
// Indiana's FEC state total also counts the special election for the unexpired
// term in the 2nd district. That special is left out here so the November
// full-term vote is not counted twice. Alaska and Maine are first-round ballots.
// Each url is that state's Wikipedia page for the same election. A few of those
// pages print a total cell that does not match the certified return (scattered
// write-ins omitted, or the total cell does not add up). The integer here follows
// the FEC certified total.

export const HOUSE_2022_FEC =
  "https://www.fec.gov/resources/cms-content/documents/federalelections2022.pdf";

export type HouseTurnout = {
  /** Valid votes cast for U.S. House candidates in the November 2022 general election. */
  total: number;
  url: string;
};

export const HOUSE_2022: Record<string, HouseTurnout> = {
  AL: { total: 1_343_710, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Alabama" },
  AK: { total: 263_610, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_election_in_Alaska" },
  AZ: { total: 2_360_078, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Arizona" },
  AR: { total: 895_102, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Arkansas" },
  CA: { total: 10_656_368, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_California" },
  CO: { total: 2_472_144, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Colorado" },
  CT: { total: 1_261_351, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Connecticut" },
  DE: { total: 321_667, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_election_in_Delaware" },
  FL: { total: 7_332_304, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Florida" },
  GA: { total: 3_907_986, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Georgia" },
  HI: { total: 401_174, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Hawaii" },
  ID: { total: 583_628, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Idaho" },
  IL: { total: 4_049_405, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Illinois" },
  IN: { total: 1_856_849, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Indiana" },
  IA: { total: 1_211_700, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Iowa" },
  KS: { total: 1_001_817, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Kansas" },
  KY: { total: 1_463_418, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Kentucky" },
  LA: { total: 1_133_124, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Louisiana" },
  ME: { total: 665_558, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Maine" },
  MD: { total: 1_995_728, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Maryland" },
  MA: { total: 2_357_997, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Massachusetts" },
  MI: { total: 4_375_537, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Michigan" },
  MN: { total: 2_495_832, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Minnesota" },
  MS: { total: 709_100, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Mississippi" },
  MO: { total: 2_060_089, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Missouri" },
  MT: { total: 463_632, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Montana" },
  NE: { total: 663_187, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Nebraska" },
  NV: { total: 1_009_503, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Nevada" },
  NH: { total: 617_546, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_New_Hampshire" },
  NJ: { total: 2_609_716, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_New_Jersey" },
  NM: { total: 704_126, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_New_Mexico" },
  NY: { total: 5_762_257, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_New_York" },
  NC: { total: 3_760_753, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_North_Carolina" },
  ND: { total: 238_586, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_election_in_North_Dakota" },
  OH: { total: 4_109_711, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Ohio" },
  OK: { total: 1_146_311, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Oklahoma" },
  OR: { total: 1_906_940, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Oregon" },
  PA: { total: 5_180_885, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Pennsylvania" },
  RI: { total: 357_823, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Rhode_Island" },
  SC: { total: 1_602_341, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_South_Carolina" },
  SD: { total: 327_841, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_election_in_South_Dakota" },
  TN: { total: 1_710_425, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Tennessee" },
  TX: { total: 7_751_761, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Texas" },
  UT: { total: 1_063_258, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Utah" },
  VT: { total: 282_026, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_election_in_Vermont" },
  VA: { total: 3_047_639, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Virginia" },
  WA: { total: 3_026_187, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Washington" },
  WV: { total: 472_082, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_West_Virginia" },
  WI: { total: 2_531_324, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Wisconsin" },
  WY: { total: 193_902, url: "https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_election_in_Wyoming" },
};
