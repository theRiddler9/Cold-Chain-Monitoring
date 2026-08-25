import type { Refrigerator as Fridge } from '../types/refrigerator.js';
import type { Node as DeviceNode } from '../types/node.js';
import type { Sensor as DeviceSensor } from '../types/sensor.js';
import type { Telemetry as Reading } from '../types/telemetry.js';

const now = Date.now();
export const demoRefrigerators: Fridge[] = [
  { id: 'REF-001', name: 'Vaccine Store A', location: 'Ward 2 · North Wing', targetMinC: 2, targetMaxC: 8, status: 'healthy' },
  { id: 'REF-002', name: 'Insulin Store B', location: 'Pharmacy · Ground Floor', targetMinC: 2, targetMaxC: 8, status: 'warning' },
  { id: 'REF-003', name: 'Blood Bank C', location: 'Lab · East Wing', targetMinC: 2, targetMaxC: 6, status: 'healthy' },
  { id: 'REF-004', name: 'Backup Unit D', location: 'Service Bay', targetMinC: 2, targetMaxC: 8, status: 'offline' }
];
export const demoNodes: DeviceNode[] = [
  { id: 'NODE-A', refrigeratorId: 'REF-001', name: 'ESP32 Node A', macAddress: '24:6F:28:AA:10:01', status: 'online', lastSeenAt: new Date(now - 30_000).toISOString() },
  { id: 'NODE-B', refrigeratorId: 'REF-002', name: 'ESP32 Node B', macAddress: '24:6F:28:AA:10:02', status: 'online', lastSeenAt: new Date(now - 65_000).toISOString() },
  { id: 'NODE-C', refrigeratorId: 'REF-003', name: 'ESP32 Node C', macAddress: '24:6F:28:AA:10:03', status: 'online', lastSeenAt: new Date(now - 38_000).toISOString() },
  { id: 'NODE-D', refrigeratorId: 'REF-004', name: 'ESP32 Node D', macAddress: '24:6F:28:AA:10:04', status: 'offline', lastSeenAt: new Date(now - 900_000).toISOString() }
];
export const demoSensors: DeviceSensor[] = demoNodes.map((node, index) => ({ id: `SENS-${String.fromCharCode(65 + index)}-01`, nodeId: node.id, name: `DHT22 Sensor ${String.fromCharCode(65 + index)}`, model: 'DHT22', status: node.status }));
export const demoTelemetry: Reading[] = [
  { sensorId: 'SENS-A-01', temperatureC: 4.2, humidityRh: 64, recordedAt: new Date(now - 30_000).toISOString() },
  { sensorId: 'SENS-B-01', temperatureC: 8.7, humidityRh: 70, recordedAt: new Date(now - 65_000).toISOString() },
  { sensorId: 'SENS-C-01', temperatureC: 3.8, humidityRh: 61, recordedAt: new Date(now - 38_000).toISOString() },
  { sensorId: 'SENS-D-01', temperatureC: 5.1, humidityRh: 67, recordedAt: new Date(now - 900_000).toISOString() }
];
export const demoAlerts = [{ id: 'ALT-001', refrigeratorId: 'REF-002', sensorId: 'SENS-B-01', severity: 'warning' as const, message: 'Temperature is above the 2–8°C range.', createdAt: new Date(now - 65_000).toISOString(), acknowledged: false }];
