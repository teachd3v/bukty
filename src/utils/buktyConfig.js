// BUKTY (Bantuan UKT Yatim) 2026 - Centralized Program Rules, Constants & Scoring Engine

// Registration Deadline: 25 November 2026, 23:59:59 WIB (GMT+7)
export const REGISTRATION_DEADLINE_ISO = '2026-11-25T23:59:59+07:00';
export const REGISTRATION_DEADLINE_LABEL = '25 November 2026 pukul 23:59 WIB';

// Toggle visibility of Pengumuman Administrasi & Penerima Akhir menus/buttons on landing page
// Set to true once announcement phase begins (direct hash routes #pengumuman & #pantukhir remain active)
export const SHOW_ANNOUNCEMENT_MENUS = false;

// 12 Target Provinces of BUKTY Program (from DRAFT_PROGRAM_BUKTY.docx)
export const TARGET_PROVINCES = [
  'Jawa Timur',
  'Jawa Barat',
  'DI Yogyakarta',
  'Sumatera Barat',
  'Sumatera Utara',
  'DKI Jakarta',
  'Banten',
  'Sumatera Selatan',
  'Sulawesi Selatan',
  'Riau',
  'Lampung',
  'Jawa Tengah',
];

export const AGAMA_LIST = [
  'Islam',
  'Kristen Protestan',
  'Katolik',
  'Hindu',
  'Buddha',
  'Konghucu',
];

export const PROVINSI_LIST = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau', 'Jambi',
  'Sumatera Selatan', 'Kepulauan Bangka Belitung', 'Bengkulu', 'Lampung',
  'DKI Jakarta', 'Jawa Barat', 'Banten', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur',
  'Bali', 'Nusa Tenggara Barat', 'Nusa Tenggara Timur',
  'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur', 'Kalimantan Utara',
  'Sulawesi Utara', 'Gorontalo', 'Sulawesi Tengah', 'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tenggara',
  'Maluku', 'Maluku Utara',
  'Papua', 'Papua Barat', 'Papua Selatan', 'Papua Tengah', 'Papua Pegunungan', 'Papua Barat Daya',
];

export const STATUS_YATIM_LIST = [
  'Yatim Piatu',
  'Yatim',
  'Piatu',
  'Orang Tua Lengkap',
];

export const BANK_LIST = [
  'BRI', 'BCA', 'BNI', 'Mandiri', 'BSI (Bank Syariah Indonesia)', 'BTN',
  'CIMB Niaga', 'Danamon', 'Permata', 'Maybank', 'OCBC NISP', 'Panin Bank',
  'Bank Jago', 'Jenius (BTPN)', 'Allo Bank', 'SeaBank', 'Blu by BCA',
  'Bank Neo Commerce', 'Bank Muamalat', 'Bank Mega', 'Bank Sinarmas', 'Bank Bukopin', 'Lainnya',
];

const MONTHS_SHORT_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const MONTHS_LONG_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function parseYmdParts(ymd) {
  const match = String(ymd || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10) - 1,
    day: parseInt(match[3], 10),
  };
}

export function formatShortDateRangeId(startYmd, endYmd) {
  const s = parseYmdParts(startYmd);
  const e = parseYmdParts(endYmd || startYmd);
  if (!s) return '';
  if (!e || (s.year === e.year && s.month === e.month && s.day === e.day)) {
    return `${s.day} ${MONTHS_SHORT_ID[s.month]} ${s.year}`;
  }
  if (s.year === e.year && s.month === e.month) {
    return `${s.day} – ${e.day} ${MONTHS_SHORT_ID[s.month]} ${s.year}`;
  }
  if (s.year === e.year) {
    return `${s.day} ${MONTHS_SHORT_ID[s.month]} – ${e.day} ${MONTHS_SHORT_ID[e.month]} ${s.year}`;
  }
  return `${s.day} ${MONTHS_SHORT_ID[s.month]} ${s.year} – ${e.day} ${MONTHS_SHORT_ID[e.month]} ${e.year}`;
}

