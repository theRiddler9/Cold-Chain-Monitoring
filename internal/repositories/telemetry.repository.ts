import { pool } from '../database/client.js';
import type { Telemetry } from '../types/telemetry.js';

export async function insertTelemetry(reading: Telemetry) {
  if (!pool) return reading;
  await pool.query('INSERT INTO telemetry (recorded_at, sensor_id, temperature_c, humidity_rh) VALUES ($1,$2,$3,$4)', [reading.recordedAt, reading.sensorId, reading.temperatureC, reading.humidityRh]);
  await pool.query('UPDATE nodes SET last_seen_at = $1 FROM sensors WHERE sensors.node_id = nodes.id AND sensors.id = $2', [reading.recordedAt, reading.sensorId]);
  return reading;
}
