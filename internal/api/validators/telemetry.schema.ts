import { z } from 'zod';
export const telemetrySchema = z.object({ sensorId: z.string().min(1), temperatureC: z.number().finite(), humidityRh: z.number().min(0).max(100), recordedAt: z.string().datetime().optional() });
