const TOKEN_KEY = "af_access";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

type ApiResult<T> = { success: true; data: T; message?: string } | { success: false; error: { code: string; message: string } };

async function refreshAccess() {
  const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
  const json = (await res.json()) as ApiResult<{ accessToken: string }>;
  if (json.success) {
    setToken(json.data.accessToken);
    return json.data.accessToken;
  }
  setToken(null);
  return null;
}

export async function api<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  const res = await fetch(path, { ...init, headers, credentials: "include" });
  if (res.status === 401 && retry && !path.includes("/auth/login") && !path.includes("/auth/refresh")) {
    const next = await refreshAccess();
    if (next) return api<T>(path, init, false);
  }
  const json = (await res.json()) as ApiResult<T>;
  if (!json.success) {
    const err = new Error(json.error?.message || "Request failed") as Error & { code?: string; status?: number };
    err.code = json.error?.code;
    err.status = res.status;
    throw err;
  }
  return json.data;
}

export const AuthApi = {
  signup: (body: object) => api<{ id: string; email: string; requiresVerification: boolean }>("/api/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  verifyOtp: (email: string, otp: string) => api<{ accessToken: string }>("/api/auth/verify-otp", { method: "POST", body: JSON.stringify({ email, otp }) }),
  resend: (email: string) => api<{ sent: boolean }>("/api/auth/resend-otp", { method: "POST", body: JSON.stringify({ email }) }),
  login: (email: string, password: string) =>
    api<{ accessToken: string; user: User }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => api<User>("/api/auth/me"),
  logout: () => api("/api/auth/logout", { method: "POST" }),
  forgot: (email: string) => api("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  reset: (token: string, password: string) => api("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) }),
  language: (preferredLanguage: string) => api("/api/auth/language", { method: "PATCH", body: JSON.stringify({ preferredLanguage }) }),
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "FARMER" | "ADMIN";
  preferredLanguage: string;
  phone?: string;
};

export const CatalogApi = {
  crops: () => api<Named[]>("/api/catalog/crops"),
  soils: () => api<Named[]>("/api/catalog/soil-types"),
  regions: () => api<Named[]>("/api/catalog/regions"),
  stages: (cropId?: string) => api<Named[]>(`/api/catalog/growth-stages${cropId ? `?cropId=${cropId}` : ""}`),
  suggestRegion: (lat: number, lon: number) =>
    api<{ suggestion: { name: string } | null; region: Named | null }>(`/api/catalog/suggest-region?lat=${lat}&lon=${lon}`),
  reverseGeocode: (lat: number, lon: number) =>
    api<{ locationName: string | null }>(`/api/catalog/reverse-geocode?lat=${lat}&lon=${lon}`),
};

export type Named = { id: string; name: string; nameLocal?: string | null; category?: string; statesCovered?: string };

export type ForecastDay = {
  date: string;
  rainfallMm: number;
  tempMaxC: number;
  tempMinC: number;
};

export const FieldsApi = {
  list: () => api<FieldCard[]>("/api/fields"),
  get: (id: string) => api<FieldDetail>(`/api/fields/${id}`),
  create: (body: object) => api("/api/fields", { method: "POST", body: JSON.stringify(body) }),
  newCycle: (id: string, body: object) => api(`/api/fields/${id}/new-crop-cycle`, { method: "POST", body: JSON.stringify(body) }),
  archive: (id: string) => api(`/api/fields/${id}/archive`, { method: "PATCH" }),
};

export type CropCycle = {
  id: string;
  status: string;
  startDate: string;
  crop: Named;
  soil: Named;
  region: Named;
};

export type FieldCard = {
  id: string;
  name: string;
  advisoryBadge: string;
  activeCycle?: CropCycle | null;
  cropCycles: CropCycle[];
};

export type FieldDetail = FieldCard & { cropCycles: CropCycle[] };

export const SuitabilityApi = {
  check: (body: object) => api<{ is_suitable: boolean; confidence: number; reasoning: string; alternative_crops?: { crop_name: string; why_suitable: string }[] }>("/api/suitability/check", { method: "POST", body: JSON.stringify(body) }),
};

export const IrrigationApi = {
  weather: (lat: number, lon: number) =>
    api<{
      available: boolean;
      current?: { temperatureC: number; humidityPct: number };
      forecast?: ForecastDay[];
      locationName?: string;
      warning?: string;
    }>(`/api/irrigation/weather?lat=${lat}&lon=${lon}`),
  recommend: (body: object) => api<Record<string, unknown>>("/api/irrigation/recommend", { method: "POST", body: JSON.stringify(body) }),
};

export const DiseaseApi = {
  scan: (cropCycleId: string, file: File) => {
    const fd = new FormData();
    fd.append("cropCycleId", cropCycleId);
    fd.append("image", file);
    return api<Record<string, unknown>>("/api/disease/scan", { method: "POST", body: fd });
  },
  imageUrl: (scanId: string) => `/api/disease/images/${scanId}`,
};

export const HistoryApi = {
  list: (qs: string) => api<unknown[]>(`/api/history${qs}`),
};

export const FeedbackApi = {
  send: (body: object) => api("/api/feedback", { method: "POST", body: JSON.stringify(body) }),
};

export const AdminApi = {
  users: () => api<unknown[]>("/api/admin/users"),
  setUser: (id: string, accountStatus: string) => api(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify({ accountStatus }) }),
  analytics: () => api<Record<string, unknown>>("/api/admin/analytics"),
  logs: (flagged = false) => api<unknown[]>(`/api/admin/llm-logs${flagged ? "?flagged=true" : ""}`),
  crops: () => api<Named[]>("/api/admin/crops"),
  createCrop: (body: object) => api("/api/admin/crops", { method: "POST", body: JSON.stringify(body) }),
  soils: () => api<Named[]>("/api/admin/soil-types"),
  regions: () => api<Named[]>("/api/admin/regions"),
  knowledge: () => api<unknown[]>("/api/admin/knowledge"),
  createKnowledge: (body: object) => api("/api/admin/knowledge", { method: "POST", body: JSON.stringify(body) }),
};
