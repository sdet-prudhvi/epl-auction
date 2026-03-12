# Equality Premier League Auction

Local auction system for `Equality Premier League (EPL) Season 1`.

This project is a lightweight full-stack prototype for running a live sports auction with:

- admin-operated bidding
- public auction board visibility
- dedicated player-to-position mapping
- pre-assigned locked owner-players
- persisted local state
- real-time sync across screens

It is intentionally built with plain `HTML + CSS + JavaScript + Node.js` so the auction rules can be finalized before moving to a larger production stack.

## Current League Model

- League: `Equality Premier League`
- Season: `Season 1`
- Teams: `4`
- Squad size per team: `12`
- Total roster size across league: `48`
- Purse per team: `96,000`
- Base price: `3,000`
- Auction operator: `Admin`
- Supporting roles: `Scorer`, `Observer`
- Team owners do not place bids directly in the system

## Important Auction Rules

### 1. Dedicated slot mapping

Every player is mapped to exactly one dedicated position.

Example:

- `Position 1` only shows the 4 players assigned to `Position 1`
- `Position 2` only shows the 4 players assigned to `Position 2`
- players do not leak across multiple batting/bowling buckets anymore

This is a key rule in the current build.

### 2. Random reveal inside a slot

The admin controls which slot is active.

Once a slot is opened:

- the system automatically reveals one random eligible player from that slot
- after that player is sold, the next random player in the same slot is revealed automatically
- this continues until that slot is fully filled

### 3. Admin-controlled slot order

The admin can jump to any slot from the slot timeline.

The auction is not forced to proceed in strict sequential order anymore.

### 4. No unsold flow

There is no unsold or re-entry behavior in this league model.

Every active slot must end with all required assignments completed.

### 5. Locked owner-players

Four team owners are also players and are already placed into their own teams before the live auction starts.

These players are treated as `Locked`:

- they are already assigned to their team
- they already occupy their slot
- they are not part of the live random auction pool
- they do not reduce team purse in the app because their calculation is handled offline

## Current Owner Locks

The following players are pre-assigned at seed time:

- `GOWTHAM GV` -> `Gowtham XI's` -> `Position 10`
- `SUNIL LAKKAKULA` -> `Sunil XI's` -> `Position 10`
- `Rahul Krishna Madasu` -> `Rahul XI's` -> `Position 2`
- `Achari` -> `Acharya XI'S` -> `Position 11`

Result:

- each team starts at `1/12 filled`
- each team still starts with purse `96,000`
- `4` players are locked before auction start
- live auction pool becomes `44` players

## Draft Data Status

The current player list is still a working draft for smoke testing.

Known status:

- current total players in app: `48`
- dedicated slot counts are balanced at `4 players per position`
- some names were sourced from the draft workbook
- some names were later confirmed manually in chat
- final player data may still change later

## Tech Stack

- frontend: plain `index.html`, `src/app.js`, `src/styles.css`
- backend: `Node.js` HTTP server
- persistence: local JSON file
- real-time updates: `Server-Sent Events (SSE)`

No frontend framework or external database is used in this prototype.

## Project Structure

- [index.html](/Users/prudhvikunchangi/Playwrightautomation/EPL-AUCTION/index.html)
  Main single-page UI for admin and public views.

- [server.js](/Users/prudhvikunchangi/Playwrightautomation/EPL-AUCTION/server.js)
  Local HTTP server that serves static files, API routes, and SSE events.

- [backend/store.js](/Users/prudhvikunchangi/Playwrightautomation/EPL-AUCTION/backend/store.js)
  Core auction state engine and action handlers.

- [backend/seed-state.js](/Users/prudhvikunchangi/Playwrightautomation/EPL-AUCTION/backend/seed-state.js)
  Builds the initial persisted auction state, including owner locks.

- [src/data/seed.js](/Users/prudhvikunchangi/Playwrightautomation/EPL-AUCTION/src/data/seed.js)
  Source of truth for slot templates, teams, players, dedicated positions, and owner assignments.

- [src/app.js](/Users/prudhvikunchangi/Playwrightautomation/EPL-AUCTION/src/app.js)
  Frontend rendering, API integration, UI state, public/admin view handling, and live event sync.

