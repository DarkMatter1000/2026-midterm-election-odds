import { emptyLivePayload } from "@/lib/polymarket";
import { loadLiveOdds } from "@/lib/polymarket-server";

export async function GET(request: Request) {
  const fail = new URL(request.url).searchParams.get("fail");
  if (fail === "1") {
    return Response.json(emptyLivePayload(), {
      headers: { "Cache-Control": "no-store" },
    });
  }
  const payload = await loadLiveOdds();
  return Response.json(payload, {
    headers: {
      "Cache-Control": payload.live
        ? "public, s-maxage=45, stale-while-revalidate=15"
        : "no-store",
    },
  });
}
