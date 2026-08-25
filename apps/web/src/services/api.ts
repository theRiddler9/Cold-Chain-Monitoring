const base = import.meta.env.VITE_API_URL ?? '/api';
export async function get<T>(path: string): Promise<T> { const response = await fetch(`${base}${path}`); if (!response.ok) throw new Error(`Request failed: ${response.status}`); return response.json() as Promise<T>; }
