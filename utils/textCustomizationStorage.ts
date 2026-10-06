import { View } from '../types';

export interface AppCustomTexts {
  version: number;
  lastUpdated: string;
  updatedBy?: string;
  // Menu Item Labels: mapping of View ID -> Custom Display Text
  menuLabels: Record<View | string, string>;
  // Menu Descriptions / Subtitles
  menuDescriptions: Record<View | string, string>;
  // Menu Group / Category Headers (OPERASIONAL, ASSESSMENT, SDM, KEUANGAN, LAPORAN, PENGATURAN)
  menuGroupLabels: Record<string, string>;
  // Branding & App Identity
  branding: {
    appName: string;
    appBadge: string;
    appSubtitle: string;
    institutionName: string;
    loginTitle: string;
    loginSubtitle: string;
    loginWelcome: string;
    loginInstruction: string;
    loginButtonText: string;
    headerSearchPlaceholder: string;
    logoutButtonText: string;
  };
  // Dashboard & KPI Texts
  dashboard: {
    pageTitle: string;
    greetingTitle: string;
    greetingSubtitle: string;
    kpiActivePatients: string;
    kpiScheduledToday: string;
    kpiAttendanceRate: string;
    kpiActiveTherapists: string;
    kpiMonthlySessions: string;
    todayScheduleHeader: string;
    quickActionAddStudent: string;
    quickActionAddSession: string;
    quickActionDownloadRecap: string;
  };
  // Clinical & Module Titles
  modules: {
    emrNotebookTitle: string;
    therapyProgramTitle: string;
    rapotTitle: string;
    assessmentTitle: string;
    scheduleTitle: string;
    billingTitle: string;
    attendanceRecapTitle: string;
    registrationTitle: string;
  };
  // Role Display Names
  roles: {
    manager: string;
    super_admin: string;
    admin: string;
    terapis: string;
    siswa: string;
    orang_tua: string;
    keuangan: string;
    assessor: string;
    guest: string;
  };
  // Universal key-value dictionary for any text across the app
  uiDictionary: Record<string, string>;
}

