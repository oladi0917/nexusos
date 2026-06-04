import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import {
  setAuthTokenGetter,
  setBaseUrl,
} from "@workspace/api-client-react";

const TOKEN_KEY = "nexus_auth_token";

export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Token storage — web uses localStorage fallback since SecureStore is polyfilled
async function storeToken(token: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

async function loadToken(): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function deleteToken() {
  if (Platform.OS === "web") {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

// Token ref for synchronous access in the getter
const tokenRef = { current: null as string | null };

// Set up auth token getter once (outside component)
setAuthTokenGetter(() => tokenRef.current);

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
setBaseUrl(BASE_URL);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted token on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await loadToken();
        if (stored) {
          tokenRef.current = stored;
          setToken(stored);
          // Fetch current user
          const res = await fetch(`${BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${stored}` },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data);
          } else {
            await deleteToken();
            tokenRef.current = null;
            setToken(null);
          }
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Login failed");
    tokenRef.current = data.token;
    setToken(data.token);
    setUser(data.user);
    await storeToken(data.token);
  }, []);

  const signup = useCallback(
    async (input: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      phone: string;
    }) => {
      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Signup failed");
      tokenRef.current = data.token;
      setToken(data.token);
      setUser(data.user);
      await storeToken(data.token);
    },
    []
  );

  const logout = useCallback(async () => {
    tokenRef.current = null;
    setToken(null);
    setUser(null);
    await deleteToken();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