export function toWibIso(value, fallbackIso = REGISTRATION_DEADLINE_ISO) {
  const raw = String(value || '').trim();
  if (!raw) return fallbackIso;
  if (/([+-]\d{2}:\d{2}|Z)$/i.test(raw)) return raw;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) return `${raw}:59+07:00`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(raw)) return `${raw}+07:00`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return `${raw}T23:59:59+07:00`;
  return fallbackIso;
}

export function toDatetimeLocalValue(isoOrLocal) {
  const raw = String(isoOrLocal || '').trim();
  const match = raw.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
  return match ? match[1] : '2026-11-25T23:59';
}

export function formatDeadlinePartsId(isoOrLocal) {
  const iso = toWibIso(isoOrLocal);
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) {
    return {
      longLabel: REGISTRATION_DEADLINE_LABEL,
      shortLabel: '25 Nov 2026 (23:59 WIB)',
      dateShort: '25 Nov 2026',
      timeShort: '23:59 WIB',
    };
  }
  const year = parseInt(match[1], 10);
  const monthIdx = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  const hh = match[4];
  const mm = match[5];
  const dateShort = `${day} ${MONTHS_SHORT_ID[monthIdx]} ${year}`;
  const dateLong = `${day} ${MONTHS_LONG_ID[monthIdx]} ${year}`;
  const timeShort = `${hh}:${mm} WIB`;
  return {
    longLabel: `${dateLong} pukul ${timeShort}`,
    shortLabel: `${dateShort} (${timeShort})`,
    dateShort,
    timeShort,
  };
}

export function formatTimelinePeriodBadge(events) {
  if (!Array.isArray(events) || events.length === 0) return 'JADWAL NOV – DES 2026';
  const first = parseYmdParts(events[0]?.startDate || events[0]?.startIso);
  const last = parseYmdParts(events[events.length - 1]?.endDate || events[events.length - 1]?.endIso);
  if (!first || !last) return 'JADWAL SELEKSI BUKTY';
  const m1 = MONTHS_SHORT_ID[first.month].toUpperCase();
  const m2 = MONTHS_SHORT_ID[last.month].toUpperCase();
  if (first.year === last.year && first.month === last.month) {
    return `JADWAL ${m1} ${first.year}`;
  }
  if (first.year === last.year) {
    return `JADWAL ${m1} – ${m2} ${first.year}`;
  }
  return `JADWAL ${m1} ${first.year} – ${m2} ${last.year}`;
}

export const SCHEDULE_EVENTS = [
  {
    date: '19 – 25 Nov 2026',
    startDate: '2026-11-19',
    endDate: '2026-11-25',
    startIso: '2026-11-19T00:00:00+07:00',
    endIso: '2026-11-25T23:59:59+07:00',
    title: 'Pendaftaran',
    desc: 'Isi formulir online & unggah 13 berkas.',
  },
  {
    date: '26 Nov 2026',
    startDate: '2026-11-26',
    endDate: '2026-11-26',
    startIso: '2026-11-26T00:00:00+07:00',
    endIso: '2026-11-26T23:59:59+07:00',
    title: 'Tahap Administrasi',
    desc: 'Verifikasi kelayakan syarat, wilayah & berkas.',
  },
  {
    date: '27 Nov 2026',
    startDate: '2026-11-27',
    endDate: '2026-11-27',
    startIso: '2026-11-27T00:00:00+07:00',
    endIso: '2026-11-27T23:59:59+07:00',
    title: 'Pengumuman Administrasi',
    desc: 'Rilis peserta lolos seleksi berkas.',
  },
  {
    date: '28 – 29 Nov 2026',
    startDate: '2026-11-28',
    endDate: '2026-11-29',
    startIso: '2026-11-28T00:00:00+07:00',
    endIso: '2026-11-29T23:59:59+07:00',
    title: 'Tahap Konfirmasi',
    desc: 'Konfirmasi data keluarga & wawancara.',
  },
  {
    date: '30 Nov 2026',
    startDate: '2026-11-30',
    endDate: '2026-11-30',
    startIso: '2026-11-30T00:00:00+07:00',
    endIso: '2026-11-30T23:59:59+07:00',
    title: 'Pengumuman Penerima',
    desc: 'Penetapan resmi penerima BUKTY 2027.',
  },
  {
    date: '1 Des 2026',
    startDate: '2026-12-01',
    endDate: '2026-12-01',
    startIso: '2026-12-01T00:00:00+07:00',
    endIso: '2026-12-01T23:59:59+07:00',
    title: 'Kesepakatan Bantuan',
    desc: 'Penandatanganan komitmen penerima bantuan.',
  },
  {
    date: '2 Des 2026',
    startDate: '2026-12-02',
    endDate: '2026-12-02',
    startIso: '2026-12-02T00:00:00+07:00',
    endIso: '2026-12-02T23:59:59+07:00',
    title: 'Pembayaran UKT',
    desc: 'Penyaluran bantuan UKT periode 2027.',
  },
];