export const DEFAULT_CUSTOM_TEXTS: AppCustomTexts = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  updatedBy: 'Sistem Bawaan',
  menuLabels: {
    dashboard: 'Dasbor Utama',
    registrasi: 'Registrasi Calon Klien',
    papanJadwal: 'Jadwal Terapi',
    rekapKehadiran: 'Kehadiran Siswa',
    manajemenAnak: 'Manajemen Anak & Siswa',
    programTerapi: 'Program Terapi',
    bukuCatatanTerapi: 'Buku Catatan Terapi (EMR)',
    rapot: 'Rapor Terapi',
    assesmentAnak: 'Assessment Anak',
    laporanAssesment: 'Hasil Assessment',
    manajemenTerapis: 'Manajemen SDM Terapis',
    tagihan: 'Tagihan & Invoice',
    laporanPemasukan: 'Pembayaran Kasir',
    piutang: 'Piutang & Tunggakan',
    laporanKeuangan: 'Laporan Keuangan',
    pusatLaporan: 'Pusat Laporan & KPI',
    balancedScorecard: 'Balanced Scorecard',
    strategicPlan: 'Strategic Plan',
    manajemenPengguna: 'Manajemen Pengguna',
    rolePermission: 'Manajemen Role & Hak Akses',
    pengaturan: 'Pengaturan Sistem',
    daftarTamu: 'Daftar Tamu Baru',
    peraturanTerapi: 'Peraturan Terapi'
  },
  menuDescriptions: {
    dashboard: 'Ringkasan aktivitas hari ini, KPI, dan statistik cepat operasional',
    registrasi: 'Pengelolaan data pendaftaran calon klien baru dari registrasi tamu',
    papanJadwal: 'Kalender jadwal terapi harian, mingguan, dan alokasi ruangan',
    rekapKehadiran: 'Presensi harian dan rekapitulasi kehadiran anak terapi',
    manajemenAnak: 'Database lengkap anak, profil riwayat, dan data orang tua',
    programTerapi: 'Perencanaan target kurikulum dan intervensi program anak',
    bukuCatatanTerapi: 'Catatan rekam medis EMR progres sesi harian terapis',
    rapot: 'Evaluasi berkala, grafik capaian radar, dan cetak rapor PDF',
    assesmentAnak: 'Pemeriksaan status evaluasi klinis tumbuh kembang anak',
    laporanAssesment: 'Dokumen laporan detail observasi psikologis & klinis',
    manajemenTerapis: 'Daftar tenaga terapis, spesialisasi, dan penugasan jadwal',
    tagihan: 'Rincian invoice biaya sesi terapi per siswa dan cetak kuitansi',
    laporanPemasukan: 'Penerimaan kas, konfirmasi transfer, dan rekonsiliasi kasir',
    piutang: 'Monitoring saldo piutang dan sisa tagihan belum lunas',
    laporanKeuangan: 'Laporan arus kas, laba rugi, dan rekapitulasi operasional',
    pusatLaporan: 'Pusat ringkasan metriks indikator performa utama (KPI)',
    balancedScorecard: 'Evaluasi 4 perspektif manajemen strategis pusat terapi',
    strategicPlan: 'Roadmap pengembangan inisiatif strategis tahunan',
    manajemenPengguna: 'Akun login dan kredensial akses seluruh pengguna sistem',
    rolePermission: 'Pengaturan RBAC, hak akses menu, dan izin data (Khusus Manager)',
    pengaturan: 'Kustomisasi tema warna, logo lembaga, dan parameter sistem',
    daftarTamu: 'Buku registrasi tamu dan konsultasi awal',
    peraturanTerapi: 'Pedoman tata tertib dan regulasi pelaksanaan terapi'
  },
  menuGroupLabels: {
    operasional: 'OPERASIONAL',
    assessment: 'ASSESSMENT',
    sdm: 'SDM & TERAPIS',
    keuangan: 'KEUANGAN & KASIR',
    laporan: 'LAPORAN & STRATEGI',
    pengaturan: 'PENGATURAN SISTEM'
  },
  branding: {
    appName: 'Pelangi360',
    appBadge: 'Enterprise',
    appSubtitle: 'Lazuardi Therapy & Growth Center',
    institutionName: 'Terapi Pelangi Lazuardi',
    loginTitle: 'Pelangi Lazuardi',
    loginSubtitle: 'Pusat Terapi Tumbuh Kembang Anak',
    loginWelcome: 'Selamat Datang',
    loginInstruction: 'Silakan masuk dengan akun Anda untuk melanjutkan.',
    loginButtonText: 'Masuk ke Sistem',
    headerSearchPlaceholder: 'Cari menu atau fitur... (⌘K)',
    logoutButtonText: 'Keluar Sesi'
  },
  dashboard: {
    pageTitle: 'Dasbor Utama',
    greetingTitle: 'Selamat Datang di Pelangi360',
    greetingSubtitle: 'Pusat Layanan Terapi Terpadu & Tumbuh Kembang Anak Pelangi Lazuardi',
    kpiActivePatients: 'Total Siswa Aktif',
    kpiScheduledToday: 'Jadwal Sesi Hari Ini',
    kpiAttendanceRate: 'Tingkat Presensi Hari Ini',
    kpiActiveTherapists: 'Tenaga Terapis Aktif',
    kpiMonthlySessions: 'Estimasi Sesi Bulan Ini',
    todayScheduleHeader: 'Jadwal Sesi & Kehadiran Hari Ini',
    quickActionAddStudent: 'Tambah Data Siswa',
    quickActionAddSession: 'Jadwalkan Sesi Terapi',
    quickActionDownloadRecap: 'Unduh Rekap Presensi'
  },
  modules: {
    emrNotebookTitle: 'Buku Catatan Terapi Digital (EMR)',
    therapyProgramTitle: 'Program Intervensi Terapi',
    rapotTitle: 'Rapor Capaian & Perkembangan Siswa',
    assessmentTitle: 'Pemeriksaan Klinis & Observasi Anak',
    scheduleTitle: 'Papan Manajemen Jadwal Terapi',
    billingTitle: 'Tagihan, Biaya Terapi & Invoice',
    attendanceRecapTitle: 'Rekapitulasi Kehadiran Siswa',
    registrationTitle: 'Registrasi & Pendaftaran Klien Baru'
  },
  roles: {
    manager: 'Executive Manager',
    super_admin: 'Super Administrator (Root)',
    admin: 'Administrator Operasional',
    terapis: 'Terapis',
    siswa: 'Siswa (Portal Keluarga)',
    orang_tua: 'Orang Tua Siswa',
    keuangan: 'Petugas Keuangan',
    assessor: 'Assessor Klinis',
    guest: 'Tamu Publik'
  },
  uiDictionary: {
    // Tombol umum
    'btn_save': 'Simpan Perubahan',
    'btn_cancel': 'Batal',
    'btn_delete': 'Hapus',
    'btn_edit': 'Ubah / Edit',
    'btn_add': 'Tambah Baru',
    'btn_print': 'Cetak Dokumen',
    'btn_export_excel': 'Ekspor Excel',
    'btn_export_pdf': 'Ekspor PDF',
    'btn_filter': 'Filter Data',
    'btn_search': 'Cari',
    'btn_refresh': 'Segarkan Data',
    'btn_confirm': 'Konfirmasi',
    'btn_back': 'Kembali',
    
    // Status kehadiran
    'status_present': 'Hadir',
    'status_absent': 'Absen',
    'status_permit': 'Izin',
    'status_pending': 'Menunggu',
    
    // Status assessment
    'status_not_assessed': 'Belum Dinilai',
    'status_in_progress': 'Sedang Proses',
    'status_completed': 'Selesai',
    
    // Terminologi
    'term_therapist': 'Terapis',
    'term_student': 'Siswa / Anak',
    'term_parent': 'Orang Tua / Wali',
    'term_session': 'Sesi Terapi',
    'term_schedule': 'Jadwal',
    'term_invoice': 'Tagihan',
    'term_payment': 'Pembayaran',
    'term_report': 'Laporan',
    'term_notes': 'Catatan Progres',
    'term_target': 'Target Intervensi',
    
    // Notifikasi
    'notif_center_title': 'Pusat Notifikasi Operasional',
    'notif_unread': 'Pesan Belum Dibaca'
  }
};

