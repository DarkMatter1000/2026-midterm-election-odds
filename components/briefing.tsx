"use client";

import { useState, useSyncExternalStore } from "react";
import { Search } from "lucide-react";
import { GovernorMap } from "@/components/governor-map";
import { HouseMap, districtById, districtTitle, isNewerThanCensus } from "@/components/house-map";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "cn";
import { Input } from "@/components/ui/input";
import { MarginTrack } from "@/components/margin-track";
import { UsMap } from "@/components/us-map";
import {
  BALLOT_AS_OF,
  EVEN_SWING,
  GENERIC_POLLS,
  NATIONAL_GENERIC,
  PRESIDENTIAL_2024_MARGIN_D,
  SENATE_RACES,
  STATES,
  comparisonCopy,
  daysUntilElection,
  formatMargin,
  formatVotes,
  getState,
  matchesQuery,
  scenarioGeneric,
  senateProjection,
  stateBallot,
  stepTurnoutAdjust,
  turnoutOf2024,
  weightedNational,
  type StateRecord,
} from "@/lib/election";
import { HOUSE_2022, HOUSE_2022_FEC } from "@/lib/house-2022";
import { EXIT_POLL_STATE_NAMES, EXIT_POLLS, type ExitPoll } from "@/lib/exit-polls";
import { GOVERNOR_POLYMARKET_AS_OF, GOVERNORS, governorProjection } from "@/lib/governor-live";
import {
  HOUSE_2024_DISTRICT,
  HOUSE_MARKETS,
  HOUSE_POLYMARKET_AS_OF,
  HOUSE_PRES_PAGE,
  HOUSE_PRES_SOURCE,
  HOUSE_RESULT_SOURCE,
  PRES_2024,
  districtGeneric,
  districtShade,
  houseChances,
  housePollMargin,
  houseRace,
  type DistrictShade,
} from "@/lib/house-live";
import { HOUSE_2024 } from "@/lib/house-2024";
import { DISTRICT_PATHS } from "@/lib/district-paths";
import {
  HOUSE_CONTROL,
  POLYMARKET_AS_OF,
  SENATE_CONTROL,
  averageShares,
  blendsPolls,
  closeness,
  formatChance,
  marginSides,
  partyName,
  pollMarginPoints,
  quotedChances,
  type SenateRace,
  type Share,
} from "@/lib/senate-live";

function signedPoints(value: number): string {
  if (value === 0) return "0.0";
  const abs = Math.abs(value).toFixed(1);
  return value > 0 ? `+${abs} Democratic` : `−${abs} Republican`;
}

