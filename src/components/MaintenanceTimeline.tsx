import React from 'react';
import { motion } from 'framer-motion';
import { timelineData } from './data';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
export function MaintenanceTimeline() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 size={20} className="text-green-500" />;
      case 'active':
        return <AlertCircle size={20} className="text-ulss-gold" />;
      case 'pending':
        return <Clock size={20} className="text-white/40" />;
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

        <div className="relative border-l border-white/10 ml-3 md:ml-4 space-y-12">
          {timelineData.map((item, idx) =>
          <motion.div
            key={item.id}
            initial={{
              opacity: 0,
              x: -20
            }}
            whileInView={{
              opacity: 1,
              x: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.5,
              delay: idx * 0.1
            }}
            className="relative pl-8 md:pl-12">
            
              <div className="absolute -left-[11px] top-1 bg-[#050505] p-0.5 rounded-full">
                {getStatusIcon(item.status)}
              </div>

              <div className="bg-ulss-black border border-white/5 p-6 rounded-lg">
                <div className="text-xs font-semibold text-ulss-gold uppercase tracking-wider mb-2">
                  {item.type}
                </div>
                <h4 className="text-lg font-medium text-white mb-1">
                  {item.title}
                </h4>
                <div className="text-sm text-white/40">{item.date}</div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}