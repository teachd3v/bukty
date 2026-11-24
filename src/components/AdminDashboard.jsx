import React, { useState, useEffect } from 'react';
import {
  Lock,
  Search,
  Download,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  RefreshCw,
  LogOut,
  X,
  FileText,
  ArrowLeft,
  Trash2,
  AlertTriangle,
  Trophy,
  ChevronRight,
  HeartHandshake,
  ExternalLink,
  Calendar,
  RotateCcw,
  ClipboardCheck,
  Award,
  Check,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import {
  calculateBuktyScores,
  checkBuktyEligibility,
  TARGET_PROVINCES,
  STATUS_YATIM_LIST,
  SCHEDULE_EVENTS,
  normalizeTimelineEvents,
  formatShortDateRangeId,
  toDatetimeLocalValue,
  toWibIso,
  INTERVIEW_VERIFICATION_ITEMS,
  INTERVIEW_SCORING_RUBRIC,
  createDefaultInterviewState,
  parseInterviewJson,
  calculateInterviewEvaluation,
} from '../utils/buktyConfig';

const SESSION_KEY = 'bukty_admin_session';
const LOCAL_SUBMISSIONS_KEY = 'bukty_admin_submissions';
const ACTIVE_TAB_STORAGE_KEY = 'bukty_admin_active_tab';
const SELECTED_RANK_ID_STORAGE_KEY = 'bukty_admin_selected_rank_id';
const VALID_ADMIN_TABS = ['list', 'leaderboard', 'approved', 'announcement'];

function getInitialAdminTab() {
  try {
    const hash = window.location.hash || '';
    if (hash.startsWith('#admin/')) {
      const subTab = hash.replace('#admin/', '').trim();
      if (VALID_ADMIN_TABS.includes(subTab)) return subTab;
    }
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && VALID_ADMIN_TABS.includes(tabParam)) return tabParam;
    const savedTab = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    if (savedTab && VALID_ADMIN_TABS.includes(savedTab)) return savedTab;
  } catch (e) {}
  return 'list';
}

const DOC_ORDER = [
  'bio',
  'krs',
  'khs',
  'ktp',
  'ktm',
  'sktm',
  'kk',
  'esai',
  'slipUkt',
  'suratYatim',
  'rumahDepan',
  'rumahTamu',
  'rumahSamping',
  'prestasi1',
  'prestasi2',
  'prestasi3',
];

const DOC_LABELS = {
  bio: 'Biodata/CV',
  krs: 'Aktif/KRS',
  khs: 'KHS/Rapor',
  ktp: 'KTP',
  ktm: 'KTM/Pelajar',
  sktm: 'SKTM',
  kk: 'Kartu Keluarga',
  esai: 'Esai',
  slipUkt: 'Slip UKT',
  suratYatim: 'Surat Yatim',
  rumahDepan: 'R.Depan',
  rumahTamu: 'R.Tamu',
  rumahSamping: 'R.Samping',
  prestasi1: 'Prestasi 1',
  prestasi2: 'Prestasi 2',
  prestasi3: 'Prestasi 3',
};

