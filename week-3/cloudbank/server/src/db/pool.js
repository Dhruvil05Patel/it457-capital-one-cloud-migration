import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Establish database configuration with sensible defaults
const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      user: process.env.PGUSER || 'cloudbank',
      password: process.env.PGPASSWORD || 'cloudbank_secret',
      database: process.env.PGDATABASE || 'cloudbank',
      max: Number(process.env.PGMAX) || 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

export const pool = new Pool(poolConfig);

// Handle idle connection errors gracefully to prevent crashing the server
pool.on('error', (err) => {
  console.error('[Database Pool Error] Unexpected error on idle client:', err.message);
});

/**
 * Execute a single query against the connection pool.
 * @param {string} text - SQL query string
 * @param {Array<any>} [params] - Query parameter bindings
 * @returns {Promise<pg.QueryResult>}
 */
export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SQL Query] duration=${duration}ms rows=${res.rowCount}`);
  }
  return res;
}

/**
 * Acquire a dedicated client from the pool for multi-statement transactions.
 * Caller MUST release the client in a finally block!
 * @returns {Promise<pg.PoolClient>}
 */
export async function getClient() {
  return pool.connect();
}

/**
 * Check database connectivity by executing a lightweight query.
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function checkHealth() {
  try {
    await pool.query('SELECT 1 AS health');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

/**
 * Gracefully terminate all active connections in the pool.
 */
export async function close() {
  await pool.end();
}

export default {
  pool,
  query,
  getClient,
  checkHealth,
  close,
};

