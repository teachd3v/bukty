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
} from 'lucide-react';
import {
  calculateBuktyScores,
  checkBuktyEligibility,
  TARGET_PROVINCES,
  STATUS_YATIM_LIST,
} from '../utils/buktyConfig';

const SESSION_KEY = 'bukty_admin_session';
const LOCAL_SUBMISSIONS_KEY = 'bukty_admin_submissions';

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

  // Tabs & Leaderboard States
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'leaderboard' | 'approved' | 'announcement'
  const [onlyQualifiedLeaderboard, setOnlyQualifiedLeaderboard] = useState(true);
  const [selectedLeaderboardItem, setSelectedLeaderboardItem] = useState(null);
  const [activeDocKey, setActiveDocKey] = useState(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [leaderboardComment, setLeaderboardComment] = useState('');
  const [leaderboardStatus, setLeaderboardStatus] = useState('Pending');
  const [leaderboardSearchQuery, setLeaderboardSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Approved Tab States
  const [approvedSearchQuery, setApprovedSearchQuery] = useState('');
  const [approvedNameSort, setApprovedNameSort] = useState('default'); // 'default' | 'asc' | 'desc'

  // Announcement & Pantukhir States
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
    ];

    const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const rows = dataset.map((r) => {
      const scores = calculateBuktyScores(r);
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

  const handleUpdateLeaderboardStatus = async (id, status, catatan) => {
    setSavingStatus(true);
    const updated = registrations.map((item) =>
      item.id === id ? { ...item, status_seleksi: status, catatan_admin: catatan } : item
    );
    setRegistrations(updated);
    localStorage.setItem(LOCAL_SUBMISSIONS_KEY, JSON.stringify(updated));

    try {
      await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status_seleksi: status, catatan_admin: catatan }),
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

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      const data = getLeaderboardData();
      if (data.length > 0) {
        const stillExists = selectedLeaderboardItem && data.some((x) => x.id === selectedLeaderboardItem.id);
        if (!stillExists) {
          handleSelectRankItem(data[0]);
        } else {
          const current = data.find((x) => x.id === selectedLeaderboardItem.id);
          setLeaderboardStatus(current.status_seleksi || 'Pending');
          setLeaderboardComment(current.catatan_admin || '');
        }
      } else {
        setSelectedLeaderboardItem(null);
        setActiveDocKey(null);
      }
    }
  }, [activeTab, registrations, onlyQualifiedLeaderboard]);

  const handleSaveAndNext = async () => {
    if (!selectedLeaderboardItem) return;
    await handleUpdateLeaderboardStatus(selectedLeaderboardItem.id, leaderboardStatus, leaderboardComment);

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

  const handleSaveAnnouncementConfig = async () => {
    setIsSavingAnnouncement(true);
    try {
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
        }),
      });
      const json = await res.json();
      alert(json.success ? 'Pengaturan pengumuman BUKTY berhasil disimpan!' : `Gagal menyimpan: ${json.message}`);
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
    ['yatim', 'piatu', 'yatim piatu'].includes((r.status_yatim || '').toLowerCase())
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
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
                { key: 'announcement', label: 'Pengumuman' },
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

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
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
                  <p className="text-[10px] font-extrabold text-gray-500 uppercase">Yatim / Piatu</p>
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

        {/* TAB 2: LEADERBOARD SPLIT-SCREEN FAST VERIFIER */}
        {activeTab === 'leaderboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left: Ranking List */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white border-[3px] border-[#111827] p-4 rounded-3xl shadow-[4px_4px_0px_#111827]">
                <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                  <h4 className="font-black text-sm flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#1D4ED8]" />
                    <span>Leaderboard ({getLeaderboardData().length})</span>
                  </h4>

                  <button
                    onClick={handleSyncGoogleSheets}
                    disabled={isSyncing}
                    className="px-2.5 py-1.5 text-[10px] font-black bg-[#FFD60A] text-[#111827] border-2 border-[#111827] rounded-xl shadow-[2px_2px_0px_#111827] flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Sheets'}</span>
                  </button>
                </div>

                {/* Toggle Qualified Filter */}
                <label className="flex items-center gap-2 mb-3 bg-[#EFF6FF] border border-[#111827] px-3 py-2 rounded-xl text-[10px] font-extrabold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyQualifiedLeaderboard}
                    onChange={(e) => setOnlyQualifiedLeaderboard(e.target.checked)}
                    className="accent-[#1D4ED8]"
                  />
                  <span>Filter Ketat BUKTY (Islam, 12 Prov, PTN, IPK≥3, Non-Beasiswa)</span>
                </label>

                <div className="relative mb-3">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari kandidat..."
                    value={leaderboardSearchQuery}
                    onChange={(e) => setLeaderboardSearchQuery(e.target.value)}
                    className="form-input pl-9 pr-3 py-2 text-xs font-bold"
                  />
                </div>

                <div className="max-h-[580px] overflow-y-auto space-y-2.5 pr-1">
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

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectRankItem(item)}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all shadow-[2px_2px_0px_#111827] flex items-center justify-between gap-3 ${
                            isSelected ? 'bg-[#EFF6FF] border-[#1D4ED8]' : 'bg-white border-[#111827]/40 hover:bg-[#FFFDF5]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-[#FFD60A] text-[#111827] font-mono-code font-black border-2 border-[#111827] flex items-center justify-center text-xs shrink-0">
                              {index + 1}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-black text-[11px] uppercase truncate">{item.nama}</h4>
                              <p className="text-[9px] text-gray-500 font-bold truncate">
                                {item.perguruan_tinggi} • {item.provinsi}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] font-black text-[#1D4ED8] font-mono-code">{item.reg_id}</span>
                                <span className="text-[9px] font-black px-1 bg-[#FEF9C3] border border-[#111827] rounded">
                                  {item.status_yatim}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-black font-mono-code">{item.score_total}</div>
                            <span className={`inline-block px-1.5 py-0.5 rounded border text-[9px] font-black mt-1 ${badgeStyle}`}>
                              {badgeText}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Middle: Candidate Detail, BUKTY Scoring & Verification Controls */}
            <div className="lg:col-span-4 space-y-4">
              {selectedLeaderboardItem ? (
                <div className="bg-white border-[3px] border-[#111827] rounded-3xl shadow-[4px_4px_0px_#111827] overflow-hidden flex flex-col max-h-[750px]">
                  <div className="bg-[#1D4ED8] text-white border-b-2 border-[#111827] p-4 shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#FFD60A] font-mono-code text-xs">
                        {selectedLeaderboardItem.reg_id}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#FFD60A] text-[#111827] text-[10px] font-black">
                        {selectedLeaderboardItem.status_yatim || '-'}
                      </span>
                    </div>
                    <h3 className="font-black text-sm uppercase mt-1 truncate">{selectedLeaderboardItem.nama}</h3>
                    <p className="text-[10px] font-bold text-blue-100 truncate">
                      {selectedLeaderboardItem.perguruan_tinggi} ({selectedLeaderboardItem.jenis_pt || 'PTN'}) •{' '}
                      {selectedLeaderboardItem.provinsi}
                    </p>
                  </div>

                  <div className="p-4 overflow-y-auto space-y-4 flex-grow text-xs">
                    {/* Eligibility Flags Warning if TMS */}
                    {!selectedLeaderboardItem.eligibility.isQualified && (
                      <div className="bg-red-50 border-2 border-red-500 p-3 rounded-xl text-[11px] font-bold text-red-700">
                        <strong>Catatan Auto-Screening (TMS):</strong>{' '}
                        {selectedLeaderboardItem.eligibility.flags.join(' • ')}
                      </div>
                    )}

                    {/* BUKTY 35/45/20 Score Breakdown */}
                    <div className="bg-[#EFF6FF] p-3 rounded-2xl border-2 border-[#111827] space-y-1.5 text-[11px]">
                      <h5 className="font-black text-[10px] text-[#1D4ED8] uppercase tracking-wider">
                        Skor Prioritas BUKTY (35 / 45 / 20)
                      </h5>
                      <div className="flex justify-between font-bold">
                        <span>Status Yatim (35%):</span>
                        <span className="font-mono-code font-black">
                          {(selectedLeaderboardItem.score_yatim * 0.35).toFixed(2)} / 35
                        </span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Rasio Beban UKT (45%):</span>
                        <span className="font-mono-code font-black">
                          {(selectedLeaderboardItem.score_ratio * 0.45).toFixed(2)} / 45
                        </span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Jumlah Tanggungan (20%):</span>
                        <span className="font-mono-code font-black">
                          {(selectedLeaderboardItem.score_tanggungan * 0.2).toFixed(2)} / 20
                        </span>
                      </div>
                      <div className="border-t-2 border-[#111827]/20 pt-1.5 flex justify-between font-black text-xs text-[#1D4ED8]">
                        <span>Skor Total:</span>
                        <span className="font-mono-code">{selectedLeaderboardItem.score_total} / 100</span>
                      </div>
                    </div>

                    {/* Key Academic & Economy Stats */}
                    <div className="grid grid-cols-2 gap-2 bg-[#FFFDF5] p-3 rounded-2xl border border-[#111827]/30 font-bold">
                      <div>
                        <span className="text-[10px] text-gray-500 block">IPK / Rapor</span>
                        <strong className="text-[#1D4ED8]">{selectedLeaderboardItem.ipk}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">Nominal UKT</span>
                        <strong className="text-[#15803D]">Rp {selectedLeaderboardItem.nominal_ukt}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">Penghasilan Ortu</span>
                        <strong>Rp {selectedLeaderboardItem.penghasilan_ortu}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 block">Tanggungan / Rumah</span>
                        <strong>
                          {selectedLeaderboardItem.jumlah_tanggungan} Jiwa / {selectedLeaderboardItem.status_rumah}
                        </strong>
                      </div>
                    </div>

                    {/* Bio & Sosial */}
                    <div className="space-y-1.5 font-bold">
                      <div><span className="text-gray-500">NIK / Agama:</span> {selectedLeaderboardItem.nik} / {selectedLeaderboardItem.agama}</div>
                      <div><span className="text-gray-500">Prodi / Sem:</span> {selectedLeaderboardItem.fakultas_prodi} ({selectedLeaderboardItem.jenjang}-Sem {selectedLeaderboardItem.semester})</div>
                      <div><span className="text-gray-500">WA / Email:</span> {selectedLeaderboardItem.no_hp} / {selectedLeaderboardItem.email}</div>
                      <div><span className="text-gray-500">Ortu / Kondisi:</span> {selectedLeaderboardItem.nama_ortu} ({selectedLeaderboardItem.pekerjaan_ortu} — {selectedLeaderboardItem.kondisi_pekerjaan})</div>
                      <div><span className="text-gray-500">Kondisi Khusus:</span> {selectedLeaderboardItem.kondisi_khusus}</div>
                      <div><span className="text-gray-500">Beasiswa Lain:</span> {selectedLeaderboardItem.sedang_beasiswa_lain} {selectedLeaderboardItem.detail_beasiswa_lain && `(${selectedLeaderboardItem.detail_beasiswa_lain})`}</div>
                      <div><span className="text-gray-500">Program Sosial DD / Publikasi:</span> {selectedLeaderboardItem.bersedia_program_sosial} / {selectedLeaderboardItem.bersedia_publikasi}</div>
                      {selectedLeaderboardItem.pengalaman_sosial && (
                        <div className="bg-[#FFFDF5] p-2.5 rounded-xl border border-gray-200 mt-1">
                          <span className="block text-[10px] text-gray-500 uppercase">Pengalaman Aktivitas Sosial:</span>
                          <p className="text-[11px] font-semibold mt-0.5 whitespace-pre-wrap">
                            {selectedLeaderboardItem.pengalaman_sosial}
                          </p>
                        </div>
                      )}
                      {selectedLeaderboardItem.kendala_ukt && (
                        <div className="bg-[#FFFDF5] p-2.5 rounded-xl border border-gray-200">
                          <span className="block text-[10px] text-gray-500 uppercase">Kendala & Upaya UKT:</span>
                          <p className="text-[11px] font-semibold mt-0.5 whitespace-pre-wrap">
                            {selectedLeaderboardItem.kendala_ukt} — {selectedLeaderboardItem.upaya_ukt}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sticky Verification Controls */}
                  <div className="bg-[#EFF6FF] border-t-2 border-[#111827] p-4 space-y-3 shrink-0">
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { val: 'Pending', label: 'Pending' },
                        { val: 'Lolos Administrasi', label: 'Lolos' },
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
                            className={`py-2 px-1 border-2 rounded-xl font-black text-[9px] uppercase cursor-pointer ${cls}`}
                          >
                            {st.label}
                          </button>
                        );
                      })}
                    </div>

                    <textarea
                      value={leaderboardComment}
                      onChange={(e) => setLeaderboardComment(e.target.value)}
                      placeholder="Catatan verifikator (kelayakan rumah, esai, alasan gugur)..."
                      className="w-full text-xs font-semibold p-2.5 bg-white border-2 border-[#111827] rounded-xl h-14 resize-none"
                    />

                    <button
                      onClick={handleSaveAndNext}
                      disabled={savingStatus}
                      className="btn-yellow w-full py-2.5 text-xs disabled:opacity-75"
                    >
                      {savingStatus ? (
                        <span>Menyimpan...</span>
                      ) : (
                        <>
                          <span>Simpan & Lanjut Kandidat Berikutnya</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border-[3px] border-[#111827] rounded-3xl p-10 text-center text-gray-500 font-bold text-xs shadow-[4px_4px_0px_#111827]">
                  Pilih kandidat di daftar Leaderboard sebelah kiri untuk mulai verifikasi.
                </div>
              )}
            </div>

            {/* Right: Inline Document Viewer */}
            <div className="lg:col-span-4 space-y-4">
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
                  const fileUrl = fileObj ? fileObj.fileUrl || (fileObj.fileName ? `/api/files/${fileObj.fileName}` : null) : null;
                  const isImage = fileObj?.name && /\.(jpe?g|png|webp|gif)$/i.test(fileObj.name);

                  return (
                    <div className="bg-white border-[3px] border-[#111827] p-4 rounded-3xl shadow-[4px_4px_0px_#111827] flex flex-col max-h-[750px]">
                      <h4 className="font-black text-sm mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#1D4ED8]" />
                        <span>Pratinjau Berkas ({fileKeys.length})</span>
                      </h4>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {fileKeys.length === 0 ? (
                          <span className="text-[10px] text-gray-400 font-bold">Tidak ada berkas diunggah.</span>
                        ) : (
                          fileKeys.map((k) => (
                            <button
                              key={k}
                              type="button"
                              onClick={() => setActiveDocKey(k)}
                              className={`px-2 py-1 border border-[#111827] rounded-lg font-black text-[9px] uppercase cursor-pointer ${
                                activeDocKey === k
                                  ? 'bg-[#1D4ED8] text-white'
                                  : 'bg-[#FFFDF5] hover:bg-[#FEF9C3] text-[#111827]'
                              }`}
                            >
                              {DOC_LABELS[k] || k}
                            </button>
                          ))
                        )}
                      </div>

                      {fileObj && fileUrl && fileUrl !== '#' ? (
                        <div className="bg-white border-2 border-[#111827] rounded-2xl overflow-hidden flex flex-col flex-grow h-[580px]">
                          <div className="bg-[#EFF6FF] border-b border-[#111827] px-3 py-1.5 flex items-center justify-between text-[11px] font-bold shrink-0">
                            <span className="truncate max-w-[180px]" title={fileObj.name}>{fileObj.name}</span>
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#1D4ED8] underline flex items-center gap-1 font-extrabold"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Tab Baru</span>
                            </a>
                          </div>
                          <div className="bg-gray-100 flex-grow flex items-center justify-center overflow-auto p-1">
                            {isImage ? (
                              <img src={fileUrl} alt={fileObj.name} className="max-w-full max-h-full object-contain" />
                            ) : (
                              <iframe src={fileUrl} className="w-full h-full border-none" title={fileObj.name} />
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#FFFDF5] border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-400 font-bold text-xs flex-grow flex items-center justify-center h-[580px]">
                          Pilih berkas di atas untuk pratinjau langsung.
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="bg-white border-[3px] border-[#111827] rounded-3xl p-10 text-center text-gray-500 font-bold text-xs shadow-[4px_4px_0px_#111827]">
                  Pratinjau 13 dokumen pendaftar akan tampil di sini.
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

        {/* TAB 4: PENGUMUMAN & PANTUKHIR CONFIG */}
        {activeTab === 'announcement' && (
          <div className="bg-white border-[3px] border-[#111827] p-6 sm:p-8 rounded-3xl shadow-[6px_6px_0px_#111827] space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#111827] pb-4">
              <div>
                <h3 className="font-black text-lg">Pengaturan Rilis Pengumuman & Pantukhir BUKTY</h3>
                <p className="text-xs font-semibold text-gray-600">
                  Atur waktu hitung mundur, unggah berkas SK PDF, dan pasang tautan Grup WhatsApp resmi.
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
                1. Pengumuman Lolos Administrasi (Jadwal: 27 November 2026)
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
                  { key: 'file3', label: 'Dokumen 03 — Jadwal Konfirmasi (28–29 Nov 2026)', fileObj: file3 },
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
                2. Pengumuman Penerima BUKTY / Pantukhir (Jadwal: 30 November 2026)
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
                <span>{isSavingAnnouncement ? 'Menyimpan...' : 'Simpan Pengaturan Pengumuman'}</span>
              </button>
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
