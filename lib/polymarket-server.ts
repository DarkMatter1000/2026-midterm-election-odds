import {
  GAMMA_EVENTS_URL,
  LIVE_REVALIDATE_SECONDS,
  allPolymarketSlugs,
  emptyLivePayload,
  formatChicago,
  parseGammaEvent,
  type LiveEvent,
  type LiveOddsPayload,
} from "@/lib/polymarket";

const BATCH = 80;
const CONCURRENCY = 4;
const FETCH_MS = 20_000;

type CacheBox = {
  expires: number;
  payload: LiveOddsPayload;
};

let cache: CacheBox | null = null;
let inflight: Promise<LiveOddsPayload> | null = null;

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

async function fetchBatch(slugs: string[]): Promise<LiveEvent[]> {
  const params = new URLSearchParams();
  params.set("limit", String(Math.max(slugs.length, 1)));
  for (const slug of slugs) params.append("slug", slug);
  const res = await fetch(`${GAMMA_EVENTS_URL}?${params}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: LIVE_REVALIDATE_SECONDS },
    signal: AbortSignal.timeout(FETCH_MS),
  });
  if (!res.ok) throw new Error(`Gamma ${res.status}`);
  const data: unknown = await res.json();
  if (!Array.isArray(data)) return [];
  const events: LiveEvent[] = [];
  for (const item of data) {
    const parsed = parseGammaEvent(item);
    if (parsed) events.push(parsed);
  }
  return events;
}

async function mapPool<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let index = 0;
  async function run() {
    while (index < items.length) {
      const current = index;
      index += 1;
      results[current] = await worker(items[current]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
  return results;
}

async function fetchAllEvents(): Promise<Record<string, LiveEvent>> {
  const slugs = allPolymarketSlugs();
  const batches = chunk(slugs, BATCH);
  const settled = await mapPool(batches, CONCURRENCY, async (batch) => {
    try {
      return await fetchBatch(batch);
    } catch {
      return null;
    }
  });
  const events: Record<string, LiveEvent> = {};
  let failures = 0;
  for (const batch of settled) {
    if (batch === null) {
      failures += 1;
      continue;
    }
    for (const event of batch) events[event.slug] = event;
  }
  if (Object.keys(events).length === 0 || failures === batches.length) {
    throw new Error("Gamma returned no live events");
  }
  return events;
}

export async function loadLiveOdds(): Promise<LiveOddsPayload> {
  const now = Date.now();
  if (cache && cache.expires > now) return cache.payload;
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const events = await fetchAllEvents();
      const fetched = new Date();
      const payload: LiveOddsPayload = {
        live: true,
        fetchedAt: fetched.toISOString(),
        chicago: formatChicago(fetched),
        events,
      };
      cache = { expires: Date.now() + LIVE_REVALIDATE_SECONDS * 1000, payload };
      return payload;
    } catch {
      cache = {
        expires: Date.now() + 15_000,
        payload: emptyLivePayload(),
      };
      return cache.payload;
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}
