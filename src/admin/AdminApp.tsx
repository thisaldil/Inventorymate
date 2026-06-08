import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  BadgeCheck,
  Box,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleSlash,
  Database,
  Edit,
  Eye,
  FileImage,
  Filter,
  ImagePlus,
  LogOut,
  LockKeyhole,
  Menu,
  Package,
  Plus,
  Search,
  Settings,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Truck,
  Users,
  Wrench,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { authApi, authStorage, dashboardApi, resourceApi, type AuthSession, type AuthUser, type DashboardResponse } from './api';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  INVENTORY_MANAGER: 'Inventory Manager',
  WORKSHOP_MANAGER: 'Workshop Manager',
};

type ModuleKey = 'tools' | 'parts' | 'vehicles' | 'technicians' | 'maintenance';
type FieldKind = 'text' | 'number' | 'date' | 'textarea' | 'select' | 'file';

type FieldConfig = {
  key: string;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  options?: string[];
  multiple?: boolean;
  accept?: string;
  required?: boolean;
};

type ColumnConfig = {
  key: string;
  label: string;
  render?: (row: any) => JSX.Element | string | number;
};

type ResourceConfig = {
  key: ModuleKey;
  endpoint: string;
  title: string;
  description: string;
  icon: JSX.Element;
  searchPlaceholder: string;
  statusField?: string;
  statusOptions?: string[];
  fields: FieldConfig[];
  columns: ColumnConfig[];
  roles: string[];
  defaultSort?: string;
};

const STATUS_DOT: Record<string, string> = {
  Available: 'bg-emerald-500',
  Reserved: 'bg-amber-400',
  'In Use': 'bg-blue-500',
  'Maintenance Required': 'bg-red-500',
  'Out Of Service': 'bg-slate-500',
  'In Stock': 'bg-emerald-500',
  Limited: 'bg-amber-400',
  'On Order': 'bg-blue-500',
  'Out Of Stock': 'bg-red-500',
  Active: 'bg-emerald-500',
  Inactive: 'bg-slate-500',
  'On Leave': 'bg-amber-400',
  Pending: 'bg-amber-400',
  Completed: 'bg-emerald-500',
  Overdue: 'bg-red-500',
  Sold: 'bg-slate-500',
  'Under Repair': 'bg-red-500',
};

const STATUS_OPTIONS = {
  tools: ['Available', 'In Use', 'Reserved', 'Maintenance Required', 'Out Of Service'],
  parts: ['In Stock', 'Limited', 'On Order', 'Out Of Stock'],
  vehicles: ['Available', 'Reserved', 'Under Repair', 'Sold'],
  technicians: ['Active', 'Inactive', 'On Leave'],
  maintenance: ['Pending', 'Completed', 'Overdue'],
};

const RESOURCE_CONFIGS: Record<ModuleKey, ResourceConfig> = {
  tools: {
    key: 'tools',
    endpoint: 'tools',
    title: 'Tools Inventory',
    description: 'Search, assign, inspect, and maintain workshop tools.',
    icon: <Wrench className="text-ulss-gold" size={20} />,
    searchPlaceholder: 'Search by tool id, name, brand, serial number...',
    statusField: 'status',
    statusOptions: STATUS_OPTIONS.tools,
    roles: ['SUPER_ADMIN', 'INVENTORY_MANAGER', 'WORKSHOP_MANAGER'],
    defaultSort: '-createdAt',
    fields: [
      { key: 'toolId', label: 'Tool ID', kind: 'text', required: true },
      { key: 'toolName', label: 'Tool Name', kind: 'text', required: true },
      { key: 'category', label: 'Category', kind: 'text', required: true },
      { key: 'brand', label: 'Brand', kind: 'text' },
      { key: 'serialNumber', label: 'Serial Number', kind: 'text' },
      { key: 'status', label: 'Status', kind: 'select', options: STATUS_OPTIONS.tools, required: true },
      { key: 'assignedTechnician', label: 'Assigned Technician ID', kind: 'text', placeholder: 'Technician ObjectId' },
      { key: 'purchaseDate', label: 'Purchase Date', kind: 'date' },
      { key: 'lastServiceDate', label: 'Last Service Date', kind: 'date' },
      { key: 'nextServiceDate', label: 'Next Service Date', kind: 'date' },
      { key: 'toolImage', label: 'Tool Image', kind: 'file', accept: 'image/*' },
      { key: 'notes', label: 'Notes', kind: 'textarea' },
    ],
    columns: [
      { key: 'toolId', label: 'Tool ID' },
      { key: 'toolName', label: 'Tool Name' },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'Status' },
      { key: 'assignedTechnician', label: 'Assigned Technician', render: (row) => renderRelation(row.assignedTechnician) },
    ],
  },
  parts: {
    key: 'parts',
    endpoint: 'spare-parts',
    title: 'Spare Parts Inventory',
    description: 'Track stock, compatibility, supplier, and reorder levels.',
    icon: <Package className="text-ulss-gold" size={20} />,
    searchPlaceholder: 'Search by part number, part name, category, supplier...',
    statusField: 'status',
    statusOptions: STATUS_OPTIONS.parts,
    roles: ['SUPER_ADMIN', 'INVENTORY_MANAGER', 'WORKSHOP_MANAGER'],
    fields: [
      { key: 'partNumber', label: 'Part Number', kind: 'text', required: true },
      { key: 'partName', label: 'Part Name', kind: 'text', required: true },
      { key: 'category', label: 'Category', kind: 'text', required: true },
      { key: 'compatibleVehicleMake', label: 'Compatible Vehicle Make', kind: 'text' },
      { key: 'compatibleVehicleModel', label: 'Compatible Vehicle Model', kind: 'text' },
      { key: 'quantity', label: 'Quantity', kind: 'number', required: true },
      { key: 'minimumQuantity', label: 'Minimum Quantity', kind: 'number', required: true },
      { key: 'unitPrice', label: 'Unit Price', kind: 'number', required: true },
      { key: 'supplier', label: 'Supplier', kind: 'text' },
      { key: 'status', label: 'Status', kind: 'select', options: STATUS_OPTIONS.parts, required: true },
    ],
    columns: [
      { key: 'partNumber', label: 'Part Number' },
      { key: 'partName', label: 'Part Name' },
      { key: 'quantity', label: 'Qty' },
      { key: 'minimumQuantity', label: 'Min Qty' },
      { key: 'status', label: 'Status' },
    ],
  },
  vehicles: {
    key: 'vehicles',
    endpoint: 'vehicles',
    title: 'Vehicle Inventory',
    description: 'Manage fleet records, images, ownership, and status.',
    icon: <Truck className="text-ulss-gold" size={20} />,
    searchPlaceholder: 'Search by vehicle ID, make, model, reg number...',
    statusField: 'status',
    statusOptions: STATUS_OPTIONS.vehicles,
    roles: ['SUPER_ADMIN', 'INVENTORY_MANAGER', 'WORKSHOP_MANAGER'],
    fields: [
      { key: 'vehicleId', label: 'Vehicle ID', kind: 'text', required: true },
      { key: 'make', label: 'Make', kind: 'text', required: true },
      { key: 'model', label: 'Model', kind: 'text', required: true },
      { key: 'year', label: 'Year', kind: 'number', required: true },
      { key: 'chassisNumber', label: 'Chassis Number', kind: 'text', required: true },
      { key: 'registrationNumber', label: 'Registration Number', kind: 'text', required: true },
      { key: 'color', label: 'Color', kind: 'text' },
      { key: 'status', label: 'Status', kind: 'select', options: STATUS_OPTIONS.vehicles, required: true },
      { key: 'images', label: 'Vehicle Images', kind: 'file', accept: 'image/*', multiple: true },
      { key: 'notes', label: 'Notes', kind: 'textarea' },
    ],
    columns: [
      { key: 'vehicleId', label: 'Vehicle ID' },
      { key: 'make', label: 'Make' },
      { key: 'model', label: 'Model' },
      { key: 'registrationNumber', label: 'Registration' },
      { key: 'status', label: 'Status' },
    ],
  },
  technicians: {
    key: 'technicians',
    endpoint: 'technicians',
    title: 'Technicians',
    description: 'Maintain technician profiles and assignments.',
    icon: <Users className="text-ulss-gold" size={20} />,
    searchPlaceholder: 'Search by employee id, name, email, department...',
    statusField: 'status',
    statusOptions: STATUS_OPTIONS.technicians,
    roles: ['SUPER_ADMIN', 'INVENTORY_MANAGER', 'WORKSHOP_MANAGER'],
    fields: [
      { key: 'employeeId', label: 'Employee ID', kind: 'text', required: true },
      { key: 'name', label: 'Name', kind: 'text', required: true },
      { key: 'email', label: 'Email', kind: 'text', required: true },
      { key: 'phone', label: 'Phone', kind: 'text' },
      { key: 'department', label: 'Department', kind: 'text' },
      { key: 'status', label: 'Status', kind: 'select', options: STATUS_OPTIONS.technicians, required: true },
    ],
    columns: [
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'name', label: 'Name' },
      { key: 'department', label: 'Department' },
      { key: 'status', label: 'Status' },
    ],
  },
  maintenance: {
    key: 'maintenance',
    endpoint: 'maintenance',
    title: 'Maintenance Records',
    description: 'Create service records, schedules, and maintenance history.',
    icon: <CalendarClock className="text-ulss-gold" size={20} />,
    searchPlaceholder: 'Search by maintenance id or description...',
    statusField: 'status',
    statusOptions: STATUS_OPTIONS.maintenance,
    roles: ['SUPER_ADMIN', 'WORKSHOP_MANAGER'],
    fields: [
      { key: 'maintenanceId', label: 'Maintenance ID', kind: 'text', required: true },
      { key: 'toolId', label: 'Tool ID', kind: 'text', required: true, placeholder: 'Tool ObjectId' },
      { key: 'technician', label: 'Technician ID', kind: 'text', required: true, placeholder: 'Technician ObjectId' },
      { key: 'serviceDate', label: 'Service Date', kind: 'date', required: true },
      { key: 'nextServiceDate', label: 'Next Service Date', kind: 'date', required: true },
      { key: 'description', label: 'Description', kind: 'textarea', required: true },
      { key: 'cost', label: 'Cost', kind: 'number', required: true },
      { key: 'status', label: 'Status', kind: 'select', options: STATUS_OPTIONS.maintenance, required: true },
    ],
    columns: [
      { key: 'maintenanceId', label: 'Maintenance ID' },
      { key: 'toolId', label: 'Tool', render: (row) => renderRelation(row.toolId) },
      { key: 'technician', label: 'Technician', render: (row) => renderRelation(row.technician) },
      { key: 'serviceDate', label: 'Service Date', render: (row) => formatDate(row.serviceDate) },
      { key: 'status', label: 'Status' },
    ],
  },
};

