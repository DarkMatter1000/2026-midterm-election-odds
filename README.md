# Before Tuesday

A shareable briefing for the November 3, 2026 midterms.

It shows:

- The **generic congressional ballot** in every state. The national number is an average of Decision Desk HQ, FiftyPlusOne, NBC News, RealClearPolitics, and Silver Bulletin, as compiled by Wikipedia on October 30, 2026 (Democrats +8.6). Most states do not have their own fresh generic-ballot poll, so each state figure shifts that state’s 2024 presidential margin by the same national change, 10.08 points toward the Democrats. A slider on the page can move that national margin. The difference from D+8.6 is added to every state estimate and to every Senate polling margin. Refreshing the page restores D+8.6. The slider is not saved.
- A **Senate chance** in all 35 races, with a projected margin beside it. The chance is half the live Polymarket Yes price and half that candidate’s share of the two-candidate polling average from FiftyPlusOne, Electoral-Vote.com, 270toWin, and RealClearPolling. Extra aggregators change only the polling half. The Polymarket weight stays 50%. When those averages do not name the same candidates, the chance is the Polymarket price alone. The slider moves only the polling half of a blended race: one point of margin is half a point of two-party share toward the Democrat or independent challenger. Races with no 2026 average keep the Polymarket price and show the state’s generic-ballot estimate as the margin, labeled as that estimate rather than a poll. Each race links to its Polymarket market. The map stays the generic ballot.
- **Governor and House tabs.** Governors are the 36 states with a 2026 election, drawn on a state map and colored by the projected margin. Polymarket governor prices refresh from the public Gamma API. FiftyPlusOne, 270toWin, and RealClearPolling governor averages are included where those pages publish one. Electoral-Vote.com does not publish a governor polling average. The Polymarket half of a blended chance stays 50%. States with no 2026 race stay gray. House districts are outlined from the Census Bureau’s 2025 cartographic boundary file for the 119th Congress at 1:20,000,000. Clicking a district shows the Polymarket candidates, the district generic-ballot estimate beside the projection, and the 2024 House and presidential margins. A district with a Democratic and a Republican price is colored by that price gap. The others are colored by the district generic-ballot estimate. Alabama, California, Florida, Louisiana, North Carolina, Ohio, Tennessee, Texas, and Utah enacted maps after that file’s May 31, 2024 cutoff; the page says so, and the 2024 margins on those districts are for the district as contested in 2024.
- The **2024 House popular vote** in each state, next to the 2024 presidential margin, and the **2024 exit-poll electorate** (age, ethnicity, and gender) where CNN published a state exit poll.
- A **turnout-weighted generic ballot**. Each state’s estimate, after the national slider and any adjustment on that state alone, is split into Democratic and Republican shares with the national “other” share held at 5.2. Those shares are applied to that state’s 2022 U.S. House vote. The national margin on the card is the sum of those ballots, not the D+8.6 aggregator average. The same per-state adjustment is a slider in a table of all 50 states, 20 points either way from the original estimate, with Reset on that row. The table opens A to Z. Clicking a column header sorts by that column, and a second click reverses it. That table’s 2024 generic column is the 2024 U.S. House popular-vote margin. A turnout slider with that table scales every state’s 2022 House vote from 70% to 130%; scaling every state by the same percent changes the vote totals and leaves the national margin unchanged. Each row can also raise or lower that state by one percentage point of its 2024 U.S. House vote, counting every House candidate rather than the presidential popular vote, and that one-state change moves the national margin because the state’s weight changes. State sliders are not saved. Refreshing the page clears them, the national slider, the turnout slider, and every per-state 2024 turnout adjustment.

Senate and governor dossiers include Polymarket margin-of-victory brackets, and say when a race has no such market. Each market opens from the Democratic outcome to the Republican outcome, widest Democratic margin first, and can be switched to highest odds. Alaska and Maine Senate each have a first-round market and a final-round market, and each one sorts on its own. The bottom of the Senate tab has a tossup detector for Alaska, Iowa, Kansas, Maine, Michigan, Ohio, and Texas that compares your Republican or Democrat picks with Polymarket’s swing-state map and lists every traded map from most likely to least.

