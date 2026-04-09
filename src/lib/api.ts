import type { AuthUser } from "@/src/types/domain";

const resolveApiBaseUrl = (): string => {
  const backendOrigin =
    process.env.NEXT_PUBLIC_BACKEND_ORIGIN?.trim() || "http://localhost:4700";
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!configured) return `${backendOrigin}/api/v1`;
  if (configured.startsWith("http://") || configured.startsWith("https://")) {
    return configured.replace(/\/$/, "");
  }
  const normalizedPath = configured.startsWith("/")
    ? configured
    : `/${configured}`;
  return `${backendOrigin}${normalizedPath}`.replace(/\/$/, "");
};

const API_BASE_URL = resolveApiBaseUrl();

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
};

export const apiFetch = async <T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const raw = await response.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    data = { message: raw || "Non-JSON response from API" };
  }

  if (!response.ok) {
    throw new Error(data?.message ?? "Request failed");
  }
  return data as T;
};

export const persistToken = (token: string) => {
  if (typeof window === "undefined") return;
  if (!token) {
    localStorage.removeItem("sportsbook_token");
    document.cookie =
      "sportsbook_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    return;
  }
  localStorage.setItem("sportsbook_token", token);
  document.cookie = `sportsbook_token=${encodeURIComponent(token)}; Path=/; SameSite=Lax`;
};

export const readToken = (): string => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("sportsbook_token") ?? "";
};

export const persistAuthUser = (user: AuthUser | null) => {
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem("sportsbook_user");
    document.cookie =
      "sportsbook_role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    return;
  }
  localStorage.setItem("sportsbook_user", JSON.stringify(user));
  document.cookie = `sportsbook_role=${user.role}; Path=/; SameSite=Lax`;
};

export const readAuthUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("sportsbook_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};
