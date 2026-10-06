import { RegistrationRecord, Child, AssessmentStatus } from '../types';

export interface AssessmentTeamAssignment {
  therapist1Id?: string;
  therapist1Name?: string;
  therapist1Type?: string; // e.g. "Terapi Okupasi (OT)"
  therapist2Id?: string;
  therapist2Name?: string;
  therapist2Type?: string; // e.g. "Terapi Wicara (TW)"
  therapist3Id?: string;
  therapist3Name?: string;
  therapist3Type?: string; // e.g. "Fisioterapi (FT)"
  psychologistId?: string;
  psychologistName?: string;
  psychologistTitle?: string; // e.g. "Psikolog Anak & Perkembangan"
}

export interface AssessmentDocument {
  id: string;
  title: string;
  category: 
    | 'Rujukan Dokter' 
    | 'Hasil Observasi Awal' 
    | 'Formulir Pendaftaran' 
    | 'Dokumen Identitas' 
    | 'Laporan Psikologis' 
    | 'Catatan Klinis Terapis' 
    | 'Lainnya';
  fileName: string;
  fileSize: string;
  fileType: 'pdf' | 'image' | 'doc' | 'file';
  fileUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  notes?: string;
}

export type AssessmentStudentStatus = 
  | 'Menunggu Assessment' 
  | 'Assessment Terjadwal' 
  | 'Sedang Proses' 
  | 'Assessment Selesai' 
  | 'Menjadi Klien Aktif';

export interface AssessmentStudentItem {
  id: string;
  registrationId?: string;
  registrationNumber: string; // e.g. REG-2026-001
  childName: string;
  childNickname?: string;
  birthDate: string; // YYYY-MM-DD
  gender: 'Laki-Laki' | 'Perempuan';
  photoUrl?: string;
  school?: string;
  address?: string;
  parentName: string;
  fatherName?: string;
  motherName?: string;
  whatsapp: string;
  email?: string;
  selectedService: string;
  mainComplaint: string;
  diagnosis?: string;
  interestedServices?: string[];
  status: AssessmentStudentStatus;
  assessmentDate?: string;
  assessmentTime?: string;
  assessmentRoom?: string;
  assessmentNotes?: string;
  team: AssessmentTeamAssignment;
  documents: AssessmentDocument[];
}

export const AVAILABLE_PSYCHOLOGISTS = [
  { id: 'PSY-01', name: 'Dr. Dian Kusumawardhani, Sp.KFR', title: 'Spesialis Kedokteran Fisik & Rehabilitasi / Assessor Klinis' },
  { id: 'PSY-02', name: 'Ibu Nurul Aini, M.Psi, Psikolog', title: 'Psikolog Anak & Perkembangan' },
  { id: 'PSY-03', name: 'Dra. Endang Sulistyowati, M.Psi, Psikolog', title: 'Psikolog Klinis Anak' },
  { id: 'PSY-04', name: 'Rina Anggraini, M.Psi, Psikolog', title: 'Psikolog Pendidikan & Tumbuh Kembang' }
];

