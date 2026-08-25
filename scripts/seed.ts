import { pool } from '../internal/database/client.js'; import { demoNodes, demoRefrigerators, demoSensors, demoTelemetry } from '../internal/database/seed.js';
if (!pool) throw new Error('DATABASE_URL is required to seed.');
for (const r of demoRefrigerators) await pool.query('INSERT INTO refrigerators (id,name,location,target_min_c,target_max_c) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING',[r.id,r.name,r.location,r.targetMinC,r.targetMaxC]);
for (const n of demoNodes) await pool.query('INSERT INTO nodes (id,refrigerator_id,name,mac_address,last_seen_at) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING',[n.id,n.refrigeratorId,n.name,n.macAddress,n.lastSeenAt]);
for (const s of demoSensors) await pool.query('INSERT INTO sensors (id,node_id,name,model) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING',[s.id,s.nodeId,s.name,s.model]);
for (const t of demoTelemetry) await pool.query('INSERT INTO telemetry (recorded_at,sensor_id,temperature_c,humidity_rh) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING',[t.recordedAt,t.sensorId,t.temperatureC,t.humidityRh]);
await pool.end(); console.log('Seed complete.');
