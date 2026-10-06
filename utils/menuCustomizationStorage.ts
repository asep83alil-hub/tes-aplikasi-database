import { View } from '../types';

export interface MenuCustomizationConfig {
  brand: {
    appTitle: string;
    appSubtitle: string;
    badgeText: string;
  };
  groups: {
    [groupId: string]: string; // e.g. operasional: "OPERASIONAL"
  };
  menuLabels: {
    [viewId in View]?: string; // e.g. dashboard: "Dasbor Utama"
  };
  inMenuTexts: {
    [viewId in View]?: {
      [textKey: string]: {
        label: string; // Deskripsi konteks teks (misal: "Judul Halaman")
        value: string; // Teks yang ditampilkan
        defaultValue: string;
        category?: 'header' | 'button' | 'tab' | 'card' | 'badge' | 'notice' | 'other';
      };
    };
  };
}

export const STORAGE_KEY_MENU_CUSTOMIZATION = 'pelangi360_menu_and_text_customizations';

export const DEFAULT_GROUPS: { id: string; defaultLabel: string; description: string }[] = [
  { id: 'operasional', defaultLabel: 'OPERASIONAL', description: 'Grup menu alur harian dan pelayanan klien' },
  { id: 'assessment', defaultLabel: 'ASSESSMENT', description: 'Grup menu instrumen observasi klinis dan evaluasi' },
  { id: 'sdm', defaultLabel: 'SDM', description: 'Grup menu tenaga praktisi terapis dan penugasan' },
  { id: 'keuangan', defaultLabel: 'KEUANGAN', description: 'Grup menu billing, tagihan, dan finansial' },
  { id: 'laporan', defaultLabel: 'LAPORAN', description: 'Grup menu ringkasan analitik eksekutif dan strategis' },
  { id: 'pengaturan', defaultLabel: 'PENGATURAN', description: 'Grup menu konfigurasi, manajemen akun, dan hak akses' }
];

export const DEFAULT_MENU_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  registrasi: 'Registrasi',
  papanJadwal: 'Jadwal Terapi',
  rekapKehadiran: 'Kehadiran',
  manajemenAnak: 'Manajemen Anak',
  programTerapi: 'Program Terapi',
  bukuCatatanTerapi: 'Buku Catatan Terapi',
  rapot: 'Rapor Terapi',
  assesmentAnak: 'Assessment Anak',
  laporanAssesment: 'Hasil Assessment',
  manajemenTerapis: 'Manajemen Terapis',
  tagihan: 'Tagihan',
  laporanKeuangan: 'Laporan Keuangan',
  pusatLaporan: 'Dashboard KPI',
  balancedScorecard: 'Balanced Scorecard',
  strategicPlan: 'Strategic Plan',
  manajemenPengguna: 'Manajemen Pengguna',
  rolePermission: 'Manajemen Role & Hak Akses',
  pengaturan: 'Pengaturan Sistem',
  editMenu: 'Edit Menu & Teks',
  daftarTamu: 'Daftar Tamu Baru',
  peraturanTerapi: 'Peraturan Terapi',
  laporanPerkembangan: 'Laporan Perkembangan',
  rekapPerkembangan: 'Pusat Perkembangan Siswa',
  masterData: 'Master Data & Tarif',
  dashboardManager: 'Dasbor Eksekutif Manager'
};