export default function AdminDashboard({ onLeaveAdmin }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        if (parsed.token && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return true;
        }
      }
    } catch (e) {}
    return false;
  });

  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [registrations, setRegistrations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [yatimFilter, setYatimFilter] = useState('Semua');
  const [provinsiFilter, setProvinsiFilter] = useState('Semua');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false, targetIds: [] });
  const [isDeleting, setIsDeleting] = useState(false);

  // Tabs & Leaderboard States (Persisted across F5 Refresh)
  const [activeTab, setActiveTabState] = useState(() => getInitialAdminTab()); // 'list' | 'leaderboard' | 'approved' | 'announcement'
  const [onlyQualifiedLeaderboard, setOnlyQualifiedLeaderboard] = useState(true);
  const [selectedLeaderboardItem, setSelectedLeaderboardItem] = useState(null);
  const [activeDocKey, setActiveDocKey] = useState(null);
  const [middlePanelMode, setMiddlePanelMode] = useState('detail'); // 'detail' | 'docs'
  const [interviewSectionTab, setInterviewSectionTab] = useState('bagian1'); // 'bagian1' | 'bagian2' | 'all'
  const [interviewForm, setInterviewForm] = useState(() => createDefaultInterviewState());
  const [savingStatus, setSavingStatus] = useState(false);
  const [leaderboardComment, setLeaderboardComment] = useState('');
  const [leaderboardStatus, setLeaderboardStatus] = useState('Pending');
  const [leaderboardSearchQuery, setLeaderboardSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const setActiveTab = (nextTab) => {
    setActiveTabState(nextTab);
    try {
      localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, nextTab);
      const url = new URL(window.location.href);
      if (url.pathname.includes('/admin')) {
        url.searchParams.set('tab', nextTab);
        window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
      } else {
        window.history.replaceState(null, '', `${url.pathname}${url.search}#admin/${nextTab}`);
      }
    } catch (e) {}
  };

  // Approved Tab States
  const [approvedSearchQuery, setApprovedSearchQuery] = useState('');
  const [approvedNameSort, setApprovedNameSort] = useState('default'); // 'default' | 'asc' | 'desc'

  // Announcement, Timeline & Pantukhir States
  const [timelineEvents, setTimelineEvents] = useState(() => SCHEDULE_EVENTS.map((item) => ({ ...item })));
  const [registrationDeadline, setRegistrationDeadline] = useState('2026-11-25T23:59');
  const [showAnnouncementMenus, setShowAnnouncementMenus] = useState(false);
  const [announcementTime, setAnnouncementTime] = useState('');
  const [file1, setFile1] = useState({ name: '', url: '' });
  const [file2, setFile2] = useState({ name: '', url: '' });
  const [file3, setFile3] = useState({ name: '', url: '' });
  const [waGroupAdminUrl, setWaGroupAdminUrl] = useState('');
  const [pantukhirTime, setPantukhirTime] = useState('');
  const [pantukhirFile, setPantukhirFile] = useState({ name: '', url: '' });
  const [waGroupPantukhirUrl, setWaGroupPantukhirUrl] = useState('');
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState({ file1: false, file2: false, file3: false });
  const [isUploadingPantukhirFile, setIsUploadingPantukhirFile] = useState(false);

  const toggleApprovedNameSort = () => {
    if (approvedNameSort === 'default') setApprovedNameSort('asc');
    else if (approvedNameSort === 'asc') setApprovedNameSort('desc');
    else setApprovedNameSort('default');
  };

  // BUKTY Leaderboard Engine (35% Status Yatim + 45% Beban UKT + 20% Tanggungan)
  const getLeaderboardData = (ignoreSearch = false) => {
    const baseList = onlyQualifiedLeaderboard
      ? registrations.filter((r) => checkBuktyEligibility(r).isQualified)
      : registrations;

    if (baseList.length === 0) return [];

    const scored = baseList.map((r) => ({
      ...r,
      ...calculateBuktyScores(r),
      eligibility: checkBuktyEligibility(r),
    }));

    const sorted = scored.sort((a, b) => {
      if (b.score_total !== a.score_total) return b.score_total - a.score_total;
      if (b.score_yatim !== a.score_yatim) return b.score_yatim - a.score_yatim;
      if (b.raw_ratio !== a.raw_ratio) return b.raw_ratio - a.raw_ratio;
      if (b.raw_ukt !== a.raw_ukt) return b.raw_ukt - a.raw_ukt;
      if (b.raw_tanggungan !== a.raw_tanggungan) return b.raw_tanggungan - a.raw_tanggungan;
      return a.id - b.id;
    });

    if (ignoreSearch) return sorted;

    const search = leaderboardSearchQuery.trim().toLowerCase();
    if (!search) return sorted;
    return sorted.filter(
      (x) =>
        (x.nama || '').toLowerCase().includes(search) ||
        (x.nim || '').toLowerCase().includes(search) ||
        (x.perguruan_tinggi || '').toLowerCase().includes(search) ||
        (x.provinsi || '').toLowerCase().includes(search) ||
        (x.reg_id || '').toLowerCase().includes(search)
    );
  };

  const getApprovedData = () => {
    let approved = registrations
      .filter((r) => r.status_seleksi === 'Lolos Administrasi' || r.status_seleksi === 'Diterima')
      .map((r) => ({ ...r, ...calculateBuktyScores(r) }));

    if (approvedNameSort === 'asc') {
      approved = [...approved].sort((a, b) => (a.nama || '').localeCompare(b.nama || ''));
    } else if (approvedNameSort === 'desc') {
      approved = [...approved].sort((a, b) => (b.nama || '').localeCompare(a.nama || ''));
    } else {
      approved = [...approved].sort((a, b) => b.score_total - a.score_total);
    }

    const search = approvedSearchQuery.trim().toLowerCase();
    if (!search) return approved;
    return approved.filter(
      (x) =>
        (x.nama || '').toLowerCase().includes(search) ||
        (x.nim || '').toLowerCase().includes(search) ||
        (x.perguruan_tinggi || '').toLowerCase().includes(search) ||
        (x.provinsi || '').toLowerCase().includes(search) ||
        (x.reg_id || '').toLowerCase().includes(search)
    );
  };

  const exportRowsToCSV = (dataset, filenamePrefix) => {
    if (dataset.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    const headers = [
      'No Registrasi', 'Waktu Submit', 'Nama Lengkap', 'NIK', 'TTL', 'Jenis Kelamin', 'Agama',
      'Provinsi', 'Alamat Domisili', 'Alamat KTP', 'No HP', 'Email', 'Instagram', 'Follow Sosmed',
      'Status Mahasiswa', 'Jenis PT', 'Perguruan Tinggi', 'Fakultas / Prodi', 'Jenjang', 'Semester', 'NIM',
      'IPK / Rapor', 'Tahun Kelulusan', 'Nominal UKT', 'Status UKT', 'Kendala UKT', 'Upaya UKT',
      'Pernah Beasiswa UKT', 'Detail Beasiswa Lama', 'Sedang Beasiswa Lain', 'Detail Beasiswa Lain',
      'Prestasi', 'Bank', 'No Rekening', 'Atas Nama Rekening',
      'Status Orang Tua (Yatim)', 'Nama Ortu/Wali', 'Pekerjaan Ortu', 'Penghasilan Ortu', 'Jumlah Tanggungan',
      'Kondisi Pekerjaan', 'Status Rumah', 'Kondisi Khusus',
      'Pengalaman Sosial', 'Bersedia Program Sosial DD', 'Bersedia Publikasi',
      'Skor Total BUKTY', 'Status Seleksi', 'Catatan Admin',
      'Verifikasi Dokumen Wawancara', 'Status Bayar UKT (Wawancara)',
      'Skor Ekonomi (1-4)', 'Skor Motivasi (1-4)', 'Skor Konsistensi Esai (1-4)', 'Skor Sikap & Kejujuran (1-4)',
      'Total Skor Tertimbang Wawancara', 'Rekomendasi Hasil Wawancara',
    ];

    const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const rows = dataset.map((r) => {
      const scores = calculateBuktyScores(r);
      const parsedInterview = parseInterviewJson(r.interview_json);
      const evalInterview = calculateInterviewEvaluation(parsedInterview);
      const verifSummary = evalInterview.isVerificationFailed
        ? `GUGUR (${evalInterview.failedItems.join(', ')})`
        : evalInterview.verifiedCount > 0
        ? `LOLOS (${evalInterview.passedCount}/${INTERVIEW_VERIFICATION_ITEMS.length})`
        : 'Belum Diverifikasi';

      return [
        escapeCsv(r.reg_id),
        escapeCsv(r.submitted_at),
        escapeCsv(r.nama),
        escapeCsv(r.nik),
        escapeCsv(r.ttl),
        escapeCsv(r.gender),
        escapeCsv(r.agama),
        escapeCsv(r.provinsi),
        escapeCsv(r.alamat_domisili),
        escapeCsv(r.alamat_ktp),
        escapeCsv(r.no_hp),
        escapeCsv(r.email),
        escapeCsv(r.instagram),
        escapeCsv(r.follow_sosmed),
        escapeCsv(r.status_mahasiswa),
        escapeCsv(r.jenis_pt || 'PTN'),
        escapeCsv(r.perguruan_tinggi),
        escapeCsv(r.fakultas_prodi),
        escapeCsv(r.jenjang),
        escapeCsv(r.semester),
        escapeCsv(r.nim),
        escapeCsv(r.ipk),
        escapeCsv(r.tahun_kelulusan),
        escapeCsv(r.nominal_ukt),
        escapeCsv(r.status_ukt),
        escapeCsv(r.kendala_ukt),
        escapeCsv(r.upaya_ukt),
        escapeCsv(r.pernah_beasiswa_ukt),
        escapeCsv(r.detail_beasiswa_ukt_lama),
        escapeCsv(r.sedang_beasiswa_lain),
        escapeCsv(r.detail_beasiswa_lain),
        escapeCsv(r.prestasi_text),
        escapeCsv(r.bank_rekening),
        escapeCsv(r.nomor_rekening),
        escapeCsv(r.atas_nama_rekening),
        escapeCsv(r.status_yatim),
        escapeCsv(r.nama_ortu),
        escapeCsv(r.pekerjaan_ortu),
        escapeCsv(r.penghasilan_ortu),
        escapeCsv(r.jumlah_tanggungan),
        escapeCsv(r.kondisi_pekerjaan),
        escapeCsv(r.status_rumah),
        escapeCsv(r.kondisi_khusus),
        escapeCsv(r.pengalaman_sosial),
        escapeCsv(r.bersedia_program_sosial),
        escapeCsv(r.bersedia_publikasi),
        escapeCsv(scores.score_total),
        escapeCsv(r.status_seleksi),
        escapeCsv(r.catatan_admin),
        escapeCsv(verifSummary),
        escapeCsv(parsedInterview.uktPaymentStatus || '-'),
        escapeCsv(parsedInterview.scores?.kondisi_ekonomi || ''),
        escapeCsv(parsedInterview.scores?.motivasi_studi || ''),
        escapeCsv(parsedInterview.scores?.konsistensi_esai || ''),
        escapeCsv(parsedInterview.scores?.sikap_komunikasi || ''),
        escapeCsv(evalInterview.scoredIndicatorsCount > 0 ? evalInterview.totalWeightedScore : ''),
        escapeCsv(evalInterview.isAssessed ? evalInterview.recommendation : 'Belum Diwawancara'),
      ];
    });

    const csvContent = '\uFEFF' + 'sep=;\n' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSyncGoogleSheets = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      alert(data.success ? data.message : `Gagal sinkronisasi: ${data.message}`);
    } catch (e) {
      alert(`Gagal menghubungi server: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateLeaderboardStatus = async (id, status, catatan, interviewPayload) => {
    setSavingStatus(true);
    const finalInterviewObj = {
      ...(interviewPayload || interviewForm),
      updatedAt: new Date().toISOString(),
    };
    const serializedInterview = JSON.stringify(finalInterviewObj);

    const updated = registrations.map((item) =>
      item.id === id
        ? {
            ...item,
            status_seleksi: status,
            catatan_admin: catatan,
            interview_json: serializedInterview,
          }
        : item
    );
    setRegistrations(updated);
    localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(updated));

    try {
      await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status_seleksi: status,
          catatan_admin: catatan,
          interview_json: serializedInterview,
        }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSelectRankItem = (item) => {
    setSelectedLeaderboardItem(item);
    setLeaderboardStatus(item.status_seleksi || 'Pending');
    setLeaderboardComment(item.catatan_admin || '');
    setInterviewForm(parseInterviewJson(item.interview_json));
    try {
      if (item?.id) localStorage.setItem(SELECTED_RANK_ID_STORAGE_KEY, String(item.id));
    } catch (e) {}

    try {
      if (item.uploaded_files_json) {
        const parsed = JSON.parse(item.uploaded_files_json);
        const keys = Object.keys(parsed);
        if (keys.length > 0) {
          setActiveDocKey(keys[0]);
          return;
        }
      }
    } catch (e) {}
    setActiveDocKey(null);
  };

  const handleOpenDocShortcut = (docKey) => {
    setActiveDocKey(docKey);
    setMiddlePanelMode('docs');
  };

  const handleSetVerificationItem = (key, value) => {
    setInterviewForm((prev) => ({
      ...prev,
      verifications: {
        ...prev.verifications,
        [key]: prev.verifications[key] === value ? null : value,
      },
    }));
  };

  const handleMarkAllVerificationPass = () => {
    const allPass = {};
    INTERVIEW_VERIFICATION_ITEMS.forEach((item) => {
      allPass[item.key] = 'pass';
    });
    setInterviewForm((prev) => ({
      ...prev,
      verifications: allPass,
    }));
  };

  const handleSetIndicatorScore = (key, scoreVal) => {
    setInterviewForm((prev) => ({
      ...prev,
      scores: {
        ...prev.scores,
        [key]: prev.scores[key] === scoreVal ? 0 : scoreVal,
      },
    }));
  };

  const handleResetInterviewForm = () => {
    if (!window.confirm('Reset seluruh isian verifikasi & nilai wawancara kandidat ini?')) return;
    setInterviewForm(createDefaultInterviewState());
  };

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      const data = getLeaderboardData();
      if (data.length > 0) {
        const stillExists = selectedLeaderboardItem && data.some((x) => x.id === selectedLeaderboardItem.id);
        if (!stillExists) {
          let targetCandidate = data[0];
          try {
            const savedId = localStorage.getItem(SELECTED_RANK_ID_STORAGE_KEY);
            if (savedId) {
              const foundSaved = data.find((x) => String(x.id) === String(savedId));
              if (foundSaved) targetCandidate = foundSaved;
            }
          } catch (e) {}
          handleSelectRankItem(targetCandidate);
        } else {
          const current = data.find((x) => x.id === selectedLeaderboardItem.id);
          setLeaderboardStatus(current.status_seleksi || 'Pending');
          setLeaderboardComment(current.catatan_admin || '');
          setInterviewForm(parseInterviewJson(current.interview_json));
        }
      } else {
        setSelectedLeaderboardItem(null);
        setActiveDocKey(null);
      }
    }
  }, [activeTab, registrations, onlyQualifiedLeaderboard]);

  const handleSaveCurrentInterview = async () => {
    if (!selectedLeaderboardItem) return;
    await handleUpdateLeaderboardStatus(
      selectedLeaderboardItem.id,
      leaderboardStatus,
      leaderboardComment,
      interviewForm
    );
  };

  const handleSaveAndNext = async () => {
    if (!selectedLeaderboardItem) return;
    await handleUpdateLeaderboardStatus(
      selectedLeaderboardItem.id,
      leaderboardStatus,
      leaderboardComment,
      interviewForm
    );

    const data = getLeaderboardData();
    const currentIndex = data.findIndex((x) => x.id === selectedLeaderboardItem.id);
    if (currentIndex !== -1 && currentIndex < data.length - 1) {
      handleSelectRankItem(data[currentIndex + 1]);
    } else {
      alert('Selesai! Ini adalah kandidat terakhir di Leaderboard.');
    }
  };

  const fetchRegistrations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/registrations');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          setRegistrations(json.data);
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {}

    const localSaved = localStorage.getItem(LOCAL_SUBMISSIONS_KEY);
    if (localSaved) {
      try {
        setRegistrations(JSON.parse(localSaved));
      } catch (e) {
        setRegistrations([]);
      }
    } else {
      setRegistrations([]);
    }
    setIsLoading(false);
  };

  const fetchAnnouncementConfig = async () => {
    try {
      const res = await fetch('/api/admin/announcement');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          const loadedTimeline = normalizeTimelineEvents(d.timeline_json);
          setTimelineEvents(loadedTimeline);
          setRegistrationDeadline(
            toDatetimeLocalValue(d.registration_deadline || loadedTimeline[0]?.endIso || '2026-11-25T23:59')
          );
          setShowAnnouncementMenus(Boolean(Number(d.show_announcement_menus)));
          setAnnouncementTime(d.publish_time || '');
          setFile1({ name: d.file1_name || '', url: d.file1_url || '' });
          setFile2({ name: d.file2_name || '', url: d.file2_url || '' });
          setFile3({ name: d.file3_name || '', url: d.file3_url || '' });
          setWaGroupAdminUrl(d.wa_group_admin_url || '');
          setPantukhirTime(d.pantukhir_publish_time || '');
          setPantukhirFile({ name: d.pantukhir_file_name || '', url: d.pantukhir_file_url || '' });
          setWaGroupPantukhirUrl(d.wa_group_pantukhir_url || '');
        }
      }
    } catch (e) {
      console.error('Failed to load announcement config:', e);
    }
  };

  const handleTimelineFieldChange = (index, field, value) => {
    setTimelineEvents((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const next = { ...item, [field]: value };
        if (field === 'startDate' || field === 'endDate') {
          const startDate = next.startDate || item.startDate;
          let endDate = next.endDate || startDate;
          if (field === 'startDate' && endDate < startDate) {
            endDate = startDate;
          } else if (field === 'endDate' && endDate < startDate) {
            endDate = startDate;
          }
          next.startDate = startDate;
          next.endDate = endDate;
          next.startIso = `${startDate}T00:00:00+07:00`;
          next.endIso = `${endDate}T23:59:59+07:00`;
          next.date = formatShortDateRangeId(startDate, endDate) || item.date;

          // Keep registration deadline date in sync when Stage 1 end date changes
          if (index === 0 && (field === 'endDate' || (field === 'startDate' && endDate === startDate))) {
            const currentTimePart = (registrationDeadline || '2026-11-25T23:59').split('T')[1] || '23:59';
            setRegistrationDeadline(`${endDate}T${currentTimePart}`);
          }
        }
        return next;
      })
    );
  };

  const handleResetTimelineDefaults = () => {
    if (!window.confirm('Kembalikan seluruh 7 tahapan timeline & batas pendaftaran ke jadwal default?')) return;
    setTimelineEvents(SCHEDULE_EVENTS.map((item) => ({ ...item })));
    setRegistrationDeadline('2026-11-25T23:59');
  };

  const handleSaveAnnouncementConfig = async () => {
    setIsSavingAnnouncement(true);
    try {
      const normalizedTimeline = normalizeTimelineEvents(timelineEvents);
      const res = await fetch('/api/admin/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publish_time: announcementTime,
          file1_name: file1.name,
          file1_url: file1.url,
          file2_name: file2.name,
          file2_url: file2.url,
          file3_name: file3.name,
          file3_url: file3.url,
          wa_group_admin_url: waGroupAdminUrl,
          pantukhir_publish_time: pantukhirTime,
          pantukhir_file_name: pantukhirFile.name,
          pantukhir_file_url: pantukhirFile.url,
          wa_group_pantukhir_url: waGroupPantukhirUrl,
          timeline_json: JSON.stringify(normalizedTimeline),
          registration_deadline: toWibIso(registrationDeadline),
          show_announcement_menus: showAnnouncementMenus ? 1 : 0,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setTimelineEvents(normalizedTimeline);
      }
      alert(
        json.success
          ? 'Pengaturan jadwal timeline & pengumuman BUKTY berhasil disimpan! Landing page otomatis diperbarui.'
          : `Gagal menyimpan: ${json.message}`
      );
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSavingAnnouncement(false);
    }
  };

  const handleAnnouncementFileUpload = async (fileKey, file) => {
    if (fileKey === 'pantukhir') setIsUploadingPantukhirFile(true);
    else setIsUploadingFile((prev) => ({ ...prev, [fileKey]: true }));

    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.success) {
        const fileData = { name: file.name, url: json.fileUrl };
        if (fileKey === 'file1') setFile1(fileData);
        if (fileKey === 'file2') setFile2(fileData);
        if (fileKey === 'file3') setFile3(fileData);
        if (fileKey === 'pantukhir') setPantukhirFile(fileData);
        alert('Berkas PDF berhasil diunggah. Klik "Simpan Pengaturan Pengumuman" untuk menyimpan.');
      } else {
        alert(`Gagal unggah berkas: ${json.message}`);
      }
    } catch (err) {
      alert(`Error unggah: ${err.message}`);
    } finally {
      if (fileKey === 'pantukhir') setIsUploadingPantukhirFile(false);
      else setIsUploadingFile((prev) => ({ ...prev, [fileKey]: false }));
    }
  };

  const handleDeleteAnnouncementFile = async (fileKey, fileLabel) => {
    const fileMap = {
      file1,
      file2,
      file3,
      pantukhir: pantukhirFile,
    };
    const currentFile = fileMap[fileKey];
    if (!currentFile?.name) return;

    if (!window.confirm(`Hapus "${currentFile.name}" dari ${fileLabel}?`)) return;

    if (fileKey === 'pantukhir') setIsUploadingPantukhirFile(true);
    else setIsUploadingFile((prev) => ({ ...prev, [fileKey]: true }));

    try {
      const res = await fetch('/api/admin/announcement', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileKey, fileUrl: currentFile.url }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(`Gagal menghapus dokumen: ${json.message || 'Terjadi kesalahan'}`);
        return;
      }

      if (fileKey === 'file1') setFile1({ name: '', url: '' });
      if (fileKey === 'file2') setFile2({ name: '', url: '' });
      if (fileKey === 'file3') setFile3({ name: '', url: '' });
      if (fileKey === 'pantukhir') setPantukhirFile({ name: '', url: '' });

      const inputEl = document.getElementById(`upload-ann-${fileKey}`);
      if (inputEl) inputEl.value = '';
    } catch (err) {
      alert(`Error hapus dokumen: ${err.message}`);
    } finally {
      if (fileKey === 'pantukhir') setIsUploadingPantukhirFile(false);
      else setIsUploadingFile((prev) => ({ ...prev, [fileKey]: false }));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations();
      fetchAnnouncementConfig();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      if (res.ok) {
        const json = await res.json();
        setIsAuthenticated(true);
        setLoginError('');
        localStorage.setItem(SESSION_KEY, JSON.stringify({ token: json.token, timestamp: Date.now() }));
        return;
      }
      setLoginError('Kata sandi admin salah. Silakan coba kembali.');
    } catch (err) {
      setLoginError('Gagal terhubung ke server autentikasi. Silakan coba lagi.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(SESSION_KEY);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const updated = registrations.map((item) =>
      item.id === id ? { ...item, status_seleksi: newStatus } : item
    );
    setRegistrations(updated);
    localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(updated));

    if (selectedItem && selectedItem.id === id) {
      setSelectedItem({ ...selectedItem, status_seleksi: newStatus });
    }

    try {
      await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status_seleksi: newStatus }),
      });
    } catch (e) {}
  };

  const handleToggleSelectAll = (dataset) => {
    const allIds = dataset.map((r) => r.id);
    const isAllSelected = allIds.every((id) => selectedIds.includes(id));
    if (isAllSelected) {
      setSelectedIds(selectedIds.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedIds(Array.from(new Set([...selectedIds, ...allIds])));
    }
  };

  const handleToggleSelectRow = (id) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter((i) => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const handleExecuteDelete = async () => {
    if (deleteConfirmModal.targetIds.length === 0) return;
    setIsDeleting(true);

    try {
      await fetch('/api/admin/registrations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: deleteConfirmModal.targetIds }),
      });
    } catch (e) {}

    const remaining = registrations.filter((r) => !deleteConfirmModal.targetIds.includes(r.id));
    setRegistrations(remaining);
    localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(remaining));
    setSelectedIds(selectedIds.filter((id) => !deleteConfirmModal.targetIds.includes(id)));
    setIsDeleting(false);
    setDeleteConfirmModal({ isOpen: false, targetIds: [] });
  };

  // Filtered registrations for Tab 1
  const filteredData = registrations.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (r.nama || '').toLowerCase().includes(q) ||
      (r.perguruan_tinggi || '').toLowerCase().includes(q) ||
      (r.nim || '').toLowerCase().includes(q) ||
      (r.provinsi || '').toLowerCase().includes(q) ||
      (r.reg_id || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'Semua' || r.status_seleksi === statusFilter;
    const matchesYatim = yatimFilter === 'Semua' || (r.status_yatim || '') === yatimFilter;
    const matchesProv = provinsiFilter === 'Semua' || (r.provinsi || '') === provinsiFilter;
    return matchesSearch && matchesStatus && matchesYatim && matchesProv;
  });

  // Metrics
  const totalPendaftar = registrations.length;
  const yatimCount = registrations.filter((r) =>
    ['yatim', 'yatim piatu'].includes((r.status_yatim || '').toLowerCase())
  ).length;
  const lolosCount = registrations.filter(
    (r) => r.status_seleksi === 'Lolos Administrasi' || r.status_seleksi === 'Diterima'
  ).length;
  const pendingCount = registrations.filter((r) => !r.status_seleksi || r.status_seleksi === 'Pending').length;
  const totalNominal = registrations.reduce((acc, curr) => {
    const val = parseInt((curr.nominal_ukt || '0').replace(/\D/g, ''), 10) || 0;
    return acc + val;
  }, 0);

  // LOGIN PAGE
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FFFDF5] flex flex-col items-center justify-center p-4 selection:bg-[#FFD60A] selection:text-[#111827]">
        <div className="bg-white border-[3px] border-[#111827] w-full max-w-sm rounded-3xl shadow-[8px_8px_0px_#111827] p-6 sm:p-8 space-y-5 text-[#111827] relative">
          <button
            onClick={onLeaveAdmin}
            className="absolute top-4 left-4 flex items-center gap-1 text-[11px] font-extrabold text-gray-500 hover:text-[#1D4ED8] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </button>

          <div className="text-center space-y-2 pt-4">
            <div className="w-12 h-12 bg-[#FFD60A] text-[#111827] border-2 border-[#111827] rounded-2xl mx-auto flex items-center justify-center shadow-[3px_3px_0px_#111827]">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black font-heading text-[#111827]">Akses Admin BUKTY</h3>
            <p className="text-[11px] font-bold text-gray-500">Panel Seleksi Bantuan UKT Yatim 2026</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="form-label text-xs">Kata Sandi Admin</label>
              <input
                type="password"
                placeholder="Masukkan kata sandi..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="form-input text-xs font-bold"
                autoFocus
              />
            </div>

            {loginError && (
              <div className="p-2.5 bg-red-50 border-2 border-red-600 rounded-xl text-xs font-bold text-red-700 text-center">
                {loginError}
              </div>
            )}

            <button type="submit" className="btn-primary w-full py-2.5 text-xs">
              <span>Masuk Dashboard BUKTY</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // AUTHENTICATED FULL-PAGE ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#111827] flex flex-col selection:bg-[#FFD60A] selection:text-[#111827]">
      {/* Sticky Admin Header */}
      <header className="bg-white border-b-[3px] border-[#111827] sticky top-0 z-30">
        <div
          className={`${
            activeTab === 'leaderboard' ? 'max-w-[1920px]' : 'max-w-7xl'
          } mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 transition-all`}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <img src="/logo-ge.png" alt="GREAT Edunesia" className="h-6 object-contain" />
              <img src="/Logo%20DD.png" alt="Dompet Dhuafa" className="h-6 object-contain" />
            </div>
            <span className="px-2 py-0.5 bg-[#FFD60A] border-2 border-[#111827] rounded-lg text-[10px] font-black">
              ADMIN BUKTY
            </span>

            {/* 4 Tab Selector */}
            <div className="flex bg-[#EFF6FF] p-1 border-2 border-[#111827] rounded-xl gap-1">
              {[
                { key: 'list', label: 'Pendaftar' },
                { key: 'leaderboard', label: 'Leaderboard' },
                { key: 'approved', label: 'Lolos Seleksi' },
                { key: 'announcement', label: 'Jadwal & Pengumuman' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`px-3 py-1 text-[11px] font-black rounded-lg transition-all cursor-pointer ${
                    activeTab === t.key
                      ? 'bg-[#1D4ED8] text-white border border-[#111827] shadow-[1.5px_1.5px_0px_#111827]'
                      : 'text-gray-600 hover:text-[#111827]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleLogout} className="btn-secondary px-3.5 py-2 text-xs">
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
            <button onClick={onLeaveAdmin} className="btn-yellow px-3.5 py-2 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </button>
          </div>
        </div>
      </header>

      <main
        className={`flex-grow ${
          activeTab === 'leaderboard'
            ? 'w-full max-w-none px-4 sm:px-6 lg:px-8 py-3'
            : 'max-w-7xl mx-auto px-4 sm:px-6 py-5'
        } w-full space-y-6 transition-all`}
      >
        {/* TAB 1: PENDAFTAR */}
        {activeTab === 'list' && (
          <>
            {/* 5 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white border-2 border-[#111827] p-4 rounded-2xl shadow-[4px_4px_0px_#111827] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-gray-500 uppercase">Total Pendaftar</p>
                  <h3 className="text-2xl font-black text-[#111827] font-heading mt-0.5">{totalPendaftar}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#DBEAFE] text-[#1D4ED8] border-2 border-[#111827] flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border-2 border-[#111827] p-4 rounded-2xl shadow-[4px_4px_0px_#111827] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-gray-500 uppercase">Yatim / Yatim Piatu</p>
                  <h3 className="text-2xl font-black text-[#1D4ED8] font-heading mt-0.5">{yatimCount}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#FFD60A] text-[#111827] border-2 border-[#111827] flex items-center justify-center">
                  <HeartHandshake className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border-2 border-[#111827] p-4 rounded-2xl shadow-[4px_4px_0px_#111827] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-gray-500 uppercase">Total UKT / Smt</p>
                  <h3 className="text-lg font-black text-[#15803D] font-heading mt-0.5">
                    Rp {(totalNominal / 1000000).toFixed(1)} Jt
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803D] border-2 border-[#111827] flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border-2 border-[#111827] p-4 rounded-2xl shadow-[4px_4px_0px_#111827] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-gray-500 uppercase">Lolos / Diterima</p>
                  <h3 className="text-2xl font-black text-[#15803D] font-heading mt-0.5">{lolosCount}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#15803D] border-2 border-[#111827] flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border-2 border-[#111827] p-4 rounded-2xl shadow-[4px_4px_0px_#111827] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold text-gray-500 uppercase">Pending Review</p>
                  <h3 className="text-2xl font-black text-amber-600 font-heading mt-0.5">{pendingCount}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#FEF9C3] text-amber-700 border-2 border-[#111827] flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Filter & Action Bar */}
            <div className="bg-white border-2 border-[#111827] p-4 rounded-2xl shadow-[4px_4px_0px_#111827] flex flex-col lg:flex-row gap-3 items-center justify-between">
              <div className="relative w-full lg:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari Nama / NIM / PTN / Provinsi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pl-9 pr-3 py-2 text-xs font-bold"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
                <div className="flex items-center gap-1.5 bg-[#EFF6FF] border-2 border-[#111827] px-2.5 py-1.5 rounded-xl text-xs font-bold">
                  <Filter className="w-3.5 h-3.5 text-[#1D4ED8]" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent font-bold outline-none cursor-pointer"
                  >
                    <option value="Semua">Semua Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Lolos Administrasi">Lolos Administrasi</option>
                    <option value="Tidak Lolos">Tidak Lolos</option>
                    <option value="Diterima">Diterima</option>
                  </select>
                </div>

                <select
                  value={yatimFilter}
                  onChange={(e) => setYatimFilter(e.target.value)}
                  className="bg-[#FEF9C3] border-2 border-[#111827] px-2.5 py-1.5 rounded-xl text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="Semua">Semua Status Ortu</option>
                  {STATUS_YATIM_LIST.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <select
                  value={provinsiFilter}
                  onChange={(e) => setProvinsiFilter(e.target.value)}
                  className="bg-white border-2 border-[#111827] px-2.5 py-1.5 rounded-xl text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="Semua">Semua Provinsi</option>
                  {TARGET_PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>

                <button
                  onClick={fetchRegistrations}
                  className="p-2 bg-white border-2 border-[#111827] rounded-xl hover:bg-[#EFF6FF] cursor-pointer"
                  title="Refresh Data"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>

                {selectedIds.length > 0 && (
                  <button
                    onClick={() => setDeleteConfirmModal({ isOpen: true, targetIds: selectedIds })}
                    className="bg-red-600 text-white border-2 border-[#111827] px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#111827] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus ({selectedIds.length})</span>
                  </button>
                )}

                <button
                  onClick={() => exportRowsToCSV(filteredData, 'Pendaftar_BUKTY')}
                  className="btn-yellow py-2 px-4 text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ekspor CSV</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border-[3px] border-[#111827] rounded-2xl overflow-x-auto shadow-[6px_6px_0px_#111827]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EFF6FF] text-[#111827] font-black uppercase border-b-2 border-[#111827] text-[10px]">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={filteredData.length > 0 && filteredData.every((r) => selectedIds.includes(r.id))}
                        onChange={() => handleToggleSelectAll(filteredData)}
                        className="form-checkbox cursor-pointer"
                      />
                    </th>
                    <th className="p-3.5">No. Reg / Syarat</th>
                    <th className="p-3.5">Mahasiswa & Status Ortu</th>
                    <th className="p-3.5">Kampus & Wilayah</th>
                    <th className="p-3.5">IPK</th>
                    <th className="p-3.5">UKT / Ortu</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-semibold text-[#111827]">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-8 text-center text-gray-500 font-bold">
                        Belum ada data pendaftar yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => {
                      const isSelected = selectedIds.includes(item.id);
                      const elig = checkBuktyEligibility(item);
                      return (
                        <tr key={item.id} className={`transition-colors ${isSelected ? 'bg-[#EFF6FF]' : 'hover:bg-[#FFFDF5]'}`}>
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectRow(item.id)}
                              className="form-checkbox cursor-pointer"
                            />
                          </td>
                          <td className="p-3.5">
                            <div className="font-mono-code font-black text-[#1D4ED8] text-xs">{item.reg_id}</div>
                            <div className="mt-1">
                              {elig.isQualified ? (
                                <span className="px-2 py-0.5 rounded bg-[#DCFCE7] text-[#15803D] border border-[#15803D] text-[9px] font-black">
                                  MS BUKTY
                                </span>
                              ) : (
                                <span
                                  title={elig.flags.join(', ')}
                                  className="px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-400 text-[9px] font-black cursor-help"
                                >
                                  TMS ({elig.flags.length})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-black uppercase">{item.nama}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="px-1.5 py-0.5 rounded bg-[#FEF9C3] border border-[#111827] text-[9px] font-black">
                                {item.status_yatim || '-'}
                              </span>
                              <span className="text-[10px] text-gray-500 font-mono-code">{item.nik}</span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold">
                              {item.perguruan_tinggi}{' '}
                              <span className="text-[10px] text-[#1D4ED8] font-black">({item.jenis_pt || 'PTN'})</span>
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {item.provinsi || '-'} • {item.jenjang}-Sem {item.semester}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-black text-[#1D4ED8] bg-[#DBEAFE] px-2 py-0.5 rounded border border-[#1D4ED8]">
                              {item.ipk}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-black text-[#15803D]">Rp {item.nominal_ukt}</div>
                            <div className="text-[10px] text-gray-500">Ortu: Rp {item.penghasilan_ortu}/bln</div>
                          </td>
                          <td className="p-3.5">
                            <select
                              value={item.status_seleksi || 'Pending'}
                              onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                              className={`px-2 py-1 rounded-lg font-extrabold text-[11px] outline-none cursor-pointer border-2 ${
                                item.status_seleksi === 'Lolos Administrasi'
                                  ? 'bg-[#DCFCE7] text-[#15803D] border-[#15803D]'
                                  : item.status_seleksi === 'Diterima'
                                  ? 'bg-[#DBEAFE] text-[#1D4ED8] border-[#1D4ED8]'
                                  : item.status_seleksi === 'Tidak Lolos'
                                  ? 'bg-red-100 text-red-700 border-red-600'
                                  : 'bg-[#FEF9C3] text-amber-800 border-amber-500'
                              }`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Lolos Administrasi">Lolos Administrasi</option>
                              <option value="Tidak Lolos">Tidak Lolos</option>
                              <option value="Diterima">Diterima</option>
                            </select>
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedItem(item)}
                                className="p-1.5 bg-white border-2 border-[#111827] hover:bg-[#FFD60A] rounded-lg transition-colors cursor-pointer"
                                title="Lihat Detail"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmModal({ isOpen: true, targetIds: [item.id] })}
                                className="p-1.5 bg-white border-2 border-[#111827] hover:bg-red-600 hover:text-white rounded-lg transition-colors text-red-600 cursor-pointer"
                                title="Hapus Data"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* TAB 2: LEADERBOARD COCKPIT — LOW-SCROLL FAST VERIFIER & INTERVIEW RUBRIC */}
        {activeTab === 'leaderboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_minmax(0,1.35fr)] xl:grid-cols-[310px_minmax(0,1fr)_minmax(0,1.4fr)] gap-4 items-stretch">
            {/* COLUMN 1 (LEFT): Ranking List */}
            <div className="min-w-0">
              <div className="bg-white border-[3px] border-[#111827] p-3 rounded-3xl shadow-[4px_4px_0px_#111827] flex flex-col lg:h-[calc(100vh-88px)]">
                <div className="flex items-center justify-between mb-2 gap-2 flex-wrap shrink-0">
                  <h4 className="font-black text-xs sm:text-sm flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-[#1D4ED8]" />
                    <span>Leaderboard ({getLeaderboardData().length})</span>
                  </h4>

                  <button
                    onClick={handleSyncGoogleSheets}
                    disabled={isSyncing}
                    className="px-2 py-1 text-[10px] font-black bg-[#FFD60A] text-[#111827] border-2 border-[#111827] rounded-xl shadow-[2px_2px_0px_#111827] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Sync...' : 'Sync Sheets'}</span>
                  </button>
                </div>

                {/* Toggle Qualified Filter */}
                <label className="flex items-center gap-2 mb-2 bg-[#EFF6FF] border border-[#111827] px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={onlyQualifiedLeaderboard}
                    onChange={(e) => setOnlyQualifiedLeaderboard(e.target.checked)}
                    className="accent-[#1D4ED8]"
                  />
                  <span>Filter Ketat BUKTY (MS Syarat Utama)</span>
                </label>

                <div className="relative mb-2 shrink-0">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama / kampus / reg..."
                    value={leaderboardSearchQuery}
                    onChange={(e) => setLeaderboardSearchQuery(e.target.value)}
                    className="form-input pl-8 pr-3 py-1 text-xs font-bold"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 max-h-[520px] lg:max-h-none">
                  {getLeaderboardData().length === 0 ? (
                    <div className="p-8 text-center text-gray-500 font-bold text-xs">
                      Belum ada pendaftar pada filter leaderboard ini.
                    </div>
                  ) : (
                    getLeaderboardData().map((item, index) => {
                      const isSelected = selectedLeaderboardItem && selectedLeaderboardItem.id === item.id;
                      let badgeStyle = 'bg-[#FEF9C3] text-amber-800 border-amber-400';
                      let badgeText = 'Pending';
                      if (item.status_seleksi === 'Lolos Administrasi') {
                        badgeStyle = 'bg-[#DCFCE7] text-[#15803D] border-[#15803D]';
                        badgeText = 'Lolos';
                      } else if (item.status_seleksi === 'Diterima') {
                        badgeStyle = 'bg-[#DBEAFE] text-[#1D4ED8] border-[#1D4ED8]';
                        badgeText = 'Diterima';
                      } else if (item.status_seleksi === 'Tidak Lolos') {
                        badgeStyle = 'bg-red-100 text-red-700 border-red-400';
                        badgeText = 'Gugur';
                      }

                      const itemInterviewEval = calculateInterviewEvaluation(item.interview_json);
                      let interviewPillStyle = 'bg-gray-100 text-gray-600 border-gray-300';
                      if (itemInterviewEval.recommendationColor === 'green') {
                        interviewPillStyle = 'bg-[#DCFCE7] text-[#15803D] border-[#15803D]';
                      } else if (itemInterviewEval.recommendationColor === 'amber') {
                        interviewPillStyle = 'bg-[#FEF9C3] text-amber-800 border-amber-500';
                      } else if (itemInterviewEval.recommendationColor === 'red') {
                        interviewPillStyle = 'bg-red-100 text-red-700 border-red-500';
                      }

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectRankItem(item)}
                          className={`p-2 rounded-2xl border-2 cursor-pointer transition-all shadow-[2px_2px_0px_#111827] ${
                            isSelected ? 'bg-[#EFF6FF] border-[#1D4ED8]' : 'bg-white border-[#111827]/40 hover:bg-[#FFFDF5]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-lg bg-[#FFD60A] text-[#111827] font-mono-code font-black border-2 border-[#111827] flex items-center justify-center text-[10px] shrink-0">
                                {index + 1}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-black text-[11px] uppercase truncate">{item.nama}</h4>
                                <p className="text-[9px] text-gray-500 font-bold truncate">
                                  {item.perguruan_tinggi} • {item.provinsi}
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="text-[11px] font-black font-mono-code text-[#111827]" title="Skor Prioritas BUKTY">
                                {item.score_total}
                              </div>
                              <span className={`inline-block px-1.5 py-0.5 rounded border text-[8px] font-black ${badgeStyle}`}>
                                {badgeText}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-1 mt-1 pt-1 border-t border-gray-200/70">
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="text-[8px] font-black text-[#1D4ED8] font-mono-code">{item.reg_id}</span>
                              <span className="text-[8px] font-black px-1 bg-[#FEF9C3] border border-[#111827] rounded truncate">
                                {item.status_yatim}
                              </span>
                            </div>
                            {itemInterviewEval.isAssessed && (
                              <span
                                className={`text-[8px] font-black px-1.5 py-0.5 rounded border font-mono-code shrink-0 ${interviewPillStyle}`}
                                title={itemInterviewEval.recommendationDesc}
                              >
                                WWC: {itemInterviewEval.totalWeightedScore} •{' '}
                                {itemInterviewEval.recommendation === 'DIREKOMENDASIKAN'
                                  ? 'REKOM'
                                  : itemInterviewEval.recommendation === 'CADANGAN'
                                  ? 'CADANGAN'
                                  : itemInterviewEval.recommendation === 'TIDAK DIREKOMENDASIKAN'
                                  ? 'TDK REKOM'
                                  : 'PROSES'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* COLUMN 2 (MIDDLE): Candidate Detail & Inline Document Viewer Combined */}
            <div className="min-w-0">
              {selectedLeaderboardItem ? (
                (() => {
                  let uploadedFiles = {};
                  try {
                    if (selectedLeaderboardItem.uploaded_files_json) {
                      uploadedFiles = JSON.parse(selectedLeaderboardItem.uploaded_files_json);
                    }
                  } catch (e) {}

                  const fileKeys = Object.keys(uploadedFiles).sort((a, b) => {
                    const idxA = DOC_ORDER.indexOf(a);
                    const idxB = DOC_ORDER.indexOf(b);
                    if (idxA === -1 && idxB === -1) return a.localeCompare(b);
                    if (idxA === -1) return 1;
                    if (idxB === -1) return -1;
                    return idxA - idxB;
                  });

                  const fileObj = activeDocKey ? uploadedFiles[activeDocKey] : null;
                  const fileUrl = fileObj
                    ? fileObj.fileUrl || (fileObj.fileName ? `/api/files/${fileObj.fileName}` : null)
                    : null;
                  const isImage = fileObj?.name && /\.(jpe?g|png|webp|gif)$/i.test(fileObj.name);

                  return (
                    <div className="bg-white border-[3px] border-[#111827] rounded-3xl shadow-[4px_4px_0px_#111827] overflow-hidden flex flex-col lg:h-[calc(100vh-88px)]">
                      {/* Candidate Identity Header */}
                      <div className="bg-[#1D4ED8] text-white border-b-2 border-[#111827] px-3.5 py-2.5 shrink-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-[#FFD60A] font-mono-code text-[11px]">
                                {selectedLeaderboardItem.reg_id}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-[#FFD60A] text-[#111827] text-[9px] font-black">
                                {selectedLeaderboardItem.status_yatim || '-'}
                              </span>
                            </div>
                            <h3 className="font-black text-sm uppercase mt-0.5 truncate">
                              {selectedLeaderboardItem.nama}
                            </h3>
                            <p className="text-[10px] font-bold text-blue-100 truncate">
                              {selectedLeaderboardItem.perguruan_tinggi} ({selectedLeaderboardItem.jenis_pt || 'PTN'}) •{' '}
                              {selectedLeaderboardItem.provinsi}
                            </p>
                          </div>

                          {/* Compact Mode Switcher: Data Detail vs Pratinjau Berkas */}
                          <div className="flex bg-[#1E3A8A] p-1 rounded-xl border border-[#111827] shrink-0 gap-1">
                            <button
                              type="button"
                              onClick={() => setMiddlePanelMode('detail')}
                              className={`py-1.5 px-2.5 rounded-lg font-black text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-all ${
                                middlePanelMode === 'detail'
                                  ? 'bg-[#FFD60A] text-[#111827] shadow-[1px_1px_0px_#111827]'
                                  : 'text-blue-100 hover:text-white'
                              }`}
                            >
                              <Eye className="w-3 h-3" />
                              <span>Detail</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setMiddlePanelMode('docs')}
                              className={`py-1.5 px-2.5 rounded-lg font-black text-[10px] uppercase flex items-center gap-1 cursor-pointer transition-all ${
                                middlePanelMode === 'docs'
                                  ? 'bg-[#FFD60A] text-[#111827] shadow-[1px_1px_0px_#111827]'
                                  : 'text-blue-100 hover:text-white'
                              }`}
                            >
                              <FileText className="w-3 h-3" />
                              <span>Berkas ({fileKeys.length})</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Quick Document Selector Strip (Always accessible in Middle Column) */}
                      <div className="bg-[#FFFDF5] border-b-2 border-[#111827] px-3 py-1.5 shrink-0">
                        <div className="flex flex-wrap gap-1 items-center">
                          <span className="text-[9px] font-black uppercase text-gray-500 mr-1">Berkas:</span>
                          {fileKeys.length === 0 ? (
                            <span className="text-[10px] text-gray-400 font-bold">Tidak ada berkas diunggah.</span>
                          ) : (
                            fileKeys.map((k) => (
                              <button
                                key={k}
                                type="button"
                                onClick={() => {
                                  setActiveDocKey(k);
                                  setMiddlePanelMode('docs');
                                }}
                                className={`px-1.5 py-0.5 border border-[#111827] rounded-md font-black text-[9px] uppercase cursor-pointer transition-colors ${
                                  middlePanelMode === 'docs' && activeDocKey === k
                                    ? 'bg-[#1D4ED8] text-white'
                                    : 'bg-white hover:bg-[#FEF9C3] text-[#111827]'
                                }`}
                              >
                                {DOC_LABELS[k] || k}
                              </button>
                            ))
                          )}
                        </div>
                      </div>

                      {/* MODE A: CANDIDATE DATA DETAIL */}
                      {middlePanelMode === 'detail' ? (
                        <div className="p-3 overflow-y-auto space-y-2.5 flex-grow text-xs">
                          {/* Eligibility Flags Warning if TMS */}
                          {!selectedLeaderboardItem.eligibility.isQualified && (
                            <div className="bg-red-50 border-2 border-red-500 p-2 rounded-xl text-[10px] font-bold text-red-700">
                              <strong>Catatan Auto-Screening (TMS):</strong>{' '}
                              {selectedLeaderboardItem.eligibility.flags.join(' • ')}
                            </div>
                          )}

                          {/* Compact BUKTY Score Pill Bar */}
                          <div className="bg-[#EFF6FF] p-2.5 rounded-2xl border-2 border-[#111827] text-[10px]">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-black text-[#1D4ED8] uppercase">
                                Skor Prioritas BUKTY (35/45/20)
                              </span>
                              <span className="font-mono-code font-black text-xs text-[#1D4ED8]">
                                Total: {selectedLeaderboardItem.score_total} / 100
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 text-center font-bold">
                              <div className="bg-white border border-[#111827]/20 rounded-lg py-1 px-1.5">
                                <span className="text-[9px] text-gray-500 block">Yatim (35%)</span>
                                <span className="font-mono-code font-black">
                                  {(selectedLeaderboardItem.score_yatim * 0.35).toFixed(1)}
                                </span>
                              </div>
                              <div className="bg-white border border-[#111827]/20 rounded-lg py-1 px-1.5">
                                <span className="text-[9px] text-gray-500 block">Rasio UKT (45%)</span>
                                <span className="font-mono-code font-black">
                                  {(selectedLeaderboardItem.score_ratio * 0.45).toFixed(1)}
                                </span>
                              </div>
                              <div className="bg-white border border-[#111827]/20 rounded-lg py-1 px-1.5">
                                <span className="text-[9px] text-gray-500 block">Tanggungan (20%)</span>
                                <span className="font-mono-code font-black">
                                  {(selectedLeaderboardItem.score_tanggungan * 0.2).toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Key Academic & Economy Stats (4-Grid Compact) */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#FFFDF5] p-2.5 rounded-2xl border border-[#111827]/30 font-bold text-[11px]">
                            <div>
                              <span className="text-[9px] text-gray-500 block">IPK / Rapor</span>
                              <strong className="text-[#1D4ED8]">{selectedLeaderboardItem.ipk}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-gray-500 block">Nominal UKT</span>
                              <strong className="text-[#15803D]">Rp {selectedLeaderboardItem.nominal_ukt}</strong>
                              <span className="block text-[9px] text-gray-500">
                                ({selectedLeaderboardItem.status_ukt || '-'})
                              </span>
                            </div>
                            <div>
                              <span className="text-[9px] text-gray-500 block">Penghasilan Ortu</span>
                              <strong>Rp {selectedLeaderboardItem.penghasilan_ortu}</strong>
                            </div>
                            <div>
                              <span className="text-[9px] text-gray-500 block">Tanggungan / Rumah</span>
                              <strong>
                                {selectedLeaderboardItem.jumlah_tanggungan} / {selectedLeaderboardItem.status_rumah}
                              </strong>
                            </div>
                          </div>

                          {/* Bio & Sosial in 2-Column Compact Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 font-bold text-[11px] bg-white p-2.5 rounded-2xl border border-gray-200">
                            <div>
                              <span className="text-gray-500 text-[10px] block">NIK / TTL:</span>
                              <span>
                                {selectedLeaderboardItem.nik} • {selectedLeaderboardItem.ttl}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 text-[10px] block">Gender / Agama:</span>
                              <span>
                                {selectedLeaderboardItem.gender} •{' '}
                                <span className="px-1.5 py-0.5 bg-[#DCFCE7] text-[#15803D] rounded text-[10px] font-black">
                                  {selectedLeaderboardItem.agama}
                                </span>
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 text-[10px] block">Kampus / NIM:</span>
                              <span>
                                {selectedLeaderboardItem.perguruan_tinggi} ({selectedLeaderboardItem.nim || '-'})
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 text-[10px] block">Prodi / Jenjang:</span>
                              <span>
                                {selectedLeaderboardItem.fakultas_prodi} (
                                <strong className="text-[#1D4ED8]">{selectedLeaderboardItem.jenjang}</strong> - Sem{' '}
                                {selectedLeaderboardItem.semester})
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 text-[10px] block">No. WA / Email:</span>
                              <span className="break-all">
                                {selectedLeaderboardItem.no_hp} • {selectedLeaderboardItem.email}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 text-[10px] block">Ortu / Pekerjaan:</span>
                              <span>
                                {selectedLeaderboardItem.nama_ortu} ({selectedLeaderboardItem.pekerjaan_ortu} —{' '}
                                {selectedLeaderboardItem.kondisi_pekerjaan})
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 text-[10px] block">Kondisi Khusus & Beasiswa Lain:</span>
                              <span>
                                {selectedLeaderboardItem.kondisi_khusus} • Beasiswa:{' '}
                                {selectedLeaderboardItem.sedang_beasiswa_lain}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 text-[10px] block">Rekening & Komitmen DD:</span>
                              <span>
                                {selectedLeaderboardItem.bank_rekening} {selectedLeaderboardItem.nomor_rekening} • Sosial:{' '}
                                {selectedLeaderboardItem.bersedia_program_sosial}
                              </span>
                            </div>
                            <div className="sm:col-span-2">
                              <span className="text-gray-500 text-[10px] block">Alamat Domisili:</span>
                              <span>{selectedLeaderboardItem.alamat_domisili}</span>
                            </div>
                          </div>

                          {(selectedLeaderboardItem.kendala_ukt || selectedLeaderboardItem.pengalaman_sosial) && (
                            <div className="grid grid-cols-1 gap-2">
                              {selectedLeaderboardItem.kendala_ukt && (
                                <div className="bg-[#FFFDF5] p-2 rounded-xl border border-gray-200">
                                  <span className="block text-[9px] font-black text-gray-500 uppercase">
                                    Kendala & Upaya UKT:
                                  </span>
                                  <p className="text-[11px] font-semibold mt-0.5 whitespace-pre-wrap">
                                    {selectedLeaderboardItem.kendala_ukt} — {selectedLeaderboardItem.upaya_ukt}
                                  </p>
                                </div>
                              )}
                              {selectedLeaderboardItem.pengalaman_sosial && (
                                <div className="bg-[#FFFDF5] p-2 rounded-xl border border-gray-200">
                                  <span className="block text-[9px] font-black text-gray-500 uppercase">
                                    Pengalaman Aktivitas Sosial:
                                  </span>
                                  <p className="text-[11px] font-semibold mt-0.5 whitespace-pre-wrap">
                                    {selectedLeaderboardItem.pengalaman_sosial}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* MODE B: INLINE DOCUMENT PREVIEW IN MIDDLE COLUMN */
                        <div className="p-2.5 flex-grow flex flex-col overflow-hidden">
                          {fileObj && fileUrl && fileUrl !== '#' ? (
                            <div className="bg-white border-2 border-[#111827] rounded-2xl overflow-hidden flex flex-col flex-grow h-full min-h-[480px]">
                              <div className="bg-[#EFF6FF] border-b border-[#111827] px-3 py-1.5 flex items-center justify-between text-[11px] font-bold shrink-0">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="px-1.5 py-0.5 bg-[#1D4ED8] text-white rounded text-[9px] font-black uppercase shrink-0">
                                    {DOC_LABELS[activeDocKey] || activeDocKey}
                                  </span>
                                  <span className="truncate" title={fileObj.name}>
                                    {fileObj.name}
                                  </span>
                                </div>
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#1D4ED8] underline flex items-center gap-1 font-extrabold shrink-0 ml-2"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  <span>Tab Baru</span>
                                </a>
                              </div>
                              <div className="bg-gray-100 flex-grow flex items-center justify-center overflow-auto p-1">
                                {isImage ? (
                                  <img
                                    src={fileUrl}
                                    alt={fileObj.name}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                ) : (
                                  <iframe
                                    src={fileUrl}
                                    className="w-full h-full border-none"
                                    title={fileObj.name}
                                  />
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-[#FFFDF5] border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-400 font-bold text-xs flex-grow flex items-center justify-center">
                              Pilih salah satu tombol berkas di atas untuk pratinjau dokumen.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="bg-white border-[3px] border-[#111827] rounded-3xl p-10 text-center text-gray-500 font-bold text-xs shadow-[4px_4px_0px_#111827]">
                  Pilih kandidat di daftar Leaderboard sebelah kiri untuk melihat detail & pratinjau berkas.
                </div>
              )}
            </div>

            {/* COLUMN 3 (RIGHT): FORM RUBRIK WAWANCARA & PENILAIAN (LOW-SCROLL COCKPIT) */}
            <div className="min-w-0">
              {selectedLeaderboardItem ? (
                (() => {
                  const evalResult = calculateInterviewEvaluation(interviewForm);

                  let uploadedFiles = {};
                  try {
                    if (selectedLeaderboardItem.uploaded_files_json) {
                      uploadedFiles = JSON.parse(selectedLeaderboardItem.uploaded_files_json);
                    }
                  } catch (e) {}

                  let bannerBg = 'bg-white border-[#111827] text-gray-800';
                  let badgeBg = 'bg-gray-700 text-white';
                  if (evalResult.recommendationColor === 'green') {
                    bannerBg = 'bg-[#DCFCE7] border-[#15803D] text-[#14532D]';
                    badgeBg = 'bg-[#15803D] text-white';
                  } else if (evalResult.recommendationColor === 'amber') {
                    bannerBg = 'bg-[#FEF9C3] border-amber-600 text-amber-900';
                    badgeBg = 'bg-amber-600 text-white';
                  } else if (evalResult.recommendationColor === 'red') {
                    bannerBg = 'bg-red-100 border-red-600 text-red-900';
                    badgeBg = 'bg-red-600 text-white';
                  }

                  return (
                    <div className="bg-white border-[3px] border-[#111827] rounded-3xl shadow-[4px_4px_0px_#111827] overflow-hidden flex flex-col lg:h-[calc(100vh-88px)]">
                      {/* Compact Header Form Wawancara */}
                      <div className="bg-[#FFD60A] border-b-2 border-[#111827] px-3.5 py-2.5 shrink-0 space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-[#111827] text-[#FFD60A] flex items-center justify-center shrink-0">
                              <ClipboardCheck className="w-3.5 h-3.5" />
                            </div>
                            <h4 className="font-black text-xs sm:text-sm text-[#111827]">
                              Form Rubrik Wawancara BUKTY
                            </h4>
                          </div>

                          {/* Live Score Pill & Reset inline */}
                          <div className="flex items-center gap-1.5">
                            <div className={`px-2.5 py-1 rounded-xl border-2 flex items-center gap-2 ${bannerBg}`}>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${badgeBg}`}>
                                {evalResult.recommendation}
                              </span>
                              <span className="font-mono-code text-xs font-black">
                                {evalResult.totalWeightedScore}
                                <span className="text-[10px] font-bold opacity-75">/100</span>
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={handleResetInterviewForm}
                              className="p-1.5 bg-white hover:bg-red-50 text-gray-700 hover:text-red-700 border border-[#111827] rounded-xl text-[9px] font-black cursor-pointer"
                              title="Reset isian form wawancara"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Section Switcher: Bagian 1 (Default) | Bagian 2 | Semua */}
                        <div className="grid grid-cols-3 gap-1 bg-white/80 p-1 rounded-xl border border-[#111827]">
                          {[
                            {
                              key: 'bagian1',
                              label: `1. Verifikasi Dokumen (${evalResult.passedCount}/${INTERVIEW_VERIFICATION_ITEMS.length})`,
                            },
                            {
                              key: 'bagian2',
                              label: `2. Skoring 1–4 (${evalResult.scoredIndicatorsCount}/${INTERVIEW_SCORING_RUBRIC.length})`,
                            },
                            { key: 'all', label: 'Tampilkan Semua' },
                          ].map((st) => (
                            <button
                              key={st.key}
                              type="button"
                              onClick={() => setInterviewSectionTab(st.key)}
                              className={`py-1 px-2 rounded-lg font-black text-[10px] cursor-pointer transition-all truncate ${
                                interviewSectionTab === st.key
                                  ? 'bg-[#1D4ED8] text-white shadow-[1px_1px_0px_#111827]'
                                  : 'text-[#111827] hover:bg-white'
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Scrollable Rubric Content (Compact & Low-Scroll) */}
                      <div className="p-3 overflow-y-auto space-y-3 flex-grow text-xs">
                        {/* ============================================================
                            BAGIAN 1: VERIFIKASI DOKUMEN & KELAYAKAN AKHIR (2-COL GRID)
                           ============================================================ */}
                        {(interviewSectionTab === 'bagian1' || interviewSectionTab === 'all') && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2 bg-[#EFF6FF] border border-[#111827] px-2.5 py-1.5 rounded-xl">
                              <span className="font-black text-[10px] text-[#1D4ED8] uppercase">
                                Bagian 1 — 8 Ceklis Verifikasi Kelayakan Akhir (1 Gugur = Tidak Direkomendasikan)
                              </span>
                              <button
                                type="button"
                                onClick={handleMarkAllVerificationPass}
                                className="px-2 py-0.5 bg-[#DCFCE7] hover:bg-[#15803D] text-[#15803D] hover:text-white border border-[#15803D] rounded-lg text-[9px] font-black shrink-0 cursor-pointer transition-colors"
                              >
                                ✓ Lolos Semua
                              </button>
                            </div>

                            {/* 2-Column Grid for 8 Verification Items -> Fits on 1 Screen! */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                              {INTERVIEW_VERIFICATION_ITEMS.map((item) => {
                                const currentVal = interviewForm.verifications?.[item.key] || null;
                                let cardBorder = 'border-[#111827]/30 bg-[#FFFDF5]';
                                if (currentVal === 'pass') cardBorder = 'border-[#15803D] bg-[#DCFCE7]/35';
                                else if (currentVal === 'fail') cardBorder = 'border-red-600 bg-red-50';

                                let quickContext = null;
                                if (item.key === 'identitas_kampus') {
                                  quickContext = `${selectedLeaderboardItem.nama} • ${selectedLeaderboardItem.perguruan_tinggi}`;
                                } else if (item.key === 'status_yatim') {
                                  quickContext = `Form: ${selectedLeaderboardItem.status_yatim} (${selectedLeaderboardItem.nama_ortu})`;
                                } else if (item.key === 'agama_islam') {
                                  quickContext = `Form: ${selectedLeaderboardItem.agama}`;
                                } else if (item.key === 'jenjang_mahasiswa') {
                                  quickContext = `Form: ${selectedLeaderboardItem.jenjang} • Sem ${selectedLeaderboardItem.semester}`;
                                } else if (item.key === 'foto_rumah') {
                                  quickContext = `${selectedLeaderboardItem.status_rumah} • Ortu: Rp ${selectedLeaderboardItem.penghasilan_ortu}`;
                                } else if (item.key === 'slip_ukt') {
                                  quickContext = `UKT: Rp ${selectedLeaderboardItem.nominal_ukt} (${selectedLeaderboardItem.status_ukt || '-'})`;
                                }

                                return (
                                  <div
                                    key={item.key}
                                    className={`p-2.5 rounded-xl border-2 transition-all flex flex-col justify-between gap-1.5 ${cardBorder}`}
                                  >
                                    <div>
                                      <div className="flex items-start justify-between gap-1.5">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <span className="w-4 h-4 rounded bg-[#111827] text-white font-mono-code font-black text-[9px] flex items-center justify-center shrink-0">
                                            {item.no}
                                          </span>
                                          <h6 className="font-black text-[11px] text-[#111827] leading-tight truncate">
                                            {item.title}
                                          </h6>
                                        </div>

                                        {/* Pass / Fail Compact Buttons */}
                                        <div className="flex items-center gap-1 shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => handleSetVerificationItem(item.key, 'pass')}
                                            className={`px-2 py-1 rounded-lg border font-black text-[9px] flex items-center gap-0.5 cursor-pointer transition-all ${
                                              currentVal === 'pass'
                                                ? 'bg-[#15803D] text-white border-[#111827]'
                                                : 'bg-white text-[#15803D] border-[#15803D]/50 hover:bg-[#DCFCE7]'
                                            }`}
                                          >
                                            <Check className="w-2.5 h-2.5" />
                                            <span>Sesuai</span>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleSetVerificationItem(item.key, 'fail')}
                                            className={`px-2 py-1 rounded-lg border font-black text-[9px] flex items-center gap-0.5 cursor-pointer transition-all ${
                                              currentVal === 'fail'
                                                ? 'bg-red-600 text-white border-[#111827]'
                                                : 'bg-white text-red-600 border-red-400 hover:bg-red-50'
                                            }`}
                                          >
                                            <XCircle className="w-2.5 h-2.5" />
                                            <span>Gugur</span>
                                          </button>
                                        </div>
                                      </div>

                                      <p className="text-[9.5px] font-semibold text-gray-600 mt-1 leading-snug">
                                        {item.howToVerify}
                                      </p>
                                    </div>

                                    {/* Bottom row: Form context pill + document preview shortcuts + UKT status */}
                                    <div className="flex flex-wrap items-center justify-between gap-1 pt-1 border-t border-black/10">
                                      {quickContext ? (
                                        <span className="px-1.5 py-0.5 rounded bg-white/90 border border-gray-300 text-[9px] font-bold text-[#1D4ED8] truncate max-w-[180px]" title={quickContext}>
                                          {quickContext}
                                        </span>
                                      ) : (
                                        <span />
                                      )}

                                      <div className="flex flex-wrap items-center gap-1">
                                        {item.docKeys.map((dk) => {
                                          const hasDoc = Boolean(uploadedFiles[dk]);
                                          return (
                                            <button
                                              key={dk}
                                              type="button"
                                              onClick={() => handleOpenDocShortcut(dk)}
                                              disabled={!hasDoc}
                                              className={`px-1.5 py-0.5 rounded border text-[8.5px] font-black flex items-center gap-0.5 cursor-pointer ${
                                                hasDoc
                                                  ? activeDocKey === dk && middlePanelMode === 'docs'
                                                    ? 'bg-[#1D4ED8] text-white border-[#111827]'
                                                    : 'bg-white hover:bg-[#FFD60A] text-[#111827] border-[#111827]'
                                                  : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                                              }`}
                                            >
                                              <FileText className="w-2.5 h-2.5" />
                                              <span>{DOC_LABELS[dk] || dk}</span>
                                            </button>
                                          );
                                        })}

                                        {item.hasUktPaymentStatus && (
                                          <div className="flex items-center gap-0.5 ml-1">
                                            {['SUDAH', 'BELUM'].map((stUkt) => (
                                              <button
                                                key={stUkt}
                                                type="button"
                                                onClick={() =>
                                                  setInterviewForm((prev) => ({
                                                    ...prev,
                                                    uktPaymentStatus: prev.uktPaymentStatus === stUkt ? '' : stUkt,
                                                  }))
                                                }
                                                className={`px-1.5 py-0.5 rounded border text-[8.5px] font-black cursor-pointer ${
                                                  interviewForm.uktPaymentStatus === stUkt
                                                    ? 'bg-[#1D4ED8] text-white border-[#111827]'
                                                    : 'bg-white text-gray-700 border-gray-400 hover:bg-[#EFF6FF]'
                                                }`}
                                              >
                                                {stUkt}
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {interviewSectionTab === 'bagian1' && (
                              <div className="pt-1 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => setInterviewSectionTab('bagian2')}
                                  className="px-3 py-1.5 bg-[#1D4ED8] text-white border-2 border-[#111827] rounded-xl text-[10px] font-black flex items-center gap-1 shadow-[2px_2px_0px_#111827] cursor-pointer"
                                >
                                  <span>Lanjut ke Bagian 2 (Penilaian Skala 1–4)</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ============================================================
                            BAGIAN 2: PENILAIAN TERBOBOT SKALA 1-4 (4-COL COMPACT CARDS)
                           ============================================================ */}
                        {(interviewSectionTab === 'bagian2' || interviewSectionTab === 'all') && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2 bg-[#EFF6FF] border border-[#111827] px-2.5 py-1.5 rounded-xl">
                              <span className="font-black text-[10px] text-[#1D4ED8] uppercase">
                                Bagian 2 — Penilaian Terbobot Skala 1–4 (≥75 Rekomendasi • 60–74 Cadangan • &lt;60 Gugur)
                              </span>
                            </div>

                            <div className="space-y-2">
                              {INTERVIEW_SCORING_RUBRIC.map((ind) => {
                                const selectedScore = Number(interviewForm.scores?.[ind.key]) || 0;
                                const indEval = evalResult.breakdown[ind.key] || {
                                  raw: 0,
                                  weighted: 0,
                                  maxWeight: ind.weight,
                                };

                                return (
                                  <div
                                    key={ind.key}
                                    className="bg-[#FFFDF5] border-2 border-[#111827] rounded-2xl p-2.5 space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="w-4 h-4 rounded bg-[#1D4ED8] text-white font-mono-code font-black text-[9px] flex items-center justify-center shrink-0">
                                          {ind.no}
                                        </span>
                                        <h6 className="font-black text-[11px] text-[#111827]">{ind.title}</h6>
                                        <span className="px-1.5 py-0.5 rounded bg-[#FFD60A] border border-[#111827] text-[8.5px] font-black">
                                          {ind.badge}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        {ind.docKeys &&
                                          ind.docKeys.map((dk) => {
                                            const hasDoc = Boolean(uploadedFiles[dk]);
                                            return (
                                              <button
                                                key={dk}
                                                type="button"
                                                onClick={() => handleOpenDocShortcut(dk)}
                                                disabled={!hasDoc}
                                                className={`px-1.5 py-0.5 rounded border text-[8.5px] font-black cursor-pointer ${
                                                  hasDoc
                                                    ? 'bg-white hover:bg-[#FFD60A] text-[#111827] border-[#111827]'
                                                    : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                                                }`}
                                              >
                                                Cek {DOC_LABELS[dk] || dk}
                                              </button>
                                            );
                                          })}
                                        <span className="font-mono-code font-black text-[10px] text-[#1D4ED8] bg-white px-2 py-0.5 rounded-lg border border-[#111827]">
                                          {indEval.weighted}/{ind.weight}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Compact Key Questions Line */}
                                    <div className="text-[9.5px] font-bold text-[#1E3A8A] bg-[#EFF6FF] px-2 py-1 rounded-lg border border-[#1D4ED8]/20">
                                      <span className="font-black uppercase mr-1">Tanya:</span>
                                      {ind.questions.join(' • ')}
                                    </div>

                                    {/* 4-Column Horizontal Score Cards */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                      {ind.options.map((opt) => {
                                        const isChosen = selectedScore === opt.score;
                                        let activeStyle =
                                          'bg-white border-gray-300 hover:border-[#111827] hover:bg-gray-50 text-[#111827]';
                                        if (isChosen) {
                                          if (opt.score === 4) {
                                            activeStyle =
                                              'bg-[#DCFCE7] border-[#15803D] text-[#14532D] shadow-[1.5px_1.5px_0px_#15803D]';
                                          } else if (opt.score === 3) {
                                            activeStyle =
                                              'bg-[#DBEAFE] border-[#1D4ED8] text-[#1E3A8A] shadow-[1.5px_1.5px_0px_#1D4ED8]';
                                          } else if (opt.score === 2) {
                                            activeStyle =
                                              'bg-[#FEF9C3] border-amber-600 text-amber-900 shadow-[1.5px_1.5px_0px_#D97706]';
                                          } else {
                                            activeStyle =
                                              'bg-red-100 border-red-600 text-red-900 shadow-[1.5px_1.5px_0px_#DC2626]';
                                          }
                                        }

                                        return (
                                          <button
                                            key={opt.score}
                                            type="button"
                                            onClick={() => handleSetIndicatorScore(ind.key, opt.score)}
                                            className={`p-1.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${activeStyle}`}
                                          >
                                            <div className="flex items-center justify-between w-full mb-0.5">
                                              <span className="font-black text-[9.5px] uppercase">
                                                {opt.score}. {opt.label}
                                              </span>
                                              <span className="font-mono-code font-black text-[8.5px] px-1 rounded bg-black/10">
                                                +{((opt.score / 4) * ind.weight).toFixed(0)}
                                              </span>
                                            </div>
                                            <p className="text-[9px] font-semibold leading-tight opacity-90">
                                              {opt.desc}
                                            </p>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Ultra-Compact Sticky Decision & Save Footer */}
                      <div className="bg-[#EFF6FF] border-t-2 border-[#111827] px-3 py-2 space-y-1.5 shrink-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="grid grid-cols-4 gap-1 flex-1">
                            {[
                              { val: 'Pending', label: 'Pending' },
                              { val: 'Lolos Administrasi', label: 'Lolos / Cadangan' },
                              { val: 'Diterima', label: 'Diterima' },
                              { val: 'Tidak Lolos', label: 'Gugur' },
                            ].map((st) => {
                              let cls = 'bg-white text-gray-700 border-[#111827]/40 hover:bg-gray-50';
                              if (leaderboardStatus === st.val) {
                                if (st.val === 'Lolos Administrasi') cls = 'bg-[#15803D] text-white border-[#111827]';
                                else if (st.val === 'Diterima') cls = 'bg-[#1D4ED8] text-white border-[#111827]';
                                else if (st.val === 'Tidak Lolos') cls = 'bg-red-600 text-white border-[#111827]';
                                else cls = 'bg-[#FFD60A] text-[#111827] border-[#111827]';
                              }
                              return (
                                <button
                                  key={st.val}
                                  type="button"
                                  onClick={() => setLeaderboardStatus(st.val)}
                                  className={`py-1.5 px-1 border-2 rounded-lg font-black text-[9px] uppercase cursor-pointer truncate ${cls}`}
                                >
                                  {st.label}
                                </button>
                              );
                            })}
                          </div>

                          {evalResult.isAssessed && (
                            <button
                              type="button"
                              onClick={() => {
                                if (evalResult.recommendation === 'DIREKOMENDASIKAN') {
                                  setLeaderboardStatus('Diterima');
                                } else if (evalResult.recommendation === 'CADANGAN') {
                                  setLeaderboardStatus('Lolos Administrasi');
                                } else if (evalResult.recommendation === 'TIDAK DIREKOMENDASIKAN') {
                                  setLeaderboardStatus('Tidak Lolos');
                                }
                              }}
                              className="px-2 py-1.5 bg-white border border-[#1D4ED8] rounded-lg text-[9px] font-black text-[#1D4ED8] hover:bg-[#DBEAFE] shrink-0 cursor-pointer"
                              title="Ikuti rekomendasi wawancara secara otomatis"
                            >
                              Auto-Status
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={leaderboardComment}
                            onChange={(e) => setLeaderboardComment(e.target.value)}
                            placeholder="Catatan wawancara (temuan berkas, rumah, komitmen)..."
                            className="flex-1 text-xs font-semibold px-2.5 py-1.5 bg-white border-2 border-[#111827] rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={handleSaveCurrentInterview}
                            disabled={savingStatus}
                            className="btn-secondary py-1.5 px-2.5 text-[11px] shrink-0 disabled:opacity-75"
                          >
                            <span>{savingStatus ? '...' : 'Simpan'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveAndNext}
                            disabled={savingStatus}
                            className="btn-yellow py-1.5 px-3 text-[11px] shrink-0 disabled:opacity-75"
                          >
                            <span>{savingStatus ? 'Menyimpan...' : 'Simpan & Lanjut'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="bg-white border-[3px] border-[#111827] rounded-3xl p-10 text-center text-gray-500 font-bold text-xs shadow-[4px_4px_0px_#111827]">
                  Form rubrik wawancara akan tampil di sini setelah kandidat dipilih.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: LOLOS SELEKSI */}
        {activeTab === 'approved' && (
          <div className="space-y-5">
            <div className="bg-white border-2 border-[#111827] p-4 rounded-2xl shadow-[4px_4px_0px_#111827] flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari peserta lolos..."
                  value={approvedSearchQuery}
                  onChange={(e) => setApprovedSearchQuery(e.target.value)}
                  className="form-input pl-9 pr-3 py-2 text-xs font-bold"
                />
              </div>

              <button
                onClick={() => exportRowsToCSV(getApprovedData(), 'Lolos_Seleksi_BUKTY')}
                className="btn-yellow py-2 px-4 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor Peserta Lolos (CSV)</span>
              </button>
            </div>

            <div className="bg-white border-[3px] border-[#111827] rounded-3xl shadow-[6px_6px_0px_#111827] overflow-hidden">
              <div className="bg-[#EFF6FF] p-4 border-b-2 border-[#111827] flex items-center justify-between">
                <h3 className="font-black text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#15803D]" />
                  <span>Daftar Peserta Lolos Administrasi & Penerima Akhir ({getApprovedData().length})</span>
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FFFDF5] border-b-2 border-[#111827] text-gray-600 font-black uppercase text-[10px]">
                      <th className="py-3 px-4 w-14 text-center border-r-2 border-[#111827]">No.</th>
                      <th className="py-3 px-4 border-r-2 border-[#111827]">No. Reg</th>
                      <th
                        onClick={toggleApprovedNameSort}
                        className="py-3 px-4 border-r-2 border-[#111827] cursor-pointer hover:bg-[#EFF6FF] select-none"
                      >
                        Nama Lengkap {approvedNameSort === 'asc' ? '▲' : approvedNameSort === 'desc' ? '▼' : '⇅'}
                      </th>
                      <th className="py-3 px-4 border-r-2 border-[#111827]">Kampus & Provinsi</th>
                      <th className="py-3 px-4 border-r-2 border-[#111827]">Status Ortu / Skor</th>
                      <th className="py-3 px-4 text-center">Status & Promosi Pantukhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {getApprovedData().length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-500 font-bold">
                          Belum ada pendaftar yang berstatus Lolos Administrasi atau Diterima.
                        </td>
                      </tr>
                    ) : (
                      getApprovedData().map((item, index) => (
                        <tr key={item.id} className="hover:bg-[#EFF6FF]/40 font-bold">
                          <td className="py-3 px-4 text-center border-r border-gray-200 font-mono-code text-gray-400">
                            {index + 1}
                          </td>
                          <td className="py-3 px-4 border-r border-gray-200 font-mono-code text-[#1D4ED8] font-black">
                            {item.reg_id}
                          </td>
                          <td className="py-3 px-4 border-r border-gray-200 uppercase font-black">{item.nama}</td>
                          <td className="py-3 px-4 border-r border-gray-200">
                            <div>{item.perguruan_tinggi}</div>
                            <div className="text-[10px] text-gray-500">{item.provinsi}</div>
                          </td>
                          <td className="py-3 px-4 border-r border-gray-200">
                            <span className="px-1.5 py-0.5 rounded bg-[#FEF9C3] border border-[#111827] text-[10px] font-black mr-2">
                              {item.status_yatim}
                            </span>
                            <span className="font-mono-code font-black text-[#1D4ED8]">{item.score_total}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {item.status_seleksi === 'Diterima' ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-[#DBEAFE] text-[#1D4ED8] border-2 border-[#1D4ED8]">
                                <Trophy className="w-3 h-3" />
                                <span>Diterima (Pantukhir)</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleUpdateStatus(item.id, 'Diterima')}
                                className="px-3 py-1.5 rounded-xl bg-[#FFD60A] hover:bg-[#1D4ED8] hover:text-white border-2 border-[#111827] text-[10px] font-black transition-colors cursor-pointer"
                              >
                                Tetapkan Diterima (Pantukhir)
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: JADWAL TIMELINE, PENGUMUMAN & PANTUKHIR CONFIG */}
        {activeTab === 'announcement' && (
          <div className="space-y-6">
            {/* CARD A: FLEXIBLE TIMELINE, DEADLINE & LANDING PAGE VISIBILITY */}
            <div className="bg-white border-[3px] border-[#111827] p-6 sm:p-8 rounded-3xl shadow-[6px_6px_0px_#111827] space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#111827] pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-[#FFD60A] border-2 border-[#111827] px-2.5 py-0.5 rounded-full text-[10px] font-black mb-1.5">
                    <Calendar className="w-3 h-3" />
                    <span>DINAMIS KE LANDING PAGE & SERVER</span>
                  </div>
                  <h3 className="font-black text-lg">Pengaturan Timeline Seleksi & Batas Pendaftaran</h3>
                  <p className="text-xs font-semibold text-gray-600">
                    Setiap perubahan tanggal di sini otomatis memperbarui Hero, Marquee, Timeline, FAQ, CTA, dan kunci batas pendaftaran di server.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleResetTimelineDefaults}
                    className="btn-secondary py-2 px-3 text-[11px]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Default</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAnnouncementConfig}
                    disabled={isSavingAnnouncement}
                    className="btn-primary py-2 px-4 text-[11px] disabled:opacity-60"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-[#FFD60A]" />
                    <span>{isSavingAnnouncement ? 'Menyimpan...' : 'Simpan Semua'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Controls Row: Registration Deadline + Announcement Menu Visibility */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-[#EFF6FF] border-2 border-[#111827] p-4 rounded-2xl space-y-2">
                  <label className="form-label text-xs mb-0">
                    Batas Akhir Pendaftaran (Countdown & Tutup Otomatis — WIB)
                  </label>
                  <input
                    type="datetime-local"
                    value={registrationDeadline}
                    onChange={(e) => setRegistrationDeadline(e.target.value)}
                    className="form-input text-xs font-bold font-mono-code bg-white"
                  />
                  <p className="text-[11px] font-semibold text-gray-600">
                    Otomatis ikut berubah saat Tanggal Selesai Tahap 01 (Pendaftaran) diedit, dan jam tutupnya tetap bisa diatur bebas di sini.
                  </p>
                </div>

                <div className="bg-[#FEF9C3]/70 border-2 border-[#111827] p-4 rounded-2xl flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-xs text-[#111827]">
                        Tampilkan Menu Pengumuman & Penerima di Landing Page
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full border border-[#111827] ${
                          showAnnouncementMenus ? 'bg-[#15803D] text-white' : 'bg-white text-gray-600'
                        }`}
                      >
                        {showAnnouncementMenus ? 'AKTIF' : 'DISEMBUNYIKAN'}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-gray-600 mt-1">
                      Nyalakan saat masa pengumuman tiba agar tombol <strong>Pengumuman</strong> & <strong>Penerima Akhir</strong> tampil di Navbar, Hero, dan Footer tanpa ubah kode.
                    </p>
                  </div>
                  <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showAnnouncementMenus}
                      onChange={(e) => setShowAnnouncementMenus(e.target.checked)}
                      className="w-4 h-4 accent-[#1D4ED8] cursor-pointer"
                    />
                    <span className="text-xs font-black text-[#111827]">
                      {showAnnouncementMenus
                        ? 'Menu Pengumuman & Penerima Akhir sedang ditampilkan ke publik'
                        : 'Sembunyikan dulu selama masa pendaftaran'}
                    </span>
                  </label>
                </div>
              </div>

              {/* 7-Stage Editable Timeline List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-xs text-[#1D4ED8] uppercase tracking-wider">
                    Daftar 7 Tahapan Timeline Seleksi BUKTY
                  </h4>
                  <span className="text-[11px] font-bold text-gray-500">
                    Label tanggal otomatis diformat ke Bahasa Indonesia
                  </span>
                </div>

                <div className="space-y-3">
                  {timelineEvents.map((ev, idx) => (
                    <div
                      key={idx}
                      className="bg-[#FFFDF5] border-2 border-[#111827] rounded-2xl p-3.5 sm:p-4 shadow-[3px_3px_0px_#111827] space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-[#1D4ED8] text-white border-2 border-[#111827] flex items-center justify-center font-mono-code font-black text-xs">
                            0{idx + 1}
                          </span>
                          <span className="font-black text-xs text-[#111827]">{ev.title}</span>
                        </div>
                        <span className="inline-block bg-[#DBEAFE] border border-[#111827] text-[11px] font-black px-2.5 py-0.5 rounded-lg text-[#1E3A8A]">
                          Tampil: {ev.date}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                        <div className="lg:col-span-2">
                          <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">
                            Tanggal Mulai
                          </label>
                          <input
                            type="date"
                            value={ev.startDate || ''}
                            onChange={(e) => handleTimelineFieldChange(idx, 'startDate', e.target.value)}
                            className="form-input text-xs font-bold font-mono-code py-1.5 bg-white"
                          />
                        </div>
                        <div className="lg:col-span-2">
                          <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">
                            Tanggal Selesai
                          </label>
                          <input
                            type="date"
                            value={ev.endDate || ''}
                            min={ev.startDate || undefined}
                            onChange={(e) => handleTimelineFieldChange(idx, 'endDate', e.target.value)}
                            className="form-input text-xs font-bold font-mono-code py-1.5 bg-white"
                          />
                        </div>
                        <div className="lg:col-span-3">
                          <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">
                            Nama Tahap
                          </label>
                          <input
                            type="text"
                            value={ev.title || ''}
                            onChange={(e) => handleTimelineFieldChange(idx, 'title', e.target.value)}
                            className="form-input text-xs font-bold py-1.5 bg-white"
                          />
                        </div>
                        <div className="lg:col-span-5">
                          <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">
                            Deskripsi Singkat
                          </label>
                          <input
                            type="text"
                            value={ev.desc || ''}
                            onChange={(e) => handleTimelineFieldChange(idx, 'desc', e.target.value)}
                            className="form-input text-xs font-semibold py-1.5 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CARD B: ANNOUNCEMENT & PANTUKHIR RELEASE */}
            <div className="bg-white border-[3px] border-[#111827] p-6 sm:p-8 rounded-3xl shadow-[6px_6px_0px_#111827] space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#111827] pb-4">
                <div>
                  <h3 className="font-black text-lg">Pengaturan Rilis Pengumuman & Pantukhir BUKTY</h3>
                  <p className="text-xs font-semibold text-gray-600">
                    Atur waktu hitung mundur rilis halaman pengumuman, unggah berkas SK PDF, dan pasang tautan Grup WhatsApp resmi.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href="/#bypasspengumuman" target="_blank" rel="noreferrer" className="btn-secondary py-2 px-3 text-[11px]">
                    Preview Pengumuman
                  </a>
                  <a href="/#bypasspantukhir" target="_blank" rel="noreferrer" className="btn-secondary py-2 px-3 text-[11px]">
                    Preview Pantukhir
                  </a>
                </div>
              </div>

              {/* Stage 1: Administrasi */}
              <div className="space-y-4">
                <h4 className="font-black text-sm text-[#1D4ED8] uppercase tracking-wider">
                  1. Pengumuman Lolos Administrasi (Jadwal: {timelineEvents[2]?.date || '27 Nov 2026'})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs">Tanggal & Waktu Rilis (WIB)</label>
                    <input
                      type="datetime-local"
                      value={announcementTime}
                      onChange={(e) => setAnnouncementTime(e.target.value)}
                      className="form-input text-xs font-bold font-mono-code"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Link Grup WhatsApp Tahap Konfirmasi (Opsional)</label>
                    <input
                      type="url"
                      placeholder="https://chat.whatsapp.com/..."
                      value={waGroupAdminUrl}
                      onChange={(e) => setWaGroupAdminUrl(e.target.value)}
                      className="form-input text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'file1', label: 'Dokumen 01 — SK Hasil Tahap Administrasi BUKTY', fileObj: file1 },
                    { key: 'file2', label: 'Dokumen 02 — Panduan Tahap Konfirmasi Peserta', fileObj: file2 },
                    {
                      key: 'file3',
                      label: `Dokumen 03 — Jadwal Konfirmasi (${timelineEvents[3]?.date || '28 – 29 Nov 2026'})`,
                      fileObj: file3,
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="bg-[#EFF6FF] border-2 border-[#111827] p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div>
                        <h5 className="font-black text-xs">{item.label}</h5>
                        {item.fileObj.name ? (
                          <a
                            href={item.fileObj.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-mono-code font-bold text-[#15803D] underline"
                          >
                            Terunggah: {item.fileObj.name}
                          </a>
                        ) : (
                          <p className="text-[10px] text-red-600 font-bold italic">Belum ada file PDF diunggah.</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="file"
                          id={`upload-ann-${item.key}`}
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleAnnouncementFileUpload(item.key, f);
                            e.target.value = '';
                          }}
                        />
                        <label htmlFor={`upload-ann-${item.key}`} className="btn-yellow py-2 px-4 text-xs cursor-pointer">
                          <FileText className="w-3.5 h-3.5" />
                          <span>
                            {isUploadingFile[item.key] ? 'Memproses...' : item.fileObj.name ? 'Ganti PDF' : 'Unggah PDF'}
                          </span>
                        </label>
                        {item.fileObj.name && (
                          <button
                            type="button"
                            onClick={() => handleDeleteAnnouncementFile(item.key, item.label)}
                            disabled={isUploadingFile[item.key]}
                            className="inline-flex items-center gap-1.5 py-2 px-3 text-xs font-black bg-red-600 text-white border-2 border-[#111827] rounded-xl shadow-[2.5px_2.5px_0px_#111827] hover:bg-red-700 disabled:opacity-60 cursor-pointer transition-all"
                            title="Hapus dokumen ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t-2 border-dashed border-[#111827]/20"></div>

              {/* Stage 2: Pantukhir */}
              <div className="space-y-4">
                <h4 className="font-black text-sm text-[#1D4ED8] uppercase tracking-wider">
                  2. Pengumuman Penerima BUKTY / Pantukhir (Jadwal: {timelineEvents[4]?.date || '30 Nov 2026'})
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs">Tanggal & Waktu Rilis Pantukhir (WIB)</label>
                    <input
                      type="datetime-local"
                      value={pantukhirTime}
                      onChange={(e) => setPantukhirTime(e.target.value)}
                      className="form-input text-xs font-bold font-mono-code"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Link Grup WhatsApp Penerima BUKTY (Opsional)</label>
                    <input
                      type="url"
                      placeholder="https://chat.whatsapp.com/..."
                      value={waGroupPantukhirUrl}
                      onChange={(e) => setWaGroupPantukhirUrl(e.target.value)}
                      className="form-input text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="bg-[#FEF9C3]/70 border-2 border-[#111827] p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h5 className="font-black text-xs">SK Penetapan Penerima Program BUKTY 2027 (PDF)</h5>
                    {pantukhirFile.name ? (
                      <a
                        href={pantukhirFile.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-mono-code font-bold text-[#15803D] underline"
                      >
                        Terunggah: {pantukhirFile.name}
                      </a>
                    ) : (
                      <p className="text-[10px] text-red-600 font-bold italic">Belum ada file SK diunggah.</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="file"
                      id="upload-ann-pantukhir"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleAnnouncementFileUpload('pantukhir', f);
                        e.target.value = '';
                      }}
                    />
                    <label htmlFor="upload-ann-pantukhir" className="btn-yellow py-2 px-4 text-xs cursor-pointer">
                      <FileText className="w-3.5 h-3.5" />
                      <span>
                        {isUploadingPantukhirFile ? 'Memproses...' : pantukhirFile.name ? 'Ganti SK PDF' : 'Unggah SK PDF'}
                      </span>
                    </label>
                    {pantukhirFile.name && (
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteAnnouncementFile('pantukhir', 'SK Penetapan Penerima Program BUKTY 2027 (PDF)')
                        }
                        disabled={isUploadingPantukhirFile}
                        className="inline-flex items-center gap-1.5 py-2 px-3 text-xs font-black bg-red-600 text-white border-2 border-[#111827] rounded-xl shadow-[2.5px_2.5px_0px_#111827] hover:bg-red-700 disabled:opacity-60 cursor-pointer transition-all"
                        title="Hapus dokumen SK ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-[#111827]/15 flex justify-end">
                <button
                  onClick={handleSaveAnnouncementConfig}
                  disabled={isSavingAnnouncement}
                  className="btn-primary py-3 px-6 text-xs disabled:opacity-60"
                >
                  <CheckCircle className="w-4 h-4 text-[#FFD60A]" />
                  <span>{isSavingAnnouncement ? 'Menyimpan...' : 'Simpan Pengaturan Jadwal & Pengumuman'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-[3px] border-[#111827] w-full max-w-md rounded-3xl p-6 shadow-[8px_8px_0px_#111827] space-y-5">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-red-600 text-white rounded-2xl mx-auto flex items-center justify-center border-2 border-[#111827]">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black">Konfirmasi Hapus Data</h3>
              <p className="text-xs font-semibold text-gray-600">
                Yakin ingin menghapus <strong className="text-red-600">{deleteConfirmModal.targetIds.length} data pendaftar</strong> secara permanen?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmModal({ isOpen: false, targetIds: [] })}
                className="btn-secondary flex-1 py-2.5 text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 text-xs font-black bg-red-600 text-white border-2 border-[#111827] rounded-xl shadow-[3px_3px_0px_#111827] cursor-pointer"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANDIDATE DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-[3px] border-[#111827] w-full max-w-3xl rounded-3xl p-6 shadow-[8px_8px_0px_#111827] max-h-[90vh] flex flex-col my-auto">
            <div className="flex items-center justify-between border-b-2 border-[#111827] pb-3">
              <div>
                <span className="text-[10px] font-black text-[#1D4ED8] uppercase">DETAIL PENDAFTAR BUKTY</span>
                <h3 className="text-lg font-black uppercase">{selectedItem.nama}</h3>
                <p className="text-xs font-mono-code font-bold text-gray-500">
                  {selectedItem.reg_id} — {selectedItem.submitted_at}
                </p>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 bg-[#EFF6FF] border-2 border-[#111827] rounded-xl hover:bg-[#FFD60A] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 py-4 text-xs">
              <div className="bg-[#EFF6FF] p-4 rounded-2xl border border-[#111827] grid grid-cols-2 gap-2 font-semibold">
                <h4 className="col-span-2 font-black text-[#1D4ED8]">A. DATA PRIBADI</h4>
                <div><span className="text-gray-500">NIK:</span> {selectedItem.nik}</div>
                <div><span className="text-gray-500">TTL:</span> {selectedItem.ttl}</div>
                <div><span className="text-gray-500">Gender / Agama:</span> {selectedItem.gender} / {selectedItem.agama}</div>
                <div><span className="text-gray-500">Provinsi:</span> {selectedItem.provinsi}</div>
                <div><span className="text-gray-500">No. HP/WA:</span> {selectedItem.no_hp}</div>
                <div><span className="text-gray-500">Email:</span> {selectedItem.email}</div>
                <div className="col-span-2"><span className="text-gray-500">Domisili:</span> {selectedItem.alamat_domisili}</div>
              </div>

              <div className="bg-[#FFFDF5] p-4 rounded-2xl border border-[#111827] grid grid-cols-2 gap-2 font-semibold">
                <h4 className="col-span-2 font-black text-[#1D4ED8]">B. DATA AKADEMIK & UKT</h4>
                <div><span className="text-gray-500">Kampus:</span> {selectedItem.perguruan_tinggi} ({selectedItem.jenis_pt || 'PTN'})</div>
                <div><span className="text-gray-500">Prodi / Sem:</span> {selectedItem.fakultas_prodi} ({selectedItem.jenjang}-Sem {selectedItem.semester})</div>
                <div><span className="text-gray-500">IPK / Rapor:</span> <strong className="text-[#1D4ED8]">{selectedItem.ipk}</strong></div>
                <div><span className="text-gray-500">Nominal UKT:</span> <strong className="text-[#15803D]">Rp {selectedItem.nominal_ukt}</strong></div>
                <div><span className="text-gray-500">Beasiswa Lain:</span> {selectedItem.sedang_beasiswa_lain}</div>
                <div><span className="text-gray-500">Rekening:</span> {selectedItem.bank_rekening} {selectedItem.nomor_rekening}</div>
              </div>

              <div className="bg-[#FEF9C3]/60 p-4 rounded-2xl border border-[#111827] grid grid-cols-2 gap-2 font-semibold">
                <h4 className="col-span-2 font-black text-[#1D4ED8]">C & D. KELUARGA, STATUS YATIM & SOSIAL</h4>
                <div><span className="text-gray-500">Status Orang Tua:</span> <strong className="text-[#1D4ED8]">{selectedItem.status_yatim}</strong></div>
                <div><span className="text-gray-500">Nama Ortu:</span> {selectedItem.nama_ortu} ({selectedItem.pekerjaan_ortu})</div>
                <div><span className="text-gray-500">Penghasilan:</span> Rp {selectedItem.penghasilan_ortu}/bln</div>
                <div><span className="text-gray-500">Tanggungan / Rumah:</span> {selectedItem.jumlah_tanggungan} Jiwa / {selectedItem.status_rumah}</div>
                <div className="col-span-2"><span className="text-gray-500">Pengalaman Sosial:</span> {selectedItem.pengalaman_sosial || '-'}</div>
                <div><span className="text-gray-500">Program Sosial DD:</span> {selectedItem.bersedia_program_sosial}</div>
                <div><span className="text-gray-500">Publikasi Medsos:</span> {selectedItem.bersedia_publikasi}</div>
              </div>

              <div className="bg-[#EFF6FF] p-4 rounded-2xl border border-[#111827] space-y-2">
                <h4 className="font-black text-[#1D4ED8]">E. BERKAS TERLAMPIR</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedItem.uploaded_files_json &&
                    (() => {
                      try {
                        const parsed = JSON.parse(selectedItem.uploaded_files_json);
                        return Object.keys(parsed).map((k) => {
                          const f = parsed[k];
                          const url = f.fileUrl || (f.fileName ? `/api/files/${f.fileName}` : null);
                          return (
                            <div
                              key={k}
                              className="p-2.5 bg-white border border-[#111827] rounded-xl flex items-center justify-between gap-2"
                            >
                              <div className="truncate">
                                <span className="font-black text-[10px] text-[#1D4ED8] block uppercase">
                                  {DOC_LABELS[k] || k}
                                </span>
                                <span className="text-xs font-bold truncate block">{f.name}</span>
                              </div>
                              {url && url !== '#' && (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1 bg-[#FFD60A] border border-[#111827] rounded-lg text-[10px] font-black shrink-0"
                                >
                                  Buka
                                </a>
                              )}
                            </div>
                          );
                        });
                      } catch (e) {
                        return null;
                      }
                    })()}
                </div>
              </div>
            </div>

            <div className="border-t-2 border-[#111827] pt-3 flex flex-wrap gap-2 justify-end">
              {['Pending', 'Lolos Administrasi', 'Diterima', 'Tidak Lolos'].map((st) => (
                <button
                  key={st}
                  onClick={() => handleUpdateStatus(selectedItem.id, st)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFD60A] border-2 border-[#111827] text-xs font-black cursor-pointer"
                >
                  Set {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
