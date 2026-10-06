
import React from 'react';

export type View = 
  | 'dashboard' 
  | 'registrasi'
  | 'manajemenAnak' 
  | 'papanJadwal' 
  | 'assesmentAnak' 
  | 'manajemenTerapis' 
  | 'laporanPerkembangan' 
  | 'rekapPerkembangan' 
  | 'laporanKeuangan' 
  | 'laporanPemasukan' 
  | 'tagihan' 
  | 'tinjauanMingguan' 
  | 'laporanAssesment' 
  | 'pengaturan' 
  | 'manajemenPengguna' 
  | 'rekapKehadiran' 
  | 'balancedScorecard' 
  | 'strategicPlan' 
  | 'pusatLaporan' 
  | 'bukuCatatanTerapi' 
  | 'rapot' 
  | 'programTerapi' 
  | 'peraturanTerapi' 
  | 'pendaftaranTamu' 
  | 'daftarTamu'
  | 'rekomendasiProgram'
  | 'kehadiranTerapis'
  | 'piutang'
  | 'rolePermission'
  | 'masterData'
  | 'dashboardManager'
  | 'editMenu'
  | 'dokumenSiswa'
  | 'googleWorkspace';

export type UserRole = 
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'terapis'
  | 'siswa'
  | 'orang_tua'
  | 'keuangan'
  | 'assessor'
  | 'guest'
  | string 
  | null;

export interface DataPermission {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  print: boolean;
  approve: boolean;
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  color: string;
  badgeBg: string;
  badgeText: string;
  allowedMenus: View[];
  dataPermissions: {
    [moduleKey: string]: DataPermission;
  };
}

export interface UserAccount {
  id: string;
  fullName: string;
  displayName?: string;
  username: string;
  email: string;
  phone: string;
  role: string; // Role id
  status: 'Aktif' | 'Nonaktif';
  photoUrl?: string;
  password?: string;
  createdAt: string;
  lastLogin?: string;
  linkedEntityId?: string; // e.g. childId or therapistId
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  actionType: 'LOGIN' | 'CREATE' | 'UPDATE' | 'DELETE' | 'PERMISSION_CHANGE' | 'PASSWORD_RESET' | 'STATUS_CHANGE';
  description: string;
  target?: string;
  timestamp: string;
  ipAddress?: string;
}

export interface TherapistReply {
  id: string;
  commentId: string;
  therapistId: string;
  therapistName: string;
  therapistPhoto?: string;
  reply: string;
  createdAt: string;
}

export interface ParentComment {
  id: string;
  therapyNoteId: string;
  sessionId?: string;
  sessionDate: string;
  therapyType?: string;
  therapistId?: string;
  parentId: string;
  parentName: string;
  parentPhoto?: string;
  studentId: string;
  studentName: string;
  comment?: string;
  homeCondition?: string; // Kondisi Anak di Rumah
  visibleProgress?: string; // Perkembangan yang Terlihat
  home_progress?: string; // Database alias
  homeActivities?: string; // Aktivitas yang Sudah Dilakukan di Rumah
  activities_done?: string; // Database alias
  question?: string; // Pertanyaan untuk Terapis
  rating: number; // 1 - 5
  attachments?: string[];
  attachment?: string;
  status: 'Menunggu Tanggapan Orang Tua' | 'Menunggu Tanggapan' | 'Sudah Dibalas' | 'Draft';
  isDraft?: boolean;
  createdAt: string;
  replies: TherapistReply[];
}

export interface MenuItem {
  id: View;
  label: string;
  Icon: React.FC<{ className?: string }>;
  group: number;
}
// ... rest of the file remains same
export interface HeaderMenuItem {
  id: string;
  label: string;
  href: string;
  isExternal?: boolean;
}

export enum AttendanceStatus {
  PRESENT = 'Hadir',
  ABSENT = 'Absen',
  PERMIT = 'Izin',
  PENDING = 'Menunggu',
}

export enum AssessmentStatus {
  NOT_ASSESSED = 'Belum Dinilai',
  IN_PROGRESS = 'Proses',
  COMPLETED = 'Selesai',
}

