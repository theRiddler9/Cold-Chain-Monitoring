import type { DashboardData } from './telemetryApi';

export function getDemoDashboard(): DashboardData {
  const now = Date.now();
  const units = [
    ['REF-001', 'Vaccine Store A', 'Ward 2 · North Wing', 'NODE-A', 'ESP32 Node A', 'SENS-A-01', 'DHT22 Sensor A', 4.2, 64, 'healthy'],
    ['REF-002', 'Insulin Store B', 'Pharmacy · Ground Floor', 'NODE-B', 'ESP32 Node B', 'SENS-B-01', 'DHT22 Sensor B', 8.7, 70, 'warning'],
    ['REF-003', 'Blood Bank C', 'Lab · East Wing', 'NODE-C', 'ESP32 Node C', 'SENS-C-01', 'DHT22 Sensor C', 3.8, 61, 'healthy'],
    ['REF-004', 'Backup Unit D', 'Service Bay', 'NODE-D', 'ESP32 Node D', 'SENS-D-01', 'DHT22 Sensor D', 5.1, 67, 'offline']
  ] as const;
  const readings = units.map(([id, name, location, nodeId, nodeName, sensorId, sensorName, temperatureC, humidityRh, status], index) => ({
    refrigerator: { id, name, location, targetMinC: 2, targetMaxC: id === 'REF-003' ? 6 : 8, status },
    node: { id: nodeId, refrigeratorId: id, name: nodeName, macAddress: `24:6F:28:AA:10:0${index + 1}`, status: (status === 'offline' ? 'offline' : 'online') as 'online' | 'offline', lastSeenAt: new Date(now - (status === 'offline' ? 900_000 : (index + 1) * 30_000)).toISOString() },
    sensor: { id: sensorId, nodeId, name: sensorName, model: 'DHT22' as const, status: (status === 'offline' ? 'offline' : 'online') as 'online' | 'offline' },
    telemetry: { sensorId, temperatureC, humidityRh, recordedAt: new Date(now - (status === 'offline' ? 900_000 : (index + 1) * 30_000)).toISOString() }
  }));
  return { summary: { totalRefrigerators: 4, healthy: 2, attention: 1, offline: 1 }, readings, alerts: [{ id: 'ALT-001', refrigeratorId: 'REF-002', sensorId: 'SENS-B-01', severity: 'warning', message: 'Temperature is above the 2–8°C range.', createdAt: new Date(now - 65_000).toISOString(), acknowledged: false }] };
}
