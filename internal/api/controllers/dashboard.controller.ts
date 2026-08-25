import type { Request, Response } from 'express';
import { dashboardSummary } from '../services/dashboard.service.js';
export const getDashboard = async (_req: Request, res: Response) => res.json(await dashboardSummary());
