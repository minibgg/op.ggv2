# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` / `npm run preview` — production build / preview
- `npm run lint` — ESLint (flat config in `eslint.config.js`)

There is no test runner configured. Requires `VITE_API_URL` in `.env` (see `.env.example`) pointing at the backend (`../backend`), which holds the Riot key; the frontend never sees it. README is in Russian; code comments are too.

## Architecture

React 19 SPA (JSX, no TypeScript). Riot API calls go through the separate Express backend (`/api/riot/...`); DataDragon/CommunityDragon are fetched directly. Uses React Router v7, plain CSS files per component/page (imported next to the component), and the React Compiler (via `@rolldown/plugin-babel` in `vite.config.js`), so avoid manual `useMemo`/`useCallback` unless needed.

### Routes (`src/App.jsx`)
`/` Search, `/profile/:playerData`, `/compare/:players`, `/liveGame/:playerData?`. `AsciiBackground` and the `RankThemeProvider` wrap all routes.

### `playerData` URL convention
Players are identified in URLs as `Name_With_Spaces-TAG-REGION` (e.g. `Some_Name-RU1-RU`): spaces become `_`, last segment is the region key, second-to-last the tagline. Parse with `parsePlayerData` / `getFormattedName` rather than splitting by hand.

### Service layer (`src/service/`, re-exported from `index.js`)
- `riotApi.js` — low-level fetchers. Riot methods call the backend with a region key from `REGIONS` (60s timeout for Render cold starts); the backend maps it to cluster/platform hosts and returns `{ error: { kind } }` on failure, which `riotFetch` turns back into `error.kind` for `ErrorMessage`. Static data (DataDragon version, champions, items, CommunityDragon) goes through a two-level cache (in-memory Map + browser Cache API) with an 8s fetch timeout.
- `riotService.js` — orchestration, e.g. `loadPlayer` fetches account then everything else in parallel, with a 5‑minute in-memory TTL cache (`clearPlayerCache`, `forceRefresh`) to stay under the dev-key rate limit (100 req / 2 min).
- `Utils.js` — pure helpers (win streak, name formatting, etc.).

### Other
- `vite.config.js` proxies `/api` → `raw.communitydragon.org` for dev.
- `src/context/RankThemeContext.jsx` holds the rank-derived accent color (`useRankTheme`) set by the profile page and consumed by the background/frames.
- Shared components are barrel-exported from `src/components/index.js`; page-specific pieces (e.g. `BaseInfoFrame`, `usePlayerData`) live in their page folder.
