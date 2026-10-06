
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardPage from './components/DashboardPage';
import AttendanceTable from './components/AttendanceTable';
import WeeklyOverviewChart from './components/WeeklyOverviewChart';
import Sidebar from './components/Sidebar';
import ChildManagementPage from './components/ChildManagementPage';
import TherapistManagementPage from './components/TherapistManagementPage';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';
import BillingPage from './components/BillingPage';
import EditSessionModal from './components/EditSessionModal';
import DetailsModal from './components/DetailsModal';
import AttendanceRecapPage from './components/AttendanceRecapPage';
import ProfileModal from './components/ProfileModal';
import FinancialReportPage from './components/FinancialReportPage';
import IncomeReportPage from './components/IncomeReportPage';
import AssessmentPage from './components/AssessmentPage';
import AssessmentReportPage from './components/AssessmentReportPage';
import UserManagementPage from './components/UserManagementPage';
import RolePermissionPage from './components/RolePermissionPage';
import BalancedScorecardPage from './components/BalancedScorecardPage';
import StrategicPlanPage from './components/StrategicPlanPage';
import ReportsHubPage from './components/ReportsHubPage';
import ScheduleBoardPage from './components/ScheduleBoardPage';
import TherapyNoteBookPage from './components/TherapyNoteBookPage';
import RapotPage from './components/RapotPage';
import TherapyProgramPage from './components/TherapyProgramPage';
import TherapyRegulationsPage from './components/TherapyRegulationsPage';
import GuestRegistrationPage from './components/GuestRegistrationPage';
import GuestManagementPage from './components/GuestManagementPage';
import LoginPage from './components/LoginPage';
import OverallProgressPage from './components/OverallProgressPage';
import { RegistrationManagementPage } from './components/RegistrationManagementPage';
import EditMenuPage from './components/EditMenuPage';
import EditMenuIcon from './components/icons/EditMenuIcon';
import { getStoredMenuCustomizations, MenuCustomizationConfig } from './utils/menuCustomizationStorage';
import { Child, AttendanceStatus, WeeklyData, TherapySession, Therapist, TherapyDefinition, Theme, GradientSettings, FinancialRecord, AcademicYear, IncomeRecord, AssessmentStatus, AssessmentReport, MenuItem, View, HeaderMenuItem, UserRole, ExpenseDetail, StrategicYearData, TherapyProgram, DetailedProgress, TherapyProgramCategory, RoleDefinition, RegistrationRecord, UserAccount } from './types';
import { getStoredRoles, getStoredUsers, saveStoredUsers, appendActivityLog, updateUserProfile, updateUserPassword, getInitials } from './utils/rbacStorage';
import { getStoredRegistrations, saveStoredRegistrations, convertGuestDataToRegistration, convertRegistrationToChild } from './utils/registrationStorage';
import { getStoredStrategicPlans } from './utils/strategicStorage';
import { 
  getStoredThemes, 
  saveStoredThemes, 
  getStoredActiveThemeId, 
  saveStoredActiveThemeId, 
  DEFAULT_THEMES 
} from './utils/themeStorage';
import OccupationalTherapyIcon from './components/icons/OccupationalTherapyIcon';
import SpeechTherapyIcon from './components/icons/SpeechTherapyIcon';
import PhysiotherapyIcon from './components/icons/PhysiotherapyIcon';
import RemedialIcon from './components/icons/RemedialIcon';
import HydrotherapyIcon from './components/icons/HydrotherapyIcon';
import EquineTherapyIcon from './components/icons/EquineTherapyIcon';
import DefaultTherapyIcon from './components/icons/DefaultTherapyIcon';
import TherapistIcon from './components/icons/TherapistIcon';
import RecapIcon from './components/icons/RecapIcon';
import FinanceIcon from './components/icons/FinanceIcon';
import IncomeIcon from './components/icons/IncomeIcon';
import AssessmentIcon from './components/icons/AssessmentIcon';
import AssessmentReportIcon from './components/icons/AssessmentReportIcon';
import UserManagementIcon from './components/icons/UserManagementIcon';
import BalancedScorecardIcon from './components/icons/BalancedScorecardIcon';
import StrategicPlanIcon from './components/icons/StrategicPlanIcon';
import ReportsHubIcon from './components/icons/ReportsHubIcon';
import ScheduleIcon from './components/icons/ScheduleIcon';

import { 
  LayoutDashboard, 
  CalendarRange, 
  Users, 
  ClipboardCheck, 
  BookOpen,
  UserCog, 
  UsersRound, 
  BarChart3, 
  Activity, 
  FileText, 
  FileCheck, 
  LineChart, 
  Target, 
  Wallet, 
  Coins, 
  CreditCard, 
  ClipboardList,
  ScrollText,
  UserPlus,
  Sun,
  Moon,
  Bell,
  Menu,
  Shield,
  X,
  ChevronRight,
  FolderArchive,
  Cloud
} from 'lucide-react';
import NotificationCenterModal from './components/NotificationCenterModal';
import { getStoredNotifications, filterNotificationsForUser } from './utils/notificationStorage';
import QuickActionButton from './components/QuickActionButton';
import StudentDocumentsPage from './components/StudentDocumentsPage';
import GoogleWorkspacePage from './components/GoogleWorkspacePage';
import { ensureStudentFoldersExist } from './utils/studentDocumentStorage';

const initialSidebarMenuConfig: MenuItem[] = [
    { id: 'dashboard', label: 'Dasbor', Icon: LayoutDashboard, group: 1 },
    { id: 'googleWorkspace', label: 'Google Drive & Sheets', Icon: Cloud, group: 1 },
    { id: 'registrasi', label: 'Registrasi', Icon: UserPlus, group: 1 },
    { id: 'papanJadwal', label: 'Manajemen Jadwal', Icon: CalendarRange, group: 1 },
    { id: 'manajemenAnak', label: 'Manajemen Anak', Icon: Users, group: 1 },
    { id: 'assesmentAnak', label: 'Assesment Anak', Icon: ClipboardCheck, group: 1 },
    { id: 'bukuCatatanTerapi', label: 'Buku Catatan Terapi', Icon: BookOpen, group: 1 },
    { id: 'programTerapi', label: 'Program Terapi', Icon: ClipboardCheck, group: 1 },
    { id: 'rapot', label: 'Rapot Terapi', Icon: ClipboardList, group: 1 },
    { id: 'dokumenSiswa', label: 'Dokumen Perkembangan Siswa', Icon: FolderArchive, group: 1 },
    { id: 'peraturanTerapi', label: 'Peraturan Terapi', Icon: ScrollText, group: 1 },
    { id: 'daftarTamu', label: 'Daftar Tamu Baru', Icon: UserPlus, group: 1 },
    { id: 'manajemenTerapis', label: 'Manajemen Terapis', Icon: UserCog, group: 1 },
    { id: 'manajemenPengguna', label: 'Manajemen Pengguna', Icon: UsersRound, group: 1 },
    { id: 'pusatLaporan', label: 'Pusat Laporan', Icon: BarChart3, group: 2 },
    { id: 'laporanPerkembangan', label: 'Laporan Perkembangan', Icon: FileText, group: 2 },
    { id: 'rekapPerkembangan', label: 'Pusat Perkembangan Siswa', Icon: Activity, group: 2 },
    { id: 'laporanAssesment', label: 'Hasil Assesment', Icon: FileCheck, group: 2 },
    { id: 'balancedScorecard', label: 'Balanced Scorecard', Icon: LineChart, group: 2 },
    { id: 'strategicPlan', label: 'Strategic Plan', Icon: Target, group: 2 },
    { id: 'laporanKeuangan', label: 'Laporan Keuangan', Icon: Wallet, group: 2 },
    { id: 'tagihan', label: 'Tagihan', Icon: CreditCard, group: 2 },
    { id: 'rekapKehadiran', label: 'Rekap Kehadiran', Icon: ClipboardList, group: 2 },
];

const initialHeaderMenuConfig: HeaderMenuItem[] = [
    { id: 'beranda', label: 'Beranda', href: '#', isExternal: false },
    { id: 'tentang', label: 'Tentang Kami', href: 'https://lazuardi.sch.id/pelangi/', isExternal: true },
    { id: 'program', label: 'Program', href: '#', isExternal: false },
    { id: 'kontak', label: 'Kontak', href: '#', isExternal: false },
];


type MasterChild = Omit<Child, 'sessions'>;

const initialTherapyTypes: TherapyDefinition[] = [
  { id: 'OT', name: 'Okupasi', Icon: OccupationalTherapyIcon, color: '#2DD4BF' }, // Teal 400 (Secondary)
  { id: 'TW', name: 'Wicara', Icon: SpeechTherapyIcon, color: '#A78BFA' }, // Violet 400
  { id: 'FT', name: 'Fisioterapi', Icon: PhysiotherapyIcon, color: '#FBBF24' }, // Amber 400
  { id: 'REMEDIAL', name: 'Remedial', Icon: RemedialIcon, color: '#F472B6' }, // Pink 400 (Accent)
  { id: 'HT', name: 'Hidroterapi', Icon: HydrotherapyIcon, color: '#0EA5E9' }, // Sky 500
  { id: 'BERKUDA', name: 'Terapi Berkuda', Icon: EquineTherapyIcon, color: '#10B981' }, // Emerald 500
];

const themes: Theme[] = DEFAULT_THEMES;

const colorPalette = ['#60A5FA', '#34D399', '#FB923C', '#818CF8', '#EC4899'];

// Mock Data Generation
const firstNames = ["Adi", "Bunga", "Cahya", "Dian", "Eka", "Fajar", "Gita", "Hadi", "Intan", "Jaya", "Kiki", "Lia", "Mira", "Nanda", "Oscar", "Putri", "Rian", "Sari", "Tia", "Umar", "Vina", "Wira", "Xena", "Yani", "Zaki", "Ayu", "Bima", "Cici", "Dodo", "Elma"];
const lastNames = ["Wijaya", "Santoso", "Lestari", "Kusuma", "Pratama", "Nugraha", "Halim", "Wahyuni", "Setiawan", "Hidayat", "Saputra", "Gunawan", "Rahman", "Susanto", "Maulana"];

const generateInitialChildren = (count: number): MasterChild[] => {
  const children: MasterChild[] = [];
  const usedNames = new Set<string>();
  const statuses = Object.values(AssessmentStatus);
  const dayOfWeekNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const timeSlots = [
    '07:00 - 08:00', '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', 
    '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', 
    '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00'
  ];
  const types = ['OT', 'TW', 'FT', 'REMEDIAL'];

   const adriel: MasterChild = {
        id: 'C-ADRIEL',
        name: 'Adriel Djulian Putra Aditya',
        photoUrl: `https://i.pravatar.cc/100?u=AdrielDjulianPutraAditya`,
        recurringSessions: [
          { day: 'Senin', time: '08:00 - 09:00', type: 'OT', therapistId: 'T11' },
          { day: 'Senin', time: '11:00 - 12:00', type: 'TW', therapistId: 'T12' },
          { day: 'Rabu', time: '10:00 - 11:00', type: 'OT', therapistId: 'T11' },
        ],
        assessmentStatus: AssessmentStatus.COMPLETED,
        birthDate: '2015-12-29',
        gender: 'Laki-Laki',
        className: '3 MWS',
        parentName: 'Aditya Anugrah Putra',
        motherName: 'Djuliani Djumhani Djoewarsa',
        address: 'Nerada Estate Blok A6 No.7 Cipayung, Ciputat. Tangsel',
        username: 'siswa',
        password: 'pelangilazuardi',
        paymentHistory: {},
        status: 'Aktif'
    };
    children.push(adriel);
    usedNames.add(adriel.name);

  while (children.length < count) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      
      const numSessions = Math.floor(Math.random() * 3) + 1;
      const recurringSessions = [];
      for(let i=0; i<numSessions; i++) {
        recurringSessions.push({
          day: dayOfWeekNames[Math.floor(Math.random() * dayOfWeekNames.length)],
          time: timeSlots[Math.floor(Math.random() * timeSlots.length)],
          type: types[Math.floor(Math.random() * types.length)],
          therapistId: `T${11 + Math.floor(Math.random() * 12)}`
        });
      }

      children.push({
        id: `C${101 + children.length}`,
        name: name,
        photoUrl: `https://i.pravatar.cc/100?u=${name.replace(/\s/g, '')}`,
        recurringSessions: recurringSessions,
        assessmentStatus: statuses[Math.floor(Math.random() * statuses.length)],
        birthDate: '2016-05-10',
        gender: 'Perempuan',
        className: '2B',
        parentName: `Bapak ${lastName}`,
        motherName: `Ibu ${firstName}`,
        address: 'Jalan Merdeka No. 12, Jakarta',
        paymentHistory: {},
        status: 'Aktif'
      });
    }
  }
  return children;
};

const generateInitialTherapists = (therapies: TherapyDefinition[]): Therapist[] => {
    const list = [
      {
        name: "Rilla Serando, S.Tr.Kes",
        title: "Spesialis Okupasi Terapi & SI",
        specialties: ["OT"],
        workingDays: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
        phone: '0812-8899-0101',
        email: 'rilla.serando@lazuardi.sch.id',
        defaultRoom: 'Ruang Okupasi & SI 1',
        maxClientsPerDay: 6,
        status: 'Aktif' as const,
        bio: 'Praktisi Okupasi Terapi berlisensi dengan spesialisasi Sensori Integrasi dan modulasi perilaku mandiri anak.'
      },
      {
        name: "Adisty Ayuningtyas, A.Md.TW",
        title: "Spesialis Terapi Wicara & Bahasa",
        specialties: ["TW"],
        workingDays: ['Senin', 'Selasa', 'Kamis', 'Jumat', 'Sabtu'],
        phone: '0813-7744-1234',
        email: 'adisty.a@lazuardi.sch.id',
        defaultRoom: 'Ruang Wicara 1',
        maxClientsPerDay: 6,
        status: 'Aktif' as const,
        bio: 'Terapis Wicara berdedikasi tinggi dalam stimulasi verbal, artikulasi fonem bilabial/lingual, dan bahasa ekspresif.'
      },
      {
        name: "Dr. Anisa Rahmawati, Sp.KFR",
        title: "Fisioterapis Pediatrik",
        specialties: ["FT"],
        workingDays: ['Senin', 'Rabu', 'Kamis', 'Jumat'],
        phone: '0811-2233-4455',
        email: 'anisa.r@lazuardi.sch.id',
        defaultRoom: 'Ruang Fisioterapi Pediatrik',
        maxClientsPerDay: 5,
        status: 'Aktif' as const,
        bio: 'Fokus pada stimulasi motorik kasar lokomotor, penguatan tonus otot, dan kestabilan postur anak.'
      },
      {
        name: "Dr. Budi Santoso, M.Psi",
        title: "Terapis Remedial & Modifikasi Perilaku",
        specialties: ["REMEDIAL"],
        workingDays: ['Selasa', 'Rabu', 'Kamis', 'Sabtu'],
        phone: '0815-9988-7766',
        email: 'budi.santoso@lazuardi.sch.id',
        defaultRoom: 'Ruang Remedial & Kognitif',
        maxClientsPerDay: 6,
        status: 'Aktif' as const,
        bio: 'Penguatan kemampuan pra-akademik, konsentrasi perhatian terarah, dan regulasi impulsivitas.'
      },
      {
        name: "Dr. Chandra Wijaya, S.Ft",
        title: "Fisioterapi & Hidroterapi Pediatrik",
        specialties: ["FT", "HT"],
        workingDays: ['Senin', 'Rabu', 'Jumat', 'Sabtu'],
        phone: '0812-3344-5566',
        email: 'chandra.w@lazuardi.sch.id',
        defaultRoom: 'Kolam Hidroterapi & Fisio',
        maxClientsPerDay: 5,
        status: 'Aktif' as const,
        bio: 'Fisioterapi berbasis air (hidroterapi) untuk relaksasi spastisitas, keseimbangan dinamis, dan koordinasi motorik.'
      },
      {
        name: "Dr. Dian Kusuma, S.Tr.Kes",
        title: "Okupasi Terapi Sensori Integrasi",
        specialties: ["OT"],
        workingDays: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
        phone: '0813-1122-3344',
        email: 'dian.kusuma@lazuardi.sch.id',
        defaultRoom: 'Ruang Okupasi 2',
        maxClientsPerDay: 6,
        status: 'Aktif' as const,
        bio: 'Intervensi koordinasi motorik halus, ketahanan proprioseptif, dan sensori taktil adaptif.'
      },
      {
        name: "Dr. Eka Pratama, S.Pd",
        title: "Terapis Wicara & Stimulasi Oral",
        specialties: ["TW"],
        workingDays: ['Selasa', 'Kamis', 'Jumat', 'Sabtu'],
        phone: '0812-9900-1122',
        email: 'eka.pratama@lazuardi.sch.id',
        defaultRoom: 'Ruang Wicara 2',
        maxClientsPerDay: 6,
        status: 'Aktif' as const,
        bio: 'Latihan oral-motor, koordinasi pernapasan saat bicara, dan pemahaman instruksi dua tahap.'
      },
      {
        name: "Dr. Fajar Nugraha",
        title: "Spesialis Terapi Berkuda (Hippotherapy)",
        specialties: ["BERKUDA"],
        workingDays: ['Rabu', 'Kamis', 'Sabtu'],
        phone: '0818-4455-6677',
        email: 'fajar.nugraha@lazuardi.sch.id',
        defaultRoom: 'Arena Terapi Berkuda Lazuardi',
        maxClientsPerDay: 4,
        status: 'Aktif' as const,
        bio: 'Stimulasi ritmis vestibular gerak kuda adaptif untuk membangun fokus, kekuatan inti, dan ketenangan emosional.'
      },
      {
        name: "Ibu Gita Lestari, S.Psi",
        title: "Terapis Remedial Kognitif",
        specialties: ["REMEDIAL"],
        workingDays: ['Senin', 'Selasa', 'Rabu', 'Kamis'],
        phone: '0817-2233-8899',
        email: 'gita.lestari@lazuardi.sch.id',
        defaultRoom: 'Ruang Remedial & Kognitif',
        maxClientsPerDay: 6,
        status: 'Aktif' as const,
        bio: 'Spesialis bimbingan remedial baca-tulis pemula, pengenalan simbol visual, dan logika berhitung.'
      },
      {
        name: "Bapak Heru Setiawan, A.Md.TW",
        title: "Terapis Wicara Pediatrik",
        specialties: ["TW"],
        workingDays: ['Senin', 'Selasa', 'Rabu', 'Jumat'],
        phone: '0812-7788-9900',
        email: 'heru.s@lazuardi.sch.id',
        defaultRoom: 'Ruang Wicara 3',
        maxClientsPerDay: 6,
        status: 'Aktif' as const,
        bio: 'Ahli stimulasi komunikasi fungsional anak spektrum autisme dan keterlambatan bicara.'
      },
      {
        name: "Dr. Ilham Saputra, S.Ft",
        title: "Fisioterapis Muskuloskeletal",
        specialties: ["FT"],
        workingDays: ['Senin', 'Rabu', 'Kamis', 'Jumat'],
        phone: '0813-4455-8899',
        email: 'ilham.s@lazuardi.sch.id',
        defaultRoom: 'Ruang Fisioterapi Pediatrik',
        maxClientsPerDay: 5,
        status: 'Aktif' as const,
        bio: 'Fisioterapi koreksi postur, fleksibilitas ligamen, serta peningkatan endurance lokomotor anak.'
      },
      {
        name: "Dr. Jihan Wahyuni, S.Tr.Kes",
        title: "Okupasi & Motorik Halus",
        specialties: ["OT"],
        workingDays: ['Selasa', 'Rabu', 'Jumat', 'Sabtu'],
        phone: '0815-1144-7788',
        email: 'jihan.w@lazuardi.sch.id',
        defaultRoom: 'Ruang Okupasi & SI 1',
        maxClientsPerDay: 6,
        status: 'Aktif' as const,
        bio: 'Pendampingan keterampilan genggaman tripod, visual-motor integration, dan kemandirian berpakaian.'
      }
    ];

    const standardDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const standardSlots = [
      '08:00 - 09:00',
      '09:00 - 10:00',
      '10:00 - 11:00',
      '11:00 - 12:00',
      '13:00 - 14:00',
      '14:00 - 15:00',
      '15:00 - 16:00'
    ];

    return list.map((item, index) => {
        const scheduleDays = standardDays.map(dayName => {
            const isActive = item.workingDays.includes(dayName);
            return {
                day: dayName,
                active: isActive,
                startTime: '08:00',
                endTime: '16:00',
                timeSlots: isActive ? standardSlots : [],
                room: item.defaultRoom
            };
        });

        return {
            id: `T${11 + index}`,
            name: item.name,
            photoUrl: `https://i.pravatar.cc/100?u=therapist${index}`,
            specialties: item.specialties,
            title: item.title,
            phone: item.phone,
            email: item.email,
            status: item.status,
            workingDays: item.workingDays,
            scheduleDays,
            defaultRoom: item.defaultRoom,
            maxClientsPerDay: item.maxClientsPerDay,
            bio: item.bio,
            username: `terapis${index + 1}`,
            password: 'password',
            joinedDate: '2023-01-15'
        };
    });
};

