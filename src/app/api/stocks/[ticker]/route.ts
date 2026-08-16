import { getStockSnapshot } from "@/lib/services/stock-service";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const data = await getStockSnapshot(ticker);
  return NextResponse.json(data);
}
