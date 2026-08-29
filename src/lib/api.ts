// VITE_API_URL es la RAIZ de la API, sin /api al final.
// El prefijo /api va en cada path, porque /health esta excluido del prefijo global.
const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '');

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (!BASE) {
    throw new Error('Falta VITE_API_URL. Revisa .env.local o las env vars de Vercel.');
  }
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} — ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export type Health = { status: string; db: string; uptime: number; ts: string };

export const getHealth = () => api<Health>('/health');