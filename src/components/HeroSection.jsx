import React, { useState, useEffect } from 'react';
import { ArrowRight, Banknote, GraduationCap, MapPin, Clock, Trophy, Megaphone } from 'lucide-react';
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
    <section id="hero" className="pt-8 md:pt-16 pb-14 md:pb-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: BUKTY Neo-Brutalist Illustration Card (Blue & Yellow) */}
          <div className="lg:col-span-5 relative max-w-[300px] sm:max-w-[340px] lg:max-w-[370px] mx-auto w-full">
            <div className="relative z-10 bg-white border-[3px] border-[#111827] rounded-3xl p-3 shadow-[6px_6px_0px_#111827]">
              {/* Blue & Yellow Brutalist Top Strip */}
              <div className="h-3 bg-[#1D4ED8] border-2 border-[#111827] rounded-full mb-2.5 flex items-center justify-between px-2">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD60A]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                </div>
                <span className="text-[8px] font-black tracking-widest text-[#FFD60A] uppercase">
                  DOMPET DHUAFA
                </span>
              </div>

              {/* Custom Neo-Brutalist Education Artwork */}
              <img
                src="/bukty-hero.jpg"
                alt="Ilustrasi Program Bantuan UKT Yatim BUKTY"
                className="w-full aspect-square object-cover rounded-2xl border-2 border-[#111827]"
              />

              {/* Floating Info Badge */}
              <div className="absolute bottom-5 left-5 right-5 bg-[#FFFDF5]/95 backdrop-blur-sm border-2 border-[#111827] p-2.5 rounded-2xl shadow-[3px_3px_0px_#111827] flex items-center gap-2.5">
                <div className="w-9 h-9 bg-[#FFD60A] border-2 border-[#111827] rounded-xl flex items-center justify-center text-[#111827] shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-xs text-[#111827] leading-tight">BUKTY • Periode 2027</h4>
                  <p className="text-[10px] font-bold text-[#1D4ED8]">Diutamakan Anak Yatim • PTN S1 & D4</p>
                </div>
              </div>
            </div>

            {/* Offset Sunburst Yellow Back Card */}
            <div className="absolute -inset-1.5 bg-[#FFD60A] rounded-3xl border-[2.5px] border-[#111827] -z-10 translate-x-3 translate-y-3 hidden sm:block"></div>
          </div>

          {/* Right Column: Hero Headline, Highlights, Countdown & CTA */}
          <div className="lg:col-span-7 space-y-5 text-left">
            {/* Program Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 bg-[#EFF6FF] border-2 border-[#111827] px-3.5 py-1.5 rounded-full shadow-[2.5px_2.5px_0px_#111827]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#FFD60A] border border-[#111827]"></span>
              <span className="text-[10px] sm:text-[11px] font-black tracking-wider text-[#1E3A8A] uppercase">
                PROGRAM PENDIDIKAN DOMPET DHUAFA × GREAT EDUNESIA
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2.5">
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black font-display tracking-tight text-[#111827] leading-[1.06]">
                BANTUAN UKT YATIM{' '}
                <span className="inline-block bg-[#FFD60A] text-[#111827] border-[3px] border-[#111827] px-3 py-0.5 rounded-2xl shadow-[4px_4px_0px_#1D4ED8] mt-1">
                  BUKTY
                </span>
              </h1>
              <p className="text-sm sm:text-base font-semibold text-gray-700 leading-relaxed max-w-2xl">
                Dukungan biaya pendidikan UKT selama <strong className="text-[#1D4ED8] font-extrabold">1 tahun penuh (2 semester Ganjil & Genap 2027)</strong> bagi mahasiswa aktif S1 & D4 di Perguruan Tinggi Negeri pada 12 provinsi wilayah program.
              </p>
            </div>

            {/* 3 Key Program Benefit Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white border-2 border-[#111827] p-3 rounded-2xl shadow-[3px_3px_0px_#111827] flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FFD60A] border-2 border-[#111827] flex items-center justify-center text-[#111827] shrink-0">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500">Maks. Bantuan</div>
                  <div className="font-black text-xs text-[#111827]">Rp 3 Juta / Smt</div>
                </div>
              </div>

              <div className="bg-white border-2 border-[#111827] p-3 rounded-2xl shadow-[3px_3px_0px_#111827] flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#DBEAFE] border-2 border-[#111827] flex items-center justify-center text-[#1D4ED8] shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500">Durasi & Target</div>
                  <div className="font-black text-xs text-[#111827]">2 Semester • PTN</div>
                </div>
              </div>

              <div className="bg-white border-2 border-[#111827] p-3 rounded-2xl shadow-[3px_3px_0px_#111827] flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FEF9C3] border-2 border-[#111827] flex items-center justify-center text-[#111827] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-500">Cakupan Wilayah</div>
                  <div className="font-black text-xs text-[#111827]">12 Provinsi</div>
                </div>
              </div>
            </div>

            {/* Live Registration Countdown Card */}
            <div className="bg-[#EFF6FF] border-[2.5px] border-[#111827] p-3.5 rounded-2xl shadow-[4px_4px_0px_#111827] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-9 h-9 bg-[#1D4ED8] text-[#FFD60A] border-2 border-[#111827] rounded-xl flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#111827]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-black text-xs text-[#111827] uppercase tracking-wide">
                    {isClosed ? 'Pendaftaran Ditutup:' : 'Batas Akhir Pendaftaran:'}
                  </h4>
                  <p className="text-xs font-extrabold text-[#1D4ED8]">19 – 25 November 2026 (23:59 WIB)</p>
                </div>
              </div>

              <div className="flex gap-1.5 w-full sm:w-auto justify-center">
                {[
                  { label: 'Hari', value: timeLeft.days },
                  { label: 'Jam', value: timeLeft.hours },
                  { label: 'Menit', value: timeLeft.minutes },
                  { label: 'Detik', value: timeLeft.seconds },
                ].map((unit) => (
                  <div
                    key={unit.label}
                    className="bg-white border-2 border-[#111827] px-2.5 py-1 rounded-xl text-center min-w-[48px] shadow-[2px_2px_0px_#111827]"
                  >
                    <span className="block font-black text-base text-[#111827] font-mono-code leading-none">
                      {String(unit.value).padStart(2, '0')}
                    </span>
                    <span className="text-[8px] font-extrabold text-gray-500 uppercase">{unit.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-1">
              {!isClosed ? (
                <button
                  onClick={onOpenForm}
                  className="btn-yellow text-xs sm:text-sm py-3.5 px-7 w-full sm:w-auto"
                >
                  <span>Daftar Program BUKTY Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <a
                  href="#pantukhir"
                  className="btn-primary text-xs sm:text-sm py-3.5 px-7 w-full sm:w-auto"
                >
                  <Trophy className="w-4 h-4 text-[#FFD60A]" />
                  <span>Lihat Penerima Lolos (Pantukhir)</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}

              <a
                href="#pengumuman"
                className="btn-primary text-xs sm:text-sm py-3.5 px-6 w-full sm:w-auto"
              >
                <Megaphone className="w-4 h-4 text-[#FFD60A]" />
                <span>Pengumuman Administrasi</span>
              </a>

              <a
                href="#pantukhir"
                className="btn-secondary text-xs sm:text-sm py-3.5 px-5 w-full sm:w-auto"
              >
                <Trophy className="w-4 h-4 text-[#1D4ED8]" />
                <span>Penerima Akhir</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
