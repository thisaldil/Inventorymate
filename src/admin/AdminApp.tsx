/**
 * AdminApp.tsx
 * Full admin panel wired to the fixed backend.
 * Depends on api.ts in the same directory.
 */

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  Box,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleSlash,
  Database,
  Edit,
  Eye,
  Filter,
  LogOut,
  LockKeyhole,
  Package,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  TrendingUp,
  Truck,
  Users,
  Wrench,
  X,
  CheckCircle,
  Clock,
  FileSpreadsheet,
} from 'lucide-react';

import {
  authApi,
  authStorage,
  dashboardApi,
  toolsApi,
  sparePartsApi,
  vehiclesApi,
  techniciansApi,
  maintenanceApi,
  suppliersApi,  
  type AuthUser,
  type DashboardData,
  type Tool,
  type SparePart,
  type Vehicle,
  type Technician,
  type MaintenanceRecord,
  type Supplier,  
  type ListParams,
} from './api';

import { ExcelImport } from './components/ExcelImport';

// ─── Types ────────────────────────────────────────────────────────────────────

type Section =
  | 'dashboard'
  | 'tools'
  | 'spare-parts'
  | 'vehicles'
  | 'technicians'
  | 'maintenance'
  | 'suppliers'
  | 'import';

type ModalMode = 'view' | 'edit' | 'create';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getUserRole = (user: AuthUser | null): string => {
  if (!user) return '';
  if (typeof user.role === 'string') return user.role;
  return user.role?.name ?? '';
};

