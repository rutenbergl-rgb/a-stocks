import { searchTickers } from "@/lib/data/stock-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? "";
  const data = await searchTickers(query);
  return Response.json({ data, lastUpdated: new Date().toISOString() });
}
