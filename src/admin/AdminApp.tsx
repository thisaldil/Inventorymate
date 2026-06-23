import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Box,
  CalendarClock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleSlash,
  Database,
  Download,
  Edit,
  Eye,
  Filter,
  Inbox,
  LogOut,
  LockKeyhole,
  Menu,
  Package,
  PanelLeftClose,
  PanelLeft,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
  TrendingUp,
  TrendingDown,
  Truck,
  Users,
  Wrench,
  X,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  ArrowUp,
  ArrowDown,
  Info,
  XCircle,
} from 'lucide-react';

import { Chart, registerables, type ChartOptions } from 'chart.js';
Chart.register(...registerables);

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
type SortDir = 'asc' | 'desc' | null;

// ─── Chart palette ─────────────────────────────────────────────────────────────

const C = {
  gold: '#C9A84C',
  teal: '#1D9E75',
  blue: '#378ADD',
  amber: '#EF9F27',
  red: '#E24B4A',
  purple: '#7F77DD',
  gray: '#888780',
  grid: 'rgba(201,168,76,0.08)',
  tick: 'rgba(255,255,255,0.30)',
};

const TOOLTIP_BASE = {
  backgroundColor: 'rgba(12,12,12,0.94)',
  titleColor: C.gold,
  bodyColor: 'rgba(255,255,255,0.72)',
  borderColor: 'rgba(201,168,76,0.22)',
  borderWidth: 1,
  padding: 10,
  cornerRadius: 8,
};

const AXIS_BASE = {
  grid: { color: C.grid },
  ticks: { color: C.tick, font: { size: 11 } },
  border: { color: 'transparent' },
};

// ─── Toast System ───────────────────────────────────────────────────────────────

type ToastType = 'success' | 'error' | 'info';
type Toast = { id: number; type: ToastType; message: string };

const ToastCtx = createContext<{
  push: (type: ToastType, message: string) => void;
}>({ push: () => {} });

function useToast() {
  return useContext(ToastCtx);
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const push = useCallback((type: ToastType, message: string) => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4000);
  }, []);

  const remove = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={18} className="text-emerald-400" />,
    error: <XCircle size={18} className="text-red-400" />,
    info: <Info size={18} className="text-blue-400" />,
  };
  const borders: Record<ToastType, string> = {
    success: 'border-emerald-500/30',
    error: 'border-red-500/30',
    info: 'border-blue-500/30',
  };

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed z-[100] bottom-5 right-5 flex flex-col gap-2 w-80 max-w-[90vw]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${borders[t.type]} bg-[#101010]/95 backdrop-blur shadow-2xl animate-[slideIn_.25s_ease]`}
          >
            <div className="mt-0.5 flex-shrink-0">{icons[t.type]}</div>
            <p className="flex-1 text-sm text-white/85">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-white/30 hover:text-white">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </ToastCtx.Provider>
  );
}

// ─── Confirm Dialog System ──────────────────────────────────────────────────────

const ConfirmCtx = createContext<{
  confirm: (opts: { title: string; message: string; danger?: boolean }) => Promise<boolean>;
}>({ confirm: async () => false });

function useConfirm() {
  return useContext(ConfirmCtx);
}

function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    title: string;
    message: string;
    danger?: boolean;
    resolve?: (v: boolean) => void;
  } | null>(null);

  const confirm = useCallback(
    (opts: { title: string; message: string; danger?: boolean }) =>
      new Promise<boolean>((resolve) => {
        setState({ ...opts, resolve });
      }),
    [],
  );

  const close = (v: boolean) => {
    state?.resolve?.(v);
    setState(null);
  };

  return (
    <ConfirmCtx.Provider value={{ confirm }}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_.15s_ease]">
          <div className="bg-[#0f0f0f] border border-ulss-gold/20 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-[popIn_.18s_ease]">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${state.danger ? 'bg-red-500/15 text-red-400' : 'bg-ulss-gold/15 text-ulss-gold'}`}>
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-semibold text-white">{state.title}</h3>
            </div>
            <p className="mb-6 text-sm text-white/55">{state.message}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => close(false)}
                className="px-4 py-2 text-sm border rounded-lg border-ulss-gold/20 text-white/60 hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={() => close(true)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg ${
                  state.danger
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-ulss-gold text-ulss-black hover:bg-ulss-gold/90'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
          <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes popIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}`}</style>
        </div>
      )}
    </ConfirmCtx.Provider>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getUserRole = (user: AuthUser | null): string => {
  if (!user) return '';
  if (typeof user.role === 'string') return user.role;
  return user.role?.name ?? '';
};

const roleLabel = (r: string) =>
  r ? r.split('_').map((w) => w[0] + w.slice(1).toLowerCase()).join(' ') : '';

