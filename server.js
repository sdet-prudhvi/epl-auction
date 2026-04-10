import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { URL } from "node:url";
import { randomUUID } from "node:crypto";
import { applyAction, getState, resetAuction } from "./backend/store.js";
import { pingDb } from "./backend/db.js";

// Load .env file if present (local development)
try {
  const envFile = await readFile(".env", "utf8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch {
  // No .env file — using environment variables from host (Render, etc.)
}

const rootDir = process.cwd();
const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "0.0.0.0";
const eventClients = new Set();
const sessions = new Set();
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "auctionpassword";
const SEASON_NUMBER = 1;
const LEAGUE_NAME = "Equality Premier League";
const LEAGUE_SHORT_NAME = "EPL";
const LEAGUE_DESCRIPTION =
  "Official Equality Premier League portal featuring teams, squads, fixtures, standings placeholders, and the player auction archive.";
const TEAM_LABEL_BY_SLUG = {
  gowthams: "Gowtham XI's",
  rahuls: "Rahul XI's",
  sunils: "Sunil XI's",
  acharyas: "Acharya XI'S",
  "gowtham-s": "Gowtham XI's",
  "rahul-s": "Rahul XI's",
  "sunil-s": "Sunil XI's",
  "acharya-s": "Acharya XI'S",
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(`${JSON.stringify(payload)}\n`);
}

function sendText(res, statusCode, text, contentType = "text/plain; charset=utf-8") {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=300",
  });
  res.end(text);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getTeamSlug(teamName) {
  return slugify(teamName.replace(/xi'?s?/gi, ""));
}

function getBaseUrl(req) {
  if (process.env.PUBLIC_BASE_URL) {
    return process.env.PUBLIC_BASE_URL.replace(/\/+$/, "");
  }
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  return requestUrl.origin.replace(/\/+$/, "");
}

function getSeoPayload(pathname, baseUrl) {
  const canonicalPath = pathname === "/" ? `/season/${SEASON_NUMBER}` : pathname;
  const canonicalUrl = `${baseUrl}${canonicalPath}`;
  const imageUrl = `${baseUrl}/assets/branding/epl-logo.png`;
  const organizationId = `${baseUrl}/#organization`;
  const leagueId = `${baseUrl}/#league`;
  const websiteId = `${baseUrl}/#website`;
  const teams = [
    { slug: "gowtham-s", name: "Gowtham XI's" },
    { slug: "rahul-s", name: "Rahul XI's" },
    { slug: "sunil-s", name: "Sunil XI's" },
    { slug: "acharya-s", name: "Acharya XI'S" },
  ];
  const sportsTeamEntities = teams.map((team) => ({
    "@type": "SportsTeam",
    "@id": `${baseUrl}/season/${SEASON_NUMBER}/squads/${team.slug}#team`,
    name: team.name,
    url: `${baseUrl}/season/${SEASON_NUMBER}/squads/${team.slug}`,
    memberOf: { "@id": leagueId },
  }));

  const defaults = {
    title: `${LEAGUE_NAME} | Season 1`,
    description: `${LEAGUE_NAME} Season 1 official portal with teams, squads, fixtures, points table, and the auction archive.`,
    canonicalUrl,
    ogType: "website",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": organizationId,
        name: LEAGUE_NAME,
        alternateName: LEAGUE_SHORT_NAME,
        url: baseUrl,
        description: LEAGUE_DESCRIPTION,
        logo: {
          "@type": "ImageObject",
          url: imageUrl,
        },
        image: imageUrl,
      },
      {
        "@context": "https://schema.org",
        "@type": "SportsOrganization",
        "@id": leagueId,
        name: LEAGUE_NAME,
        alternateName: LEAGUE_SHORT_NAME,
        url: baseUrl,
        description: LEAGUE_DESCRIPTION,
        logo: imageUrl,
        image: imageUrl,
        sport: "Cricket",
        parentOrganization: {
          "@id": organizationId,
        },
        subOrganization: sportsTeamEntities.map((team) => ({ "@id": team["@id"] })),
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": websiteId,
        name: LEAGUE_NAME,
        url: baseUrl,
        publisher: {
          "@id": organizationId,
        },
      },
      ...sportsTeamEntities.map((team) => ({
        "@context": "https://schema.org",
        ...team,
      })),
    ],
  };

  if (canonicalPath === `/season/${SEASON_NUMBER}`) {
    defaults.title = "Equality Premier League Season 1 | Teams, Squads, Fixtures & Auction";
    defaults.description =
      "Follow Equality Premier League Season 1 with team squads, match fixtures, points table placeholders, and the archived player auction.";
    defaults.structuredData.push({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Equality Premier League Season 1",
      url: canonicalUrl,
      description: defaults.description,
      isPartOf: { "@id": websiteId },
      about: { "@id": leagueId },
    });
    return defaults;
  }

  if (canonicalPath === `/season/${SEASON_NUMBER}/teams`) {
    defaults.title = "EPL Season 1 Teams | Equality Premier League";
    defaults.description =
      "Meet the four Equality Premier League Season 1 franchises and navigate to each team squad page and auction archive.";
    defaults.structuredData.push({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "EPL Season 1 Teams",
      url: canonicalUrl,
      description: defaults.description,
      isPartOf: { "@id": websiteId },
      about: { "@id": leagueId },
    });
    return defaults;
  }

  if (canonicalPath === `/season/${SEASON_NUMBER}/squads`) {
    defaults.title = "EPL Season 1 Squads | Equality Premier League";
    defaults.description =
      "Browse all Equality Premier League Season 1 squads with team-by-team player assignments across every position slot.";
    defaults.structuredData.push({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "EPL Season 1 Squads",
      url: canonicalUrl,
      description: defaults.description,
      isPartOf: { "@id": websiteId },
      about: { "@id": leagueId },
    });
    return defaults;
  }

  if (canonicalPath.startsWith(`/season/${SEASON_NUMBER}/squads/`)) {
    const teamSlug = canonicalPath.replace(`/season/${SEASON_NUMBER}/squads/`, "");
    const label =
      TEAM_LABEL_BY_SLUG[teamSlug] ||
      teamSlug
        .split("-")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    defaults.title = `${label} Squad | EPL Season 1`;
    defaults.description = `View the ${label} squad for Equality Premier League Season 1, including filled position slots and player assignments.`;
    defaults.structuredData.push({
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      name: `${label} Squad`,
      url: canonicalUrl,
      description: defaults.description,
      isPartOf: { "@id": websiteId },
      about: {
        "@id": `${baseUrl}${canonicalPath}#team`,
      },
    });
    return defaults;
  }

  if (canonicalPath === `/season/${SEASON_NUMBER}/points-table`) {
    defaults.title = "EPL Season 1 Points Table | Equality Premier League";
    defaults.description =
      "Track the Equality Premier League Season 1 points table, fixture list, and upcoming standings logic as match results are published.";
    defaults.structuredData.push({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "EPL Season 1 Points Table",
      url: canonicalUrl,
      description: defaults.description,
      isPartOf: { "@id": websiteId },
      about: { "@id": leagueId },
    });
    return defaults;
  }

  if (canonicalPath === `/season/${SEASON_NUMBER}/auction`) {
    defaults.title = "EPL Season 1 Auction Archive | Equality Premier League";
    defaults.description =
      "Explore the Equality Premier League Season 1 auction archive with sold players, team purse outcomes, and completed squad allocations.";
    defaults.structuredData.push({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "EPL Season 1 Auction Archive",
      url: canonicalUrl,
      description: defaults.description,
      isPartOf: { "@id": websiteId },
      about: { "@id": leagueId },
    });
    return defaults;
  }

  return defaults;
}