const STORAGE_KEY = 'pelangi360_app_custom_texts_v2';
const EVENT_NAME = 'pelangi_app_texts_updated';

/**
 * Read custom texts from localStorage with deep merge against default values
 */
export const getStoredCustomTexts = (): AppCustomTexts => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CUSTOM_TEXTS };
    const parsed = JSON.parse(raw);

    // Deep merge to ensure newly added keys are always available
    return {
      version: parsed.version || DEFAULT_CUSTOM_TEXTS.version,
      lastUpdated: parsed.lastUpdated || DEFAULT_CUSTOM_TEXTS.lastUpdated,
      updatedBy: parsed.updatedBy || DEFAULT_CUSTOM_TEXTS.updatedBy,
      menuLabels: { ...DEFAULT_CUSTOM_TEXTS.menuLabels, ...(parsed.menuLabels || {}) },
      menuDescriptions: { ...DEFAULT_CUSTOM_TEXTS.menuDescriptions, ...(parsed.menuDescriptions || {}) },
      menuGroupLabels: { ...DEFAULT_CUSTOM_TEXTS.menuGroupLabels, ...(parsed.menuGroupLabels || {}) },
      branding: { ...DEFAULT_CUSTOM_TEXTS.branding, ...(parsed.branding || {}) },
      dashboard: { ...DEFAULT_CUSTOM_TEXTS.dashboard, ...(parsed.dashboard || {}) },
      modules: { ...DEFAULT_CUSTOM_TEXTS.modules, ...(parsed.modules || {}) },
      roles: { ...DEFAULT_CUSTOM_TEXTS.roles, ...(parsed.roles || {}) },
      uiDictionary: { ...DEFAULT_CUSTOM_TEXTS.uiDictionary, ...(parsed.uiDictionary || {}) }
    };
  } catch (error) {
    console.error('Error reading custom texts from storage:', error);
    return { ...DEFAULT_CUSTOM_TEXTS };
  }
};

