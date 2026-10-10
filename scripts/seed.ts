import { pool } from '../internal/database/client.js';
import { runSeed } from '../internal/database/seed.js';

if (!pool) throw new Error('DATABASE_URL is required to seed.');

await runSeed();
await pool.end();
console.log('Seed complete.');
