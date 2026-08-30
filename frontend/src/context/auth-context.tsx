"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { getMe } from "@/lib/auth-api";
import { authClient } from "@/lib/auth-client";
import type { AuthUser } from "@/lib/auth-api";
import type { UserRole } from "@/utils/resolve-dashboard-route";

interface AuthState {
  authenticated: boolean;
  loading: boolean;
  user: AuthUser | null;
  role: UserRole | null;
}

interface AuthContextValue extends AuthState {
  signInWithGoogle: (intent?: "login" | "signup") => Promise<void>;
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

  // Google OAuth entry point. Intent is enforced SERVER-SIDE:
  //   "login"  -> existing accounts only; unknown emails are rejected with
  //               error=signup_disabled and no user is ever created.
  //   "signup" -> brand-new emails only; an email that already belongs to a
  //               TransitOps user is rejected with error=email_already_exists
  //               BEFORE any session is created.
  //
  // callbackURL MUST be absolute: the post-Google redirect is served by the
  // BACKEND origin, so relative paths would resolve against :5000.
  const signInWithGoogle = useCallback(
    async (intent: "login" | "signup" = "login") => {
      const frontendOrigin =
        typeof window === "undefined" ? "" : window.location.origin;
      const callbackURL = new URL("/login", frontendOrigin);
      if (intent === "signup") callbackURL.searchParams.set("intent", "signup");
      const errorCallbackURL = new URL("/login", frontendOrigin);

      const result = await authClient.signIn.social({
        provider: "google",
        requestSignUp: intent === "signup",
        callbackURL: callbackURL.toString(),
        errorCallbackURL: errorCallbackURL.toString(),
      });

      if (result?.error) {
        throw new Error(
          result.error.message ||
            "Google sign-in is unavailable right now. Please try again."
        );
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authClient.signOut({ fetchOptions: { credentials: "include" } });
    } catch {
      // proceed with client-side logout even if API fails
    }
    setState({ authenticated: false, loading: false, user: null, role: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signInWithGoogle, logout, refresh }}>
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