const generateInitialAssessmentReports = (children: MasterChild[], therapists: Therapist[]): AssessmentReport[] => {
    if (children.length === 0 || therapists.length === 0) return [];
    
    // Create one very detailed report for Adriel, based on the PDF
    const childForReport = children.find(c => c.id === 'C-ADRIEL') || children[0];
    const reports: AssessmentReport[] = [{
        id: `AR-ADRIEL-01`,
        childId: childForReport.id,
        assessmentDate: '2025-10-02',
        studentName: childForReport.name,
        studentBirthDate: childForReport.birthDate,
        studentGender: childForReport.gender,
        studentClass: childForReport.className,
        studentParentName: childForReport.parentName,
        studentMotherName: childForReport.motherName,
        studentAddress: childForReport.address,
        occupationalTherapy: {
            examinerName: 'Rilla Serando, S.Tr.Kes',
            examinationNumber: 1,
            examinationDate1: '2025-10-02',
            referredBy: '-',
            generalObservation: {
                reactionToExaminer: 'Ananda ada upaya terlibat interaksi dengan pemeriksa. Ananda membutuhkan waktu untuk beradaptasi dengan lingkungan baru. Ananda ada terlibat kontak mata dengan terapis, namun belum optimal dan masih terlihat menghindari kontak mata jika dalam jangka waktu lama. Ekspresi wajah dan Afek sesuai dengan situasi. Ananda mampu menjawab pertanyaan terapis dengan cukup baik, seperti: nama, alamat, kelas dan nama gurunya. Pemahaman konsep dasar cukup baik, Ananda mampu bercerita dengan lancar jika menggunakan bahasa inggris.',
                reactionToExamination: 'Ananda mampu tidak lekat dengan keluarga saat memasuki ruangan. Ananda terlibat dalam perilaku eksplorasi namun masih perlu diarahkan dan diberikan afirmasi positif. Ananda membutuhkan waktu adaptasi untuk dapat mengontrol tubuhnya dalam melakukan aktivitas. Ananda mau mengikuti perintah dengan cukup baik dari satu aktivitas ke aktivitas lainnya, namun masih memerlukan dorongan/motivasi untuk melakukan setiap tahapan. Ananda masih terlihat kurang nyaman saat duduk lama dan rentang atensi pendek.',
                conspicuousBehavior: 'Tidak teramati perilaku agresif terhadap orang lain. Ananda mudah menyerah saat kesulitan dan ketika ada hal yang membuatnya tidak nyaman.',
                desireSpirit: 'Ananda terlihat memiliki keinginan dan minat. Ananda mampu melakukan tanya jawab namun perlu dukungan untuk mengeluarkan informasi secara utuh. Ananda terlihat kurang percaya diri dalam melakukan aktivitas dan tantangan. Ananda belum mampu mengorganisir perilaku untuk menyelesaikan tugas dengan sukses.',
            },
            sensoryModulation: {
                tactile: { response: 'Kurang', comment: 'Ananda terlihat kurang nyaman and membutuhkan dukungan (sempat menolak dengan meninggalkan area and harus dimotivasi terlebih dahulu) saat berjalan “bare foot” menyentuh tanah, rumput, and pasir tanpa menggunakan alas kaki. Respon terhadap input sensori taktil masih belum sesuai.' },
                proprioceptive: { response: 'Kurang', comment: 'Ananda terlihat belum dapat duduk dengan durasi yang lama and selalu merebahkan badannya dilantai.' },
                vestibular: { response: 'Kurang', comment: 'Ananda menunjukkan rasa tidak nyaman saat berada pada bola besar and posisi kepala berputar.' },
                auditory: { response: 'Sesuai', comment: 'Tidak adanya perilaku mencolok terhadap input auditori.' },
                visual: { response: 'Kurang', comment: 'Mudah terdistrak dengan lingkungan' },
            },
            combinedSensory: {
                performance: 'Performa Menurun',
                comment: 'Saat melakukan aktivitas yang melibatkan komponen vestibular and proprioseptif performanya menurun, Ananda terlihat kurang bersemangat and masih kesulitan dalam mengontrol tubuhnya, Ananda kurang sigap and ajeg saat bergerak.',
            },
            fedc: {
                regulationAndAttention: 'Ananda masih diarahkan and membutuhkan waktu untuk dapat menunjukkan minat terhadap berbagai rangsang and interaksi dengan orang lain, mampu pulih dari kondisi stres dalam 5 menit. Namun Ananda mudah terdistraksi dengan lingkungan sekitar and rentang atensi masih pendek.',
                engagementAndRelating: 'Ananda menanggapi tawaran terapis secara bertujuan dengan semangat and menunjukkan kegembiraan yang sesuai.',
                purposefulCommunication: 'Ananda mampu melakukan komunikasi 2 arah dengan menggunakan bahasa inggris. Ananda mampu menanggapi gerak isyarat yang bertujuan. Ananda masih membutuhkan dukungan dalam memprakarsai interaksi dengan terapis and masih kesulitan dalam menunjukkan reaksi emosi-emosi seperti marah, senang, and sebagainya dalam bahasa Indonesia.',
                complexCommunication: 'Ananda mampu menutup sedikitnya 5 siklus komunikasi.',
                creativeAndMeaningful: 'Ananda masih diarahkan dalam menyatakan niat, keinginan, and perasaan.',
                buildingLogicalBridges: 'Ananda mampu bermain permainan motorik sederhana yang memiliki aturan and menggunakan permainan dengan gagasan yang logis.',
            },
            occupationalArea: { adlsSelfCare: true, iadls: true, restAndSleep: false, educationalParticipation: true, play: true, leisure: false, adlsControlSphincter: false, adlsFunctionalMobility: false, adlsLocomotion: false },
            performanceSkills: { sensoryPerceptualSkills: true, motorAndPraxisSkills: true, emotionalRegulationSkills: true, cognitiveSkills: false, communicationAndSocialSkills: true },
            bodyFunction: { fungsiSensori: true, fungsiNeuromuskuloskeletal: true, fungsiGerakan: true, fungsiMental: false, fungsiMentalKhusus: false, fungsiMentalPraxis: false, nyeri: false, fungsiSendi: false, fungsiOtot: false, fungsiKardiovaskuler: false },
            outcome: { improvement: false, enhancement: false, prevention: false, healthyAndWellbeing: false, qualityOfLife: false, participation: true, roleOfCompetencies: true, welfare: false },
            interventionFrequency: '2 kali/minggu durasi 45-60 menit per sesi terapi',
            programDuration: '6 bulan (satu semester) and evaluasi berkala',
        },
        speechTherapy: {
            examinerName: 'Adisty Ayuningtyas, A.Md.TW',
            examinationDate: '2025-10-02',
            parentPhoneNumber: '0811944868',
            religion: 'Islam',
            originSchool: 'SD MWS',
            examinationPurpose: 'Proses mengumpulkan informasi and analisis mengenai individu/klien untuk mendapatkan pemahaman tentang individu/klien and digunakan dalam membuat suatu pertimbangan and keputusan yang berhubungan dengan individu/klien.',
            generalOverview: "Ananda adalah seorang anak laki-laki berusia 9 tahun 10 bulan yang saat ini bersekolah di kelas 3 di SD MWS. Saat datang ke Pelangi Ananda hanya diantar oleh Ibunya saja. Ananda mampu dengan mandiri tanpa didampingi oleh Ibunya untuk masuk ke dalam ruang SI.\n\nKetika Ananda sudah masuk ke dalam ruang SI, respon Ananda terlihat biasa saja. Ananda mau untuk mengikuti setiap diberikan instruksi oleh Terapis dengan baik. Sebelum memulai aktivitas, Terapis meminta Ananda untuk melakukan doa terlebih dahulu. Ananda mampu mengikutinya dengan baik. Setelah itu Terapis mulai melakukan tanya jawab sederhana dengan Ananda. Ananda mampu menjawabnya dengan baik. Namun ketika diberikan pertanyaan yang lebih spesifik Ananda akan merespon dengan menjawab “tidak tahu”, \"tanya Ibu saja, Ibu yang tahu” atau “aku lupa\". Terlihat jelas ketika Ananda diberikan pertanyaan yang lebih spesifik Ananda cenderung akan bingung dalam menjawabnya, sehingga urutan kata-katanya menjadi berantakan and jawabannya semakin tidak bisa dimengerti oleh orang lain. Dalam berkomunikasi Ananda cenderung menggunakan bahasa Inggris, namun Ananda juga masih bisa berkomunikasi dengan menggunakan bahasa Indonesia.",
            abilities: {
                motorikKasar: true, motorikHalus: true, visualMotorCoordination: true, motorikComment: 'Untuk area motorik kasar, motorik halus and visual motor koordinasi sudah cukup baik namun masih belum optimal.',
                penglihatan: true, pendengaran: true, taktilKinestetik: true, sensorikComment: 'Pada area penglihatan and pendengaran tidak ada masalah. Untuk taktil kinestetik, ketika Ananda diajak bermain keluar ruangan tanpa menggunakan alas kaki Ananda terlihat kurang nyaman, namun Ananda akhirnya tetap mau mengikuti instruksi tersebut. Terlihat bahwa Ananda berjalan dengan cara berjinjit saat berjalan tanpa menggunakan alas kaki ketika berjalan di atas pasir, rumput and tanah merah yang basah.',
                reseptif: true, ekspresif: true, bahasaComment: 'Pada area kemampuan bahasa reseptif Ananda mampu memahami setiap diberikan instruksi oleh Terapis. Pada area kemampuan bahasa ekspresif Ananda cukup baik. Ananda cukup mampu dalam menjawab pertanyaan sederhana yang Terapis ajukan. Dalam menceritakan urutan gambar and membuat kalimat sederhana, Ananda masih perlu banyak latihan lagi. Agar Ananda bisa mengurutkan kata demi kata agar tersusun menjadi satu kesatuan kalimat yang mudah dipahami oleh orang lain.',
                bunyi: true, fonem: true, wicaraComment: '',
                pernafasan: true, penyaringan: true, nada: true, suaraComment: 'Pada bagian pernafasan, penyaringan, and nada terlihat normal.',
                iramaNada: true, kecepatanBicara: true, iramaComment: 'Untuk kecepatan bicara sedikit lebih cepat ketika sedang berbicara.',
                organMulut: true, sikat: true, gerakanBibir: true, gerakanLidah: true, gerakanKunyah: true, hisap: true, tiup: true, kembungPipi: true, batuk: true, reflekMuntah: true, menelanComment: 'Dari data diatas terlihat tidak ada masalah pada area oral motornya.',
            },
            recommendation: 'Berdasarkan paparan and deskripsi di atas Ananda masih memerlukan Terapi Wicara 2x untuk melatih Ananda dalam menceritakan sebuah gambar secara kompleks serta untuk melatih Ananda dalam menyusun kata demi kata agar menjadi satu kesatuan kalimat yang jelas agar mudah dipahami oleh orang lain.',
        }
    }];

    // Add a few more simpler reports for other children
    children.slice(1, 4).forEach((child, index) => {
        reports.push({
            id: `AR${101 + index}`,
            childId: child.id,
            assessmentDate: `2024-06-${15 + index}`,
            studentName: child.name,
            studentBirthDate: child.birthDate,
            studentGender: child.gender,
            studentClass: child.className,
            studentParentName: child.parentName,
            studentMotherName: child.motherName,
            studentAddress: child.address,
            occupationalTherapy: {
                examinerName: therapists[0].name,
                examinationNumber: 1,
                examinationDate1: `2024-06-${15 + index}`,
                referredBy: 'Sekolah',
                generalObservation: { reactionToExaminer: `Anak ${child.name.split(' ')[0]} cukup kooperatif.`, reactionToExamination: 'Membutuhkan sedikit waktu untuk adaptasi.', conspicuousBehavior: 'Tidak ada perilaku yang menonjol.', desireSpirit: 'Menunjukkan minat pada beberapa aktivitas.' },
                sensoryModulation: { tactile: { response: 'Sesuai', comment: '' }, proprioceptive: { response: 'Sesuai', comment: '' }, vestibular: { response: 'Kurang', comment: 'Sedikit tidak nyaman dengan ayunan.' }, auditory: { response: 'Sesuai', comment: '' }, visual: { response: 'Sesuai', comment: '' }},
                combinedSensory: { performance: '', comment: ''},
                fedc: { regulationAndAttention: 'Fokus cukup baik.', engagementAndRelating: '', purposefulCommunication: '', complexCommunication: '', creativeAndMeaningful: '', buildingLogicalBridges: ''},
                occupationalArea: {}, performanceSkills: {}, bodyFunction: {}, outcome: {},
                interventionFrequency: '1x / minggu',
                programDuration: '3 bulan',
            }
        });
    });

    return reports;
};



const academicMonths = ['Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni'];