export const DEFAULT_IN_MENU_TEXTS: MenuCustomizationConfig['inMenuTexts'] = {
  dashboard: {
    pageTitle: { label: 'Judul Utama Halaman', value: 'Dasbor Utama', defaultValue: 'Dasbor Utama', category: 'header' },
    pageSubtitle: { label: 'Subjudul / Deskripsi Halaman', value: 'Monitoring aktivitas terapi, kehadiran klinis, dan progres harian anak secara real-time', defaultValue: 'Monitoring aktivitas terapi, kehadiran klinis, dan progres harian anak secara real-time', category: 'header' },
    statPatientsLabel: { label: 'Label Metrik Klien/Anak', value: 'Total Siswa Aktif', defaultValue: 'Total Siswa Aktif', category: 'card' },
    statTherapistsLabel: { label: 'Label Metrik Terapis', value: 'Terapis Bertugas', defaultValue: 'Terapis Bertugas', category: 'card' },
    statSessionsLabel: { label: 'Label Metrik Sesi Hari Ini', value: 'Sesi Hari Ini', defaultValue: 'Sesi Hari Ini', category: 'card' },
    statAttendanceLabel: { label: 'Label Metrik Kehadiran', value: 'Tingkat Kehadiran', defaultValue: 'Tingkat Kehadiran', category: 'card' },
    scheduleTableTitle: { label: 'Judul Tabel Jadwal Harian', value: 'Jadwal & Presensi Sesi Terapi Hari Ini', defaultValue: 'Jadwal & Presensi Sesi Terapi Hari Ini', category: 'header' },
    scheduleTableSubtitle: { label: 'Keterangan Tabel Jadwal Harian', value: 'Kelola status kehadiran dan lembar catatan harian anak secara langsung', defaultValue: 'Kelola status kehadiran dan lembar catatan harian anak secara langsung', category: 'header' },
    btnQuickAdd: { label: 'Tombol Aksi Cepat', value: 'Aksi Cepat Operasional', defaultValue: 'Aksi Cepat Operasional', category: 'button' },
    announcementBanner: { label: 'Pengumuman / Sambutan Beranda', value: 'Selamat datang di Pusat Terapi Terpadu Pelangi Lazuardi. Pantau tumbuh kembang ananda secara komprehensif.', defaultValue: 'Selamat datang di Pusat Terapi Terpadu Pelangi Lazuardi. Pantau tumbuh kembang ananda secara komprehensif.', category: 'notice' }
  },
  registrasi: {
    pageTitle: { label: 'Judul Halaman', value: 'Registrasi Calon Klien Baru', defaultValue: 'Registrasi Calon Klien Baru', category: 'header' },
    pageSubtitle: { label: 'Subjudul Halaman', value: 'Kelola pendaftaran calon siswa terapi, jadwal asesmen awal, dan konversi ke Klien Aktif', defaultValue: 'Kelola pendaftaran calon siswa terapi, jadwal asesmen awal, dan konversi ke Klien Aktif', category: 'header' },
    tabAll: { label: 'Label Tab Semua Registrasi', value: 'Semua Registrasi', defaultValue: 'Semua Registrasi', category: 'tab' },
    tabNew: { label: 'Label Tab Menunggu Asesmen', value: 'Menunggu Asesmen', defaultValue: 'Menunggu Asesmen', category: 'tab' },
    tabConverted: { label: 'Label Tab Klien Aktif', value: 'Menjadi Klien Aktif', defaultValue: 'Menjadi Klien Aktif', category: 'tab' },
    btnAddNew: { label: 'Tombol Tambah Registrasi', value: '+ Registrasi Calon Klien Baru', defaultValue: '+ Registrasi Calon Klien Baru', category: 'button' },
    btnConvertClient: { label: 'Tombol Konversi Klien', value: 'Konversi Jadi Klien Aktif', defaultValue: 'Konversi Jadi Klien Aktif', category: 'button' }
  },
  papanJadwal: {
    pageTitle: { label: 'Judul Halaman', value: 'Manajemen Jadwal Terapi', defaultValue: 'Manajemen Jadwal Terapi', category: 'header' },
    pageSubtitle: { label: 'Subjudul Halaman', value: 'Pengaturan alokasi waktu terapi, ruangan, dan penugasan terapis harian & mingguan', defaultValue: 'Pengaturan alokasi waktu terapi, ruangan, dan penugasan terapis harian & mingguan', category: 'header' },
    tabDaily: { label: 'Label Tab Harian', value: 'Tampilan Harian', defaultValue: 'Tampilan Harian', category: 'tab' },
    tabWeekly: { label: 'Label Tab Mingguan', value: 'Tampilan Mingguan', defaultValue: 'Tampilan Mingguan', category: 'tab' },
    btnNewSession: { label: 'Tombol Tambah Sesi', value: '+ Jadwal Sesi Baru', defaultValue: '+ Jadwal Sesi Baru', category: 'button' }
  },
  manajemenAnak: {
    pageTitle: { label: 'Judul Halaman', value: 'Manajemen Data Klien & Anak', defaultValue: 'Manajemen Data Klien & Anak', category: 'header' },
    pageSubtitle: { label: 'Subjudul Halaman', value: 'Database terpadu profil siswa terapi, diagnosa awal, biodata orang tua, dan riwayat klinis', defaultValue: 'Database terpadu profil siswa terapi, diagnosa awal, biodata orang tua, dan riwayat klinis', category: 'header' },
    btnAddChild: { label: 'Tombol Tambah Anak', value: '+ Tambah Data Anak', defaultValue: '+ Tambah Data Anak', category: 'button' },
    btnUploadData: { label: 'Tombol Impor Massal', value: 'Unggah Dokumen Anak', defaultValue: 'Unggah Dokumen Anak', category: 'button' },
    searchPlaceholder: { label: 'Teks Placeholder Pencarian', value: 'Cari nama anak, kelas, orang tua...', defaultValue: 'Cari nama anak, kelas, orang tua...', category: 'other' }
  },
  assesmentAnak: {
    pageTitle: { label: 'Judul Halaman', value: 'Assessment & Observasi Klinis', defaultValue: 'Assessment & Observasi Klinis', category: 'header' },
    pageSubtitle: { label: 'Subjudul Halaman', value: 'Instrumen evaluasi kemampuan awal tumbuh kembang anak dan rekomendasi program intervensi', defaultValue: 'Instrumen evaluasi kemampuan awal tumbuh kembang anak dan rekomendasi program intervensi', category: 'header' },
    statusNotAssessed: { label: 'Label Status Belum Asesmen', value: 'Belum Di-asesmen', defaultValue: 'Belum Di-asesmen', category: 'badge' },
    statusInAssessment: { label: 'Label Status Dalam Proses', value: 'Dalam Proses', defaultValue: 'Dalam Proses', category: 'badge' },
    statusCompleted: { label: 'Label Status Selesai', value: 'Asesmen Selesai', defaultValue: 'Asesmen Selesai', category: 'badge' }
  },
  bukuCatatanTerapi: {
    pageTitle: { label: 'Judul Halaman', value: 'Buku Catatan Terapi (EMR Harian)', defaultValue: 'Buku Catatan Terapi (EMR Harian)', category: 'header' },
    pageSubtitle: { label: 'Subjudul Halaman', value: 'Lembar catatan kemajuan sesi harian terapis, checklist program intervensi, foto, dan umpan balik orang tua', defaultValue: 'Lembar catatan kemajuan sesi harian terapis, checklist program intervensi, foto, dan umpan balik orang tua', category: 'header' },
    sectionParentFeedback: { label: 'Judul Bagian Feedback Orang Tua', value: 'Kolaborasi & Catatan Wali Murid', defaultValue: 'Kolaborasi & Catatan Wali Murid', category: 'header' },
    btnSaveNotes: { label: 'Tombol Simpan Catatan', value: 'Simpan Lembar Catatan', defaultValue: 'Simpan Lembar Catatan', category: 'button' }
  },
  programTerapi: {
    pageTitle: { label: 'Judul Halaman', value: 'Program Terapi & Kurikulum Intervensi', defaultValue: 'Program Terapi & Kurikulum Intervensi', category: 'header' },
    pageSubtitle: { label: 'Subjudul Halaman', value: 'Penyusunan target capaian 3 bulan & 6 bulan untuk divisi Okupasi, Wicara, Fisioterapi, Remedial, dan Hidroterapi', defaultValue: 'Penyusunan target capaian 3 bulan & 6 bulan untuk divisi Okupasi, Wicara, Fisioterapi, Remedial, dan Hidroterapi', category: 'header' },
    btnAddProgram: { label: 'Tombol Tambah Program', value: '+ Buat Program Terapi Baru', defaultValue: '+ Buat Program Terapi Baru', category: 'button' }
  },
  rapot: {
    pageTitle: { label: 'Judul Halaman', value: 'Rapor Capaian Terapi', defaultValue: 'Rapor Capaian Terapi', category: 'header' },
    pageSubtitle: { label: 'Subjudul Halaman', value: 'Evaluasi perkembangan kompetensi semester, visualisasi grafik spider/radar, dan pencetakan dokumen PDF', defaultValue: 'Evaluasi perkembangan kompetensi semester, visualisasi grafik spider/radar, dan pencetakan dokumen PDF', category: 'header' },
    btnPrintReport: { label: 'Tombol Cetak Rapor', value: 'Cetak Dokumen Rapor (PDF)', defaultValue: 'Cetak Dokumen Rapor (PDF)', category: 'button' }
  },
  manajemenTerapis: {
    pageTitle: { label: 'Judul Halaman', value: 'Manajemen SDM Terapis', defaultValue: 'Manajemen SDM Terapis', category: 'header' },
    pageSubtitle: { label: 'Subjudul Halaman', value: 'Database tenaga terapis profesional, sertifikasi spesialisasi, jadwal dinas, dan beban kuota', defaultValue: 'Database tenaga terapis profesional, sertifikasi spesialisasi, jadwal dinas, dan beban kuota', category: 'header' },
    btnAddTherapist: { label: 'Tombol Tambah Terapis', value: '+ Tambah Terapis Baru', defaultValue: '+ Tambah Terapis Baru', category: 'button' }
  },
  tagihan: {
    pageTitle: { label: 'Judul Halaman', value: 'Tagihan & Billing Siswa', defaultValue: 'Tagihan & Billing Siswa', category: 'header' },
    pageSubtitle: { label: 'Subjudul Halaman', value: 'Kalkulasi tagihan sesi terapi bulanan, penerbitan invoice resmi, dan verifikasi pelunasan', defaultValue: 'Kalkulasi tagihan sesi terapi bulanan, penerbitan invoice resmi, dan verifikasi pelunasan', category: 'header' },
    btnFilterBilling: { label: 'Tombol Filter Periode', value: 'Pilih Periode Tagihan', defaultValue: 'Pilih Periode Tagihan', category: 'button' }
  },
  laporanPemasukan: {
    pageTitle: { label: 'Judul Halaman', value: 'Laporan Pembayaran & Kas Masuk', defaultValue: 'Laporan Pembayaran & Kas Masuk', category: 'header' },
    pageSubtitle: { label: 'Subjudul Halaman', value: 'Rekapitulasi penerimaan uang pembayaran sesi terapi dan verifikasi bukti transfer wali murid', defaultValue: 'Rekapitulasi penerimaan uang pembayaran sesi terapi dan verifikasi bukti transfer wali murid', category: 'header' }
  },
  laporanKeuangan: {
    pageTitle: { label: 'Judul Halaman', value: 'Laporan Keuangan & Arus Kas', defaultValue: 'Laporan Keuangan & Arus Kas', category: 'header' },
    pageSubtitle: { label: 'Subjudul Halaman', value: 'Laporan pendapatan kotor, beban operasional klinik, dan laba-rugi bersih tahun berjalan', defaultValue: 'Laporan pendapatan kotor, beban operasional klinik, dan laba-rugi bersih tahun berjalan', category: 'header' }
  },
  pusatLaporan: {
    pageTitle: { label: 'Judul Halaman', value: 'Pusat Laporan & KPI Eksekutif', defaultValue: 'Pusat Laporan & KPI Eksekutif', category: 'header' },
    pageSubtitle: { label: 'Subjudul Halaman', value: 'Dashboard analitik komprehensif performa klinis, efektivitas terapi, dan retensi siswa', defaultValue: 'Dashboard analitik komprehensif performa klinis, efektivitas terapi, dan retensi siswa', category: 'header' }
  },
  balancedScorecard: {
    pageTitle: { label: 'Judul Halaman', value: 'Balanced Scorecard Lembaga', defaultValue: 'Balanced Scorecard Lembaga', category: 'header' },
    pageSubtitle: { label: 'Subjudul Halaman', value: 'Evaluasi 4 pilar strategis: Finansial, Pelanggan, Proses Bisnis Internal, dan Pertumbuhan SDM', defaultValue: 'Evaluasi 4 pilar strategis: Finansial, Pelanggan, Proses Bisnis Internal, dan Pertumbuhan SDM', category: 'header' }
  },
  strategicPlan: {
    pageTitle: { label: 'Judul Halaman', value: 'Strategic Plan & Inisiatif Lembaga', defaultValue: 'Strategic Plan & Inisiatif Lembaga', category: 'header' },
    pageSubtitle: { label: 'Subjudul Halaman', value: 'Roadmap pengembangan jangka panjang, target ekspansi fasilitas, dan inovasi kurikulum', defaultValue: 'Roadmap pengembangan jangka panjang, target ekspansi fasilitas, dan inovasi kurikulum', category: 'header' }
  },
  rekapKehadiran: {
    pageTitle: { label: 'Judul Halaman', value: 'Rekapitulasi Presensi Kehadiran', defaultValue: 'Rekapitulasi Presensi Kehadiran', category: 'header' },
    pageSubtitle: { label: 'Subjudul Halaman', value: 'Laporan rekap kehadiran terapi per anak, rincian hadir, izin, sakit, dan ekspor spreadsheet', defaultValue: 'Laporan rekap kehadiran terapi per anak, rincian hadir, izin, sakit, dan ekspor spreadsheet', category: 'header' }
  },
  manajemenPengguna: {
    pageTitle: { label: 'Judul Halaman', value: 'Manajemen Pengguna & Kredensial', defaultValue: 'Manajemen Pengguna & Kredensial', category: 'header' },
    pageSubtitle: { label: 'Subjudul Halaman', value: 'Pengelolaan akun login karyawan, akun orang tua, reset kata sandi, dan status aktif', defaultValue: 'Pengelolaan akun login karyawan, akun orang tua, reset kata sandi, dan status aktif', category: 'header' }
  },
  rolePermission: {
    pageTitle: { label: 'Judul Halaman', value: 'Manajemen Role & Hak Akses (RBAC)', defaultValue: 'Manajemen Role & Hak Akses (RBAC)', category: 'header' },
    pageSubtitle: { label: 'Subjudul Halaman', value: 'Konfigurasi hak akses menu, matriks izin data (Create/Read/Update/Delete), dan audit log aktivitas', defaultValue: 'Konfigurasi hak akses menu, matriks izin data (Create/Read/Update/Delete), dan audit log aktivitas', category: 'header' }
  },
  pengaturan: {
    pageTitle: { label: 'Judul Halaman', value: 'Pengaturan Sistem & Master Data', defaultValue: 'Pengaturan Sistem & Master Data', category: 'header' },
    pageSubtitle: { label: 'Subjudul Halaman', value: 'Kustomisasi identitas lembaga, logo, palet tema warna antarmuka, dan jenis layanan terapi', defaultValue: 'Kustomisasi identitas lembaga, logo, palet tema warna antarmuka, dan jenis layanan terapi', category: 'header' }
  },
  editMenu: {
    pageTitle: { label: 'Judul Halaman', value: 'Kustomisasi Teks & Menu Sistem', defaultValue: 'Kustomisasi Teks & Menu Sistem', category: 'header' },
    pageSubtitle: { label: 'Subjudul Halaman', value: 'Otoritas Khusus Manager: Ubah semua nama menu navigasi sidebar dan teks tulisan di dalam setiap halaman', defaultValue: 'Otoritas Khusus Manager: Ubah semua nama menu navigasi sidebar dan teks tulisan di dalam setiap halaman', category: 'header' }
  }
};

