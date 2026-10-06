export type KpiPillar = 'klinis' | 'keluarga' | 'sdm' | 'finansial';

export interface KpiItem {
  id: string;
  code: string; // e.g. KPI-KLN-01
  name: string;
  pillar: KpiPillar;
  pillarLabel: string;
  strategicObjective?: string; // Sasaran / Tujuan Strategis BSC
  initiatives?: string; // Inisiatif & Tindakan Nyata
  targetValue: number;
  actualValue: number;
  unit: '%' | 'IDR' | 'Siswa' | 'Sesi' | 'Skor' | 'Hari' | 'Rasio' | 'Jam';
  weight: number; // Persentase bobot dalam skor komposit, misal 10%
  period: string; // e.g. 'Tahun Ajaran 2026/2027'
  pic: string; // Penanggung Jawab / PIC
  description: string;
  higherIsBetter: boolean;
  autoSyncKey?: 
    | 'attendanceRate' 
    | 'programSuccessRate' 
    | 'assessmentCompletion' 
    | 'conversionRate' 
    | 'operatingMargin' 
    | 'activeStudents' 
    | 'totalRevenue'
    | 'parentSatisfaction'
    | 'notesCompliance'
    | 'activeTherapists'
    | 'invoiceCollection'
    | 'therapistUtilization'
    | 'expenseRatio';
}

export const KPI_PILLARS: { 
  id: KpiPillar; 
  label: string; 
  bscPerspective: string; 
  color: string; 
  badgeClass: string; 
  bgSoft: string;
  borderClass: string;
  description: string;
  iconName: string;
}[] = [
  {
    id: 'klinis',
    label: 'Layanan Klinis & Terapi',
    bscPerspective: 'Internal Clinical & Process Perspective',
    color: '#0d9488', // Teal
    badgeClass: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    bgSoft: 'bg-teal-500/5',
    borderClass: 'border-teal-500/30',
    description: 'Kualitas intervensi stimulasi tumbuh kembang anak (OT, TW, FT, Remedial, Hidro, Berkuda), pencapaian IEP, dan kepatuhan EMR',
    iconName: 'Activity'
  },
  {
    id: 'keluarga',
    label: 'Kemitraan Klien & Keluarga',
    bscPerspective: 'Customer & Parent Perspective',
    color: '#3b82f6', // Blue
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    bgSoft: 'bg-blue-500/5',
    borderClass: 'border-blue-500/30',
    description: 'Kepuasan wali murid, kelangsungan program terapi, retensi siswa, dan responsivitas konsultasi berkala',
    iconName: 'Users'
  },
  {
    id: 'sdm',
    label: 'SDM Praktisi & Pertumbuhan',
    bscPerspective: 'Learning & Growth Perspective',
    color: '#8b5cf6', // Purple
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    bgSoft: 'bg-purple-500/5',
    borderClass: 'border-purple-500/30',
    description: 'Kompetensi terapis multidisiplin, jam pelatihan klinis berkelanjutan, utilisasi waktu produktif, dan retensi praktisi',
    iconName: 'Sparkles'
  },
  {
    id: 'finansial',
    label: 'Finansial & Keberlanjutan',
    bscPerspective: 'Financial Sustainability Perspective',
    color: '#10b981', // Emerald
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    bgSoft: 'bg-emerald-500/5',
    borderClass: 'border-emerald-500/30',
    description: 'Kolektibilitas tagihan, efisiensi rasio operasional, pertumbuhan pendapatan sesi terapi, dan surplus lembaga',
    iconName: 'Wallet'
  }
];

