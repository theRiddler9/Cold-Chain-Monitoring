import { useCallback, useEffect, useState } from 'react'; import { getDashboard, type DashboardData } from '../services/telemetryApi'; import { getDemoDashboard } from '../services/demoData';
export function useTelemetry() {
  const [data, setData] = useState<DashboardData | null>(null); const [mode, setMode] = useState<'live' | 'demo'>('live');
  const load = useCallback(async () => { try { setData(await getDashboard()); setMode('live'); } catch { setData(getDemoDashboard()); setMode('demo'); } }, []);
  useEffect(() => { void load(); const id = window.setInterval(load, 30_000); return () => clearInterval(id); }, [load]);
  return { data, mode, reload: load };
}