export const INITIAL_ASSESSMENT_STUDENTS: AssessmentStudentItem[] = [
  {
    id: 'ASM-2026-001',
    registrationId: 'REG-REC-001',
    registrationNumber: 'REG-2026-001',
    childName: 'Kenzo Rafasya Al-Fatih',
    childNickname: 'Kenzo',
    birthDate: '2021-04-14',
    gender: 'Laki-Laki',
    photoUrl: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80',
    school: 'PAUD Bintang Ceria',
    address: 'Jl. Cenderawasih No. 18, Ciputat, Tangerang Selatan',
    parentName: 'Budi Santoso & Rina Kartika',
    fatherName: 'Budi Santoso',
    motherName: 'Rina Kartika',
    whatsapp: '081234567890',
    email: 'budi.santoso@gmail.com',
    selectedService: 'Assesment Terapi',
    mainComplaint: 'Speech delay (belum bicara 2 kata bermakna pada usia 3 tahun), kontak mata kurang fokus, dan sering tantrum saat keinginannya belum dipahami.',
    diagnosis: 'Suspek Speech Delay & Sensory Processing Issue',
    interestedServices: ['Terapi Okupasi (OT)', 'Terapi Wicara (TW)', 'Sensori Integrasi (SI)'],
    status: 'Assessment Terjadwal',
    assessmentDate: '2026-10-06',
    assessmentTime: '09:00 - 11:30',
    assessmentRoom: 'Ruang Sensori Integrasi & Wicara 1',
    assessmentNotes: 'Mohon tim terapis menyiapkan protokol instrumen artikulasi wicara dan observasi modulasi sensori.',
    team: {
      therapist1Id: 'T1',
      therapist1Name: 'Rilla Serando, S.Tr.Kes',
      therapist1Type: 'Terapi Okupasi (OT)',
      therapist2Id: 'T2',
      therapist2Name: 'Siti Rahmawati, A.Md.TW',
      therapist2Type: 'Terapi Wicara (TW)',
      therapist3Id: 'T3',
      therapist3Name: 'Budi Santoso, S.Ft',
      therapist3Type: 'Fisioterapi (FT)',
      psychologistId: 'PSY-01',
      psychologistName: 'Dr. Dian Kusumawardhani, Sp.KFR',
      psychologistTitle: 'Spesialis Kedokteran Fisik & Rehabilitasi'
    },
    documents: [
      {
        id: 'DOC-KZ-01',
        title: 'Surat Rujukan Dokter Spesialis Anak (Sp.A)',
        category: 'Rujukan Dokter',
        fileName: 'Surat_Rujukan_Dokter_SpA_RS_Hermina.pdf',
        fileSize: '1.2 MB',
        fileType: 'pdf',
        uploadedBy: 'Budi Santoso (Orang Tua)',
        uploadedAt: '2026-09-28 09:15',
        notes: 'Hasil evaluasi tumbuh kembang awal menyarankan asesmen sensori dan wicara di Pelangi Lazuardi.'
      },
      {
        id: 'DOC-KZ-02',
        title: 'Formulir Kuesioner Pra-Asesmen Orang Tua',
        category: 'Formulir Pendaftaran',
        fileName: 'Kuesioner_Pra_Asesmen_OrangTua.pdf',
        fileSize: '850 KB',
        fileType: 'pdf',
        uploadedBy: 'Admin Rina (Pendaftaran)',
        uploadedAt: '2026-09-28 09:30',
        notes: 'Rincian riwayat kehamilan, persalinan, tahapan makan, dan kebiasaan anak di rumah.'
      },
      {
        id: 'DOC-KZ-03',
        title: 'Kartu Keluarga & Akta Kelahiran',
        category: 'Dokumen Identitas',
        fileName: 'KK_Akta_Kenzo_Rafasya.pdf',
        fileSize: '1.1 MB',
        fileType: 'pdf',
        uploadedBy: 'Budi Santoso (Orang Tua)',
        uploadedAt: '2026-09-28 09:20'
      },
      {
        id: 'DOC-KZ-04',
        title: 'Lembar Observasi Sensori Awal',
        category: 'Hasil Observasi Awal',
        fileName: 'Observasi_Sensori_Klinis_Kenzo.pdf',
        fileSize: '620 KB',
        fileType: 'pdf',
        uploadedBy: 'Rilla Serando, S.Tr.Kes (Terapis)',
        uploadedAt: '2026-09-29 11:45',
        notes: 'Catatan skrining awal: hipersensitif terhadap bunyi keras dan vestibular under-responsive.'
      }
    ]
  },
  {
    id: 'ASM-2026-002',
    registrationId: 'REG-REC-002',
    registrationNumber: 'REG-2026-002',
    childName: 'Adriel Djulian Putra Aditya',
    childNickname: 'Adriel',
    birthDate: '2019-08-20',
    gender: 'Laki-Laki',
    photoUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80',
    school: 'SD Lazuardi Inklusif',
    address: 'Kompleks Palem Lestari Blok C2 No. 12, Ciputat',
    parentName: 'Djuliani Djumhani',
    fatherName: 'Aditya Hermawan',
    motherName: 'Djuliani Djumhani',
    whatsapp: '081298765432',
    email: 'djuliani@gmail.com',
    selectedService: 'Assesment Terapi & PSB',
    mainComplaint: 'Evaluasi berkala fokus atensi di kelas inklusi, koordinasi motorik halus saat menulis, dan regulasi emosi mandiri.',
    diagnosis: 'ADHD ringan & Sensory Modulation Difficulty',
    interestedServices: ['Terapi Okupasi (OT)', 'Terapi Wicara (TW)', 'Remedial Terapi'],
    status: 'Sedang Proses',
    assessmentDate: '2026-10-08',
    assessmentTime: '10:00 - 12:30',
    assessmentRoom: 'Ruang Asesmen Multifungsi Lantai 2',
    assessmentNotes: 'Observasi fokus pada ketahanan duduk mandiri 20 menit dan koordinasi bilateral tangan.',
    team: {
      therapist1Id: 'T1',
      therapist1Name: 'Rilla Serando, S.Tr.Kes',
      therapist1Type: 'Terapi Okupasi (OT)',
      therapist2Id: 'T2',
      therapist2Name: 'Siti Rahmawati, A.Md.TW',
      therapist2Type: 'Terapi Wicara (TW)',
      therapist3Id: 'T4',
      therapist3Name: 'Ahmad Fauzi, S.Pd',
      therapist3Type: 'Remedial Terapi',
      psychologistId: 'PSY-02',
      psychologistName: 'Ibu Nurul Aini, M.Psi, Psikolog',
      psychologistTitle: 'Psikolog Perkembangan Anak'
    },
    documents: [
      {
        id: 'DOC-AD-01',
        title: 'Laporan Pemeriksaan Psikologi Anak',
        category: 'Laporan Psikologis',
        fileName: 'Laporan_Psikologi_Tumbuh_Kembang_Adriel.pdf',
        fileSize: '2.4 MB',
        fileType: 'pdf',
        uploadedBy: 'Ibu Nurul Aini, M.Psi (Psikolog)',
        uploadedAt: '2026-09-25 14:00',
        notes: 'Hasil tes IQ, atensi konsentrasi, dan profil adaptasi sosial di sekolah.'
      },
      {
        id: 'DOC-AD-02',
        title: 'Catatan Observasi Guru Inklusi & Sekolah Asal',
        category: 'Catatan Klinis Terapis',
        fileName: 'Catatan_Observasi_Guru_Sekolah_Adriel.pdf',
        fileSize: '780 KB',
        fileType: 'pdf',
        uploadedBy: 'Djuliani Djumhani (Orang Tua)',
        uploadedAt: '2026-09-26 10:30'
      },
      {
        id: 'DOC-AD-03',
        title: 'Formulir Riwayat Medis & Pendaftaran',
        category: 'Formulir Pendaftaran',
        fileName: 'Formulir_Pendaftaran_Lazuardi_Adriel.pdf',
        fileSize: '950 KB',
        fileType: 'pdf',
        uploadedBy: 'Admin Rina',
        uploadedAt: '2026-09-26 11:00'
      }
    ]
  },
  {
    id: 'ASM-2026-003',
    registrationId: 'REG-REC-003',
    registrationNumber: 'REG-2026-003',
    childName: 'Clarissa Aurelia Putri',
    childNickname: 'Clarissa',
    birthDate: '2022-01-10',
    gender: 'Perempuan',
    photoUrl: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=150&auto=format&fit=crop&q=80',
    school: 'Belum Sekolah',
    address: 'Jl. Merpati Putih No. 45, Bintaro Jaya Sektor 9',
    parentName: 'Hendra Wijaya & Maya Anggraini',
    fatherName: 'Hendra Wijaya',
    motherName: 'Maya Anggraini',
    whatsapp: '081388776655',
    email: 'hendra.wijaya@gmail.com',
    selectedService: 'Assesment Terapi',
    mainComplaint: 'Berjalan jinjit (toe walking), selektif terhadap tekstur makanan padat (picky eater), dan sensitif terhadap sentuhan basah.',
    diagnosis: 'Tactile & Proprioceptive Sensory Processing Disorder',
    interestedServices: ['Terapi Okupasi (OT)', 'Fisioterapi (FT)', 'Sensori Integrasi (SI)'],
    status: 'Menunggu Assessment',
    assessmentDate: '2026-10-12',
    assessmentTime: '08:30 - 10:30',
    assessmentRoom: 'Ruang Sensori Integrasi 2',
    assessmentNotes: 'Dibutuhkan evaluasi gait analysis dan sensori profil untuk telapak kaki dan vestibular.',
    team: {
      therapist1Id: 'T1',
      therapist1Name: 'Rilla Serando, S.Tr.Kes',
      therapist1Type: 'Terapi Okupasi (OT)',
      therapist2Id: 'T3',
      therapist2Name: 'Budi Santoso, S.Ft',
      therapist2Type: 'Fisioterapi (FT)',
      therapist3Id: '',
      therapist3Name: '',
      therapist3Type: '',
      psychologistId: 'PSY-01',
      psychologistName: 'Dr. Dian Kusumawardhani, Sp.KFR',
      psychologistTitle: 'Spesialis Kedokteran Fisik & Rehabilitasi'
    },
    documents: [
      {
        id: 'DOC-CL-01',
        title: 'Surat Pengantar Dokter Spesialis Bedah Ortopedi Anak',
        category: 'Rujukan Dokter',
        fileName: 'Rujukan_Ortopedi_Gait_Analysis.pdf',
        fileSize: '1.4 MB',
        fileType: 'pdf',
        uploadedBy: 'Maya Anggraini (Orang Tua)',
        uploadedAt: '2026-09-27 16:20',
        notes: 'Hasil rontgen tidak ada kelainan struktur tulang, disarankan fisioterapi dan sensory integration.'
      },
      {
        id: 'DOC-CL-02',
        title: 'Foto Observasi Postur Berjalan Jinjit',
        category: 'Hasil Observasi Awal',
        fileName: 'Foto_Observasi_Postur_Clarissa.jpg',
        fileSize: '2.1 MB',
        fileType: 'image',
        uploadedBy: 'Maya Anggraini (Orang Tua)',
        uploadedAt: '2026-09-27 16:30'
      }
    ]
  },
  {
    id: 'ASM-2026-004',
    registrationId: 'REG-REC-004',
    registrationNumber: 'REG-2026-004',
    childName: 'Muhammad Fathir Arkan',
    childNickname: 'Fathir',
    birthDate: '2020-05-15',
    gender: 'Laki-Laki',
    photoUrl: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80',
    school: 'TK Islam Al-Azhar Bintaro',
    address: 'Jl. Melati Raya No. 9, Rempoa, Tangerang Selatan',
    parentName: 'Dian Prasetyo & Dewi Sartika',
    fatherName: 'Dian Prasetyo',
    motherName: 'Dewi Sartika',
    whatsapp: '081577889900',
    email: 'dian.prasetyo@yahoo.com',
    selectedService: 'Assesment Terapi',
    mainComplaint: 'Kesulitan pengucapan huruf r, s, dan k (artikulasi tidak jelas), serta pemalu saat diminta berbicara di depan kelas.',
    diagnosis: 'Articulatory Speech Disorder',
    interestedServices: ['Terapi Wicara (TW)', 'Terapi Okupasi (OT)'],
    status: 'Assessment Selesai',
    assessmentDate: '2026-09-27',
    assessmentTime: '08:30 - 11:00',
    assessmentRoom: 'Ruang Wicara 2',
    assessmentNotes: 'Asesmen telah rampung. Rekomendasi 2x sesi Terapi Wicara dan 1x Okupasi Terapi per minggu.',
    team: {
      therapist1Id: 'T2',
      therapist1Name: 'Siti Rahmawati, A.Md.TW',
      therapist1Type: 'Terapi Wicara (TW)',
      therapist2Id: 'T1',
      therapist2Name: 'Rilla Serando, S.Tr.Kes',
      therapist2Type: 'Terapi Okupasi (OT)',
      therapist3Id: 'T4',
      therapist3Name: 'Ahmad Fauzi, S.Pd',
      therapist3Type: 'Remedial Terapi',
      psychologistId: 'PSY-02',
      psychologistName: 'Ibu Nurul Aini, M.Psi, Psikolog',
      psychologistTitle: 'Psikolog Perkembangan Anak'
    },
    documents: [
      {
        id: 'DOC-FT-01',
        title: 'Hasil Evaluasi Artikulasi & Organ Bicara Lengkap',
        category: 'Catatan Klinis Terapis',
        fileName: 'Hasil_Asesmen_Artikulasi_Wicara_Fathir.pdf',
        fileSize: '3.1 MB',
        fileType: 'pdf',
        uploadedBy: 'Siti Rahmawati, A.Md.TW (Terapis Wicara)',
        uploadedAt: '2026-09-27 12:00',
        notes: 'Oral motor baik, kesulitan pada posisi lidah saat pelafalan fonem alveolar dan velar.'
      },
      {
        id: 'DOC-FT-02',
        title: 'Laporan Rekomendasi Intervensi Klinis',
        category: 'Laporan Psikologis',
        fileName: 'Laporan_Rekomendasi_Intervensi_TW_OT_Fathir.pdf',
        fileSize: '1.8 MB',
        fileType: 'pdf',
        uploadedBy: 'Ibu Nurul Aini, M.Psi (Psikolog)',
        uploadedAt: '2026-09-27 14:30'
      },
      {
        id: 'DOC-FT-03',
        title: 'Akta Kelahiran & Kartu Keluarga',
        category: 'Dokumen Identitas',
        fileName: 'Akta_KK_Muhammad_Fathir.pdf',
        fileSize: '920 KB',
        fileType: 'pdf',
        uploadedBy: 'Dewi Sartika (Orang Tua)',
        uploadedAt: '2026-09-26 15:00'
      }
    ]
  }
];