const initials = (name?: string) =>
  (name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const fmt = {
  currency: (n?: number) =>
    n == null
      ? '—'
      : `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  date: (s?: string) => (s ? new Date(s).toLocaleDateString() : '—'),
  num: (n?: number) => (n == null ? '—' : n.toLocaleString()),
};

function statusBadge(status: string) {
  const map: Record<string, string> = {
    Available: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25',
    Active: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25',
    'In Stock': 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25',
    Completed: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25',
    New: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25',
    Excellent: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25',
    Good: 'bg-teal-500/15 text-teal-300 ring-1 ring-teal-500/25',
    'In Use': 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/25',
    'In Progress': 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/25',
    Reserved: 'bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/25',
    'On Order': 'bg-violet-500/15 text-violet-300 ring-1 ring-violet-500/25',
    Pending: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25',
    'Low Stock': 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25',
    Fair: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25',
    Medium: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/25',
    'Maintenance Required': 'bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/25',
    'Under Repair': 'bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/25',
    High: 'bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/25',
    'Out Of Service': 'bg-red-500/15 text-red-300 ring-1 ring-red-500/25',
    'Out Of Stock': 'bg-red-500/15 text-red-300 ring-1 ring-red-500/25',
    Overdue: 'bg-red-500/15 text-red-300 ring-1 ring-red-500/25',
    Damaged: 'bg-red-500/15 text-red-300 ring-1 ring-red-500/25',
    Critical: 'bg-red-500/15 text-red-300 ring-1 ring-red-500/25',
    Inactive: 'bg-gray-500/15 text-gray-300 ring-1 ring-gray-500/25',
    Sold: 'bg-gray-500/15 text-gray-300 ring-1 ring-gray-500/25',
    Low: 'bg-gray-500/15 text-gray-300 ring-1 ring-gray-500/25',
    'On Leave': 'bg-gray-500/15 text-gray-300 ring-1 ring-gray-500/25',
  };
  const cls = map[status] ?? 'bg-gray-500/15 text-gray-300 ring-1 ring-gray-500/25';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

// CSV export utility
function exportToCSV<T extends Record<string, any>>(rows: T[], filename: string) {
  if (!rows.length) return;
  const keys = Object.keys(rows[0]).filter((k) => k !== '__v');
  const escape = (v: any) => {
    const s = v == null ? '' : String(v);
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = [
    keys.join(','),
    ...rows.map((r) => keys.map((k) => escape(r[k])).join(',')),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Debounce hook
function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Animated counter hook
function useCountUp(target: number, duration = 800) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
    <div className="flex items-center justify-end gap-2 mt-4">
      <button
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="p-1.5 rounded-lg border border-ulss-gold/15 disabled:opacity-30 hover:bg-white/10 transition"
      >
        <ChevronLeft size={16} className="text-white/50" />
      </button>
      <span className="px-2 text-sm text-white/40">
        Page <span className="font-medium text-white/70">{page}</span> of {pages}
      </span>
      <button
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
        className="p-1.5 rounded-lg border border-ulss-gold/15 disabled:opacity-30 hover:bg-white/10 transition"
      >
        <ChevronRight size={16} className="text-white/50" />
      </button>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
  size = 'lg',
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'lg' | 'xl';
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_.15s_ease]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-[#0f0f0f] border border-ulss-gold/20 rounded-2xl shadow-2xl w-full ${
          size === 'xl' ? 'max-w-2xl' : 'max-w-lg'
        } max-h-[90vh] flex flex-col animate-[popIn_.18s_ease]`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-ulss-gold/10">
          <h2 className="font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/50">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 px-6 py-4 overflow-y-auto">{children}</div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes popIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="mb-3 rounded-lg bg-white/[0.02] px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-ulss-gold/45 mb-0.5">{label}</p>
      <p className="text-sm break-words text-white/85">{value ?? '—'}</p>
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
      <label className="block mb-1 text-xs text-ulss-gold/60">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 text-sm text-white transition border rounded-lg border-ulss-gold/20 bg-white/5 placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-ulss-gold/40"
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
      <label className="block mb-1 text-xs text-ulss-gold/60">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-ulss-gold/20 bg-[#0f0f0f] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-ulss-gold/40 transition"
      >
        <option value="">Select...</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

// Skeleton row loader
function SkeletonRows({ cols, rows = 6 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-b border-ulss-gold/5">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3.5">
              <div
                className="h-3 rounded bg-white/5 animate-pulse"
                style={{ width: `${50 + ((r + c) % 4) * 12}%` }}
              />
            </td>
          ))}
          <td className="px-4 py-3.5">
            <div className="w-12 h-3 ml-auto rounded bg-white/5 animate-pulse" />
          </td>
        </tr>
      ))}
    </>
  );
}

// Empty state
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-white/[0.03] mb-3">
        <Inbox size={28} className="text-ulss-gold/40" />
      </div>
      <p className="text-sm text-white/40">{message}</p>
    </div>
  );
}

// ─── Chart wrapper card ───────────────────────────────────────────────────────

function ChartCard({
  title,
  children,
  legend,
}: {
  title: string;
  children: React.ReactNode;
  legend?: Array<{ label: string; color: string }>;
}) {
  return (
    <div className="rounded-2xl border border-ulss-gold/12 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-5 hover:border-ulss-gold/25 transition-colors">
      <p className="mb-3 text-sm font-semibold text-ulss-gold">{title}</p>
      {legend && (
        <div className="flex flex-wrap gap-3 mb-4">
          {legend.map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1.5 text-xs text-white/50">
              <span
                className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ background: color }}
              />
              {label}
            </span>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Chart Components ──────────────────────────────────────────────────────────

function HBarChart({
  labels,
  data,
  colors,
  height = 220,
}: {
  labels: string[];
  data: number[];
  colors: string[];
  height?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const inst = useRef<Chart | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    inst.current?.destroy();
    inst.current = new Chart(ref.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors.map((c) => c + 'bb'),
            borderColor: colors,
            borderWidth: 1.5,
            borderRadius: 5,
            borderSkipped: false,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { ...TOOLTIP_BASE } },
        scales: {
          x: { ...AXIS_BASE },
          y: {
            grid: { color: 'transparent' },
            ticks: { color: 'rgba(255,255,255,0.50)', font: { size: 11 } },
            border: { color: 'transparent' },
          },
        },
      } as ChartOptions<'bar'>,
    });
    return () => inst.current?.destroy();
  }, [JSON.stringify(labels), JSON.stringify(data)]);
  return (
    <div style={{ position: 'relative', height }}>
      <canvas ref={ref} />
    </div>
  );
}

function VBarChart({
  labels,
  data,
  color,
  height = 220,
}: {
  labels: string[];
  data: number[];
  color: string;
  height?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const inst = useRef<Chart | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    inst.current?.destroy();
    inst.current = new Chart(ref.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { data, backgroundColor: color + '66', borderColor: color, borderWidth: 1.5, borderRadius: 4 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { ...TOOLTIP_BASE } },
        scales: {
          x: { ...AXIS_BASE, ticks: { color: C.tick, font: { size: 10 }, maxRotation: 0, autoSkip: false } },
          y: { ...AXIS_BASE },
        },
      } as ChartOptions<'bar'>,
    });
    return () => inst.current?.destroy();
  }, [JSON.stringify(labels), JSON.stringify(data)]);
  return (
    <div style={{ position: 'relative', height }}>
      <canvas ref={ref} />
    </div>
  );
}

