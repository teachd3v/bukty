import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Upload,
  Download,
  Sparkles,
  User,
  GraduationCap,
  HeartHandshake,
  FileText,
  ShieldCheck,
  Link as LinkIcon,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import html2pdf from 'html2pdf.js';
import {
  AGAMA_LIST,
  PROVINSI_LIST,
  STATUS_YATIM_LIST,
  BANK_LIST,
  formatRupiah,
  isTargetProvince,
} from '../utils/buktyConfig';

const DRAFT_STORAGE_KEY = 'bukty_draft_v1';

export default function RegistrationFormModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submittedData, setSubmittedData] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  const [formData, setFormData] = useState({
    // Step 1: A. Data Pribadi
    nama: '',
    nik: '',
    ttl: '',
    gender: '',
    agama: '',
    provinsi: '',
    alamatDomisili: '',
    alamatKtp: '',
    noHp: '',
    email: '',
    instagram: '',
    followSosmed: '',

    // Step 2: B. Data Akademik
    statusMahasiswa: 'Mahasiswa Aktif',
    jenisPt: 'PTN',
    perguruanTinggi: '',
    fakultasProdi: '',
    jenjang: '',
    semester: '',
    nim: '',
    ipk: '',
    tahunKelulusan: '',
    nominalUkt: '',
    statusUkt: '',
    kendalaUkt: '',
    upayaUkt: '',
    pernahBeasiswaUkt: '',
    detailBeasiswaUktLama: '',
    sedangBeasiswaLain: '',
    detailBeasiswaLain: '',
    prestasiText: '',
    nomorRekening: '',
    bankRekening: '',
    atasNamaRekening: '',

    // Step 3: C & D. Ekonomi Keluarga, Status Yatim & Komitmen Sosial
    statusYatim: '',
    namaOrtu: '',
    pekerjaanOrtu: '',
    penghasilanOrtu: '',
    jumlahTanggungan: '',
    kondisiPekerjaan: '',
    statusRumah: '',
    kondisiKhusus: '',
    pengalamanSosial: '',
    bersediaProgramSosial: '',
    bersediaPublikasi: '',

    // Step 4: E. Unggah Dokumen
    uploadedFiles: {},

    // Step 5: F. Pernyataan Akhir
    pernyataan1: false,
    pernyataan2: false,
  });

  const [validationErrors, setValidationErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalBodyRef = useRef(null);

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        setFormData((prev) => ({ ...prev, ...JSON.parse(savedDraft) }));
      } catch (err) {}
    }
  }, []);

  const saveDraftToLocalStorage = (data) => {
    try {
      const cleanUploadedFiles = {};
      Object.keys(data.uploadedFiles || {}).forEach((k) => {
        const fileObj = data.uploadedFiles[k];
        if (fileObj) {
          const { previewUrl, ...rest } = fileObj;
          cleanUploadedFiles[k] = rest;
        }
      });
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ ...data, uploadedFiles: cleanUploadedFiles }));
    } catch (e) {}
  };

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    saveDraftToLocalStorage(updated);
  };

  const handleCurrencyChange = (field, rawValue) => {
    handleChange(field, formatRupiah(rawValue));
  };

  const handleFileUpload = (docKey, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setValidationErrors(['Ukuran berkas maksimal 5 MB per file. Silakan kompres berkas terlebih dahulu.']);
      modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|heic)$/i.test(file.name);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      const tempInfo = {
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        previewUrl: isImage ? base64Data : null,
        isUploading: true,
      };

      setFormData((prev) => ({
        ...prev,
        uploadedFiles: { ...prev.uploadedFiles, [docKey]: tempInfo },
      }));

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            type: file.type,
            base64: base64Data,
          }),
        });

        const json = await res.json();
        const finalInfo = {
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          fileName: json.fileName || file.name,
          fileUrl: json.fileUrl || `/api/files/${json.fileName}`,
          previewUrl: isImage ? base64Data : null,
          isUploading: false,
        };

        setFormData((prev) => {
          const updated = {
            ...prev,
            uploadedFiles: { ...prev.uploadedFiles, [docKey]: finalInfo },
          };
          saveDraftToLocalStorage(updated);
          return updated;
        });
      } catch (err) {
        const fallbackInfo = {
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
          previewUrl: isImage ? base64Data : null,
          isUploading: false,
        };
        setFormData((prev) => {
          const updated = {
            ...prev,
            uploadedFiles: { ...prev.uploadedFiles, [docKey]: fallbackInfo },
          };
          saveDraftToLocalStorage(updated);
          return updated;
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const totalSteps = 5;

  const validateStep = (step) => {
    const errors = [];
    const isMahasiswaBaru = formData.statusMahasiswa === 'Mahasiswa Baru';

    if (step === 1) {
      if (!formData.nama || !formData.nama.trim()) errors.push('Nama Lengkap wajib diisi sesuai KTP.');
      if (!formData.nik || !/^\d{16}$/.test(formData.nik.trim())) errors.push('NIK (No. KTP) wajib 16 digit angka.');
      if (!formData.ttl || !formData.ttl.trim()) errors.push('Tempat, Tanggal Lahir wajib diisi.');
      if (!formData.gender) errors.push('Jenis Kelamin wajib dipilih.');
      if (!formData.agama) errors.push('Agama wajib dipilih.');
      if (!formData.provinsi) errors.push('Provinsi wajib dipilih.');
      if (!formData.alamatDomisili || !formData.alamatDomisili.trim()) errors.push('Alamat Domisili Lengkap wajib diisi.');
      if (!formData.noHp || !formData.noHp.trim()) errors.push('No. HP / WhatsApp Aktif wajib diisi.');
      if (!formData.email || !formData.email.includes('@')) errors.push('Alamat Email Aktif tidak valid.');
      if (
        !formData.instagram ||
        (!formData.instagram.startsWith('http://') && !formData.instagram.startsWith('https://'))
      ) {
        errors.push('Akun Instagram wajib berupa tautan URL (contoh: https://www.instagram.com/username).');
      }
      if (!formData.followSosmed) errors.push('Konfirmasi follow @dompetdhuafa & @greatedunesia wajib dipilih.');
    } else if (step === 2) {
      if (!formData.statusMahasiswa) errors.push('Status Mahasiswa wajib dipilih.');
      if (!formData.jenisPt) errors.push('Jenis Perguruan Tinggi wajib dipilih.');
      if (!formData.perguruanTinggi || !formData.perguruanTinggi.trim()) errors.push('Nama Perguruan Tinggi wajib diisi.');
      if (!formData.fakultasProdi || !formData.fakultasProdi.trim()) errors.push('Fakultas / Program Studi wajib diisi.');
      if (!formData.jenjang) errors.push('Jenjang Pendidikan (S1 / D4) wajib dipilih.');
      if (!formData.semester) errors.push('Semester Saat Ini wajib diisi.');
      if (!isMahasiswaBaru && (!formData.nim || !formData.nim.trim())) errors.push('Nomor Induk Mahasiswa (NIM) wajib diisi.');
      if (!formData.ipk || !formData.ipk.trim()) {
        errors.push(isMahasiswaBaru ? 'Rata-rata Nilai Rapor wajib diisi.' : 'IPK Terakhir wajib diisi.');
      }
      if (!formData.tahunKelulusan) errors.push('Perkiraan Tahun Kelulusan wajib diisi.');
      if (!formData.nominalUkt || formData.nominalUkt === '0') errors.push('Nominal UKT per semester wajib diisi.');
      if (!formData.statusUkt) errors.push('Status Pembayaran UKT Semester Ini wajib dipilih.');
      if (formData.statusUkt === 'Belum Dibayarkan') {
        if (!formData.kendalaUkt || !formData.kendalaUkt.trim()) errors.push('Kendala pembayaran UKT wajib dijelaskan.');
        if (!formData.upayaUkt || !formData.upayaUkt.trim()) errors.push('Upaya mengatasi kendala UKT wajib dijelaskan.');
      }
      if (!formData.pernahBeasiswaUkt) errors.push('Riwayat bantuan/beasiswa UKT sebelumnya wajib dipilih.');
      if (!formData.sedangBeasiswaLain) errors.push('Status penerima beasiswa/bantuan pendidikan lain saat ini wajib dipilih.');
    } else if (step === 3) {
      if (!formData.statusYatim) errors.push('Status Orang Tua (Yatim / Piatu / Yatim Piatu / Lengkap) wajib dipilih.');
      if (!formData.namaOrtu || !formData.namaOrtu.trim()) errors.push('Nama Orang Tua / Wali wajib diisi.');
      if (!formData.pekerjaanOrtu || !formData.pekerjaanOrtu.trim()) errors.push('Pekerjaan Orang Tua / Wali wajib diisi.');
      if (!formData.penghasilanOrtu || formData.penghasilanOrtu === '0') errors.push('Penghasilan Orang Tua / Bulan wajib diisi.');
      if (!formData.jumlahTanggungan) errors.push('Jumlah Tanggungan Keluarga wajib diisi.');
      if (!formData.kondisiPekerjaan) errors.push('Kondisi pekerjaan orang tua/wali saat ini wajib dipilih.');
      if (!formData.statusRumah) errors.push('Status Rumah Tinggal wajib dipilih.');
      if (!formData.kondisiKhusus) errors.push('Kondisi khusus keluarga wajib dipilih.');
      if (!formData.pengalamanSosial || !formData.pengalamanSosial.trim()) {
        errors.push('Pengalaman aktivitas sosial berdampak bagi masyarakat wajib diisi.');
      }
      if (!formData.bersediaProgramSosial) {
        errors.push('Kesediaan dilibatkan dalam program sosial Dompet Dhuafa wajib dipilih.');
      }
      if (!formData.bersediaPublikasi) {
        errors.push('Kesediaan publikasi media sosial Dompet Dhuafa wajib dipilih.');
      }
    } else if (step === 4) {
      const isBaru = formData.statusMahasiswa === 'Mahasiswa Baru';
      const requiredDocs = [
        { key: 'bio', name: 'Biodata Diri (CV / Resume)' },
        { key: 'krs', name: 'Surat Keterangan Aktif Kuliah / Bukti KRS' },
        { key: 'rumahDepan', name: 'Foto Rumah (Tampak Depan)' },
        { key: 'rumahTamu', name: 'Foto Rumah (Ruang Tamu)' },
        { key: 'rumahSamping', name: 'Foto Rumah (Tampak Samping)' },
        { key: 'khs', name: isBaru ? 'Scan Rapor Terakhir (Mahasiswa Baru)' : 'Scan KHS Terakhir' },
        { key: 'ktp', name: 'Scan KTP' },
        { key: 'ktm', name: isBaru ? 'Scan Kartu Pelajar (Mahasiswa Baru)' : 'Scan KTM' },
        { key: 'sktm', name: 'Surat Keterangan Tidak Mampu (SKTM)' },
        { key: 'kk', name: 'Scan Kartu Keluarga (KK)' },
        { key: 'esai', name: 'Esai (1.000–1.500 Kata, TNR 12, Spasi 1,5)' },
        { key: 'slipUkt', name: 'Bukti Tagihan / Slip UKT dari Kampus' },
      ];
      requiredDocs.forEach((d) => {
        if (!formData.uploadedFiles[d.key]) {
          errors.push(`Berkas Wajib Belum Diunggah: ${d.name}`);
        }
      });
    }

    return errors;
  };

  const handleNextStep = () => {
    const errors = validateStep(currentStep);
    if (errors.length > 0) {
      setValidationErrors(errors);
      modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setValidationErrors([]);
    setCurrentStep((prev) => {
      const next = Math.min(totalSteps, prev + 1);
      setTimeout(() => modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
      return next;
    });
  };

  const handlePrevStep = () => {
    setValidationErrors([]);
    setCurrentStep((prev) => {
      const next = Math.max(1, prev - 1);
      setTimeout(() => modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
      return next;
    });
  };

  const handleJumpStep = (targetStep) => {
    setValidationErrors([]);
    setCurrentStep(targetStep);
    setTimeout(() => modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allErrors = [
      ...validateStep(1),
      ...validateStep(2),
      ...validateStep(3),
      ...validateStep(4),
    ];
    if (!formData.pernyataan1 || !formData.pernyataan2) {
      allErrors.push('Mohon centang seluruh kotak pernyataan persetujuan akhir.');
    }

    if (allErrors.length > 0) {
      setValidationErrors(allErrors);
      modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setValidationErrors([]);
    setIsSubmitting(true);

    const regId = 'BUKTY-2026-' + Math.floor(100000 + Math.random() * 900000);

    const cleanUploadedFiles = {};
    Object.keys(formData.uploadedFiles || {}).forEach((k) => {
      const f = formData.uploadedFiles[k];
      if (f) {
        const { previewUrl, isUploading, ...metadata } = f;
        cleanUploadedFiles[k] = metadata;
      }
    });

    const submissionResult = {
      ...formData,
      uploadedFiles: cleanUploadedFiles,
      regId,
      submittedAt: new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' }),
    };

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionResult),
      });

      const json = await res.json();
      if (!res.ok) {
        setIsSubmitting(false);
        setValidationErrors([json.message || 'Gagal menyimpan pendaftaran ke server database BUKTY.']);
        modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    } catch (err) {
      setIsSubmitting(false);
      setValidationErrors(['Terjadi kesalahan koneksi ke server database. Silakan coba kembali.']);
      modalBodyRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmittedData(submissionResult);
    setIsSubmitting(false);
    localStorage.removeItem(DRAFT_STORAGE_KEY);

    try {
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#1D4ED8', '#FFD60A', '#3B82F6', '#FACC15'],
      });
    } catch (e) {}
  };

  // Pure inline hex styling to avoid html2canvas Tailwind oklch error
  const handleDownloadPDF = async () => {
    const element = document.getElementById('pdf-download-content');
    if (!element) return;

    setIsGeneratingPdf(true);
    setPdfError(null);

    try {
      const opt = {
        margin: [8, 8, 8, 8],
        filename: `Bukti_Pendaftaran_BUKTY_${submittedData.regId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await html2pdf().set(opt).from(element).save();
      setIsGeneratingPdf(false);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      setIsGeneratingPdf(false);
      setPdfError(err?.message || 'Gagal memproses dokumen PDF. Silakan coba kembali.');
    }
  };

  if (!isOpen) return null;

  const isMaba = formData.statusMahasiswa === 'Mahasiswa Baru';

  const docSlots = [
    { key: 'bio', no: '1', name: 'Biodata Diri (CV / Resume) *', isRequired: true },
    { key: 'krs', no: '2', name: 'Surat Keterangan Aktif Kuliah atau Bukti KRS *', isRequired: true },
    { key: 'rumahDepan', no: '3', name: 'Foto Rumah (Tampak Depan) *', isRequired: true },
    { key: 'rumahTamu', no: '4', name: 'Foto Rumah (Ruang Tamu) *', isRequired: true },
    { key: 'rumahSamping', no: '5', name: 'Foto Rumah (Tampak Samping) *', isRequired: true },
    {
      key: 'khs',
      no: '6',
      name: isMaba ? 'Scan Rapor Terakhir (Mahasiswa Baru) *' : 'Scan KHS Terakhir (Mahasiswa Aktif) *',
      isRequired: true,
    },
    { key: 'ktp', no: '7', name: 'Scan KTP *', isRequired: true },
    {
      key: 'ktm',
      no: '8',
      name: isMaba ? 'Scan Kartu Pelajar (Mahasiswa Baru) *' : 'Scan KTM (Mahasiswa Aktif) *',
      isRequired: true,
    },
    { key: 'sktm', no: '9', name: 'Surat Keterangan Tidak Mampu (SKTM) Kelurahan/Desa *', isRequired: true },
    { key: 'kk', no: '10', name: 'Scan Kartu Keluarga (KK) *', isRequired: true },
    { key: 'prestasi1', no: '11a', name: 'Dokumen Prestasi 1 (Opsional / Jika Ada)', isRequired: false },
    { key: 'prestasi2', no: '11b', name: 'Dokumen Prestasi 2 (Opsional / Jika Ada)', isRequired: false },
    { key: 'prestasi3', no: '11c', name: 'Dokumen Prestasi 3 (Opsional / Jika Ada)', isRequired: false },
    { key: 'esai', no: '12', name: 'Esai (1.000–1.500 Kata, Times New Roman 12, Spasi 1,5) *', isRequired: true },
    { key: 'slipUkt', no: '13', name: 'Bukti Tagihan / Slip UKT dari Kampus *', isRequired: true },
    { key: 'suratYatim', no: '14', name: 'Surat Kematian Orang Tua / Keterangan Yatim (Opsional)', isRequired: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-[#FFFDF5] sm:bg-black/65 sm:backdrop-blur-sm overflow-y-auto id-printable-backdrop">
      <div className="bg-[#FFFDF5] border-0 sm:border-[3px] border-[#111827] w-full max-w-4xl rounded-none sm:rounded-3xl shadow-none sm:shadow-[8px_8px_0px_#111827] h-full sm:max-h-[94vh] flex flex-col overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="bg-[#1D4ED8] text-white border-b-[2.5px] border-[#111827] p-4 sm:p-5 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFD60A] text-[#111827] border-2 border-[#111827] rounded-xl flex items-center justify-center font-black shadow-[2px_2px_0px_#111827]">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base md:text-lg text-white">
                Formulir Pendaftaran BUKTY — Dompet Dhuafa
              </h3>
              <p className="text-[11px] font-bold text-blue-100 hidden sm:block">
                Bantuan UKT Yatim Periode 2027 — Langkah {currentStep} dari {totalSteps}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-white text-[#111827] border-2 border-[#111827] rounded-xl hover:bg-[#FFD60A] transition-colors cursor-pointer"
            aria-label="Tutup Formulir"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SUBMITTED RECEIPT VIEW */}
        {submittedData ? (
          <div ref={modalBodyRef} className="p-6 sm:p-8 space-y-6 overflow-y-auto text-[#111827]">
            <div className="no-print bg-[#DCFCE7] border-2 border-[#15803D] p-6 rounded-2xl text-center space-y-3">
              <div className="w-14 h-14 bg-[#15803D] text-white rounded-full mx-auto flex items-center justify-center border-2 border-[#111827] shadow-[2px_2px_0px_#111827]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black font-heading text-[#15803D]">PENDAFTARAN BUKTY BERHASIL DIKIRIM!</h3>
              <p className="text-xs font-bold text-gray-700">
                Seluruh data dan berkas Anda telah resmi tersimpan dalam sistem seleksi BUKTY. Simpan nomor registrasi dan unduh Bukti Pendaftaran PDF di bawah ini.
              </p>

              {pdfError && (
                <div className="bg-red-50 border-2 border-red-600 p-3 rounded-xl flex items-center justify-between text-left gap-3 text-xs">
                  <div className="flex items-center gap-2 text-red-700 font-bold">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span>{pdfError}</span>
                  </div>
                  <button onClick={() => setPdfError(null)} className="text-gray-500 hover:text-black font-extrabold">
                    ✕
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-md mx-auto">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="btn-yellow flex-1 py-3 text-xs disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isGeneratingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Unduh Bukti PDF</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setSubmittedData(null);
                    onClose();
                  }}
                  className="btn-primary flex-1 py-3 text-xs"
                >
                  Selesai
                </button>
              </div>
            </div>

            {/* Pure Inline Hex Receipt Document for html2pdf */}
            <div
              id="pdf-download-content"
              style={{
                backgroundColor: '#ffffff',
                color: '#111827',
                border: '2px solid #111827',
                borderRadius: '16px',
                padding: '24px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              <div
                style={{
                  borderBottom: '3px solid #1d4ed8',
                  paddingBottom: '16px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <img src="/logo-ge.png" alt="GREAT Edunesia" style={{ height: '24px', objectFit: 'contain' }} />
                    <img src="/Logo%20DD.png" alt="Dompet Dhuafa" style={{ height: '24px', objectFit: 'contain' }} />
                  </div>
                  <h2 style={{ fontSize: '19px', fontWeight: '900', color: '#111827', margin: 0 }}>
                    BUKTI PENDAFTARAN <span style={{ color: '#1d4ed8' }}>BUKTY 2026</span>
                  </h2>
                  <p style={{ fontSize: '10px', fontWeight: '700', color: '#4b5563', margin: '2px 0 0 0' }}>
                    Program Bantuan UKT Yatim — Dompet Dhuafa × GREAT Edunesia (Periode 2027)
                  </p>
                </div>
                <div
                  style={{
                    textAlign: 'right',
                    backgroundColor: '#fef9c3',
                    border: '2px solid #111827',
                    padding: '10px',
                    borderRadius: '12px',
                    minWidth: '150px',
                  }}
                >
                  <div style={{ fontSize: '9px', fontWeight: '800', color: '#4b5563', textTransform: 'uppercase' }}>
                    NO. REGISTRASI
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '900', color: '#1d4ed8', fontFamily: 'monospace' }}>
                    {submittedData.regId}
                  </div>
                  <div style={{ fontSize: '9px', fontWeight: '700', color: '#4b5563', marginTop: '2px' }}>
                    {submittedData.submittedAt}
                  </div>
                </div>
              </div>

              {/* Section A */}
              <div style={{ marginBottom: '14px' }}>
                <div
                  style={{
                    backgroundColor: '#1d4ed8',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '800',
                  }}
                >
                  A. DATA PRIBADI
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '6px 14px',
                    fontSize: '10.5px',
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    marginTop: '6px',
                  }}
                >
                  <div><span style={{ color: '#64748b' }}>Nama Lengkap:</span> <strong style={{ textTransform: 'uppercase' }}>{submittedData.nama}</strong></div>
                  <div><span style={{ color: '#64748b' }}>NIK:</span> <strong>{submittedData.nik}</strong></div>
                  <div><span style={{ color: '#64748b' }}>TTL:</span> <strong>{submittedData.ttl}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Jenis Kelamin / Agama:</span> <strong>{submittedData.gender} / {submittedData.agama}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Provinsi:</span> <strong>{submittedData.provinsi}</strong></div>
                  <div><span style={{ color: '#64748b' }}>No. WA / HP:</span> <strong>{submittedData.noHp}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Email:</span> <strong>{submittedData.email}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Instagram:</span> <strong style={{ color: '#1d4ed8' }}>{submittedData.instagram}</strong></div>
                  <div style={{ gridColumn: 'span 2' }}><span style={{ color: '#64748b' }}>Alamat Domisili:</span> <strong>{submittedData.alamatDomisili}</strong></div>
                  {submittedData.alamatKtp && <div style={{ gridColumn: 'span 2' }}><span style={{ color: '#64748b' }}>Alamat KTP:</span> <strong>{submittedData.alamatKtp}</strong></div>}
                  <div><span style={{ color: '#64748b' }}>Follow Sosmed:</span> <strong style={{ color: '#15803d' }}>{submittedData.followSosmed}</strong></div>
                </div>
              </div>

              {/* Section B */}
              <div style={{ marginBottom: '14px' }}>
                <div
                  style={{
                    backgroundColor: '#1d4ed8',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '800',
                  }}
                >
                  B. DATA AKADEMIK & UKT
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '6px 14px',
                    fontSize: '10.5px',
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    marginTop: '6px',
                  }}
                >
                  <div><span style={{ color: '#64748b' }}>Perguruan Tinggi:</span> <strong>{submittedData.perguruanTinggi} ({submittedData.jenisPt})</strong></div>
                  <div><span style={{ color: '#64748b' }}>Fakultas / Prodi:</span> <strong>{submittedData.fakultasProdi}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Jenjang / Semester:</span> <strong>{submittedData.jenjang} / Sem {submittedData.semester} ({submittedData.statusMahasiswa})</strong></div>
                  <div><span style={{ color: '#64748b' }}>NIM:</span> <strong>{submittedData.nim || '-'}</strong></div>
                  <div><span style={{ color: '#64748b' }}>{submittedData.statusMahasiswa === 'Mahasiswa Baru' ? 'Nilai Rapor:' : 'IPK Terakhir:'}</span> <strong style={{ color: '#1d4ed8' }}>{submittedData.ipk}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Perkiraan Lulus:</span> <strong>{submittedData.tahunKelulusan}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Nominal UKT / Smt:</span> <strong style={{ color: '#15803d' }}>Rp {submittedData.nominalUkt}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Status Pembayaran:</span> <strong>{submittedData.statusUkt}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Riwayat Bantuan UKT:</span> <strong>{submittedData.pernahBeasiswaUkt}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Beasiswa Aktif Lain:</span> <strong>{submittedData.sedangBeasiswaLain}</strong></div>
                  <div style={{ gridColumn: 'span 2' }}><span style={{ color: '#64748b' }}>Informasi Rekening:</span> <strong>{submittedData.bankRekening || '-'} {submittedData.nomorRekening || ''} {submittedData.atasNamaRekening ? `(a.n ${submittedData.atasNamaRekening})` : ''}</strong></div>
                </div>
              </div>

              {/* Section C & D */}
              <div style={{ marginBottom: '14px' }}>
                <div
                  style={{
                    backgroundColor: '#1d4ed8',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '800',
                  }}
                >
                  C & D. EKONOMI KELUARGA, STATUS YATIM & KOMITMEN SOSIAL
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '6px 14px',
                    fontSize: '10.5px',
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    marginTop: '6px',
                  }}
                >
                  <div><span style={{ color: '#64748b' }}>Status Orang Tua:</span> <strong style={{ color: '#1d4ed8' }}>{submittedData.statusYatim}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Nama Ortu / Wali:</span> <strong>{submittedData.namaOrtu}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Pekerjaan Ortu:</span> <strong>{submittedData.pekerjaanOrtu} ({submittedData.kondisiPekerjaan})</strong></div>
                  <div><span style={{ color: '#64748b' }}>Penghasilan / Bln:</span> <strong style={{ color: '#15803d' }}>Rp {submittedData.penghasilanOrtu}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Tanggungan / Rumah:</span> <strong>{submittedData.jumlahTanggungan} Orang / {submittedData.statusRumah}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Kondisi Khusus:</span> <strong>{submittedData.kondisiKhusus}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Bersedia Program Sosial DD:</span> <strong style={{ color: '#15803d' }}>{submittedData.bersediaProgramSosial}</strong></div>
                  <div><span style={{ color: '#64748b' }}>Bersedia Publikasi Medsos:</span> <strong style={{ color: '#15803d' }}>{submittedData.bersediaPublikasi}</strong></div>
                </div>
              </div>

              {/* Section E */}
              <div style={{ marginBottom: '14px' }}>
                <div
                  style={{
                    backgroundColor: '#1d4ed8',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '800',
                  }}
                >
                  E. KELENGKAPAN DOKUMEN TERLAMPIR
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '4px 14px',
                    fontSize: '9.5px',
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    marginTop: '6px',
                  }}
                >
                  {docSlots.map((doc) => {
                    const uploaded = submittedData.uploadedFiles[doc.key];
                    return (
                      <div
                        key={doc.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid #e2e8f0',
                          padding: '2px 0',
                        }}
                      >
                        <span style={{ color: '#475569', fontWeight: '600' }}>{doc.no}. {doc.name.replace(' *', '')}</span>
                        <span style={{ color: uploaded ? '#15803d' : '#94a3b8', fontWeight: uploaded ? '800' : '500' }}>
                          {uploaded ? 'Terlampir' : '-'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  borderTop: '1px solid #cbd5e1',
                  paddingTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '9.5px',
                  color: '#64748b',
                  fontWeight: '700',
                }}
              >
                <p style={{ margin: 0 }}>Dokumen ini diterbitkan otomatis oleh Sistem Seleksi BUKTY — Dompet Dhuafa.</p>
                <div style={{ color: '#111827', fontWeight: '900' }}>Panitia Seleksi BUKTY 2026</div>
              </div>
            </div>
          </div>
        ) : (
          /* MULTI-STEP FORM BODY */
          <div ref={modalBodyRef} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
            {/* Step Wizard Progress Bar */}
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {[
                { step: 1, label: 'Data Pribadi', icon: User },
                { step: 2, label: 'Akademik & UKT', icon: GraduationCap },
                { step: 3, label: 'Keluarga & Sosial', icon: HeartHandshake },
                { step: 4, label: 'Unggah 13 Berkas', icon: FileText },
                { step: 5, label: 'Pernyataan', icon: ShieldCheck },
              ].map((item) => {
                const IconComp = item.icon;
                const isActive = currentStep === item.step;
                const isDone = currentStep > item.step;
                return (
                  <button
                    key={item.step}
                    type="button"
                    onClick={() => handleJumpStep(item.step)}
                    className="flex flex-col items-center gap-1.5 flex-1 group cursor-pointer border-0 bg-transparent focus:outline-none"
                    title={`Pindah ke ${item.label}`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl border-2 border-[#111827] flex items-center justify-center font-black text-xs transition-all group-hover:scale-105 ${
                        isActive
                          ? 'bg-[#FFD60A] text-[#111827] shadow-[3px_3px_0px_#111827] scale-105'
                          : isDone
                          ? 'bg-[#1D4ED8] text-white shadow-[2px_2px_0px_#111827]'
                          : 'bg-white text-gray-500 hover:bg-[#EFF6FF]'
                      }`}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] font-extrabold hidden sm:block transition-colors ${
                        isActive ? 'text-[#1D4ED8]' : 'text-gray-500'
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Validation Errors Alert */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border-2 border-red-600 p-4 rounded-2xl space-y-2 shadow-[3px_3px_0px_#DC2626]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-red-700 text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Mohon Lengkapi Kolom Berikut ({validationErrors.length})</span>
                  </div>
                  <button
                    onClick={() => setValidationErrors([])}
                    className="text-gray-500 hover:text-black font-extrabold text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <ul className="list-disc list-inside text-xs font-bold text-red-700 space-y-1 pt-1">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* STEP 1: A. Data Pribadi */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="border-b-2 border-[#111827] pb-2 flex items-center justify-between">
                  <h4 className="font-black text-base text-[#111827]">A. Data Pribadi</h4>
                  <span className="text-[10px] font-black bg-[#FEF9C3] border border-[#111827] px-2.5 py-0.5 rounded-full">
                    Isi sesuai KTP
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Nama Lengkap *</label>
                    <input
                      type="text"
                      className="form-input uppercase"
                      placeholder="Nama Lengkap Sesuai KTP"
                      value={formData.nama}
                      onChange={(e) => handleChange('nama', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">NIK (No. KTP — 16 Digit) *</label>
                    <input
                      type="text"
                      maxLength="16"
                      className="form-input font-mono-code"
                      placeholder="3271000000000000"
                      value={formData.nik}
                      onChange={(e) => handleChange('nik', e.target.value.replace(/\D/g, ''))}
                    />
                  </div>

                  <div>
                    <label className="form-label">Tempat, Tanggal Lahir *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Bandung, 17 Agustus 2005"
                      value={formData.ttl}
                      onChange={(e) => handleChange('ttl', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">Jenis Kelamin *</label>
                    <div className="flex gap-5 pt-2">
                      {['Laki-laki', 'Perempuan'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                          <input
                            type="radio"
                            name="gender"
                            value={opt}
                            checked={formData.gender === opt}
                            onChange={(e) => handleChange('gender', e.target.value)}
                            className="accent-[#1D4ED8]"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Agama *</label>
                    <select
                      className="form-select font-bold"
                      value={formData.agama}
                      onChange={(e) => handleChange('agama', e.target.value)}
                    >
                      <option value="">-- Pilih Agama --</option>
                      {AGAMA_LIST.map((ag) => (
                        <option key={ag} value={ag}>
                          {ag}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Provinsi *</label>
                    <select
                      className="form-select font-bold"
                      value={formData.provinsi}
                      onChange={(e) => handleChange('provinsi', e.target.value)}
                    >
                      <option value="">-- Pilih Provinsi --</option>
                      {PROVINSI_LIST.map((prov) => (
                        <option key={prov} value={prov}>
                          {prov}
                        </option>
                      ))}
                    </select>
                    {formData.provinsi && !isTargetProvince(formData.provinsi) && (
                      <span className="text-[10px] font-bold text-amber-700 mt-1 block">
                        Catatan: Program BUKTY diprioritaskan bagi 12 provinsi wilayah program.
                      </span>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="form-label">Alamat Domisili Lengkap *</label>
                    <textarea
                      rows="2"
                      className="form-textarea"
                      placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten..."
                      value={formData.alamatDomisili}
                      onChange={(e) => handleChange('alamatDomisili', e.target.value)}
                    ></textarea>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="form-label">Alamat KTP (jika berbeda)</label>
                    <textarea
                      rows="2"
                      className="form-textarea"
                      placeholder="Kosongkan jika sama dengan alamat domisili"
                      value={formData.alamatKtp}
                      onChange={(e) => handleChange('alamatKtp', e.target.value)}
                    ></textarea>
                  </div>

                  <div>
                    <label className="form-label">No. HP / WhatsApp Aktif *</label>
                    <input
                      type="tel"
                      className="form-input font-mono-code"
                      placeholder="081234567890"
                      value={formData.noHp}
                      onChange={(e) => handleChange('noHp', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">Alamat Email Aktif *</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="nama@mahasiswa.ac.id"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">Akun Instagram (Wajib Link URL) *</label>
                    <div className="flex border-2 border-[#111827] rounded-xl overflow-hidden bg-white">
                      <span className="bg-[#EFF6FF] border-r-2 border-[#111827] px-3 py-2.5 flex items-center shrink-0">
                        <LinkIcon className="w-4 h-4 text-[#1D4ED8]" />
                      </span>
                      <input
                        type="url"
                        className="w-full px-3 py-2.5 outline-none font-medium text-xs sm:text-sm bg-transparent"
                        placeholder="https://www.instagram.com/username"
                        value={formData.instagram}
                        onChange={(e) => handleChange('instagram', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Follow @dompetdhuafa & @greatedunesia? *</label>
                    <div className="flex gap-6 pt-2">
                      {['Ya', 'Tidak'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                          <input
                            type="radio"
                            name="followSosmed"
                            value={opt}
                            checked={formData.followSosmed === opt}
                            onChange={(e) => handleChange('followSosmed', e.target.value)}
                            className="accent-[#1D4ED8]"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: B. Data Akademik */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="border-b-2 border-[#111827] pb-2">
                  <h4 className="font-black text-base text-[#111827]">B. Data Akademik & UKT</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#EFF6FF] border-2 border-[#111827] p-4 rounded-2xl">
                  <div>
                    <label className="form-label mb-2 block">Status Mahasiswa *</label>
                    <div className="flex gap-4">
                      {['Mahasiswa Aktif', 'Mahasiswa Baru'].map((status) => (
                        <label key={status} className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                          <input
                            type="radio"
                            name="statusMahasiswa"
                            value={status}
                            checked={formData.statusMahasiswa === status}
                            onChange={(e) => handleChange('statusMahasiswa', e.target.value)}
                            className="accent-[#1D4ED8]"
                          />
                          <span>{status}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="form-label mb-2 block">Jenis Perguruan Tinggi *</label>
                    <div className="flex gap-4">
                      {[
                        { val: 'PTN', label: 'PTN (Negeri)' },
                        { val: 'PTS', label: 'PTS / Lainnya' },
                      ].map((opt) => (
                        <label key={opt.val} className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                          <input
                            type="radio"
                            name="jenisPt"
                            value={opt.val}
                            checked={formData.jenisPt === opt.val}
                            onChange={(e) => handleChange('jenisPt', e.target.value)}
                            className="accent-[#1D4ED8]"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {isMaba && (
                    <p className="sm:col-span-2 text-[11px] font-bold text-[#1D4ED8]">
                      Info Mahasiswa Baru: NIM bersifat opsional, IPK diganti Rata-rata Nilai Rapor, dan KHS/KTM dapat menggunakan Rapor/Kartu Pelajar.
                    </p>
                  )}
                  {formData.jenisPt === 'PTS' && (
                    <p className="sm:col-span-2 text-[11px] font-bold text-amber-700">
                      Catatan: Persyaratan resmi BUKTY dikhususkan bagi Perguruan Tinggi Negeri (PTN).
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Nama Perguruan Tinggi *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Universitas Gadjah Mada / Universitas Indonesia"
                      value={formData.perguruanTinggi}
                      onChange={(e) => handleChange('perguruanTinggi', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">Fakultas / Program Studi *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Contoh: Fakultas Teknik / Teknik Informatika"
                      value={formData.fakultasProdi}
                      onChange={(e) => handleChange('fakultasProdi', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">Jenjang Pendidikan *</label>
                    <div className="flex gap-6 pt-2">
                      {['S1', 'D4'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                          <input
                            type="radio"
                            name="jenjang"
                            value={opt}
                            checked={formData.jenjang === opt}
                            onChange={(e) => handleChange('jenjang', e.target.value)}
                            className="accent-[#1D4ED8]"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Semester Saat Ini *</label>
                    <input
                      type="number"
                      min="1"
                      max="14"
                      className="form-input font-bold"
                      placeholder="Contoh: 3"
                      value={formData.semester}
                      onChange={(e) => handleChange('semester', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      Nomor Induk Mahasiswa (NIM){isMaba ? ' (Opsional)' : ' *'}
                    </label>
                    <input
                      type="text"
                      className="form-input font-mono-code"
                      placeholder={isMaba ? 'NIM (jika sudah terbit)' : 'NIM Mahasiswa'}
                      value={formData.nim}
                      onChange={(e) => handleChange('nim', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      {isMaba ? 'Rata-rata Nilai Rapor *' : 'IPK Terakhir (Min. 3,00) *'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max={isMaba ? '100' : '4.00'}
                      className="form-input font-bold"
                      placeholder={isMaba ? 'Contoh: 89.5' : 'Contoh: 3.65'}
                      value={formData.ipk}
                      onChange={(e) => handleChange('ipk', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">Perkiraan Tahun Kelulusan *</label>
                    <input
                      type="number"
                      placeholder="Contoh: 2028"
                      className="form-input font-bold"
                      value={formData.tahunKelulusan}
                      onChange={(e) => handleChange('tahunKelulusan', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">Nominal UKT per Semester *</label>
                    <div className="flex border-2 border-[#111827] rounded-xl overflow-hidden bg-white">
                      <span className="bg-[#FEF9C3] border-r-2 border-[#111827] px-3.5 py-2.5 text-xs font-black flex items-center shrink-0">
                        Rp
                      </span>
                      <input
                        type="text"
                        className="w-full px-3 py-2.5 outline-none font-bold text-xs sm:text-sm bg-transparent"
                        placeholder="3.000.000"
                        value={formData.nominalUkt}
                        onChange={(e) => handleCurrencyChange('nominalUkt', e.target.value)}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-[#1D4ED8] mt-1 block">
                      Plafon bantuan BUKTY maks. Rp3.000.000/semester (2 semester 2027).
                    </span>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="form-label">Status Pembayaran UKT Semester Ini *</label>
                    <div className="flex flex-wrap gap-5 pt-1">
                      {['Sudah Dibayarkan', 'Belum Dibayarkan'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                          <input
                            type="radio"
                            name="statusUkt"
                            value={opt}
                            checked={formData.statusUkt === opt}
                            onChange={(e) => handleChange('statusUkt', e.target.value)}
                            className="accent-[#1D4ED8]"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {formData.statusUkt === 'Belum Dibayarkan' && (
                    <div className="sm:col-span-2 bg-[#FEF9C3]/60 border-2 border-[#111827] p-4 rounded-2xl space-y-3">
                      <div>
                        <label className="form-label">Jika belum, apa kendala pembayaran UKT? *</label>
                        <textarea
                          rows="2"
                          className="form-textarea"
                          placeholder="Jelaskan kendala pembayaran UKT yang dihadapi..."
                          value={formData.kendalaUkt}
                          onChange={(e) => handleChange('kendalaUkt', e.target.value)}
                        ></textarea>
                      </div>
                      <div>
                        <label className="form-label">Apa upaya yang telah Anda lakukan untuk mengatasi kendala tersebut? *</label>
                        <textarea
                          rows="2"
                          className="form-textarea"
                          placeholder="Jelaskan upaya kerja paruh waktu / pengajuan keringanan / dll..."
                          value={formData.upayaUkt}
                          onChange={(e) => handleChange('upayaUkt', e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="form-label">Apakah pernah mendapatkan keringanan/beasiswa/bantuan UKT sebelumnya? *</label>
                    <div className="flex gap-6 pt-1">
                      {['Pernah', 'Tidak Pernah'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                          <input
                            type="radio"
                            name="pernahBeasiswaUkt"
                            value={opt}
                            checked={formData.pernahBeasiswaUkt === opt}
                            onChange={(e) => handleChange('pernahBeasiswaUkt', e.target.value)}
                            className="accent-[#1D4ED8]"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {formData.pernahBeasiswaUkt === 'Pernah' && (
                    <div className="sm:col-span-2 bg-[#EFF6FF] border border-[#111827] p-3 rounded-xl">
                      <label className="form-label">Sebutkan nama bantuan dan tahun penerimaannya:</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Contoh: Bantuan UKT Kampus 2024"
                        value={formData.detailBeasiswaUktLama}
                        onChange={(e) => handleChange('detailBeasiswaUktLama', e.target.value)}
                      />
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="form-label">Apakah saat ini sedang menerima beasiswa/bantuan pendidikan lain atau ikatan dinas? *</label>
                    <div className="flex gap-6 pt-1">
                      {['Ya', 'Tidak'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                          <input
                            type="radio"
                            name="sedangBeasiswaLain"
                            value={opt}
                            checked={formData.sedangBeasiswaLain === opt}
                            onChange={(e) => handleChange('sedangBeasiswaLain', e.target.value)}
                            className="accent-[#1D4ED8]"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {formData.sedangBeasiswaLain === 'Ya' && (
                    <div className="sm:col-span-2 bg-[#EFF6FF] border border-[#111827] p-3 rounded-xl">
                      <label className="form-label">Jika ya, sebutkan nama dan nominal bantuannya:</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Contoh: Beasiswa Pemda Rp2.000.000"
                        value={formData.detailBeasiswaLain}
                        onChange={(e) => handleChange('detailBeasiswaLain', e.target.value)}
                      />
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="form-label">Prestasi akademik/nonakademik yang pernah diraih</label>
                    <textarea
                      rows="2"
                      className="form-textarea"
                      placeholder="Sebutkan prestasi / penghargaan (opsional)..."
                      value={formData.prestasiText}
                      onChange={(e) => handleChange('prestasiText', e.target.value)}
                    ></textarea>
                  </div>

                  <div>
                    <label className="form-label">Informasi Rekening — Nama Bank</label>
                    <select
                      className="form-select font-bold"
                      value={formData.bankRekening}
                      onChange={(e) => handleChange('bankRekening', e.target.value)}
                    >
                      <option value="">-- Pilih Bank --</option>
                      {BANK_LIST.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Nomor Rekening</label>
                    <input
                      type="text"
                      className="form-input font-mono-code"
                      placeholder="Contoh: 1234567890"
                      value={formData.nomorRekening}
                      onChange={(e) => handleChange('nomorRekening', e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="form-label">Atas Nama Rekening</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nama pemilik rekening sesuai buku tabungan"
                      value={formData.atasNamaRekening}
                      onChange={(e) => handleChange('atasNamaRekening', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: C & D. Ekonomi Keluarga, Status Yatim & Komitmen Sosial */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="border-b-2 border-[#111827] pb-2">
                  <h4 className="font-black text-base text-[#111827]">
                    C & D. Data Ekonomi Keluarga, Status Yatim & Komitmen Sosial
                  </h4>
                </div>

                {/* Highlight Status Orang Tua (Prioritas Yatim) */}
                <div className="bg-[#FEF9C3] border-2 border-[#111827] p-4 rounded-2xl space-y-2 shadow-[3px_3px_0px_#111827]">
                  <label className="form-label text-[#111827]">Status Orang Tua (Prioritas Utama BUKTY) *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {STATUS_YATIM_LIST.map((opt) => (
                      <label
                        key={opt}
                        className={`flex items-center gap-2 cursor-pointer font-extrabold text-xs p-2.5 rounded-xl border-2 transition-colors ${
                          formData.statusYatim === opt
                            ? 'bg-[#1D4ED8] text-white border-[#111827]'
                            : 'bg-white text-[#111827] border-[#111827] hover:bg-[#EFF6FF]'
                        }`}
                      >
                        <input
                          type="radio"
                          name="statusYatim"
                          value={opt}
                          checked={formData.statusYatim === opt}
                          onChange={(e) => handleChange('statusYatim', e.target.value)}
                          className="accent-[#FFD60A]"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Nama Orang Tua / Wali *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nama Orang Tua / Wali"
                      value={formData.namaOrtu}
                      onChange={(e) => handleChange('namaOrtu', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">Pekerjaan Orang Tua / Wali *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Pekerjaan saat ini"
                      value={formData.pekerjaanOrtu}
                      onChange={(e) => handleChange('pekerjaanOrtu', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">Penghasilan Orang Tua / Bulan *</label>
                    <div className="flex border-2 border-[#111827] rounded-xl overflow-hidden bg-white">
                      <span className="bg-[#FEF9C3] border-r-2 border-[#111827] px-3.5 py-2.5 text-xs font-black flex items-center shrink-0">
                        Rp
                      </span>
                      <input
                        type="text"
                        className="w-full px-3 py-2.5 outline-none font-bold text-xs sm:text-sm bg-transparent"
                        placeholder="1.500.000"
                        value={formData.penghasilanOrtu}
                        onChange={(e) => handleCurrencyChange('penghasilanOrtu', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Jumlah Tanggungan Keluarga *</label>
                    <input
                      type="number"
                      min="1"
                      className="form-input font-bold"
                      placeholder="Jumlah anggota keluarga ditanggung"
                      value={formData.jumlahTanggungan}
                      onChange={(e) => handleChange('jumlahTanggungan', e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="form-label">Kondisi pekerjaan orang tua/wali saat ini *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {['Stabil', 'Tidak Tetap', 'Mengalami penurunan pendapatan', 'Tidak Bekerja'].map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 cursor-pointer font-bold text-xs bg-[#EFF6FF] border border-[#111827] p-2.5 rounded-xl"
                        >
                          <input
                            type="radio"
                            name="kondisiPekerjaan"
                            value={opt}
                            checked={formData.kondisiPekerjaan === opt}
                            onChange={(e) => handleChange('kondisiPekerjaan', e.target.value)}
                            className="accent-[#1D4ED8]"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="form-label">Status Rumah Tinggal *</label>
                    <div className="flex flex-wrap gap-5 pt-1">
                      {['Milik Sendiri', 'Sewa', 'Menumpang'].map((opt) => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                          <input
                            type="radio"
                            name="statusRumah"
                            value={opt}
                            checked={formData.statusRumah === opt}
                            onChange={(e) => handleChange('statusRumah', e.target.value)}
                            className="accent-[#1D4ED8]"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="form-label">
                      Apakah terdapat kondisi khusus yang berdampak terhadap kemampuan keluarga membayar UKT? *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {[
                        'Orang tua/wali kehilangan pekerjaan',
                        'Orang tua/wali meninggal',
                        'Bencana/musibah',
                        'Memiliki banyak tanggungan pendidikan',
                        'Kondisi lainnya',
                        'Tidak ada',
                      ].map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 cursor-pointer font-bold text-xs bg-[#EFF6FF] border border-[#111827] p-2.5 rounded-xl"
                        >
                          <input
                            type="radio"
                            name="kondisiKhusus"
                            value={opt}
                            checked={formData.kondisiKhusus === opt}
                            onChange={(e) => handleChange('kondisiKhusus', e.target.value)}
                            className="accent-[#1D4ED8]"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Section D: Aktivitas Sosial & Komitmen */}
                  <div className="sm:col-span-2 pt-3 border-t-2 border-[#111827]/20 space-y-4">
                    <div>
                      <label className="form-label">
                        Pengalaman Aktivitas Sosial yang Memberikan Dampak Kebermanfaatan bagi Masyarakat *
                      </label>
                      <textarea
                        rows="3"
                        className="form-textarea"
                        placeholder="Ceritakan pengalaman kegiatan kerelawanan, sosial, pemberdayaan masyarakat, atau organisasi sosial yang pernah Anda jalankan..."
                        value={formData.pengalamanSosial}
                        onChange={(e) => handleChange('pengalamanSosial', e.target.value)}
                      ></textarea>
                    </div>

                    <div>
                      <label className="form-label">
                        Bersedia dilibatkan sewaktu-waktu dalam program sosial dan pemberdayaan masyarakat Dompet Dhuafa? *
                      </label>
                      <div className="flex gap-6 pt-1">
                        {['Ya', 'Tidak'].map((opt) => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                            <input
                              type="radio"
                              name="bersediaProgramSosial"
                              value={opt}
                              checked={formData.bersediaProgramSosial === opt}
                              onChange={(e) => handleChange('bersediaProgramSosial', e.target.value)}
                              className="accent-[#1D4ED8]"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="form-label">
                        Bersedia dipublikasikan di media sosial Dompet Dhuafa dan jejaringnya sebagai penerima Bantuan UKT Yatim? *
                      </label>
                      <div className="flex gap-6 pt-1">
                        {['Ya', 'Tidak'].map((opt) => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                            <input
                              type="radio"
                              name="bersediaPublikasi"
                              value={opt}
                              checked={formData.bersediaPublikasi === opt}
                              onChange={(e) => handleChange('bersediaPublikasi', e.target.value)}
                              className="accent-[#1D4ED8]"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: E. Unggah 13 Dokumen */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="border-b-2 border-[#111827] pb-2">
                  <h4 className="font-black text-base text-[#111827]">E. Unggah Dokumen Persyaratan (13 Berkas)</h4>
                  <p className="text-xs font-semibold text-gray-600">
                    Unggah seluruh dokumen bertanda * (Format PDF / JPG / PNG / DOCX, maksimal 5 MB per file).
                  </p>
                </div>

                <div className="space-y-3">
                  {docSlots.map((doc) => {
                    const uploaded = formData.uploadedFiles[doc.key];
                    return (
                      <div
                        key={doc.key}
                        className={`border-2 border-[#111827] p-3 rounded-2xl flex items-center justify-between gap-3 ${
                          uploaded ? 'bg-[#DCFCE7] border-[#15803D]' : 'bg-white'
                        }`}
                      >
                        <div className="min-w-0 flex-1 flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-[#FFD60A] border-2 border-[#111827] flex items-center justify-center font-mono-code font-black text-[11px] shrink-0">
                            {doc.no}
                          </span>

                          {uploaded && uploaded.previewUrl ? (
                            <img
                              src={uploaded.previewUrl}
                              alt={uploaded.name}
                              className="w-10 h-10 object-cover rounded-xl border-2 border-[#111827] shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#111827] flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5 text-[#1D4ED8]" />
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-[#111827] leading-snug">{doc.name}</p>
                            {uploaded ? (
                              <p className="text-[10px] font-bold text-[#15803D] truncate">
                                {uploaded.isUploading
                                  ? 'Mengunggah ke server...'
                                  : `Terlampir — ${uploaded.name} (${uploaded.size})`}
                              </p>
                            ) : (
                              <p className="text-[10px] text-gray-500 font-semibold">
                                {doc.isRequired ? 'Wajib diunggah' : 'Opsional'}
                              </p>
                            )}
                          </div>
                        </div>

                        <label
                          className={`py-1.5 px-3.5 rounded-xl text-xs font-black shrink-0 cursor-pointer border-2 border-[#111827] flex items-center gap-1.5 transition-colors ${
                            uploaded
                              ? 'bg-[#FFD60A] text-[#111827] shadow-[2px_2px_0px_#111827] hover:bg-[#1D4ED8] hover:text-white'
                              : 'bg-white text-[#111827] hover:bg-[#EFF6FF]'
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploaded ? 'Ganti' : 'Pilih File'}</span>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.heic"
                            onChange={(e) => handleFileUpload(doc.key, e)}
                          />
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 5: F. Pernyataan Akhir */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="border-b-2 border-[#111827] pb-2">
                  <h4 className="font-black text-base text-[#111827]">F. Pernyataan Akhir</h4>
                  <p className="text-xs font-semibold text-gray-600">
                    Pastikan seluruh data sudah benar sebelum mengirimkan pendaftaran Program BUKTY.
                  </p>
                </div>

                {/* Quick Summary Strip */}
                <div className="bg-[#EFF6FF] border-2 border-[#111827] p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
                  <div><span className="text-gray-500">Nama:</span> <strong className="uppercase">{formData.nama || '-'}</strong></div>
                  <div><span className="text-gray-500">NIK:</span> <strong className="font-mono-code">{formData.nik || '-'}</strong></div>
                  <div><span className="text-gray-500">Kampus:</span> <strong>{formData.perguruanTinggi || '-'} ({formData.jenisPt})</strong></div>
                  <div><span className="text-gray-500">Provinsi:</span> <strong>{formData.provinsi || '-'}</strong></div>
                  <div><span className="text-gray-500">Status Orang Tua:</span> <strong className="text-[#1D4ED8]">{formData.statusYatim || '-'}</strong></div>
                  <div><span className="text-gray-500">Berkas Terunggah:</span> <strong>{Object.keys(formData.uploadedFiles || {}).length} File</strong></div>
                </div>

                <div className="bg-white border-2 border-[#111827] p-5 rounded-2xl space-y-4 shadow-[4px_4px_0px_#111827]">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox mt-1 shrink-0"
                      checked={formData.pernyataan1}
                      onChange={(e) => handleChange('pernyataan1', e.target.checked)}
                    />
                    <span className="text-xs font-extrabold text-[#111827] leading-relaxed">
                      Saya menyatakan seluruh data yang diisi pada formulir ini adalah benar dan dapat dipertanggungjawabkan.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="form-checkbox mt-1 shrink-0"
                      checked={formData.pernyataan2}
                      onChange={(e) => handleChange('pernyataan2', e.target.checked)}
                    />
                    <span className="text-xs font-extrabold text-[#111827] leading-relaxed">
                      Saya bersedia mengikuti seluruh tahapan seleksi sesuai jadwal yang ditentukan oleh panitia.
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer Navigation */}
        {!submittedData && (
          <div className="bg-[#EFF6FF] border-t-2 border-[#111827] p-4 sm:p-5 flex items-center justify-between no-print shrink-0">
            <button
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className={`btn-secondary text-xs py-2.5 w-[110px] sm:w-[130px] ${
                currentStep === 1 ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span>Kembali</span>
            </button>

            <span className="text-xs font-black text-gray-500 font-mono-code">
              {currentStep} / {totalSteps}
            </span>

            {currentStep < totalSteps ? (
              <button onClick={handleNextStep} className="btn-primary text-xs py-2.5 w-[110px] sm:w-[130px]">
                <span>Lanjut</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-yellow text-xs py-2.5 w-[125px] sm:w-[150px] disabled:opacity-75"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Kirim Data</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
