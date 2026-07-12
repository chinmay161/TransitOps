"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { login as apiLogin, logout as apiLogout, getMe } from "@/lib/auth-api";
import type { AuthUser, LoginInput, AuthApiError } from "@/lib/auth-api";
import type { UserRole } from "@/utils/resolve-dashboard-route";

interface AuthState {
  authenticated: boolean;
  loading: boolean;
  user: AuthUser | null;
  role: UserRole | null;
}

interface AuthContextValue extends AuthState {
  login: (input: LoginInput) => Promise<
    | { type: "must-change-password" }
    | { type: "success"; user: AuthUser }
  >;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    authenticated: false,
    loading: true,
    user: null,
    role: null,
  });

  const refresh = useCallback(async () => {
    try {
      const user = await getMe();
      setState({
        authenticated: true,
        loading: false,
        user,
        role: user.role as UserRole,
      });
    } catch {
      setState({ authenticated: false, loading: false, user: null, role: null });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (input: LoginInput) => {
      const result = await apiLogin(input);

      if ("mustChangePassword" in result && result.mustChangePassword) {
        return { type: "must-change-password" as const };
      }

      const user = await getMe();
      setState({
        authenticated: true,
        loading: false,
        user,
        role: user.role as UserRole,
      });

      return { type: "success" as const, user };
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // proceed with client-side logout even if API fails
    }
    setState({ authenticated: false, loading: false, user: null, role: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
