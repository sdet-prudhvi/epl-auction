import { branding, createInitialState, ownerAssignments, players, slotTemplate, teams } from "../src/data/seed.js";

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createActivity(kind, message, index) {
  return {
    id: `activity-${index + 1}`,
    kind,
    message,
    createdAt: new Date().toISOString(),
  };
}

function applyOwnerLocks(seedTeams, seedPlayers) {
  for (const assignment of ownerAssignments) {
    const player = seedPlayers.find((entry) => entry.name === assignment.playerName);
    const team = seedTeams.find((entry) => entry.id === assignment.teamId);

    if (!player || !team) {
      throw new Error(`Owner lock could not be applied for ${assignment.playerName}.`);
    }

    player.status = "Locked";
    player.soldToTeamId = team.id;
    player.soldAmount = null;
    player.assignedSlotNumber = assignment.slotNumber;
    player.dedicatedSlotNumber = assignment.slotNumber;
    player.eligibleSlotNumbers = [assignment.slotNumber];
    player.eligibilityLabel = `Position ${assignment.slotNumber}`;
    player.isLocked = true;
    player.lockedToTeamId = team.id;
    player.lockReason = "Owner pre-assigned";

    team.filledSlots += 1;
  }
}

function createSeedState() {
  const initial = createInitialState();
  const now = new Date().toISOString();
  const seedTeams = deepClone(teams);
  const seedPlayers = deepClone(players);

  applyOwnerLocks(seedTeams, seedPlayers);

  return {
    league: {
      id: "epl-season-1",
      name: initial.leagueName,
      seasonName: initial.seasonName,
      logoPath: branding.leagueLogoPath,
    },
    settings: {
      basePrice: players[0]?.basePrice ?? 3000,
      pursePerTeam: teams[0]?.purseTotal ?? 96000,
      allowUnsold: false,
      sponsors: deepClone(branding.sponsors),
      roles: ["admin", "scorer", "observer"],
      visibility: {
        purse: true,
        soldHistory: true,
      },
    },
    meta: {
      teamCount: initial.teamCount,
      targetPlayerCount: initial.targetPlayerCount,
      lockedPlayerCount: initial.lockedPlayerCount,
      liveAuctionPlayerCount: initial.liveAuctionPlayerCount,
      importedPlayerCount: initial.importedPlayerCount,
      totalPlayers: initial.totalPlayers,
      squadSize: initial.squadSize,
    },
    slots: deepClone(
      slotTemplate.map((slot) => ({
        ...slot,
        maxSelectionsPerTeam: 1,
      }))
    ),
    teams: seedTeams,
    players: seedPlayers,
    bids: [],
    purchases: [],
    undoStack: [],
    activityLog: initial.activityLog.map((message, index) => createActivity("info", message, index)),
    auctionState: {
      currentSlotNumber: initial.currentSlotNumber,
      nominatedPlayerId: null,
      currentBid: 0,
      leadingTeamId: null,
      isLive: false,
      version: 1,
      lastUpdatedAt: now,
      lastEvent: {
        key: `seed-${Date.now()}`,
        type: "seed",
        createdAt: now,
      },
    },
  };
}

export { createSeedState };