export const INITIAL_MENU_CUSTOMIZATION: MenuCustomizationConfig = {
  brand: {
    appTitle: 'Pelangi360',
    appSubtitle: 'Lazuardi Therapy & Growth Center',
    badgeText: 'Enterprise'
  },
  groups: {
    operasional: 'OPERASIONAL',
    assessment: 'ASSESSMENT',
    sdm: 'SDM',
    keuangan: 'KEUANGAN',
    laporan: 'LAPORAN',
    pengaturan: 'PENGATURAN'
  },
  menuLabels: { ...DEFAULT_MENU_LABELS },
  inMenuTexts: { ...DEFAULT_IN_MENU_TEXTS }
};

export const getStoredMenuCustomizations = (): MenuCustomizationConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MENU_CUSTOMIZATION);
    if (!raw) return INITIAL_MENU_CUSTOMIZATION;
    const parsed = JSON.parse(raw);
    
    // Deep merge with defaults to guarantee all keys exist
    const mergedLabels = { ...INITIAL_MENU_CUSTOMIZATION.menuLabels, ...(parsed.menuLabels || {}) };
    delete mergedLabels.laporanPemasukan;
    delete mergedLabels.piutang;

    return {
      brand: { ...INITIAL_MENU_CUSTOMIZATION.brand, ...(parsed.brand || {}) },
      groups: { ...INITIAL_MENU_CUSTOMIZATION.groups, ...(parsed.groups || {}) },
      menuLabels: mergedLabels,
      inMenuTexts: mergeInMenuTexts(INITIAL_MENU_CUSTOMIZATION.inMenuTexts, parsed.inMenuTexts || {})
    };
  } catch (e) {
    console.error('Failed to load menu customizations', e);
    return INITIAL_MENU_CUSTOMIZATION;
  }
};

