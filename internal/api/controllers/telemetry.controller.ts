import type { Request, Response } from 'express';
import { telemetrySchema } from '../validators/telemetry.schema.js';
import { insertTelemetry } from '../../repositories/telemetry.repository.js';
export async function createTelemetry(req: Request, res: Response) {
  const parsed = telemetrySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid telemetry', details: parsed.error.flatten() });
  const reading = { ...parsed.data, recordedAt: parsed.data.recordedAt ?? new Date().toISOString() };
  await insertTelemetry(reading);
  return res.status(201).json(reading);
}
