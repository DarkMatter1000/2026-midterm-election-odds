# Before Tuesday

A shareable briefing for the November 3, 2026 midterms.

It shows two things:

- The **generic congressional ballot** in every state. The national number is an average of Decision Desk HQ, FiftyPlusOne, NBC News, RealClearPolitics, and Silver Bulletin, as compiled by Wikipedia on October 30, 2026 (Democrats +8.6). Most states do not have their own fresh generic-ballot poll, so each state figure shifts that state’s 2024 presidential margin by the same national change, 10.08 points toward the Democrats. A slider on the page can move that national margin. The difference from D+8.6 is added to every state estimate and to every Senate polling margin. Refreshing the page restores D+8.6. The slider is not saved.
- A **Senate chance** in all 35 races, with a projected margin beside it. The chance is half the Polymarket Yes price at 4:10 p.m. CT on October 31, 2026, and half that candidate’s share of the two-candidate polling average from FiftyPlusOne and Electoral-Vote.com. When those averages do not name the same candidates, the chance is the Polymarket price alone. The slider moves only the polling half of a blended race: one point of margin is half a point of two-party share toward the Democrat or independent challenger. Races with no 2026 average keep the Polymarket price and show the state’s generic-ballot estimate as the margin, labeled as that estimate rather than a poll. Each race links to its Polymarket market. The map stays the generic ballot.
- The **2024 House popular vote** in each state, next to the 2024 presidential margin, and the **2024 exit-poll electorate** (age, ethnicity, and gender) where CNN published a state exit poll.
- A **turnout-weighted generic ballot**. Each state’s estimate, after the national slider and any adjustment on that state alone, is split into Democratic and Republican shares with the national “other” share held at 5.2. Those shares are applied to that state’s 2022 U.S. House vote. The national margin on the card is the sum of those ballots, not the D+8.6 aggregator average. The same per-state adjustment is edited in an alphabetical table of all 50 states. A turnout slider with that table scales every state’s 2022 House vote from 70% to 130%; scaling every state by the same percent changes the vote totals and leaves the national margin unchanged. State adjustments are not saved. Refreshing the page clears them, the national slider, and the turnout slider.

The page is a snapshot. It does not refresh when new polls come out.

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
- [Polymarket](https://polymarket.com/politics/senate-elections), Senate prices at 4:10 p.m. CT on October 31, 2026
- [FiftyPlusOne, 2026 averages](https://fiftyplusone.news/averages)
- [Electoral-Vote.com, Senate averages](https://electoral-vote.com/evp2026/Senate/averages.html)
- [2024 presidential results by state](https://en.wikipedia.org/wiki/2024_United_States_presidential_election#Results_by_state)
- 2024 U.S. House statewide popular vote, from each state’s Wikipedia page, for example [Texas](https://en.wikipedia.org/wiki/2024_United_States_House_of_Representatives_elections_in_Texas). Democratic and Republican percentages are the statewide total, including at-large states. Alaska is the first-round vote.
- [Federal Elections 2022](https://www.fec.gov/resources/cms-content/documents/federalelections2022.pdf), the Federal Election Commission’s certified general-election votes cast for U.S. House candidates. That is the turnout anchor for the weighted generic ballot: one integer per state, not a 2026 forecast. The District of Columbia is excluded. Indiana is the November full term only; the publication’s Indiana total also includes the special election for the unexpired term in the 2nd district, and those ballots are not counted twice. Alaska and Maine are first-round ballots. Each state still links to its Wikipedia page for the same election, for example [Texas](https://en.wikipedia.org/wiki/2022_United_States_House_of_Representatives_elections_in_Texas). A few of those pages print a total cell that does not match the certified return, and the page uses the certified total.
- [CNN 2024 presidential exit polls](https://www.cnn.com/election/2024/exit-polls), Edison Research for the National Election Pool. State tables are published for Arizona, Florida, Georgia, Michigan, Nevada, North Carolina, Ohio, Pennsylvania, Texas, and Wisconsin. The other states are left blank on purpose.
