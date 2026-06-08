const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: { _id?: string; name: string; description?: string; permissions?: string[] } | string;
  active?: boolean;
};

export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  pagination?: { page: number; limit: number; total: number; pages: number };
};

export type DashboardResponse = {
  cards: Record<string, number>;
  charts: {
    toolStatusDistribution: Array<{ _id: string; count: number }>;
    sparePartsStockLevels: Array<{ _id: string; count: number }>;
    monthlyMaintenanceActivities: Array<{ _id: number; count: number }>;
    inventoryGrowth: Array<{ _id: number; count: number }>;
  };
};

const authHeaders = (token?: string) => ({
  Authorization: token ? `Bearer ${token}` : '',
});

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }
  return payload;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<AuthSession>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: (token: string) => request('/auth/logout', { method: 'POST' }, token),
  me: (token: string) => request<AuthUser>('/auth/me', { method: 'GET' }, token),
  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    request<AuthSession>('/auth/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }, token),
  forgotPassword: (email: string) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (email: string, tokenValue: string, newPassword: string) =>
    request<AuthSession>('/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, token: tokenValue, newPassword }) }),
};

export const dashboardApi = {
  get: (token: string) => request<DashboardResponse>('/dashboard', { method: 'GET' }, token),
};

export const resourceApi = {
  list: <T,>(token: string, endpoint: string, params: Record<string, string | number | undefined>) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') search.set(key, String(value));
    });
    return request<T[]>(`/${endpoint}?${search.toString()}`, { method: 'GET' }, token);
  },
  one: <T,>(token: string, endpoint: string, id: string) => request<T>(`/${endpoint}/${id}`, { method: 'GET' }, token),
  create: <T,>(token: string, endpoint: string, body: FormData | Record<string, unknown>) =>
    request<T>(`/${endpoint}`, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }, token),
  update: <T,>(token: string, endpoint: string, id: string, body: FormData | Record<string, unknown>) =>
    request<T>(`/${endpoint}/${id}`, { method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }, token),
  remove: (token: string, endpoint: string, id: string) => request(`/${endpoint}/${id}`, { method: 'DELETE' }, token),
};

export const authStorage = {
  get(): AuthSession | null {
    try {
      const raw = localStorage.getItem('ulss_admin_auth');
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  },
  set(session: AuthSession) {
    localStorage.setItem('ulss_admin_auth', JSON.stringify(session));
  },
  clear() {
    localStorage.removeItem('ulss_admin_auth');
  },
};
