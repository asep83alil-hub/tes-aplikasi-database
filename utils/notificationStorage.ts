import { View, UserRole } from '../types';

export type NotificationCategory = 
  | 'pengumuman'
  | 'terapi' 
  | 'kehadiran'
  | 'catatan' 
  | 'program'
  | 'assessment' 
  | 'keuangan' 
  | 'sdm' 
  | 'registrasi'
  | 'operasional';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  timeFormatted: string;
  timestamp: number;
  isRead: boolean;
  targetView: View;
  targetId?: string;
  studentId?: string; // e.g. 'C-ADRIEL', 'C102', 'C103', 'C104'
  studentName?: string;
  therapistId?: string;
  therapistName?: string;
  allowedRoles?: string[];
  isAnnouncement?: boolean;
  targetAudience?: 'all' | 'all_students' | 'specific_student' | 'all_therapists' | 'specific_therapist' | 'management';
  createdBy?: string;
  senderRole?: string;
}

export interface CreateAnnouncementParams {
  title: string;
  description: string;
  category?: NotificationCategory;
  targetAudience: 'all' | 'all_students' | 'specific_student' | 'all_therapists' | 'specific_therapist' | 'management';
  targetStudentId?: string;
  targetStudentName?: string;
  targetTherapistId?: string;
  targetTherapistName?: string;
  targetView?: View;
  senderName?: string;
  senderRole?: string;
}

