import React from 'react';
import { motion } from 'framer-motion';
import {
  Map,
  ShieldCheck,
  Wrench,
  RefreshCw,
  Zap,
  LineChart } from
'lucide-react';
export function Features() {
  const features = [
  {
    icon: <Map size={24} />,
    title: 'Real-Time Tracking',
    desc: 'Pinpoint precise locations of high-value assets globally.'
  },
  {
    icon: <ShieldCheck size={24} />,
    title: 'Enterprise Security',
    desc: 'Bank-grade encryption and role-based access controls.'
  },
  {
    icon: <Wrench size={24} />,
    title: 'Predictive Maintenance',
    desc: 'AI-driven alerts before mechanical failures occur.'
  },
  {
    icon: <RefreshCw size={24} />,
    title: 'Lifecycle Management',
    desc: 'Track depreciation, ROI, and optimal replacement windows.'
  },
  {
    icon: <Zap size={24} />,
    title: 'Workshop Optimization',
    desc: 'Streamline tool checkouts and technician assignments.'
  },
  {
    icon: <LineChart size={24} />,
    title: 'Fleet Intelligence',
    desc: 'Custom reporting and executive dashboard analytics.'
  }];

  return (
    <section id="features" className="py-24 bg-ulss-black">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Why ULSS Inventories
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            The architecture of modern fleet management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) =>
          <motion.div
            key={idx}
            initial={{
              opacity: 0,
              y: 20
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.5,
              delay: idx * 0.1
            }}
            className="p-8 border border-white/5 bg-white/[0.02] rounded-xl hover:bg-white/[0.04] transition-colors group">
            
              <div className="w-12 h-12 rounded-lg bg-ulss-gold/10 flex items-center justify-center text-ulss-gold mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-display font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-white/50 leading-relaxed">{feature.desc}</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}