// 2024 presidential electorate composition from the National Election Pool
// exit poll, conducted by Edison Research and published by CNN.
// Each percentage is the share of voters in that group, not how the group voted.
// Groups can sum to 99 or 101 because CNN rounds each figure to the nearest percent.
// States absent from this record had no state exit poll in that survey.

export type ElectorateGroup = {
  label: string;
  /** Percent of the electorate, as published. */
  pct: number;
};

export type ExitPoll = {
  source: string;
  url: string;
  respondents: number;
  age: ElectorateGroup[];
  ethnicity: ElectorateGroup[];
  gender: ElectorateGroup[];
};

export const EXIT_POLLS: Record<string, ExitPoll> = {
  AZ: {
    source: "CNN / Edison Research exit poll",
    url: "https://www.cnn.com/election/2024/exit-polls/arizona/general/president/0",
    respondents: 1872,
    age: [{ label: "18-29", pct: 15 }, { label: "30-44", pct: 18 }, { label: "45-64", pct: 35 }, { label: "65 or older", pct: 31 }],
    ethnicity: [{ label: "White", pct: 63 }, { label: "Black", pct: 4 }, { label: "Latino", pct: 27 }, { label: "Asian", pct: 2 }, { label: "Other racial/ethnic groups", pct: 4 }],
    gender: [{ label: "Male", pct: 46 }, { label: "Female", pct: 54 }],
  },
  FL: {
    source: "CNN / Edison Research exit poll",
    url: "https://www.cnn.com/election/2024/exit-polls/florida/general/president/0",
    respondents: 3293,
    age: [{ label: "18-29", pct: 14 }, { label: "30-44", pct: 23 }, { label: "45-64", pct: 35 }, { label: "65 or older", pct: 28 }],
    ethnicity: [{ label: "White", pct: 59 }, { label: "Black", pct: 12 }, { label: "Latino", pct: 24 }, { label: "Asian", pct: 2 }, { label: "Other racial/ethnic groups", pct: 3 }],
    gender: [{ label: "Male", pct: 46 }, { label: "Female", pct: 54 }],
  },
  GA: {
    source: "CNN / Edison Research exit poll",
    url: "https://www.cnn.com/election/2024/exit-polls/georgia/general/president/0",
    respondents: 4398,
    age: [{ label: "18-29", pct: 18 }, { label: "30-44", pct: 25 }, { label: "45-64", pct: 35 }, { label: "65 or older", pct: 22 }],
    ethnicity: [{ label: "White", pct: 59 }, { label: "Black", pct: 29 }, { label: "Latino", pct: 8 }, { label: "Asian", pct: 2 }, { label: "Other racial/ethnic groups", pct: 3 }],
    gender: [{ label: "Male", pct: 46 }, { label: "Female", pct: 54 }],
  },
  MI: {
    source: "CNN / Edison Research exit poll",
    url: "https://www.cnn.com/election/2024/exit-polls/michigan/general/president/0",
    respondents: 2855,
    age: [{ label: "18-29", pct: 12 }, { label: "30-44", pct: 24 }, { label: "45-64", pct: 35 }, { label: "65 or older", pct: 29 }],
    ethnicity: [{ label: "White", pct: 78 }, { label: "Black", pct: 11 }, { label: "Latino", pct: 6 }, { label: "Asian", pct: 1 }, { label: "Other racial/ethnic groups", pct: 3 }],
    gender: [{ label: "Male", pct: 45 }, { label: "Female", pct: 55 }],
  },
  NV: {
    source: "CNN / Edison Research exit poll",
    url: "https://www.cnn.com/election/2024/exit-polls/nevada/general/president/0",
    respondents: 3509,
    age: [{ label: "18-29", pct: 10 }, { label: "30-44", pct: 23 }, { label: "45-64", pct: 33 }, { label: "65 or older", pct: 34 }],
    ethnicity: [{ label: "White", pct: 65 }, { label: "Black", pct: 8 }, { label: "Latino", pct: 18 }, { label: "Asian", pct: 4 }, { label: "Other racial/ethnic groups", pct: 5 }],
    gender: [{ label: "Male", pct: 52 }, { label: "Female", pct: 48 }],
  },
  NC: {
    source: "CNN / Edison Research exit poll",
    url: "https://www.cnn.com/election/2024/exit-polls/north-carolina/general/president/0",
    respondents: 3773,
    age: [{ label: "18-29", pct: 14 }, { label: "30-44", pct: 22 }, { label: "45-64", pct: 38 }, { label: "65 or older", pct: 25 }],
    ethnicity: [{ label: "White", pct: 69 }, { label: "Black", pct: 19 }, { label: "Latino", pct: 8 }, { label: "Asian", pct: 1 }, { label: "Other racial/ethnic groups", pct: 2 }],
    gender: [{ label: "Male", pct: 47 }, { label: "Female", pct: 53 }],
  },
  OH: {
    source: "CNN / Edison Research exit poll",
    url: "https://www.cnn.com/election/2024/exit-polls/ohio/general/president/0",
    respondents: 4612,
    age: [{ label: "18-29", pct: 11 }, { label: "30-44", pct: 27 }, { label: "45-64", pct: 36 }, { label: "65 or older", pct: 26 }],
    ethnicity: [{ label: "White", pct: 85 }, { label: "Black", pct: 8 }, { label: "Latino", pct: 3 }, { label: "Asian", pct: 2 }, { label: "Other racial/ethnic groups", pct: 2 }],
    gender: [{ label: "Male", pct: 47 }, { label: "Female", pct: 53 }],
  },
  PA: {
    source: "CNN / Edison Research exit poll",
    url: "https://www.cnn.com/election/2024/exit-polls/pennsylvania/general/president/0",
    respondents: 3000,
    age: [{ label: "18-29", pct: 12 }, { label: "30-44", pct: 26 }, { label: "45-64", pct: 36 }, { label: "65 or older", pct: 25 }],
    ethnicity: [{ label: "White", pct: 83 }, { label: "Black", pct: 8 }, { label: "Latino", pct: 6 }, { label: "Asian", pct: 1 }, { label: "Other racial/ethnic groups", pct: 2 }],
    gender: [{ label: "Male", pct: 48 }, { label: "Female", pct: 52 }],
  },
  TX: {
    source: "CNN / Edison Research exit poll",
    url: "https://www.cnn.com/election/2024/exit-polls/texas/general/president/0",
    respondents: 2893,
    age: [{ label: "18-29", pct: 14 }, { label: "30-44", pct: 24 }, { label: "45-64", pct: 37 }, { label: "65 or older", pct: 26 }],
    ethnicity: [{ label: "White", pct: 55 }, { label: "Black", pct: 11 }, { label: "Latino", pct: 26 }, { label: "Asian", pct: 4 }, { label: "Other racial/ethnic groups", pct: 4 }],
    gender: [{ label: "Male", pct: 48 }, { label: "Female", pct: 52 }],
  },
  WI: {
    source: "CNN / Edison Research exit poll",
    url: "https://www.cnn.com/election/2024/exit-polls/wisconsin/general/president/0",
    respondents: 2956,
    age: [{ label: "18-29", pct: 14 }, { label: "30-44", pct: 24 }, { label: "45-64", pct: 35 }, { label: "65 or older", pct: 27 }],
    ethnicity: [{ label: "White", pct: 85 }, { label: "Black", pct: 5 }, { label: "Latino", pct: 6 }, { label: "Asian", pct: 1 }, { label: "Other racial/ethnic groups", pct: 3 }],
    gender: [{ label: "Male", pct: 51 }, { label: "Female", pct: 49 }],
  },
};

export const EXIT_POLL_STATE_NAMES = [
  "Arizona",
  "Florida",
  "Georgia",
  "Michigan",
  "Nevada",
  "North Carolina",
  "Ohio",
  "Pennsylvania",
  "Texas",
  "Wisconsin",
];
