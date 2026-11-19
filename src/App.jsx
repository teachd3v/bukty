import React, { useState, useEffect, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProgramOverviewSection from './components/ProgramOverviewSection';
import RequirementsSection from './components/RequirementsSection';
import TimelineSection from './components/TimelineSection';
import FaqSection from './components/FaqSection';
import Footer from './components/Footer';
import CtaSection from './components/CtaSection';
import { Sparkles } from 'lucide-react';
import { buildSiteSchedule } from './utils/buktyConfig';

const RegistrationFormModal = lazy(() => import('./components/RegistrationFormModal'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const PengumumanPage = lazy(() => import('./components/PengumumanPage'));
const PantukhirPage = lazy(() => import('./components/PantukhirPage'));

function RouteLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#FFFDF5] text-[#111827]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#111827] border-t-[#FFD60A] rounded-full animate-spin"></div>
        <span className="font-extrabold text-xs">Memuat halaman BUKTY...</span>
      </div>
    </div>
  );
}

export default function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [isPengumumanRoute, setIsPengumumanRoute] = useState(false);
  const [isPantukhirRoute, setIsPantukhirRoute] = useState(false);
  const [siteSchedule, setSiteSchedule] = useState(() => buildSiteSchedule(null));

  const fetchSiteSchedule = async () => {
    try {
      const res = await fetch('/api/announcement');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setSiteSchedule(buildSiteSchedule(json.data));
        }
      }
    } catch (e) {
      // Fallback safely to default schedule in buktyConfig
    }
  };

  useEffect(() => {
    fetchSiteSchedule();
  }, []);

  const targetDate = new Date(siteSchedule.deadlineIso).getTime();
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
      alert(`Pendaftaran program BUKTY (Bantuan UKT Yatim) telah resmi ditutup pada ${siteSchedule.deadlineLabel}.`);
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
      <Suspense fallback={<RouteLoader />}>
        <AdminDashboard
          onLeaveAdmin={() => {
            setIsAdminRoute(false);
            fetchSiteSchedule();
            if (window.location.pathname !== '/') {
              window.history.replaceState(null, '', '/');
            } else {
              window.location.hash = '';
            }
          }}
        />
      </Suspense>
    );
  }

  if (isPengumumanRoute) {
    return (
      <div className="min-h-screen flex flex-col relative selection:bg-[#FFD60A] selection:text-[#111827] bg-[#FFFDF5]">
        <Navbar showAnnouncementMenus={siteSchedule.showAnnouncementMenus} />
        <main className="flex-grow">
          <Suspense fallback={<RouteLoader />}>
            <PengumumanPage />
          </Suspense>
        </main>
        <Footer showAnnouncementMenus={siteSchedule.showAnnouncementMenus} />
        {isFormOpen && (
          <Suspense fallback={null}>
            <RegistrationFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
          </Suspense>
        )}
      </div>
    );
  }

  if (isPantukhirRoute) {
    return (
      <div className="min-h-screen flex flex-col relative selection:bg-[#FFD60A] selection:text-[#111827] bg-[#FFFDF5]">
        <Navbar showAnnouncementMenus={siteSchedule.showAnnouncementMenus} />
        <main className="flex-grow">
          <Suspense fallback={<RouteLoader />}>
            <PantukhirPage />
          </Suspense>
        </main>
        <Footer showAnnouncementMenus={siteSchedule.showAnnouncementMenus} />
        {isFormOpen && (
          <Suspense fallback={null}>
            <RegistrationFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
          </Suspense>
        )}
      </div>
    );
  }

  const marqueeText =
    `PENDAFTARAN BUKTY (BANTUAN UKT YATIM) RESMI DIBUKA ${siteSchedule.registrationRangeLabel.toUpperCase()} • BANTUAN MAKS. RP 3.000.000/SEMESTER UNTUK 2 SEMESTER (PERIODE 2027) • PTN DI 12 PROVINSI • 100% GRATIS`;

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

      <Navbar showAnnouncementMenus={siteSchedule.showAnnouncementMenus} />

      <main className="flex-grow">
        <HeroSection onOpenForm={handleOpenForm} isClosed={isClosed} schedule={siteSchedule} />
        <ProgramOverviewSection />
        <RequirementsSection onOpenForm={handleOpenForm} isClosed={isClosed} />
        <TimelineSection schedule={siteSchedule} />
        <FaqSection schedule={siteSchedule} />
        <CtaSection onOpenForm={handleOpenForm} isClosed={isClosed} schedule={siteSchedule} />
      </main>

      <Footer showAnnouncementMenus={siteSchedule.showAnnouncementMenus} />

      {isFormOpen && (
        <Suspense fallback={null}>
          <RegistrationFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
        </Suspense>
      )}
    </div>
  );
}
