import React from 'react';
import { Instagram, Globe, MessageCircle, Mail, MapPin, GraduationCap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-[#FFFDF5] pt-14 pb-8 border-t-4 border-[#FFD60A] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Program Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#FFD60A] text-[#111827] border-2 border-[#111827] px-3 py-1 rounded-xl font-black text-xs">
              <GraduationCap className="w-4 h-4" />
              <span>BUKTY — BANTUAN UKT YATIM</span>
            </div>
            <p className="text-sm text-slate-300 font-normal leading-relaxed max-w-md">
              Inisiatif pendidikan Dompet Dhuafa & GREAT Edunesia untuk membantu keberlanjutan kuliah mahasiswa PTN di Indonesia.
            </p>

            {/* Social Handles */}
            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href="https://instagram.com/dompetdhuafa"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full text-xs font-bold text-slate-200 hover:text-[#111827] hover:bg-[#FFD60A] hover:border-[#FFD60A] flex items-center gap-2 transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@dompetdhuafa</span>
              </a>

              <a
                href="https://instagram.com/greatedunesia"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full text-xs font-bold text-slate-200 hover:text-[#111827] hover:bg-[#FFD60A] hover:border-[#FFD60A] flex items-center gap-2 transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>@greatedunesia</span>
              </a>

              <a
                href="https://dompetdhuafa.org"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-full text-xs font-bold text-slate-200 hover:text-[#111827] hover:bg-[#FFD60A] hover:border-[#FFD60A] flex items-center gap-2 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>dompetdhuafa.org</span>
              </a>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-extrabold text-sm text-[#FFD60A] uppercase tracking-wider">Tautan Pintar</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300 font-semibold">
              <li><a href="#hero" className="hover:text-[#FFD60A] transition-colors">Beranda Utama</a></li>
              <li><a href="#tentang" className="hover:text-[#FFD60A] transition-colors">Program & 12 Wilayah</a></li>
              <li><a href="#persyaratan" className="hover:text-[#FFD60A] transition-colors">Syarat & 13 Dokumen</a></li>
              <li><a href="#jadwal" className="hover:text-[#FFD60A] transition-colors">Jadwal Seleksi</a></li>
              <li><a href="#faq" className="hover:text-[#FFD60A] transition-colors">Tanya Jawab (FAQ)</a></li>
              <li><a href="#pengumuman" className="hover:text-[#FFD60A] transition-colors">Pengumuman Administrasi</a></li>
              <li><a href="#pantukhir" className="hover:text-[#FFD60A] transition-colors">Daftar Penerima BUKTY</a></li>
            </ul>
          </div>

          {/* Contact & Support Box */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-extrabold text-sm text-[#FFD60A] uppercase tracking-wider">Layanan Informasi</h4>
            <div className="bg-slate-800/90 border border-slate-700 p-4 rounded-2xl space-y-3 text-xs text-slate-200 font-semibold">
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#FFD60A] shrink-0" />
                <span>WhatsApp: +62 812-8833-8840</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#60A5FA] shrink-0" />
                <span>Email: markom.pendidikan@dompetdhuafa.org</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#FFD60A] shrink-0" />
                <span>Sekretariat: GREAT Edunesia, Dompet Dhuafa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-medium gap-4">
          <p>© 2026 Dompet Dhuafa & GREAT Edunesia. Seluruh Hak Cipta Dilindungi.</p>
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <span>Program Bantuan UKT Yatim (BUKTY)</span>
            <span className="w-2 h-2 rounded-full bg-[#FFD60A]"></span>
            <span>Periode 2027</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