export const INITIAL_KPI_LIST: KpiItem[] = [
  // 1. Pilar Klinis (Internal Clinical Process Perspective)
  {
    id: 'kpi-01',
    code: 'KPI-KLN-01',
    name: 'Tingkat Presensi & Kehadiran Siswa',
    pillar: 'klinis',
    pillarLabel: 'Layanan Klinis & Terapi',
    strategicObjective: 'Menjaga Kontinuitas Stimulasi Sesi Terapi Anak Tanpa Kehilangan Sesi',
    initiatives: 'Pengingat otomatis via WhatsApp H-1, mekanisme sesi pengganti (make-up session) fleksibel, dan konseling absensi.',
    targetValue: 90,
    actualValue: 94.5,
    unit: '%',
    weight: 10,
    period: 'Tahun Ajaran 2026/2027',
    pic: 'Koordinator Presensi & Jadwal',
    description: 'Persentase kehadiran sesi terapi anak sesuai jadwal yang dialokasikan tanpa izin mendadak atau tanpa keterangan.',
    higherIsBetter: true,
    autoSyncKey: 'attendanceRate'
  },
  {
    id: 'kpi-02',
    code: 'KPI-KLN-02',
    name: 'Ketercapaian Target Program Terapi Individual (IEP)',
    pillar: 'klinis',
    pillarLabel: 'Layanan Klinis & Terapi',
    strategicObjective: 'Meningkatkan Efektivitas Intervensi Tumbuh Kembang Multidisiplin',
    initiatives: 'Evaluasi target mingguan, kolaborasi lintas terapis (OT, TW, FT, Remedial, Hidro, Berkuda), dan adaptasi stimulasi sensori.',
    targetValue: 80,
    actualValue: 84.2,
    unit: '%',
    weight: 10,
    period: 'Tahun Ajaran 2026/2027',
    pic: 'Kepala Terapis & Case Manager',
    description: 'Persentase sasaran intervensi individual anak yang berstatus Tercapai atau Progres Optimal dalam Buku Catatan & Rapot.',
    higherIsBetter: true,
    autoSyncKey: 'programSuccessRate'
  },
  {
    id: 'kpi-03',
    code: 'KPI-KLN-03',
    name: 'Tingkat Penyelesaian Asesmen Awal & Re-evaluasi',
    pillar: 'klinis',
    pillarLabel: 'Layanan Klinis & Terapi',
    strategicObjective: 'Menegakkan Profil Perkembangan Anak Secara Tepat, Cepat, dan Akurat',
    initiatives: 'Standarisasi rubrik asesmen terpadu, penjadwalan re-evaluasi 6 bulanan otomatis, dan sidang kasus klinis.',
    targetValue: 90,
    actualValue: 92.0,
    unit: '%',
    weight: 10,
    period: 'Tahun Ajaran 2026/2027',
    pic: 'Tim Evaluator & Asesor Klinis',
    description: 'Ketuntasan laporan hasil observasi dan asesmen awal siswa baru dalam kurun waktu maksimal 7 hari kerja.',
    higherIsBetter: true,
    autoSyncKey: 'assessmentCompletion'
  },
  {
    id: 'kpi-04',
    code: 'KPI-KLN-04',
    name: 'Kepatuhan Pengisian Rekam Catatan Terapi Harian (EMR)',
    pillar: 'klinis',
    pillarLabel: 'Layanan Klinis & Terapi',
    strategicObjective: 'Menjamin Transparansi Rekam Progres Harian & Dokumentasi Klinis',
    initiatives: 'Pengisian catatan terapi real-time pasca sesi selesai, verifikasi mingguan oleh koordinator, serta review foto aktivitas.',
    targetValue: 98,
    actualValue: 98.5,
    unit: '%',
    weight: 10,
    period: 'Tahun Ajaran 2026/2027',
    pic: 'Supervisor EMR & Mutu Klinis',
    description: 'Ketepatan terapis dalam menginput catatan terapi harian, respon intervensi, dan checklist sasaran pada hari yang sama.',
    higherIsBetter: true,
    autoSyncKey: 'notesCompliance'
  },

  // 2. Pilar Kemitraan Klien & Keluarga (Customer Perspective)
  {
    id: 'kpi-05',
    code: 'KPI-KLG-01',
    name: 'Indeks Kepuasan & Ulasan Orang Tua (NPS)',
    pillar: 'keluarga',
    pillarLabel: 'Kemitraan Klien & Keluarga',
    strategicObjective: 'Membangun Hubungan Kepercayaan dan Kepuasan Tinggi Bersama Wali Murid',
    initiatives: 'Sesi konsultasi evaluasi berkala per caturwulan, portal komentar & saran digital, respon feedback < 24 jam.',
    targetValue: 4.8,
    actualValue: 4.9,
    unit: 'Skor',
    weight: 10,
    period: 'Tahun Ajaran 2026/2027',
    pic: 'Humas & Layanan Wali Murid',
    description: 'Rata-rata penilaian kepuasan orang tua terhadap pelayanan terapis, kemajuan anak, kebersihan fasilitas, dan komunikasi.',
    higherIsBetter: true,
    autoSyncKey: 'parentSatisfaction'
  },
  {
    id: 'kpi-06',
    code: 'KPI-KLG-02',
    name: 'Rasio Konversi Pendaftaran Tamu ke Klien Aktif',
    pillar: 'keluarga',
    pillarLabel: 'Kemitraan Klien & Keluarga',
    strategicObjective: 'Mengoptimalkan Efektivitas Admisi Calon Klien Baru Pelangi Lazuardi',
    initiatives: 'Paket observasi skrining awal ramah anak, orientasi fasilitas klinik terpadu, dan follow up berkala oleh front office.',
    targetValue: 85,
    actualValue: 88.5,
    unit: '%',
    weight: 10,
    period: 'Tahun Ajaran 2026/2027',
    pic: 'Front Office & Pendaftaran Tamu',
    description: 'Persentase orang tua yang mendaftar di daftar tamu dan lanjut melakukan asesmen klinis serta program sesi terapi rutin.',
    higherIsBetter: true,
    autoSyncKey: 'conversionRate'
  },

  // 3. Pilar SDM Praktisi & Pertumbuhan (Learning & Growth Perspective)
  {
    id: 'kpi-07',
    code: 'KPI-SDM-01',
    name: 'Jam Pelatihan Klinis & Sertifikasi per Terapis',
    pillar: 'sdm',
    pillarLabel: 'SDM Praktisi & Pertumbuhan',
    strategicObjective: 'Meningkatkan Kompetensi Klinis Praktisi Sesuai Standar Terkini',
    initiatives: 'Workshop bulanan Sensori Integrasi, Oral Motor, DIR Floortime, dan alokasi dana pendampingan sertifikasi profesional.',
    targetValue: 24,
    actualValue: 26.5,
    unit: 'Jam',
    weight: 10,
    period: 'Tahun Ajaran 2026/2027',
    pic: 'Kepala SDM & Pengembangan Terapis',
    description: 'Total rata-rata jam pelatihan profesional, bedah kasus klinis, dan workshop yang diikuti setiap terapis dalam satu tahun.',
    higherIsBetter: true
  },
  {
    id: 'kpi-08',
    code: 'KPI-SDM-02',
    name: 'Ketersediaan Terapis Multidisiplin Aktif & Tersertifikasi',
    pillar: 'sdm',
    pillarLabel: 'SDM Praktisi & Pertumbuhan',
    strategicObjective: 'Memastikan Kapasitas Layanan Holistik (OT, TW, FT, Remedial, Hidro, Berkuda)',
    initiatives: 'Rekrutmen terapis profesional berkualifikasi, mentoring terapis baru oleh senior, dan rotasi kasus klinis terarah.',
    targetValue: 10,
    actualValue: 12,
    unit: 'Siswa',
    weight: 10,
    period: 'Tahun Ajaran 2026/2027',
    pic: 'Koordinator SDM & Jadwal Terapis',
    description: 'Jumlah terapis profesional aktif dengan surat izin praktik dan kompetensi khusus yang siap mendampingi anak.',
    higherIsBetter: true,
    autoSyncKey: 'activeTherapists'
  },

  // 4. Pilar Finansial & Keberlanjutan (Financial Perspective)
  {
    id: 'kpi-09',
    code: 'KPI-FIN-01',
    name: 'Margin Surplus Operasional Lembaga',
    pillar: 'finansial',
    pillarLabel: 'Finansial & Keberlanjutan',
    strategicObjective: 'Menjaga Keberlanjutan Finansial dan Efisiensi Beban Operasional',
    initiatives: 'Efisiensi pengadaan media terapi sensori terstandar, optimalisasi utilisasi ruangan terapi, dan pemantauan cash flow mingguan.',
    targetValue: 35,
    actualValue: 42.5,
    unit: '%',
    weight: 10,
    period: 'Tahun Ajaran 2026/2027',
    pic: 'Manajer Keuangan & Kasir',
    description: 'Persentase surplus bersih operasional tahunan (pemasukan sesi dikurangi seluruh beban operasional) terhadap total pemasukan.',
    higherIsBetter: true,
    autoSyncKey: 'operatingMargin'
  },
  {
    id: 'kpi-10',
    code: 'KPI-FIN-02',
    name: 'Kolektibilitas Pembayaran Tagihan Tepat Waktu',
    pillar: 'finansial',
    pillarLabel: 'Finansial & Keberlanjutan',
    strategicObjective: 'Meminimalkan Piutang Tertunda dan Memperlancar Sirkulasi Kas Layanan',
    initiatives: 'Pengiriman invoice digital awal bulan otomatis via WhatsApp/email, opsi pembayaran QRIS/VA, dan notifikasi reminder berkala.',
    targetValue: 95,
    actualValue: 96.8,
    unit: '%',
    weight: 10,
    period: 'Tahun Ajaran 2026/2027',
    pic: 'Staf Administrasi Tagihan & Kasir',
    description: 'Persentase invoice paket sesi terapi yang diselesaikan orang tua murid sebelum tanggal jatuh tempo bulanan (tanggal 10).',
    higherIsBetter: true,
    autoSyncKey: 'invoiceCollection'
  }
];

