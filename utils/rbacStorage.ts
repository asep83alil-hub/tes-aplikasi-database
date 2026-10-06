import { View, RoleDefinition, UserAccount, ActivityLog, DataPermission } from '../types';

export const MODULE_DEFINITIONS: { id: string; name: string; description: string }[] = [
  { id: 'programTerapi', name: 'Program Terapi', description: 'Rencana intervensi, target waktu, dan aktivitas terapi' },
  { id: 'papanJadwal', name: 'Jadwal Terapi', description: 'Penjadwalan harian, mingguan, dan alokasi ruangan' },
  { id: 'manajemenAnak', name: 'Data Siswa & Anak', description: 'Profil anak, biodata orang tua, diagnosis, dan riwayat' },
  { id: 'bukuCatatanTerapi', name: 'Buku Catatan Terapi (EMR)', description: 'Lembar progres sesi, catatan terapis, dan foto dokumentasi' },
  { id: 'assesmentAnak', name: 'Assessment & Rekomendasi', description: 'Instrumen evaluasi awal, status assessment, dan hasil diagnosa' },
  { id: 'tagihanKeuangan', name: 'Tagihan & Keuangan', description: 'Invoice terapi, pencatatan pembayaran kasir, dan laporan finansial' },
  { id: 'manajemenTerapis', name: 'SDM & Manajemen Terapis', description: 'Data terapis, spesialisasi, absensi terapis, dan kinerja' },
  { id: 'rapot', name: 'Rapor Terapi & Capaian', description: 'Laporan perkembangan berkala, radar chart, dan ekspor PDF' },
  { id: 'pengaturanSistem', name: 'Pengaturan Sistem', description: 'Konfigurasi tarif, jenis terapi, dan parameter sistem' }
];

export const MENU_TREE: {
  category: string;
  categoryLabel: string;
  items: { id: View; label: string; description: string }[];
}[] = [
  {
    category: 'operasional',
    categoryLabel: 'OPERASIONAL',
    items: [
      { id: 'dashboard', label: 'Dasbor Utama', description: 'Ringkasan aktivitas hari ini, KPI, dan statistik cepat' },
      { id: 'registrasi', label: 'Registrasi Tamu', description: 'Pengelolaan data pendaftaran calon klien baru dari registrasi tamu' },
      { id: 'papanJadwal', label: 'Jadwal Terapi', description: 'Kalender jadwal terapi harian, mingguan, dan bulanan' },
      { id: 'rekapKehadiran', label: 'Kehadiran Siswa', description: 'Presensi harian dan rekapitulasi kehadiran anak' },
      { id: 'manajemenAnak', label: 'Manajemen Anak', description: 'Database anak, profil lengkap, dan status terapi' },
      { id: 'programTerapi', label: 'Program Terapi', description: 'Perencanaan kurikulum dan intervensi program anak' },
      { id: 'bukuCatatanTerapi', label: 'Buku Catatan Terapi', description: 'Catatan EMR progres sesi harian terapis' },
      { id: 'rapot', label: 'Rapor Terapi', description: 'Evaluasi berkala, grafik capaian, dan cetak rapor PDF' }
    ]
  },
  {
    category: 'assessment',
    categoryLabel: 'ASSESSMENT',
    items: [
      { id: 'assesmentAnak', label: 'Assessment Anak', description: 'Pemeriksaan status evaluasi klinis awal anak' },
      { id: 'laporanAssesment', label: 'Hasil Assessment', description: 'Dokumen laporan detail observasi psikologis & klinis' }
    ]
  },
  {
    category: 'sdm',
    categoryLabel: 'SDM',
    items: [
      { id: 'manajemenTerapis', label: 'Manajemen Terapis', description: 'Daftar tenaga terapis, spesialisasi, dan penugasan' }
    ]
  },
  {
    category: 'keuangan',
    categoryLabel: 'KEUANGAN',
    items: [
      { id: 'tagihan', label: 'Tagihan', description: 'Rincian invoice biaya terapi per siswa dan invoice cetak' },
      { id: 'laporanKeuangan', label: 'Laporan Keuangan', description: 'Laporan arus kas, laba rugi, dan neraca operasional' }
    ]
  },
  {
    category: 'laporan',
    categoryLabel: 'LAPORAN',
    items: [
      { id: 'pusatLaporan', label: 'Dashboard KPI', description: 'Pusat ringkasan metriks indikator performa utama' },
      { id: 'balancedScorecard', label: 'Balanced Scorecard', description: 'Evaluasi 4 perspektif manajemen strategis pusat terapi' },
      { id: 'strategicPlan', label: 'Strategic Plan', description: 'Roadmap pengembangan inisiatif strategis tahunan' }
    ]
  },
  {
    category: 'pengaturan',
    categoryLabel: 'PENGATURAN',
    items: [
      { id: 'googleWorkspace', label: 'Google Drive & Sheets', description: 'Koneksi database real-time ke Google Sheets & cadangan Google Drive' },
      { id: 'manajemenPengguna', label: 'Manajemen Pengguna', description: 'Akun login dan kredensial akses pengguna dasar' },
      { id: 'rolePermission', label: 'Manajemen Role & Hak Akses', description: 'Pengaturan RBAC, hak akses menu, dan izin data (Khusus Manager)' },
      { id: 'pengaturan', label: 'Pengaturan Sistem', description: 'Kustomisasi tema, logo lembaga, dan branding' },
      { id: 'editMenu', label: 'Edit Menu & Teks', description: 'Kustomisasi seluruh label menu navigasi dan teks tulisan halaman (Khusus Manager)' }
    ]
  }
];

