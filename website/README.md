# Real API Pricing — Website

Interactive TanStack (Vite + React Router) static site for [real-api-pricing](https://github.com/ZainCheung/real-api-pricing) data.

**Real unit price = monthly subscription fee ÷ monthly usable tokens.**

## Stack

- Vite + React 19 + TypeScript
- TanStack Router (file routes, SPA)
- Tailwind CSS v4
- Recharts (overview bars + Pareto scatter)
- EN / 中文 toggle
- Self-contained data under `public/data/` (copied from `derived/` / `data/`)

## Develop

```bash
cd website
pnpm install   # or: npm install
pnpm dev       # or: npm run dev
```

Open the printed local URL (default `http://localhost:5173/`).

## Build

```bash
cd website
pnpm build     # or: npm run build
pnpm preview   # or: npm run preview
```

Output directory: **`website/dist`**.

### Base path (GitHub Pages)

Set `VITE_BASE` when the site is not served from domain root:

```bash
VITE_BASE=/real-api-pricing/ pnpm build
```

Or copy `.env.example` → `.env` and set `VITE_BASE=/real-api-pricing/`.

For Vercel / Cloudflare Pages at the project root, leave base as `/` (default).

## Deploy

### Vercel

| Setting | Value |
|---|---|
| Root Directory | `website` |
| Framework | Vite |
| Build Command | `pnpm build` or `npm run build` |
| Output Directory | `dist` |
| Install Command | `pnpm install` or `npm install` |

`vercel.json` rewrites all routes to `index.html` for SPA fallback.

Environment: leave `VITE_BASE` unset (or `/`).

### Cloudflare Pages

| Setting | Value |
|---|---|
| Root directory | `website` |
| Build command | `pnpm build` or `npm run build` |
| Build output directory | `dist` |

`public/_redirects` provides `/* → /index.html` (200) for SPA routing.

### GitHub Pages

Merging to `main` triggers [`.github/workflows/deploy-website.yml`](../.github/workflows/deploy-website.yml) (also runnable via **workflow_dispatch**). Enable Pages in repo settings with **Source = GitHub Actions** first.

Manual build with project base path:

```bash
cd website
VITE_BASE=/real-api-pricing/ npm run build
```

The workflow installs deps, builds with `VITE_BASE=/real-api-pricing/`, and deploys `website/dist` via the Pages artifact + `deploy-pages`.

Adjust `VITE_BASE` if the repo name differs.

## Refreshing data

`predev` / `prebuild` automatically run `sync-data`, which copies:

- `../derived/points.json` → `public/data/points.json`
- `../derived/points.csv` → `public/data/points.csv`
- `../data/adopted.csv` → `public/data/adopted.csv`

After regenerating derived data in the repo root, sync explicitly if needed:

```bash
npm run sync-data
```

Then `npm run build` (or just rely on `prebuild`).

## Design notes

Dark research-landing aesthetic inspired by modern benchmark sites (teal accent on near-black surfaces, generous spacing, stat strip, numbered method cards). Branding and copy are original to **Real API Pricing**.

## package.json scripts

- `sync-data` — copy derived/data CSVs into `public/data/`
- `predev` / `prebuild` — auto-run `sync-data` before `dev` / `build`
- `dev` — Vite dev server
- `build` — typecheck + production static build to `dist/`
- `preview` — serve `dist/` locally