export const STORAGE_KEY_KPIS = 'pelangi360_manager_kpi_dashboard_v1';

export const getStoredKpiList = (): KpiItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_KPIS);
    if (!raw) return INITIAL_KPI_LIST;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge any missing fields like strategicObjective or initiatives if legacy data exists
      return parsed.map(item => {
        const defaultMatch = INITIAL_KPI_LIST.find(d => d.id === item.id || d.code === item.code);
        return {
          ...item,
          strategicObjective: item.strategicObjective || defaultMatch?.strategicObjective || 'Optimalisasi Kinerja Strategis',
          initiatives: item.initiatives || defaultMatch?.initiatives || 'Pelaksanaan program strategis berkala dan monitoring terpadu.'
        };
      });
    }
    return INITIAL_KPI_LIST;
  } catch (e) {
    console.error('Failed reading KPIs from localStorage', e);
    return INITIAL_KPI_LIST;
  }
};

export const saveStoredKpiList = (list: KpiItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_KPIS, JSON.stringify(list));
  } catch (e) {
    console.error('Failed saving KPIs to localStorage', e);
  }
};

export const resetKpiListToDefault = (): KpiItem[] => {
  try {
    localStorage.removeItem(STORAGE_KEY_KPIS);
  } catch (e) {
    // Ignore
  }
  return INITIAL_KPI_LIST;
};