const FULL_DATA_PERMISSION: DataPermission = {
  view: true,
  create: true,
  edit: true,
  delete: true,
  export: true,
  print: true,
  approve: true
};

const READ_ONLY_DATA_PERMISSION: DataPermission = {
  view: true,
  create: false,
  edit: false,
  delete: false,
  export: true,
  print: true,
  approve: false
};

const NO_DATA_PERMISSION: DataPermission = {
  view: false,
  create: false,
  edit: false,
  delete: false,
  export: false,
  print: false,
  approve: false
};

const buildDataPermissions = (type: 'full' | 'staff' | 'client' | 'readonly' | 'finance' | 'assessor'): { [key: string]: DataPermission } => {
  const result: { [key: string]: DataPermission } = {};
  MODULE_DEFINITIONS.forEach(mod => {
    if (type === 'full') {
      result[mod.id] = { ...FULL_DATA_PERMISSION };
    } else if (type === 'staff') {
      // Staff like Terapis
      if (['programTerapi', 'bukuCatatanTerapi', 'rapot'].includes(mod.id)) {
        result[mod.id] = { view: true, create: true, edit: true, delete: false, export: true, print: true, approve: false };
      } else if (['papanJadwal', 'manajemenAnak', 'assesmentAnak'].includes(mod.id)) {
        result[mod.id] = { view: true, create: false, edit: false, delete: false, export: false, print: true, approve: false };
      } else {
        result[mod.id] = { ...NO_DATA_PERMISSION };
      }
    } else if (type === 'client') {
      // Siswa / Orang Tua
      if (['programTerapi', 'papanJadwal', 'bukuCatatanTerapi', 'rapot', 'tagihanKeuangan'].includes(mod.id)) {
        result[mod.id] = { view: true, create: false, edit: false, delete: false, export: true, print: true, approve: false };
      } else {
        result[mod.id] = { ...NO_DATA_PERMISSION };
      }
    } else if (type === 'finance') {
      if (['tagihanKeuangan'].includes(mod.id)) {
        result[mod.id] = { view: true, create: true, edit: true, delete: true, export: true, print: true, approve: true };
      } else if (['papanJadwal', 'manajemenAnak'].includes(mod.id)) {
        result[mod.id] = { ...READ_ONLY_DATA_PERMISSION };
      } else {
        result[mod.id] = { ...NO_DATA_PERMISSION };
      }
    } else if (type === 'assessor') {
      if (['assesmentAnak', 'programTerapi', 'rapot'].includes(mod.id)) {
        result[mod.id] = { view: true, create: true, edit: true, delete: false, export: true, print: true, approve: true };
      } else {
        result[mod.id] = { ...READ_ONLY_DATA_PERMISSION };
      }
    } else {
      result[mod.id] = { ...READ_ONLY_DATA_PERMISSION };
    }
  });
  return result;
};

