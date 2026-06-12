// ─── Base ────────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL ?? 'https://inventorymate.vercel.app/api';
// ─── Shared Types ─────────────────────────────────────────────────────────────

export type Role = {
  _id: string;
  name: 'SUPER_ADMIN' | 'INVENTORY_MANAGER' | 'WORKSHOP_MANAGER';
  description: string;
  permissions: string[];
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: Role | string;
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
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

// Matches dashboardController.js response exactly
export type DashboardData = {
  cards: {
    totalTools: number;
    availableTools: number;
    reservedTools: number;
    inUseTools: number;
    maintenanceRequiredTools: number;
    totalSpareParts: number;
    lowStockParts: number;
    outOfStockParts: number;
    totalVehicles: number;
    activeTechnicians: number;
    pendingMaintenance: number;
    overdueMaintenance: number;
    inventoryValue: number;
  };
  charts: {
    // countByStatus(Tool)
    toolStatusDistribution: Array<{ _id: string; count: number }>;
    // countByStatus(SparePart)
    sparePartStatusDistribution: Array<{ _id: string; count: number }>;
    // grouped by $month of serviceDate
    monthlyMaintenanceActivities: Array<{ _id: number; count: number }>;
    // grouped by $month of createdAt
    inventoryGrowth: Array<{ _id: number; count: number }>;
  };
};

// ─── Resource Models ──────────────────────────────────────────────────────────

export type Warehouse = {
  _id: string;
  warehouseCode: string;
  name: string;
  location: string;
  manager?: AuthUser | string;
  capacity?: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
};

export type Supplier = {
  _id: string;
  supplierCode: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
};

export type SparePart = {
  _id: string;
  partNumber: string;
  partName: string;
  description?: string;
  category: string;
  subCategory?: string;
  brand?: string;
  oemNumber?: string;
  barcode?: string;
  compatibleVehicles?: Array<{
    make?: string;
    model?: string;
    yearFrom?: number;
    yearTo?: number;
  }>;
  warehouse?: Warehouse | string;
  supplier?: Supplier | string;
  rackLocation?: string;
  binLocation?: string;
  quantity: number;
  reservedQuantity: number;
  reorderLevel: number;
  minimumQuantity: number;
  unitCost: number;
  sellingPrice: number;
  purchaseDate?: string;
  lastRestockedDate?: string;
  warrantyPeriod?: string;
  partCondition: 'New' | 'Used' | 'Refurbished';
  image?: string;
  notes?: string;
  status: 'In Stock' | 'Low Stock' | 'On Order' | 'Out Of Stock';
  createdAt: string;
  updatedAt: string;
};

export type Tool = {
  _id: string;
  toolId: string;
  toolName: string;
  toolType?: string;
  category?: string;
  brand?: string;
  serialNumber?: string;
  qrCode?: string;
  warehouse?: Warehouse | string;
  assignedTechnician?: Technician | string;
  purchaseDate?: string;
  purchaseCost?: number;
  currentValue?: number;
  warrantyExpiry?: string;
  usageHours?: number;
  location?: string;
  condition: 'New' | 'Good' | 'Fair' | 'Damaged';
  status: 'Available' | 'In Use' | 'Reserved' | 'Maintenance Required' | 'Out Of Service';
  notes?: string;
  toolImage?: string;
  history?: Array<{
    action?: string;
    note?: string;
    performedBy?: string;
    date?: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type Technician = {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  department?: string;
  skills?: string[];
  certifications?: string[];
  hireDate?: string;
  address?: string;
  emergencyContact?: string;
  assignedTools?: Tool[] | string[];
  assignedVehicles?: Vehicle[] | string[];
  status: 'Active' | 'Inactive' | 'On Leave';
  createdAt: string;
  updatedAt: string;
};

export type Vehicle = {
  _id: string;
  vehicleId: string;
  make: string;
  model: string;
  year?: number;
  vehicleType?: 'Car' | 'SUV' | 'Van' | 'Truck' | 'Bus' | 'Motorcycle';
  vinNumber?: string;
  chassisNumber?: string;
  engineNumber?: string;
  registrationNumber?: string;
  fuelType?: string;
  transmission?: string;
  mileage?: number;
  color?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  warehouse?: Warehouse | string;
  insuranceExpiry?: string;
  licenseExpiry?: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Damaged';
  status: 'Available' | 'Reserved' | 'Under Repair' | 'Sold';
  images?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type MaintenanceRecord = {
  _id: string;
  maintenanceId: string;
  // One of these will be populated — both optional per schema
  toolId?: Tool | string;
  vehicleId?: Vehicle | string;
  technician: Technician | string;
  maintenanceType?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  serviceDate?: string;
  nextServiceDate?: string;
  completedDate?: string;
  description?: string;
  laborHours?: number;
  cost: number;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  remarks?: string;
  createdAt: string;
  updatedAt: string;
};

export type StockTransaction = {
  _id: string;
  transactionNumber: string;
  sparePart: SparePart | string;
  warehouse: Warehouse | string;
  transactionType: 'IN' | 'OUT' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'ADJUSTMENT' | 'RESERVED' | 'RELEASED';
  quantity: number;
  balanceAfter: number;
  unitCost?: number;
  referenceNumber?: string;
  notes?: string;
  performedBy: AuthUser | string;
  createdAt: string;
  updatedAt: string;
};

export type PurchaseOrder = {
  _id: string;
  poNumber: string;
  supplier: Supplier | string;
  warehouse: Warehouse | string;
  items: Array<{
    sparePart: SparePart | string;
    quantity: number;
    unitCost: number;
    total: number;
  }>;
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  expectedDeliveryDate?: string;
  deliveredDate?: string;
  status: 'Draft' | 'Pending' | 'Approved' | 'Ordered' | 'Partially Received' | 'Received' | 'Cancelled';
  remarks?: string;
  createdBy: AuthUser | string;
  createdAt: string;
  updatedAt: string;
};

export type Notification = {
  _id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  recipient?: AuthUser | string;
  relatedModule?: string;
  relatedRecordId?: string;
  createdAt: string;
  updatedAt: string;
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers ?? {});

  // Don't set Content-Type for FormData — browser sets it with boundary
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Guard against empty body (e.g. 204 No Content)
  const text = await response.text();
  const payload = text ? (JSON.parse(text) as ApiResponse<T>) : ({} as ApiResponse<T>);

  if (!response.ok) {
    throw new Error((payload as any).message || `Request failed (${response.status})`);
  }

  return payload;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
// Mirrors authController.js + authRoutes.js (with getRoles fix)

export const authApi = {
login: (email: string, password: string) =>
    request<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: (token: string) =>
    request<void>('/auth/logout', { method: 'POST' }, token),

  me: (token: string) =>
    request<AuthUser>('/auth/me', { method: 'GET' }, token),

  changePassword: (token: string, currentPassword: string, newPassword: string) =>
    request<void>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }, token),

  forgotPassword: (email: string) =>
    request<void>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  // Backend expects: { token, newPassword } — no email field
  resetPassword: (resetToken: string, newPassword: string) =>
    request<void>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token: resetToken, newPassword }),
    }),

  // GET /auth/roles — SUPER_ADMIN only (renamed from bootstrapAdmin → getRoles)
  getRoles: (token: string) =>
    request<Role[]>('/auth/roles', { method: 'GET' }, token),

  // POST /auth/create-admin — no auth required (bootstrap only)
  createAdmin: (name: string, email: string, password: string, roleId: string) =>
    request<AuthUser>('/auth/create-admin', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role: roleId }),
    }),

  // POST /api/users — SUPER_ADMIN only (creates any user)
  createUser: (token: string, payload: { name: string; email: string; password: string; role: string; phone?: string }) =>
    request<AuthUser>('/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token),
};