export interface TherapyDefinition {
  id: string;
  name: string;
  Icon: React.FC<{ className?: string }>;
  color: string;
}

export interface DetailedProgress {
  interventionPrograms: Array<{ label: string; checked: boolean }>;
  exerciseProgress: Array<{ label: string; checked: boolean }>;
  functionalActivities: Array<{ activity: string; independence: string; accuracy: string }>;
  weaknessObservations: Array<{ label: string; checked: boolean }>;
  responseToIntervention?: string;
}

export interface TherapySession {
  id: string;
  type: string; 
  therapistId: string; // Changed from therapist: string
  time: string;
  status: AttendanceStatus;
  note?: string;
  sessionGoal?: string; // Tujuan Sesi
  sessionActivities?: string; // Aktivitas yang Dilakukan
  sessionOutcome?: string; // Hasil Terapi
  childProgress?: string; // Progress Anak
  sessionObstacles?: string; // Kendala yang Ditemukan
  nextTarget?: string; // Target Berikutnya
  homeSuggestions?: string; // Saran Aktivitas di Rumah
  activitiesDone?: string; // Alias for sessionActivities
  therapyResult?: string; // Alias for sessionOutcome
  obstaclesFound?: string; // Alias for sessionObstacles
  homeActivityAdvice?: string; // Alias for homeSuggestions
  photoUrls?: string[];
  audioUrl?: string; // Voice note audio recording data/URL
  audioDuration?: number; // Duration in seconds
  detailedProgress?: DetailedProgress;
}

export interface RecurringSession {
  day: string;
  time: string;
  type: string; 
  therapistId?: string;
  note?: string;
}

export interface Child {
  id: string;
  name: string;
  photoUrl: string;
  sessions: TherapySession[];
  recurringSessions?: RecurringSession[];
  assessmentStatus: AssessmentStatus;
  // New user fields
  username?: string;
  password?: string;
  // Fields from PDF for convenience
  birthDate?: string; // YYYY-MM-DD
  gender?: 'Laki-Laki' | 'Perempuan';
  className?: string; // e.g., '3 MWS'
  parentName?: string;
  motherName?: string;
  address?: string;
  religion?: string;
  phone?: string;
  originSchool?: string;
  referredBy?: string;
  paymentHistory?: { [monthYear: string]: 'Lunas' | 'Belum Lunas' };
  status?: 'Aktif' | 'Non-Aktif';
  inactivityReason?: string;
  diagnosis?: string;
  primaryTherapistId?: string;
  activePrograms?: string[];
  attendanceRateThisMonth?: number;
}

export interface TherapistScheduleDay {
  day: string; // 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'
  active: boolean;
  startTime?: string; // e.g. '08:00'
  endTime?: string;   // e.g. '16:00'
  timeSlots?: string[]; // e.g. ['08:00 - 09:00', '09:00 - 10:00']
  room?: string;      // e.g. 'Ruang Wicara 1'
}

export interface Therapist {
  id: string;
  name: string;
  photoUrl: string;
  specialties: string[]; // Array of therapy type IDs
  username?: string;
  password?: string;
  title?: string; // e.g. 'S.Tr.Kes', 'Spesialis Okupasi Terapi'
  phone?: string;
  email?: string;
  status?: 'Aktif' | 'Cuti' | 'Nonaktif';
  workingDays?: string[]; // e.g. ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
  scheduleDays?: TherapistScheduleDay[];
  defaultRoom?: string;
  maxClientsPerDay?: number;
  bio?: string;
  joinedDate?: string;
}

export interface TherapyRecommendation {
    therapyId: string;
    notes: string;
}

// NEW - Detailed Assessment Report Structures based on PDF

// --- Occupational Therapy ---
export interface OTGeneralObservation {
  reactionToExaminer: string;
  reactionToExamination: string;
  conspicuousBehavior: string;
  desireSpirit: string;
}

export type OTResponse = 'Kurang' | 'Sesuai' | 'Lebih' | '';

export interface OTSensoryModulationItem {
  response: OTResponse;
  comment: string;
}