async function buildSitemap(baseUrl) {
  const urls = new Set([
    `${baseUrl}/season/${SEASON_NUMBER}`,
    `${baseUrl}/season/${SEASON_NUMBER}/teams`,
    `${baseUrl}/season/${SEASON_NUMBER}/squads`,
    `${baseUrl}/season/${SEASON_NUMBER}/points-table`,
    `${baseUrl}/season/${SEASON_NUMBER}/auction`,
  ]);

  try {
    const state = await getState();
    for (const team of state.teams || []) {
      urls.add(`${baseUrl}/season/${SEASON_NUMBER}/squads/${getTeamSlug(team.name)}`);
    }
  } catch {
    // If state is unavailable, fall back to the primary season pages only.
  }

  const lastmod = new Date().toISOString();
  const entries = [...urls]
    .map(
      (url) => `  <url>
    <loc>${escapeHtml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

async function renderIndexHtml(req, pathname) {
  const template = await readFile(path.join(rootDir, "index.html"), "utf8");
  const seo = getSeoPayload(pathname, getBaseUrl(req));

  return template
    .replaceAll("%SEO_TITLE%", escapeHtml(seo.title))
    .replaceAll("%SEO_DESCRIPTION%", escapeHtml(seo.description))
    .replaceAll("%SEO_CANONICAL%", escapeHtml(seo.canonicalUrl))
    .replaceAll("%SEO_OG_TYPE%", escapeHtml(seo.ogType))
    .replaceAll("%SEO_OG_IMAGE%", escapeHtml(`${getBaseUrl(req)}/assets/branding/epl-logo.png`))
    .replace("%SEO_STRUCTURED_DATA%", JSON.stringify(seo.structuredData));
}

function sendEvent(res, eventName, payload) {
  res.write(`event: ${eventName}\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function broadcastState(state) {
  for (const res of [...eventClients]) {
    try {
      sendEvent(res, "state", { state });
    } catch {
      eventClients.delete(res);
    }
  }
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

function requireAuth(req, res) {
  const auth = req.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token || !sessions.has(token)) {
    sendJson(res, 401, { ok: false, message: "Unauthorized." });
    return false;
  }
  return true;
}

async function serveStatic(req, res, pathname) {
  const relativePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.join(rootDir, relativePath);
  const normalized = path.normalize(filePath);

  if (!normalized.startsWith(rootDir)) {
    sendJson(res, 403, { ok: false, message: "Forbidden." });
    return;
  }

  try {
    const extension = path.extname(normalized);
    if (extension === ".html") {
      const html = await renderIndexHtml(req, pathname);
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      });
      res.end(html);
      return;
    }

    const file = await readFile(normalized);
    res.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
      "Cache-Control": extension === ".html" ? "no-store" : "public, max-age=60",
    });
    res.end(file);
  } catch {
    if (!path.extname(pathname)) {
      try {
        const html = await renderIndexHtml(req, pathname);
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        });
        res.end(html);
        return;
      } catch {
        // fall through to 404 below
      }
    }

    sendJson(res, 404, { ok: false, message: "File not found." });
  }
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = requestUrl;

  if (req.method === "GET" && pathname === "/healthz") {
    sendJson(res, 200, { ok: true, status: "healthy" });
    return;
  }

  if (req.method === "GET" && pathname === "/robots.txt") {
    const baseUrl = getBaseUrl(req);
    sendText(
      res,
      200,
      `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`
    );
    return;
  }

  if (req.method === "GET" && pathname === "/sitemap.xml") {
    const sitemap = await buildSitemap(getBaseUrl(req));
    sendText(res, 200, sitemap, "application/xml; charset=utf-8");
    return;
  }

  if (req.method === "GET" && pathname === "/squads.html") {
    res.writeHead(301, { Location: "/season/1/squads" });
    res.end();
    return;
  }

  if (req.method === "POST" && pathname === "/api/login") {
    const body = await readBody(req);
    if (body.username === ADMIN_USERNAME && body.password === ADMIN_PASSWORD) {
      const token = randomUUID();
      sessions.add(token);
      sendJson(res, 200, { ok: true, token });
    } else {
      sendJson(res, 401, { ok: false, message: "Invalid credentials." });
    }
    return;
  }

  if (req.method === "GET" && pathname === "/api/state") {
    try {
      const state = await getState();
      sendJson(res, 200, { ok: true, state });
    } catch (error) {
      sendJson(res, 500, { ok: false, message: error instanceof Error ? error.message : "Failed to load state." });
    }
    return;
  }

  if (req.method === "GET" && pathname === "/api/events") {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
    });
    res.write("\n");
    eventClients.add(res);
    sendEvent(res, "connected", { ok: true });
    try {
      sendEvent(res, "state", { state: await getState() });
    } catch (error) {
      sendEvent(res, "error", { message: error instanceof Error ? error.message : "Failed to load state." });
    }

    req.on("close", () => {
      eventClients.delete(res);
    });
    return;
  }

  if (req.method === "POST" && pathname === "/api/reset") {
    if (!requireAuth(req, res)) return;
    try {
      const { state, result } = await resetAuction();
      broadcastState(state);
      sendJson(res, 200, { ok: true, message: result.message, state });
    } catch (error) {
      sendJson(res, 500, { ok: false, message: error instanceof Error ? error.message : "Reset failed." });
    }
    return;
  }

  if (req.method === "POST" && pathname.startsWith("/api/actions/")) {
    if (!requireAuth(req, res)) return;
    const action = pathname.replace("/api/actions/", "");

    try {
      const body = await readBody(req);
      const { state, result } = await applyAction(action, body);
      broadcastState(state);
      sendJson(res, 200, {
        ok: true,
        message: result?.message ?? "Action applied.",
        state,
        data: result ?? null,
      });
    } catch (error) {
      sendJson(res, 409, {
        ok: false,
        message: error instanceof Error ? error.message : "Action failed.",
      });
    }
    return;
  }

  await serveStatic(req, res, pathname);
});

server.listen(port, host, () => {
  process.stdout.write(`EPL auction server running at http://${host}:${port}/\n`);
});

// Keep Supabase from pausing — ping every 4 minutes when DATABASE_URL is set
if (process.env.DATABASE_URL) {
  setInterval(async () => {
    try {
      await pingDb();
    } catch {
      // silent — main request path will surface real errors
    }
  }, 4 * 60 * 1000);
}