const fmt = {
  currency: (n?: number) =>
    n == null ? '—' : `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  date: (s?: string) => (s ? new Date(s).toLocaleDateString() : '—'),
  num: (n?: number) => (n == null ? '—' : n.toLocaleString()),
};

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Available: 'bg-emerald-100 text-emerald-800',
    Active: 'bg-emerald-100 text-emerald-800',
    'In Stock': 'bg-emerald-100 text-emerald-800',
    Completed: 'bg-emerald-100 text-emerald-800',
    'In Use': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    Reserved: 'bg-violet-100 text-violet-800',
    'On Order': 'bg-violet-100 text-violet-800',
    Pending: 'bg-amber-100 text-amber-800',
    'Low Stock': 'bg-amber-100 text-amber-800',
    'Maintenance Required': 'bg-orange-100 text-orange-800',
    'Under Repair': 'bg-orange-100 text-orange-800',
    'Out Of Service': 'bg-red-100 text-red-800',
    'Out Of Stock': 'bg-red-100 text-red-800',
    Overdue: 'bg-red-100 text-red-800',
    Inactive: 'bg-gray-100 text-gray-700',
    Sold: 'bg-gray-100 text-gray-700',
    Damaged: 'bg-red-100 text-red-800',
  };
  const cls = map[status] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-ulss-gold/15 bg-white/[0.03] p-5 shadow-sm flex items-center gap-4 hover:border-ulss-gold/30 transition-colors">
      <div className={`rounded-lg p-3 ${accent ?? 'bg-ulss-gold/10 text-ulss-gold'}`}>{icon}</div>
      <div>
        <p className="text-xs text-white/40">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}


function Pagination({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center gap-2 justify-end mt-4">
      <button
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="p-1 rounded disabled:opacity-30 hover:bg-gray-100"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm text-white/40">
        {page} / {pages}
      </span>
      <button
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
        className="p-1 rounded disabled:opacity-30 hover:bg-gray-100"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-[#0f0f0f] border border-ulss-gold/20 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ulss-gold/10">
          <h2 className="font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-white/50">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="mb-3">
      <p className="text-xs text-ulss-gold/50 mb-0.5">{label}</p>
<p className="text-sm text-white/80">{value ?? '—'}</p>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = 'text',
  required,
}: {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-ulss-gold/60 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-lg border border-ulss-gold/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-ulss-gold/40"
      />
    </div>
  );
}

function Select({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-ulss-gold/60 mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-ulss-gold/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ulss-gold/40"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Section: Dashboard ───────────────────────────────────────────────────────

function DashboardSection({ token }: { token: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    dashboardApi
      .get(token)
      .then((res) => setData(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-white/40">
        <RefreshCw className="animate-spin mr-2" size={20} /> Loading dashboard…
      </div>
    );
  if (error)
    return (
      <div className="text-red-400 p-4 flex gap-2 items-center bg-red-500/10 border border-red-500/20 rounded-xl">
        <AlertTriangle size={18} /> {error}
      </div>
    );
  if (!data) return null;

  const { cards, charts } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">
        Dashboard <span className="text-ulss-gold/60 text-lg font-normal">Overview</span>
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tools"          value={fmt.num(cards.totalTools)}               icon={<Wrench size={20} />}       accent="bg-ulss-gold/10 text-ulss-gold" />
        <StatCard label="Available Tools"      value={fmt.num(cards.availableTools)}           icon={<CheckCircle size={20} />}  accent="bg-emerald-500/10 text-emerald-400" />
        <StatCard label="In Use"               value={fmt.num(cards.inUseTools)}               icon={<Settings size={20} />}     accent="bg-blue-500/10 text-blue-400" />
        <StatCard label="Maintenance Req."     value={fmt.num(cards.maintenanceRequiredTools)} icon={<AlertTriangle size={20} />} accent="bg-orange-500/10 text-orange-400" />
        <StatCard label="Spare Parts"          value={fmt.num(cards.totalSpareParts)}          icon={<Package size={20} />}      accent="bg-violet-500/10 text-violet-400" />
        <StatCard label="Low Stock"            value={fmt.num(cards.lowStockParts)}            icon={<TrendingUp size={20} />}   accent="bg-amber-500/10 text-amber-400" />
        <StatCard label="Out of Stock"         value={fmt.num(cards.outOfStockParts)}          icon={<CircleSlash size={20} />}  accent="bg-red-500/10 text-red-400" />
        <StatCard label="Vehicles"             value={fmt.num(cards.totalVehicles)}            icon={<Truck size={20} />}        accent="bg-sky-500/10 text-sky-400" />
        <StatCard label="Active Technicians"   value={fmt.num(cards.activeTechnicians)}        icon={<Users size={20} />}        accent="bg-teal-500/10 text-teal-400" />
        <StatCard label="Pending Maintenance"  value={fmt.num(cards.pendingMaintenance)}       icon={<Clock size={20} />}        accent="bg-amber-500/10 text-amber-400" />
        <StatCard label="Overdue Maintenance"  value={fmt.num(cards.overdueMaintenance)}       icon={<CalendarClock size={20} />} accent="bg-red-500/10 text-red-400" />
        <StatCard label="Inventory Value"      value={fmt.currency(cards.inventoryValue)}      icon={<Database size={20} />}     accent="bg-ulss-gold/10 text-ulss-gold" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Tool Status" data={charts.toolStatusDistribution} />
        <ChartCard title="Spare Part Status" data={charts.sparePartStatusDistribution} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MonthChart title="Maintenance Activity (by month)" data={charts.monthlyMaintenanceActivities} />
        <MonthChart title="Inventory Growth (parts added / month)" data={charts.inventoryGrowth} />
      </div>
    </div>
  );
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function ChartCard({ title, data }: { title: string; data: Array<{ _id: string; count: number }> }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  return (
    <div className="rounded-xl border border-ulss-gold/15 bg-white/[0.03] p-5 shadow-sm">
      <p className="font-semibold text-sm text-ulss-gold mb-4">{title}</p>
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d._id} className="flex items-center gap-3">
            <span className="w-32 text-xs text-white/40 truncate">{d._id}</span>
            <div className="flex-1 bg-white/5 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-ulss-gold"
                style={{ width: `${(d.count / total) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-white/60 w-8 text-right">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


function MonthChart({ title, data }: { title: string; data: Array<{ _id: number; count: number }> }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="rounded-xl border border-ulss-gold/15 bg-white/[0.03] p-5 shadow-sm">
      <p className="font-semibold text-sm text-ulss-gold mb-4">{title}</p>
      <div className="flex items-end gap-1 h-24">
        {data.map((d) => (
          <div key={d._id} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-ulss-gold/70 rounded-t hover:bg-ulss-gold transition-colors"
              style={{ height: `${(d.count / max) * 80}px` }}
            />
            <span className="text-[10px] text-white/30">{MONTH_NAMES[(d._id - 1) % 12]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
// ─── Generic Resource Section ─────────────────────────────────────────────────

type ResourceConfig<T> = {
  title: string;
  endpoint: string;
  searchPlaceholder: string;
  filterField?: string;
  filterOptions?: string[];
  listFn: (token: string, params?: ListParams) => Promise<any>;
  createFn: (token: string, body: any) => Promise<any>;
  updateFn: (token: string, id: string, body: any) => Promise<any>;
  deleteFn: (token: string, id: string) => Promise<any>;
  columns: Array<{ label: string; render: (item: T) => React.ReactNode }>;
  viewFields: Array<{ label: string; key: keyof T | ((item: T) => React.ReactNode) }>;
  defaultForm: () => Record<string, string | number>;
  formFields: Array<{
    label: string;
    name: string;
    type?: string;
    options?: string[];
  }>;
  canCreate: (role: string) => boolean;
  canEdit: (role: string) => boolean;
  canDelete: (role: string) => boolean;
};

function ResourceSection<T extends { _id: string }>({
  config,
  token,
  userRole,
}: {
  config: ResourceConfig<T>;
  token: string;
  userRole: string;
}) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [modal, setModal] = useState<{ mode: ModalMode; item?: T } | null>(null);
  const [form, setForm] = useState<Record<string, string | number>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    const params: ListParams = { page, limit: 15, search };
    if (filter && config.filterField) params[config.filterField] = filter;

    config
      .listFn(token, params)
      .then((res: any) => {
        setItems(res.data ?? []);
        setPages(res.pagination?.pages ?? 1);
      })
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, filter]);

  // Reset page on new search
  const handleSearch = () => { setPage(1); load(); };

  const openCreate = () => {
    setForm(config.defaultForm());
    setFormError('');
    setModal({ mode: 'create' });
  };

  const openEdit = (item: T) => {
    // Flatten the item into the form (strings only, skip nested objects)
    const flat: Record<string, string | number> = {};
    Object.entries(item).forEach(([k, v]) => {
      if (typeof v === 'string' || typeof v === 'number') flat[k] = v;
    });
    setForm(flat);
    setFormError('');
    setModal({ mode: 'edit', item });
  };

  const openView = (item: T) => {
    setModal({ mode: 'view', item });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setFormError('');
    try {
      if (modal?.mode === 'create') {
        await config.createFn(token, form);
      } else if (modal?.mode === 'edit' && modal.item) {
        await config.updateFn(token, modal.item._id, form);
      }
      setModal(null);
      load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record? This cannot be undone.')) return;
    try {
      await config.deleteFn(token, id);
      load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">{config.title}</h1>
        {config.canCreate(userRole) && (
          <button
            onClick={openCreate}
className="flex items-center gap-2 rounded-lg bg-ulss-gold px-4 py-2 text-sm font-medium text-ulss-black hover:bg-ulss-gold/90"
          >
            <Plus size={16} /> Add New
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={config.searchPlaceholder}
className="w-full rounded-lg border border-ulss-gold/20 bg-white/5 text-white placeholder-white/30 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ulss-gold/40"
            />
          </div>
          <button
            onClick={handleSearch}
className="rounded-lg border border-ulss-gold/20 text-white/60 px-3 py-2 text-sm hover:bg-white/5"
          >
            Search
          </button>
        </div>
        {config.filterField && config.filterOptions && (
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-gray-400 shrink-0" />
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(1); }}
className="rounded-lg border border-ulss-gold/20 bg-ulss-black text-white/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ulss-gold/40"
            >
              <option value="">All</option>
              {config.filterOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        )}
        <button onClick={() => { setPage(1); load(); }} className="p-2 rounded-lg border border-ulss-gold/20 hover:bg-white/5">
          <RefreshCw size={16} className={loading ? 'animate-spin text-indigo-500' : 'text-ulss-gold/50'} />
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Table */}
<div className="rounded-xl border border-ulss-gold/15 bg-white/[0.03] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
<tr className="border-b border-ulss-gold/10 bg-white/[0.02]">
                {config.columns.map((col) => (
                  <th key={col.label} className="px-4 py-3 text-left text-xs font-semibold text-ulss-gold/50 uppercase tracking-wide">
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold text-ulss-gold/50 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ulss-gold/5">
              {loading ? (
                <tr>
                  <td colSpan={config.columns.length + 1} className="text-center py-12 text-white/30">
                    <RefreshCw className="animate-spin inline mr-2" size={16} /> Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length + 1} className="text-center py-12 text-white/30">
                    No records found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.03] border-b border-ulss-gold/5 transition-colors">

                    {config.columns.map((col) => (
                      <td key={col.label} className="px-4 py-3 text-white/70">
                        {col.render(item)}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openView(item)}
                          title="View"
                          className="p-1.5 rounded hover:bg-gray-100 text-ulss-gold/50"
                        >
                          <Eye size={15} />
                        </button>
                        {config.canEdit(userRole) && (
                          <button
                            onClick={() => openEdit(item)}
                            title="Edit"
                            className="p-1.5 rounded hover:bg-indigo-50 text-indigo-600"
                          >
                            <Edit size={15} />
                          </button>
                        )}
                        {config.canDelete(userRole) && (
                          <button
                            onClick={() => handleDelete(item._id)}
                            title="Delete"
                            className="p-1.5 rounded hover:bg-red-500/10 text-red-400" 
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} pages={pages} onPage={setPage} />

      {/* View modal */}
      {modal?.mode === 'view' && modal.item && (
        <Modal title="Record Details" onClose={() => setModal(null)}>
          <div className="grid grid-cols-2 gap-x-4">
            {config.viewFields.map(({ label, key }) => {
              const val = typeof key === 'function' ? key(modal.item!) : (modal.item as any)[key as string];
              return <Field key={label} label={label} value={val != null ? String(val) : undefined} />;
            })}
          </div>
        </Modal>
      )}

      {/* Create / Edit modal */}
      {(modal?.mode === 'create' || modal?.mode === 'edit') && (
        <Modal
          title={modal.mode === 'create' ? `Add ${config.title.replace(/s$/, '')}` : 'Edit Record'}
          onClose={() => setModal(null)}
        >
          <div>
            {config.formFields.map((f) =>
              f.options ? (
                <Select
                  key={f.name}
                  label={f.label}
                  name={f.name}
                  value={String(form[f.name] ?? '')}
                  options={f.options}
                  onChange={handleFormChange}
                />
              ) : (
                <Input
                  key={f.name}
                  label={f.label}
                  name={f.name}
                  type={f.type ?? 'text'}
                  value={form[f.name] ?? ''}
                  onChange={handleFormChange}
                />
              ),
            )}

            {formError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3">
                {formError}
              </p>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setModal(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Section Configs ──────────────────────────────────────────────────────────

const TOOL_STATUS = ['Available', 'In Use', 'Reserved', 'Maintenance Required', 'Out Of Service'];
const TOOL_CONDITION = ['New', 'Good', 'Fair', 'Damaged'];

const toolsConfig: ResourceConfig<Tool> = {
  title: 'Tools',
  endpoint: 'tools',
  searchPlaceholder: 'Search by ID, name, brand, serial…',
  filterField: 'status',
  filterOptions: TOOL_STATUS,
  listFn: toolsApi.list,
  createFn: toolsApi.create,
  updateFn: toolsApi.update,
  deleteFn: toolsApi.remove,
  columns: [
    { label: 'ID', render: (t) => <span className="font-mono text-xs">{t.toolId}</span> },
    { label: 'Name', render: (t) => <span className="font-medium">{t.toolName}</span> },
    { label: 'Category', render: (t) => t.category ?? '—' },
    { label: 'Brand', render: (t) => t.brand ?? '—' },
    { label: 'Condition', render: (t) => statusBadge(t.condition) },
    { label: 'Status', render: (t) => statusBadge(t.status) },
  ],
  viewFields: [
    { label: 'Tool ID', key: 'toolId' },
    { label: 'Name', key: 'toolName' },
    { label: 'Type', key: 'toolType' },
    { label: 'Category', key: 'category' },
    { label: 'Brand', key: 'brand' },
    { label: 'Serial Number', key: 'serialNumber' },
    { label: 'Condition', key: 'condition' },
    { label: 'Status', key: 'status' },
    { label: 'Purchase Date', key: (t) => fmt.date(t.purchaseDate) },
    { label: 'Purchase Cost', key: (t) => fmt.currency(t.purchaseCost) },
    { label: 'Usage Hours', key: (t) => fmt.num(t.usageHours) },
    { label: 'Notes', key: 'notes' },
  ],
  defaultForm: () => ({ toolId: '', toolName: '', category: '', brand: '', condition: 'Good', status: 'Available' }),
  formFields: [
    { label: 'Tool ID', name: 'toolId' },
    { label: 'Tool Name', name: 'toolName' },
    { label: 'Type', name: 'toolType' },
    { label: 'Category', name: 'category' },
    { label: 'Brand', name: 'brand' },
    { label: 'Serial Number', name: 'serialNumber' },
    { label: 'Condition', name: 'condition', options: TOOL_CONDITION },
    { label: 'Status', name: 'status', options: TOOL_STATUS },
    { label: 'Purchase Date', name: 'purchaseDate', type: 'date' },
    { label: 'Purchase Cost', name: 'purchaseCost', type: 'number' },
    { label: 'Notes', name: 'notes' },
  ],
  canCreate: (r) => ['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(r),
  canEdit: (r) => ['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(r),
  canDelete: (r) => ['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(r),
};

const PART_STATUS = ['In Stock', 'Low Stock', 'On Order', 'Out Of Stock'];
const PART_CONDITION = ['New', 'Used', 'Refurbished'];

const sparePartsConfig: ResourceConfig<SparePart> = {
  title: 'Spare Parts',
  endpoint: 'spare-parts',
  searchPlaceholder: 'Search by part number, name, brand…',
  filterField: 'status',
  filterOptions: PART_STATUS,
  listFn: sparePartsApi.list,
  createFn: sparePartsApi.create,
  updateFn: sparePartsApi.update,
  deleteFn: sparePartsApi.remove,
  columns: [
    { label: 'Part #', render: (p) => <span className="font-mono text-xs">{p.partNumber}</span> },
    { label: 'Name', render: (p) => <span className="font-medium">{p.partName}</span> },
    { label: 'Category', render: (p) => p.category },
    { label: 'Brand', render: (p) => p.brand ?? '—' },
    { label: 'Qty', render: (p) => p.quantity },
    { label: 'Status', render: (p) => statusBadge(p.status) },
  ],
  viewFields: [
    { label: 'Part Number', key: 'partNumber' },
    { label: 'Part Name', key: 'partName' },
    { label: 'Category', key: 'category' },
    { label: 'Sub-Category', key: 'subCategory' },
    { label: 'Brand', key: 'brand' },
    { label: 'OEM Number', key: 'oemNumber' },
    { label: 'Condition', key: 'partCondition' },
    { label: 'Status', key: 'status' },
    { label: 'Quantity', key: (p) => fmt.num(p.quantity) },
    { label: 'Reorder Level', key: (p) => fmt.num(p.reorderLevel) },
    { label: 'Unit Cost', key: (p) => fmt.currency(p.unitCost) },
    { label: 'Selling Price', key: (p) => fmt.currency(p.sellingPrice) },
    { label: 'Notes', key: 'notes' },
  ],
  defaultForm: () => ({
    partNumber: '',
    partName: '',
    category: '',
    brand: '',
    quantity: 0,
    reorderLevel: 0,
    unitCost: 0,
    sellingPrice: 0,
    partCondition: 'New',
    status: 'In Stock',
  }),
  formFields: [
    { label: 'Part Number', name: 'partNumber' },
    { label: 'Part Name', name: 'partName' },
    { label: 'Category', name: 'category' },
    { label: 'Sub-Category', name: 'subCategory' },
    { label: 'Brand', name: 'brand' },
    { label: 'OEM Number', name: 'oemNumber' },
    { label: 'Quantity', name: 'quantity', type: 'number' },
    { label: 'Reorder Level', name: 'reorderLevel', type: 'number' },
    { label: 'Unit Cost', name: 'unitCost', type: 'number' },
    { label: 'Selling Price', name: 'sellingPrice', type: 'number' },
    { label: 'Condition', name: 'partCondition', options: PART_CONDITION },
    { label: 'Status', name: 'status', options: PART_STATUS },
    { label: 'Notes', name: 'notes' },
  ],
  canCreate: (r) => ['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(r),
  canEdit: (r) => ['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(r),
  canDelete: (r) => ['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(r),
};

const VEHICLE_TYPES = ['Car', 'SUV', 'Van', 'Truck', 'Bus', 'Motorcycle'];
const VEHICLE_STATUS = ['Available', 'Reserved', 'Under Repair', 'Sold'];
const VEHICLE_CONDITION = ['Excellent', 'Good', 'Fair', 'Damaged'];

const vehiclesConfig: ResourceConfig<Vehicle> = {
  title: 'Vehicles',
  endpoint: 'vehicles',
  searchPlaceholder: 'Search by ID, make, model, reg. number…',
  filterField: 'status',
  filterOptions: VEHICLE_STATUS,
  listFn: vehiclesApi.list,
  createFn: vehiclesApi.create,
  updateFn: vehiclesApi.update,
  deleteFn: vehiclesApi.remove,
  columns: [
    { label: 'ID', render: (v) => <span className="font-mono text-xs">{v.vehicleId}</span> },
    { label: 'Vehicle', render: (v) => <span className="font-medium">{v.make} {v.model}</span> },
    { label: 'Year', render: (v) => v.year ?? '—' },
    { label: 'Reg. Number', render: (v) => v.registrationNumber ?? '—' },
    { label: 'Condition', render: (v) => statusBadge(v.condition) },
    { label: 'Status', render: (v) => statusBadge(v.status) },
  ],
  viewFields: [
    { label: 'Vehicle ID', key: 'vehicleId' },
    { label: 'Make', key: 'make' },
    { label: 'Model', key: 'model' },
    { label: 'Year', key: (v) => fmt.num(v.year) },
    { label: 'Type', key: 'vehicleType' },
    { label: 'VIN', key: 'vinNumber' },
    { label: 'Chassis #', key: 'chassisNumber' },
    { label: 'Engine #', key: 'engineNumber' },
    { label: 'Registration', key: 'registrationNumber' },
    { label: 'Fuel Type', key: 'fuelType' },
    { label: 'Transmission', key: 'transmission' },
    { label: 'Mileage', key: (v) => fmt.num(v.mileage) },
    { label: 'Color', key: 'color' },
    { label: 'Condition', key: 'condition' },
    { label: 'Status', key: 'status' },
    { label: 'Purchase Price', key: (v) => fmt.currency(v.purchasePrice) },
    { label: 'Selling Price', key: (v) => fmt.currency(v.sellingPrice) },
    { label: 'Insurance Expiry', key: (v) => fmt.date(v.insuranceExpiry) },
    { label: 'License Expiry', key: (v) => fmt.date(v.licenseExpiry) },
    { label: 'Last Service', key: (v) => fmt.date(v.lastServiceDate) },
    { label: 'Next Service', key: (v) => fmt.date(v.nextServiceDate) },
    { label: 'Notes', key: 'notes' },
  ],
  defaultForm: () => ({
    vehicleId: '',
    make: '',
    model: '',
    vehicleType: 'Car',
    condition: 'Good',
    status: 'Available',
  }),
  formFields: [
    { label: 'Vehicle ID', name: 'vehicleId' },
    { label: 'Make', name: 'make' },
    { label: 'Model', name: 'model' },
    { label: 'Year', name: 'year', type: 'number' },
    { label: 'Type', name: 'vehicleType', options: VEHICLE_TYPES },
    { label: 'Registration #', name: 'registrationNumber' },
    { label: 'VIN Number', name: 'vinNumber' },
    { label: 'Chassis #', name: 'chassisNumber' },
    { label: 'Fuel Type', name: 'fuelType' },
    { label: 'Mileage', name: 'mileage', type: 'number' },
    { label: 'Color', name: 'color' },
    { label: 'Condition', name: 'condition', options: VEHICLE_CONDITION },
    { label: 'Status', name: 'status', options: VEHICLE_STATUS },
    { label: 'Purchase Price', name: 'purchasePrice', type: 'number' },
    { label: 'Selling Price', name: 'sellingPrice', type: 'number' },
    { label: 'Notes', name: 'notes' },
  ],
  canCreate: (r) => ['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(r),
  canEdit: (r) => ['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(r),
  canDelete: (r) => ['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(r),
};

const TECH_STATUS = ['Active', 'Inactive', 'On Leave'];

const techniciansConfig: ResourceConfig<Technician> = {
  title: 'Technicians',
  endpoint: 'technicians',
  searchPlaceholder: 'Search by ID, name, email, department…',
  filterField: 'status',
  filterOptions: TECH_STATUS,
  listFn: techniciansApi.list,
  createFn: techniciansApi.create,
  updateFn: techniciansApi.update,
  deleteFn: techniciansApi.remove,
  columns: [
    { label: 'Employee ID', render: (t) => <span className="font-mono text-xs">{t.employeeId}</span> },
    { label: 'Name', render: (t) => <span className="font-medium">{t.name}</span> },
    { label: 'Email', render: (t) => <span className="text-ulss-gold/50">{t.email}</span> },
    { label: 'Department', render: (t) => t.department ?? '—' },
    { label: 'Status', render: (t) => statusBadge(t.status) },
  ],
  viewFields: [
    { label: 'Employee ID', key: 'employeeId' },
    { label: 'Name', key: 'name' },
    { label: 'Email', key: 'email' },
    { label: 'Phone', key: 'phone' },
    { label: 'Designation', key: 'designation' },
    { label: 'Department', key: 'department' },
    { label: 'Status', key: 'status' },
    { label: 'Hire Date', key: (t) => fmt.date(t.hireDate) },
    { label: 'Address', key: 'address' },
    { label: 'Emergency Contact', key: 'emergencyContact' },
  ],
  defaultForm: () => ({ employeeId: '', name: '', email: '', phone: '', department: '', status: 'Active' }),
  formFields: [
    { label: 'Employee ID', name: 'employeeId' },
    { label: 'Name', name: 'name' },
    { label: 'Email', name: 'email', type: 'email' },
    { label: 'Phone', name: 'phone' },
    { label: 'Designation', name: 'designation' },
    { label: 'Department', name: 'department' },
    { label: 'Status', name: 'status', options: TECH_STATUS },
    { label: 'Hire Date', name: 'hireDate', type: 'date' },
    { label: 'Address', name: 'address' },
    { label: 'Emergency Contact', name: 'emergencyContact' },
  ],
  canCreate: (r) => ['SUPER_ADMIN', 'INVENTORY_MANAGER', 'WORKSHOP_MANAGER'].includes(r),
  canEdit: (r) => ['SUPER_ADMIN', 'INVENTORY_MANAGER', 'WORKSHOP_MANAGER'].includes(r),
  canDelete: (r) => ['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(r),
};

const MAINT_STATUS = ['Pending', 'In Progress', 'Completed', 'Overdue'];
const MAINT_PRIORITY = ['Low', 'Medium', 'High', 'Critical'];

const maintenanceConfig: ResourceConfig<MaintenanceRecord> = {
  title: 'Maintenance',
  endpoint: 'maintenance',
  searchPlaceholder: 'Search by ID, type…',
  filterField: 'status',
  filterOptions: MAINT_STATUS,
  listFn: maintenanceApi.list,
  createFn: maintenanceApi.create,
  updateFn: maintenanceApi.update,
  deleteFn: maintenanceApi.remove,
  columns: [
    { label: 'Maintenance ID', render: (m) => <span className="font-mono text-xs">{m.maintenanceId}</span> },
    { label: 'Type', render: (m) => m.maintenanceType ?? '—' },
    { label: 'Priority', render: (m) => statusBadge(m.priority) },
    { label: 'Service Date', render: (m) => fmt.date(m.serviceDate) },
    { label: 'Cost', render: (m) => fmt.currency(m.cost) },
    { label: 'Status', render: (m) => statusBadge(m.status) },
  ],
  viewFields: [
    { label: 'Maintenance ID', key: 'maintenanceId' },
    { label: 'Type', key: 'maintenanceType' },
    { label: 'Priority', key: 'priority' },
    { label: 'Status', key: 'status' },
    { label: 'Service Date', key: (m) => fmt.date(m.serviceDate) },
    { label: 'Next Service Date', key: (m) => fmt.date(m.nextServiceDate) },
    { label: 'Completed Date', key: (m) => fmt.date(m.completedDate) },
    { label: 'Labor Hours', key: (m) => fmt.num(m.laborHours) },
    { label: 'Cost', key: (m) => fmt.currency(m.cost) },
    { label: 'Description', key: 'description' },
    { label: 'Remarks', key: 'remarks' },
  ],
  defaultForm: () => ({
    maintenanceId: '',
    maintenanceType: '',
    priority: 'Medium',
    status: 'Pending',
    cost: 0,
    laborHours: 0,
  }),
  formFields: [
    { label: 'Maintenance ID', name: 'maintenanceId' },
    { label: 'Type', name: 'maintenanceType' },
    { label: 'Priority', name: 'priority', options: MAINT_PRIORITY },
    { label: 'Status', name: 'status', options: MAINT_STATUS },
    { label: 'Service Date', name: 'serviceDate', type: 'date' },
    { label: 'Next Service Date', name: 'nextServiceDate', type: 'date' },
    { label: 'Labor Hours', name: 'laborHours', type: 'number' },
    { label: 'Cost', name: 'cost', type: 'number' },
    { label: 'Description', name: 'description' },
    { label: 'Remarks', name: 'remarks' },
  ],
  canCreate: (r) => ['SUPER_ADMIN', 'WORKSHOP_MANAGER'].includes(r),
  canEdit: (r) => ['SUPER_ADMIN', 'WORKSHOP_MANAGER'].includes(r),
  canDelete: (r) => ['SUPER_ADMIN', 'WORKSHOP_MANAGER'].includes(r),
};

// ─── Supplier Config ──────────────────────────────────────────────────────────

const SUPPLIER_STATUS = ['Active', 'Inactive'];

const suppliersConfig: ResourceConfig<Supplier> = {
  title: 'Suppliers',
  endpoint: 'suppliers',
  searchPlaceholder: 'Search by code, name, email…',
  filterField: 'status',
  filterOptions: SUPPLIER_STATUS,
  listFn: suppliersApi.list,
  createFn: suppliersApi.create,
  updateFn: suppliersApi.update,
  deleteFn: suppliersApi.remove,
  columns: [
    { label: 'Code',    render: (s) => <span className="font-mono text-xs">{s.supplierCode}</span> },
    { label: 'Name',    render: (s) => <span className="font-medium">{s.name}</span> },
    { label: 'Email',   render: (s) => <span className="text-ulss-gold/50">{s.email ?? '—'}</span> },
    { label: 'Phone',   render: (s) => s.phone ?? '—' },
    { label: 'Website', render: (s) => s.website
        ? <a href={s.website} target="_blank" rel="noreferrer" className="text-blue-400 underline text-xs">{s.website}</a>
        : '—'
    },
    { label: 'Status',  render: (s) => statusBadge(s.status) },
  ],
  viewFields: [
    { label: 'Supplier Code', key: 'supplierCode' },
    { label: 'Name',          key: 'name' },
    { label: 'Email',         key: 'email' },
    { label: 'Phone',         key: 'phone' },
    { label: 'Website',       key: 'website' },
    { label: 'Address',       key: 'address' },
    { label: 'Status',        key: 'status' },
    { label: 'Created',       key: (s) => fmt.date(s.createdAt) },
    { label: 'Updated',       key: (s) => fmt.date(s.updatedAt) },
  ],
  defaultForm: () => ({
    supplierCode: '',
    name: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    status: 'Active',
  }),
  formFields: [
    { label: 'Supplier Code', name: 'supplierCode' },
    { label: 'Name',          name: 'name' },
    { label: 'Email',         name: 'email',   type: 'email' },
    { label: 'Phone',         name: 'phone' },
    { label: 'Website',       name: 'website', type: 'url' },
    { label: 'Address',       name: 'address' },
    { label: 'Status',        name: 'status',  options: SUPPLIER_STATUS },
  ],
  canCreate: (r) => ['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(r),
  canEdit:   (r) => ['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(r),
  canDelete: (r) => ['SUPER_ADMIN'].includes(r),
};

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }: { onLogin: (session: { user: AuthUser; accessToken: string; refreshToken: string }) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(email, password);
      const session = res.data as any;
      const accessToken = session.accessToken ?? session.token;
      const refreshToken = session.refreshToken ?? '';
      const user = session.user;
      if (!accessToken) throw new Error('No access token received from server.');
      onLogin({ user, accessToken, refreshToken });
    } catch (e: any) {
      setError(e.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-ulss-black">
      {/* ── Left Panel ── */}
      <div className="hidden md:flex flex-col justify-between w-1/2 px-16 py-14 bg-gradient-to-br from-ulss-black via-ulss-black to-ulss-gold/10 border-r border-ulss-gold/10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-ulss-gold/10 text-ulss-gold">
            <Wrench size={22} />
          </div>
          <div>
            <p className="font-bold text-white tracking-wide text-sm">ULSS</p>
            <p className="text-xs text-ulss-gold/60">Fleet & Inventory</p>
          </div>
        </div>

        {/* Center content */}
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Manage your fleet <br />
              <span className="text-ulss-gold">with precision.</span>
            </h2>
            <p className="mt-4 text-sm text-white/40 leading-relaxed max-w-xs">
              A unified platform for tools, spare parts, vehicles, technicians, and maintenance — all in one place.
            </p>
          </div>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              { icon: <Wrench size={15} />, label: 'Tool & Equipment Tracking' },
              { icon: <Package size={15} />, label: 'Spare Parts Inventory' },
              { icon: <Truck size={15} />, label: 'Vehicle Fleet Management' },
              { icon: <CalendarClock size={15} />, label: 'Maintenance Scheduling' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-3 text-sm text-white/60">
                <div className="text-ulss-gold">{icon}</div>
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs text-white/20">© {new Date().getFullYear()} ULSS Inventories. All rights reserved.</p>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-3 mb-8">
            <div className="p-2 rounded-lg bg-ulss-gold/10 text-ulss-gold">
              <Wrench size={20} />
            </div>
            <div>
              <p className="font-bold text-white text-sm">ULSS Admin</p>
              <p className="text-xs text-ulss-gold/60">Fleet & Inventory</p>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white/[0.03] border border-ulss-gold/20 rounded-2xl shadow-2xl p-8">
            <div className="mb-6">
              <div className="p-2.5 rounded-xl bg-ulss-gold/10 text-ulss-gold w-fit mb-4">
                <LockKeyhole size={22} />
              </div>
              <h1 className="text-xl font-bold text-white">Welcome back</h1>
              <p className="text-xs text-white/40 mt-1">Sign in to your admin account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-ulss-gold/70 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-ulss-gold/20 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-ulss-gold/40 transition"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <label className="block text-xs text-ulss-gold/70 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-ulss-gold/20 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ulss-gold/40 transition"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <AlertTriangle size={14} /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-ulss-gold px-4 py-2.5 text-sm font-semibold text-ulss-black hover:bg-ulss-gold/90 disabled:opacity-50 transition-colors mt-2"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
              <a
              href="https://ulss-spareparts.vercel.app/"
  className="w-full block text-center rounded-lg border border-ulss-gold/20 px-4 py-2.5 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white transition-colors mt-2"
>
  Back to website
</a>
              
              
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────

function ChangePasswordModal({ token, onClose }: { token: string; onClose: () => void }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.changePassword(token, current, next);
      setSuccess(true);
      setTimeout(onClose, 1500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Change Password" onClose={onClose}>
      {success ? (
        <p className="text-emerald-600 text-sm py-4">Password changed successfully.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Current Password</label>
            <input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">New Password</label>
            <input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV: Array<{ id: Section; label: string; icon: React.ReactNode }> = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} /> },
  { id: 'tools', label: 'Tools', icon: <Wrench size={18} /> },
  { id: 'spare-parts', label: 'Spare Parts', icon: <Package size={18} /> },
  { id: 'vehicles', label: 'Vehicles', icon: <Truck size={18} /> },
  { id: 'technicians', label: 'Technicians', icon: <Users size={18} /> },
  { id: 'maintenance', label: 'Maintenance', icon: <CalendarClock size={18} /> },
  { id: 'suppliers',   label: 'Suppliers',   icon: <Box size={18} /> },
  { id: 'import', label: 'Bulk Import', icon: <FileSpreadsheet size={18} /> },

];

function Sidebar({
  section,
  onSection,
  user,
  onLogout,
  onChangePassword,
  open,
  onClose,
}: {
  section: Section;
  onSection: (s: Section) => void;
  user: AuthUser | null;
  onLogout: () => void;
  onChangePassword: () => void;
  open: boolean;
  onClose: () => void;
}) {
  const role = getUserRole(user);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed z-40 top-0 left-0 h-full w-60 bg-gray-900 text-white flex flex-col
          transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:z-auto
        `}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <p className="font-bold text-sm tracking-wide">ULSS Admin</p>
          <p className="text-xs text-gray-400 mt-0.5">Fleet & Inventory</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => { onSection(id); onClose(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                section === id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-xs font-medium text-white truncate">{user?.name}</p>
          <p className="text-xs text-gray-400 truncate">{role}</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onChangePassword}
              title="Change password"
              className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={onLogout}
              title="Log out"
              className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function AdminApp() {
  const [session, setSession] = useState(() => authStorage.get());
  const [section, setSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const token = session?.accessToken ?? '';
  const user = session?.user ?? null;
  const userRole = getUserRole(user);

  const handleLogin = (s: { user: AuthUser; accessToken: string; refreshToken: string }) => {
    authStorage.set(s);
    setSession(s);
  };

  const handleLogout = async () => {
    try {
      if (token) await authApi.logout(token);
    } catch {
      // ignore — log out locally regardless
    }
    authStorage.clear();
    setSession(null);
  };

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const sectionEl = (() => {
    switch (section) {
      case 'dashboard':
        return <DashboardSection token={token} />;
      case 'tools':
        return <ResourceSection config={toolsConfig} token={token} userRole={userRole} />;
      case 'spare-parts':
        return <ResourceSection config={sparePartsConfig} token={token} userRole={userRole} />;
      case 'vehicles':
        return <ResourceSection config={vehiclesConfig} token={token} userRole={userRole} />;
      case 'technicians':
        return <ResourceSection config={techniciansConfig} token={token} userRole={userRole} />;
      case 'maintenance':
        return <ResourceSection config={maintenanceConfig} token={token} userRole={userRole} />;
      case 'suppliers':
        return <ResourceSection config={suppliersConfig} token={token} userRole={userRole} />;
      case 'import':
        return <ExcelImport token={token} />;
    }
  })();

  return (
<div className="flex h-screen overflow-hidden bg-ulss-black">
      <Sidebar
        section={section}
        onSection={setSection}
        user={user}
        onLogout={handleLogout}
        onChangePassword={() => setShowChangePassword(true)}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile only) */}
      <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-ulss-black border-b border-ulss-gold/10">
  <button
    onClick={() => setSidebarOpen(true)}
    className="p-1.5 rounded hover:bg-white/10 text-white/70"
  >
    <ChevronDown size={18} className="rotate-90" />
  </button>
  <span className="font-semibold text-white text-sm">
    {NAV.find((n) => n.id === section)?.label}
  </span>
</header>

        <main className="flex-1 overflow-y-auto p-5 md:p-8 bg-ulss-black">
          {sectionEl}
        </main>
      </div>

      {/* Change Password modal */}
      {showChangePassword && (
        <ChangePasswordModal token={token} onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
}