export function normalizeTimelineEvents(rawInput) {
  let parsed = rawInput;
  if (typeof rawInput === 'string') {
    const trimmed = rawInput.trim();
    if (!trimmed) return SCHEDULE_EVENTS.map((item) => ({ ...item }));
    try {
      parsed = JSON.parse(trimmed);
    } catch (e) {
      return SCHEDULE_EVENTS.map((item) => ({ ...item }));
    }
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return SCHEDULE_EVENTS.map((item) => ({ ...item }));
  }

  return parsed.map((item, idx) => {
    const fallback = SCHEDULE_EVENTS[idx] || SCHEDULE_EVENTS[SCHEDULE_EVENTS.length - 1];
    const startDate =
      (item?.startDate && /^\d{4}-\d{2}-\d{2}$/.test(item.startDate) && item.startDate) ||
      String(item?.startIso || '').slice(0, 10) ||
      fallback.startDate;
    const endDateRaw =
      (item?.endDate && /^\d{4}-\d{2}-\d{2}$/.test(item.endDate) && item.endDate) ||
      String(item?.endIso || '').slice(0, 10) ||
      startDate;
    const endDate = endDateRaw < startDate ? startDate : endDateRaw;
    const autoDate = formatShortDateRangeId(startDate, endDate);

    return {
      date: autoDate || item?.date || fallback.date,
      startDate,
      endDate,
      startIso: `${startDate}T00:00:00+07:00`,
      endIso: `${endDate}T23:59:59+07:00`,
      title: (item?.title || '').trim() || fallback.title,
      desc: (item?.desc || '').trim() || fallback.desc,
    };
  });
}

export function buildSiteSchedule(config) {
  const timeline = normalizeTimelineEvents(config?.timeline_json);
  const rawDeadline = config?.registration_deadline || timeline[0]?.endIso || REGISTRATION_DEADLINE_ISO;
  const deadlineIso = toWibIso(rawDeadline);
  const deadlineParts = formatDeadlinePartsId(deadlineIso);
  const showAnnouncementMenus =
    config && config.show_announcement_menus !== undefined && config.show_announcement_menus !== null
      ? Boolean(Number(config.show_announcement_menus))
      : SHOW_ANNOUNCEMENT_MENUS;

  return {
    timeline,
    periodBadge: formatTimelinePeriodBadge(timeline),
    deadlineIso,
    deadlineLabel: deadlineParts.longLabel,
    deadlineShort: deadlineParts.shortLabel,
    deadlineDateShort: deadlineParts.dateShort,
    deadlineTimeShort: deadlineParts.timeShort,
    registrationRangeLabel: timeline[0]?.date || '19 – 25 Nov 2026',
    adminAnnouncementDate: timeline[2]?.date || '27 Nov 2026',
    confirmationRangeLabel: timeline[3]?.date || '28 – 29 Nov 2026',
    pantukhirDate: timeline[4]?.date || '30 Nov 2026',
    agreementDate: timeline[5]?.date || '1 Des 2026',
    paymentDate: timeline[6]?.date || '2 Des 2026',
    showAnnouncementMenus,
  };
}

