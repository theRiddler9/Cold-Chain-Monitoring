export interface Alert { id: string; refrigeratorId: string; sensorId: string; severity: 'warning' | 'critical'; message: string; createdAt: string; acknowledged: boolean; }
