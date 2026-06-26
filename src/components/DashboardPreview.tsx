import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertCircle, Car, Wrench } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://inventorymate.vercel.app/api';

type DashboardPreviewData = {
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
    availableVehicles: number;
    reservedVehicles: number;
    underRepairVehicles: number;
    pendingMaintenance: number;
    overdueMaintenance: number;
  };
};

async function fetchDashboardPreview() {
  const response = await fetch(`${API_BASE}/dashboard/public`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }

  return payload.data as DashboardPreviewData;
}

function formatNumber(value?: number, loading = false) {
  if (value == null) return loading ? '...' : '0';
  return value.toLocaleString();
}

function formatPercent(value: number) {
  return `${Math.round(value * 10) / 10}%`;
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function DashboardPreview() {
  const [data, setData] = useState<DashboardPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let ignore = false;

    const load = () => {
      setError('');
      fetchDashboardPreview()
        .then((nextData) => {
          if (ignore) return;
          setData(nextData);
          setUpdatedAt(new Date());
        })
        .catch((err: any) => {
          if (!ignore) setError(err.message || 'Unable to load dashboard data.');
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    };

    load();
    const timer = window.setInterval(load, 30000);

    return () => {
      ignore = true;
      window.clearInterval(timer);
    };
  }, []);

  const cards = data?.cards;

  const derived = useMemo(() => {
    const totalVehicles = cards?.totalVehicles ?? 0;
    const totalTools = cards?.totalTools ?? 0;
    const totalAssets = totalVehicles + totalTools;
    const readyAssets = (cards?.availableVehicles ?? 0) + (cards?.availableTools ?? 0);
    const activeToolUse = (cards?.inUseTools ?? 0) + (cards?.reservedTools ?? 0);
    const actionRequired =
      (cards?.underRepairVehicles ?? 0) +
      (cards?.maintenanceRequiredTools ?? 0) +
      (cards?.pendingMaintenance ?? 0) +
      (cards?.overdueMaintenance ?? 0) +
      (cards?.outOfStockParts ?? 0);

    return {
      fleetReadiness: totalAssets ? clampPercent((readyAssets / totalAssets) * 100) : 0,
      toolUtilization: totalTools ? clampPercent((activeToolUse / totalTools) * 100) : 0,
      actionRequired,
    };
  }, [cards]);

  return (
    <section id="platform" className="py-24 bg-ulss-black relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Executive Overview
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            Real-time visibility into your entire operational fleet and workshop assets.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="glass-panel rounded-xl p-2 md:p-6 shadow-2xl shadow-ulss-gold/5"
        >
          <div className="flex items-center gap-2 mb-6 px-4 pt-2">
            <div className="w-3 h-3 rounded-full bg-white/20"></div>
            <div className="w-3 h-3 rounded-full bg-white/20"></div>
            <div className="w-3 h-3 rounded-full bg-white/20"></div>
            <div className="ml-4 text-xs text-white/40 font-medium">
              ULSS Command Center
            </div>
            <div className="ml-auto text-[11px] text-white/30">
              {updatedAt ? `Updated ${updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Syncing...'}
            </div>
          </div>

          {error && (
            <div className="mx-4 mb-5 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-ulss-gold/10 rounded-md">
                  <Car className="text-ulss-gold" size={20} />
                </div>
                <h3 className="font-display font-semibold text-lg">Vehicle Metrics</h3>
              </div>
              <div className="space-y-4">
                <MetricRow label="Total Vehicles" value={formatNumber(cards?.totalVehicles, loading)} />
                <MetricRow label="Available" value={formatNumber(cards?.availableVehicles, loading)} valueClass="text-green-400" />
                <MetricRow label="Reserved" value={formatNumber(cards?.reservedVehicles, loading)} valueClass="text-blue-400" />
                <MetricRow label="Under Maintenance" value={formatNumber(cards?.underRepairVehicles, loading)} valueClass="text-red-400" border={false} />
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/10 rounded-md">
                  <Wrench className="text-white" size={20} />
                </div>
                <h3 className="font-display font-semibold text-lg">Tool Metrics</h3>
              </div>
              <div className="space-y-4">
                <MetricRow label="Total Tools" value={formatNumber(cards?.totalTools, loading)} />
                <MetricRow label="Available" value={formatNumber(cards?.availableTools, loading)} valueClass="text-green-400" />
                <MetricRow label="Assigned" value={formatNumber(cards ? cards.inUseTools + cards.reservedTools : undefined, loading)} valueClass="text-ulss-gold" />
                <MetricRow label="Service Required" value={formatNumber(cards?.maintenanceRequiredTools, loading)} valueClass="text-red-400" border={false} />
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/10 rounded-md">
                  <Activity className="text-white" size={20} />
                </div>
                <h3 className="font-display font-semibold text-lg">Asset Health</h3>
              </div>
              <div className="space-y-6">
                <ProgressMetric
                  label="Fleet Readiness"
                  value={derived.fleetReadiness}
                  colorClass="bg-green-400"
                />
                <ProgressMetric
                  label="Tool Utilization"
                  value={derived.toolUtilization}
                  colorClass="bg-ulss-gold"
                />
                <div className="bg-ulss-gold/10 border border-ulss-gold/20 rounded-md p-3 flex items-start gap-3 mt-4">
                  <AlertCircle className="text-ulss-gold shrink-0 mt-0.5" size={16} />
                  <div>
                    <div className="text-sm font-medium text-ulss-gold">Action Required</div>
                    <div className="text-xs text-white/60 mt-1">
                      {formatNumber(cards ? derived.actionRequired : undefined, loading)} operational item{derived.actionRequired === 1 ? '' : 's'} need attention now.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MetricRow({
  label,
  value,
  valueClass = 'text-white',
  border = true,
}: {
  label: string;
  value: string;
  valueClass?: string;
  border?: boolean;
}) {
  return (
    <div className={`flex justify-between items-end ${border ? 'border-b border-white/5 pb-3' : ''}`}>
      <span className="text-sm text-white/60">{label}</span>
      <span className={`text-xl font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

function ProgressMetric({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-white/60">{label}</span>
        <span className="text-white font-medium">{formatPercent(value)}</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${colorClass}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
