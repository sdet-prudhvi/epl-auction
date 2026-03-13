const uiState = {
  currentView: "admin",
  notice: null,
  connected: false,
  slotFilter: "",
  lastEventKey: null,
  token: localStorage.getItem("auction_token") || null,
};

let snapshot = null;
let noticeTimeoutId = null;
let celebrationTimeoutId = null;
let eventSource = null;

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
const flashBanner = document.querySelector("#flash-banner");
const celebrationLayer = document.querySelector("#celebration-layer");
const tickerTrack = document.querySelector("#ticker-track");
const adminView = document.querySelector("#admin-view");
const publicView = document.querySelector("#public-view");
const adminActions = document.querySelector("#admin-actions");
const viewButtons = document.querySelectorAll("[data-view]");

const toggleLiveButton = document.querySelector("#toggle-live");
const prevSlotButton = document.querySelector("#prev-slot");
const nextSlotButton = document.querySelector("#next-slot");
const sellPlayerButton = document.querySelector("#sell-player");
const undoSaleButton = document.querySelector("#undo-sale");
const bidStepButtons = document.querySelectorAll(".bid-step");

function formatPoints(value) {
  return Number(value || 0).toLocaleString();
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

function maybeCelebrate(nextSnapshot) {
  const nextEvent = nextSnapshot?.auctionState?.lastEvent;
  if (!nextEvent || nextEvent.key === uiState.lastEventKey) {
    return;
  }

  uiState.lastEventKey = nextEvent.key;

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
    triggerCelebration(player.name, team.name);
  }
}