const STORAGE_KEY = 'pelangi360_notifications_v6';

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  // =========================================================================
  // 1. PENGUMUMAN RESMI (Dapat diakses oleh Siswa, Orang Tua, dan Seluruh Akun)
  // =========================================================================
  {
    id: 'notif-ann-01',
    category: 'pengumuman',
    title: '📢 Pengumuman: Libur Nasional & Penyesuaian Jadwal',
    description: 'Klinik Pelangi 360 mengumumkan penyesuaian jadwal operasional pada libur nasional. Sesi terapi pengganti dapat dikonsultasikan melalui admin klinik.',
    timeFormatted: '1 jam yang lalu',
    timestamp: Date.now() - 60 * 60 * 1000,
    isRead: false,
    targetView: 'dashboard',
    isAnnouncement: true
  },
  {
    id: 'notif-ann-02',
    category: 'pengumuman',
    title: '📢 Webinar Parenting: Stimulasi Sensori Mandiri di Rumah',
    description: 'Seminar daring khusus wali murid bertajuk "Mendampingi Stimulasi Sensori & Bahasa Anak di Rumah" akan diselenggarakan pada Sabtu, 18 Oktober 2026.',
    timeFormatted: '3 jam yang lalu',
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    isRead: false,
    targetView: 'dashboard',
    isAnnouncement: true
  },
  {
    id: 'notif-ann-03',
    category: 'pengumuman',
    title: '📢 Agenda Kegiatan: Pekan Kreasi Motorik & Bahasa',
    description: 'Seluruh siswa dan orang tua diundang berpartisipasi dalam sesi outdoor fun games motorik di area taman klinik pada akhir bulan ini.',
    timeFormatted: '1 hari yang lalu',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    isRead: true,
    targetView: 'dashboard',
    isAnnouncement: true
  },

  // =========================================================================
  // 2. DATA SISWA: ANANDA ADRIEL DJULIAN PUTRA ADITYA (studentId: 'C-ADRIEL')
  // =========================================================================
  // --- A. Jadwal Terapi Adriel ---
  {
    id: 'notif-trp-adriel-01',
    category: 'terapi',
    title: '📅 Pengingat Jadwal Terapi Hari Ini',
    description: 'Ananda Adriel dijadwalkan mengikuti sesi Terapi Okupasi (OT) hari ini pukul 10:00 WIB di Ruang Sensori 1 bersama Terapis Rilla Serando.',
    timeFormatted: '10 menit yang lalu',
    timestamp: Date.now() - 10 * 60 * 1000,
    isRead: false,
    targetView: 'papanJadwal',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya'
  },
  {
    id: 'notif-trp-adriel-02',
    category: 'terapi',
    title: '📅 Pengingat Jadwal Terapi Besok',
    description: 'Pengingat ramah: Sesi Terapi Wicara (TW) ananda Adriel dijadwalkan besok Kamis pukul 09:00 WIB bersama Terapis Adisty Ayuningtyas.',
    timeFormatted: '45 menit yang lalu',
    timestamp: Date.now() - 45 * 60 * 1000,
    isRead: false,
    targetView: 'papanJadwal',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya'
  },
  {
    id: 'notif-trp-adriel-03',
    category: 'terapi',
    title: 'Perubahan Jadwal Terapi',
    description: 'Sesi Terapi Okupasi ananda Adriel pada hari Rabu telah disesuaikan menjadi pukul 10:00 WIB sesuai konfirmasi bersama terapis utama.',
    timeFormatted: '2 jam yang lalu',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    isRead: false,
    targetView: 'papanJadwal',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya'
  },

  // --- B. Kehadiran Terapi Adriel ---
  {
    id: 'notif-khd-adriel-01',
    category: 'kehadiran',
    title: 'Kehadiran Terapi Tercatat',
    description: 'Kehadiran ananda Adriel pada sesi Terapi Okupasi hari ini telah tercatat: Hadir Tepat Waktu (Status: Hadir).',
    timeFormatted: '25 menit yang lalu',
    timestamp: Date.now() - 25 * 60 * 1000,
    isRead: false,
    targetView: 'papanJadwal',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya'
  },
  {
    id: 'notif-khd-adriel-02',
    category: 'kehadiran',
    title: 'Permintaan Konfirmasi Kehadiran',
    description: 'Mohon konfirmasi rencana kehadiran ananda Adriel untuk sesi terapi tambahan di hari Sabtu mendatang.',
    timeFormatted: '4 jam yang lalu',
    timestamp: Date.now() - 4 * 60 * 60 * 1000,
    isRead: true,
    targetView: 'papanJadwal',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya'
  },

  // --- C. Catatan Terapi EMR Adriel ---
  {
    id: 'notif-cat-adriel-01',
    category: 'catatan',
    title: 'Catatan Terapi Baru Telah Dibuat',
    description: 'Terapis Rilla Serando telah menambahkan lembar catatan progres EMR untuk sesi Terapi Okupasi tanggal 29 September 2026.',
    timeFormatted: '15 menit yang lalu',
    timestamp: Date.now() - 15 * 60 * 1000,
    isRead: false,
    targetView: 'bukuCatatanTerapi',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya'
  },
  {
    id: 'notif-cat-adriel-02',
    category: 'catatan',
    title: 'Feedback dari Terapis',
    description: 'Terapis menyampaikan feedback: "Adriel menunjukkan konsentrasi yang sangat baik saat latihan koordinasi mata dan tangan (hand-eye coordination)."',
    timeFormatted: '2 jam yang lalu',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    isRead: false,
    targetView: 'bukuCatatanTerapi',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya'
  },
  {
    id: 'notif-cat-adriel-03',
    category: 'catatan',
    title: 'Balasan Komentar Orang Tua',
    description: 'Terapis telah membalas catatan Mama Adriel terkait panduan latihan stimulasi vestibular di rumah.',
    timeFormatted: '5 jam yang lalu',
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    isRead: true,
    targetView: 'bukuCatatanTerapi',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya'
  },

  // --- D. Program Terapi Adriel ---
  {
    id: 'notif-prg-adriel-01',
    category: 'program',
    title: 'Target Terapi Diperbarui',
    description: 'Target integrasi sensori dan artikulasi Adriel telah disetujui terapis utama dengan capaian indikator 85%.',
    timeFormatted: '1 jam yang lalu',
    timestamp: Date.now() - 60 * 60 * 1000,
    isRead: false,
    targetView: 'programTerapi',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya'
  },
  {
    id: 'notif-prg-adriel-02',
    category: 'program',
    title: 'Program Terapi Baru Ditetapkan',
    description: 'Rencana kurikulum intervensi individual semester ganjil untuk ananda Adriel telah diterbitkan dan dapat diunduh.',
    timeFormatted: '6 jam yang lalu',
    timestamp: Date.now() - 6 * 60 * 60 * 1000,
    isRead: true,
    targetView: 'programTerapi',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya'
  },

  // --- E. Assessment Adriel ---
  {
    id: 'notif-asm-adriel-01',
    category: 'assessment',
    title: '📋 Hasil Assessment Tersedia',
    description: 'Laporan hasil observasi klinis dan evaluasi tumbuh kembang ananda Adriel telah selesai dan siap ditinjau.',
    timeFormatted: '1 jam yang lalu',
    timestamp: Date.now() - 60 * 60 * 1000,
    isRead: false,
    targetView: 'laporanAssesment',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya'
  },
  {
    id: 'notif-asm-adriel-02',
    category: 'assessment',
    title: 'Laporan Assessment Selesai',
    description: 'Dokumen observasi klinis psikologis dan evaluasi Terapi Wicara Adriel telah diverifikasi oleh tim asesor Dr. Dian Kusumawardhani.',
    timeFormatted: '5 jam yang lalu',
    timestamp: Date.now() - 5 * 60 * 60 * 1000,
    isRead: true,
    targetView: 'laporanAssesment',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya'
  },

  // --- F. Tagihan & Keuangan Adriel ---
  {
    id: 'notif-keu-adriel-01',
    category: 'keuangan',
    title: 'Tagihan Baru Diterbitkan',
    description: 'Invoice paket terapi bulan berjalan ananda Adriel (#INV-202610-019) telah diterbitkan. Batas jatuh tempo pembayaran: 10 Oktober 2026.',
    timeFormatted: '30 menit yang lalu',
    timestamp: Date.now() - 30 * 60 * 1000,
    isRead: false,
    targetView: 'tagihan',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya'
  },
  {
    id: 'notif-keu-adriel-02',
    category: 'keuangan',
    title: 'Pembayaran Berhasil Diterima',
    description: 'Pembayaran tagihan invoice #INV-202609-012 senilai Rp 1.750.000 atas nama Adriel telah diverifikasi lunas.',
    timeFormatted: '1 hari yang lalu',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    isRead: true,
    targetView: 'tagihan',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya'
  },

  // =========================================================================
  // 3. DATA SISWA LAIN (KHUSUS SISWA TERSEBUT - TIDAK BOLEH MUNCUL DI AKUN ADRIEL)
  // =========================================================================
  // --- Siswa Alya Putri (studentId: 'C103') ---
  {
    id: 'notif-trp-alya-01',
    category: 'terapi',
    title: '📅 Jadwal Terapi Baru',
    description: 'Alya Putri dijadwalkan terapi OT hari Senin pukul 09.00 di Ruang Sensori 1.',
    timeFormatted: '15 menit yang lalu',
    timestamp: Date.now() - 15 * 60 * 1000,
    isRead: false,
    targetView: 'papanJadwal',
    studentId: 'C103',
    studentName: 'Alya Putri'
  },
  {
    id: 'notif-asm-alya-01',
    category: 'assessment',
    title: '📋 Assessment Selesai',
    description: 'Laporan assessment OT Alya Putri telah selesai dibuat oleh Dr. Dian Kusumawardhani.',
    timeFormatted: '1 jam yang lalu',
    timestamp: Date.now() - 60 * 60 * 1000,
    isRead: false,
    targetView: 'laporanAssesment',
    studentId: 'C103',
    studentName: 'Alya Putri'
  },
  {
    id: 'notif-keu-alya-01',
    category: 'keuangan',
    title: 'Tagihan Baru Terbit',
    description: 'Invoice terapi ananda Alya Putri bulan Oktober telah diterbitkan.',
    timeFormatted: '2 jam yang lalu',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    isRead: false,
    targetView: 'tagihan',
    studentId: 'C103',
    studentName: 'Alya Putri'
  },

  // --- Siswa Kevin Pratama (studentId: 'C102') ---
  {
    id: 'notif-cat-kevin-01',
    category: 'catatan',
    title: 'Catatan Terapi Baru',
    description: 'Lembar evaluasi Terapi Sensori Integrasi Kevin Pratama telah selesai dibuat oleh terapis pendamping.',
    timeFormatted: '50 menit yang lalu',
    timestamp: Date.now() - 50 * 60 * 1000,
    isRead: false,
    targetView: 'bukuCatatanTerapi',
    studentId: 'C102',
    studentName: 'Kevin Pratama'
  },
  {
    id: 'notif-asm-kevin-01',
    category: 'assessment',
    title: 'Laporan Assessment Siap Dicetak',
    description: 'Dokumen observasi klinis psikologis Kevin Pratama telah diverifikasi dan siap diunduh.',
    timeFormatted: '3 jam yang lalu',
    timestamp: Date.now() - 3 * 60 * 60 * 1000,
    isRead: false,
    targetView: 'laporanAssesment',
    studentId: 'C102',
    studentName: 'Kevin Pratama'
  },

  // --- Siswa Bima Nugraha (studentId: 'C104') ---
  {
    id: 'notif-trp-bima-01',
    category: 'terapi',
    title: 'Jadwal Terapi Dibatalkan',
    description: 'Sesi Fisioterapi Bima Nugraha hari Jumat dibatalkan atas permintaan keluarga dan akan dijadwalkan ulang.',
    timeFormatted: '1 jam yang lalu',
    timestamp: Date.now() - 60 * 60 * 1000,
    isRead: false,
    targetView: 'papanJadwal',
    studentId: 'C104',
    studentName: 'Bima Nugraha'
  },

  // =========================================================================
  // 4. NOTIFIKASI INTERNAL MANAJEMEN / OPERASIONAL (TERLARANG UNTUK AKUN SISWA)
  // =========================================================================
  // --- SDM (Hanya untuk Manager, Admin, Super Admin, Terapis) ---
  {
    id: 'notif-sdm-int-01',
    category: 'sdm',
    title: 'Pengajuan Cuti Terapis',
    description: 'Terapis Adisty Ayuningtyas mengajukan permohonan izin cuti pelatihan eksternal pada tanggal 15 Oktober 2026.',
    timeFormatted: '40 menit yang lalu',
    timestamp: Date.now() - 40 * 60 * 1000,
    isRead: false,
    targetView: 'manajemenTerapis',
    allowedRoles: ['manager', 'super_admin', 'admin']
  },
  {
    id: 'notif-sdm-int-02',
    category: 'sdm',
    title: 'Persetujuan Cuti Tenaga Medis',
    description: 'Izin tugas klinik Terapis Rilla Serando telah disetujui pimpinan manajemen Pelangi 360.',
    timeFormatted: '1 hari yang lalu',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    isRead: true,
    targetView: 'manajemenTerapis',
    allowedRoles: ['manager', 'super_admin', 'terapis', 'admin']
  },
  {
    id: 'notif-sdm-int-03',
    category: 'sdm',
    title: 'Evaluasi Kinerja Berkala Terapis',
    description: 'Laporan pencapaian target jam terapi dan KPI terapis bulan September telah siap ditinjau pimpinan.',
    timeFormatted: '2 hari yang lalu',
    timestamp: Date.now() - 48 * 60 * 60 * 1000,
    isRead: true,
    targetView: 'balancedScorecard',
    allowedRoles: ['manager', 'super_admin']
  },

  // --- Operasional & Registrasi Internal (Hanya Admin / Manager) ---
  {
    id: 'notif-reg-int-01',
    category: 'registrasi',
    title: 'Pendaftaran Siswa Baru Masuk',
    description: 'Calon siswa baru ananda Clarissa Dewi telah melengkapi 12 langkah formulir registrasi online klinik.',
    timeFormatted: '20 menit yang lalu',
    timestamp: Date.now() - 20 * 60 * 1000,
    isRead: false,
    targetView: 'registrasi',
    allowedRoles: ['admin', 'manager', 'super_admin', 'assessor']
  },
  {
    id: 'notif-ops-int-01',
    category: 'operasional',
    title: 'Penambahan Akun Admin Sistem',
    description: 'Akun staf administrasi baru telah dibuat oleh Manager Pelangi 360.',
    timeFormatted: '1 hari yang lalu',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    isRead: true,
    targetView: 'manajemenPengguna',
    allowedRoles: ['manager', 'super_admin']
  },
  {
    id: 'notif-keu-int-01',
    category: 'operasional',
    title: 'Laporan Keuangan & Penggajian',
    description: 'Rekapitulasi beban operasional dan honor terapis bulan September telah diselesaikan bagian keuangan.',
    timeFormatted: '2 hari yang lalu',
    timestamp: Date.now() - 48 * 60 * 60 * 1000,
    isRead: true,
    targetView: 'laporanKeuangan',
    allowedRoles: ['manager', 'super_admin', 'keuangan']
  }
];

