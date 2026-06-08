import React from 'react';
import { motion } from 'framer-motion';
import { testimonialsData } from './data';
import { Quote } from 'lucide-react';
export function Testimonials() {
  return (
    <section className="py-24 bg-ulss-black">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialsData.map((t, idx) =>
          <motion.div
            key={t.id}
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
              duration: 0.6,
              delay: idx * 0.2
            }}
            className="bg-white/[0.02] border border-white/5 p-8 rounded-xl relative">
            
              <Quote
              className="text-white/10 absolute top-6 right-6"
              size={40} />
            
              <p className="text-lg text-white/80 leading-relaxed mb-8 relative z-10">
                "{t.quote}"
              </p>
              <div>
                <div className="font-semibold text-white">{t.name}</div>
                <div className="text-sm text-ulss-gold">{t.role}</div>
                <div className="text-xs text-white/40 mt-1">{t.company}</div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}