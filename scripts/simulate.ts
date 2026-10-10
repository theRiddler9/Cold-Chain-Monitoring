import { pool } from '../internal/database/client.js';
import { evaluateTelemetry } from '../internal/api/services/rules.service.js';
import crypto from 'node:crypto';

async function simulate() {
  if (!pool) return;
  console.log('Simulating hardware telemetry...');

  // Base telemetry data for 'dev_1'
  let tempC = 5.0; // Starts healthy
  let seq = 1;
  let prevHash = crypto.createHash('sha256').update('genesis').digest('hex');

  // We will simulate 10 readings. The 5th reading will simulate a fridge power cut (MAINS_LOST) and temp rise.
  for (let i = 0; i < 10; i++) {
    let flags = 0;
    
    if (i >= 4) {
      tempC += 1.5; // Temp rising due to power cut
      if (i === 4) flags |= (1 << 1); // MAINS_LOST
    } else {
      tempC += (Math.random() * 0.4 - 0.2); // slight fluctuation
    }

    const temp_cK = Math.round((tempC + 273.15) * 100);
    const recordedAt = new Date(Date.now() - (10 - i) * 60000).toISOString(); // 1 minute intervals

    const payload = {
      deviceId: 'dev_1',
      seq,
      temp_cK,
      tmin_cK: temp_cK - 50,
      tmax_cK: temp_cK + 50,
      humidityRh: 5000,
      vbat_mV: 3700,
      flags,
      prevHash,
      recordedAt,
    };

    // Evaluate rules inline to test the rules engine
    await evaluateTelemetry(payload);

    // Insert to DB (Rules engine normally called after insert, we are just mocking)
    await pool.query(
      `INSERT INTO telemetry (recorded_at, device_id, seq, temp_cK, tmin_cK, tmax_cK, humidity_rh, vbat_mV, flags, prev_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT DO NOTHING`,
      [recordedAt, payload.deviceId, payload.seq, payload.temp_cK, payload.tmin_cK, payload.tmax_cK, payload.humidityRh, payload.vbat_mV, payload.flags, payload.prevHash]
    );

    // Update hash for next record
    prevHash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    seq++;
  }

  console.log('Simulation finished.');
  await pool.end();
}

simulate().catch(console.error);
