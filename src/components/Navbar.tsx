import React, { useEffect, useState } from 'react';
import invLogo from '../assets/inv.png';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openLogin = () => {
    setLoginOpen(true);
    setMobileMenuOpen(false);
  };

  const closeLogin = () => setLoginOpen(false);
  const navLinks = [
  {
    name: 'Platform',
    href: '#platform'
  },
  {
    name: 'Spare Parts',
    href: '#spare-parts'
  },
  {
    name: 'Analytics',
    href: '#analytics'
  },
  {
    name: 'Features',
    href: '#features'
  }];

  return (
    <>
    <motion.nav
      initial={{
        y: -100
      }}
      animate={{
        y: 0
      }}
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-ulss-black/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer">
        
          <img src={invLogo} alt="ULSS Inventories" className="h-10 md:h-12 object-contain" />
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {navLinks.map((link) =>
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              
                {link.name}
              </a>
            )}
          </div>
          <div className="w-px h-4 bg-white/20"></div>
          <button
            type="button"
            onClick={openLogin}
            className="text-sm font-medium text-white hover:text-ulss-gold transition-colors">
            Log In
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('contact')}
            className="bg-ulss-gold text-ulss-black px-5 py-2.5 rounded-sm text-sm font-semibold hover:bg-white transition-colors">
            Request Demo
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen &&
      <div className="md:hidden absolute top-full left-0 right-0 bg-ulss-black border-b border-white/10 p-6 flex flex-col gap-4">
          {navLinks.map((link) =>
        <a
          key={link.name}
          href={link.href}
          className="text-lg font-medium text-white/80 hover:text-white"
          onClick={() => setMobileMenuOpen(false)}>
          
              {link.name}
            </a>
        )}
          <div className="h-px w-full bg-white/10 my-2"></div>
          <button className="text-left text-lg font-medium text-white">
            Log In
          </button>
          <button
            type="button"
            onClick={() => { scrollToSection('contact'); setMobileMenuOpen(false); }}
            className="bg-ulss-gold text-ulss-black px-5 py-3 rounded-sm text-base font-semibold mt-2 text-center">
            Request Demo
          </button>
        </div>
      }
    </motion.nav>

    <AnimatePresence>
      {loginOpen && (
      <motion.div
        key="login-drawer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex">

        <div className="absolute inset-0 bg-black/50" onClick={closeLogin} />

        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.28 }}
          className="ml-auto h-full w-full md:w-[420px] bg-ulss-black/95 backdrop-blur-md border-l border-white/5 p-6">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-display font-bold">Sign In</h3>
              <p className="text-sm text-white/60">Enter your email and password to continue</p>
            </div>
            <button onClick={closeLogin} className="text-white/50 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              // fake submit: close drawer after short delay
              setTimeout(() => {
                setLoginOpen(false);
              }, 600);
            }}
            className="space-y-4">
            <div>
              <label className="text-xs text-white/60 uppercase tracking-wider">Email</label>
              <input required type="email" className="w-full mt-2 bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-white focus:outline-none focus:border-ulss-gold" />
            </div>
            <div>
              <label className="text-xs text-white/60 uppercase tracking-wider">Password</label>
              <input required type="password" className="w-full mt-2 bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-white focus:outline-none focus:border-ulss-gold" />
            </div>

            <div className="flex items-center justify-between mt-4">
              <button type="submit" className="bg-ulss-gold text-ulss-black px-4 py-2 rounded-sm font-semibold">Sign In</button>
              <button type="button" onClick={closeLogin} className="text-sm text-white/60 hover:text-white">Cancel</button>
            </div>
          </form>
        </motion.div>
      </motion.div>)}
    </AnimatePresence>
    </>
  );
}