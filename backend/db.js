import pg from "pg";

const { Pool } = pg;

let pool = null;

function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

async function ensureTable() {
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS auction_state (
        id INTEGER PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
  } finally {
    client.release();
  }
}

async function loadFromDb() {
  await ensureTable();
  const result = await getPool().query("SELECT data FROM auction_state WHERE id = 1");
  return result.rows.length > 0 ? result.rows[0].data : null;
}

async function saveToDb(state) {
  await ensureTable();
  await getPool().query(
    `INSERT INTO auction_state (id, data, updated_at)
     VALUES (1, $1, NOW())
     ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = NOW()`,
    [JSON.stringify(state)]
  );
}

async function pingDb() {
  await getPool().query("SELECT 1");
}

export { loadFromDb, pingDb, saveToDb };