export interface OTSensoryModulation {
  tactile: OTSensoryModulationItem;
  proprioceptive: OTSensoryModulationItem;
  vestibular: OTSensoryModulationItem;
  auditory: OTSensoryModulationItem;
  visual: OTSensoryModulationItem;
}

export interface OTCombinedSensory {
  performance: string;
  comment: string;
}

export interface OTFedc {
  regulationAndAttention: string;
  engagementAndRelating: string;
  purposefulCommunication: string;
  complexCommunication: string;
  creativeAndMeaningful: string;
  buildingLogicalBridges: string;
}

export interface OTInterventionChecklist {
  [key: string]: boolean;
}

export interface PSBTier1 {
  multiModalTeaching?: boolean;
  multiModalTeachingNotes?: string;
  zoneOfRegulation?: boolean;
  flexibleSeating?: boolean;
  descriptiveLanguage?: boolean;
  visualAids?: boolean;
  manipulatives?: boolean;
  simulations?: boolean;
  rolePlaying?: boolean;
  wholeClassMovement?: boolean;
}

export interface PSBTier2 {
  teachersImplementClassroomStrategies?: boolean;
  teachersImplementClassroomStrategiesNotes?: string;
  behaviorStrategies?: boolean;
  pemantauanPerilaku?: boolean;
  intervensiKelompokKecil?: boolean;
  penugasanMentorDewasa?: boolean;
  bimbinganAkademikTambahan?: boolean;
  upayaKhususMenangkapSiswaBerperilakuBaik?: boolean;
}

export interface PSBTier3 {
  otAssessmentIndividualStrategies?: boolean;
  otAssessmentIndividualStrategiesNotes?: string;
  oneOneInteraction?: boolean;
  consultationWithTeamMembers?: boolean;
  penilaianPerilakuFungsional?: boolean;
  konselingIndividu?: boolean;
  penempatanPerawatanKelasKhusus?: boolean;
  terapiKesehatanMental?: boolean;
}

export interface PSBTier4 {
  multipleNeeds?: boolean;
  multipleNeedsNotes?: string;
  changePlaces?: boolean;
  dukunganAkademikIndividualIntensif?: boolean;
  pengajaranKeterampilanSosialIndividuIntensif?: boolean;
  rencanaManajemenPerilakuIndividu?: boolean;
  pelatihanDanKerjasamaOrangTua?: boolean;
  kolaborasiMultiLembaga?: boolean;
  alternatifLainPositiveDiscipline?: boolean;
  pembelajaranKomunitasDanLayanan?: boolean;
}

export interface PSBData {
  tier1?: PSBTier1;
  tier2?: PSBTier2;
  tier3?: PSBTier3;
  tier4?: PSBTier4;
}

export interface OccupationalTherapyReport {
  examinerName: string; 
  examinationNumber: number; 
  examinationDate1?: string;
  examinationDate2?: string;
  examinationDate3?: string;
  examinationDate4?: string;
  referredBy: string; 
  generalObservation: OTGeneralObservation;
  sensoryModulation: OTSensoryModulation;
  combinedSensory: OTCombinedSensory;
  fedc: OTFedc;
  occupationalArea: OTInterventionChecklist;
  performanceSkills: OTInterventionChecklist;
  bodyFunction: OTInterventionChecklist;
  outcome: OTInterventionChecklist;
  interventionMethods?: {
    preparationAndTask: boolean;
    educationAndTraining: boolean;
    advocacy: boolean;
    groupIntervention: boolean;
  };
  interventionFrequency: string;
  programDuration: string;
  recommendation?: string;
  psb?: PSBData;
}

// --- Speech Therapy ---
export interface STAbilities {
  motorikKasar: boolean | null;
  motorikHalus: boolean | null;
  visualMotorCoordination: boolean | null;
  motorikComment: string;
  
  penglihatan: boolean | null;
  pendengaran: boolean | null;
  taktilKinestetik: boolean | null;
  sensorikComment: string;

  reseptif: boolean | null;
  ekspresif: boolean | null;
  bahasaComment: string;

  bunyi: boolean | null;
  fonem: boolean | null;
  wicaraComment: string;

  pernafasan: boolean | null;
  penyaringan: boolean | null;
  nada: boolean | null;
  suaraComment: string;