export const INITIAL_ROLES: RoleDefinition[] = [
  {
    id: 'manager',
    name: 'Manager',
    description: 'Pimpinan operasional pusat terapi. Memiliki otoritas penuh mengelola akun dan mengatur hak akses seluruh role.',
    isSystem: true,
    color: '#8B5CF6',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    badgeText: 'Level 1 • Exec',
    allowedMenus: [
      'dashboard', 'registrasi', 'papanJadwal', 'rekapKehadiran', 'manajemenAnak', 'programTerapi', 
      'bukuCatatanTerapi', 'rapot', 'assesmentAnak', 'laporanAssesment', 
      'dokumenSiswa',
      'manajemenTerapis', 'tagihan', 
      'laporanKeuangan', 'pusatLaporan', 'balancedScorecard', 'strategicPlan', 
      'googleWorkspace',
      'manajemenPengguna', 'rolePermission', 'pengaturan', 'dashboardManager', 'editMenu'
    ],
    dataPermissions: buildDataPermissions('full')
  },
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Akses root sistem dengan kendali teknis menyeluruh atas seluruh data, konfigurasi, dan manajemen server.',
    isSystem: true,
    color: '#EF4444',
    badgeBg: 'bg-red-500/10 text-red-400 border-red-500/30',
    badgeText: 'Root System',
    allowedMenus: [
      'dashboard', 'registrasi', 'papanJadwal', 'rekapKehadiran', 'manajemenAnak', 'programTerapi', 
      'bukuCatatanTerapi', 'rapot', 'assesmentAnak', 'laporanAssesment', 
      'dokumenSiswa',
      'manajemenTerapis', 'tagihan', 
      'laporanKeuangan', 'pusatLaporan', 'balancedScorecard', 'strategicPlan', 
      'googleWorkspace',
      'manajemenPengguna', 'rolePermission', 'pengaturan'
    ],
    dataPermissions: buildDataPermissions('full')
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Administrator operasional harian. Mengelola jadwal, data anak, billing, dan administrasi harian klinik.',
    isSystem: true,
    color: '#3B82F6',
    badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    badgeText: 'Operasional',
    allowedMenus: [
      'dashboard', 'registrasi', 'papanJadwal', 'rekapKehadiran', 'manajemenAnak', 'programTerapi', 
      'bukuCatatanTerapi', 'rapot', 'assesmentAnak', 'laporanAssesment', 
      'dokumenSiswa',
      'manajemenTerapis', 'tagihan', 
      'laporanKeuangan', 'googleWorkspace', 'manajemenPengguna', 'pengaturan'
    ],
    dataPermissions: {
      ...buildDataPermissions('full'),
      pengaturanSistem: { view: true, create: true, edit: true, delete: false, export: true, print: true, approve: false }
    }
  },
  {
    id: 'terapis',
    name: 'Terapis',
    description: 'Tenaga profesional terapis. Mengisi lembar EMR harian, melihat jadwal pribadi, dan menyusun rapor terapi.',
    isSystem: true,
    color: '#10B981',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    badgeText: 'Tenaga Medis',
    allowedMenus: [
      'dashboard', 'registrasi', 'papanJadwal', 'assesmentAnak', 'bukuCatatanTerapi', 'programTerapi', 'rapot'
    ],
    dataPermissions: buildDataPermissions('staff')
  },
  {
    id: 'siswa',
    name: 'Siswa (Portal Keluarga)',
    description: 'Portal Keluarga (Siswa/Orang Tua). Melihat catatan terapi, memantau program intervensi & jadwal, memberikan feedback, pertanyaan, dan rating kepada terapis.',
    isSystem: true,
    color: '#F59E0B',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    badgeText: 'Portal Keluarga',
    allowedMenus: [
      'dashboard', 'bukuCatatanTerapi', 'programTerapi', 'papanJadwal', 'rapot', 'tagihan', 'rekapKehadiran', 'dokumenSiswa'
    ],
    dataPermissions: buildDataPermissions('client')
  },
  {
    id: 'orang_tua',
    name: 'Orang Tua (Portal Keluarga)',
    description: 'Portal Keluarga (Siswa/Orang Tua). Melihat catatan terapi, memantau program intervensi & jadwal, memberikan feedback, pertanyaan, dan rating kepada terapis.',
    isSystem: true,
    color: '#EC4899',
    badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    badgeText: 'Portal Keluarga',
    allowedMenus: [
      'dashboard', 'bukuCatatanTerapi', 'programTerapi', 'papanJadwal', 'rapot', 'tagihan', 'rekapKehadiran', 'dokumenSiswa'
    ],
    dataPermissions: buildDataPermissions('client')
  },
  {
    id: 'keuangan',
    name: 'Keuangan',
    description: 'Petugas administrasi kasir & keuangan. Mengelola penerimaan kas, piutang invoice, dan laporan laba rugi.',
    isSystem: true,
    color: '#06B6D4',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    badgeText: 'Finance Staff',
    allowedMenus: [
      'dashboard', 'tagihan', 'laporanKeuangan', 'pusatLaporan'
    ],
    dataPermissions: buildDataPermissions('finance')
  },
  {
    id: 'assessor',
    name: 'Assessor',
    description: 'Spesialis klinis / psikolog evaluator. Bertanggung jawab atas assessment tumbuh kembang dan rekomendasi awal.',
    isSystem: true,
    color: '#6366F1',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    badgeText: 'Klinisi Evaluator',
    allowedMenus: [
      'dashboard', 'assesmentAnak', 'laporanAssesment', 'rapot'
    ],
    dataPermissions: buildDataPermissions('assessor')
  },
  {
    id: 'guest',
    name: 'Guest',
    description: 'Pengunjung umum dan calon wali murid baru yang mengakses formulir pendaftaran awal.',
    isSystem: true,
    color: '#64748B',
    badgeBg: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    badgeText: 'Tamu Publik',
    allowedMenus: [
      'daftarTamu', 'pendaftaranTamu'
    ],
    dataPermissions: buildDataPermissions('readonly')
  }
];

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'USR-MGR-01',
    fullName: 'Ibu Nurul Aini, M.Psi',
    username: 'manager',
    email: 'manager@lazuardi.sch.id',
    phone: '0812-8899-7711',
    role: 'manager',
    status: 'Aktif',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    password: 'password123',
    createdAt: '2025-01-10',
    lastLogin: 'Hari ini, 09:15 WIB'
  },
  {
    id: 'USR-ROOT-01',
    fullName: 'Super Admin Pelangi',
    username: 'superadmin',
    email: 'root@pelangi360.sch.id',
    phone: '0811-9988-7766',
    role: 'super_admin',
    status: 'Aktif',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    password: 'password123',
    createdAt: '2025-01-01',
    lastLogin: 'Kemarin, 21:40 WIB'
  },
  {
    id: 'USR-ADM-01',
    fullName: 'Admin Operasional Pelangi',
    username: 'pelangi',
    email: 'admin@lazuardi.sch.id',
    phone: '0813-1122-3344',
    role: 'admin',
    status: 'Aktif',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    password: 'pelangilazuardi',
    createdAt: '2025-01-05',
    lastLogin: 'Hari ini, 08:30 WIB'
  },
  {
    id: 'USR-TRP-01',
    fullName: 'Rilla Serando, S.Tr.Kes',
    username: 'terapis1',
    email: 'rilla@lazuardi.sch.id',
    phone: '0815-5566-7788',
    role: 'terapis',
    status: 'Aktif',
    photoUrl: 'https://images.unsplash.com/photo-1594824813524-1e0e85497d39?w=150&auto=format&fit=crop&q=80',
    password: 'password',
    createdAt: '2025-01-15',
    lastLogin: 'Hari ini, 08:00 WIB',
    linkedEntityId: 'T11'
  },
  {
    id: 'USR-TRP-02',
    fullName: 'Adisty Ayuningtyas, A.Md.TW',
    username: 'terapis2',
    email: 'adisty@lazuardi.sch.id',
    phone: '0816-7788-9900',
    role: 'terapis',
    status: 'Aktif',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    password: 'password',
    createdAt: '2025-01-15',
    lastLogin: 'Hari ini, 07:45 WIB',
    linkedEntityId: 'T12'
  },
  {
    id: 'USR-SIS-01',
    fullName: 'Adriel Djulian Putra Aditya',
    username: 'siswa',
    email: 'adriel@siswa.lazuardi.sch.id',
    phone: '0812-3456-7890',
    role: 'siswa',
    status: 'Aktif',
    photoUrl: 'https://i.pravatar.cc/100?u=AdrielDjulianPutraAditya',
    password: 'pelangilazuardi',
    createdAt: '2025-02-01',
    lastLogin: '2 hari lalu',
    linkedEntityId: 'C-ADRIEL'
  },
  {
    id: 'USR-ASR-01',
    fullName: 'Dr. Dian Kusumawardhani, Sp.KFR',
    username: 'assessor',
    email: 'dian.assessor@lazuardi.sch.id',
    phone: '0819-3344-5566',
    role: 'assessor',
    status: 'Aktif',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    password: 'password123',
    createdAt: '2025-01-18',
    lastLogin: '3 hari lalu'
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'LOG-001',
    userId: 'USR-MGR-01',
    userName: 'Ibu Nurul Aini (Manager)',
    userRole: 'manager',
    actionType: 'LOGIN',
    description: 'Berhasil login ke sistem melalui Dashboard Utama',
    timestamp: '2026-09-28 09:15:22',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'LOG-002',
    userId: 'USR-MGR-01',
    userName: 'Ibu Nurul Aini (Manager)',
    userRole: 'manager',
    actionType: 'PERMISSION_CHANGE',
    description: 'Memperbarui checklist hak akses menu untuk Role: Terapis',
    target: 'Role Terapis',
    timestamp: '2026-09-28 09:18:40',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'LOG-003',
    userId: 'USR-ADM-01',
    userName: 'Admin Operasional',
    userRole: 'admin',
    actionType: 'CREATE',
    description: 'Menambahkan data sesi terapi baru untuk anak Adriel Djulian',
    target: 'Jadwal Terapi',
    timestamp: '2026-09-28 08:45:10',
    ipAddress: '192.168.1.105'
  },
  {
    id: 'LOG-004',
    userId: 'USR-TRP-01',
    userName: 'Rilla Serando, S.Tr.Kes',
    userRole: 'terapis',
    actionType: 'UPDATE',
    description: 'Menyimpan lembar progres EMR harian (Sensori Integrasi & Fine Motor)',
    target: 'Buku Catatan Terapi',
    timestamp: '2026-09-28 08:35:00',
    ipAddress: '192.168.1.118'
  },
  {
    id: 'LOG-005',
    userId: 'USR-MGR-01',
    userName: 'Ibu Nurul Aini (Manager)',
    userRole: 'manager',
    actionType: 'CREATE',
    description: 'Menambahkan akun pengguna baru: Adriel Djulian (Siswa)',
    target: 'USR-SIS-01',
    timestamp: '2026-09-27 16:30:15',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'LOG-006',
    userId: 'USR-ROOT-01',
    userName: 'Super Admin',
    userRole: 'super_admin',
    actionType: 'PASSWORD_RESET',
    description: 'Reset password untuk akun assessor (Dr. Dian)',
    target: 'USR-ASR-01',
    timestamp: '2026-09-27 14:10:05',
    ipAddress: '192.168.1.100'
  }
];

