import { Suspense, lazy, useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { DashboardPreview } from './components/DashboardPreview';
import { ToolsManagement } from './components/ToolsManagement';
import { PhotosSections } from './components/PhotosSections';
import { Analytics } from './components/Analytics';
import { MaintenanceTimeline } from './components/MaintenanceTimeline';
import { Features } from './components/Features';
import { Testimonials } from './components/Testimonials';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { LoadingScreen } from './components/LoadingScreen';
import { ScrollReveal } from './components/ScrollReveal';

const AdminApp = lazy(() => import('./admin/AdminApp'));

export function App() {
  const [booting, setBooting] = useState(true);
  const isAdminRoute =
    window.location.pathname.startsWith('/admin') ||
    window.location.pathname.startsWith('/reset-password');

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 950);
    return () => window.clearTimeout(timer);
  }, []);

  if (booting) {
    return <LoadingScreen />;
  }

  if (isAdminRoute) {
    return (
      <Suspense fallback={<LoadingScreen label="Loading admin workspace" />}>
        <AdminApp />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen text-white bg-ulss-black selection:bg-ulss-gold selection:text-ulss-black">
      <Navbar />
      <main>
        <Hero />
        <ScrollReveal>
          <DashboardPreview />
        </ScrollReveal>
        <PhotosSections />
        <ScrollReveal delay={0.04}>
          <ToolsManagement />
        </ScrollReveal>
        <ScrollReveal delay={0.04}>
          <Analytics />
        </ScrollReveal>
        <ScrollReveal delay={0.04}>
          <MaintenanceTimeline />
        </ScrollReveal>
        <ScrollReveal delay={0.04}>
          <Features />
        </ScrollReveal>
        <ScrollReveal delay={0.04}>
          <Testimonials />
        </ScrollReveal>
        <ScrollReveal delay={0.04}>
          <Contact />
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  );
}
