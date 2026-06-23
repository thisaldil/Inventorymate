
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Wrench, User, CalendarClock } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://inventorymate.vercel.app/api';

type ToolApiItem = {
  _id: string;
  toolId: string;
  toolName: string;
  category?: string;
  brand?: string;
  status?: string;
  condition?: string;
  location?: string;
  warrantyExpiry?: string;
  assignedTechnician?: {
    name?: string;
    fullName?: string;
    technicianName?: string;
  } | string;
  toolImage?: string;
};

type ToolDisplayItem = {
  id: string;
  name: string;
  category?: string;
  brand?: string;
  status: string;
  technician: string;
  nextService: string;
  image?: string;
};

function normalizeStatus(status?: string) {
  return status === 'Out Of Service' ? 'Out of Service' : status || 'Available';
}

function getTechnicianName(assignedTechnician?: ToolApiItem['assignedTechnician']) {
  if (!assignedTechnician) return 'Unassigned';
  if (typeof assignedTechnician === 'string') return 'Assigned';
  return assignedTechnician.name || assignedTechnician.fullName || assignedTechnician.technicianName || 'Assigned';
}

function formatDate(value?: string) {
  if (!value) return 'No date';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function resolveImage(path?: string) {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${API_BASE.replace(/\/api$/, '')}${path}`;
}

async function fetchPublicTools() {
  const params = new URLSearchParams({ page: '1', limit: '500', sort: 'toolName' });
  const response = await fetch(`${API_BASE}/tools?${params.toString()}`);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }

  return (payload.data ?? []).map((tool: ToolApiItem) => ({
    id: tool.toolId,
    name: tool.toolName,
    category: tool.category,
    brand: tool.brand,
    status: normalizeStatus(tool.status),
    technician: getTechnicianName(tool.assignedTechnician),
    nextService: formatDate(tool.warrantyExpiry),
    image: resolveImage(tool.toolImage),
  })) as ToolDisplayItem[];
}

export function ToolsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(12);
  const [tools, setTools] = useState<ToolDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const statuses = [
  'All',
  'Available',
  'In Use',
  'Reserved',
  'Maintenance Required',
  'Out of Service'];

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    setError('');

    fetchPublicTools()
      .then((items) => {
        if (!ignore) setTools(items);
      })
      .catch((err: any) => {
        if (!ignore) setError(err.message || 'Unable to load workshop tools.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tool.brand ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tool.category ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
      statusFilter === 'All' || tool.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tools, searchTerm, statusFilter]);
  const displayedTools = filteredTools.slice(0, visibleCount);
  const getStatusDot = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-500';
      case 'In Use':
        return 'bg-blue-500';
      case 'Reserved':
        return 'bg-ulss-gold';
      case 'Maintenance Required':
        return 'bg-orange-500';
      case 'Out of Service':
        return 'bg-red-500';
      default:
        return 'bg-white/20';
    }
  };
  // Small pool of generic tool/workshop images to cycle through
  const toolImages = [
  'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&q=80&w=400',
	  'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=400'];
  const getToolImage = (tool: ToolDisplayItem, index: number) => {
    if (tool.image) return tool.image;
    const numericId = Number.parseInt(tool.id.replace(/\D/g, ''), 10);
    return toolImages[Number.isFinite(numericId) ? numericId % toolImages.length : index % toolImages.length];
  };

  return (
    <section className="py-24 bg-ulss-black">
      <div className="px-6 mx-auto max-w-7xl md:px-12">
        <div className="mb-12">
          <h2 className="mb-4 text-3xl font-bold md:text-5xl font-display">
            Workshop Tools
          </h2>
          <p className="max-w-2xl text-white/50">
            Precision tracking for {loading ? 'your' : tools.length.toLocaleString()} professional mechanical assets.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 mb-8 md:flex-row">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute -translate-y-1/2 left-3 top-1/2 text-white/40"
              size={18} />
            
            <input
              type="text"
              placeholder="Search tools by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-sm py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-ulss-gold transition-colors" />
            
          </div>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) =>
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2.5 text-xs font-medium rounded-sm transition-all border ${statusFilter === status ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-white/50 hover:border-white/20 hover:text-white'}`}>
              
                {status}
              </button>
            )}
          </div>
        </div>

        {error &&
        <div className="px-4 py-3 mb-6 text-sm text-red-300 border rounded-sm border-red-500/20 bg-red-500/10">
            {error}
          </div>
        }

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedTools.map((tool, index) =>
          <motion.div
            key={tool.id}
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.3,
              delay: index % 12 * 0.05
            }}
            className="bg-white/[0.02] border border-white/5 rounded-lg p-4 hover:bg-white/[0.04] transition-colors">
            
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 overflow-hidden rounded-md shrink-0 bg-white/5">
	                  <img
	                  src={getToolImage(tool, index)}
	                  alt={tool.name}
	                  className="object-cover w-full h-full opacity-80 mix-blend-luminosity" />
                
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1 font-mono text-xs text-white/40">
                    {tool.id}
                  </div>
                  <h4 className="mb-2 text-sm font-medium text-white truncate">
                    {tool.name}
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <div
                    className={`w-1.5 h-1.5 rounded-full ${getStatusDot(tool.status)}`}>
                  </div>
                    <span className="text-xs text-white/60">{tool.status}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4 mt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <User size={12} />
                  <span className="truncate">{tool.technician}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <CalendarClock size={12} />
                  <span>{tool.nextService}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {loading &&
        <div className="py-12 text-center text-white/40">
            Loading workshop tools...
          </div>
        }

        {!loading && filteredTools.length === 0 &&
        <div className="py-12 text-center text-white/40">
            No tools found matching your criteria.
          </div>
        }

        {visibleCount < filteredTools.length &&
        <div className="mt-10 text-center">
            <button
            onClick={() => setVisibleCount((prev) => prev + 12)}
            className="px-6 py-2 text-sm font-medium transition-colors border rounded-sm border-white/10 text-white/70 hover:text-white hover:border-white/30">
            
              Load More Tools
            </button>
          </div>
        }
      </div>
    </section>);

}