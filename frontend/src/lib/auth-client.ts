import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:5000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  fetchOptions: {
    credentials: "include",
  },
});
