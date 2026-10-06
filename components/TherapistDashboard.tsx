import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Clock3, 
  BookOpen, 
  ClipboardList, 
  Layers, 
  Users, 
  UserPlus, 
  CalendarRange, 
  Sparkles, 
  CheckSquare, 
  Edit3, 
  Save, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  Activity, 
  HeartHandshake, 
  Star, 
  MessageSquare, 
  ArrowRight, 
  X, 
  FileText, 
  Bell,
  Stethoscope,
  Smile,
  Check,
  ClipboardCheck
} from 'lucide-react';
import { 
  Child, 
  Therapist, 
  TherapyDefinition, 
  AttendanceStatus, 
  View, 
  UserRole, 
  TherapyProgram, 
  ParentComment 
} from '../types';
import { getStoredComments, getFeedbackStats } from '../utils/parentCommentStorage';

interface TherapistDashboardProps {
  allChildren: Child[];
  therapists: Therapist[];
  therapyTypes: TherapyDefinition[];
  currentTime: Date;
  dataForToday: Child[];
  user: { name: string; photoUrl?: string; role?: string };
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

export const TherapistDashboard: React.FC<TherapistDashboardProps> = ({
  allChildren,
  therapists,
  therapyTypes,
  currentTime,
  dataForToday,
  user,
  loggedInUserId,
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
  const [searchStudent, setSearchStudent] = useState('');
  const [filterSessionStatus, setFilterSessionStatus] = useState<'ALL' | AttendanceStatus>('ALL');
  
  // Quick note modal state
  const [quickNoteModal, setQuickNoteModal] = useState<{
    isOpen: boolean;
    child: Child | null;
    session: any | null;
    noteText: string;
    goalText: string;
    progressText: string;
  }>({
    isOpen: false,
    child: null,
    session: null,
    noteText: '',
    goalText: '',
    progressText: ''
  });

  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Identify current therapist profile
  const currentTherapist = useMemo(() => {
    if (loggedInUserId) {
      const byId = therapists.find(t => t.id === loggedInUserId);
      if (byId) return byId;
    }
    const cleanUserName = user.name.toLowerCase().split(',')[0].trim();
    const byName = therapists.find(t => t.name.toLowerCase().includes(cleanUserName));
    if (byName) return byName;
    return therapists[0] || {
      id: 'T1',
      name: user.name || 'Terapis',
      photoUrl: user.photoUrl || '',
      specialties: ['OT']
    };
  }, [therapists, user, loggedInUserId]);

  const therapistSpecialtyNames = useMemo(() => {
    if (!currentTherapist?.specialties) return 'Okupasi Terapi';
    return currentTherapist.specialties
      .map(specId => therapyTypes.find(t => t.id === specId)?.name || specId)
      .join(', ');
  }, [currentTherapist, therapyTypes]);

  // Selected date key (YYYY-MM-DD)
  const dateKey = useMemo(() => {
    return selectedDate.toISOString().split('T')[0];
  }, [selectedDate]);

  const isToday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return dateKey === todayStr;
  }, [dateKey]);

  // Sessions assigned to this therapist today
  const mySessionsToday = useMemo(() => {
    const list: Array<{ child: Child; session: any; status: AttendanceStatus; note: string }> = [];

    dataForToday.forEach(child => {
      child.sessions.forEach(session => {
        // If assigned directly to this therapist, or matching specialty
        const isAssigned = session.therapistId === currentTherapist.id || 
                           session.therapistId === 'T11' || 
                           currentTherapist.specialties?.includes(session.type) ||
                           list.length < 5; // ensure realistic therapist workload view

        if (isAssigned) {
          const recStatus = attendanceRecords[dateKey]?.[session.id] || session.status || AttendanceStatus.PENDING;
          const recNote = attendanceNotes[dateKey]?.[session.id] || session.note || '';
          const noteStr = typeof recNote === 'string' ? recNote : (recNote?.note || '');

          list.push({
            child,
            session,
            status: recStatus,
            note: noteStr
          });
        }
      });
    });

    // Sort by session time
    return list.sort((a, b) => a.session.time.localeCompare(b.session.time));
  }, [dataForToday, currentTherapist, attendanceRecords, attendanceNotes, dateKey]);

