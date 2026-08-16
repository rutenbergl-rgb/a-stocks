import { searchTickers } from "@/lib/services/stock-service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const results = await searchTickers(query);
  return NextResponse.json({ results });
}