// --- Helper Functions for Balanced Scorecard Analytics ---

/**
 * Menghitung persentase capaian (0-100+%) dari suatu KPI
 */
export const calculateKpiAttainment = (kpi: KpiItem): number => {
  const target = kpi.targetValue;
  const actual = kpi.actualValue;
  if (target === 0) return actual > 0 ? 100 : 0;
  
  if (kpi.higherIsBetter) {
    return (actual / target) * 100;
  } else {
    // Lower is better (e.g. rasio komplain, waktu tunggu)
    return (target / (actual || 0.0001)) * 100;
  }
};

export interface KpiStatusInfo {
  status: 'good' | 'average' | 'poor';
  label: string;
  badgeClass: string;
  colorHex: string;
  attainmentPercent: number;
}

export const getKpiStatusInfo = (kpi: KpiItem): KpiStatusInfo => {
  const attainment = calculateKpiAttainment(kpi);
  let status: 'good' | 'average' | 'poor' = 'poor';

  if (attainment >= 95) {
    status = 'good';
  } else if (attainment >= 80) {
    status = 'average';
  } else {
    status = 'poor';
  }

  return {
    status,
    label: status === 'good' ? 'Tercapai' : status === 'average' ? 'Perhatian' : 'Kritis',
    badgeClass: status === 'good' 
      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
      : status === 'average' 
        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    colorHex: status === 'good' ? '#10b981' : status === 'average' ? '#f59e0b' : '#ef4444',
    attainmentPercent: Math.round(attainment * 10) / 10
  };
};

/**
 * Menghitung statistik & skor kesehatan per pilar BSC
 */
export interface PillarSummary {
  pillarId: KpiPillar;
  label: string;
  score: number; // Capaian tertimbang pilar (0-100)
  totalKpis: number;
  goodCount: number;
  averageCount: number;
  poorCount: number;
  totalWeight: number;
}

