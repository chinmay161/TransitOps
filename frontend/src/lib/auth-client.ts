import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
  // Canonical public auth base is the frontend origin (e.g. https://app.vercel.app)
  // where /api/auth is proxied to the backend via Vercel rewrites (and locally via Next.js rewrites).
  // In the browser always use window.location.origin to avoid stale NEXT_PUBLIC_API_URL=/api/backend.
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  return "http://localhost:5000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  fetchOptions: {
    credentials: "include",
  },
});
