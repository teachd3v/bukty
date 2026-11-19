import React from 'react';
import { Sparkles, MapPin, Banknote, HeartHandshake, ShieldCheck } from 'lucide-react';
import { TARGET_PROVINCES } from '../utils/buktyConfig';

export default function ProgramOverviewSection() {
  const pillars = [
    {
      num: '01',
      title: 'Bantuan 2 Semester (2027)',
      desc: 'Subsidi UKT maks. Rp3 juta/semester untuk Ganjil & Genap 2027.',
      bg: 'bg-[#1D4ED8] text-white',
      icon: Banknote,
    },
    {
      num: '02',
      title: 'Prioritas Anak Yatim PTN',
      desc: 'Untuk mahasiswa S1/D4 PTN dengan prioritas utama anak yatim.',
      bg: 'bg-[#FFD60A] text-[#111827]',
      icon: HeartHandshake,
    },
    {
      num: '03',
      title: 'Transparan & 100% Gratis',
      desc: 'Dikelola Dompet Dhuafa & GREAT Edunesia tanpa biaya apa pun.',
      bg: 'bg-[#0F172A] text-[#FFD60A]',
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="tentang" className="py-10 md:py-24 bg-[#EFF6FF] border-y-[3px] border-[#111827] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-5xl mx-auto space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#FFD60A] border-2 border-[#111827] px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black shadow-[2px_2px_0px_#111827] sm:shadow-[2.5px_2.5px_0px_#111827]">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>TENTANG & BENEFIT PROGRAM</span>
          </div>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black font-heading text-[#111827] leading-tight">
            Dukungan UKT Berkelanjutan untuk Mahasiswa PTN
          </h2>
          <p className="text-xs sm:text-base text-gray-700 font-semibold leading-relaxed">
            Menjaga keberlanjutan kuliah mahasiswa berprestasi yang terkendala biaya pendidikan.
          </p>
        </div>

        {/* 3 Pillar Cards (Horizontal compact on mobile, vertical showcase on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
          {pillars.map((pillar) => {
            const IconComp = pillar.icon;
            return (
              <div
                key={pillar.num}
                className="bg-white border-[2.5px] md:border-[3px] border-[#111827] p-3.5 md:p-6 rounded-2xl md:rounded-3xl shadow-[4px_4px_0px_#111827] md:shadow-[6px_6px_0px_#111827] flex items-start gap-3 md:block md:space-y-4 hover:-translate-y-1 transition-transform"
              >
                <div className="md:flex md:items-center md:justify-between shrink-0">
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${pillar.bg} border-2 border-[#111827] flex items-center justify-center font-black text-sm md:text-lg shadow-[2px_2px_0px_#111827] md:shadow-[3px_3px_0px_#111827]`}
                  >
                    {pillar.num}
                  </div>
                  <div className="hidden md:flex w-10 h-10 rounded-xl bg-[#FFFDF5] border-2 border-[#111827] items-center justify-center text-[#1D4ED8]">
                    <IconComp className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-0.5 md:space-y-1.5 min-w-0">
                  <h3 className="font-black text-sm md:text-lg text-[#111827] leading-snug">{pillar.title}</h3>
                  <p className="text-xs md:text-sm text-gray-600 font-medium leading-snug md:leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 13 Target Provinces Showcase */}
        <div className="bg-white border-[2.5px] md:border-[3px] border-[#111827] p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-[4px_4px_0px_#111827] sm:shadow-[6px_6px_0px_#111827] space-y-3.5 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-b-2 border-[#111827] pb-3 sm:pb-4">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#1D4ED8] text-[#FFD60A] border-2 border-[#111827] flex items-center justify-center shadow-[2px_2px_0px_#111827] shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="font-black text-base sm:text-xl text-[#111827] leading-tight">13 Provinsi Wilayah Program</h3>
                <p className="text-[11px] sm:text-xs font-semibold text-gray-600">
                  Berlaku untuk kampus PTN (S1/D4) di provinsi berikut:
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center self-start sm:self-center bg-[#FFD60A] border-2 border-[#111827] px-3.5 py-1 rounded-full text-xs font-black shadow-[2px_2px_0px_#111827]">
              KHUSUS PTN (S1 / D4)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {TARGET_PROVINCES.map((prov, index) => (
              <div
                key={prov}
                className="flex items-center gap-2 bg-[#FFFDF5] hover:bg-[#FEF9C3] border-2 border-[#111827] px-2.5 py-1.5 sm:px-3.5 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-[2px_2px_0px_#111827] transition-colors"
              >
                <span className="hidden sm:flex w-6 h-6 rounded-lg bg-[#1D4ED8] text-white border border-[#111827] items-center justify-center font-mono-code font-black text-[10px] shrink-0">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="sm:hidden w-1.5 h-1.5 rounded-full bg-[#1D4ED8] shrink-0"></span>
                <span className="text-[11px] sm:text-sm font-extrabold text-[#111827] leading-tight truncate">{prov}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