  iramaNada: boolean | null;
  kecepatanBicara: boolean | null;
  iramaComment: string;

  organMulut: boolean | null;
  sikat: boolean | null;
  gerakanBibir: boolean | null;
  gerakanLidah: boolean | null;
  gerakanKunyah: boolean | null;
  hisap: boolean | null;
  tiup: boolean | null;
  kembungPipi: boolean | null;
  batuk: boolean | null;
  reflekMuntah: boolean | null;
  menelanComment: string;
}

export interface SpeechTherapyReport {
  examinerName: string;
  examinationDate: string;
  parentPhoneNumber: string;
  religion: string;
  originSchool: string;
  examinationPurpose: string;
  generalOverview: string;
  abilities: STAbilities;
  recommendation: string;
  psb?: PSBData;
}

// --- Remedial Therapy ---
export interface RemedialGoalItem {
  id: string;
  awal: string;
  tujuan: string;
  hasil: string;
}

export interface RemedialSection {
  targetDate: string;
  items: RemedialGoalItem[];
  comment: string;
}

export interface RemedialTherapyReport {
  examinerName: string;
  examinationDate: string;
  academicSkills: RemedialSection;
  languageLiteracySkills: RemedialSection;
  writingSkills: RemedialSection;
  focusConcentrationSkills: RemedialSection;
  followUp: string[];
}

// --- Physiotherapy ---
export interface PhysioResponsePair {
  teramati: boolean;
  tidak: boolean;
}

export interface PhysioAwalHasil<T> {
  awal: T;
  hasil: T;
}

export interface PhysioGeneralBehavior {
  interaction: PhysioAwalHasil<PhysioResponsePair>;
  followCommand: PhysioAwalHasil<PhysioResponsePair>;
  exploration: PhysioAwalHasil<PhysioResponsePair>;
  emotionalIdea: PhysioAwalHasil<PhysioResponsePair>;
  organizeBehavior: PhysioAwalHasil<PhysioResponsePair>;
  comment: string;
}

export type PhysioModulationLevel = 'B' | 'S' | 'K' | 'BR' | '';

export interface PhysioModulationItem {
  type: string;
  awal: PhysioModulationLevel;
  hasil: PhysioModulationLevel;
}

export interface PhysioSensoryModulation {
  items: PhysioModulationItem[];
  comment: string;
}

export type PhysioMotorLevel = 'MD' | 'SD' | 'TD' | '';

export interface PhysioMotorItem {
  activity: string;
  awal: PhysioMotorLevel;
  hasil: PhysioMotorLevel;
}

export interface PhysioMotorSkills {
  grossMotor: PhysioMotorItem[];
  fineMotor: PhysioMotorItem[];
  comment: string;
}

export type PhysioGMFMLevel = 0 | 1 | 2 | 3 | null;

export interface PhysioGMFMItem {
  activity: string;
  awal: PhysioGMFMLevel;
  hasil: PhysioGMFMLevel;
}

export interface PhysioPhysicalFunctional {
  gmfm: PhysioGMFMItem[];
  sensoryIntegration: PhysioGMFMItem[];
  comment: string;
}

export interface PhysioHomeProgramItem {
  activity: string;
  frequency: string;
  duration: string;
}

export interface PhysiotherapyReport {
  examinerName: string;
  examinationDate: string;
  generalBehavior: PhysioGeneralBehavior;
  sensoryModulation: PhysioSensoryModulation;
  motorSkills: PhysioMotorSkills;
  physicalFunctional: PhysioPhysicalFunctional;
  followUp: string[];
  homeProgram: PhysioHomeProgramItem[];
}

// --- Main Assessment Report ---
export interface AssessmentReport {
  id: string;
  childId: string; // Can be empty if manual entry
  assessmentDate: string; // Main date for the report set
  
  // Snapshot data for student details (allows manual entry and historical accuracy)
  studentName: string;
  studentBirthDate?: string;
  studentGender?: 'Laki-Laki' | 'Perempuan';
  studentClass?: string;
  studentParentName?: string;
  studentMotherName?: string;
  studentAddress?: string;
  studentReligion?: string;
  studentPhone?: string;
  studentOriginSchool?: string;
  referredBy?: string;

