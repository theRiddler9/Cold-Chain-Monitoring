import { Router } from 'express'; import { createTelemetry } from '../controllers/telemetry.controller.js'; import { requireIngestKey } from '../middleware/auth.middleware.js';
export const telemetryRouter = Router(); telemetryRouter.post('/', requireIngestKey, createTelemetry);
