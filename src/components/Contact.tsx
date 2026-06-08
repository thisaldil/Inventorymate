import React, { useState } from 'react';
import { motion } from 'framer-motion';
export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };
  return (
    <section className="py-24 bg-[#050505] border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(212,175,55,0.05)_0%,transparent_50%)]"></div>

      <div className="max-w-3xl mx-auto px-6 md:px-12 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
            Elevate Your Operations
          </h2>
          <p className="text-white/50">
            Request a private demonstration of the ULSS platform.
          </p>
        </div>

        <motion.div
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
          className="bg-ulss-black border border-white/10 p-8 md:p-10 rounded-xl">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-ulss-gold transition-colors" />
                
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                  Work Email
                </label>
                <input
                  required
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-ulss-gold transition-colors" />
                
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                  Company
                </label>
                <input
                  required
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-ulss-gold transition-colors" />
                
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                  Fleet Size
                </label>
                <select className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-ulss-gold transition-colors appearance-none">
                  <option value="1-50">1 - 50 Assets</option>
                  <option value="51-200">51 - 200 Assets</option>
                  <option value="201-500">201 - 500 Assets</option>
                  <option value="500+">500+ Assets</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                Message (Optional)
              </label>
              <textarea
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-ulss-gold transition-colors resize-none">
              </textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-ulss-gold text-ulss-black font-bold py-4 rounded-sm hover:bg-white transition-colors">
              
              {submitted ? 'Request Received' : 'Request Demo'}
            </button>
          </form>
        </motion.div>
      </div>
    </section>);

}