// Tossup-map snapshot fetched with the margin markets, October 31, 2026, 10:44 p.m. CT.
// Gamma API event which-tossup-senate-states-will-republicans-win-ak-ia-ks-me-mi-oh-tx
// (2026-10-31T22:44:22-05:00). The payload is 128 mutually exclusive maps of Alaska, Iowa, Kansas,
// Maine, Michigan, Ohio, and Texas. It does not publish a separate contract per state.
// A state's Republican price is the sum of the Yes prices on the maps where
// Republicans win that state, times 100, rounded half up to one decimal. The
// Democrat price is the sum on the maps where they do not. The Yes prices sum
// to a little more than 1, so the two sides of one state do not add to 100.
// Each map below is that outcome's own Yes price, the same rounding.

export const TOSSUP_AS_OF = "October 31, 2026, 10:44 p.m. CT";

export const TOSSUP_EVENT = {
  title: "Which Senate Swing States will Republicans win?",
  slug: "which-tossup-senate-states-will-republicans-win-ak-ia-ks-me-mi-oh-tx",
  url: "https://polymarket.com/event/which-tossup-senate-states-will-republicans-win-ak-ia-ks-me-mi-oh-tx",
};

export type TossupSide = "R" | "D";

export type TossupState = {
  abbr: string;
  name: string;
  /** Sum of Yes prices on maps where Republicans win, in 100. */
  republican: number;
  /** Sum of Yes prices on maps where Republicans do not win, in 100. */
  democrat: number;
};

export const TOSSUP_STATES: TossupState[] = [
  { abbr: "AK", name: "Alaska", republican: 26.4, democrat: 80.2 },
  { abbr: "IA", name: "Iowa", republican: 57.0, democrat: 49.6 },
  { abbr: "KS", name: "Kansas", republican: 46.5, democrat: 60.1 },
  { abbr: "ME", name: "Maine", republican: 26.0, democrat: 80.6 },
  { abbr: "MI", name: "Michigan", republican: 21.6, democrat: 85.0 },
  { abbr: "OH", name: "Ohio", republican: 26.7, democrat: 79.9 },
  { abbr: "TX", name: "Texas", republican: 25.4, democrat: 81.2 },
];

export type TossupMap = {
  /** Polymarket's short label for this exact map. */
  label: string;
  question: string;
  /** States in which this outcome says the Republican wins. */
  republican: string[];
  /** Yes price times 100, one decimal. */
  price: number;
};

