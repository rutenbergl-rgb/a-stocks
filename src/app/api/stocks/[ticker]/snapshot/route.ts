import { getStockSnapshot } from "@/lib/data/stock-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ ticker: string }> },
) {
  const { ticker } = await context.params;
  const data = await getStockSnapshot(ticker);
  return Response.json({ data });
}