function setSnapshot(nextSnapshot) {
  maybeCelebrate(nextSnapshot);
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
      label: "Server Sync",
      value: uiState.connected ? "Live" : "Retrying",
      helper: `${soldCount}/${snapshot.meta.liveAuctionPlayerCount} auctioned · ${lockedCount} locked`,
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
    return ["Connecting to the EPL auction desk..."];
  }

  const activeSlot = getActiveSlot();
  const latestSales = getCompletedSales()
    .slice(0, 4)
    .map((sale) => {
      const player = snapshot.players.find((entry) => entry.id === sale.playerId);
      const team = snapshot.teams.find((entry) => entry.id === sale.teamId);
      return `${player?.name ?? "Player"} sold to ${team?.name ?? "team"} for ${formatPoints(sale.amount)}`;
    });

  const activityItems = snapshot.activityLog.slice(0, 4).map((item) => item.message);
  const baseItems = [
    `${snapshot.league.name} ${snapshot.league.seasonName} is ${snapshot.auctionState.isLive ? "live" : "paused"}`,
    `${activeSlot?.label ?? "Position"} on desk: ${activeSlot?.role ?? "Loading"}`,
    `Base price ${formatPoints(snapshot.settings.basePrice)} · Purse visible to everyone`,
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
        <span class="ticker-item">
          <span class="ticker-item__spark"></span>
          ${item}
        </span>
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

  auctionBadge.textContent = snapshot.auctionState.isLive ? "Live" : "Paused";

  activeSlotCard.innerHTML = `
    <div class="auction-stage__top">
      <div>
        <p class="active-slot__label">${activeSlot.label}</p>
        <h3>${activeSlot.role}</h3>
      </div>
      <div class="active-slot__meta">${activePlayers.length} live players left</div>
    </div>
    <div class="auction-stage__grid">
      ${
        selectedPlayer
          ? `
            <article class="stage-card">
              <span class="eyebrow">Randomly Revealed Player</span>
              <h4>${selectedPlayer.name}</h4>
              <p>${selectedPlayer.roleLabel}</p>
              <div class="pill-row">
                <span class="mini-pill">Base ${formatPoints(selectedPlayer.basePrice)}</span>
                <span class="mini-pill">${selectedPlayer.eligibilityLabel}</span>
                <span class="mini-pill">Auto-pop after each sale</span>
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
      <article class="stage-card">
        <span class="eyebrow">Current Bid</span>
        <h4>${snapshot.auctionState.currentBid ? formatPoints(snapshot.auctionState.currentBid) : "-"}</h4>
        <p>${leadingTeam ? `Leading team: ${leadingTeam.name}` : "No recorded bid yet"}</p>
        <div class="pill-row">
          <span class="mini-pill">${snapshot.auctionState.isLive ? "Auction live" : "Auction paused"}</span>
          <span class="mini-pill">${getSoldCountForSlot(snapshot.auctionState.currentSlotNumber)}/4 filled in this slot</span>
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
        <p class="public-stage__copy">
          Purse board and sold history stay visible to everyone during the live auction, with players auto-revealed slot by slot.
        </p>
      </div>
      <div class="public-stage__score">
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

function renderTeamCards(container, interactive) {
  if (!snapshot) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = snapshot.teams
    .map(
      (team, index) => `
        <article class="team-card team-card--${index + 1} ${snapshot.auctionState.leadingTeamId === team.id ? "team-card--leading" : ""}">
          <div class="team-card__top">
            <div>
              <span class="eyebrow">Franchise ${index + 1}</span>
              <h3>${team.name}</h3>
            </div>
            <span class="team-code">${team.code}</span>
          </div>
          <p class="team-owner">${interactive ? "Admin records bids on behalf of owners" : "Public purse display"}</p>
          <dl class="metric-list">
            <div>
              <dt>Purse</dt>
              <dd>${formatPoints(team.purseRemaining)} / ${formatPoints(team.purseTotal)}</dd>
            </div>
            <div>
              <dt>Players Bought</dt>
              <dd>${team.filledSlots} / ${snapshot.meta.squadSize}</dd>
            </div>
          </dl>
          ${
            interactive
              ? `
                <div class="team-card__actions">
                  <button class="button team-bid" type="button" data-team-id="${team.id}" data-step="1000" ${teamHasFilledSlot(team.id, snapshot.auctionState.currentSlotNumber) ? "disabled" : ""}>Record +1,000</button>
                  <button class="button button--ghost team-bid" type="button" data-team-id="${team.id}" data-step="2000" ${teamHasFilledSlot(team.id, snapshot.auctionState.currentSlotNumber) ? "disabled" : ""}>Record +2,000</button>
                </div>
              `
              : ""
          }
        </article>
      `
    )
    .join("");

  if (!interactive) {
    return;
  }

  container.querySelectorAll(".team-bid").forEach((button) => {
    button.addEventListener("click", () => {
      performAction("bid", {
        teamId: button.dataset.teamId,
        increment: Number(button.dataset.step),
      });
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
          <span>${formatPoints(sale.amount)}</span>
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

function renderRosterTable(body) {
  if (!snapshot) {
    body.innerHTML = "";
    return;
  }

  body.innerHTML = getSortedRoster()
    .map((player) => {
      const team = snapshot.teams.find((entry) => entry.id === player.soldToTeamId);
      const amountLabel = player.status === "Locked"
        ? "Offline Fixed"
        : player.soldAmount
          ? formatPoints(player.soldAmount)
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

function showLoginOverlay() {
  if (document.querySelector("#login-overlay")) return;
  const overlay = document.createElement("div");
  overlay.id = "login-overlay";
  overlay.innerHTML = `
    <div class="login-modal">
      <h2>Admin Login</h2>
      <p>Enter your credentials to access the auction controls.</p>
      <form id="login-form">
        <label>Username<input type="text" id="login-username" autocomplete="username" /></label>
        <label>Password<input type="password" id="login-password" autocomplete="current-password" /></label>
        <p id="login-error" class="login-modal__error" style="display:none;"></p>
        <button class="button" type="submit">Sign In</button>
      </form>
    </div>
  `;
  document.body.appendChild(overlay);
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
  document.body.classList.toggle("body-live", Boolean(snapshot?.auctionState?.isLive));
  renderViewState();
  renderFlashBanner();

  if (!snapshot) {
    renderLoadingState();
    return;
  }

  renderSummaryCards();
  renderTicker();
  renderFilters();
  renderSlotTimeline();
  renderActiveSlotCard();
  renderPublicLiveCard();
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
  sellPlayerButton.disabled = !(snapshot.auctionState.nominatedPlayerId && snapshot.auctionState.leadingTeamId);
  undoSaleButton.disabled = snapshot.undoStack.length === 0;
  toggleLiveButton.textContent = snapshot.auctionState.isLive ? "Pause Auction" : "Start Auction";
}

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    uiState.currentView = button.dataset.view;
    render();
  });
});

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

bidStepButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!snapshot?.auctionState.leadingTeamId) {
      showNotice("warning", "Use a team record button first, then apply quick raises.");
      return;
    }

    performAction("bid", {
      teamId: snapshot.auctionState.leadingTeamId,
      increment: Number(button.dataset.step),
    });
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

render();
if (!uiState.token) {
  showLoginOverlay();
}
loadState().then(() => {
  connectEvents();
});
