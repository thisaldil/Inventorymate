import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://inventorymate.vercel.app/api';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type DashboardAnalyticsData = {
  cards: {
    totalTools: number;
    availableTools: number;
    reservedTools: number;
    inUseTools: number;
    maintenanceRequiredTools: number;
    totalVehicles: number;
    availableVehicles: number;
    reservedVehicles: number;
    underRepairVehicles: number;
    pendingMaintenance: number;
    overdueMaintenance: number;
  };
  charts: {
    monthlyMaintenanceActivities: Array<{ _id: number; count: number }>;
    inventoryGrowth: Array<{ _id: number; count: number }>;
  };
};

async function fetchAnalytics() {
  const response = await fetch(`${API_BASE}/dashboard/public`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }

  return payload.data as DashboardAnalyticsData;
}

function monthLabel(month: number) {
  return MONTHS[(month - 1) % 12] || `M${month}`;
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value * 10) / 10));
}

export function Analytics() {
  const [data, setData] = useState<DashboardAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError('');

    fetchAnalytics()
      .then((nextData) => {
        if (!ignore) setData(nextData);
      })
      .catch((err: any) => {
        if (!ignore) setError(err.message || 'Unable to load analytics.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const activityData = useMemo(() => {
    if (!data) return [];
    const months = new Set<number>();
    data.charts.monthlyMaintenanceActivities.forEach((item) => months.add(item._id));
    data.charts.inventoryGrowth.forEach((item) => months.add(item._id));

    return Array.from(months)
      .sort((a, b) => a - b)
      .map((month) => ({
        name: monthLabel(month),
        maintenance: data.charts.monthlyMaintenanceActivities.find((item) => item._id === month)?.count ?? 0,
        inventory: data.charts.inventoryGrowth.find((item) => item._id === month)?.count ?? 0,
      }));
  }, [data]);

  const healthData = useMemo(() => {
    if (!data) return [];
    const { cards } = data;
    const totalAssets = cards.totalVehicles + cards.totalTools;
    const readyAssets = cards.availableVehicles + cards.availableTools;
    const activeToolUse = cards.inUseTools + cards.reservedTools;
    const openMaintenance = cards.pendingMaintenance + cards.overdueMaintenance + cards.maintenanceRequiredTools;

    return [
      { name: 'Fleet Readiness', score: totalAssets ? clampPercent((readyAssets / totalAssets) * 100) : 0 },
      { name: 'Tool Utilization', score: cards.totalTools ? clampPercent((activeToolUse / cards.totalTools) * 100) : 0 },
      { name: 'Maintenance Health', score: totalAssets ? clampPercent(100 - (openMaintenance / totalAssets) * 100) : 100 },
    ];
  }, [data]);

  return (
    <section id="analytics" className="py-24 bg-[#050505] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Live Analytics
          </h2>
          <p className="text-white/50 max-w-2xl">
            Data-driven insights generated from current fleet, inventory, and maintenance records.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-white/40">Loading analytics...</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-ulss-black border border-white/5 rounded-xl p-6"
          >
            <h3 className="font-display font-semibold text-lg mb-6">
              Operational Activity
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A0A0A',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="maintenance"
                    name="Maintenance Records"
                    stroke="#D4AF37"
                    strokeWidth={2}
                    dot={{ fill: '#0A0A0A', stroke: '#D4AF37', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="inventory"
                    name="Parts Added"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    dot={{ fill: '#0A0A0A', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {!loading && activityData.length === 0 && (
              <p className="mt-4 text-sm text-white/35">No monthly activity data yet.</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-ulss-black border border-white/5 rounded-xl p-6"
          >
            <h3 className="font-display font-semibold text-lg mb-6">
              Asset Health Score
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A0A0A',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                    }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#D4AF37" fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
