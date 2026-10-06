import { UserRole } from '../types';

export type DocumentCategory = 
  | 'assessment'
  | 'laporan_terapi'
  | 'program_terapi'
  | 'progress_report'
  | 'foto_terapi'
  | 'video_terapi'
  | 'surat_rujukan'
  | 'surat_keterangan'
  | 'psikologi'
  | 'medis_pendukung'
  | 'sertifikat'
  | 'dokumen_orang_tua'
  | 'dokumen_lainnya';

export type FileType = 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'ppt' | 'pptx' | 'image' | 'video' | 'other';

export interface StudentFolder {
  id: string; // e.g. 'fld-C-ADRIEL-assessment'
  studentId: string; // Student ID (e.g. 'C-ADRIEL', 'C102')
  name: string; // e.g. 'Assessment', 'Program Terapi', 'Progress Report'
  parentId?: string | null;
  createdAt: string;
  createdBy: string;
  isSystem?: boolean; // Default standard subfolders
}

export interface DocumentHistoryEntry {
  id: string;
  timestamp: string;
  action: 'UPLOAD' | 'EDIT' | 'MOVE' | 'ACCESS' | 'DOWNLOAD' | 'DELETE_REQUESTED' | 'DELETE_APPROVED';
  performedBy: string;
  performedByRole: string;
  notes: string;
}

export interface StudentDocument {
  id: string;
  studentId: string; // Primary anchor
  studentName: string;
  folderId: string; // Folder ID
  title: string; // Nama Dokumen
  category: DocumentCategory;
  description: string;
  documentDate: string; // YYYY-MM-DD
  fileType: FileType;
  fileName: string;
  fileSize: number; // in bytes
  fileSizeFormatted: string; // e.g. '2.4 MB'
  fileUrl?: string; // Preview URL or data URI
  thumbnailUrl?: string;
  tags: string[]; // Tag / Kata Kunci
  uploadedAt: string; // ISO date-time
  uploadedBy: string; // Nama Pengunggah
  uploadedByRole: string; // Role Pengunggah
  history: DocumentHistoryEntry[];
  isPendingDeleteApproval?: boolean; // For Admin deletion needing Manager approval
  deleteRequestedBy?: string;
}

export interface DocumentActivityLog {
  id: string;
  timestamp: string;
  studentId: string;
  studentName: string;
  documentId?: string;
  documentTitle?: string;
  action: string;
  userName: string;
  userRole: string;
  details: string;
}

export interface DocumentStats {
  totalDocuments: number;
  totalPdf: number;
  totalImage: number;
  totalVideo: number;
  totalOffice: number;
  totalSizeFormatted: string;
  recentDocumentsCount: number;
}

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  assessment: 'Hasil Assessment',
  laporan_terapi: 'Laporan Terapi',
  program_terapi: 'Program Terapi (IEP)',
  progress_report: 'Progress Report',
  foto_terapi: 'Foto Terapi',
  video_terapi: 'Video Terapi',
  surat_rujukan: 'Surat Rujukan',
  surat_keterangan: 'Surat Keterangan',
  psikologi: 'Hasil Psikologi',
  medis_pendukung: 'Hasil Medis Pendukung',
  sertifikat: 'Sertifikat',
  dokumen_orang_tua: 'Dokumen Orang Tua',
  dokumen_lainnya: 'Dokumen Lainnya'
};

export const DEFAULT_SUBFOLDER_NAMES = [
  'Assessment',
  'Program Terapi',
  'Progress Report',
  'Foto Terapi',
  'Video Terapi',
  'Dokumen Lainnya'
];

const FOLDERS_STORAGE_KEY = 'pelangi360_student_folders_v1';
const DOCUMENTS_STORAGE_KEY = 'pelangi360_student_documents_v1';
const LOGS_STORAGE_KEY = 'pelangi360_student_doc_logs_v1';