const STORAGE_KEY = 'pelangi_assessment_students_v2';

export const getStoredAssessmentStudents = (): AssessmentStudentItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_ASSESSMENT_STUDENTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ASSESSMENT_STUDENTS;
  } catch (e) {
    console.error('Error reading assessment students from storage:', e);
    return INITIAL_ASSESSMENT_STUDENTS;
  }
};

export const saveStoredAssessmentStudents = (items: AssessmentStudentItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving assessment students to storage:', e);
  }
};

/**
 * Synchronize assessment students list with registration records
 * Ensures any registered child who needs assessment appears in Assessment Anak
 */
export const syncAssessmentWithRegistrations = (
  currentAssessments: AssessmentStudentItem[],
  registrations: RegistrationRecord[]
): AssessmentStudentItem[] => {
  const existingMap = new Map<string, AssessmentStudentItem>();
  currentAssessments.forEach(item => {
    if (item.registrationId) existingMap.set(item.registrationId, item);
    existingMap.set(item.registrationNumber, item);
  });

  const updatedList = [...currentAssessments];

  registrations.forEach(reg => {
    const exists = existingMap.get(reg.id) || existingMap.get(reg.registrationNumber);
    if (!exists) {
      // Map registration status to assessment status
      let asmStatus: AssessmentStudentStatus = 'Menunggu Assessment';
      if (reg.status === 'Assessment Terjadwal') asmStatus = 'Assessment Terjadwal';
      else if (reg.status === 'Assessment Selesai') asmStatus = 'Assessment Selesai';
      else if (reg.status === 'Menjadi Klien Aktif') asmStatus = 'Menjadi Klien Aktif';

      const newAsmItem: AssessmentStudentItem = {
        id: `ASM-${reg.registrationNumber || reg.id}`,
        registrationId: reg.id,
        registrationNumber: reg.registrationNumber || `REG-${reg.id.slice(-4)}`,
        childName: reg.childName,
        childNickname: reg.childNickname,
        birthDate: reg.birthDate,
        gender: reg.gender,
        photoUrl: 'https://images.unsplash.com/photo-1543332164-6e82f355badc?w=150&auto=format&fit=crop&q=80',
        school: reg.school,
        address: reg.address,
        parentName: reg.parentName || `${reg.fatherName || ''} & ${reg.motherName || ''}`.trim(),
        fatherName: reg.fatherName,
        motherName: reg.motherName,
        whatsapp: reg.whatsapp,
        email: reg.email,
        selectedService: reg.selectedService || 'Assesment Terapi',
        mainComplaint: reg.mainComplaint || 'Memerlukan asesmen tumbuh kembang awal.',
        diagnosis: reg.diagnosis,
        interestedServices: reg.interestedServices || ['Terapi Okupasi (OT)', 'Terapi Wicara (TW)'],
        status: asmStatus,
        assessmentDate: reg.assessmentDate,
        assessmentTime: reg.assessmentTime,
        assessmentRoom: reg.assessmentRoom,
        assessmentNotes: reg.assessmentNotes,
        team: {
          therapist1Id: reg.assessmentTherapistId,
          therapist1Name: reg.assessmentTherapistName,
          therapist1Type: 'Terapi Okupasi (OT)',
          therapist2Id: '',
          therapist2Name: '',
          therapist2Type: '',
          therapist3Id: '',
          therapist3Name: '',
          therapist3Type: '',
          psychologistId: 'PSY-01',
          psychologistName: 'Dr. Dian Kusumawardhani, Sp.KFR',
          psychologistTitle: 'Spesialis Kedokteran Fisik & Rehabilitasi'
        },
        documents: [
          {
            id: `DOC-${reg.id}-REG`,
            title: 'Formulir Registrasi Calon Klien Baru',
            category: 'Formulir Pendaftaran',
            fileName: `Formulir_Pendaftaran_${reg.childName.replace(/\s+/g, '_')}.pdf`,
            fileSize: '850 KB',
            fileType: 'pdf',
            uploadedBy: 'Admin Pendaftaran',
            uploadedAt: reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString('id-ID') : 'Hari ini',
            notes: 'Data identitas, riwayat persalinan, dan keluhan awal dari formulir registrasi.'
          }
        ]
      };

      updatedList.push(newAsmItem);
    }
  });

  return updatedList;
};

