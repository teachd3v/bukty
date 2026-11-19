import React from 'react';
import { Sparkles, MapPin, Banknote, HeartHandshake, ShieldCheck } from 'lucide-react';
import { TARGET_PROVINCES } from '../utils/buktyConfig';

export default function ProgramOverviewSection() {
  const pillars = [
    {
      num: '01',
      title: 'Bantuan 2 Semester Penuh (2027)',
      desc: 'Subsidi UKT maksimal Rp3.000.000/semester selama 1 tahun untuk semester Ganjil & Genap periode 2027.',
      bg: 'bg-[#1D4ED8] text-white',
      icon: Banknote,
    },
    {
      num: '02',
      title: 'Prioritas Anak Yatim PTN',
      desc: 'Dikhususkan bagi mahasiswa S1/D4 Perguruan Tinggi Negeri dengan prioritas utama anak yatim yang membutuhkan.',
      bg: 'bg-[#FFD60A] text-[#111827]',
      icon: HeartHandshake,
    },
    {
      num: '03',
      title: 'Seleksi Transparan & 100% Gratis',
      desc: 'Dikelola langsung oleh Dompet Dhuafa & GREAT Edunesia tanpa pungutan biaya apa pun di seluruh tahapan.',
      bg: 'bg-[#0F172A] text-[#FFD60A]',
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="tentang" className="py-16 md:py-24 bg-[#EFF6FF] border-y-[3px] border-[#111827] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-5xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#FFD60A] border-2 border-[#111827] px-4 py-1 rounded-full text-xs font-black shadow-[2.5px_2.5px_0px_#111827]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TENTANG & BENEFIT PROGRAM</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading text-[#111827]">
            Dukungan UKT Berkelanjutan untuk Mahasiswa PTN
          </h2>
          <p className="text-sm sm:text-base text-gray-700 font-semibold leading-relaxed">
            Hadir untuk menjaga keberlanjutan kuliah mahasiswa berprestasi yang terkendala biaya pendidikan.
          </p>
        </div>

        {/* 3 Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar) => {
            const IconComp = pillar.icon;
            return (
              <div
                key={pillar.num}
                className="bg-white border-[3px] border-[#111827] p-6 rounded-3xl shadow-[6px_6px_0px_#111827] space-y-4 hover:-translate-y-1 transition-transform"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl ${pillar.bg} border-2 border-[#111827] flex items-center justify-center font-black text-lg shadow-[3px_3px_0px_#111827]`}
                  >
                    {pillar.num}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#FFFDF5] border-2 border-[#111827] flex items-center justify-center text-[#1D4ED8]">
                    <IconComp className="w-5 h-5" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-black text-lg text-[#111827] leading-snug">{pillar.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 12 Target Provinces Showcase */}
        <div className="bg-white border-[3px] border-[#111827] p-6 sm:p-8 rounded-3xl shadow-[6px_6px_0px_#111827] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#111827] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1D4ED8] text-[#FFD60A] border-2 border-[#111827] flex items-center justify-center shadow-[2px_2px_0px_#111827] shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-lg sm:text-xl text-[#111827]">12 Provinsi Wilayah Program BUKTY</h3>
                <p className="text-xs font-semibold text-gray-600">
                  Berlaku untuk kampus PTN yang berlokasi di provinsi berikut:
                </p>
              </div>
            </div>
            <span className="inline-flex items-center self-start sm:self-center bg-[#FFD60A] border-2 border-[#111827] px-3.5 py-1 rounded-full text-xs font-black shadow-[2px_2px_0px_#111827]">
              KHUSUS PTN (S1 / D4)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {TARGET_PROVINCES.map((prov, index) => (
              <div
                key={prov}
                className="flex items-center gap-2.5 bg-[#FFFDF5] hover:bg-[#FEF9C3] border-2 border-[#111827] px-3.5 py-2.5 rounded-2xl shadow-[2.5px_2.5px_0px_#111827] transition-colors"
              >
                <span className="w-6 h-6 rounded-lg bg-[#1D4ED8] text-white border border-[#111827] flex items-center justify-center font-mono-code font-black text-[10px] shrink-0">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-[#111827] leading-tight">{prov}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