// Seed Initial Folders
const INITIAL_FOLDERS: StudentFolder[] = [
  // C-ADRIEL
  { id: 'fld-C-ADRIEL-assessment', studentId: 'C-ADRIEL', name: 'Assessment', createdAt: '2026-01-10T08:00:00Z', createdBy: 'Sistem', isSystem: true },
  { id: 'fld-C-ADRIEL-program', studentId: 'C-ADRIEL', name: 'Program Terapi', createdAt: '2026-01-10T08:00:00Z', createdBy: 'Sistem', isSystem: true },
  { id: 'fld-C-ADRIEL-progress', studentId: 'C-ADRIEL', name: 'Progress Report', createdAt: '2026-01-10T08:00:00Z', createdBy: 'Sistem', isSystem: true },
  { id: 'fld-C-ADRIEL-foto', studentId: 'C-ADRIEL', name: 'Foto Terapi', createdAt: '2026-01-10T08:00:00Z', createdBy: 'Sistem', isSystem: true },
  { id: 'fld-C-ADRIEL-video', studentId: 'C-ADRIEL', name: 'Video Terapi', createdAt: '2026-01-10T08:00:00Z', createdBy: 'Sistem', isSystem: true },
  { id: 'fld-C-ADRIEL-lainnya', studentId: 'C-ADRIEL', name: 'Dokumen Lainnya', createdAt: '2026-01-10T08:00:00Z', createdBy: 'Sistem', isSystem: true },
  { id: 'fld-C-ADRIEL-medis', studentId: 'C-ADRIEL', name: 'Hasil Medis & Rujukan', createdAt: '2026-02-15T09:30:00Z', createdBy: 'Admin Pelangi', isSystem: false },

  // C102 (Bagas Pratama)
  { id: 'fld-C102-assessment', studentId: 'C102', name: 'Assessment', createdAt: '2026-01-12T08:00:00Z', createdBy: 'Sistem', isSystem: true },
  { id: 'fld-C102-program', studentId: 'C102', name: 'Program Terapi', createdAt: '2026-01-12T08:00:00Z', createdBy: 'Sistem', isSystem: true },
  { id: 'fld-C102-progress', studentId: 'C102', name: 'Progress Report', createdAt: '2026-01-12T08:00:00Z', createdBy: 'Sistem', isSystem: true },
  { id: 'fld-C102-foto', studentId: 'C102', name: 'Foto Terapi', createdAt: '2026-01-12T08:00:00Z', createdBy: 'Sistem', isSystem: true },
  { id: 'fld-C102-video', studentId: 'C102', name: 'Video Terapi', createdAt: '2026-01-12T08:00:00Z', createdBy: 'Sistem', isSystem: true },
  { id: 'fld-C102-lainnya', studentId: 'C102', name: 'Dokumen Lainnya', createdAt: '2026-01-12T08:00:00Z', createdBy: 'Sistem', isSystem: true },

  // C103 (Cantika Dewi)
  { id: 'fld-C103-assessment', studentId: 'C103', name: 'Assessment', createdAt: '2026-01-14T08:00:00Z', createdBy: 'Sistem', isSystem: true },
  { id: 'fld-C103-program', studentId: 'C103', name: 'Program Terapi', createdAt: '2026-01-14T08:00:00Z', createdBy: 'Sistem', isSystem: true },
  { id: 'fld-C103-progress', studentId: 'C103', name: 'Progress Report', createdAt: '2026-01-14T08:00:00Z', createdBy: 'Sistem', isSystem: true },
  { id: 'fld-C103-foto', studentId: 'C103', name: 'Foto Terapi', createdAt: '2026-01-14T08:00:00Z', createdBy: 'Sistem', isSystem: true },
  { id: 'fld-C103-video', studentId: 'C103', name: 'Video Terapi', createdAt: '2026-01-14T08:00:00Z', createdBy: 'Sistem', isSystem: true },
  { id: 'fld-C103-lainnya', studentId: 'C103', name: 'Dokumen Lainnya', createdAt: '2026-01-14T08:00:00Z', createdBy: 'Sistem', isSystem: true }
];

