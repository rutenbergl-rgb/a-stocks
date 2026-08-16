# A-Stocks Tactical Dashboard (Phase 1 MVP)

Institutional-style tactical investing dashboard for U.S. equities.

## Phase 1 includes

- Ticker search
- Stock detail page with price trend, moving averages, RSI, relative strength
- Tactical score + tactical rating with component transparency
- Valuation panel (forward P/E, PEG, FCF yield, fair-value scenarios)
- Fair-value engine starter (P/E scenarios + DCF baseline)
- Market-regime summary panel
- Watchlist page
- PostgreSQL + Prisma schema foundation

## Data providers

Provider abstraction is implemented in `src/lib/providers`.

- **Financial Modeling Prep provider** (official API) when `FMP_API_KEY` is set
- **Deterministic demo provider** fallback for local development/tests

This lets you ship quickly with free/demo data and swap to premium data later without changing UI/business logic.

## Environment

Copy `.env.example` to `.env`.

## Run

```bash
npm install
npm run dev
```

## Test

```bash
npm run test
```

## Important

This app is decision-support software and not investment advice. It does not place orders and does not guarantee returns.
