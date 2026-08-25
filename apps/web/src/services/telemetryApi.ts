import { get } from './api'; import type { Alert } from '../types/alert'; import type { Node } from '../types/node'; import type { Refrigerator } from '../types/refrigerator'; import type { Sensor } from '../types/sensor'; import type { Telemetry } from '../types/telemetry';
export interface DashboardData { summary:{totalRefrigerators:number;healthy:number;attention:number;offline:number}; readings:{refrigerator:Refrigerator;node:Node;sensor:Sensor;telemetry:Telemetry}[];alerts:Alert[]; }
export const getDashboard = () => get<DashboardData>('/dashboard');