/**
 * Save custom texts to localStorage and dispatch update event across the app
 */
export const saveStoredCustomTexts = (data: AppCustomTexts, updatedBy: string = 'Manager'): void => {
  try {
    const updatedData: AppCustomTexts = {
      ...data,
      lastUpdated: new Date().toISOString(),
      updatedBy
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    
    // Dispatch custom event to notify all components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updatedData }));
    }
  } catch (error) {
    console.error('Error saving custom texts to storage:', error);
  }
};

/**
 * Reset all custom texts back to initial default values
 */
export const resetCustomTextsToDefault = (updatedBy: string = 'Manager'): AppCustomTexts => {
  const resetData: AppCustomTexts = {
    ...DEFAULT_CUSTOM_TEXTS,
    lastUpdated: new Date().toISOString(),
    updatedBy
  };
  saveStoredCustomTexts(resetData, updatedBy);
  return resetData;
};

/**
 * Quick helper to get menu label with fallback
 */
export const getCustomMenuLabel = (viewId: View | string, fallback?: string): string => {
  const texts = getStoredCustomTexts();
  return texts.menuLabels[viewId] || fallback || String(viewId);
};

/**
 * Quick helper to get group label with fallback
 */
export const getCustomGroupLabel = (groupId: string, fallback?: string): string => {
  const texts = getStoredCustomTexts();
  return texts.menuGroupLabels[groupId] || fallback || groupId.toUpperCase();
};

/**
 * Quick helper to get branding text with fallback
 */
export const getCustomBranding = (key: keyof AppCustomTexts['branding'], fallback?: string): string => {
  const texts = getStoredCustomTexts();
  return texts.branding[key] || fallback || '';
};

/**
 * Universal translate function: looks up in uiDictionary, then fallback
 */
export const t = (key: string, fallback?: string): string => {
  const texts = getStoredCustomTexts();
  return texts.uiDictionary[key] || fallback || key;
};

/**
 * Export custom texts as JSON string
 */
export const exportCustomTextsJSON = (): string => {
  const texts = getStoredCustomTexts();
  return JSON.stringify(texts, null, 2);
};

/**
 * Import custom texts from JSON string
 */
export const importCustomTextsJSON = (jsonString: string, updatedBy: string = 'Manager'): boolean => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== 'object') return false;
    
    const merged: AppCustomTexts = {
      version: parsed.version || DEFAULT_CUSTOM_TEXTS.version,
      lastUpdated: new Date().toISOString(),
      updatedBy,
      menuLabels: { ...DEFAULT_CUSTOM_TEXTS.menuLabels, ...(parsed.menuLabels || {}) },
      menuDescriptions: { ...DEFAULT_CUSTOM_TEXTS.menuDescriptions, ...(parsed.menuDescriptions || {}) },
      menuGroupLabels: { ...DEFAULT_CUSTOM_TEXTS.menuGroupLabels, ...(parsed.menuGroupLabels || {}) },
      branding: { ...DEFAULT_CUSTOM_TEXTS.branding, ...(parsed.branding || {}) },
      dashboard: { ...DEFAULT_CUSTOM_TEXTS.dashboard, ...(parsed.dashboard || {}) },
      modules: { ...DEFAULT_CUSTOM_TEXTS.modules, ...(parsed.modules || {}) },
      roles: { ...DEFAULT_CUSTOM_TEXTS.roles, ...(parsed.roles || {}) },
      uiDictionary: { ...DEFAULT_CUSTOM_TEXTS.uiDictionary, ...(parsed.uiDictionary || {}) }
    };
    saveStoredCustomTexts(merged, updatedBy);
    return true;
  } catch (err) {
    console.error('Failed to import custom texts JSON:', err);
    return false;
  }
};
