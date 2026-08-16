import { addToWatchlist, listWatchlist } from "@/lib/store/watchlist-store";

export async function GET() {
  return Response.json({ data: listWatchlist(), lastUpdated: new Date().toISOString() });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { ticker?: string };
  if (!body.ticker) return new Response("ticker required", { status: 400 });
  return Response.json({ data: addToWatchlist(body.ticker) });
}