export const TOSSUP_MAPS: TossupMap[] = [
  { label: "All 7", question: "Will Republicans win the Alaska, Iowa, Kansas, Maine, Michigan, Ohio, and Texas Senate seats?", republican: ["AK", "IA", "KS", "ME", "MI", "OH", "TX"], price: 4.0 },
  { label: "AK, IA, KS, ME, MI, OH", question: "Will Republicans win Alaska, Iowa, Kansas, Maine, Michigan, and Ohio, and lose Texas?", republican: ["AK", "IA", "KS", "ME", "MI", "OH"], price: 0.6 },
  { label: "AK, IA, KS, ME, TX", question: "Will Republicans win Alaska, Iowa, Kansas, Maine, and Texas, and lose Michigan and Ohio?", republican: ["AK", "IA", "KS", "ME", "TX"], price: 0.6 },
  { label: "AK, KS", question: "Will Republicans win Alaska and Kansas, and lose Iowa, Maine, Michigan, Ohio, and Texas?", republican: ["AK", "KS"], price: 1.0 },
  { label: "AK, ME", question: "Will Republicans win Alaska and Maine, and lose Iowa, Kansas, Michigan, Ohio, and Texas?", republican: ["AK", "ME"], price: 0.5 },
  { label: "AK, MI", question: "Will Republicans win Alaska and Michigan, and lose Iowa, Kansas, Maine, Ohio, and Texas?", republican: ["AK", "MI"], price: 0.3 },
  { label: "AK, OH", question: "Will Republicans win Alaska and Ohio, and lose Iowa, Kansas, Maine, Michigan, and Texas?", republican: ["AK", "OH"], price: 0.3 },
  { label: "AK, TX", question: "Will Republicans win Alaska and Texas, and lose Iowa, Kansas, Maine, Michigan, and Ohio?", republican: ["AK", "TX"], price: 0.3 },
  { label: "IA, KS", question: "Will Republicans win Iowa and Kansas, and lose Alaska, Maine, Michigan, Ohio, and Texas?", republican: ["IA", "KS"], price: 10.5 },
  { label: "IA, ME", question: "Will Republicans win Iowa and Maine, and lose Alaska, Kansas, Michigan, Ohio, and Texas?", republican: ["IA", "ME"], price: 1.0 },
  { label: "IA, MI", question: "Will Republicans win Iowa and Michigan, and lose Alaska, Kansas, Maine, Ohio, and Texas?", republican: ["IA", "MI"], price: 0.9 },
  { label: "IA, OH", question: "Will Republicans win Iowa and Ohio, and lose Alaska, Kansas, Maine, Michigan, and Texas?", republican: ["IA", "OH"], price: 1.7 },
  { label: "IA, TX", question: "Will Republicans win Iowa and Texas, and lose Alaska, Kansas, Maine, Michigan, and Ohio?", republican: ["IA", "TX"], price: 0.9 },
  { label: "AK, IA, KS, MI, OH", question: "Will Republicans win Alaska, Iowa, Kansas, Michigan, and Ohio, and lose Maine and Texas?", republican: ["AK", "IA", "KS", "MI", "OH"], price: 0.5 },
  { label: "KS, ME", question: "Will Republicans win Kansas and Maine, and lose Alaska, Iowa, Michigan, Ohio, and Texas?", republican: ["KS", "ME"], price: 0.7 },
  { label: "KS, MI", question: "Will Republicans win Kansas and Michigan, and lose Alaska, Iowa, Maine, Ohio, and Texas?", republican: ["KS", "MI"], price: 0.4 },
  { label: "KS, OH", question: "Will Republicans win Kansas and Ohio, and lose Alaska, Iowa, Maine, Michigan, and Texas?", republican: ["KS", "OH"], price: 0.7 },
  { label: "KS, TX", question: "Will Republicans win Kansas and Texas, and lose Alaska, Iowa, Maine, Michigan, and Ohio?", republican: ["KS", "TX"], price: 0.7 },
  { label: "ME, MI", question: "Will Republicans win Maine and Michigan, and lose Alaska, Iowa, Kansas, Ohio, and Texas?", republican: ["ME", "MI"], price: 0.4 },
  { label: "ME, OH", question: "Will Republicans win Maine and Ohio, and lose Alaska, Iowa, Kansas, Michigan, and Texas?", republican: ["ME", "OH"], price: 0.4 },
  { label: "ME, TX", question: "Will Republicans win Maine and Texas, and lose Alaska, Iowa, Kansas, Michigan, and Ohio?", republican: ["ME", "TX"], price: 0.3 },
  { label: "MI, OH", question: "Will Republicans win Michigan and Ohio, and lose Alaska, Iowa, Kansas, Maine, and Texas?", republican: ["MI", "OH"], price: 0.2 },
  { label: "MI, TX", question: "Will Republicans win Michigan and Texas, and lose Alaska, Iowa, Kansas, Maine, and Ohio?", republican: ["MI", "TX"], price: 0.2 },
  { label: "OH, TX", question: "Will Republicans win Ohio and Texas, and lose Alaska, Iowa, Kansas, Maine, and Michigan?", republican: ["OH", "TX"], price: 0.3 },
  { label: "AK, IA, KS, MI, TX", question: "Will Republicans win Alaska, Iowa, Kansas, Michigan, and Texas, and lose Maine and Ohio?", republican: ["AK", "IA", "KS", "MI", "TX"], price: 0.3 },
  { label: "AK", question: "Will Republicans win Alaska, and lose Iowa, Kansas, Maine, Michigan, Ohio, and Texas?", republican: ["AK"], price: 1.3 },
  { label: "IA", question: "Will Republicans win Iowa, and lose Alaska, Kansas, Maine, Michigan, Ohio, and Texas?", republican: ["IA"], price: 10.9 },
  { label: "KS", question: "Will Republicans win Kansas, and lose Alaska, Iowa, Maine, Michigan, Ohio, and Texas?", republican: ["KS"], price: 4.3 },
  { label: "ME", question: "Will Republicans win Maine, and lose Alaska, Iowa, Kansas, Michigan, Ohio, and Texas?", republican: ["ME"], price: 1.8 },
  { label: "MI", question: "Will Republicans win Michigan, and lose Alaska, Iowa, Kansas, Maine, Ohio, and Texas?", republican: ["MI"], price: 0.9 },
  { label: "OH", question: "Will Republicans win Ohio, and lose Alaska, Iowa, Kansas, Maine, Michigan, and Texas?", republican: ["OH"], price: 1.3 },
  { label: "TX", question: "Will Republicans win Texas, and lose Alaska, Iowa, Kansas, Maine, Michigan, and Ohio?", republican: ["TX"], price: 0.9 },
  { label: "None", question: "Will Republicans lose the Alaska, Iowa, Kansas, Maine, Michigan, Ohio, and Texas Senate seats?", republican: [], price: 25.5 },
  { label: "AK, IA, KS, OH, TX", question: "Will Republicans win Alaska, Iowa, Kansas, Ohio, and Texas, and lose Maine and Michigan?", republican: ["AK", "IA", "KS", "OH", "TX"], price: 0.6 },
  { label: "AK, IA, ME, MI, OH", question: "Will Republicans win Alaska, Iowa, Maine, Michigan, and Ohio, and lose Kansas and Texas?", republican: ["AK", "IA", "ME", "MI", "OH"], price: 0.2 },
  { label: "AK, IA, ME, MI, TX", question: "Will Republicans win Alaska, Iowa, Maine, Michigan, and Texas, and lose Kansas and Ohio?", republican: ["AK", "IA", "ME", "MI", "TX"], price: 0.2 },
  { label: "AK, IA, ME, OH, TX", question: "Will Republicans win Alaska, Iowa, Maine, Ohio, and Texas, and lose Kansas and Michigan?", republican: ["AK", "IA", "ME", "OH", "TX"], price: 0.3 },
  { label: "AK, IA, MI, OH, TX", question: "Will Republicans win Alaska, Iowa, Michigan, Ohio, and Texas, and lose Kansas and Maine?", republican: ["AK", "IA", "MI", "OH", "TX"], price: 0.2 },
  { label: "AK, KS, ME, MI, OH", question: "Will Republicans win Alaska, Kansas, Maine, Michigan, and Ohio, and lose Iowa and Texas?", republican: ["AK", "KS", "ME", "MI", "OH"], price: 0.2 },
  { label: "AK, KS, ME, MI, TX", question: "Will Republicans win Alaska, Kansas, Maine, Michigan, and Texas, and lose Iowa and Ohio?", republican: ["AK", "KS", "ME", "MI", "TX"], price: 0.2 },
  { label: "AK, IA, KS, ME, MI, TX", question: "Will Republicans win Alaska, Iowa, Kansas, Maine, Michigan, and Texas, and lose Ohio?", republican: ["AK", "IA", "KS", "ME", "MI", "TX"], price: 0.7 },
  { label: "AK, KS, ME, OH, TX", question: "Will Republicans win Alaska, Kansas, Maine, Ohio, and Texas, and lose Iowa and Michigan?", republican: ["AK", "KS", "ME", "OH", "TX"], price: 0.2 },
  { label: "AK, KS, MI, OH, TX", question: "Will Republicans win Alaska, Kansas, Michigan, Ohio, and Texas, and lose Iowa and Maine?", republican: ["AK", "KS", "MI", "OH", "TX"], price: 0.2 },
  { label: "AK, ME, MI, OH, TX", question: "Will Republicans win Alaska, Maine, Michigan, Ohio, and Texas, and lose Iowa and Kansas?", republican: ["AK", "ME", "MI", "OH", "TX"], price: 0.2 },
  { label: "IA, KS, ME, MI, OH", question: "Will Republicans win Iowa, Kansas, Maine, Michigan, and Ohio, and lose Alaska and Texas?", republican: ["IA", "KS", "ME", "MI", "OH"], price: 0.5 },
  { label: "IA, KS, ME, MI, TX", question: "Will Republicans win Iowa, Kansas, Maine, Michigan, and Texas, and lose Alaska and Ohio?", republican: ["IA", "KS", "ME", "MI", "TX"], price: 0.4 },
  { label: "IA, KS, ME, OH, TX", question: "Will Republicans win Iowa, Kansas, Maine, Ohio, and Texas, and lose Alaska and Michigan?", republican: ["IA", "KS", "ME", "OH", "TX"], price: 0.8 },
  { label: "IA, KS, MI, OH, TX", question: "Will Republicans win Iowa, Kansas, Michigan, Ohio, and Texas, and lose Alaska and Maine?", republican: ["IA", "KS", "MI", "OH", "TX"], price: 0.7 },
  { label: "IA, ME, MI, OH, TX", question: "Will Republicans win Iowa, Maine, Michigan, Ohio, and Texas, and lose Alaska and Kansas?", republican: ["IA", "ME", "MI", "OH", "TX"], price: 0.2 },
  { label: "KS, ME, MI, OH, TX", question: "Will Republicans win Kansas, Maine, Michigan, Ohio, and Texas, and lose Alaska and Iowa?", republican: ["KS", "ME", "MI", "OH", "TX"], price: 0.2 },
  { label: "AK, IA, KS, ME", question: "Will Republicans win Alaska, Iowa, Kansas, and Maine, and lose Michigan, Ohio, and Texas?", republican: ["AK", "IA", "KS", "ME"], price: 0.4 },
  { label: "AK, IA, KS, ME, OH, TX", question: "Will Republicans win Alaska, Iowa, Kansas, Maine, Ohio, and Texas, and lose Michigan?", republican: ["AK", "IA", "KS", "ME", "OH", "TX"], price: 1.0 },
  { label: "AK, IA, KS, MI", question: "Will Republicans win Alaska, Iowa, Kansas, and Michigan, and lose Maine, Ohio, and Texas?", republican: ["AK", "IA", "KS", "MI"], price: 0.4 },
  { label: "AK, IA, KS, OH", question: "Will Republicans win Alaska, Iowa, Kansas, and Ohio, and lose Maine, Michigan, and Texas?", republican: ["AK", "IA", "KS", "OH"], price: 0.8 },
  { label: "AK, IA, KS, TX", question: "Will Republicans win Alaska, Iowa, Kansas, and Texas, and lose Maine, Michigan, and Ohio?", republican: ["AK", "IA", "KS", "TX"], price: 0.7 },
  { label: "AK, IA, ME, MI", question: "Will Republicans win Alaska, Iowa, Maine, and Michigan, and lose Kansas, Ohio, and Texas?", republican: ["AK", "IA", "ME", "MI"], price: 0.2 },
  { label: "AK, IA, ME, OH", question: "Will Republicans win Alaska, Iowa, Maine, and Ohio, and lose Kansas, Michigan, and Texas?", republican: ["AK", "IA", "ME", "OH"], price: 0.3 },
  { label: "AK, IA, ME, TX", question: "Will Republicans win Alaska, Iowa, Maine, and Texas, and lose Kansas, Michigan, and Ohio?", republican: ["AK", "IA", "ME", "TX"], price: 0.3 },
  { label: "AK, IA, MI, OH", question: "Will Republicans win Alaska, Iowa, Michigan, and Ohio, and lose Kansas, Maine, and Texas?", republican: ["AK", "IA", "MI", "OH"], price: 0.2 },
  { label: "AK, IA, MI, TX", question: "Will Republicans win Alaska, Iowa, Michigan, and Texas, and lose Kansas, Maine, and Ohio?", republican: ["AK", "IA", "MI", "TX"], price: 0.2 },
  { label: "AK, IA, OH, TX", question: "Will Republicans win Alaska, Iowa, Ohio, and Texas, and lose Kansas, Maine, and Michigan?", republican: ["AK", "IA", "OH", "TX"], price: 0.4 },
  { label: "AK, KS, ME, MI", question: "Will Republicans win Alaska, Kansas, Maine, and Michigan, and lose Iowa, Ohio, and Texas?", republican: ["AK", "KS", "ME", "MI"], price: 0.2 },
  { label: "AK, IA, KS, MI, OH, TX", question: "Will Republicans win Alaska, Iowa, Kansas, Michigan, Ohio, and Texas, and lose Maine?", republican: ["AK", "IA", "KS", "MI", "OH", "TX"], price: 0.7 },
  { label: "AK, KS, ME, OH", question: "Will Republicans win Alaska, Kansas, Maine, and Ohio, and lose Iowa, Michigan, and Texas?", republican: ["AK", "KS", "ME", "OH"], price: 0.2 },
  { label: "AK, KS, ME, TX", question: "Will Republicans win Alaska, Kansas, Maine, and Texas, and lose Iowa, Michigan, and Ohio?", republican: ["AK", "KS", "ME", "TX"], price: 0.2 },
  { label: "AK, KS, MI, OH", question: "Will Republicans win Alaska, Kansas, Michigan, and Ohio, and lose Iowa, Maine, and Texas?", republican: ["AK", "KS", "MI", "OH"], price: 0.2 },
  { label: "AK, KS, MI, TX", question: "Will Republicans win Alaska, Kansas, Michigan, and Texas, and lose Iowa, Maine, and Ohio?", republican: ["AK", "KS", "MI", "TX"], price: 0.2 },
  { label: "AK, KS, OH, TX", question: "Will Republicans win Alaska, Kansas, Ohio, and Texas, and lose Iowa, Maine, and Michigan?", republican: ["AK", "KS", "OH", "TX"], price: 0.3 },
  { label: "AK, ME, MI, OH", question: "Will Republicans win Alaska, Maine, Michigan, and Ohio, and lose Iowa, Kansas, and Texas?", republican: ["AK", "ME", "MI", "OH"], price: 0.2 },
  { label: "AK, ME, MI, TX", question: "Will Republicans win Alaska, Maine, Michigan, and Texas, and lose Iowa, Kansas, and Ohio?", republican: ["AK", "ME", "MI", "TX"], price: 0.2 },
  { label: "AK, ME, OH, TX", question: "Will Republicans win Alaska, Maine, Ohio, and Texas, and lose Iowa, Kansas, and Michigan?", republican: ["AK", "ME", "OH", "TX"], price: 0.2 },
  { label: "AK, MI, OH, TX", question: "Will Republicans win Alaska, Michigan, Ohio, and Texas, and lose Iowa, Kansas, and Maine?", republican: ["AK", "MI", "OH", "TX"], price: 0.2 },
  { label: "IA, KS, ME, MI", question: "Will Republicans win Iowa, Kansas, Maine, and Michigan, and lose Alaska, Ohio, and Texas?", republican: ["IA", "KS", "ME", "MI"], price: 0.4 },
  { label: "AK, IA, ME, MI, OH, TX", question: "Will Republicans win Alaska, Iowa, Maine, Michigan, Ohio, and Texas, and lose Kansas?", republican: ["AK", "IA", "ME", "MI", "OH", "TX"], price: 0.3 },
  { label: "IA, KS, ME, OH", question: "Will Republicans win Iowa, Kansas, Maine, and Ohio, and lose Alaska, Michigan, and Texas?", republican: ["IA", "KS", "ME", "OH"], price: 0.7 },
  { label: "IA, KS, ME, TX", question: "Will Republicans win Iowa, Kansas, Maine, and Texas, and lose Alaska, Michigan, and Ohio?", republican: ["IA", "KS", "ME", "TX"], price: 0.7 },
  { label: "IA, KS, MI, OH", question: "Will Republicans win Iowa, Kansas, Michigan, and Ohio, and lose Alaska, Maine, and Texas?", republican: ["IA", "KS", "MI", "OH"], price: 0.4 },
  { label: "IA, KS, MI, TX", question: "Will Republicans win Iowa, Kansas, Michigan, and Texas, and lose Alaska, Maine, and Ohio?", republican: ["IA", "KS", "MI", "TX"], price: 0.4 },
  { label: "IA, KS, OH, TX", question: "Will Republicans win Iowa, Kansas, Ohio, and Texas, and lose Alaska, Maine, and Michigan?", republican: ["IA", "KS", "OH", "TX"], price: 0.7 },
  { label: "IA, ME, MI, OH", question: "Will Republicans win Iowa, Maine, Michigan, and Ohio, and lose Alaska, Kansas, and Texas?", republican: ["IA", "ME", "MI", "OH"], price: 0.2 },
  { label: "IA, ME, MI, TX", question: "Will Republicans win Iowa, Maine, Michigan, and Texas, and lose Alaska, Kansas, and Ohio?", republican: ["IA", "ME", "MI", "TX"], price: 0.2 },
  { label: "IA, ME, OH, TX", question: "Will Republicans win Iowa, Maine, Ohio, and Texas, and lose Alaska, Kansas, and Michigan?", republican: ["IA", "ME", "OH", "TX"], price: 0.3 },
  { label: "IA, MI, OH, TX", question: "Will Republicans win Iowa, Michigan, Ohio, and Texas, and lose Alaska, Kansas, and Maine?", republican: ["IA", "MI", "OH", "TX"], price: 0.2 },
  { label: "KS, ME, MI, OH", question: "Will Republicans win Kansas, Maine, Michigan, and Ohio, and lose Alaska, Iowa, and Texas?", republican: ["KS", "ME", "MI", "OH"], price: 0.2 },
  { label: "AK, KS, ME, MI, OH, TX", question: "Will Republicans win Alaska, Kansas, Maine, Michigan, Ohio, and Texas, and lose Iowa?", republican: ["AK", "KS", "ME", "MI", "OH", "TX"], price: 0.2 },
  { label: "KS, ME, MI, TX", question: "Will Republicans win Kansas, Maine, Michigan, and Texas, and lose Alaska, Iowa, and Ohio?", republican: ["KS", "ME", "MI", "TX"], price: 0.2 },
  { label: "KS, ME, OH, TX", question: "Will Republicans win Kansas, Maine, Ohio, and Texas, and lose Alaska, Iowa, and Michigan?", republican: ["KS", "ME", "OH", "TX"], price: 0.2 },
  { label: "KS, MI, OH, TX", question: "Will Republicans win Kansas, Michigan, Ohio, and Texas, and lose Alaska, Iowa, and Maine?", republican: ["KS", "MI", "OH", "TX"], price: 0.2 },
  { label: "ME, MI, OH, TX", question: "Will Republicans win Maine, Michigan, Ohio, and Texas, and lose Alaska, Iowa, and Kansas?", republican: ["ME", "MI", "OH", "TX"], price: 0.2 },
  { label: "AK, IA, KS", question: "Will Republicans win Alaska, Iowa, and Kansas, and lose Maine, Michigan, Ohio, and Texas?", republican: ["AK", "IA", "KS"], price: 1.2 },
  { label: "AK, IA, ME", question: "Will Republicans win Alaska, Iowa, and Maine, and lose Kansas, Michigan, Ohio, and Texas?", republican: ["AK", "IA", "ME"], price: 0.4 },
  { label: "AK, IA, MI", question: "Will Republicans win Alaska, Iowa, and Michigan, and lose Kansas, Maine, Ohio, and Texas?", republican: ["AK", "IA", "MI"], price: 0.4 },
  { label: "AK, IA, OH", question: "Will Republicans win Alaska, Iowa, and Ohio, and lose Kansas, Maine, Michigan, and Texas?", republican: ["AK", "IA", "OH"], price: 0.5 },
  { label: "AK, IA, TX", question: "Will Republicans win Alaska, Iowa, and Texas, and lose Kansas, Maine, Michigan, and Ohio?", republican: ["AK", "IA", "TX"], price: 0.4 },
  { label: "AK, KS, ME", question: "Will Republicans win Alaska, Kansas, and Maine, and lose Iowa, Michigan, Ohio, and Texas?", republican: ["AK", "KS", "ME"], price: 0.4 },
  { label: "IA, KS, ME, MI, OH, TX", question: "Will Republicans win Iowa, Kansas, Maine, Michigan, Ohio, and Texas, and lose Alaska?", republican: ["IA", "KS", "ME", "MI", "OH", "TX"], price: 0.7 },
  { label: "AK, KS, MI", question: "Will Republicans win Alaska, Kansas, and Michigan, and lose Iowa, Maine, Ohio, and Texas?", republican: ["AK", "KS", "MI"], price: 0.2 },
  { label: "AK, KS, OH", question: "Will Republicans win Alaska, Kansas, and Ohio, and lose Iowa, Maine, Michigan, and Texas?", republican: ["AK", "KS", "OH"], price: 0.3 },
  { label: "AK, KS, TX", question: "Will Republicans win Alaska, Kansas, and Texas, and lose Iowa, Maine, Michigan, and Ohio?", republican: ["AK", "KS", "TX"], price: 0.6 },
  { label: "AK, ME, MI", question: "Will Republicans win Alaska, Maine, and Michigan, and lose Iowa, Kansas, Ohio, and Texas?", republican: ["AK", "ME", "MI"], price: 0.2 },
  { label: "AK, ME, OH", question: "Will Republicans win Alaska, Maine, and Ohio, and lose Iowa, Kansas, Michigan, and Texas?", republican: ["AK", "ME", "OH"], price: 0.2 },
  { label: "AK, ME, TX", question: "Will Republicans win Alaska, Maine, and Texas, and lose Iowa, Kansas, Michigan, and Ohio?", republican: ["AK", "ME", "TX"], price: 0.2 },
  { label: "AK, MI, OH", question: "Will Republicans win Alaska, Michigan, and Ohio, and lose Iowa, Kansas, Maine, and Texas?", republican: ["AK", "MI", "OH"], price: 0.2 },
  { label: "AK, MI, TX", question: "Will Republicans win Alaska, Michigan, and Texas, and lose Iowa, Kansas, Maine, and Ohio?", republican: ["AK", "MI", "TX"], price: 0.2 },
  { label: "AK, OH, TX", question: "Will Republicans win Alaska, Ohio, and Texas, and lose Iowa, Kansas, Maine, and Michigan?", republican: ["AK", "OH", "TX"], price: 0.2 },
  { label: "IA, KS, ME", question: "Will Republicans win Iowa, Kansas, and Maine, and lose Alaska, Michigan, Ohio, and Texas?", republican: ["IA", "KS", "ME"], price: 1.0 },
  { label: "AK, IA, KS, ME, MI", question: "Will Republicans win Alaska, Iowa, Kansas, Maine, and Michigan, and lose Ohio and Texas?", republican: ["AK", "IA", "KS", "ME", "MI"], price: 0.5 },
  { label: "IA, KS, MI", question: "Will Republicans win Iowa, Kansas, and Michigan, and lose Alaska, Maine, Ohio, and Texas?", republican: ["IA", "KS", "MI"], price: 0.7 },
  { label: "IA, KS, OH", question: "Will Republicans win Iowa, Kansas, and Ohio, and lose Alaska, Maine, Michigan, and Texas?", republican: ["IA", "KS", "OH"], price: 1.3 },
  { label: "IA, KS, TX", question: "Will Republicans win Iowa, Kansas, and Texas, and lose Alaska, Maine, Michigan, and Ohio?", republican: ["IA", "KS", "TX"], price: 1.1 },
  { label: "IA, ME, MI", question: "Will Republicans win Iowa, Maine, and Michigan, and lose Alaska, Kansas, Ohio, and Texas?", republican: ["IA", "ME", "MI"], price: 0.5 },
  { label: "IA, ME, OH", question: "Will Republicans win Iowa, Maine, and Ohio, and lose Alaska, Kansas, Michigan, and Texas?", republican: ["IA", "ME", "OH"], price: 0.4 },
  { label: "IA, ME, TX", question: "Will Republicans win Iowa, Maine, and Texas, and lose Alaska, Kansas, Michigan, and Ohio?", republican: ["IA", "ME", "TX"], price: 0.4 },
  { label: "IA, MI, OH", question: "Will Republicans win Iowa, Michigan, and Ohio, and lose Alaska, Kansas, Maine, and Texas?", republican: ["IA", "MI", "OH"], price: 0.4 },
  { label: "IA, MI, TX", question: "Will Republicans win Iowa, Michigan, and Texas, and lose Alaska, Kansas, Maine, and Ohio?", republican: ["IA", "MI", "TX"], price: 0.4 },
  { label: "IA, OH, TX", question: "Will Republicans win Iowa, Ohio, and Texas, and lose Alaska, Kansas, Maine, and Michigan?", republican: ["IA", "OH", "TX"], price: 0.3 },
  { label: "KS, ME, MI", question: "Will Republicans win Kansas, Maine, and Michigan, and lose Alaska, Iowa, Ohio, and Texas?", republican: ["KS", "ME", "MI"], price: 0.3 },
  { label: "AK, IA, KS, ME, OH", question: "Will Republicans win Alaska, Iowa, Kansas, Maine, and Ohio, and lose Michigan and Texas?", republican: ["AK", "IA", "KS", "ME", "OH"], price: 0.6 },
  { label: "KS, ME, OH", question: "Will Republicans win Kansas, Maine, and Ohio, and lose Alaska, Iowa, Michigan, and Texas?", republican: ["KS", "ME", "OH"], price: 0.4 },
  { label: "KS, ME, TX", question: "Will Republicans win Kansas, Maine, and Texas, and lose Alaska, Iowa, Michigan, and Ohio?", republican: ["KS", "ME", "TX"], price: 0.4 },
  { label: "KS, MI, OH", question: "Will Republicans win Kansas, Michigan, and Ohio, and lose Alaska, Iowa, Maine, and Texas?", republican: ["KS", "MI", "OH"], price: 0.2 },
  { label: "KS, MI, TX", question: "Will Republicans win Kansas, Michigan, and Texas, and lose Alaska, Iowa, Maine, and Ohio?", republican: ["KS", "MI", "TX"], price: 0.2 },
  { label: "KS, OH, TX", question: "Will Republicans win Kansas, Ohio, and Texas, and lose Alaska, Iowa, Maine, and Michigan?", republican: ["KS", "OH", "TX"], price: 0.3 },
  { label: "ME, MI, OH", question: "Will Republicans win Maine, Michigan, and Ohio, and lose Alaska, Iowa, Kansas, and Texas?", republican: ["ME", "MI", "OH"], price: 0.2 },
  { label: "ME, MI, TX", question: "Will Republicans win Maine, Michigan, and Texas, and lose Alaska, Iowa, Kansas, and Ohio?", republican: ["ME", "MI", "TX"], price: 0.2 },
  { label: "ME, OH, TX", question: "Will Republicans win Maine, Ohio, and Texas, and lose Alaska, Iowa, Kansas, and Michigan?", republican: ["ME", "OH", "TX"], price: 0.2 },
  { label: "MI, OH, TX", question: "Will Republicans win Michigan, Ohio, and Texas, and lose Alaska, Iowa, Kansas, and Maine?", republican: ["MI", "OH", "TX"], price: 0.2 },
  { label: "AK, IA", question: "Will Republicans win Alaska and Iowa, and lose Kansas, Maine, Michigan, Ohio, and Texas?", republican: ["AK", "IA"], price: 1.4 },
];

const MAP_BY_KEY = new Map(
  TOSSUP_MAPS.map((item) => [item.republican.join(","), item]),
);

export function tossupCall(state: TossupState): TossupSide {
  return state.republican >= 50 ? "R" : "D";
}

/** The traded outcome for this exact set of Republican wins, if the payload has it. */
export function exactTossupMap(republican: string[]): TossupMap | undefined {
  const wanted = new Set(republican);
  const key = TOSSUP_STATES.filter((state) => wanted.has(state.abbr)).map((state) => state.abbr).join(",");
  return MAP_BY_KEY.get(key);
}

/**
 * Product of prices that are already in 100, returned in 100 to one decimal.
 * Half up. This is the product of those state prices, not a traded parlay.
 */
export function productIn100(prices: number[]): number {
  if (prices.length === 0) return 0;
  const thousand = BigInt(1000);
  const two = BigInt(2);
  const ten = BigInt(10);
  let numerator = BigInt(1);
  let denominator = BigInt(1);
  for (const price of prices) {
    numerator *= BigInt(Math.round(price * 10));
    denominator *= thousand;
  }
  const scaled = numerator * thousand;
  const rounded = (scaled + denominator / two) / denominator;
  return Number(rounded / ten) + Number(rounded % ten) / 10;
}
