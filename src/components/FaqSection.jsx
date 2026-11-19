import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'Bagaimana jika nominal UKT saya melebihi Rp3.000.000 per semester?',
      a: 'Plafon bantuan maksimal Rp3.000.000 per semester. Jika tagihan UKT kampus lebih besar dari batas tersebut, selisihnya dapat ditanggung mandiri oleh mahasiswa.',
    },
    {
      q: 'Apakah mahasiswa baru (semester 1) tanpa IPK, KHS, atau KTM tetap bisa mendaftar?',
      a: 'Bisa. Pilih status "Mahasiswa Baru" di formulir; kolom IPK akan berganti menjadi rata-rata nilai rapor terakhir, NIM bersifat opsional, dan dokumen KHS/KTM cukup diganti rapor terakhir serta kartu pelajar.',
    },
    {
      q: 'Apakah mahasiswa non-yatim (orang tua lengkap namun dhuafa) diperbolehkan mendaftar?',
      a: 'Boleh. Program ini memprioritaskan anak yatim/piatu/yatim piatu dalam pembobotan seleksi, namun mahasiswa dhuafa dari keluarga lengkap yang memenuhi seluruh kriteria tetap dapat mengajukan pendaftaran.',
    },
    {
      q: 'Apakah mahasiswa kampus swasta (PTS) atau di luar 12 provinsi bisa mendaftar?',
      a: 'Belum bisa. Sesuai ketentuan periode ini, BUKTY hanya diperuntukkan bagi mahasiswa aktif S1/D4 Perguruan Tinggi Negeri (PTN) yang berlokasi di 12 provinsi wilayah program.',
    },
    {
      q: 'Apakah pengisian formulir bisa disimpan sementara dan di mana pengumuman seleksi dicek?',
      a: 'Formulir otomatis menyimpan draft di browser Anda selama belum dikirim. Hasil Lolos Administrasi (27 Nov 2026) dan Penerima Akhir (30 Nov 2026) dapat dicek langsung melalui tombol Pengumuman & Penerima di portal ini.',
    },
  ];

  return (
    <section id="faq" className="py-16 md:py-24 bg-[#FFFDF5] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#1D4ED8] text-white border-2 border-[#111827] px-4 py-1 rounded-full text-xs font-black shadow-[2.5px_2.5px_0px_#111827]">
            <HelpCircle className="w-3.5 h-3.5 text-[#FFD60A]" />
            <span>FAQ & TANYA JAWAB</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-[#111827]">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-sm sm:text-base text-gray-700 font-semibold leading-relaxed">
            Informasi ringkas seputar persyaratan, dokumen, dan tahapan seleksi BUKTY.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white border-[2.5px] border-[#111827] rounded-2xl shadow-[4px_4px_0px_#111827] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-extrabold text-sm sm:text-base text-[#111827] select-none hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-[#FFD60A] text-[#111827] border-2 border-[#111827] rounded-xl flex items-center justify-center font-mono-code font-black text-xs shrink-0 shadow-[2px_2px_0px_#111827]">
                      Q{idx + 1}
                    </span>
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#1D4ED8] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-3 text-xs sm:text-sm text-gray-700 font-semibold leading-relaxed border-t-2 border-dashed border-[#111827]/20 bg-[#FFFDF5]">
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
