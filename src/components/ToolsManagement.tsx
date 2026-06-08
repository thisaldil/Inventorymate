import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toolsData } from './data';
import { Search, Wrench, User, CalendarClock } from 'lucide-react';
export function ToolsManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(12);
  const statuses = [
  'All',
  'Available',
  'In Use',
  'Reserved',
  'Maintenance Required',
  'Out of Service'];

  const filteredTools = useMemo(() => {
    return toolsData.filter((tool) => {
      const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
      statusFilter === 'All' || tool.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);
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

  return (
    <section className="py-24 bg-ulss-black">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-12">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Workshop Tools
          </h2>
          <p className="text-white/50 max-w-2xl">
            Precision tracking for 50+ professional mechanical assets.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
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

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
                <div className="w-16 h-16 rounded-md overflow-hidden shrink-0 bg-white/5">
                  <img
                  src={toolImages[parseInt(tool.id.split('-')[2]) % 5]}
                  alt={tool.name}
                  className="w-full h-full object-cover opacity-80 mix-blend-luminosity" />
                
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/40 font-mono mb-1">
                    {tool.id}
                  </div>
                  <h4 className="font-medium text-sm text-white truncate mb-2">
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

              <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
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

        {filteredTools.length === 0 &&
        <div className="text-center py-12 text-white/40">
            No tools found matching your criteria.
          </div>
        }

        {visibleCount < filteredTools.length &&
        <div className="mt-10 text-center">
            <button
            onClick={() => setVisibleCount((prev) => prev + 12)}
            className="px-6 py-2 border border-white/10 text-sm font-medium text-white/70 hover:text-white hover:border-white/30 transition-colors rounded-sm">
            
              Load More Tools
            </button>
          </div>
        }
      </div>
    </section>);

}