  occupationalTherapy?: OccupationalTherapyReport;
  speechTherapy?: SpeechTherapyReport;
  remedialTherapy?: RemedialTherapyReport;
  physiotherapy?: PhysiotherapyReport;
}


export interface WeeklyData {
  day: string;
  [key: string]: number | string; // Dynamic keys for therapy types
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    '--color-background': string;
    '--color-surface': string;
    '--color-surface-light': string;
    '--color-primary': string;
    '--color-primary-light': string;
    '--color-primary-dark': string;
    '--color-secondary': string;
    '--color-accent': string;
    '--color-muted': string;
    '--color-success': string;
    '--color-danger': string;
    '--color-warning': string;
    '--color-text-base': string;
    '--color-text-heading': string;
    '--color-text-muted': string;
  };
}

export interface GradientSettings {
  enabled: boolean;
  color1: string;
  color2: string;
  useColor3: boolean;
  color3: string;
}

export interface ExpenseDetail {
  id: string;
  category: string;
  description: string;
  amount: number;
}

export interface FinancialRecord {
  month: string;
  income: number;
  expense: number;
  expenseDetails?: ExpenseDetail[];
}

export interface AcademicYear {
  id: string;
  label: string;
}

export interface IncomeDetail {
  id: string;
  source: string; // e.g. SPP, Pangkal
  description: string;
  amount: number;
}

export interface IncomeRecord {
  month: string;
  income: number;
  incomeDetails?: IncomeDetail[];
}

export type StrategicStatus = 'Not Started' | 'On Progress' | 'Done' | 'Pending';

export interface StrategicArtifact {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'document' | 'link';
  url: string; // Base64 data URL, image URL, or external link
  fileName?: string;
  fileSize?: string;
  uploadDate: string;
  notes?: string;
  uploaderName?: string;
}

export interface StrategicItem {
  id: string;
  category: string; // e.g. 'Layanan & Mutu Klinis', 'SDM & Sertifikasi', 'Sarana & Ruang Sensori', 'Kurikulum & Home Program', 'Kemitraan & Humas', 'Keuangan'
  program: string; // Program Kerja
  kpi: string; // Indikator Keberhasilan (KPI)
  pic: string; // Penanggung Jawab
  timeline: string; // Waktu Pelaksanaan
  progress: number; // 0-100
  status: StrategicStatus;
  notes: string; // Keterangan Tambahan
  budget?: number; // Anggaran yang dialokasikan (IDR)
  targetCompletionDate?: string; // Tanggal target selesai
  artifacts?: StrategicArtifact[]; // Bukti fisik / artefak dokumen pendukung
}

export interface StrategicYearData {
  year: string;
  items: StrategicItem[];
}

export interface TherapyProgram {
  id: string;
  childId: string;
  items: TherapyProgramItem[];
  lastUpdated: string;
}

export type TherapyProgramCategory = 'OT' | 'TW' | 'REM' | 'FT' | 'HT' | 'BERKUDA' | (string & {});

export interface TherapyProgramCategoryConfig {
  id: string;
  label: string;
  color: string;
  badgeBg?: string;
  badgeText?: string;
  isCustom?: boolean;
}

export interface TherapyProgramItem {
  id: string;
  therapyType: TherapyProgramCategory;
  targetWaktu: string;
  targetTerapi: string;
  aktifitasTerapi: string;
  keterangan: string;
  progres?: string;
}

export interface RapotArchiveFolder {
  id: string;
  name: string;
  timestamp: number;
}

export interface RapotArchiveItem {
  id: string;
  fileName: string; // e.g., "Ahmad Fauzan - 24-09-2026 - 09.35.pdf"
  childName: string;
  childId: string;
  date?: string;
  saveDate: string; // "24-09-2026"
  saveTime: string; // "09.35"
  timestamp: number;
  type: 'OT' | 'TW' | 'REMEDIAL' | 'FT' | 'HT' | 'BERKUDA' | string;
  period: 'Jan-Jun' | 'Jul-Des' | string;
  year: number;
  folderId: string | null;
  data: any;
  managerComment?: string;
}

