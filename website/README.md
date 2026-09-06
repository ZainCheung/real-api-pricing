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

1. Build with project base path:

   ```bash
   cd website
   VITE_BASE=/real-api-pricing/ pnpm build
   ```

2. Publish the contents of `website/dist` to the `gh-pages` branch, or use GitHub Actions to deploy `website/dist` to Pages.

3. Repo Settings → Pages → source = deployed branch / Actions.

Example Actions sketch (set Node 20, install deps in `website/`, build with `VITE_BASE=/real-api-pricing/`, upload `website/dist` via pages artifact + deploy-pages).

Adjust `VITE_BASE` if the repo name differs.

## Refreshing data

After regenerating `derived/points.json` in the repo root:

```bash
cp ../derived/points.json public/data/points.json
cp ../derived/points.csv public/data/points.csv
cp ../data/adopted.csv public/data/adopted.csv
```

Then rebuild.

## Design notes

Dark research-landing aesthetic inspired by modern benchmark sites (teal accent on near-black surfaces, generous spacing, stat strip, numbered method cards). Branding and copy are original to **Real API Pricing**.

## package.json scripts

- `dev` — Vite dev server
- `build` — typecheck + production static build to `dist/`
- `preview` — serve `dist/` locally
