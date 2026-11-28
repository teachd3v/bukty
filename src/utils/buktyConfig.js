// BUKTY (Bantuan UKT Yatim) 2026 - Centralized Program Rules, Constants & Scoring Engine

// Registration Deadline: 25 November 2026, 23:59:59 WIB (GMT+7)
export const REGISTRATION_DEADLINE_ISO = '2026-11-25T23:59:59+07:00';
export const REGISTRATION_DEADLINE_LABEL = '25 November 2026 pukul 23:59 WIB';

// Toggle visibility of Pengumuman Administrasi & Penerima Akhir menus/buttons on landing page
// Set to true once announcement phase begins (direct hash routes #pengumuman & #pantukhir remain active)
export const SHOW_ANNOUNCEMENT_MENUS = false;

// 13 Target Provinces of BUKTY Program
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
  'Aceh',
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
    return (
      normalized === target ||
      (target === 'di yogyakarta' && normalized === 'yogyakarta') ||
      (target === 'aceh' && normalized === 'nanggroe aceh darussalam')
    );
  });
}

// Check BUKTY auto-screening criteria
export function checkBuktyEligibility(r) {
  const flags = [];
  const religion = (r.agama || '').trim().toLowerCase();
  if (religion !== 'islam') flags.push('Agama bukan Islam');

  if (!isTargetProvince(r.provinsi)) flags.push('Di luar 13 provinsi program');

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

export const ADMIN_PASSING_SCORE = 75;

// Stage 1 Administrative Screening Evaluator (MS/TMS + Registration Score >= 75)
export function evaluateAdminScreening(r, passingScore = ADMIN_PASSING_SCORE) {
  const eligibility = checkBuktyEligibility(r);
  const scores = calculateBuktyScores(r);
  const isBelowPassingScore = scores.score_total < passingScore;
  const reasons = [...eligibility.flags];

  if (isBelowPassingScore) {
    reasons.push(`Skor pendaftaran ${scores.score_total} < ${passingScore}`);
  }

  const isRecommendedPass = eligibility.isQualified && !isBelowPassingScore;

  return {
    eligibility,
    scores,
    passingScore,
    isBelowPassingScore,
    isRecommendedPass,
    recommendation: isRecommendedPass ? 'SARAN_LOLOS' : 'SARAN_GUGUR',
    recommendationLabel: isRecommendedPass ? 'Disarankan Lolos' : 'Disarankan Gugur',
    reasons,
  };
}

// ============================================================================
// BUKTY INTERVIEW RUBRIC & SCORING ENGINE
// ============================================================================

// Bagian 1 - Verifikasi Dokumen & Kelayakan Akhir (8 Poin)
export const INTERVIEW_VERIFICATION_ITEMS = [
  {
    key: 'identitas_kampus',
    no: 1,
    title: 'Identitas & Kampus',
    howToVerify: 'Konfirmasi ulang sesuai dengan KTP/KTM',
    docKeys: ['ktp', 'ktm'],
  },
  {
    key: 'status_yatim',
    no: 2,
    title: 'Status Orang Tua (Yatim)',
    howToVerify: 'Konfirmasi apakah yatim/bukan',
    docKeys: ['suratYatim', 'kk'],
  },
  {
    key: 'agama_islam',
    no: 3,
    title: 'Agama (Islam)',
    howToVerify: 'Cocokkan kolom agama pada KTP dengan isian form pendaftaran',
    docKeys: ['ktp'],
  },
  {
    key: 'jenjang_mahasiswa',
    no: 4,
    title: 'Jenjang Mahasiswa (S1/D4)',
    howToVerify: 'Cek KTM/Surat Keterangan Aktif Kuliah, pastikan jenjang sesuai cakupan program (S1 atau D4)',
    docKeys: ['ktm', 'krs'],
  },
  {
    key: 'foto_rumah',
    no: 5,
    title: 'Foto Rumah',
    howToVerify: 'Minta tunjukkan ulang/konfirmasi foto rumah (tampak depan, ruang tamu, samping) yang telah diunggah, cocokkan dengan cerita kondisi ekonomi',
    docKeys: ['rumahDepan', 'rumahTamu', 'rumahSamping'],
  },
  {
    key: 'sktm',
    no: 6,
    title: 'SKTM (Surat Keterangan Tidak Mampu)',
    howToVerify: 'Cek keaslian SKTM: nama sesuai, ada tanda tangan & cap kelurahan/desa',
    docKeys: ['sktm'],
  },
  {
    key: 'slip_ukt',
    no: 7,
    title: 'Slip UKT Semester Ganjil / Bukti Pembayaran',
    howToVerify: 'Cek slip UKT atau bukti transfer; sekaligus pastikan status: SUDAH atau BELUM membayar UKT semester berjalan',
    docKeys: ['slipUkt'],
    hasUktPaymentStatus: true,
  },
  {
    key: 'kesan_kejujuran',
    no: 8,
    title: 'Kesan Umum Kejujuran',
    howToVerify: 'Perhatikan apakah jawaban lancar/konsisten atau ragu-ragu & berubah-ubah',
    docKeys: [],
  },
];

// Bagian 2 - Penilaian Terbobot dengan Skala Indikator 1-4
export const INTERVIEW_SCORING_RUBRIC = [
  {
    key: 'kondisi_ekonomi',
    no: 1,
    title: 'Kondisi Ekonomi Keluarga — PRIORITAS UTAMA',
    weight: 40,
    badge: 'Bobot 40% • Prioritas Utama',
    questions: [
      'Ceritakan kondisi keluarga (Yatim/Non Yatim). Kemudian ceritakan pekerjaan & penghasilan Ibu saat ini.',
      'Apa tantangan finansial terbesar keluarga sekarang?',
    ],
    docKeys: ['rumahDepan', 'sktm', 'kk'],
    options: [
      {
        score: 1,
        label: 'Kurang',
        desc: 'Jawaban tidak konsisten dengan form / kondisi terkesan cukup mampu.',
      },
      {
        score: 2,
        label: 'Cukup',
        desc: 'Jawaban konsisten, namun kondisi ekonomi tergolong menengah, tidak terlalu berat.',
      },
      {
        score: 3,
        label: 'Baik',
        desc: 'Jawaban konsisten, kondisi ekonomi cukup terbatas/pas-pasan.',
      },
      {
        score: 4,
        label: 'Sangat Baik',
        desc: 'Jawaban konsisten & jelas menggambarkan kondisi pra sejahtera.',
      },
    ],
  },
  {
    key: 'motivasi_studi',
    no: 2,
    title: 'Motivasi & Kesungguhan Studi',
    weight: 20,
    badge: 'Bobot 20%',
    questions: [
      'Kenapa bantuan ini penting buat kamu?',
      'Apa rencana kamu setelah dapat bantuan ini?',
    ],
    docKeys: ['khs', 'bio'],
    options: [
      {
        score: 1,
        label: 'Kurang',
        desc: 'Jawaban generik, tidak personal, tidak meyakinkan.',
      },
      {
        score: 2,
        label: 'Cukup',
        desc: 'Jawaban cukup personal, namun kurang spesifik & rencana belum jelas.',
      },
      {
        score: 3,
        label: 'Baik',
        desc: 'Jawaban personal dan cukup jelas, rencana studi masuk akal.',
      },
      {
        score: 4,
        label: 'Sangat Baik',
        desc: 'Jawaban personal, spesifik, menunjukkan rencana & tekad yang jelas.',
      },
    ],
  },
  {
    key: 'konsistensi_esai',
    no: 3,
    title: 'Konsistensi dengan Esai & Data Pendaftaran',
    weight: 20,
    badge: 'Bobot 20%',
    questions: [
      'Coba ceritakan ulang inti dari esai yang kamu tulis.',
    ],
    docKeys: ['esai'],
    options: [
      {
        score: 1,
        label: 'Kurang',
        desc: 'Cerita tidak nyambung / bertentangan dengan esai & form.',
      },
      {
        score: 2,
        label: 'Cukup',
        desc: 'Cerita sebagian sesuai, ada beberapa detail yang berbeda/kurang jelas.',
      },
      {
        score: 3,
        label: 'Baik',
        desc: 'Cerita cukup sesuai dan mendukung isi esai & form.',
      },
      {
        score: 4,
        label: 'Sangat Baik',
        desc: 'Cerita selaras dan memperkuat isi esai & form.',
      },
    ],
  },
  {
    key: 'sikap_komunikasi',
    no: 4,
    title: 'Sikap, Komunikasi & Kejujuran',
    weight: 20,
    badge: 'Bobot 20%',
    questions: [
      'Observasi sepanjang sesi, tidak perlu pertanyaan khusus.',
    ],
    docKeys: [],
    options: [
      {
        score: 1,
        label: 'Kurang',
        desc: 'Kurang sopan, defensif, atau jawaban terkesan dihafal/dibuat-buat.',
      },
      {
        score: 2,
        label: 'Cukup',
        desc: 'Cukup sopan namun kurang komunikatif / agak kaku.',
      },
      {
        score: 3,
        label: 'Baik',
        desc: 'Sopan dan komunikatif, jawaban terasa cukup natural.',
      },
      {
        score: 4,
        label: 'Sangat Baik',
        desc: 'Sopan, komunikatif, jawaban terasa jujur & natural.',
      },
    ],
  },
];

export function createDefaultInterviewState() {
  const verifications = {};
  INTERVIEW_VERIFICATION_ITEMS.forEach((item) => {
    verifications[item.key] = null; // 'pass' | 'fail' | null
  });

  const scores = {};
  INTERVIEW_SCORING_RUBRIC.forEach((item) => {
    scores[item.key] = 0; // 1 | 2 | 3 | 4 | 0
  });

  return {
    verifications,
    uktPaymentStatus: '', // 'SUDAH' | 'BELUM' | ''
    scores,
    interviewerName: '',
    notes: '',
    updatedAt: null,
  };
}

export function parseInterviewJson(rawJson) {
  const base = createDefaultInterviewState();
  if (!rawJson) return base;
  try {
    const parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
    if (!parsed || typeof parsed !== 'object') return base;
    return {
      verifications: { ...base.verifications, ...(parsed.verifications || {}) },
      uktPaymentStatus: parsed.uktPaymentStatus || '',
      scores: { ...base.scores, ...(parsed.scores || {}) },
      interviewerName: parsed.interviewerName || '',
      notes: parsed.notes || '',
      updatedAt: parsed.updatedAt || null,
    };
  } catch (e) {
    return base;
  }
}

export function calculateInterviewEvaluation(interviewState) {
  const state = parseInterviewJson(interviewState);

  let verifiedCount = 0;
  let passedCount = 0;
  let failedCount = 0;
  const failedItems = [];

  INTERVIEW_VERIFICATION_ITEMS.forEach((item) => {
    const val = state.verifications?.[item.key];
    if (val === 'pass') {
      verifiedCount += 1;
      passedCount += 1;
    } else if (val === 'fail') {
      verifiedCount += 1;
      failedCount += 1;
      failedItems.push(item.title);
    }
  });

  let scoredIndicatorsCount = 0;
  let totalWeightedScore = 0;
  const breakdown = {};

  INTERVIEW_SCORING_RUBRIC.forEach((item) => {
    const rawScore = Number(state.scores?.[item.key]) || 0;
    if (rawScore >= 1 && rawScore <= 4) {
      scoredIndicatorsCount += 1;
      const weighted = (rawScore / 4) * item.weight;
      totalWeightedScore += weighted;
      breakdown[item.key] = {
        raw: rawScore,
        weighted: parseFloat(weighted.toFixed(2)),
        maxWeight: item.weight,
      };
    } else {
      breakdown[item.key] = {
        raw: 0,
        weighted: 0,
        maxWeight: item.weight,
      };
    }
  });

  totalWeightedScore = parseFloat(totalWeightedScore.toFixed(2));
  const isVerificationFailed = failedCount > 0;
  const isAllVerified = verifiedCount === INTERVIEW_VERIFICATION_ITEMS.length;
  const isAllScored = scoredIndicatorsCount === INTERVIEW_SCORING_RUBRIC.length;
  const isAssessed = verifiedCount > 0 || scoredIndicatorsCount > 0;
  const isComplete = isAllVerified && isAllScored;

  let recommendation = 'BELUM LENGKAP';
  let recommendationDesc = 'Lengkapi verifikasi Bagian 1 & skor Bagian 2 untuk melihat hasil akhir.';
  let recommendationColor = 'gray';

  if (isVerificationFailed) {
    recommendation = 'TIDAK DIREKOMENDASIKAN';
    recommendationDesc = `GUGUR di Verifikasi Cepat (${failedItems.join(', ')})`;
    recommendationColor = 'red';
  } else if (scoredIndicatorsCount > 0) {
    if (totalWeightedScore >= 75) {
      recommendation = 'DIREKOMENDASIKAN';
      recommendationDesc = 'Direkomendasikan sebagai penerima Bantuan UKT Merdeka (Skor ≥ 75 & Lolos Verifikasi)';
      recommendationColor = 'green';
    } else if (totalWeightedScore >= 60) {
      recommendation = 'CADANGAN';
      recommendationDesc = 'Dipertimbangkan sebagai Cadangan jika kuota belum terpenuhi (Skor 60 – 74)';
      recommendationColor = 'amber';
    } else {
      recommendation = 'TIDAK DIREKOMENDASIKAN';
      recommendationDesc = 'Total Skor Tertimbang di bawah ambang batas (< 60)';
      recommendationColor = 'red';
    }
  }

  return {
    verifiedCount,
    passedCount,
    failedCount,
    failedItems,
    isVerificationFailed,
    isAllVerified,
    scoredIndicatorsCount,
    isAllScored,
    isAssessed,
    isComplete,
    totalWeightedScore,
    breakdown,
    uktPaymentStatus: state.uktPaymentStatus || '',
    recommendation,
    recommendationDesc,
    recommendationColor,
  };
}

export const BUKTY_RECIPIENT_QUOTA = 32;

// Determines whether a candidate has passed Stage 1 Administrative Selection and entered the Interview Pipeline
export function isInInterviewPipeline(r) {
  if (!r) return false;
  if (['Lolos Administrasi', 'Diterima', 'Cadangan'].includes(r.status_seleksi)) {
    return true;
  }
  const ev = calculateInterviewEvaluation(r.interview_json);
  return ev.isAssessed;
}

// Final Interview Ranking Engine with Top 32 Automatic Recipient Quota
export function rankInterviewCandidates(registrations = [], quota = BUKTY_RECIPIENT_QUOTA) {
  const safeQuota = Math.max(1, parseInt(quota, 10) || BUKTY_RECIPIENT_QUOTA);

  const enriched = registrations.map((r) => {
    const buktyScores = calculateBuktyScores(r);
    const parsedInterview = parseInterviewJson(r.interview_json);
    const interviewEval = calculateInterviewEvaluation(parsedInterview);
    const eligibility = checkBuktyEligibility(r);

    // A candidate is eligible for the final Top 32 recipient ranking if:
    // 1. They have been assessed in the interview (scoredIndicatorsCount > 0)
    // 2. They did NOT fail any quick verification item in Bagian 1 (!isVerificationFailed)
    // 3. Their weighted interview score is >= 60 (Direkomendasikan >= 75 or Cadangan 60-74)
    const isEligibleForQuota =
      interviewEval.scoredIndicatorsCount > 0 &&
      !interviewEval.isVerificationFailed &&
      interviewEval.totalWeightedScore >= 60;

    const economyScore = Number(parsedInterview.scores?.kondisi_ekonomi) || 0;
    const motivationScore = Number(parsedInterview.scores?.motivasi_studi) || 0;
    const essayScore = Number(parsedInterview.scores?.konsistensi_esai) || 0;
    const attitudeScore = Number(parsedInterview.scores?.sikap_komunikasi) || 0;

    return {
      ...r,
      ...buktyScores,
      eligibility,
      parsedInterview,
      interviewEval,
      isEligibleForQuota,
      economyScore,
      motivationScore,
      essayScore,
      attitudeScore,
    };
  });

  // Sort order:
  // 1. Eligible for Quota (Lolos Bagian 1 & Skor >= 60) first
  // 2. Assessed but Gugur (<60 or Failed Bagian 1) second
  // 3. Not yet interviewed third
  // Within groups:
  // - Higher Total Weighted Interview Score (0 - 100)
  // - Higher Economy Indicator Score (Bobot 40% priority)
  // - Higher BUKTY Admin Score (score_total)
  // - Higher Yatim Score & Raw Ratio
  const sorted = [...enriched].sort((a, b) => {
    const tierA = a.isEligibleForQuota ? 3 : a.interviewEval.isAssessed ? 2 : 1;
    const tierB = b.isEligibleForQuota ? 3 : b.interviewEval.isAssessed ? 2 : 1;
    if (tierB !== tierA) return tierB - tierA;

    if (b.interviewEval.totalWeightedScore !== a.interviewEval.totalWeightedScore) {
      return b.interviewEval.totalWeightedScore - a.interviewEval.totalWeightedScore;
    }
    if (b.economyScore !== a.economyScore) return b.economyScore - a.economyScore;
    if (b.score_total !== a.score_total) return b.score_total - a.score_total;
    if (b.score_yatim !== a.score_yatim) return b.score_yatim - a.score_yatim;
    if (b.raw_ratio !== a.raw_ratio) return b.raw_ratio - a.raw_ratio;
    return a.id - b.id;
  });

  let eligibleRankCounter = 0;
  let overallAssessedRankCounter = 0;

  return sorted.map((item) => {
    let interviewRank = null;
    let eligibleRank = null;
    let isTopQuotaRecipient = false;
    let waitingListNumber = null;
    let quotaCategory = 'BELUM_WAWANCARA'; // 'TOP_QUOTA' | 'CADANGAN' | 'GUGUR' | 'BELUM_WAWANCARA'
    let quotaLabel = 'Belum Diwawancara';
    let autoTargetStatus = item.status_seleksi || 'Pending';

    if (item.interviewEval.isAssessed) {
      overallAssessedRankCounter += 1;
      interviewRank = overallAssessedRankCounter;

      if (item.isEligibleForQuota) {
        eligibleRankCounter += 1;
        eligibleRank = eligibleRankCounter;

        if (eligibleRankCounter <= safeQuota) {
          isTopQuotaRecipient = true;
          quotaCategory = 'TOP_QUOTA';
          quotaLabel = `PENERIMA BUKTY (TOP ${safeQuota} • #${eligibleRankCounter})`;
          autoTargetStatus = 'Diterima';
        } else {
          waitingListNumber = eligibleRankCounter - safeQuota;
          quotaCategory = 'CADANGAN';
          quotaLabel = `CADANGAN #${waitingListNumber} (Rank #${eligibleRankCounter})`;
          autoTargetStatus = 'Cadangan';
        }
      } else {
        quotaCategory = 'GUGUR';
        quotaLabel = item.interviewEval.isVerificationFailed
          ? 'TIDAK DIREKOMENDASIKAN (Gugur Verifikasi)'
          : 'TIDAK DIREKOMENDASIKAN (Skor < 60)';
        autoTargetStatus = 'Tidak Lolos';
      }
    }

    return {
      ...item,
      interviewRank,
      eligibleRank,
      isTopQuotaRecipient,
      waitingListNumber,
      quotaCategory,
      quotaLabel,
      autoTargetStatus,
    };
  });
}


