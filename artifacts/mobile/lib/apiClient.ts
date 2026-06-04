const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

let _tokenGetter: (() => string | null) | null = null;

export function setApiTokenGetter(getter: () => string | null) {
  _tokenGetter = getter;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = _tokenGetter?.();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/api${path}`, { ...options, headers });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      msg = body.error ?? msg;
    } catch { /* ignore */ }
    throw new Error(msg);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const nexusApi = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
};

export interface NexusCard {
  id: number;
  userId: number;
  last4: string;
  brand: string;
  cardholderName: string;
  expiresMonth: string;
  expiresYear: string;
  isActive: boolean;
  createdAt: string;
}

export interface NexusWallet {
  id: number;
  userId: number;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}
