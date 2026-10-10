import { pool } from '../database/client.js';
import crypto from 'node:crypto';

export async function getDeviceProductThresholds(deviceId: string) {
  if (!pool) return null;
  // Get the product thresholds for the batch currently in the unit assigned to the device
  // device -> device_assignments (active=true) -> unit
  // -> shipments (status=IN_TRANSIT or PENDING, assigned to unit? wait.)
  
  // Actually, shipments track the batch. The device is assigned to a shipment or a unit.
  // In our schema: device_assignments has shipment_id and unit_id.
  
  const query = `
    SELECT p.target_min_c, p.target_max_c, p.freeze_sensitive, p.stability_budget_mins,
           da.unit_id, da.shipment_id
    FROM device_assignments da
    LEFT JOIN shipments s ON da.shipment_id = s.id
    LEFT JOIN batches b ON s.batch_id = b.id
    LEFT JOIN products p ON b.product_id = p.id
    WHERE da.device_id = $1 AND da.active = TRUE
    LIMIT 1;
  `;
  
  const result = await pool.query(query, [deviceId]);
  return result.rows[0] ?? null;
}

export async function createExcursion(
  unitId: string, 
  deviceId: string, 
  status: string, 
  startTime: string,
  peakTemp: number, 
  cause: string
) {
  if (!pool) return null;
  const id = crypto.randomUUID();
  const query = `
    INSERT INTO excursions (id, unit_id, device_id, status, start_time, peak_temp, cause)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const result = await pool.query(query, [id, unitId, deviceId, status, startTime, peakTemp, cause]);
  return result.rows[0];
}

export async function getActiveExcursion(deviceId: string) {
  if (!pool) return null;
  const query = `
    SELECT * FROM excursions 
    WHERE device_id = $1 AND status IN ('WARNING', 'LATCHED')
    ORDER BY start_time DESC LIMIT 1;
  `;
  const result = await pool.query(query, [deviceId]);
  return result.rows[0] ?? null;
}

export async function updateExcursion(id: string, updates: any) {
  if (!pool) return null;
  // simple update for peak_temp, end_time, status
  const query = `
    UPDATE excursions 
    SET status = COALESCE($2, status), 
        end_time = COALESCE($3, end_time), 
        peak_temp = GREATEST(peak_temp, $4)
    WHERE id = $1
    RETURNING *;
  `;
  const result = await pool.query(query, [id, updates.status, updates.end_time, updates.peak_temp]);
  return result.rows[0];
}
