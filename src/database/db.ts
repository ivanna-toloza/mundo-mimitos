import { Pool, QueryResult } from 'pg';

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

console.log('Connecting to PostgreSQL...');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function query(text: string, params?: any[]): Promise<QueryResult> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('✓ Query executed', { duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('✗ Database query error:', error);
    throw error;
  }
}

export async function getClient() {
  return pool.connect();
}

export { pool };