function mergeInMenuTexts(
  defaultTexts: MenuCustomizationConfig['inMenuTexts'], 
  savedTexts: Record<string, any>
): MenuCustomizationConfig['inMenuTexts'] {
  const result: MenuCustomizationConfig['inMenuTexts'] = {};
  
  // First copy all defaults
  Object.keys(defaultTexts).forEach((viewKey) => {
    const vKey = viewKey as View;
    result[vKey] = { ...(defaultTexts[vKey] || {}) };
    if (savedTexts[vKey]) {
      Object.keys(savedTexts[vKey]).forEach((textKey) => {
        const savedItem = savedTexts[vKey][textKey];
        if (typeof savedItem === 'string') {
          // Backward compatibility if saved as raw string
          if (result[vKey]![textKey]) {
            result[vKey]![textKey].value = savedItem;
          } else {
            result[vKey]![textKey] = {
              label: textKey,
              value: savedItem,
              defaultValue: savedItem,
              category: 'other'
            };
          }
        } else if (savedItem && typeof savedItem === 'object') {
          result[vKey]![textKey] = {
            ...(result[vKey]![textKey] || {
              label: savedItem.label || textKey,
              defaultValue: savedItem.defaultValue || savedItem.value || '',
              category: savedItem.category || 'other'
            }),
            ...savedItem
          };
        }
      });
    }
  });

  // Also include any user-created custom views or keys that might not be in defaults
  Object.keys(savedTexts).forEach((viewKey) => {
    const vKey = viewKey as View;
    if (!result[vKey]) {
      result[vKey] = savedTexts[vKey];
    }
  });

  return result;
}

