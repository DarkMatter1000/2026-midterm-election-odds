"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { GOVERNORS } from "@/lib/governor-live";
import { HOUSE_MARKETS, type HouseMarket } from "@/lib/house-districts";
import {
  GENERIC_BALLOT_MARGIN,
  GOVERNOR_MARGINS,
  SENATE_MARGINS,
  type MarginEvent,
} from "@/lib/margin-live";
import {
  applyControl,
  applyHouseMarkets,
  applyMarginEvent,
  applyMarginEvents,
  applyRaces,
  applyTossup,
  emptyLivePayload,
  type LiveOddsPayload,
  type LiveTossup,
} from "@/lib/polymarket";
import {
  HOUSE_CONTROL,
  SENATE,
  SENATE_CONTROL,
  type SenateRace,
} from "@/lib/senate-live";
import { TOSSUP_EVENT } from "@/lib/tossup-live";

export const LIVE_POLL_MS = 45_000;

export type LiveOddsStatus = "loading" | "live" | "snapshot";

export type LiveOddsValue = {
  status: LiveOddsStatus;
  refreshing: boolean;
  refresh: () => void;
  fetchedAt: string | null;
  chicago: string | null;
  senate: Record<string, SenateRace>;
  governors: Record<string, SenateRace>;
  house: Record<string, HouseMarket>;
  senateMargins: Record<string, MarginEvent[]>;
  governorMargins: Record<string, MarginEvent[]>;
  senateControl: { dem: number; rep: number; url: string };
  houseControl: { dem: number; rep: number; url: string };
  genericBallotMargin: MarginEvent;
  tossup: LiveTossup;
};

const LiveOddsContext = createContext<LiveOddsValue | null>(null);

function fromPayload(payload: LiveOddsPayload | null, status: LiveOddsStatus): Omit<
  LiveOddsValue,
  "refreshing" | "refresh"
> {
  const events = payload?.live ? payload.events : {};
  return {
    status,
    fetchedAt: payload?.fetchedAt ?? null,
    chicago: payload?.chicago ?? null,
    senate: applyRaces(SENATE, events),
    governors: applyRaces(GOVERNORS, events),
    house: applyHouseMarkets(HOUSE_MARKETS, events),
    senateMargins: applyMarginEvents(SENATE_MARGINS, events),
    governorMargins: applyMarginEvents(GOVERNOR_MARGINS, events),
    senateControl: applyControl(SENATE_CONTROL, events),
    houseControl: applyControl(HOUSE_CONTROL, events),
    genericBallotMargin: applyMarginEvent(GENERIC_BALLOT_MARGIN, events),
    tossup: applyTossup(events[TOSSUP_EVENT.slug]),
  };
}

export function useLiveOddsSource(): LiveOddsValue {
  const [payload, setPayload] = useState<LiveOddsPayload | null>(null);
  const [status, setStatus] = useState<LiveOddsStatus>("loading");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (mode: "poll" | "refresh" = "poll") => {
    if (mode === "refresh") setRefreshing(true);
    try {
      const res = await fetch("/api/polymarket", { cache: "no-store" });
      const data = (await res.json()) as LiveOddsPayload;
      if (data?.live && data.events && Object.keys(data.events).length > 0) {
        setPayload(data);
        setStatus("live");
      } else {
        setPayload(emptyLivePayload());
        setStatus("snapshot");
      }
    } catch {
      setPayload(emptyLivePayload());
      setStatus("snapshot");
    } finally {
      if (mode === "refresh") setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const started = window.setTimeout(() => void load("poll"), 0);
    const id = window.setInterval(() => void load("poll"), LIVE_POLL_MS);
    return () => {
      window.clearTimeout(started);
      window.clearInterval(id);
    };
  }, [load]);

  const applied = useMemo(() => fromPayload(payload, status), [payload, status]);
  return { ...applied, refreshing, refresh: () => void load("refresh") };
}

export function LiveOddsProvider({
  value,
  children,
}: {
  value: LiveOddsValue;
  children: ReactNode;
}) {
  return <LiveOddsContext.Provider value={value}>{children}</LiveOddsContext.Provider>;
}

export function useLiveOdds(): LiveOddsValue {
  const value = useContext(LiveOddsContext);
  if (!value) throw new Error("useLiveOdds needs LiveOddsProvider");
  return value;
}

export function liveOddsCopy(status: LiveOddsStatus, chicago: string | null, snapshot: string): string {
  if (status === "live" && chicago) {
    return `Live from Polymarket, ${chicago}.`;
  }
  if (status === "loading") {
    return `Fetching live Polymarket prices. Showing the ${snapshot} snapshot until they arrive.`;
  }
  return `Snapshot — live fetch failed. These prices are the ${snapshot} snapshot, not live.`;
}