export const ASSESSMENT_TIME_PRESETS = [
  { label: 'Pagi 1 (08:30 - 10:00 WIB)', value: '08:30 - 10:00 WIB', duration: '1.5 Jam' },
  { label: 'Pagi 2 (09:00 - 11:30 WIB)', value: '09:00 - 11:30 WIB', duration: '2.5 Jam' },
  { label: 'Siang 1 (10:00 - 12:30 WIB)', value: '10:00 - 12:30 WIB', duration: '2.5 Jam' },
  { label: 'Siang 2 (13:00 - 15:30 WIB)', value: '13:00 - 15:30 WIB', duration: '2.5 Jam' },
  { label: 'Sore (15:30 - 17:00 WIB)', value: '15:30 - 17:00 WIB', duration: '1.5 Jam' }
];

export const ASSESSMENT_ROOM_PRESETS = [
  'Ruang Sensori Integrasi & Wicara 1',
  'Ruang Sensori Integrasi 2',
  'Ruang Terapi Wicara 2',
  'Ruang Observasi Psikologi',
  'Ruang Asesmen Multifungsi Lt. 2',
  'Klinik Fisioterapi & Sensori'
];

export interface FormattedAssessmentSchedule {
  dayName: string;
  formattedDate: string;
  shortFormattedDate: string;
  timeText: string;
  durationText: string;
  roomText: string;
  relativeLabel: string;
  relativeBg: string;
  isScheduled: boolean;
}