// Seed Initial Documents with realistic data
const INITIAL_DOCUMENTS: StudentDocument[] = [
  // --- ADRIEL DJULIAN PUTRA ADITYA ---
  {
    id: 'doc-adriel-01',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya',
    folderId: 'fld-C-ADRIEL-assessment',
    title: 'Laporan Assessment Okupasi Terapi Komprehensif 2026',
    category: 'assessment',
    description: 'Evaluasi komprehensif profil sensori integrasi, regulasi diri, dan kekuatan motorik halus ananda Adriel oleh Terapis Rilla Serando.',
    documentDate: '2026-02-10',
    fileType: 'pdf',
    fileName: 'Laporan_Assessment_OT_Adriel_2026.pdf',
    fileSize: 2450000,
    fileSizeFormatted: '2.4 MB',
    tags: ['assessment', 'okupasi', 'sensori', 'evaluasi awal'],
    uploadedAt: '2026-02-12T10:15:00Z',
    uploadedBy: 'Rilla Serando, S.Tr.Kes',
    uploadedByRole: 'terapis',
    history: [
      { id: 'h-1', timestamp: '2026-02-12T10:15:00Z', action: 'UPLOAD', performedBy: 'Rilla Serando', performedByRole: 'terapis', notes: 'Dokumen pertama diunggah' }
    ]
  },
  {
    id: 'doc-adriel-02',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya',
    folderId: 'fld-C-ADRIEL-program',
    title: 'Program Terapi Individual (IEP) Semester Genap 2026',
    category: 'program_terapi',
    description: 'Rencana kurikulum intervensi terapi individual memuat 12 target sasaran motorik halus, fokus atensi, dan koordinasi bilateral.',
    documentDate: '2026-02-15',
    fileType: 'pdf',
    fileName: 'IEP_Okupasi_Adriel_Semester_Genap.pdf',
    fileSize: 1820000,
    fileSizeFormatted: '1.8 MB',
    tags: ['iep', 'program terapi', 'okupasi', 'target'],
    uploadedAt: '2026-02-15T14:30:00Z',
    uploadedBy: 'Manager Pelangi',
    uploadedByRole: 'manager',
    history: [
      { id: 'h-2', timestamp: '2026-02-15T14:30:00Z', action: 'UPLOAD', performedBy: 'Manager Pelangi', performedByRole: 'manager', notes: 'Penyusunan kurikulum disetujui' }
    ]
  },
  {
    id: 'doc-adriel-03',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya',
    folderId: 'fld-C-ADRIEL-progress',
    title: 'Progress Report Evaluasi Triwulan I',
    category: 'progress_report',
    description: 'Catatan kemajuan rentang fokus saat menulis dari 5 menit meningkat menjadi 18 menit, stabilitas postur tubuh tercapai 85%.',
    documentDate: '2026-03-25',
    fileType: 'pdf',
    fileName: 'Progress_Report_Triwulan_1_Adriel.pdf',
    fileSize: 3100000,
    fileSizeFormatted: '3.1 MB',
    tags: ['progress report', 'evaluasi', 'triwulan'],
    uploadedAt: '2026-03-25T16:00:00Z',
    uploadedBy: 'Admin Pelangi',
    uploadedByRole: 'admin',
    history: [
      { id: 'h-3', timestamp: '2026-03-25T16:00:00Z', action: 'UPLOAD', performedBy: 'Admin Pelangi', performedByRole: 'admin', notes: 'Diunggah setelah rapat klinis' }
    ]
  },
  {
    id: 'doc-adriel-04',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya',
    folderId: 'fld-C-ADRIEL-foto',
    title: 'Dokumentasi Terapi Sensori - Papan Keseimbangan & Ayunan Vestibular',
    category: 'foto_terapi',
    description: 'Foto ananda saat melakukan latihan proprioseptif dan vestibular di ruang sensori integrasi 1 bersama terapis pendamping.',
    documentDate: '2026-03-28',
    fileType: 'image',
    fileName: 'Sesi_Sensori_Keseimbangan_Adriel.jpg',
    fileSize: 4200000,
    fileSizeFormatted: '4.2 MB',
    fileUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=400&q=80',
    tags: ['foto', 'sensori', 'vestibular', 'aktivitas'],
    uploadedAt: '2026-03-28T11:20:00Z',
    uploadedBy: 'Rilla Serando, S.Tr.Kes',
    uploadedByRole: 'terapis',
    history: [
      { id: 'h-4', timestamp: '2026-03-28T11:20:00Z', action: 'UPLOAD', performedBy: 'Rilla Serando', performedByRole: 'terapis', notes: 'Dokumentasi sesi indoor' }
    ]
  },
  {
    id: 'doc-adriel-05',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya',
    folderId: 'fld-C-ADRIEL-video',
    title: 'Video Latihan Koordinasi Bilateral & Menjepit Benda Kecil',
    category: 'video_terapi',
    description: 'Video rekaman gerakan ananda saat memindahkan pinset manik-manik. Menunjukkan kemandirian genggaman tripod dinamis.',
    documentDate: '2026-04-02',
    fileType: 'video',
    fileName: 'Latihan_Bilateral_Pinset_Adriel.mp4',
    fileSize: 28500000,
    fileSizeFormatted: '28.5 MB',
    fileUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=400&q=80',
    tags: ['video', 'motorik halus', 'tripod grasp'],
    uploadedAt: '2026-04-02T15:45:00Z',
    uploadedBy: 'Rilla Serando, S.Tr.Kes',
    uploadedByRole: 'terapis',
    history: [
      { id: 'h-5', timestamp: '2026-04-02T15:45:00Z', action: 'UPLOAD', performedBy: 'Rilla Serando', performedByRole: 'terapis', notes: 'Video rekaman evaluasi' }
    ]
  },
  {
    id: 'doc-adriel-06',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya',
    folderId: 'fld-C-ADRIEL-medis',
    title: 'Surat Rekomendasi Dokter Spesialis Anak (Sp.A) Tumbuh Kembang',
    category: 'medis_pendukung',
    description: 'Surat rujukan klinis dari RS Hermina perihal anjuran intervensi terapi okupasi dan sensori integrasi 2 kali seminggu.',
    documentDate: '2026-01-05',
    fileType: 'pdf',
    fileName: 'Rujukan_SpA_Adriel_RS_Hermina.pdf',
    fileSize: 1200000,
    fileSizeFormatted: '1.2 MB',
    tags: ['medis', 'dokter', 'rujukan', 'pediatri'],
    uploadedAt: '2026-01-08T09:00:00Z',
    uploadedBy: 'Admin Pelangi',
    uploadedByRole: 'admin',
    history: [
      { id: 'h-6', timestamp: '2026-01-08T09:00:00Z', action: 'UPLOAD', performedBy: 'Admin Pelangi', performedByRole: 'admin', notes: 'Berkas masuk registrasi awal' }
    ]
  },
  {
    id: 'doc-adriel-07',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya',
    folderId: 'fld-C-ADRIEL-lainnya',
    title: 'Kuisioner Observasi & Harapan Orang Tua',
    category: 'dokumen_orang_tua',
    description: 'Formulir harapan orang tua dan catatan rutinitas harian ananda di rumah sebelum memulai siklus terapi reguler.',
    documentDate: '2026-01-10',
    fileType: 'docx',
    fileName: 'Kuisioner_Orang_Tua_Adriel.docx',
    fileSize: 850000,
    fileSizeFormatted: '850 KB',
    tags: ['kuisioner', 'orang tua', 'observasi rumah'],
    uploadedAt: '2026-01-10T11:00:00Z',
    uploadedBy: 'Admin Pelangi',
    uploadedByRole: 'admin',
    history: [
      { id: 'h-7', timestamp: '2026-01-10T11:00:00Z', action: 'UPLOAD', performedBy: 'Admin Pelangi', performedByRole: 'admin', notes: 'Diunggah saat sesi wawancara' }
    ]
  },

  // --- BAGAS PRATAMA (C102) ---
  {
    id: 'doc-bagas-01',
    studentId: 'C102',
    studentName: 'Bagas Pratama',
    folderId: 'fld-C102-assessment',
    title: 'Hasil Assessment Terapi Wicara & Artikulasi Oral Motor',
    category: 'assessment',
    description: 'Diagnostik artikulasi fonem vokal dan konsonan bilabial ananda Bagas oleh Terapis Adisty Ayuningtyas.',
    documentDate: '2026-02-18',
    fileType: 'pdf',
    fileName: 'Assessment_Wicara_Bagas_2026.pdf',
    fileSize: 2100000,
    fileSizeFormatted: '2.1 MB',
    tags: ['assessment', 'wicara', 'artikulasi'],
    uploadedAt: '2026-02-20T10:00:00Z',
    uploadedBy: 'Adisty Ayuningtyas, A.Md.TW',
    uploadedByRole: 'terapis',
    history: [
      { id: 'h-b1', timestamp: '2026-02-20T10:00:00Z', action: 'UPLOAD', performedBy: 'Adisty Ayuningtyas', performedByRole: 'terapis', notes: 'Laporan asesmen wicara' }
    ]
  },
  {
    id: 'doc-bagas-02',
    studentId: 'C102',
    studentName: 'Bagas Pratama',
    folderId: 'fld-C102-program',
    title: 'Program Terapi Wicara Individual (IEP) 2026',
    category: 'program_terapi',
    description: 'Rencana stimulasi perbendaharaan kosakata aktif 50 kata dasar dan fonasi suara.',
    documentDate: '2026-02-22',
    fileType: 'docx',
    fileName: 'IEP_Wicara_Bagas_2026.docx',
    fileSize: 1100000,
    fileSizeFormatted: '1.1 MB',
    tags: ['program', 'iep', 'wicara'],
    uploadedAt: '2026-02-22T14:10:00Z',
    uploadedBy: 'Adisty Ayuningtyas, A.Md.TW',
    uploadedByRole: 'terapis',
    history: [
      { id: 'h-b2', timestamp: '2026-02-22T14:10:00Z', action: 'UPLOAD', performedBy: 'Adisty Ayuningtyas', performedByRole: 'terapis', notes: 'Program disetujui terapis' }
    ]
  },
  {
    id: 'doc-bagas-03',
    studentId: 'C102',
    studentName: 'Bagas Pratama',
    folderId: 'fld-C102-foto',
    title: 'Foto Sesi Terapi Wicara Menggunakan Flashcard Emosi',
    category: 'foto_terapi',
    description: 'Foto aktivitas penyebutan kosa kata dengan alat peraga kartu gambar.',
    documentDate: '2026-03-15',
    fileType: 'image',
    fileName: 'Sesi_Flashcard_Bagas.png',
    fileSize: 3400000,
    fileSizeFormatted: '3.4 MB',
    fileUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=400&q=80',
    tags: ['foto', 'wicara', 'flashcard'],
    uploadedAt: '2026-03-15T15:30:00Z',
    uploadedBy: 'Adisty Ayuningtyas, A.Md.TW',
    uploadedByRole: 'terapis',
    history: [
      { id: 'h-b3', timestamp: '2026-03-15T15:30:00Z', action: 'UPLOAD', performedBy: 'Adisty Ayuningtyas', performedByRole: 'terapis', notes: 'Foto dokumentasi' }
    ]
  },

  // --- CANTIKA DEWI (C103) ---
  {
    id: 'doc-cantika-01',
    studentId: 'C103',
    studentName: 'Cantika Dewi',
    folderId: 'fld-C103-assessment',
    title: 'Hasil Evaluasi Psikologi & Profil Perkembangan Anak',
    category: 'psikologi',
    description: 'Laporan psikotes perkembangan kognitif, adaptif, dan sosial ananda Cantika oleh Tim Psikolog.',
    documentDate: '2026-01-20',
    fileType: 'pdf',
    fileName: 'Hasil_Psikologi_Cantika_2026.pdf',
    fileSize: 2800000,
    fileSizeFormatted: '2.8 MB',
    tags: ['psikologi', 'kognitif', 'evaluasi'],
    uploadedAt: '2026-01-22T09:15:00Z',
    uploadedBy: 'Manager Pelangi',
    uploadedByRole: 'manager',
    history: [
      { id: 'h-c1', timestamp: '2026-01-22T09:15:00Z', action: 'UPLOAD', performedBy: 'Manager Pelangi', performedByRole: 'manager', notes: 'Berkas evaluasi psikologi' }
    ]
  },
  {
    id: 'doc-cantika-02',
    studentId: 'C103',
    studentName: 'Cantika Dewi',
    folderId: 'fld-C103-progress',
    title: 'Progress Report Sensori & Perilaku Adaptif Q1',
    category: 'progress_report',
    description: 'Laporan penurunan tantrum saat transisi aktivitas dari 4 kali per hari menjadi 0-1 kali.',
    documentDate: '2026-03-30',
    fileType: 'pdf',
    fileName: 'Progress_Report_Cantika_Q1.pdf',
    fileSize: 1950000,
    fileSizeFormatted: '1.9 MB',
    tags: ['progress', 'sensori', 'adaptif'],
    uploadedAt: '2026-03-30T17:00:00Z',
    uploadedBy: 'Admin Pelangi',
    uploadedByRole: 'admin',
    history: [
      { id: 'h-c2', timestamp: '2026-03-30T17:00:00Z', action: 'UPLOAD', performedBy: 'Admin Pelangi', performedByRole: 'admin', notes: 'Laporan Q1' }
    ]
  }
];

