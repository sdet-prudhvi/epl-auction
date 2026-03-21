const uiState = {
  currentView: localStorage.getItem("auction_token") ? "admin" : "public",
  notice: null,
  connected: false,
  slotFilter: "",
  lastEventKey: null,
  lastBidEventKey: null,
  bidFlashTeamId: null,
  token: localStorage.getItem("auction_token") || null,
  youtubeUrl: localStorage.getItem("epl_yt_url") || "",
  route: null,
};

const SEASON_NUMBER = 1;
const SEASON_BASE = `/season/${SEASON_NUMBER}`;
const TEAM_COLORS = {
  "GOWTHAM'S XI": "#e63946",
  "RAHUL'S XI":   "#3a86ff",
  "SUNIL'S XI":   "#06d6a0",
  "ACHARYA'S XI": "#9b5de5",
};
const SEASON_FIXTURES = [
  {
    dayLabel: "Saturday Apr 11",
    matches: [
      {
        label: "AM Match",
        home: "GOWTHAM'S XI",
        away: "SUNIL'S XI",
        status: "Scheduled",
      },
      {
        label: "PM Match",
        home: "ACHARYA'S XI",
        away: "RAHUL'S XI",
        status: "Scheduled",
      },
    ],
  },
  {
    dayLabel: "Sunday Apr 19",
    matches: [
      {
        label: "AM Match",
        home: "GOWTHAM'S XI",
        away: "ACHARYA'S XI",
        status: "Scheduled",
      },
      {
        label: "PM Match",
        home: "SUNIL'S XI",
        away: "RAHUL'S XI",
        status: "Scheduled",
      },
    ],
  },
  {
    dayLabel: "Saturday Apr 25",
    matches: [
      {
        label: "AM Match",
        home: "GOWTHAM'S XI",
        away: "RAHUL'S XI",
        status: "Scheduled",
      },
      {
        label: "PM Match",
        home: "SUNIL'S XI",
        away: "ACHARYA'S XI",
        status: "Scheduled",
      },
    ],
  },
  {
    dayLabel: "Sunday Apr 26",
    matches: [
      {
        label: "Final AM Match",
        home: "TBD",
        away: "TBD",
        status: "TBD",
      },
      {
        label: "Friendly PM Match",
        home: "TBD",
        away: "TBD",
        status: "May be played",
      },
    ],
  },
];

let snapshot = null;
let noticeTimeoutId = null;
let celebrationTimeoutId = null;
let bidFlashTimeoutId = null;
let soldMomentTimeoutId = null;
let eventSource = null;
let adminLastNominatedId = null;
let liveModeLastNominatedId = null;

const auctionProgress = document.querySelector("#auction-progress");
const seasonPage = document.querySelector("#season-page");
const auctionShell = document.querySelector("#auction-shell");
const summaryCards = document.querySelector("#summary-cards");
const slotTimeline = document.querySelector("#slot-timeline");
const activeSlotCard = document.querySelector("#active-slot-card");
const teamsGrid = document.querySelector("#teams-grid");
const publicTeamsGrid = document.querySelector("#public-teams-grid");
const playerGrid = document.querySelector("#player-grid");
const slotFilter = document.querySelector("#slot-filter");
const auctionBadge = document.querySelector("#auction-badge");
const activityLog = document.querySelector("#activity-log");
const soldHistory = document.querySelector("#sold-history");
const publicSoldHistory = document.querySelector("#public-sold-history");
const adminSquadBoard = document.querySelector("#admin-squad-board");
const publicSquadBoard = document.querySelector("#public-squad-board");
const adminRosterBody = document.querySelector("#admin-roster-body");
const publicRosterBody = document.querySelector("#public-roster-body");
const publicLiveCard = document.querySelector("#public-live-card");
const liveOverlay = document.querySelector("#live-overlay");
const youtubeInput = document.querySelector("#youtube-url");
const soldMoment = document.querySelector("#sold-moment");
const flashBanner = document.querySelector("#flash-banner");
const celebrationLayer = document.querySelector("#celebration-layer");
const tickerTrack = document.querySelector("#ticker-track");
const sponsorTrack = document.querySelector("#sponsor-track");
const leagueLogo = document.querySelector("#league-logo");
const adminView = document.querySelector("#admin-view");
const publicView = document.querySelector("#public-view");
const adminActions = document.querySelector("#admin-actions");
const viewButtons = document.querySelectorAll("[data-view]");
const routeLinks = document.querySelectorAll(".league-nav [data-route-link]");

const toggleLiveButton = document.querySelector("#toggle-live");
const prevSlotButton = document.querySelector("#prev-slot");
const nextSlotButton = document.querySelector("#next-slot");
const sellPlayerButton = document.querySelector("#sell-player");
const undoSaleButton = document.querySelector("#undo-sale");
const bidStepButtons = document.querySelectorAll(".bid-step");

