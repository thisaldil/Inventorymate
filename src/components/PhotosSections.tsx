import { useEffect, useState } from "react";

const STATUS_COLORS = {
  "In Stock": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Limited":  "bg-amber-500/20  text-amber-400  border-amber-500/30",
  "Low Stock":  "bg-amber-500/20  text-amber-400  border-amber-500/30",
  "On Order": "bg-blue-500/20   text-blue-400   border-blue-500/30",
  "Out of Stock": "bg-red-500/20 text-red-400   border-red-500/30",
  "Out Of Stock": "bg-red-500/20 text-red-400   border-red-500/30",
};

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://inventorymate.vercel.app/api';

type SparePartApiItem = {
  _id: string;
  partNumber: string;
  partName: string;
  category: string;
  subCategory?: string;
  brand?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  quantity?: number;
  status?: string;
  compatibleVehicles?: Array<{
    make?: string;
    model?: string;
  }>;
};

type SparePartDisplayItem = {
  id: string;
  name: string;
  partNo: string;
  category: string;
  subCategory?: string;
  brand?: string;
  vehicleBrand?: string;
  vehicleModel?: string;
  quantity: number;
  status: string;
  compatibleVehicles: Array<{
    make?: string;
    model?: string;
  }>;
};

type VehicleApiItem = {
  _id: string;
  make?: string;
  model?: string;
};

type VehicleSelectorItem = {
  make: string;
  model?: string;
};

function cleanText(value?: string) {
  return value?.trim() || '';
}

function normalizeStatus(status?: string, quantity = 0) {
  if (status) return status;
  return quantity > 0 ? 'In Stock' : 'Out Of Stock';
}

async function fetchPublicSpareParts() {
  const params = new URLSearchParams({ page: '1', limit: '500', sort: 'category' });
  const response = await fetch(`${API_BASE}/spare-parts?${params.toString()}`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }

  return (payload.data ?? []).map((part: SparePartApiItem) => ({
    id: part._id,
    name: part.partName,
    partNo: part.partNumber,
    category: part.category || 'Uncategorized',
    subCategory: part.subCategory,
    brand: part.brand,
    vehicleBrand: cleanText(part.vehicleBrand),
    vehicleModel: cleanText(part.vehicleModel),
    quantity: part.quantity ?? 0,
    status: normalizeStatus(part.status, part.quantity ?? 0),
    compatibleVehicles: (part.compatibleVehicles ?? [])
      .map((vehicle) => ({
        make: cleanText(vehicle.make),
        model: cleanText(vehicle.model),
      }))
      .filter((vehicle) => vehicle.make || vehicle.model),
  })) as SparePartDisplayItem[];
}