// ─── Dashboard API ────────────────────────────────────────────────────────────

export const dashboardApi = {
  get: (token: string) =>
    request<DashboardData>('/dashboard', { method: 'GET' }, token),
};

// ─── Generic resource API ─────────────────────────────────────────────────────
// Supports all CRUD-factory routes: tools, spare-parts, vehicles, technicians, maintenance

export type ListParams = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  [key: string]: string | number | undefined;
};

export const resourceApi = {
  list: <T,>(token: string, endpoint: string, params: ListParams = {}) => {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        search.set(key, String(value));
      }
    });
    const qs = search.toString();
    return request<T[]>(`/${endpoint}${qs ? `?${qs}` : ''}`, { method: 'GET' }, token);
  },

  one: <T,>(token: string, endpoint: string, id: string) =>
    request<T>(`/${endpoint}/${id}`, { method: 'GET' }, token),

  create: <T,>(token: string, endpoint: string, body: FormData | Record<string, unknown>) =>
    request<T>(`/${endpoint}`, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }, token),

  update: <T,>(token: string, endpoint: string, id: string, body: FormData | Record<string, unknown>) =>
    request<T>(`/${endpoint}/${id}`, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }, token),

  remove: (token: string, endpoint: string, id: string) =>
    request<void>(`/${endpoint}/${id}`, { method: 'DELETE' }, token),
};

// ─── Typed convenience helpers ────────────────────────────────────────────────
// Use these in components instead of passing raw strings to resourceApi

export const toolsApi = {
  list: (token: string, params?: ListParams) => resourceApi.list<Tool>(token, 'tools', params),
  one: (token: string, id: string) => resourceApi.one<Tool>(token, 'tools', id),
  create: (token: string, body: FormData | Partial<Tool>) => resourceApi.create<Tool>(token, 'tools', body as any),
  update: (token: string, id: string, body: FormData | Partial<Tool>) => resourceApi.update<Tool>(token, 'tools', id, body as any),
  remove: (token: string, id: string) => resourceApi.remove(token, 'tools', id),
};

export const sparePartsApi = {
  list: (token: string, params?: ListParams) => resourceApi.list<SparePart>(token, 'spare-parts', params),
  one: (token: string, id: string) => resourceApi.one<SparePart>(token, 'spare-parts', id),
  create: (token: string, body: Partial<SparePart>) => resourceApi.create<SparePart>(token, 'spare-parts', body as any),
  update: (token: string, id: string, body: Partial<SparePart>) => resourceApi.update<SparePart>(token, 'spare-parts', id, body as any),
  remove: (token: string, id: string) => resourceApi.remove(token, 'spare-parts', id),
};

