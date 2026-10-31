// 2024 U.S. House statewide popular vote, Democratic and Republican shares.
// Taken from each state's Wikipedia House election page (statewide table when
// that page prints one, otherwise the election infobox). Percentages and the
// Democratic minus Republican margin are rounded half up to one decimal.
// At-large states are the statewide vote for the single district.
// Alaska is the first-round vote, not the ranked-choice final round.

export type HouseVote = {
  dem: number;
  rep: number;
  /** Democratic percentage minus Republican percentage, in points. */
  marginD: number;
  url: string;
  note?: string;
};

export const HOUSE_2024: Record<string, HouseVote> = {
  AL: { dem: 25.3, rep: 73.7, marginD: -48.4, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Alabama" },
  AK: { dem: 46.4, rep: 48.4, marginD: -2.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_election_in_Alaska", note: "First-round popular vote. Alaska uses ranked-choice voting; the final-round tally is not the popular vote." },
  AZ: { dem: 47.7, rep: 51.7, marginD: -4.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Arizona" },
  AR: { dem: 31.3, rep: 66.8, marginD: -35.5, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Arkansas" },
  CA: { dem: 60.5, rep: 39.2, marginD: 21.3, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_California" },
  CO: { dem: 54.3, rep: 42.5, marginD: 11.8, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Colorado" },
  CT: { dem: 58.9, rep: 40.4, marginD: 18.5, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Connecticut" },
  DE: { dem: 57.9, rep: 42.1, marginD: 15.8, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_election_in_Delaware" },
  FL: { dem: 42.0, rep: 57.9, marginD: -15.9, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Florida" },
  GA: { dem: 46.9, rep: 53.1, marginD: -6.2, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Georgia" },
  HI: { dem: 69.0, rep: 29.2, marginD: 39.8, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Hawaii" },
  ID: { dem: 28.0, rep: 66.5, marginD: -38.5, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Idaho" },
  IL: { dem: 52.8, rep: 47.0, marginD: 5.8, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Illinois" },
  IN: { dem: 38.5, rep: 58.2, marginD: -19.7, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Indiana" },
  IA: { dem: 43.2, rep: 56.2, marginD: -13.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Iowa" },
  KS: { dem: 40.3, rep: 57.4, marginD: -17.1, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Kansas" },
  KY: { dem: 26.9, rep: 73.1, marginD: -46.2, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Kentucky" },
  LA: { dem: 34.2, rep: 65.5, marginD: -31.3, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Louisiana" },
  ME: { dem: 54.7, rep: 42.8, marginD: 11.9, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Maine" },
  MD: { dem: 63.5, rep: 34.7, marginD: 28.8, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Maryland" },
  MA: { dem: 80.2, rep: 10.2, marginD: 70.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Massachusetts" },
  MI: { dem: 48.0, rep: 48.8, marginD: -0.8, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Michigan" },
  MN: { dem: 50.2, rep: 49.3, marginD: 0.9, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Minnesota" },
  MS: { dem: 30.1, rep: 69.9, marginD: -39.8, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Mississippi" },
  MO: { dem: 38.5, rep: 58.5, marginD: -20.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Missouri" },
  MT: { dem: 39.7, rep: 58.5, marginD: -18.8, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Montana" },
  NE: { dem: 36.4, rep: 63.6, marginD: -27.2, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Nebraska" },
  NV: { dem: 37.4, rep: 48.5, marginD: -11.1, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Nevada" },
  NH: { dem: 53.5, rep: 46.5, marginD: 7.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_New_Hampshire" },
  NJ: { dem: 52.4, rep: 45.3, marginD: 7.1, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_New_Jersey" },
  NM: { dem: 55.1, rep: 44.9, marginD: 10.2, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_New_Mexico" },
  NY: { dem: 57.2, rep: 42.5, marginD: 14.7, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_New_York" },
  NC: { dem: 42.8, rep: 52.8, marginD: -10.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_North_Carolina" },
  ND: { dem: 30.4, rep: 69.2, marginD: -38.8, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_election_in_North_Dakota" },
  OH: { dem: 43.4, rep: 56.6, marginD: -13.2, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Ohio" },
  OK: { dem: 31.0, rep: 65.1, marginD: -34.1, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Oklahoma" },
  OR: { dem: 53.4, rep: 42.3, marginD: 11.1, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Oregon" },
  PA: { dem: 49.0, rep: 51.1, marginD: -2.1, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Pennsylvania" },
  RI: { dem: 60.4, rep: 37.2, marginD: 23.2, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Rhode_Island" },
  SC: { dem: 39.5, rep: 60.5, marginD: -21.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_South_Carolina" },
  SD: { dem: 28.0, rep: 72.0, marginD: -44.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_election_in_South_Dakota" },
  TN: { dem: 33.4, rep: 64.4, marginD: -31.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Tennessee" },
  TX: { dem: 40.4, rep: 58.4, marginD: -18.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Texas" },
  UT: { dem: 32.5, rep: 62.8, marginD: -30.3, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Utah" },
  VT: { dem: 62.3, rep: 29.8, marginD: 32.5, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_election_in_Vermont" },
  VA: { dem: 51.4, rep: 47.6, marginD: 3.8, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Virginia" },
  WA: { dem: 57.2, rep: 42.3, marginD: 14.9, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Washington" },
  WV: { dem: 27.8, rep: 68.7, marginD: -40.9, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_West_Virginia" },
  WI: { dem: 48.2, rep: 51.2, marginD: -3.0, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Wisconsin" },
  WY: { dem: 23.2, rep: 70.6, marginD: -47.4, url: "https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_election_in_Wyoming" },
};
