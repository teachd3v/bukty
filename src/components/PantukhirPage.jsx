import React, { useState, useEffect } from 'react';
import { FileText, Download, Clock, ArrowLeft, Trophy, Eye, Search, CheckCircle, Users, X } from 'lucide-react';

export default function PantukhirPage() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [recipients, setRecipients] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isReleased, setIsReleased] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewFile, setPreviewFile] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const configRes = await fetch('/api/announcement');
        const configJson = await configRes.json();
        if (configJson.success && configJson.data) {
          setConfig(configJson.data);
          calculateReleaseStatus(configJson.data.pantukhir_publish_time);
        }

        const recRes = await fetch('/api/pantukhir');
        const recJson = await recRes.json();
        if (recJson.success && Array.isArray(recJson.data)) {
          setRecipients(recJson.data);
        }
      } catch (err) {
        console.error('Failed to load Pantukhir data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const calculateReleaseStatus = (publishTimeStr) => {
    if (window.location.hash === '#bypasspantukhir') {
      setIsReleased(true);
      setTimeLeft(null);
      return;
    }
    if (!publishTimeStr) {
      setIsReleased(false);
      return;
    }
    const target = new Date(publishTimeStr).getTime();
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) {
      setIsReleased(true);
      setTimeLeft(null);
    } else {
      setIsReleased(false);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }
  };

  useEffect(() => {
    if (!config || !config.pantukhir_publish_time) return;
    const interval = setInterval(() => {
      calculateReleaseStatus(config.pantukhir_publish_time);
    }, 1000);
    return () => clearInterval(interval);
  }, [config]);

  const getFilteredRecipients = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return recipients;
    return recipients.filter(
      (r) =>
        (r.nama || '').toLowerCase().includes(query) ||
        (r.perguruan_tinggi || '').toLowerCase().includes(query) ||
        (r.provinsi || '').toLowerCase().includes(query) ||
        (r.reg_id || '').toLowerCase().includes(query)
    );
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FFFDF5] text-[#111827]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#111827] border-t-[#FFD60A] rounded-full animate-spin"></div>
          <span className="font-extrabold text-xs">Memuat pengumuman penerima BUKTY...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] bg-[#FFFDF5] py-14 flex flex-col items-center text-[#111827] px-4">
      <div className="max-w-4xl w-full space-y-8">
        <div>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black bg-white border-2 border-[#111827] rounded-xl hover:bg-[#EFF6FF] shadow-[2.5px_2.5px_0px_#111827] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </a>
        </div>

        {/* Header Title Card */}
        <div className="bg-white border-[3px] border-[#111827] p-6 sm:p-8 rounded-3xl shadow-[6px_6px_0px_#111827] text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#FFD60A] border-2 border-[#111827] px-4 py-1.5 rounded-full text-xs font-black shadow-[2px_2px_0px_#111827] uppercase">
            <Trophy className="w-4 h-4 text-[#111827]" />
            <span>PENGUMUMAN PENERIMA AKHIR (PANTUKHIR)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-wide leading-snug">
            PENERIMA PROGRAM BANTUAN UKT YATIM
            <br />
            <span className="text-[#1D4ED8]">(BUKTY) PERIODE 2027</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-bold max-w-2xl mx-auto leading-relaxed">
            Daftar resmi mahasiswa yang lolos Tahap Konfirmasi dan ditetapkan sebagai penerima Bantuan UKT Yatim selama 2 semester periode 2027 (Jadwal: 30 November 2026).
          </p>
        </div>

        {window.location.hash === '#bypasspantukhir' && (
          <div className="bg-[#FEF9C3] border-2 border-[#111827] p-4 rounded-2xl text-center text-xs font-black text-[#111827] shadow-[3px_3px_0px_#111827]">
            Mode Pintas (Bypass Preview Admin) aktif. Publik saat ini tetap melihat hitung mundur hingga waktu rilis tercapai.
          </div>
        )}

        {!isReleased ? (
          <div className="bg-[#EFF6FF] border-[3px] border-[#111827] p-8 rounded-3xl shadow-[6px_6px_0px_#111827] text-center space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-[#1D4ED8] text-[#FFD60A] border-2 border-[#111827] flex items-center justify-center mx-auto shadow-[3px_3px_0px_#111827]">
              <Clock className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="font-extrabold text-sm text-gray-600 uppercase tracking-wide">
                Pengumuman Penerima BUKTY akan dibuka dalam:
              </h3>
              {config && config.pantukhir_publish_time ? (
                <p className="text-xs text-[#1D4ED8] font-black font-mono-code">
                  Jadwal Rilis:{' '}
                  {new Date(config.pantukhir_publish_time).toLocaleString('id-ID', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}{' '}
                  WIB
                </p>
              ) : (
                <p className="text-xs text-gray-500 font-bold italic">
                  Jadwal rilis Pantukhir sedang disiapkan oleh panitia (30 November 2026).
                </p>
              )}
            </div>

            {timeLeft && (
              <div className="flex gap-2.5 justify-center">
                {[
                  { label: 'Hari', value: timeLeft.days },
                  { label: 'Jam', value: timeLeft.hours },
                  { label: 'Menit', value: timeLeft.minutes },
                  { label: 'Detik', value: timeLeft.seconds },
                ].map((unit) => (
                  <div
                    key={unit.label}
                    className="bg-white border-[2.5px] border-[#111827] p-3 rounded-2xl text-center min-w-[64px] sm:min-w-[74px] shadow-[3px_3px_0px_#111827]"
                  >
                    <span className="block font-black text-xl sm:text-2xl text-[#111827] font-mono-code leading-none">
                      {String(unit.value).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] font-black text-gray-500 uppercase mt-1 block">{unit.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-[#DCFCE7] border-2 border-[#15803D] p-4 rounded-2xl shadow-[4px_4px_0px_#15803D] text-center font-extrabold text-xs text-[#15803D]">
              Selamat kepada {recipients.length} Mahasiswa Penerima Program Bantuan UKT Yatim (BUKTY) Terpilih!
            </div>

            {/* SK Download Card */}
            {config && config.pantukhir_file_url && config.pantukhir_file_url !== '#' && (
              <div className="bg-white border-[2.5px] border-[#111827] p-5 rounded-3xl shadow-[5px_5px_0px_#111827] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#DBEAFE] text-[#1D4ED8] border-2 border-[#111827] flex items-center justify-center shadow-[2px_2px_0px_#111827] shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[11px] text-gray-500 uppercase tracking-wide">
                      Surat Keputusan Resmi
                    </h4>
                    <h3 className="font-black text-sm text-[#111827] leading-snug mt-0.5">
                      SK Penetapan Penerima Program BUKTY 2027
                    </h3>
                    <p className="text-[10px] text-gray-500 font-bold font-mono-code mt-0.5">
                      {config.pantukhir_file_name}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() =>
                      setPreviewFile({
                        title: 'SK Penetapan Penerima Program BUKTY',
                        url: config.pantukhir_file_url,
                      })
                    }
                    className="btn-secondary py-2 px-3.5 text-xs w-full sm:w-auto"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Pratinjau SK</span>
                  </button>

                  <a
                    href={config.pantukhir_file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-yellow py-2 px-3.5 text-xs w-full sm:w-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh SK</span>
                  </a>
                </div>
              </div>
            )}

            {/* Winner List Table */}
            <div className="bg-white border-[3px] border-[#111827] rounded-3xl shadow-[6px_6px_0px_#111827] overflow-hidden">
              <div className="bg-[#EFF6FF] p-4 border-b-2 border-[#111827] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="font-extrabold text-sm text-[#111827] flex items-center gap-2 shrink-0">
                  <CheckCircle className="w-4 h-4 text-[#15803D]" />
                  <span>Daftar Penerima BUKTY ({getFilteredRecipients().length} Mahasiswa)</span>
                </h3>

                <div className="relative w-full sm:w-64 shrink-0">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari Nama / Kampus / Provinsi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="form-input pl-8 pr-3 py-1.5 text-xs font-bold w-full"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FFFDF5] border-b-2 border-[#111827] text-gray-600 font-black uppercase text-[10px]">
                      <th className="py-3 px-4 w-14 text-center border-r-2 border-[#111827]">No.</th>
                      <th className="py-3 px-4 w-44 border-r-2 border-[#111827]">No. Registrasi</th>
                      <th className="py-3 px-4 border-r-2 border-[#111827]">Nama Lengkap</th>
                      <th className="py-3 px-4 border-r-2 border-[#111827]">Perguruan Tinggi Negeri</th>
                      <th className="py-3 px-4 border-r-2 border-[#111827]">Provinsi</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#111827]/10 bg-white">
                    {getFilteredRecipients().length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-500 font-bold">
                          Tidak ditemukan data penerima yang sesuai.
                        </td>
                      </tr>
                    ) : (
                      getFilteredRecipients().map((item, index) => (
                        <tr key={item.reg_id} className="hover:bg-[#EFF6FF]/60 font-bold text-gray-700 transition-colors">
                          <td className="py-3.5 px-4 text-center border-r-2 border-[#111827]/10 font-mono-code text-gray-400">
                            {index + 1}
                          </td>
                          <td className="py-3.5 px-4 border-r-2 border-[#111827]/10 font-mono-code text-[#1D4ED8] font-black">
                            {item.reg_id}
                          </td>
                          <td className="py-3.5 px-4 border-r-2 border-[#111827]/10 uppercase text-[#111827] font-black">
                            {item.nama}
                          </td>
                          <td className="py-3.5 px-4 border-r-2 border-[#111827]/10">{item.perguruan_tinggi}</td>
                          <td className="py-3.5 px-4 border-r-2 border-[#111827]/10">{item.provinsi || '-'}</td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#DBEAFE] text-[#1E3A8A] border border-[#1D4ED8]">
                              Penerima BUKTY
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dynamic WhatsApp Coordination Banner */}
            {config?.wa_group_pantukhir_url && (
              <div className="bg-white border-[3px] border-[#111827] p-6 rounded-3xl shadow-[5px_5px_0px_#15803D] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803D] border-2 border-[#111827] flex items-center justify-center shadow-[2px_2px_0px_#111827] shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#15803D] text-xs uppercase tracking-wide">
                      KESEPAKATAN BANTUAN (1 DESEMBER 2026)
                    </h4>
                    <h3 className="font-black text-sm text-[#111827] mt-0.5">
                      Gabung Grup WhatsApp Penerima Program BUKTY
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-gray-600 font-bold leading-relaxed">
                  Bagi seluruh mahasiswa yang dinyatakan <strong>Diterima sebagai Penerima BUKTY</strong>, segera bergabung ke grup WhatsApp resmi panitia untuk penandatanganan Kesepakatan Bantuan (1 Desember 2026) dan proses Pembayaran UKT (2 Desember 2026).
                </p>
                <div>
                  <a
                    href={config.wa_group_pantukhir_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white border-2 border-[#111827] py-3 px-6 rounded-xl text-xs font-black shadow-[3px_3px_0px_#111827] transition-all w-full sm:w-auto"
                  >
                    <span>Gabung Grup WhatsApp Penerima BUKTY</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-[3px] border-[#111827] w-full max-w-5xl h-[85vh] rounded-3xl overflow-hidden shadow-[8px_8px_0px_#111827] flex flex-col text-[#111827]">
            <div className="bg-[#EFF6FF] p-4 border-b-2 border-[#111827] flex items-center justify-between shrink-0">
              <h3 className="font-extrabold text-xs sm:text-sm text-[#111827] truncate pr-4">
                Pratinjau: {previewFile.title}
              </h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1.5 bg-white border-2 border-[#111827] rounded-lg hover:bg-[#FFD60A] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-grow bg-gray-100 p-2 sm:p-4">
              <iframe
                src={previewFile.url}
                className="w-full h-full border-none rounded-2xl bg-white"
                title="Pratinjau Dokumen"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
