import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area } from
'recharts';
import { chartData } from './data';
export function Analytics() {
  return (
    <section
      id="analytics"
      className="py-24 bg-[#050505] border-y border-white/5">
      
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Live Analytics
          </h2>
          <p className="text-white/50 max-w-2xl">
            Data-driven insights to optimize fleet utilization and reduce
            operational downtime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Utilization Chart */}
          <motion.div
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
              duration: 0.6
            }}
            className="bg-ulss-black border border-white/5 rounded-xl p-6">
            
            <h3 className="font-display font-semibold text-lg mb-6">
              Asset Utilization (6 Months)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData.utilization}
                  margin={{
                    top: 5,
                    right: 20,
                    bottom: 5,
                    left: 0
                  }}>
                  
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false} />
                  
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false} />
                  
                  <YAxis
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false} />
                  
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A0A0A',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '4px'
                    }}
                    itemStyle={{
                      color: '#fff'
                    }} />
                  
                  <Line
                    type="monotone"
                    dataKey="vehicles"
                    name="Vehicles %"
                    stroke="#D4AF37"
                    strokeWidth={2}
                    dot={{
                      fill: '#0A0A0A',
                      stroke: '#D4AF37',
                      strokeWidth: 2
                    }} />
                  
                  <Line
                    type="monotone"
                    dataKey="tools"
                    name="Tools %"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    dot={{
                      fill: '#0A0A0A',
                      stroke: '#FFFFFF',
                      strokeWidth: 2
                    }} />
                  
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Health Score Chart */}
          <motion.div
            initial={{
              opacity: 0,
              x: 20
            }}
            whileInView={{
              opacity: 1,
              x: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.6,
              delay: 0.2
            }}
            className="bg-ulss-black border border-white/5 rounded-xl p-6">
            
            <h3 className="font-display font-semibold text-lg mb-6">
              Fleet Health Score
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData.healthScore}
                  margin={{
                    top: 5,
                    right: 20,
                    bottom: 5,
                    left: 0
                  }}>
                  
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false} />
                  
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false} />
                  
                  <YAxis
                    domain={[90, 100]}
                    stroke="rgba(255,255,255,0.3)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false} />
                  
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0A0A0A',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '4px'
                    }} />
                  
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#D4AF37"
                    fillOpacity={1}
                    fill="url(#colorScore)" />
                  
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

}