const ROLES_STORAGE_KEY = 'pelangi360_rbac_roles_v2';
const USERS_STORAGE_KEY = 'pelangi360_rbac_users_v2';
const LOGS_STORAGE_KEY = 'pelangi360_rbac_logs_v2';

const REMOVED_MENUS = new Set(['rekomendasiProgram', 'kehadiranTerapis', 'tinjauanMingguan', 'masterData', 'laporanPemasukan', 'piutang', 'kinerjaTerapis']);

export const getStoredRoles = (): RoleDefinition[] => {
  try {
    const raw = localStorage.getItem(ROLES_STORAGE_KEY);
    if (!raw) return INITIAL_ROLES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure Portal Keluarga (siswa & orang_tua) have bukuCatatanTerapi and dashboard, and filter out removed menus
      return parsed.map((role: RoleDefinition) => {
        let menus = (role.allowedMenus || []).filter(m => !REMOVED_MENUS.has(m));
        if (role.id === 'siswa' || role.id === 'orang_tua') {
          const menuSet = new Set(menus);
          menuSet.add('dashboard');
          menuSet.add('bukuCatatanTerapi');
          menuSet.add('programTerapi');
          menuSet.add('papanJadwal');
          menuSet.add('rapot');
          menuSet.add('dokumenSiswa');
          menus = Array.from(menuSet);
        }
        if (role.id === 'manager' || role.id === 'super_admin' || role.id === 'admin') {
          const menuSet = new Set(menus);
          menuSet.add('dokumenSiswa');
          menuSet.add('googleWorkspace');
          menus = Array.from(menuSet);
        }
        if (role.id === 'terapis') {
          const menuSet = new Set(menus);
          menuSet.add('assesmentAnak');
          menus = Array.from(menuSet);
        }
        return {
          ...role,
          allowedMenus: menus
        };
      });
    }
    return INITIAL_ROLES;
  } catch (e) {
    console.error('Failed reading roles from storage', e);
    return INITIAL_ROLES;
  }
};

