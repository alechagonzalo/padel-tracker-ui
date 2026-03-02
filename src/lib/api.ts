import type {
  ApiEnums,
  ApiMatch,
  ApiPlayer,
  AuthLoginResponse,
  AuthRegisterResponse,
} from '@/types/api';

const TOKEN_KEY = 'padel_token';

export function getBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl) return envUrl.replace(/\/$/, '');
  return 'http://localhost:3000';
}

let cachedToken: string | null = null;

export function getStoredToken(): string | null {
  if (cachedToken) return cachedToken;
  cachedToken = localStorage.getItem(TOKEN_KEY);
  return cachedToken;
}

export function setStoredToken(token: string | null): void {
  cachedToken = token;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearStoredToken(): void {
  cachedToken = null;
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: { skipAuth?: boolean }
): Promise<T> {
  const base = getBaseUrl();
  const url = path.startsWith('http') ? path : `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (!options?.skipAuth) {
    const token = getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && !options?.skipAuth) {
      clearStoredToken();
    }
    const msg = data?.error ?? data?.message ?? data?.errors?.[0]?.msg ?? `Error ${res.status}`;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : String(msg));
  }
  return data as T;
}

export const auth = {
  login: (email: string, password: string) =>
    request<AuthLoginResponse>('POST', '/api/auth/login', { email, password }, { skipAuth: true }),
  register: (email: string, password: string) =>
    request<AuthRegisterResponse>('POST', '/api/auth/register', { email, password }, { skipAuth: true }),
};

export const enums = {
  get: () => request<ApiEnums>('GET', '/api/enums', undefined, { skipAuth: true }),
};

export const players = {
  list: () => request<ApiPlayer[]>('GET', '/api/players'),
  create: (body: { name: string; level: string }) =>
    request<ApiPlayer>('POST', '/api/players', body),
  update: (id: string, body: { name?: string; level?: string }) =>
    request<ApiPlayer>('PATCH', `/api/players/${id}`, body),
  delete: (id: string) => request<void>('DELETE', `/api/players/${id}`),
};

export const matches = {
  list: (params?: { outcome?: string; type?: string; from?: string; to?: string }) => {
    const q = new URLSearchParams();
    if (params?.outcome) q.set('outcome', params.outcome);
    if (params?.type) q.set('type', params.type);
    if (params?.from) q.set('from', params.from);
    if (params?.to) q.set('to', params.to);
    const query = q.toString();
    return request<ApiMatch[]>('GET', `/api/matches${query ? `?${query}` : ''}`);
  },
  get: (id: string) => request<ApiMatch>('GET', `/api/matches/${id}`),
  create: (body: {
    result: string;
    club: string;
    date: string;
    outcome: string;
    type: string;
    playerIds: [string, string, string];
  }) => request<ApiMatch>('POST', '/api/matches', body),
  update: (
    id: string,
    body: {
      result?: string;
      club?: string;
      date?: string;
      outcome?: string;
      type?: string;
      playerIds?: [string, string, string];
    }
  ) => request<ApiMatch>('PATCH', `/api/matches/${id}`, body),
  delete: (id: string) => request<void>('DELETE', `/api/matches/${id}`),
};

export const health = () =>
  request<{ ok: boolean }>('GET', '/health', undefined, { skipAuth: true });