Polymarket prices refresh from the public Gamma API on the server. Polls and VoteHub remain snapshots.

## Run it locally

You do not need a local copy to send the site to friends. Publish it, or open the running preview, and share that link.

If you want to run it on your own computer:

```bash
npm install
npm run dev
```

The dev server listens on port **43123**. Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

```bash
npm run lint
npm run build
npm start
```

## Where the numbers come from

- [Generic congressional ballot aggregate polls](https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_elections#Generic_congressional_ballot_aggregate_polls), Wikipedia, updated October 30, 2026
- [Polymarket](https://polymarket.com/politics/senate-elections), live Yes prices from the public Gamma API
- [FiftyPlusOne, 2026 averages](https://fiftyplusone.news/averages)
- [Electoral-Vote.com, Senate averages](https://electoral-vote.com/evp2026/Senate/averages.html)
- [270toWin, 2026 Senate polls](https://www.270towin.com/polls/latest-2026-senate-election-polls/) and [governor polls](https://www.270towin.com/2026-governor-polls/texas), fetched November 1, 2026
- [RealClearPolling, 2026 Senate toss-ups](https://www.realclearpolling.com/elections/senate/2026/toss-ups) and [governor toss-ups](https://www.realclearpolling.com/elections/governor/2026/toss-ups), fetched November 1, 2026
- [2024 presidential results by state](https://en.wikipedia.org/wiki/2024_United_States_presidential_election#Results_by_state)
- 2024 U.S. House statewide popular vote, from each state’s Wikipedia page, for example [Texas](https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Texas). Democratic and Republican percentages are the statewide total, including at-large states. Alaska is the first-round vote.
- [Federal Elections 2022](https://www.fec.gov/resources/cms-content/documents/federalelections2022.pdf), the Federal Election Commission’s certified general-election votes cast for U.S. House candidates. That is the turnout anchor for the weighted generic ballot: one integer per state, not a 2026 forecast. The District of Columbia is excluded. Indiana is the November full term only; the publication’s Indiana total also includes the special election for the unexpired term in the 2nd district, and those ballots are not counted twice. Alaska and Maine are first-round ballots. Each state still links to its Wikipedia page for the same election, for example [Texas](https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Texas). A few of those pages print a total cell that does not match the certified return, and the page uses the certified total.
- [CNN 2024 presidential exit polls](https://www.cnn.com/election/2024/exit-polls), Edison Research for the National Election Pool. State tables are published for Arizona, Florida, Georgia, Michigan, Nevada, North Carolina, Ohio, Pennsylvania, Texas, and Wisconsin. The other states are left blank on purpose.
- [Census Bureau cartographic boundary files](https://www.census.gov/geographies/mapping-files/time-series/geo/cartographic-boundary.html), 2025 vintage, 119th Congressional Districts, 1:20,000,000 (`cb_2025_us_cd119_20m`). The House tab draws those outlines.
- [The Downballot, 2024 presidential results by congressional district](https://www.the-downballot.com/p/its-here-the-downballots-2024-presidential), for the districts used in 2024. The margin on a district is Trump’s margin from that table.
- [Clerk of the House, Statistics of the November 5, 2024 election](https://clerk.house.gov/member_info/electionInfo/2024/statistics2024.pdf), the Republican-versus-Democrat House margin in each district. Polymarket House prices refresh from Gamma with the other winner markets.
- [VoteHub’s 2026 forecast](https://votehub.com/2026-forecast/), ratings fetched at 10:15 p.m. CT on October 31, 2026: the Solid, Likely, Lean, Tilt, and Tossup labels VoteHub prints on its Senate, House, and governor maps, with a link to each race’s VoteHub page.