async function fetchPublicVehicles() {
  const params = new URLSearchParams({ page: '1', limit: '500', sort: 'make' });
  const response = await fetch(`${API_BASE}/vehicles?${params.toString()}`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }

  return (payload.data ?? [])
    .map((vehicle: VehicleApiItem) => ({
      make: vehicle.make?.trim() ?? '',
      model: vehicle.model?.trim() ?? '',
    }))
    .filter((vehicle: VehicleSelectorItem) => vehicle.make && vehicle.model) as VehicleSelectorItem[];
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export function PhotosSections() {
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [searchPart, setSearchPart] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [allParts, setAllParts] = useState<SparePartDisplayItem[]>([]);
  const [vehicles, setVehicles] = useState<VehicleSelectorItem[]>([]);
  const [partsLoading, setPartsLoading] = useState(true);
  const [partsError, setPartsError] = useState("");
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [vehiclesError, setVehiclesError] = useState("");

  useEffect(() => {
    let ignore = false;

    setPartsLoading(true);
    setPartsError("");

    fetchPublicSpareParts()
      .then((parts) => {
        if (ignore) return;
        setAllParts(parts);
        setExpandedCats((prev) => {
          const next = { ...prev };
          parts.forEach((part) => {
            if (next[part.category] === undefined) next[part.category] = false;
          });
          return next;
        });
      })
      .catch((error: any) => {
        if (!ignore) setPartsError(error.message || "Unable to load spare parts.");
      })
      .finally(() => {
        if (!ignore) setPartsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    setVehiclesLoading(true);
    setVehiclesError("");

    fetchPublicVehicles()
      .then((items) => {
        if (!ignore) setVehicles(items);
      })
      .catch((error: any) => {
        if (!ignore) setVehiclesError(error.message || "Unable to load vehicles.");
      })
      .finally(() => {
        if (!ignore) setVehiclesLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const categories = ["All", ...Array.from(new Set(allParts.map((part) => part.category))).sort()];
  const sparePartVehicleFits = allParts.flatMap((part) => {
    const directFit = part.vehicleBrand || part.vehicleModel
      ? [{ make: part.vehicleBrand || '', model: part.vehicleModel || '' }]
      : [];
    return [...directFit, ...part.compatibleVehicles];
  });
  const vehicleFits = [...sparePartVehicleFits, ...vehicles].filter((vehicle) => vehicle.make || vehicle.model);
  const uniqueVehicleFits = Array.from(
    new Map(vehicleFits.map((vehicle) => [`${vehicle.make}::${vehicle.model || ''}`, vehicle])).values(),
  );
  const makes = Array.from(new Set(uniqueVehicleFits.map((vehicle) => vehicle.make).filter(Boolean))).sort();
  const modelSource = selectedMake
    ? uniqueVehicleFits.filter((vehicle) => vehicle.make === selectedMake)
    : uniqueVehicleFits;
  const models = Array.from(new Set(modelSource.map((vehicle) => vehicle.model).filter(Boolean) as string[])).sort();
  const vehicleOptionsLoading = vehiclesLoading && makes.length === 0;
  const hasVehicleFitData = allParts.some((part) =>
    part.vehicleBrand || part.vehicleModel || part.compatibleVehicles.length > 0,
  );

  const handleModelChange = (model: string) => {
    setSelectedModel(model);

    if (!selectedMake && model) {
      const matchingMakes = Array.from(
        new Set(uniqueVehicleFits.filter((vehicle) => vehicle.model === model).map((vehicle) => vehicle.make).filter(Boolean)),
      );
      if (matchingMakes.length === 1) setSelectedMake(matchingMakes[0]);
    }
  };

  const filteredParts = allParts.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch =
      !searchPart ||
      p.name.toLowerCase().includes(searchPart.toLowerCase()) ||
      p.partNo.toLowerCase().includes(searchPart.toLowerCase()) ||
      (p.brand ?? '').toLowerCase().includes(searchPart.toLowerCase());
    const matchVehicle =
      (!selectedMake && !selectedModel) ||
      !hasVehicleFitData ||
      (
        ((!selectedMake || p.vehicleBrand === selectedMake) && (!selectedModel || p.vehicleModel === selectedModel)) ||
        p.compatibleVehicles.some((vehicle) => {
          const matchMake = !selectedMake || vehicle.make === selectedMake;
          const matchModel = !selectedModel || vehicle.model === selectedModel;
          return matchMake && matchModel;
        })
      );
    return matchCat && matchSearch && matchVehicle;
  });

  const groupedFiltered = filteredParts.reduce((acc, part) => {
    if (!acc[part.category]) acc[part.category] = [];
    acc[part.category].push(part);
    return acc;
  }, {} as Record<string, SparePartDisplayItem[]>);

  const toggleCat = (cat: string) => setExpandedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <section id="spare-parts" className="py-24 bg-[#050505] border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-8">
          <p className="text-xs tracking-widest text-white/30 uppercase mb-2">Inventory System</p>
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-3">Spare Parts <span className="text-amber-400">Availability</span></h2>
          <p className="text-white/50 max-w-xl text-sm">
            {allParts.length.toLocaleString()} parts across {Math.max(categories.length - 1, 0)} categories for {makes.length.toLocaleString()} vehicle brands
          </p>
        </div>

        {/* Vehicle selector */}
        <div className="bg-white/[0.03] border border-white/10 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-5 bg-amber-400 rounded-full inline-block" />
            <h3 className="text-base font-semibold text-white">Select Vehicle</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/40 mb-1 uppercase">Make</label>
              <select
                value={selectedMake}
                onChange={(e) => {
                  setSelectedMake(e.target.value);
                  setSelectedModel("");
                }}
                className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-white text-sm focus:outline-none focus:border-ulss-gold"
              >
                <option value="" className="bg-[#0b0b0b] text-white">
                  {vehicleOptionsLoading ? "Loading makes..." : "- Select Make -"}
                </option>
                {makes.map((make) => (
                  <option key={make} value={make} className="bg-[#0b0b0b] text-white">
                    {make}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1 uppercase">Model</label>
              <select
                value={selectedModel}
                onChange={(e) => handleModelChange(e.target.value)}
                disabled={vehicleOptionsLoading || models.length === 0}
                className="w-full bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-white text-sm focus:outline-none focus:border-ulss-gold disabled:opacity-40"
              >
                <option value="" className="bg-[#0b0b0b] text-white">
                  {vehicleOptionsLoading ? "Loading models..." : "- Select Model -"}
                </option>
                {models.map((model) => (
                  <option key={model} value={model} className="bg-[#0b0b0b] text-white">
                    {model}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {vehiclesError && makes.length === 0 && (
            <div className="mt-4 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {vehiclesError}
            </div>
          )}

          {(selectedMake || selectedModel) && (
            <div className="mt-4">
              <span className="text-xs text-white/30 mr-2">Showing parts for:</span>
              <span className="px-3 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs rounded-full font-medium">
                {selectedMake || 'All Makes'}{selectedModel ? ` - ${selectedModel}` : ' - All Models'}
              </span>
            </div>
          )}
        </div>

        {/* Search & stats */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-2xl">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search part name or part number…"
              value={searchPart}
              onChange={(e) => setSearchPart(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-sm pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-ulss-gold"
            />
          </div>

          <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-sm shrink-0">
            <span className="text-amber-400 font-bold text-lg">{filteredParts.length}</span>
            <span className="text-white/30 text-sm">{partsLoading ? 'loading parts' : 'parts found'}</span>
          </div>
        </div>

        {partsError && (
          <div className="mb-6 rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {partsError}
          </div>
        )}

        {/* Category tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-all ${
                activeCategory === cat ? 'bg-white text-ulss-black' : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {cat === 'All' ? `All (${allParts.length})` : cat}
            </button>
          ))}
        </div>

        {/* Parts list */}
        <div className="space-y-4">
          {Object.entries(groupedFiltered).map(([category, parts]) => {
            const isExpanded = !!expandedCats[category];
            return (
              <div key={category} className="bg-white/[0.02] border border-white/8 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCat(category)}
                  className="w-full flex items-center justify-between px-6 py-3 hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                    <span className="font-bold text-white">{category}</span>
                    <span className="px-2 py-0.5 bg-white/8 rounded-full text-white/40 text-xs">{parts.length} parts</span>
                  </div>
                  <svg className={`w-4 h-4 text-white/30 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-12 gap-2 px-2 py-2 mb-2 text-white/30 text-xs uppercase">
                      <div className="col-span-1">#</div>
                      <div className="col-span-4">Part Name</div>
                      <div className="col-span-3">Part No.</div>
                      <div className="col-span-1">Qty</div>
                      <div className="col-span-3">Status</div>
                    </div>

                    <div className="space-y-1">
                      {parts.map((part: any, idx: number) => {
                        const statusKey = (part.status as keyof typeof STATUS_COLORS) || 'In Stock';
                        const statusClass = STATUS_COLORS[statusKey] || STATUS_COLORS['In Stock'];
                        return (
	                        <div key={part.id} className="grid grid-cols-12 gap-2 px-2 py-2 rounded-lg items-center">
	                          <div className="col-span-1 text-white/40 text-xs">{String(idx + 1).padStart(2, '0')}</div>
	                          <div className="col-span-4 text-white/80 text-sm truncate">{part.name}</div>
	                          <div className="col-span-3 text-white/40 text-xs">{part.partNo}</div>
                            <div className="col-span-1 text-white/50 text-xs">{part.quantity}</div>
	                          <div className="col-span-3">
	                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusClass}`}>
	                              {part.status}
                            </span>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {partsLoading && (
            <div className="text-center py-16 text-white/30">
              <p className="text-lg">Loading spare parts...</p>
            </div>
          )}

          {!partsLoading && Object.keys(groupedFiltered).length === 0 && (
            <div className="text-center py-16 text-white/20">
              <p className="text-lg">No parts found for your search.</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 pt-6 border-t border-white/5">
          {Object.entries(STATUS_COLORS).map(([status, cls]) => (
            <div key={status} className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border font-medium ${cls}`}>{status}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
