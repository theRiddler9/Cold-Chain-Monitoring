import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/error.middleware.js';
import { dashboardRouter } from './routes/dashboard.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { telemetryRouter } from './routes/telemetry.routes.js';

const app = express();
app.use(cors()); app.use(express.json());
// Vercel rewrites /api/<route> to this single serverless function.
app.use((req, _res, next) => {
  const route = typeof req.query.path === 'string' ? req.query.path.replace(/^\/+/, '') : undefined;
  if (route) req.url = `/api/${route}`;
  next();
});
app.use('/api/health', healthRouter); app.use('/api/dashboard', dashboardRouter); app.use('/api/telemetry', telemetryRouter);
app.use(errorHandler);
export default app;