const generateFinancialData = (): { [key: string]: FinancialRecord[] } => {
    const data: { [key: string]: FinancialRecord[] } = {};
    const academicYears: AcademicYear[] = [
        { id: '2023-2024', label: '2023/2024' },
        { id: '2024-2025', label: '2024/2025' },
        { id: '2025-2026', label: '2025/2026' },
        { id: '2026-2027', label: '2026/2027' },
    ];

    const yearMultipliers: Record<string, { incomeMin: number; incomeMax: number; expenseMin: number; expenseMax: number }> = {
      '2023-2024': { incomeMin: 38000000, incomeMax: 48000000, expenseMin: 20000000, expenseMax: 26000000 },
      '2024-2025': { incomeMin: 48000000, incomeMax: 60000000, expenseMin: 24000000, expenseMax: 30000000 },
      '2025-2026': { incomeMin: 62000000, incomeMax: 76000000, expenseMin: 28000000, expenseMax: 35000000 },
      '2026-2027': { incomeMin: 74000000, incomeMax: 89000000, expenseMin: 32000000, expenseMax: 39000000 },
    };

    academicYears.forEach(year => {
        const mult = yearMultipliers[year.id] || { incomeMin: 40000000, incomeMax: 65000000, expenseMin: 22000000, expenseMax: 30000000 };
        data[year.id] = academicMonths.map((month, mIdx) => {
            const seasonalFactor = 1 + (Math.sin(mIdx * 0.5) * 0.08);
            const income = Math.round((Math.floor(Math.random() * (mult.incomeMax - mult.incomeMin + 1)) + mult.incomeMin) * seasonalFactor);
            
            const expenseDetails: ExpenseDetail[] = [];
            let totalExpense = 0;

            // Gaji Terapis (~60-65% of expense)
            const gajiBase = Math.round(mult.expenseMin * 0.65);
            const gaji = Math.floor(Math.random() * 3000000) + gajiBase;
            expenseDetails.push({ id: `exp-gaji-${year.id}-${month}`, category: "Gaji Terapis", description: `Gaji & honor terapis bulan ${month}`, amount: gaji });
            totalExpense += gaji;

            // Operasional
            const operasionalBase = Math.round(mult.expenseMin * 0.18);
            const operasional = Math.floor(Math.random() * 1500000) + operasionalBase;
            expenseDetails.push({ id: `exp-op-${year.id}-${month}`, category: "Biaya Operasional", description: "ATK, operasional klinik, kebersihan", amount: operasional });
            totalExpense += operasional;

            // Pembelian APE
            if (mIdx % 2 === 0) {
                const ape = Math.floor(Math.random() * 2500000) + 1200000;
                expenseDetails.push({ id: `exp-ape-${year.id}-${month}`, category: "Pembelian APE", description: "Pengadaan sarana stimulasi sensori & APE baru", amount: ape });
                totalExpense += ape;
            }

            // Listrik & Air
            const utilitas = Math.floor(Math.random() * 800000) + 1500000;
            expenseDetails.push({ id: `exp-util-${year.id}-${month}`, category: "Listrik & Air", description: "Tagihan listrik, air PDAM, dan internet", amount: utilitas });
            totalExpense += utilitas;

            return {
                month,
                income,
                expense: totalExpense,
                expenseDetails,
            };
        });
    });
    return data;
};

const times = [
  '07:00 - 08:00',
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
];
const daysOfWeek = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const generateInitialTherapyPrograms = (children: Child[] | MasterChild[]): TherapyProgram[] => {
    return children.map(child => {
        return {
            id: `p-${child.id}`,
            childId: child.id,
            lastUpdated: new Date().toISOString(),
            items: [
                {
                    id: `pi-ot-${child.id}-1`,
                    therapyType: 'OT' as const,
                    targetWaktu: '3 Bulan',
                    targetTerapi: 'Meningkatkan fokus dan atensi mandiri selama 10 menit',
                    aktifitasTerapi: 'Menyusun puzzle 3D / pasak sembari meminimalisir distraksi lingkungan.',
                    keterangan: 'Diberikan stimulasi proprioceptif di awal sesi.',
                    progres: 'Tercapai Sebagian'
                },
                {
                    id: `pi-ot-${child.id}-2`,
                    therapyType: 'OT' as const,
                    targetWaktu: '6 Bulan',
                    targetTerapi: 'Melatih motorik halus (fine motor koordinasi bilateral)',
                    aktifitasTerapi: 'Meronce manik-manik kecil dan memotong kertas mengikuti pola melingkar.',
                    keterangan: 'Fokus pada pola grip pensil / gunting tipe tripod.',
                    progres: 'Dalam Proses'
                },
                {
                    id: `pi-tw-${child.id}-1`,
                    therapyType: 'TW' as const,
                    targetWaktu: '3 Bulan',
                    targetTerapi: 'Meningkatkan pemahaman kalimat instruksi kompleks (bahasa reseptif)',
                    aktifitasTerapi: 'Mengikuti instruksi panggung 3 langkah beruntun (misal: ambil buku, letakkan di meja, lalu duduk).',
                    keterangan: 'Gunakan bahasa tubuh minimal untuk melatih verbal auditoral.',
                    progres: 'Tercapai'
                },
                {
                    id: `pi-tw-${child.id}-2`,
                    therapyType: 'TW' as const,
                    targetWaktu: '6 Bulan',
                    targetTerapi: 'Meningkatkan perbendaharaan kata (ekspresif) kata kerja dan benda',
                    aktifitasTerapi: 'Bermain tebak gambar aksi sosial / kartu kosakata ekspresif.',
                    keterangan: 'Dorong anak memproduksi kalimat SPOK sederhana.',
                    progres: 'Dalam Proses'
                },
                {
                    id: `pi-rem-${child.id}-1`,
                    therapyType: 'REM' as const,
                    targetWaktu: '3 Bulan',
                    targetTerapi: 'Pengenalan konsep matematika dasar penjumlahan di bawah 10',
                    aktifitasTerapi: 'Menghitung buah mainan dan memasukkan ke wadah angka bersangkutan.',
                    keterangan: 'Butuh pengulangan verbal yang sabar.',
                    progres: 'Dalam Proses'
                },
                {
                    id: `pi-rem-${child.id}-2`,
                    therapyType: 'REM' as const,
                    targetWaktu: '6 Bulan',
                    targetTerapi: 'Kemampuan membedakan huruf fonem mirip (b, d, p, q)',
                    aktifitasTerapi: 'Mewarnai gelembung huruf berpasangan dengan kartu panduan.',
                    keterangan: 'Gunakan visual berwarna merah-biru.',
                    progres: 'Belum Tercapai'
                },
                {
                    id: `pi-ft-${child.id}-1`,
                    therapyType: 'FT' as const,
                    targetWaktu: '3 Bulan',
                    targetTerapi: 'Peningkatan kekuatan postural dan stabilitas trunk/core',
                    aktifitasTerapi: 'Latihan merangkak di atas busa tidak rata dan mempertahankan posisi plank.',
                    keterangan: 'Jaga posisi panggul agar tidak miring.',
                    progres: 'Dalam Proses'
                },
                {
                    id: `pi-ft-${child.id}-2`,
                    therapyType: 'FT' as const,
                    targetWaktu: '6 Bulan',
                    targetTerapi: 'Melatih keseimbangan dinamis dan koordinasi lokomotor',
                    aktifitasTerapi: 'Melompati rintangan busa lunak setinggi 5cm dan menyusuri garis lurus.',
                    keterangan: 'Fasilitasi bantuan fisik minimal pada panggul.',
                    progres: 'Belum Tercapai'
                },
                {
                    id: `pi-ht-${child.id}-1`,
                    therapyType: 'HT' as const,
                    targetWaktu: '3 Bulan',
                    targetTerapi: 'Adaptasi air, kontrol pernapasan, dan relaksasi ketegangan otot di kolam air hangat',
                    aktifitasTerapi: 'Meniup gelembung di permukaan air, desensitisasi percikan wajah, dan mengapung telentang (back float).',
                    keterangan: 'Gunakan air hangat untuk stimulasi relaksasi otot dan rasa nyaman.',
                    progres: 'Dalam Proses'
                },
                {
                    id: `pi-ht-${child.id}-2`,
                    therapyType: 'HT' as const,
                    targetWaktu: '6 Bulan',
                    targetTerapi: 'Meningkatkan kekuatan otot inti (core), daya tahan fisik, dan koordinasi tungkai di air',
                    aktifitasTerapi: 'Gerakan kayuhan kaki bergantian (flutter kicks) dan berjalan mandiri di kedalaman setinggi dada.',
                    keterangan: 'Memanfaatkan daya apung air (buoyancy) untuk latihan keseimbangan dinamis.',
                    progres: 'Belum Tercapai'
                },
                {
                    id: `pi-berkuda-${child.id}-1`,
                    therapyType: 'BERKUDA' as const,
                    targetWaktu: '3 Bulan',
                    targetTerapi: 'Adaptasi perilaku, regulasi emosi, dan kepatuhan menggunakan perlengkapan berkuda',
                    aktifitasTerapi: 'Mengenakan helm dan sabuk keselamatan mandiri, mendekati kuda dengan tenang, dan adaptasi menaiki kuda (mounting).',
                    keterangan: 'Didampingi oleh terapis dan tim side-walker.',
                    progres: 'Tercapai Sebagian'
                },
                {
                    id: `pi-berkuda-${child.id}-2`,
                    therapyType: 'BERKUDA' as const,
                    targetWaktu: '6 Bulan',
                    targetTerapi: 'Meningkatkan postur duduk tegak simetris, stabilitas batang tubuh, dan stimulasi proprioseptif',
                    aktifitasTerapi: 'Mempertahankan postur tegak saat kuda melangkah santai, memegang kendali tali simetris, dan latihan memindahkan ring.',
                    keterangan: 'Input ritmis 3 dimensi dari langkah kuda merangsang tonus postural dan kontrol panggul.',
                    progres: 'Dalam Proses'
                }
            ]
        };
    });
};

const generateInitialAttendanceNotes = (children: MasterChild[]): { [dateKey: string]: { [sessionId: string]: any } } => {
  const adriel = children.find(c => c.id === 'C-ADRIEL') || children[0];
  if (!adriel) return {};

  const notes: { [dateKey: string]: { [sessionId: string]: any } } = {};
  
  // Date 1: 2026-09-28 (Today) - Okupasi & Wicara
  const d1 = '2026-09-28';
  notes[d1] = {
    [`s-recur-${adriel.id}-Senin-08:00-09:00`]: {
      note: 'Ananda Adriel menunjukkan fokus dan atensi yang meningkat saat transisi aktivitas sensori integrasi. Mampu mentoleransi ayunan platform vestibular selama 10 menit dengan regulasi emosi stabil. Pada motorik halus, Adriel mampu meronce manik-manik kecil dengan tripod grasp mandiri dan akurasi 85%. Kontak mata konsisten selama instruksi dua tahap.',
      photoUrls: [
        'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop&q=80'
      ],
      type: 'OT',
      therapistId: 'T11',
      detailedProgress: {
        interventionPrograms: [
          { label: 'Berdoa', checked: true },
          { label: 'Sensori Integrasi (Vestibular & Proprioseptif)', checked: true },
          { label: 'Aktivitas Terapeutik (Fine Motor Grasp)', checked: true },
          { label: 'Bahasa Reseptif', checked: true },
          { label: 'Bahasa Ekspresif', checked: false },
          { label: 'Motorik Oral', checked: false },
          { label: 'Evaluasi & Relaksasi Postural', checked: true }
        ],
        exerciseProgress: [
          { label: 'Kontak mata', checked: true },
          { label: 'Proprioseptif', checked: true },
          { label: 'Vestibular', checked: true },
          { label: 'Fine motor', checked: true },
          { label: 'Gross motor', checked: true }
        ],
        functionalActivities: [
          { activity: 'Meronce manik pola warna berurutan', independence: 'Mandiri (Bantuan Minimal)', accuracy: '85%' },
          { activity: 'Keseimbangan berdiri satu kaki di foam pad', independence: 'Mandiri', accuracy: '90%' },
          { activity: 'Menyusun puzzle geometri 12 keping', independence: 'Mandiri', accuracy: '100%' }
        ],
        weaknessObservations: [
          { label: 'Inatensi', checked: false },
          { label: 'Regulasi', checked: false },
          { label: 'Respon Instruksi', checked: false }
        ],
        responseToIntervention: 'Sangat responsif, ceria, dan kooperatif sepanjang 60 menit sesi.'
      }
    },
    [`s-recur-${adriel.id}-Senin-11:00-12:00`]: {
      note: 'Sesi Terapi Wicara: Latihan artikulasi fonem bilabial (b, p, m) dan lingual (t, d, n). Adriel mampu mengulang kata 2 suku kata dengan artikulasi jelas 80%. Pemahaman kalimat perintah bertingkat tercapai baik. Mampu mengekspresikan keinginan "Mau minum air" secara verbal spontan.',
      photoUrls: [
        'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=80'
      ],
      type: 'TW',
      therapistId: 'T12',
      detailedProgress: {
        interventionPrograms: [
          { label: 'Berdoa', checked: true },
          { label: 'Bahasa Reseptif', checked: true },
          { label: 'Bahasa Ekspresif', checked: true },
          { label: 'Motorik Oral', checked: true },
          { label: 'Oral Motor Exercise', checked: true },
          { label: 'Artikulasi Fonem Bilabial & Lingual', checked: true },
          { label: 'Evaluasi Komunikasi Fungsional', checked: true }
        ],
        exerciseProgress: [
          { label: 'Kontak mata', checked: true },
          { label: 'Proprioseptif', checked: false },
          { label: 'Vestibular', checked: false },
          { label: 'Fine motor', checked: false },
          { label: 'Gross motor', checked: false }
        ],
        functionalActivities: [
          { activity: 'Meniru kata benda bergambar 10 kartu', independence: 'Mandiri', accuracy: '80%' },
          { activity: 'Meniup peluit dan sedotan spiral (oral motor)', independence: 'Mandiri', accuracy: '90%' }
        ],
        weaknessObservations: [
          { label: 'Inatensi', checked: false },
          { label: 'Regulasi', checked: false },
          { label: 'Respon Instruksi', checked: false }
        ],
        responseToIntervention: 'Adriel mampu meniru gerakan mulut terapis dengan cermin visual secara antusias.'
      }
    }
  };

  // Date 2: 2026-09-24 (4 days ago) - Okupasi & Sensori Integrasi
  const d2 = '2026-09-24';
  notes[d2] = {
    [`s-recur-${adriel.id}-Rabu-10:00-11:00`]: {
      note: 'Latihan proprioseptif dan koordinasi motorik kasar. Adriel berhasil melompati rintangan busa bertingkat 3 level dan merangkak di dalam terowongan kain. Keseimbangan dinamis stabil dan tidak ada ketakutan gravitasi. Toleransi sentuhan tekstur busa dan pasir kinetik meningkat.',
      photoUrls: [
        'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=600&auto=format&fit=crop&q=80'
      ],
      type: 'OT',
      therapistId: 'T11',
      detailedProgress: {
        interventionPrograms: [
          { label: 'Berdoa', checked: true },
          { label: 'Sensori Integrasi Tactile & Proprioceptive', checked: true },
          { label: 'Obstacle Course Lokomotor', checked: true },
          { label: 'Evaluasi Regulasi Diri', checked: true }
        ],
        exerciseProgress: [
          { label: 'Kontak mata', checked: true },
          { label: 'Proprioseptif', checked: true },
          { label: 'Vestibular', checked: true },
          { label: 'Fine motor', checked: true },
          { label: 'Gross motor', checked: true }
        ],
        functionalActivities: [
          { activity: 'Merayap di terowongan busa 4 meter', independence: 'Mandiri', accuracy: '100%' },
          { activity: 'Mengambil bola warna sesuai perintah', independence: 'Mandiri', accuracy: '95%' }
        ],
        weaknessObservations: [
          { label: 'Inatensi', checked: false },
          { label: 'Regulasi', checked: false },
          { label: 'Respon Instruksi', checked: false }
        ],
        responseToIntervention: 'Menunjukkan energi positif dan daya tahan motorik yang prima.'
      }
    }
  };

  // Date 3: 2026-09-21 (1 week ago) - Terapi Hidro & Relaksasi
  const d3 = '2026-09-21';
  notes[d3] = {
    [`s-recur-${adriel.id}-Senin-08:00-09:00`]: {
      note: 'Evaluasi sesi terapi terpadu: Program hidroterapi dan adaptasi relaksasi otot. Adriel sangat menikmati stimulasi air hangat, mampu melakukan gerakan tendangan kaki flutter kick dengan papan pelampung, serta menahan napas di dalam air selama 3 detik tanpa kepanikan.',
      photoUrls: [
        'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600&auto=format&fit=crop&q=80'
      ],
      type: 'HT',
      therapistId: 'T13',
      detailedProgress: {
        interventionPrograms: [
          { label: 'Berdoa', checked: true },
          { label: 'Desensitisasi & Adaptasi Air Hangat', checked: true },
          { label: 'Latihan Pernapasan & Back Float', checked: true },
          { label: 'Evaluasi Tonus Otot', checked: true }
        ],
        exerciseProgress: [
          { label: 'Kontak mata', checked: true },
          { label: 'Proprioseptif', checked: true },
          { label: 'Vestibular', checked: true },
          { label: 'Fine motor', checked: false },
          { label: 'Gross motor', checked: true }
        ],
        functionalActivities: [
          { activity: 'Mengapung terlentang dengan pegangan bahu', independence: 'Bantuan Minimal', accuracy: '85%' },
          { activity: 'Meniup gelembung di permukaan air', independence: 'Mandiri', accuracy: '100%' }
        ],
        weaknessObservations: [
          { label: 'Inatensi', checked: false },
          { label: 'Regulasi', checked: false },
          { label: 'Respon Instruksi', checked: false }
        ],
        responseToIntervention: 'Tonus otot tampak jauh lebih rileks setelah sesi hidroterapi.'
      }
    }
  };

  return notes;
};

