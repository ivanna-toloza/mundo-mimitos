import { config } from 'dotenv';
import path from 'path';

// Load environment variables FIRST, before anything else
config({ path: path.resolve(process.cwd(), '.env.local') });
config({ path: path.resolve(process.cwd(), '.env') });

console.log('✓ Environment variables loaded');
console.log('  DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
console.log('  NODE_ENV:', process.env.NODE_ENV);

// Now import and run the server
import('./server.js').catch(console.error);
