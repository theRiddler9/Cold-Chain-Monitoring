import { readFile } from 'node:fs/promises'; import { pool } from '../internal/database/client.js';
if (!pool) throw new Error('DATABASE_URL is required to migrate.');
await pool.query(await readFile(new URL('../internal/database/schema/schema.sql', import.meta.url), 'utf8')); await pool.end(); console.log('Migration complete.');
