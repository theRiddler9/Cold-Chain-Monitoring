import type { RequestHandler } from 'express';
import { env } from '../../config/env.js';
export const requireIngestKey: RequestHandler = (req, res, next) => !env.INGEST_API_KEY || req.header('x-api-key') === env.INGEST_API_KEY ? next() : res.status(401).json({ error: 'Invalid API key' });