function DoughnutChart({
  labels,
  data,
  colors,
  height = 200,
}: {
  labels: string[];
  data: number[];
  colors: string[];
  height?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const inst = useRef<Chart | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    inst.current?.destroy();
    inst.current = new Chart(ref.current, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          { data, backgroundColor: colors.map((c) => c + 'bb'), borderColor: colors, borderWidth: 1.5, hoverOffset: 6 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: { legend: { display: false }, tooltip: { ...TOOLTIP_BASE } },
      } as ChartOptions<'doughnut'>,
    });
    return () => inst.current?.destroy();
  }, [JSON.stringify(labels), JSON.stringify(data)]);
  return (
    <div style={{ position: 'relative', height }}>
      <canvas ref={ref} />
    </div>
  );
}

function LineChart({
  labels,
  data,
  color,
  height = 220,
}: {
  labels: string[];
  data: number[];
  color: string;
  height?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const inst = useRef<Chart | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    inst.current?.destroy();
    inst.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            data,
            borderColor: color,
            backgroundColor: color + '22',
            pointBackgroundColor: color,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2,
            fill: true,
            tension: 0.38,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { ...TOOLTIP_BASE } },
        scales: {
          x: { ...AXIS_BASE, ticks: { color: C.tick, font: { size: 10 }, maxRotation: 0, autoSkip: false } },
          y: { ...AXIS_BASE },
        },
      } as ChartOptions<'line'>,
    });
    return () => inst.current?.destroy();
  }, [JSON.stringify(labels), JSON.stringify(data)]);
  return (
    <div style={{ position: 'relative', height }}>
      <canvas ref={ref} />
    </div>
  );
}

// ─── KPI Card (with animated counter + optional trend) ──────────────────────────

function KpiCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  trend,
  isCurrency,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: number;
  isCurrency?: boolean;
}) {
  const animated = useCountUp(value);
  const display = isCurrency
    ? `$${Math.round(animated).toLocaleString()}`
    : Math.round(animated).toLocaleString();

  return (
    <div className="group relative overflow-hidden flex items-center gap-3 rounded-2xl border border-ulss-gold/12 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-4 hover:border-ulss-gold/30 transition-all hover:-translate-y-0.5">
      <div className="rounded-xl p-2.5 flex-shrink-0" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-white/40 mb-0.5 leading-none truncate">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-xl font-semibold leading-none text-white">{display}</p>
          {trend != null && trend !== 0 && (
            <span
              className={`flex items-center gap-0.5 text-[10px] font-medium ${
                trend > 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {trend > 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

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
      <div className="space-y-6">
        <div className="w-48 h-8 rounded bg-white/5 animate-pulse" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-72 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center gap-2 p-4 text-red-400 border bg-red-500/10 border-red-500/20 rounded-xl">
        <AlertTriangle size={18} /> {error}
      </div>
    );
  if (!data) return null;

  const { cards, charts } = data;

  const toolStatusLabels = charts.toolStatusDistribution.map((d) => d._id);
  const toolStatusData = charts.toolStatusDistribution.map((d) => d.count);
  const toolStatusColors = [C.teal, C.blue, C.purple, C.amber, C.red, C.gray];

  const partStatusLabels = charts.sparePartStatusDistribution.map((d) => d._id);
  const partStatusData = charts.sparePartStatusDistribution.map((d) => d.count);
  const partStatusColors = [C.teal, C.amber, C.blue, C.red, C.purple];
  const partTotal = partStatusData.reduce((s, n) => s + n, 0) || 1;

  const maintLabels = charts.monthlyMaintenanceActivities.map((d) => MONTHS[(d._id - 1) % 12]);
  const maintData = charts.monthlyMaintenanceActivities.map((d) => d.count);

  const invLabels = charts.inventoryGrowth.map((d) => MONTHS[(d._id - 1) % 12]);
  const invData = charts.inventoryGrowth.map((d) => d.count);

  return (
    <div className="space-y-6">
      <div className="flex items-baseline gap-3">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <span className="text-lg font-normal text-ulss-gold/55">Overview</span>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        <KpiCard label="Total Tools" value={cards.totalTools} icon={<Wrench size={18} />} iconBg="rgba(201,168,76,0.12)" iconColor={C.gold} />
        <KpiCard label="Available Tools" value={cards.availableTools} icon={<CheckCircle size={18} />} iconBg="rgba(29,158,117,0.12)" iconColor={C.teal} />
        <KpiCard label="In Use" value={cards.inUseTools} icon={<Settings size={18} />} iconBg="rgba(55,138,221,0.12)" iconColor={C.blue} />
        <KpiCard label="Maintenance Req." value={cards.maintenanceRequiredTools} icon={<AlertTriangle size={18} />} iconBg="rgba(239,159,39,0.12)" iconColor={C.amber} />
        <KpiCard label="Spare Parts" value={cards.totalSpareParts} icon={<Package size={18} />} iconBg="rgba(127,119,221,0.12)" iconColor={C.purple} />
        <KpiCard label="Low Stock" value={cards.lowStockParts} icon={<TrendingUp size={18} />} iconBg="rgba(239,159,39,0.12)" iconColor={C.amber} />
        <KpiCard label="Out of Stock" value={cards.outOfStockParts} icon={<CircleSlash size={18} />} iconBg="rgba(226,75,74,0.12)" iconColor={C.red} />
        <KpiCard label="Vehicles" value={cards.totalVehicles} icon={<Truck size={18} />} iconBg="rgba(55,138,221,0.12)" iconColor={C.blue} />
        <KpiCard label="Active Technicians" value={cards.activeTechnicians} icon={<Users size={18} />} iconBg="rgba(29,158,117,0.12)" iconColor={C.teal} />
        <KpiCard label="Pending Maint." value={cards.pendingMaintenance} icon={<Clock size={18} />} iconBg="rgba(239,159,39,0.12)" iconColor={C.amber} />
        <KpiCard label="Overdue" value={cards.overdueMaintenance} icon={<CalendarClock size={18} />} iconBg="rgba(226,75,74,0.12)" iconColor={C.red} />
        <KpiCard label="Inventory Value" value={cards.inventoryValue} isCurrency icon={<Database size={18} />} iconBg="rgba(201,168,76,0.12)" iconColor={C.gold} />
      </div>

      <div className="border-t border-ulss-gold/8" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ChartCard
          title="Tool Status Distribution"
          legend={toolStatusLabels.map((l, i) => ({ label: l, color: toolStatusColors[i % toolStatusColors.length] }))}
        >
          <HBarChart labels={toolStatusLabels} data={toolStatusData} colors={toolStatusColors} height={Math.max(180, toolStatusLabels.length * 42)} />
        </ChartCard>

        <ChartCard
          title="Spare Part Status"
          legend={partStatusLabels.map((l, i) => ({
            label: `${l} (${Math.round((partStatusData[i] / partTotal) * 100)}%)`,
            color: partStatusColors[i % partStatusColors.length],
          }))}
        >
          <DoughnutChart labels={partStatusLabels} data={partStatusData} colors={partStatusColors} height={200} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ChartCard title="Maintenance Activity — Monthly" legend={[{ label: 'Activities', color: C.gold }]}>
          <VBarChart labels={maintLabels} data={maintData} color={C.gold} height={220} />
        </ChartCard>
        <ChartCard title="Inventory Growth — Parts Added" legend={[{ label: 'Parts Added', color: C.teal }]}>
          <LineChart labels={invLabels} data={invData} color={C.teal} height={220} />
        </ChartCard>
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
  columns: Array<{ label: string; sortKey?: string; render: (item: T) => React.ReactNode }>;
  viewFields: Array<{ label: string; key: keyof T | ((item: T) => React.ReactNode) }>;
  defaultForm: () => Record<string, string | number>;
  formFields: Array<{
    label: string;
    name: string;
    type?: string;
    options?: string[] | ((form: Record<string, string | number>) => string[]);
    resetFields?: string[];
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
  const toast = useToast();
  const { confirm } = useConfirm();

  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 450);
  const [filter, setFilter] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [modal, setModal] = useState<{ mode: ModalMode; item?: T } | null>(null);
  const [form, setForm] = useState<Record<string, string | number>>({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    const params: ListParams = { page, limit: 15, search: debouncedSearch };
    if (filter && config.filterField) params[config.filterField] = filter;
    config
      .listFn(token, params)
      .then((res: any) => {
        setItems(res.data ?? []);
        setPages(res.pagination?.pages ?? 1);
        setTotal(res.pagination?.total ?? (res.data?.length ?? 0));
      })
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page, filter, debouncedSearch, token, config]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [debouncedSearch, filter]);

  // client-side sort of current page
  const sortedItems = useMemo(() => {
    if (!sortKey || !sortDir) return items;
    return [...items].sort((a: any, b: any) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [items, sortKey, sortDir]);

  const toggleSort = (key?: string) => {
    if (!key) return;
    if (sortKey !== key) { setSortKey(key); setSortDir('asc'); }
    else if (sortDir === 'asc') setSortDir('desc');
    else { setSortKey(null); setSortDir(null); }
  };

  const openCreate = () => {
    setForm(config.defaultForm());
    setFormError('');
    setModal({ mode: 'create' });
  };

  const openEdit = (item: T) => {
    const flat: Record<string, string | number> = {};
    Object.entries(item).forEach(([k, v]) => {
      if (typeof v === 'string' || typeof v === 'number') flat[k] = v;
    });
    setForm(flat);
    setFormError('');
    setModal({ mode: 'edit', item });
  };

  const openView = (item: T) => setModal({ mode: 'view', item });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const field = config.formFields.find((f) => f.name === name);
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      field?.resetFields?.forEach((r) => { next[r] = ''; });
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setFormError('');
    try {
      if (modal?.mode === 'create') {
        await config.createFn(token, form);
        toast.push('success', `${config.title.replace(/s$/, '')} created successfully.`);
      } else if (modal?.mode === 'edit' && modal.item) {
        await config.updateFn(token, modal.item._id, form);
        toast.push('success', 'Record updated successfully.');
      }
      setModal(null);
      load();
    } catch (e: any) {
      setFormError(e.message);
      toast.push('error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Delete record',
      message: 'Are you sure you want to delete this record? This action cannot be undone.',
      danger: true,
    });
    if (!ok) return;
    try {
      await config.deleteFn(token, id);
      toast.push('success', 'Record deleted.');
      load();
    } catch (e: any) {
      toast.push('error', e.message);
    }
  };

  const handleExport = () => {
    if (!items.length) {
      toast.push('info', 'No data to export.');
      return;
    }
    exportToCSV(items as any[], config.endpoint);
    toast.push('success', 'Export started.');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">{config.title}</h1>
          <p className="text-xs text-white/40 mt-0.5">
            {total > 0 ? `${total.toLocaleString()} record${total === 1 ? '' : 's'} total` : 'Manage your records'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium transition border rounded-lg border-ulss-gold/20 text-white/70 hover:bg-white/5"
          >
            <Download size={15} /> Export
          </button>
          {config.canCreate(userRole) && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition rounded-lg shadow-lg bg-ulss-gold text-ulss-black hover:bg-ulss-gold/90 shadow-ulss-gold/10"
            >
              <Plus size={16} /> Add New
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute -translate-y-1/2 text-white/30 left-3 top-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={config.searchPlaceholder}
            className="w-full py-2 text-sm text-white transition border rounded-lg pr-9 border-ulss-gold/20 bg-white/5 placeholder-white/30 pl-9 focus:outline-none focus:ring-2 focus:ring-ulss-gold/40"
          />
          {loading && search && (
            <RefreshCw size={14} className="absolute -translate-y-1/2 right-3 top-1/2 animate-spin text-ulss-gold/50" />
          )}
        </div>
        {config.filterField && config.filterOptions && (
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-white/30 shrink-0" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 text-sm border rounded-lg border-ulss-gold/20 bg-ulss-black text-white/60 focus:outline-none focus:ring-2 focus:ring-ulss-gold/40"
            >
              <option value="">All Status</option>
              {config.filterOptions.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>
        )}
        <button
          onClick={() => load()}
          title="Refresh"
          className="p-2 transition border rounded-lg border-ulss-gold/20 hover:bg-white/5"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin text-ulss-gold' : 'text-ulss-gold/50'} />
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-ulss-gold/12 bg-white/[0.02] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ulss-gold/10 bg-white/[0.03]">
                {config.columns.map((col) => (
                  <th
                    key={col.label}
                    onClick={() => toggleSort(col.sortKey)}
                    className={`px-4 py-3 text-xs font-semibold tracking-wide text-left uppercase text-ulss-gold/55 select-none ${
                      col.sortKey ? 'cursor-pointer hover:text-ulss-gold' : ''
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {col.sortKey && (
                        sortKey === col.sortKey ? (
                          sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                        ) : (
                          <ChevronsUpDown size={12} className="opacity-30" />
                        )
                      )}
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-xs font-semibold tracking-wide text-right uppercase text-ulss-gold/55">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows cols={config.columns.length} />
              ) : sortedItems.length === 0 ? (
                <tr>
                  <td colSpan={config.columns.length + 1}>
                    <EmptyState message="No records found." />
                  </td>
                </tr>
              ) : (
                sortedItems.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.03] border-b border-ulss-gold/5 transition-colors">
                    {config.columns.map((col) => (
                      <td key={col.label} className="px-4 py-3 text-white/70">{col.render(item)}</td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openView(item)} title="View" className="p-1.5 rounded-lg hover:bg-white/10 text-ulss-gold/50 hover:text-ulss-gold transition">
                          <Eye size={15} />
                        </button>
                        {config.canEdit(userRole) && (
                          <button onClick={() => openEdit(item)} title="Edit" className="p-1.5 rounded-lg hover:bg-indigo-500/10 text-indigo-400 transition">
                            <Edit size={15} />
                          </button>
                        )}
                        {config.canDelete(userRole) && (
                          <button onClick={() => handleDelete(item._id)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition">
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
        <Modal title="Record Details" onClose={() => setModal(null)} size="xl">
          <div className="grid grid-cols-2 gap-x-3">
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
          size="xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            {config.formFields.map((f) => {
              const options = typeof f.options === 'function' ? f.options(form) : f.options;
              return options ? (
                <Select key={f.name} label={f.label} name={f.name} value={String(form[f.name] ?? '')} options={options} onChange={handleFormChange} />
              ) : (
                <Input key={f.name} label={f.label} name={f.name} type={f.type ?? 'text'} value={form[f.name] ?? ''} onChange={handleFormChange} />
              );
            })}
          </div>

          {formError && (
            <p className="px-3 py-2 mt-1 mb-3 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">
              {formError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-ulss-gold/10">
            <button onClick={() => setModal(null)} className="px-4 py-2 text-sm border rounded-lg border-ulss-gold/20 text-white/60 hover:bg-white/5">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-ulss-gold text-ulss-black hover:bg-ulss-gold/90 disabled:opacity-50">
              {saving && <RefreshCw size={14} className="animate-spin" />}
              {saving ? 'Saving…' : 'Save'}
            </button>
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
    { label: 'ID', sortKey: 'toolId', render: (t) => <span className="font-mono text-xs">{t.toolId}</span> },
    { label: 'Name', sortKey: 'toolName', render: (t) => <span className="font-medium text-white/90">{t.toolName}</span> },
    { label: 'Category', sortKey: 'category', render: (t) => t.category ?? '—' },
    { label: 'Brand', sortKey: 'brand', render: (t) => t.brand ?? '—' },
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
const PART_CATEGORIES = [
  'Engine & Drivetrain', 'Transmission & Gearbox', 'Brakes', 'Suspension & Steering',
  'Electrical & Ignition', 'Fuel & Intake', 'Cooling System', 'Exhaust System',
  'Body & Exterior', 'Lighting', 'Interior & Comfort', 'Wheels & Tyres',
  'Filters & Service Items', 'Gaskets & Seals',
];
const PART_SUB_CATEGORIES: Record<string, string[]> = {
  'Engine & Drivetrain': ['Engine Assembly', 'Cylinder Head & Block', 'Pistons & Bearings', 'Timing Components', 'Valves & Rocker Gear', 'Oil System', 'Engine Mounts'],
  'Transmission & Gearbox': ['Transmission Assembly', 'Clutch System', 'Gearbox Components', 'Driveshaft & CV Joints', 'Differential & Axles', 'Transfer Case'],
  Brakes: ['Brake Pads & Shoes', 'Discs, Drums & Rotors', 'Calipers & Cylinders', 'ABS Components', 'Brake Lines & Hoses', 'Parking Brake'],
  'Suspension & Steering': ['Shock Absorbers & Struts', 'Springs', 'Control Arms & Bushings', 'Ball Joints & Tie Rods', 'Wheel Hubs & Bearings', 'Steering Rack & Pump'],
  'Electrical & Ignition': ['Charging & Starting', 'Battery', 'Ignition Components', 'Sensors', 'Control Modules', 'Fuses, Relays & Wiring'],
  'Fuel & Intake': ['Fuel Pump & Tank', 'Injectors & Fuel Rail', 'Filters & Regulators', 'Throttle & Intake', 'Turbo & Intercooler', 'EVAP Components'],
  'Cooling System': ['Radiator & Hoses', 'Water Pump & Thermostat', 'Cooling Fans', 'Coolant Reservoir', 'Heater Core & Hoses', 'EGR Cooling'],
  'Exhaust System': ['Exhaust Manifold', 'Catalytic Converter & DPF', 'Muffler & Pipes', 'Exhaust Mounts & Clamps', 'Gaskets & Flex Pipes', 'EGR Components'],
  'Body & Exterior': ['Bumpers & Panels', 'Doors & Handles', 'Glass & Mirrors', 'Bonnet & Boot', 'Wipers & Washers', 'Sunroof & Roof'],
  Lighting: ['Headlights', 'Tail Lights', 'Fog Lights', 'Indicators', 'Bulbs & Ballasts', 'Interior Lights'],
  'Interior & Comfort': ['Dashboard & Console', 'Seats & Seat Belts', 'Airbags', 'Door Trims', 'A/C Components', 'HVAC Controls'],
  'Wheels & Tyres': ['Rims & Alloy Wheels', 'Tyres', 'Wheel Nuts & Studs', 'Hub Caps', 'TPMS Sensors', 'Valve Stems'],
  'Filters & Service Items': ['Oil Filters', 'Air & Cabin Filters', 'Fuel Filters', 'Fluids', 'PCV & Breather', 'Service Consumables'],
  'Gaskets & Seals': ['Engine Gaskets', 'Manifold Gaskets', 'Oil Seals', 'Transmission Seals', 'Axle & Differential Seals', 'O-Rings'],
};

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
    { label: 'Part #', sortKey: 'partNumber', render: (p) => <span className="font-mono text-xs">{p.partNumber}</span> },
    { label: 'Name', sortKey: 'partName', render: (p) => <span className="font-medium text-white/90">{p.partName}</span> },
    { label: 'Category', sortKey: 'category', render: (p) => p.category },
    { label: 'Brand', sortKey: 'brand', render: (p) => p.brand ?? '—' },
    { label: 'Qty', sortKey: 'quantity', render: (p) => p.quantity },
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
    partNumber: '', partName: '', category: '', brand: '',
    quantity: 0, reorderLevel: 0, unitCost: 0, sellingPrice: 0,
    partCondition: 'New', status: 'In Stock',
  }),
  formFields: [
    { label: 'Part Number', name: 'partNumber' },
    { label: 'Part Name', name: 'partName' },
    { label: 'Category', name: 'category', options: PART_CATEGORIES, resetFields: ['subCategory'] },
    { label: 'Sub-Category', name: 'subCategory', options: (form) => PART_SUB_CATEGORIES[String(form.category)] ?? [] },
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
    { label: 'ID', sortKey: 'vehicleId', render: (v) => <span className="font-mono text-xs">{v.vehicleId}</span> },
    { label: 'Vehicle', sortKey: 'make', render: (v) => <span className="font-medium text-white/90">{v.make} {v.model}</span> },
    { label: 'Year', sortKey: 'year', render: (v) => v.year ?? '—' },
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
  defaultForm: () => ({ vehicleId: '', make: '', model: '', vehicleType: 'Car', condition: 'Good', status: 'Available' }),
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
    { label: 'Employee ID', sortKey: 'employeeId', render: (t) => <span className="font-mono text-xs">{t.employeeId}</span> },
    { label: 'Name', sortKey: 'name', render: (t) => <span className="font-medium text-white/90">{t.name}</span> },
    { label: 'Email', render: (t) => <span className="text-ulss-gold/50">{t.email}</span> },
    { label: 'Department', sortKey: 'department', render: (t) => t.department ?? '—' },
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
    { label: 'Maintenance ID', sortKey: 'maintenanceId', render: (m) => <span className="font-mono text-xs">{m.maintenanceId}</span> },
    { label: 'Type', sortKey: 'maintenanceType', render: (m) => m.maintenanceType ?? '—' },
    { label: 'Priority', render: (m) => statusBadge(m.priority) },
    { label: 'Service Date', sortKey: 'serviceDate', render: (m) => fmt.date(m.serviceDate) },
    { label: 'Cost', sortKey: 'cost', render: (m) => fmt.currency(m.cost) },
    { label: 'Status', render: (m) => statusBadge(m.status) },
  ],
  viewFields: [
    { label: 'Maintenance ID', key: 'maintenanceId' },
    { label: 'Type', key: 'maintenanceType' },
    { label: 'Priority', key: 'priority' },
    { label: 'Status', key: 'status' },
    { label: 'Service Date', key: (m) => fmt.date(m.serviceDate) },
    { label: 'Next Service', key: (m) => fmt.date(m.nextServiceDate) },
    { label: 'Completed Date', key: (m) => fmt.date(m.completedDate) },
    { label: 'Labor Hours', key: (m) => fmt.num(m.laborHours) },
    { label: 'Cost', key: (m) => fmt.currency(m.cost) },
    { label: 'Description', key: 'description' },
    { label: 'Remarks', key: 'remarks' },
  ],
  defaultForm: () => ({ maintenanceId: '', maintenanceType: '', priority: 'Medium', status: 'Pending', cost: 0, laborHours: 0 }),
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
    { label: 'Code', sortKey: 'supplierCode', render: (s) => <span className="font-mono text-xs">{s.supplierCode}</span> },
    { label: 'Name', sortKey: 'name', render: (s) => <span className="font-medium text-white/90">{s.name}</span> },
    { label: 'Email', render: (s) => <span className="text-ulss-gold/50">{s.email ?? '—'}</span> },
    { label: 'Phone', render: (s) => s.phone ?? '—' },
    {
      label: 'Website',
      render: (s) =>
        s.website ? (
          <a href={s.website} target="_blank" rel="noreferrer" className="text-xs text-blue-400 underline">{s.website}</a>
        ) : '—',
    },
    { label: 'Status', render: (s) => statusBadge(s.status) },
  ],
  viewFields: [
    { label: 'Supplier Code', key: 'supplierCode' },
    { label: 'Name', key: 'name' },
    { label: 'Email', key: 'email' },
    { label: 'Phone', key: 'phone' },
    { label: 'Website', key: 'website' },
    { label: 'Address', key: 'address' },
    { label: 'Status', key: 'status' },
    { label: 'Created', key: (s) => fmt.date(s.createdAt) },
    { label: 'Updated', key: (s) => fmt.date(s.updatedAt) },
  ],
  defaultForm: () => ({ supplierCode: '', name: '', email: '', phone: '', website: '', address: '', status: 'Active' }),
  formFields: [
    { label: 'Supplier Code', name: 'supplierCode' },
    { label: 'Name', name: 'name' },
    { label: 'Email', name: 'email', type: 'email' },
    { label: 'Phone', name: 'phone' },
    { label: 'Website', name: 'website', type: 'url' },
    { label: 'Address', name: 'address' },
    { label: 'Status', name: 'status', options: SUPPLIER_STATUS },
  ],
  canCreate: (r) => ['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(r),
  canEdit: (r) => ['SUPER_ADMIN', 'INVENTORY_MANAGER'].includes(r),
  canDelete: (r) => ['SUPER_ADMIN'].includes(r),
};

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({
  onLogin,
}: {
  onLogin: (session: { user: AuthUser; accessToken: string; refreshToken: string }) => void;
}) {
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
    <div className="flex min-h-screen bg-ulss-black">
      <div className="flex-col justify-between hidden w-1/2 px-16 border-r md:flex py-14 bg-gradient-to-br from-ulss-black via-ulss-black to-ulss-gold/10 border-ulss-gold/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-ulss-gold/10 text-ulss-gold">
            <Wrench size={22} />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide text-white">ULSS</p>
            <p className="text-xs text-ulss-gold/60">Fleet & Inventory</p>
          </div>
        </div>
        <div className="space-y-8">
          <div>
            <h2 className="text-4xl font-bold leading-tight text-white">
              Manage your fleet <br />
              <span className="text-ulss-gold">with precision.</span>
            </h2>
            <p className="max-w-xs mt-4 text-sm leading-relaxed text-white/40">
              A unified platform for tools, spare parts, vehicles, technicians, and maintenance — all in one place.
            </p>
          </div>
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
        <p className="text-xs text-white/20">© {new Date().getFullYear()} ULSS Inventories. All rights reserved.</p>
      </div>

      <div className="flex items-center justify-center flex-1 px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-8 md:hidden">
            <div className="p-2 rounded-lg bg-ulss-gold/10 text-ulss-gold">
              <Wrench size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">ULSS Admin</p>
              <p className="text-xs text-ulss-gold/60">Fleet & Inventory</p>
            </div>
          </div>

          <div className="bg-white/[0.03] border border-ulss-gold/20 rounded-2xl shadow-2xl p-8">
            <div className="mb-6">
              <div className="p-2.5 rounded-xl bg-ulss-gold/10 text-ulss-gold w-fit mb-4">
                <LockKeyhole size={22} />
              </div>
              <h1 className="text-xl font-bold text-white">Welcome back</h1>
              <p className="mt-1 text-xs text-white/40">Sign in to your admin account</p>
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
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">
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
  const toast = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.changePassword(token, current, next);
      toast.push('success', 'Password changed successfully.');
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Change Password" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block mb-1 text-xs text-ulss-gold/60">Current Password</label>
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm text-white border rounded-lg border-ulss-gold/20 bg-white/5 focus:outline-none focus:ring-2 focus:ring-ulss-gold/40"
          />
        </div>
        <div>
          <label className="block mb-1 text-xs text-ulss-gold/60">New Password</label>
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            minLength={8}
            className="w-full px-3 py-2 text-sm text-white border rounded-lg border-ulss-gold/20 bg-white/5 focus:outline-none focus:ring-2 focus:ring-ulss-gold/40"
          />
          <p className="mt-1 text-[11px] text-white/30">Minimum 8 characters.</p>
        </div>
        {error && (
          <p className="px-3 py-2 text-sm text-red-400 border rounded-lg bg-red-500/10 border-red-500/20">{error}</p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg border-ulss-gold/20 text-white/60 hover:bg-white/5">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-semibold rounded-lg bg-ulss-gold text-ulss-black hover:bg-ulss-gold/90 disabled:opacity-50">
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV: Array<{ id: Section; label: string; icon: React.ReactNode; group?: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={18} /> },
  { id: 'tools', label: 'Tools', icon: <Wrench size={18} />, group: 'Inventory' },
  { id: 'spare-parts', label: 'Spare Parts', icon: <Package size={18} /> },
  { id: 'vehicles', label: 'Vehicles', icon: <Truck size={18} /> },
  { id: 'suppliers', label: 'Suppliers', icon: <Box size={18} /> },
  { id: 'technicians', label: 'Technicians', icon: <Users size={18} />, group: 'Operations' },
  { id: 'maintenance', label: 'Maintenance', icon: <CalendarClock size={18} /> },
  { id: 'import', label: 'Bulk Import', icon: <FileSpreadsheet size={18} />, group: 'System' },
];

function Sidebar({
  section,
  onSection,
  user,
  onLogout,
  onChangePassword,
  open,
  onClose,
  collapsed,
}: {
  section: Section;
  onSection: (s: Section) => void;
  user: AuthUser | null;
  onLogout: () => void;
  onChangePassword: () => void;
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
}) {
  const role = getUserRole(user);

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClose} />}
      <aside
        className={`
          fixed z-40 top-0 left-0 h-full ${collapsed ? 'md:w-[68px]' : 'md:w-60'} w-60
          bg-[#0c0c0c] border-r border-ulss-gold/10 text-white flex flex-col
          transition-all duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:z-auto
        `}
      >
        <div className={`flex items-center gap-2.5 px-4 py-5 border-b border-ulss-gold/10 ${collapsed ? 'md:justify-center md:px-2' : ''}`}>
          <div className="p-1.5 rounded-lg bg-ulss-gold/10 text-ulss-gold flex-shrink-0">
            <Wrench size={18} />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold tracking-wide">ULSS Admin</p>
              <p className="text-xs text-ulss-gold/55 mt-0.5">Fleet & Inventory</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon, group }) => (
            <div key={id}>
              {group && !collapsed && (
                <p className="px-2 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-white/25">{group}</p>
              )}
              {group && collapsed && <div className="mx-2 my-2 border-t border-ulss-gold/10" />}
              <button
                onClick={() => { onSection(id); onClose(); }}
                title={collapsed ? label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  collapsed ? 'md:justify-center md:px-2' : ''
                } ${
                  section === id
                    ? 'bg-ulss-gold/15 text-ulss-gold ring-1 ring-ulss-gold/20'
                    : 'text-white/55 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="flex-shrink-0">{icon}</span>
                {!collapsed && label}
              </button>
            </div>
          ))}
        </nav>

        <div className={`px-3 py-4 border-t border-ulss-gold/10 ${collapsed ? 'md:px-2' : ''}`}>
          <div className={`flex items-center gap-2.5 ${collapsed ? 'md:justify-center' : ''}`}>
            <div className="flex items-center justify-center flex-shrink-0 text-xs font-bold rounded-full w-9 h-9 bg-ulss-gold/15 text-ulss-gold">
              {initials(user?.name)}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{user?.name}</p>
                <p className="text-[11px] text-ulss-gold/50 truncate">{roleLabel(role)}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="flex gap-2 mt-3">
              <button onClick={onChangePassword} title="Change password" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-ulss-gold/15 text-white/50 hover:bg-white/5 hover:text-white text-xs transition">
                <Settings size={14} /> Settings
              </button>
              <button onClick={onLogout} title="Log out" className="flex items-center justify-center px-2.5 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition">
                <LogOut size={14} />
              </button>
            </div>
          )}
          {collapsed && (
            <div className="hidden gap-2 mt-3 md:flex md:flex-col">
              <button onClick={onChangePassword} title="Settings" className="flex items-center justify-center py-1.5 rounded-lg border border-ulss-gold/15 text-white/50 hover:bg-white/5 transition">
                <Settings size={14} />
              </button>
              <button onClick={onLogout} title="Log out" className="flex items-center justify-center py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition">
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({
  section,
  user,
  onMenu,
  onToggleCollapse,
  collapsed,
}: {
  section: Section;
  user: AuthUser | null;
  onMenu: () => void;
  onToggleCollapse: () => void;
  collapsed: boolean;
}) {
  const current = NAV.find((n) => n.id === section);
  return (
    <header className="flex items-center gap-3 px-4 md:px-6 py-3 border-b bg-[#0c0c0c]/80 backdrop-blur border-ulss-gold/10 sticky top-0 z-20">
      <button onClick={onMenu} className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 md:hidden">
        <Menu size={18} />
      </button>
      <button onClick={onToggleCollapse} className="hidden md:flex p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition">
        {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-white/35">ULSS</span>
        <ChevronRight size={14} className="text-white/20" />
        <span className="font-medium text-white">{current?.label}</span>
      </div>

      <div className="flex-1" />

      <button className="relative p-2 transition rounded-lg hover:bg-white/10 text-white/50 hover:text-white">
        <Bell size={17} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-ulss-gold" />
      </button>

      <div className="flex items-center gap-2.5 pl-3 ml-1 border-l border-ulss-gold/10">
        <div className="flex items-center justify-center w-8 h-8 text-xs font-bold rounded-full bg-ulss-gold/15 text-ulss-gold">
          {initials(user?.name)}
        </div>
        <div className="hidden sm:block">
          <p className="text-xs font-medium leading-none text-white">{user?.name}</p>
          <p className="text-[11px] text-ulss-gold/50 mt-0.5">{roleLabel(getUserRole(user))}</p>
        </div>
      </div>
    </header>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

function AdminAppInner() {
  const [session, setSession] = useState(() => authStorage.get());
  const [section, setSection] = useState<Section>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
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
      // ignore
    }
    authStorage.clear();
    setSession(null);
  };

  if (!session) return <LoginScreen onLogin={handleLogin} />;

  const sectionEl = (() => {
    switch (section) {
      case 'dashboard': return <DashboardSection token={token} />;
      case 'tools': return <ResourceSection key="tools" config={toolsConfig} token={token} userRole={userRole} />;
      case 'spare-parts': return <ResourceSection key="spare-parts" config={sparePartsConfig} token={token} userRole={userRole} />;
      case 'vehicles': return <ResourceSection key="vehicles" config={vehiclesConfig} token={token} userRole={userRole} />;
      case 'technicians': return <ResourceSection key="technicians" config={techniciansConfig} token={token} userRole={userRole} />;
      case 'maintenance': return <ResourceSection key="maintenance" config={maintenanceConfig} token={token} userRole={userRole} />;
      case 'suppliers': return <ResourceSection key="suppliers" config={suppliersConfig} token={token} userRole={userRole} />;
      case 'import': return <ExcelImport token={token} />;
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
        collapsed={collapsed}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          section={section}
          user={user}
          onMenu={() => setSidebarOpen(true)}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          collapsed={collapsed}
        />
        <main className="flex-1 p-5 overflow-y-auto md:p-8 bg-ulss-black">{sectionEl}</main>
      </div>

      {showChangePassword && (
        <ChangePasswordModal token={token} onClose={() => setShowChangePassword(false)} />
      )}
    </div>
  );
}

export default function AdminApp() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <AdminAppInner />
      </ConfirmProvider>
    </ToastProvider>
  );
}
