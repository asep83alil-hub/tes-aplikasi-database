import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend, AreaChart, Area
} from 'recharts';
import { 
  Users, UserCheck, Calendar, Clock, TrendingUp, TrendingDown, 
  MoreVertical, Bell, Mail, Search, Plus, FileText, CreditCard, 
  ChevronRight, CheckCircle2, Clock3, AlertCircle, ChevronLeft, BarChart3,
  Sparkles, DollarSign, Activity, Award, Target, Layers, ArrowUpRight,
  ShieldCheck, AlertTriangle, ArrowRight, UserCog, Stethoscope, HeartHandshake,
  Star, MessageSquareHeart, BookOpen, CheckSquare, MessageCircle, Send
} from 'lucide-react';
import { Child, Therapist, TherapyDefinition, AttendanceStatus, View, UserRole, TherapyProgram, ParentComment } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import AttendanceDetailModal from './AttendanceDetailModal';
import { getFeedbackStats, getStoredComments, getCommentsForStudent } from '../utils/parentCommentStorage';
import { StudentParentDashboard } from './StudentParentDashboard';
import { TherapistDashboard } from './TherapistDashboard';
import { getStoredMenuCustomizations, MenuCustomizationConfig } from '../utils/menuCustomizationStorage';
import EditMenuIcon from './icons/EditMenuIcon';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DashboardPageProps {
  allChildren: Child[];
  therapists: Therapist[];
  therapyTypes: TherapyDefinition[];
  currentTime: Date;
  dataForToday: Child[];
  projectedRevenue?: number;
  user: { name: string; photoUrl?: string; role?: string };
  userRole?: UserRole;
  loggedInUserId?: string | null;
  therapyPrograms?: TherapyProgram[];
  onNavigate: (view: View) => void;
  onStatusChange: (childId: string, sessionId: string, status: AttendanceStatus) => void;
  onEditSession: (childId: string, sessionId: string) => void;
  onUpdateNote: (childId: string, sessionId: string, note: string) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  attendanceRecords: { [dateKey: string]: { [sessionId: string]: AttendanceStatus } };
  attendanceNotes: { [dateKey: string]: { [sessionId: string]: any } };
  onOpenNotificationCenter?: () => void;
  newRegistrationsCount?: number;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  allChildren, 
  therapists, 
  therapyTypes, 
  currentTime, 
  dataForToday, 
  projectedRevenue = 4500000, 
  user, 
  userRole = 'admin',
  loggedInUserId = null,
  therapyPrograms = [],
  onNavigate, 
  onStatusChange, 
  onEditSession, 
  onUpdateNote,
  selectedDate, 
  onDateChange, 
  attendanceRecords, 
  attendanceNotes,
  onOpenNotificationCenter,
  newRegistrationsCount = 0
}) => {
  const [activeTab, setActiveTab] = useState<'operasional' | 'manager' | 'terapis' | 'siswa'>('operasional');
  const [chartView, setChartView] = useState<'harian' | 'mingguan' | 'bulanan'>('mingguan');
  const [filterTherapy, setFilterTherapy] = useState<string>('all');
  const [searchTableQuery, setSearchTableQuery] = useState<string>('');
  const [selectedChildForRecap, setSelectedChildForRecap] = useState<any | null>(null);
  const [menuConfig, setMenuConfig] = useState<MenuCustomizationConfig>(getStoredMenuCustomizations());

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setMenuConfig(e.detail);
      }
    };
    window.addEventListener('pelangi360_menu_customization_updated', handleUpdate);
    return () => window.removeEventListener('pelangi360_menu_customization_updated', handleUpdate);
  }, []);

  const dTexts = menuConfig.inMenuTexts.dashboard || {};
  const customSessionsLabel = dTexts.statSessionsLabel?.value || 'Total Sesi Hari Ini';
  const customPatientsLabel = dTexts.statPatientsLabel?.value || 'Pasien Aktif';
  const customTherapistsLabel = dTexts.statTherapistsLabel?.value || 'Terapis Bertugas';
  const customAttendanceLabel = dTexts.statAttendanceLabel?.value || 'Tingkat Kehadiran';
  const customScheduleTitle = dTexts.scheduleTableTitle?.value || 'Sesi Terapi & Kehadiran Hari Ini';
  const customScheduleSubtitle = dTexts.scheduleTableSubtitle?.value || 'Klik status untuk memperbarui kehadiran secara instan (Hadir, Absen, Izin, Menunggu).';
  const customAnnouncement = dTexts.announcementBanner?.value;

  // Compute operational statistics
  const stats = useMemo(() => {
    const activePatients = allChildren.filter(c => c.status === 'Aktif').length;
    const activeTherapists = therapists.length;
    
    let totalSessionsToday = 0;
    let attended = 0;
    let absent = 0;
    let permit = 0;
    let pending = 0;

    dataForToday.forEach(child => {
      child.sessions.forEach(session => {
        totalSessionsToday++;
        if (session.status === AttendanceStatus.PRESENT) attended++;
        else if (session.status === AttendanceStatus.ABSENT) absent++;
        else if (session.status === AttendanceStatus.PERMIT) permit++;
        else pending++;
      });
    });

    const attendanceRate = totalSessionsToday > 0 
      ? Math.round((attended / totalSessionsToday) * 100) 
      : 92;

    // Next upcoming session
    const flattened = dataForToday.flatMap(c => 
      c.sessions.map(s => ({ child: c, session: s }))
    ).filter(x => x.session.status === AttendanceStatus.PENDING)
     .sort((a, b) => a.session.time.localeCompare(b.session.time));

    const nextSession = flattened[0] || null;

    return {
      totalSessionsToday: totalSessionsToday || 23,
      attendedToday: attended,
      attendanceRate,
      absentCount: absent + permit,
      estimatedRevenue: projectedRevenue,
      activePatients: activePatients || 100,
      activeTherapists: activeTherapists || 12,
      pendingSessions: pending,
      completedSessions: attended,
      nextSession
    };
  }, [allChildren, therapists, dataForToday, projectedRevenue]);

  // Parent Feedback & Engagement Stats
  const feedbackStats = useMemo(() => getFeedbackStats(), []);

  // Portal Keluarga Helpers & Data
  const isFamilyPortal = userRole === 'siswa' || userRole === 'orang_tua';
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    if (isAdmin && activeTab !== 'operasional') {
      setActiveTab('operasional');
    }
  }, [isAdmin, activeTab]);

  const familyChild = useMemo(() => {
    if (loggedInUserId) {
      const found = allChildren.find(c => c.id === loggedInUserId || c.name.toLowerCase().includes(loggedInUserId.toLowerCase()));
      if (found) return found;
    }
    const adriel = allChildren.find(c => c.id === 'C-ADRIEL');
    return adriel || allChildren[0];
  }, [allChildren, loggedInUserId]);

  const familyComments = useMemo(() => {
    if (!familyChild) return [];
    return getCommentsForStudent(familyChild.id);
  }, [familyChild]);

  // Latest therapy note for family
  const latestTherapyNote = useMemo(() => {
    const dates = Object.keys(attendanceNotes).sort((a, b) => b.localeCompare(a));
    for (const d of dates) {
      const dayNotes = attendanceNotes[d];
      if (dayNotes) {
        for (const sessId of Object.keys(dayNotes)) {
          if (sessId.includes(familyChild?.id || '')) {
            const n = dayNotes[sessId];
            const thId = typeof n === 'object' ? n.therapistId : undefined;
            const th = therapists.find(t => t.id === thId) || therapists[0];
            return {
              date: d,
              note: typeof n === 'string' ? n : n.note,
              type: typeof n === 'object' ? n.type : 'OT',
              therapist: th,
              photoUrls: typeof n === 'object' ? n.photoUrls : [],
              hasFeedback: familyComments.some(c => c.sessionDate === d && !c.isDraft)
            };
          }
        }
      }
    }
    return {
      date: '2026-09-28',
      note: 'Ananda Adriel menunjukkan kemajuan konsentrasi dan atensi yang sangat baik. Kontak mata konsisten selama instruksi 2 tahap dan regulasi emosi stabil.',
      type: 'OT',
      therapist: therapists[0],
      photoUrls: ['https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&auto=format&fit=crop&q=80'],
      hasFeedback: familyComments.some(c => c.sessionDate === '2026-09-28' && !c.isDraft)
    };
  }, [attendanceNotes, familyChild, therapists, familyComments]);

  // Next session for familyChild
  const nextFamilySession = useMemo(() => {
    if (!familyChild) return null;
    const recurring = familyChild.recurringSessions || [];
    return recurring[0] || { day: 'Senin', time: '08:00 - 09:00', type: 'OT', therapistId: 'T11' };
  }, [familyChild]);

  // Recent therapist feedback list for Terapis widget
  const recentFamilyFeedback = useMemo(() => {
    const all = getStoredComments().filter(c => !c.isDraft);
    return all.slice(0, 4);
  }, []);

  // System notifications
  const systemNotifications = useMemo(() => {
    try {
      const raw = localStorage.getItem('pelangi360_system_notifications_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 4);
      }
    } catch {}
    return [
      { id: 'n1', title: 'Catatan Terapi Terbaru', description: 'Catatan terapi terbaru telah tersedia.', time: '1 jam lalu', isRead: false },
      { id: 'n2', title: 'Pengingat Jadwal Terapi', description: 'Sesi Terapi Okupasi berikutnya terjadwal besok jam 08:00.', time: '3 jam lalu', isRead: false },
      { id: 'n3', title: 'Evaluasi Program', description: 'Evaluasi target intervensi 3 bulanan telah diperbarui.', time: '1 hari lalu', isRead: true }
    ];
  }, []);

  // Kehadiran Line / Area Chart data (Harian, Mingguan, Bulanan)
  const attendanceChartData = useMemo(() => {
    if (chartView === 'harian') {
      return [
        { time: '08:00', hadir: 5, target: 6 },
        { time: '10:00', hadir: 7, target: 8 },
        { time: '12:00', hadir: 3, target: 4 },
        { time: '14:00', hadir: 6, target: 6 },
        { time: '16:00', hadir: 4, target: 5 },
        { time: '17:00', hadir: 2, target: 3 },
      ];
    } else if (chartView === 'mingguan') {
      const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const defaultValues = [21, 23, 19, 22, 24, 18];
      const today = new Date(selectedDate);
      return days.map((day, idx) => {
        const date = new Date(today);
        const diff = (today.getDay() === 0 ? 6 : today.getDay() - 1) - idx;
        date.setDate(today.getDate() - diff);
        const dateKey = date.toISOString().split('T')[0];
        const records = attendanceRecords[dateKey] || {};
        const recordedCount = Object.values(records).filter(s => s === AttendanceStatus.PRESENT).length;
        return {
          name: day,
          hadir: recordedCount > 0 ? recordedCount : defaultValues[idx],
          target: 25
        };
      });
    } else {
      // Bulanan (4 Minggu)
      return [
        { name: 'Mgg 1', hadir: 118, target: 120 },
        { name: 'Mgg 2', hadir: 126, target: 125 },
        { name: 'Mgg 3', hadir: 122, target: 125 },
        { name: 'Mgg 4', hadir: 130, target: 125 },
      ];
    }
  }, [chartView, selectedDate, attendanceRecords]);

  // Revenue Bar Chart: Target vs Realisasi
  const revenueComparisonData = [
    { bulan: 'Jan', realisasi: 38.5, target: 40 },
    { bulan: 'Feb', realisasi: 42.0, target: 40 },
    { bulan: 'Mar', realisasi: 45.2, target: 42 },
    { bulan: 'Apr', realisasi: 44.0, target: 45 },
    { bulan: 'Mei', realisasi: 48.6, target: 45 },
    { bulan: 'Jun', realisasi: 51.0, target: 48 },
  ];

  // Distribusi Terapi Donut Chart: Wicara, Okupasi, SI, Fisioterapi, Remedial
  const therapyDistributionData = [
    { name: 'Wicara', value: 34, color: '#10B981', code: 'TW' },      // Green
    { name: 'Okupasi', value: 28, color: '#3B82F6', code: 'OT' },     // Blue
    { name: 'Sensori (SI)', value: 20, color: '#8B5CF6', code: 'SI' }, // Purple
    { name: 'Fisioterapi', value: 12, color: '#F59E0B', code: 'FT' },  // Amber/Orange
    { name: 'Remedial', value: 6, color: '#EC4899', code: 'REM' },    // Pink
  ];

  // Progress Program Terapi (Selesai, Sedang Berjalan, Belum Dimulai)
  const programProgressStats = {
    selesai: 48,
    berjalan: 42,
    belumMulai: 10
  };

  // Filtered Sessions Table
  const filteredSessions = useMemo(() => {
    return dataForToday.flatMap(child => 
      child.sessions.map(session => ({ child, session }))
    ).filter(({ child, session }) => {
      const matchTherapy = filterTherapy === 'all' || session.type === filterTherapy;
      const matchSearch = !searchTableQuery || 
        child.name.toLowerCase().includes(searchTableQuery.toLowerCase()) ||
        session.time.includes(searchTableQuery);
      return matchTherapy && matchSearch;
    }).sort((a, b) => a.session.time.localeCompare(b.session.time));
  }, [dataForToday, filterTherapy, searchTableQuery]);

  const handleCycleStatus = (childId: string, sessionId: string, currentStatus: AttendanceStatus) => {
    const statusFlow = [
      AttendanceStatus.PENDING,
      AttendanceStatus.PRESENT,
      AttendanceStatus.ABSENT,
      AttendanceStatus.PERMIT
    ];
    const currentIndex = statusFlow.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusFlow.length;
    onStatusChange(childId, sessionId, statusFlow[nextIndex]);
  };

  const getTherapyBadgeColor = (typeId: string) => {
    switch (typeId?.toUpperCase()) {
      case 'TW':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'OT':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'SI':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'FT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'REMEDIAL':
      case 'REM':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  if (isFamilyPortal) {
    return (
      <div className="flex-1 overflow-y-auto bg-[#0F172A] text-slate-100 p-4 sm:p-6 lg:p-8 custom-scrollbar">
        <StudentParentDashboard
          child={familyChild}
          allChildren={allChildren}
          therapists={therapists}
          therapyTypes={therapyTypes}
          therapyPrograms={therapyPrograms}
          attendanceNotes={attendanceNotes}
          attendanceRecords={attendanceRecords}
          onNavigate={onNavigate}
          user={user}
          userRole={userRole}
          onOpenNotificationCenter={onOpenNotificationCenter}
        />
      </div>
    );
  }

  // Tampilan Dashboard Khusus Terapis (Sesuai Kebutuhan Klinis & Menu Terapis)
  if (userRole === 'terapis') {
    return (
      <div className="flex-1 overflow-y-auto bg-[#0F172A] text-slate-100 custom-scrollbar">
        <TherapistDashboard
          allChildren={allChildren}
          therapists={therapists}
          therapyTypes={therapyTypes}
          currentTime={currentTime}
          dataForToday={dataForToday}
          user={user}
          loggedInUserId={loggedInUserId}
          therapyPrograms={therapyPrograms}
          onNavigate={onNavigate}
          onStatusChange={onStatusChange}
          onEditSession={onEditSession}
          onUpdateNote={onUpdateNote}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          attendanceRecords={attendanceRecords}
          attendanceNotes={attendanceNotes}
          onOpenNotificationCenter={onOpenNotificationCenter}
          newRegistrationsCount={newRegistrationsCount}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0F172A] text-slate-100 p-4 sm:p-6 lg:p-8 custom-scrollbar">
      {/* Top Bar Switch & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold">
              Pelangi 360 Enterprise
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-400">
              {activeTab === 'operasional' 
                ? 'Dasbor Operasional' 
                : activeTab === 'manager' 
                ? 'Dasbor Eksekutif Manager' 
                : activeTab === 'terapis'
                ? 'Dasbor Klinis Terapis'
                : 'Dasbor Akun Siswa & Orang Tua'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            Selamat Datang, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Pantau ringkasan operasional dan kemajuan terapi anak secara real-time.
          </p>
        </div>

        {/* View Toggle: Untuk Akun Admin HANYA Dasbor Operasional Saja. Menu Dasbor Manager, Dasbor Terapis, dan Akun Siswa Dihilangkan */}
        {!isAdmin ? (
          <div className="flex flex-wrap items-center bg-slate-900 border border-slate-800 p-1 rounded-xl self-start sm:self-auto shadow-inner gap-1">
            <button
              onClick={() => setActiveTab('operasional')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer",
                activeTab === 'operasional'
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <Activity className="w-3.5 h-3.5" />
              Dasbor Operasional
            </button>
            <button
              onClick={() => setActiveTab('manager')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer",
                activeTab === 'manager'
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              <Award className="w-3.5 h-3.5" />
              Dasbor Manager
            </button>
            <button
              onClick={() => setActiveTab('terapis')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer",
                activeTab === 'terapis'
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
              title="Tampilan Khusus Dasbor Terapis"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Dasbor Terapis
            </button>
            <button
              onClick={() => setActiveTab('siswa')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer",
                activeTab === 'siswa'
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
              title="Tampilan Akun Siswa & Orang Tua"
            >
              <UserCheck className="w-3.5 h-3.5" />
              Akun Siswa
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-indigo-400 shadow-sm self-start sm:self-auto">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dasbor Operasional</span>
          </div>
        )}
      </div>

      {/* Hero Section Summary Bar */}
      {activeTab !== 'siswa' && activeTab !== 'terapis' && (
        <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/70 border border-indigo-500/20 rounded-2xl p-4 sm:p-5 mb-6 backdrop-blur-sm shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 divide-x divide-slate-800/80">
            <div className="pr-4">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Ringkasan Hari Ini</span>
              <span className="text-sm font-semibold text-white">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            <div className="pl-4 sm:pl-6">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Jadwal Berikutnya</span>
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-300">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                {stats.nextSession ? (
                  <span>
                    {stats.nextSession.session.time} • {stats.nextSession.child.name.split(' ')[0]} ({stats.nextSession.session.type})
                  </span>
                ) : (
                  <span>Semua sesi hari ini terjadwal rapi</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => onNavigate('papanJadwal')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              Buka Kalender Jadwal
            </button>
          </div>
        </div>
      )}

      {activeTab === 'terapis' ? (
        <TherapistDashboard
          allChildren={allChildren}
          therapists={therapists}
          therapyTypes={therapyTypes}
          currentTime={currentTime}
          dataForToday={dataForToday}
          user={user}
          loggedInUserId={loggedInUserId}
          therapyPrograms={therapyPrograms}
          onNavigate={onNavigate}
          onStatusChange={onStatusChange}
          onEditSession={onEditSession}
          onUpdateNote={onUpdateNote}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
          attendanceRecords={attendanceRecords}
          attendanceNotes={attendanceNotes}
          onOpenNotificationCenter={onOpenNotificationCenter}
          newRegistrationsCount={newRegistrationsCount}
        />
      ) : activeTab === 'siswa' ? (
        <StudentParentDashboard
          child={familyChild}
          allChildren={allChildren}
          therapists={therapists}
          therapyTypes={therapyTypes}
          therapyPrograms={therapyPrograms}
          attendanceNotes={attendanceNotes}
          attendanceRecords={attendanceRecords}
          onNavigate={onNavigate}
          user={user}
          userRole={userRole}
          onOpenNotificationCenter={onOpenNotificationCenter}
        />
      ) : activeTab === 'operasional' ? (
        <>
          {/* Banner Notifikasi: Ada Registrasi Tamu Baru */}
          {newRegistrationsCount > 0 && (
            <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-indigo-950/80 border-2 border-rose-500/40 rounded-2xl p-4 mb-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                  <UserCheck className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">Registrasi Tamu Baru Memerlukan Tindak Lanjut</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                      {newRegistrationsCount} Baru
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Ada Registrasi Tamu Baru yang memerlukan tindak lanjut dari calon klien.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('registrasi')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-md shadow-rose-900/40 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer active:scale-95 transition-all"
              >
                <span>Buka Menu Registrasi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 1. KARTU STATISTIK MODERN */}
          <div className={cn(
            "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6",
            isAdmin ? "lg:grid-cols-4" : "lg:grid-cols-5"
          )}>
            {/* Card 1: Sesi Hari Ini */}
            <div 
              onClick={() => onNavigate('papanJadwal')}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-200 cursor-pointer group relative overflow-hidden shadow-lg"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-500/20 transition-all"></div>
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{customSessionsLabel}</span>
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
                  {stats.totalSessionsToday}
                </span>
                <span className="text-xs text-slate-400">sesi</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
                <span className="text-emerald-400 font-semibold flex items-center gap-1 font-mono">
                  <TrendingUp className="w-3 h-3" /> +12%
                </span>
                <span className="text-slate-500">vs kemarin</span>
              </div>
            </div>

            {/* Card 2: Pasien Aktif */}
            <div 
              onClick={() => onNavigate('manajemenAnak')}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-200 cursor-pointer group relative overflow-hidden shadow-lg"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-all"></div>
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{customPatientsLabel}</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
                  {stats.activePatients}
                </span>
                <span className="text-xs text-slate-400">anak terdaftar</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
                <span className="text-emerald-400 font-semibold flex items-center gap-1 font-mono">
                  <TrendingUp className="w-3 h-3" /> +8%
                </span>
                <span className="text-slate-500">retensi 98%</span>
              </div>
            </div>

            {/* Card 3: Terapis Aktif */}
            <div 
              onClick={() => onNavigate('manajemenTerapis')}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-200 cursor-pointer group relative overflow-hidden shadow-lg"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-purple-500/20 transition-all"></div>
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{customTherapistsLabel}</span>
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
                  {stats.activeTherapists}
                </span>
                <span className="text-xs text-slate-400">spesialis</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
                <span className="text-indigo-400 font-semibold flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3 h-3" /> 100%
                </span>
                <span className="text-slate-500">kehadiran optimal</span>
              </div>
            </div>

            {/* Card 4 & 5: Khusus Dashboard Admin: Pendapatan Hari Ini & Feedback Orang Tua TIDAK DITAMPILKAN */}
            {isAdmin ? (
              <div 
                onClick={() => onNavigate('rekapKehadiran')}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-200 cursor-pointer group relative overflow-hidden shadow-lg"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all"></div>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{customAttendanceLabel}</span>
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
                    {stats.attendanceRate}%
                  </span>
                  <span className="text-xs text-slate-400">kehadiran</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 font-mono">
                    <UserCheck className="w-3 h-3" /> {stats.attendedToday} Hadir
                  </span>
                  <span className="text-slate-500">{stats.pendingSessions} Menunggu</span>
                </div>
              </div>
            ) : (
              <>
                {/* Card 4: Pendapatan Hari Ini (KHUSUS NON-ADMIN) */}
                <div 
                  onClick={() => onNavigate('tagihan')}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-200 cursor-pointer group relative overflow-hidden shadow-lg"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-amber-500/20 transition-all"></div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pendapatan Hari Ini</span>
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-slate-400">Rp</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight tabular-nums">
                      {(stats.estimatedRevenue).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
                    <span className="text-emerald-400 font-semibold flex items-center gap-1 font-mono">
                      <TrendingUp className="w-3 h-3" /> +15%
                    </span>
                    <span className="text-slate-500">tercapai target</span>
                  </div>
                </div>

                {/* Card 5: Feedback Orang Tua (KHUSUS NON-ADMIN) */}
                <div 
                  onClick={() => onNavigate('bukuCatatanTerapi')}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-teal-500/40 transition-all duration-200 cursor-pointer group relative overflow-hidden shadow-lg"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-teal-500/20 transition-all"></div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">Feedback Orang Tua</span>
                    <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white tracking-tight tabular-nums">
                      {feedbackStats.averageRating}
                    </span>
                    <span className="text-xs text-amber-400 font-semibold">/ 5.0 ★</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
                    <span className="text-teal-400 font-semibold flex items-center gap-1 font-mono">
                      {feedbackStats.newComments} Baru
                    </span>
                    <span className="text-rose-400 font-bold font-mono">
                      {feedbackStats.pendingReplies} Menunggu
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 2. DASHBOARD ANALYTICS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            {/* Chart 1: Kehadiran Pasien (Line/Area Chart) */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h3 className="font-bold text-white text-base">Tren Kehadiran Pasien</h3>
                  <p className="text-xs text-slate-400">Perbandingan kehadiran aktual terhadap target kapasitas harian</p>
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setChartView('harian')}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-medium transition-colors",
                      chartView === 'harian' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    Harian
                  </button>
                  <button
                    onClick={() => setChartView('mingguan')}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-medium transition-colors",
                      chartView === 'mingguan' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    Mingguan
                  </button>
                  <button
                    onClick={() => setChartView('bulanan')}
                    className={cn(
                      "px-2.5 py-1 rounded-lg font-medium transition-colors",
                      chartView === 'bulanan' ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    )}
                  >
                    Bulanan
                  </button>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceChartData}>
                    <defs>
                      <linearGradient id="presenceGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#5B5FEF" stopOpacity={0.35}/>
                        <stop offset="95%" stopColor="#5B5FEF" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
                    <XAxis 
                      dataKey={chartView === 'harian' ? 'time' : 'name'} 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94A3B8', fontSize: 11 }}
                      dy={8}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94A3B8', fontSize: 11 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px' }}
                      labelStyle={{ color: '#E2E8F0', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="hadir" 
                      name="Pasien Hadir"
                      stroke="#5B5FEF" 
                      strokeWidth={2.5} 
                      fill="url(#presenceGrad)" 
                      dot={{ r: 4, fill: '#5B5FEF', strokeWidth: 2, stroke: '#0F172A' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      name="Target Kapasitas"
                      stroke="#10B981" 
                      strokeWidth={1.5} 
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Distribusi Terapi (Donut Chart) */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white text-base">Distribusi Terapi</h3>
                  <span className="text-[11px] text-slate-400">Bulan Ini</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">Persentase sesi berdasarkan modalitas terapi</p>
                
                <div className="h-44 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={therapyDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {therapyDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Total Sesi</span>
                    <span className="text-xl font-extrabold text-white">100%</span>
                  </div>
                </div>
              </div>

              {/* Legend List */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                {therapyDistributionData.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-xs p-1 rounded bg-slate-950/40">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                      <span className="text-slate-300 truncate">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-200">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Analytics Row 2: Pendapatan (Target vs Realisasi) & Progress Program */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            {/* Chart 3: Pendapatan Bar Chart (Target vs Realisasi) - TIDAK DITAMPILKAN KHUSUS DASHBOARD ADMIN */}
            {!isAdmin && (
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white text-base">Realisasi vs Target Pendapatan</h3>
                    <p className="text-xs text-slate-400">Perbandingan per bulan (dalam Juta Rupiah)</p>
                  </div>
                  <button 
                    onClick={() => onNavigate('laporanPemasukan')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    Detail Keuangan <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1E293B" />
                      <XAxis dataKey="bulan" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '12px' }}
                        formatter={(val: any) => [`Rp ${val} Juta`, '']}
                      />
                      <Legend wrapperStyle={{ paddingTop: 8, fontSize: 11 }} />
                      <Bar dataKey="realisasi" name="Realisasi" fill="#5B5FEF" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="target" name="Target Anggaran" fill="#334155" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Chart 4: Progress Program Terapi (Progress Bar) */}
            <div className={cn(
              "bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between",
              !isAdmin ? "lg:col-span-5" : "lg:col-span-12"
            )}>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-white text-base">Progress Program Terapi</h3>
                  <span className="text-xs text-indigo-400 font-medium cursor-pointer hover:underline" onClick={() => onNavigate('programTerapi')}>
                    Kelola
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-5">Distribusi status capaian kurikulum & IEP anak didik</p>

                <div className="space-y-4">
                  {/* Selesai */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Program Selesai
                      </span>
                      <span className="font-mono font-bold text-emerald-400">{programProgressStats.selesai}% (48 Program)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${programProgressStats.selesai}%` }}></div>
                    </div>
                  </div>

                  {/* Sedang Berjalan */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" /> Sedang Berjalan
                      </span>
                      <span className="font-mono font-bold text-indigo-400">{programProgressStats.berjalan}% (42 Program)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${programProgressStats.berjalan}%` }}></div>
                    </div>
                  </div>

                  {/* Belum Dimulai */}
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <Clock3 className="w-3.5 h-3.5 text-slate-400" /> Belum Dimulai
                      </span>
                      <span className="font-mono font-bold text-slate-400">{programProgressStats.belumMulai}% (10 Program)</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-slate-600 h-full rounded-full transition-all duration-500" style={{ width: `${programProgressStats.belumMulai}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Program Terdaftar</span>
                <span className="font-bold text-white">100 Sasaran IEP</span>
              </div>
            </div>
          </div>

          {/* WIDGET DASHBOARD TERAPIS: FEEDBACK KELUARGA TERBARU - TIDAK DITAMPILKAN KHUSUS DASHBOARD ADMIN */}
          {!isAdmin && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 rounded-2xl text-teal-400">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">Feedback Keluarga Terbaru</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-300 border border-teal-500/20">
                        Terapis On-Duty
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Evaluasi, perkembangan anak di rumah, dan pertanyaan dari orang tua pada sesi terapi
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate('bukuCatatanTerapi')}
                  className="px-3.5 py-2 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <span>Buka Seluruh Feedback</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* List of Recent Feedbacks */}
              {recentFamilyFeedback.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800/60">
                  <p className="text-xs text-slate-400">Belum ada feedback keluarga yang masuk untuk sesi ini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recentFamilyFeedback.map((fb: any) => {
                    const studentObj = allChildren.find(c => c.id === fb.studentId);
                    const isReplied = fb.status === 'Sudah Dibalas';
                    return (
                      <div 
                        key={fb.id}
                        onClick={() => onNavigate('bukuCatatanTerapi')}
                        className="p-4 bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-teal-500/40 rounded-2xl transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          {/* Header: Student Name, Avatar & Status */}
                          <div className="flex items-start justify-between gap-3 mb-2.5">
                            <div className="flex items-center gap-2.5">
                              <img 
                                src={studentObj?.photoUrl || `https://i.pravatar.cc/100?u=${fb.studentId}`} 
                                alt={fb.studentName}
                                className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800 group-hover:ring-teal-500/40 transition-all"
                              />
                              <div>
                                <h4 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                                  {fb.studentName}
                                </h4>
                                <span className="text-[11px] text-slate-400 block">
                                  {fb.parentName} • {fb.therapyType || 'OT'}
                                </span>
                              </div>
                            </div>

                            {/* Status Badge: Sudah Dibalas / Belum Dibalas */}
                            {isReplied ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shrink-0">
                                <CheckCircle2 className="w-3 h-3" />
                                Sudah Dibalas
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 shrink-0 animate-pulse">
                                <Clock className="w-3 h-3" />
                                Belum Dibalas
                              </span>
                            )}
                          </div>

                          {/* Rating & Date */}
                          <div className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-900/80 rounded-xl border border-slate-800/60 mb-2.5">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={cn(
                                    "w-3.5 h-3.5",
                                    i < (fb.rating || 5) 
                                      ? "fill-amber-400 text-amber-400" 
                                      : "text-slate-600"
                                  )} 
                                />
                              ))}
                              <span className="ml-1.5 font-mono font-bold text-amber-400 text-[11px]">
                                {fb.rating ? `${fb.rating}.0` : '5.0'}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {new Date(fb.sessionDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>

                          {/* Content Excerpt */}
                          <p className="text-xs text-slate-300 italic line-clamp-2 leading-relaxed">
                            "{fb.homeCondition || fb.visibleProgress || fb.question || fb.comment || 'Feedback dari keluarga siswa.'}"
                          </p>
                        </div>

                        {/* Footer Actions */}
                        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">
                            {fb.question ? 'Ada pertanyaan terapis' : 'Laporan observasi rumah'}
                          </span>
                          <span className="text-teal-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                            {isReplied ? 'Lihat Percakapan' : 'Balas Sekarang'} →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TABLE SECTION: JADWAL & KEHADIRAN PASIEN HARI INI */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  {customScheduleTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {customScheduleSubtitle}
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Cari pasien / jam..."
                    value={searchTableQuery}
                    onChange={(e) => setSearchTableQuery(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 w-44"
                  />
                </div>

                <select
                  value={filterTherapy}
                  onChange={(e) => setFilterTherapy(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500"
                >
                  <option value="all">Semua Terapi</option>
                  <option value="OT">Okupasi (OT)</option>
                  <option value="TW">Wicara (TW)</option>
                  <option value="SI">Sensori (SI)</option>
                  <option value="FT">Fisioterapi (FT)</option>
                  <option value="REMEDIAL">Remedial</option>
                </select>

                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1">
                  <button 
                    onClick={() => {
                      const prev = new Date(selectedDate);
                      prev.setDate(prev.getDate() - 1);
                      onDateChange(prev);
                    }}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-semibold text-white px-2">
                    {selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </span>
                  <button 
                    onClick={() => {
                      const next = new Date(selectedDate);
                      next.setDate(next.getDate() + 1);
                      onDateChange(next);
                    }}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                    <th className="px-4 py-3">Waktu</th>
                    <th className="px-4 py-3">Nama Pasien</th>
                    <th className="px-4 py-3">Terapis Bertugas</th>
                    <th className="px-4 py-3">Modalitas</th>
                    <th className="px-4 py-3 text-center">Status Kehadiran</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        Tidak ada sesi terapi yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map(({ child, session }, idx) => {
                      const therapistObj = therapists.find(t => t.id === session.therapistId);
                      return (
                        <tr key={`${child.id}-${session.id || idx}`} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3.5 font-mono font-semibold text-slate-300">
                            {session.time}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <img 
                                src={child.photoUrl || `https://i.pravatar.cc/80?u=${child.id}`} 
                                alt="" 
                                className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-700" 
                              />
                              <div>
                                <span className="font-semibold text-white block">{child.name}</span>
                                <span className="text-[10px] text-slate-400">
                                  {child.className || 'Kelas Terapi'} • {child.diagnosis || 'Speech & Sensory'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-slate-300 font-medium">
                              {therapistObj ? therapistObj.name : 'Terapis Penanggung Jawab'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={cn("px-2 py-0.5 rounded-md font-semibold text-[10px] border", getTherapyBadgeColor(session.type))}>
                              {session.type}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <button
                              onClick={() => handleCycleStatus(child.id, session.id || '', session.status)}
                              className={cn(
                                "px-3 py-1 rounded-full font-bold text-[10px] transition-all hover:scale-105 active:scale-95 border",
                                session.status === AttendanceStatus.PRESENT
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                                  : session.status === AttendanceStatus.ABSENT
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/25"
                                  : session.status === AttendanceStatus.PERMIT
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/25"
                                  : "bg-slate-800 text-slate-400 border-slate-700"
                              )}
                            >
                              {session.status}
                            </button>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onEditSession(child.id, session.id || '')}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                                title="Edit Sesi"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* 8. DASHBOARD MANAGER (EXECUTIVE VIEW) */
        <div className="space-y-6">
          {/* Banner Notifikasi Registrasi Baru di Dashboard Manager */}
          {newRegistrationsCount > 0 && (
            <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-indigo-950/80 border-2 border-rose-500/40 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
                  <UserCheck className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">Registrasi Tamu Baru Memerlukan Tindak Lanjut</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-pulse">
                      {newRegistrationsCount} Calon Klien
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Ada Registrasi Tamu Baru yang memerlukan tindak lanjut dari calon klien.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('registrasi')}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-md shadow-rose-900/40 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer active:scale-95 transition-all"
              >
                <span>Buka Menu Registrasi</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* KPI Registrasi Calon Klien Baru */}
            <div 
              onClick={() => onNavigate('registrasi')}
              className="bg-slate-900 border-2 border-rose-500/30 hover:border-rose-500/60 rounded-2xl p-5 shadow-lg cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs uppercase tracking-wider text-rose-400 font-bold block">
                  Registrasi Tamu
                </span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white">{newRegistrationsCount}</span>
                <span className="text-xs text-rose-400 font-bold font-mono">Baru Masuk</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                <span>Perlu Follow Up</span>
                <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform font-bold">Kelola →</span>
              </p>
            </div>

            {/* KPI Operasional */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">
                Operasional Terapi
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white">96.4%</span>
                <span className="text-xs text-emerald-400 font-semibold font-mono">+2.1% MoM</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                100 Pasien Aktif • 12 Terapis On-Duty • 23 Sesi Hari Ini
              </p>
            </div>

            {/* KPI Keuangan */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">
                Pendapatan Bulan Ini
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white">Rp 51.0M</span>
                <span className="text-xs text-emerald-400 font-semibold font-mono">106% Target</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Outstanding: Rp 4.200.000 (3 invoice tertunda)
              </p>
            </div>

            {/* KPI SDM */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">
                Kinerja Terapis
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white">4.92 / 5.0</span>
                <span className="text-xs text-indigo-400 font-semibold">Sangat Baik</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Tingkat kepuasan orang tua & kelengkapan EMR 99%
              </p>
            </div>

            {/* KPI Engagement Orang Tua */}
            <div 
              onClick={() => onNavigate('bukuCatatanTerapi')}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-teal-500/40 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs uppercase tracking-wider text-teal-400 font-bold block">
                  Engagement Orang Tua
                </span>
                <span className="text-xs text-amber-400 font-semibold font-mono">{feedbackStats.averageRating} ★</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white">{feedbackStats.activeParentPercentage}%</span>
                <span className="text-xs text-teal-400 font-semibold font-mono">Aktif Feedback</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {feedbackStats.commentsThisMonth} Komentar • {feedbackStats.unresolvedComments} Belum Ditindaklanjuti
              </p>
            </div>

            {/* KPI Strategis */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-bold block mb-1">
                Balanced Scorecard
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white">Grade A</span>
                <span className="text-xs text-purple-400 font-semibold">Audit Internal</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Program Strategic Plan berjalan 88.5%
              </p>
            </div>
          </div>

          {/* Manager Grid: Top Therapists & Financial Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Therapists Leaderboard */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-base">Evaluasi SDM & Terapis Berprestasi</h3>
                  <p className="text-xs text-slate-400">Berdasarkan ketuntasan IEP dan kepuasan orang tua</p>
                </div>
                <button 
                  onClick={() => onNavigate('manajemenTerapis')}
                  className="text-xs text-indigo-400 hover:text-indigo-300"
                >
                  Kelola SDM
                </button>
              </div>

              <div className="space-y-3">
                {therapists.slice(0, 4).map((t, index) => (
                  <div key={t.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold text-xs flex items-center justify-center font-mono">
                        #{index + 1}
                      </div>
                      <img src={t.photoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <span className="font-semibold text-white text-xs block">{t.name}</span>
                        <span className="text-[10px] text-slate-400">Spesialisasi: {t.specialties.join(', ')}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold text-xs font-mono">98.5%</span>
                      <span className="text-[10px] text-slate-500 block">34 Sesi Selesai</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Strategic Plan Link */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-white text-base">Target Strategis 2026</h3>
                    <p className="text-xs text-slate-400">Pilar Akreditasi & Pengembangan Sarana Terapi</p>
                  </div>
                  <button 
                    onClick={() => onNavigate('strategicPlan')}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Buka Rencana Kerja
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between font-semibold text-white mb-1">
                      <span>1. Standardisasi Ruang Sensori Integrasi</span>
                      <span className="text-emerald-400 font-mono">95%</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">Pengadaan ayunan vestibular & matras pelindung selesai.</p>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between font-semibold text-white mb-1">
                      <span>2. Pelatihan Sertifikasi Terapis Wicara</span>
                      <span className="text-indigo-400 font-mono">80%</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">Modul PECS & Oral Motor Assessment dalam tahap workshop.</p>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between font-semibold text-white mb-1">
                      <span>3. Integrasi Rapot Digital & Notifikasi Ortu</span>
                      <span className="text-emerald-400 font-mono">100% Selesai</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">Sistem export PDF dan tracking rekap absensi live.</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-400">Status Capaian Triwulan</span>
                <button 
                  onClick={() => onNavigate('balancedScorecard')}
                  className="text-xs font-semibold text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Buka Balanced Scorecard <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
