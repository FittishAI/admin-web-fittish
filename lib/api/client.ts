import { API_URL } from "@/constants";
import { useAuthStore } from "@/lib/store/authSlice";

type ApiRequestInit = Omit<RequestInit, "body"> & {
  json?: unknown;
  body?: BodyInit | null;
};

let isRefreshing = false;
let waiters: Array<(token: string | null) => void> = [];

function releaseWaiters(token: string | null): void {
  const pending = waiters;
  waiters = [];
  for (const resolve of pending) resolve(token);
}

async function requestNewTokens(): Promise<string | null> {
  const { refreshToken, deviceId, setTokens } = useAuthStore.getState();

  if (!refreshToken || !deviceId) return null;

  let response: Response;
  try {
    response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken, deviceId }),
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  try {
    const data = await response.json();
    const access: unknown = data?.accessToken ?? data?.access_token;
    const refresh: unknown = data?.refreshToken ?? data?.refresh_token;

    if (typeof access !== "string" || typeof refresh !== "string") return null;

    setTokens(access, refresh);
    return access;
  } catch {
    return null;
  }
}

function browserTimezone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

function buildRequest(path: string, init: ApiRequestInit, token: string | null): Promise<Response> {
  const { json, headers, ...rest } = init;
  const timezone = browserTimezone();

  return fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(timezone ? { "x-timezone": timezone } : {}),
      ...(headers ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
  });
}

export async function apiFetch(path: string, init: ApiRequestInit = {}): Promise<Response> {
  const response = await buildRequest(path, init, useAuthStore.getState().token);

  if (response.status !== 401) return response;

  if (isRefreshing) {
    const token = await new Promise<string | null>((resolve) => waiters.push(resolve));
    if (!token) return response;
    return buildRequest(path, init, token);
  }

  isRefreshing = true;
  try {
    const token = await requestNewTokens();
    releaseWaiters(token);

    if (!token) {
      useAuthStore.getState().logout();
      return response;
    }

    return await buildRequest(path, init, token);
  } finally {
    isRefreshing = false;
  }
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function extractErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json();
    const message: unknown = data?.message ?? data?.error;
    if (typeof message === "string") return message;
    if (Array.isArray(message) && typeof message[0] === "string") return message[0];
  } catch {
  }
  return fallback;
}

export async function apiJson<T>(
  path: string,
  init: ApiRequestInit = {},
  fallbackError = "Request failed"
): Promise<T> {
  const response = await apiFetch(path, init);

  if (!response.ok) {
    throw new ApiError(await extractErrorMessage(response, fallbackError), response.status);
  }

  if (response.status === 204) return undefined as T;

  try {
    return (await response.json()) as T;
  } catch {
    return undefined as T;
  }
}
