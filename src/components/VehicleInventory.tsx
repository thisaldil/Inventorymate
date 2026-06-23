import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Car, ChevronDown, Tag } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://inventorymate.vercel.app/api';

type VehicleApiItem = {
  _id: string;
  vehicleId: string;
  make: string;
  model: string;
  vehicleType?: string;
  registrationNumber?: string;
  status?: string;
  lastServiceDate?: string;
  images?: string[];
};

type VehicleDisplayItem = {
  id: string;
  category: string;
  name: string;
  reg: string;
  status: string;
  lastService: string;
  image?: string;
};

function formatDate(value?: string) {
  if (!value) return 'No service date';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function resolveImage(path?: string) {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${API_BASE.replace(/\/api$/, '')}${path}`;
}

async function fetchVehicles() {
  const params = new URLSearchParams({ page: '1', limit: '500', sort: 'make' });
  const response = await fetch(`${API_BASE}/vehicles?${params.toString()}`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }

  return (payload.data ?? []).map((vehicle: VehicleApiItem) => ({
    id: vehicle.vehicleId,
    category: vehicle.vehicleType || 'Other',
    name: `${vehicle.make} ${vehicle.model}`.trim(),
    reg: vehicle.registrationNumber || vehicle.vehicleId,
    status: vehicle.status || 'Available',
    lastService: formatDate(vehicle.lastServiceDate),
    image: resolveImage(vehicle.images?.[0]),
  })) as VehicleDisplayItem[];
}

export function VehicleInventory() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError('');

    fetchVehicles()
      .then((items) => {
        if (!ignore) setVehicles(items);
      })
      .catch((err: any) => {
        if (!ignore) setError(err.message || 'Unable to load vehicle inventory.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(vehicles.map((vehicle) => vehicle.category))).sort()],
    [vehicles],
  );

  const filteredVehicles = activeCategory === 'All'
    ? vehicles
    : vehicles.filter((vehicle) => vehicle.category === activeCategory);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-white/10 text-white border-white/20';
      case 'Reserved':
        return 'bg-ulss-gold/10 text-ulss-gold border-ulss-gold/20';
      case 'Under Repair':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Sold':
        return 'bg-white/5 text-white/45 border-white/10';
      default:
        return 'bg-white/5 text-white/60 border-white/10';
    }
  };

  return (
    <section id="inventory" className="py-24 bg-[#050505] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Vehicle Fleet
            </h2>
            <p className="text-white/50 max-w-xl">
              Comprehensive catalog of operational vehicles, tracked in real-time.
            </p>
          </div>

          <div className="relative w-full md:w-auto">
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
              className="flex w-full md:w-64 items-center justify-between gap-3 rounded-sm border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            >
              <span className="truncate">{activeCategory}</span>
              <ChevronDown
                size={16}
                className={`shrink-0 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {isCategoryDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute right-0 top-full z-20 mt-2 w-full md:w-64 overflow-hidden rounded-lg border border-white/10 bg-[#0b0b0b] shadow-2xl shadow-black/40"
                >
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${activeCategory === cat ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                    >
                      <span>{cat}</span>
                      {activeCategory === cat && (
                        <span className="text-xs uppercase tracking-wider text-ulss-gold">
                          Active
                        </span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-12 text-white/40">Loading vehicle fleet...</div>
        )}

        {!loading && filteredVehicles.length === 0 && (
          <div className="text-center py-12 text-white/40">No vehicles found.</div>
        )}

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredVehicles.map((vehicle) => (
              <motion.div
                key={vehicle.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="group bg-ulss-black border border-white/5 rounded-lg overflow-hidden hover:border-white/20 transition-colors"
              >
                <div className="aspect-[4/3] overflow-hidden relative bg-white/[0.03]">
                  {vehicle.image ? (
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/25">
                      <Car size={38} />
                      <span className="mt-2 text-xs font-mono">{vehicle.id}</span>
                    </div>
                  )}

                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-sm border backdrop-blur-md ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-xs text-ulss-gold font-medium mb-1 tracking-wider uppercase">
                    {vehicle.category}
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-4 truncate">
                    {vehicle.name}
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-white/60">
                      <div className="flex items-center gap-2">
                        <Tag size={14} />
                        <span>Reg</span>
                      </div>
                      <span className="text-white font-medium">{vehicle.reg}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-white/60">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>Last Service</span>
                      </div>
                      <span className="text-white">{vehicle.lastService}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