// Seed Initial Activity Logs
const INITIAL_LOGS: DocumentActivityLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-04-02T15:45:00Z',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya',
    documentId: 'doc-adriel-05',
    documentTitle: 'Video Latihan Koordinasi Bilateral & Menjepit Benda Kecil',
    action: 'UPLOAD_DOKUMEN',
    userName: 'Rilla Serando, S.Tr.Kes',
    userRole: 'terapis',
    details: 'Mengunggah video rekaman evaluasi bilateral (28.5 MB)'
  },
  {
    id: 'log-2',
    timestamp: '2026-03-28T11:20:00Z',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya',
    documentId: 'doc-adriel-04',
    documentTitle: 'Dokumentasi Terapi Sensori - Papan Keseimbangan',
    action: 'UPLOAD_FOTO',
    userName: 'Rilla Serando, S.Tr.Kes',
    userRole: 'terapis',
    details: 'Mengunggah foto sesi sensori integrasi di ruang 1'
  },
  {
    id: 'log-3',
    timestamp: '2026-03-25T16:00:00Z',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya',
    documentId: 'doc-adriel-03',
    documentTitle: 'Progress Report Evaluasi Triwulan I',
    action: 'UPLOAD_DOKUMEN',
    userName: 'Admin Pelangi',
    userRole: 'admin',
    details: 'Mengunggah file PDF Progress Report Triwulan I (3.1 MB)'
  },
  {
    id: 'log-4',
    timestamp: '2026-02-15T14:30:00Z',
    studentId: 'C-ADRIEL',
    studentName: 'Adriel Djulian Putra Aditya',
    documentId: 'doc-adriel-02',
    documentTitle: 'Program Terapi Individual (IEP) Semester Genap 2026',
    action: 'APPROVAL_IEP',
    userName: 'Manager Pelangi',
    userRole: 'manager',
    details: 'Menyetujui dan mengarsipkan kurikulum IEP semester genap'
  }
];

