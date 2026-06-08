import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
const CountUp = ({
  end,
  duration = 2,
  suffix = ''




}: {end: number;duration?: number;suffix?: string;}) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    let animationFrame: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / (duration * 1000), 1);
      // Easing function (easeOutExpo)
      const easeOut = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
      setCount(Math.floor(end * easeOut));
      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  return (
    <span>
      {count}
      {suffix}
    </span>);

};
export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-ulss-black">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=2000"
          alt="Luxury Vehicle"
          className="w-full h-full object-cover opacity-40" />
        
        <div className="absolute inset-0 bg-gradient-to-b from-ulss-black/80 via-ulss-black/60 to-ulss-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full">
        <div className="max-w-3xl">
          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.8,
              delay: 0.2
            }}>
            
            <span className="inline-block py-1 px-3 rounded-full border border-ulss-gold/30 bg-ulss-gold/10 text-ulss-gold text-xs font-semibold tracking-widest uppercase mb-6">
              Enterprise Asset Management
            </span>
          </motion.div>

          <motion.h1
            initial={{
              opacity: 0,
              y: 30
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.8,
              delay: 0.3
            }}
            className="text-5xl md:text-7xl font-display font-bold leading-[1.1] tracking-tight mb-6">
            
            Automotive Assets.
            <br />
            <span className="text-white/60">Managed Intelligently.</span>
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
              y: 30
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.8,
              delay: 0.4
            }}
            className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl leading-relaxed font-light">
            
            Enterprise-grade inventory management for vehicles, tools,
            workshops, and operational assets. Built for performance, designed
            for precision.
          </motion.p>

          <motion.div
            initial={{
              opacity: 0,
              y: 30
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.8,
              delay: 0.5
            }}
            className="flex flex-col sm:flex-row gap-4">
            
            <button className="bg-ulss-gold text-ulss-black px-8 py-4 rounded-sm font-semibold flex items-center justify-center gap-2 hover:bg-white transition-colors group">
              View Inventory
              <ChevronRight
                size={18}
                className="group-hover:translate-x-1 transition-transform" />
              
            </button>
            <button className="border border-white/20 bg-white/5 backdrop-blur-sm text-white px-8 py-4 rounded-sm font-semibold hover:bg-white/10 transition-colors">
              Request Demo
            </button>
          </motion.div>
        </div>

        {/* Animated Stats */}
        <motion.div
          initial={{
            opacity: 0,
            y: 40
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            duration: 0.8,
            delay: 0.8
          }}
          className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-10">
          
          <div>
            <div className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              <CountUp end={500} suffix="+" />
            </div>
            <div className="text-sm text-white/50 font-medium uppercase tracking-wider">
              Assets Managed
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-display font-bold text-white mb-2">
              <CountUp end={50} suffix="+" />
            </div>
            <div className="text-sm text-white/50 font-medium uppercase tracking-wider">
              Professional Tools
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-display font-bold text-ulss-gold mb-2">
              <CountUp end={99} suffix=".9%" />
            </div>
            <div className="text-sm text-white/50 font-medium uppercase tracking-wider">
              Inventory Accuracy
            </div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-display font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              Live
            </div>
            <div className="text-sm text-white/50 font-medium uppercase tracking-wider">
              Real-Time Monitoring
            </div>
          </div>
        </motion.div>
      </div>
    </section>);

}