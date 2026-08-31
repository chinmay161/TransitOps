const getBaseURL = () => {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  return "http://localhost:5000";
};
const BASE_URL = getBaseURL();
const AUTH_BASE_URL = BASE_URL.replace(/\/api\/backend\/?$/, "");

export class AuthApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "AuthApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Use AUTH_BASE_URL for auth endpoints, and BASE_URL for normal API endpoints
  const isAuth = endpoint.startsWith("/api/auth/");
  const url = `${isAuth ? AUTH_BASE_URL : BASE_URL}${endpoint}`;
  let res: Response;
  try {
    res = await fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
  } catch (err) {
    const message =
      err instanceof TypeError
        ? `Unable to connect to server at ${BASE_URL}. Is the backend running?`
        : err instanceof Error
          ? err.message
          : "An unexpected network error occurred";
    throw new AuthApiError(0, "NETWORK_ERROR", message);
  }

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = body?.error || body;
    throw new AuthApiError(
      res.status,
      err?.code || "UNKNOWN",
      err?.message || "An unexpected error occurred",
      err?.details
    );
  }

  return body?.data ?? body;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  driver_id?: string;
}

// Rich TransitOps profile for the Better Auth session user.
export async function getMe(): Promise<AuthUser> {
  return request<AuthUser>("/api/auth/me");
}

export interface UserDirectoryEntry {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone: string | null;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export async function fetchUsers(): Promise<UserDirectoryEntry[]> {
  return request<UserDirectoryEntry[]>("/api/users");
}

export async function updateUserRole(
  userId: string,
  role: string
): Promise<UserDirectoryEntry> {
  return request<UserDirectoryEntry>(`/api/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}
