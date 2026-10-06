import React, { useState, useMemo, useCallback } from 'react';
import { Child, Therapist, TherapyDefinition, RecurringSession, UserRole } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Plus, 
  Filter, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Edit3, 
  X,
  Layers,
  Sparkles,
  Grid3X3,
  CalendarDays,
  CalendarRange,
  Table as TableIcon,
  Activity,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  CalendarCheck,
  Award,
  ArrowRight,
  Info,
  RotateCcw,
  AlertTriangle,
  AlertCircle,
  Trash2,
  ShieldAlert,
  Lightbulb
} from 'lucide-react';
import OccupationalTherapyIcon from './icons/OccupationalTherapyIcon';
import SpeechTherapyIcon from './icons/SpeechTherapyIcon';
import PhysiotherapyIcon from './icons/PhysiotherapyIcon';
import RemedialIcon from './icons/RemedialIcon';

interface ScheduleBoardPageProps {
  children: Child[];
  therapists: Therapist[];
  therapyTypes: TherapyDefinition[];
  onUpdateChild: (childId: string, updates: Partial<Child>) => void;
  userRole?: UserRole;
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const TIME_SLOTS = [
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

// Color mapping per jenis terapi requested:
// 🟢 Wicara (Emerald/Green), 🔵 Okupasi (Blue), 🟣 SI (Purple), 🟠 Fisioterapi (Amber/Orange), 🟡 Remedial (Pink/Yellow)
export const getTherapyColorInfo = (therapyType: string) => {
  const code = therapyType?.toUpperCase();
  if (code === 'TW' || code === 'WICARA') {
    return {
      name: 'Wicara',
      bg: 'bg-emerald-500/15',
      border: 'border-emerald-500/50',
      text: 'text-emerald-300',
      badge: 'bg-emerald-500 text-white',
      hex: '#10B981',
      dot: 'bg-emerald-400'
    };
  }
  if (code === 'OT' || code === 'OKUPASI') {
    return {
      name: 'Okupasi',
      bg: 'bg-blue-500/15',
      border: 'border-blue-500/50',
      text: 'text-blue-300',
      badge: 'bg-blue-500 text-white',
      hex: '#3B82F6',
      dot: 'bg-blue-400'
    };
  }
  if (code === 'SI' || code === 'SENSORI') {
    return {
      name: 'SI (Sensori)',
      bg: 'bg-purple-500/15',
      border: 'border-purple-500/50',
      text: 'text-purple-300',
      badge: 'bg-purple-500 text-white',
      hex: '#8B5CF6',
      dot: 'bg-purple-400'
    };
  }
  if (code === 'FT' || code === 'FISIOTERAPI') {
    return {
      name: 'Fisioterapi',
      bg: 'bg-amber-500/15',
      border: 'border-amber-500/50',
      text: 'text-amber-300',
      badge: 'bg-amber-500 text-white',
      hex: '#F59E0B',
      dot: 'bg-amber-400'
    };
  }
  // Remedial default
  return {
    name: 'Remedial',
    bg: 'bg-pink-500/15',
    border: 'border-pink-500/50',
    text: 'text-pink-300',
    badge: 'bg-pink-500 text-white',
    hex: '#EC4899',
    dot: 'bg-pink-400'
  };
};

export const ScheduleBoardPage: React.FC<ScheduleBoardPageProps> = ({
  children,
  therapists,
  therapyTypes,
  onUpdateChild,
  userRole
}) => {
  const isReadOnly = userRole === 'siswa';
  const [calendarView, setCalendarView] = useState<'daily' | 'weekly' | 'monthly' | 'matrix'>('weekly');
  const [selectedDay, setSelectedDay] = useState<string>('Senin');
  const [selectedTherapyFilter, setSelectedTherapyFilter] = useState<string>('ALL');
  const [selectedTherapistFilter, setSelectedTherapistFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Month & Year State for total monthly hours calculation & navigation
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear()); // e.g. 2026
  const [showTherapistBreakdown, setShowTherapistBreakdown] = useState(false);
  
  // Add/Edit schedule modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingOriginalSession, setEditingOriginalSession] = useState<{
    childId: string;
    day: string;
    time: string;
    type: string;
    therapistId?: string;
  } | null>(null);

  // Selected session for detail modal
  const [selectedSessionForDetail, setSelectedSessionForDetail] = useState<{
    childId: string;
    childName: string;
    childPhoto: string;
    day: string;
    time: string;
    type: string;
    therapistId?: string;
    note?: string;
  } | null>(null);

  const [modalChildId, setModalChildId] = useState<string>(children[0]?.id || '');
  const [modalDay, setModalDay] = useState<string>('Senin');
  const [modalTime, setModalTime] = useState<string>(TIME_SLOTS[1]);
  const [modalType, setModalType] = useState<string>('OT');
  const [modalTherapistId, setModalTherapistId] = useState<string>(therapists[0]?.id || '');
  const [modalNote, setModalNote] = useState('');
  const [modalErrorMessage, setModalErrorMessage] = useState('');
  const [saveSuccessNotification, setSaveSuccessNotification] = useState<string | null>(null);

  // Collect all scheduled sessions across children
  const allScheduledSessions = useMemo(() => {
    const list: Array<{
      childId: string;
      childName: string;
      childPhoto: string;
      day: string;
      time: string;
      type: string;
      therapistId?: string;
      note?: string;
    }> = [];

    children.forEach(child => {
      if (child.status === 'Non-Aktif') return;
      child.recurringSessions?.forEach(session => {
        list.push({
          childId: child.id,
          childName: child.name,
          childPhoto: child.photoUrl,
          day: session.day,
          time: session.time,
          type: session.type,
          therapistId: session.therapistId,
          note: session.note
        });
      });
    });

    return list;
  }, [children]);

  // Filtered sessions for board views
  const filteredSessions = useMemo(() => {
    return allScheduledSessions.filter(s => {
      if (selectedTherapyFilter !== 'ALL' && s.type !== selectedTherapyFilter) return false;
      if (selectedTherapistFilter !== 'ALL' && s.therapistId !== selectedTherapistFilter) return false;
      if (searchQuery.trim() && !s.childName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [allScheduledSessions, selectedTherapyFilter, selectedTherapistFilter, searchQuery]);

  // Total days in selected month
  const daysInSelectedMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Calculate occurrences of each Indonesian day name in selected month
  const dayOccurrencesInMonth = useMemo(() => {
    // 0: Minggu, 1: Senin, 2: Selasa, 3: Rabu, 4: Kamis, 5: Jumat, 6: Sabtu
    const jsDayMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const counts: Record<string, number> = {
      'Senin': 0,
      'Selasa': 0,
      'Rabu': 0,
      'Kamis': 0,
      'Jumat': 0,
      'Sabtu': 0,
      'Minggu': 0,
    };

    for (let day = 1; day <= daysInSelectedMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      const dayName = jsDayMap[date.getDay()];
      counts[dayName] = (counts[dayName] || 0) + 1;
    }
    return counts;
  }, [selectedYear, selectedMonth, daysInSelectedMonth]);

  // Comprehensive monthly therapy metrics calculation
  const monthlyMetrics = useMemo(() => {
    let totalHours = 0;
    let totalSessions = 0;
    const hoursByType: Record<string, { hours: number; sessions: number }> = {
      TW: { hours: 0, sessions: 0 },
      OT: { hours: 0, sessions: 0 },
      SI: { hours: 0, sessions: 0 },
      FT: { hours: 0, sessions: 0 },
      REMEDIAL: { hours: 0, sessions: 0 }
    };
    const hoursByTherapist: Record<string, number> = {};
    const scheduledChildrenSet = new Set<string>();

    allScheduledSessions.forEach(session => {
      // 1 standard slot = 1 hour
      const occurrences = dayOccurrencesInMonth[session.day] || 0;
      if (occurrences > 0) {
        const sessionHours = occurrences * 1;
        totalHours += sessionHours;
        totalSessions += occurrences;
        scheduledChildrenSet.add(session.childId);

        const normalizedType = session.type.toUpperCase();
        if (!hoursByType[normalizedType]) {
          hoursByType[normalizedType] = { hours: 0, sessions: 0 };
        }
        hoursByType[normalizedType].hours += sessionHours;
        hoursByType[normalizedType].sessions += occurrences;

        if (session.therapistId) {
          hoursByTherapist[session.therapistId] = (hoursByTherapist[session.therapistId] || 0) + sessionHours;
        }
      }
    });

    // Operational days (excluding Sundays if any)
    const operationalDays = daysInSelectedMonth - (dayOccurrencesInMonth['Minggu'] || 0);

    return {
      totalHours,
      totalSessions,
      uniqueChildrenCount: scheduledChildrenSet.size,
      operationalDays,
      averageHoursPerDay: operationalDays > 0 ? (totalHours / operationalDays).toFixed(1) : '0',
      hoursByType,
      hoursByTherapist
    };
  }, [allScheduledSessions, dayOccurrencesInMonth, daysInSelectedMonth]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const handleResetToCurrentMonth = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
  };

  const isCurrentMonthSelected = selectedMonth === currentDate.getMonth() && selectedYear === currentDate.getFullYear();

  // Comprehensive conflict detection for any proposed schedule
  const checkConflict = useCallback((
    childId: string,
    day: string,
    time: string,
    therapistId: string,
    exclude?: { childId: string; day: string; time: string; type?: string; therapistId?: string } | null
  ) => {
    let therapistConflict: {
      therapistName: string;
      childName: string;
      childId: string;
      therapyType: string;
      day: string;
      time: string;
    } | null = null;

    let childConflict: {
      childName: string;
      therapistName: string;
      therapyType: string;
      day: string;
      time: string;
    } | null = null;

    const targetChild = children.find(c => c.id === childId);
    const targetTherapist = therapists.find(t => t.id === therapistId);

    // 1. Check Child Conflict (Does this child already have a therapy session at this day & time?)
    if (targetChild && targetChild.recurringSessions) {
      const match = targetChild.recurringSessions.find(s => {
        if (
          exclude &&
          exclude.childId === targetChild.id &&
          exclude.day === s.day &&
          exclude.time === s.time &&
          exclude.type === s.type
        ) {
          return false;
        }
        return s.day === day && s.time === time;
      });

      if (match) {
        const bookedTherapist = therapists.find(t => t.id === match.therapistId);
        const bookedType = therapyTypes.find(t => t.id === match.type)?.name || match.type;
        childConflict = {
          childName: targetChild.name,
          therapistName: bookedTherapist?.name || 'Terapis Pendamping',
          therapyType: bookedType,
          day,
          time
        };
      }
    }

    // 2. Check Therapist Conflict (Is this therapist already booked on this day & time by any active child?)
    if (therapistId) {
      for (const otherChild of children) {
        if (otherChild.status === 'Non-Aktif') continue;
        if (!otherChild.recurringSessions) continue;

        const match = otherChild.recurringSessions.find(s => {
          if (
            exclude &&
            exclude.childId === otherChild.id &&
            exclude.day === s.day &&
            exclude.time === s.time &&
            exclude.therapistId === s.therapistId
          ) {
            return false;
          }
          return s.day === day && s.time === time && s.therapistId === therapistId;
        });

        if (match) {
          const bookedType = therapyTypes.find(t => t.id === match.type)?.name || match.type;
          therapistConflict = {
            therapistName: targetTherapist?.name || 'Terapis',
            childName: otherChild.name,
            childId: otherChild.id,
            therapyType: bookedType,
            day,
            time
          };
          break;
        }
      }
    }

    const hasConflict = Boolean(childConflict || therapistConflict);
    const conflictReasons: string[] = [];
    if (therapistConflict) {
      conflictReasons.push(`Terapis ${therapistConflict.therapistName} sedang menangani siswa ${therapistConflict.childName} (${therapistConflict.therapyType})`);
    }
    if (childConflict) {
      conflictReasons.push(`Siswa ${childConflict.childName} sudah terjadwal terapi ${childConflict.therapyType} bersama ${childConflict.therapistName}`);
    }

    return {
      hasConflict,
      therapistConflict,
      childConflict,
      conflictReasons,
      summaryMessage: conflictReasons.join(' dan ')
    };
  }, [children, therapists, therapyTypes]);

  // Real-time conflict status for the active modal inputs
  const currentModalConflict = useMemo(() => {
    return checkConflict(
      modalChildId,
      modalDay,
      modalTime,
      modalTherapistId,
      isEditMode ? editingOriginalSession : null
    );
  }, [checkConflict, modalChildId, modalDay, modalTime, modalTherapistId, isEditMode, editingOriginalSession]);

  // Helper to find the first conflict-free time slot on a given day for current child & therapist
  const findAvailableTimeSlot = useCallback((day: string, childId: string, therapistId: string) => {
    for (const slot of TIME_SLOTS) {
      const res = checkConflict(childId, day, slot, therapistId, isEditMode ? editingOriginalSession : null);
      if (!res.hasConflict) {
        return slot;
      }
    }
    return null;
  }, [checkConflict, isEditMode, editingOriginalSession]);

  // Handle saving new or updated session with strict conflict prevention
  const handleSaveSession = () => {
    setModalErrorMessage('');

    if (currentModalConflict.hasConflict) {
      setModalErrorMessage(
        `Jadwal bentrok dengan: ${currentModalConflict.summaryMessage}! Jadwal tidak dapat ditambahkan pada jam yang sama.`
      );
      return;
    }

    const targetChild = children.find(c => c.id === modalChildId);
    if (!targetChild) {
      setModalErrorMessage('Data siswa tidak ditemukan.');
      return;
    }

    const newSession: RecurringSession = {
      day: modalDay,
      time: modalTime,
      type: modalType,
      therapistId: modalTherapistId || undefined,
      note: modalNote.trim() || undefined
    };

    if (isEditMode && editingOriginalSession) {
      // If child changed in edit mode
      if (editingOriginalSession.childId !== modalChildId) {
        // Remove from old child
        const oldChild = children.find(c => c.id === editingOriginalSession.childId);
        if (oldChild && oldChild.recurringSessions) {
          const updatedOldSessions = oldChild.recurringSessions.filter(
            s => !(s.day === editingOriginalSession.day && s.time === editingOriginalSession.time && s.type === editingOriginalSession.type)
          );
          onUpdateChild(oldChild.id, { recurringSessions: updatedOldSessions });
        }
        // Add to new child
        const newChildSessions = targetChild.recurringSessions ? [...targetChild.recurringSessions, newSession] : [newSession];
        onUpdateChild(targetChild.id, { recurringSessions: newChildSessions });
      } else {
        // Same child, update session
        const currentSessions = targetChild.recurringSessions || [];
        const updatedSessions = currentSessions.map(s => {
          if (s.day === editingOriginalSession.day && s.time === editingOriginalSession.time && s.type === editingOriginalSession.type) {
            return newSession;
          }
          return s;
        });
        onUpdateChild(targetChild.id, { recurringSessions: updatedSessions });
      }
      setSaveSuccessNotification(`Jadwal terapi untuk ${targetChild.name} berhasil diperbarui.`);
    } else {
      // Add new session
      const existing = targetChild.recurringSessions || [];
      onUpdateChild(targetChild.id, {
        recurringSessions: [...existing, newSession]
      });
      setSaveSuccessNotification(`Jadwal terapi untuk ${targetChild.name} (${modalDay}, ${modalTime}) berhasil disimpan.`);
    }

    setIsAddModalOpen(false);
    setIsEditMode(false);
    setEditingOriginalSession(null);
    setModalNote('');
    setSelectedSessionForDetail(null);

    // Auto clear notification after 4s
    setTimeout(() => {
      setSaveSuccessNotification(null);
    }, 4000);
  };

  // Handle deleting a session
  const handleDeleteSession = (childId: string, day: string, time: string, type: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;
    if (!window.confirm(`Apakah Anda yakin ingin menghapus jadwal terapi ${type} untuk ${child.name} pada ${day} (${time})?`)) {
      return;
    }

    const updated = (child.recurringSessions || []).filter(
      s => !(s.day === day && s.time === time && s.type === type)
    );
    onUpdateChild(child.id, { recurringSessions: updated });
    setSelectedSessionForDetail(null);
    setSaveSuccessNotification(`Jadwal sesi ${day} (${time}) berhasil dihapus.`);
    setTimeout(() => {
      setSaveSuccessNotification(null);
    }, 4000);
  };

  // Open add modal with preset
  const handleOpenAddModal = (presetDay?: string, presetTime?: string, presetChildId?: string) => {
    setIsEditMode(false);
    setEditingOriginalSession(null);
    setModalErrorMessage('');
    if (presetDay) setModalDay(presetDay);
    if (presetTime) setModalTime(presetTime);
    if (presetChildId) {
      setModalChildId(presetChildId);
    } else if (!modalChildId && children[0]) {
      setModalChildId(children[0].id);
    }
    if (!modalTherapistId && therapists[0]) {
      setModalTherapistId(therapists[0].id);
    }
    setModalNote('');
    setIsAddModalOpen(true);
  };

  // Open edit modal for an existing session
  const handleOpenEditModal = (session: {
    childId: string;
    childName: string;
    day: string;
    time: string;
    type: string;
    therapistId?: string;
    note?: string;
  }) => {
    setIsEditMode(true);
    setEditingOriginalSession({
      childId: session.childId,
      day: session.day,
      time: session.time,
      type: session.type,
      therapistId: session.therapistId
    });
    setModalChildId(session.childId);
    setModalDay(session.day);
    setModalTime(session.time);
    setModalType(session.type);
    setModalTherapistId(session.therapistId || therapists[0]?.id || '');
    setModalNote(session.note || '');
    setModalErrorMessage('');
    setSelectedSessionForDetail(null);
    setIsAddModalOpen(true);
  };

  // Helper to get sessions at slot
  const getSessionsAt = (day: string, time: string) => {
    return filteredSessions.filter(s => s.day === day && s.time === time);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0F172A] text-slate-100 p-4 sm:p-6 lg:p-8 custom-scrollbar">
      {/* Header with Title and Mode Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5" />
              Sistem Manajemen Terapi
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-400">Jadwal & Kalkulasi Jam Terpadu</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Jadwal Terapi & Akumulasi Jam Bulanan
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Visualisasi jadwal dengan pembatas jam yang jelas, kalkulasi otomatis jam terapi bulanan, dan simulasi bulan berikutnya.
          </p>
        </div>

        {/* View Switcher & Action */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Calendar View Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl shadow-inner text-xs">
            <button
              onClick={() => setCalendarView('weekly')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                calendarView === 'weekly' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mingguan (Weekly)
            </button>
            <button
              onClick={() => setCalendarView('daily')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                calendarView === 'daily' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Harian (Daily)
            </button>
            <button
              onClick={() => setCalendarView('monthly')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                calendarView === 'monthly' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bulanan (Monthly)
            </button>
            <button
              onClick={() => setCalendarView('matrix')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                calendarView === 'matrix' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Matriks Terapis
            </button>
          </div>

          {/* Add Schedule Button */}
          {!isReadOnly && (
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Tambah Jadwal
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {saveSuccessNotification && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{saveSuccessNotification}</span>
          </div>
          <button
            onClick={() => setSaveSuccessNotification(null)}
            className="text-emerald-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MONTH SELECTOR & MONTHLY THERAPY HOURS STATS BANNER */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border-2 border-indigo-500/25 rounded-2xl p-5 mb-6 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        {/* Top Control Bar: Month Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-inner">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
                  Total Jam Terapi Keseluruhan
                </span>
                {!isCurrentMonthSelected && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                    Mode Simulasi Bulan
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                Periode: {MONTH_NAMES[selectedMonth]} {selectedYear}
              </h2>
            </div>
          </div>

          {/* Month Switcher Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrevMonth}
              title="Lihat Bulan Sebelumnya"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1 shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Bulan Sebelumnya</span>
            </button>

            {/* Quick Month Dropdown */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>

            {/* Year Dropdown */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 text-white rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none focus:border-indigo-500 shadow-inner"
            >
              {[2025, 2026, 2027, 2028].map(yr => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>

            <button
              onClick={handleNextMonth}
              title="Lihat Bulan Berikutnya"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1 active:scale-95"
            >
              <span>Bulan Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isCurrentMonthSelected && (
              <button
                onClick={handleResetToCurrentMonth}
                title="Kembali ke Bulan Sekarang"
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 4 Core Monthly KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-4 relative z-10">
          {/* Main KPI: Total Jam Terapi Keseluruhan */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 to-slate-900 border-2 border-indigo-500/40 shadow-lg relative group">
            <div className="flex items-center justify-between text-indigo-300 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Total Jam Terapi</span>
              <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Clock className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {monthlyMetrics.totalHours}
              </span>
              <span className="text-indigo-300 text-xs font-extrabold uppercase">Jam</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Akumulasi sebulan penuh ({daysInSelectedMonth} hari kalender)
            </p>
          </div>

          {/* Sesi Terjadwal */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Total Sesi Terjadwal</span>
              <span className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Activity className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight">
                {monthlyMetrics.totalSessions}
              </span>
              <span className="text-emerald-500 text-xs font-extrabold uppercase">Sesi</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Rata-rata {monthlyMetrics.averageHoursPerDay} sesi / hari operasional
            </p>
          </div>

          {/* Siswa Terlayani */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Siswa Terjadwal</span>
              <span className="p-1 rounded-lg bg-blue-500/10 text-blue-400">
                <User className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-blue-400 tracking-tight">
                {monthlyMetrics.uniqueChildrenCount}
              </span>
              <span className="text-blue-500 text-xs font-extrabold uppercase">Anak</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Pasien aktif memiliki jadwal terapi
            </p>
          </div>

          {/* Hari Operasional */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="font-bold uppercase tracking-wider">Hari Operasional</span>
              <span className="p-1 rounded-lg bg-amber-500/10 text-amber-400">
                <CalendarDays className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">
                {monthlyMetrics.operationalDays}
              </span>
              <span className="text-amber-500 text-xs font-extrabold uppercase">Hari</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Senin s/d Sabtu di {MONTH_NAMES[selectedMonth]} {selectedYear}
            </p>
          </div>
        </div>

        {/* Therapy Hours Breakdown per Modality & Therapist Toggle */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider mr-1">
              Rincian Jam per Modalitas:
            </span>
            {/* Wicara */}
            <div 
              onClick={() => setSelectedTherapyFilter(selectedTherapyFilter === 'TW' ? 'ALL' : 'TW')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                selectedTherapyFilter === 'TW' 
                  ? 'bg-emerald-500/30 border-emerald-400 text-white font-bold ring-1 ring-emerald-400' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Wicara:</span>
              <strong className="text-white font-mono">{monthlyMetrics.hoursByType['TW']?.hours || 0} Jam</strong>
              <span className="text-[10px] text-emerald-400/80">({monthlyMetrics.hoursByType['TW']?.sessions || 0} sesi)</span>
            </div>

            {/* Okupasi */}
            <div 
              onClick={() => setSelectedTherapyFilter(selectedTherapyFilter === 'OT' ? 'ALL' : 'OT')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                selectedTherapyFilter === 'OT' 
                  ? 'bg-blue-500/30 border-blue-400 text-white font-bold ring-1 ring-blue-400' 
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              <span>Okupasi:</span>
              <strong className="text-white font-mono">{monthlyMetrics.hoursByType['OT']?.hours || 0} Jam</strong>
              <span className="text-[10px] text-blue-400/80">({monthlyMetrics.hoursByType['OT']?.sessions || 0} sesi)</span>
            </div>

            {/* SI */}
            <div 
              onClick={() => setSelectedTherapyFilter(selectedTherapyFilter === 'SI' ? 'ALL' : 'SI')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                selectedTherapyFilter === 'SI' 
                  ? 'bg-purple-500/30 border-purple-400 text-white font-bold ring-1 ring-purple-400' 
                  : 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span>SI:</span>
              <strong className="text-white font-mono">{monthlyMetrics.hoursByType['SI']?.hours || 0} Jam</strong>
              <span className="text-[10px] text-purple-400/80">({monthlyMetrics.hoursByType['SI']?.sessions || 0} sesi)</span>
            </div>

            {/* Fisioterapi */}
            <div 
              onClick={() => setSelectedTherapyFilter(selectedTherapyFilter === 'FT' ? 'ALL' : 'FT')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                selectedTherapyFilter === 'FT' 
                  ? 'bg-amber-500/30 border-amber-400 text-white font-bold ring-1 ring-amber-400' 
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Fisioterapi:</span>
              <strong className="text-white font-mono">{monthlyMetrics.hoursByType['FT']?.hours || 0} Jam</strong>
              <span className="text-[10px] text-amber-400/80">({monthlyMetrics.hoursByType['FT']?.sessions || 0} sesi)</span>
            </div>

            {/* Remedial */}
            <div 
              onClick={() => setSelectedTherapyFilter(selectedTherapyFilter === 'REMEDIAL' ? 'ALL' : 'REMEDIAL')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
                selectedTherapyFilter === 'REMEDIAL' 
                  ? 'bg-pink-500/30 border-pink-400 text-white font-bold ring-1 ring-pink-400' 
                  : 'bg-pink-500/10 border-pink-500/30 text-pink-300 hover:bg-pink-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-pink-400"></span>
              <span>Remedial:</span>
              <strong className="text-white font-mono">{monthlyMetrics.hoursByType['REMEDIAL']?.hours || 0} Jam</strong>
              <span className="text-[10px] text-pink-400/80">({monthlyMetrics.hoursByType['REMEDIAL']?.sessions || 0} sesi)</span>
            </div>
          </div>

          <button
            onClick={() => setShowTherapistBreakdown(!showTherapistBreakdown)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 flex items-center gap-1 self-start lg:self-center"
          >
            {showTherapistBreakdown ? 'Tutup Rincian Terapis' : 'Lihat Jam Terapi Per Terapis'}
          </button>
        </div>

        {/* Expandable Therapist Monthly Load Breakdown */}
        {showTherapistBreakdown && (
          <div className="mt-4 pt-3 border-t border-slate-800 animate-fade-in">
            <h4 className="text-xs font-bold text-slate-300 mb-2.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              Alokasi Jam Terapi Per Terapis di Bulan {MONTH_NAMES[selectedMonth]} {selectedYear}:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {therapists.map(t => {
                const hours = monthlyMetrics.hoursByTherapist[t.id] || 0;
                return (
                  <div key={t.id} className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl">
                    <div className="text-[11px] font-bold text-white truncate">{t.name.split(',')[0]}</div>
                    <div className="text-[10px] text-slate-400 truncate">{t.specialties.join(', ')}</div>
                    <div className="mt-1.5 flex items-baseline justify-between">
                      <span className="text-xs font-black text-indigo-400 font-mono">{hours} Jam</span>
                      <span className="text-[9px] text-slate-500 font-mono">({hours} sesi)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Therapy Color Legend & Filters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            Indikator Warna Terapi:
          </span>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm"></span>
              <span className="text-slate-200">🟢 Wicara</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></span>
              <span className="text-slate-200">🔵 Okupasi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500 shadow-sm"></span>
              <span className="text-slate-200">🟣 Sensori Integrasi (SI)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm"></span>
              <span className="text-slate-200">🟠 Fisioterapi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-pink-500 shadow-sm"></span>
              <span className="text-slate-200">🟡 Remedial</span>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama pasien anak..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 w-full sm:w-56"
            />
          </div>

          <select
            value={selectedTherapyFilter}
            onChange={(e) => setSelectedTherapyFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Jenis Terapi</option>
            <option value="TW">Wicara (TW)</option>
            <option value="OT">Okupasi (OT)</option>
            <option value="SI">Sensori Integrasi (SI)</option>
            <option value="FT">Fisioterapi (FT)</option>
            <option value="REMEDIAL">Remedial</option>
          </select>

          <select
            value={selectedTherapistFilter}
            onChange={(e) => setSelectedTherapistFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Terapis</option>
            {therapists.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          {(selectedTherapyFilter !== 'ALL' || selectedTherapistFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedTherapyFilter('ALL');
                setSelectedTherapistFilter('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: WEEKLY VIEW (WITH DISTINCT HOUR BOUNDARIES) */}
      {calendarView === 'weekly' && (
        <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
          {/* Subheader info bar */}
          <div className="bg-slate-950 px-4 py-2.5 border-b-2 border-slate-700 flex flex-wrap items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
              <span className="font-semibold text-white">Tampilan Mingguan dengan Pembatas Jam Tegas</span>
            </div>
            <span className="text-[11px]">
              Setiap baris merupakan 1 slot jam (60 menit) dengan garis batas horizontal dan pemisah waktu yang kontras.
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-950 border-b-2 border-slate-600 text-xs">
                  <th className="p-3.5 w-32 text-center font-black text-indigo-400 border-r-2 border-slate-700 bg-slate-950">
                    <div className="flex items-center justify-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>JAM / WAKTU</span>
                    </div>
                  </th>
                  {DAYS.map(day => (
                    <th key={day} className="p-3 text-center font-bold text-slate-200 border-r-2 border-slate-700 last:border-r-0">
                      <span className="block text-indigo-400 uppercase tracking-wider text-xs font-black">{day}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {filteredSessions.filter(s => s.day === day).length} Sesi Terjadwal
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-xs">
                {TIME_SLOTS.map((time, slotIndex) => {
                  const [startTime, endTime] = time.split(' - ');
                  const isEvenRow = slotIndex % 2 === 0;

                  return (
                    <tr 
                      key={time} 
                      className={`transition-colors border-b-2 border-slate-700/90 hover:bg-indigo-950/20 ${
                        isEvenRow ? 'bg-slate-900/90' : 'bg-slate-950/70'
                      }`}
                    >
                      {/* Time Column with Clear Hours Boundary & Badge */}
                      <td className="p-3 font-mono text-center border-r-2 border-slate-700 bg-slate-950/95 shadow-sm align-middle select-none">
                        <div className="inline-flex flex-col items-center justify-center py-1 px-2 rounded-xl bg-slate-900 border border-slate-700/80 shadow-inner w-full">
                          <span className="text-xs font-black text-indigo-300 tracking-wider">
                            {startTime}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold leading-tight">
                            s/d {endTime}
                          </span>
                          <span className="mt-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            1 Jam
                          </span>
                        </div>
                      </td>

                      {/* Day Columns */}
                      {DAYS.map(day => {
                        const sessionsInSlot = getSessionsAt(day, time);
                        return (
                          <td 
                            key={`${day}-${time}`} 
                            className={`p-1.5 border-r-2 border-slate-700/80 last:border-r-0 align-top min-h-[72px] h-20 w-36 transition-all relative group/cell ${
                              isReadOnly ? "cursor-default" : "hover:bg-slate-800/40 cursor-pointer"
                            }`}
                            onClick={() => {
                              if (isReadOnly) return;
                              handleOpenAddModal(day, time);
                            }}
                          >
                            {/* Inner Box to give clear visual container separation */}
                            <div className="h-full rounded-xl p-1 bg-slate-950/40 border border-slate-800/80 hover:border-indigo-500/50 transition-colors flex flex-col justify-start gap-1">
                              {sessionsInSlot.length === 0 ? (
                                <div className="h-full flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity">
                                  {!isReadOnly && (
                                    <span className="text-[10px] text-indigo-400 font-medium bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                      + Jadwalkan
                                    </span>
                                  )}
                                </div>
                              ) : (
                                sessionsInSlot.map((s, sIdx) => {
                                  const color = getTherapyColorInfo(s.type);
                                  const therapist = therapists.find(t => t.id === s.therapistId);
                                  return (
                                    <div
                                      key={sIdx}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedSessionForDetail(s);
                                      }}
                                      className={`p-1.5 rounded-lg border-2 ${color.bg} ${color.border} ${color.text} shadow-md transition-all hover:scale-[1.02] cursor-pointer`}
                                      title={`${s.childName} • ${color.name} • ${therapist?.name || 'Terapis'} (Klik untuk detail/kelola)`}
                                    >
                                      <div className="flex items-center justify-between gap-1">
                                        <span className="font-extrabold truncate text-[11px] text-white">
                                          {s.childName}
                                        </span>
                                        <span className={`text-[8px] font-black px-1 rounded shadow-xs ${color.badge}`}>
                                          {s.type}
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-slate-300 truncate mt-0.5 flex items-center gap-1 font-medium">
                                        <span className={`w-1.5 h-1.5 rounded-full ${color.dot} shrink-0`}></span>
                                        <span className="truncate">{therapist ? therapist.name.split(',')[0] : 'Terapis'}</span>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: DAILY VIEW (WITH CLEAR HOUR DIVIDERS) */}
      {calendarView === 'daily' && (
        <div className="space-y-4">
          {/* Day Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  selectedDay === day
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                <span>{day}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedDay === day ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {filteredSessions.filter(s => s.day === day).length}
                </span>
              </button>
            ))}
          </div>

          {/* Daily Schedule Timeline with Solid Separators */}
          <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-700 mb-5">
              <div>
                <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-indigo-400" />
                  Jadwal Terapi Hari {selectedDay}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tiap slot waktu dibatasi dengan garis pemisah waktu yang terstruktur dan durasi 1 jam.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-500/40 px-3 py-1.5 rounded-xl">
                {filteredSessions.filter(s => s.day === selectedDay).length} Total Pasien Terjadwal
              </span>
            </div>

            {/* Separated Hour Cards */}
            <div className="space-y-4">
              {TIME_SLOTS.map((time, idx) => {
                const sessions = getSessionsAt(selectedDay, time);
                const [start, end] = time.split(' - ');
                return (
                  <div 
                    key={time} 
                    className="rounded-2xl bg-slate-950/80 border-2 border-slate-700/70 p-4 shadow-md transition-all hover:border-indigo-500/40"
                  >
                    {/* Explicit Hour Boundary Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b-2 border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-indigo-300">
                            {time} WIB
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                            Durasi 1 Jam
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {sessions.length > 0 ? `${sessions.length} Pasien Terjadwal` : 'Kosong'}
                      </span>
                    </div>

                    {/* Content inside the hour slot */}
                    <div>
                      {sessions.length === 0 ? (
                        !isReadOnly ? (
                          <div 
                            onClick={() => handleOpenAddModal(selectedDay, time)}
                            className="text-xs text-slate-400 italic p-3 rounded-xl border-2 border-dashed border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 hover:text-white cursor-pointer transition-all flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4 text-indigo-400" />
                            Klik di sini untuk menjadwalkan pasien pada slot {time}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500 italic p-2.5 rounded-xl border border-slate-850 bg-slate-900/50 text-center">
                            Tidak ada sesi terapi pada jam ini
                          </div>
                        )
                      ) : (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {sessions.map((s, sIdx) => {
                              const color = getTherapyColorInfo(s.type);
                              const therapist = therapists.find(t => t.id === s.therapistId);
                              return (
                                <div
                                  key={sIdx}
                                  onClick={() => setSelectedSessionForDetail(s)}
                                  className={`p-3.5 rounded-xl border-2 ${color.bg} ${color.border} shadow-md cursor-pointer hover:border-indigo-400 hover:scale-[1.01] transition-all`}
                                  title="Klik untuk detail / ubah / hapus jadwal"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${color.badge}`}>
                                      {color.name}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
                                      {s.time}
                                    </span>
                                  </div>
                                  <h4 className="font-extrabold text-white text-sm truncate">{s.childName}</h4>
                                  <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="font-semibold">{therapist ? therapist.name : 'Terapis Belum Ditugaskan'}</span>
                                  </p>
                                  {s.note && (
                                    <p className="text-[11px] text-slate-300 mt-2 pt-2 border-t border-slate-800/80 italic">
                                      "{s.note}"
                                    </p>
                                  )}
                                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-indigo-300">
                                    <span className="font-semibold flex items-center gap-1">
                                      <Edit3 className="w-3 h-3" />
                                      Kelola Sesi
                                    </span>
                                    <span className="text-slate-500 text-[10px]">Klik untuk opsi</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {!isReadOnly && (
                            <div className="flex justify-end pt-1">
                              <button
                                onClick={() => handleOpenAddModal(selectedDay, time)}
                                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
                              >
                                <Plus className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Tambah Pasien Lain di Jam Ini</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: MONTHLY VIEW (REAL CALENDAR SYNCHRONIZED WITH SELECTED MONTH) */}
      {calendarView === 'monthly' && (
        <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl p-5 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b-2 border-slate-700">
            <div>
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-400" />
                Kalender Terapi Bulan {MONTH_NAMES[selectedMonth]} {selectedYear}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Proyeksi seluruh hari di bulan {MONTH_NAMES[selectedMonth]} {selectedYear} berdasarkan jadwal sesi aktif.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white border border-slate-700"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-white px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700">
                {MONTH_NAMES[selectedMonth]} {selectedYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white border border-slate-700"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Grid Header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {DAYS.map(day => (
              <div 
                key={day} 
                className="p-2 text-center text-xs font-black text-indigo-400 bg-slate-950 rounded-xl border border-slate-800 uppercase tracking-wider"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Real Calendar Grid calculation */}
          {(() => {
            const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 is Sunday
            // Indonesian week starts on Monday: Monday=0, Tuesday=1, ..., Sunday=6
            const leadingEmptySlots = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
            const daysGrid = [];

            // Add empty padding for previous month days
            for (let i = 0; i < leadingEmptySlots; i++) {
              daysGrid.push({ type: 'empty', id: `empty-${i}` });
            }

            // Add real days of selected month
            const jsDayMap = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            for (let day = 1; day <= daysInSelectedMonth; day++) {
              const dateObj = new Date(selectedYear, selectedMonth, day);
              const dayName = jsDayMap[dateObj.getDay()];
              daysGrid.push({
                type: 'day',
                dayNumber: day,
                dayName: dayName,
                id: `day-${day}`
              });
            }

            return (
              <div className="grid grid-cols-7 gap-2">
                {daysGrid.map((item) => {
                  if (item.type === 'empty') {
                    return (
                      <div 
                        key={item.id} 
                        className="bg-slate-950/30 border border-slate-850/50 rounded-xl p-2 min-h-[95px] opacity-25"
                      ></div>
                    );
                  }

                  const sessionsOnThisDay = filteredSessions.filter(s => s.day === item.dayName);
                  const isToday = 
                    currentDate.getDate() === item.dayNumber &&
                    currentDate.getMonth() === selectedMonth &&
                    currentDate.getFullYear() === selectedYear;

                  return (
                    <div
                      key={item.id}
                      className={`rounded-xl p-2 min-h-[95px] flex flex-col justify-between border-2 transition-all hover:border-indigo-500/50 ${
                        isToday 
                          ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md ring-1 ring-indigo-500' 
                          : 'bg-slate-950/80 border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className={`font-mono text-xs font-black ${isToday ? 'text-indigo-300' : 'text-slate-300'}`}>
                          {item.dayNumber}
                        </span>
                        <span className="text-[9px] font-bold text-slate-500">
                          {sessionsOnThisDay.length} Sesi ({sessionsOnThisDay.length} Jam)
                        </span>
                      </div>

                      <div className="space-y-1">
                        {sessionsOnThisDay.slice(0, 2).map((s, idx) => {
                          const color = getTherapyColorInfo(s.type);
                          return (
                            <div
                              key={idx}
                              className={`text-[9px] font-bold truncate px-1.5 py-0.5 rounded border ${color.bg} ${color.border} ${color.text}`}
                              title={`${s.childName} (${s.time})`}
                            >
                              {s.childName.split(' ')[0]} • {s.type}
                            </div>
                          );
                        })}
                        {sessionsOnThisDay.length > 2 && (
                          <span className="text-[8px] font-semibold text-indigo-400 block text-center">
                            +{sessionsOnThisDay.length - 2} sesi lainnya
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* VIEW 4: MATRIX VIEW */}
      {calendarView === 'matrix' && (
        <div className="bg-slate-900 border-2 border-slate-700/80 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b-2 border-slate-700 mb-5">
            <div>
              <h3 className="font-extrabold text-white text-lg">Matriks Alokasi Terapis & Ruangan</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Daftar beban terapis mingguan beserta akumulasi jam di bulan {MONTH_NAMES[selectedMonth]} {selectedYear}.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-500/40 px-3 py-1.5 rounded-xl">
              {therapists.length} Terapis Terdaftar
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {therapists.map(t => {
              const assignedSessions = filteredSessions.filter(s => s.therapistId === t.id);
              const monthlyHours = monthlyMetrics.hoursByTherapist[t.id] || 0;
              return (
                <div key={t.id} className="p-4 bg-slate-950 border-2 border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={t.photoUrl} alt="" className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-700" />
                    <div>
                      <h4 className="font-extrabold text-white text-sm">{t.name}</h4>
                      <p className="text-[10px] text-slate-400">Spesialis: {t.specialties.join(', ')}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-slate-900 p-2 rounded-lg border border-slate-800 mb-3">
                    <span className="text-slate-300 font-semibold">{assignedSessions.length} Sesi / Minggu</span>
                    <span className="text-indigo-400 font-black font-mono">{monthlyHours} Jam di {MONTH_NAMES[selectedMonth]}</span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                    {assignedSessions.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic text-center py-3">Belum ada pasien terjadwal</p>
                    ) : (
                      assignedSessions.map((s, sIdx) => {
                        const color = getTherapyColorInfo(s.type);
                        return (
                          <div key={sIdx} className={`p-2 rounded-lg border text-[11px] ${color.bg} ${color.border} flex items-center justify-between`}>
                            <span className="font-bold text-white truncate max-w-[140px]">{s.childName}</span>
                            <span className="font-mono text-[10px] text-slate-300 shrink-0 font-medium">
                              {s.day} • {s.time.split(' - ')[0]}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DETAIL MODAL FOR CLICKED SESSION */}
      <AnimatePresence>
        {selectedSessionForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                <div>
                  <h3 className="font-extrabold text-white text-lg">Detail Sesi Terapi</h3>
                  <p className="text-xs text-slate-400">Informasi lengkap jadwal & terapis yang bertugas</p>
                </div>
                <button
                  onClick={() => setSelectedSessionForDetail(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {(() => {
                const s = selectedSessionForDetail;
                const color = getTherapyColorInfo(s.type);
                const therapist = therapists.find(t => t.id === s.therapistId);
                const child = children.find(c => c.id === s.childId);

                return (
                  <div className="space-y-4 text-xs">
                    {/* Child info card */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                      <img
                        src={s.childPhoto || 'https://i.pravatar.cc/100'}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/40"
                      />
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Pasien Siswa</span>
                        <h4 className="text-sm font-extrabold text-white">{s.childName}</h4>
                        <p className="text-[11px] text-slate-400">{child?.className || 'Kelas Pasien'} • {child?.diagnosis || 'Terapi Berkala'}</p>
                      </div>
                    </div>

                    {/* Modality & Timing */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`p-3 rounded-xl border-2 ${color.bg} ${color.border}`}>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Modalitas</span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded ${color.badge}`}>
                          {color.name} ({s.type})
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Jadwal Sesi</span>
                        <div className="font-mono text-xs font-bold text-indigo-300">
                          {s.day}
                        </div>
                        <div className="font-mono text-[11px] text-slate-300">
                          {s.time} WIB
                        </div>
                      </div>
                    </div>

                    {/* Therapist Info */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1.5">Terapis Penanggung Jawab</span>
                      <div className="flex items-center gap-3">
                        <img
                          src={therapist?.photoUrl || 'https://i.pravatar.cc/100'}
                          alt=""
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <h5 className="font-extrabold text-white text-xs">{therapist ? therapist.name : 'Belum Ditugaskan'}</h5>
                          <p className="text-[10px] text-slate-400">
                            Spesialis: {therapist?.specialties.join(', ') || 'Semua Terapi'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {s.note && (
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 italic">
                        <span className="text-[10px] font-semibold text-slate-400 not-italic block mb-0.5">Catatan Khusus:</span>
                        "{s.note}"
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2 mt-4">
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleDeleteSession(s.childId, s.day, s.time, s.type)}
                          className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Jadwal</span>
                        </button>
                      )}

                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          type="button"
                          onClick={() => setSelectedSessionForDetail(null)}
                          className="px-3.5 py-2 text-slate-400 hover:text-white rounded-xl text-xs font-semibold"
                        >
                          Tutup
                        </button>

                        {!isReadOnly && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(s)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/25 flex items-center gap-1.5 transition-all"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Ubah / Pindah Jadwal</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT SCHEDULE MODAL WITH AUTOMATIC CONFLICT DETECTION */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border-2 border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 my-8 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-extrabold text-indigo-400 tracking-wider">
                      {isEditMode ? 'Edit Mode' : 'Penjadwalan Baru'}
                    </span>
                    {currentModalConflict.hasConflict && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                        Bentrok Terdeteksi
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-white text-lg mt-0.5">
                    {isEditMode ? 'Ubah Jadwal Terapi' : 'Tambah Jadwal Terapi Baru'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sistem otomatis memeriksa bentrok jadwal antara siswa dan terapis pendamping
                  </p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable form body */}
              <div className="overflow-y-auto custom-scrollbar pr-1 space-y-4 text-xs flex-1">
                {/* PROMINENT CONFLICT WARNING ALERT BANNER */}
                {currentModalConflict.hasConflict && (
                  <div className="p-4 rounded-2xl bg-rose-950/70 border-2 border-rose-500 shadow-xl shadow-rose-950/40 text-xs space-y-2.5 animate-fadeIn">
                    <div className="flex items-center gap-2 text-rose-300 font-extrabold text-sm uppercase tracking-wide">
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
                      <span>Peringatan: Jadwal Bentrok Terdeteksi!</span>
                    </div>

                    <p className="text-slate-200 leading-relaxed font-medium">
                      Jadwal pada hari <strong className="text-white underline">{modalDay}</strong> jam <strong className="text-white underline font-mono">{modalTime}</strong> tidak dapat ditambahkan di jam yang sama karena jadwal bentrok dengan:
                    </p>

                    <div className="space-y-2 pl-2 border-l-2 border-rose-500/60">
                      {/* Therapist conflict detail */}
                      {currentModalConflict.therapistConflict && (
                        <div className="p-2.5 rounded-xl bg-rose-900/40 border border-rose-700/60 text-rose-100 flex items-start gap-2.5">
                          <span className="text-lg shrink-0">👨‍⚕️</span>
                          <div className="space-y-0.5">
                            <strong className="block text-rose-200 font-bold text-xs">
                              Bentrok dengan Terapis:
                            </strong>
                            <p className="text-xs leading-normal">
                              Terapis <strong className="text-white font-bold">{currentModalConflict.therapistConflict.therapistName}</strong> sudah terisi jadwal terapi <span className="px-1 py-0.5 rounded bg-rose-800/80 font-bold text-white">{currentModalConflict.therapistConflict.therapyType}</span> bersama siswa <strong className="text-white font-bold underline">{currentModalConflict.therapistConflict.childName}</strong> pada hari {modalDay}, jam {modalTime}.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Child conflict detail */}
                      {currentModalConflict.childConflict && (
                        <div className="p-2.5 rounded-xl bg-rose-900/40 border border-rose-700/60 text-rose-100 flex items-start gap-2.5">
                          <span className="text-lg shrink-0">👶</span>
                          <div className="space-y-0.5">
                            <strong className="block text-rose-200 font-bold text-xs">
                              Bentrok dengan Jadwal Pasien:
                            </strong>
                            <p className="text-xs leading-normal">
                              Siswa <strong className="text-white font-bold">{currentModalConflict.childConflict.childName}</strong> sudah memiliki jadwal terapi <span className="px-1 py-0.5 rounded bg-rose-800/80 font-bold text-white">{currentModalConflict.childConflict.therapyType}</span> bersama terapis <strong className="text-white font-bold underline">{currentModalConflict.childConflict.therapistName}</strong> pada hari {modalDay}, jam {modalTime}.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-rose-800/50 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                        Jadwal tidak bisa ditambahkan di jam yang sama
                      </span>

                      {(() => {
                        const freeSlot = findAvailableTimeSlot(modalDay, modalChildId, modalTherapistId);
                        if (freeSlot) {
                          return (
                            <button
                              type="button"
                              onClick={() => setModalTime(freeSlot)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 shadow transition-all active:scale-95 cursor-pointer"
                            >
                              <Lightbulb className="w-3.5 h-3.5 text-yellow-300" />
                              <span>Pindahkan ke Jam Kosong: {freeSlot}</span>
                            </button>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                )}

                {/* Form Error Message */}
                {modalErrorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{modalErrorMessage}</span>
                  </div>
                )}

                {/* Child Select */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Pilih Pasien Anak
                  </label>
                  <select
                    value={modalChildId}
                    onChange={(e) => {
                      setModalChildId(e.target.value);
                      setModalErrorMessage('');
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                  >
                    {children.filter(c => c.status === 'Aktif').map(child => {
                      const conflict = checkConflict(
                        child.id,
                        modalDay,
                        modalTime,
                        modalTherapistId,
                        isEditMode ? editingOriginalSession : null
                      );
                      const isBooked = !!conflict.childConflict;

                      return (
                        <option 
                          key={child.id} 
                          value={child.id}
                          className={isBooked ? "text-rose-400 bg-slate-950" : "text-white bg-slate-950"}
                        >
                          {child.name} ({child.className || 'Kelas'}) {isBooked ? `⚠️ [Sudah ada jadwal ${conflict.childConflict?.therapyType}]` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Day & Time Selection with Live Conflict Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Hari Terapi</label>
                    <select
                      value={modalDay}
                      onChange={(e) => {
                        setModalDay(e.target.value);
                        setModalErrorMessage('');
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                    >
                      {DAYS.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">
                      Jam Terapi (Slot 1 Jam)
                    </label>
                    <select
                      value={modalTime}
                      onChange={(e) => {
                        setModalTime(e.target.value);
                        setModalErrorMessage('');
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500 font-mono"
                    >
                      {TIME_SLOTS.map(t => {
                        const conflict = checkConflict(
                          modalChildId,
                          modalDay,
                          t,
                          modalTherapistId,
                          isEditMode ? editingOriginalSession : null
                        );
                        const isConflicted = conflict.hasConflict;

                        return (
                          <option 
                            key={t} 
                            value={t} 
                            className={isConflicted ? "text-rose-400 bg-slate-950 font-bold" : "text-emerald-400 bg-slate-950"}
                          >
                            {t} {isConflicted ? `⚠️ (BENTROK - ${conflict.summaryMessage.split(' dan ')[0]})` : '✓ (Tersedia)'}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Therapy Type & Therapist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">Jenis Terapi</label>
                    <select
                      value={modalType}
                      onChange={(e) => setModalType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                    >
                      <option value="OT">Okupasi (OT) - Biru</option>
                      <option value="TW">Wicara (TW) - Hijau</option>
                      <option value="SI">Sensori Integrasi (SI) - Ungu</option>
                      <option value="FT">Fisioterapi (FT) - Oranye</option>
                      <option value="REMEDIAL">Remedial - Kuning/Pink</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">
                      Terapis Penanggung Jawab
                    </label>
                    <select
                      value={modalTherapistId}
                      onChange={(e) => {
                        setModalTherapistId(e.target.value);
                        setModalErrorMessage('');
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Pilih Terapis --</option>
                      {therapists.map(t => {
                        const conflict = checkConflict(
                          modalChildId,
                          modalDay,
                          modalTime,
                          t.id,
                          isEditMode ? editingOriginalSession : null
                        );
                        const isBooked = !!conflict.therapistConflict;

                        return (
                          <option 
                            key={t.id} 
                            value={t.id}
                            className={isBooked ? "text-rose-400 bg-slate-950" : "text-emerald-400 bg-slate-950"}
                          >
                            {t.name} {isBooked ? `⚠️ (Bentrok dg ${conflict.therapistConflict?.childName})` : '✓ (Tersedia)'}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Catatan Khusus (Opsional)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Fokus sensory gym, ruang wicara 2, latihan artikulasi..."
                    value={modalNote}
                    onChange={(e) => setModalNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500 placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-800 shrink-0">
                <div className="text-[11px] text-slate-400">
                  {currentModalConflict.hasConflict ? (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      Jadwal bentrok tidak dapat disimpan
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      Jadwal aman & tidak bentrok
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 text-slate-400 hover:text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={currentModalConflict.hasConflict}
                    onClick={handleSaveSession}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      currentModalConflict.hasConflict
                        ? 'bg-rose-950/70 border-2 border-rose-500/50 text-rose-300 cursor-not-allowed opacity-60 shadow-none'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 cursor-pointer active:scale-95'
                    }`}
                  >
                    {currentModalConflict.hasConflict ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                        <span>Tidak Bisa Ditambahkan (Jadwal Bentrok)</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{isEditMode ? 'Simpan Perubahan Jadwal' : 'Simpan Jadwal Terapi'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScheduleBoardPage;
