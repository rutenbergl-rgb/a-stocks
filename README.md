# A-Stocks Tactical Dashboard (Phase 1 MVP)

Phase 1 functional MVP built with Next.js + TypeScript + Tailwind + PostgreSQL/Prisma schema.

## Run

1. Copy `.env.example` to `.env`
2. Set `DATA_PROVIDER=mock` (default) or `DATA_PROVIDER=fmp` and provide `FMP_API_KEY`
3. Install and run:

```bash
npm install
npm run dev
```

## Phase 1 Implemented

- Ticker search
- Stock snapshot API (price/history + fundamentals + technicals + valuation + tactical score)
- Fair value (P/E cases + DCF blended base + reverse DCF implied growth)
- Watchlist API and sortable watchlist table
- Dark dashboard UI with tactical breakdown
- Deterministic financial formula test suite

## Data Provider Plan

- **Free-first now:** `mock` provider for local development.
- **Swappable adapter:** provider interface in `src/lib/providers/provider.ts`.
- **Premium-ready adapter:** `FmpProvider` for market + fundamentals via API key.
- Future providers (Polygon, Tiingo, Finnhub, FRED, paid revisions feeds) can be added without UI changes.

## High-level File Structure

- `src/app/api/...` API routes for search, snapshots, watchlist
- `src/components/...` dashboard UI components
- `src/lib/calc/...` financial math (RSI/MA/DCF/reverse DCF/tactical)
- `src/lib/data/...` provider factory + stock snapshot orchestration
- `src/lib/providers/...` data source adapters
- `src/lib/store/...` watchlist persistence (in-memory for MVP)
- `prisma/schema.prisma` PostgreSQL data model