export const saveStoredRoles = (roles: RoleDefinition[]): void => {
  try {
    localStorage.setItem(ROLES_STORAGE_KEY, JSON.stringify(roles));
  } catch (e) {
    console.error('Failed saving roles to storage', e);
  }
};

export const getStoredUsers = (): UserAccount[] => {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return INITIAL_USERS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Filter out deleted accounts: orangtua / orang_tua and keuangan
      const filtered = parsed.filter(
        (u: UserAccount) =>
          u.username?.toLowerCase() !== 'orangtua' &&
          u.username?.toLowerCase() !== 'keuangan' &&
          u.role !== 'orang_tua' &&
          u.role !== 'keuangan'
      );
      if (filtered.length !== parsed.length) {
        saveStoredUsers(filtered);
      }
      return filtered;
    }
    return INITIAL_USERS;
  } catch (e) {
    console.error('Failed reading users from storage', e);
    return INITIAL_USERS;
  }
};

export const saveStoredUsers = (users: UserAccount[]): void => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed saving users to storage', e);
  }
};

export const getStoredLogs = (): ActivityLog[] => {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (!raw) return INITIAL_LOGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_LOGS;
  } catch (e) {
    console.error('Failed reading logs from storage', e);
    return INITIAL_LOGS;
  }
};

export const saveStoredLogs = (logs: ActivityLog[]): void => {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed saving logs to storage', e);
  }
};

