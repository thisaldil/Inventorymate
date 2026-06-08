import React from 'react';
import { Twitter, Linkedin, Github } from 'lucide-react';
export function Footer() {
  return (
    <footer className="bg-ulss-black border-t border-white/10 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 bg-ulss-gold rounded-sm flex items-center justify-center">
                <span className="text-ulss-black font-display font-bold text-sm tracking-tighter">
                  U
                </span>
              </div>
              <span className="font-display font-bold text-lg tracking-wide text-white">
                ULSS{' '}
                <span className="text-white/60 font-medium">Inventories</span>
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed mb-6">
              Enterprise-grade inventory management for vehicles, tools,
              workshops, and operational assets.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="text-white/40 hover:text-ulss-gold transition-colors">
                
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-white/40 hover:text-ulss-gold transition-colors">
                
                <Linkedin size={20} />
              </a>
              <a
                href="#"
                className="text-white/40 hover:text-ulss-gold transition-colors">
                
                <Github size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-white/50">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Vehicle Tracking
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Tool Management
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Predictive Maintenance
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Analytics Dashboard
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-white/50">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Security
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm text-white/50">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} ULSS Inventories. All rights
            reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>System Status:</span>
            <span className="flex items-center gap-1.5 text-green-500">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>);

}