import type { Request, Response } from 'express';
import { telemetrySchema } from '../validators/telemetry.schema.js';
import { insertTelemetry, getLastTelemetry } from '../../repositories/telemetry.repository.js';
import { evaluateTelemetry } from '../services/rules.service.js';
import crypto from 'node:crypto';

export async function createTelemetry(req: Request, res: Response) {
  const parsed = telemetrySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid telemetry', details: parsed.error.flatten() });
  
  const data = parsed.data;
  
  // Basic validation for sequence gaps (simplified)
  const lastRecord = await getLastTelemetry(data.deviceId);
  if (lastRecord && data.seq <= lastRecord.seq) {
    // Already processed or out of order - simple deduplication
    // In a real message broker queue, we might buffer it.
    return res.status(200).json({ status: 'ignored', reason: 'seq <= last_seq' });
  }

  // Integrity checks (Placeholder for HMAC/Signature validation)
  if (lastRecord && data.prevHash) {
    // e.g., verify hash(lastRecord) matches data.prevHash
    // This requires a deterministic serialization of the last record
  }

  const reading = await insertTelemetry(data);
  
  // Fire and forget rules engine check
  evaluateTelemetry(reading).catch(console.error);

  return res.status(201).json(reading);
}