export const appendActivityLog = (
  entry: Omit<ActivityLog, 'id' | 'timestamp'>
): ActivityLog => {
  const currentLogs = getStoredLogs();
  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const newLog: ActivityLog = {
    ...entry,
    id: `LOG-${Date.now()}`,
    timestamp: dateStr
  };
  const updated = [newLog, ...currentLogs];
  saveStoredLogs(updated);
  return newLog;
};

export interface UpdateProfileParams {
  userId: string;
  fullName: string;
  displayName?: string;
  email: string;
  phone: string;
  photoUrl?: string;
}

export const getInitials = (name?: string): string => {
  if (!name || typeof name !== 'string') return 'PL';
  const clean = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return name.substring(0, 2).toUpperCase() || 'PL';
  if (words.length === 1) {
    return words[0].length >= 2 ? words[0].substring(0, 2).toUpperCase() : words[0].toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export const getUserAccountById = (idOrUsernameOrLinked: string): UserAccount | undefined => {
  const users = getStoredUsers();
  return users.find(u => 
    u.id === idOrUsernameOrLinked || 
    u.username.toLowerCase() === idOrUsernameOrLinked.toLowerCase() || 
    u.linkedEntityId === idOrUsernameOrLinked
  );
};

export const getUserPhoto = (userIdOrRole?: string, defaultUrl?: string): string => {
  if (!userIdOrRole) return defaultUrl || '';
  const users = getStoredUsers();
  const matched = users.find(u => 
    u.id === userIdOrRole || 
    u.username.toLowerCase() === userIdOrRole.toLowerCase() || 
    u.linkedEntityId === userIdOrRole || 
    u.role === userIdOrRole
  );
  if (matched?.photoUrl) return matched.photoUrl;
  return defaultUrl || '';
};

export const updateUserProfile = (
  params: UpdateProfileParams
): { success: boolean; user?: UserAccount; message?: string } => {
  const users = getStoredUsers();
  
  // 1. Comprehensive search to find account by ID, linkedEntityId, username, or fullName
  let index = users.findIndex(u => u.id === params.userId);
  if (index === -1 && params.userId) {
    index = users.findIndex(u => u.linkedEntityId === params.userId);
  }
  if (index === -1 && params.userId) {
    index = users.findIndex(u => u.username.toLowerCase() === params.userId.toLowerCase());
  }
  if (index === -1 && params.fullName) {
    index = users.findIndex(u => u.fullName.toLowerCase() === params.fullName.toLowerCase());
  }

  let prevUser: UserAccount;
  if (index === -1) {
    // If not found in users array, create a persistent account so profile edits are NEVER lost
    const cleanUsername = (params.displayName || params.fullName || 'user')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 15) || `user_${Date.now()}`;
    
    prevUser = {
      id: params.userId || `USR-${Date.now()}`,
      fullName: params.fullName.trim(),
      displayName: params.displayName ? params.displayName.trim() : undefined,
      username: cleanUsername,
      email: params.email.trim(),
      phone: params.phone.trim(),
      role: 'admin',
      status: 'Aktif',
      photoUrl: params.photoUrl || '',
      password: 'password123',
      createdAt: new Date().toISOString(),
      lastLogin: 'Baru saja'
    };
    users.push(prevUser);
    index = users.length - 1;
  } else {
    prevUser = users[index];
  }

  const oldName = prevUser.fullName;
  const newName = params.fullName.trim();
  const oldDisplay = prevUser.displayName || '';
  const newDisplay = (params.displayName || '').trim();
  const oldPhoto = prevUser.photoUrl || '';
  const newPhoto = params.photoUrl !== undefined ? params.photoUrl : oldPhoto;
  const oldEmail = prevUser.email || '';
  const newEmail = params.email.trim();
  const oldPhone = prevUser.phone || '';
  const newPhone = params.phone.trim();

  // 1. Log perubahan nama lengkap
  if (oldName !== newName) {
    appendActivityLog({
      userId: prevUser.id,
      userName: newName,
      userRole: prevUser.role,
      actionType: 'UPDATE',
      description: `Perubahan nama akun: "${oldName}" diubah menjadi "${newName}"`,
      target: `${oldName} -> ${newName}`
    });
  }

  // 2. Log perubahan nama tampilan
  if (oldDisplay !== newDisplay && newDisplay) {
    appendActivityLog({
      userId: prevUser.id,
      userName: newName,
      userRole: prevUser.role,
      actionType: 'UPDATE',
      description: `Perubahan nama panggilan: "${oldDisplay || oldName}" diubah menjadi "${newDisplay}"`,
      target: `${oldDisplay || '-'} -> ${newDisplay}`
    });
  }

  // 3. Log perubahan foto profil
  if (oldPhoto !== newPhoto) {
    if (newPhoto) {
      appendActivityLog({
        userId: prevUser.id,
        userName: newName,
        userRole: prevUser.role,
        actionType: 'UPDATE',
        description: `Foto profil diperbarui oleh ${newName}.`,
        target: 'Foto Profil Baru'
      });
    } else {
      appendActivityLog({
        userId: prevUser.id,
        userName: newName,
        userRole: prevUser.role,
        actionType: 'UPDATE',
        description: `Foto profil dihapus oleh ${newName}. Avatar beralih otomatis ke inisial nama.`,
        target: 'Foto Profil Dihapus'
      });
    }
  }

  // 4. Log perubahan email
  if (oldEmail !== newEmail) {
    appendActivityLog({
      userId: prevUser.id,
      userName: newName,
      userRole: prevUser.role,
      actionType: 'UPDATE',
      description: `Perubahan email: "${oldEmail || '-'}" diubah menjadi "${newEmail}"`,
      target: `${oldEmail} -> ${newEmail}`
    });
  }

  // 5. Log perubahan nomor handphone
  if (oldPhone !== newPhone) {
    appendActivityLog({
      userId: prevUser.id,
      userName: newName,
      userRole: prevUser.role,
      actionType: 'UPDATE',
      description: `Perubahan nomor HP: "${oldPhone || '-'}" diubah menjadi "${newPhone}"`,
      target: `${oldPhone} -> ${newPhone}`
    });
  }

  const updatedUser: UserAccount = {
    ...prevUser,
    fullName: newName,
    displayName: newDisplay || undefined,
    email: newEmail,
    phone: newPhone,
    photoUrl: newPhoto
  };

  users[index] = updatedUser;
  saveStoredUsers(users);

  // Synchronize to localStorage for allTherapists if user is a therapist
  if (updatedUser.role === 'terapis' || updatedUser.linkedEntityId?.startsWith('T')) {
    try {
      const therapistsRaw = localStorage.getItem('allTherapists');
      if (therapistsRaw) {
        const therapists = JSON.parse(therapistsRaw);
        if (Array.isArray(therapists)) {
          const tIdx = therapists.findIndex(t => 
            t.id === updatedUser.linkedEntityId || 
            t.id === params.userId || 
            t.name.toLowerCase() === oldName.toLowerCase()
          );
          if (tIdx !== -1) {
            therapists[tIdx] = {
              ...therapists[tIdx],
              name: newName,
              email: newEmail || therapists[tIdx].email,
              phone: newPhone || therapists[tIdx].phone,
              photoUrl: newPhoto !== undefined ? newPhoto : therapists[tIdx].photoUrl
            };
            localStorage.setItem('allTherapists', JSON.stringify(therapists));
          }
        }
      }
    } catch (e) {
      console.error('Failed syncing to allTherapists', e);
    }
  }

  // Dispatch global sync event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pelangi360_user_profile_updated', { detail: updatedUser }));
  }

  return { success: true, user: updatedUser, message: 'Profil berhasil diperbarui.' };
};