// ---------------------------------------------------------------------------
// STORAGE READ & WRITE HELPERS
// ---------------------------------------------------------------------------

export const getStoredFolders = (): StudentFolder[] => {
  try {
    const raw = localStorage.getItem(FOLDERS_STORAGE_KEY);
    if (!raw) {
      saveStoredFolders(INITIAL_FOLDERS);
      return INITIAL_FOLDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_FOLDERS;
  } catch (e) {
    console.error('Error reading folders from storage:', e);
    return INITIAL_FOLDERS;
  }
};

export const saveStoredFolders = (folders: StudentFolder[]): void => {
  try {
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
  } catch (e) {
    console.error('Error saving folders to storage:', e);
  }
};

export const getStoredDocuments = (): StudentDocument[] => {
  try {
    const raw = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
    if (!raw) {
      saveStoredDocuments(INITIAL_DOCUMENTS);
      return INITIAL_DOCUMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DOCUMENTS;
  } catch (e) {
    console.error('Error reading documents from storage:', e);
    return INITIAL_DOCUMENTS;
  }
};

export const saveStoredDocuments = (docs: StudentDocument[]): void => {
  try {
    localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(docs));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pelangi360_documents_updated'));
    }
  } catch (e) {
    console.error('Error saving documents to storage:', e);
  }
};

export const getStoredDocumentLogs = (): DocumentActivityLog[] => {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (!raw) {
      saveStoredDocumentLogs(INITIAL_LOGS);
      return INITIAL_LOGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_LOGS;
  } catch (e) {
    console.error('Error reading document logs:', e);
    return INITIAL_LOGS;
  }
};

export const saveStoredDocumentLogs = (logs: DocumentActivityLog[]): void => {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving document logs:', e);
  }
};