export const saveStoredMenuCustomizations = (config: MenuCustomizationConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY_MENU_CUSTOMIZATION, JSON.stringify(config));
    // Broadcast event across active components
    window.dispatchEvent(new CustomEvent('pelangi360_menu_customization_updated', { detail: config }));
  } catch (e) {
    console.error('Failed to save menu customizations', e);
  }
};

export const resetMenuCustomizationsToDefault = (): MenuCustomizationConfig => {
  try {
    localStorage.removeItem(STORAGE_KEY_MENU_CUSTOMIZATION);
    window.dispatchEvent(new CustomEvent('pelangi360_menu_customization_updated', { detail: INITIAL_MENU_CUSTOMIZATION }));
    return INITIAL_MENU_CUSTOMIZATION;
  } catch (e) {
    return INITIAL_MENU_CUSTOMIZATION;
  }
};

// Fast helper to get a menu label with instant fallback
export const getCustomMenuLabel = (viewId: string, fallback: string): string => {
  try {
    const config = getStoredMenuCustomizations();
    return (config.menuLabels as any)[viewId] || fallback;
  } catch {
    return fallback;
  }
};

// Fast helper to get a group label
export const getCustomGroupLabel = (groupId: string, fallback: string): string => {
  try {
    const config = getStoredMenuCustomizations();
    return config.groups[groupId] || fallback;
  } catch {
    return fallback;
  }
};

// Fast helper to get inside-menu text
export const getCustomInMenuText = (viewId: string, textKey: string, fallback: string): string => {
  try {
    const config = getStoredMenuCustomizations();
    const viewTexts = (config.inMenuTexts as any)[viewId];
    if (viewTexts && viewTexts[textKey]) {
      return viewTexts[textKey].value || fallback;
    }
    return fallback;
  } catch {
    return fallback;
  }
};
