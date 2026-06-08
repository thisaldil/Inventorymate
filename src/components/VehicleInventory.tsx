import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { vehiclesData } from './data';
import { Calendar, Tag } from 'lucide-react';
const categories = [
'All',
'Luxury Cars',
'SUVs',
'Vans',
'Commercial Vehicles',
'Utility Vehicles'];

export function VehicleInventory() {
  const [activeCategory, setActiveCategory] = useState('All');
  const filteredVehicles =
  activeCategory === 'All' ?
  vehiclesData :
  vehiclesData.filter((v) => v.category === activeCategory);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-white/10 text-white border-white/20';
      case 'Reserved':
        return 'bg-ulss-gold/10 text-ulss-gold border-ulss-gold/20';
      case 'In Service':
        return 'bg-white/5 text-white/60 border-white/10';
      case 'Under Repair':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-white/10 text-white border-white/20';
    }
  };
  return (
    <section
      id="inventory"
      className="py-24 bg-[#050505] border-y border-white/5">
      
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
              Vehicle Fleet
            </h2>
            <p className="text-white/50 max-w-xl">
              Comprehensive catalog of operational vehicles, tracked in
              real-time.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) =>
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-sm transition-all ${activeCategory === cat ? 'bg-white text-ulss-black' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}>
              
                {cat}
              </button>
            )}
          </div>
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <AnimatePresence mode="popLayout">
            {filteredVehicles.map((vehicle) =>
            <motion.div
              key={vehicle.id}
              layout
              initial={{
                opacity: 0,
                scale: 0.95
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              exit={{
                opacity: 0,
                scale: 0.95
              }}
              transition={{
                duration: 0.3
              }}
              className="group bg-ulss-black border border-white/5 rounded-lg overflow-hidden hover:border-white/20 transition-colors">
              
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                
                  <div className="absolute top-3 right-3">
                    <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-sm border backdrop-blur-md ${getStatusColor(vehicle.status)}`}>
                    
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
                      <span className="text-white font-medium">
                        {vehicle.reg}
                      </span>
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
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>);

}