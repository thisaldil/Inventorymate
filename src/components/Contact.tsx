import React, { useState } from 'react';
import { motion } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://inventorymate.vercel.app/api';

export function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    company: '',
    fleetSize: '1-50',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSubmitted(false);

    try {
      const response = await fetch(`${API_BASE}/contact/demo-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.message || 'Unable to send your request right now.');
      }

      setSubmitted(true);
      setForm({
        fullName: '',
        email: '',
        company: '',
        fleetSize: '1-50',
        message: '',
      });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Unable to send your request right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-[#050505] border-t border-white/5 relative overflow-hidden">
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
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
	                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-ulss-gold transition-colors" />
                
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                  Work Email
                </label>
	                <input
	                  required
	                  type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
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
                    name="company"
                    value={form.company}
                    onChange={handleChange}
	                  className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-ulss-gold transition-colors" />
                
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                  Fleet Size
                </label>
	                <select
                    name="fleetSize"
                    value={form.fleetSize}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-ulss-gold transition-colors appearance-none"
                  >
	                  <option value="1-50" className="bg-[#0b0b0b] text-white">1 - 50 Assets</option>
	                  <option value="51-200" className="bg-[#0b0b0b] text-white">51 - 200 Assets</option>
	                  <option value="201-500" className="bg-[#0b0b0b] text-white">201 - 500 Assets</option>
	                  <option value="500+" className="bg-[#0b0b0b] text-white">500+ Assets</option>
	                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider">
                Message (Optional)
              </label>
	              <textarea
	                rows={4}
                  name="message"
                  value={form.message}
                  onChange={handleChange}
	                className="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-white focus:outline-none focus:border-ulss-gold transition-colors resize-none"
                />
	            </div>

              {error && (
                <div className="rounded-sm border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              {submitted && (
                <div className="rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  Thank you. Your demo request was sent successfully.
                </div>
              )}

	            <button
	              type="submit"
                disabled={loading}
	              className="w-full bg-ulss-gold text-ulss-black font-bold py-4 rounded-sm hover:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
	              
	              {loading ? 'Sending Request...' : submitted ? 'Request Sent' : 'Request Demo'}
	            </button>
          </form>
        </motion.div>
      </div>
    </section>);

}