function renderRelation(value: any) {
  if (!value) return '-';
  if (typeof value === 'string') return value.slice(-8);
  return value.toolName || value.partName || value.name || value.employeeId || value.maintenanceId || value._id || '-';
}

function formatDate(value: any) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
}

function formatCell(value: any) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'object') return renderRelation(value);
  return String(value);
}

function getToken() {
  return authStorage.get()?.accessToken || '';
}

function getUser() {
  return authStorage.get()?.user || null;
}

function AppBadge({ text }: { text: string }) {
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border border-white/10 bg-white/5 text-white/70`}>{text}</span>;
}

function StatCard({ icon, title, value, tone = 'gold' }: { icon: JSX.Element; title: string; value: string | number; tone?: 'gold' | 'green' | 'red' | 'blue' }) {
  const tones = {
    gold: 'from-ulss-gold/15 to-white/5',
    green: 'from-emerald-500/15 to-white/5',
    red: 'from-red-500/15 to-white/5',
    blue: 'from-blue-500/15 to-white/5',
  } as const;
  return (
    <div className={`rounded-2xl border border-white/10 bg-gradient-to-br ${tones[tone]} p-5 shadow-lg shadow-black/20`}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">{icon}</div>
        <Sparkles className="text-ulss-gold/60" size={16} />
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/55">{title}</div>
    </div>
  );
}

function AuthScreen({ onAuthenticated }: { onAuthenticated: (session: AuthSession) => void }) {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const initialMode = window.location.pathname.includes('reset-password') || params.get('token') ? 'reset' : 'login';
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState(params.get('email') || '');
  const [token, setToken] = useState(params.get('token') || '');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const response = await authApi.login(email, password);
      authStorage.set(response.data);
      onAuthenticated(response.data);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      const response = await authApi.forgotPassword(email);
      setSuccess(response.message || 'Reset link created. Check backend console.');
    } catch (err: any) {
      setError(err.message || 'Unable to send reset link');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const response = await authApi.resetPassword(email, token, newPassword);
      authStorage.set(response.data);
      onAuthenticated(response.data);
    } catch (err: any) {
      setError(err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const session = authStorage.get();
      if (!session) throw new Error('Not authenticated');
      const response = await authApi.changePassword(session.accessToken, currentPassword, newPassword);
      authStorage.set(response.data);
      onAuthenticated(response.data);
    } catch (err: any) {
      setError(err.message || 'Password update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6 py-12">
      <div className="max-w-6xl w-full grid md:grid-cols-[1.1fr_0.9fr] gap-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.18),transparent_35%),linear-gradient(135deg,#0a0a0a,#111111)] p-8 md:p-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-ulss-gold/20 bg-ulss-gold/10 text-ulss-gold text-xs uppercase tracking-[0.35em] mb-8">
            <Shield size={14} /> Secure Admin Access
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black leading-tight mb-6">
            ULSS Inventories
            <span className="block text-white/60">Admin Control Center</span>
          </h1>
          <p className="text-white/60 max-w-xl text-lg leading-relaxed mb-10">
            Manage tools, spare parts, vehicles, technicians, and maintenance records with JWT-secured role-based access.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-sm text-white/50 mb-1">Roles</div><div className="font-semibold">Super Admin, Inventory Manager, Workshop Manager</div></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-sm text-white/50 mb-1">Security</div><div className="font-semibold">JWT, bcrypt, Helmet, CORS, rate limiting</div></div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0d0d0d] shadow-2xl shadow-black/30 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold">{mode === 'login' ? 'Sign In' : mode === 'forgot' ? 'Forgot Password' : 'Reset Password'}</h2>
              <p className="text-white/50 text-sm">Use your admin credentials to continue.</p>
            </div>
            <AppBadge text={mode.toUpperCase()} />
          </div>

          {error && <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200 px-4 py-3 text-sm">{error}</div>}
          {success && <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-200 px-4 py-3 text-sm">{success}</div>}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-white/45">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-ulss-gold" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-white/45">Password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-ulss-gold" />
              </div>
              <button disabled={loading} className="w-full rounded-xl bg-ulss-gold px-4 py-3 font-semibold text-ulss-black hover:bg-white transition-colors disabled:opacity-60">{loading ? 'Signing in...' : 'Login'}</button>
              <div className="flex items-center justify-between text-sm text-white/55">
                <button type="button" onClick={() => setMode('forgot')} className="hover:text-white">Forgot password?</button>
                <button type="button" onClick={() => setMode('reset')} className="hover:text-white">Have reset token?</button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-white/45">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-ulss-gold" />
              </div>
              <button disabled={loading} className="w-full rounded-xl bg-ulss-gold px-4 py-3 font-semibold text-ulss-black hover:bg-white transition-colors disabled:opacity-60">{loading ? 'Sending...' : 'Send Reset Link'}</button>
              <button type="button" onClick={() => setMode('login')} className="w-full rounded-xl border border-white/10 px-4 py-3 font-semibold text-white hover:bg-white/5">Back to Login</button>
            </form>
          )}

          {mode === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-white/45">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-ulss-gold" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-white/45">Reset Token</label>
                <input value={token} onChange={(e) => setToken(e.target.value)} required className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-ulss-gold" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-white/45">New Password</label>
                <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" required className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-ulss-gold" />
              </div>
              <button disabled={loading} className="w-full rounded-xl bg-ulss-gold px-4 py-3 font-semibold text-ulss-black hover:bg-white transition-colors disabled:opacity-60">{loading ? 'Resetting...' : 'Reset Password'}</button>
              <button type="button" onClick={() => setMode('login')} className="w-full rounded-xl border border-white/10 px-4 py-3 font-semibold text-white hover:bg-white/5">Back to Login</button>
            </form>
          )}

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/55 leading-relaxed">
            <div className="flex items-center gap-2 text-white mb-2"><LockKeyhole size={16} className="text-ulss-gold" /> Change password</div>
            <form onSubmit={handleChangePassword} className="grid gap-3">
              <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" placeholder="Current password" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-white outline-none focus:border-ulss-gold" />
              <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="New password" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-white outline-none focus:border-ulss-gold" />
              <button disabled={loading} className="rounded-xl border border-ulss-gold/20 bg-ulss-gold/10 px-4 py-2.5 font-semibold text-ulss-gold hover:bg-ulss-gold hover:text-ulss-black transition-colors disabled:opacity-60">Update Password</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardView({ data }: { data: DashboardResponse | null }) {
  const cards = data?.cards || {};
  const toolStatus = (data?.charts.toolStatusDistribution || []).map((item) => ({ name: item._id, value: item.count }));
  const partsStock = (data?.charts.sparePartsStockLevels || []).map((item) => ({ name: item._id, value: item.count }));
  const maintenance = (data?.charts.monthlyMaintenanceActivities || []).map((item) => ({ month: `M${item._id}`, value: item.count }));
  const growth = (data?.charts.inventoryGrowth || []).map((item) => ({ month: `M${item._id}`, value: item.count }));
  const pieColors = ['#D4AF37', '#4ade80', '#60a5fa', '#f97316', '#ef4444', '#a855f7'];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">Executive Dashboard</h2>
        <p className="text-white/55">Live inventory performance and operational activity overview.</p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={<Wrench className="text-ulss-gold" />} title="Total Tools" value={cards.totalTools || 0} />
        <StatCard icon={<BadgeCheck className="text-emerald-400" />} title="Available Tools" value={cards.availableTools || 0} tone="green" />
        <StatCard icon={<CircleSlash className="text-amber-400" />} title="Reserved Tools" value={cards.reservedTools || 0} tone="blue" />
        <StatCard icon={<AlertTriangle className="text-red-400" />} title="Maintenance Required" value={cards.maintenanceRequiredTools || 0} tone="red" />
        <StatCard icon={<Package className="text-ulss-gold" />} title="Total Spare Parts" value={cards.totalSpareParts || 0} />
        <StatCard icon={<Truck className="text-ulss-gold" />} title="Total Vehicles" value={cards.totalVehicles || 0} />
        <StatCard icon={<Users className="text-ulss-gold" />} title="Active Technicians" value={cards.activeTechnicians || 0} />
        <StatCard icon={<SlidersHorizontal className="text-ulss-gold" />} title="Low Stock Parts" value={cards.lowStockParts || 0} />
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <ChartCard title="Tool Status Distribution">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={toolStatus} dataKey="value" nameKey="name" outerRadius={110} innerRadius={60} paddingAngle={2}>
                {toolStatus.map((_, index) => <Cell key={index} fill={pieColors[index % pieColors.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Spare Parts Stock Levels">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={partsStock}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="name" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Bar dataKey="value" fill="#D4AF37" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Maintenance Activities">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={maintenance}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="month" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Inventory Growth">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={growth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="month" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-xl font-bold text-white">{title}</h3>
        <BarChart3 className="text-ulss-gold" size={18} />
      </div>
      {children}
    </div>
  );
}

function AdminShell({ session, onLogout, dashboard, onRefreshDashboard, activeModule, setActiveModule }: {
  session: AuthSession;
  onLogout: () => void;
  dashboard: DashboardResponse | null;
  onRefreshDashboard: () => void;
  activeModule: ModuleKey | 'dashboard';
  setActiveModule: (module: ModuleKey | 'dashboard') => void;
}) {
  const userRole = typeof session.user.role === 'string' ? session.user.role : session.user.role?.name || 'SUPER_ADMIN';
  const availableModules = Object.values(RESOURCE_CONFIGS).filter((config) => config.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-80 flex-col border-r border-white/10 bg-[#070707] p-6 sticky top-0 h-screen">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-ulss-gold/20 bg-ulss-gold/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-ulss-gold mb-4">
              <Shield size={14} /> ULSS Admin
            </div>
            <h1 className="text-2xl font-display font-black leading-tight">Inventory Control</h1>
            <p className="text-sm text-white/45 mt-2">Role: {ROLE_LABELS[userRole] || userRole}</p>
          </div>

          <nav className="space-y-2">
            <SidebarButton active={activeModule === 'dashboard'} icon={<Database size={18} />} label="Dashboard" onClick={() => setActiveModule('dashboard')} />
            {availableModules.map((module) => (
              <SidebarButton key={module.key} active={activeModule === module.key} icon={module.icon} label={module.title} onClick={() => setActiveModule(module.key)} />
            ))}
            <SidebarButton active={activeModule === 'maintenance'} icon={<Settings size={18} />} label="Change Password" onClick={() => setActiveModule('maintenance')} />
          </nav>

          <div className="mt-auto pt-8 border-t border-white/10 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">Signed in as</div>
              <div className="mt-1 font-semibold">{session.user.name}</div>
              <div className="text-sm text-white/50">{session.user.email}</div>
            </div>
            <button onClick={onLogout} className="w-full rounded-2xl border border-white/10 px-4 py-3 font-semibold text-white hover:bg-white/5 inline-flex items-center justify-center gap-2">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </aside>

        <main className="flex-1">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#050505]/90 backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 md:px-8 py-4">
              <div>
                <div className="text-xs uppercase tracking-[0.35em] text-white/35 mb-2">ULSS Inventories</div>
                <div className="text-lg md:text-xl font-display font-bold">{activeModule === 'dashboard' ? 'Dashboard' : RESOURCE_CONFIGS[activeModule].title}</div>
              </div>
              <div className="flex items-center gap-3">
                <button className="hidden md:inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5" onClick={onRefreshDashboard}>
                  <Sparkles size={16} className="text-ulss-gold" /> Refresh
                </button>
                <button className="lg:hidden inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5">
                  <Menu size={16} /> Menu
                </button>
              </div>
            </div>
          </header>

          <div className="px-4 md:px-8 py-8">
            {activeModule === 'dashboard' ? <DashboardView data={dashboard} /> : activeModule === 'maintenance' ? <PasswordModule session={session} /> : <ResourceManager session={session} config={RESOURCE_CONFIGS[activeModule]} />}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarButton({ active, icon, label, onClick }: { active: boolean; icon: JSX.Element; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full rounded-2xl px-4 py-3 text-left transition-all flex items-center gap-3 ${active ? 'bg-ulss-gold text-ulss-black shadow-lg shadow-ulss-gold/10' : 'bg-transparent text-white/70 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/10'}`}>
      <span className={active ? 'text-ulss-black' : 'text-ulss-gold'}>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function PasswordModule({ session }: { session: AuthSession }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setStatus('');
    try {
      const response = await authApi.changePassword(session.accessToken, currentPassword, newPassword);
      authStorage.set(response.data);
      setStatus('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error: any) {
      setStatus(error.message || 'Unable to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-display font-bold mb-3">Change Password</h2>
      <p className="text-white/55 mb-6">Update the signed-in account password.</p>
      {status && <div className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">{status}</div>}
      <form onSubmit={submit} className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" placeholder="Current password" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-ulss-gold" />
        <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="New password" className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-ulss-gold" />
        <button disabled={loading} className="rounded-xl bg-ulss-gold px-4 py-3 font-semibold text-ulss-black hover:bg-white transition-colors disabled:opacity-60">{loading ? 'Updating...' : 'Update Password'}</button>
      </form>
    </div>
  );
}

function ResourceManager({ session, config }: { session: AuthSession; config: ResourceConfig }) {
  const token = session.accessToken;
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<any | null>(null);
  const [drawerItem, setDrawerItem] = useState<any | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const response = await resourceApi.list<any>(token, config.endpoint, { search, status, page, limit: 8, sort: config.defaultSort });
      setItems(response.data || []);
      setPages(response.pagination?.pages || 1);
      setTotal(response.pagination?.total || (response.data || []).length);
    } catch (err: any) {
      setError(err.message || 'Unable to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, status, page]);

  const openCreate = () => {
    setFormData({});
    setFormMode('create');
  };

  const openEdit = (item: any) => {
    setSelected(item);
    const initial: Record<string, any> = {};
    config.fields.forEach((field) => {
      const value = item?.[field.key];
      initial[field.key] = value === undefined || value === null ? '' : field.kind === 'file' ? '' : String(value);
    });
    setFormData(initial);
    setFormMode('edit');
  };

  const openView = (item: any) => setDrawerItem(item);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const hasFiles = config.fields.some((field) => field.kind === 'file');
      const payload = hasFiles ? new FormData() : {} as Record<string, any>;
      config.fields.forEach((field) => {
        const value = formData[field.key];
        if (field.kind === 'file') return;
        if (value !== undefined && value !== '') {
          if (hasFiles) (payload as FormData).append(field.key, value);
          else (payload as Record<string, any>)[field.key] = value;
        }
      });
      const fileInputs = document.querySelectorAll<HTMLInputElement>('[data-file-input]');
      fileInputs.forEach((input) => {
        const key = input.getAttribute('data-field');
        if (!key || !input.files?.length) return;
        if (input.multiple) {
          Array.from(input.files).forEach((file) => (payload as FormData).append(key, file));
        } else {
          (payload as FormData).append(key, input.files[0]);
        }
      });
      if (formMode === 'create') {
        await resourceApi.create(token, config.endpoint, payload);
      } else if (selected?._id) {
        await resourceApi.update(token, config.endpoint, selected._id, payload);
      }
      setFormMode(null);
      setSelected(null);
      await load();
    } catch (err: any) {
      setError(err.message || 'Unable to save record');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirmDelete?._id) return;
    setSaving(true);
    try {
      await resourceApi.remove(token, config.endpoint, confirmDelete._id);
      setConfirmDelete(null);
      await load();
    } catch (err: any) {
      setError(err.message || 'Unable to delete record');
    } finally {
      setSaving(false);
    }
  };

  const statusField = config.statusField || 'status';

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.15),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-6 md:p-8">
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-ulss-gold/20 bg-ulss-gold/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-ulss-gold mb-4">
              {config.icon} {config.title}
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">{config.title}</h2>
            <p className="text-white/55 max-w-2xl">{config.description}</p>
          </div>
          <button onClick={openCreate} className="inline-flex items-center gap-2 self-start rounded-2xl bg-ulss-gold px-4 py-3 font-semibold text-ulss-black hover:bg-white transition-colors">
            <Plus size={16} /> Add {config.title.split(' ')[0].slice(0, -1) || 'Item'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={18} />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={config.searchPlaceholder} className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white outline-none focus:border-ulss-gold" />
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setStatus('')} className={`rounded-2xl px-4 py-3 text-sm font-semibold ${!status ? 'bg-white text-ulss-black' : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10'}`}>All</button>
          {config.statusOptions?.map((item) => (
            <button key={item} onClick={() => { setStatus(item); setPage(1); }} className={`rounded-2xl px-4 py-3 text-sm font-semibold ${status === item ? 'bg-ulss-gold text-ulss-black' : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10'}`}>{item}</button>
          ))}
        </div>
      </div>

      {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

      <div className="rounded-3xl border border-white/10 bg-[#0b0b0b] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-white/[0.03] text-white/40 text-xs uppercase tracking-[0.2em]">
              <tr>
                {config.columns.map((column) => <th key={column.key} className="px-5 py-4 font-medium">{column.label}</th>)}
                <th className="px-5 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={config.columns.length + 1} className="px-5 py-10 text-center text-white/50">Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={config.columns.length + 1} className="px-5 py-16 text-center text-white/30">No records found.</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="border-t border-white/5 hover:bg-white/[0.02]">
                    {config.columns.map((column) => (
                      <td key={column.key} className="px-5 py-4 text-sm text-white/75 align-top">
                        {column.render ? column.render(item) : column.key === statusField ? (
                          <span className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80`}>
                            <span className={`h-2 w-2 rounded-full ${STATUS_DOT[item[column.key]] || 'bg-white/30'}`} />
                            {formatCell(item[column.key])}
                          </span>
                        ) : (
                          formatCell(item[column.key])
                        )}
                      </td>
                    ))}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => openView(item)} className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/5"><Eye size={14} /> View</button>
                        <button onClick={() => openEdit(item)} className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/5"><Edit size={14} /> Edit</button>
                        <button onClick={() => setConfirmDelete(item)} className="inline-flex items-center gap-1 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-500/20"><Trash2 size={14} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-t border-white/5 text-sm text-white/55">
          <div>Total {total} records</div>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))} className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 disabled:opacity-40"><ChevronLeft size={14} /> Prev</button>
            <span>Page {page} of {pages}</span>
            <button disabled={page >= pages} onClick={() => setPage((prev) => Math.min(pages, prev + 1))} className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 py-2 disabled:opacity-40">Next <ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {formMode && (
        <Dialog title={formMode === 'create' ? `Create ${config.title}` : `Edit ${config.title}`} onClose={() => setFormMode(null)}>
          <form onSubmit={submit} className="space-y-4">
            {config.fields.map((field) => (
              <FieldInput key={field.key} field={field} value={formData[field.key]} onChange={(value) => setFormData((prev) => ({ ...prev, [field.key]: value }))} />
            ))}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setFormMode(null)} className="rounded-xl border border-white/10 px-4 py-3 font-semibold text-white/70 hover:bg-white/5">Cancel</button>
              <button disabled={saving} className="rounded-xl bg-ulss-gold px-4 py-3 font-semibold text-ulss-black hover:bg-white transition-colors disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </Dialog>
      )}

      {drawerItem && (
        <Drawer title={`${config.title} Details`} onClose={() => setDrawerItem(null)}>
          <div className="space-y-3">
            {config.fields.map((field) => (
              <div key={field.key} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.25em] text-white/35 mb-1">{field.label}</div>
                <div className="text-white">{formatCell(drawerItem[field.key])}</div>
              </div>
            ))}
            {drawerItem[config.fields[0]?.key] && <div className="rounded-2xl border border-ulss-gold/20 bg-ulss-gold/10 px-4 py-3 text-sm text-ulss-gold">History is available via backend `history` fields where enabled.</div>}
          </div>
        </Drawer>
      )}

      {confirmDelete && (
        <Dialog title={`Delete ${config.title}`} onClose={() => setConfirmDelete(null)}>
          <div className="space-y-4">
            <p className="text-white/65">This action cannot be undone. Delete <span className="text-white font-semibold">{formatCell(confirmDelete[config.columns[0]?.key])}</span>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="rounded-xl border border-white/10 px-4 py-3 font-semibold text-white/70 hover:bg-white/5">Cancel</button>
              <button disabled={saving} onClick={remove} className="rounded-xl bg-red-500 px-4 py-3 font-semibold text-white hover:bg-red-400 disabled:opacity-60">{saving ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function FieldInput({ field, value, onChange }: { field: FieldConfig; value: any; onChange: (value: any) => void }) {
  const base = 'mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-ulss-gold';
  return (
    <div>
      <label className="text-xs uppercase tracking-[0.25em] text-white/40">{field.label}</label>
      {field.kind === 'textarea' ? (
        <textarea rows={4} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} className={base} />
      ) : field.kind === 'select' ? (
        <select value={value || ''} onChange={(e) => onChange(e.target.value)} className={base}>
          <option value="">Select {field.label}</option>
          {field.options?.map((option) => <option key={option} value={option} className="bg-[#0a0a0a]">{option}</option>)}
        </select>
      ) : field.kind === 'file' ? (
        <input type="file" multiple={field.multiple} accept={field.accept} data-file-input data-field={field.key} className={base} />
      ) : (
        <input type={field.kind} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || field.label} className={base} />
      )}
    </div>
  );
}

function Dialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0b0b0b] p-6 shadow-2xl shadow-black/40">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-xl font-display font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-full border border-white/10 p-2 text-white/60 hover:bg-white/5"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative ml-auto h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-[#0b0b0b] p-6 shadow-2xl shadow-black/40">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h3 className="text-xl font-display font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-full border border-white/10 p-2 text-white/60 hover:bg-white/5"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function AdminApp() {
  const [session, setSession] = useState<AuthSession | null>(() => authStorage.get());
  const [booting, setBooting] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleKey | 'dashboard'>('dashboard');

  const hydrate = async (current: AuthSession | null) => {
    if (!current?.accessToken) {
      setBooting(false);
      setSession(null);
      return;
    }
    try {
      const user = await authApi.me(current.accessToken);
      const nextSession = { ...current, user: user.data };
      authStorage.set(nextSession);
      setSession(nextSession);
      const dashboardResponse = await dashboardApi.get(current.accessToken);
      setDashboard(dashboardResponse.data);
    } catch {
      authStorage.clear();
      setSession(null);
    } finally {
      setBooting(false);
    }
  };

  useEffect(() => {
    hydrate(session);
  }, []);

  const handleAuthenticated = async (next: AuthSession) => {
    authStorage.set(next);
    setSession(next);
    setActiveModule('dashboard');
    const dashboardResponse = await dashboardApi.get(next.accessToken);
    setDashboard(dashboardResponse.data);
  };

  const handleLogout = async () => {
    if (session?.accessToken) {
      try { await authApi.logout(session.accessToken); } catch { /* ignore */ }
    }
    authStorage.clear();
    setSession(null);
  };

  const refreshDashboard = async () => {
    if (!session?.accessToken) return;
    const response = await dashboardApi.get(session.accessToken);
    setDashboard(response.data);
  };

  if (booting) {
    return <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">Loading admin workspace...</div>;
  }

  if (!session) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return <AdminShell session={session} onLogout={handleLogout} dashboard={dashboard} onRefreshDashboard={refreshDashboard} activeModule={activeModule} setActiveModule={setActiveModule} />;
}
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowLeft,
  Bell,
  Car,
  ChartBar,
  ChevronDown,
  ClipboardList,
  Eye,
  FileText,
  Filter,
  LayoutDashboard,
  LogOut,
  Package,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  SquarePen,
  Trash2,
  Truck,
  Wrench,
  Users,
} from 'lucide-react';
import { authApi, authStorage, dashboardApi, resourceApi, type AuthSession, type AuthUser, type DashboardResponse } from './api';

type ResourceItem = Record<string, any>;
type ModuleKey = 'tools' | 'spare-parts' | 'vehicles' | 'technicians' | 'maintenance';
type ViewKey = 'dashboard' | ModuleKey | 'password';
type FieldType = 'text' | 'number' | 'date' | 'textarea' | 'select' | 'file';

type FieldConfig = {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  accept?: string;
  multiple?: boolean;
};

type ColumnConfig = {
  key: string;
  label: string;
  render?: (item: ResourceItem) => string;
};

type ModuleConfig = {
  key: ModuleKey;
  endpoint: string;
  title: string;
  description: string;
  searchPlaceholder: string;
  searchFields: string[];
  statusField?: string;
  statusOptions?: string[];
  fields: FieldConfig[];
  columns: ColumnConfig[];
};

const STATUS_BADGES: Record<string, string> = {
  Available: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  'In Use': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  Reserved: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'Maintenance Required': 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  'Out Of Service': 'bg-red-500/15 text-red-300 border-red-500/30',
  'In Stock': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Limited: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'On Order': 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'Out Of Stock': 'bg-red-500/15 text-red-300 border-red-500/30',
  Active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Inactive: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  'On Leave': 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  Overdue: 'bg-red-500/15 text-red-300 border-red-500/30',
  Sold: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  'Under Repair': 'bg-orange-500/15 text-orange-300 border-orange-500/30',
};

const MODULES: Record<ModuleKey, ModuleConfig> = {
  'tools': {
    key: 'tools',
    endpoint: 'tools',
    title: 'Tools Inventory',
    description: 'Manage tools, assignments, and service dates.',
    searchPlaceholder: 'Search tools by ID, name, brand, serial number...',
    searchFields: ['toolId', 'toolName', 'brand', 'serialNumber', 'category'],
    statusField: 'status',
    statusOptions: ['Available', 'In Use', 'Reserved', 'Maintenance Required', 'Out Of Service'],
    fields: [
      { key: 'toolId', label: 'Tool ID', type: 'text' },
      { key: 'toolName', label: 'Tool Name', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'brand', label: 'Brand', type: 'text' },
      { key: 'serialNumber', label: 'Serial Number', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Available', 'In Use', 'Reserved', 'Maintenance Required', 'Out Of Service'] },
      { key: 'assignedTechnician', label: 'Assigned Technician ID', type: 'text', placeholder: 'Technician ObjectId' },
      { key: 'purchaseDate', label: 'Purchase Date', type: 'date' },
      { key: 'lastServiceDate', label: 'Last Service Date', type: 'date' },
      { key: 'nextServiceDate', label: 'Next Service Date', type: 'date' },
      { key: 'toolImage', label: 'Tool Image', type: 'file', accept: 'image/*' },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    columns: [
      { key: 'toolId', label: 'Tool ID' },
      { key: 'toolName', label: 'Tool Name' },
      { key: 'brand', label: 'Brand' },
      { key: 'status', label: 'Status' },
      { key: 'assignedTechnician', label: 'Assigned Technician', render: (item) => item.assignedTechnician?.name || item.assignedTechnician || '-' },
    ],
  },
  'spare-parts': {
    key: 'spare-parts',
    endpoint: 'spare-parts',
    title: 'Spare Parts Inventory',
    description: 'Track stock levels, suppliers, and compatibility.',
    searchPlaceholder: 'Search parts by number, name, supplier...',
    searchFields: ['partNumber', 'partName', 'category', 'supplier', 'compatibleVehicleMake', 'compatibleVehicleModel'],
    statusField: 'status',
    statusOptions: ['In Stock', 'Limited', 'On Order', 'Out Of Stock'],
    fields: [
      { key: 'partNumber', label: 'Part Number', type: 'text' },
      { key: 'partName', label: 'Part Name', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'compatibleVehicleMake', label: 'Compatible Make', type: 'text' },
      { key: 'compatibleVehicleModel', label: 'Compatible Model', type: 'text' },
      { key: 'quantity', label: 'Quantity', type: 'number' },
      { key: 'minimumQuantity', label: 'Minimum Quantity', type: 'number' },
      { key: 'unitPrice', label: 'Unit Price', type: 'number' },
      { key: 'supplier', label: 'Supplier', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['In Stock', 'Limited', 'On Order', 'Out Of Stock'] },
    ],
    columns: [
      { key: 'partNumber', label: 'Part Number' },
      { key: 'partName', label: 'Part Name' },
      { key: 'quantity', label: 'Qty' },
      { key: 'minimumQuantity', label: 'Min Qty' },
      { key: 'status', label: 'Status' },
    ],
  },
  'vehicles': {
    key: 'vehicles',
    endpoint: 'vehicles',
    title: 'Vehicle Inventory',
    description: 'Manage vehicle assets and images.',
    searchPlaceholder: 'Search vehicles by ID, make, model, registration...',
    searchFields: ['vehicleId', 'make', 'model', 'registrationNumber', 'chassisNumber', 'color'],
    statusField: 'status',
    statusOptions: ['Available', 'Reserved', 'Under Repair', 'Sold'],
    fields: [
      { key: 'vehicleId', label: 'Vehicle ID', type: 'text' },
      { key: 'make', label: 'Make', type: 'text' },
      { key: 'model', label: 'Model', type: 'text' },
      { key: 'year', label: 'Year', type: 'number' },
      { key: 'chassisNumber', label: 'Chassis Number', type: 'text' },
      { key: 'registrationNumber', label: 'Registration Number', type: 'text' },
      { key: 'color', label: 'Color', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Available', 'Reserved', 'Under Repair', 'Sold'] },
      { key: 'images', label: 'Vehicle Images', type: 'file', accept: 'image/*', multiple: true },
      { key: 'notes', label: 'Notes', type: 'textarea' },
    ],
    columns: [
      { key: 'vehicleId', label: 'Vehicle ID' },
      { key: 'make', label: 'Make' },
      { key: 'model', label: 'Model' },
      { key: 'registrationNumber', label: 'Registration' },
      { key: 'status', label: 'Status' },
    ],
  },
  'technicians': {
    key: 'technicians',
    endpoint: 'technicians',
    title: 'Technicians',
    description: 'Manage workshop staff and assigned tools.',
    searchPlaceholder: 'Search technicians by ID, name, email...',
    searchFields: ['employeeId', 'name', 'email', 'phone', 'department'],
    statusField: 'status',
    statusOptions: ['Active', 'Inactive', 'On Leave'],
    fields: [
      { key: 'employeeId', label: 'Employee ID', type: 'text' },
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'email', label: 'Email', type: 'text' },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'department', label: 'Department', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'On Leave'] },
    ],
    columns: [
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'status', label: 'Status' },
    ],
  },
  'maintenance': {
    key: 'maintenance',
    endpoint: 'maintenance',
    title: 'Maintenance Records',
    description: 'Track service jobs and maintenance history.',
    searchPlaceholder: 'Search maintenance records by ID or description...',
    searchFields: ['maintenanceId', 'description'],
    statusField: 'status',
    statusOptions: ['Pending', 'Completed', 'Overdue'],
    fields: [
      { key: 'maintenanceId', label: 'Maintenance ID', type: 'text' },
      { key: 'toolId', label: 'Tool ID', type: 'text', placeholder: 'Tool ObjectId' },
      { key: 'technician', label: 'Technician ID', type: 'text', placeholder: 'Technician ObjectId' },
      { key: 'serviceDate', label: 'Service Date', type: 'date' },
      { key: 'nextServiceDate', label: 'Next Service Date', type: 'date' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'cost', label: 'Cost', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Completed', 'Overdue'] },
    ],
    columns: [
      { key: 'maintenanceId', label: 'Maintenance ID' },
      { key: 'description', label: 'Description' },
      { key: 'status', label: 'Status' },
      { key: 'serviceDate', label: 'Service Date' },
    ],
  },
};

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return `${value.length} item(s)`;
  if (typeof value === 'object' && value && 'name' in value) return String((value as Record<string, unknown>).name);
  return JSON.stringify(value);
}

function badgeClass(value: unknown) {
  const key = typeof value === 'string' ? value : String(value ?? '');
  return STATUS_BADGES[key] || 'bg-white/10 text-white/70 border-white/10';
}

function Button({ children, onClick, className = '', type = 'button' as const }: { children: React.ReactNode; onClick?: () => void; className?: string; type?: 'button' | 'submit' }) {
  return (
    <button type={type} onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 text-sm font-semibold transition-colors ${className}`}>
      {children}
    </button>
  );
}

function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4" onClick={onClose}>
      <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0b0b0b] p-6 shadow-2xl shadow-black/50" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-display font-bold text-white">{title}</h3>
          <Button onClick={onClose} className="border border-white/10 bg-white/5 text-white hover:bg-white/10">Close</Button>
        </div>
        {children}
      </div>
    </div>
  );
}

function DrawerLegacy({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex bg-black/50" onClick={onClose}>
      <div className="ml-auto h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-[#0b0b0b] p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-display font-bold text-white">{title}</h3>
          <Button onClick={onClose} className="border border-white/10 bg-white/5 text-white hover:bg-white/10">Close</Button>
        </div>
        {children}
      </div>
    </div>
  );
}

function LoginScreen({ onAuth }: { onAuth: (session: AuthSession) => void }) {
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ email: '', password: '', token: '', newPassword: '', currentPassword: '' });

  const params = new URLSearchParams(window.location.search);
  const resetPath = window.location.pathname.includes('reset-password');
  const resetEmail = params.get('email') || '';
  const resetToken = params.get('token') || '';

  useEffect(() => {
    if (resetPath || (resetEmail && resetToken)) {
      setMode('reset');
      setForm((prev) => ({ ...prev, email: resetEmail, token: resetToken }));
    }
  }, [resetEmail, resetPath, resetToken]);

  const submitLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const session = await authApi.login(form.email, form.password);
      authStorage.set(session.data);
      onAuth(session.data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const submitForgot = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await authApi.forgotPassword(form.email);
      setMessage('Reset link generated. Check backend console for the link in this demo build.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Reset request failed');
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const session = await authApi.resetPassword(form.email, form.token, form.newPassword);
      authStorage.set(session.data);
      onAuth(session.data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ulss-black px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl shadow-black/40 md:grid-cols-[1.1fr_0.9fr]">
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#111111] to-[#050505] p-10 md:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.14),transparent_45%)]" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ulss-gold/20 bg-ulss-gold/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-ulss-gold">
                  <Sparkles size={14} /> ULSS Admin
                </div>
                <h1 className="max-w-lg text-5xl font-display font-bold leading-tight">
                  Secure Inventory Control for Every Workshop and Fleet.
                </h1>
                <p className="mt-6 max-w-xl text-white/60">
                  Manage tools, spare parts, vehicles, technicians, and maintenance records with role-based access control and audit-ready workflows.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-white/60">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">JWT Auth + RBAC</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">CRUD + Search + Filters</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Dashboard Analytics</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Image Uploads</div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-3xl font-display font-bold">{mode === 'login' ? 'Administrator Login' : mode === 'forgot' ? 'Forgot Password' : 'Reset Password'}</h2>
              <p className="mt-2 text-sm text-white/60">
                {mode === 'login'
                  ? 'Sign in to access the admin panel.'
                  : mode === 'forgot'
                    ? 'Generate a password reset token.'
                    : 'Set a new password using your reset token.'}
              </p>
            </div>

            <form onSubmit={mode === 'login' ? submitLogin : mode === 'forgot' ? submitForgot : submitReset} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/50">Email</span>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required type="email" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-ulss-gold" />
              </label>

              {mode === 'login' && (
                <label className="block">
                  <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/50">Password</span>
                  <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required type="password" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-ulss-gold" />
                </label>
              )}

              {mode === 'forgot' && <p className="text-sm text-white/50">A reset link will be logged by the backend demo server.</p>}

              {mode === 'reset' && (
                <>
                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/50">Reset Token</span>
                    <input value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} required className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-ulss-gold" />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/50">New Password</span>
                    <input value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required type="password" className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-ulss-gold" />
                  </label>
                </>
              )}

              {message && <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">{message}</div>}

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" className="bg-ulss-gold text-ulss-black hover:bg-white" >{loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : mode === 'forgot' ? 'Send Reset Link' : 'Reset Password'}</Button>
                {mode !== 'login' && <Button onClick={() => setMode('login')} className="border border-white/10 bg-white/5 text-white hover:bg-white/10">Back to Login</Button>}
              </div>
            </form>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/50">
              <button type="button" onClick={() => setMode('login')} className="hover:text-white">Login</button>
              <button type="button" onClick={() => setMode('forgot')} className="hover:text-white">Forgot Password</button>
              <button type="button" onClick={() => setMode('reset')} className="hover:text-white">Reset Password</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardViewLegacy({ data }: { data: DashboardResponse | null }) {
  const cards = data?.cards || {};
  const toolStatus = data?.charts.toolStatusDistribution || [];
  const stockLevels = data?.charts.sparePartsStockLevels || [];
  const maintenance = data?.charts.monthlyMaintenanceActivities || [];
  const growth = data?.charts.inventoryGrowth || [];

  const pieColors = ['#D4AF37', '#FFFFFF', '#8b8b8b', '#f59e0b', '#ef4444'];
  const cardsList = [
    { label: 'Total Tools', value: cards.totalTools || 0, icon: Wrench },
    { label: 'Available Tools', value: cards.availableTools || 0, icon: Sparkles },
    { label: 'Reserved Tools', value: cards.reservedTools || 0, icon: ClipboardList },
    { label: 'In Use Tools', value: cards.inUseTools || 0, icon: Settings },
    { label: 'Maintenance Required Tools', value: cards.maintenanceRequiredTools || 0, icon: Bell },
    { label: 'Total Spare Parts', value: cards.totalSpareParts || 0, icon: Package },
    { label: 'Low Stock Parts', value: cards.lowStockParts || 0, icon: Filter },
    { label: 'Total Vehicles', value: cards.totalVehicles || 0, icon: Truck },
    { label: 'Active Technicians', value: cards.activeTechnicians || 0, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
        {cardsList.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-lg shadow-black/20">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-ulss-gold/10 text-ulss-gold"><Icon size={20} /></div>
              <div className="text-3xl font-display font-bold text-white">{card.value}</div>
              <div className="mt-1 text-sm text-white/55">{card.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Tool Status Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={toolStatus} dataKey="count" nameKey="_id" innerRadius={65} outerRadius={95} paddingAngle={4}>
                {toolStatus.map((_, index) => <Cell key={index} fill={pieColors[index % pieColors.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Spare Parts Stock Levels">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stockLevels}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff14" />
              <XAxis dataKey="_id" stroke="#ffffff66" />
              <YAxis stroke="#ffffff66" />
              <Tooltip />
              <Bar dataKey="count" fill="#D4AF37" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Maintenance Activities">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={maintenance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff14" />
              <XAxis dataKey="_id" stroke="#ffffff66" />
              <YAxis stroke="#ffffff66" />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#D4AF37" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Inventory Growth">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={growth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff14" />
              <XAxis dataKey="_id" stroke="#ffffff66" />
              <YAxis stroke="#ffffff66" />
              <Tooltip />
              <Bar dataKey="count" fill="#ffffff" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCardLegacy({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-lg shadow-black/20">
      <h3 className="mb-4 text-lg font-display font-semibold text-white">{title}</h3>
      {children}
    </div>
  );
}

function ResourceManagerLegacy({ token, config }: { token: string; config: ModuleConfig }) {
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [selectedItem, setSelectedItem] = useState<ResourceItem | null>(null);
  const [drawerItem, setDrawerItem] = useState<ResourceItem | null>(null);
  const [mode, setMode] = useState<'add' | 'edit' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ResourceItem | null>(null);
  const [files, setFiles] = useState<Record<string, FileList | null>>({});
  const [form, setForm] = useState<Record<string, string>>({});

  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await resourceApi.list<ResourceItem>(token, config.endpoint, { search, status, page, limit: 10 });
      setItems(response.data);
      if (response.pagination) setPagination(response.pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, config.endpoint, search, status, page]);

  const openAdd = () => {
    setForm({});
    setFiles({});
    setSelectedItem(null);
    setMode('add');
  };

  const openEdit = (item: ResourceItem) => {
    const nextForm: Record<string, string> = {};
    config.fields.forEach((field) => {
      const value = item[field.key];
      if (value !== undefined && value !== null) nextForm[field.key] = String(typeof value === 'object' && value !== null && '_id' in value ? (value as { _id: string })._id : value);
    });
    setForm(nextForm);
    setFiles({});
    setSelectedItem(item);
    setMode('edit');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const hasFiles = config.fields.some((field) => field.type === 'file');
      const payload: FormData | Record<string, unknown> = hasFiles ? new FormData() : {};

      config.fields.forEach((field) => {
        const value = form[field.key];
        if (field.type === 'file') {
          const fieldFiles = files[field.key];
          if (fieldFiles?.length) {
            Array.from(fieldFiles).forEach((file) => {
              (payload as FormData).append(field.multiple ? field.key : field.key, file);
            });
          }
          return;
        }
        if (value !== undefined) {
          if (payload instanceof FormData) payload.append(field.key, value);
          else payload[field.key] = field.type === 'number' ? Number(value) : value;
        }
      });

      if (mode === 'add') {
        await resourceApi.create(token, config.endpoint, payload);
      } else if (mode === 'edit' && selectedItem?._id) {
        await resourceApi.update(token, config.endpoint, selectedItem._id, payload);
      }
      setMode(null);
      await loadItems();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget?._id) return;
    setSaving(true);
    try {
      await resourceApi.remove(token, config.endpoint, deleteTarget._id);
      setDeleteTarget(null);
      await loadItems();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-lg shadow-black/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-ulss-gold/70">ULSS Admin</p>
            <h2 className="mt-2 text-3xl font-display font-bold text-white">{config.title}</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/55">{config.description}</p>
          </div>
          <Button onClick={openAdd} className="bg-ulss-gold text-ulss-black hover:bg-white"><Plus size={16} /> Add New</Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto_auto]">
          <label className="relative block">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
            <input value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} placeholder={config.searchPlaceholder} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-ulss-gold" />
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            <Filter size={16} />
            <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} className="bg-transparent text-sm text-white outline-none">
              <option value="">All Statuses</option>
              {(config.statusOptions || []).map((option) => <option key={option} value={option} className="bg-[#0b0b0b] text-white">{option}</option>)}
            </select>
          </div>
          <Button className="border border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={loadItems}><Sparkles size={16} /> Refresh</Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-lg shadow-black/20">
        {loading ? (
          <div className="flex min-h-[280px] items-center justify-center text-white/60">Loading {config.title.toLowerCase()}...</div>
        ) : items.length === 0 ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-white/55">
            <ClipboardList size={36} className="text-ulss-gold/70" />
            <p>No records found.</p>
            <Button onClick={openAdd} className="bg-ulss-gold text-ulss-black hover:bg-white">Create the first record</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left">
              <thead className="bg-white/[0.02] text-xs uppercase tracking-[0.25em] text-white/40">
                <tr>
                  {config.columns.map((column) => <th key={column.key} className="px-6 py-4 font-medium">{column.label}</th>)}
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {items.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02]">
                    {config.columns.map((column) => {
                      const value = column.render ? column.render(item) : item[column.key];
                      const isStatus = column.key === (config.statusField || 'status');
                      return (
                        <td key={column.key} className="px-6 py-4 text-sm text-white/70">
                          {isStatus ? (
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${badgeClass(value)}`}>{formatValue(value)}</span>
                          ) : (
                            <span className="max-w-[240px] truncate">{formatValue(value)}</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => setDrawerItem(item)} className="border border-white/10 bg-white/5 text-white hover:bg-white/10"><Eye size={14} /> View</Button>
                        <Button onClick={() => openEdit(item)} className="border border-white/10 bg-white/5 text-white hover:bg-white/10"><SquarePen size={14} /> Edit</Button>
                        <Button onClick={() => setDeleteTarget(item)} className="border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20"><Trash2 size={14} /> Delete</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white/60">
        <div>Page {pagination.page} of {pagination.pages} • {pagination.total} total records</div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} className="border border-white/10 bg-white/5 text-white hover:bg-white/10" disabled={page <= 1}>Prev</Button>
          <Button onClick={() => setPage((prev) => Math.min(prev + 1, pagination.pages))} className="border border-white/10 bg-white/5 text-white hover:bg-white/10" disabled={page >= pagination.pages}>Next</Button>
        </div>
      </div>

      <Modal open={mode !== null} title={mode === 'add' ? `Add ${config.title}` : `Edit ${config.title}`} onClose={() => setMode(null)}>
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          {config.fields.map((field) => (
            <label key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
              <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/45">{field.label}</span>
              {field.type === 'select' ? (
                <select value={form[field.key] || ''} onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-ulss-gold">
                  <option value="">Select...</option>
                  {(field.options || []).map((option) => <option key={option} value={option} className="bg-[#0b0b0b] text-white">{option}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea value={form[field.key] || ''} onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))} rows={5} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-ulss-gold" />
              ) : field.type === 'file' ? (
                <input type="file" multiple={field.multiple} accept={field.accept} onChange={(e) => setFiles((prev) => ({ ...prev, [field.key]: e.target.files }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-ulss-gold file:px-3 file:py-2 file:text-sm file:font-semibold file:text-ulss-black" />
              ) : (
                <input type={field.type} value={form[field.key] || ''} placeholder={field.placeholder} onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-ulss-gold" />
              )}
            </label>
          ))}
          <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
            <Button type="button" onClick={() => setMode(null)} className="border border-white/10 bg-white/5 text-white hover:bg-white/10">Cancel</Button>
            <Button type="submit" className="bg-ulss-gold text-ulss-black hover:bg-white">{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>

      <Drawer open={!!drawerItem} title={config.title} onClose={() => setDrawerItem(null)}>
        {drawerItem && (
          <div className="space-y-3">
            {config.columns.map((column) => (
              <div key={column.key} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-[0.25em] text-white/45">{column.label}</div>
                <div className="mt-2 text-white">{formatValue(column.render ? column.render(drawerItem) : drawerItem[column.key])}</div>
              </div>
            ))}
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.25em] text-white/45">Raw JSON</div>
              <pre className="mt-3 overflow-x-auto text-xs text-white/60">{JSON.stringify(drawerItem, null, 2)}</pre>
            </div>
          </div>
        )}
      </Drawer>

      <Modal open={!!deleteTarget} title={`Delete ${config.title.slice(0, -1)}`} onClose={() => setDeleteTarget(null)}>
        <div className="space-y-4 text-white/70">
          <p>Are you sure you want to delete this record? This action cannot be undone.</p>
          <div className="flex items-center justify-end gap-3">
            <Button onClick={() => setDeleteTarget(null)} className="border border-white/10 bg-white/5 text-white hover:bg-white/10">Cancel</Button>
            <Button onClick={remove} className="border border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20">{saving ? 'Deleting...' : 'Delete'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ChangePasswordScreen({ token, onDone }: { token: string; onDone: () => void }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const session = await authApi.changePassword(token, form.currentPassword, form.newPassword);
      authStorage.set(session.data);
      setMessage('Password updated successfully.');
      onDone();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-lg shadow-black/20">
      <h2 className="text-2xl font-display font-bold text-white">Change Password</h2>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/45">Current Password</span>
          <input value={form.currentPassword} onChange={(e) => setForm((prev) => ({ ...prev, currentPassword: e.target.value }))} type="password" required className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-ulss-gold" />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs uppercase tracking-[0.25em] text-white/45">New Password</span>
          <input value={form.newPassword} onChange={(e) => setForm((prev) => ({ ...prev, newPassword: e.target.value }))} type="password" required className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-ulss-gold" />
        </label>
        {message && <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">{message}</div>}
        <div className="flex justify-end">
          <Button type="submit" className="bg-ulss-gold text-ulss-black hover:bg-white">{loading ? 'Updating...' : 'Update Password'}</Button>
        </div>
      </form>
    </div>
  );
}

export function AdminAppLegacy() {
  const [session, setSession] = useState<AuthSession | null>(() => authStorage.get());
  const [user, setUser] = useState<AuthUser | null>(session?.user || null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [activeView, setActiveView] = useState<ViewKey>('dashboard');
  const [loadingSession, setLoadingSession] = useState(Boolean(session?.accessToken));

  useEffect(() => {
    const verify = async () => {
      if (!session?.accessToken) {
        setLoadingSession(false);
        return;
      }
      try {
        const me = await authApi.me(session.accessToken);
        setUser(me.data);
      } catch {
        authStorage.clear();
        setSession(null);
        setUser(null);
      } finally {
        setLoadingSession(false);
      }
    };
    void verify();
  }, [session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken) return;
    const load = async () => {
      try {
        const response = await dashboardApi.get(session.accessToken);
        setDashboard(response.data);
      } catch {
        setDashboard(null);
      }
    };
    void load();
  }, [session?.accessToken]);

  const handleAuth = (nextSession: AuthSession) => {
    setSession(nextSession);
    setUser(nextSession.user);
    setActiveView('dashboard');
  };

  const handleLogout = async () => {
    if (session?.accessToken) {
      try {
        await authApi.logout(session.accessToken);
      } catch {
        // ignore logout errors, clear local session regardless
      }
    }
    authStorage.clear();
    setSession(null);
    setUser(null);
    setDashboard(null);
    setActiveView('dashboard');
  };

  if (loadingSession) {
    return <div className="flex min-h-screen items-center justify-center bg-ulss-black text-white/70">Loading admin session...</div>;
  }

  if (!session?.accessToken || !user) {
    return <LoginScreen onAuth={handleAuth} />;
  }

  const roleName = typeof user.role === 'string' ? user.role : user.role?.name || 'USER';
  const modulesToShow: Array<{ key: ViewKey; label: string; icon: React.ElementType }> = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'tools', label: 'Tools', icon: Wrench },
    { key: 'spare-parts', label: 'Spare Parts', icon: Package },
    { key: 'vehicles', label: 'Vehicles', icon: Truck },
    { key: 'technicians', label: 'Technicians', icon: Users },
    { key: 'maintenance', label: 'Maintenance', icon: ClipboardList },
    { key: 'password', label: 'Change Password', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-ulss-black text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#0b0b0b] px-5 py-6 lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ulss-gold text-ulss-black">
              <Truck size={22} />
            </div>
            <div>
              <div className="text-lg font-display font-bold">ULSS Admin</div>
              <div className="text-xs uppercase tracking-[0.25em] text-white/40">{roleName.replaceAll('_', ' ')}</div>
            </div>
          </div>

          <nav className="space-y-2">
            {modulesToShow.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.key;
              return (
                <button key={item.key} type="button" onClick={() => setActiveView(item.key)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${active ? 'bg-ulss-gold text-ulss-black' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
            <div className="flex items-center gap-2 text-white">
              <FileText size={16} className="text-ulss-gold" />
              Signed in as
            </div>
            <div className="mt-2 text-sm">{user.name}</div>
            <div className="text-xs text-white/45">{user.email}</div>
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-ulss-black/90 backdrop-blur-md">
            <div className="flex items-center justify-between px-4 py-4 md:px-6 lg:px-8">
              <button type="button" onClick={() => setActiveView('dashboard')} className="flex items-center gap-3 lg:hidden">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ulss-gold text-ulss-black"><Truck size={18} /></div>
                <div className="text-left">
                  <div className="font-display font-bold">ULSS Admin</div>
                  <div className="text-xs uppercase tracking-[0.25em] text-white/40">{roleName.replaceAll('_', ' ')}</div>
                </div>
              </button>
              <div className="hidden lg:block">
                <div className="text-sm uppercase tracking-[0.3em] text-white/45">Secure Operations Console</div>
                <div className="text-xl font-display font-bold text-white">{activeView === 'dashboard' ? 'Dashboard' : activeView === 'password' ? 'Change Password' : MODULES[activeView as ModuleKey].title}</div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={() => setActiveView('dashboard')} className="border border-white/10 bg-white/5 text-white hover:bg-white/10"><ChartBar size={16} /> Dashboard</Button>
                <Button onClick={handleLogout} className="border border-white/10 bg-white/5 text-white hover:bg-white/10"><LogOut size={16} /> Logout</Button>
              </div>
            </div>
          </header>

          <main className="space-y-8 p-4 md:p-6 lg:p-8">
            {activeView === 'dashboard' && <DashboardView data={dashboard} />}
            {activeView === 'password' && <ChangePasswordScreen token={session.accessToken} onDone={() => setActiveView('dashboard')} />}
            {(['tools', 'spare-parts', 'vehicles', 'technicians', 'maintenance'] as ModuleKey[]).map((key) => activeView === key && <ResourceManager key={key} token={session.accessToken} config={MODULES[key]} />)}
          </main>
        </div>
      </div>
    </div>
  );
}
