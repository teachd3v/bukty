import React from 'react';
import { Calendar, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { SCHEDULE_EVENTS } from '../utils/buktyConfig';

export default function TimelineSection({ schedule }) {
  const now = new Date().getTime();
  const events = schedule?.timeline && schedule.timeline.length > 0 ? schedule.timeline : SCHEDULE_EVENTS;
  const periodBadge = schedule?.periodBadge || 'JADWAL NOV – DES 2026';

  return (
    <section id="jadwal" className="py-10 md:py-24 bg-[#EFF6FF] border-t-[3px] border-[#111827] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 md:space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto space-y-2 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#FFD60A] border-2 border-[#111827] px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black shadow-[2px_2px_0px_#111827] sm:shadow-[2.5px_2.5px_0px_#111827]">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{periodBadge}</span>
          </div>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black font-heading text-[#111827] leading-tight">
            {events.length} Tahapan Seleksi Program BUKTY
          </h2>
          <p className="text-xs sm:text-base text-gray-700 font-semibold leading-relaxed">
            Catat tanggal penting seleksi BUKTY berikut.
          </p>
        </div>

        {/* Mobile Compact Vertical Timeline (< lg) */}
        <div className="space-y-2 lg:hidden">
          {events.map((item, index) => {
            const start = new Date(item.startIso).getTime();
            const end = new Date(item.endIso).getTime();
            const isFinished = now > end;
            const isActive = now >= start && now <= end;

            return (
              <div
                key={index}
                className={`border-2 border-[#111827] rounded-xl p-3 shadow-[3px_3px_0px_#111827] flex items-start gap-3 ${
                  isActive
                    ? 'bg-[#FEF9C3] ring-2 ring-[#1D4ED8]/30'
                    : isFinished
                    ? 'bg-[#DCFCE7]/60'
                    : 'bg-white'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg border-2 border-[#111827] flex items-center justify-center shadow-[2px_2px_0px_#111827] font-mono-code font-black text-xs shrink-0 mt-0.5 ${
                    isActive
                      ? 'bg-[#FFD60A] text-[#111827]'
                      : isFinished
                      ? 'bg-[#15803D] text-white'
                      : 'bg-[#1D4ED8] text-white'
                  }`}
                >
                  {isFinished ? <CheckCircle2 className="w-4 h-4" /> : `0${index + 1}`}
                </div>

                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="inline-block bg-[#DBEAFE] border border-[#111827] text-[10px] font-black px-2 py-0.5 rounded-md text-[#1E3A8A]">
                      {item.date}
                    </span>
                    {isActive ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border border-[#111827] bg-[#1D4ED8] text-[#FFD60A]">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Aktif</span>
                      </span>
                    ) : isFinished ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border border-[#111827] bg-[#15803D] text-white">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Selesai</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-gray-500">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Mendatang</span>
                      </span>
                    )}
                  </div>
                  <h4 className="font-black text-xs text-[#111827] leading-snug">{item.title}</h4>
                  <p className="text-[11px] text-gray-600 font-semibold leading-snug">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop 7-Stage Timeline Grid (lg+) */}
        <div className="hidden lg:grid lg:grid-cols-7 gap-4">
          {events.map((item, index) => {
            const start = new Date(item.startIso).getTime();
            const end = new Date(item.endIso).getTime();
            const isFinished = now > end;
            const isActive = now >= start && now <= end;

            return (
              <div
                key={index}
                className={`border-[2.5px] border-[#111827] rounded-2xl p-4 shadow-[4px_4px_0px_#111827] flex flex-col justify-between transition-transform hover:-translate-y-1 ${
                  isActive
                    ? 'bg-[#FEF9C3] ring-4 ring-[#1D4ED8]/25'
                    : isFinished
                    ? 'bg-[#DCFCE7]/60'
                    : 'bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-8 h-8 rounded-xl border-2 border-[#111827] flex items-center justify-center shadow-[2px_2px_0px_#111827] font-mono-code font-black text-xs ${
                      isActive
                        ? 'bg-[#FFD60A] text-[#111827]'
                        : isFinished
                        ? 'bg-[#15803D] text-white'
                        : 'bg-[#1D4ED8] text-white'
                    }`}
                  >
                    {isFinished ? <CheckCircle2 className="w-4 h-4" /> : `0${index + 1}`}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="inline-block bg-[#DBEAFE] border border-[#111827] text-[10px] font-black px-2 py-0.5 rounded-md text-[#1E3A8A]">
                    {item.date}
                  </div>
                  <h4 className="font-black text-sm text-[#111827] leading-snug">{item.title}</h4>
                  <p className="text-[11px] text-gray-600 font-semibold leading-relaxed">{item.desc}</p>
                </div>

                <div>
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full border-2 border-[#111827] bg-[#1D4ED8] text-[#FFD60A]">
                      <Sparkles className="w-3 h-3" />
                      <span>Aktif</span>
                    </span>
                  ) : isFinished ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-[#111827] bg-[#15803D] text-white">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Selesai</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>Mendatang</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