export const formatAssessmentSchedule = (
  dateStr?: string,
  timeStr?: string,
  roomStr?: string
): FormattedAssessmentSchedule => {
  if (!dateStr) {
    return {
      dayName: '-',
      formattedDate: 'Belum Terjadwal',
      shortFormattedDate: 'Belum Terjadwal',
      timeText: timeStr || 'Waktu Belum Ditentukan',
      durationText: '-',
      roomText: roomStr || 'Ruangan Belum Ditentukan',
      relativeLabel: 'Belum Ada Jadwal',
      relativeBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      isScheduled: false
    };
  }

  try {
    const d = new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) {
      return {
        dayName: '-',
        formattedDate: dateStr,
        shortFormattedDate: dateStr,
        timeText: timeStr || '09:00 - 11:30 WIB',
        durationText: '2.5 Jam',
        roomText: roomStr || 'Ruang Asesmen',
        relativeLabel: 'Jadwal Manual',
        relativeBg: 'bg-slate-800 text-slate-300',
        isScheduled: true
      };
    }

    const dayName = d.toLocaleDateString('id-ID', { weekday: 'long' });
    const formattedDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const shortFormattedDate = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    // Calculate relative badge
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(d);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let relativeLabel = 'Mendatang';
    let relativeBg = 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';

    if (diffDays === 0) {
      relativeLabel = 'HARI INI';
      relativeBg = 'bg-rose-500 text-white font-black animate-pulse';
    } else if (diffDays === 1) {
      relativeLabel = 'BESOK';
      relativeBg = 'bg-amber-500 text-slate-950 font-black';
    } else if (diffDays > 1 && diffDays <= 7) {
      relativeLabel = `${diffDays} Hari Lagi`;
      relativeBg = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
    } else if (diffDays < 0) {
      relativeLabel = 'Telah Selesai';
      relativeBg = 'bg-slate-800 text-slate-400 border border-slate-700';
    }

    // Estimate duration from string (e.g. "09:00 - 11:30")
    let durationText = '2.5 Jam (150 Menit)';
    if (timeStr && timeStr.includes('-')) {
      const parts = timeStr.split('-');
      const startParts = parts[0].trim().replace(/[^\d:]/g, '').split(':');
      const endParts = parts[1].trim().replace(/[^\d:]/g, '').split(':');
      if (startParts.length === 2 && endParts.length === 2) {
        const startMin = parseInt(startParts[0], 10) * 60 + parseInt(startParts[1], 10);
        const endMin = parseInt(endParts[0], 10) * 60 + parseInt(endParts[1], 10);
        const diffMin = endMin - startMin;
        if (diffMin > 0) {
          const hours = (diffMin / 60).toFixed(1).replace('.0', '');
          durationText = `${hours} Jam (${diffMin} Menit)`;
        }
      }
    }

    const cleanTime = timeStr ? (timeStr.includes('WIB') ? timeStr : `${timeStr} WIB`) : '09:00 - 11:30 WIB';

    return {
      dayName,
      formattedDate,
      shortFormattedDate,
      timeText: cleanTime,
      durationText,
      roomText: roomStr || 'Ruang Asesmen Multifungsi',
      relativeLabel,
      relativeBg,
      isScheduled: true
    };
  } catch {
    return {
      dayName: '-',
      formattedDate: dateStr,
      shortFormattedDate: dateStr,
      timeText: timeStr || 'Waktu Belum Ditentukan',
      durationText: '-',
      roomText: roomStr || 'Ruang Asesmen',
      relativeLabel: 'Terjadwal',
      relativeBg: 'bg-slate-800 text-slate-300',
      isScheduled: true
    };
  }
};

