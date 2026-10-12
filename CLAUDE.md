# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server
- `npm run build` / `npm run preview` — production build / preview
- `npm run lint` — ESLint (flat config in `eslint.config.js`)

There is no test runner configured. Requires `VITE_API_URL` in `.env` (see `.env.example`) pointing at the backend (`../backend`), which holds the Riot key; the frontend never sees it. README is in Russian; code comments are too. The README is partly stale: it mentions a "Hero Tracker" page and CSS Modules, and neither exists.

Deployed on Vercel. The `gh-pages` dependency and the commented-out `base` in `vite.config.js` are left over from an old GitHub Pages deploy.

## Architecture

React 19 SPA (JSX, no TypeScript) with `BrowserRouter`. Riot API calls go through the separate Express backend (`/api/riot/...`); DataDragon/CommunityDragon are fetched directly from their absolute URLs. Uses React Router v7, plain CSS files per component/page (imported next to the component), and the React Compiler (via `@rolldown/plugin-babel` in `vite.config.js`), so avoid manual `useMemo`/`useCallback` unless needed.

### Routes (`src/App.jsx`)
`/` Search, `/profile/:playerData`, `/compare/:players`, `/liveGame/:playerData?`. `AsciiBackground` and the `RankThemeProvider` wrap all routes.

### `playerData` URL convention
Players are identified in URLs as `Name_With_Spaces-TAG-REGION` (e.g. `Some_Name-RU1-RU`): spaces become `_`, last segment is the region key, second-to-last the tagline. Compare URLs join two of these with `==` (`/compare/A-TAG-EUW==B-TAG-RU`). Don't split by hand:
- `parsePlayerData` (`riotService.js`) gives `{ gameName, tagLine, regionKey }` for API calls. An unknown region silently falls back to `EUW`.
- `getFormattedName` (`Utils.js`) is for display and turns the name into `Name#TAG`.

### Service layer (`src/service/`)
Components import everything from the `../../service` barrel. `Utils.js` also re-exports the other service modules.
- `riotApi.js` — `riotFetch` plus one method per backend endpoint. Path params are `encodeURIComponent`-ed. It uses a 60s timeout (Render cold starts) and takes an optional caller `signal`; a manual abort is rethrown as is, and a timeout or network failure becomes `kind: "NETWORK"`. Backend `{ error: { kind } }` bodies become `error.kind`; with no body, the kind comes from the HTTP status. `REGIONS` must match the backend's `regionToCluster`.
- `dataDragon.js` — static data (DataDragon version/champions/items/summoner spells, CommunityDragon spells/runes/champion items). Spread into `riotApi`, so `riotApi.getVersion()` etc. work. Two-level cache: in-memory `Map` plus browser Cache API, one cache per DDragon version, with a 15s fetch timeout. The latest version is also kept in `localStorage` for 6h. `getItemsInfo` adds `stats` and `effects` to each item: its DataDragon description split at `<stats>` and reduced to sanitized HTML (only `<span class="item…">` from a tag whitelist, plus `<br>`), which `ItemDescription` renders with `dangerouslySetInnerHTML`. All game popups (runes, items, summoner spells) go through `WithTooltip` + `GameTooltip` (`src/components/GameTooltip`): hover/focus shows, click/tap pins (and doesn't follow the surrounding card link), outside tap or Escape closes, placement flips up/left near screen edges. Use it for any new icon tooltip instead of `title` or custom hover state.
- `riotService.js` — orchestration. `loadPlayer` fetches the DDragon version and the account first, then summoner/rank/match IDs/masteries/champions/items in parallel, then details for the last 5 matches. Results go into a 5-minute in-memory TTL cache keyed by the `playerData` string (`clearPlayerCache`, `forceRefresh`) to stay under the dev-key rate limit. `getLiveGame` returns `{ account, game }` with `game: null` when the player isn't in a game; it and `getPlayerRank` reuse a fresh profile cache entry instead of refetching the account/rank. `getSummonerSpellsMap`, `getRunesMap` and `getChampionNamesMap` build id → name/icon maps from static data.
- `Utils.js` — pure helpers (win streak, queue labels, rank colors, relative time), plus recent/pinned searches stored in `localStorage` (`lol_recent_searches`, max 10).

### Errors
`ErrorMessage` maps `error.kind` to an English message through its `MESSAGES` object; unknown kinds get a generic fallback, and NOT_FOUND hides the retry button. When you add a new error kind (e.g. `BAD_REQUEST`), add it there too.

### Other
- The `/api` → `raw.communitydragon.org` proxy in `vite.config.js` isn't used by any current source. Never set `VITE_API_URL` to empty or relative, or `/api/riot/...` calls would be sent to CommunityDragon in dev.
- `src/context/RankThemeContext.jsx` holds the rank-derived accent color (`useRankTheme`) set by the profile and live game pages and consumed by the background/frames.
- `#root` has a global `min-width: 1126px` and `.appShell` 50px padding, so pages are desktop-only by default. The live game page is the exception: `LiveGamePage.css` lifts both via `:has(.liveGamePage)` for its phone layout.
- The UI is in English (code comments and README stay Russian). Domain terms (Live Game, Searched player…) are in `GLOSSARY.md`.
- Spectator v5 (the `live` endpoint) returns only the keystone in `perks.perkIds` (plus `perkStyle`/`perkSubStyle`), not the full 9-rune page; anonymized players come with `puuid: null` and the champion name as `riotId`. The shared `RunesCell` (`src/components/RunesCell`, loads the rune map itself like `SummonerSpellIcon`) takes that Spectator shape and handles both the 1-id live game case and the full 9-id page; match history converts match-v5 `perks` to it with `getMatchRunePage` (`Utils.js`). Check real responses before mocking the `live` endpoint.
- Shared components are barrel-exported from `src/components/index.js`; page-specific pieces (e.g. `BaseInfoFrame`, `usePlayerData`) live in their page folder.
