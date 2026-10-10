import { pool } from '../database/client.js';
import type { TelemetryPayload } from '../api/validators/telemetry.schema.js';

export async function insertTelemetry(reading: TelemetryPayload) {
  if (!pool) return reading;
  
  const recordedAt = reading.recordedAt ?? new Date().toISOString();
  
  await pool.query(
    `INSERT INTO telemetry 
      (recorded_at, device_id, seq, temp_cK, tmin_cK, tmax_cK, humidity_rh, vbat_mV, flags, prev_hash, signature) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (device_id, recorded_at) DO NOTHING`,
    [
      recordedAt, 
      reading.deviceId, 
      reading.seq, 
      reading.temp_cK, 
      reading.tmin_cK, 
      reading.tmax_cK, 
      reading.humidityRh, 
      reading.vbat_mV, 
      reading.flags, 
      reading.prevHash, 
      reading.signature
    ]
  );
  
  return { ...reading, recordedAt };
}

export async function getLastTelemetry(deviceId: string) {
  if (!pool) return null;
  const result = await pool.query(
    'SELECT * FROM telemetry WHERE device_id = $1 ORDER BY recorded_at DESC LIMIT 1',
    [deviceId]
  );
  return result.rows[0] ?? null;
}
