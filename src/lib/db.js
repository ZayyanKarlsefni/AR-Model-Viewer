// Analytics database access (Turso / LibSQL) with graceful fallback.
// If TURSO_DATABASE_URL + TURSO_AUTH_TOKEN are configured AND @libsql/client is
// installed, visits are logged to a proper SQL database (handles concurrency).
// Otherwise the caller falls back to the Vercel Blob JSON log.

let dbClient = null;
let tursoReady = false;

async function getDb() {
  if (tursoReady) return dbClient;
  if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) return null;
  try {
    const { createClient } = await import('@libsql/client');
    dbClient = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    await dbClient.execute(`
      CREATE TABLE IF NOT EXISTS visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_code TEXT NOT NULL,
        user_agent TEXT,
        is_ar INTEGER DEFAULT 0,
        visited_at TEXT
      )
    `);
    tursoReady = true;
    return dbClient;
  } catch (e) {
    console.warn('Turso unavailable, falling back to blob log:', e.message);
    return null;
  }
}

export async function logVisitTurso(modelCode, userAgent, isAr) {
  const db = await getDb();
  if (!db) return false;
  await db.execute({
    sql: 'INSERT INTO visits (model_code, user_agent, is_ar, visited_at) VALUES (?, ?, ?, ?)',
    args: [modelCode, userAgent, isAr ? 1 : 0, new Date().toISOString()],
  });
  return true;
}

export async function listVisitsTurso() {
  const db = await getDb();
  if (!db) return null;
  const res = await db.execute({
    sql: 'SELECT model_code AS code, user_agent AS device, is_ar AS isAr, visited_at AS timestamp FROM visits ORDER BY visited_at DESC LIMIT 100',
  });
  return res.rows.map((r) => ({
    code: r.code,
    device: r.device || 'Unknown Device',
    isAr: !!r.isAr,
    timestamp: r.timestamp,
  }));
}

export { dbClient };