export function formatRupiah(value) {
  if (!value && value !== 0) return '';
  const cleanNumber = value.toString().replace(/\D/g, '');
  if (!cleanNumber) return '';
  return cleanNumber.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseRupiah(val) {
  if (!val) return 0;
  return parseFloat(val.toString().replace(/[^0-9]/g, '')) || 0;
}

export function isTargetProvince(provinsi) {
  if (!provinsi) return false;
  const normalized = provinsi.trim().toLowerCase();
  return TARGET_PROVINCES.some((p) => {
    const target = p.toLowerCase();
    return normalized === target || (target === 'di yogyakarta' && normalized === 'yogyakarta');
  });
}

// Check BUKTY auto-screening criteria
export function checkBuktyEligibility(r) {
  const flags = [];
  const religion = (r.agama || '').trim().toLowerCase();
  if (religion !== 'islam') flags.push('Agama bukan Islam');

  if (!isTargetProvince(r.provinsi)) flags.push('Di luar 12 provinsi program');

  const jenisPt = (r.jenis_pt || 'PTN').trim().toUpperCase();
  if (jenisPt !== 'PTN') flags.push('Bukan Perguruan Tinggi Negeri (PTN)');

  const isMaba = (r.status_mahasiswa || '') === 'Mahasiswa Baru';
  const ipkVal = parseFloat(String(r.ipk || '').replace(',', '.')) || 0;
  if (!isMaba && ipkVal < 3.0) flags.push('IPK di bawah 3.00');

  const otherSch = (r.sedang_beasiswa_lain || '').trim().toLowerCase();
  if (otherSch === 'ya' || otherSch === 'pernah') {
    flags.push('Sedang menerima beasiswa lain');
  }

  return {
    isQualified: flags.length === 0,
    flags,
  };
}

// BUKTY Priority Scoring Formula (0 - 100):
// 35% Status Yatim + 45% Rasio Beban UKT/Penghasilan + 20% Tanggungan Keluarga
export function calculateBuktyScores(r) {
  const ukt = parseRupiah(r.nominal_ukt);
  const income = parseRupiah(r.penghasilan_ortu);
  const adjustedIncome = income === 0 ? 100000 : income;
  const ratio = ukt / adjustedIncome;

  // A. Rasio Beban UKT (45%)
  const score_ratio = Math.min(ratio * 100, 100);

  // B. Status Yatim Priority (35%)
  const yatimRaw = (r.status_yatim || '').trim().toLowerCase();
  const kondisiRaw = (r.kondisi_khusus || '').trim().toLowerCase();
  let score_yatim = 30;
  if (yatimRaw === 'yatim piatu') score_yatim = 100;
  else if (yatimRaw === 'yatim') score_yatim = 90;
  else if (yatimRaw === 'piatu') score_yatim = 80;
  else if (!yatimRaw && kondisiRaw.includes('meninggal')) score_yatim = 90;

  // C. Tanggungan Keluarga (20%)
  const tanggungan = parseInt(r.jumlah_tanggungan, 10) || 0;
  let score_tanggungan = 30;
  if (tanggungan >= 5) score_tanggungan = 100;
  else if (tanggungan === 4) score_tanggungan = 85;
  else if (tanggungan === 3) score_tanggungan = 70;
  else if (tanggungan === 2) score_tanggungan = 50;

  const score_total = (score_yatim * 0.35) + (score_ratio * 0.45) + (score_tanggungan * 0.20);

  return {
    score_yatim,
    score_ratio: parseFloat(score_ratio.toFixed(2)),
    score_tanggungan,
    score_total: parseFloat(score_total.toFixed(2)),
    raw_ratio: ratio,
    raw_ukt: ukt,
    raw_tanggungan: tanggungan,
  };
}
