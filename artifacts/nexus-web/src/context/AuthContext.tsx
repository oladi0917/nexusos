import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { api, type AuthUser } from "../lib/api";

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("nexus_token")
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<AuthUser>("/auth/me")
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem("nexus_token");
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const { token: t, user: u } = await api.post<{
      token: string;
      user: AuthUser;
    }>("/auth/login", { email, password });
    localStorage.setItem("nexus_token", t);
    setToken(t);
    setUser(u);
  }, []);

  const signup = useCallback(
    async (data: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      phone: string;
    }) => {
      const { token: t, user: u } = await api.post<{
        token: string;
        user: AuthUser;
      }>("/auth/signup", data);
      localStorage.setItem("nexus_token", t);
      setToken(t);
      setUser(u);
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("nexus_token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
