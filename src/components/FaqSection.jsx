import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'Berapa besaran dan durasi bantuan UKT yang diterima?',
      a: 'Penerima BUKTY berhak memperoleh Bantuan UKT selama 1 tahun untuk 2 (dua) semester (Ganjil dan Genap periode 2027), dengan nominal maksimal Rp3.000.000,00 per semester.',
    },
    {
      q: 'Siapa saja yang berhak mendaftar Program BUKTY?',
      a: 'Mahasiswa aktif S1 atau D4 beragama Islam di Perguruan Tinggi Negeri (PTN) yang berada pada 12 provinsi wilayah program, memiliki IPK minimal 3,00 (atau rapor terakhir bagi mahasiswa baru), tidak sedang menerima beasiswa lain/ikatan dinas, dan diutamakan Anak Yatim.',
    },
    {
      q: 'Provinsi mana saja yang masuk wilayah program BUKTY?',
      a: '12 provinsi cakupan program meliputi Jawa Timur, Jawa Barat, DI Yogyakarta, Sumatera Barat, Sumatera Utara, DKI Jakarta, Banten, Sumatera Selatan, Sulawesi Selatan, Riau, Lampung, dan Jawa Tengah.',
    },
    {
      q: 'Bagaimana ketentuan penulisan Esai pendaftaran?',
      a: 'Esai ditulis sepanjang 1.000–1.500 kata menggunakan font Times New Roman ukuran 12, spasi 1,5. Isi esai menggambarkan kondisi keluarga saat ini serta alasan kelayakan Anda menerima Bantuan UKT Yatim (BUKTY).',
    },
    {
      q: 'Bagaimana jika nominal UKT saya melebihi Rp3.000.000 per semester?',
      a: 'Bantuan UKT diberikan maksimal Rp3.000.000,00 per semester. Apabila tagihan UKT kampus melebihi plafon tersebut, selisihnya dapat ditanggung secara mandiri oleh mahasiswa.',
    },
    {
      q: 'Apakah mahasiswa baru (semester 1) bisa mendaftar tanpa KHS dan IPK?',
      a: 'Bisa. Pilih status "Mahasiswa Baru" pada formulir pendaftaran; kolom IPK akan menyesuaikan menjadi rata-rata nilai rapor terakhir, NIM bersifat opsional, dan dokumen KHS/KTM dapat diganti dengan rapor terakhir serta kartu pelajar.',
    },
    {
      q: 'Apakah ada biaya pendaftaran dan kapan pengumuman penerima dirilis?',
      a: 'Pendaftaran 100% GRATIS tanpa biaya apa pun. Pengumuman Lolos Administrasi dirilis pada 27 November 2026 dan Pengumuman Penerima Bantuan UKT dirilis pada 30 November 2026 melalui portal ini dan kanal resmi Dompet Dhuafa & GREAT Edunesia.',
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