const App: React.FC = () => {
  // Auth State (persisted across page refresh)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pelangi360_is_authenticated') === 'true';
    } catch {
      return false;
    }
  });
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      return (localStorage.getItem('pelangi360_user_role') as UserRole) || null;
    } catch {
      return null;
    }
  });
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('pelangi360_logged_in_user_id') || null;
    } catch {
      return null;
    }
  });

  // RBAC Roles State
  const [rbacRoles, setRbacRoles] = useState<RoleDefinition[]>(() => getStoredRoles());

  // Allowed menus for active role based on RBAC permissions
  const currentUserAllowedMenus = useMemo<View[]>(() => {
    if (!userRole) return [];
    const matched = rbacRoles.find(r => r.id === userRole);
    return matched ? matched.allowedMenus : [];
  }, [userRole, rbacRoles]);

  // Data State
  const [allChildren, setAllChildren] = useState<MasterChild[]>([]);
  const [allTherapists, setAllTherapists] = useState<Therapist[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<{ [dateKey: string]: { [sessionId: string]: AttendanceStatus } }>({});
  const [attendanceNotes, setAttendanceNotes] = useState<{ [dateKey: string]: { [sessionId: string]: string } }>({});
  const [therapyTypes, setTherapyTypes] = useState<TherapyDefinition[]>(initialTherapyTypes);
  const [isLoading, setIsLoading] = useState(true);
  const [assessmentReports, setAssessmentReports] = useState<AssessmentReport[]>([]);
  const [therapyPrograms, setTherapyPrograms] = useState<TherapyProgram[]>([]);
  const [extraDailySessions, setExtraDailySessions] = useState<{ [dateKey: string]: { [childChildId: string]: TherapySession[] } }>({});
  const [therapyCosts, setTherapyCosts] = useState<{ [key: string]: number }>({
      OT: 198000,
      TW: 175000,
      FT: 175000,
      REMEDIAL: 175000,
  });
  const [strategicPlans, setStrategicPlans] = useState<StrategicYearData[]>(() => getStoredStrategicPlans());
  
  // UI State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [programInitialChildId, setProgramInitialChildId] = useState<string | null>(null);
  const [programInitialCategory, setProgramInitialCategory] = useState<TherapyProgramCategory | undefined>(undefined);
  const [editingSession, setEditingSession] = useState<{ childId: string; sessionId: string; } | null>(null);
  const [detailsModalData, setDetailsModalData] = useState<{ isOpen: boolean; title: string; list: (Child | Therapist)[] }>({ isOpen: false, title: '', list: [] });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [storedUsers, setStoredUsers] = useState<UserAccount[]>(() => getStoredUsers());
  const [activeAccountId, setActiveAccountId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('pelangi360_active_account_id') || null;
    } catch {
      return null;
    }
  });

  // Global event listener for user profile synchronization
  useEffect(() => {
    const handleProfileUpdate = () => {
      setStoredUsers(getStoredUsers());
    };
    window.addEventListener('pelangi360_user_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('pelangi360_user_profile_updated', handleProfileUpdate);
  }, []);
  const [logoUrl, setLogoUrl] = useState('https://storage.googleapis.com/aai-web-samples/pelangi-lazuardi-logo-shield.png');
  const [guestRegMode, setGuestRegMode] = useState(false);
  const [guestRegistrations, setGuestRegistrations] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>(() => getStoredRegistrations());
  const [showNewRegistrationPopup, setShowNewRegistrationPopup] = useState<boolean>(false);

  // Count of registrations requiring follow-up (Registrasi Baru)
  const newRegistrationsCount = useMemo(() => {
    return registrations.filter(r => r.status === 'Registrasi Baru').length;
  }, [registrations]);

  // Settings State
  const [themeList, setThemeList] = useState<Theme[]>(() => getStoredThemes());
  const [activeTheme, setActiveTheme] = useState<Theme>(() => {
    const all = getStoredThemes();
    const activeId = getStoredActiveThemeId();
    return all.find(t => t.id === activeId) || all[0];
  });

  const handleThemeChange = (theme: Theme) => {
    setActiveTheme(theme);
    saveStoredActiveThemeId(theme.id);
  };

  const handleAddTheme = (newTheme: Theme) => {
    const updated = [...themeList, newTheme];
    setThemeList(updated);
    saveStoredThemes(updated);
    handleThemeChange(newTheme);
  };

  const handleDeleteTheme = (themeId: string) => {
    const updated = themeList.filter(t => t.id !== themeId);
    setThemeList(updated);
    saveStoredThemes(updated);
    if (activeTheme.id === themeId) {
      handleThemeChange(updated[0] || DEFAULT_THEMES[0]);
    }
  };

  const [gradientSettings, setGradientSettings] = useState<GradientSettings>({
    enabled: false,
    color1: '#111827',
    color2: '#6366f1',
    useColor3: false,
    color3: '#f472b6',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [sidebarMenuConfig, setSidebarMenuConfig] = useState<MenuItem[]>(initialSidebarMenuConfig);
  const [headerMenuConfig, setHeaderMenuConfig] = useState<HeaderMenuItem[]>(initialHeaderMenuConfig);
  const [draftSidebarConfig, setDraftSidebarConfig] = useState<MenuItem[]>(initialSidebarMenuConfig);
  const [draftHeaderConfig, setDraftHeaderConfig] = useState<HeaderMenuItem[]>(initialHeaderMenuConfig);
  const [menuCustomizations, setMenuCustomizations] = useState<MenuCustomizationConfig>(getStoredMenuCustomizations());

  useEffect(() => {
    const handleCustomizationUpdate = (e: any) => {
      if (e.detail) {
        setMenuCustomizations(e.detail);
      }
    };
    window.addEventListener('pelangi360_menu_customization_updated', handleCustomizationUpdate);
    return () => window.removeEventListener('pelangi360_menu_customization_updated', handleCustomizationUpdate);
  }, []);

  // Financial State
  const [financialData, setFinancialData] = useState<{ [key: string]: FinancialRecord[] }>(generateFinancialData());
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([
    { id: '2023-2024', label: '2023/2024' },
    { id: '2024-2025', label: '2024/2025' },
    { id: '2025-2026', label: '2025/2026' },
    { id: '2026-2027', label: '2026/2027' },
  ]);
  const [incomeReportData, setIncomeReportData] = useState<{ [key: string]: IncomeRecord[] }>({});

  const handleLoginSuccess = (role: UserRole, id?: string, accountId?: string) => {
    setUserRole(role);
    setLoggedInUserId(id || null);
    setIsAuthenticated(true);
    setGuestRegMode(false);
    setActiveView('dashboard'); // Go to dashboard after login

    try {
      localStorage.setItem('pelangi360_is_authenticated', 'true');
      localStorage.setItem('pelangi360_user_role', role || '');
      localStorage.setItem('pelangi360_logged_in_user_id', id || '');
    } catch (e) {}

    if (accountId) {
      setActiveAccountId(accountId);
      try {
        localStorage.setItem('pelangi360_active_account_id', accountId);
      } catch (e) {}
    } else {
      const users = getStoredUsers();
      const matched = users.find(u => (id && (u.id === id || u.linkedEntityId === id)) || u.role === role);
      if (matched) {
        setActiveAccountId(matched.id);
        try {
          localStorage.setItem('pelangi360_active_account_id', matched.id);
        } catch (e) {}
      }
    }

    // Trigger popup notification if there are registrations that need follow up
    if (newRegistrationsCount > 0 && (role === 'admin' || role === 'manager' || role === 'super_admin')) {
      setShowNewRegistrationPopup(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setLoggedInUserId(null);
    setActiveAccountId(null);
    try {
      localStorage.removeItem('pelangi360_is_authenticated');
      localStorage.removeItem('pelangi360_user_role');
      localStorage.removeItem('pelangi360_logged_in_user_id');
      localStorage.removeItem('pelangi360_active_account_id');
    } catch (e) {}
    setGuestRegMode(false);
    setShowNewRegistrationPopup(false);
  };

  // Automated registration ingestion from "Registrasi Tamu Baru"
  const handleGuestSubmit = (data: any) => {
    // 1. Automatically convert and assign Registration Number, Registration Date, and Initial Status
    const newRecord = convertGuestDataToRegistration(data, registrations.length);
    const updated = [newRecord, ...registrations];
    setRegistrations(updated);
    saveStoredRegistrations(updated);

    // Keep backwards compatibility with guestRegistrations
    const newGuest = {
      ...data,
      registrationId: newRecord.registrationNumber,
      registrationDate: newRecord.registrationDate,
      status: 'Baru'
    };
    setGuestRegistrations(prev => [newGuest, ...prev]);

    // 2. Trigger popup notification
    setShowNewRegistrationPopup(true);
    return newRecord;
  };

  const handleUpdateRegistration = (updated: RegistrationRecord) => {
    const updatedList = registrations.map(r => r.id === updated.id ? updated : r);
    setRegistrations(updatedList);
    saveStoredRegistrations(updatedList);
  };

  const handleDeleteRegistration = (id: string) => {
    const updatedList = registrations.filter(r => r.id !== id);
    setRegistrations(updatedList);
    saveStoredRegistrations(updatedList);
  };

  // Convert Registration into Active Client (Menjadi Klien Aktif)
  const handleConvertToClient = (record: RegistrationRecord) => {
    // 1. Check if child already exists
    const existingChild = allChildren.find(c => c.name.toLowerCase() === record.childName.toLowerCase());
    let childId = existingChild?.id;

    if (!existingChild) {
      // 2. Automatically insert into Data Klien (allChildren / Manajemen Anak)
      const newChild = convertRegistrationToChild(record, allChildren.length);
      childId = newChild.id;
      setAllChildren(prev => [...prev, newChild].sort((a, b) => a.name.localeCompare(b.name)));
      ensureStudentFoldersExist(newChild.id, newChild.name, 'Sistem Registrasi');
    }

    // 3. Automatically create Orang Tua / Siswa User Account in rbacStorage
    const cleanUsername = record.childName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 15) || `siswa${allChildren.length + 1}`;

    const storedUsers = getStoredUsers();
    if (!storedUsers.some(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      const newUserAccount: UserAccount = {
        id: `USR-${Date.now()}`,
        fullName: `${record.parentName || record.fatherName || record.childName} (Orang Tua ${record.childName})`,
        username: cleanUsername,
        password: 'password123',
        email: record.email || `${cleanUsername}@pelangi.sch.id`,
        phone: record.whatsapp,
        role: 'orang_tua',
        status: 'Aktif',
        createdAt: new Date().toISOString(),
        linkedEntityId: childId
      };
      saveStoredUsers([...storedUsers, newUserAccount]);
      appendActivityLog({
        userId: loggedInUserId || 'USR-ADMIN-01',
        userName: loggedInUser?.name || 'Administrator',
        userRole: userRole || 'admin',
        actionType: 'CREATE',
        description: `Akun Orang Tua & Siswa otomatis dibuat untuk ananda ${record.childName} (Username: ${cleanUsername})`
      });
    }

    // 4. Update registration status while preserving historical registration data
    const updatedRecord: RegistrationRecord = {
      ...record,
      status: 'Menjadi Klien Aktif',
      convertedClientId: childId,
      convertedDate: new Date().toISOString()
    };
    handleUpdateRegistration(updatedRecord);

    alert(`Sukses! Ananda ${record.childName} telah berhasil dikonversi menjadi Klien Aktif.\n\n• Data otomatis masuk ke Data Klien (Manajemen Anak).\n• Akun Orang Tua & Siswa otomatis dibuat (Username: ${cleanUsername}, Password: password123).\n• Riwayat registrasi tetap tersimpan di menu Registrasi.`);
  };

  const handlePromoteGuest = (guest: any) => {
    // 1. Check if child already exists by name (optional, but good for demo)
    if (allChildren.some(c => c.name === guest.child.fullName)) {
        alert('Siswa dengan nama ini sudah terdaftar.');
        return;
    }

    // 2. Create new MasterChild from guest data
    const newChild: MasterChild = {
        id: `C${101 + allChildren.length}`,
        name: guest.child.fullName,
        photoUrl: `https://i.pravatar.cc/100?u=${guest.child.fullName.replace(/\s/g, '')}`,
        recurringSessions: [],
        assessmentStatus: AssessmentStatus.NOT_ASSESSED,
        birthDate: guest.child.birthDate,
        gender: guest.child.gender,
        className: guest.child.class,
        parentName: guest.family.father.name,
        motherName: guest.family.mother.name,
        address: guest.child.address,
        status: 'Aktif'
    };

    // 3. Update allChildren
    setAllChildren(prev => [...prev, newChild].sort((a, b) => a.name.localeCompare(b.name)));

    // 4. Update guest status
    setGuestRegistrations(prev => prev.map(g => 
        g.registrationId === guest.registrationId ? { ...g, status: 'Siswa' } : g
    ));

    // 5. Navigate to child management to show the new student
    setActiveView('manajemenAnak');
    alert(`Berhasil! ${guest.child.fullName} telah terdaftar sebagai siswa baru.`);
  };

  const handleNavigateToProgramFromNotebook = (childId: string, therapyType?: TherapyProgramCategory) => {
    setProgramInitialChildId(childId);
    if (therapyType) {
      setProgramInitialCategory(therapyType);
    }
    setActiveView('programTerapi');
  };

  const handleBackToNotebook = () => {
    setActiveView('bukuCatatanTerapi');
  };


  const handleEditToggle = () => {
    if (!isEditing) {
      setDraftSidebarConfig(sidebarMenuConfig);
      setDraftHeaderConfig(headerMenuConfig);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveMenus = () => {
    setSidebarMenuConfig(draftSidebarConfig);
    setHeaderMenuConfig(draftHeaderConfig);
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };


  useEffect(() => {
    Object.entries(activeTheme.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value as string);
    });
  }, [activeTheme]);

  useEffect(() => {
    const mainAppDiv = document.querySelector<HTMLElement>('.min-h-screen.flex');
    if (!mainAppDiv) return;

    if (gradientSettings.enabled) {
        const colors = [
            gradientSettings.color1,
            gradientSettings.color2,
            ...(gradientSettings.useColor3 ? [gradientSettings.color3] : [])
        ];
        mainAppDiv.style.backgroundImage = `linear-gradient(to bottom right, ${colors.join(', ')})`;
    } else {
        mainAppDiv.style.backgroundImage = '';
    }
  }, [gradientSettings]);
  
  const refreshData = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const initialChildrenData = generateInitialChildren(100);
      const savedTherapists = localStorage.getItem('allTherapists');
      let initialTherapistsData: Therapist[] = [];
      if (savedTherapists) {
        try {
          const parsed = JSON.parse(savedTherapists);
          if (Array.isArray(parsed) && parsed.length > 0) {
            initialTherapistsData = parsed;
          }
        } catch (e) {
          console.error("Failed to parse stored therapists:", e);
        }
      }
      if (initialTherapistsData.length === 0) {
        initialTherapistsData = generateInitialTherapists(initialTherapyTypes);
        try {
          localStorage.setItem('allTherapists', JSON.stringify(initialTherapistsData));
        } catch (e) {}
      }
      const initialReportsData = generateInitialAssessmentReports(initialChildrenData, initialTherapistsData);
      setAllChildren(initialChildrenData.sort((a, b) => a.name.localeCompare(b.name)));
      setAllTherapists(initialTherapistsData);
      setAssessmentReports(initialReportsData);
      setTherapyTypes(initialTherapyTypes);
      
      const savedPrograms = localStorage.getItem('therapyPrograms');
      if (savedPrograms) {
          try {
              const parsed: TherapyProgram[] = JSON.parse(savedPrograms);
              const initialPrograms = generateInitialTherapyPrograms(initialChildrenData);
              // Ensure existing programs have HT/BERKUDA items and progres backfilled if missing from previous version
              const defaultStatuses = ['Tercapai Sebagian', 'Dalam Proses', 'Tercapai', 'Belum Tercapai'];
              const updatedPrograms = parsed.map(program => {
                  const hasHT = program.items?.some(it => it.therapyType === 'HT');
                  const hasBerkuda = program.items?.some(it => it.therapyType === 'BERKUDA');
                  let items = program.items || [];
                  if (!hasHT || !hasBerkuda) {
                      const sampleChildProgram = initialPrograms.find(p => p.childId === program.childId) || initialPrograms[0];
                      const missingItems = (sampleChildProgram?.items || []).filter(it => 
                          (!hasHT && it.therapyType === 'HT') || (!hasBerkuda && it.therapyType === 'BERKUDA')
                      ).map(it => ({
                          ...it,
                          id: `${it.id}-${program.childId}`
                      }));
                      items = [...items, ...missingItems];
                  }
                  items = items.map((it, idx) => ({
                      ...it,
                      progres: it.progres || defaultStatuses[idx % defaultStatuses.length]
                  }));
                  return {
                      ...program,
                      items
                  };
              });
              setTherapyPrograms(updatedPrograms);
              localStorage.setItem('therapyPrograms', JSON.stringify(updatedPrograms));
          } catch (e) {
              const initialPrograms = generateInitialTherapyPrograms(initialChildrenData);
              setTherapyPrograms(initialPrograms);
              localStorage.setItem('therapyPrograms', JSON.stringify(initialPrograms));
          }
      } else {
          const initialPrograms = generateInitialTherapyPrograms(initialChildrenData);
          setTherapyPrograms(initialPrograms);
          localStorage.setItem('therapyPrograms', JSON.stringify(initialPrograms));
      }
      
      const savedRecords = localStorage.getItem('attendanceRecords');
      if (savedRecords) {
          try {
              setAttendanceRecords(JSON.parse(savedRecords));
          } catch (e) {
              console.error("Failed to parse attendance records:", e);
          }
      }
      
      const initialNotes = generateInitialAttendanceNotes(initialChildrenData);
      const savedNotes = localStorage.getItem('attendanceNotes');
      if (savedNotes) {
          try {
              const parsed = JSON.parse(savedNotes);
              const merged = { ...initialNotes, ...parsed };
              setAttendanceNotes(merged);
              localStorage.setItem('attendanceNotes', JSON.stringify(merged));
          } catch (e) {
              console.error("Failed to parse attendance notes:", e);
              setAttendanceNotes(initialNotes);
              localStorage.setItem('attendanceNotes', JSON.stringify(initialNotes));
          }
      } else {
          setAttendanceNotes(initialNotes);
          localStorage.setItem('attendanceNotes', JSON.stringify(initialNotes));
      }

      const savedExtra = localStorage.getItem('extraDailySessions');
      if (savedExtra) {
          try {
              setExtraDailySessions(JSON.parse(savedExtra));
          } catch (e) {
              console.error("Failed to parse extra daily sessions:", e);
          }
      }
      
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Ensure every registered child has a therapy program initialized
  useEffect(() => {
    if (allChildren.length === 0) return;
    setTherapyPrograms(prev => {
        const existingChildIds = new Set(prev.map(p => p.childId));
        const missingChildren = allChildren.filter(c => !existingChildIds.has(c.id));
        if (missingChildren.length > 0) {
            const extraPrograms = generateInitialTherapyPrograms(missingChildren);
            const merged = [...prev, ...extraPrograms];
            localStorage.setItem('therapyPrograms', JSON.stringify(merged));
            return merged;
        }
        return prev;
    });
  }, [allChildren]);

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);
  
  useEffect(() => {
      if (allChildren.length === 0 || therapyTypes.length === 0 || academicYears.length === 0) {
          return;
      }

      const initialData: { [key: string]: IncomeRecord[] } = {};

      academicYears.forEach(year => {
          // Assuming year.id format is "YYYY-YYYY" (e.g., "2023-2024")
          const startYearStr = year.id.split('-')[0];
          const startYear = parseInt(startYearStr, 10);
          const startMonth = 6; // July

          if (isNaN(startYear)) return;

          initialData[year.id] = Array.from({ length: 12 }, (_, i) => {
              const monthIndex = (startMonth + i) % 12;
              const currentYear = startYear + Math.floor((startMonth + i) / 12);
              
              let monthlyIncome = 0;
              const daysInMonth = new Date(currentYear, monthIndex + 1, 0).getDate();

              for (let day = 1; day <= daysInMonth; day++) {
                  const date = new Date(currentYear, monthIndex, day);
                  const dateKey = date.toISOString().split('T')[0];
                  const dayOfWeekName = date.toLocaleDateString('id-ID', { weekday: 'long' });

                  allChildren.forEach(child => {
                      child.recurringSessions?.forEach(session => {
                          if (session.day === dayOfWeekName) {
                              const sessionId = `s-recur-${child.id}-${dayOfWeekName.replace(/\s/g, '')}-${session.time}`;
                              const status = attendanceRecords[dateKey]?.[sessionId] || AttendanceStatus.PENDING;
                              if (status === AttendanceStatus.PRESENT) {
                                  monthlyIncome += therapyCosts[session.type] || 0;
                              }
                          }
                      });
                  });
              }
              return {
                  month: monthNames[monthIndex],
                  income: monthlyIncome,
              };
          });
      });
      setIncomeReportData(initialData);
  }, [allChildren, therapyTypes, academicYears, attendanceRecords, therapyCosts]);

  // Resolve active account from stored RBAC user database
  const currentAccount = useMemo<UserAccount | null>(() => {
    if (!userRole) return null;
    // 1. By explicit activeAccountId
    if (activeAccountId) {
      const acc = storedUsers.find(u => u.id === activeAccountId);
      if (acc && acc.role === userRole) return acc;
    }
    // 2. By loggedInUserId
    if (loggedInUserId) {
      const acc = storedUsers.find(u => (u.id === loggedInUserId || u.linkedEntityId === loggedInUserId) && u.role === userRole);
      if (acc) return acc;
      const accById = storedUsers.find(u => u.id === loggedInUserId || u.linkedEntityId === loggedInUserId);
      if (accById) return accById;
    }
    // 3. Fallback by role in stored database
    const accByRole = storedUsers.find(u => u.role === userRole);
    if (accByRole) return accByRole;

    return null;
  }, [userRole, loggedInUserId, activeAccountId, storedUsers]);

  const loggedInUser = useMemo(() => {
    if (currentAccount) {
      return {
        id: currentAccount.id,
        name: currentAccount.displayName || currentAccount.fullName,
        fullName: currentAccount.fullName,
        displayName: currentAccount.displayName,
        photoUrl: currentAccount.photoUrl || '',
        email: currentAccount.email,
        phone: currentAccount.phone,
        role: currentAccount.role
      };
    }
    if (userRole === 'manager') {
      return { id: 'USR-MGR-01', name: 'Ibu Nurul Aini, M.Psi', fullName: 'Ibu Nurul Aini, M.Psi', photoUrl: '', email: 'manager@lazuardi.sch.id', phone: '', role: 'manager' };
    }
    if (userRole === 'super_admin') {
      return { id: 'USR-ROOT-01', name: 'Super Admin Pelangi', fullName: 'Super Admin Pelangi', photoUrl: '', email: 'root@pelangi360.sch.id', phone: '', role: 'super_admin' };
    }
    if (userRole === 'orang_tua') {
      return { id: 'USR-ORT-01', name: 'Djuliani Djumhani (Mama Adriel)', fullName: 'Djuliani Djumhani (Mama Adriel)', photoUrl: '', email: 'djuliani@gmail.com', phone: '', role: 'orang_tua' };
    }
    if (userRole === 'keuangan') {
      return { id: 'USR-KEU-01', name: 'Fajar Nugraha, S.E.', fullName: 'Fajar Nugraha, S.E.', photoUrl: '', email: 'finance@lazuardi.sch.id', phone: '', role: 'keuangan' };
    }
    if (userRole === 'assessor') {
      return { id: 'USR-ASR-01', name: 'Dr. Dian Kusumawardhani, Sp.KFR', fullName: 'Dr. Dian Kusumawardhani, Sp.KFR', photoUrl: '', email: 'dian.assessor@lazuardi.sch.id', phone: '', role: 'assessor' };
    }
    if (userRole === 'admin') {
      return { id: 'USR-ADM-01', name: 'Admin Operasional Pelangi', fullName: 'Admin Operasional Pelangi', photoUrl: '', email: 'admin@lazuardi.sch.id', phone: '', role: 'admin' };
    }
    if (userRole === 'siswa' && loggedInUserId) {
      const child = allChildren.find(c => c.id === loggedInUserId);
      return child ? { id: child.id, name: child.name, fullName: child.name, photoUrl: child.photoUrl || '', email: 'siswa@lazuardi.sch.id', phone: '', role: 'siswa' } : { id: 'USR-SIS-01', name: 'Siswa', fullName: 'Siswa', photoUrl: '', email: '', phone: '', role: 'siswa' };
    }
    if (userRole === 'terapis' && loggedInUserId) {
      const therapist = allTherapists.find(t => t.id === loggedInUserId);
      return therapist ? { id: therapist.id, name: therapist.name, fullName: therapist.name, photoUrl: therapist.photoUrl || '', email: 'terapis@lazuardi.sch.id', phone: '', role: 'terapis' } : { id: 'USR-TRP-01', name: 'Terapis', fullName: 'Terapis', photoUrl: '', email: '', phone: '', role: 'terapis' };
    }
    return { id: 'GUEST', name: 'Guest', fullName: 'Guest', photoUrl: '', email: '', phone: '', role: 'guest' };
  }, [userRole, loggedInUserId, allChildren, allTherapists, currentAccount]);

  const activeStudentForNotification = useMemo(() => {
    if (userRole === 'siswa' || userRole === 'orang_tua') {
      const sid = loggedInUserId || 'C-ADRIEL';
      const child = allChildren.find(c => c.id === sid);
      return {
        id: sid,
        name: child?.name || (userRole === 'siswa' ? (loggedInUser?.name || 'Adriel Djulian Putra Aditya') : 'Adriel Djulian Putra Aditya')
      };
    }
    return { id: loggedInUserId || 'C-ADRIEL', name: loggedInUser?.name || 'Adriel Djulian Putra Aditya' };
  }, [userRole, loggedInUserId, allChildren, loggedInUser]);

  // Synchronize unread notifications count for header badge
  useEffect(() => {
    try {
      const allNotifs = getStoredNotifications();
      const userNotifs = filterNotificationsForUser(
        allNotifs,
        userRole,
        activeStudentForNotification.id,
        activeStudentForNotification.name
      );
      const count = Array.isArray(userNotifs) ? userNotifs.filter(n => n && !n.isRead).length : 0;
      setUnreadNotificationsCount(count);
    } catch (e) {
      console.error('Error computing unread count:', e);
    }
  }, [userRole, activeStudentForNotification]);

  useEffect(() => {
    const handleCountChange = (e: any) => {
      if (typeof e?.detail === 'number') {
        setUnreadNotificationsCount(e.detail);
      }
    };
    window.addEventListener('pelangi360_unread_notifications_count', handleCountChange);
    return () => window.removeEventListener('pelangi360_unread_notifications_count', handleCountChange);
  }, []);

  const visibleChildren = useMemo<MasterChild[]>(() => {
    if (userRole === 'admin' || userRole === 'manager' || userRole === 'super_admin' || userRole === 'keuangan' || userRole === 'assessor') {
      return allChildren;
    }
    if (userRole === 'siswa') {
      return allChildren.filter(c => c.id === loggedInUserId);
    }
    if (userRole === 'orang_tua') {
      return allChildren.filter(c => c.id === loggedInUserId || c.id === 'C-ADRIEL');
    }
    if (userRole === 'terapis') {
      const assignedChildIds = new Set<string>();
        allChildren.forEach(child => {
            if (child.recurringSessions?.some(s => s.therapistId === loggedInUserId || !s.therapistId || s.therapistId === 'any')) {
                assignedChildIds.add(child.id);
            }
        });
      return allChildren.filter(c => assignedChildIds.has(c.id));
    }
    return [];
  }, [userRole, loggedInUserId, allChildren]);

  const visibleAssessmentReports = useMemo(() => {
      if (userRole === 'siswa') {
          return assessmentReports.filter(r => r.childId === loggedInUserId);
      }
      return assessmentReports;
  }, [userRole, loggedInUserId, assessmentReports]);

  const dataForSelectedDate = useMemo<Child[]>(() => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    const dayIndex = selectedDate.getDay();
    const dayOfWeek = daysOfWeek[dayIndex === 0 ? 6 : dayIndex - 1];
    const recordsForDate = attendanceRecords[dateKey] || {};
    const notesForDate = attendanceNotes[dateKey] || {};

    const fullDaySchedule: Child[] = [];
    const childMap: { [id: string]: Child } = {};

    allChildren.forEach(masterChild => {
        if (masterChild.status === 'Non-Aktif') return;

        masterChild.recurringSessions?.forEach(recSession => {
            if (recSession.day === dayOfWeek) {
                if (!childMap[masterChild.id]) {
                    const newChildEntry: Child = { ...masterChild, sessions: [] };
                    childMap[masterChild.id] = newChildEntry;
                    fullDaySchedule.push(newChildEntry);
                }

                let assignedTherapistId = recSession.therapistId;
                if (!assignedTherapistId || assignedTherapistId === 'any') {
                    const availableTherapists = allTherapists.filter(t => t.specialties.includes(recSession.type as string));
                    assignedTherapistId = availableTherapists.length > 0
                        ? availableTherapists[Math.floor(Math.random() * availableTherapists.length)].id
                        : allTherapists[0]?.id || 'T-UNKNOWN';
                }

                const sessionId = `s-recur-${masterChild.id}-${dayOfWeek.replace(/\s/g, '')}-${recSession.time}`;
                const status = recordsForDate[sessionId] || AttendanceStatus.PENDING;
                const noteVal = notesForDate[sessionId];
                
                let noteText = '';
                let photoUrls: string[] = [];
                let detailedProgress: DetailedProgress | undefined = undefined;
                let audioUrl: string | undefined = undefined;
                let audioDuration: number | undefined = undefined;

                if (noteVal) {
                    if (typeof noteVal === 'string') {
                        noteText = noteVal;
                    } else {
                        noteText = noteVal.note || '';
                        photoUrls = noteVal.photoUrls || [];
                        detailedProgress = noteVal.detailedProgress;
                        audioUrl = noteVal.audioUrl;
                        audioDuration = noteVal.audioDuration;
                    }
                }

                const newSession: TherapySession = {
                    id: sessionId,
                    type: recSession.type,
                    therapistId: assignedTherapistId,
                    time: recSession.time,
                    status: status,
                    note: noteText,
                    photoUrls: photoUrls,
                    audioUrl: audioUrl,
                    audioDuration: audioDuration,
                    detailedProgress: detailedProgress,
                };
                
                childMap[masterChild.id].sessions.push(newSession);
            }
        });

        // Add extra non-recurring daily sessions
        const extraSessionsForChild = extraDailySessions[dateKey]?.[masterChild.id];
        if (extraSessionsForChild) {
            if (!childMap[masterChild.id]) {
                const newChildEntry: Child = { ...masterChild, sessions: [] };
                childMap[masterChild.id] = newChildEntry;
                fullDaySchedule.push(newChildEntry);
            }
            
            // Merge with notes from attendanceNotes
            const processedExtraSessions = extraSessionsForChild.map(session => {
                const noteVal = notesForDate[session.id];
                let noteText = session.note || '';
                let photoUrls = session.photoUrls || [];
                let detailedProgress = session.detailedProgress;
                let audioUrl = session.audioUrl;
                let audioDuration = session.audioDuration;
                const status = recordsForDate[session.id] || session.status;

                if (noteVal) {
                    if (typeof noteVal === 'string') {
                        noteText = noteVal;
                    } else {
                        noteText = noteVal.note || '';
                        photoUrls = noteVal.photoUrls || [];
                        detailedProgress = noteVal.detailedProgress;
                        audioUrl = noteVal.audioUrl !== undefined ? noteVal.audioUrl : audioUrl;
                        audioDuration = noteVal.audioDuration !== undefined ? noteVal.audioDuration : audioDuration;
                    }
                }

                return {
                    ...session,
                    status,
                    note: noteText,
                    photoUrls,
                    audioUrl,
                    audioDuration,
                    detailedProgress
                };
            });

            childMap[masterChild.id].sessions = [...childMap[masterChild.id].sessions, ...processedExtraSessions];
        }
    });

    fullDaySchedule.forEach(child => child.sessions.sort((a, b) => a.time.localeCompare(b.time)));
    fullDaySchedule.sort((a, b) => a.name.localeCompare(b.name));

    if (userRole === 'admin' || userRole === 'manager' || userRole === 'super_admin' || userRole === 'keuangan' || userRole === 'assessor') {
        return fullDaySchedule;
    }
    if (userRole === 'siswa') {
        return fullDaySchedule.filter(c => c.id === loggedInUserId);
    }
    if (userRole === 'orang_tua') {
        return fullDaySchedule.filter(c => c.id === loggedInUserId || c.id === 'C-ADRIEL');
    }
    if (userRole === 'terapis') {
        return fullDaySchedule
            .map(child => ({
                ...child,
                sessions: child.sessions.filter(s => s.therapistId === loggedInUserId),
            }))
            .filter(child => child.sessions.length > 0);
    }
    return fullDaySchedule;
  }, [selectedDate, allChildren, allTherapists, attendanceRecords, attendanceNotes, userRole, loggedInUserId]);

  // New Logic: Calculate Daily Schedule Count
  const scheduledTodayCount = useMemo(() => {
    return dataForSelectedDate.reduce((total, child) => total + child.sessions.length, 0);
  }, [dataForSelectedDate]);


  // New Logic: Calculate Projected Monthly Sessions
  const projectedMonthlySessions = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let total = 0;

    for (let d = 1; d <= daysInMonth; d++) {
        const currentDayDate = new Date(year, month, d);
        const dayIndex = currentDayDate.getDay();
        const dayName = daysOfWeek[dayIndex === 0 ? 6 : dayIndex - 1];

        // Only count for admin to see total load. For specific roles, we might filter, but typically stats show full view for admin.
        if (userRole === 'admin') {
             allChildren.forEach(child => {
                if (child.status === 'Non-Aktif') return;
                const count = child.recurringSessions?.filter(s => s.day === dayName).length || 0;
                total += count;
            });
        } else if (userRole === 'terapis') {
             allChildren.forEach(child => {
                 if (child.status === 'Non-Aktif') return;
                 const count = child.recurringSessions?.filter(s => s.day === dayName && (s.therapistId === loggedInUserId || !s.therapistId || s.therapistId === 'any')).length || 0;
                 total += count;
             });
        } else if (userRole === 'siswa') {
             allChildren.filter(c => c.id === loggedInUserId).forEach(child => {
                 const count = child.recurringSessions?.filter(s => s.day === dayName).length || 0;
                 total += count;
             });
        }
    }
    return total;
  }, [selectedDate, allChildren, userRole, loggedInUserId]);

  
  const weeklyData = useMemo<WeeklyData[]>(() => {
    return daysOfWeek.map(day => {
      const dayData: WeeklyData = { day };
      therapyTypes.forEach(therapy => { dayData[therapy.id] = 0; });

      const dayIndex = daysOfWeek.indexOf(day);
      const today = new Date();
      const diff = today.getDay() - (dayIndex + 1);
      const dateForDay = new Date(today.setDate(today.getDate() - diff));
      const dateKey = dateForDay.toISOString().split('T')[0];

      visibleChildren.forEach(child => {
        child.recurringSessions?.forEach(recSession => {
          if (recSession.day === day) {
            const sessionId = `s-recur-${child.id}-${day.replace(/\s/g, '')}-${recSession.time}`;
            const status = attendanceRecords[dateKey]?.[sessionId] || AttendanceStatus.PENDING; // Could be PENDING too
            if (status === AttendanceStatus.PRESENT) {
              if (userRole === 'terapis' && recSession.therapistId && recSession.therapistId !== loggedInUserId) {
                  return;
                }
                dayData[recSession.type] = (dayData[recSession.type] as number) + 1;
              }
            }
          });
      });
      return dayData;
    });
  }, [attendanceRecords, therapyTypes, visibleChildren, userRole, loggedInUserId]);


  const handleSaveTherapyProgram = useCallback((program: TherapyProgram) => {
    setTherapyPrograms(prev => {
        const index = prev.findIndex(p => p.childId === program.childId);
        let updated;
        if (index >= 0) {
            updated = [...prev];
            updated[index] = program;
        } else {
            updated = [...prev, program];
        }
        localStorage.setItem('therapyPrograms', JSON.stringify(updated));
        return updated;
    });
  }, []);

  const handleStatCardClick = useCallback((type: 'present' | 'absent' | 'total' | 'attendanceRate' | 'therapists') => {
    let title = '';
    let list: (Child | Therapist)[] = [];
    const formattedDate = selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
    switch(type) {
      case 'present':
        title = `Siswa Hadir - ${formattedDate}`;
        list = dataForSelectedDate.filter(child => child.sessions.some(s => s.status === AttendanceStatus.PRESENT));
        break;
      case 'absent':
        title = `Siswa Absen - ${formattedDate}`;
        list = dataForSelectedDate.filter(child => child.sessions.some(s => s.status === AttendanceStatus.ABSENT));
        break;
      case 'total': case 'attendanceRate':
        title = `Jadwal Sesi Hari Ini (${formattedDate})`;
        list = dataForSelectedDate;
        break;
      case 'therapists':
        title = 'Total Terapis Terdaftar';
        list = allTherapists;
        break;
    }
    setDetailsModalData({ isOpen: true, title, list });
  }, [dataForSelectedDate, selectedDate, visibleChildren, allTherapists]);

  const handleAddChild = useCallback((name: string) => {
    const statuses = Object.values(AssessmentStatus);
    const newChild: MasterChild = {
      id: `C${101 + allChildren.length}`,
      name,
      photoUrl: `https://i.pravatar.cc/100?u=${name.replace(/\s/g, '')}`,
      recurringSessions: [],
      assessmentStatus: statuses[0],
      status: 'Aktif',
    };
    const updatedChildren = [...allChildren, newChild].sort((a, b) => a.name.localeCompare(b.name));
    setAllChildren(updatedChildren);
    ensureStudentFoldersExist(newChild.id, newChild.name, 'Admin');
  }, [allChildren]);

  const handleAddMultipleChildren = useCallback((newChildrenData: Omit<MasterChild, 'id'>[]) => {
    const statuses = Object.values(AssessmentStatus);
    
    let updatedChildren = allChildren.slice(); // Create a mutable copy
    let currentIdCounter = 101 + updatedChildren.length;

    newChildrenData.forEach(newChildInfo => {
        const newChild: MasterChild = {
            id: `C${currentIdCounter++}`,
            name: newChildInfo.name,
            photoUrl: newChildInfo.photoUrl || `https://i.pravatar.cc/100?u=${newChildInfo.name.replace(/\s/g, '')}`,
            recurringSessions: newChildInfo.recurringSessions || [],
            assessmentStatus: newChildInfo.assessmentStatus || statuses[0],
            birthDate: newChildInfo.birthDate,
            gender: newChildInfo.gender,
            className: newChildInfo.className,
            parentName: newChildInfo.parentName,
            motherName: newChildInfo.motherName,
            address: newChildInfo.address,
            username: newChildInfo.username,
            password: newChildInfo.password,
            status: 'Aktif',
        };
        updatedChildren.push(newChild);
    });
    
    updatedChildren = updatedChildren.sort((a, b) => a.name.localeCompare(b.name));

    setAllChildren(updatedChildren);

  }, [allChildren]);

  const handleDeleteChild = useCallback((childId: string) => {
    const updatedChildren = allChildren.filter(c => c.id !== childId);
    setAllChildren(updatedChildren);

    // Also clean up therapy programs
    setTherapyPrograms(prev => {
      const filtered = prev.filter(p => p.childId !== childId);
      try {
        localStorage.setItem('therapyPrograms', JSON.stringify(filtered));
      } catch (e) {}
      return filtered;
    });

    // Also clean up assessment reports
    setAssessmentReports(prev => prev.filter(r => r.childId !== childId));
  }, [allChildren]);

  const handleUpdateChild = useCallback((childId: string, updates: Partial<Omit<MasterChild, 'id'>>) => {
    let updatedChild: MasterChild | undefined;
    const updatedAllChildren = allChildren.map(child => {
        if (child.id === childId) {
            updatedChild = { ...child, ...updates };
            return updatedChild;
        }
        return child;
    }).sort((a, b) => a.name.localeCompare(b.name));
    
    setAllChildren(updatedAllChildren);

  }, [allChildren]);

  const handleAddTherapist = useCallback((data: string | (Partial<Therapist> & { name: string })) => {
    const name = typeof data === 'string' ? data : data.name;
    const extra: Partial<Therapist> = typeof data === 'object' ? data : {};
    const newId = `T${11 + allTherapists.length}`;
    const standardDays = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const workingDays = extra.workingDays || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    const standardSlots = [
      '08:00 - 09:00',
      '09:00 - 10:00',
      '10:00 - 11:00',
      '11:00 - 12:00',
      '13:00 - 14:00',
      '14:00 - 15:00',
      '15:00 - 16:00'
    ];
    const scheduleDays = extra.scheduleDays || standardDays.map(day => ({
      day,
      active: workingDays.includes(day),
      startTime: '08:00',
      endTime: '16:00',
      timeSlots: workingDays.includes(day) ? standardSlots : [],
      room: extra.defaultRoom || 'Ruang Terapi'
    }));

    const newTherapist: Therapist = {
      id: newId,
      name,
      photoUrl: extra.photoUrl || `https://i.pravatar.cc/100?u=therapist${allTherapists.length + 1}_${Date.now()}`,
      specialties: extra.specialties || (therapyTypes[0] ? [therapyTypes[0].id] : ['OT']),
      title: extra.title || 'Praktisi Terapi',
      phone: extra.phone || '',
      email: extra.email || '',
      status: extra.status || 'Aktif',
      workingDays,
      scheduleDays,
      defaultRoom: extra.defaultRoom || 'Ruang Terapi',
      maxClientsPerDay: extra.maxClientsPerDay || 6,
      bio: extra.bio || '',
      username: extra.username || `terapis${allTherapists.length + 1}`,
      password: extra.password || 'password',
      joinedDate: new Date().toISOString().split('T')[0]
    };
    const updatedTherapists = [...allTherapists, newTherapist];
    setAllTherapists(updatedTherapists);
    try {
      localStorage.setItem('allTherapists', JSON.stringify(updatedTherapists));
    } catch (e) {}
  }, [allTherapists, therapyTypes]);

  const handleDeleteTherapist = useCallback((therapistId: string) => {
    const updatedTherapists = allTherapists.filter(t => t.id !== therapistId);
    setAllTherapists(updatedTherapists);
    try {
      localStorage.setItem('allTherapists', JSON.stringify(updatedTherapists));
    } catch (e) {}
  }, [allTherapists]);

  const handleUpdateTherapist = useCallback((therapistId: string, updates: Partial<Omit<Therapist, 'id'>>) => {
    const updatedTherapists = allTherapists.map(therapist => 
      therapist.id === therapistId ? { ...therapist, ...updates } : therapist
    );
    setAllTherapists(updatedTherapists);
    try {
      localStorage.setItem('allTherapists', JSON.stringify(updatedTherapists));
    } catch (e) {}
  }, [allTherapists]);

  const handleAddTherapyType = useCallback((name: string) => {
    const id = name.trim().toUpperCase().replace(/\s/g, '_');
    if (!name.trim() || therapyTypes.some(t => t.id === id)) { alert('Nama terapi tidak valid atau sudah ada.'); return; }
    const newTherapy: TherapyDefinition = { id, name: name.trim(), Icon: DefaultTherapyIcon, color: colorPalette[therapyTypes.length % colorPalette.length] };
    const updatedTherapyTypes = [...therapyTypes, newTherapy];
    setTherapyTypes(updatedTherapyTypes);
  }, [therapyTypes]);

  const handleUpdateTherapyType = useCallback((id: string, name: string) => {
    if (!name.trim()) return;
    setTherapyTypes(prev => prev.map(t => t.id === id ? { ...t, name: name.trim() } : t));
  }, []);
  
  const handleDeleteTherapyType = useCallback((therapyId: string) => {
    const isUsed = allChildren.some(child => child.recurringSessions?.some(session => session.type === therapyId))
      || allTherapists.some(t => t.specialties.includes(therapyId));
    if (isUsed) { alert('Tipe terapi ini tidak dapat dihapus karena digunakan oleh siswa atau terapis.'); return; }
    const updatedTherapyTypes = therapyTypes.filter(t => t.id !== therapyId);
    setTherapyTypes(updatedTherapyTypes);
  }, [allChildren, allTherapists, therapyTypes]);

  const handleStatusChange = useCallback((childId: string, sessionId: string, newStatus: AttendanceStatus) => {
    const isoKey = selectedDate.toISOString().split('T')[0];
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    const localKey = `${y}-${m}-${d}`;

    setAttendanceRecords(prev => {
        const newRecords = { ...prev };
        const dateRecords = newRecords[localKey] ? { ...newRecords[localKey] } : (newRecords[isoKey] ? { ...newRecords[isoKey] } : {});
        dateRecords[sessionId] = newStatus;
        newRecords[localKey] = dateRecords;
        newRecords[isoKey] = dateRecords; // Store under both to ensure 100% reliable real-time presensi
        localStorage.setItem('attendanceRecords', JSON.stringify(newRecords));
        return newRecords;
    });
  }, [selectedDate]);

  const handleOpenEditSessionModal = useCallback((childId: string, sessionId: string) => setEditingSession({ childId, sessionId }), []);
  const handleCloseEditSessionModal = useCallback(() => setEditingSession(null), []);
  
  const handleUpdateSession = useCallback((childId: string, sessionId: string, updates: { type?: string; time?: string; note?: string; photoUrls?: string[]; audioUrl?: string; audioDuration?: number; detailedProgress?: DetailedProgress; therapistId?: string }) => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    
    setAttendanceNotes(prev => {
        const newNotes = { ...prev };
        const dateNotes = { ...(newNotes[dateKey] || {}) };
        
        const existing = dateNotes[sessionId];
        let existingObj = { note: '', photoUrls: [] as string[], audioUrl: undefined as string | undefined, audioDuration: undefined as number | undefined, detailedProgress: undefined as DetailedProgress | undefined, type: '', therapistId: '' };
        
        if (existing) {
            if (typeof existing === 'string') {
                existingObj.note = existing;
            } else {
                existingObj.note = existing.note || '';
                existingObj.photoUrls = existing.photoUrls || [];
                existingObj.audioUrl = existing.audioUrl;
                existingObj.audioDuration = existing.audioDuration;
                existingObj.detailedProgress = existing.detailedProgress;
                existingObj.type = (existing as any).type || '';
                existingObj.therapistId = (existing as any).therapistId || '';
            }
        }

        const updatedNote = updates.note !== undefined ? updates.note : existingObj.note;
        const updatedPhotos = updates.photoUrls !== undefined ? updates.photoUrls : existingObj.photoUrls;
        const updatedAudioUrl = updates.audioUrl !== undefined ? updates.audioUrl : existingObj.audioUrl;
        const updatedAudioDuration = updates.audioDuration !== undefined ? updates.audioDuration : existingObj.audioDuration;
        const updatedProgress = updates.detailedProgress !== undefined ? updates.detailedProgress : existingObj.detailedProgress;
        const updatedType = updates.type !== undefined ? updates.type : existingObj.type;
        const updatedTherapist = updates.therapistId !== undefined ? updates.therapistId : existingObj.therapistId;

        dateNotes[sessionId] = {
            note: updatedNote,
            photoUrls: updatedPhotos,
            audioUrl: updatedAudioUrl,
            audioDuration: updatedAudioDuration,
            detailedProgress: updatedProgress,
            type: updatedType,
            therapistId: updatedTherapist
        };
        
        newNotes[dateKey] = dateNotes;
        localStorage.setItem('attendanceNotes', JSON.stringify(newNotes));
        return newNotes;
    });

    console.log("Updated session details for", dateKey, updates);
    handleCloseEditSessionModal();
  }, [selectedDate, handleCloseEditSessionModal]);

  const handleUpdateSessionWithDate = useCallback((dateKey: string, sessionId: string, updates: { type?: string; note?: string; photoUrls?: string[]; audioUrl?: string; audioDuration?: number; detailedProgress?: DetailedProgress; therapistId?: string }) => {
    setAttendanceNotes(prev => {
        const newNotes = { ...prev };
        const dateNotes = { ...(newNotes[dateKey] || {}) };
        
        const existing = dateNotes[sessionId];
        let existingObj = { note: '', photoUrls: [] as string[], audioUrl: undefined as string | undefined, audioDuration: undefined as number | undefined, detailedProgress: undefined as DetailedProgress | undefined, type: 'OT', therapistId: '' };
        
        if (existing) {
            if (typeof existing === 'string') {
                existingObj.note = existing;
            } else {
                existingObj.note = existing.note || '';
                existingObj.photoUrls = existing.photoUrls || [];
                existingObj.audioUrl = existing.audioUrl;
                existingObj.audioDuration = existing.audioDuration;
                existingObj.detailedProgress = existing.detailedProgress;
                existingObj.type = (existing as any).type || 'OT';
                existingObj.therapistId = (existing as any).therapistId || '';
            }
        }

        const updatedNote = updates.note !== undefined ? updates.note : existingObj.note;
        const updatedPhotos = updates.photoUrls !== undefined ? updates.photoUrls : existingObj.photoUrls;
        const updatedAudioUrl = updates.audioUrl !== undefined ? updates.audioUrl : existingObj.audioUrl;
        const updatedAudioDuration = updates.audioDuration !== undefined ? updates.audioDuration : existingObj.audioDuration;
        const updatedProgress = updates.detailedProgress !== undefined ? updates.detailedProgress : existingObj.detailedProgress;
        const updatedType = updates.type !== undefined ? updates.type : existingObj.type;
        const updatedTherapist = updates.therapistId !== undefined ? updates.therapistId : existingObj.therapistId;

        dateNotes[sessionId] = {
            note: updatedNote,
            photoUrls: updatedPhotos,
            audioUrl: updatedAudioUrl,
            audioDuration: updatedAudioDuration,
            detailedProgress: updatedProgress,
            type: updatedType,
            therapistId: updatedTherapist
        };
        
        newNotes[dateKey] = dateNotes;
        localStorage.setItem('attendanceNotes', JSON.stringify(newNotes));
        return newNotes;
    });
  }, []);

  const handleDeleteAttendanceNote = useCallback((dateKey: string, sessionId: string) => {
    setAttendanceNotes(prev => {
        if (!prev[dateKey] || !prev[dateKey][sessionId]) return prev;
        const newNotes = { ...prev };
        const dateNotes = { ...newNotes[dateKey] };
        delete dateNotes[sessionId];
        if (Object.keys(dateNotes).length === 0) {
            delete newNotes[dateKey];
        } else {
            newNotes[dateKey] = dateNotes;
        }
        localStorage.setItem('attendanceNotes', JSON.stringify(newNotes));
        return newNotes;
    });
  }, []);

  const handleDeleteSession = useCallback((childId: string, sessionId: string) => {
    console.log("Session deletion for a specific day is not implemented in this version.", { childId, sessionId });
    handleCloseEditSessionModal();
  }, [handleCloseEditSessionModal]);
  
  const handleAddDailySession = useCallback((childId: string, session: Omit<TherapySession, 'id' | 'status'>, dateString: string) => {
      const date = new Date(dateString);
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      const correctedDate = new Date(date.getTime() + userTimezoneOffset);
      const dateKey = correctedDate.toISOString().split('T')[0];
      
      const newSession: TherapySession = {
          ...session,
          id: `s-man-${childId}-${Date.now()}`,
          status: AttendanceStatus.PENDING
      };

      setExtraDailySessions(prev => {
          const newDates = { ...prev };
          const dateEntries = newDates[dateKey] ? { ...newDates[dateKey] } : {};
          const childSessions = dateEntries[childId] ? [...dateEntries[childId]] : [];
          childSessions.push(newSession);
          dateEntries[childId] = childSessions;
          newDates[dateKey] = dateEntries;
          localStorage.setItem('extraDailySessions', JSON.stringify(newDates));
          return newDates;
      });
  }, []);

  const handleUpdatePaymentStatus = useCallback((childId: string, monthYear: string, status: 'Lunas' | 'Belum Lunas') => {
    setAllChildren(prev =>
      prev.map(child => {
        if (child.id === childId) {
          return {
            ...child,
            paymentHistory: {
              ...(child.paymentHistory || {}),
              [monthYear]: status,
            },
          };
        }
        return child;
      })
    );
  }, []);

  const handleUpdateFinancialData = (academicYearId: string, updatedData: FinancialRecord[]) => {
    setFinancialData(prevData => ({
      ...prevData,
      [academicYearId]: updatedData,
    }));
  };

  const handleUpdateIncomeData = (academicYearId: string, updatedData: IncomeRecord[]) => {
    setIncomeReportData(prevData => {
        const newData = {
            ...prevData,
            [academicYearId]: updatedData,
        };

        setFinancialData(prevFinData => {
            const newFinData = { ...prevFinData };
            if (newFinData[academicYearId]) {
                newFinData[academicYearId] = newFinData[academicYearId].map((finRecord, index) => {
                    const matchingIncomeRecord = updatedData[index];
                    if (matchingIncomeRecord && matchingIncomeRecord.month === finRecord.month) {
                         return { ...finRecord, income: matchingIncomeRecord.income };
                    }
                    return finRecord;
                });
            }
            return newFinData;
        });

        return newData;
    });
  };

  const handleUpdateAssessmentStatus = useCallback((childId: string, newStatus: AssessmentStatus) => {
    setAllChildren(prevChildren => 
        prevChildren.map(child => 
            child.id === childId ? { ...child, assessmentStatus: newStatus } : child
        )
    );
  }, []);
  
  const handleAddAssessmentReport = useCallback((report: Omit<AssessmentReport, 'id'>) => {
    const newReport: AssessmentReport = {
        ...report,
        id: `AR${Date.now()}`,
    };
    setAssessmentReports(prev => [...prev, newReport]);
  }, []);

  const handleUpdateAssessmentReport = useCallback((updatedReport: AssessmentReport) => {
      setAssessmentReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
  }, []);

  const handleDeleteAssessmentReport = useCallback((reportId: string) => {
      setAssessmentReports(prev => prev.filter(r => r.id !== reportId));
  }, []);

  // User Profile Management Handlers (Sync across system and database)
  const handleSaveUserProfile = async (updated: { fullName: string; displayName?: string; email: string; phone: string; photoUrl?: string }) => {
    try {
      const targetId = currentAccount?.id || loggedInUserId || loggedInUser.id;
      const res = updateUserProfile({
        userId: targetId,
        fullName: updated.fullName,
        displayName: updated.displayName,
        email: updated.email,
        phone: updated.phone,
        photoUrl: updated.photoUrl !== undefined ? updated.photoUrl : (currentAccount?.photoUrl || loggedInUser.photoUrl)
      });

      if (res.success && res.user) {
        // 1. Update active account ID
        setActiveAccountId(res.user.id);
        try {
          localStorage.setItem('pelangi360_active_account_id', res.user.id);
        } catch (e) {}

        // 2. Refresh stored users state
        const refreshedUsers = getStoredUsers();
        setStoredUsers(refreshedUsers);

        // 3. Synchronize therapist state and localStorage if applicable
        if (res.user.role === 'terapis' || userRole === 'terapis') {
          setAllTherapists(prev => {
            const updatedList = prev.map(t => {
              if (t.id === loggedInUserId || t.id === res.user?.linkedEntityId || t.name === currentAccount?.fullName) {
                return {
                  ...t,
                  name: updated.fullName,
                  email: updated.email || t.email,
                  phone: updated.phone || t.phone,
                  photoUrl: updated.photoUrl !== undefined ? updated.photoUrl : t.photoUrl
                };
              }
              return t;
            });
            try {
              localStorage.setItem('allTherapists', JSON.stringify(updatedList));
            } catch (e) {}
            return updatedList;
          });
        }

        // 4. Synchronize child state if applicable
        if (res.user.role === 'siswa' || userRole === 'siswa') {
          setAllChildren(prev => {
            return prev.map(c => {
              if (c.id === loggedInUserId || c.id === res.user?.linkedEntityId) {
                return {
                  ...c,
                  name: updated.fullName,
                  photoUrl: updated.photoUrl !== undefined ? updated.photoUrl : c.photoUrl
                };
              }
              return c;
            });
          });
        }

        return { success: true, message: 'Profil berhasil diperbarui.', user: res.user };
      }
      return { success: false, message: res.message || 'Gagal menyimpan profil. Silakan coba kembali.' };
    } catch (err: any) {
      console.error('Error in handleSaveUserProfile:', err);
      return { success: false, message: 'Gagal menyimpan profil. Silakan coba kembali.' };
    }
  };

  const handleSaveUserPhoto = async (newPhotoUrl: string) => {
    try {
      const targetId = currentAccount?.id || loggedInUserId || loggedInUser.id;
      const res = updateUserProfile({
        userId: targetId,
        fullName: currentAccount?.fullName || loggedInUser.fullName || loggedInUser.name,
        displayName: currentAccount?.displayName || loggedInUser.displayName,
        email: currentAccount?.email || loggedInUser.email || '',
        phone: currentAccount?.phone || loggedInUser.phone || '',
        photoUrl: newPhotoUrl
      });

      if (res.success && res.user) {
        setActiveAccountId(res.user.id);
        try {
          localStorage.setItem('pelangi360_active_account_id', res.user.id);
        } catch (e) {}

        const refreshedUsers = getStoredUsers();
        setStoredUsers(refreshedUsers);

        if (res.user.role === 'terapis' || userRole === 'terapis') {
          setAllTherapists(prev => {
            const updatedList = prev.map(t => {
              if (t.id === loggedInUserId || t.id === res.user?.linkedEntityId) {
                return { ...t, photoUrl: newPhotoUrl };
              }
              return t;
            });
            try {
              localStorage.setItem('allTherapists', JSON.stringify(updatedList));
            } catch (e) {}
            return updatedList;
          });
        }

        if (res.user.role === 'siswa' || userRole === 'siswa') {
          setAllChildren(prev => {
            return prev.map(c => {
              if (c.id === loggedInUserId || c.id === res.user?.linkedEntityId) {
                return { ...c, photoUrl: newPhotoUrl };
              }
              return c;
            });
          });
        }

        return { success: true, message: 'Foto profil berhasil diperbarui.', user: res.user };
      }
      return { success: false, message: res.message || 'Gagal menyimpan foto profil.' };
    } catch (err: any) {
      console.error('Error in handleSaveUserPhoto:', err);
      return { success: false, message: 'Gagal menyimpan foto profil.' };
    }
  };

  const handleDeleteUserPhoto = async () => {
    return handleSaveUserPhoto('');
  };

  const handleSaveUserPassword = (oldPassword: string, newPassword: string) => {
    const targetId = currentAccount?.id || loggedInUserId || loggedInUser.id;
    const res = updateUserPassword(targetId, oldPassword, newPassword);
    if (res.success) {
      setStoredUsers(getStoredUsers());
    }
    return res;
  };

  const handleAddAcademicYear = (newYearLabel: string) => {
      const parts = newYearLabel.split('/');
      if (parts.length !== 2) return;
      
      const startYear = parseInt(parts[0]);
      const endYear = parseInt(parts[1]);
      
      if(isNaN(startYear) || isNaN(endYear)) return;

      const id = `${startYear}-${endYear}`;

      setAcademicYears(prev => [...prev, { id, label: newYearLabel }]);
      
       setFinancialData(prevData => ({
          ...prevData,
          [id]: academicMonths.map(month => ({
              month,
              income: 0,
              expense: 0,
              expenseDetails: []
          }))
      }));

       setIncomeReportData(prevData => ({
          ...prevData,
          [id]: academicMonths.map(month => ({
              month,
              income: 0,
              incomeDetails: []
          }))
      }));
  };


  const filteredData = useMemo(() => dataForSelectedDate.filter(child => child.name.toLowerCase().includes(searchTerm.toLowerCase())), [dataForSelectedDate, searchTerm]);
  
  const todayDate = currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const todayTime = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const sessionToEdit = useMemo(() => {
    if (!editingSession) return null;
    const child = dataForSelectedDate.find(c => c.id === editingSession.childId);
    return child?.sessions.find(s => s.id === editingSession.sessionId) ?? null;
  }, [editingSession, dataForSelectedDate]);

  const childNameForModal = useMemo(() => (editingSession ? dataForSelectedDate.find(c => c.id === editingSession.childId)?.name ?? '' : ''), [editingSession, dataForSelectedDate]);
  
  const visibleSidebarMenu = useMemo(() => {
    return isEditing ? draftSidebarConfig : sidebarMenuConfig;
  }, [isEditing, draftSidebarConfig, sidebarMenuConfig]);
  
  const handleRestoreDatabase = (payload: any) => {
    if (!payload) return;
    if (Array.isArray(payload.children)) {
      setAllChildren(payload.children);
    }
    if (Array.isArray(payload.therapists)) {
      setAllTherapists(payload.therapists);
    }
    if (Array.isArray(payload.registrations)) {
      setRegistrations(payload.registrations);
      saveStoredRegistrations(payload.registrations);
    }
    if (payload.attendanceRecords && typeof payload.attendanceRecords === 'object') {
      setAttendanceRecords(payload.attendanceRecords);
    }
    if (payload.attendanceNotes && typeof payload.attendanceNotes === 'object') {
      setAttendanceNotes(payload.attendanceNotes);
    }
    if (payload.financialData && typeof payload.financialData === 'object') {
      setFinancialData(payload.financialData);
    }
    appendActivityLog({
      userId: loggedInUserId || 'USR-01',
      userName: loggedInUser?.name || 'Administrator',
      userRole: userRole || 'admin',
      actionType: 'UPDATE',
      description: 'Memulihkan database dari cadangan Google Drive',
      target: 'Google Workspace'
    });
  };

  const renderContent = () => {
    if (isLoading) return <div className="flex justify-center items-center h-full"><p className="text-lg text-text-muted">Memuat data...</p></div>;

    switch (activeView) {
      case 'googleWorkspace':
        return (
          <GoogleWorkspacePage
            childrenData={allChildren}
            therapistsData={allTherapists}
            registrationsData={registrations}
            attendanceRecords={attendanceRecords}
            attendanceNotes={attendanceNotes}
            financialData={financialData}
            therapyPrograms={therapyPrograms}
            targetUserEmail="asep@lazuardi.sch.id"
            onRestoreDatabase={handleRestoreDatabase}
            userRole={userRole}
            logoUrl={logoUrl}
          />
        );
      case 'manajemenAnak': return <ChildManagementPage children={allChildren} onAddChild={handleAddChild} onAddMultipleChildren={handleAddMultipleChildren} onUpdateChild={handleUpdateChild} onDeleteChild={handleDeleteChild} onAddDailySession={handleAddDailySession} therapyTypes={therapyTypes} therapyTimes={times} daysOfWeek={daysOfWeek} therapists={allTherapists} userRole={userRole} />;
      case 'manajemenPengguna': return (
        <UserManagementPage 
          children={allChildren} 
          onUpdateChild={handleUpdateChild} 
          therapists={allTherapists} 
          onUpdateTherapist={handleUpdateTherapist} 
          userRole={userRole}
          onNavigate={setActiveView}
          logoUrl={logoUrl}
        />
      );
      case 'papanJadwal': return <ScheduleBoardPage children={userRole === 'siswa' ? visibleChildren : allChildren} therapists={allTherapists} therapyTypes={therapyTypes} onUpdateChild={handleUpdateChild} userRole={userRole} />;
      case 'assesmentAnak': 
        return (
          <AssessmentPage 
            allChildren={visibleChildren} 
            onUpdateStatus={handleUpdateAssessmentStatus}
            therapists={allTherapists}
            therapyTypes={therapyTypes}
            registrations={registrations}
            onUpdateRegistration={handleUpdateRegistration}
            userRole={userRole}
            loggedInUserId={loggedInUserId}
            onNavigate={setActiveView}
            logoUrl={logoUrl}
          />
        );
      case 'manajemenTerapis': return (
        <TherapistManagementPage 
          therapists={allTherapists} 
          onAddTherapist={handleAddTherapist} 
          onUpdateTherapist={handleUpdateTherapist} 
          onDeleteTherapist={handleDeleteTherapist} 
          therapyTypes={therapyTypes} 
          userRole={userRole}
          allChildren={allChildren}
          logoUrl={logoUrl}
        />
      );
      case 'pusatLaporan': return (
        <ReportsHubPage 
            userRole={userRole} 
            onNavigate={setActiveView} 
            menuConfig={sidebarMenuConfig} 
            financialData={Object.values(financialData).flat()} 
            allChildren={allChildren} 
            allTherapists={allTherapists}
            therapyPrograms={therapyPrograms}
            registrations={registrations}
            strategicPlans={strategicPlans}
            incomeReportData={incomeReportData}
            weeklyData={weeklyData}
            therapyTypes={therapyTypes}
            attendanceRecords={attendanceRecords}
            attendanceNotes={attendanceNotes}
            logoUrl={logoUrl}
        />
      );
      case 'laporanPerkembangan': return <ReportsPage />;
      case 'rekapPerkembangan': return (
        <OverallProgressPage 
            children={allChildren}
            therapists={allTherapists}
            therapyTypes={therapyTypes}
            attendanceNotes={attendanceNotes}
            userRole={userRole}
            loggedInUserId={loggedInUserId}
            onUpdateSessionWithDate={handleUpdateSessionWithDate}
            onDeleteAttendanceNote={handleDeleteAttendanceNote}
        />
      );
      case 'laporanAssesment': return <AssessmentReportPage reports={visibleAssessmentReports} children={visibleChildren} therapists={allTherapists} onAddReport={handleAddAssessmentReport} onUpdateReport={handleUpdateAssessmentReport} onDeleteReport={handleDeleteAssessmentReport} logoUrl={logoUrl} therapyTypes={therapyTypes} userRole={userRole} />;
      case 'bukuCatatanTerapi': return (
        <TherapyNoteBookPage 
          children={dataForSelectedDate} 
          allChildren={userRole === 'siswa' || userRole === 'orang_tua' ? visibleChildren : allChildren}
          therapists={allTherapists} 
          therapyTypes={therapyTypes} 
          onUpdateSession={(childId, sessionId, updates) => handleUpdateSession(childId, sessionId, updates)} 
          onUpdateSessionWithDate={handleUpdateSessionWithDate}
          therapyPrograms={therapyPrograms} 
          attendanceNotes={attendanceNotes} 
          attendanceRecords={attendanceRecords}
          onNavigateToProgram={handleNavigateToProgramFromNotebook}
          logoUrl={logoUrl}
          userRole={userRole}
          loggedInUserId={loggedInUserId}
          loggedInUser={loggedInUser}
          daysOfWeek={daysOfWeek}
          onSelectDate={setSelectedDate}
        />
      );
      case 'rapot': return <RapotPage allChildren={allChildren} therapyTypes={therapyTypes} onAddTherapyType={handleAddTherapyType} logoUrl={logoUrl} userRole={userRole} />;
      case 'programTerapi': return (
        <TherapyProgramPage 
          children={userRole === 'siswa' ? visibleChildren : allChildren} 
          programs={therapyPrograms} 
          onSaveProgram={handleSaveTherapyProgram} 
          initialChildId={programInitialChildId}
          initialCategory={programInitialCategory}
          onBackToNotebook={handleBackToNotebook}
          userRole={userRole}
        />
      );
      case 'peraturanTerapi': return <TherapyRegulationsPage />;
      case 'dokumenSiswa':
        return (
          <StudentDocumentsPage
            userRole={userRole}
            currentStudentId={activeStudentForNotification.id}
            currentStudentName={activeStudentForNotification.name}
            currentUserName={loggedInUser.name}
            allChildren={allChildren}
            onNavigate={setActiveView}
            logoUrl={logoUrl}
          />
        );
      case 'daftarTamu': return <GuestManagementPage guests={guestRegistrations} onPromote={handlePromoteGuest} logoUrl={logoUrl} />;
      case 'balancedScorecard': return (
        <BalancedScorecardPage 
          financialData={Object.values(financialData).flat()} 
          allChildren={allChildren} 
          allTherapists={allTherapists} 
          userRole={userRole}
          logoUrl={logoUrl}
          therapyPrograms={therapyPrograms}
          attendanceRecords={attendanceRecords}
          guestRegistrations={guestRegistrations}
          onNavigate={setActiveView}
        />
      );
      case 'strategicPlan': return <StrategicPlanPage data={strategicPlans} onUpdate={setStrategicPlans} logoUrl={logoUrl} userRole={userRole} />;
      case 'laporanKeuangan': return <FinancialReportPage allData={financialData} academicYears={academicYears} onUpdateData={handleUpdateFinancialData} onAddAcademicYear={handleAddAcademicYear} logoUrl={logoUrl} />;
      case 'laporanPemasukan': return <IncomeReportPage allIncomeData={incomeReportData} onUpdateData={handleUpdateIncomeData} academicYears={academicYears} therapyTypes={therapyTypes} therapyCosts={therapyCosts} />;
      case 'tagihan': return <BillingPage allChildren={visibleChildren} therapyTypes={therapyTypes} logoUrl={logoUrl} onNavigate={setActiveView} userRole={userRole} onUpdatePaymentStatus={handleUpdatePaymentStatus} therapyCosts={therapyCosts} onUpdateCost={setTherapyCosts} />;
      case 'rekapKehadiran': return <AttendanceRecapPage allChildren={visibleChildren} attendanceRecords={attendanceRecords} attendanceNotes={attendanceNotes} onStatusChange={handleStatusChange} userRole={userRole} logoUrl={logoUrl} />;
      case 'pengaturan': return (
        <SettingsPage 
          therapyTypes={therapyTypes} 
          onAddTherapyType={handleAddTherapyType} 
          onUpdateTherapyType={handleUpdateTherapyType} 
          onDeleteTherapyType={handleDeleteTherapyType} 
          themes={themeList} 
          activeTheme={activeTheme} 
          onThemeChange={handleThemeChange} 
          onAddTheme={handleAddTheme}
          onDeleteTheme={handleDeleteTheme}
          gradientSettings={gradientSettings} 
          onGradientChange={setGradientSettings} 
          logoUrl={logoUrl} 
          onLogoChange={setLogoUrl}
          userRole={userRole}
          onNavigate={setActiveView}
        />
      );
      case 'tinjauanMingguan':
        return (
          <main className="p-8">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-2xl font-bold text-text-heading mb-6">Tinjauan Mingguan</h1>
              <WeeklyOverviewChart data={weeklyData} therapyTypes={therapyTypes} />
            </div>
          </main>
        );
      case 'rekomendasiProgram': return (
        <TherapyProgramPage 
          children={userRole === 'siswa' ? visibleChildren : allChildren} 
          programs={therapyPrograms} 
          onSaveProgram={handleSaveTherapyProgram} 
          initialChildId={programInitialChildId}
          initialCategory={programInitialCategory}
          onBackToNotebook={handleBackToNotebook}
        />
      );
      case 'kehadiranTerapis': return <AttendanceRecapPage allChildren={visibleChildren} attendanceRecords={attendanceRecords} attendanceNotes={attendanceNotes} logoUrl={logoUrl} />;
      case 'piutang': return <BillingPage allChildren={visibleChildren} therapyTypes={therapyTypes} logoUrl={logoUrl} onNavigate={setActiveView} userRole={userRole} onUpdatePaymentStatus={handleUpdatePaymentStatus} therapyCosts={therapyCosts} onUpdateCost={setTherapyCosts} />;
      case 'rolePermission': 
        return (
          <RolePermissionPage 
            currentUserRole={userRole} 
            currentUserId={loggedInUserId || 'USR-MGR-01'} 
            onNavigate={setActiveView}
            onPermissionsUpdated={(updated) => setRbacRoles(updated)}
          />
        );
      case 'masterData': return (
        <SettingsPage 
          therapyTypes={therapyTypes} 
          onAddTherapyType={handleAddTherapyType} 
          onUpdateTherapyType={handleUpdateTherapyType} 
          onDeleteTherapyType={handleDeleteTherapyType} 
          themes={themeList} 
          activeTheme={activeTheme} 
          onThemeChange={handleThemeChange} 
          onAddTheme={handleAddTheme}
          onDeleteTheme={handleDeleteTheme}
          gradientSettings={gradientSettings} 
          onGradientChange={setGradientSettings} 
          logoUrl={logoUrl} 
          onLogoChange={setLogoUrl}
          userRole={userRole}
          onNavigate={setActiveView}
        />
      );
      case 'registrasi':
        return (
          <RegistrationManagementPage
            registrations={registrations}
            onUpdateRegistration={handleUpdateRegistration}
            onDeleteRegistration={handleDeleteRegistration}
            onConvertToClient={handleConvertToClient}
            therapists={allTherapists}
            userRole={userRole}
            logoUrl={logoUrl}
            onNavigate={setActiveView}
          />
        );
      case 'editMenu':
        if (userRole !== 'manager') {
          return (
            <div className="p-6 sm:p-12 max-w-xl mx-auto my-12 bg-slate-900 border-2 border-rose-500/40 rounded-3xl text-center shadow-2xl">
              <Shield className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-white mb-2">Akses Dibatasi</h2>
              <p className="text-sm text-slate-300 mb-5">
                Menu <strong>Edit Menu & Teks</strong> hanya dapat diakses oleh akun dengan peran <strong>Manager</strong>.
              </p>
              <button 
                onClick={() => setActiveView('dashboard')} 
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Kembali ke Dasbor Utama
              </button>
            </div>
          );
        }
        return (
          <EditMenuPage 
            userRole={userRole} 
            onNavigate={setActiveView} 
            logoUrl={logoUrl} 
            onConfigUpdated={(cfg) => setMenuCustomizations(cfg)}
          />
        );
      case 'dashboardManager':
      case 'dashboard': default:
        return (
          <DashboardPage 
            allChildren={allChildren}
            therapists={allTherapists}
            therapyTypes={therapyTypes}
            currentTime={currentTime}
            dataForToday={dataForSelectedDate}
            user={{ 
                name: loggedInUser.name, 
                photoUrl: loggedInUser.photoUrl,
                role: userRole === 'manager'
                  ? 'Executive Manager'
                  : userRole === 'super_admin'
                  ? 'Super Administrator'
                  : userRole === 'admin' 
                  ? 'Administrator' 
                  : userRole === 'terapis' 
                  ? 'Therapist' 
                  : userRole === 'orang_tua'
                  ? 'Orang Tua (Parent)'
                  : userRole === 'keuangan'
                  ? 'Keuangan (Finance)'
                  : userRole === 'assessor'
                  ? 'Assessor Klinis'
                  : 'Siswa (Student)'
            }}
            userRole={userRole}
            loggedInUserId={loggedInUserId}
            therapyPrograms={therapyPrograms}
            onNavigate={setActiveView}
            onStatusChange={handleStatusChange}
            onEditSession={handleOpenEditSessionModal}
            onUpdateNote={(childId, sessionId, note) => handleUpdateSession(childId, sessionId, { note })}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            attendanceRecords={attendanceRecords}
            attendanceNotes={attendanceNotes}
            onOpenNotificationCenter={() => setIsNotificationOpen(true)}
            newRegistrationsCount={newRegistrationsCount}
          />
        );
    }
  };

  if (!isAuthenticated) {
    if (guestRegMode) {
      return <GuestRegistrationPage onBack={() => setGuestRegMode(false)} onSubmit={handleGuestSubmit} logoUrl={logoUrl} onLogoChange={setLogoUrl} />;
    }
    return <LoginPage 
      onLoginSuccess={handleLoginSuccess}
      onNavigateGuest={() => setGuestRegMode(true)}
      logoUrl={logoUrl}
      allChildren={allChildren}
      allTherapists={allTherapists}
      onLogoChange={setLogoUrl}
    />;
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-300 font-sans ${isDarkMode ? "bg-[#0F172A] text-slate-100" : "bg-slate-100 text-slate-900"}`}>
      <Sidebar 
        userRole={userRole} 
        activeView={activeView}
        onNavigate={setActiveView}
        logoUrl={logoUrl} 
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        allowedMenus={currentUserAllowedMenus}
        newRegistrationsCount={newRegistrationsCount}
      />
      
      <div className="flex-1 flex flex-col max-h-screen overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header className={`h-16 px-4 sm:px-6 flex items-center justify-between border-b shrink-0 z-30 ${isDarkMode ? "bg-[#0F172A] border-slate-800" : "bg-white border-slate-200 shadow-xs"}`}>
          {/* Left Zone: Hamburger + Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className={`md:hidden p-2 rounded-xl transition-colors ${isDarkMode ? "text-slate-400 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"}`}
              title="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-indigo-500">
                {menuCustomizations.brand.appTitle || 'Pelangi 360'}
              </span>
              <span className="opacity-40">/</span>
              <span className="font-semibold capitalize text-sm">
                {(menuCustomizations.menuLabels as any)[activeView] ||
                 (activeView === 'dashboard' ? 'Dasbor Utama' :
                  activeView === 'registrasi' ? 'Registrasi Calon Klien' :
                  activeView === 'papanJadwal' ? 'Jadwal Terapi' :
                  activeView === 'manajemenAnak' ? 'Manajemen Anak' :
                  activeView === 'assesmentAnak' ? 'Assessment Anak' :
                  activeView === 'bukuCatatanTerapi' ? 'Buku Catatan Terapi (EMR)' :
                  activeView === 'rapot' ? 'Rapor Terapi' :
                  activeView === 'programTerapi' ? 'Program Terapi' :
                  activeView === 'tagihan' ? 'Tagihan & Keuangan' :
                  activeView === 'rekapKehadiran' ? 'Rekap Kehadiran' :
                  activeView === 'manajemenTerapis' ? 'Manajemen SDM Terapis' :
                  activeView === 'pusatLaporan' ? 'Pusat Laporan & KPI' :
                  activeView === 'balancedScorecard' ? 'Balanced Scorecard' :
                  activeView === 'strategicPlan' ? 'Strategic Plan' :
                  activeView === 'rolePermission' ? 'Manajemen Role & Hak Akses' :
                  activeView === 'manajemenPengguna' ? 'Manajemen Pengguna' :
                  activeView === 'pengaturan' ? 'Pengaturan Sistem' :
                  activeView === 'editMenu' ? 'Edit Menu & Teks' :
                  activeView === 'googleWorkspace' ? 'Google Drive & Sheets' :
                  activeView)}
              </span>
            </div>
          </div>

          {/* Right Zone: Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Manager Exclusive Shortcut: Edit Menu & Teks */}
            {userRole === 'manager' && (
              <button
                onClick={() => setActiveView('editMenu')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeView === 'editMenu'
                    ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30"
                    : isDarkMode 
                      ? "bg-purple-950/40 border-purple-500/30 text-purple-300 hover:bg-purple-900/50 hover:text-white" 
                      : "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                }`}
                title="Buka Menu Edit untuk mengubah semua tulisan menu & halaman (Khusus Manager)"
              >
                <EditMenuIcon className="w-4 h-4 text-purple-400" />
                <span className="hidden md:inline">Edit Menu & Teks</span>
              </button>
            )}

            {/* Google Drive & Sheets Shortcut */}
            {(userRole === 'admin' || userRole === 'manager' || userRole === 'super_admin') && (
              <button
                onClick={() => setActiveView('googleWorkspace')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeView === 'googleWorkspace'
                    ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30"
                    : isDarkMode 
                      ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800" 
                      : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                }`}
                title="Integrasi Google Drive & Sheets"
              >
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Drive & Sheets</span>
              </button>
            )}

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-xl border transition-all text-xs font-medium flex items-center gap-1.5 ${
                isDarkMode 
                  ? "bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800" 
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
              title={isDarkMode ? "Ganti ke Mode Terang (Light Mode)" : "Ganti ke Mode Gelap (Dark Mode)"}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline text-[11px] font-semibold">{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>

            {/* Notification Center Trigger */}
            <button
              onClick={() => setIsNotificationOpen(prev => !prev)}
              className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
                isNotificationOpen
                  ? "ring-2 ring-indigo-500 bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
                  : isDarkMode 
                    ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800" 
                    : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
              title={userRole === 'siswa' ? "Notifikasi Siswa & Pengumuman" : "Pusat Notifikasi Operasional"}
              aria-label="Pusat Notifikasi"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                </span>
              ) : null}
            </button>

            {/* User Profile */}
            <div 
              onClick={() => setIsProfileModalOpen(true)}
              className={`flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-xl border cursor-pointer transition-all ${
                isDarkMode 
                  ? "bg-slate-900 border-slate-800 hover:border-slate-700" 
                  : "bg-slate-100 border-slate-200 hover:bg-slate-200"
              }`}
              title="Kelola Profil Pengguna"
            >
              {loggedInUser.photoUrl ? (
                <img
                  src={loggedInUser.photoUrl}
                  alt={loggedInUser.name}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-indigo-500/30"
                />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-600 text-white font-black text-xs flex items-center justify-center ring-1 ring-indigo-500/30 select-none">
                  {getInitials(loggedInUser.displayName || loggedInUser.fullName || loggedInUser.name)}
                </div>
              )}
              <div className="hidden sm:block text-left text-xs">
                <span className="font-bold block leading-tight truncate max-w-[100px]">
                  {loggedInUser.displayName || loggedInUser.name.split(' ')[0]}
                </span>
                <span className="text-[10px] opacity-70 capitalize">{userRole || 'Admin'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* View Content Viewport */}
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </div>
      
      {/* Floating Quick Action Button */}
      <QuickActionButton 
        onNavigate={setActiveView}
        onOpenAddChild={() => setActiveView('manajemenAnak')}
      />

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onNavigate={setActiveView}
        userRole={userRole}
        currentStudentId={activeStudentForNotification.id}
        currentStudentName={activeStudentForNotification.name}
        currentUserName={loggedInUser.name}
        onUnreadCountChange={setUnreadNotificationsCount}
        allChildren={allChildren}
        allTherapists={allTherapists}
      />

      <EditSessionModal 
        isOpen={!!editingSession} 
        session={sessionToEdit} 
        childName={childNameForModal}
        onClose={handleCloseEditSessionModal}
        onSave={(updates) => {
            if (editingSession) {
               handleUpdateSession(editingSession.childId, editingSession.sessionId, updates);
            }
        }}
        onDelete={() => {
            if (editingSession) {
                handleDeleteSession(editingSession.childId, editingSession.sessionId);
            }
        }}
        therapyTypes={therapyTypes}
        therapyTimes={times}
      />
      <DetailsModal 
        isOpen={detailsModalData.isOpen}
        onClose={() => setDetailsModalData({ ...detailsModalData, isOpen: false })}
        title={detailsModalData.title}
        list={detailsModalData.list}
      />
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={{
          id: currentAccount?.id || loggedInUserId || 'USR-CURRENT',
          fullName: currentAccount?.fullName || loggedInUser.fullName || loggedInUser.name,
          displayName: currentAccount?.displayName || loggedInUser.displayName,
          email: currentAccount?.email || loggedInUser.email || '',
          phone: currentAccount?.phone || loggedInUser.phone || '',
          photoUrl: currentAccount?.photoUrl || loggedInUser.photoUrl || '',
          role: userRole || 'Admin'
        }}
        onSaveProfile={handleSaveUserProfile}
        onSavePhoto={handleSaveUserPhoto}
        onDeletePhoto={handleDeleteUserPhoto}
        onSavePassword={handleSaveUserPassword}
      />

      {/* Popup Notifikasi: Ada Registrasi Tamu Baru yang memerlukan tindak lanjut */}
      {showNewRegistrationPopup && newRegistrationsCount > 0 && (userRole === 'admin' || userRole === 'manager' || userRole === 'super_admin') && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full bg-slate-900 border-2 border-rose-500 rounded-3xl p-5 shadow-2xl shadow-rose-950/70 animate-bounce-short backdrop-blur-md">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30 shrink-0">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                  Notifikasi Registrasi
                </span>
                <button 
                  onClick={() => setShowNewRegistrationPopup(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Tutup Notifikasi"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h4 className="text-sm font-extrabold text-white mt-1.5 leading-snug">
                Ada Registrasi Tamu Baru yang memerlukan tindak lanjut.
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Terdapat <strong className="text-rose-400 font-bold">{newRegistrationsCount}</strong> data registrasi calon klien baru yang masuk dan belum diproses.
              </p>
              <div className="mt-3.5 flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveView('registrasi');
                    setShowNewRegistrationPopup(false);
                  }}
                  className="flex-1 py-2 px-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-900/40 flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                >
                  <span>Buka Menu Registrasi</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setShowNewRegistrationPopup(false)}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Nanti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
