import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createSeedState } from "./seed-state.js";
import { loadFromDb, saveToDb } from "./db.js";

const dataDir = path.join(process.cwd(), "data");
const stateFile = path.join(dataDir, "auction-state.json");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function createEvent(type, extra = {}) {
  return {
    key: `${type}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    type,
    createdAt: nowIso(),
    ...extra,
  };
}

function createActivity(state, kind, message) {
  return {
    id: `activity-${state.activityLog.length + 1}-${Date.now()}`,
    kind,
    message,
    createdAt: nowIso(),
  };
}

function prependActivity(state, kind, message) {
  state.activityLog = [createActivity(state, kind, message), ...state.activityLog].slice(0, 25);
}

function getCurrentSlot(state) {
  return state.slots.find((slot) => slot.slotNumber === state.auctionState.currentSlotNumber);
}

function getPendingPlayersForSlot(state, slotNumber) {
  return state.players.filter(
    (player) => player.status === "Pending" && player.eligibleSlotNumbers.includes(slotNumber)
  );
}

function getPlayer(state, playerId) {
  return state.players.find((player) => player.id === playerId);
}

function getTeam(state, teamId) {
  return state.teams.find((team) => team.id === teamId);
}

function teamHasFilledSlot(state, teamId, slotNumber) {
  return state.players.some(
    (player) =>
      player.soldToTeamId === teamId &&
      player.assignedSlotNumber === slotNumber &&
      (player.status === "Sold" || player.status === "Locked")
  );
}

function getSoldCountForSlot(state, slotNumber) {
  return state.players.filter(
    (player) =>
      (player.status === "Sold" || player.status === "Locked") &&
      player.assignedSlotNumber === slotNumber
  ).length;
}

function isSlotComplete(state, slotNumber) {
  return getSoldCountForSlot(state, slotNumber) === state.teams.length;
}

function resetBidState(state) {
  state.auctionState.currentBid = 0;
  state.auctionState.leadingTeamId = null;
}

function setNomination(state, player) {
  state.auctionState.nominatedPlayerId = player.id;
  state.auctionState.currentBid = player.basePrice;
  state.auctionState.leadingTeamId = null;
}

function clearNomination(state) {
  state.auctionState.nominatedPlayerId = null;
  resetBidState(state);
}

function nominateRandomPlayer(state, slotNumber, options = {}) {
  const slot = state.slots.find((entry) => entry.slotNumber === slotNumber);
  const currentPlayer = getPlayer(state, state.auctionState.nominatedPlayerId);

  if (!slot || isSlotComplete(state, slotNumber)) {
    clearNomination(state);
    return null;
  }

  if (
    currentPlayer &&
    currentPlayer.status === "Pending" &&
    currentPlayer.eligibleSlotNumbers.includes(slotNumber)
  ) {
    return currentPlayer;
  }

  const candidates = getPendingPlayersForSlot(state, slotNumber);
  if (candidates.length === 0) {
    clearNomination(state);
    return null;
  }

  const player = candidates.reduce((next, p) =>
    p.nominationOrder < next.nominationOrder ? p : next
  );
  setNomination(state, player);

  if (options.logActivity) {
    prependActivity(state, "info", `Random reveal: ${player.name} opened for ${slot.label}.`);
  }

  return player;
}

function updateMutationMeta(state, eventType, extra = {}) {
  state.auctionState.version += 1;
  state.auctionState.lastUpdatedAt = nowIso();
  state.auctionState.lastEvent = createEvent(eventType, extra);
}

function purchaseView(purchase, state) {
  const player = getPlayer(state, purchase.playerId);
  const team = getTeam(state, purchase.teamId);
  return {
    ...purchase,
    playerName: player?.name ?? "-",
    teamName: team?.name ?? "-",
  };
}

function validateCurrentNomination(state) {
  const player = getPlayer(state, state.auctionState.nominatedPlayerId);
  if (!player) {
    throw new Error("Nominate a player first.");
  }

  return player;
}

async function ensureStateFile() {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(stateFile, "utf8");
  } catch {
    const seed = createSeedState();
    await writeFile(stateFile, `${JSON.stringify(seed, null, 2)}\n`, "utf8");
  }
}

async function loadState() {
  if (process.env.DATABASE_URL) {
    const data = await loadFromDb();
    if (data) return data;
    const seed = createSeedState();
    await saveToDb(seed);
    return seed;
  }
  await ensureStateFile();
  const file = await readFile(stateFile, "utf8");
  return JSON.parse(file);
}

async function saveState(state) {
  if (process.env.DATABASE_URL) {
    await saveToDb(state);
    return;
  }
  await ensureStateFile();
  await writeFile(stateFile, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

async function getState() {
  const state = await loadState();
  const currentSlot = getCurrentSlot(state);

  if (currentSlot && !isSlotComplete(state, currentSlot.slotNumber) && !state.auctionState.nominatedPlayerId) {
    nominateRandomPlayer(state, currentSlot.slotNumber);
    await saveState(state);
  }

  return state;
}

async function mutateState(mutator) {
  const state = await loadState();
  const result = await mutator(state);
  await saveState(state);
  return {
    state,
    result,
  };
}

async function applyAction(action, payload = {}) {
  return mutateState((state) => {
    switch (action) {
      case "toggle-live": {
        state.auctionState.isLive =
          typeof payload.isLive === "boolean" ? payload.isLive : !state.auctionState.isLive;
        prependActivity(
          state,
          "info",
          state.auctionState.isLive ? "Auction marked live." : "Auction paused."
        );
        updateMutationMeta(state, "toggle-live", { isLive: state.auctionState.isLive });
        return {
          message: state.auctionState.isLive ? "Auction is now live." : "Auction paused.",
        };
      }

      case "set-slot": {
        const slotNumber = Number(payload.slotNumber);
        if (!Number.isInteger(slotNumber) || slotNumber < 1 || slotNumber > state.slots.length) {
          throw new Error("Invalid slot number.");
        }

        state.auctionState.currentSlotNumber = slotNumber;
        const revealedPlayer = nominateRandomPlayer(state, slotNumber, { logActivity: true });
        prependActivity(state, "info", `Moved auction desk to Position ${slotNumber}.`);
        updateMutationMeta(state, "set-slot", { slotNumber });
        return {
          message: revealedPlayer
            ? `Moved to Position ${slotNumber}. ${revealedPlayer.name} is now on the desk.`
            : `Moved to Position ${slotNumber}.`,
        };
      }

      case "clear-nomination": {
        throw new Error("Players now auto-populate randomly for the active slot and cannot be cleared.");
      }

      case "nominate": {
        const slot = getCurrentSlot(state);

        if (isSlotComplete(state, slot.slotNumber)) {
          throw new Error(`${slot.label} is already complete.`);
        }
        if (payload.playerId) {
          throw new Error("Players are auto-populated randomly. Choose a slot to reveal the next player.");
        }

        const player = nominateRandomPlayer(state, slot.slotNumber, { logActivity: true });
        if (!player) {
          throw new Error(`No pending players are left for ${slot.label}.`);
        }

        updateMutationMeta(state, "nominate", { playerId: player.id, slotNumber: slot.slotNumber });
        return {
          message: `${player.name} is now on the desk for ${slot.label}.`,
        };
      }

      case "bid": {
        const team = getTeam(state, payload.teamId);
        const increment = Number(payload.increment);
        const player = validateCurrentNomination(state);

        if (!state.auctionState.isLive) {
          throw new Error("Start the auction before recording bids.");
        }

        if (!team) {
          throw new Error("Team not found.");
        }

        if (!Number.isInteger(increment) || increment <= 0) {
          throw new Error("Increment must be a positive number.");
        }

        if (teamHasFilledSlot(state, team.id, state.auctionState.currentSlotNumber)) {
          throw new Error(`${team.name} already has a locked or sold player in this slot.`);
        }

        const currentBid = state.auctionState.currentBid || player.basePrice;
        const allowedIncrement = currentBid < 10000 ? 1000 : 2000;
        if (increment !== allowedIncrement) {
          throw new Error(
            `Increment must be ${allowedIncrement.toLocaleString()} at this bid level (current: ${currentBid.toLocaleString()}).`
          );
        }

        const nextBid = currentBid + increment;
        if (team.purseRemaining < nextBid) {
          throw new Error(`${team.name} does not have enough purse for ${nextBid}.`);
        }

        const slotsPerTeam = state.slots.length;
        const remainingAfterThis = Math.max(0, slotsPerTeam - team.filledSlots - 1);
        const reservedFloor = remainingAfterThis * state.settings.basePrice;
        const maxAllowedBid = team.purseRemaining - reservedFloor;
        if (nextBid > maxAllowedBid) {
          throw new Error(
            `${team.name} cannot bid ${nextBid.toLocaleString()}. Max allowed is ${maxAllowedBid.toLocaleString()} — ${reservedFloor.toLocaleString()} reserved for ${remainingAfterThis} remaining slot${remainingAfterThis !== 1 ? "s" : ""} at base price.`
          );
        }

        const bid = {
          id: `bid-${state.bids.length + 1}`,
          teamId: team.id,
          playerId: player.id,
          slotNumber: state.auctionState.currentSlotNumber,
          amount: nextBid,
          createdAt: nowIso(),
        };

        state.bids.push(bid);
        state.auctionState.currentBid = nextBid;
        state.auctionState.leadingTeamId = team.id;
        prependActivity(state, "info", `${team.name} recorded a bid of ${nextBid} for ${player.name}.`);
        updateMutationMeta(state, "bid", { bidId: bid.id });
        return {
          message: `${team.name} bid ${nextBid}.`,
        };
      }

      case "sell": {
        const player = validateCurrentNomination(state);
        const team = getTeam(state, state.auctionState.leadingTeamId);
        const slot = getCurrentSlot(state);

        if (!state.auctionState.isLive) {
          throw new Error("The auction must be live before marking sold.");
        }

        if (!team || !state.auctionState.currentBid) {
          throw new Error("Record a leading bid before marking a player sold.");
        }

        if (teamHasFilledSlot(state, team.id, slot.slotNumber)) {
          throw new Error(`${team.name} already has a locked or sold player in ${slot.label}.`);
        }

        const purchase = {
          id: `purchase-${state.purchases.length + 1}`,
          playerId: player.id,
          teamId: team.id,
          slotNumber: slot.slotNumber,
          amount: state.auctionState.currentBid,
          status: "SOLD",
          createdAt: nowIso(),
          reopenedAt: null,
        };

        state.undoStack.push({
          purchaseId: purchase.id,
          playerId: player.id,
          teamId: team.id,
          amount: state.auctionState.currentBid,
          slotNumber: slot.slotNumber,
          previousTeamPurse: team.purseRemaining,
          previousFilledSlots: team.filledSlots,
          previousAuctionState: {
            currentSlotNumber: state.auctionState.currentSlotNumber,
            nominatedPlayerId: state.auctionState.nominatedPlayerId,
            currentBid: state.auctionState.currentBid,
            leadingTeamId: state.auctionState.leadingTeamId,
          },
        });

        state.purchases.push(purchase);
        player.status = "Sold";
        player.soldToTeamId = team.id;
        player.soldAmount = state.auctionState.currentBid;
        player.assignedSlotNumber = slot.slotNumber;
        team.purseRemaining -= state.auctionState.currentBid;
        team.filledSlots += 1;

        prependActivity(
          state,
          "success",
          `${player.name} sold to ${team.name} for ${state.auctionState.currentBid} in ${slot.label}.`
        );

        let nextPlayer = null;
        if (isSlotComplete(state, slot.slotNumber)) {
          clearNomination(state);
          prependActivity(state, "info", `${slot.label} is complete. Select the next slot to continue.`);
        } else {
          nextPlayer = nominateRandomPlayer(state, slot.slotNumber, { logActivity: true });
        }

        updateMutationMeta(state, "sale", {
          purchaseId: purchase.id,
          nextPlayerId: nextPlayer?.id ?? null,
          slotComplete: isSlotComplete(state, slot.slotNumber),
        });
        return {
          message: nextPlayer
            ? `${player.name} sold to ${team.name}. Next player is ${nextPlayer.name}.`
            : `${player.name} sold to ${team.name}. ${slot.label} is complete.`,
          purchase: purchaseView(purchase, state),
        };
      }

      case "reopen-last-sold": {
        const snapshot = state.undoStack.pop();
        if (!snapshot) {
          throw new Error("There is no completed sale to reopen.");
        }

        const player = getPlayer(state, snapshot.playerId);
        const team = getTeam(state, snapshot.teamId);
        const purchase = state.purchases.find((entry) => entry.id === snapshot.purchaseId);

        if (!player || !team || !purchase) {
          throw new Error("Could not reopen the last sale.");
        }

        player.status = "Pending";
        player.soldToTeamId = null;
        player.soldAmount = null;
        player.assignedSlotNumber = null;
        team.purseRemaining = snapshot.previousTeamPurse;
        team.filledSlots = snapshot.previousFilledSlots;
        purchase.status = "REOPENED";
        purchase.reopenedAt = nowIso();

        state.auctionState.currentSlotNumber = snapshot.previousAuctionState.currentSlotNumber;
        state.auctionState.nominatedPlayerId = snapshot.previousAuctionState.nominatedPlayerId;
        state.auctionState.currentBid = snapshot.previousAuctionState.currentBid;
        state.auctionState.leadingTeamId = snapshot.previousAuctionState.leadingTeamId;

        prependActivity(
          state,
          "info",
          `Reopened ${player.name} from ${team.name} at ${snapshot.amount}.`
        );
        updateMutationMeta(state, "reopen", { purchaseId: purchase.id, playerId: player.id });
        return {
          message: `${player.name} reopened for correction.`,
        };
      }

      case "next-slot": {
        const currentSlot = state.auctionState.currentSlotNumber;
        if (!isSlotComplete(state, currentSlot)) {
          throw new Error("Finish all 4 purchases in the current slot before moving ahead.");
        }

        if (currentSlot >= state.slots.length) {
          throw new Error("This is already the final slot.");
        }

        state.auctionState.currentSlotNumber += 1;
        const revealedPlayer = nominateRandomPlayer(state, state.auctionState.currentSlotNumber, {
          logActivity: true,
        });
        prependActivity(state, "info", `Moved auction desk to Position ${state.auctionState.currentSlotNumber}.`);
        updateMutationMeta(state, "next-slot", { slotNumber: state.auctionState.currentSlotNumber });
        return {
          message: revealedPlayer
            ? `Moved to Position ${state.auctionState.currentSlotNumber}. ${revealedPlayer.name} is now on the desk.`
            : `Moved to Position ${state.auctionState.currentSlotNumber}.`,
        };
      }

      case "unsold": {
        if (!state.settings.allowUnsold) {
          throw new Error("Unsold flow is disabled for EPL. Every player must be sold in the active slot.");
        }

        throw new Error("Unsold flow is not implemented for this league yet.");
      }

      default:
        throw new Error("Unknown action.");
    }
  });
}

async function resetAuction() {
  const fresh = createSeedState();
  await saveState(fresh);
  return { state: fresh, result: { message: "Auction reset to fresh state." } };
}

export { applyAction, getState, resetAuction };