export const vehiclesApi = {
  list: (token: string, params?: ListParams) => resourceApi.list<Vehicle>(token, 'vehicles', params),
  one: (token: string, id: string) => resourceApi.one<Vehicle>(token, 'vehicles', id),
  create: (token: string, body: FormData | Partial<Vehicle>) => resourceApi.create<Vehicle>(token, 'vehicles', body as any),
  update: (token: string, id: string, body: FormData | Partial<Vehicle>) => resourceApi.update<Vehicle>(token, 'vehicles', id, body as any),
  remove: (token: string, id: string) => resourceApi.remove(token, 'vehicles', id),
};

export const techniciansApi = {
  list: (token: string, params?: ListParams) => resourceApi.list<Technician>(token, 'technicians', params),
  one: (token: string, id: string) => resourceApi.one<Technician>(token, 'technicians', id),
  create: (token: string, body: Partial<Technician>) => resourceApi.create<Technician>(token, 'technicians', body as any),
  update: (token: string, id: string, body: Partial<Technician>) => resourceApi.update<Technician>(token, 'technicians', id, body as any),
  remove: (token: string, id: string) => resourceApi.remove(token, 'technicians', id),
};

export const maintenanceApi = {
  list: (token: string, params?: ListParams) => resourceApi.list<MaintenanceRecord>(token, 'maintenance', params),
  one: (token: string, id: string) => resourceApi.one<MaintenanceRecord>(token, 'maintenance', id),
  create: (token: string, body: Partial<MaintenanceRecord>) => resourceApi.create<MaintenanceRecord>(token, 'maintenance', body as any),
  update: (token: string, id: string, body: Partial<MaintenanceRecord>) => resourceApi.update<MaintenanceRecord>(token, 'maintenance', id, body as any),
  remove: (token: string, id: string) => resourceApi.remove(token, 'maintenance', id),
};

export const suppliersApi = {
  list: (token: string, params?: ListParams) => resourceApi.list<Supplier>(token, 'suppliers', params),
  one: (token: string, id: string) => resourceApi.one<Supplier>(token, 'suppliers', id),
  create: (token: string, body: Partial<Supplier>) => resourceApi.create<Supplier>(token, 'suppliers', body as any),
  update: (token: string, id: string, body: Partial<Supplier>) => resourceApi.update<Supplier>(token, 'suppliers', id, body as any),
  remove: (token: string, id: string) => resourceApi.remove(token, 'suppliers', id),
};

export const warehousesApi = {
  list: (token: string, params?: ListParams) => resourceApi.list<Warehouse>(token, 'warehouses', params),
  one: (token: string, id: string) => resourceApi.one<Warehouse>(token, 'warehouses', id),
  create: (token: string, body: Partial<Warehouse>) => resourceApi.create<Warehouse>(token, 'warehouses', body as any),
  update: (token: string, id: string, body: Partial<Warehouse>) => resourceApi.update<Warehouse>(token, 'warehouses', id, body as any),
  remove: (token: string, id: string) => resourceApi.remove(token, 'warehouses', id),
};

export const purchaseOrdersApi = {
  list: (token: string, params?: ListParams) => resourceApi.list<PurchaseOrder>(token, 'purchase-orders', params),
  one: (token: string, id: string) => resourceApi.one<PurchaseOrder>(token, 'purchase-orders', id),
  create: (token: string, body: Partial<PurchaseOrder>) => resourceApi.create<PurchaseOrder>(token, 'purchase-orders', body as any),
  update: (token: string, id: string, body: Partial<PurchaseOrder>) => resourceApi.update<PurchaseOrder>(token, 'purchase-orders', id, body as any),
  remove: (token: string, id: string) => resourceApi.remove(token, 'purchase-orders', id),
};

export const stockTransactionsApi = {
  list: (token: string, params?: ListParams) => resourceApi.list<StockTransaction>(token, 'stock-transactions', params),
  one: (token: string, id: string) => resourceApi.one<StockTransaction>(token, 'stock-transactions', id),
  create: (token: string, body: Partial<StockTransaction>) => resourceApi.create<StockTransaction>(token, 'stock-transactions', body as any),
};

export const notificationsApi = {
  list: (token: string, params?: ListParams) => resourceApi.list<Notification>(token, 'notifications', params),
  markRead: (token: string, id: string) => resourceApi.update<Notification>(token, 'notifications', id, { isRead: true }),
};

// ─── Auth storage ─────────────────────────────────────────────────────────────
// Single canonical key — replaces the old split localStorage.setItem('accessToken') pattern

const STORAGE_KEY = 'ulss_admin_auth';

export const authStorage = {
  get(): AuthSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  },

  set(session: AuthSession): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    // Also clear old split keys if they were set by a previous version
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getToken(): string | null {
    return this.get()?.accessToken ?? null;
  },

  getUser(): AuthUser | null {
    return this.get()?.user ?? null;
  },
};