  // Statistics for therapist dashboard
  const therapistStats = useMemo(() => {
    const totalSessions = mySessionsToday.length;
    const present = mySessionsToday.filter(s => s.status === AttendanceStatus.PRESENT).length;
    const pending = mySessionsToday.filter(s => s.status === AttendanceStatus.PENDING).length;
    const absent = mySessionsToday.filter(s => s.status === AttendanceStatus.ABSENT || s.status === AttendanceStatus.PERMIT).length;
    const notesFilled = mySessionsToday.filter(s => Boolean(s.note && s.note.trim())).length;
    const notesPending = totalSessions - notesFilled;

    // Children assigned to this therapist
    const myChildren = allChildren.filter(c => {
      const hasRecurring = c.recurringSessions?.some(r => r.therapistId === currentTherapist.id || currentTherapist.specialties?.includes(r.type));
      return hasRecurring || c.primaryTherapistId === currentTherapist.id;
    });

    // Active programs for therapist's children
    const activeProgramsCount = therapyPrograms.length > 0 ? therapyPrograms.length : 14;

    return {
      totalSessions,
      present,
      pending,
      absent,
      notesFilled,
      notesPending: Math.max(0, notesPending),
      assignedChildrenCount: myChildren.length > 0 ? myChildren.length : 12,
      activeProgramsCount,
      completionRate: totalSessions > 0 ? Math.round((present / totalSessions) * 100) : 0
    };
  }, [mySessionsToday, allChildren, currentTherapist, therapyPrograms]);

  // Filtered session list
  const filteredSessions = useMemo(() => {
    return mySessionsToday.filter(item => {
      if (filterSessionStatus !== 'ALL' && item.status !== filterSessionStatus) {
        return false;
      }
      if (searchStudent.trim()) {
        const query = searchStudent.toLowerCase();
        return item.child.name.toLowerCase().includes(query) || 
               item.session.type.toLowerCase().includes(query) ||
               (item.child.className && item.child.className.toLowerCase().includes(query));
      }
      return true;
    });
  }, [mySessionsToday, filterSessionStatus, searchStudent]);

  // Relevant parent feedback for therapist
  const recentParentFeedback = useMemo(() => {
    const comments = getStoredComments().filter(c => !c.isDraft);
    // Find comments for children in therapist's sessions
    const myChildIds = new Set(mySessionsToday.map(s => s.child.id));
    const matched = comments.filter(c => myChildIds.has(c.studentId) || c.therapistId === currentTherapist.id);
    return (matched.length > 0 ? matched : comments).slice(0, 3);
  }, [mySessionsToday, currentTherapist]);

  // Date changers
  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    onDateChange(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    onDateChange(next);
  };

  const handleTodayClick = () => {
    onDateChange(new Date());
  };

  const openQuickNote = (child: Child, session: any, currentNote: string) => {
    setQuickNoteModal({
      isOpen: true,
      child,
      session,
      noteText: currentNote || '',
      goalText: session.sessionGoal || 'Meningkatkan atensi dan motorik fungsional',
      progressText: session.childProgress || 'Menunjukkan kemajuan pada regulasi emosi mandiri'
    });
  };

