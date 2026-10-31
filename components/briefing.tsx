"use client";

import { useState, useSyncExternalStore } from "react";
import { Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarginTrack } from "@/components/margin-track";
import { UsMap } from "@/components/us-map";
import {
  BALLOT_AS_OF,
  EDITION,
  EVEN_SWING,
  FORECAST_AS_OF,
  GENERIC_POLLS,
  NATIONAL_GENERIC,
  PRESIDENTIAL_2024_MARGIN_D,
  SENATE_RACES,
  STATES,
  comparisonCopy,
  daysUntilElection,
  formatIn100,
  formatMargin,
  genericMargin,
  getState,
  matchesQuery,
  senateUrl,
  type Candidate,
  type SenateRace,
  type StateRecord,
} from "@/lib/election";

type Layer = "ballot" | "senate";

export function Briefing() {
  const [layer, setLayer] = useState<Layer>("ballot");
  const [query, setQuery] = useState("");
  const selected = useSyncExternalStore(subscribeToHash, readHash, () => "KS");
  const days = useSyncExternalStore(subscribeToNothing, () => daysUntilElection(), () => UNKNOWN_DAYS);

  function select(abbr: string) {
    const url = new URL(window.location.href);
    url.hash = abbr;
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    if (window.matchMedia("(max-width: 1023px)").matches) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById("state-dossier")?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    }
  }

  const filtered = SENATE_RACES.filter((state) => matchesQuery(state, query));
  const state = selected === "DC" ? undefined : getState(selected);

  return (
    <div className="min-h-full">
      <div className="flex h-1" aria-hidden>
        <div className="h-full flex-1" style={{ background: "#8f2d2d" }} />
        <div className="h-full flex-1" style={{ background: "#1e4f8f" }} />
      </div>
      <header className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.22em] text-muted-foreground uppercase">
              Midterm briefing
            </p>
            <h1 className="font-heading text-5xl tracking-tight text-balance sm:text-6xl">
              Before Tuesday
            </h1>
          </div>
          <p className="max-w-sm text-sm leading-6 text-muted-foreground sm:text-right">
            {countdown(days)}
            <span className="mt-1 block">
              Numbers below are the {FORECAST_AS_OF} snapshot. They do not update on their own.
            </span>
          </p>
        </div>
        <p className="max-w-3xl text-lg leading-8">
          The generic congressional ballot in every state, and the chance each Senate
          nominee wins on November 3. Built so you can send one link instead of a group chat full of screenshots.
        </p>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 sm:px-6">
        <section aria-label="National picture" className="grid overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
          <article className="bg-card p-5">
            <h2 className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Generic ballot
            </h2>
            <p className="mt-3 font-heading text-4xl tabular-nums">
              {formatMargin(NATIONAL_GENERIC.marginD)}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Democrats {NATIONAL_GENERIC.dem}%, Republicans {NATIONAL_GENERIC.rep}%,
              other or undecided {NATIONAL_GENERIC.other}%. Average of five aggregators, {BALLOT_AS_OF}.
            </p>
          </article>
          <article className="bg-card p-5">
            <h2 className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Senate control
            </h2>
            <p className="mt-3 font-heading text-4xl tabular-nums">58 in 100</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Democrats to control the chamber, Republicans 42 in 100. If every race goes to its favorite: Democrats 53, Republicans 47.
            </p>
          </article>
          <article className="bg-card p-5">
            <h2 className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              House control
            </h2>
            <p className="mt-3 font-heading text-4xl tabular-nums">83 in 100</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Democrats to control the House. If every district goes to its favorite: Democrats 233, Republicans 202.
            </p>
          </article>
        </section>

        <p className="text-sm leading-6 text-muted-foreground">
          Same forecast, read across both chambers: Democrats win both 57 times in 100,
          a Democratic House with a Republican Senate 26 in 100, Republicans win both 15 in 100,
          and a Democratic Senate with a Republican House 2 in 100. Today’s Senate is 53 Republican
          and 47 Democratic-aligned, so the favorite-outcome map is a four-seat Democratic gain.
        </p>

        <section aria-label="Closest Senate races" className="flex flex-col gap-3">
          <h2 className="font-heading text-2xl">Closest Senate races</h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {SENATE_RACES.slice(0, 8).map((raceState) => (
              <Button
                key={raceState.abbr}
                variant={selected === raceState.abbr && layer === "senate" ? "default" : "outline"}
                className="h-11 shrink-0"
                onClick={() => {
                  setLayer("senate");
                  select(raceState.abbr);
                }}
              >
                {raceState.abbr}
                <span className="tabular-nums text-current/80">
                  {formatMargin(raceState.senate!.marginD)}
                </span>
              </Button>
            ))}
          </div>
        </section>

        <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Tabs
                value={layer}
                onValueChange={(value) => {
                  if (value === "ballot" || value === "senate") setLayer(value);
                }}
              >
                <TabsList variant="line" className="h-11">
                  <TabsTrigger value="ballot" className="h-9 px-3">
                    Generic ballot
                  </TabsTrigger>
                  <TabsTrigger value="senate" className="h-9 px-3">
                    Senate odds
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="ballot" className="sr-only">
                  Map colored by the state generic-ballot estimate.
                </TabsContent>
                <TabsContent value="senate" className="sr-only">
                  Map colored by the Senate forecast margin.
                </TabsContent>
              </Tabs>
              <div className="relative w-full sm:max-w-xs">
                <Search
                  className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="State or candidate"
                  aria-label="Search states or candidates"
                  className="h-11 pl-8"
                />
              </div>
            </div>
            <UsMap layer={layer} selected={selected} query={query} onSelect={select} />
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Jump to a state</span>
              <select
                value={selected}
                onChange={(event) => select(event.target.value)}
                className="h-11 rounded-lg border border-input bg-background px-3"
              >
                {STATES.map((item) => (
                  <option key={item.abbr} value={item.abbr}>
                    {item.name}
                  </option>
                ))}
                <option value="DC">District of Columbia</option>
              </select>
            </label>
          </div>
          <StateDossier
            abbr={selected}
            state={state}
            onSenate={() => setLayer("senate")}
          />
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="senate-board-heading">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="senate-board-heading" className="font-heading text-3xl">
              All 35 Senate races
            </h2>
            <p className="text-sm text-muted-foreground">
              {query.trim()
                ? `${filtered.length} of 35 match “${query.trim()}”`
                : "Closest first. A chance of 60 in 100 still loses about two times in five."}
            </p>
          </div>
          {filtered.length === 0 ? (
            <p className="rounded-xl border bg-card p-6 text-sm">
              No race matches that search. Try a state name or a candidate’s last name.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-card">
              {filtered.map((raceState) => (
                <RaceRow
                  key={raceState.abbr}
                  state={raceState}
                  selected={selected === raceState.abbr}
                  onSelect={() => {
                    setLayer("senate");
                    select(raceState.abbr);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4" aria-labelledby="polls-heading">
          <h2 id="polls-heading" className="font-heading text-3xl">
            National generic ballot
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
            The question asks which party’s candidate you would support for Congress,
            without naming anyone. These are aggregator averages, as compiled by Wikipedia
            on {BALLOT_AS_OF}. The bottom row is the average Wikipedia printed.
          </p>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">
                National generic congressional ballot averages as of {BALLOT_AS_OF}
              </caption>
              <thead className="border-b text-xs tracking-wide text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Source</th>
                  <th scope="col" className="px-4 py-3 font-medium">Polls included</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Dem</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Rep</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Other</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Margin</th>
                </tr>
              </thead>
              <tbody>
                {GENERIC_POLLS.map((poll) => (
                  <tr key={poll.source} className="border-b last:border-0">
                    <th scope="row" className="px-4 py-3 font-medium">{poll.source}</th>
                    <td className="px-4 py-3 text-muted-foreground">{poll.dates}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{poll.dem.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right tabular-nums">{poll.rep.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right tabular-nums">{poll.other.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                      {formatMargin(poll.marginD)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted/60">
                  <th scope="row" className="px-4 py-3 font-medium">Average</th>
                  <td className="px-4 py-3 text-muted-foreground">{BALLOT_AS_OF}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{NATIONAL_GENERIC.dem.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right tabular-nums">{NATIONAL_GENERIC.rep.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right tabular-nums">{NATIONAL_GENERIC.other.toFixed(1)}%</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">
                    {formatMargin(NATIONAL_GENERIC.marginD)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex max-w-3xl flex-col gap-4 text-sm leading-7" aria-labelledby="method-heading">
          <h2 id="method-heading" className="font-heading text-3xl">
            How to read this
          </h2>
          <p>
            A fresh generic-ballot poll is not published for all 50 states in the last week.
            The national number is. Democrats lead by {NATIONAL_GENERIC.marginD} points.
            The 2024 presidential popular vote was Republican by {Math.abs(PRESIDENTIAL_2024_MARGIN_D)} points,
            so the national environment is {EVEN_SWING} points more Democratic than that election.
          </p>
          <p>
            Each state estimate takes that state’s 2024 presidential margin and moves it
            {" "}{EVEN_SWING} points toward the Democrats. Kansas voted Republican by 16.12 points
            for president, so the estimate is Republican by about 6. Texas, Ohio, and Iowa
            land near even. Vermont and Wyoming stay landslides. This assumes the shift is
            the same everywhere. It is not a poll, and in states that were already
            blowouts a uniform shift can run past what a real ballot would show.
          </p>
          <p>
            The Senate figures are a separate forecast: Call the Map’s CTMM 2.2 model,
            edition {EDITION}, published {FORECAST_AS_OF}. They use state polls, history,
            and the national environment. Expert ratings are not an input. A candidate at
            74 in 100 is supposed to lose about one time in four. When the Senate margin
            and the generic-ballot estimate disagree, that is the candidate, not the national mood.
            Collins in Maine and Hamilton in Kansas are the clearest examples on this map.
          </p>
          <p>
            Georgia’s percentage is the chance to finish ahead on November 3, not a runoff.
            Alaska and Maine include ranked-choice transfers. Nebraska’s challenger is
            independent Dan Osborn. South Carolina’s Republican nominee is Darline Graham;
            Lindsey Graham died on July 11, 2026, after winning the primary.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <a className="underline underline-offset-4" href="https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_elections#Generic_congressional_ballot_aggregate_polls">
                Wikipedia, generic congressional ballot aggregate polls
              </a>
            </li>
            <li>
              <a className="underline underline-offset-4" href="https://www.callthemap.com/state-of-the-race">
                Call the Map, state of the race, {FORECAST_AS_OF}
              </a>
            </li>
            <li>
              <a className="underline underline-offset-4" href="https://www.callthemap.com/senate">
                Call the Map Senate forecast
              </a>
              {" "}and{" "}
              <a className="underline underline-offset-4" href="https://www.callthemap.com/house">
                House forecast
              </a>
            </li>
            <li>
              <a className="underline underline-offset-4" href="https://en.wikipedia.org/wiki/2024_United_States_presidential_election#Results_by_state">
                2024 presidential results by state
              </a>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}

const UNKNOWN_DAYS = 10_000;

function subscribeToNothing() {
  return () => {};
}

function subscribeToHash(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

function readHash() {
  const abbr = window.location.hash.replace("#", "").toUpperCase();
  if (getState(abbr) || abbr === "DC") return abbr;
  return "KS";
}

function countdown(days: number): string {
  if (days === UNKNOWN_DAYS) return "Election Day is Tuesday, November 3, 2026.";
  if (days > 1) return `${days} days until Election Day, Tuesday, November 3.`;
  if (days === 1) return "Tomorrow is Election Day, Tuesday, November 3.";
  if (days === 0) return "Today is Election Day.";
  if (days === -1) return "Election Day was yesterday. This page is still the October 31 forecast, not a results page.";
  return `Election Day was ${Math.abs(days)} days ago. This page is still the October 31 forecast, not a results page.`;
}

function StateDossier({
  abbr,
  state,
  onSenate,
}: {
  abbr: string;
  state: StateRecord | undefined;
  onSenate: () => void;
}) {
  if (abbr === "DC" || !state) {
    return (
      <aside id="state-dossier" className="rounded-xl border bg-card p-5 lg:sticky lg:top-4">
        <h2 className="font-heading text-3xl">District of Columbia</h2>
        <p className="mt-3 text-sm leading-6">
          D.C. has no U.S. Senate seat. The state generic-ballot estimate on this page
          covers the 50 states, using each state’s 2024 presidential result. D.C. is left off
          that estimate because a uniform shift from an 84-point presidential margin is not a useful ballot number.
        </p>
      </aside>
    );
  }

  const generic = genericMargin(state.trumpMargin2024);
  const url = senateUrl(state);

  return (
    <aside id="state-dossier" className="flex flex-col gap-5 rounded-xl border bg-card p-5 lg:sticky lg:top-4">
      <div>
        <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
          {state.abbr}
        </p>
        <h2 className="font-heading text-4xl tracking-tight">{state.name}</h2>
      </div>
      <p className="text-base leading-7">{comparisonCopy(state)}</p>
      <div className="flex flex-col gap-3">
        <MarginTrack marginD={generic} label="Generic ballot" />
        {state.senate ? (
          <MarginTrack marginD={state.senate.marginD} label="Senate forecast" />
        ) : (
          <p className="text-sm text-muted-foreground">No Senate race on November 3.</p>
        )}
      </div>
      <p className="text-sm leading-6 text-muted-foreground">
        2024 presidential margin {formatMargin(-state.trumpMargin2024, 2)}.
        National shift D+{EVEN_SWING.toFixed(2)}.
        Estimate {formatMargin(generic)}.
      </p>
      {state.senate ? <ChanceBlock race={state.senate} /> : null}
      {state.senate?.caveat ? (
        <p className="text-sm leading-6 text-muted-foreground">{state.senate.caveat}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {state.senate ? (
          <Button variant="outline" className="h-11" onClick={onSenate}>
            Show on the Senate map
          </Button>
        ) : null}
        {url ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "outline" }), "h-11")}
          >
            Race forecast
          </a>
        ) : null}
      </div>
    </aside>
  );
}

function ChanceBlock({ race }: { race: SenateRace }) {
  const people = contenders(race);
  const total = people.reduce((sum, person) => sum + person.win, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-3 overflow-hidden rounded-full" aria-hidden>
        {people.map((person) => (
          <div
            key={person.name}
            style={{
              width: `${(person.win / total) * 100}%`,
              background: person.party === "D" ? "#1e4f8f" : person.party === "R" ? "#8f2d2d" : "#2f6b4f",
            }}
          />
        ))}
      </div>
      <ul className="flex flex-col gap-2">
        {people.map((person) => (
          <li key={person.name} className="flex items-baseline justify-between gap-3 text-sm">
            <span>
              <span
                className="mr-2 inline-block size-2 rounded-full"
                style={{
                  background: person.party === "D" ? "#1e4f8f" : person.party === "R" ? "#8f2d2d" : "#2f6b4f",
                }}
                aria-hidden
              />
              {person.name}
              <span className="text-muted-foreground"> · {partyName(person.party)}</span>
            </span>
            <span className="shrink-0 tabular-nums">{formatIn100(person.win)}</span>
          </li>
        ))}
      </ul>
      <p className="text-xs tracking-wide text-muted-foreground uppercase">{race.rating}</p>
    </div>
  );
}

function RaceRow({
  state,
  selected,
  onSelect,
}: {
  state: StateRecord;
  selected: boolean;
  onSelect: () => void;
}) {
  const race = state.senate!;
  const people = contenders(race);

  return (
    <article className={`grid gap-3 border-b p-4 last:border-0 md:grid-cols-[11rem_1fr_6.5rem] ${selected ? "bg-muted/70" : ""}`}>
      <div>
        <Button
          variant="ghost"
          className="h-auto px-0 text-left font-heading text-2xl hover:bg-transparent"
          onClick={onSelect}
          aria-current={selected ? "true" : undefined}
        >
          {state.name}
        </Button>
        <p className="text-sm text-muted-foreground">{race.rating}</p>
      </div>
      <ul className="flex flex-col justify-center gap-1 text-sm">
        {people.map((person) => (
          <li key={person.name} className="flex justify-between gap-3">
            <span>
              {person.name}
              <span className="text-muted-foreground"> · {partyName(person.party)}</span>
            </span>
            <span className="tabular-nums">{formatIn100(person.win)}</span>
          </li>
        ))}
      </ul>
      <p className="font-heading text-2xl tabular-nums md:text-right">
        {formatMargin(race.marginD)}
      </p>
    </article>
  );
}

function contenders(race: SenateRace): Candidate[] {
  const people: Candidate[] = [];
  if (race.dem) people.push(race.dem);
  if (race.ind) people.push(race.ind);
  people.push(race.rep);
  return people;
}

function partyName(party: "D" | "R" | "I"): string {
  if (party === "D") return "Democrat";
  if (party === "R") return "Republican";
  return "Independent";
}
