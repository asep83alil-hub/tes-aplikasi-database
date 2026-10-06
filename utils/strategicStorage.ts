import { StrategicYearData, StrategicItem, StrategicArtifact, StrategicStatus } from '../types';

export const STORAGE_KEY_STRATEGIC_PLAN = 'pelangi360_strategic_plans_v2';

export const STRATEGIC_CATEGORIES = [
  { id: 'Layanan & Mutu Klinis', label: 'Layanan & Mutu Klinis Terapi', color: '#0d9488', bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20' },
  { id: 'SDM & Sertifikasi', label: 'SDM & Sertifikasi Praktisi', color: '#8b5cf6', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  { id: 'Sarana & Ruang Sensori', label: 'Sarana & Ruang Sensori Terpadu', color: '#3b82f6', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { id: 'Kurikulum & Home Program', label: 'Kurikulum & Home Program', color: '#f59e0b', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  { id: 'Kemitraan & Humas', label: 'Kemitraan Klien & Humas', color: '#ec4899', bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  { id: 'Finansial & Efisiensi', label: 'Finansial & Keberlanjutan Lembaga', color: '#10b981', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
];

export const INITIAL_STRATEGIC_PLANS: StrategicYearData[] = [
  {
    year: '2026/2027',
    items: [
      {
        id: 'sp-2026-01',
        category: 'Sarana & Ruang Sensori',
        program: 'Revitalisasi Ruang Sensori Integrasi & Pengadaan Dynamic Suspended Equipment',
        kpi: 'Tersedianya 3 set ayunan platform terapeutik, sensory wall baru, dan sertifikasi keamanan matras berstandar internasional',
        pic: 'Bagian Umum & Pengadaan Sarana',
        timeline: 'Q1 2026',
        progress: 100,
        status: 'Done',
        budget: 65000000,
        notes: 'Pekerjaan selesai 100% dan telah lolos uji beban aman terapis.',
        artifacts: [
          {
            id: 'art-01',
            name: 'Foto Hasil Revitalisasi Ruang SI Baru',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&auto=format&fit=crop&q=80',
            fileName: 'Ruang_Sensori_Integrasi_Lazuardi_2026.jpg',
            fileSize: '2.4 MB',
            uploadDate: '2026-02-15T10:30:00Z',
            notes: 'Dokumentasi area ayunan platform, sensory path, dan matras pengaman baru.',
            uploaderName: 'Tim Sarana & Prasarana'
          },
          {
            id: 'art-02',
            name: 'Berita Acara Serah Terima & Uji Kelayakan Alat',
            type: 'pdf',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            fileName: 'BAST_Alat_Terapi_Sensori_2026.pdf',
            fileSize: '1.1 MB',
            uploadDate: '2026-02-18T14:15:00Z',
            notes: 'Ditandatangani oleh Kepala Terapis Okupasi & Direktur Lembaga.',
            uploaderName: 'Koordinator Bagian Umum'
          }
        ]
      },
      {
        id: 'sp-2026-02',
        category: 'SDM & Sertifikasi',
        program: 'Sertifikasi Internasional Praktisi Sensory Integration (SI) & Oral Motor Therapy',
        kpi: 'Minimal 6 terapis aktif memperoleh sertifikasi kompetensi terakreditasi nasional/internasional',
        pic: 'Kepala SDM & Mutu Terapis',
        timeline: 'Q2 - Q3 2026',
        progress: 65,
        status: 'On Progress',
        budget: 45000000,
        notes: '4 terapis telah menyelesaikan Modul 1 & 2, persiapan ujian praktik klinis.',
        artifacts: [
          {
            id: 'art-03',
            name: 'Dokumentasi Pelatihan Workshop Klinis SI',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
            fileName: 'Workshop_Sensory_Integration_Practical.jpg',
            fileSize: '3.1 MB',
            uploadDate: '2026-04-10T09:00:00Z',
            notes: 'Sesi praktik penanganan stimulasi proprioseptif dan vestibular.',
            uploaderName: 'Kepala SDM'
          },
          {
            id: 'art-04',
            name: 'Sertifikat Kelulusan Modul 1 & 2 Terapis',
            type: 'pdf',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            fileName: 'Sertifikat_SI_Cohort_2026.pdf',
            fileSize: '850 KB',
            uploadDate: '2026-05-02T16:20:00Z',
            notes: 'Sertifikat resmi dari Asosiasi Terapis Tumbuh Kembang.',
            uploaderName: 'Admin HR'
          }
        ]
      },
      {
        id: 'sp-2026-03',
        category: 'Layanan & Mutu Klinis',
        program: 'Standarisasi IEP Holistik & Digitalisasi Re-evaluasi 6 Bulanan',
        kpi: '100% siswa memiliki dokumen IEP digital terukur dan re-evaluasi tuntas tepat waktu',
        pic: 'Koordinator Layanan Klinis & Asesor',
        timeline: 'Q1 - Q2 2026',
        progress: 90,
        status: 'On Progress',
        budget: 20000000,
        notes: 'Modul rapot dan program terapi telah aktif dipakai seluruh tim terapis.',
        artifacts: [
          {
            id: 'art-05',
            name: 'Pedoman Standar Operasional Prosedur (SOP) IEP',
            type: 'pdf',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            fileName: 'SOP_Penyusunan_IEP_Pelangi_Lazuardi.pdf',
            fileSize: '1.8 MB',
            uploadDate: '2026-03-01T11:00:00Z',
            notes: 'Pedoman standar klinis untuk evaluasi anak berkebutuhan khusus.',
            uploaderName: 'Tim Evaluator Klinis'
          }
        ]
      },
      {
        id: 'sp-2026-04',
        category: 'Kemitraan & Humas',
        program: 'Penyelenggaraan Forum Parenting Berkala & Konsultasi Tumbuh Kembang Terbuka',
        kpi: 'Terselenggara 4 kali forum dengan tingkat kepuasan wali murid > 90%',
        pic: 'Humas & Layanan Wali Murid',
        timeline: 'Q2 2026',
        progress: 100,
        status: 'Done',
        budget: 15000000,
        notes: 'Forum sesi 1 & 2 sukses diselenggarakan dihadiri 85 wali murid.',
        artifacts: [
          {
            id: 'art-06',
            name: 'Dokumentasi Forum Parenting Bersama Narasumber Spesialis Anak',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&auto=format&fit=crop&q=80',
            fileName: 'Dokumentasi_Parenting_Lazuardi.jpg',
            fileSize: '2.8 MB',
            uploadDate: '2026-05-18T13:40:00Z',
            notes: 'Dihadiri antusias oleh orang tua siswa terapi Pelangi Lazuardi.',
            uploaderName: 'Tim Humas'
          },
          {
            id: 'art-07',
            name: 'Rekap Hasil Kuesioner Kepuasan Wali Murid',
            type: 'pdf',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            fileName: 'Laporan_Survei_Kepuasan_Parenting.pdf',
            fileSize: '920 KB',
            uploadDate: '2026-05-20T10:00:00Z',
            notes: 'Skor kepuasan rata-rata 4.9 dari 5.0 bintang.',
            uploaderName: 'Tim Humas'
          }
        ]
      },
      {
        id: 'sp-2026-05',
        category: 'Kurikulum & Home Program',
        program: 'Pengembangan Modul Stimulasi Mandiri di Rumah (Home-Program Terstruktur)',
        kpi: 'Tersedia 20 lembar aktivitas terapeutik mandiri di portal siswa untuk orang tua',
        pic: 'Tim Kurikulum Terapi',
        timeline: 'Q3 - Q4 2026',
        progress: 35,
        status: 'On Progress',
        budget: 12000000,
        notes: '8 modul motorik halus dan regulasi emosi sudah divalidasi dokter spesialis.',
        artifacts: []
      },
      {
        id: 'sp-2026-06',
        category: 'Finansial & Efisiensi',
        program: 'Automasi Billing Digital & Integrasi Rekonsiliasi Kasir',
        kpi: 'Kolektibilitas invoice terapi tepat waktu &ge;95% dan zero selisih kas',
        pic: 'Manajer Keuangan & Kasir',
        timeline: 'Q1 2026',
        progress: 100,
        status: 'Done',
        budget: 10000000,
        notes: 'Sistem invoice digital dan reminder WhatsApp telah berjalan lancar.',
        artifacts: [
          {
            id: 'art-08',
            name: 'Laporan Audit Penerimaan & Rekonsiliasi Billing',
            type: 'pdf',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            fileName: 'Audit_Keuangan_Sesi_Terapi_Q1_2026.pdf',
            fileSize: '1.4 MB',
            uploadDate: '2026-04-05T08:30:00Z',
            notes: 'Hasil audit menunjukkan peningkatan kolektibilitas sebesar 12%.',
            uploaderName: 'Staff Keuangan'
          }
        ]
      }
    ]
  },
  {
    year: '2025/2026',
    items: [
      {
        id: 'sp-2025-01',
        category: 'Sarana & Ruang Sensori',
        program: 'Renovasi Ruang Tunggu Ramah Anak & Penambahan Sudut Sensori Buku',
        kpi: 'Kapasitas ruang tunggu meningkat 25% dan dilengkapi sudut baca ramah anak',
        pic: 'Bagian Umum',
        timeline: 'Q1 2025',
        progress: 100,
        status: 'Done',
        budget: 35000000,
        notes: 'Pekerjaan selesai Januari 2025.',
        artifacts: [
          {
            id: 'art-09',
            name: 'Foto Ruang Tunggu Ramah Anak',
            type: 'image',
            url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&auto=format&fit=crop&q=80',
            fileName: 'Ruang_Tunggu_Baru_2025.jpg',
            fileSize: '1.9 MB',
            uploadDate: '2025-01-25T11:00:00Z',
            notes: 'Ruang tunggu ber-AC dengan play corner aman.',
            uploaderName: 'Bagian Umum'
          }
        ]
      },
      {
        id: 'sp-2025-02',
        category: 'SDM & Sertifikasi',
        program: 'Pelatihan Pertolongan Pertama (P3K) & Manajemen Kejang / Tantrum Anak',
        kpi: '100% staf dan terapis lulus simulasi penanganan kondisi darurat anak',
        pic: 'HRD & Medis',
        timeline: 'Q3 2025',
        progress: 100,
        status: 'Done',
        budget: 18000000,
        notes: 'Seluruh peserta mendapatkan sertifikat penanganan darurat.',
        artifacts: [
          {
            id: 'art-10',
            name: 'Sertifikat Pelatihan Tanggap Darurat P3K',
            type: 'pdf',
            url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            fileName: 'Sertifikat_P3K_Terapis_2025.pdf',
            fileSize: '750 KB',
            uploadDate: '2025-09-12T15:00:00Z',
            notes: 'Pelatihan bersama tim medis rumah sakit mitra.',
            uploaderName: 'HRD'
          }
        ]
      }
    ]
  }
];

export const getStoredStrategicPlans = (): StrategicYearData[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STRATEGIC_PLAN);
    if (!raw) {
      saveStoredStrategicPlans(INITIAL_STRATEGIC_PLANS);
      return INITIAL_STRATEGIC_PLANS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_STRATEGIC_PLANS;
  } catch (e) {
    console.error('Failed reading strategic plans from localStorage', e);
    return INITIAL_STRATEGIC_PLANS;
  }
};

export const saveStoredStrategicPlans = (data: StrategicYearData[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_STRATEGIC_PLAN, JSON.stringify(data));
  } catch (e) {
    console.error('Failed saving strategic plans to localStorage', e);
  }
};

export const resetStrategicPlansToDefault = (): StrategicYearData[] => {
  try {
    localStorage.removeItem(STORAGE_KEY_STRATEGIC_PLAN);
  } catch (e) {
    // Ignore
  }
  saveStoredStrategicPlans(INITIAL_STRATEGIC_PLANS);
  return INITIAL_STRATEGIC_PLANS;
};
