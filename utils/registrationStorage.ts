import { RegistrationRecord, RegistrationStatus, Child, AssessmentStatus } from '../types';

type MasterChild = Omit<Child, 'sessions'>;

const STORAGE_KEY = 'pelangi_registrations_v2';

export const INITIAL_REGISTRATIONS: RegistrationRecord[] = [
  {
    id: 'REG-REC-001',
    registrationNumber: 'REG-2026-001',
    registrationDate: '2026-09-28T08:15:00.000Z',
    status: 'Registrasi Baru',
    childName: 'Kenzo Rafasya Al-Fatih',
    childNickname: 'Kenzo',
    birthDate: '2021-04-14',
    gender: 'Laki-Laki',
    school: 'PAUD Bintang Ceria',
    address: 'Jl. Cenderawasih No. 18, Ciputat, Tangerang Selatan',
    fatherName: 'Budi Santoso',
    motherName: 'Rina Kartika',
    parentName: 'Budi Santoso & Rina',
    whatsapp: '081234567890',
    email: 'budi.santoso@gmail.com',
    selectedService: 'Assesment Terapi',
    mainComplaint: 'Speech delay (belum bicara 2 kata bermakna pada usia 3 tahun), kontak mata kurang fokus, dan sering tantrum saat keinginannya belum dipahami.',
    diagnosis: 'Suspek Speech Delay & Sensory Processing Issue',
    therapyHistory: 'Belum pernah mengikuti terapi sebelumnya.',
    interestedServices: ['Terapi Okupasi (OT)', 'Terapi Wicara (TW)'],
    referralSource: 'Instagram',
    followUpOfficer: 'Admin Rina',
    rawGuestData: {
      category: 'Assesment Terapi',
      child: {
        fullName: 'Kenzo Rafasya Al-Fatih',
        nickName: 'Kenzo',
        gender: 'Laki-Laki',
        birthPlace: 'Jakarta',
        birthDate: '2021-04-14',
        age: '3 tahun 5 bulan',
        address: 'Jl. Cenderawasih No. 18, Ciputat, Tangerang Selatan',
        phone: '081234567890',
        school: 'PAUD Bintang Ceria',
        class: 'Kelompok Bermain'
      },
      family: {
        childOrder: '1',
        totalSiblings: '2',
        father: {
          name: 'Budi Santoso', age: '34', status: 'Hidup', ethnicity: 'Jawa', religion: 'Islam', order: '2', totalSiblings: '3', marriageOrder: '1', marriageYear: '2019', education: 'S1 Teknik Informatika', job: 'Software Engineer', address: 'Jl. Cenderawasih No. 18, Ciputat', phone: '081234567890', officePhone: '021-5234567'
        },
        mother: {
          name: 'Rina Kartika', age: '31', status: 'Hidup', ethnicity: 'Sunda', religion: 'Islam', order: '1', totalSiblings: '2', marriageOrder: '1', marriageYear: '2019', education: 'S1 Manajemen', job: 'Ibu Rumah Tangga', address: 'Jl. Cenderawasih No. 18, Ciputat', phone: '081298765432', officePhone: '-'
        }
      },
      siblings: [
        { id: '1', name: 'Kenzo Rafasya Al-Fatih', gender: 'L', age: '3.5', education: 'PAUD', remarks: 'Anak pertama (Klien)' },
        { id: '2', name: 'Aisyah Humaira', gender: 'P', age: '1', education: 'Belum Sekolah', remarks: 'Adik kandung' }
      ],
      referral: {
        generalOverview: 'Ananda aktif bergerak namun kesulitan berkomunikasi secara verbal dan belum merespons saat dipanggil namanya dari kejauhan.',
        complaints: 'Speech delay (belum bicara 2 kata bermakna pada usia 3 tahun), kontak mata kurang fokus, dan sering tantrum saat keinginannya belum dipahami.',
        sinceWhen: 'Sejak usia 2 tahun orang tua mulai menyadari kosakata tidak bertambah.',
        underlyingFactors: 'Paparan gawai (gadget) sekitar 3-4 jam sehari saat balita, kurang stimulasi teman sebaya.',
        relievingFactors: 'Bisa tenang saat diajak bermain sensori pasir kinetik atau air di luar ruangan.',
        actionsTaken: 'Mengurangi screen time menjadi nol selama 2 bulan terakhir, membeli buku cerita bergambar.',
        resultsAchieved: 'Tantrum sedikit berkurang namun kosa kata belum bertambah signifikan.',
        goals: 'Dapat berbicara 2-3 kata dengan jelas, mampu mengekspresikan kebutuhan sehari-hari, dan kontak mata membaik.',
        source: 'Instagram'
      },
      birth: {
        prenatal: { problems: 'Mual muntah berlebih (hiperemesis) pada trimester 1', physicalCondition: 'Kondisi fisik ibu sehat, tidak pernah pendarahan', emotionalCondition: 'Sempat cemas saat awal pandemi' },
        delivery: { duration: '39 minggu', process: 'Persalinan Normal di RS Hermina Ciputat', condition: 'Langsung menangis kuat, tidak kuning atau biru', length: '50 cm', weight: '3.3 kg', breastfeedingUntil: '24 bulan (ASI Eksklusif)' }
      },
      development: {
        feeding: { fedBy: 'Ibu dan Pengasuh', eatsWith: 'Sendok dan tangan langsung', hungerSignal: 'Menunjuk ke arah meja makan atau botol air', difficultySitting: 'Sering bangkit dari kursi jika lebih dari 10 menit', difficultPositions: 'Menolak duduk tenang di high chair' },
        preferences: { drinks: ['Air Putih', 'Susu UHT'], fruits: 'Pisang, Melon manis', foods: 'Nasi tim ayam kecap, telur orak-arik', favoriteTaste: 'Manis dan gurih' }
      },
      health: {
        illnesses: ['Pernah demam batuk pilek ringan', 'Tidak ada riwayat kejang atau alergi berat'],
        diagnosis: 'Suspek Speech Delay & Sensory Processing Issue',
        therapyHistory: 'Belum pernah mengikuti terapi sebelumnya.'
      },
      social: {
        independence: ['Makan dengan bantuan', 'Bisa melepas sepatu sendiri', 'Sedang toilet training siang hari'],
        sociability: { shyness: 'Agak pemalu saat bertemu orang asing baru', groupPlay: 'Cenderung parallel play (bermain di samping anak lain bukan bersama)', bestFriend: 'Sepupu sebaya di rumah kakek', playLocation: 'Ruang keluarga dan taman bermain perumahan', gameType: 'Balok susun, mobil-mobilan putar roda', favoriteGames: 'Mobil tayo dan puzzle balok' }
      },
      learning: {
        duration: '10 - 15 menit', time: 'Pagi hari sekitar jam 09.00', matter: ['Mengenal warna', 'Menebalkan garis'], schedule: 'Fleksibel', location: 'Meja kecil di ruang tamu', independence: 'Perlu ditemani penuh', difficultyRelieving: 'Diberi jeda bermain dan pujian verbal', readingInterests: ['Buku hewan bersuara', 'Buku kendaraan']
      },
      emotion: {
        motivation: { preparation: 'Antusias jika diajak bermain mainan baru', feeling: 'Senang bernyanyi ritmik', spareTime: 'Melihat buku gambar' },
        socialAdjustment: { newEnv: 'Butuh 15-20 menit adaptasi menempel pada ibu', newTask: 'Cepat frustrasi jika balok roboh', rules: 'Masih perlu diingatkan berulang kali', discomfort: 'Menangis dan menarik tangan orang tua' },
        emotions: { happyWhat: 'Bermain air dan mandi bola', happyHow: 'Tepuk tangan dan melompat', sadWhat: 'Mainan diambil adik', sadHow: 'Merengek dan berbaring di lantai', angryWhat: 'Keinginan tidak segera dipahami', angryHow: 'Berteriak dan melempar bantal kecil' },
        additional: { differentFromPeers: 'Kosa kata bicara lebih sedikit dibanding teman sebayanya', quiet: 'Kadang asyik dengan dunianya sendiri memutar roda mobil', distractible: 'Mudah teralihkan jika ada suara TV atau musik', interferesOthers: 'Tidak agresif terhadap anak lain', easySocial: 'Butuh pendampingan', schoolIssues: 'Guru PAUD menyarankan assessment wicara', PhysicalIssues: 'Fisik tumbuh sehat dan gesit' }
      }
    },
    birthHistory: {
      prenatal: { problems: 'Hiperemesis trimester 1', physicalCondition: 'Baik', emotionalCondition: 'Stabil' },
      delivery: { duration: '39 minggu', process: 'Normal', condition: 'Langsung menangis', length: '50 cm', weight: '3.3 kg', breastfeedingUntil: '24 bulan' }
    },
    developmentHistory: {
      feeding: { fedBy: 'Ibu', eatsWith: 'Sendok', hungerSignal: 'Menunjuk', difficultySitting: 'Ada sedikit' },
      preferences: { drinks: ['Air Putih'], fruits: 'Pisang, Melon', foods: 'Nasi ayam kecap', favoriteTaste: 'Manis' }
    },
    healthHistory: {
      diagnosis: 'Suspek Speech Delay & Sensory Processing Issue',
      therapyHistory: 'Belum pernah mengikuti terapi sebelumnya.'
    },
    documents: {
      kartuKeluarga: { name: 'KK_Kenzo.pdf', status: 'Tersedia', fileSize: '1.2 MB', uploadDate: '2026-09-28' },
      aktaKelahiran: { name: 'Akta_Kenzo.pdf', status: 'Tersedia', fileSize: '980 KB', uploadDate: '2026-09-28' },
      suratDiagnosa: { name: 'Rujukan_DSA_drSpA.pdf', status: 'Tersedia', fileSize: '1.5 MB', uploadDate: '2026-09-28' },
      hasilAssessment: { name: 'Assessment_Awal.pdf', status: 'Belum Ada' }
    }
  },
  {
    id: 'REG-REC-002',
    registrationNumber: 'REG-2026-002',
    registrationDate: '2026-09-27T10:30:00.000Z',
    status: 'Menunggu Follow Up',
    childName: 'Alya Zahira Salsabila',
    childNickname: 'Alya',
    birthDate: '2020-08-22',
    gender: 'Perempuan',
    school: 'TK Islam Pelita Hati',
    address: 'Komplek Griya Indah Blok C3 No. 5, Pamulang',
    fatherName: 'Hendro Wibowo',
    motherName: 'Dewi Anggraini',
    parentName: 'Dewi Anggraini',
    whatsapp: '081987654321',
    email: 'dewi.anggraini@yahoo.com',
    selectedService: 'Assesment Terapi + Psikolog',
    mainComplaint: 'Sensitivitas pendengaran tinggi (takut suara blender/vacuum), kesulitan berinteraksi dengan teman sebaya di sekolah, dan cemas berlebih saat perpisahan.',
    diagnosis: 'Kecemasan Sosial & Sensori Hipersensitif',
    therapyHistory: 'Pernah konsultasi tumbuh kembang di RS Hermina Ciputat 6 bulan lalu.',
    interestedServices: ['Terapi Okupasi (OT)', 'Konsultasi Psikolog Anak'],
    referralSource: 'Website',
    followUpOfficer: 'Admin Siti',
    followUpNotes: 'Sudah di-chat via WhatsApp, orang tua meminta konfirmasi estimasi biaya paket assesmen lengkap.',
    followUpDate: '2026-09-27',
    documents: {
      kartuKeluarga: { name: 'KK_Alya.pdf', status: 'Tersedia', fileSize: '1.1 MB', uploadDate: '2026-09-27' },
      aktaKelahiran: { name: 'Akta_Alya.pdf', status: 'Tersedia', fileSize: '850 KB', uploadDate: '2026-09-27' },
      suratDiagnosa: { name: 'Diagnosa_Psikolog.pdf', status: 'Belum Ada' },
      hasilAssessment: { name: 'Hasil_Observasi.pdf', status: 'Belum Ada' }
    }
  },
  {
    id: 'REG-REC-003',
    registrationNumber: 'REG-2026-003',
    registrationDate: '2026-09-25T14:20:00.000Z',
    status: 'Menunggu Assessment',
    childName: 'Daffa Althafurrahman',
    childNickname: 'Daffa',
    birthDate: '2019-11-05',
    gender: 'Laki-Laki',
    school: 'SDIT Al-Hikmah Kelas 1',
    address: 'Jl. Merpati Putih No. 44, Bintaro Sektor 9',
    fatherName: 'Fauzi Rahman',
    motherName: 'Nurul Hidayati',
    parentName: 'Fauzi Rahman',
    whatsapp: '082155443322',
    email: 'fauzi.rahman@perusahaan.co.id',
    selectedService: 'Assesment Terapi',
    mainComplaint: 'Kesulitan motorik halus menulis (pencil grasp belum matang, tulisan tidak terbaca), cepat lelah saat belajar di kelas, dan atensi mudah beralih.',
    diagnosis: 'Fine Motor Weakness & Dysgraphia Suspect',
    therapyHistory: 'Pernah terapi sensori integrasi di klinik lain selama 3 bulan.',
    interestedServices: ['Terapi Okupasi (OT)', 'Remedial Teaching'],
    referralSource: 'Google',
    followUpOfficer: 'Admin Rina',
    followUpNotes: 'Orang tua setuju jadwal assessment pekan depan hari Sabtu, menunggu konfirmasi ketersediaan slot ruangan OT.',
    followUpDate: '2026-09-26',
    documents: {
      kartuKeluarga: { name: 'KK_Daffa.pdf', status: 'Tersedia', fileSize: '1.4 MB', uploadDate: '2026-09-25' },
      aktaKelahiran: { name: 'Akta_Daffa.pdf', status: 'Tersedia', fileSize: '920 KB', uploadDate: '2026-09-25' },
      suratDiagnosa: { name: 'Surat_Rekomendasi_Guru.pdf', status: 'Tersedia', fileSize: '1.0 MB', uploadDate: '2026-09-25' },
      hasilAssessment: { name: 'Assessment_Sebelumnya.pdf', status: 'Tersedia', fileSize: '2.1 MB', uploadDate: '2026-09-25' }
    }
  },
  {
    id: 'REG-REC-004',
    registrationNumber: 'REG-2026-004',
    registrationDate: '2026-09-24T09:00:00.000Z',
    status: 'Assessment Terjadwal',
    childName: 'Naura Khadijah Putri',
    childNickname: 'Naura',
    birthDate: '2021-02-18',
    gender: 'Perempuan',
    school: 'KB Permata Bunda',
    address: 'Jl. Melati Raya No. 12, Pondok Ranji, Tangsel',
    fatherName: 'Rizal Pratama',
    motherName: 'Fitri Handayani',
    parentName: 'Fitri Handayani',
    whatsapp: '081399887766',
    email: 'fitri.handayani@gmail.com',
    selectedService: 'Assesment Terapi',
    mainComplaint: 'Artikulasi bicara belum jelas (banyak fonem yang rumpang seperti /r/, /s/, /l/), perbendaharaan kata terbatas untuk anak usia 3.5 tahun.',
    diagnosis: 'Gangguan Artikulasi & Keterlambatan Fonologi',
    therapyHistory: 'Belum pernah terapi.',
    interestedServices: ['Terapi Wicara (TW)'],
    referralSource: 'Referensi',
    followUpOfficer: 'Admin Rina',
    assessmentDate: '2026-10-03',
    assessmentTime: '09:00 - 10:00',
    assessmentTherapistId: 'T12',
    assessmentTherapistName: 'Adisty Ayuningtyas, A.Md.TW',
    assessmentRoom: 'Ruang Wicara 2',
    assessmentNotes: 'Membawa buku riwayat tumbuh kembang anak dari puskesmas/bidan.',
    documents: {
      kartuKeluarga: { name: 'KK_Naura.pdf', status: 'Tersedia', fileSize: '1.3 MB', uploadDate: '2026-09-24' },
      aktaKelahiran: { name: 'Akta_Naura.pdf', status: 'Tersedia', fileSize: '890 KB', uploadDate: '2026-09-24' },
      suratDiagnosa: { name: 'Surat_Pengantar.pdf', status: 'Belum Ada' },
      hasilAssessment: { name: 'Formulir_Assesment.pdf', status: 'Tersedia', fileSize: '1.2 MB', uploadDate: '2026-09-24' }
    }
  },
  {
    id: 'REG-REC-005',
    registrationNumber: 'REG-2026-005',
    registrationDate: '2026-09-20T11:15:00.000Z',
    status: 'Menjadi Klien Aktif',
    childName: 'Adriel Djulian Putra Aditya',
    childNickname: 'Adriel',
    birthDate: '2015-12-29',
    gender: 'Laki-Laki',
    school: '3 MWS',
    address: 'Nerada Estate Blok A6 No.7 Cipayung, Ciputat. Tangsel',
    fatherName: 'Aditya Anugrah Putra',
    motherName: 'Djuliani Djumhani Djoewarsa',
    parentName: 'Aditya Anugrah Putra',
    whatsapp: '081288776655',
    email: 'aditya.anugrah@lazuardi.sch.id',
    selectedService: 'Assesment Terapi',
    mainComplaint: 'Memerlukan intervensi regulasi sensori integrasi, penguatan artikulasi wicara, dan peningkatan fokus motorik halus.',
    diagnosis: 'Sensory Processing Disorder & Fine Motor Delays',
    therapyHistory: 'Sudah menjalani program terapi intensif Okupasi dan Wicara di Pelangi Lazuardi.',
    interestedServices: ['Terapi Okupasi (OT)', 'Terapi Wicara (TW)', 'Hidroterapi'],
    referralSource: 'Rekomendasi Dokter',
    followUpOfficer: 'Admin Rina',
    assessmentDate: '2026-09-22',
    assessmentTime: '08:00 - 09:30',
    assessmentTherapistId: 'T11',
    assessmentTherapistName: 'Rilla Serando, S.Tr.Kes',
    convertedClientId: 'C-ADRIEL',
    convertedDate: '2026-09-23',
    documents: {
      kartuKeluarga: { name: 'KK_Adriel.pdf', status: 'Tersedia', fileSize: '1.6 MB', uploadDate: '2026-09-20' },
      aktaKelahiran: { name: 'Akta_Adriel.pdf', status: 'Tersedia', fileSize: '1.1 MB', uploadDate: '2026-09-20' },
      suratDiagnosa: { name: 'Hasil_Evaluasi_Dokter.pdf', status: 'Tersedia', fileSize: '2.4 MB', uploadDate: '2026-09-20' },
      hasilAssessment: { name: 'Laporan_Assesment_Lengkap.pdf', status: 'Tersedia', fileSize: '3.1 MB', uploadDate: '2026-09-22' }
    }
  },
  {
    id: 'REG-REC-006',
    registrationNumber: 'REG-2026-006',
    registrationDate: '2026-09-18T16:45:00.000Z',
    status: 'Ditutup',
    childName: 'Alvaro Keenan Alatas',
    childNickname: 'Alvaro',
    birthDate: '2020-03-10',
    gender: 'Laki-Laki',
    school: 'TK Kasih Ibu',
    address: 'Jl. Pajajaran No. 7, Pamulang Barat',
    fatherName: 'Denny Kurniawan',
    motherName: 'Sarah Alatas',
    parentName: 'Denny Kurniawan',
    whatsapp: '085611223344',
    email: 'denny.kurniawan@gmail.com',
    selectedService: 'Konsultasi Psikolog',
    mainComplaint: 'Konsultasi kesiapan sekolah formal.',
    diagnosis: 'Perkembangan Sesuai Usia',
    referralSource: 'Teman',
    followUpOfficer: 'Admin Siti',
    followUpNotes: 'Keluarga mengonfirmasi pindah domisili tugas ke Bandung sehingga sesi tindak lanjut dialihkan ke cabang rekanan.',
    documents: {
      kartuKeluarga: { name: 'KK_Alvaro.pdf', status: 'Tersedia', fileSize: '1.0 MB', uploadDate: '2026-09-18' },
      aktaKelahiran: { name: 'Akta_Alvaro.pdf', status: 'Tersedia', fileSize: '780 KB', uploadDate: '2026-09-18' },
      suratDiagnosa: { name: 'Surat_Keterangan.pdf', status: 'Belum Ada' },
      hasilAssessment: { name: 'Hasil_Screening.pdf', status: 'Belum Ada' }
    }
  }
];