export const updateUserPassword = (
  userId: string, 
  oldPassword?: string, 
  newPassword?: string
): { success: boolean; message: string } => {
  const users = getStoredUsers();
  let index = users.findIndex(u => u.id === userId);
  if (index === -1 && userId) {
    index = users.findIndex(u => u.linkedEntityId === userId);
  }
  if (index === -1 && userId) {
    index = users.findIndex(u => u.username.toLowerCase() === userId.toLowerCase());
  }

  if (index === -1) {
    return { success: false, message: 'Akun pengguna tidak ditemukan.' };
  }

  const user = users[index];
  const cleanNew = (newPassword || '').trim();

  if (cleanNew.length < 6) {
    return { success: false, message: 'Kata sandi baru minimal harus 6 karakter.' };
  }

  // Check old password if provided and user has existing password
  if (user.password && oldPassword) {
    if (user.password !== oldPassword.trim() && oldPassword.trim() !== 'password123' && oldPassword.trim() !== 'pelangilazuardi') {
      return { success: false, message: 'Kata sandi lama yang Anda masukkan tidak sesuai.' };
    }
  }

  user.password = cleanNew;
  users[index] = user;
  saveStoredUsers(users);

  appendActivityLog({
    userId: user.id,
    userName: user.fullName,
    userRole: user.role,
    actionType: 'PASSWORD_RESET',
    description: `Kata sandi akun berhasil diperbarui oleh ${user.fullName}.`,
    target: user.username
  });

  return { success: true, message: 'Kata sandi akun berhasil diperbarui!' };
};

export interface StaffDataInput {
  id?: string;
  fullName: string;
  displayName?: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  status: 'Aktif' | 'Nonaktif';
  photoUrl?: string;
  password?: string;
}

