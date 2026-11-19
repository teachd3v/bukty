import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProgramOverviewSection from './components/ProgramOverviewSection';
import RequirementsSection from './components/RequirementsSection';
import TimelineSection from './components/TimelineSection';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import RegistrationFormModal from './components/RegistrationFormModal';
import AdminDashboard from './components/AdminDashboard';
import CtaSection from './components/CtaSection';
import PengumumanPage from './components/PengumumanPage';
import PantukhirPage from './components/PantukhirPage';
import { Sparkles } from 'lucide-react';
import { REGISTRATION_DEADLINE_ISO, REGISTRATION_DEADLINE_LABEL } from './utils/buktyConfig';

export default function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isPengumumanRoute, setIsPengumumanRoute] = useState(false);
  const [isPantukhirRoute, setIsPantukhirRoute] = useState(false);

  const targetDate = new Date(REGISTRATION_DEADLINE_ISO).getTime();
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    const checkClosed = () => {
      setIsClosed(new Date().getTime() >= targetDate);
    };
    checkClosed();
    const interval = setInterval(checkClosed, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const handleOpenForm = () => {
    if (new Date().getTime() >= targetDate) {
      alert(`Pendaftaran program BUKTY (Bantuan UKT Yatim) telah resmi ditutup pada ${REGISTRATION_DEADLINE_LABEL}.`);
      return;
    }
    setIsFormOpen(true);
  };

  useEffect(() => {
    const checkRoute = () => {
      const hash = window.location.hash;
      const pathname = window.location.pathname;

      if (
        hash === '#pengumuman' ||
        hash === '#bypasspengumuman' ||
        (pathname.includes('/pengumuman') && hash !== '#admin' && hash !== '#pantukhir' && hash !== '#bypasspantukhir')
      ) {
        setIsAdminRoute(false);
        setIsPengumumanRoute(true);
        setIsPantukhirRoute(false);
      } else if (
        hash === '#pantukhir' ||
        hash === '#bypasspantukhir' ||
        (pathname.includes('/pantukhir') && hash !== '#admin')
      ) {
        setIsAdminRoute(false);
        setIsPengumumanRoute(false);
        setIsPantukhirRoute(true);
      } else if (hash === '#admin' || pathname.includes('/admin')) {
        setIsAdminRoute(true);
        setIsPengumumanRoute(false);
        setIsPantukhirRoute(false);
      } else {
        setIsAdminRoute(false);
        setIsPengumumanRoute(false);
        setIsPantukhirRoute(false);
      }
    };
    checkRoute();

    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
  }, []);

  if (isAdminRoute) {
    return (
      <AdminDashboard
        onLeaveAdmin={() => {
          setIsAdminRoute(false);
          if (window.location.pathname !== '/') {
            window.history.replaceState(null, '', '/');
          } else {
            window.location.hash = '';
          }
        }}
      />
    );
  }

  if (isPengumumanRoute) {
    return (
      <div className="min-h-screen flex flex-col relative selection:bg-[#FFD60A] selection:text-[#111827] bg-[#FFFDF5]">
        <Navbar onOpenForm={handleOpenForm} isClosed={isClosed} />
        <main className="flex-grow">
          <PengumumanPage />
        </main>
        <Footer />
        <RegistrationFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
      </div>
    );
  }

  if (isPantukhirRoute) {
    return (
      <div className="min-h-screen flex flex-col relative selection:bg-[#FFD60A] selection:text-[#111827] bg-[#FFFDF5]">
        <Navbar onOpenForm={handleOpenForm} isClosed={isClosed} />
        <main className="flex-grow">
          <PantukhirPage />
        </main>
        <Footer />
        <RegistrationFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
      </div>
    );
  }

  const marqueeText =
    'PENDAFTARAN BUKTY (BANTUAN UKT YATIM) RESMI DIBUKA 19–25 NOV 2026 • BANTUAN MAKS. RP 3.000.000/SEMESTER UNTUK 2 SEMESTER (PERIODE 2027) • PTN DI 12 PROVINSI • 100% GRATIS';

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-[#FFD60A] selection:text-[#111827] bg-[#FFFDF5]">
      {/* Top Banner Marquee: Royal Cobalt Blue + Sunburst Yellow */}
      <div className="bg-[#1D4ED8] text-white py-2 border-b-[2.5px] border-[#111827] overflow-hidden whitespace-nowrap select-none flex items-center">
        <div className="animate-marquee font-black text-xs uppercase tracking-wide flex items-center gap-6">
          {[0, 1, 2, 3].map((idx) => (
            <React.Fragment key={idx}>
              <span className="flex items-center gap-2 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-[#FFD60A]" />
                <span>{marqueeText}</span>
              </span>
              <span className="shrink-0 text-[#FFD60A]">★</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <Navbar onOpenForm={handleOpenForm} isClosed={isClosed} />

      <main className="flex-grow">
        <HeroSection onOpenForm={handleOpenForm} isClosed={isClosed} />
        <ProgramOverviewSection />
        <RequirementsSection onOpenForm={handleOpenForm} isClosed={isClosed} />
        <TimelineSection />
        <FaqSection />
        <CtaSection onOpenForm={handleOpenForm} isClosed={isClosed} />
      </main>

      <Footer />

      <RegistrationFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
