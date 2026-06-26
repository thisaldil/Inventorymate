import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Database } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://inventorymate.vercel.app/api';

type DashboardHighlightsData = {
  cards: {
    totalSpareParts: number;
    lowStockParts: number;
    outOfStockParts: number;
    totalTools: number;
    availableTools: number;
    totalVehicles: number;
    availableVehicles: number;
    pendingMaintenance: number;
    overdueMaintenance: number;
  };
};

async function fetchHighlights() {
  const response = await fetch(`${API_BASE}/dashboard/public`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }

  return payload.data as DashboardHighlightsData;
}

export function Testimonials() {
  const [data, setData] = useState<DashboardHighlightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError('');

    fetchHighlights()
      .then((nextData) => {
        if (!ignore) setData(nextData);
      })
      .catch((err: any) => {
        if (!ignore) setError(err.message || 'Unable to load system highlights.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const highlights = useMemo(() => {
    const cards = data?.cards;
    return [
      {
        id: 'fleet',
        icon: <CheckCircle2 size={22} />,
        label: 'Fleet Availability',
        value: cards ? `${cards.availableVehicles.toLocaleString()} / ${cards.totalVehicles.toLocaleString()}` : loading ? '...' : '0 / 0',
        detail: 'vehicles currently available for operations',
      },
      {
        id: 'tools',
        icon: <Database size={22} />,
        label: 'Tool Availability',
        value: cards ? `${cards.availableTools.toLocaleString()} / ${cards.totalTools.toLocaleString()}` : loading ? '...' : '0 / 0',
        detail: 'workshop tools ready for use',
      },
      {
        id: 'attention',
        icon: <AlertCircle size={22} />,
        label: 'Items Requiring Attention',
        value: cards
          ? (cards.lowStockParts + cards.outOfStockParts + cards.pendingMaintenance + cards.overdueMaintenance).toLocaleString()
          : loading ? '...' : '0',
        detail: 'inventory and maintenance records needing follow-up',
      },
    ];
  }, [data, loading]);

  return (
    <section className="py-24 bg-ulss-black">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-10">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            System Highlights
          </h2>
          <p className="text-white/50 max-w-2xl">
            Live operational signals from your current inventory and maintenance records.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.12 }}
              className="bg-white/[0.02] border border-white/5 p-8 rounded-xl relative"
            >
              <div className="text-ulss-gold mb-6">{item.icon}</div>
              <div className="text-sm text-white/45 uppercase tracking-wider mb-2">{item.label}</div>
              <div className="text-3xl font-semibold text-white mb-4">{item.value}</div>
              <p className="text-sm text-white/55 leading-relaxed">{item.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
