const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

function getToken(): string | null {
  return localStorage.getItem("nexus_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.error ?? message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export type AuthUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
};

export type Account = {
  id: number;
  userId: number;
  bankId: string;
  bankName: string;
  bankColor: string;
  accountNumber: string;
  accountName: string;
  balance: number;
  currency: string;
  createdAt: string;
};

export type Transaction = {
  id: number;
  userId: number;
  accountId: number;
  accountName: string;
  bankName: string;
  bankColor: string;
  type: "credit" | "debit";
  amount: number;
  currency: string;
  description: string;
  category: string | null;
  tag: string | null;
  note: string | null;
  recipientName: string | null;
  recipientBank: string | null;
  createdAt: string;
};

export type DashboardData = {
  totalBalance: number;
  accountCount: number;
  currency: string;
  recentTransactions: Transaction[];
};

export type Bank = {
  id: string;
  name: string;
  shortName: string;
  color: string;
};

export type UserProfile = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bvn: string | null;
  address: string | null;
  createdAt: string;
};