export function getStoredRegistrations(): RegistrationRecord[] {
  if (typeof window === 'undefined') return INITIAL_REGISTRATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REGISTRATIONS));
      return INITIAL_REGISTRATIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_REGISTRATIONS));
    return INITIAL_REGISTRATIONS;
  } catch (e) {
    console.error('Failed to parse registrations:', e);
    return INITIAL_REGISTRATIONS;
  }
}

export function saveStoredRegistrations(records: RegistrationRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new CustomEvent('pelangi_registration_updated', { detail: records }));
  } catch (e) {
    console.error('Failed to save registrations:', e);
  }
}

/**
 * Converts submitted guest registration form data into a standardized RegistrationRecord.
 */
export function convertGuestDataToRegistration(data: any, existingCount: number = 0): RegistrationRecord {
  const currentYear = new Date().getFullYear();
  const nextSeq = String(existingCount + 1).padStart(3, '0');
  const regNumber = `REG-${currentYear}-${nextSeq}`;

  const child = data.child || {};
  const family = data.family || {};
  const father = family.father || {};
  const mother = family.mother || {};
  const contacts = family.contacts || {};

  const childName = child.fullName || child.nickName || 'Ananda Baru';
  const fatherName = father.name || '';
  const motherName = mother.name || '';
  const parentName = fatherName && motherName ? `${fatherName} & ${motherName}` : (fatherName || motherName || 'Orang Tua / Wali');

  const whatsapp = contacts.phone || father.phone || mother.phone || child.phone || '-';
  const email = contacts.email || father.email || mother.email || '';

  // Extract complaints and history directly from what user entered
  const mainComplaint = data.referral?.complaints || data.referral?.complaint || data.referral?.generalOverview || '-';
  const diagnosis = data.health?.diagnosis || data.referral?.underlyingFactors || '';
  const therapyHistory = data.health?.therapyHistory || data.referral?.actionsTaken || '';
  
  const selectedService = data.category || (data.subCategory ? `Psikolog (${data.subCategory})` : 'Assesment Terapi');

  return {
    id: `REG-REC-${Date.now()}`,
    registrationNumber: regNumber,
    registrationDate: new Date().toISOString(),
    status: 'Registrasi Baru',
    childName,
    childNickname: child.nickName || '',
    birthDate: child.birthDate || '',
    gender: child.gender === 'L' || child.gender === 'Laki-Laki' ? 'Laki-Laki' : (child.gender === 'P' || child.gender === 'Perempuan' ? 'Perempuan' : (child.gender || '-')),
    school: child.school || child.originSchool || '-',
    address: child.address || father.address || mother.address || '-',
    fatherName,
    motherName,
    parentName,
    whatsapp,
    email,
    selectedService,
    mainComplaint,
    diagnosis,
    therapyHistory,
    interestedServices: [selectedService],
    referralSource: data.referralSource || data.referral?.source || data.informationSource || 'Instagram',
    followUpOfficer: '',
    documents: {
      kartuKeluarga: { name: 'KK_Ananda.pdf', status: 'Belum Ada' },
      aktaKelahiran: { name: 'Akta_Kelahiran.pdf', status: 'Belum Ada' },
      suratDiagnosa: { name: 'Rujukan_Medis.pdf', status: 'Belum Ada' },
      hasilAssessment: { name: 'Formulir_Pendaftaran_Tamu.pdf', status: 'Tersedia', fileSize: 'Digital Form', uploadDate: new Date().toISOString().split('T')[0] }
    },
    rawGuestData: data,
    birthHistory: data.birth || {},
    developmentHistory: data.development || {},
    healthHistory: data.health || {},
    socialHistory: data.social || {},
    behaviorAnswers: data.behavior || {},
    learningAnswers: data.learning || {},
    emotionAnswers: data.emotion || {},
    referralDetails: data.referral || {},
    sensoryScores: data.sensoryProfile || {},
    observationAnswers: data.observation || {},
    siblingsList: data.siblings || []
  };
}

/**
 * Converts a RegistrationRecord to a MasterChild (Data Klien) and generates an account.
 */
export function convertRegistrationToChild(record: RegistrationRecord, existingChildrenCount: number): MasterChild {
  const cleanUsername = record.childName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 15) || `siswa${existingChildrenCount + 1}`;

  return {
    id: `C${101 + existingChildrenCount}`,
    name: record.childName,
    photoUrl: `https://i.pravatar.cc/100?u=${record.childName.replace(/\s/g, '')}`,
    recurringSessions: [],
    assessmentStatus: AssessmentStatus.NOT_ASSESSED,
    birthDate: record.birthDate,
    gender: record.gender,
    className: record.school || 'Kelas Terapi Awal',
    parentName: record.fatherName || record.parentName || 'Orang Tua',
    motherName: record.motherName || 'Ibu',
    address: record.address,
    phone: record.whatsapp,
    username: cleanUsername,
    password: 'pelangilazuardi',
    status: 'Aktif',
    diagnosis: record.diagnosis || record.mainComplaint,
    paymentHistory: {}
  };
}
