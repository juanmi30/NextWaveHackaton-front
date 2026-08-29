import type { Health } from '../types/domain'

const runtimeEnv = (import.meta as ImportMeta & { env?: ImportMetaEnv }).env
export const API_BASE_URL = runtimeEnv?.VITE_API_URL?.replace(/\/+$/, '') ?? ''

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('Falta VITE_API_URL. Crea .env.local usando .env.example como base.')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new ApiError(response.status, body || response.statusText)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function withQuery(path: string, params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value))
  })
  const suffix = query.toString()
  return suffix ? `${path}?${suffix}` : path
}

export const getHealth = () => api<Health>('/health')
