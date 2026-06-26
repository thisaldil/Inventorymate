import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://inventorymate.vercel.app/api';

type PopulatedRef = {
  toolName?: string;
  vehicleId?: string;
  make?: string;
  model?: string;
  name?: string;
};

type MaintenanceApiItem = {
  _id: string;
  maintenanceId: string;
  maintenanceType?: string;
  description?: string;
  serviceDate?: string;
  status?: string;
  priority?: string;
  toolId?: PopulatedRef | string;
  vehicleId?: PopulatedRef | string;
  technician?: PopulatedRef | string;
};

type TimelineItem = {
  id: string;
  type: string;
  title: string;
  date: string;
  status: string;
};

function formatDate(value?: string) {
  if (!value) return 'No service date';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function vehicleLabel(value?: MaintenanceApiItem['vehicleId']) {
  if (!value || typeof value === 'string') return '';
  return [value.make, value.model].filter(Boolean).join(' ');
}

async function fetchMaintenanceTimeline() {
  const params = new URLSearchParams({ page: '1', limit: '6', sort: '-serviceDate' });
  const response = await fetch(`${API_BASE}/maintenance?${params.toString()}`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }

  return (payload.data ?? []).map((item: MaintenanceApiItem) => {
    const assetName = vehicleLabel(item.vehicleId)
      || (typeof item.toolId === 'object' ? item.toolId.toolName : '')
      || item.maintenanceId;

    return {
      id: item._id,
      type: item.maintenanceType || item.priority || 'Maintenance',
      title: item.description || `${item.maintenanceType || 'Service'}${assetName ? ` (${assetName})` : ''}`,
      date: formatDate(item.serviceDate),
      status: item.status || 'Pending',
    };
  }) as TimelineItem[];
}

export function MaintenanceTimeline() {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError('');

    fetchMaintenanceTimeline()
      .then((nextItems) => {
        if (!ignore) setItems(nextItems);
      })
      .catch((err: any) => {
        if (!ignore) setError(err.message || 'Unable to load maintenance operations.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 size={20} className="text-green-500" />;
      case 'In Progress':
      case 'Overdue':
        return <AlertCircle size={20} className="text-ulss-gold" />;
      case 'Pending':
      default:
        return <Clock size={20} className="text-white/40" />;
    }
  };

  return (
    <section className="py-24 bg-[#050505] border-y border-white/5">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Maintenance Operations
          </h2>
          <p className="text-white/50">
            Live feed of workshop activities and service schedules.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-white/40">Loading maintenance operations...</div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-12 text-white/40">No maintenance records found.</div>
        )}

        <div className="relative border-l border-white/10 ml-3 md:ml-4 space-y-12">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative pl-8 md:pl-12"
            >
              <div className="absolute -left-[11px] top-1 bg-[#050505] p-0.5 rounded-full">
                {getStatusIcon(item.status)}
              </div>

              <div className="bg-ulss-black border border-white/5 p-6 rounded-lg">
                <div className="text-xs font-semibold text-ulss-gold uppercase tracking-wider mb-2">
                  {item.type}
                </div>
                <h4 className="text-lg font-medium text-white mb-1">{item.title}</h4>
                <div className="text-sm text-white/40">{item.date}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
