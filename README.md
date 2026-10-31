# Before Tuesday

A shareable briefing for the November 3, 2026 midterms.

It shows two things:

- The **generic congressional ballot** in every state. The national number is an average of Decision Desk HQ, FiftyPlusOne, NBC News, RealClearPolitics, and Silver Bulletin, as compiled by Wikipedia on October 30, 2026 (Democrats +8.6). Most states do not have their own fresh generic-ballot poll, so each state figure shifts that state’s 2024 presidential margin by the same national change, 10.08 points toward the Democrats.
- A **Senate chance** in all 35 races. It is half the Polymarket Yes price at 4:10 p.m. CT on October 31, 2026, and half that candidate’s share of the two-candidate polling average from FiftyPlusOne and Electoral-Vote.com. When those averages do not name the same candidates, the chance is the Polymarket price alone. Each race links to its Polymarket market. The map stays the generic ballot.

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
