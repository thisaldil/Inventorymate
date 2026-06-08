import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const navLinks = [
  {
    name: 'Platform',
    href: '#platform'
  },
  {
    name: 'Inventory',
    href: '#inventory'
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
          <div className="w-8 h-8 bg-ulss-gold rounded-sm flex items-center justify-center">
            <span className="text-ulss-black font-display font-bold text-lg tracking-tighter">
              U
            </span>
          </div>
          <span className="font-display font-bold text-xl tracking-wide text-white">
            ULSS <span className="text-white/60 font-medium">Inventories</span>
          </span>
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
          <button className="text-sm font-medium text-white hover:text-ulss-gold transition-colors">
            Sign In
          </button>
          <button className="bg-ulss-gold text-ulss-black px-5 py-2.5 rounded-sm text-sm font-semibold hover:bg-white transition-colors">
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
            Sign In
          </button>
          <button className="bg-ulss-gold text-ulss-black px-5 py-3 rounded-sm text-base font-semibold mt-2 text-center">
            Request Demo
          </button>
        </div>
      }
    </motion.nav>);

}