export const logDocumentActivity = (
  entry: Omit<DocumentActivityLog, 'id' | 'timestamp'>
): void => {
  try {
    const current = getStoredDocumentLogs();
    const newLog: DocumentActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    const updated = [newLog, ...current].slice(0, 200); // keep last 200 logs
    saveStoredDocumentLogs(updated);
  } catch (e) {
    console.error('Failed to log document activity', e);
  }
};

// ---------------------------------------------------------------------------
// AUTOMATIC STUDENT FOLDER PROVISIONING
// ---------------------------------------------------------------------------

/**
 * Ensures a student has standard root folder and standard subfolders:
 * - Assessment
 * - Program Terapi
 * - Progress Report
 * - Foto Terapi
 * - Video Terapi
 * - Dokumen Lainnya
 */
export const ensureStudentFoldersExist = (
  studentId: string, 
  studentName: string, 
  creator: string = 'Sistem'
): StudentFolder[] => {
  if (!studentId) return [];
  const currentFolders = getStoredFolders();
  const existingForStudent = currentFolders.filter(f => f.studentId === studentId);

  const missingNames = DEFAULT_SUBFOLDER_NAMES.filter(
    name => !existingForStudent.some(f => f.name.toLowerCase() === name.toLowerCase())
  );

  if (missingNames.length === 0) {
    return existingForStudent;
  }

  const newFolders: StudentFolder[] = missingNames.map(name => {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    return {
      id: `fld-${studentId}-${slug}-${Math.random().toString(36).substring(2, 5)}`,
      studentId,
      name,
      createdAt: new Date().toISOString(),
      createdBy: creator,
      isSystem: true
    };
  });

  const updatedFolders = [...currentFolders, ...newFolders];
  saveStoredFolders(updatedFolders);

  logDocumentActivity({
    studentId,
    studentName,
    action: 'AUTO_CREATE_FOLDERS',
    userName: creator,
    userRole: 'system',
    details: `Sistem membuat struktur folder otomatis untuk siswa: ${studentName} (${newFolders.length} folder)`
  });

  return updatedFolders.filter(f => f.studentId === studentId);
};

// ---------------------------------------------------------------------------
// FOLDER MANAGEMENT (ADMIN & MANAGER)
// ---------------------------------------------------------------------------