function formatPoints(value) {
  return Number(value || 0).toLocaleString();
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getTeamSlug(team) {
  return slugify(team.name.replace(/xi'?s?/gi, ""));
}

function getTeamBySlug(teamSlug) {
  return snapshot?.teams.find((team) => getTeamSlug(team) === teamSlug) ?? null;
}

function buildSeasonPath(segment = "", detail = "") {
  const parts = [SEASON_BASE];
  if (segment) {
    parts.push(segment);
  }
  if (detail) {
    parts.push(detail);
  }
  return parts.join("/").replace(/\/+/g, "/");
}

function parseRoute(pathname = window.location.pathname) {
  const cleanPath = pathname.replace(/\/+$/, "") || "/";

  if (cleanPath === "/" || cleanPath === "/index.html") {
    return { name: "home", path: buildSeasonPath() };
  }

  if (cleanPath === SEASON_BASE) {
    return { name: "home", path: cleanPath };
  }

  if (cleanPath === buildSeasonPath("teams")) {
    return { name: "teams", path: cleanPath };
  }

  if (cleanPath === buildSeasonPath("squads")) {
    return { name: "squads", path: cleanPath };
  }

  if (cleanPath.startsWith(`${buildSeasonPath("squads")}/`)) {
    return {
      name: "squad-detail",
      teamSlug: cleanPath.replace(`${buildSeasonPath("squads")}/`, ""),
      path: cleanPath,
    };
  }

  if (cleanPath === buildSeasonPath("points-table")) {
    return { name: "points-table", path: cleanPath };
  }

  if (cleanPath === buildSeasonPath("auction")) {
    return { name: "auction", path: cleanPath };
  }

  return { name: "not-found", path: buildSeasonPath("404") };
}

const ROUTE_TITLES = {
  home: "Equality Premier League | Season 1",
  teams: "Teams | EPL Season 1",
  squads: "Squads | EPL Season 1",
  "squad-detail": "Squad | EPL Season 1",
  "points-table": "Points Table | EPL Season 1",
  auction: "Auction | EPL Season 1",
  "not-found": "Page Not Found | EPL Season 1",
};

function setRouteTitle(routeName) {
  document.title = ROUTE_TITLES[routeName] ?? "Equality Premier League";
}

function navigateTo(path, options = {}) {
  const nextRoute = parseRoute(path);
  const method = options.replace ? "replaceState" : "pushState";
  window.history[method]({}, "", nextRoute.path);
  uiState.route = nextRoute;
  setRouteTitle(nextRoute.name);
  render();
}

function getActiveSlot() {
  return snapshot?.slots.find((slot) => slot.slotNumber === snapshot.auctionState.currentSlotNumber) ?? null;
}

function getSelectedPlayer() {
  return snapshot?.players.find((player) => player.id === snapshot.auctionState.nominatedPlayerId) ?? null;
}

function getLeadingTeam() {
  return snapshot?.teams.find((team) => team.id === snapshot.auctionState.leadingTeamId) ?? null;
}

function getPlayersForSlot(slotNumber) {
  return snapshot.players.filter((player) => player.eligibleSlotNumbers.includes(slotNumber));
}

function getPendingPlayersForSlot(slotNumber) {
  return getPlayersForSlot(slotNumber).filter((player) => player.status === "Pending");
}

function teamHasFilledSlot(teamId, slotNumber) {
  return snapshot.players.some(
    (player) =>
      player.soldToTeamId === teamId &&
      player.assignedSlotNumber === slotNumber &&
      (player.status === "Sold" || player.status === "Locked")
  );
}

function getSoldCountForSlot(slotNumber) {
  return snapshot.players.filter(
    (player) =>
      (player.status === "Sold" || player.status === "Locked") &&
      player.assignedSlotNumber === slotNumber
  ).length;
}

function getVisiblePlayers() {
  if (uiState.slotFilter === "all") {
    return snapshot.players;
  }

  const slotNumber = Number(uiState.slotFilter || snapshot.auctionState.currentSlotNumber);
  return getPlayersForSlot(slotNumber);
}

function getCompletedSales() {
  return snapshot.purchases
    .filter((purchase) => purchase.status === "SOLD")
    .slice()
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

function getTeamSlotPlayer(teamId, slotNumber) {
  return snapshot.players.find(
    (player) => player.soldToTeamId === teamId && player.assignedSlotNumber === slotNumber
  );
}

function getTeamBidBudget(team, slotNumber) {
  const slotsPerTeam = snapshot.slots.length;
  const remainingAfterThis = Math.max(0, slotsPerTeam - team.filledSlots - 1);
  const reservedFloor = remainingAfterThis * snapshot.settings.basePrice;
  const maxBid = team.purseRemaining - reservedFloor;

  return {
    remainingAfterThis,
    reservedFloor,
    maxBid,
    slotFilled: teamHasFilledSlot(team.id, slotNumber),
  };
}

function getActiveBidContext(slotNumber) {
  const leadingTeam = getLeadingTeam();

  if (leadingTeam && !teamHasFilledSlot(leadingTeam.id, slotNumber)) {
    return {
      team: leadingTeam,
      ...getTeamBidBudget(leadingTeam, slotNumber),
      label: `${leadingTeam.name} ceiling`,
    };
  }

  const contenders = snapshot.teams
    .map((team) => ({
      team,
      ...getTeamBidBudget(team, slotNumber),
    }))
    .filter((entry) => !entry.slotFilled)
    .sort((left, right) => right.maxBid - left.maxBid);

  if (!contenders.length) {
    return null;
  }

  return {
    ...contenders[0],
    label: `${contenders[0].team.name} top ceiling`,
  };
}

function getSortedRoster() {
  return snapshot.players.slice().sort((left, right) => {
    const leftFilled = left.status === "Sold" || left.status === "Locked";
    const rightFilled = right.status === "Sold" || right.status === "Locked";

    if (leftFilled && !rightFilled) {
      return -1;
    }

    if (!leftFilled && rightFilled) {
      return 1;
    }

    if ((left.assignedSlotNumber ?? 99) !== (right.assignedSlotNumber ?? 99)) {
      return (left.assignedSlotNumber ?? 99) - (right.assignedSlotNumber ?? 99);
    }

    return left.name.localeCompare(right.name);
  });
}

function isSlotComplete(slotNumber) {
  return getSoldCountForSlot(slotNumber) === snapshot.teams.length;
}

function showNotice(type, message) {
  uiState.notice = { type, message };
  renderFlashBanner();

  if (noticeTimeoutId) {
    clearTimeout(noticeTimeoutId);
  }

  noticeTimeoutId = window.setTimeout(() => {
    uiState.notice = null;
    renderFlashBanner();
  }, 2800);
}

function renderFlashBanner() {
  if (!uiState.notice) {
    flashBanner.className = "flash-banner flash-banner--hidden";
    flashBanner.textContent = "";
    return;
  }

  flashBanner.className = `flash-banner flash-banner--${uiState.notice.type}`;
  flashBanner.textContent = uiState.notice.message;
}

function triggerCelebration(playerName, teamName) {
  if (celebrationTimeoutId) {
    clearTimeout(celebrationTimeoutId);
  }

  const confetti = Array.from({ length: 18 }, (_, index) => {
    const offset = Math.floor(Math.random() * 100);
    const delay = (index % 6) * 40;
    const rotate = Math.floor(Math.random() * 160) - 80;
    return `<span class="confetti-piece" style="--offset:${offset}%; --delay:${delay}ms; --rotate:${rotate}deg;"></span>`;
  }).join("");

  celebrationLayer.innerHTML = `
    <div class="celebration-burst">
      ${confetti}
      <div class="celebration-banner">
        <strong>${playerName}</strong>
        <span>Sold to ${teamName}</span>
      </div>
    </div>
  `;

  celebrationTimeoutId = window.setTimeout(() => {
    celebrationLayer.innerHTML = "";
  }, 1800);
}

function triggerSoldMoment(player, team, amount) {
  if (!soldMoment) {
    triggerCelebration(player.name, team.name);
    return;
  }

  if (soldMomentTimeoutId) {
    clearTimeout(soldMomentTimeoutId);
  }

  const teamIndex = snapshot?.teams.findIndex((t) => t.id === team.id) ?? -1;
  const tcClass = teamIndex >= 0 ? `sold-moment--tc-${teamIndex + 1}` : "";

  soldMoment.className = `sold-moment sold-moment--active ${tcClass}`;
  soldMoment.innerHTML = `
    <div class="sold-moment__backdrop" aria-hidden="true"></div>
    <div class="sold-moment__content">
      <div class="sold-moment__photo-wrap">
        <img
          class="sold-moment__photo"
          src="${player.photoPath || "/assets/players/default.svg"}"
          alt="${player.name}"
        />
        <div class="sold-moment__stamp">SOLD</div>
      </div>
      <div class="sold-moment__player-name">${player.name}</div>
      <div class="sold-moment__amount">${formatPoints(amount)}</div>
      <div class="sold-moment__team">
        <img class="sold-moment__team-logo" src="${team.logoPath}" alt="${team.name}" />
        <span class="sold-moment__team-name">${team.name}</span>
      </div>
    </div>
  `;

  soldMomentTimeoutId = window.setTimeout(() => {
    soldMoment.classList.add("sold-moment--out");
    window.setTimeout(() => {
      soldMoment.className = "sold-moment";
      soldMoment.innerHTML = "";
      triggerCelebration(player.name, team.name);
    }, 280);
  }, 1200);
}

function triggerUnsoldStamp() {
  if (!activeSlotCard) return;
  const existing = activeSlotCard.querySelector(".unsold-stamp");
  if (existing) existing.remove();
  const stamp = document.createElement("div");
  stamp.className = "unsold-stamp";
  stamp.textContent = "UNSOLD";
  activeSlotCard.appendChild(stamp);
  setTimeout(() => stamp.remove(), 960);
}

function maybeCelebrate(nextSnapshot) {
  const nextEvent = nextSnapshot?.auctionState?.lastEvent;
  if (!nextEvent || nextEvent.key === uiState.lastEventKey) {
    return;
  }

  uiState.lastEventKey = nextEvent.key;

  if (nextEvent.type === "unsold") {
    triggerUnsoldStamp();
    return;
  }

  if (nextEvent.type !== "sale" || !nextEvent.purchaseId) {
    return;
  }

  const purchase = nextSnapshot.purchases.find((entry) => entry.id === nextEvent.purchaseId);
  if (!purchase || purchase.status !== "SOLD") {
    return;
  }

  const player = nextSnapshot.players.find((entry) => entry.id === purchase.playerId);
  const team = nextSnapshot.teams.find((entry) => entry.id === purchase.teamId);

  if (player && team) {
    triggerSoldMoment(player, team, purchase.amount);
  }
}

function maybeRegisterBidFlash(nextSnapshot) {
  const nextEvent = nextSnapshot?.auctionState?.lastEvent;
  if (!nextEvent || nextEvent.type !== "bid" || nextEvent.key === uiState.lastBidEventKey || !nextEvent.bidId) {
    return;
  }

  const bid = nextSnapshot.bids.find((entry) => entry.id === nextEvent.bidId);
  if (!bid) {
    return;
  }

  uiState.lastBidEventKey = nextEvent.key;
  uiState.bidFlashTeamId = bid.teamId;

  if (bidFlashTimeoutId) {
    clearTimeout(bidFlashTimeoutId);
  }

  bidFlashTimeoutId = window.setTimeout(() => {
    uiState.bidFlashTeamId = null;
  }, 820);
}

function setSnapshot(nextSnapshot) {
  maybeCelebrate(nextSnapshot);
  maybeRegisterBidFlash(nextSnapshot);
  snapshot = nextSnapshot;

  if (!uiState.slotFilter) {
    uiState.slotFilter = String(snapshot.auctionState.currentSlotNumber);
  }

  if (uiState.slotFilter !== "all" && !snapshot.slots.some((slot) => String(slot.slotNumber) === uiState.slotFilter)) {
    uiState.slotFilter = String(snapshot.auctionState.currentSlotNumber);
  }

  render();
}

async function readJson(response) {
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

async function performAction(action, payload = {}) {
  try {
    const response = await fetch(`/api/actions/${action}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(uiState.token ? { Authorization: `Bearer ${uiState.token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await readJson(response);

    if (response.status === 401) {
      uiState.token = null;
      localStorage.removeItem("auction_token");
      showLoginOverlay();
      showNotice("warning", "Session expired. Please log in again.");
      return false;
    }

    if (!response.ok) {
      showNotice("warning", data.message || "Action failed.");
      return false;
    }

    setSnapshot(data.state);
    showNotice("success", data.message || "Action completed.");
    return true;
  } catch {
    showNotice("warning", "The auction server could not be reached.");
    return false;
  }
}

async function loadState() {
  try {
    const response = await fetch("/api/state", { cache: "no-store" });
    const data = await readJson(response);

    if (!response.ok || !data.state) {
      throw new Error();
    }

    setSnapshot(data.state);
    uiState.connected = true;
    render();
  } catch {
    showNotice("warning", "Could not load the persisted auction state.");
  }
}

function connectEvents() {
  if (eventSource) {
    eventSource.close();
  }

  eventSource = new EventSource("/api/events");

  eventSource.addEventListener("connected", () => {
    uiState.connected = true;
    render();
  });

  eventSource.addEventListener("state", (event) => {
    const payload = JSON.parse(event.data);
    if (payload.state) {
      uiState.connected = true;
      setSnapshot(payload.state);
    }
  });

  eventSource.onerror = () => {
    uiState.connected = false;
    render();
  };
}

function renderViewState() {
  const isAdmin = uiState.currentView === "admin";
  adminView.classList.toggle("view-panel--active", isAdmin);
  publicView.classList.toggle("view-panel--active", !isAdmin);
  adminActions.classList.toggle("control-strip__actions--hidden", !isAdmin);

  viewButtons.forEach((button) => {
    button.classList.toggle("view-switch__button--active", button.dataset.view === uiState.currentView);
  });
}

function renderAuctionProgress() {
  if (!auctionProgress) return;

  if (!snapshot) {
    auctionProgress.innerHTML = "";
    return;
  }

  const currentSlotNumber = snapshot.auctionState.currentSlotNumber;
  const totalSlots = snapshot.slots.length;
  const teamsCount = snapshot.teams.length;
  const soldInCurrentSlot = getSoldCountForSlot(currentSlotNumber);
  const auctionSoldCount = getCompletedSales().length;
  const auctionRemaining = snapshot.meta.liveAuctionPlayerCount - auctionSoldCount;

  const segmentsHTML = snapshot.slots
    .map((slot) => {
      const sold = getSoldCountForSlot(slot.slotNumber);
      const isActive = slot.slotNumber === currentSlotNumber;
      const isComplete = sold >= teamsCount;
      const fillPct = Math.round((sold / teamsCount) * 100);
      let cls = "auction-progress__segment";
      if (isComplete) cls += " auction-progress__segment--complete";
      else if (isActive) cls += " auction-progress__segment--active";
      return `<div class="${cls}" title="${slot.label} · ${slot.role} · ${sold}/${teamsCount} filled">
        <div class="auction-progress__fill" style="width:${fillPct}%;"></div>
      </div>`;
    })
    .join("");

  auctionProgress.innerHTML = `
    <div class="auction-progress__inner">
      <div class="auction-progress__bar" aria-hidden="true">${segmentsHTML}</div>
      <div class="auction-progress__stats">
        <span>Slot <strong>${currentSlotNumber}</strong>/${totalSlots}</span>
        <span><strong>${soldInCurrentSlot}</strong>/${teamsCount} sold this slot</span>
        <span><strong>${auctionSoldCount}</strong> sold · <strong>${auctionRemaining}</strong> to go</span>
      </div>
    </div>
  `;
}

function renderSummaryCards() {
  if (!snapshot) {
    summaryCards.innerHTML = "";
    return;
  }

  const soldCount = snapshot.players.filter((player) => player.status === "Sold").length;
  const lockedCount = snapshot.players.filter((player) => player.status === "Locked").length;
  const cards = [
    { label: "Teams", value: snapshot.meta.teamCount, helper: "Franchises on the floor" },
    {
      label: "Active Slot",
      value: `#${snapshot.auctionState.currentSlotNumber}`,
      helper: getActiveSlot()?.role ?? "Loading",
    },
    { label: "Base Price", value: formatPoints(snapshot.settings.basePrice), helper: "Opening bid" },
    {
      label: "Auctioned",
      value: `${soldCount + lockedCount}/${snapshot.meta.liveAuctionPlayerCount + lockedCount}`,
      helper: `${soldCount} sold · ${lockedCount} owner-locked`,
    },
  ];

  summaryCards.innerHTML = cards
    .map(
      (card) => `
        <article class="summary-card">
          <span>${card.label}</span>
          <strong>${card.value}</strong>
          <small>${card.helper}</small>
        </article>
      `
    )
    .join("");
}

function getTickerItems() {
  if (!snapshot) {
    return [{ html: "Connecting to the EPL auction desk..." }];
  }

  const activeSlot = getActiveSlot();
  const latestSales = getCompletedSales()
    .slice(0, 6)
    .map((sale) => {
      const player = snapshot.players.find((entry) => entry.id === sale.playerId);
      const team = snapshot.teams.find((entry) => entry.id === sale.teamId);
      const teamIndex = team ? snapshot.teams.findIndex((t) => t.id === team.id) + 1 : 0;
      const saleItem = {
        html: `${player?.name ?? "Player"} sold to ${team?.name ?? "team"} for <strong class="ticker-amount">${formatPoints(sale.amount)}</strong>`,
        teamIndex,
      };
      const purseItem = team
        ? {
            html: `<span style="color:rgba(255,255,255,0.42);margin-right:4px">|</span> ${team.name} purse: <strong class="ticker-amount">${formatPoints(team.purseRemaining)}</strong> remaining`,
            teamIndex,
            purse: true,
          }
        : null;
      return [saleItem, purseItem].filter(Boolean);
    })
    .flat();

  const activityItems = snapshot.activityLog.slice(0, 4).map((item) => ({ html: item.message }));
  const baseItems = [
    { html: `${snapshot.league.name} ${snapshot.league.seasonName} is ${snapshot.auctionState.isLive ? "live" : "paused"}` },
    { html: `${activeSlot?.label ?? "Position"} on desk: ${activeSlot?.role ?? "Loading"}` },
    { html: `Base price <strong class="ticker-amount">${formatPoints(snapshot.settings.basePrice)}</strong> · Purse visible to everyone` },
  ];

  return baseItems.concat(latestSales, activityItems).filter(Boolean).slice(0, 10);
}

function renderTicker() {
  if (!tickerTrack) {
    return;
  }

  const items = getTickerItems();
  const repeated = items.concat(items);
  tickerTrack.innerHTML = repeated
    .map(
      (item) => `
        <span class="ticker-item${item.purse ? " ticker-item--purse" : ""}">
          <span class="ticker-item__spark${item.teamIndex ? ` ticker-item__spark--tc-${item.teamIndex}` : ""}"></span>
          ${item.html}
        </span>
      `
    )
    .join("");
}

function renderBranding() {
  if (!snapshot) {
    return;
  }

  if (leagueLogo) {
    leagueLogo.src = snapshot.league.logoPath;
  }

  // Archive banner — show when every slot is filled across all teams
  const archiveBanner = document.querySelector("#archive-banner");
  if (archiveBanner) {
    const totalSlots = snapshot.slots.length * snapshot.teams.length;
    const filled = snapshot.players.filter(
      (p) => p.status === "Sold" || p.status === "Locked"
    ).length;
    archiveBanner.classList.toggle("archive-banner--hidden", filled < totalSlots);
  }

  if (!sponsorTrack) {
    return;
  }

  const sponsors = snapshot.settings.sponsors || [];
  const repeated = sponsors.concat(sponsors);
  sponsorTrack.innerHTML = repeated
    .map(
      (sponsor) => `
        <article class="sponsor-badge">
          <img src="${sponsor.logoPath}" alt="${sponsor.name} logo" loading="lazy" />
          <span>${sponsor.name}</span>
        </article>
      `
    )
    .join("");
}

function renderSlotTimeline() {
  if (!snapshot) {
    slotTimeline.innerHTML = "";
    return;
  }

  slotTimeline.innerHTML = snapshot.slots
    .map((slot) => {
      const isActive = slot.slotNumber === snapshot.auctionState.currentSlotNumber;
      const filledInSlot = getSoldCountForSlot(slot.slotNumber);
      return `
        <button
          class="slot-chip ${isActive ? "slot-chip--active" : ""}"
          type="button"
          data-slot-number="${slot.slotNumber}"
        >
          <span>${slot.label}</span>
          <strong>${slot.role}</strong>
          <em>${filledInSlot}/4 filled</em>
        </button>
      `;
    })
    .join("");

  slotTimeline.querySelectorAll("[data-slot-number]").forEach((button) => {
    button.addEventListener("click", () => {
      performAction("set-slot", { slotNumber: Number(button.dataset.slotNumber) });
    });
  });
}

function renderActiveSlotCard() {
  if (!snapshot) {
    activeSlotCard.innerHTML = "";
    return;
  }

  const activeSlot = getActiveSlot();
  const activePlayers = getPendingPlayersForSlot(snapshot.auctionState.currentSlotNumber);
  const selectedPlayer = getSelectedPlayer();
  const leadingTeam = getLeadingTeam();
  const bidContext = getActiveBidContext(snapshot.auctionState.currentSlotNumber);
  const bidAmount = snapshot.auctionState.currentBid || snapshot.settings.basePrice;
  const ceilingAmount = Math.max(snapshot.settings.basePrice, bidContext?.maxBid ?? snapshot.settings.basePrice);
  const progressWidth = Math.min(100, Math.max(0, (bidAmount / ceilingAmount) * 100));
  const playerChanged = Boolean(selectedPlayer?.id) && selectedPlayer.id !== adminLastNominatedId;

  adminLastNominatedId = selectedPlayer?.id ?? null;

  auctionBadge.textContent = snapshot.auctionState.isLive ? "Live" : "Paused";

  activeSlotCard.innerHTML = `
    <div class="auction-stage__top">
      <div>
        <div class="active-slot__pill">${activeSlot.label} · ${activeSlot.role}</div>
        <h3>${activeSlot.role}</h3>
      </div>
      <div class="active-slot__meta">${activePlayers.length} live players left</div>
    </div>
    <div class="auction-stage__grid">
      ${
        selectedPlayer
          ? `
            <article class="stage-card stage-card--player ${playerChanged ? "stage-card--new-player" : ""}">
              <img
                class="stage-card__photo"
                src="${selectedPlayer.photoPath || "/assets/players/default.svg"}"
                alt="${selectedPlayer.name}"
                loading="lazy"
              />
              <div class="stage-card__body">
                <span class="eyebrow">Randomly Revealed Player</span>
                <h4>${selectedPlayer.name}</h4>
                <p>${selectedPlayer.roleLabel}</p>
                <div class="pill-row">
                  <span class="mini-pill">Base ${formatPoints(selectedPlayer.basePrice)}</span>
                  <span class="mini-pill">${selectedPlayer.eligibilityLabel}</span>
                  <span class="mini-pill">Auto-pop after each sale</span>
                </div>
              </div>
            </article>
          `
          : `
            <article class="stage-card empty-state">
              <h4>${isSlotComplete(activeSlot.slotNumber) ? "Slot complete" : "Waiting for random reveal"}</h4>
              <p>${
                isSlotComplete(activeSlot.slotNumber)
                  ? "All four sales are complete in this slot. Choose any other slot from the timeline to continue the auction."
                  : "The next eligible live player will appear automatically when the admin opens this slot."
              }</p>
            </article>
          `
      }
      <article class="stage-card stage-card--bid">
        <span class="eyebrow">Current Bid</span>
        <h4 class="stage-card__bid-amount">${formatPoints(bidAmount)}</h4>
        <p>${leadingTeam ? `Leading team: ${leadingTeam.name}` : "No recorded bid yet"}</p>
        <div class="stage-card__bid-track">
          <div class="stage-card__bid-progress" style="width:${progressWidth}%;"></div>
        </div>
        <div class="stage-card__bid-meta">
          <span>${bidContext?.label ?? "Bid ceiling pending"}</span>
          <strong>${formatPoints(ceilingAmount)}</strong>
        </div>
        <div class="pill-row">
          <span class="mini-pill">${snapshot.auctionState.isLive ? "Auction live" : "Auction paused"}</span>
          <span class="mini-pill">${getSoldCountForSlot(snapshot.auctionState.currentSlotNumber)}/4 filled in this slot</span>
          ${
            bidContext
              ? `<span class="mini-pill">${
                  progressWidth >= 90 ? "Near bid ceiling" : progressWidth >= 70 ? "Pressure zone" : "Ceiling healthy"
                }</span>`
              : ""
          }
        </div>
      </article>
    </div>
  `;
}

function renderPublicLiveCard() {
  if (!snapshot) {
    publicLiveCard.innerHTML = "";
    return;
  }

  const activeSlot = getActiveSlot();
  const leadingTeam = getLeadingTeam();
  const soldInSlot = getSoldCountForSlot(snapshot.auctionState.currentSlotNumber);

  publicLiveCard.innerHTML = `
    <div class="public-stage__header">
      <div>
        <p class="eyebrow">Public Auction Board</p>
        <h2>${activeSlot.label} · ${activeSlot.role}</h2>
      </div>
      <div class="public-stage__score">
        <img class="public-stage__logo" src="${snapshot.league.logoPath}" alt="${snapshot.league.name} logo" />
        <strong>${formatPoints(snapshot.auctionState.currentBid || snapshot.settings.basePrice)}</strong>
        <span>${leadingTeam ? `${leadingTeam.name} leading` : "Base price ready"}</span>
      </div>
    </div>
    <div class="public-stage__chips">
      <span class="mini-pill">${soldInSlot}/4 filled in current slot</span>
      <span class="mini-pill">${snapshot.auctionState.isLive ? "Live auction" : "Paused for setup"}</span>
      <span class="mini-pill">${snapshot.meta.lockedPlayerCount} owner slots locked before auction</span>
    </div>
  `;
}

function getYouTubeEmbedUrl(input) {
  if (!input) return null;
  // Extract video ID from any format, then always build a clean embed URL
  // Full iframe embed code — extract video ID from src
  const iframeMatch = input.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (iframeMatch) return `https://www.youtube.com/embed/${iframeMatch[1]}?autoplay=1&mute=1`;
  const watchMatch = input.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=1&mute=1`;
  const shortMatch = input.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&mute=1`;
  const liveMatch = input.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{11})/);
  if (liveMatch) return `https://www.youtube.com/embed/${liveMatch[1]}?autoplay=1&mute=1`;
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) return `https://www.youtube.com/embed/${input.trim()}?autoplay=1&mute=1`;
  return null;
}

function renderLiveMode() {
  if (!liveOverlay) return;

  const isLive = Boolean(snapshot?.auctionState?.isLive);
  const isPublic = uiState.currentView === "public";
  const shouldShow = isLive && isPublic && uiState.route?.name === "auction";

  liveOverlay.classList.toggle("live-overlay--active", shouldShow);
  document.body.style.overflow = shouldShow ? "hidden" : "";

  if (!shouldShow || !snapshot) return;

  const nominatedId = snapshot.auctionState.nominatedPlayerId;
  const nominatedPlayer = snapshot.players.find((p) => p.id === nominatedId);
  const leadingTeam = getLeadingTeam();
  const activeSlot = getActiveSlot();
  const teamColorIndex = leadingTeam
    ? snapshot.teams.findIndex((t) => t.id === leadingTeam.id) + 1
    : 0;
  const soldTotal = getCompletedSales().length;

  const playerChanged = nominatedId !== liveModeLastNominatedId;
  liveModeLastNominatedId = nominatedId;

  liveOverlay.dataset.tc = teamColorIndex || "";
  liveOverlay.classList.toggle("live-overlay--new-player", playerChanged);

  const embedUrl = getYouTubeEmbedUrl(uiState.youtubeUrl);

  const playerName = nominatedPlayer?.name ?? "Awaiting Nomination";
  const playerRole = nominatedPlayer
    ? `${nominatedPlayer.roleLabel} · ${activeSlot?.label ?? ""}`
    : `${activeSlot?.label ?? ""} · ${activeSlot?.role ?? ""}`;

  const teamHud = leadingTeam
    ? `<div class="live-overlay__hud-team">
        <img class="live-overlay__hud-logo" src="${leadingTeam.logoPath}" alt="${leadingTeam.name}" />
        <div>
          <p class="live-overlay__hud-label">Leading</p>
          <p class="live-overlay__hud-teamname">${leadingTeam.name}</p>
        </div>
      </div>`
    : `<div class="live-overlay__hud-team">
        <div>
          <p class="live-overlay__hud-label">Leading</p>
          <p class="live-overlay__hud-teamname" style="color:rgba(255,255,255,0.4)">Open for Bids</p>
        </div>
      </div>`;

  const hudHTML = `
    <div class="live-overlay__hud ${nominatedPlayer && playerChanged ? "live-overlay__hud--new" : ""}">
      <div class="live-overlay__hud-player">
        ${nominatedPlayer?.photoPath
          ? `<img class="live-overlay__hud-photo" src="${nominatedPlayer.photoPath}" alt="${playerName}" />`
          : ""}
        <p class="live-overlay__hud-label">${playerRole}</p>
        <h1 class="live-overlay__hud-name">${playerName}</h1>
        <p class="live-overlay__hud-base">Base ${formatPoints(snapshot.settings.basePrice)}</p>
      </div>
      <div class="live-overlay__hud-bid">
        <p class="live-overlay__hud-label">Current Bid</p>
        <div class="live-overlay__hud-amount">${formatPoints(snapshot.auctionState.currentBid || snapshot.settings.basePrice)}</div>
        <p class="live-overlay__hud-stats">${soldTotal} Sold · Slot ${snapshot.auctionState.currentSlotNumber}/${snapshot.slots.length}</p>
      </div>
      ${teamHud}
    </div>
  `;

  // Only rebuild the full overlay (including iframe) when the embed URL changes.
  // Otherwise just update the HUD to avoid reloading the YouTube stream on every bid.
  const existingFrame = liveOverlay.querySelector('.live-overlay__yt-frame');
  const existingSrc = existingFrame?.getAttribute('src') || '';

  if (!liveOverlay.querySelector('.live-overlay__bg') || existingSrc !== (embedUrl || '')) {
    liveOverlay.innerHTML = `
      <div class="live-overlay__bg" aria-hidden="true">
        ${embedUrl
          ? `<iframe class="live-overlay__yt-frame" src="${embedUrl}" frameborder="0"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
               allowfullscreen></iframe>`
          : ""}
      </div>
      <div class="live-overlay__yt-fade" aria-hidden="true"></div>
      <div class="live-overlay__topbar">
        <div class="live-badge">
          <span class="live-badge__dot"></span>
          Live
        </div>
        <img class="live-overlay__league-logo" src="${snapshot.league.logoPath}" alt="${snapshot.league.name}" />
        <span class="live-overlay__league-name">${snapshot.league.name} · ${snapshot.league.seasonName}</span>
        <div class="live-overlay__topbar-sponsors">
          <div class="live-overlay__topbar-sponsors-track">
            ${(snapshot.settings?.sponsors ?? []).map(s =>
              `<span class="live-overlay__topbar-sponsor"><img src="${s.logoPath}" alt="${s.name}" />${s.name}</span>`
            ).join("")}
            ${(snapshot.settings?.sponsors ?? []).map(s =>
              `<span class="live-overlay__topbar-sponsor" aria-hidden="true"><img src="${s.logoPath}" alt="" />${s.name}</span>`
            ).join("")}
          </div>
        </div>
        <div class="live-overlay__slot-info">${activeSlot?.label ?? ""} · ${activeSlot?.role ?? ""}</div>
      </div>
      ${hudHTML}
    `;
  } else {
    // Iframe is stable — only update the HUD
    const existingHud = liveOverlay.querySelector('.live-overlay__hud');
    if (existingHud) {
      existingHud.outerHTML = hudHTML;
    } else {
      liveOverlay.insertAdjacentHTML('beforeend', hudHTML);
    }
    const slotInfo = liveOverlay.querySelector('.live-overlay__slot-info');
    if (slotInfo) slotInfo.textContent = `${activeSlot?.label ?? ""} · ${activeSlot?.role ?? ""}`;
  }
}

function renderTeamCards(container, interactive) {
  if (!snapshot) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = snapshot.teams
    .map(
      (team, index) => {
        const { remainingAfterThis, reservedFloor, maxBid, slotFilled } = getTeamBidBudget(
          team,
          snapshot.auctionState.currentSlotNumber
        );
        const shouldFlashBid = uiState.bidFlashTeamId === team.id;
        const spentAmount = team.purseTotal - team.purseRemaining;
        const spentPercent = Math.min(100, Math.max(0, (spentAmount / team.purseTotal) * 100));
        const slotsLeft = Math.max(0, snapshot.meta.squadSize - team.filledSlots);
        return `
        <article class="team-card team-card--${index + 1} ${snapshot.auctionState.leadingTeamId === team.id ? "team-card--leading" : ""} ${shouldFlashBid ? "team-card--bid-flash" : ""}">
          <div class="team-card__top">
            <div>
              <span class="eyebrow">Franchise ${index + 1}</span>
              <h3>${team.name}</h3>
            </div>
            <span class="team-code">${team.code}</span>
          </div>
          <div class="team-card__hero">
            <div class="team-card__crest">
              <img src="${team.logoPath}" alt="${team.name} logo" loading="lazy" />
            </div>
            <span class="team-card__slots-left">${slotsLeft} slots remaining</span>
          </div>
          <p class="team-owner">${interactive ? "Admin records bids on behalf of owners" : "Public purse display"}</p>
          <dl class="metric-list">
            <div>
              <dt>Purse</dt>
              <dd><span class="purse-val">${formatPoints(team.purseRemaining)}</span> / ${formatPoints(team.purseTotal)}</dd>
            </div>
            <div class="metric-list__bar-row">
              <dt>Spent</dt>
              <dd><span class="money-gold">${formatPoints(spentAmount)}</span></dd>
            </div>
            <div class="team-card__purse-bar" aria-hidden="true">
              <div class="team-card__purse-spent" style="width:${spentPercent}%;"></div>
            </div>
            <div>
              <dt>Players Bought</dt>
              <dd>${team.filledSlots} / ${snapshot.meta.squadSize}</dd>
            </div>
            ${interactive ? `
            <div>
              <dt>Max Bid</dt>
              <dd style="color:${maxBid <= snapshot.settings.basePrice ? "var(--signal)" : "var(--gold)"}">${formatPoints(maxBid)}</dd>
            </div>
            <div>
              <dt>Reserved Floor</dt>
              <dd style="color:var(--ink-soft)">${formatPoints(reservedFloor)} (${remainingAfterThis} slots)</dd>
            </div>
            ` : ""}
          </dl>
          ${
            interactive
              ? (() => {
                  const currentBid = snapshot.auctionState.currentBid || snapshot.settings.basePrice;
                  const allowedStep = currentBid < 10000 ? 1000 : 2000;
                  const disable1k = slotFilled || allowedStep !== 1000 || (currentBid + 1000) > maxBid;
                  const disable2k = slotFilled || allowedStep !== 2000 || (currentBid + 2000) > maxBid;
                  return `
                <div class="team-card__actions">
                  <button class="button team-bid team-bid--${index + 1}" type="button" data-team-id="${team.id}" data-step="1000" ${disable1k ? "disabled" : ""}>Record +1,000</button>
                  <button class="button button--ghost team-bid team-bid--${index + 1} team-bid--ghost" type="button" data-team-id="${team.id}" data-step="2000" ${disable2k ? "disabled" : ""}>Record +2,000</button>
                </div>
              `;
                })()
              : ""
          }
        </article>
      `;
      }
    )
    .join("");

  if (!interactive) {
    return;
  }

  container.querySelectorAll(".team-bid").forEach((button) => {
    button.addEventListener("click", async () => {
      const ok = await performAction("bid", {
        teamId: button.dataset.teamId,
        increment: Number(button.dataset.step),
      });
      if (!ok) {
        button.classList.add("button--shake");
        setTimeout(() => button.classList.remove("button--shake"), 420);
      }
    });
  });
}

function renderPlayers() {
  if (!snapshot) {
    playerGrid.innerHTML = "";
    return;
  }

  const visiblePlayers = getVisiblePlayers();

  playerGrid.innerHTML = visiblePlayers
    .map((player) => {
      const isActiveSlot = player.eligibleSlotNumbers.includes(snapshot.auctionState.currentSlotNumber);
      const isSelected = player.id === snapshot.auctionState.nominatedPlayerId;
      const team = snapshot.teams.find((entry) => entry.id === player.soldToTeamId);
      const assignedSlotLabel = player.assignedSlotNumber ? `P${player.assignedSlotNumber}` : "-";
      const amountLabel = player.status === "Locked"
        ? "Offline Fixed"
        : player.soldAmount
          ? formatPoints(player.soldAmount)
          : `Base ${formatPoints(player.basePrice)}`;
      return `
        <article
          class="player-card ${isActiveSlot ? "player-card--active-slot" : ""} ${isSelected ? "player-card--selected" : ""} ${player.isPlaceholder ? "player-card--placeholder" : ""}"
        >
          <span class="eyebrow">${player.eligibilityLabel}</span>
          <h3>${player.name}</h3>
          <p>${player.roleLabel}</p>
          <div class="pill-row">
            <span class="mini-pill">${player.status}</span>
            <span class="mini-pill">${amountLabel}</span>
            <span class="mini-pill">${team ? team.code : assignedSlotLabel}</span>
            ${player.status === "Locked" ? '<span class="mini-pill">Owner Locked</span>' : ""}
            ${isSelected ? '<span class="mini-pill">On Desk</span>' : ""}
            ${player.isPlaceholder ? '<span class="mini-pill">Placeholder</span>' : ""}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderActivityLog() {
  if (!snapshot) {
    activityLog.innerHTML = "";
    return;
  }

  activityLog.innerHTML = snapshot.activityLog
    .slice(0, 10)
    .map((item, index) => {
      const tone = index === 0 ? "activity-item activity-item--fresh" : "activity-item";
      return `<article class="${tone}">${item.message}</article>`;
    })
    .join("");
}

function renderSoldHistory(container) {
  if (!snapshot) {
    container.innerHTML = "";
    return;
  }

  const sales = getCompletedSales();
  if (sales.length === 0) {
    container.innerHTML = `
      <article class="history-item history-item--empty">
        No completed sales yet. Sold players will appear here as the auction progresses.
      </article>
    `;
    return;
  }

  container.innerHTML = sales
    .slice(0, 10)
    .map((sale) => {
      const player = snapshot.players.find((entry) => entry.id === sale.playerId);
      const team = snapshot.teams.find((entry) => entry.id === sale.teamId);
      return `
        <article class="history-item">
          <div>
            <strong>${player?.name ?? "-"}</strong>
            <p>${team?.name ?? "-"} · Position ${sale.slotNumber}</p>
          </div>
          <span class="money-gold">${formatPoints(sale.amount)}</span>
        </article>
      `;
    })
    .join("");
}

function renderSquadBoard(container) {
  if (!snapshot) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = snapshot.teams
    .map(
      (team, index) => `
        <article class="squad-card squad-card--${index + 1}">
          <div class="squad-card__top">
            <div>
              <span class="eyebrow">Squad Sheet</span>
              <h3>${team.name}</h3>
            </div>
            <img class="squad-card__logo" src="${team.logoPath}" alt="${team.name} logo" loading="lazy" />
            <span class="mini-pill">${team.filledSlots}/${snapshot.meta.squadSize} filled</span>
          </div>
          <div class="slot-list">
            ${snapshot.slots
              .map((slot) => {
                const player = getTeamSlotPlayer(team.id, slot.slotNumber);
                return `
                  <div class="slot-row">
                    <span>${slot.label}</span>
                    <strong>${player ? player.name : "Open"}</strong>
                    <em>${player ? player.roleLabel : slot.role}</em>
                  </div>
                `;
              })
              .join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function exportSquadCSV() {
  if (!snapshot) return;

  const rows = [["Team", "Slot", "Position", "Player", "Role", "Status", "Sold Price"]];

  snapshot.teams.forEach((team) => {
    snapshot.slots.forEach((slot) => {
      const player = getTeamSlotPlayer(team.id, slot.slotNumber);
      if (player) {
        const price = player.status === "Locked"
          ? "Offline Fixed"
          : player.soldAmount
            ? player.soldAmount
            : "";
        rows.push([team.name, slot.label, slot.role, player.name, player.roleLabel, player.status, price]);
      } else {
        rows.push([team.name, slot.label, slot.role, "Open", "", "", ""]);
      }
    });
  });

  const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `EPL-Squad-Report-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function renderRosterTable(body) {
  if (!snapshot) {
    body.innerHTML = "";
    return;
  }

  body.innerHTML = getSortedRoster()
    .map((player) => {
      const team = snapshot.teams.find((entry) => entry.id === player.soldToTeamId);
      const amountLabel = player.status === "Locked"
        ? `<span class="money-gold">Offline Fixed</span>`
        : player.soldAmount
          ? `<span class="money-gold">${formatPoints(player.soldAmount)}</span>`
          : "-";
      return `
        <tr>
          <td>${player.name}</td>
          <td>${player.roleLabel}</td>
          <td><span class="roster-status roster-status--${player.status.toLowerCase()}">${player.status}</span></td>
          <td>${team ? team.name : "-"}</td>
          <td>${player.assignedSlotNumber ? `Position ${player.assignedSlotNumber}` : "-"}</td>
          <td>${amountLabel}</td>
        </tr>
      `;
    })
    .join("");
}

function renderFilters() {
  if (!snapshot) {
    slotFilter.innerHTML = "";
    return;
  }

  const currentValue = uiState.slotFilter || String(snapshot.auctionState.currentSlotNumber);
  const options = [{ value: "all", label: "All Slots" }].concat(
    snapshot.slots.map((slot) => ({
      value: String(slot.slotNumber),
      label: `${slot.label} - ${slot.role}`,
    }))
  );

  slotFilter.innerHTML = options
    .map((option) => `<option value="${option.value}">${option.label}</option>`)
    .join("");

  slotFilter.value = currentValue;
}

function renderLoadingState() {
  summaryCards.innerHTML = `
    <article class="summary-card">
      <span>Loading</span>
      <strong>Connecting</strong>
      <small>Fetching persisted auction state</small>
    </article>
  `;
}

function renderNavigation() {
  if (!uiState.route) {
    return;
  }

  routeLinks.forEach((link) => {
    const routeName = link.dataset.routeLink || "home";
    const isActive = routeName === uiState.route.name || (routeName === "squads" && uiState.route.name === "squad-detail");
    link.classList.toggle("league-nav__link--active", isActive);
  });
}

function getAuctionSummary() {
  const soldCount = snapshot.players.filter((player) => player.status === "Sold").length;
  const lockedCount = snapshot.players.filter((player) => player.status === "Locked").length;
  const totalRequired = snapshot.meta.totalPlayers;
  const completedCount = soldCount + lockedCount;
  const completionPct = Math.round((completedCount / totalRequired) * 100);
  const activeSlot = getActiveSlot();

  return {
    soldCount,
    lockedCount,
    completedCount,
    completionPct,
    activeSlot,
    isArchived: completedCount >= totalRequired,
  };
}

function renderFixtureCards() {
  function teamLogo(name) {
    return snapshot?.teams.find((t) => t.name === name)?.logoPath ?? null;
  }

  function matchupHTML(match) {
    const homeLogo = teamLogo(match.home);
    const awayLogo = teamLogo(match.away);
    const homeColor = TEAM_COLORS[match.home] ?? "rgba(255,255,255,0.2)";
    const awayColor = TEAM_COLORS[match.away] ?? "rgba(255,255,255,0.2)";
    const isTbd = match.status === "TBD";

    return `
      <article class="fixture-matchup" style="--home-color:${homeColor};--away-color:${awayColor};">
        <div class="fixture-matchup__label">${match.label}</div>
        <div class="fixture-matchup__teams">
          <div class="fixture-matchup__team fixture-matchup__team--home">
            ${homeLogo ? `<img src="${homeLogo}" alt="${match.home}" />` : `<span class="fixture-tbd-crest">?</span>`}
            <span>${match.home}</span>
          </div>
          <div class="fixture-matchup__vs">VS</div>
          <div class="fixture-matchup__team fixture-matchup__team--away">
            ${awayLogo ? `<img src="${awayLogo}" alt="${match.away}" />` : `<span class="fixture-tbd-crest">?</span>`}
            <span>${match.away}</span>
          </div>
        </div>
        <span class="league-badge ${isTbd ? "league-badge--archived" : "league-badge--live"}">${match.status}</span>
      </article>
    `;
  }

  return SEASON_FIXTURES.map(
    (matchday) => `
      <article class="fixture-day-card">
        <div class="fixture-day-card__header">
          <div>
            <p class="eyebrow">Matchday</p>
            <h3>${matchday.dayLabel}</h3>
          </div>
          <span class="mini-pill">${matchday.matches.length} fixtures</span>
        </div>
        <div class="fixture-list">
          ${matchday.matches.map(matchupHTML).join("")}
        </div>
      </article>
    `
  ).join("");
}

function renderHomePage() {
  const { soldCount, lockedCount, completionPct } = getAuctionSummary();

  seasonPage.innerHTML = `
    <!-- 5: Sponsors bar first — top-of-fold exposure -->
    <section class="home-sponsors">
      <div class="home-sponsors__group">
        <span class="home-sponsors__label">Title Sponsor</span>
        <div class="home-sponsors__logos">
          <a href="https://www.instagram.com/lfbc_fitness?igsh=MWMxOTJlbzhxOTJ3aA==" target="_blank" rel="noopener noreferrer">
            <img src="/assets/sponsors/01_LFBC.png" alt="Live Free By Choice" />
          </a>
        </div>
      </div>
      <div class="home-sponsors__divider" aria-hidden="true"></div>
      <div class="home-sponsors__group">
        <span class="home-sponsors__label">Premier Partners</span>
        <div class="home-sponsors__logos">
          <a href="https://www.instagram.com/okaresorts?igsh=cmF1cG83OGxhMWUw" target="_blank" rel="noopener noreferrer">
            <img src="/assets/sponsors/04_OKA.png" alt="OKA Resorts" />
          </a>
          <a href="https://amitha-developers.ueniweb.com/" target="_blank" rel="noopener noreferrer">
            <img src="/assets/sponsors/03_AMI.png" alt="Amitha Developers" />
          </a>
          <a href="https://www.google.com/search?kgmid=/g/11wtzwp6vz&q=MM@FITNESS+ZONE" target="_blank" rel="noopener noreferrer">
            <img src="/assets/sponsors/07_MM.png" alt="MM Fitness Zone" />
          </a>
        </div>
      </div>
    </section>

    <!-- 1: Cinematic hero — centered badge, dramatic gradient backdrop -->
    <section class="season-hero season-hero--cinema">
      <div class="season-hero__glow season-hero__glow--left"></div>
      <div class="season-hero__glow season-hero__glow--right"></div>
      <div class="season-hero__inner">
        <img class="season-hero__badge" src="${snapshot.league.logoPath}" alt="${snapshot.league.name}" />
        <p class="season-hero__eyebrow">Equality Premier League</p>
        <h1 class="season-hero__title">Season ${SEASON_NUMBER}</h1>
        <p class="season-hero__tagline">Live Free. Play Equal.</p>
        <div class="season-hero__actions">
          <a class="button" href="${buildSeasonPath("squads")}" data-route-link="squads">View Squads</a>
          <a class="button button--ghost" href="${buildSeasonPath("teams")}" data-route-link="teams">Browse Teams</a>
        </div>
      </div>
    </section>

    <!-- 2: Stat rail — large gold numbers, thin dividers -->
    <section class="stat-rail">
      <div class="stat-rail__item">
        <strong>${snapshot.teams.length}</strong>
        <span>Franchises</span>
        <small>Season ${SEASON_NUMBER} teams</small>
      </div>
      <div class="stat-rail__sep"></div>
      <div class="stat-rail__item">
        <strong>${snapshot.meta.totalPlayers}</strong>
        <span>Players</span>
        <small>${snapshot.meta.lockedPlayerCount} locked · ${snapshot.meta.liveAuctionPlayerCount} auctioned</small>
      </div>
      <div class="stat-rail__sep"></div>
      <div class="stat-rail__item">
        <strong>${completionPct}%</strong>
        <span>Auction Complete</span>
        <small>${soldCount} sold · ${lockedCount} owner-locked</small>
      </div>
      <div class="stat-rail__sep"></div>
      <div class="stat-rail__item">
        <strong>${SEASON_FIXTURES.reduce((acc, d) => acc + d.matches.length, 0)}</strong>
        <span>Fixtures</span>
        <small>${SEASON_FIXTURES.length} matchdays scheduled</small>
      </div>
    </section>

    <!-- 3: Fixtures with team crests -->
    <section class="league-section">
      <div class="league-section__header">
        <div>
          <p class="eyebrow">Fixtures</p>
          <h2>Season ${SEASON_NUMBER} Match Schedule</h2>
        </div>
        <span class="mini-pill">${SEASON_FIXTURES.length} matchdays</span>
      </div>
      <div class="fixture-grid">
        ${renderFixtureCards()}
      </div>
    </section>
  `;
}

function renderTeamsDirectory() {
  seasonPage.innerHTML = `
    <section class="league-section">
      <div class="league-section__header">
        <div>
          <p class="eyebrow">Franchise Directory</p>
          <h2>Season ${SEASON_NUMBER} Teams</h2>
        </div>
      </div>
      <div class="franchise-grid">
        ${snapshot.teams
          .map((team, index) => {
            const squadCount = snapshot.players.filter((player) => player.soldToTeamId === team.id).length;
            return `
              <article class="franchise-card franchise-card--${index + 1}">
                <img class="franchise-card__logo" src="${team.logoPath}" alt="${team.name}" />
                <span class="franchise-card__code">${team.code}</span>
                <h3>${team.name}</h3>
                <p>${team.owner}</p>
                <div class="franchise-card__stats">
                  <span>${formatPoints(team.purseRemaining)} purse left</span>
                  <span>${squadCount}/${snapshot.meta.squadSize} players assigned</span>
                </div>
                <div class="franchise-card__actions">
                  <a class="button" href="${buildSeasonPath("squads", getTeamSlug(team))}" data-route-link="squads">View Squad</a>
                  <a class="button button--ghost" href="${buildSeasonPath("auction")}" data-route-link="auction">Open Auction</a>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function renderSquadsPage(teamSlug = null) {
  const focusedTeam = teamSlug ? getTeamBySlug(teamSlug) : null;

  if (teamSlug && !focusedTeam) {
    seasonPage.innerHTML = `
      <section class="league-section">
        <div class="league-empty">The requested squad page does not exist for Season ${SEASON_NUMBER}.</div>
      </section>
    `;
    return;
  }

  if (focusedTeam) {
    seasonPage.innerHTML = `
      <section class="league-section">
        <div class="league-section__header">
          <div>
            <p class="eyebrow">Team Squad</p>
            <h2>${focusedTeam.name}</h2>
          </div>
          <a class="button button--ghost" href="${buildSeasonPath("squads")}" data-route-link="squads">All Squads</a>
        </div>
        <div class="squad-detail-hero">
          <img class="squad-detail-hero__logo" src="${focusedTeam.logoPath}" alt="${focusedTeam.name}" />
          <div>
            <p class="squad-detail-hero__meta">${focusedTeam.code} · Season ${SEASON_NUMBER}</p>
            <h3>${focusedTeam.name}</h3>
            <p>${focusedTeam.owner}</p>
            <div class="league-inline-stats">
              <span class="mini-pill">${formatPoints(focusedTeam.purseRemaining)} purse remaining</span>
              <span class="mini-pill">${focusedTeam.filledSlots}/${snapshot.meta.squadSize} slots filled</span>
            </div>
          </div>
        </div>
        <div class="squad-detail-grid">
          ${snapshot.slots
            .map((slot) => {
              const player = getTeamSlotPlayer(focusedTeam.id, slot.slotNumber);
              return `
                <article class="slot-detail-card">
                  <span>${slot.label}</span>
                  <strong>${player ? player.name : "Open"}</strong>
                  <p>${player ? player.roleLabel : slot.role}</p>
                </article>
              `;
            })
            .join("")}
        </div>
      </section>
    `;
    return;
  }

  seasonPage.innerHTML = `
    <section class="league-section">
      <div class="league-section__header">
        <div>
          <p class="eyebrow">Squad Centre</p>
          <h2>Team Squads</h2>
        </div>
      </div>
      <div class="squad-directory">
        ${snapshot.teams
          .map(
            (team, index) => `
              <article class="squad-directory__card squad-directory__card--${index + 1}">
                <img class="squad-directory__logo" src="${team.logoPath}" alt="${team.name}" />
                <div>
                  <h3>${team.name}</h3>
                  <p>${team.filledSlots}/${snapshot.meta.squadSize} slots currently filled</p>
                </div>
                <a class="button" href="${buildSeasonPath("squads", getTeamSlug(team))}" data-route-link="squads">Open Squad Page</a>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderPointsTablePage() {
  seasonPage.innerHTML = `
    <section class="league-section">
      <div class="league-section__header">
        <div>
          <p class="eyebrow">Standings</p>
          <h2>Points Table</h2>
        </div>
      </div>
      <div class="league-inline-stats">
        <span class="mini-pill">Season kicks off Apr 11</span>
        <span class="mini-pill">${SEASON_FIXTURES.length} matchdays scheduled</span>
        <span class="mini-pill">Standings update after each matchday</span>
      </div>
      <div class="roster-table-wrap">
        <table class="roster-table">
          <thead>
            <tr>
              <th>Team</th>
              <th>Played</th>
              <th>Won</th>
              <th>Lost</th>
              <th>NR</th>
              <th>Points</th>
              <th>NRR</th>
            </tr>
          </thead>
          <tbody>
            ${snapshot.teams
              .map(
                (team) => `
                  <tr>
                    <td>${team.name}</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>-</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>

    <section class="league-section">
      <div class="league-section__header">
        <div>
          <p class="eyebrow">Fixtures</p>
          <h2>Schedule Driving This Table</h2>
        </div>
      </div>
      <div class="league-empty">
        Season 1 begins Apr 11 — standings will update live after each matchday.
      </div>
      <div class="fixture-grid">
        ${renderFixtureCards()}
      </div>
    </section>
  `;
}

function renderSeasonPage() {
  if (!uiState.route || !seasonPage || !auctionShell) {
    return;
  }

  const isAuctionRoute = uiState.route.name === "auction";
  auctionShell.classList.toggle("auction-shell--hidden", !isAuctionRoute);
  seasonPage.classList.toggle("season-page--hidden", isAuctionRoute);

  if (!snapshot) {
    if (!isAuctionRoute) {
      seasonPage.innerHTML = `
        <section class="league-section">
          <div class="league-empty">Loading Season ${SEASON_NUMBER} league data…</div>
        </section>
      `;
    }
    return;
  }

  if (isAuctionRoute) {
    seasonPage.innerHTML = "";
    return;
  }

  switch (uiState.route.name) {
    case "teams":
      renderTeamsDirectory();
      break;
    case "squads":
      renderSquadsPage();
      break;
    case "squad-detail":
      renderSquadsPage(uiState.route.teamSlug);
      break;
    case "points-table":
      renderPointsTablePage();
      break;
    case "not-found":
      seasonPage.innerHTML = `
        <section class="league-section">
          <div class="league-section__header">
            <div>
              <p class="eyebrow">404</p>
              <h2>Page Not Found</h2>
            </div>
          </div>
          <div class="league-empty">
            This page doesn't exist. <a class="inline-link" href="${SEASON_BASE}" data-route-link="home">Back to home →</a>
          </div>
        </section>
      `;
      break;
    case "home":
    default:
      renderHomePage();
      break;
  }
}

function showLoginOverlay() {
  if (document.querySelector("#login-overlay")) return;
  const overlay = document.createElement("div");
  overlay.id = "login-overlay";
  overlay.innerHTML = `
    <div class="login-modal">
      <button id="login-close" type="button" aria-label="Close" style="position:absolute;top:14px;right:16px;background:none;border:none;color:var(--ink-soft);font-size:1.4rem;cursor:pointer;line-height:1;">&#x2715;</button>
      <h2>Admin Login</h2>
      <p>Enter your credentials to access the auction controls.</p>
      <form id="login-form">
        <label>Username<input type="text" id="login-username" name="username" autocomplete="username" /></label>
        <label>Password<input type="password" id="login-password" name="password" autocomplete="current-password" /></label>
        <p id="login-error" class="login-modal__error" style="display:none;"></p>
        <button class="button" type="submit">Sign In</button>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";
  overlay.querySelector("#login-close").addEventListener("click", () => {
    overlay.remove();
    document.body.style.overflow = "";
  });
  overlay.querySelector("#login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = overlay.querySelector("#login-username").value;
    const password = overlay.querySelector("#login-password").value;
    const errorEl = overlay.querySelector("#login-error");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        uiState.token = data.token;
        localStorage.setItem("auction_token", data.token);
        overlay.remove();
        document.body.style.overflow = "";
        uiState.currentView = "admin";
        render();
      } else {
        errorEl.textContent = data.message || "Login failed.";
        errorEl.style.display = "block";
      }
    } catch {
      errorEl.textContent = "Could not reach the server.";
      errorEl.style.display = "block";
    }
  });
}

function render() {
  renderNavigation();
  document.body.classList.toggle("body-live", Boolean(snapshot?.auctionState?.isLive));
  document.body.classList.toggle("sse-disconnected", snapshot !== null && !uiState.connected);
  renderViewState();
  renderFlashBanner();

  renderSeasonPage();

  if (!snapshot) {
    renderLoadingState();
    return;
  }
  renderAuctionProgress();
  renderSummaryCards();
  renderBranding();
  renderTicker();
  renderFilters();
  renderSlotTimeline();
  renderActiveSlotCard();
  renderPublicLiveCard();
  renderLiveMode();
  renderTeamCards(teamsGrid, true);
  renderTeamCards(publicTeamsGrid, false);
  renderPlayers();
  renderActivityLog();
  renderSoldHistory(soldHistory);
  renderSoldHistory(publicSoldHistory);
  renderSquadBoard(adminSquadBoard);
  renderSquadBoard(publicSquadBoard);
  renderRosterTable(adminRosterBody);
  renderRosterTable(publicRosterBody);

  prevSlotButton.disabled = snapshot.auctionState.currentSlotNumber === 1;
  nextSlotButton.disabled =
    snapshot.auctionState.currentSlotNumber === snapshot.slots.length ||
    !isSlotComplete(snapshot.auctionState.currentSlotNumber);
  const canSell = Boolean(snapshot.auctionState.nominatedPlayerId && snapshot.auctionState.leadingTeamId);
  sellPlayerButton.disabled = !canSell;
  sellPlayerButton.classList.toggle("button--sell-live", canSell);
  sellPlayerButton.classList.toggle(
    "button--sell-pulse",
    Boolean(snapshot.auctionState.isLive && snapshot.auctionState.nominatedPlayerId && snapshot.auctionState.leadingTeamId)
  );
  undoSaleButton.disabled = snapshot.undoStack.length === 0;
  toggleLiveButton.textContent = snapshot.auctionState.isLive ? "Pause Auction" : "Start Auction";
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("[data-route-link]");
  if (!link) {
    return;
  }

  const href = link.getAttribute("href");
  if (!href) {
    return;
  }

  const url = new URL(href, window.location.origin);
  if (url.origin !== window.location.origin) {
    return;
  }

  event.preventDefault();
  navigateTo(url.pathname);
});

window.addEventListener("popstate", () => {
  uiState.route = parseRoute(window.location.pathname);
  setRouteTitle(uiState.route.name);
  render();
});

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.view === "admin" && !uiState.token) {
      showLoginOverlay();
      return;
    }
    uiState.currentView = button.dataset.view;
    render();
  });
});

if (youtubeInput) {
  youtubeInput.value = uiState.youtubeUrl;
  youtubeInput.addEventListener("input", () => {
    uiState.youtubeUrl = youtubeInput.value.trim();
    localStorage.setItem("epl_yt_url", uiState.youtubeUrl);
  });
}

toggleLiveButton.addEventListener("click", () => {
  performAction("toggle-live");
});

prevSlotButton.addEventListener("click", () => {
  if (!snapshot) {
    return;
  }

  performAction("set-slot", {
    slotNumber: snapshot.auctionState.currentSlotNumber - 1,
  });
});

nextSlotButton.addEventListener("click", () => {
  performAction("next-slot");
});

sellPlayerButton.addEventListener("click", () => {
  performAction("sell");
});

undoSaleButton.addEventListener("click", () => {
  performAction("reopen-last-sold");
});

document.querySelector("#export-squad-btn").addEventListener("click", exportSquadCSV);

document.querySelector("#reset-auction").addEventListener("click", async () => {
  const confirmed = window.confirm(
    "Reset the entire auction back to its original state?\n\nThis will clear all bids, sales, and purse changes. This cannot be undone."
  );
  if (!confirmed) return;

  try {
    const response = await fetch("/api/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(uiState.token ? { Authorization: `Bearer ${uiState.token}` } : {}),
      },
    });
    const data = await readJson(response);
    if (response.status === 401) {
      uiState.token = null;
      localStorage.removeItem("auction_token");
      showLoginOverlay();
      showNotice("warning", "Session expired. Please log in again.");
      return;
    }
    if (!response.ok) {
      showNotice("warning", data.message || "Reset failed.");
      return;
    }
    setSnapshot(data.state);
    showNotice("success", "Auction has been reset to its original state.");
  } catch {
    showNotice("warning", "The auction server could not be reached.");
  }
});

bidStepButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    if (!snapshot?.auctionState.leadingTeamId) {
      showNotice("warning", "Use a team record button first, then apply quick raises.");
      button.classList.add("button--shake");
      setTimeout(() => button.classList.remove("button--shake"), 420);
      return;
    }

    const ok = await performAction("bid", {
      teamId: snapshot.auctionState.leadingTeamId,
      increment: Number(button.dataset.step),
    });
    if (!ok) {
      button.classList.add("button--shake");
      setTimeout(() => button.classList.remove("button--shake"), 420);
    }
  });
});

slotFilter.addEventListener("change", () => {
  uiState.slotFilter = slotFilter.value;
  renderPlayers();
});

window.addEventListener("beforeunload", () => {
  if (eventSource) {
    eventSource.close();
  }
});

uiState.route = parseRoute(window.location.pathname);
setRouteTitle(uiState.route.name);
if (window.location.pathname !== uiState.route.path) {
  window.history.replaceState({}, "", uiState.route.path);
}

render();
loadState().then(() => {
  connectEvents();
});
