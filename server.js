import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { URL } from "node:url";
import { randomUUID } from "node:crypto";
import { applyAction, getState, resetAuction } from "./backend/store.js";

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

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(`${JSON.stringify(payload)}\n`);
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
    const file = await readFile(normalized);
    const extension = path.extname(normalized);
    res.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
      "Cache-Control": extension === ".html" ? "no-store" : "public, max-age=60",
    });
    res.end(file);
  } catch {
    if (!path.extname(pathname)) {
      try {
        const file = await readFile(path.join(rootDir, "index.html"));
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        });
        res.end(file);
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
    const state = await getState();
    sendJson(res, 200, { ok: true, state });
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
    sendEvent(res, "state", { state: await getState() });

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