export const createCustomStudentFolder = (
  studentId: string,
  studentName: string,
  folderName: string,
  createdBy: string,
  creatorRole: string
): StudentFolder => {
  const currentFolders = getStoredFolders();
  const cleanName = folderName.trim();
  const newFolder: StudentFolder = {
    id: `fld-${studentId}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    studentId,
    name: cleanName,
    createdAt: new Date().toISOString(),
    createdBy,
    isSystem: false
  };

  const updated = [...currentFolders, newFolder];
  saveStoredFolders(updated);

  logDocumentActivity({
    studentId,
    studentName,
    action: 'CREATE_FOLDER',
    userName: createdBy,
    userRole: creatorRole,
    details: `Membuat folder baru: "${cleanName}" untuk ananda ${studentName}`
  });

  return newFolder;
};

export const renameStudentFolder = (
  folderId: string,
  newName: string,
  updatedBy: string,
  updaterRole: string
): boolean => {
  const currentFolders = getStoredFolders();
  const folderIndex = currentFolders.findIndex(f => f.id === folderId);
  if (folderIndex === -1) return false;

  const oldName = currentFolders[folderIndex].name;
  currentFolders[folderIndex].name = newName.trim();
  saveStoredFolders(currentFolders);

  logDocumentActivity({
    studentId: currentFolders[folderIndex].studentId,
    studentName: 'Siswa',
    action: 'RENAME_FOLDER',
    userName: updatedBy,
    userRole: updaterRole,
    details: `Mengubah nama folder dari "${oldName}" menjadi "${newName.trim()}"`
  });

  return true;
};

export const deleteStudentFolder = (
  folderId: string,
  deletedBy: string,
  deleterRole: string
): { success: boolean; message: string } => {
  const currentFolders = getStoredFolders();
  const targetFolder = currentFolders.find(f => f.id === folderId);
  if (!targetFolder) {
    return { success: false, message: 'Folder tidak ditemukan.' };
  }

  if (targetFolder.isSystem) {
    return { success: false, message: 'Folder bawaan sistem standar tidak dapat dihapus.' };
  }

  // Move or delete associated documents
  const allDocs = getStoredDocuments();
  const docsInFolder = allDocs.filter(d => d.folderId === folderId);
  
  // Find a fallback "Dokumen Lainnya" folder for the student
  const fallbackFolder = currentFolders.find(
    f => f.studentId === targetFolder.studentId && f.name.toLowerCase().includes('lainnya')
  );

  if (fallbackFolder) {
    // Relocate docs to Dokumen Lainnya
    const updatedDocs = allDocs.map(d => d.folderId === folderId ? { ...d, folderId: fallbackFolder.id } : d);
    saveStoredDocuments(updatedDocs);
  }

  const updatedFolders = currentFolders.filter(f => f.id !== folderId);
  saveStoredFolders(updatedFolders);

  logDocumentActivity({
    studentId: targetFolder.studentId,
    studentName: 'Siswa',
    action: 'DELETE_FOLDER',
    userName: deletedBy,
    userRole: deleterRole,
    details: `Menghapus folder "${targetFolder.name}" (${docsInFolder.length} berkas dipindahkan)`
  });

  return { success: true, message: `Folder "${targetFolder.name}" berhasil dihapus.` };
};

// ---------------------------------------------------------------------------
// DOCUMENT OPERATIONS
// ---------------------------------------------------------------------------

export interface CreateDocumentInput {
  studentId: string;
  studentName: string;
  folderId: string;
  title: string;
  category: DocumentCategory;
  description: string;
  documentDate: string;
  fileType: FileType;
  fileName: string;
  fileSize: number;
  fileUrl?: string;
  thumbnailUrl?: string;
  tags: string[];
  uploadedBy: string;
  uploadedByRole: string;
}

export const formatFileSize = (bytes: number): string => {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const uploadStudentDocument = (input: CreateDocumentInput): StudentDocument => {
  const currentDocs = getStoredDocuments();
  const now = new Date().toISOString();

  const newDoc: StudentDocument = {
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    studentId: input.studentId,
    studentName: input.studentName,
    folderId: input.folderId,
    title: input.title.trim(),
    category: input.category,
    description: input.description.trim(),
    documentDate: input.documentDate || now.split('T')[0],
    fileType: input.fileType,
    fileName: input.fileName.trim(),
    fileSize: input.fileSize,
    fileSizeFormatted: formatFileSize(input.fileSize),
    fileUrl: input.fileUrl,
    thumbnailUrl: input.thumbnailUrl,
    tags: input.tags || [],
    uploadedAt: now,
    uploadedBy: input.uploadedBy,
    uploadedByRole: input.uploadedByRole,
    history: [
      {
        id: `h-${Date.now()}`,
        timestamp: now,
        action: 'UPLOAD',
        performedBy: input.uploadedBy,
        performedByRole: input.uploadedByRole,
        notes: `Dokumen pertama kali diunggah (${formatFileSize(input.fileSize)})`
      }
    ]
  };

  const updatedDocs = [newDoc, ...currentDocs];
  saveStoredDocuments(updatedDocs);

  logDocumentActivity({
    studentId: input.studentId,
    studentName: input.studentName,
    documentId: newDoc.id,
    documentTitle: newDoc.title,
    action: 'UPLOAD_DOKUMEN',
    userName: input.uploadedBy,
    userRole: input.uploadedByRole,
    details: `Mengunggah dokumen "${newDoc.title}" (${newDoc.fileName}) ke folder`
  });

  return newDoc;
};

export const updateStudentDocument = (
  docId: string,
  updates: Partial<Pick<StudentDocument, 'title' | 'category' | 'description' | 'documentDate' | 'tags' | 'folderId'>>,
  updatedBy: string,
  updaterRole: string
): StudentDocument | null => {
  const currentDocs = getStoredDocuments();
  const index = currentDocs.findIndex(d => d.id === docId);
  if (index === -1) return null;

  const target = currentDocs[index];
  const now = new Date().toISOString();

  const historyEntry: DocumentHistoryEntry = {
    id: `h-${Date.now()}`,
    timestamp: now,
    action: 'EDIT',
    performedBy: updatedBy,
    performedByRole: updaterRole,
    notes: `Metadata dokumen diperbarui oleh ${updatedBy}`
  };

  const updatedDoc: StudentDocument = {
    ...target,
    ...updates,
    history: [historyEntry, ...(target.history || [])]
  };

  currentDocs[index] = updatedDoc;
  saveStoredDocuments(currentDocs);

  logDocumentActivity({
    studentId: updatedDoc.studentId,
    studentName: updatedDoc.studentName,
    documentId: updatedDoc.id,
    documentTitle: updatedDoc.title,
    action: 'EDIT_DOKUMEN',
    userName: updatedBy,
    userRole: updaterRole,
    details: `Memperbarui metadata dokumen "${updatedDoc.title}"`
  });

  return updatedDoc;
};

export const moveStudentDocument = (
  docId: string,
  targetFolderId: string,
  targetFolderName: string,
  movedBy: string,
  moverRole: string
): boolean => {
  const currentDocs = getStoredDocuments();
  const index = currentDocs.findIndex(d => d.id === docId);
  if (index === -1) return false;

  const target = currentDocs[index];
  const now = new Date().toISOString();

  const historyEntry: DocumentHistoryEntry = {
    id: `h-${Date.now()}`,
    timestamp: now,
    action: 'MOVE',
    performedBy: movedBy,
    performedByRole: moverRole,
    notes: `Dokumen dipindahkan ke folder: "${targetFolderName}"`
  };

  currentDocs[index] = {
    ...target,
    folderId: targetFolderId,
    history: [historyEntry, ...(target.history || [])]
  };

  saveStoredDocuments(currentDocs);

  logDocumentActivity({
    studentId: target.studentId,
    studentName: target.studentName,
    documentId: target.id,
    documentTitle: target.title,
    action: 'MOVE_DOKUMEN',
    userName: movedBy,
    userRole: moverRole,
    details: `Memindahkan dokumen "${target.title}" ke folder "${targetFolderName}"`
  });

  return true;
};

// Admin requires Manager approval to delete permanently
export const requestDeleteDocument = (
  docId: string,
  requestedBy: string,
  requesterRole: string
): boolean => {
  const currentDocs = getStoredDocuments();
  const index = currentDocs.findIndex(d => d.id === docId);
  if (index === -1) return false;

  const target = currentDocs[index];
  const now = new Date().toISOString();

  const historyEntry: DocumentHistoryEntry = {
    id: `h-${Date.now()}`,
    timestamp: now,
    action: 'DELETE_REQUESTED',
    performedBy: requestedBy,
    performedByRole: requesterRole,
    notes: 'Pengajuan penghapusan diajukan, menunggu persetujuan Manager'
  };

  currentDocs[index] = {
    ...target,
    isPendingDeleteApproval: true,
    deleteRequestedBy: requestedBy,
    history: [historyEntry, ...(target.history || [])]
  };

  saveStoredDocuments(currentDocs);

  logDocumentActivity({
    studentId: target.studentId,
    studentName: target.studentName,
    documentId: target.id,
    documentTitle: target.title,
    action: 'REQUEST_DELETE',
    userName: requestedBy,
    userRole: requesterRole,
    details: `Admin mengajukan permohonan hapus untuk dokumen "${target.title}"`
  });

  return true;
};

// Manager or Super Admin permanently deletes
export const deleteStudentDocumentPermanently = (
  docId: string,
  deletedBy: string,
  deleterRole: string
): boolean => {
  const currentDocs = getStoredDocuments();
  const target = currentDocs.find(d => d.id === docId);
  if (!target) return false;

  const updatedDocs = currentDocs.filter(d => d.id !== docId);
  saveStoredDocuments(updatedDocs);

  logDocumentActivity({
    studentId: target.studentId,
    studentName: target.studentName,
    documentId: target.id,
    documentTitle: target.title,
    action: 'PERMANENT_DELETE',
    userName: deletedBy,
    userRole: deleterRole,
    details: `Menghapus dokumen "${target.title}" secara permanen`
  });

  return true;
};

// ---------------------------------------------------------------------------
// SECURITY & DATA ISOLATION (STUDENT ID STRICT CHECK)
// ---------------------------------------------------------------------------

/**
 * Filter documents strictly for user role:
 * - Siswa & Orang Tua ONLY receive documents matching document.studentId === currentStudentId
 * - Other students' documents are STRICTLY EXCLUDED at the data layer
 */
export const getFilteredDocumentsForUser = (
  docs: StudentDocument[],
  userRole?: UserRole,
  currentStudentId?: string
): StudentDocument[] => {
  if (!Array.isArray(docs)) return [];

  const role = (userRole || 'admin').toLowerCase();

  if (role === 'siswa' || role === 'orang_tua') {
    const targetStudentId = String(currentStudentId || 'C-ADRIEL').trim().toLowerCase();
    return docs.filter(doc => {
      if (!doc || !doc.studentId) return false;
      return doc.studentId.trim().toLowerCase() === targetStudentId;
    });
  }

  // Terapis (unless granted)
  if (role === 'terapis') {
    return [];
  }

  // Super Admin, Manager, Admin have view access across all students
  return docs;
};

/**
 * Filter folders strictly for user role
 */
export const getFilteredFoldersForUser = (
  folders: StudentFolder[],
  userRole?: UserRole,
  currentStudentId?: string
): StudentFolder[] => {
  if (!Array.isArray(folders)) return [];

  const role = (userRole || 'admin').toLowerCase();

  if (role === 'siswa' || role === 'orang_tua') {
    const targetStudentId = String(currentStudentId || 'C-ADRIEL').trim().toLowerCase();
    return folders.filter(folder => {
      if (!folder || !folder.studentId) return false;
      return folder.studentId.trim().toLowerCase() === targetStudentId;
    });
  }

  if (role === 'terapis') {
    return [];
  }

  return folders;
};

// ---------------------------------------------------------------------------
// STATS CALCULATION
// ---------------------------------------------------------------------------

export const getDocumentStats = (docs: StudentDocument[]): DocumentStats => {
  const safeList = Array.isArray(docs) ? docs : [];
  let totalBytes = 0;
  let totalPdf = 0;
  let totalImage = 0;
  let totalVideo = 0;
  let totalOffice = 0;

  safeList.forEach(d => {
    totalBytes += d.fileSize || 0;
    if (d.fileType === 'pdf') totalPdf++;
    else if (d.fileType === 'image') totalImage++;
    else if (d.fileType === 'video') totalVideo++;
    else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(d.fileType)) totalOffice++;
  });

  return {
    totalDocuments: safeList.length,
    totalPdf,
    totalImage,
    totalVideo,
    totalOffice,
    totalSizeFormatted: formatFileSize(totalBytes),
    recentDocumentsCount: safeList.filter(d => {
      const diffDays = (Date.now() - new Date(d.uploadedAt).getTime()) / (1000 * 3600 * 24);
      return diffDays <= 14;
    }).length
  };
};
