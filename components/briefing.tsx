"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Search } from "lucide-react";
import { LiveOddsProvider, liveOddsCopy, useLiveOdds, useLiveOddsSource } from "@/lib/live-odds";
import { withLiveSenate } from "@/lib/polymarket";
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
import { GOVERNOR_POLYMARKET_AS_OF, governorProjection } from "@/lib/governor-live";
import { MARGIN_AS_OF, type MarginEvent } from "@/lib/margin-live";
import { sortMarginBrackets, type MarginSort } from "@/lib/margin-sort";
import {
  HOUSE_2024_DISTRICT,
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
  VOTEHUB_AS_OF,
  VOTEHUB_GOVERNOR,
  VOTEHUB_GOVERNOR_INDEX,
  VOTEHUB_HOUSE,
  VOTEHUB_HOUSE_INDEX,
  VOTEHUB_SENATE,
  VOTEHUB_SENATE_INDEX,
  type VoteHubRating,
} from "@/lib/votehub";
import {
  POLYMARKET_AS_OF,
  averageShares,
  blendsPolls,
  closeness,
  formatChance,
  marginSides,
  partyName,
  pollMarginPoints,
  quotedChances,
  type MarketCandidate,
  type SenateRace,
  type Share,
} from "@/lib/senate-live";
import {
  TOSSUP_AS_OF,
  TOSSUP_EVENT,
  exactTossupMapFrom,
  productIn100,
  tossupCall,
  tossupMapKey,
  type TossupSide,
} from "@/lib/tossup-live";

/** Per-state custom delta, in points. Negative is more Republican. */
const STATE_CUSTOM_MIN = -20;
const STATE_CUSTOM_MAX = 20;

function customDeltaLabel(value: number): string {
  if (value === 0) return "even";
  return formatMargin(value);
}

function AmericanFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 19 10"
      className={className}
      role="img"
      aria-label="American flag"
    >
      <rect width="19" height="10" fill="#bf0a30" />
      <rect y="0.77" width="19" height="0.77" fill="#fff" />
      <rect y="2.31" width="19" height="0.77" fill="#fff" />
      <rect y="3.85" width="19" height="0.77" fill="#fff" />
      <rect y="5.38" width="19" height="0.77" fill="#fff" />
      <rect y="6.92" width="19" height="0.77" fill="#fff" />
      <rect y="8.46" width="19" height="0.77" fill="#fff" />
      <rect width="7.6" height="5.38" fill="#002868" />
      {Array.from({ length: 9 }, (_, row) =>
        Array.from({ length: row % 2 === 0 ? 6 : 5 }, (_, col) => {
          const x = row % 2 === 0 ? 0.63 + col * 1.27 : 1.27 + col * 1.27;
          const y = 0.38 + row * 0.58;
          return <circle key={`${row}-${col}`} cx={x} cy={y} r="0.18" fill="#fff" />;
        }),
      )}
    </svg>
  );
}

function clampCustomDelta(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const next = Number(value.toFixed(1));
  return Math.min(STATE_CUSTOM_MAX, Math.max(STATE_CUSTOM_MIN, next));
}

function deltaLabel(delta: number): string {
  const abs = Math.abs(delta).toFixed(1);
  const unit = abs === "1.0" ? "point" : "points";
  if (delta === 0) return `the calculated ${formatMargin(NATIONAL_GENERIC.marginD)}`;
  const direction = delta > 0 ? "more Democratic" : "more Republican";
  return `${abs} ${unit} ${direction} than the calculated ${formatMargin(NATIONAL_GENERIC.marginD)}`;
}

export function Briefing() {
  const live = useLiveOddsSource();
  return (
    <LiveOddsProvider value={live}>
      <BriefingBody />
    </LiveOddsProvider>
  );
}

