import React, { useState } from 'react';
import { CheckSquare, Square, FileText, ArrowDown, ArrowRight } from 'lucide-react';

export default function RequirementsSection() {
  const [checkedDocs, setCheckedDocs] = useState({});
  const [mobileTab, setMobileTab] = useState('syarat');

  // All 11 official requirements from DRAFT_PROGRAM_BUKTY.docx (concise & to the point)
  const requirements = [
    'Beragama Islam.',
    'Mahasiswa aktif S1 atau D4.',
    'Kuliah di Perguruan Tinggi Negeri (PTN).',
    'Berada di salah satu dari 12 provinsi wilayah program.',
    'Diutamakan Anak Yatim (Yatim / Piatu / Yatim Piatu).',
    'IPK min. 3,00 (skala 4,00) atau melampirkan rapor terakhir bagi Maba.',
    'Tidak sedang menerima beasiswa lain atau ikatan dinas.',
    'Memiliki pengalaman aktivitas sosial yang berdampak bagi masyarakat.',
    'Esai 1.000–1.500 kata (TNR 12, spasi 1,5) soal kondisi keluarga & kelayakan.',
    'Bersedia terlibat dalam program sosial & pemberdayaan Dompet Dhuafa.',
    'Bersedia dipublikasikan sebagai penerima BUKTY di media Dompet Dhuafa.',
  ];

  // All 13 documents matching DRAFT_PROGRAM_BUKTY.docx Bagian E
  const documents = [
    { id: 'bio', name: 'Biodata Diri (CV / Resume)' },
    { id: 'krs', name: 'Surat Aktif Kuliah / Bukti KRS' },
    { id: 'rumah_depan', name: 'Foto Rumah (Tampak Depan)' },
    { id: 'rumah_tamu', name: 'Foto Rumah (Ruang Tamu)' },
    { id: 'rumah_samping', name: 'Foto Rumah (Tampak Samping)' },
    { id: 'khs', name: 'Scan KHS / Rapor Terakhir (Maba)' },
    { id: 'ktp', name: 'Scan KTP' },
    { id: 'ktm', name: 'Scan KTM / Kartu Pelajar (Maba)' },
    { id: 'sktm', name: 'SKTM dari Kelurahan/Desa' },
    { id: 'kk', name: 'Scan Kartu Keluarga (KK)' },
    { id: 'prestasi', name: 'Dokumen Prestasi (Opsional)' },
    { id: 'esai', name: 'Esai (1.000–1.500 kata, TNR 12)' },
    { id: 'ukt', name: 'Bukti Tagihan / Slip UKT Kampus' },
  ];

  const toggleDoc = (id) => {
    setCheckedDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedDocs).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / documents.length) * 100);

  return (
    <section id="persyaratan" className="py-10 md:py-24 bg-[#FFFDF5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 md:space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#1D4ED8] text-white border-2 border-[#111827] px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black shadow-[2px_2px_0px_#111827] sm:shadow-[2.5px_2.5px_0px_#111827]">
            <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FFD60A]" />
            <span>SYARAT & KELENGKAPAN DOKUMEN</span>
          </div>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black font-heading text-[#111827] leading-tight">
            Persyaratan & Checklist 13 Berkas
          </h2>
          <p className="text-xs sm:text-base text-gray-700 font-semibold leading-relaxed">
            Pastikan 11 kriteria terpenuhi dan tandai berkas yang sudah siap.
          </p>
        </div>

        {/* Mobile Tab Switcher (saves ~650px vertical scroll on phones) */}
        <div className="grid grid-cols-2 gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileTab('syarat')}
            className={`py-2.5 px-3 rounded-xl border-2 border-[#111827] font-black text-xs transition-all cursor-pointer ${
              mobileTab === 'syarat'
                ? 'bg-[#1D4ED8] text-white shadow-[3px_3px_0px_#111827]'
                : 'bg-white text-[#111827]'
            }`}
          >
            A. 11 Syarat
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('berkas')}
            className={`py-2.5 px-3 rounded-xl border-2 border-[#111827] font-black text-xs transition-all cursor-pointer ${
              mobileTab === 'berkas'
                ? 'bg-[#FFD60A] text-[#111827] shadow-[3px_3px_0px_#111827]'
                : 'bg-white text-[#111827]'
            }`}
          >
            B. 13 Berkas ({completedCount}/13)
          </button>
        </div>

        {/* Split Requirements & Interactive Readiness Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
          {/* Left: 11 Persyaratan */}
          <div
            className={`${
              mobileTab === 'syarat' ? 'block' : 'hidden'
            } lg:block lg:col-span-5 bg-white border-[2.5px] sm:border-[3px] border-[#111827] p-4 sm:p-7 rounded-2xl sm:rounded-3xl shadow-[4px_4px_0px_#111827] sm:shadow-[6px_6px_0px_#111827] space-y-3.5 sm:space-y-5`}
          >
            <div className="border-b-2 border-[#111827] pb-2.5 sm:pb-3 flex items-center justify-between">
              <h3 className="font-black text-base sm:text-xl text-[#111827]">A. Persyaratan Pendaftaran</h3>
              <span className="bg-[#FFD60A] text-[#111827] border-2 border-[#111827] text-[10px] font-black px-2.5 py-0.5 rounded-full">
                11 Kriteria
              </span>
            </div>

            <div className="space-y-1.5 sm:space-y-2.5 lg:max-h-[580px] lg:overflow-y-auto lg:pr-1">
              {requirements.map((req, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 sm:gap-3 bg-[#FFFDF5] border-2 border-[#111827] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl"
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#1D4ED8] text-[#FFD60A] border border-[#111827] rounded-md sm:rounded-lg flex items-center justify-center font-mono-code font-black text-[10px] sm:text-[11px] shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-[11px] sm:text-xs font-bold text-[#111827] leading-snug sm:leading-relaxed">{req}</p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setMobileTab('berkas')}
              className="lg:hidden w-full py-2.5 px-4 bg-[#FFD60A] text-[#111827] border-2 border-[#111827] rounded-xl font-black text-xs shadow-[2.5px_2.5px_0px_#111827] inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Lanjut Cek Checklist 13 Berkas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right: 13 Documents Interactive Readiness Tracker */}
          <div
            className={`${
              mobileTab === 'berkas' ? 'block' : 'hidden'
            } lg:block lg:col-span-7 bg-white border-[2.5px] sm:border-[3px] border-[#111827] p-4 sm:p-7 rounded-2xl sm:rounded-3xl shadow-[4px_4px_0px_#111827] sm:shadow-[6px_6px_0px_#111827] space-y-4 sm:space-y-6`}
          >
            <div className="border-b-2 border-[#111827] pb-3 sm:pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
              <div>
                <h3 className="font-black text-base sm:text-xl text-[#111827]">B. Checklist 13 Dokumen</h3>
                <p className="text-[11px] sm:text-xs font-semibold text-gray-600">Tap item untuk menandai berkas siap</p>
              </div>

              {/* Readiness Progress Box */}
              <div className="bg-[#EFF6FF] border-2 border-[#111827] px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl flex items-center justify-between sm:justify-start gap-3 shrink-0 shadow-[2px_2px_0px_#111827]">
                <div className="text-left sm:text-right">
                  <div className="text-[9px] sm:text-[10px] font-bold text-gray-500">Kesiapan Berkas</div>
                  <div className="font-black text-xs text-[#1D4ED8]">
                    {completedCount} / {documents.length} ({progressPercent}%)
                  </div>
                </div>
                <div className="w-20 sm:w-16 bg-white h-3 sm:h-3.5 border-2 border-[#111827] rounded-full overflow-hidden">
                  <div
                    className="bg-[#1D4ED8] h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* 13 Document Checklist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {documents.map((doc, index) => {
                const isChecked = !!checkedDocs[doc.id];
                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    className={`border-2 border-[#111827] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl cursor-pointer transition-all flex items-center gap-2.5 sm:gap-3 select-none ${
                      isChecked
                        ? 'bg-[#DCFCE7] border-[#15803D] shadow-[2px_2px_0px_#15803D]'
                        : 'bg-[#FFFDF5] hover:bg-[#EFF6FF]'
                    }`}
                  >
                    <div className="shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-[#15803D]" />
                      ) : (
                        <Square className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      )}
                    </div>
                    <span
                      className={`text-[11px] sm:text-xs font-extrabold leading-snug ${
                        isChecked ? 'text-[#15803D] line-through decoration-2' : 'text-[#111827]'
                      }`}
                    >
                      {index + 1}. {doc.name}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2.5 sm:pt-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 border-t-2 border-dashed border-gray-200">
              <p className="text-[11px] font-bold text-gray-600">
                Format: <strong className="text-[#111827]">PDF / JPG / PNG</strong> (maks. 5 MB/file).
              </p>
              <a
                href="#jadwal"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-black text-[#1D4ED8] hover:text-[#1E3A8A] bg-[#EFF6FF] border-2 border-[#111827] px-4 py-2 rounded-xl shadow-[2px_2px_0px_#111827] transition-all w-full sm:w-auto"
              >
                <span>Lanjut Cek Jadwal & FAQ</span>
                <ArrowDown className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
