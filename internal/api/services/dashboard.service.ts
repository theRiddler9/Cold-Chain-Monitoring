import { demoAlerts, demoNodes, demoRefrigerators, demoSensors, demoTelemetry } from '../../database/seed.js';
import { pool } from '../../database/client.js';
import type { Refrigerator } from '../../types/refrigerator.js';
import type { Node } from '../../types/node.js';
import type { Sensor } from '../../types/sensor.js';
import type { Telemetry } from '../../types/telemetry.js';
import type { Alert } from '../../types/alert.js';

function makeSummary(readings: { refrigerator: Refrigerator; node: Node; sensor: Sensor; telemetry: Telemetry }[]) {
  const alerts: Alert[] = readings.filter(({ refrigerator }) => refrigerator.status === 'warning' || refrigerator.status === 'critical').map(({ refrigerator, sensor, telemetry }) => ({ id: `temp-${sensor.id}-${telemetry.recordedAt}`, refrigeratorId: refrigerator.id, sensorId: sensor.id, severity: refrigerator.status === 'critical' ? 'critical' : 'warning', message: `Temperature ${telemetry.temperatureC.toFixed(1)}°C is outside the ${refrigerator.targetMinC}–${refrigerator.targetMaxC}°C range.`, createdAt: telemetry.recordedAt, acknowledged: false }));
  return { summary: { totalRefrigerators: new Set(readings.map(r => r.refrigerator.id)).size, healthy: new Set(readings.filter(r => r.refrigerator.status === 'healthy').map(r => r.refrigerator.id)).size, attention: new Set(readings.filter(r => r.refrigerator.status === 'warning' || r.refrigerator.status === 'critical').map(r => r.refrigerator.id)).size, offline: new Set(readings.filter(r => r.refrigerator.status === 'offline').map(r => r.refrigerator.id)).size }, readings, alerts };
}

function demoSummary() {
  const readings = demoSensors.map(sensor => {
    const node = demoNodes.find(item => item.id === sensor.nodeId)!;
    const refrigerator = demoRefrigerators.find(item => item.id === node.refrigeratorId)!;
    const telemetry = demoTelemetry.find(item => item.sensorId === sensor.id)!;
    return { refrigerator, node, sensor, telemetry };
  });
  return { summary: { totalRefrigerators: demoRefrigerators.length, healthy: demoRefrigerators.filter(r => r.status === 'healthy').length, attention: demoRefrigerators.filter(r => r.status === 'warning' || r.status === 'critical').length, offline: demoRefrigerators.filter(r => r.status === 'offline').length }, readings, alerts: demoAlerts };
}

export async function dashboardSummary() {
  if (!pool) return demoSummary();
  const { rows } = await pool.query(`
    SELECT r.id refrigerator_id, r.name refrigerator_name, r.location, r.target_min_c, r.target_max_c,
      n.id node_id, n.name node_name, n.mac_address, n.last_seen_at,
      s.id sensor_id, s.name sensor_name, s.model,
      t.temperature_c, t.humidity_rh, t.recorded_at
    FROM refrigerators r
    JOIN nodes n ON n.refrigerator_id = r.id
    JOIN sensors s ON s.node_id = n.id
    JOIN LATERAL (SELECT * FROM telemetry WHERE sensor_id = s.id ORDER BY recorded_at DESC LIMIT 1) t ON true
    ORDER BY r.id, s.id`);
  const readings = rows.map(row => {
    const offline = !row.last_seen_at || Date.now() - new Date(row.last_seen_at).getTime() > 10 * 60_000;
    const temperature = Number(row.temperature_c);
    const status: Refrigerator['status'] = offline ? 'offline' : temperature < Number(row.target_min_c) - 1 || temperature > Number(row.target_max_c) + 1 ? 'critical' : temperature < Number(row.target_min_c) || temperature > Number(row.target_max_c) ? 'warning' : 'healthy';
    const node: Node = { id: row.node_id, refrigeratorId: row.refrigerator_id, name: row.node_name, macAddress: row.mac_address, status: offline ? 'offline' : 'online', lastSeenAt: new Date(row.last_seen_at).toISOString() };
    return { refrigerator: { id: row.refrigerator_id, name: row.refrigerator_name, location: row.location, targetMinC: Number(row.target_min_c), targetMaxC: Number(row.target_max_c), status }, node, sensor: { id: row.sensor_id, nodeId: row.node_id, name: row.sensor_name, model: row.model as 'DHT22', status: node.status }, telemetry: { sensorId: row.sensor_id, temperatureC: temperature, humidityRh: Number(row.humidity_rh), recordedAt: new Date(row.recorded_at).toISOString() } };
  });
  return makeSummary(readings);
}