// Helper to sanitize notification objects safely
export const sanitizeNotification = (item: any): AppNotification | null => {
  if (!item || typeof item !== 'object') return null;
  const id = String(item.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`);
  
  const VALID_CATEGORIES: NotificationCategory[] = [
    'pengumuman',
    'terapi',
    'kehadiran',
    'catatan',
    'program',
    'assessment',
    'keuangan',
    'sdm',
    'registrasi',
    'operasional'
  ];

  const category: NotificationCategory = VALID_CATEGORIES.includes(item.category) 
    ? item.category 
    : 'pengumuman';

  const validAudiences = ['all', 'all_students', 'specific_student', 'all_therapists', 'specific_therapist', 'management'];
  const targetAudience = validAudiences.includes(item.targetAudience) ? item.targetAudience : undefined;

  return {
    id,
    category,
    title: String(item.title || 'Pemberitahuan Sistem'),
    description: String(item.description || 'Tidak ada keterangan tambahan.'),
    timeFormatted: String(item.timeFormatted || 'Baru saja'),
    timestamp: typeof item.timestamp === 'number' ? item.timestamp : Date.now(),
    isRead: Boolean(item.isRead),
    targetView: (item.targetView || 'dashboard') as View,
    targetId: item.targetId ? String(item.targetId) : undefined,
    studentId: item.studentId ? String(item.studentId) : undefined,
    studentName: item.studentName ? String(item.studentName) : undefined,
    therapistId: item.therapistId ? String(item.therapistId) : undefined,
    therapistName: item.therapistName ? String(item.therapistName) : undefined,
    allowedRoles: Array.isArray(item.allowedRoles) ? item.allowedRoles.map(String) : undefined,
    isAnnouncement: Boolean(item.isAnnouncement),
    targetAudience,
    createdBy: item.createdBy ? String(item.createdBy) : undefined,
    senderRole: item.senderRole ? String(item.senderRole) : undefined
  };
};

export const getStoredNotifications = (): AppNotification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveStoredNotifications(INITIAL_NOTIFICATIONS);
      return INITIAL_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const sanitized = parsed
        .map(sanitizeNotification)
        .filter((n): n is AppNotification => n !== null);
      if (sanitized.length > 0) {
        return sanitized;
      }
    }
    saveStoredNotifications(INITIAL_NOTIFICATIONS);
    return INITIAL_NOTIFICATIONS;
  } catch (e) {
    console.error('Failed reading notifications from storage', e);
    return INITIAL_NOTIFICATIONS;
  }
};

export const saveStoredNotifications = (notifications: AppNotification[]): void => {
  try {
    const safeData = Array.isArray(notifications) 
      ? notifications.map(sanitizeNotification).filter((n): n is AppNotification => n !== null)
      : INITIAL_NOTIFICATIONS;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
    
    // Dispatch custom event to notify listeners (such as header bell icon badge)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pelangi360_notifications_updated'));
    }
  } catch (e) {
    console.error('Failed saving notifications to storage', e);
  }
};

/**
 * Creates and persists a new targeted announcement by Admin or Manager
 */
export const createAnnouncementNotification = (params: CreateAnnouncementParams): AppNotification => {
  const currentNotifs = getStoredNotifications();
  const category = params.category || 'pengumuman';
  const targetAudience = params.targetAudience || 'all';

  let isAnnouncement = false;
  let allowedRoles: string[] = [];

  if (targetAudience === 'all') {
    isAnnouncement = true;
    allowedRoles = ['super_admin', 'admin', 'manager', 'terapis', 'keuangan', 'assessor', 'siswa', 'orang_tua'];
  } else if (targetAudience === 'all_students') {
    isAnnouncement = true;
    allowedRoles = ['siswa', 'orang_tua', 'admin', 'manager', 'super_admin'];
  } else if (targetAudience === 'specific_student') {
    isAnnouncement = false;
    allowedRoles = ['siswa', 'orang_tua', 'admin', 'manager', 'super_admin'];
  } else if (targetAudience === 'all_therapists') {
    isAnnouncement = false;
    allowedRoles = ['terapis', 'admin', 'manager', 'super_admin'];
  } else if (targetAudience === 'specific_therapist') {
    isAnnouncement = false;
    allowedRoles = ['terapis', 'admin', 'manager', 'super_admin'];
  } else if (targetAudience === 'management') {
    isAnnouncement = false;
    allowedRoles = ['super_admin', 'admin', 'manager'];
  }

  // Format default targetView according to category
  let targetView: View = params.targetView || 'dashboard';
  if (!params.targetView) {
    if (category === 'terapi' || category === 'kehadiran') targetView = 'papanJadwal';
    else if (category === 'assessment') targetView = 'assesmentAnak';
    else if (category === 'program') targetView = 'programTerapi';
    else if (category === 'catatan') targetView = 'bukuCatatanTerapi';
    else if (category === 'keuangan') targetView = 'tagihan';
    else if (category === 'sdm') targetView = 'manajemenTerapis';
    else targetView = 'dashboard';
  }

  const newNotification: AppNotification = {
    id: `notif-ann-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    category,
    title: params.title.trim(),
    description: params.description.trim(),
    timeFormatted: 'Baru saja',
    timestamp: Date.now(),
    isRead: false,
    targetView,
    targetAudience,
    isAnnouncement,
    allowedRoles,
    studentId: targetAudience === 'specific_student' ? params.targetStudentId : undefined,
    studentName: targetAudience === 'specific_student' ? params.targetStudentName : undefined,
    therapistId: targetAudience === 'specific_therapist' ? params.targetTherapistId : undefined,
    therapistName: targetAudience === 'specific_therapist' ? params.targetTherapistName : undefined,
    createdBy: params.senderName || 'Admin / Manager',
    senderRole: params.senderRole || 'admin'
  };

  const updated = [newNotification, ...currentNotifs];
  saveStoredNotifications(updated);
  return newNotification;
};

