import { Suspense, lazy } from 'react';
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

const AdminApp = lazy(() => import('./admin/AdminApp'));

export function App() {
  const isAdminRoute =
    window.location.pathname.startsWith('/admin') ||
    window.location.pathname.startsWith('/reset-password');

  if (isAdminRoute) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen bg-ulss-black text-white flex items-center justify-center">
            Loading admin workspace...
          </div>
        }
      >
        <AdminApp />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-ulss-black text-white selection:bg-ulss-gold selection:text-ulss-black">
      <Navbar />
      <main>
        <Hero />
        <DashboardPreview />
        <PhotosSections />
        <ToolsManagement />
        <Analytics />
        <MaintenanceTimeline />
        <Features />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}