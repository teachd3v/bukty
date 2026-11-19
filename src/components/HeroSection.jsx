import React, { useState, useEffect } from 'react';
import { Banknote, GraduationCap, MapPin, Clock, Trophy, Megaphone } from 'lucide-react';
import { REGISTRATION_DEADLINE_ISO } from '../utils/buktyConfig';

export default function HeroSection({ onOpenForm, isClosed }) {
  const targetDate = new Date(REGISTRATION_DEADLINE_ISO).getTime();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const now = new Date().getTime();
    const difference = targetDate - now;
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="hero" className="pt-5 md:pt-16 pb-10 md:pb-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-10 items-center">
          {/* Left Column: BUKTY Neo-Brutalist Illustration Card (Blue & Yellow) */}
          <div className="lg:col-span-5 relative max-w-[205px] sm:max-w-[320px] lg:max-w-[370px] mx-auto w-full">
            <div className="relative z-10 bg-white border-[2.5px] sm:border-[3px] border-[#111827] rounded-2xl sm:rounded-3xl p-2 sm:p-3 shadow-[4px_4px_0px_#111827] sm:shadow-[6px_6px_0px_#111827]">
              {/* Blue & Yellow Brutalist Top Strip */}
              <div className="h-2.5 sm:h-3 bg-[#1D4ED8] border-2 border-[#111827] rounded-full mb-1.5 sm:mb-2.5 flex items-center justify-between px-2">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD60A]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                </div>
                <span className="text-[7px] sm:text-[8px] font-black tracking-widest text-[#FFD60A] uppercase">
                  DOMPET DHUAFA
                </span>
              </div>

              {/* Custom Neo-Brutalist Education Artwork */}
              <img
                src="/bukty-hero.jpg"
                alt="Ilustrasi Program Bantuan UKT Yatim BUKTY"
                className="w-full aspect-square object-cover rounded-xl sm:rounded-2xl border-2 border-[#111827]"
              />

              {/* Floating Info Badge */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-5 bg-[#FFFDF5]/95 backdrop-blur-sm border-2 border-[#111827] p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-[2px_2px_0px_#111827] sm:shadow-[3px_3px_0px_#111827] flex items-center gap-2 sm:gap-2.5">
                <div className="w-7 h-7 sm:w-9 sm:h-9 bg-[#FFD60A] border-2 border-[#111827] rounded-lg sm:rounded-xl flex items-center justify-center text-[#111827] shrink-0">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-[10px] sm:text-xs text-[#111827] leading-tight truncate">BUKTY • Periode 2027</h4>
                  <p className="text-[9px] sm:text-[10px] font-bold text-[#1D4ED8] truncate">Prioritas Yatim • PTN</p>
                </div>
              </div>
            </div>

            {/* Offset Sunburst Yellow Back Card */}
            <div className="absolute -inset-1.5 bg-[#FFD60A] rounded-3xl border-[2.5px] border-[#111827] -z-10 translate-x-3 translate-y-3 hidden sm:block"></div>
          </div>

          {/* Right Column: Hero Headline, Highlights, Countdown & CTA */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-5 text-left">
            {/* Program Eyebrow Tag */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#EFF6FF] border-2 border-[#111827] px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full shadow-[2px_2px_0px_#111827] sm:shadow-[2.5px_2.5px_0px_#111827]">
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-[#FFD60A] border border-[#111827]"></span>
              <span className="text-[9px] sm:text-[11px] font-black tracking-wider text-[#1E3A8A] uppercase">
                DOMPET DHUAFA × GREAT EDUNESIA
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1.5 sm:space-y-2.5">
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black font-display tracking-tight text-[#111827] leading-[1.06]">
                BANTUAN UKT YATIM{' '}
                <span className="inline-block bg-[#FFD60A] text-[#111827] border-[2.5px] sm:border-[3px] border-[#111827] px-2.5 sm:px-3 py-0.5 rounded-xl sm:rounded-2xl shadow-[3px_3px_0px_#1D4ED8] sm:shadow-[4px_4px_0px_#1D4ED8] mt-1">
                  BUKTY
                </span>
              </h1>
              <p className="text-xs sm:text-base font-semibold text-gray-700 leading-relaxed max-w-2xl">
                Dukungan biaya UKT selama <strong className="text-[#1D4ED8] font-extrabold">1 tahun (Ganjil & Genap 2027)</strong>
              </p>
            </div>

            {/* 3 Key Program Benefit Pills (1 compact row on mobile) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-white border-2 border-[#111827] p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-[2.5px_2.5px_0px_#111827] sm:shadow-[3px_3px_0px_#111827] flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1.5 sm:gap-2.5">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#FFD60A] border-2 border-[#111827] flex items-center justify-center text-[#111827] shrink-0">
                  <Banknote className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] sm:text-[10px] font-bold text-gray-500 leading-tight">Maks. Bantuan</div>
                  <div className="font-black text-[11px] sm:text-xs text-[#111827] leading-tight mt-0.5">Rp 3 Jt/Smt</div>
                </div>
              </div>

              <div className="bg-white border-2 border-[#111827] p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-[2.5px_2.5px_0px_#111827] sm:shadow-[3px_3px_0px_#111827] flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1.5 sm:gap-2.5">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#DBEAFE] border-2 border-[#111827] flex items-center justify-center text-[#1D4ED8] shrink-0">
                  <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] sm:text-[10px] font-bold text-gray-500 leading-tight">Mahasiswa Aktif</div>
                  <div className="font-black text-[11px] sm:text-xs text-[#111827] leading-tight mt-0.5">D4 & S1 PTN*</div>
                </div>
              </div>

              <div className="bg-white border-2 border-[#111827] p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-[2.5px_2.5px_0px_#111827] sm:shadow-[3px_3px_0px_#111827] flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1.5 sm:gap-2.5">
                <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#FEF9C3] border-2 border-[#111827] flex items-center justify-center text-[#111827] shrink-0">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[9px] sm:text-[10px] font-bold text-gray-500 leading-tight">Cakupan</div>
                  <div className="font-black text-[11px] sm:text-xs text-[#111827] leading-tight mt-0.5">12 Provinsi</div>
                </div>
              </div>
            </div>

            {/* Live Registration Countdown Card */}
            <div className="bg-[#EFF6FF] border-[2.5px] border-[#111827] p-3 sm:p-3.5 rounded-2xl shadow-[3px_3px_0px_#111827] sm:shadow-[4px_4px_0px_#111827] flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#1D4ED8] text-[#FFD60A] border-2 border-[#111827] rounded-xl flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#111827]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-[11px] sm:text-xs text-[#111827] uppercase tracking-wide leading-tight">
                    {isClosed ? 'Pendaftaran Ditutup:' : 'Batas Pendaftaran:'}
                  </h4>
                  <p className="text-[11px] sm:text-xs font-extrabold text-[#1D4ED8]">19 – 25 Nov 2026 (23:59 WIB)</p>
                </div>
              </div>

              <div className="grid grid-cols-4 sm:flex gap-1.5 w-full sm:w-auto justify-center">
                {[
                  { label: 'Hari', value: timeLeft.days },
                  { label: 'Jam', value: timeLeft.hours },
                  { label: 'Menit', value: timeLeft.minutes },
                  { label: 'Detik', value: timeLeft.seconds },
                ].map((unit) => (
                  <div
                    key={unit.label}
                    className="bg-white border-2 border-[#111827] px-2 sm:px-2.5 py-1 rounded-xl text-center sm:min-w-[48px] shadow-[2px_2px_0px_#111827]"
                  >
                    <span className="block font-black text-sm sm:text-base text-[#111827] font-mono-code leading-none">
                      {String(unit.value).padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-extrabold text-gray-500 uppercase">{unit.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary Action Buttons (Side-by-side on mobile; registration CTA stays at bottom) */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 pt-0.5">
              <a
                href="#pengumuman"
                className="btn-primary text-[11px] sm:text-sm py-2.5 sm:py-3.5 px-3 sm:px-6 w-full sm:w-auto"
              >
                <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFD60A] shrink-0" />
                <span className="sm:hidden">Pengumuman</span>
                <span className="hidden sm:inline">Pengumuman Administrasi</span>
              </a>

              <a
                href="#pantukhir"
                className="btn-secondary text-[11px] sm:text-sm py-2.5 sm:py-3.5 px-3 sm:px-5 w-full sm:w-auto"
              >
                <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1D4ED8] shrink-0" />
                <span className="sm:hidden">Penerima Akhir</span>
                <span className="hidden sm:inline">Penerima Akhir</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