export type RegistrationStatus = 
  | 'Registrasi Baru'
  | 'Menunggu Follow Up'
  | 'Sudah Dihubungi'
  | 'Menunggu Assessment'
  | 'Assessment Terjadwal'
  | 'Assessment Selesai'
  | 'Menjadi Klien Aktif'
  | 'Ditutup';

export interface RegistrationDocumentItem {
  name: string;
  status: 'Tersedia' | 'Belum Ada';
  fileName?: string;
  fileSize?: string;
  uploadDate?: string;
}

export interface RegistrationRecord {
  id: string;
  registrationNumber: string; // e.g. REG-2026-001
  registrationDate: string; // ISO date string
  status: RegistrationStatus;
  
  // Data Anak
  childName: string;
  childNickname?: string;
  birthDate: string; // YYYY-MM-DD
  gender: 'Laki-Laki' | 'Perempuan';
  school?: string;
  address: string;
  
  // Data Orang Tua
  fatherName: string;
  motherName: string;
  parentName?: string;
  whatsapp: string;
  email?: string;
  
  // Informasi Awal
  selectedService: string; // Assesment Terapi, Assesment PSB, Psikolog, dll.
  mainComplaint: string; // Keluhan Utama
  diagnosis?: string;
  therapyHistory?: string; // Riwayat Terapi
  interestedServices?: string[];
  referralSource?: string; // Instagram, Website, Google, Referensi, Rekomendasi Dokter, dll.
  
  // Petugas & Penjadwalan
  followUpOfficer?: string; // e.g. "Admin Rina"
  followUpNotes?: string;
  followUpDate?: string;
  assessmentDate?: string; // YYYY-MM-DD
  assessmentTime?: string; // e.g. "09:00 - 10:00"
  assessmentTherapistId?: string;
  assessmentTherapistName?: string;
  assessmentRoom?: string;
  assessmentNotes?: string;
  
  // Dokumen
  documents?: {
    kartuKeluarga?: RegistrationDocumentItem;
    aktaKelahiran?: RegistrationDocumentItem;
    hasilAssessment?: RegistrationDocumentItem;
    suratDiagnosa?: RegistrationDocumentItem;
  };
  
  // Konversi
  convertedClientId?: string;
  convertedDate?: string;
  
  // Data Lengkap Formulir Tamu (12 Langkah Pendaftaran)
  birthHistory?: any;
  developmentHistory?: any;
  healthHistory?: any;
  socialHistory?: any;
  behaviorAnswers?: any;
  learningAnswers?: any;
  emotionAnswers?: any;
  referralDetails?: any;
  sensoryScores?: any;
  observationAnswers?: any;
  siblingsList?: any[];
  rawGuestData?: any;
}

export interface AssessmentTeamAssignment {
  therapist1Id?: string;
  therapist1Name?: string;
  therapist1Type?: string;
  therapist2Id?: string;
  therapist2Name?: string;
  therapist2Type?: string;
  therapist3Id?: string;
  therapist3Name?: string;
  therapist3Type?: string;
  psychologistId?: string;
  psychologistName?: string;
  psychologistTitle?: string;
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
  registrationNumber: string;
  childName: string;
  childNickname?: string;
  birthDate: string;
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

export interface RapotForumMessage {
  id: string;
  studentId: string;
  studentName: string;
  therapyType?: string; // 'OT' | 'TW' | 'Fisioterapi' | 'Remedial' | 'Hydrotherapy' | 'Berkuda' | 'Asesmen Medis'
  category: 'Review Rapot' | 'Konsultasi Kasus' | 'Catatan Klinis' | 'Rekomendasi' | 'Sign-Off Rapot' | 'Umum';
  senderId: string;
  senderName: string;
  senderRole: 'terapis' | 'assessor' | 'manager' | 'admin' | 'super_admin';
  senderRoleLabel: string;
  senderPhoto?: string;
  message: string;
  timestamp: string;
  replyToId?: string;
  replyToSnippet?: string;
  replyToSender?: string;
  reactions?: { [emoji: string]: string[] };
  statusBadge?: string;
  attachments?: string[];
}
