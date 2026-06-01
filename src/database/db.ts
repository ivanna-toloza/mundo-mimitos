import { Pool, QueryResult } from 'pg';

// Create connection pool
// DATABASE_URL will be loaded by dotenv in server.ts before this module is used
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function query(text: string, params?: any[]): Promise<QueryResult> {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
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
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return pool.connect();
}

export { pool };
