import React, { useState } from 'react';
import { CheckSquare, Square, FileText, Info, ArrowRight } from 'lucide-react';

export default function RequirementsSection({ onOpenForm, isClosed }) {
  const [checkedDocs, setCheckedDocs] = useState({});

  // All 11 official requirements from DRAFT_PROGRAM_BUKTY.docx
  const requirements = [
    'Beragama Islam.',
    'Mahasiswa aktif Program Sarjana (S1) atau Diploma 4 (D4).',
    'Termasuk kampus di Perguruan Tinggi Negeri (PTN).',
    'Berada di 12 wilayah program: Jawa Timur, Jawa Barat, DI Yogyakarta, Sumatera Barat, Sumatera Utara, DKI Jakarta, Banten, Sumatera Selatan, Sulawesi Selatan, Riau, Lampung, dan Jawa Tengah.',
    'Diutamakan Anak Yatim (Yatim / Piatu / Yatim Piatu).',
    'IPK terakhir minimal 3,00 (skala 4,00) atau melampirkan rapor terakhir bagi mahasiswa baru.',
    'Tidak sedang menerima beasiswa lain dan/atau berada dalam status ikatan dinas dari lembaga/instansi lain.',
    'Memiliki pengalaman menjalankan aktivitas sosial yang memberikan dampak kebermanfaatan bagi masyarakat.',
    'Membuat esai sepanjang 1.000–1.500 kata (Times New Roman 12, spasi 1,5) yang menggambarkan kondisi keluarga saat ini dan alasan kelayakan menerima beasiswa.',
    'Bersedia dilibatkan sewaktu-waktu dalam program sosial dan pemberdayaan masyarakat yang diselenggarakan Dompet Dhuafa.',
    'Bersedia untuk dipublikasikan sebagai penerima Bantuan UKT Yatim (BUKTY) di media sosial Dompet Dhuafa dan jejaringnya.',
  ];

  // All 13 documents matching DRAFT_PROGRAM_BUKTY.docx Bagian E
  const documents = [
    { id: 'bio', name: 'Biodata Diri (CV / Resume)' },
    { id: 'krs', name: 'Surat Keterangan Aktif Kuliah atau Bukti KRS' },
    { id: 'rumah_depan', name: 'Foto Rumah (Tampak Depan)' },
    { id: 'rumah_tamu', name: 'Foto Rumah (Ruang Tamu)' },
    { id: 'rumah_samping', name: 'Foto Rumah (Tampak Samping)' },
    { id: 'khs', name: 'Scan KHS Terakhir atau Rapor Terakhir (Mahasiswa Baru)' },
    { id: 'ktp', name: 'Scan KTP' },
    { id: 'ktm', name: 'Scan KTM (atau Kartu Pelajar untuk Maba)' },
    { id: 'sktm', name: 'Surat Keterangan Tidak Mampu (SKTM) dari Kelurahan/Desa' },
    { id: 'kk', name: 'Scan Kartu Keluarga (KK)' },
    { id: 'prestasi', name: 'Dokumen Pendukung Prestasi (Opsional / Jika Ada)' },
    { id: 'esai', name: 'Esai (1.000–1.500 kata, TNR 12, spasi 1,5)' },
    { id: 'ukt', name: 'Bukti Tagihan / Slip UKT dari Kampus' },
  ];

  const toggleDoc = (id) => {
    setCheckedDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(checkedDocs).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / documents.length) * 100);

  return (
    <section id="persyaratan" className="py-16 md:py-24 bg-[#FFFDF5] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#1D4ED8] text-white border-2 border-[#111827] px-4 py-1 rounded-full text-xs font-black shadow-[2.5px_2.5px_0px_#111827]">
            <FileText className="w-3.5 h-3.5 text-[#FFD60A]" />
            <span>SYARAT & KELENGKAPAN DOKUMEN</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-heading text-[#111827]">
            Persyaratan & Checklist 13 Berkas
          </h2>
          <p className="text-sm sm:text-base text-gray-700 font-semibold leading-relaxed">
            Pastikan Anda memenuhi seluruh kriteria dan menyiapkan 13 dokumen di bawah ini sebelum mengisi formulir pendaftaran.
          </p>
        </div>

        {/* Split Requirements & Interactive Readiness Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: 11 Persyaratan */}
          <div className="lg:col-span-5 bg-white border-[3px] border-[#111827] p-6 sm:p-7 rounded-3xl shadow-[6px_6px_0px_#111827] space-y-5">
            <div className="border-b-2 border-[#111827] pb-3 flex items-center justify-between">
              <h3 className="font-black text-lg sm:text-xl text-[#111827]">A. Persyaratan Pendaftaran</h3>
              <span className="bg-[#FFD60A] text-[#111827] border-2 border-[#111827] text-[10px] font-black px-2.5 py-0.5 rounded-full">
                11 Kriteria
              </span>
            </div>

            <div className="space-y-2.5 max-h-[540px] overflow-y-auto pr-1">
              {requirements.map((req, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-[#FFFDF5] border-2 border-[#111827] p-3 rounded-2xl"
                >
                  <div className="w-6 h-6 bg-[#1D4ED8] text-[#FFD60A] border border-[#111827] rounded-lg flex items-center justify-center font-mono-code font-black text-[11px] shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs font-bold text-[#111827] leading-relaxed">{req}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#FEF9C3] border-2 border-[#111827] p-4 rounded-2xl flex items-start gap-3 text-xs font-bold text-[#111827]">
              <Info className="w-4 h-4 text-[#1D4ED8] shrink-0 mt-0.5" />
              <span>
                <strong>Ketentuan Esai:</strong> Panjang 1.000–1.500 kata, font Times New Roman 12, spasi 1,5. Menggambarkan kondisi keluarga saat ini & alasan kelayakan menerima BUKTY.
              </span>
            </div>
          </div>

          {/* Right: 13 Documents Interactive Readiness Tracker */}
          <div className="lg:col-span-7 bg-white border-[3px] border-[#111827] p-6 sm:p-7 rounded-3xl shadow-[6px_6px_0px_#111827] space-y-6">
            <div className="border-b-2 border-[#111827] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-lg sm:text-xl text-[#111827]">B. Checklist 13 Dokumen</h3>
                <p className="text-xs font-semibold text-gray-600">Klik item untuk menandai dokumen yang sudah siap</p>
              </div>

              {/* Readiness Progress Box */}
              <div className="bg-[#EFF6FF] border-2 border-[#111827] px-3.5 py-2 rounded-2xl flex items-center gap-3 shrink-0 shadow-[2px_2px_0px_#111827]">
                <div className="text-right">
                  <div className="text-[10px] font-bold text-gray-500">Kesiapan Berkas</div>
                  <div className="font-black text-xs text-[#1D4ED8]">
                    {completedCount} / {documents.length} ({progressPercent}%)
                  </div>
                </div>
                <div className="w-16 bg-white h-3.5 border-2 border-[#111827] rounded-full overflow-hidden">
                  <div
                    className="bg-[#1D4ED8] h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* 13 Document Checklist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documents.map((doc, index) => {
                const isChecked = !!checkedDocs[doc.id];
                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    className={`border-2 border-[#111827] p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 select-none ${
                      isChecked
                        ? 'bg-[#DCFCE7] border-[#15803D] shadow-[2px_2px_0px_#15803D]'
                        : 'bg-[#FFFDF5] hover:bg-[#EFF6FF]'
                    }`}
                  >
                    <div className="shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-[#15803D]" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <span
                      className={`text-xs font-extrabold leading-snug ${
                        isChecked ? 'text-[#15803D] line-through decoration-2' : 'text-[#111827]'
                      }`}
                    >
                      {index + 1}. {doc.name}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t-2 border-dashed border-gray-200">
              <p className="text-[11px] font-bold text-gray-600">
                Format berkas yang diterima: <strong className="text-[#111827]">PDF / JPG / PNG</strong> (maks. 5 MB/file).
              </p>
              {isClosed ? (
                <button
                  disabled
                  className="bg-gray-200 text-gray-500 border-2 border-gray-400 rounded-xl py-3 px-7 w-full sm:w-auto font-black text-xs cursor-not-allowed"
                >
                  Pendaftaran Ditutup
                </button>
              ) : (
                <button onClick={onOpenForm} className="btn-yellow text-xs py-3 px-7 w-full sm:w-auto">
                  <span>Mulai Isi Formulir BUKTY</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