function BriefingBody() {
  const live = useLiveOdds();
  const [query, setQuery] = useState("");
  const [slider, setSlider] = useState(NATIONAL_GENERIC.marginD);
  const [custom, setCustom] = useState<Record<string, number>>({});
  const [turnoutPercent, setTurnoutPercent] = useState(100);
  const [turnoutAdjust, setTurnoutAdjust] = useState<Record<string, number>>({});
  const [chamber, setChamber] = useState<"senate" | "governors" | "house">("senate");
  const [tossupPicks, setTossupPicks] = useState<Record<string, TossupSide>>({});
  const scenario = scenarioGeneric(slider);
  const delta = scenario.delta;

  function customDelta(abbr: string): number {
    return custom[abbr] ?? 0;
  }

  function shiftFor(abbr: string): number {
    return Number((delta + customDelta(abbr)).toFixed(1));
  }

  function setCustomDelta(abbr: string, value: number) {
    const next = clampCustomDelta(value);
    setCustom((prev) => {
      if (next === 0) {
        if (prev[abbr] === undefined) return prev;
        const rest = { ...prev };
        delete rest[abbr];
        return rest;
      }
      if (prev[abbr] === next) return prev;
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
      houseMarginD: HOUSE_2024[state.abbr].marginD,
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

  const races = STATES.filter((item) => item.senate)
    .map((item) => withLiveSenate(item, live.senate))
    .sort((a, b) => closeness(a.senate!, shiftFor(a.abbr)) - closeness(b.senate!, shiftFor(b.abbr)));
  const selected = useSyncExternalStore(subscribeToHash, readHash, () => "KS");
  const days = useSyncExternalStore(subscribeToNothing, () => daysUntilElection(), () => UNKNOWN_DAYS);
  const snapshotState = selected === "DC" ? undefined : getState(selected);
  const state = snapshotState ? withLiveSenate(snapshotState, live.senate) : snapshotState;

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

  const filtered = races.filter((item) => matchesQuery(item, query));

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
            <h1 className="font-heading text-4xl tracking-tight text-balance sm:text-5xl lg:text-6xl">
              2026 Midterm Generic Ballot{" "}
              <span className="whitespace-nowrap">
                Swingometer{" "}
                <AmericanFlag className="mb-[0.08em] inline-block h-[0.72em] w-[1.15em] align-baseline" />
              </span>
            </h1>
          </div>
          <div className="max-w-sm text-sm leading-6 text-muted-foreground sm:text-right">
            <p>{countdown(days)}</p>
            <LiveOddsHeader />
          </div>
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
              Polymarket-only price follows the live Yes price. A per-state slider, at most 20 points either way, is applied after
              that, and only to that state. Turnout does not move those chances or margins. The
              range runs from even to D+16.0. Refresh the page
              to restore {formatMargin(NATIONAL_GENERIC.marginD)}, clear every state slider, return turnout to 100% of the 2022 House vote, and clear every state’s 2024 turnout adjustment. Nothing is saved.
            </p>
          </article>
          <article className="bg-card p-5">
            <h2 className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              Senate control
            </h2>
            <p className="mt-3 font-heading text-4xl tabular-nums">{formatChance(live.senateControl.dem)}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Polymarket’s price that Democrats win the chamber. Republicans {formatChance(live.senateControl.rep)}.{" "}
              <a className="underline underline-offset-4" href={live.senateControl.url}>
                Market
              </a>
              .
            </p>
          </article>
          <article className="bg-card p-5">
            <h2 className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
              House control
            </h2>
            <p className="mt-3 font-heading text-4xl tabular-nums">{formatChance(live.houseControl.dem)}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Polymarket’s price that Democrats win the House. Republicans {formatChance(live.houseControl.rep)}.{" "}
              <a className="underline underline-offset-4" href={live.houseControl.url}>
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
            The state estimate shown on the map is the even-swing figure plus that delta, plus a custom
            delta on that state alone. Each state’s slider runs from 20 points more Republican to 20 points
            more Democratic. Reset on that row clears only that custom delta. Moving the national slider
            from {formatMargin(NATIONAL_GENERIC.marginD)} to D+9.6
            is a delta of +1.0, so every state moves 1.0 point toward the Democrats before those
            custom deltas. Refreshing the page puts the national slider back on {formatMargin(NATIONAL_GENERIC.marginD)},
            clears every state slider, returns turnout to 100% of the 2022 House vote, and clears every state’s 2024 turnout adjustment. Nothing is stored.
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
            candidates appear in both. Polymarket contributes its live Yes price from Gamma.
            Polls stay a snapshot: FiftyPlusOne and Electoral-Vote.com from October 31, 2026,
            and 270toWin and RealClearPolling from November 1, 2026. Each aggregator
            contributes that candidate’s share of the two-candidate average, leaving
            undecided voters out. Those aggregator shares are averaged first. The slider then moves only that polling half: a delta
            of +1.0 adds 0.5 points of two-party share to the Democrat, or to the independent
            challenger where there is no Democrat, and subtracts 0.5 from the Republican.
            That shifted poll share is split evenly with the live Polymarket price, then
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
            It is a comparison. It is not an input to the generic-ballot estimate. The All 50 states
            table prints that same margin in the 2024 generic column. Alaska uses
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
            The margin-of-victory list on a Senate or governor race is Polymarket’s own
            brackets, refreshed from Gamma with the winner markets. Each market opens from the Democratic
            outcome to the Republican outcome: the Democrat’s wider margin first, then that
            candidate’s narrower margin, then the Republican’s narrower margin, then the wider
            Republican win. Odds reorders that same list by price, highest chance first, and
            does not change a price. Alaska and Maine Senate each list a first-round market
            and a final-round market, and each market has its own sort. Refresh puts every
            market back on Democrat to Republican. The generic-ballot slider does not move
            those prices. A race with no such market says so. House districts do not get that
            list. The detector at the bottom of this tab uses the same live tossup-map event,
            and your picks there are cleared only by a refresh.
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
              <a className="underline underline-offset-4" href={live.senateControl.url}>
                Polymarket, which party will win the Senate
              </a>
              {" "}and{" "}
              <a className="underline underline-offset-4" href={live.houseControl.url}>
                which party will win the House
              </a>
              , live from Polymarket when the Gamma fetch succeeds
            </li>
            <li>
              <a className="underline underline-offset-4" href="https://fiftyplusone.news/averages">
                FiftyPlusOne, 2026 Senate and governor averages
              </a>
            </li>
            <li>
              <a className="underline underline-offset-4" href="https://electoral-vote.com/evp2026/Senate/averages.html">
                Electoral-Vote.com, Senate averages
              </a>
            </li>
            <li>
              <a className="underline underline-offset-4" href="https://www.270towin.com/polls/latest-2026-senate-election-polls/">
                270toWin, 2026 Senate and governor polling averages
              </a>
            </li>
            <li>
              <a className="underline underline-offset-4" href="https://www.realclearpolling.com/elections/senate/2026/toss-ups">
                RealClearPolling, 2026 Senate and governor averages
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
            <li>
              <a className="underline underline-offset-4" href="https://votehub.com/2026-forecast/">
                VoteHub, 2026 forecast
              </a>
              , ratings fetched {VOTEHUB_AS_OF}. The label on a clicked race is the one VoteHub
              prints in its Ratings view. The link opens that race on VoteHub.
            </li>
            </ul>
        </section>
        <TossupDetector
          picks={tossupPicks}
          onPick={(abbr, side) => setTossupPicks((current) => ({ ...current, [abbr]: side }))}
        />
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
  if (days === -1) return "Election Day was yesterday. This page is not a results page. Polls and VoteHub stay the October 31 snapshot.";
  return `Election Day was ${Math.abs(days)} days ago. This page is not a results page. Polls and VoteHub stay the October 31 snapshot.`;
}

function LiveOddsHeader() {
  const live = useLiveOdds();
  return (
    <div className="mt-1 flex min-w-0 flex-col items-start gap-2 sm:items-end" data-testid="polymarket-live-status" data-status={live.status}>
      <p data-testid="polymarket-live-time">
        {liveOddsCopy(live.status, live.chicago, POLYMARKET_AS_OF)}
        {live.status === "live" ? " Polls and VoteHub stay snapshots." : ""}
      </p>
      <button
        type="button"
        data-testid="polymarket-refresh"
        className="h-11 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted"
        onClick={live.refresh}
        disabled={live.refreshing}
      >
        {live.refreshing ? "Refreshing prices" : "Refresh prices"}
      </button>
    </div>
  );
}

function PolymarketAsOf({ snapshot, testId }: { snapshot: string; testId?: string }) {
  const live = useLiveOdds();
  return (
    <p
      className="text-xs leading-5 text-muted-foreground"
      data-testid={testId ?? "polymarket-as-of"}
      data-status={live.status}
    >
      {liveOddsCopy(live.status, live.chicago, snapshot)}
    </p>
  );
}

function StateGenericControl({
  stateName,
  customDelta,
  generic,
  clamped = false,
  onCustomDelta,
  onReset,
  sliderTestId,
  deltaTestId,
  resetTestId,
  hint,
  className,
}: {
  stateName: string;
  customDelta: number;
  generic: number;
  clamped?: boolean;
  onCustomDelta: (value: number) => void;
  onReset: () => void;
  sliderTestId: string;
  deltaTestId: string;
  resetTestId: string;
  hint?: string;
  className?: string;
}) {
  const deltaText = customDeltaLabel(customDelta);
  const genericText = `${formatMargin(generic)}${clamped ? " clamped" : ""}`;
  const summary = `${deltaText} · generic ${genericText}`;
  return (
    <div className={cn("grid min-w-0 gap-1", className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs leading-4 font-medium whitespace-nowrap tabular-nums">
          <span data-testid={deltaTestId}>{deltaText}</span>
          <span className="font-normal text-muted-foreground"> · generic {genericText}</span>
        </span>
        <Button
          type="button"
          variant="outline"
          className="h-11 shrink-0 px-3"
          data-testid={resetTestId}
          aria-label={`Reset the ${stateName} generic ballot to the original estimate`}
          onClick={onReset}
        >
          Reset
        </Button>
      </div>
      <input
        type="range"
        min={STATE_CUSTOM_MIN}
        max={STATE_CUSTOM_MAX}
        step={0.1}
        value={customDelta}
        data-testid={sliderTestId}
        aria-label={`Custom generic ballot for ${stateName}, from 20 points more Republican to 20 points more Democratic`}
        aria-valuemin={STATE_CUSTOM_MIN}
        aria-valuemax={STATE_CUSTOM_MAX}
        aria-valuenow={customDelta}
        aria-valuetext={summary}
        onChange={(event) => onCustomDelta(Number(event.target.value))}
        className="h-11 w-full min-w-0 max-w-full cursor-pointer accent-foreground"
      />
      {hint ? <span className="text-xs leading-5 font-normal text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

type StateSortKey =
  | "name"
  | "margin"
  | "house"
  | "custom"
  | "baseline"
  | "turnout"
  | "dem"
  | "rep"
  | "percent";

type StateSort = { key: StateSortKey; dir: "asc" | "desc" };

const STATE_COLUMNS: { key: StateSortKey; label: string; align: "left" | "right" }[] = [
  { key: "name", label: "State", align: "left" },
  { key: "margin", label: "Generic margin", align: "left" },
  { key: "house", label: "2024 generic", align: "left" },
  { key: "custom", label: "Custom delta", align: "left" },
  { key: "baseline", label: "2022 baseline votes", align: "right" },
  { key: "turnout", label: "Expected turnout", align: "right" },
  { key: "dem", label: "Democratic votes", align: "right" },
  { key: "rep", label: "Republican votes", align: "right" },
  { key: "percent", label: "Percent of 2024 House vote", align: "right" },
];

function stateSortStarts(key: StateSortKey): "asc" | "desc" {
  if (key === "name" || key === "margin" || key === "house" || key === "custom") return "asc";
  return "desc";
}

function stateSortMark(key: StateSortKey, dir: "asc" | "desc"): string {
  if (key === "name") return dir === "asc" ? "A–Z" : "Z–A";
  if (key === "margin" || key === "house" || key === "custom") {
    return dir === "asc" ? "R to D" : "D to R";
  }
  return dir === "desc" ? "high to low" : "low to high";
}

function stateSortValue(
  ballot: {
    name: string;
    margin: number;
    houseMarginD: number;
    customDelta: number;
    baseline: number;
    turnout: number;
    demVotes: number;
    repVotes: number;
    percentOf2024: number;
  },
  key: StateSortKey,
): number | string {
  switch (key) {
    case "name":
      return ballot.name;
    case "margin":
      return ballot.margin;
    case "house":
      return ballot.houseMarginD;
    case "custom":
      return ballot.customDelta;
    case "baseline":
      return ballot.baseline;
    case "turnout":
      return ballot.turnout;
    case "dem":
      return ballot.demVotes;
    case "rep":
      return ballot.repVotes;
    case "percent":
      return ballot.percentOf2024;
  }
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
    houseMarginD: number;
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
  const [sort, setSort] = useState<StateSort | null>(null);
  const rows = [...ballots].sort((a, b) => {
    const key = sort?.key ?? "name";
    const dir = sort?.dir ?? "asc";
    const left = stateSortValue(a, key);
    const right = stateSortValue(b, key);
    const compared =
      typeof left === "string" || typeof right === "string"
        ? String(left).localeCompare(String(right), "en")
        : left - right;
    if (compared === 0) return a.name.localeCompare(b.name, "en");
    return dir === "asc" ? compared : -compared;
  });

  function toggleSort(key: StateSortKey) {
    setSort((current) => {
      if (!current || current.key !== key) return { key, dir: stateSortStarts(key) };
      return { key, dir: current.dir === "asc" ? "desc" : "asc" };
    });
  }

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
            Every state slider starts on the original generic. Refresh clears these sliders, the national slider, the turnout slider, and every state’s 2024 turnout adjustment.
          </p>
        )}
      </div>
      <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
        The national slider moves every state by the same amount. The slider in each row moves only that
        state, from 20 points more Republican to 20 points more Democratic than the original estimate.
        The original is the even-swing figure plus the national slider. Reset on that row restores it
        and leaves the national slider, turnout, and every other state alone. The same slider is in the
        state dossier. The 2024 generic column is that state’s 2024 U.S. House popular-vote margin and
        does not move. The table opens A to Z by state. Click a column header to sort, and click
        it again to reverse that column. Generic margin, the 2024 generic, and the custom delta
        start with the more Republican figure. Vote counts and the percent of the 2024 House vote
        start with the largest figure. Sorting does not move a slider, the national margin, or turnout.
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
          <table
            className="w-full border-separate border-spacing-0 text-left text-sm"
            data-testid="state-table"
            data-sort-key={sort?.key ?? ""}
            data-sort-dir={sort?.dir ?? ""}
          >
            <caption className="sr-only">
              All 50 states, with generic-ballot margin, the 2024 House popular-vote margin, a per-state slider, the 2022 House baseline, expected turnout, Democratic and Republican votes, and each state’s expected ballots as a percent of its 2024 House vote. The table opens A to Z. Each column header sorts the rows.
            </caption>
            <thead className="sticky top-0 z-10 bg-card text-xs tracking-wide text-muted-foreground uppercase">
              <tr>
                {STATE_COLUMNS.map((column) => {
                  const active = sort?.key === column.key;
                  const mark = active ? stateSortMark(column.key, sort.dir) : "";
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                      className={cn(
                        "border-b bg-card px-2 py-3 align-bottom font-medium whitespace-normal",
                        column.align === "right" && "text-right",
                      )}
                    >
                      <button
                        type="button"
                        className={cn(
                          "inline-flex max-w-full cursor-pointer flex-wrap items-baseline gap-x-1 text-left font-medium",
                          column.align === "right" && "w-full justify-end",
                        )}
                        data-testid={`sort-${column.key}`}
                        data-active={active ? "true" : "false"}
                        data-direction={active ? sort.dir : ""}
                        aria-label={
                          active
                            ? `${column.label}, sorted ${mark}. Activate to reverse.`
                            : `Sort by ${column.label}`
                        }
                        onClick={() => toggleSort(column.key)}
                      >
                        <span>{column.label}</span>
                        {active ? (
                          <span className="tracking-normal normal-case" data-testid={`sort-mark-${column.key}`}>
                            {mark}
                          </span>
                        ) : null}
                      </button>
                    </th>
                  );
                })}
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
                  <td className="border-b px-2 py-2 whitespace-nowrap tabular-nums" data-testid={`generic-2024-${ballot.abbr}`} title="2024 U.S. House popular vote, Democratic percent minus Republican percent">{formatMargin(ballot.houseMarginD)}</td>
                  <td className="border-b px-2 py-2">
                    <StateGenericControl
                      stateName={ballot.name}
                      customDelta={ballot.customDelta}
                      generic={ballot.margin}
                      clamped={ballot.clamped}
                      onCustomDelta={(value) => onCustomDelta(ballot.abbr, value)}
                      onReset={() => onCustomDelta(ballot.abbr, 0)}
                      sliderTestId={`estimator-slider-${ballot.abbr}`}
                      deltaTestId={`estimator-delta-${ballot.abbr}`}
                      resetTestId={`reset-${ballot.abbr}`}
                      className="min-w-80"
                    />
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

function voteHubTone(label: string): string {
  if (label === "Tossup") return "votehub-badge-toss";
  if (label.endsWith(" D")) return "votehub-badge-d";
  if (label.endsWith(" R")) return "votehub-badge-r";
  if (label.endsWith(" I")) return "votehub-badge-i";
  return "votehub-badge-toss";
}

function VoteHubRow({
  rating,
  indexUrl,
  testId,
}: {
  rating: VoteHubRating | undefined;
  indexUrl: string;
  testId: string;
}) {
  if (!rating) {
    return (
      <div className="flex min-w-0 flex-col gap-1 text-sm leading-6" data-testid={testId} data-rating="">
        <p>VoteHub has not published a rating for this race.</p>
        <a
          href={indexUrl}
          target="_blank"
          rel="noreferrer"
          className="w-fit underline underline-offset-4"
          data-testid={`${testId}-link`}
        >
          VoteHub ratings
        </a>
      </div>
    );
  }

  return (
    <div
      className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-sm"
      data-testid={testId}
      data-rating={rating.label}
      data-source={rating.source}
    >
      <span className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">VoteHub</span>
      <span className={cn("votehub-badge", voteHubTone(rating.label))} data-testid={`${testId}-label`}>
        {rating.label}
      </span>
      <a
        href={rating.url}
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-4"
        data-testid={`${testId}-link`}
      >
        VoteHub rating
      </a>
    </div>
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
          <StateGenericControl
            stateName={state.name}
            customDelta={customDelta}
            generic={generic}
            clamped={ballot?.clamped}
            onCustomDelta={onCustomDelta}
            onReset={() => onCustomDelta(0)}
            sliderTestId="state-generic-range"
            deltaTestId="state-custom-delta"
            resetTestId="state-generic-reset"
            hint="More Republican at the left, more Democratic at the right, up to 20 points from the original estimate. Reset restores this state and leaves the national slider where it is."
          />
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
      {state.senate ? <PolymarketAsOf snapshot={POLYMARKET_AS_OF} testId="senate-odds-as-of" /> : null}
      {state.senate?.caveat ? (
        <p className="text-sm leading-6 text-muted-foreground">{state.senate.caveat}</p>
      ) : null}
      {state.senate ? <MarginSection abbr={state.abbr} office="senate" /> : null}
      {state.senate ? (
        <VoteHubRow
          rating={VOTEHUB_SENATE[state.abbr]}
          indexUrl={VOTEHUB_SENATE_INDEX}
          testId="senate-votehub"
        />
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
        No 2026 polling average from FiftyPlusOne, Electoral-Vote.com, 270toWin, or RealClearPolling.
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
          <li
            key={person.name}
            className="flex items-baseline justify-between gap-3 text-sm"
            data-testid={`senate-person-${person.party}`}
            data-chance={person.chance}
            data-polymarket={person.polymarket}
          >
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
          data-testid={`senate-race-${state.abbr}`}
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
  const live = useLiveOdds();
  const [selected, setSelected] = useState("TX");
  const rows = Object.entries(live.governors)
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
          Winner prices refresh from Polymarket’s Gamma API. Polls stay a snapshot:
          FiftyPlusOne from October 31, 2026, and 270toWin and RealClearPolling from
          November 1, 2026. Where those aggregators publish a 2026 average for the same two
          candidates, the chance is half that candidate’s share of the two-candidate average
          and half the Polymarket Yes price, then scaled so the quoted chances sum to about 100.
          Extra aggregators change only the polling half. The Polymarket weight stays 50%. A
          generic-ballot move of +1.0 adds 1.0 point to a polled projected margin and 0.5 points
          of two-party share on the polling half only. The Polymarket price is the live Yes price. A
          per-state generic adjustment moves only that state. Turnout does not move these chances
          or margins. Electoral-Vote.com does not publish a 2026 governor polling average, so it
          is not blended in. A race with no matching average is Polymarket-only, and the
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
            <PolymarketAsOf snapshot={GOVERNOR_POLYMARKET_AS_OF} testId="governor-odds-as-of" />
            {current.race.caveat ? (
              <p className="text-sm leading-6 text-muted-foreground">{current.race.caveat}</p>
            ) : null}
            <MarginSection abbr={current.abbr} office="governor" />
            <VoteHubRow
              rating={VOTEHUB_GOVERNOR[current.abbr]}
              indexUrl={VOTEHUB_GOVERNOR_INDEX}
              testId="governor-votehub"
            />
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

function formatOdds(value: number): string {
  return `${value.toFixed(1)} in 100`;
}

function MarginMarket({
  event,
  candidates,
}: {
  event: MarginEvent;
  candidates: MarketCandidate[];
}) {
  const [sort, setSort] = useState<MarginSort>("dem-rep");
  const ranked = sortMarginBrackets(event.brackets, candidates, sort);

  return (
    <div
      className="flex min-w-0 flex-col gap-2"
      data-testid="margin-event"
      data-slug={event.slug}
      data-sort={sort}
    >
      <p className="text-sm font-medium">{event.title}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={`Sort ${event.title}`} data-testid="margin-sort">
        <button
          type="button"
          aria-pressed={sort === "dem-rep"}
          data-testid="margin-sort-dem-rep"
          className={cn(
            "h-11 rounded-lg border px-3 text-left text-sm font-medium",
            sort === "dem-rep"
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background hover:bg-muted",
          )}
          onClick={() => setSort("dem-rep")}
        >
          Democrat to Republican
        </button>
        <button
          type="button"
          aria-pressed={sort === "odds"}
          data-testid="margin-sort-odds"
          className={cn(
            "h-11 rounded-lg border px-3 text-sm font-medium",
            sort === "odds"
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background hover:bg-muted",
          )}
          onClick={() => setSort("odds")}
        >
          Odds
        </button>
      </div>
      <ol className="flex min-w-0 flex-col gap-2">
        {ranked.map((bracket, rank) => (
          <li
            key={bracket.label}
            className="min-w-0"
            data-testid="margin-outcome"
            data-label={bracket.label}
            data-price={bracket.price}
          >
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0">
                <span className="mr-2 tabular-nums text-muted-foreground">{rank + 1}.</span>
                {bracket.label}
              </span>
              <span className="shrink-0 tabular-nums">{formatOdds(bracket.price)}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
              <div
                className="h-full rounded-full bg-foreground/70"
                style={{ width: `${Math.min(100, Math.max(0, bracket.price))}%` }}
              />
            </div>
          </li>
        ))}
      </ol>
      <a
        href={event.url}
        target="_blank"
        rel="noreferrer"
        data-testid="margin-link"
        className="text-sm underline underline-offset-4"
      >
        Polymarket margin of victory
      </a>
    </div>
  );
}

function MarginSection({ abbr, office }: { abbr: string; office: "senate" | "governor" }) {
  const live = useLiveOdds();
  const events = (office === "senate" ? live.senateMargins : live.governorMargins)[abbr];
  const race = office === "senate" ? live.senate[abbr] : live.governors[abbr];
  const candidates = race?.candidates ?? [];

  return (
    <div
      className="flex min-w-0 flex-col gap-3"
      data-testid={`${office}-margin-of-victory`}
      data-events={events?.length ?? 0}
    >
      <h3 className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
        Margin of victory
      </h3>
      {!events || events.length === 0 ? (
        <p className="text-sm leading-6" data-testid="margin-empty">
          No Polymarket margin-of-victory market.
        </p>
      ) : (
        <>
          {events.map((event) => (
            <MarginMarket key={event.slug} event={event} candidates={candidates} />
          ))}
          <p className="text-xs leading-5 text-muted-foreground" data-testid="margin-as-of">
            {liveOddsCopy(live.status, live.chicago, MARGIN_AS_OF)} Sorting does not change them, and they do not move with the generic ballot.
          </p>
        </>
      )}
    </div>
  );
}

function TossupDetector({
  picks,
  onPick,
}: {
  picks: Record<string, TossupSide>;
  onPick: (abbr: string, side: TossupSide) => void;
}) {
  const live = useLiveOdds();
  const states = live.tossup.states;
  const selected = states.filter((state) => picks[state.abbr] === "R" || picks[state.abbr] === "D");
  const matches = selected.filter((state) => picks[state.abbr] === tossupCall(state)).length;
  const allPicked = selected.length === states.length;
  const exact = allPicked
    ? exactTossupMapFrom(
        live.tossup.maps,
        states.filter((state) => picks[state.abbr] === "R").map((state) => state.abbr),
      )
    : undefined;
  const product = productIn100(
    selected.map((state) => (picks[state.abbr] === "R" ? state.republican : state.democrat)),
  );
  const matchLine =
    selected.length === 1
      ? `${matches} of 1 pick matches the market’s call.`
      : `${matches} of ${selected.length} picks match the market’s call.`;
  const selectedKey = allPicked && exact ? tossupMapKey(exact.republican) : null;

  return (
    <section className="flex min-w-0 flex-col gap-4" aria-labelledby="tossup-heading" data-testid="tossup-detector">
      <div className="flex max-w-3xl flex-col gap-3">
        <h2 id="tossup-heading" className="font-heading text-3xl">
          Tossup odd detector
        </h2>
        <p className="text-sm leading-7">
          Pick Republican or Democrat for any of these Senate races. Nothing is chosen until you
          click. A row lights up only after that pick. The market’s call is Republican when the
          price of Republicans winning that state is at least 50 in 100, and Democrat otherwise.
        </p>
        <p className="text-sm leading-7 text-muted-foreground">
          Those prices come from one Polymarket event, {TOSSUP_EVENT.title}. The outcomes are the
          maps of Alaska, Iowa, Kansas, Maine, Michigan, Ohio, and Texas. There is no separate
          contract for each state. The Republicans-win price is the sum of the Yes prices on the
          maps where Republicans win that state. The Democrat price is the sum on the maps where
          they do not. Those Yes prices add up to a little more than 100, so the two sides of one
          state do not add to 100. {liveOddsCopy(live.status, live.chicago, TOSSUP_AS_OF)} The
          generic-ballot slider does not move these prices or your picks. Refreshing the page
          clears the picks.
        </p>
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        {states.map((state) => {
          const pick = picks[state.abbr];
          const call = tossupCall(state);
          const agreement = pick ? (pick === call ? "agree" : "against") : "none";
          const sidePrice = pick === "R" ? state.republican : state.democrat;
          return (
            <div
              key={state.abbr}
              className={cn(
                "flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4",
                agreement === "agree" && "tossup-agree",
                agreement === "against" && "tossup-against",
              )}
              data-testid={`tossup-row-${state.abbr}`}
              data-agreement={agreement}
              data-republican={state.republican}
              data-democrat={state.democrat}
              data-call={call}
            >
              <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="font-heading text-2xl">{state.name}</h3>
                <p className="text-sm tabular-nums" data-testid={`tossup-republican-${state.abbr}`}>
                  Republicans win {formatOdds(state.republican)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={pick === "R" ? "default" : "outline"}
                  className="h-11 min-w-0"
                  aria-pressed={pick === "R"}
                  data-testid={`tossup-rep-${state.abbr}`}
                  onClick={() => onPick(state.abbr, "R")}
                >
                  Republican
                </Button>
                <Button
                  type="button"
                  variant={pick === "D" ? "default" : "outline"}
                  className="h-11 min-w-0"
                  aria-pressed={pick === "D"}
                  data-testid={`tossup-dem-${state.abbr}`}
                  onClick={() => onPick(state.abbr, "D")}
                >
                  Democrat
                </Button>
              </div>
              {pick ? (
                <p className="text-sm leading-6" data-testid={`tossup-side-${state.abbr}`}>
                  {pick === "R" ? "Republican" : "Democrat"} {formatOdds(sidePrice)}
                  {agreement === "agree" ? " · agrees with the market" : " · goes against the market"}
                </p>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">No side selected.</p>
              )}
            </div>
          );
        })}
      </div>
      {selected.length > 0 ? (
        <div className="flex min-w-0 max-w-3xl flex-col gap-2 rounded-xl border bg-card p-4" data-testid="tossup-summary">
          <p className="text-sm leading-6" data-testid="tossup-match-count">
            {matchLine}
          </p>
          {allPicked && exact ? (
            <p
              className="text-sm leading-6"
              data-testid="tossup-combined"
              data-kind="outcome"
              data-price={exact.price}
              data-label={exact.label}
            >
              This event trades that exact map at {formatOdds(exact.price)}. The contract asks, “{exact.question}” That is this outcome’s Yes price, not a product of the state prices.
            </p>
          ) : (
            <p className="text-sm leading-6" data-testid="tossup-combined" data-kind="product" data-price={product}>
              The product of the selected sides’ prices is {formatOdds(product)}. That multiplies those state prices from this event. It is not a separate traded parlay.
            </p>
          )}
        </div>
      ) : null}
      <TossupMapTable selectedKey={selectedKey} />
      <PolymarketAsOf snapshot={TOSSUP_AS_OF} testId="tossup-odds-as-of" />
    </section>
  );
}

function TossupMapTable({ selectedKey }: { selectedKey: string | null }) {
  const live = useLiveOdds();
  const rows = live.tossup.rows;
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedKey) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const row = scroller.querySelector<HTMLElement>('[data-selected="true"]');
    if (!row) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rowTop = row.getBoundingClientRect().top;
    const boxTop = scroller.getBoundingClientRect().top;
    const next =
      scroller.scrollTop + (rowTop - boxTop) - (scroller.clientHeight - row.offsetHeight) / 2;
    scroller.scrollTo({ top: Math.max(0, next), behavior: reduce ? "auto" : "smooth" });
  }, [selectedKey]);

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p id="tossup-map-caption" className="text-sm leading-6" data-testid="tossup-map-caption">
        {rows.length} maps, sorted from most likely to least. {liveOddsCopy(live.status, live.chicago, TOSSUP_AS_OF)}{" "}
        <a
          href={TOSSUP_EVENT.url}
          target="_blank"
          rel="noreferrer"
          data-testid="tossup-link"
          className="underline underline-offset-4"
        >
          Polymarket, which tossup Senate states Republicans win
        </a>
        .
      </p>
      <div
        ref={scrollerRef}
        className="max-h-[420px] min-w-0 overflow-auto rounded-xl border bg-card"
        data-testid="tossup-map-scroller"
      >
        <table
          className="w-full table-fixed border-separate border-spacing-0 text-left text-sm"
          data-testid="tossup-map-table"
          aria-describedby="tossup-map-caption"
        >
          <colgroup>
            <col className="w-11" />
            <col className="w-[6.25rem]" />
            <col />
            <col />
          </colgroup>
          <thead>
            <tr className="text-xs tracking-wide text-muted-foreground uppercase">
              <th scope="col" className="sticky top-0 border-b bg-card px-2 py-2 text-left font-medium">
                Rank
              </th>
              <th scope="col" className="sticky top-0 border-b bg-card px-2 py-2 text-left font-medium">
                Odds
              </th>
              <th scope="col" className="sticky top-0 border-b bg-card px-2 py-2 text-left font-medium">
                Republicans win
              </th>
              <th scope="col" className="sticky top-0 border-b bg-card px-2 py-2 text-left font-medium">
                Democrats win
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const selected = selectedKey !== null && row.key === selectedKey;
              return (
                <tr
                  key={row.key || "none"}
                  className={selected ? "tossup-map-selected" : undefined}
                  data-testid="tossup-map-row"
                  data-rank={row.rank}
                  data-price={row.price}
                  data-key={row.key}
                  data-selected={selected ? "true" : "false"}
                  aria-current={selected ? "true" : undefined}
                >
                  <td className="border-b px-2 py-2 align-top tabular-nums">{row.rank}</td>
                  <td className="border-b px-2 py-2 align-top leading-5 tabular-nums">{formatOdds(row.price)}</td>
                  <th scope="row" className="border-b px-2 py-2 text-left align-top leading-5 font-medium break-words">
                    {selected ? <span className="mb-0.5 block text-xs font-medium tracking-normal normal-case">Your map</span> : null}
                    {row.republicanLabel}
                  </th>
                  <td className="border-b px-2 py-2 align-top leading-5 break-words">{row.democratLabel}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function governorBlendNote(race: SenateRace, delta: number): string {
  const quoted = quotedChances(race, delta);
  const leader = [...quoted].sort((a, b) => b.chance - a.chance)[0];
  if (blendsPolls(race) && leader.poll !== null) {
    const shift =
      delta === 0
        ? " The Polymarket half is the live Yes price."
        : ` The polling half includes the generic-ballot shift of ${delta > 0 ? "+" : ""}${delta.toFixed(1)}. The Polymarket half is the live Yes price.`;
    return `${leader.name} is ${formatChance(leader.chance)} after splitting the Polymarket price, ${formatChance(leader.polymarket)}, with that candidate’s share of the two-candidate polling average, ${formatChance(leader.poll)}.${shift}`;
  }
  return `${leader.name} is ${formatChance(leader.polymarket)} on Polymarket. There is no matching 2026 polling average, so that price is not averaged with a poll and does not move with the generic-ballot shift. This race is Polymarket-only.`;
}

function HousePanel({ shiftFor }: { shiftFor: (abbr: string) => number }) {
  const live = useLiveOdds();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const shades: Record<string, DistrictShade> = {};
  for (const item of DISTRICT_PATHS) {
    const shade = districtShade(item.id, shiftFor(item.abbr), live.house);
    if (shade) shades[item.id] = shade;
  }
  const shape = selectedId ? districtById(selectedId) : undefined;
  const state = shape ? getState(shape.abbr) : undefined;
  const shift = shape ? shiftFor(shape.abbr) : 0;
  const generic = shape ? districtGeneric(shape.id, shift) : null;
  const market = shape ? live.house[shape.id] : undefined;
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
          2026 House district average, so these chances are the live Polymarket Yes price
          alone. That price is not copied from the generic ballot.
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
                            The polling margin plus this district’s generic-ballot shift of {shift > 0 ? "+" : ""}{shift.toFixed(1)}. Only the polling half of the chance moves. The Polymarket price is the live Yes price.
                          </span>
                        </p>
                      ) : (
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                          Polymarket only. There is no 2026 House polling average for this
                          district, so the chance is the live Yes price. It does not move with
                          the generic ballot, and it is not that estimate.
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
                      <div className="mt-2">
                        <PolymarketAsOf snapshot={HOUSE_POLYMARKET_AS_OF} testId="house-odds-as-of" />
                      </div>
                    </>
                  ) : (
                    <p className="mt-2 text-sm leading-6" data-testid="district-no-market">
                      There is no market projection. This district has no Polymarket winner market
                      in the stored contracts and no 2026 polling average. The generic-ballot
                      estimate is not a forecast.
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <VoteHubRow
                  rating={VOTEHUB_HOUSE[shape.id]}
                  indexUrl={VOTEHUB_HOUSE_INDEX}
                  testId="house-votehub"
                />
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
