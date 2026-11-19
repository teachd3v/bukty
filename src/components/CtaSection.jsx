import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Calendar } from 'lucide-react';

export default function CtaSection({ onOpenForm, isClosed, schedule }) {
  const deadlineShort = schedule?.deadlineShort || '25 Nov 2026 (23:59 WIB)';
  const deadlineDateShort = schedule?.deadlineDateShort || '25 Nov 2026';
  const deadlineTimeShort = schedule?.deadlineTimeShort || '23:59 WIB';

  return (
    <section id="daftar" className="py-10 md:py-22 bg-[#EFF6FF] border-t-[3px] border-[#111827] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="bg-[#1D4ED8] text-white border-[2.5px] sm:border-[3px] border-[#111827] p-5 sm:p-8 md:p-12 rounded-2xl sm:rounded-3xl shadow-[5px_5px_0px_#111827] sm:shadow-[8px_8px_0px_#111827] space-y-4 sm:space-y-6">
          {/* Eyebrow Tag */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#FFD60A] text-[#111827] border-2 border-[#111827] px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-xs font-black shadow-[2px_2px_0px_#111827] mx-auto">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="tracking-wider uppercase text-[10px]">
              {isClosed ? 'Pendaftaran Selesai' : 'Langkah Terakhir'}
            </span>
          </div>

          {/* Heading */}
          <h2 className="text-xl sm:text-3xl md:text-4xl font-black font-heading text-white leading-tight max-w-2xl mx-auto">
            {isClosed ? (
              <>
                Pendaftaran BUKTY <span className="text-[#FFD60A] underline decoration-white decoration-4 underline-offset-4">Telah Resmi Ditutup</span>
              </>
            ) : (
              <>
                Sudah Baca Ketentuan & <span className="text-[#FFD60A] underline decoration-white decoration-4 underline-offset-4">Siap Mendaftar</span>?
              </>
            )}
          </h2>

          {/* Description */}
          <p className="text-xs sm:text-base text-blue-100 font-semibold max-w-xl mx-auto leading-relaxed">
            {isClosed
              ? `Pendaftaran berakhir pada ${deadlineShort}. Pantau hasil seleksi di halaman Pengumuman & Penerima.`
              : `Siapkan 13 berkas sebelum mendaftar. Formulir ditutup ${deadlineDateShort} pukul ${deadlineTimeShort}.`}
          </p>

          {/* CTA Action */}
          <div className="pt-1 sm:pt-2 flex flex-col sm:flex-row justify-center items-center gap-3">
            {isClosed ? (
              <a
                href="#pengumuman"
                className="btn-yellow text-xs sm:text-sm py-3 sm:py-3.5 px-6 sm:px-8 w-full sm:w-auto"
              >
                <span>Buka Halaman Pengumuman</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <button
                onClick={onOpenForm}
                className="btn-yellow text-xs sm:text-sm py-3 sm:py-3.5 px-6 sm:px-8 group w-full sm:w-auto"
              >
                <span>Isi Formulir Pendaftaran BUKTY</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </div>

          {/* Trust Info */}
          <div className="pt-1 sm:pt-3 flex items-center justify-center gap-4 sm:gap-6 text-[11px] sm:text-xs font-bold text-blue-100 flex-wrap">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FFD60A] shrink-0" />
              <span>100% Gratis</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#FFD60A] hidden sm:block"></div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#FFD60A] shrink-0" />
              <span>Batas: {deadlineDateShort}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
