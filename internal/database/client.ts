import { Pool } from 'pg';
import { env } from '../config/env.js';

export const pool = env.DATABASE_URL ? new Pool({ connectionString: env.DATABASE_URL, ssl: env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false } }) : null;
