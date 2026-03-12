# EPL Auction Blueprint

## Core scenario

`Equality Premier League (EPL) Season 1` runs a live player auction for `4 teams`.

Each team builds a squad of `12 players`, so the full auction covers:

- `48 total player purchases`
- `12 position-driven rounds`
- `4 players bought in each round`, one by each team

## Auction structure

The auction is not fully open by free-role bidding. It is ordered by slot template.

Example:

1. Position 1 - Batting Slot
2. Position 2 - Batting Slot
3. Position 3 - Batting Slot
4. Position 4 - Wicketkeeper Slot
5. Position 5 - Batting Slot
6. Position 6 - Batting Slot
7. Position 7 - All-Rounder Slot
8. Position 8 - All-Rounder Slot
9. Position 9 - Bowling Slot
10. Position 10 - Bowling Slot
11. Position 11 - Bowling Slot
12. Position 12 - Bowling Slot

This slot template reflects the current draft workbook import and is still provisional until final role mapping is confirmed.

Current confirmed draft rules:

- purse per team: `96,000 points`
- base price: `3,000 points`
- `Position 4` must be filled by a wicketkeeper
- there is no unsold logic; every player in the active slot must be sold
- a slot can move forward only after all `4` purchases in that slot are completed

Current operating roles:

- `Admin`: records nominations, bids, sales, and undo / reopen actions
- `Scorer`: supports validation and keeps parallel score / record tracking
- `Observer`: read-only role for monitoring the live auction
- team owners do not bid directly in the system; admin records bids on their behalf
- purse visibility and sold history are visible to everyone

## Recommended product modules

### 1. Competition setup

- league info
- season info
- team registration
- slot template definition
- purse configuration
- auction order configuration

### 2. Player management

- player master list
- role / slot eligibility
- base price
- profile details
- auction status: pending, sold, withdrawn

### 3. Live auction console

- current slot
- eligible players for current slot
- nominated player
- current highest bid
- bid history
- sold action
- undo / reopen last sold action
- move to next slot

### 4. Team purse and squad board

- remaining purse
- slot completion
- squad by position
- validation against slot template

### 5. Admin controls

- start / pause auction
- undo previous action
- reopen last sold player
- override assignment
- publish live state

### 6. Audience / owner view

- live auction state
- team squads
- purse visibility
- recent sold players

## Suggested data model

### League

- `id`
- `name`

### Season

- `id`
- `leagueId`
- `name`
- `status`
- `teamCount`
- `squadSize`

### Team

- `id`
- `seasonId`
- `name`
- `code`
- `ownerName`
- `purseTotal`
- `purseRemaining`

### AuctionSlot

- `id`
- `seasonId`
- `slotNumber`
- `label`
- `roleKey`
- `maxSelectionsPerTeam`

### Player

- `id`
- `seasonId`
- `name`
- `displayRole`
- `primaryRole`
- `eligibleSlotNumbers`
- `basePrice`
- `status`

### Bid

- `id`
- `seasonId`
- `slotId`
- `playerId`
- `teamId`
- `amount`
- `timestamp`

### Purchase

- `id`
- `seasonId`
- `slotId`
- `playerId`
- `teamId`
- `finalAmount`
- `status`

### AuctionState

- `currentSlotNumber`
- `nominatedPlayerId`
- `currentBid`
- `leadingTeamId`
- `isLive`
- `version`
- `lastUpdatedAt`
- `lastEvent`

## Backend implementation now in place

- persisted state file for local development
- APIs for:
  - nominate player
  - record bid
  - sell player
  - reopen last sold player
  - move to next slot
  - set current slot
  - pause / resume auction
  - clear nomination
  - unsold endpoint returns a rules-based rejection for EPL
- real-time screen sync using server-sent events
- frontend now reads from the API instead of static browser-only state

## Validation rules to preserve

- every team must end with exactly `12 players`
- a team can fill only one player per slot unless explicitly configured otherwise
- only players eligible for the active slot can be nominated
- sold players cannot reappear unless admin explicitly overrides the result
- purse cannot go below zero
- a team cannot bid if it can no longer complete remaining slots under purse rules

## Best next implementation path

1. Finalize teams, players, slots, and purse rules
2. Convert the prototype state into JSON seed files
3. Build a real full-stack app with:
   - frontend: React / Next.js
   - backend: Node API
   - database: PostgreSQL
   - live updates: WebSockets
4. Add Playwright coverage for auction-admin and audience flows