export const calculatePillarSummary = (kpis: KpiItem[], pillarId: KpiPillar): PillarSummary => {
  const items = kpis.filter(k => k.pillar === pillarId);
  const pillarDef = KPI_PILLARS.find(p => p.id === pillarId);
  const label = pillarDef?.label || pillarId;

  if (items.length === 0) {
    return {
      pillarId,
      label,
      score: 0,
      totalKpis: 0,
      goodCount: 0,
      averageCount: 0,
      poorCount: 0,
      totalWeight: 0
    };
  }

  let totalWeight = 0;
  let weightedScoreSum = 0;
  let good = 0;
  let avg = 0;
  let poor = 0;

  items.forEach(k => {
    const attainment = Math.min(calculateKpiAttainment(k), 125); // cap individual to 125% max to prevent skew
    const w = k.weight || 10;
    totalWeight += w;
    weightedScoreSum += attainment * w;

    const { status } = getKpiStatusInfo(k);
    if (status === 'good') good++;
    else if (status === 'average') avg++;
    else poor++;
  });

  const finalScore = totalWeight > 0 ? weightedScoreSum / totalWeight : 0;

  return {
    pillarId,
    label,
    score: Math.round(finalScore * 10) / 10,
    totalKpis: items.length,
    goodCount: good,
    averageCount: avg,
    poorCount: poor,
    totalWeight
  };
};

/**
 * Menghitung Skor Komposit Keseluruhan Balanced Scorecard
 */
export interface CompositeScoreResult {
  compositeScore: number;
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  gradeLabel: string;
  statusText: string;
  colorClass: string;
  textColor: string;
  goodCount: number;
  averageCount: number;
  poorCount: number;
  totalKpis: number;
}

export const calculateOverallCompositeScore = (kpis: KpiItem[]): CompositeScoreResult => {
  if (kpis.length === 0) {
    return {
      compositeScore: 0,
      grade: 'D',
      gradeLabel: 'Belum Ada Data',
      statusText: 'Data KPI belum tersedia untuk evaluasi.',
      colorClass: 'text-slate-400',
      textColor: '#94a3b8',
      goodCount: 0,
      averageCount: 0,
      poorCount: 0,
      totalKpis: 0
    };
  }

  let totalWeight = 0;
  let weightedSum = 0;
  let good = 0;
  let avg = 0;
  let poor = 0;

  kpis.forEach(k => {
    const rawAttainment = calculateKpiAttainment(k);
    const capped = Math.min(rawAttainment, 120);
    const weight = k.weight || 10;
    totalWeight += weight;
    weightedSum += capped * weight;

    const { status } = getKpiStatusInfo(k);
    if (status === 'good') good++;
    else if (status === 'average') avg++;
    else poor++;
  });

  const finalComposite = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;

  let grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' = 'C';
  let gradeLabel = 'Cukup';
  let statusText = 'Perlu perbaikan terarah pada beberapa indikator kunci';
  let colorClass = 'text-amber-400';
  let textColor = '#f59e0b';

  if (finalComposite >= 95) {
    grade = 'A+';
    gradeLabel = 'Ekselen (Prima)';
    statusText = 'Kinerja sangat optimal dan melampaui target strategis lembaga';
    colorClass = 'text-emerald-400';
    textColor = '#10b981';
  } else if (finalComposite >= 90) {
    grade = 'A';
    gradeLabel = 'Sangat Baik (On Track)';
    statusText = 'Seluruh pilar berjalan sesuai sasaran rencana strategis Pelangi Lazuardi';
    colorClass = 'text-teal-400';
    textColor = '#0d9488';
  } else if (finalComposite >= 80) {
    grade = 'B+';
    gradeLabel = 'Baik & Stabil';
    statusText = 'Kinerja memuaskan dengan beberapa area memerlukan penyempurnaan';
    colorClass = 'text-blue-400';
    textColor = '#3b82f6';
  } else if (finalComposite >= 70) {
    grade = 'B';
    gradeLabel = 'Cukup Memadai';
    statusText = 'Memerlukan intervensi terfokus pada pilar yang belum mencapai target';
    colorClass = 'text-yellow-400';
    textColor = '#eab308';
  } else {
    grade = 'D';
    gradeLabel = 'Perlu Perhatian Kritis';
    statusText = 'Banyak sasaran di bawah batas minimum; diperlukan rapat koordinasi darurat';
    colorClass = 'text-rose-400';
    textColor = '#ef4444';
  }

  return {
    compositeScore: finalComposite,
    grade,
    gradeLabel,
    statusText,
    colorClass,
    textColor,
    goodCount: good,
    averageCount: avg,
    poorCount: poor,
    totalKpis: kpis.length
  };
};