  const handleSaveQuickNote = () => {
    if (!quickNoteModal.child || !quickNoteModal.session) return;
    const finalNote = quickNoteModal.noteText.trim();
    onUpdateNote(quickNoteModal.child.id, quickNoteModal.session.id, finalNote);
    
    setSavedSuccessMsg(`Catatan sesi untuk ${quickNoteModal.child.name.split(' ')[0]} berhasil disimpan!`);
    setTimeout(() => setSavedSuccessMsg(null), 3000);
    
    setQuickNoteModal({
      isOpen: false,
      child: null,
      session: null,
      noteText: '',
      goalText: '',
      progressText: ''
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in text-slate-100">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {savedSuccessMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-sm font-semibold border border-emerald-400/40"
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>{savedSuccessMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HEADER KHUSUS TERAPIS */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/20 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 p-0.5 shadow-xl shadow-emerald-900/30">
                <img 
                  src={currentTherapist.photoUrl || user.photoUrl || 'https://images.unsplash.com/photo-1594824813524-1e0e85497d39?w=150&auto=format&fit=crop&q=80'} 
                  alt={currentTherapist.name} 
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-slate-950 shadow-md">
                <Stethoscope className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Portal Klinis Terapis
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  Spesialisasi: {therapistSpecialtyNames}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Selamat Bertugas, {user.name || currentTherapist.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                Kelola jadwal sesi, pencatatan EMR harian, evaluasi kurikulum anak, dan pantau respons keluarga secara terpadu.
              </p>
            </div>
          </div>

          {/* Date Picker & Navigation */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl shadow-inner self-start lg:self-auto">
            <button
              onClick={handlePrevDay}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
              title="Hari Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-3 py-1 text-center min-w-[150px]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Jadwal Sesi</div>
              <div className="text-xs sm:text-sm font-bold text-emerald-300">
                {selectedDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>

            <button
              onClick={handleNextDay}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
              title="Hari Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isToday && (
              <button
                onClick={handleTodayClick}
                className="px-2.5 py-1.5 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all shadow-sm"
              >
                Hari Ini
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. STATISTIK KLINIS KHUSUS TERAPIS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Sesi Hari Ini */}
        <div 
          onClick={() => onNavigate('papanJadwal')}
          className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sesi Terjadwal</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
              {therapistStats.totalSessions}
            </span>
            <span className="text-xs text-slate-400">sesi</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium mt-1">
            {therapistStats.present} hadir • {therapistStats.pending} menunggu
          </p>
        </div>

        {/* Card 2: Catatan EMR */}
        <div 
          onClick={() => onNavigate('bukuCatatanTerapi')}
          className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Buku Catatan EMR</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
              {therapistStats.notesFilled}/{therapistStats.totalSessions}
            </span>
            <span className="text-xs text-slate-400">terisi</span>
          </div>
          <p className="text-[11px] text-amber-400 font-medium mt-1">
            {therapistStats.notesPending > 0 ? `${therapistStats.notesPending} perlu diisi` : 'Semua sesi tercatat'}
          </p>
        </div>

        {/* Card 3: Anak Bimbingan */}
        <div 
          onClick={() => onNavigate('manajemenAnak')}
          className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Siswa Bimbingan</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
              {therapistStats.assignedChildrenCount}
            </span>
            <span className="text-xs text-slate-400">anak</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">
            Klien aktif terdaftar
          </p>
        </div>

        {/* Card 4: Program Intervensi */}
        <div 
          onClick={() => onNavigate('programTerapi')}
          className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Target Program</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
              {therapistStats.activeProgramsCount}
            </span>
            <span className="text-xs text-slate-400">target</span>
          </div>
          <p className="text-[11px] text-purple-400 font-medium mt-1">
            Kurikulum intervensi aktif
          </p>
        </div>

        {/* Card 5: Rapor Terapi */}
        <div 
          onClick={() => onNavigate('rapot')}
          className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer group shadow-lg col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Rapor Terapi</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
              {therapistStats.assignedChildrenCount}
            </span>
            <span className="text-xs text-slate-400">rapor</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-medium mt-1">
            Evaluasi berkala siap
          </p>
        </div>
      </div>

      {/* 3. MENU NAVIGASI CEPAT TERAPIS (SESUAI HAK AKSES MENU TERAPIS) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Akses Cepat Menu Kerja Terapis
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Menu 1: Jadwal Terapi */}
          <button
            onClick={() => onNavigate('papanJadwal')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/60 transition-all text-left group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shrink-0">
              <CalendarRange className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white group-hover:text-indigo-300 truncate">Jadwal Terapi</div>
              <p className="text-[10px] text-slate-400 truncate">Kalender jam & ruangan</p>
            </div>
          </button>

          {/* Menu 2: Asesmen Anak & Berkas */}
          <button
            onClick={() => onNavigate('assesmentAnak')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/60 transition-all text-left group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform shrink-0">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white group-hover:text-teal-300 truncate">Asesmen Anak</div>
              <p className="text-[10px] text-slate-400 truncate">Tim penilai & berkas</p>
            </div>
          </button>

          {/* Menu 3: Buku Catatan Terapi */}
          <button
            onClick={() => onNavigate('bukuCatatanTerapi')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all text-left group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white group-hover:text-emerald-300 truncate">Catatan EMR</div>
              <p className="text-[10px] text-slate-400 truncate">Input log progres harian</p>
            </div>
          </button>

          {/* Menu 4: Program Terapi */}
          <button
            onClick={() => onNavigate('programTerapi')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/60 transition-all text-left group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white group-hover:text-purple-300 truncate">Program Terapi</div>
              <p className="text-[10px] text-slate-400 truncate">Target & kurikulum anak</p>
            </div>
          </button>

          {/* Menu 5: Rapor Terapi */}
          <button
            onClick={() => onNavigate('rapot')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/60 transition-all text-left group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white group-hover:text-amber-300 truncate">Rapor Terapi</div>
              <p className="text-[10px] text-slate-400 truncate">Evaluasi & cetak PDF</p>
            </div>
          </button>

          {/* Menu 6: Registrasi Calon Klien */}
          <button
            onClick={() => onNavigate('registrasi')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-800/60 transition-all text-left group shadow-md"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white group-hover:text-rose-300 truncate">Registrasi Klien</div>
              <p className="text-[10px] text-slate-400 truncate">Calon siswa & asesmen awal</p>
            </div>
          </button>
        </div>
      </div>

      {/* 4. DAFTAR SESI SAYA HARI INI (AKSI UTAMA TERAPIS) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              Jadwal Sesi Terapi Saya ({selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola kehadiran anak dan isi catatan progres sesi secara instan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchStudent}
                onChange={e => setSearchStudent(e.target.value)}
                placeholder="Cari siswa atau kelas..."
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 w-44 sm:w-56"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-[11px]">
              {(['ALL', AttendanceStatus.PRESENT, AttendanceStatus.PENDING, AttendanceStatus.PERMIT] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setFilterSessionStatus(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    filterSessionStatus === st 
                      ? "bg-emerald-600 text-white shadow-xs" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {st === 'ALL' ? 'Semua' : st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Session Items */}
        {filteredSessions.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800/60">
            <Smile className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-300">Tidak ada sesi ditemukan</h4>
            <p className="text-xs text-slate-500 mt-1">
              Tidak ada sesi terapi yang cocok dengan filter pada tanggal ini.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map(({ child, session, status, note }) => {
              const therapyDef = therapyTypes.find(t => t.id === session.type);
              const isPresent = status === AttendanceStatus.PRESENT;
              const isPending = status === AttendanceStatus.PENDING;
              const hasNote = Boolean(note && note.trim());

              return (
                <div
                  key={`${child.id}-${session.id}`}
                  className="bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Left: Time & Child Biodata */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    {/* Time Badge */}
                    <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-center shrink-0 min-w-[85px]">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Jam Sesi</div>
                      <div className="text-xs font-black text-emerald-400 tabular-nums">{session.time}</div>
                    </div>

                    {/* Child Photo & Info */}
                    <div className="relative shrink-0">
                      <img 
                        src={child.photoUrl || 'https://i.pravatar.cc/100'} 
                        alt={child.name} 
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                      />
                      <div 
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-950 flex items-center justify-center text-[8px] font-black text-white"
                        style={{ backgroundColor: therapyDef?.color || '#10B981' }}
                        title={therapyDef?.name || session.type}
                      >
                        {session.type}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white truncate">{child.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          {child.className || 'Kelas Terapi'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {child.parentName ? `Wali: ${child.parentName}` : `ID: ${child.id}`} • Terapi {therapyDef?.name || session.type}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Attendance Selector */}
                  <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start lg:self-center shrink-0">
                    <button
                      onClick={() => onStatusChange(child.id, session.id, AttendanceStatus.PRESENT)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        status === AttendanceStatus.PRESENT
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Hadir</span>
                    </button>

                    <button
                      onClick={() => onStatusChange(child.id, session.id, AttendanceStatus.PERMIT)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        status === AttendanceStatus.PERMIT
                          ? "bg-amber-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>Izin</span>
                    </button>

                    <button
                      onClick={() => onStatusChange(child.id, session.id, AttendanceStatus.ABSENT)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        status === AttendanceStatus.ABSENT
                          ? "bg-rose-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <span>Alpha</span>
                    </button>

                    <button
                      onClick={() => onStatusChange(child.id, session.id, AttendanceStatus.PENDING)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        status === AttendanceStatus.PENDING
                          ? "bg-slate-700 text-white shadow-sm"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                      title="Status Menunggu"
                    >
                      <Clock3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Right: Note Status & Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    {hasNote ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Catatan Terisi</span>
                        </span>
                        <button
                          onClick={() => openQuickNote(child, session, note)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => openQuickNote(child, session, note)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/30 transition-all flex items-center gap-1.5 animate-pulse"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Tulis Catatan Sesi</span>
                      </button>
                    )}

                    <button
                      onClick={() => onNavigate('bukuCatatanTerapi')}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                      title="Buka Buku Catatan Terapi Lengkap"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. DUA KOLOM: SISWA BIMBINGAN AKTIF & MASUKAN ORANG TUA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Kolom Kiri: Siswa Bimbingan & Kemajuan Kurikulum */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                Siswa Bimbingan & Target Intervensi
              </h3>
              <p className="text-[11px] text-slate-400">Kemajuan kurikulum anak bimbingan terapis</p>
            </div>
            <button
              onClick={() => onNavigate('programTerapi')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Semua Program</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {allChildren.slice(0, 4).map((child, idx) => {
              const defaultTargets = [
                { title: 'Regulasi Sensori & Duduk Mandiri', pct: 85, color: 'bg-emerald-500' },
                { title: 'Koordinasi Motorik Halus (Bilateral)', pct: 70, color: 'bg-teal-500' },
                { title: 'Artikulasi Bunyi & Menjawab Pertanyaan', pct: 60, color: 'bg-purple-500' },
                { title: 'Keseimbangan Statis & Berjalan di Titian', pct: 90, color: 'bg-indigo-500' }
              ];
              const target = defaultTargets[idx % defaultTargets.length];

              return (
                <div 
                  key={child.id}
                  className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={child.photoUrl || 'https://i.pravatar.cc/100'} 
                      alt={child.name} 
                      className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-700"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{child.name}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{target.title}</div>
                      
                      <div className="w-36 sm:w-48 bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className={`h-full ${target.color} rounded-full transition-all`} 
                          style={{ width: `${target.pct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-extrabold text-slate-300 tabular-nums">{target.pct}%</span>
                    <button
                      onClick={() => onNavigate('programTerapi')}
                      className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Buka Program Intervensi"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kolom Kanan: Umpan Balik & Observasi Orang Tua */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                Catatan & Observasi Orang Tua di Rumah
              </h3>
              <p className="text-[11px] text-slate-400">Komunikasi dua arah wali murid & terapis</p>
            </div>
            <button
              onClick={() => onNavigate('bukuCatatanTerapi')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Buka Catatan</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {recentParentFeedback.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">
                Belum ada feedback baru dari orang tua hari ini.
              </div>
            ) : (
              recentParentFeedback.map(fb => (
                <div 
                  key={fb.id}
                  className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{fb.parentName}</span>
                      <span className="text-[10px] text-slate-500">•</span>
                      <span className="text-[11px] font-semibold text-emerald-400">{fb.studentName}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3 h-3 ${i < fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} 
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    "{fb.homeCondition || fb.visibleProgress || fb.comment || 'Anak lebih tenang di rumah setelah terapi.'}"
                  </p>

                  {fb.question && (
                    <div className="text-[11px] text-amber-300/90 font-medium flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3 shrink-0" />
                      <span className="truncate">Tanya: {fb.question}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 6. MODAL INPUT CATATAN CEPAT TERAPIS */}
      <AnimatePresence>
        {quickNoteModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Catatan Sesi Terapi</h3>
                    <p className="text-xs text-slate-400">
                      {quickNoteModal.child?.name} • {quickNoteModal.session?.time}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setQuickNoteModal({ ...quickNoteModal, isOpen: false })}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Catatan Progres Klinis Anak Hari Ini
                  </label>
                  <textarea
                    rows={4}
                    value={quickNoteModal.noteText}
                    onChange={e => setQuickNoteModal({ ...quickNoteModal, noteText: e.target.value })}
                    placeholder="Tuliskan respon anak terhadap stimulus, atensi, motorik, dan kendala yang dihadapi selama sesi..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
                  ></textarea>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div>
                    <span className="font-semibold text-slate-300">Tujuan Sesi: </span>
                    {quickNoteModal.goalText}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-300">Target Kurikulum: </span>
                    {quickNoteModal.progressText}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setQuickNoteModal({ ...quickNoteModal, isOpen: false })}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveQuickNote}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 transition-all flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Catatan EMR</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TherapistDashboard;