function signedCompact(value: number): string {
  if (value === 0) return "0.0";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}`;
}

function deltaLabel(delta: number): string {
  const abs = Math.abs(delta).toFixed(1);
  const unit = abs === "1.0" ? "point" : "points";
  if (delta === 0) return `the calculated ${formatMargin(NATIONAL_GENERIC.marginD)}`;
  const direction = delta > 0 ? "more Democratic" : "more Republican";
  return `${abs} ${unit} ${direction} than the calculated ${formatMargin(NATIONAL_GENERIC.marginD)}`;
}

export function Briefing() {
  const [query, setQuery] = useState("");
  const [slider, setSlider] = useState(NATIONAL_GENERIC.marginD);
  const [custom, setCustom] = useState<Record<string, number>>({});
  const [turnoutPercent, setTurnoutPercent] = useState(100);
  const [turnoutAdjust, setTurnoutAdjust] = useState<Record<string, number>>({});
  const [chamber, setChamber] = useState<"senate" | "governors" | "house">("senate");
  const scenario = scenarioGeneric(slider);
  const delta = scenario.delta;

  function customDelta(abbr: string): number {
    return custom[abbr] ?? 0;
  }

  function shiftFor(abbr: string): number {
    return Number((delta + customDelta(abbr)).toFixed(1));
  }

  function setCustomDelta(abbr: string, value: number) {
    const next = Number(value.toFixed(1));
    setCustom((prev) => {
      if (next === 0) {
        const rest = { ...prev };
        delete rest[abbr];
        return rest;
      }
      return { ...prev, [abbr]: next };
    });
  }

  function stateTurnoutAdjust(abbr: string): number {
    return turnoutAdjust[abbr] ?? 0;
  }

  function stepStateTurnout(abbr: string, direction: 1 | -1) {
    const baseline = HOUSE_2022[abbr].total;
    const votes2024 = HOUSE_2024[abbr].votes;
    const next = stepTurnoutAdjust(
      baseline,
      votes2024,
      turnoutPercent,
      stateTurnoutAdjust(abbr),
      direction,
    );
    setTurnoutAdjust((prev) => {
      if (next === 0) {
        const rest = { ...prev };
        delete rest[abbr];
        return rest;
      }
      return { ...prev, [abbr]: next };
    });
  }

  const ballots = STATES.map((state) => {
    const baseline = HOUSE_2022[state.abbr].total;
    const votes2024 = HOUSE_2024[state.abbr].votes;
    const adjust = stateTurnoutAdjust(state.abbr);
    const turnout = turnoutOf2024(baseline, votes2024, turnoutPercent, adjust);
    const ballot = stateBallot(
      state.trumpMargin2024,
      turnout.expected,
      delta,
      customDelta(state.abbr),
    );
    return {
      ...ballot,
      abbr: state.abbr,
      name: state.name,
      customDelta: customDelta(state.abbr),
      baseline,
      baselineUrl: HOUSE_2022[state.abbr].url,
      votes2024,
      votes2024Url: HOUSE_2024[state.abbr].url,
      turnoutAdjust: adjust,
      percentOf2024: turnout.displayedPercent,
    };
  });
  const baselineNational = ballots.reduce((sum, row) => sum + row.baseline, 0);
  const ballotByAbbr = new Map(ballots.map((ballot) => [ballot.abbr, ballot]));
  const margins = Object.fromEntries(ballots.map((ballot) => [ballot.abbr, ballot.margin]));
  const weighted = weightedNational(ballots);
  const anyCustom = ballots.some((ballot) => ballot.customDelta !== 0);
  const anyTurnoutAdjust = ballots.some((ballot) => ballot.turnoutAdjust !== 0);

  const races = [...SENATE_RACES].sort(
    (a, b) => closeness(a.senate!, shiftFor(a.abbr)) - closeness(b.senate!, shiftFor(b.abbr)),
  );
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

  const filtered = races.filter((state) => matchesQuery(state, query));
  const state = selected === "DC" ? undefined : getState(selected);

  return (
    <div className="min-h-full w-full min-w-0">
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
              Polymarket prices are the {POLYMARKET_AS_OF} snapshot. They do not update on their own.
            </span>
          </p>
        </div>
        <p className="max-w-3xl text-lg leading-8">
          The generic congressional ballot in every state, Senate and governor chances that split
          Polymarket’s price with the public polling averages, and House districts drawn with
          their real outlines. Flip among the three. Built so you can send one link instead of a
          group chat full of screenshots.
        </p>
      </header>

      <main className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-10 px-4 pb-16 sm:px-6 [&>*]:min-w-0">
        <section aria-label="National picture" className="grid items-start overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
          <article className="bg-card p-5">
            <h2 className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Generic ballot
            </h2>
            <p className="mt-3 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Turnout-weighted estimate
            </p>
            <p
              className="font-heading text-4xl tabular-nums"
              data-testid="national-margin"
              data-margin={weighted.margin.toFixed(4)}
            >
              {formatMargin(weighted.margin, 2)}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground" data-testid="national-votes">
              Democrats{" "}
              <span className="font-medium text-foreground tabular-nums" data-testid="national-dem-votes">
                {formatVotes(weighted.demVotes)}
              </span>{" "}
              votes, Republicans{" "}
              <span className="font-medium text-foreground tabular-nums" data-testid="national-rep-votes">
                {formatVotes(weighted.repVotes)}
              </span>{" "}
              votes. The denominator is{" "}
              <span className="tabular-nums" data-testid="national-turnout">
                {formatVotes(weighted.turnout)}
              </span>{" "}
              expected ballots
              {turnoutPercent === 100 && !anyTurnoutAdjust
                ? ", the 2022 House vote in the 50 states."
                : anyTurnoutAdjust
                  ? ", after the national turnout setting and any state’s own share of its 2024 House vote."
                  : `, ${turnoutPercent}% of the 2022 House vote in the 50 states (${formatVotes(baselineNational)}).`}{" "}
              That 2022 total is the turnout anchor, not a forecast of how many people will vote in 2026.
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This margin is Democratic votes minus Republican votes, divided by those expected ballots.
              A state moves it in proportion to its 2022 House vote, not by a flat shift and not by an equal share of 50 states.
              It is a different statistic from the {formatMargin(NATIONAL_GENERIC.marginD)} aggregator average.
            </p>
            <p className="mt-3 text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">
              Aggregator scenario
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Democrats {scenario.dem.toFixed(1)}%, Republicans {scenario.rep.toFixed(1)}%,
              other or undecided {scenario.other.toFixed(1)}%.{" "}
              {delta === 0
                ? `The calculated average of five aggregators is ${formatMargin(NATIONAL_GENERIC.marginD)}, ${BALLOT_AS_OF}. The turnout-weighted estimate above will not match that figure, because it sums these state estimates by 2022 House votes instead of averaging the aggregators.`
                : `The ${BALLOT_AS_OF} aggregator average was Democrats ${NATIONAL_GENERIC.dem.toFixed(1)}% and Republicans ${NATIONAL_GENERIC.rep.toFixed(1)}%. The slider below moves that aggregator scenario. Half of its delta is added to Democrats and subtracted from Republicans. Other stays ${NATIONAL_GENERIC.other.toFixed(1)}%. The headline margin is still the turnout-weighted sum.`}
            </p>
            <label className="mt-4 grid gap-2 text-sm">
              <span className="font-medium" data-testid="generic-delta">
                {formatMargin(scenario.marginD)}
                <span className="font-normal text-muted-foreground"> · {deltaLabel(delta)}</span>
              </span>
              <input
                type="range"
                min={0}
                max={16}
                step={0.1}
                value={scenario.marginD}
                data-testid="generic-slider"
                aria-label="National generic ballot scenario"
                aria-valuemin={0}
                aria-valuemax={16}
                aria-valuenow={scenario.marginD}
                aria-valuetext={`${formatMargin(scenario.marginD)}. ${deltaLabel(delta)}`}
                onChange={(event) => setSlider(Number(event.target.value))}
                className="h-11 w-full cursor-pointer accent-foreground"
              />
            </label>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Delta = this slider minus {NATIONAL_GENERIC.marginD.toFixed(1)}. A delta of +1.0
              adds 1.0 point toward Democrats on every state generic-ballot estimate, on every
              House district generic-ballot estimate, on every Senate polling margin, and on every
              governor polling margin. Where a House race has a polling average, that projected
              margin moves by the same point, and only the polling half of the chance moves. A
              Polymarket-only price stays the snapshot. A per-state adjustment is applied after
              that, and only to that state. Turnout does not move those chances or margins. The
              range runs from even to D+16.0. Refresh the page
              to restore {formatMargin(NATIONAL_GENERIC.marginD)}, clear every state adjustment, return turnout to 100% of the 2022 House vote, and clear every state’s 2024 turnout adjustment. Nothing is saved.
            </p>
          </article>
          <article className="bg-card p-5">
            <h2 className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Senate control
            </h2>
            <p className="mt-3 font-heading text-4xl tabular-nums">{formatChance(SENATE_CONTROL.dem)}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Polymarket’s price that Democrats win the chamber. Republicans {formatChance(SENATE_CONTROL.rep)}.{" "}
              <a className="underline underline-offset-4" href={SENATE_CONTROL.url}>
                Market
              </a>
              .
            </p>
          </article>
          <article className="bg-card p-5">
            <h2 className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              House control
            </h2>
            <p className="mt-3 font-heading text-4xl tabular-nums">{formatChance(HOUSE_CONTROL.dem)}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Polymarket’s price that Democrats win the House. Republicans {formatChance(HOUSE_CONTROL.rep)}.{" "}
              <a className="underline underline-offset-4" href={HOUSE_CONTROL.url}>
                Market
              </a>
              .
            </p>
          </article>
        </section>

        <Tabs
          value={chamber}
          onValueChange={(value) => {
            if (value === "senate" || value === "governors" || value === "house") setChamber(value);
          }}
          className="min-w-0 gap-8"
        >
          <TabsList aria-label="Briefing sections" className="h-11 w-full max-w-md bg-card">
            <TabsTrigger value="senate" data-testid="tab-senate" className="h-9 px-3">
              Senate
            </TabsTrigger>
            <TabsTrigger value="governors" data-testid="tab-governors" className="h-9 px-3">
              Governors
            </TabsTrigger>
            <TabsTrigger value="house" data-testid="tab-house" className="h-9 px-3">
              House
            </TabsTrigger>
          </TabsList>
          <TabsContent value="senate" className="flex min-w-0 flex-col gap-10">
        <p className="text-sm leading-6 text-muted-foreground">
          Those two markets are separate contracts. This page does not turn them into a joint
          simulation of who wins both chambers. Each Senate race below is its own blend.
        </p>

        <section aria-label="Closest Senate races" className="flex flex-col gap-3">
          <h2 className="font-heading text-2xl">Closest Senate races</h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {races.slice(0, 8).map((raceState) => {
              const shift = shiftFor(raceState.abbr);
              const leader = [...quotedChances(raceState.senate!, shift)].sort((a, b) => b.chance - a.chance)[0];
              const projection = senateProjection(raceState, shift);
              return (
                <Button
                  key={raceState.abbr}
                  variant={selected === raceState.abbr ? "default" : "outline"}
                  className="h-11 shrink-0"
                  onClick={() => select(raceState.abbr)}
                >
                  {raceState.abbr}
                  <span className="tabular-nums text-current/80">
                    {leader.party} {formatChance(leader.chance).replace(" in 100", "")}
                  </span>
                  {projection ? (
                    <span className="tabular-nums text-current/80">{projection.text}</span>
                  ) : null}
                </Button>
              );
            })}
          </div>
        </section>

        <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
          <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium">Generic ballot</p>
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
            <UsMap selected={selected} query={query} margins={margins} onSelect={select} />
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
            delta={state ? shiftFor(state.abbr) : delta}
            customDelta={state ? customDelta(state.abbr) : 0}
            onCustomDelta={state ? (value) => setCustomDelta(state.abbr, value) : undefined}
            ballot={state ? ballotByAbbr.get(state.abbr) : undefined}
            turnoutPercent={turnoutPercent}
          />
        </section>

        <StateEstimator
          ballots={ballots}
          anyCustom={anyCustom}
          turnoutPercent={turnoutPercent}
          weighted={weighted}
          onCustomDelta={setCustomDelta}
          anyTurnoutAdjust={anyTurnoutAdjust}
          onTurnout={setTurnoutPercent}
          onStepTurnout={stepStateTurnout}
          onReset={() => {
            setCustom({});
            setTurnoutAdjust({});
          }}
          onSelect={select}
          selected={selected}
        />

        <section className="flex flex-col gap-4" aria-labelledby="senate-board-heading">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2 id="senate-board-heading" className="font-heading text-3xl">
              All 35 Senate races
            </h2>
            <p className="text-sm text-muted-foreground">
              {query.trim()
                ? `${filtered.length} of 35 match “${query.trim()}”`
                : "Closest to even first. A chance of 60 in 100 still loses about two times in five."}
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
                  delta={shiftFor(raceState.abbr)}
                  selected={selected === raceState.abbr}
                  onSelect={() => select(raceState.abbr)}
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
            The slider sets a scenario national margin. Delta is that slider minus {NATIONAL_GENERIC.marginD.toFixed(1)}.
            The state estimate shown on the map is the even-swing figure plus that delta, plus any
            adjustment made for that state alone. Moving the slider from {formatMargin(NATIONAL_GENERIC.marginD)} to D+9.6
            is a delta of +1.0, so every state moves 1.0 point toward the Democrats before those
            state adjustments. Refreshing the page puts the slider back on {formatMargin(NATIONAL_GENERIC.marginD)},
            clears the state adjustments, returns turnout to 100% of the 2022 House vote, and clears every state’s 2024 turnout adjustment. Nothing is stored.
          </p>
          <p>
            The turnout-weighted estimate is not the {formatMargin(NATIONAL_GENERIC.marginD)} aggregator average.
            The aggregator is an average of five national polls. The estimate on the card sums ballots.
            Each state’s margin, after the slider and that state’s own adjustment, is turned into a Democratic
            share and a Republican share. The other share stays at {NATIONAL_GENERIC.other.toFixed(1)} points,
            the national generic’s other share. Democratic percent is (100 − other + margin) / 2.
            Republican percent is (100 − other − margin) / 2. If a margin would push either share below zero,
            it is clamped and the page says so. Those percents are applied to that state’s expected ballots
            and rounded to whole votes. At 100% turnout, expected ballots are the certified 2022 U.S. House vote.
            The turnout slider scales that baseline. National Democratic and Republican
            percents are those vote totals divided by the expected ballots in the 50 states. The national margin
            is the Democratic percent minus the Republican percent.
            It is that sum of ballots, not an unweighted average of the 50 state margins.
          </p>
          <p>
            A uniform slider move of +1.0 therefore moves the turnout-weighted margin by about one point,
            because every state moves by the same amount. A change in only one state moves the national margin
            by that change times the state’s share of the 2022 House vote. Moving only Texas three points
            toward the Republicans moves the national margin by about three times Texas’s share of those ballots,
            toward the Republicans, not by three points. The 2022 totals are the votes that were cast. They are
            not a model of 2026 turnout.
          </p>
          <p>
            The turnout slider with the table of all 50 states scales every state’s 2022 House vote
            from 70% to 130%. Expected ballots are that certified total times the slider percent, rounded
            to a whole number. Democratic and Republican votes are the generic shares of those expected ballots.
            Scaling every state by the same percent changes the vote totals and leaves the national margin unchanged,
            because each state’s weight in the sum stays the same. Each row can also move that state by one
            percentage point of its 2024 U.S. House vote. Changing one state changes the national margin, because
            that state’s weight changes. Refreshing the page returns the slider to 100% and clears those
            adjustments. Nothing is stored.
          </p>
          <p>
            Each Senate chance is half Polymarket and half the polls, when the same two
            candidates appear in both. Polymarket contributes its Yes price, and that price
            stays the October 31 snapshot. Each polling aggregator contributes that candidate’s
            share of the two-candidate average, leaving undecided voters out. Those aggregator
            shares are averaged first. The slider then moves only that polling half: a delta
            of +1.0 adds 0.5 points of two-party share to the Democrat, or to the independent
            challenger where there is no Democrat, and subtracts 0.5 from the Republican.
            That shifted poll share is split evenly with the unchanged Polymarket price, then
            the chances are scaled so they still sum to about 100. A candidate at 60 in 100
            still loses about two times in five.
          </p>
          <p>
            The projected Senate margin is separate from the chance. Where a 2026 average
            names both the Democrat (or the independent challenger) and the Republican, the
            margin is that Democrat’s percentage minus the Republican’s, averaged across
            those polls, plus that state’s generic-ballot shift. The shift is the national
            slider delta plus any adjustment on that state alone. Adjusting Texas does not
            move Kansas. Where there is no such average, the page still shows a
            margin, but it is the state’s generic-ballot estimate and it is labeled that way.
            It is not a fake poll, and the chance in those races stays the Polymarket price.
            Montana has a FiftyPlusOne average that includes Seth Bodnar, who is not on the
            Polymarket contract, so the chance stays Polymarket and the margin is Alani
            Bankhead’s percentage minus Kurt Alme’s, plus delta.
          </p>
          <p>
            The 2024 House line next to the presidential margin is the statewide popular vote
            for Democratic and Republican House candidates, from that state’s Wikipedia page.
            It is a comparison. It is not an input to the generic-ballot estimate. Alaska uses
            the first-round vote, not the ranked-choice final round.
          </p>
          <p>
            The electorate table is the 2024 presidential exit poll: the share of voters by
            age, ethnicity, and gender. Edison Research conducted it for the National Election
            Pool, and CNN published the state tables. Ten states have one. The other forty say
            so. Census population is not used as a stand-in.
          </p>
          <p>
            The Texas Democrat is listed as James Talafreako. The Polymarket contract and
            the polling averages are for the name on that ballot. Alaska and Maine use
            ranked-choice voting; the averages here are the published head-to-head numbers.
            Nebraska’s challenger is independent Dan Osborn. South Carolina’s Republican
            nominee is Darline Graham Nordone; Lindsey Graham died on July 11, 2026, after
            winning the primary.
          </p>
          <p>
            Governor races are on their own tab and use this same split, for the states that
            elect a governor in 2026. The map colors those states by the projected margin and
            leaves every other state gray. House districts are on their own tab. Each district
            is outlined from the Census Bureau’s 119th Congress cartographic boundaries. Its
            generic-ballot estimate starts from that district’s 2024 presidential margin. Where
            Polymarket prices a Democrat and a Republican, the color is the price gap. Where it
            does not, the color is the generic-ballot estimate. Those are not the same number.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <a className="underline underline-offset-4" href="https://en.wikipedia.org/wiki/2026_United_States_House_of_Representatives_elections#Generic_congressional_ballot_aggregate_polls">
                Wikipedia, generic congressional ballot aggregate polls
              </a>
            </li>
            <li>
              <a className="underline underline-offset-4" href={SENATE_CONTROL.url}>
                Polymarket, which party will win the Senate
              </a>
              {" "}and{" "}
              <a className="underline underline-offset-4" href={HOUSE_CONTROL.url}>
                which party will win the House
              </a>
              , {POLYMARKET_AS_OF}
            </li>
            <li>
              <a className="underline underline-offset-4" href="https://fiftyplusone.news/averages">
                FiftyPlusOne, 2026 Senate averages
              </a>
            </li>
            <li>
              <a className="underline underline-offset-4" href="https://electoral-vote.com/evp2026/Senate/averages.html">
                Electoral-Vote.com, Senate averages
              </a>
            </li>
            <li>
              <a className="underline underline-offset-4" href="https://en.wikipedia.org/wiki/2024_United_States_presidential_election#Results_by_state">
                2024 presidential results by state
              </a>
            </li>
            <li>
              2024 House popular vote, from each state’s Wikipedia page, linked on the state dossier
            </li>
            <li>
              <a className="underline underline-offset-4" href={HOUSE_2022_FEC}>
                Federal Election Commission, Federal Elections 2022
              </a>
              , certified general-election votes cast for U.S. House candidates. The state links
              on the estimator point at each state’s Wikipedia page for the same election. Indiana
              uses the November full term only. Alaska and Maine are first-round ballots.
            </li>
            <li>
              <a className="underline underline-offset-4" href="https://www.cnn.com/election/2024/exit-polls">
                CNN / Edison Research, 2024 presidential exit polls
              </a>
              , for the ten states that have a published state exit poll
            </li>
          </ul>
        </section>
          </TabsContent>
          <TabsContent value="governors" className="min-w-0">
            <GovernorPanel shiftFor={shiftFor} />
          </TabsContent>
          <TabsContent value="house" className="min-w-0">
            <HousePanel shiftFor={shiftFor} />
          </TabsContent>
        </Tabs>
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
  if (days === -1) return "Election Day was yesterday. This page is still the October 31 snapshot, not a results page.";
  return `Election Day was ${Math.abs(days)} days ago. This page is still the October 31 snapshot, not a results page.`;
}

function StateEstimator({
  ballots,
  anyCustom,
  anyTurnoutAdjust,
  turnoutPercent,
  weighted,
  onCustomDelta,
  onTurnout,
  onStepTurnout,
  onReset,
  onSelect,
  selected,
}: {
  ballots: {
    abbr: string;
    name: string;
    margin: number;
    clamped: boolean;
    customDelta: number;
    baseline: number;
    baselineUrl: string;
    votes2024: number;
    votes2024Url: string;
    turnoutAdjust: number;
    percentOf2024: number;
    turnout: number;
    demVotes: number;
    repVotes: number;
  }[];
  anyCustom: boolean;
  anyTurnoutAdjust: boolean;
  turnoutPercent: number;
  weighted: { demVotes: number; repVotes: number; turnout: number; margin: number };
  onCustomDelta: (abbr: string, value: number) => void;
  onTurnout: (percent: number) => void;
  onStepTurnout: (abbr: string, direction: 1 | -1) => void;
  onReset: () => void;
  onSelect: (abbr: string) => void;
  selected: string;
}) {
  const rows = [...ballots].sort((a, b) => a.name.localeCompare(b.name, "en"));

  return (
    <section className="flex min-w-0 flex-col gap-3" aria-labelledby="estimator-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <h2 id="estimator-heading" className="font-heading text-3xl">
          All 50 states
        </h2>
        {anyCustom || anyTurnoutAdjust ? (
          <Button variant="outline" className="h-11" onClick={onReset}>
            Reset state adjustments
          </Button>
        ) : (
          <p className="text-sm text-muted-foreground">
            Every state adjustment starts at zero. Refresh clears these, the national slider, the turnout slider, and every state’s 2024 turnout adjustment.
          </p>
        )}
      </div>
      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
        The national slider moves every state by the same amount. The adjustment in each row is the same
        per-state delta as the dossier, applied after that. Changing it updates the map, that state’s Senate
        margin, and the national total. A step is half a point. More Republican is the R button. More Democratic
        is the D button. States are listed A to Z.
      </p>
      <div className="flex min-w-0 flex-col gap-4">
        <div className="w-full min-w-0 rounded-xl border bg-card p-4">
          <label className="grid max-w-md gap-2 text-sm">
            <span className="font-medium">
              Turnout versus the 2022 House vote
              <span className="font-normal text-muted-foreground" data-testid="turnout-percent">
                {" "}
                · {turnoutPercent}%
              </span>
            </span>
            <input
              type="range"
              min={70}
              max={130}
              step={1}
              value={turnoutPercent}
              data-testid="turnout-slider"
              aria-label="Turnout as a percent of the 2022 House vote"
              aria-valuemin={70}
              aria-valuemax={130}
              aria-valuenow={turnoutPercent}
              aria-valuetext={`${turnoutPercent}% of the 2022 House vote`}
              onChange={(event) => onTurnout(Number(event.target.value))}
              className="h-11 w-full max-w-full cursor-pointer accent-foreground"
            />
          </label>
          <p className="mt-3 text-sm leading-6" data-testid="turnout-summary">
            National turnout{" "}
            <span className="font-medium tabular-nums" data-testid="turnout-national-ballots">
              {formatVotes(weighted.turnout)}
            </span>{" "}
            ballots. Democrats{" "}
            <span className="font-medium tabular-nums" data-testid="turnout-national-dem">
              {formatVotes(weighted.demVotes)}
            </span>{" "}
            votes, Republicans{" "}
            <span className="font-medium tabular-nums" data-testid="turnout-national-rep">
              {formatVotes(weighted.repVotes)}
            </span>{" "}
            votes. National margin{" "}
            <span className="font-medium tabular-nums" data-testid="turnout-national-margin">
              {formatMargin(weighted.margin, 2)}
            </span>
            .
          </p>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground" data-testid="turnout-margin-note">
            Scaling every state by the same percent leaves the national margin unchanged. Changing one state’s share of its 2024 House vote changes the national margin, because that state’s weight changes.
          </p>
        </div>
        <div className="max-h-[40rem] min-w-0 w-full flex-1 overflow-auto rounded-xl border bg-card">
          <table className="w-full border-separate border-spacing-0 text-left text-sm" data-testid="state-table">
            <caption className="sr-only">
              All 50 states in alphabetical order, with generic-ballot margin, per-state adjustment, 2022 House baseline, expected turnout, Democratic and Republican votes, and each state’s expected ballots as a percent of its 2024 House vote
            </caption>
            <thead className="sticky top-0 z-10 bg-card text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                <th scope="col" className="border-b bg-card px-2 py-3 font-medium">State</th>
                <th scope="col" className="border-b bg-card px-2 py-3 font-medium">Generic margin</th>
                <th scope="col" className="border-b bg-card px-2 py-3 font-medium">Adjustment</th>
                <th scope="col" className="border-b bg-card px-2 py-3 text-right font-medium">2022 baseline votes</th>
                <th scope="col" className="border-b bg-card px-2 py-3 text-right font-medium">Expected turnout</th>
                <th scope="col" className="border-b bg-card px-2 py-3 text-right font-medium">Democratic votes</th>
                <th scope="col" className="border-b bg-card px-2 py-3 text-right font-medium">Republican votes</th>
                <th scope="col" className="border-b bg-card px-2 py-3 text-right font-medium">Percent of 2024 House vote</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((ballot) => (
                <tr
                  key={ballot.abbr}
                  data-testid={`estimator-${ballot.abbr}`}
                  className={selected === ballot.abbr ? "bg-muted/70" : undefined}
                >
                  <th scope="row" className="border-b px-2 py-2 font-medium whitespace-nowrap">
                    <button
                      type="button"
                      className="text-left"
                      onClick={() => onSelect(ballot.abbr)}
                      aria-current={selected === ballot.abbr ? "true" : undefined}
                    >
                      {ballot.name}
                    </button>
                  </th>
                  <td className="border-b px-2 py-2 whitespace-nowrap tabular-nums" data-testid={`estimator-margin-${ballot.abbr}`}>
                    {formatMargin(ballot.margin)}
                    {ballot.clamped ? " clamped" : ""}
                  </td>
                  <td className="border-b px-2 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-11"
                        data-testid={`nudge-${ballot.abbr}-rep`}
                        aria-label={`Move ${ballot.name} 0.5 points toward Republicans`}
                        onClick={() =>
                          onCustomDelta(ballot.abbr, Math.max(-60, Number((ballot.customDelta - 0.5).toFixed(1))))
                        }
                      >
                        R
                      </Button>
                      <span
                        className="w-12 text-center text-xs text-muted-foreground tabular-nums"
                        data-testid={`estimator-delta-${ballot.abbr}`}
                      >
                        {signedCompact(ballot.customDelta)}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 w-11"
                        data-testid={`nudge-${ballot.abbr}-dem`}
                        aria-label={`Move ${ballot.name} 0.5 points toward Democrats`}
                        onClick={() =>
                          onCustomDelta(ballot.abbr, Math.min(60, Number((ballot.customDelta + 0.5).toFixed(1))))
                        }
                      >
                        D
                      </Button>
                    </div>
                  </td>
                  <td className="border-b px-2 py-2 text-right whitespace-nowrap tabular-nums">
                    <a className="underline underline-offset-4" href={ballot.baselineUrl}>
                      {formatVotes(ballot.baseline)}
                    </a>
                  </td>
                  <td
                    className="border-b px-2 py-2 text-right whitespace-nowrap tabular-nums"
                    data-testid={`expected-turnout-${ballot.abbr}`}
                  >
                    {formatVotes(ballot.turnout)}
                  </td>
                  <td
                    className="border-b px-2 py-2 text-right whitespace-nowrap tabular-nums"
                    data-testid={`dem-votes-${ballot.abbr}`}
                  >
                    {formatVotes(ballot.demVotes)}
                  </td>
                  <td
                    className="border-b px-2 py-2 text-right whitespace-nowrap tabular-nums"
                    data-testid={`rep-votes-${ballot.abbr}`}
                  >
                    {formatVotes(ballot.repVotes)}
                  </td>
                  <td className="border-b px-2 py-2 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <span
                        className="w-14 text-right tabular-nums"
                        data-testid={`turnout-2024-${ballot.abbr}`}
                        data-percent={ballot.percentOf2024.toFixed(4)}
                      >
                        {ballot.percentOf2024.toFixed(1)}%
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 px-2"
                        data-testid={`turnout-down-${ballot.abbr}`}
                        aria-label={`Lower ${ballot.name} by 1 percentage point of its 2024 House vote`}
                        onClick={() => onStepTurnout(ballot.abbr, -1)}
                      >
                        Down
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 px-2"
                        data-testid={`turnout-up-${ballot.abbr}`}
                        aria-label={`Raise ${ballot.name} by 1 percentage point of its 2024 House vote`}
                        onClick={() => onStepTurnout(ballot.abbr, 1)}
                      >
                        Up
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function StateDossier({
  abbr,
  state,
  delta,
  customDelta,
  onCustomDelta,
  ballot,
  turnoutPercent,
}: {
  abbr: string;
  state: StateRecord | undefined;
  delta: number;
  customDelta: number;
  onCustomDelta?: (value: number) => void;
  ballot?: {
    margin: number;
    raw: number;
    clamped: boolean;
    demVotes: number;
    repVotes: number;
    turnout: number;
    baseline: number;
    votes2024: number;
    percentOf2024: number;
    turnoutAdjust: number;
  };
  turnoutPercent: number;
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

  const generic = ballot?.margin ?? 0;
  const house = HOUSE_2024[state.abbr];
  const exitPoll = EXIT_POLLS[state.abbr];

  return (
    <aside id="state-dossier" className="flex flex-col gap-5 rounded-xl border bg-card p-5 lg:sticky lg:top-4">
      <div>
        <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
          {state.abbr}
        </p>
        <h2 className="font-heading text-4xl tracking-tight">{state.name}</h2>
      </div>
      <p className="text-base leading-7">{comparisonCopy(state, delta)}</p>
      <div className="flex flex-col gap-3">
        <MarginTrack marginD={generic} label="Generic ballot" />
        {state.senate ? null : (
          <p className="text-sm text-muted-foreground">No Senate race on November 3.</p>
        )}
      </div>
      <p className="text-base leading-6 font-bold" data-testid="presidential-2024">
        2024 presidential margin {formatMargin(-state.trumpMargin2024, 2)}
      </p>
      {house ? (
        <p className="text-base leading-6 font-bold" data-testid="house-2024">
          2024 House vote {formatMargin(house.marginD)}
          <span className="font-bold">
            {" "}
            (Democrats {house.dem.toFixed(1)}%, Republicans {house.rep.toFixed(1)}%)
          </span>
          .{" "}
          <a className="underline underline-offset-4" href={house.url}>
            Wikipedia
          </a>
          .
          {house.note ? ` ${house.note}` : ""}
        </p>
      ) : null}
      <div className="flex flex-col gap-2 text-sm leading-6" data-testid="state-generic">
        <p className="text-muted-foreground">
          National shift D+{EVEN_SWING.toFixed(2)}
          {delta === customDelta
            ? ""
            : `, then ${delta - customDelta > 0 ? "+" : ""}${(delta - customDelta).toFixed(1)} from the national slider`}
          {customDelta === 0
            ? ""
            : `, then ${customDelta > 0 ? "+" : ""}${customDelta.toFixed(1)} on this state`}
          . Estimate {formatMargin(generic)}
          {ballot?.clamped ? ", clamped" : ""}.
        </p>
        {onCustomDelta ? (
          <label className="grid gap-2">
            <span className="font-medium">
              This state’s adjustment{" "}
              <span className="font-normal text-muted-foreground" data-testid="state-custom-delta">
                {signedPoints(customDelta)}
              </span>
            </span>
            <input
              type="range"
              min={-60}
              max={60}
              step={0.1}
              value={customDelta}
              data-testid="state-generic-range"
              aria-label={`Shift the ${state.name} generic ballot`}
              aria-valuemin={-60}
              aria-valuemax={60}
              aria-valuenow={customDelta}
              aria-valuetext={signedPoints(customDelta)}
              onChange={(event) => onCustomDelta(Number(event.target.value))}
              className="h-11 w-full cursor-pointer accent-foreground"
            />
            <span className="text-muted-foreground">
              More Republican at the left, more Democratic at the right. This sits on top of the national slider.
            </span>
          </label>
        ) : null}
        {ballot ? (
          <p data-testid="state-votes">
            {ballot.turnoutAdjust !== 0
              ? `Expected ballots ${formatVotes(ballot.turnout)}, ${ballot.percentOf2024.toFixed(1)}% of the 2024 House vote of ${formatVotes(ballot.votes2024)}: `
              : ballot.turnout === ballot.baseline
                ? `At the 2022 House vote of ${formatVotes(ballot.turnout)}: `
                : `Expected ballots ${formatVotes(ballot.turnout)}, ${turnoutPercent}% of the 2022 House vote of ${formatVotes(ballot.baseline)}: `}
            Democrats{" "}
            <span className="font-medium tabular-nums" data-testid="state-dem-votes">
              {formatVotes(ballot.demVotes)}
            </span>
            , Republicans{" "}
            <span className="font-medium tabular-nums" data-testid="state-rep-votes">
              {formatVotes(ballot.repVotes)}
            </span>
            .
            {ballot.clamped
              ? ` The unclamped margin was ${formatMargin(ballot.raw)}. Shares are held inside 0 to ${(100 - NATIONAL_GENERIC.other).toFixed(1)} so neither party goes below zero.`
              : ""}
          </p>
        ) : null}
      </div>
      <Demographics poll={exitPoll} stateName={state.name} />
      {state.senate ? <PollTable race={state.senate} /> : null}
      {state.senate ? <ChanceBlock race={state.senate} state={state} delta={delta} /> : null}
      {state.senate?.caveat ? (
        <p className="text-sm leading-6 text-muted-foreground">{state.senate.caveat}</p>
      ) : null}
      {state.senate ? (
        <a
          href={state.senate.polymarketUrl}
          target="_blank"
          rel="noreferrer"
          className={cn(buttonVariants({ variant: "outline" }), "h-11")}
        >
          Polymarket odds
        </a>
      ) : null}
    </aside>
  );
}

function PollTable({ race, office = "Senate" }: { race: SenateRace; office?: string }) {
  if (race.polls.length === 0) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        No 2026 polling average from FiftyPlusOne or Electoral-Vote.com.
      </p>
    );
  }
  const names = [...new Set(race.polls.flatMap((poll) => poll.shares.map((share) => share.name)))];
  const average = averageShares(race);

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
        Polling averages
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Polling averages for this {office} race</caption>
          <thead className="border-b text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th scope="col" className="py-2 pr-3 font-medium">Source</th>
              {names.map((name) => (
                <th key={name} scope="col" className="py-2 pr-3 text-right font-medium">
                  {name.split(" ").slice(-1)[0]}
                </th>
              ))}
              <th scope="col" className="py-2 text-right font-medium">Margin</th>
            </tr>
          </thead>
          <tbody>
            {race.polls.map((poll) => (
              <tr key={poll.source} className="border-b last:border-0">
                <th scope="row" className="py-2 pr-3 font-medium">
                  <a className="underline underline-offset-4" href={poll.url}>
                    {poll.source}
                  </a>
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{poll.asOf}</span>
                </th>
                {names.map((name) => {
                  const share = poll.shares.find((item) => item.name === name);
                  return (
                    <td key={name} className="py-2 pr-3 text-right tabular-nums">
                      {share ? `${share.pct}%` : "—"}
                    </td>
                  );
                })}
                <td className="py-2 text-right font-medium tabular-nums">{leadLabel(poll.shares)}</td>
              </tr>
            ))}
            {average && race.polls.length > 1 ? (
              <tr className="bg-muted/60">
                <th scope="row" className="py-2 pr-3 font-medium">Average</th>
                {average.map((share) => (
                  <td key={share.name} className="py-2 pr-3 text-right tabular-nums">
                    {share.pct}%
                  </td>
                ))}
                <td className="py-2 text-right font-medium tabular-nums">{leadLabel(average)}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function leadLabel(shares: Share[]): string {
  if (shares.length < 2) return "—";
  const ranked = [...shares].sort((a, b) => b.pct - a.pct);
  const gap = Math.round((ranked[0].pct - ranked[1].pct) * 10) / 10;
  if (gap === 0) return "Tied";
  const last = ranked[0].name.split(" ").slice(-1)[0];
  return `${last} +${gap.toFixed(1)}`;
}

function Demographics({ poll, stateName }: { poll: ExitPoll | undefined; stateName: string }) {
  if (!poll) {
    return (
      <div className="flex flex-col gap-2" data-testid="demographics">
        <h3 className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
          2024 electorate
        </h3>
        <p className="text-sm leading-6 text-muted-foreground">
          No 2024 exit poll was published for {stateName}. The National Election Pool state
          exit polls, reported by CNN, cover {EXIT_POLL_STATE_NAMES.join(", ")}. Census
          population is not shown in its place.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2" data-testid="demographics">
      <h3 className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
        2024 electorate
      </h3>
      <p className="text-sm leading-6 text-muted-foreground">
        Share of presidential voters in the {poll.source}, {poll.respondents.toLocaleString("en-US")} respondents.{" "}
        <a className="underline underline-offset-4" href={poll.url}>
          CNN
        </a>
        . Figures are rounded by the source and may not sum to 100.
      </p>
      <div className="grid gap-3">
        <DemoTable title="Age" groups={poll.age} />
        <DemoTable title="Ethnicity" groups={poll.ethnicity} />
        <DemoTable title="Gender" groups={poll.gender} />
      </div>
    </div>
  );
}

function DemoTable({ title, groups }: { title: string; groups: { label: string; pct: number }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{title} share of the 2024 electorate</caption>
        <thead className="border-b text-xs tracking-wide text-muted-foreground uppercase">
          <tr>
            <th scope="col" className="py-1 pr-3 font-medium">{title}</th>
            <th scope="col" className="py-1 text-right font-medium">Voters</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.label} className="border-b last:border-0">
              <th scope="row" className="py-1 pr-3 font-medium">{group.label}</th>
              <td className="py-1 text-right tabular-nums">{group.pct}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChanceBlock({ race, state, delta }: { race: SenateRace; state: StateRecord; delta: number }) {
  const people = quotedChances(race, delta);
  const projection = senateProjection(state, delta);
  const base = pollMarginPoints(race);
  const total = people.reduce((sum, person) => sum + person.chance, 0);
  const blended = blendsPolls(race);

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
        {blended ? "Combined chance" : "Polymarket"}
      </h3>
      <div className="flex h-3 overflow-hidden rounded-full" aria-hidden>
        {people.map((person) => (
          <div
            key={person.name}
            style={{
              width: `${(person.chance / total) * 100}%`,
              background: person.party === "D" ? "#1e4f8f" : person.party === "R" ? "#8f2d2d" : "#2f6b4f",
            }}
          />
        ))}
      </div>
      {projection ? <ProjectionLine race={race} projection={projection} base={base} delta={delta} /> : null}
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
              {blended ? (
                <span className="block text-xs text-muted-foreground">
                  Polymarket {formatChance(person.polymarket)}
                  {person.poll !== null
                    ? ` · polls ${formatChance(person.poll)}${delta !== 0 ? " after the slider" : ""}`
                    : ""}
                </span>
              ) : null}
            </span>
            <span className="shrink-0 tabular-nums">{formatChance(person.chance)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProjectionLine({
  race,
  projection,
  base,
  delta,
  office = "Senate",
  testId = "senate-margin",
}: {
  race: SenateRace;
  projection: NonNullable<ReturnType<typeof senateProjection>>;
  base: number | null;
  delta: number;
  office?: string;
  testId?: string;
}) {
  const sides = marginSides(race);
  const detail =
    projection.basis === "poll" && sides && base !== null
      ? `${sides.left.split(" ").slice(-1)[0]}’s polling percentage minus ${sides.right.split(" ").slice(-1)[0]}’s is ${Number(base.toFixed(1)) > 0 ? "+" : ""}${Number(base.toFixed(1)).toFixed(1)} points. This state’s generic-ballot shift adds ${delta > 0 ? "+" : ""}${delta.toFixed(1)}.`
      : `This is the state’s generic-ballot estimate, not a 2026 ${office} poll. The chance stays the Polymarket price.`;

  return (
    <p className="text-sm leading-6" data-testid={testId}>
      <span className="font-medium">Projected margin {projection.text}.</span>{" "}
      <span className="text-muted-foreground">{detail}</span>
    </p>
  );
}

function RaceRow({
  state,
  delta,
  selected,
  onSelect,
}: {
  state: StateRecord;
  delta: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const race = state.senate!;
  const people = quotedChances(race, delta);
  const leader = [...people].sort((a, b) => b.chance - a.chance)[0];
  const projection = senateProjection(state, delta);

  return (
    <article className={`grid gap-3 border-b p-4 last:border-0 md:grid-cols-[11rem_1fr_8rem] ${selected ? "bg-muted/70" : ""}`}>
      <div>
        <Button
          variant="ghost"
          className="h-auto px-0 text-left font-heading text-2xl hover:bg-transparent"
          onClick={onSelect}
          aria-current={selected ? "true" : undefined}
        >
          {state.name}
        </Button>
        <p className="text-sm text-muted-foreground">
          {blendsPolls(race) ? "Polymarket and polls" : "Polymarket"}
        </p>
      </div>
      <ul className="flex flex-col justify-center gap-1 text-sm">
        {people.map((person) => (
          <li key={person.name} className="flex justify-between gap-3">
            <span>
              {person.name}
              <span className="text-muted-foreground"> · {partyName(person.party)}</span>
            </span>
            <span className="tabular-nums">{formatChance(person.chance)}</span>
          </li>
        ))}
        {projection ? (
          <li className="text-muted-foreground" data-testid={`senate-margin-${state.abbr}`}>
            Projected margin {projection.text}
            {projection.basis === "generic" ? " · generic ballot, not a poll" : ""}
          </li>
        ) : null}
      </ul>
      <p className="font-heading text-2xl tabular-nums md:text-right">
        {leader.party} {formatChance(leader.chance).replace(" in 100", "")}
        {projection ? (
          <span className="mt-1 block font-sans text-sm font-normal text-muted-foreground">
            {projection.text}
          </span>
        ) : null}
      </p>
    </article>
  );
}

function GovernorPanel({ shiftFor }: { shiftFor: (abbr: string) => number }) {
  const [selected, setSelected] = useState("TX");
  const rows = Object.entries(GOVERNORS)
    .flatMap(([abbr, race]) => {
      const state = getState(abbr);
      return state ? [{ abbr, race, state }] : [];
    })
    .sort((a, b) => a.state.name.localeCompare(b.state.name));
  const current = rows.find((row) => row.abbr === selected) ?? null;
  const selectedState = getState(selected);
  const delta = current ? shiftFor(current.abbr) : 0;
  const people = current ? quotedChances(current.race, delta) : [];
  const projection = current ? governorProjection(current.race, current.state.trumpMargin2024, delta) : null;
  const blended = current ? blendsPolls(current.race) : false;
  const margins = Object.fromEntries(
    rows.map((row) => [
      row.abbr,
      governorProjection(row.race, row.state.trumpMargin2024, shiftFor(row.abbr)).margin,
    ]),
  );

  return (
    <section className="flex min-w-0 flex-col gap-6" aria-labelledby="governor-heading">
      <div className="flex max-w-3xl flex-col gap-3">
        <h2 id="governor-heading" className="font-heading text-3xl">
          Governor races
        </h2>
        <p className="text-sm leading-7">
          Thirty-six states elect a governor on November 3, 2026. The map is the main view.
          New Hampshire and Vermont are included because those terms are two years. Kentucky,
          Louisiana, and Mississippi elect governors in 2027. New Jersey and Virginia voted in
          2025. Every other state without a color elects a governor in 2028. Those states stay
          gray. Alaska and Hawaii are on the map.
        </p>
        <p className="text-sm leading-7 text-muted-foreground">
          Prices are the {GOVERNOR_POLYMARKET_AS_OF} Gamma API snapshot. They do not update on
          their own. Where FiftyPlusOne publishes a 2026 average for the same two candidates, the
          chance is half that candidate’s share of the two-candidate average and half the
          Polymarket Yes price, then scaled so the quoted chances sum to about 100. A
          generic-ballot move of +1.0 adds 1.0 point to a polled projected margin and 0.5 points
          of two-party share on the polling half only. The Polymarket price stays put. A
          per-state generic adjustment moves only that state. Turnout does not move these chances
          or margins. Electoral-Vote.com does not publish a 2026 governor polling average, so it
          is not blended in. A race with no FiftyPlusOne average is Polymarket-only, and the
          margin shown is that state’s generic-ballot estimate. The map uses that same margin.
        </p>
      </div>
      <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.8fr)]">
        <div className="flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5">
          <GovernorMap selected={selected} margins={margins} onSelect={setSelected} />
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {rows.map((row) => {
              const shift = shiftFor(row.abbr);
              const rowProjection = governorProjection(row.race, row.state.trumpMargin2024, shift);
              const rowBlend = blendsPolls(row.race);
              return (
                <button
                  key={row.abbr}
                  type="button"
                  className={`flex min-w-0 items-baseline justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted ${selected === row.abbr ? "bg-muted" : ""}`}
                  onClick={() => setSelected(row.abbr)}
                  aria-current={selected === row.abbr ? "true" : undefined}
                  data-testid={`governor-row-${row.abbr}`}
                >
                  <span className="min-w-0">
                    <span className="block truncate">{row.state.name}</span>
                    <span className="text-xs text-muted-foreground" data-testid={`governor-basis-${row.abbr}`}>
                      {rowBlend ? "Polymarket and polls" : "Polymarket-only"}
                    </span>
                  </span>
                  <span
                    className="shrink-0 text-right tabular-nums"
                    data-testid={`governor-margin-${row.abbr}`}
                    data-margin={rowProjection.margin}
                    data-basis={rowProjection.basis}
                  >
                    {rowProjection.text}
                    {rowProjection.basis === "generic" ? " · estimate" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        {current && projection ? (
          <aside id="governor-dossier" className="flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-5">
            <div>
              <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                Selected race
              </p>
              <h3 className="font-heading text-4xl">{current.state.name}</h3>
            </div>
            <p className="text-sm leading-6" data-testid="governor-blend">
              {governorBlendNote(current.race, delta)}
            </p>
            <ProjectionLine
              race={current.race}
              projection={projection}
              base={pollMarginPoints(current.race)}
              delta={delta}
              office="governor"
              testId="governor-dossier-margin"
            />
            <ul className="flex flex-col gap-2">
              {people.map((person) => (
                <li key={person.name} className="flex items-baseline justify-between gap-3 text-sm" data-testid={`governor-person-${current.abbr}-${person.party}`} data-chance={person.chance} data-polymarket={person.polymarket} data-poll={person.poll ?? ""}>
                  <span className="min-w-0">
                    {person.name}
                    <span className="text-muted-foreground"> · {partyName(person.party)}</span>
                    {blended ? (
                      <span className="block text-xs text-muted-foreground">
                        Polymarket {formatChance(person.polymarket)}
                        {person.poll !== null
                          ? ` · polls ${formatChance(person.poll)}${delta !== 0 ? " after the slider" : ""}`
                          : ""}
                      </span>
                    ) : (
                      <span className="block text-xs text-muted-foreground">Polymarket-only</span>
                    )}
                  </span>
                  <span className="shrink-0 tabular-nums">{formatChance(person.chance)}</span>
                </li>
              ))}
            </ul>
            <PollTable race={current.race} office="governor" />
            {current.race.caveat ? (
              <p className="text-sm leading-6 text-muted-foreground">{current.race.caveat}</p>
            ) : null}
            <a
              href={current.race.polymarketUrl}
              target="_blank"
              rel="noreferrer"
              data-testid="governor-link"
              className={cn(buttonVariants({ variant: "outline" }), "h-11")}
            >
              Polymarket odds
            </a>
          </aside>
        ) : (
          <aside id="governor-dossier" className="flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-5" data-testid="governor-no-race">
            <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Selected state
            </p>
            <h3 className="font-heading text-4xl">{selectedState?.name ?? "District of Columbia"}</h3>
            <p className="text-sm leading-6">
              No governor election on November 3, 2026. This state is not colored as a race.
            </p>
          </aside>
        )}
      </div>
    </section>
  );
}

function governorBlendNote(race: SenateRace, delta: number): string {
  const quoted = quotedChances(race, delta);
  const leader = [...quoted].sort((a, b) => b.chance - a.chance)[0];
  if (blendsPolls(race) && leader.poll !== null) {
    const shift =
      delta === 0
        ? " The Polymarket price is the snapshot and does not move."
        : ` The polling half includes the generic-ballot shift of ${delta > 0 ? "+" : ""}${delta.toFixed(1)}. The Polymarket price stays the snapshot.`;
    return `${leader.name} is ${formatChance(leader.chance)} after splitting the Polymarket price, ${formatChance(leader.polymarket)}, with that candidate’s share of the two-candidate polling average, ${formatChance(leader.poll)}.${shift}`;
  }
  return `${leader.name} is ${formatChance(leader.polymarket)} on Polymarket. There is no matching 2026 polling average, so that price is not averaged with a poll and does not move with the generic-ballot shift. This race is Polymarket-only.`;
}

function HousePanel({ shiftFor }: { shiftFor: (abbr: string) => number }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const shades: Record<string, DistrictShade> = {};
  for (const item of DISTRICT_PATHS) {
    const shade = districtShade(item.id, shiftFor(item.abbr));
    if (shade) shades[item.id] = shade;
  }
  const shape = selectedId ? districtById(selectedId) : undefined;
  const state = shape ? getState(shape.abbr) : undefined;
  const shift = shape ? shiftFor(shape.abbr) : 0;
  const generic = shape ? districtGeneric(shape.id, shift) : null;
  const market = shape ? HOUSE_MARKETS[shape.id] : undefined;
  const result = shape ? HOUSE_2024_DISTRICT[shape.id] : undefined;
  const trump = shape ? PRES_2024[shape.id] : undefined;
  const shade = shape ? shades[shape.id] : undefined;
  const people = market ? houseChances(market, shift) : [];
  const pollMargin = market ? housePollMargin(market, shift) : null;
  const labels = new Map(market?.candidates.map((candidate) => [candidate.name, candidate.label]) ?? []);
  const newerNames = "Alabama, California, Florida, Louisiana, North Carolina, Ohio, Tennessee, Texas, and Utah";

  return (
    <section className="flex min-w-0 flex-col gap-6" aria-labelledby="house-heading">
      <div className="flex max-w-3xl flex-col gap-3">
        <h2 id="house-heading" className="font-heading text-3xl">
          House districts
        </h2>
        <p className="text-sm leading-7">
          Every voting U.S. House district is outlined from its Census boundary. Click a district
          for the 2026 candidates, the generic-ballot estimate beside the projection, and the
          2024 House and presidential margins. At-large states are one district. The District of
          Columbia has no voting House district and is not drawn. Alaska and Hawaii are inset.
        </p>
        <p className="text-sm leading-7 text-muted-foreground">
          The generic-ballot estimate starts from that district’s 2024 presidential margin, moves
          {" "}{EVEN_SWING} points toward the Democrats, then adds the national slider and any
          adjustment on the parent state. The projection is separate. Where Polymarket and a
          two-candidate polling average both exist, the chance is half the Yes price and half
          the polling share, scaled to about 100, and the projected margin is the polling margin
          plus the generic-ballot shift. FiftyPlusOne’s public averages page does not publish a
          2026 House district average, so these chances are the {HOUSE_POLYMARKET_AS_OF} Polymarket
          snapshot alone. That price does not move, and it is not copied from the generic ballot.
          A district with neither a market nor a poll says there is no market projection.
        </p>
        <p className="text-sm leading-7 text-muted-foreground">
          {newerNames} have enacted maps for 2026 that this Census file does not include. Those
          states are still drawn with the Census outline. On those districts, the 2024 margins
          are for the district as it was contested in 2024, not the new map.
        </p>
      </div>
      <div className="grid min-w-0 items-start gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
        <div className="flex min-w-0 flex-col gap-4 rounded-xl border bg-card p-4 sm:p-5">
          <HouseMap shades={shades} selected={selectedId} onSelect={setSelectedId} />
          <label className="grid min-w-0 gap-1 text-sm">
            <span className="text-muted-foreground">Jump to a district</span>
            <select
              value={selectedId ?? ""}
              onChange={(event) => setSelectedId(event.target.value || null)}
              aria-label="Jump to a House district"
              className="h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3"
            >
              <option value="">Select a district</option>
              {DISTRICT_PATHS.map((item) => (
                <option key={item.id} value={item.id}>
                  {districtTitle(item.abbr, item.district)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <aside id="district-dossier" className="flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-5">
          <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Selected district
          </p>
          {shape && state ? (
            <div data-testid="district-panel" data-district={shape.id}>
              <h3 className="font-heading text-4xl">{districtTitle(shape.abbr, shape.district)}</h3>
              <div className="mt-4">
                <h4 className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                  2026 candidates
                </h4>
                {market ? (
                  <ul className="mt-2 flex flex-col gap-1 text-sm">
                    {market.candidates.map((candidate) => (
                      <li key={candidate.name} data-testid="district-candidate">
                        {candidate.name}
                        <span className="text-muted-foreground"> · {candidate.label}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm leading-6">
                    No candidate is named here. This snapshot has no Polymarket contract for the
                    district, and a name is not filled in.
                  </p>
                )}
                {market?.caveat ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{market.caveat}</p>
                ) : null}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="min-w-0 rounded-lg border p-3" data-testid="district-generic" data-margin={generic ?? ""}>
                  <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                    Generic-ballot estimate
                  </p>
                  <p className="mt-1 font-heading text-3xl tabular-nums">
                    {generic === null ? "—" : formatMargin(generic)}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {trump === undefined
                      ? "No 2024 presidential margin is stored for this outline. The old district’s number is not assigned to a new shape."
                      : `Starts from the 2024 presidential margin ${formatMargin(-trump)}, then ${EVEN_SWING} points toward the Democrats, then the national slider and any adjustment on ${state.name}.`}
                  </p>
                </div>
                <div
                  className="min-w-0 rounded-lg border p-3"
                  data-testid="district-projection"
                  data-basis={pollMargin ? "poll" : market ? "polymarket" : "none"}
                  data-margin={pollMargin ? pollMargin.margin : ""}
                >
                  <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
                    Projection
                  </p>
                  {market ? (
                    <>
                      <ul className="mt-2 flex flex-col gap-1 text-sm">
                        {people.map((person) => (
                          <li key={person.name} className="flex items-baseline justify-between gap-2" data-chance={person.chance} data-polymarket={person.polymarket}>
                            <span className="min-w-0">
                              {person.name}
                              <span className="text-muted-foreground"> · {labels.get(person.name)}</span>
                            </span>
                            <span className="shrink-0 tabular-nums">{formatChance(person.chance)}</span>
                          </li>
                        ))}
                      </ul>
                      {pollMargin ? (
                        <p className="mt-2 text-sm leading-6">
                          <span className="font-medium">Projected margin {pollMargin.text}.</span>{" "}
                          <span className="text-muted-foreground">
                            The polling margin plus this district’s generic-ballot shift of {shift > 0 ? "+" : ""}{shift.toFixed(1)}. Only the polling half of the chance moves. The Polymarket price stays the snapshot.
                          </span>
                        </p>
                      ) : (
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Polymarket only, {HOUSE_POLYMARKET_AS_OF}. There is no 2026 House polling
                          average for this district, so the chance is the snapshot price. It does
                          not move with the generic ballot, and it is not that estimate.
                        </p>
                      )}
                      <a
                        href={houseRace(market).polymarketUrl}
                        target="_blank"
                        rel="noreferrer"
                        data-testid="district-polymarket"
                        className="mt-2 inline-block text-sm underline underline-offset-4"
                      >
                        Polymarket odds
                      </a>
                    </>
                  ) : (
                    <p className="mt-2 text-sm leading-6" data-testid="district-no-market">
                      There is no market projection. This district has no Polymarket winner market
                      in the {HOUSE_POLYMARKET_AS_OF} snapshot and no 2026 polling average. The
                      generic-ballot estimate is not a forecast.
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2 text-sm leading-6">
                <p data-testid="district-house-2024" data-margin={result?.marginD ?? ""}>
                  <span className="font-medium">
                    2024 House: {result ? (result.marginD === null ? "no Republican-versus-Democrat margin" : formatMargin(result.marginD)) : "not on file"}.
                  </span>{" "}
                  {result?.demPct !== null && result?.demPct !== undefined && result.repPct !== null
                    ? `Democrats ${result.demPct.toFixed(1)}%, Republicans ${result.repPct.toFixed(1)}%. `
                    : ""}
                  {result?.note ? `${result.note} ` : ""}
                  <a className="underline underline-offset-4" href={HOUSE_RESULT_SOURCE}>
                    Clerk of the House
                  </a>
                  .
                </p>
                <p data-testid="district-trump-2024" data-margin={trump ?? ""}>
                  <span className="font-medium">
                    2024 presidential: {trump === undefined ? "no figure for this outline" : formatMargin(-trump)}.
                  </span>{" "}
                  {trump === undefined
                    ? "There is no honest 2024 presidential margin for this district geography."
                    : "How much Trump won the district as contested in 2024."}{" "}
                  <a className="underline underline-offset-4" href={HOUSE_PRES_SOURCE}>
                    The Downballot
                  </a>
                  , districts used in 2024
                  {" "}(
                  <a className="underline underline-offset-4" href={HOUSE_PRES_PAGE}>
                    explainer
                  </a>
                  ).
                </p>
              </div>
              {shade?.kind === "price" ? (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Map color {formatMargin(shade.margin)}.
                  {market?.partyColor
                    ? " The named contracts are not a Democrat against a Republican, so the color uses the separate party contracts. That price gap is not the generic-ballot estimate."
                    : " That is the Democratic Polymarket price minus the Republican price after the prices are scaled to about 100. It is not the generic-ballot estimate and it does not move with the slider."}
                </p>
              ) : null}
              {shade?.kind === "poll" ? (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Map color {formatMargin(shade.margin)}, the projected vote margin.
                </p>
              ) : null}
              {shade?.kind === "generic" ? (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Map color {formatMargin(shade.margin)}, the generic-ballot estimate. This district
                  has no Democratic-versus-Republican market price to color with.
                </p>
              ) : null}
              {isNewerThanCensus(shape.abbr) ? (
                <p className="mt-3 text-sm leading-6 text-muted-foreground" data-testid="district-redraw">
                  {state.name} enacted a congressional map for 2026 that is newer than this Census
                  outline. The outline may not match the 2026 district. The 2024 House margin and
                  the 2024 presidential margin are for the district as it was contested in 2024,
                  not for the new map.
                </p>
              ) : null}
            </div>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">
              Click a district. Alaska, Delaware, North Dakota, South Dakota, Vermont, and Wyoming
              are at-large. The District of Columbia is not on this map.
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
