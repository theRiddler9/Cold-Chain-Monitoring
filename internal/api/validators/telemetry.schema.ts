import { z } from 'zod';

export const telemetrySchema = z.object({
  deviceId: z.string().min(1),
  seq: z.number().int().min(0),
  temp_cK: z.number().int(),
  tmin_cK: z.number().int(),
  tmax_cK: z.number().int(),
  humidityRh: z.number().int().min(0).max(10000), // Assuming hundredths of a percent or just %
  vbat_mV: z.number().int().min(0),
  flags: z.number().int().default(0),
  prevHash: z.string().optional(),
  signature: z.string().optional(),
  recordedAt: z.string().datetime().optional()
});

export type TelemetryPayload = z.infer<typeof telemetrySchema>;