- [src/styles.css](/Users/prudhvikunchangi/Playwrightautomation/EPL-AUCTION/src/styles.css)
  Full visual styling, layout, motion, and status styles.

- [docs/auction-blueprint.md](/Users/prudhvikunchangi/Playwrightautomation/EPL-AUCTION/docs/auction-blueprint.md)
  Product/domain notes and future-state planning document.

- `data/auction-state.json`
  Persisted runtime state for local development. This file is generated and ignored by git.

## How To Run

From the project root:

```bash
npm start
```

Then open:

[http://127.0.0.1:4173/](http://127.0.0.1:4173/)

## Available Runtime Behavior

### Admin view

- start or pause auction
- jump to any slot
- record bids on behalf of teams
- mark player sold
- reopen last sold player
- see squad boards, roster table, activity log, and purse state

### Public view

- current live slot
- current bid / leading team
- team purse board
- sold history
- squad boards
- master roster table

### Persistence

State is persisted locally, so refreshes and restarts do not automatically reset the auction unless the seed file is written again.

## API Overview

### Read endpoints

- `GET /api/state`
  Returns the full persisted auction state.

- `GET /api/events`
  SSE stream for live state updates.

### Action endpoints

- `POST /api/actions/toggle-live`
- `POST /api/actions/set-slot`
- `POST /api/actions/nominate`
- `POST /api/actions/bid`
- `POST /api/actions/sell`
- `POST /api/actions/reopen-last-sold`
- `POST /api/actions/next-slot`
- `POST /api/actions/clear-nomination`
- `POST /api/actions/unsold`

Notes:

- `nominate` is effectively automatic in this build; manual player picking is not used
- `clear-nomination` is intentionally blocked because the desk auto-reveals players
- `unsold` is intentionally blocked by league rules

## Key State Concepts

### Player statuses

- `Pending`
  Live auction candidate for its dedicated slot.

- `Sold`
  Sold during the live auction.

- `Locked`
  Pre-assigned before the live auction begins.

### Slot completion

A slot is considered complete when all `4` team assignments for that slot are filled.

In the current system, `Locked` and `Sold` both count toward slot completion.

### Team slot restriction

A team cannot buy more than one player in the same slot.

That includes cases where the team already owns that slot through a locked owner-player.

## Agent Notes

This section is intentionally written for future AI tools or coding agents.

### Source of truth

If you need to change league structure or seed data, start here:

- [src/data/seed.js](/Users/prudhvikunchangi/Playwrightautomation/EPL-AUCTION/src/data/seed.js)

If you need to change auction rule behavior, start here:

- [backend/store.js](/Users/prudhvikunchangi/Playwrightautomation/EPL-AUCTION/backend/store.js)

If you need to change the initial boot state, start here:

- [backend/seed-state.js](/Users/prudhvikunchangi/Playwrightautomation/EPL-AUCTION/backend/seed-state.js)

If you need to change UI rendering or client-side behavior, start here:

- [src/app.js](/Users/prudhvikunchangi/Playwrightautomation/EPL-AUCTION/src/app.js)

### Non-obvious rules to preserve

- do not allow players to appear outside their dedicated slot
- do not include locked owner-players in live random nomination
- do not reduce purse for locked owner-players
- do not allow a team to bid in a slot it already owns
- keep live auction count aligned with locked count
- slot completion must count both locked and sold players

### Safe local reset

To reset the project to a fresh seeded state, rewrite `data/auction-state.json` using [backend/seed-state.js](/Users/prudhvikunchangi/Playwrightautomation/EPL-AUCTION/backend/seed-state.js).

### Current limitations

- no authentication
- no database beyond local JSON persistence
- no audit roles beyond UI/documented workflow
- no final branding assets integrated yet
- no production deployment setup
- no Playwright suite committed yet

## Recommended Next Steps

- replace draft player data with final confirmed player list
- integrate EPL and team logo assets
- add role-based authentication for admin, scorer, and observer
- move persistence from JSON file to a database
- add Playwright smoke and auction-flow tests
- split admin and public screens more formally if productionized