/**
 * Deletes a notification from storage (useful for Admin / Manager to withdraw announcements)
 */
export const deleteStoredNotification = (notificationId: string): void => {
  const currentNotifs = getStoredNotifications();
  const updated = currentNotifs.filter(n => n.id !== notificationId);
  saveStoredNotifications(updated);
};

/**
 * Filter notifications with strict role-based and student-based rules:
 * - Siswa / Orang Tua ONLY receive:
 *   1) Pengumuman umum (targetAudience 'all' or 'all_students' or isAnnouncement)
 *   2) Notifications matching notification.studentId === currentStudentId for allowed student categories:
 *      (Jadwal Terapi, Kehadiran, Catatan Terapi, Program Terapi, Assessment, Keuangan/Tagihan)
 * - Internal SDM, Operasional, and other students' data are STRICTLY EXCLUDED.
 * - Priority sorting:
 *   1. Belum dibaca (unread first)
 *   2. Terbaru (newest timestamp first)
 *   3. Sudah dibaca (read last, sorted newest to oldest)
 */
export const filterNotificationsForUser = (
  notifications: AppNotification[],
  userRole?: UserRole,
  studentId?: string,
  studentName?: string
): AppNotification[] => {
  try {
    const safeList = Array.isArray(notifications) 
      ? notifications.filter((item): item is AppNotification => item !== null && typeof item === 'object')
      : [];
    const role = (userRole || 'admin').toLowerCase();

    // =========================================================================
    // 1. FILTER KHUSUS AKUN SISWA DAN ORANG TUA
    // =========================================================================
    if (role === 'siswa' || role === 'orang_tua') {
      const targetStudentId = String(studentId || 'C-ADRIEL').trim().toLowerCase();

      // Kategori yang diizinkan untuk siswa/orang tua
      const ALLOWED_STUDENT_CATEGORIES: NotificationCategory[] = [
        'pengumuman',
        'terapi',
        'kehadiran',
        'catatan',
        'program',
        'assessment',
        'keuangan'
      ];

      const filtered = safeList.filter(item => {
        if (!item) return false;
        
        // Block management and therapist internal targets
        if (
          item.targetAudience === 'management' || 
          item.targetAudience === 'all_therapists' || 
          item.targetAudience === 'specific_therapist'
        ) {
          return false;
        }

        // 1. Filter Kategori: Tolak tegas notifikasi SDM, Operasional, Registrasi Calon Klien Baru Internal
        if (!ALLOWED_STUDENT_CATEGORIES.includes(item.category)) {
          return false;
        }

        // 2. Pengumuman Umum atau Broadcast Siswa: Berlaku untuk seluruh siswa dan orang tua
        if (
          item.targetAudience === 'all' || 
          item.targetAudience === 'all_students' || 
          item.category === 'pengumuman' || 
          item.isAnnouncement
        ) {
          // Jika secara spesifik ditujukan ke siswa tertentu, pastikan siswa tersebut cocok
          if (item.targetAudience === 'specific_student' || item.studentId) {
            const itemStudentId = String(item.studentId || '').trim().toLowerCase();
            return itemStudentId === targetStudentId;
          }
          return true;
        }

        // 3. Data Siswa Spesifik: Wajib memiliki studentId dan persis cocok dengan siswa yang sedang login
        // Siswa B TIDAK BOLEH melihat notifikasi Siswa A
        const itemStudentId = String(item.studentId || '').trim().toLowerCase();
        if (itemStudentId && itemStudentId === targetStudentId) {
          return true;
        }

        return false;
      });

      // Prioritas Notifikasi:
      // 1. Belum dibaca
      // 2. Terbaru (timestamp descending)
      // 3. Sudah dibaca (timestamp descending)
      return filtered.sort((a, b) => {
        if (a.isRead !== b.isRead) {
          return a.isRead ? 1 : -1; // unread (false) first
        }
        return (b.timestamp || 0) - (a.timestamp || 0); // newest first
      });
    }

    // =========================================================================
    // 2. FILTER KHUSUS TERAPIS
    // =========================================================================
    if (role === 'terapis') {
      const filtered = safeList.filter(item => {
        if (!item) return false;

        // Block notifications specifically targeted to students or management
        if (item.targetAudience === 'management' || item.targetAudience === 'all_students' || item.targetAudience === 'specific_student') {
          return false;
        }

        if (item.targetAudience === 'all' || item.targetAudience === 'all_therapists' || item.category === 'pengumuman' || item.isAnnouncement) {
          return true;
        }

        if (['terapi', 'kehadiran', 'catatan', 'program', 'assessment', 'sdm'].includes(item.category)) {
          return true;
        }

        if (item.allowedRoles && item.allowedRoles.includes('terapis')) {
          return true;
        }

        return false;
      });

      return filtered.sort((a, b) => {
        if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
        return (b.timestamp || 0) - (a.timestamp || 0);
      });
    }

    // =========================================================================
    // 3. FILTER KHUSUS KEUANGAN
    // =========================================================================
    if (role === 'keuangan') {
      const filtered = safeList.filter(item => {
        if (!item) return false;
        if (item.category === 'pengumuman' || item.isAnnouncement) return true;
        if (['keuangan', 'registrasi', 'operasional'].includes(item.category)) {
          return true;
        }
        if (item.allowedRoles && item.allowedRoles.includes('keuangan')) {
          return true;
        }
        return false;
      });

      return filtered.sort((a, b) => {
        if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
        return (b.timestamp || 0) - (a.timestamp || 0);
      });
    }

    // =========================================================================
    // 4. FILTER KHUSUS ASSESSOR
    // =========================================================================
    if (role === 'assessor') {
      const filtered = safeList.filter(item => {
        if (!item) return false;
        if (item.category === 'pengumuman' || item.isAnnouncement) return true;
        if (['assessment', 'program', 'registrasi', 'terapi'].includes(item.category)) {
          return true;
        }
        if (item.allowedRoles && item.allowedRoles.includes('assessor')) {
          return true;
        }
        return false;
      });

      return filtered.sort((a, b) => {
        if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
        return (b.timestamp || 0) - (a.timestamp || 0);
      });
    }

    // =========================================================================
    // 5. MANAGER, ADMIN, SUPER ADMIN (Full Akses Operasional & Pembuat Pengumuman)
    // =========================================================================
    return safeList.slice().sort((a, b) => {
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
      return (b.timestamp || 0) - (a.timestamp || 0);
    });
  } catch (err) {
    console.error('Error filtering notifications:', err);
    return [];
  }
};
