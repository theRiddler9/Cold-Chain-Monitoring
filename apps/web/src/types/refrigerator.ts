export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'offline';
export interface Refrigerator { id:string; name:string; location:string; targetMinC:number; targetMaxC:number; status:HealthStatus; }
