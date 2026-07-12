const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

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

export type LoginInput = { email: string; password: string };
export type LoginResult =
  | { user: unknown; mustChangePassword: false }
  | { mustChangePassword: true };

export async function login(input: LoginInput): Promise<LoginResult> {
  return request<LoginResult>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function logout(): Promise<void> {
  await request("/api/auth/logout", { method: "POST" });
}

export type RegisterInput = {
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
};

export async function registerDriver(input: RegisterInput): Promise<unknown> {
  return request("/api/auth/register/driver", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function registerDispatcher(
  input: RegisterInput
): Promise<unknown> {
  return request("/api/auth/register/dispatcher", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function verifyEmail(token: string): Promise<unknown> {
  return request(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
}

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export async function changePassword(
  input: ChangePasswordInput
): Promise<unknown> {
  return request("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  must_change_password: boolean;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export async function getMe(): Promise<AuthUser> {
  return request<AuthUser>("/api/auth/me");
}