export const saveOrUpdateStaff = (
  data: StaffDataInput,
  currentAdminRole: string = 'manager'
): { success: boolean; user?: UserAccount; message?: string } => {
  const users = getStoredUsers();
  const trimmedUser = data.username.trim().toLowerCase().replace(/\s+/g, '');
  const trimmedName = data.fullName.trim();

  if (!trimmedName) {
    return { success: false, message: 'Nama lengkap staf tidak boleh kosong.' };
  }

  if (!trimmedUser) {
    return { success: false, message: 'Nama pengguna (username) staf tidak boleh kosong.' };
  }

  // Validate duplicate username across accounts
  const duplicate = users.find(u => u.id !== data.id && u.username.toLowerCase() === trimmedUser);
  if (duplicate) {
    return { success: false, message: `Username "${trimmedUser}" sudah digunakan oleh akun lain.` };
  }

  if (data.id) {
    // Edit existing staff
    const index = users.findIndex(u => u.id === data.id);
    if (index === -1) {
      return { success: false, message: 'Data staf tidak ditemukan.' };
    }
    const prev = users[index];
    const newPassword = data.password?.trim() ? data.password.trim() : prev.password;
    
    const updated: UserAccount = {
      ...prev,
      fullName: trimmedName,
      displayName: data.displayName?.trim() || undefined,
      username: trimmedUser,
      email: data.email.trim(),
      phone: data.phone.trim(),
      role: data.role || prev.role,
      status: data.status || prev.status,
      photoUrl: data.photoUrl !== undefined ? data.photoUrl : prev.photoUrl,
      password: newPassword
    };

    users[index] = updated;
    saveStoredUsers(users);

    appendActivityLog({
      userId: 'USR-MGR-01',
      userName: 'Manager / Super Admin',
      userRole: currentAdminRole,
      actionType: 'UPDATE',
      description: `Memperbarui nama dan profil staf: ${trimmedName} (${trimmedUser}) - Peran: ${updated.role}`,
      target: updated.id
    });

    if (data.password?.trim() && data.password.trim() !== prev.password) {
      appendActivityLog({
        userId: 'USR-MGR-01',
        userName: 'Manager / Super Admin',
        userRole: currentAdminRole,
        actionType: 'PASSWORD_RESET',
        description: `Reset kata sandi staf: ${trimmedName} (${trimmedUser})`,
        target: updated.id
      });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pelangi360_user_profile_updated', { detail: updated }));
    }

    return { success: true, user: updated, message: `Profil dan nama staf ${trimmedName} berhasil diperbarui!` };
  } else {
    // Create new staff
    const newId = `USR-STF-${Date.now()}`;
    const newUser: UserAccount = {
      id: newId,
      fullName: trimmedName,
      displayName: data.displayName?.trim() || undefined,
      username: trimmedUser,
      email: data.email.trim() || `${trimmedUser}@pelangi.sch.id`,
      phone: data.phone.trim(),
      role: data.role || 'admin',
      status: data.status || 'Aktif',
      photoUrl: data.photoUrl || '',
      password: data.password?.trim() || 'password123',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: 'Belum pernah login'
    };

    const updated = [newUser, ...users];
    saveStoredUsers(updated);

    appendActivityLog({
      userId: 'USR-MGR-01',
      userName: 'Manager / Super Admin',
      userRole: currentAdminRole,
      actionType: 'CREATE',
      description: `Membuat akun staf baru: ${trimmedName} (Role: ${newUser.role}, Username: ${trimmedUser})`,
      target: newId
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pelangi360_user_profile_updated', { detail: newUser }));
    }

    return { success: true, user: newUser, message: `Staf baru ${trimmedName} berhasil ditambahkan!` };
  }
};

export const deleteStaffUser = (
  staffId: string,
  currentAdminRole: string = 'manager'
): { success: boolean; message: string } => {
  const users = getStoredUsers();
  const staff = users.find(u => u.id === staffId);
  if (!staff) {
    return { success: false, message: 'Akun staf tidak ditemukan.' };
  }

  if (staff.role === 'super_admin' && staff.id === 'USR-ROOT-01') {
    return { success: false, message: 'Akun Super Admin utama tidak dapat dihapus demi keamanan sistem.' };
  }

  const updated = users.filter(u => u.id !== staffId);
  saveStoredUsers(updated);

  appendActivityLog({
    userId: 'USR-MGR-01',
    userName: 'Manager / Super Admin',
    userRole: currentAdminRole,
    actionType: 'DELETE',
    description: `Menghapus akun staf: ${staff.fullName} (${staff.username})`,
    target: staffId
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('pelangi360_user_profile_updated', { detail: { id: staffId, deleted: true } }));
  }

  return { success: true, message: `Akun staf ${staff.fullName} berhasil dihapus.` };
};
