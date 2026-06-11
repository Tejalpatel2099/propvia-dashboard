# Propvia Mini Property Dashboard

A full-stack property dashboard built for the Propvia technical assessment.
Browse live listings, search and filter them, view portfolio analytics, and add
new properties — backed by a PostgreSQL database (Supabase) and deployed on Vercel.

**Live demo:**
https://propvia-dashboard.vercel.app/

## Requirements coverage

| Requirement | Where |
| --- | --- |
| React frontend | React 18 + Vite, functional components and hooks |
| 10+ properties | 12 seeded listings (`supabase/schema.sql`) |
| Search & filter | Search across title/address/city; type, status, and price-range filters; 3 sort orders |
| Add-property form | Modal form with client-side validation, writes to the database |
| Database integration | Supabase (managed PostgreSQL) with row-level security |
| Deployed live | Vercel (steps below) |
| Public GitHub repo + README | This repo |

Beyond the requirements: a dashboard shell (sidebar navigation, KPI cards, two
charts that react to the active filters), a grid/table view toggle, and a
38-test suite (Vitest + React Testing Library).

## Features

- **Overview KPIs** — total listings, for-sale and for-rent counts, average sale price
- **Analytics** — listings-by-type bar chart and average-sale-price-by-city chart,
  both rendered as dependency-free SVG and recomputed live from the active filters
- **Listings** — responsive card grid with status badges and image fallbacks, plus a
  data table view for scanning; click any listing to open a **detail view** with
  full photo, specs, and description
- **Search & filters** — text search, type, status, min/max price, sorting, one-click reset
- **Add property** — modal form with validation (required fields, non-negative numbers);
  new listings persist to Postgres and appear instantly with a confirmation toast
- **States & accessibility** — skeleton loaders while data is fetching, error/empty states, keyboard focus styles,
  `aria-live` result counts, reduced-motion support, responsive down to mobile

## Tech stack

| Layer    | Choice                        | Why |
| -------- | ----------------------------- | --- |
| Frontend | React 18 + Vite               | Fast dev/build; idiomatic hooks-based components |
| Database | Supabase (managed PostgreSQL) | Real relational DB, row-level security, typed JS client |
| Testing  | Vitest + React Testing Library| Unit tests for pure logic, behavior tests for components |
| Hosting  | Vercel                        | Zero-config deploys with environment variables |

## Architecture & approach

The app is a single-page React application that talks to Supabase's PostgREST API
through `@supabase/supabase-js`. One table, `properties`, is protected by RLS
policies allowing public reads and inserts (appropriate for this demo's scope —
production would gate inserts behind auth).

All filtering/sorting/aggregation logic lives in `src/lib/listings.js` as pure
functions with no React or Supabase imports. That keeps components thin, makes
the business logic trivially unit-testable, and means the charts, KPI cards, and
listing views all derive from the same tested code paths.

The full listing set is fetched once on load; search/filter/sort run client-side
via `useMemo`. At this data scale that gives instant filtering with zero extra
round-trips. With a larger dataset I would push filtering into Supabase queries
(`.ilike()`, `.eq()`, `.gte()/.lte()`) and add pagination.

If Supabase env vars are absent (e.g., a fresh clone), the app falls back to
bundled demo data and shows a banner — so it always runs, and the test suite can
exercise real UI flows offline.

```
src/
  App.jsx                     # layout, data fetching, derived state
  App.test.jsx                # integration tests (search, filters, add flow, views)
  supabaseClient.js           # Supabase client + configuration check
  demoData.js                 # offline fallback data
  lib/
    listings.js               # pure filtering/sorting/stats/aggregation logic
    listings.test.js          # unit tests for all of the above
  components/
    Sidebar.jsx               # brand, section nav, data-source indicator
    FilterBar.jsx             # search, type/status/price filters, sort, reset
    PropertyCard.jsx (+ test) # listing card with badge + image fallback
    PropertyTable.jsx         # table view
    AddPropertyForm.jsx (+ test) # modal form with validation
    Charts.jsx                # SVG bar charts (no chart library)
supabase/
  schema.sql                  # table, RLS policies, 12-row seed
  update_images.sql           # migration: swap seed photos (for existing DBs)
```

## Testing

```bash
npm test         
npm run test:watch
```

- `lib/listings.test.js` — search matching, filter combinations, price bounds,
  sort orders, immutability, stats math, chart aggregations, formatting
- `AddPropertyForm.test.jsx` — required-field validation, payload typing
  (numbers coerced, state uppercased, blanks → null), server-error handling, Escape-to-close
- `PropertyCard.test.jsx` — price formatting, rental suffix, spec line, image fallback
- `App.test.jsx` — end-to-end flows in demo-data mode: search, status filter,
  empty state + reset, grid/table toggle, detail view open/close, add-property round trip

## Local setup

1. **Clone and install**

   ```bash
   git clone https://github.com/Tejalpatel2099/propvia-dashboard.git
   cd propvia-dashboard
   npm install
   ```

2. **Create the database** — create a free project at [supabase.com](https://supabase.com),
   open **SQL Editor → New query**, paste `supabase/schema.sql`, and run it.
   This creates the `properties` table, RLS policies, and 12 seed listings.

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in both values from **Supabase → Project Settings → API**:

   ```
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon public key>
   ```

4. **Run** — `npm run dev`, 

## Deployment (Vercel)

Link - https://propvia-dashboard.vercel.app/

## Possible next steps

- Authentication so only signed-in users can add listings
- Server-side filtering + pagination for larger datasets
- Image uploads via Supabase Storage instead of URLs


## Submission Links

Live Demo:
https://propvia-dashboard.vercel.app

GitHub Repository:
https://github.com/Tejalpatel2099/propvia-dashboard
