import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'Bagaimana jika UKT saya lebih dari Rp3 juta/semester?',
      a: 'Plafon bantuan maks. Rp3 juta/semester. Selisih di atas plafon ditanggung mandiri oleh mahasiswa.',
    },
    {
      q: 'Mahasiswa baru (semester 1) tanpa IPK/KHS/KTM bisa daftar?',
      a: 'Bisa. Pilih status "Mahasiswa Baru" di formulir; IPK diganti rata-rata rapor terakhir, NIM opsional, dan KHS/KTM diganti rapor & kartu pelajar.',
    },
    {
      q: 'Apakah mahasiswa non-yatim (dhuafa) boleh mendaftar?',
      a: 'Boleh. Anak yatim/piatu/yatim piatu mendapat bobot prioritas utama, namun mahasiswa dhuafa yang memenuhi syarat tetap boleh mendaftar.',
    },
    {
      q: 'Apakah mahasiswa PTS atau di luar 12 provinsi bisa daftar?',
      a: 'Belum bisa. Periode ini khusus mahasiswa aktif S1/D4 PTN di 12 provinsi wilayah program.',
    },
    {
      q: 'Apakah formulir bisa disimpan draft & di mana cek pengumuman?',
      a: 'Draft tersimpan otomatis di browser sebelum dikirim. Hasil Administrasi (27 Nov) & Penerima (30 Nov) dicek langsung lewat menu Pengumuman/Penerima.',
    },
  ];

  return (
    <section id="faq" className="py-10 md:py-24 bg-[#FFFDF5] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#1D4ED8] text-white border-2 border-[#111827] px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black shadow-[2px_2px_0px_#111827] sm:shadow-[2.5px_2.5px_0px_#111827]">
            <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FFD60A]" />
            <span>FAQ & TANYA JAWAB</span>
          </div>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black font-heading text-[#111827] leading-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-xs sm:text-base text-gray-700 font-semibold leading-relaxed">
            Jawaban singkat untuk pertanyaan umum seputar pendaftaran.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-2.5 sm:space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white border-2 sm:border-[2.5px] border-[#111827] rounded-xl sm:rounded-2xl shadow-[3px_3px_0px_#111827] sm:shadow-[4px_4px_0px_#111827] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-3.5 sm:p-5 text-left flex items-center justify-between gap-3 sm:gap-4 font-extrabold text-xs sm:text-base text-[#111827] select-none hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5 sm:gap-3">
                    <span className="w-6 h-6 sm:w-8 sm:h-8 bg-[#FFD60A] text-[#111827] border-2 border-[#111827] rounded-lg sm:rounded-xl flex items-center justify-center font-mono-code font-black text-[10px] sm:text-xs shrink-0 shadow-[1.5px_1.5px_0px_#111827] sm:shadow-[2px_2px_0px_#111827]">
                      Q{idx + 1}
                    </span>
                    <span className="leading-snug">{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-[#1D4ED8] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-3.5 pt-2.5 sm:px-6 sm:pb-5 sm:pt-3 text-[11px] sm:text-sm text-gray-700 font-semibold leading-relaxed border-t-2 border-dashed border-[#111827]/20 bg-[#FFFDF5]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
