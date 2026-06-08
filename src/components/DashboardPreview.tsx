import React from 'react';
import { motion } from 'framer-motion';
import { Car, Wrench, Activity, AlertCircle } from 'lucide-react';
export function DashboardPreview() {
  return (
    <section id="platform" className="py-24 bg-ulss-black relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Executive Overview
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            Real-time visibility into your entire operational fleet and workshop
            assets.
          </p>
        </div>

        <motion.div
          initial={{
            opacity: 0,
            y: 40
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true,
            margin: '-100px'
          }}
          transition={{
            duration: 0.8
          }}
          className="glass-panel rounded-xl p-2 md:p-6 shadow-2xl shadow-ulss-gold/5">
          
          {/* Mock Browser/App Header */}
          <div className="flex items-center gap-2 mb-6 px-4 pt-2">
            <div className="w-3 h-3 rounded-full bg-white/20"></div>
            <div className="w-3 h-3 rounded-full bg-white/20"></div>
            <div className="w-3 h-3 rounded-full bg-white/20"></div>
            <div className="ml-4 text-xs text-white/40 font-medium">
              ULSS Command Center
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Vehicle Metrics */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-ulss-gold/10 rounded-md">
                  <Car className="text-ulss-gold" size={20} />
                </div>
                <h3 className="font-display font-semibold text-lg">
                  Vehicle Metrics
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <span className="text-sm text-white/60">Total Vehicles</span>
                  <span className="text-xl font-semibold">142</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <span className="text-sm text-white/60">Available</span>
                  <span className="text-xl font-semibold text-green-400">
                    98
                  </span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <span className="text-sm text-white/60">Reserved</span>
                  <span className="text-xl font-semibold text-blue-400">
                    32
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-sm text-white/60">
                    Under Maintenance
                  </span>
                  <span className="text-xl font-semibold text-red-400">12</span>
                </div>
              </div>
            </div>

            {/* Tool Metrics */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/10 rounded-md">
                  <Wrench className="text-white" size={20} />
                </div>
                <h3 className="font-display font-semibold text-lg">
                  Tool Metrics
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <span className="text-sm text-white/60">Total Tools</span>
                  <span className="text-xl font-semibold">50</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <span className="text-sm text-white/60">Available</span>
                  <span className="text-xl font-semibold text-green-400">
                    34
                  </span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-3">
                  <span className="text-sm text-white/60">Assigned</span>
                  <span className="text-xl font-semibold text-ulss-gold">
                    12
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-sm text-white/60">
                    Service Required
                  </span>
                  <span className="text-xl font-semibold text-red-400">4</span>
                </div>
              </div>
            </div>

            {/* Asset Metrics */}
            <div className="bg-white/5 rounded-lg p-6 border border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/10 rounded-md">
                  <Activity className="text-white" size={20} />
                </div>
                <h3 className="font-display font-semibold text-lg">
                  Asset Health
                </h3>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60">Fleet Readiness</span>
                    <span className="text-white font-medium">91.5%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 w-[91.5%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60">Asset Utilization</span>
                    <span className="text-white font-medium">78.2%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-ulss-gold w-[78.2%]"></div>
                  </div>
                </div>
                <div className="bg-ulss-gold/10 border border-ulss-gold/20 rounded-md p-3 flex items-start gap-3 mt-4">
                  <AlertCircle
                    className="text-ulss-gold shrink-0 mt-0.5"
                    size={16} />
                  
                  <div>
                    <div className="text-sm font-medium text-ulss-gold">
                      Action Required
                    </div>
                    <div className="text-xs text-white/60 mt-1">
                      4 vehicles scheduled for preventative maintenance this
                      week.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>);

}