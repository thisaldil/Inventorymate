import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { DashboardPreview } from './components/DashboardPreview';
import { VehicleInventory } from './components/VehicleInventory';
import { ToolsManagement } from './components/ToolsManagement';
import { PhotosSections } from './components/PhotosSections';
import { Analytics } from './components/Analytics';
import { MaintenanceTimeline } from './components/MaintenanceTimeline';
import { Features } from './components/Features';
import { Testimonials } from './components/Testimonials';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
export function App() {
  return (
    <div className="min-h-screen bg-ulss-black text-white selection:bg-ulss-gold selection:text-ulss-black">
      <Navbar />
      <main>
        <Hero />
        <DashboardPreview />
        <PhotosSections />
        <VehicleInventory />
        <ToolsManagement />
        <Analytics />
        <MaintenanceTimeline />
        <Features />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>);

}