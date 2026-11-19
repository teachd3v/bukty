import React, { useState } from 'react';
import { Menu, X, ArrowRight, Megaphone } from 'lucide-react';

export default function Navbar({ onOpenForm, isClosed }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Beranda', href: '#hero' },
    { label: 'Program & Wilayah', href: '#tentang' },
    { label: 'Syarat & Berkas', href: '#persyaratan' },
    { label: 'Jadwal', href: '#jadwal' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FFFDF5]/95 backdrop-blur-md border-b-[2.5px] border-[#111827]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        {/* Partner Logos + Brand Tag */}
        <a href="#hero" className="flex items-center gap-2.5 no-underline group py-0.5 shrink-0">
          <img
            src="/logo-ge.png"
            alt="GREAT Edunesia Logo"
            className="h-6 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <img
            src="/Logo%20DD.png"
            alt="Dompet Dhuafa Logo"
            className="h-6 sm:h-7 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 bg-[#FFD60A] border-2 border-[#111827] rounded-lg text-[10px] font-black tracking-wider text-[#111827] shadow-[2px_2px_0px_#111827]">
            BUKTY
          </span>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-extrabold text-[#111827] hover:text-[#1D4ED8] transition-colors relative group py-1"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-[2.5px] bg-[#1D4ED8] transition-all duration-200 group-hover:w-full"></span>
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <a
            href="#pengumuman"
            className="px-3.5 py-2 bg-white hover:bg-[#EFF6FF] text-[#111827] border-2 border-[#111827] rounded-xl text-xs font-black shadow-[2px_2px_0px_#111827] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#111827] transition-all inline-flex items-center gap-1.5"
          >
            <Megaphone className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span>Pengumuman</span>
          </a>

          <a
            href="#pantukhir"
            className="px-3.5 py-2 bg-[#1D4ED8] hover:bg-[#1E3A8A] text-white border-2 border-[#111827] rounded-xl text-xs font-black shadow-[2px_2px_0px_#111827] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_#111827] transition-all inline-flex items-center gap-1.5"
          >
            <span>Penerima</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#FFD60A]" />
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-1.5 bg-[#FFD60A] border-2 border-[#111827] rounded-lg shadow-[2px_2px_0px_#111827] text-[#111827] active:scale-95 transition-transform cursor-pointer"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FFFDF5] border-t-2 border-[#111827] px-5 py-4 space-y-3">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-extrabold text-xs text-[#111827] hover:text-[#1D4ED8] py-2 border-b border-gray-200 flex items-center justify-between"
              >
                <span>{link.label}</span>
                <ArrowRight className="w-3 h-3 text-gray-400" />
              </a>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href="#pengumuman"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 bg-white border-2 border-[#111827] rounded-xl text-xs font-black text-center shadow-[2px_2px_0px_#111827]"
            >
              Pengumuman
            </a>
            <a
              href="#pantukhir"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 bg-[#1D4ED8] text-white border-2 border-[#111827] rounded-xl text-xs font-black text-center shadow-[2px_2px_0px_#111827]"
            >
              Penerima
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
