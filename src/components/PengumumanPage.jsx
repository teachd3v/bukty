import React, { useState, useEffect } from 'react';
import { FileText, Download, Clock, ArrowLeft, Trophy, Eye, Users, X } from 'lucide-react';
import { buildSiteSchedule } from '../utils/buktyConfig';

export default function PengumumanPage() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isReleased, setIsReleased] = useState(() => window.location.hash === '#bypasspengumuman');
  const [previewFile, setPreviewFile] = useState(null);

  const schedule = buildSiteSchedule(config);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/announcement');
        const json = await res.json();
        if (json.success && json.data) {
          setConfig(json.data);
          calculateReleaseStatus(json.data.publish_time);
        }
      } catch (err) {
        console.error('Failed to load announcement config:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const calculateReleaseStatus = (publishTimeStr) => {
    if (window.location.hash === '#bypasspengumuman') {
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
    if (!config || !config.publish_time) return;
    const interval = setInterval(() => {
      calculateReleaseStatus(config.publish_time);
    }, 1000);
    return () => clearInterval(interval);
  }, [config]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FFFDF5] text-[#111827]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#111827] border-t-[#FFD60A] rounded-full animate-spin"></div>
          <span className="font-extrabold text-xs">Memuat informasi pengumuman BUKTY...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] bg-[#FFFDF5] py-14 flex flex-col items-center text-[#111827] px-4">
      <div className="max-w-3xl w-full space-y-8">
        <div>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black bg-white border-2 border-[#111827] rounded-xl hover:bg-[#EFF6FF] shadow-[2.5px_2.5px_0px_#111827] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda</span>
          </a>
        </div>

        {/* Header Title Card */}
        <div className="bg-white border-[3px] border-[#111827] p-6 sm:p-8 rounded-3xl shadow-[6px_6px_0px_#111827] text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#FFD60A] border-2 border-[#111827] px-4 py-1.5 rounded-full text-xs font-black shadow-[2px_2px_0px_#111827] uppercase">
            <Trophy className="w-4 h-4" />
            <span>PENGUMUMAN TAHAP ADMINISTRASI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-wide leading-snug">
            HASIL SELEKSI ADMINISTRASI
            <br />
            <span className="text-[#1D4ED8]">PROGRAM BANTUAN UKT YATIM (BUKTY)</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-bold max-w-xl mx-auto leading-relaxed">
            Pengumuman resmi hasil peninjauan berkas pendaftaran BUKTY periode 2027 oleh panitia seleksi Dompet Dhuafa & GREAT Edunesia (Jadwal: {schedule.adminAnnouncementDate}).
          </p>
        </div>

        {window.location.hash === '#bypasspengumuman' && (
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
                Pengumuman Lolos Administrasi akan dibuka dalam:
              </h3>
              {config && config.publish_time ? (
                <p className="text-xs text-[#1D4ED8] font-black font-mono-code">
                  Jadwal Rilis:{' '}
                  {new Date(config.publish_time).toLocaleString('id-ID', {
                    dateStyle: 'long',
                    timeStyle: 'short',
                  })}{' '}
                  WIB
                </p>
              ) : (
                <p className="text-xs text-gray-500 font-bold italic">
                  Jadwal rilis pengumuman sedang disiapkan oleh panitia ({schedule.adminAnnouncementDate}).
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
          <div className="space-y-4">
            <div className="bg-[#DCFCE7] border-2 border-[#15803D] p-4 rounded-2xl shadow-[4px_4px_0px_#15803D] text-center font-extrabold text-xs text-[#15803D]">
              Dokumen Hasil Seleksi Administrasi Program BUKTY Telah Resmi Dirilis & Dapat Diunduh
            </div>

            <div className="space-y-3.5">
              {[
                {
                  title: 'Surat Keputusan Hasil Tahap Administrasi Program BUKTY',
                  name: config?.file1_name,
                  url: config?.file1_url,
                },
                {
                  title: 'Panduan Tahap Konfirmasi Peserta Lolos Administrasi BUKTY',
                  name: config?.file2_name,
                  url: config?.file2_url,
                },
                {
                  title: `Jadwal Tahap Konfirmasi & Verifikasi Peserta BUKTY (${schedule.confirmationRangeLabel})`,
                  name: config?.file3_name,
                  url: config?.file3_url,
                },
              ].map((file, i) => (
                <div
                  key={i}
                  className="bg-white border-[2.5px] border-[#111827] p-5 rounded-3xl shadow-[5px_5px_0px_#111827] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#DBEAFE] text-[#1D4ED8] border-2 border-[#111827] flex items-center justify-center shadow-[2px_2px_0px_#111827] shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-[11px] text-gray-500 uppercase tracking-wide">
                        Berkas Dokumen 0{i + 1}
                      </h4>
                      <h3 className="font-black text-sm text-[#111827] leading-snug mt-0.5 pr-2">{file.title}</h3>
                      {file.name ? (
                        <p className="text-[10px] text-gray-500 font-bold font-mono-code mt-0.5 truncate max-w-[250px] sm:max-w-md">
                          {file.name}
                        </p>
                      ) : (
                        <p className="text-[10px] text-red-600 font-bold italic mt-0.5">
                          Berkas belum diunggah oleh admin
                        </p>
                      )}
                    </div>
                  </div>

                  {file.url && file.url !== '#' ? (
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
                      <button
                        onClick={() => setPreviewFile({ title: file.title, url: file.url })}
                        className="btn-secondary py-2 px-3.5 text-xs w-full sm:w-auto"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Pratinjau</span>
                      </button>

                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-yellow py-2 px-3.5 text-xs w-full sm:w-auto"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh</span>
                      </a>
                    </div>
                  ) : (
                    <button
                      disabled
                      className="opacity-50 border-2 border-[#111827] bg-gray-100 text-gray-400 py-2 px-4 text-xs font-black rounded-xl cursor-not-allowed w-full sm:w-auto"
                    >
                      Belum Tersedia
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Dynamic WhatsApp Coordination Banner */}
            {config?.wa_group_admin_url && (
              <div className="bg-white border-[3px] border-[#111827] p-6 rounded-3xl shadow-[5px_5px_0px_#15803D] space-y-4 mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803D] border-2 border-[#111827] flex items-center justify-center shadow-[2px_2px_0px_#111827] shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[#15803D] text-xs uppercase tracking-wide">
                      KOORDINASI TAHAP KONFIRMASI
                    </h4>
                    <h3 className="font-black text-sm text-[#111827] mt-0.5">
                      Gabung Grup WhatsApp Peserta Lolos Administrasi
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-gray-600 font-bold leading-relaxed">
                  Bagi seluruh peserta yang dinyatakan <strong>Lolos Tahap Administrasi</strong>, harap segera bergabung ke grup WhatsApp resmi melalui tombol berikut untuk arahan teknis Tahap Konfirmasi ({schedule.confirmationRangeLabel}).
                </p>
                <div>
                  <a
                    href={config.wa_group_admin_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-[#16A34A] hover:bg-[#15803D] text-white border-2 border-[#111827] py-3 px-6 rounded-xl text-xs font-black shadow-[3px_3px_0px_#111827] transition-all w-full sm:w-auto"
                  >
                    <span>Gabung Grup WhatsApp Tahap Konfirmasi</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
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
