import React, { useState, useMemo } from 'react';
import { Child, RecurringSession, TherapyDefinition, Therapist, AssessmentStatus, UserRole, TherapySession } from '../types';
import UploadChildDataModal from './UploadChildDataModal';
import { 
  Users, 
  Search, 
  Plus, 
  Upload, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon, 
  Calendar, 
  Clock, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  MapPin, 
  Edit, 
  Trash2, 
  UserX,
  X,
  Layers,
  CalendarCheck,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  CalendarDays,
  UserCheck
} from 'lucide-react';
import { getTherapyColorInfo } from './ScheduleBoardPage';

type MasterChild = Omit<Child, 'sessions'>;

interface ChildManagementPageProps {
  children: MasterChild[];
  onAddChild: (name: string) => void;
  onAddMultipleChildren: (newChildren: Omit<MasterChild, 'id'>[]) => void;
  onUpdateChild: (childId: string, updates: Partial<Omit<MasterChild, 'id'>>) => void;
  onDeleteChild: (childId: string) => void;
  onAddDailySession: (childId: string, session: Omit<TherapySession, 'id' | 'status'>, date: string) => void;
  therapyTypes: TherapyDefinition[];
  therapyTimes: string[];
  daysOfWeek: string[];
  therapists: Therapist[];
  userRole: UserRole;
}

const DEFAULT_DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const DEFAULT_TIMES = [
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

export const ChildManagementPage: React.FC<ChildManagementPageProps> = ({
  children,
  onAddChild,
  onAddMultipleChildren,
  onUpdateChild,
  onDeleteChild,
  onAddDailySession,
  therapyTypes,
  therapyTimes = DEFAULT_TIMES,
  daysOfWeek = DEFAULT_DAYS,
  therapists,
  userRole
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Aktif' | 'Non-Aktif'>('ALL');
  const [diagnosisFilter, setDiagnosisFilter] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<MasterChild | null>(null);
  const [deactivatingChild, setDeactivatingChild] = useState<MasterChild | null>(null);
  const [deactivationReason, setDeactivationReason] = useState('');
  const [deletingChild, setDeletingChild] = useState<MasterChild | null>(null);
  const [deleteSuccessToast, setDeleteSuccessToast] = useState<string>('');
  const [selectedChildForDetail, setSelectedChildForDetail] = useState<MasterChild | null>(null);

  // SCHEDULE MANAGEMENT MODAL STATE
  const [schedulingChild, setSchedulingChild] = useState<MasterChild | null>(null);
  const [childSessions, setChildSessions] = useState<RecurringSession[]>([]);
  const [editingSessionIdx, setEditingSessionIdx] = useState<number | null>(null);

  // Form inputs for scheduling session
  const [formDay, setFormDay] = useState<string>('Senin');
  const [formTime, setFormTime] = useState<string>('08:00 - 09:00');
  const [formType, setFormType] = useState<string>('OT');
  const [formTherapistId, setFormTherapistId] = useState<string>('');
  const [formNote, setFormNote] = useState<string>('');
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState<string>('');
  const [scheduleErrorMsg, setScheduleErrorMsg] = useState<string>('');

  // Child profile edit state
  const [editChildName, setEditChildName] = useState('');
  const [editChildBirthDate, setEditChildBirthDate] = useState('');
  const [editChildGender, setEditChildGender] = useState<'Laki-Laki' | 'Perempuan'>('Laki-Laki');
  const [editChildDiagnosis, setEditChildDiagnosis] = useState('');
  const [editChildParent, setEditChildParent] = useState('');
  const [editChildMother, setEditChildMother] = useState('');
  const [editChildPhone, setEditChildPhone] = useState('');
  const [editChildAddress, setEditChildAddress] = useState('');
  const [editChildClass, setEditChildClass] = useState('');
  const [editChildStatus, setEditChildStatus] = useState<'Aktif' | 'Non-Aktif'>('Aktif');

  // New child form
  const [newChildName, setNewChildName] = useState('');
  const [newChildBirthDate, setNewChildBirthDate] = useState('2017-05-15');
  const [newChildGender, setNewChildGender] = useState<'Laki-Laki' | 'Perempuan'>('Laki-Laki');
  const [newChildDiagnosis, setNewChildDiagnosis] = useState('Speech Delay & Sensory Modulation');
  const [newChildParent, setNewChildParent] = useState('');
  const [newChildPhone, setNewChildPhone] = useState('');

  // Safe days & times lists
  const effectiveDays = daysOfWeek.length > 0 ? daysOfWeek : DEFAULT_DAYS;
  const effectiveTimes = therapyTimes.length > 0 ? therapyTimes : DEFAULT_TIMES;

  // Calculate age helper
  const calculateAge = (birthDateStr?: string) => {
    if (!birthDateStr) return 8;
    const birth = new Date(birthDateStr);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? age : 7;
  };

  // Filtered children list
  const filteredChildren = useMemo(() => {
    return children.filter(child => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = child.name.toLowerCase().includes(query);
        const matchDiag = (child.diagnosis || '').toLowerCase().includes(query);
        const matchParent = (child.parentName || '').toLowerCase().includes(query);
        if (!matchName && !matchDiag && !matchParent) return false;
      }
      // Status
      if (statusFilter !== 'ALL' && (child.status || 'Aktif') !== statusFilter) {
        return false;
      }
      // Diagnosis
      if (diagnosisFilter !== 'ALL') {
        const childDiag = child.diagnosis || 'Speech Delay';
        if (!childDiag.toLowerCase().includes(diagnosisFilter.toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [children, searchQuery, statusFilter, diagnosisFilter]);

  // Helper to sort sessions by day and time
  const sortSessions = (sessions: RecurringSession[]) => {
    const dayOrder: Record<string, number> = {
      'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6, 'Minggu': 7
    };
    return [...sessions].sort((a, b) => {
      const dayA = dayOrder[a.day] || 99;
      const dayB = dayOrder[b.day] || 99;
      if (dayA !== dayB) return dayA - dayB;
      return a.time.localeCompare(b.time);
    });
  };

  // Open schedule management modal for child
  const handleOpenScheduleModal = (child: MasterChild) => {
    setSchedulingChild(child);
    setChildSessions(child.recurringSessions ? [...child.recurringSessions] : []);
    setEditingSessionIdx(null);
    setFormDay(effectiveDays[0] || 'Senin');
    setFormTime(effectiveTimes[1] || '08:00 - 09:00');
    setFormType(therapyTypes[0]?.id || 'OT');
    setFormTherapistId(therapists[0]?.id || '');
    setFormNote('');
    setScheduleSuccessMsg('');
    setScheduleErrorMsg('');
  };

  // Open edit child modal
  const handleOpenEditChildModal = (child: MasterChild) => {
    setEditingChild(child);
    setEditChildName(child.name);
    setEditChildBirthDate(child.birthDate || '2017-05-15');
    setEditChildGender(child.gender || 'Laki-Laki');
    setEditChildDiagnosis(child.diagnosis || '');
    setEditChildParent(child.parentName || '');
    setEditChildMother(child.motherName || '');
    setEditChildPhone(child.phone || '');
    setEditChildAddress(child.address || '');
    setEditChildClass(child.className || '');
    setEditChildStatus(child.status || 'Aktif');
  };

  // Conflict detection for current form day & time
  const isChildConflictDetected = useMemo(() => {
    return childSessions.some((s, idx) => {
      if (editingSessionIdx !== null && idx === editingSessionIdx) return false;
      return s.day === formDay && s.time === formTime;
    });
  }, [childSessions, editingSessionIdx, formDay, formTime]);

  const conflictingChildSession = useMemo(() => {
    if (!isChildConflictDetected) return null;
    return childSessions.find((s, idx) => {
      if (editingSessionIdx !== null && idx === editingSessionIdx) return false;
      return s.day === formDay && s.time === formTime;
    });
  }, [childSessions, editingSessionIdx, formDay, formTime, isChildConflictDetected]);

  // Therapist conflict detection across other active children
  const conflictingTherapistSession = useMemo(() => {
    if (!formTherapistId) return null;
    for (const otherChild of children) {
      if (schedulingChild && otherChild.id === schedulingChild.id) continue;
      if (otherChild.status === 'Non-Aktif') continue;
      const match = otherChild.recurringSessions?.find(
        s => s.day === formDay && s.time === formTime && s.therapistId === formTherapistId
      );
      if (match) {
        const therapist = therapists.find(t => t.id === formTherapistId);
        const therapyName = therapyTypes.find(t => t.id === match.type)?.name || match.type;
        return {
          therapistName: therapist?.name || 'Terapis',
          childName: otherChild.name,
          therapyType: therapyName,
          day: formDay,
          time: formTime
        };
      }
    }
    return null;
  }, [children, formTherapistId, formDay, formTime, schedulingChild, therapists, therapyTypes]);

  const isConflictDetected = Boolean(isChildConflictDetected || conflictingTherapistSession);

  // Add or update session in childSessions
  const handleAddOrUpdateSession = () => {
    setScheduleErrorMsg('');
    setScheduleSuccessMsg('');

    if (!formDay || !formTime || !formType) {
      setScheduleErrorMsg('Mohon lengkapi hari, jam sesi, dan jenis terapi.');
      return;
    }

    if (isConflictDetected) {
      const reasons: string[] = [];
      if (conflictingTherapistSession) {
        reasons.push(`Terapis ${conflictingTherapistSession.therapistName} sudah terisi dengan siswa ${conflictingTherapistSession.childName} (${conflictingTherapistSession.therapyType})`);
      }
      if (isChildConflictDetected) {
        reasons.push(`Siswa ini sudah memiliki sesi ${conflictingChildSession?.type}`);
      }
      setScheduleErrorMsg(`Jadwal bentrok dengan: ${reasons.join(' dan ')} pada ${formDay} (${formTime})! Jadwal tidak dapat ditambahkan pada jam yang sama.`);
      return;
    }

    const newSession: RecurringSession = {
      day: formDay,
      time: formTime,
      type: formType,
      therapistId: formTherapistId || undefined,
      note: formNote.trim() || undefined
    };

    if (editingSessionIdx !== null) {
      // Update existing session
      const updated = [...childSessions];
      updated[editingSessionIdx] = newSession;
      const sorted = sortSessions(updated);
      setChildSessions(sorted);
      setEditingSessionIdx(null);
      setFormNote('');
      setScheduleSuccessMsg(`Sesi ${formDay} (${formTime}) berhasil diperbarui.`);
    } else {
      // Add new session
      const updated = [...childSessions, newSession];
      const sorted = sortSessions(updated);
      setChildSessions(sorted);
      setFormNote('');
      setScheduleSuccessMsg(`Sesi baru ${formDay} (${formTime}) berhasil ditambahkan ke daftar.`);
    }
  };

  // Edit existing session from list
  const handleSelectSessionToEdit = (idx: number) => {
    const s = childSessions[idx];
    if (!s) return;
    setEditingSessionIdx(idx);
    setFormDay(s.day);
    setFormTime(s.time);
    setFormType(s.type);
    setFormTherapistId(s.therapistId || '');
    setFormNote(s.note || '');
    setScheduleSuccessMsg('');
    setScheduleErrorMsg('');
  };

  // Cancel edit session
  const handleCancelEditSession = () => {
    setEditingSessionIdx(null);
    setFormNote('');
    setScheduleErrorMsg('');
  };

  // Remove a session from list
  const handleRemoveSession = (idx: number) => {
    const targetSession = childSessions[idx];
    const updated = childSessions.filter((_, i) => i !== idx);
    setChildSessions(updated);
    if (editingSessionIdx === idx) {
      setEditingSessionIdx(null);
    } else if (editingSessionIdx !== null && editingSessionIdx > idx) {
      setEditingSessionIdx(editingSessionIdx - 1);
    }
    setScheduleSuccessMsg(`Sesi ${targetSession.day} (${targetSession.time}) telah dihapus.`);
  };

  // Save all schedule changes to child
  const handleSaveAllSchedule = () => {
    if (!schedulingChild) return;

    const uniquePrograms = Array.from(new Set(childSessions.map(s => s.type)));
    onUpdateChild(schedulingChild.id, {
      recurringSessions: childSessions,
      activePrograms: uniquePrograms
    });

    // Update local schedulingChild state
    setSchedulingChild({
      ...schedulingChild,
      recurringSessions: childSessions,
      activePrograms: uniquePrograms
    });

    // If detail modal is open for this child, update it too
    if (selectedChildForDetail && selectedChildForDetail.id === schedulingChild.id) {
      setSelectedChildForDetail({
        ...selectedChildForDetail,
        recurringSessions: childSessions,
        activePrograms: uniquePrograms
      });
    }

    setScheduleSuccessMsg(`Jadwal terapi untuk ${schedulingChild.name} berhasil disimpan! (${childSessions.length} sesi rutin/minggu)`);
  };

  // Save child profile edits
  const handleSaveChildProfile = () => {
    if (!editingChild) return;
    if (!editChildName.trim()) {
      alert('Nama anak wajib diisi.');
      return;
    }

    const updates: Partial<Omit<MasterChild, 'id'>> = {
      name: editChildName.trim(),
      birthDate: editChildBirthDate,
      gender: editChildGender,
      diagnosis: editChildDiagnosis.trim(),
      parentName: editChildParent.trim(),
      motherName: editChildMother.trim(),
      phone: editChildPhone.trim(),
      address: editChildAddress.trim(),
      className: editChildClass.trim(),
      status: editChildStatus
    };

    onUpdateChild(editingChild.id, updates);

    if (selectedChildForDetail && selectedChildForDetail.id === editingChild.id) {
      setSelectedChildForDetail({
        ...selectedChildForDetail,
        ...updates
      });
    }

    setEditingChild(null);
  };

  // Save new child
  const handleSaveNewChild = () => {
    if (!newChildName.trim()) {
      alert('Nama anak wajib diisi');
      return;
    }

    onAddMultipleChildren([{
      name: newChildName.trim(),
      birthDate: newChildBirthDate,
      gender: newChildGender,
      diagnosis: newChildDiagnosis.trim(),
      parentName: newChildParent.trim(),
      phone: newChildPhone.trim(),
      recurringSessions: [],
      status: 'Aktif',
      assessmentStatus: AssessmentStatus.NOT_ASSESSED,
      photoUrl: `https://i.pravatar.cc/100?u=${encodeURIComponent(newChildName)}`
    }]);

    setIsAddModalOpen(false);
    setNewChildName('');
    setNewChildParent('');
    setNewChildPhone('');
  };

  const handleConfirmDeactivate = () => {
    if (!deactivatingChild) return;
    onUpdateChild(deactivatingChild.id, {
      status: 'Non-Aktif',
      inactivityReason: deactivationReason || 'Mengundurkan diri / Lulus'
    });
    setDeactivatingChild(null);
    setDeactivationReason('');
  };

  const handleConfirmDelete = () => {
    if (!deletingChild) return;
    const childName = deletingChild.name;
    const childId = deletingChild.id;

    onDeleteChild(childId);

    if (selectedChildForDetail?.id === childId) {
      setSelectedChildForDetail(null);
    }
    setDeletingChild(null);
    setDeleteSuccessToast(`Data siswa "${childName}" berhasil dihapus.`);
    setTimeout(() => {
      setDeleteSuccessToast('');
    }, 4000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0F172A] text-slate-100 p-4 sm:p-6 lg:p-8 custom-scrollbar">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Database Pasien & Siswa
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-xs text-slate-400">Manajemen Anak & Pengaturan Jadwal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Manajemen Anak Didik
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Pantau profil medis, atur jadwal terapi rutin mingguan, diagnosis perkembangan, dan kehadiran bulanan.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Card / Table Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl shadow-inner text-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 px-3 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'cards' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Tampilan Card
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 px-3 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              Tampilan Tabel
            </button>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            Import Excel
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Tambah Anak
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-6 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama anak, diagnosis, orang tua..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 w-full"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Status (Aktif / Non-Aktif)</option>
            <option value="Aktif">Status Aktif Saja</option>
            <option value="Non-Aktif">Status Non-Aktif</option>
          </select>

          {/* Diagnosis Filter */}
          <select
            value={diagnosisFilter}
            onChange={(e) => setDiagnosisFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500"
          >
            <option value="ALL">Semua Diagnosis Perkembangan</option>
            <option value="Autism">Autism Spectrum Disorder (ASD)</option>
            <option value="ADHD">ADHD / Atensi</option>
            <option value="Speech">Speech Delay / Wicara</option>
            <option value="Sensory">Sensory Processing (SPD)</option>
            <option value="Developmental">Global Developmental Delay</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Ditemukan <span className="font-bold text-white">{filteredChildren.length}</span> anak didik
        </div>
      </div>

      {/* VIEW 1: MODERN CARDS VIEW */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredChildren.map((child) => {
            const age = calculateAge(child.birthDate);
            const isInactive = child.status === 'Non-Aktif';
            const diagnosis = child.diagnosis || 'Speech Delay & Sensori Integrasi';
            const primaryTherapist = therapists.find(t => 
              child.recurringSessions?.some(s => s.therapistId === t.id)
            ) || therapists[0];
            const activePrograms: string[] = Array.from(new Set(child.recurringSessions?.map(s => s.type) || ['OT', 'TW']));
            const attendancePct = child.attendanceRateThisMonth || 94;
            const sessionCount = child.recurringSessions?.length || 0;

            return (
              <div
                key={child.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 relative group"
              >
                <div>
                  {/* Top Bar with Avatar, Name, Status Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={child.photoUrl || `https://i.pravatar.cc/120?u=${child.id}`}
                          alt={child.name}
                          className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-800 group-hover:ring-indigo-500/50 transition-all"
                        />
                        <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                          isInactive ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}></span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-sm truncate leading-snug group-hover:text-indigo-400 transition-colors">
                          {child.name}
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          {age} Tahun • {child.gender || 'Laki-Laki'}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      isInactive 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {child.status || 'Aktif'}
                    </span>
                  </div>

                  {/* Diagnosis Tag */}
                  <div className="mb-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                      Diagnosis Perkembangan:
                    </span>
                    <span className="inline-block text-[11px] font-medium px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 truncate max-w-full">
                      {diagnosis}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-2 py-2 border-t border-slate-800/80 text-xs text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-indigo-400" />
                        Terapis PJ:
                      </span>
                      <span className="font-semibold text-white truncate max-w-[130px]">
                        {primaryTherapist ? primaryTherapist.name.split(',')[0] : 'Tim Terapis'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                        Program Terapi:
                      </span>
                      <div className="flex items-center gap-1 flex-wrap justify-end">
                        {activePrograms.slice(0, 3).map(prog => {
                          const c = getTherapyColorInfo(prog);
                          return (
                            <span key={prog} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${c.bg} ${c.text} ${c.border}`}>
                              {prog}
                            </span>
                          );
                        })}
                        {activePrograms.length > 3 && (
                          <span className="text-[9px] text-slate-400">+{activePrograms.length - 3}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        Jadwal Rutin:
                      </span>
                      <span className="font-semibold text-emerald-400 flex items-center gap-1">
                        <span className="font-mono">{sessionCount}</span> Sesi / Minggu
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Actions: Atur Jadwal & Profile */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenScheduleModal(child)}
                      className="flex-1 py-2 px-3 bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-500/60 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm group/btn"
                      title="Atur atau Edit Jadwal Terapi Anak"
                    >
                      <Calendar className="w-3.5 h-3.5 text-indigo-400 group-hover/btn:scale-110 transition-transform" />
                      <span>Atur Jadwal</span>
                      <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-mono font-bold">
                        {sessionCount}
                      </span>
                    </button>
                    <button
                      onClick={() => handleOpenEditChildModal(child)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-800 transition-all"
                      title="Edit Data Profil Anak"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingChild(child)}
                      className="p-2 text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/20 rounded-xl border border-rose-500/20 hover:border-rose-500/50 transition-all"
                      title="Hapus Data Siswa"
                      aria-label="Hapus Data Siswa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedChildForDetail(child)}
                      className="flex-1 py-1.5 px-3 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all text-center"
                    >
                      Lihat Profil
                    </button>
                    {!isInactive && (
                      <button
                        onClick={() => setDeactivatingChild(child)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                        title="Nonaktifkan Pasien"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW 2: HIGH-DENSITY ENTERPRISE TABLE */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold">
                  <th className="px-4 py-3.5">Nama Anak Didik</th>
                  <th className="px-4 py-3.5">Usia / Gender</th>
                  <th className="px-4 py-3.5">Diagnosis Perkembangan</th>
                  <th className="px-4 py-3.5">Terapis Penanggung Jawab</th>
                  <th className="px-4 py-3.5">Program Terapi</th>
                  <th className="px-4 py-3.5 text-center">Jadwal Rutin</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredChildren.map((child) => {
                  const age = calculateAge(child.birthDate);
                  const isInactive = child.status === 'Non-Aktif';
                  const diagnosis = child.diagnosis || 'Speech Delay & Sensori Integrasi';
                  const primaryTherapist = therapists.find(t => 
                    child.recurringSessions?.some(s => s.therapistId === t.id)
                  ) || therapists[0];
                  const activePrograms: string[] = Array.from(new Set(child.recurringSessions?.map(s => s.type) || ['OT', 'TW']));
                  const sessionCount = child.recurringSessions?.length || 0;

                  return (
                    <tr key={child.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={child.photoUrl || `https://i.pravatar.cc/80?u=${child.id}`}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
                          />
                          <div>
                            <span className="font-bold text-white block">{child.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">ID: {child.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {age} Thn • {child.gender || 'L'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block text-[11px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 max-w-[200px] truncate">
                          {diagnosis}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {primaryTherapist ? primaryTherapist.name : 'Tim Terapis'}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          {activePrograms.slice(0, 3).map(p => (
                            <span key={p} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {p}
                            </span>
                          ))}
                          {activePrograms.length > 3 && (
                            <span className="text-[9px] text-slate-400">+{activePrograms.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[11px]">
                          {sessionCount} Sesi / Mgg
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isInactive 
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {child.status || 'Aktif'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenScheduleModal(child)}
                            className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/35 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
                            title="Atur atau Edit Jadwal Terapi Anak"
                          >
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Atur Jadwal ({sessionCount})</span>
                          </button>
                          <button
                            onClick={() => handleOpenEditChildModal(child)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit Profil"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setSelectedChildForDetail(child)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            Detail
                          </button>
                          <button
                            onClick={() => setDeletingChild(child)}
                            className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 rounded-lg border border-rose-500/20 hover:border-rose-500/50 transition-colors"
                            title="Hapus Data Siswa"
                            aria-label="Hapus Data Siswa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 📅 MODAL ATUR & EDIT JADWAL TERAPI ANAK DIDIK */}
      {/* ======================================================== */}
      {schedulingChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={schedulingChild.photoUrl || `https://i.pravatar.cc/100?u=${schedulingChild.id}`}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-500/40"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-white text-base sm:text-lg">
                      Atur & Edit Jadwal Terapi
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      ID: {schedulingChild.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="font-semibold text-slate-200">{schedulingChild.name}</span>
                    <span>•</span>
                    <span>{calculateAge(schedulingChild.birthDate)} Thn</span>
                    <span>•</span>
                    <span className="text-slate-300 truncate max-w-[200px]">{schedulingChild.diagnosis || 'Terapi Perkembangan'}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSchedulingChild(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Summary Bar */}
            <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <CalendarDays className="w-4 h-4 text-indigo-400" />
                  <span>Total Sesi: <strong className="text-white font-mono">{childSessions.length}</strong> / Minggu</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Estimasi Jam: <strong className="text-white font-mono">{childSessions.length * 4}</strong> Jam / Bulan</span>
                </div>
              </div>

              {scheduleSuccessMsg && (
                <div className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {scheduleSuccessMsg}
                </div>
              )}
            </div>

            {/* Modal Body: Two Columns */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 custom-scrollbar">
              {/* LEFT COLUMN: ACTIVE SESSIONS LIST (7 cols on lg) */}
              <div className="lg:col-span-7 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm">
                      Daftar Jadwal Terapi Rutin Mingguan
                    </h4>
                    <span className="text-[11px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono font-bold">
                      {childSessions.length}
                    </span>
                  </div>

                  {editingSessionIdx !== null && (
                    <button
                      onClick={handleCancelEditSession}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Sesi Baru
                    </button>
                  )}
                </div>

                {childSessions.length === 0 ? (
                  <div className="flex-1 min-h-[220px] bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                    <Calendar className="w-10 h-10 text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-300 text-xs sm:text-sm">Belum ada jadwal sesi terapi</p>
                    <p className="text-slate-500 text-xs mt-1 max-w-xs">
                      Gunakan formulir di sebelah kanan untuk menambahkan jadwal hari, jam, jenis terapi, dan terapis penanggung jawab.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 overflow-y-auto pr-1">
                    {childSessions.map((session, idx) => {
                      const colorInfo = getTherapyColorInfo(session.type);
                      const therapistObj = therapists.find(t => t.id === session.therapistId);
                      const isEditingThis = editingSessionIdx === idx;

                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border transition-all ${
                            isEditingThis 
                              ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' 
                              : `${colorInfo.bg} ${colorInfo.border} hover:bg-slate-800/40`
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${colorInfo.badge}`}>
                                {session.type}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-white text-xs sm:text-sm">
                                    {session.day}
                                  </span>
                                  <span className="text-slate-500">•</span>
                                  <span className="font-mono text-xs font-semibold text-indigo-300 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    {session.time}
                                  </span>
                                </div>

                                <div className="mt-1 flex items-center gap-2 text-xs text-slate-300">
                                  <span className="text-slate-400">Terapis:</span>
                                  <span className="font-semibold text-white">
                                    {therapistObj ? therapistObj.name : 'Tim Terapis'}
                                  </span>
                                </div>

                                {session.note && (
                                  <p className="text-[11px] text-slate-400 mt-1 italic">
                                    Catatan: {session.note}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Session item actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleSelectSessionToEdit(idx)}
                                className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                  isEditingThis
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                                title="Edit Sesi Ini"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleRemoveSession(idx)}
                                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                title="Hapus Sesi Ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: FORM ATUR / EDIT SESI (5 cols on lg) */}
              <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                    <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                      {editingSessionIdx !== null ? (
                        <>
                          <Edit className="w-4 h-4 text-amber-400" />
                          <span>Edit Sesi Jadwal</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 text-indigo-400" />
                          <span>Tambah Sesi Baru</span>
                        </>
                      )}
                    </h4>
                    {editingSessionIdx !== null && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                        Mode Edit (Index #{editingSessionIdx + 1})
                      </span>
                    )}
                  </div>

                  {scheduleErrorMsg && (
                    <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{scheduleErrorMsg}</span>
                    </div>
                  )}

                  {isConflictDetected && (
                    <div className="mb-3 p-3 rounded-xl bg-rose-500/15 border-2 border-rose-500/60 text-rose-200 text-xs space-y-1.5 animate-fadeIn">
                      <div className="flex items-center gap-1.5 text-rose-300 font-extrabold text-xs uppercase tracking-wide">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 animate-bounce" />
                        <span>Peringatan: Jadwal Bentrok Terdeteksi!</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        Jadwal pada hari <strong className="text-white">{formDay}</strong> pukul <strong className="text-white font-mono">{formTime}</strong> tidak dapat ditambahkan di jam yang sama karena jadwal bentrok dengan:
                      </p>
                      <div className="space-y-1 pl-2 border-l-2 border-rose-500/50 text-[11px]">
                        {conflictingTherapistSession && (
                          <div className="text-rose-200">
                            🔴 <strong>Terapis {conflictingTherapistSession.therapistName}</strong> sudah memiliki jadwal {conflictingTherapistSession.therapyType} bersama siswa <strong className="text-white underline">{conflictingTherapistSession.childName}</strong>.
                          </div>
                        )}
                        {isChildConflictDetected && (
                          <div className="text-rose-200">
                            🔴 <strong>Siswa ini</strong> sudah memiliki sesi terapi <strong className="text-white underline">{conflictingChildSession?.type}</strong> di jam ini.
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-rose-400 font-medium italic pt-1 border-t border-rose-500/20">
                        ⛔ Tombol simpan dinonaktifkan untuk mencegah jadwal tumpang tindih.
                      </p>
                    </div>
                  )}

                  <div className="space-y-3.5 text-xs">
                    {/* Hari */}
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5">
                        Hari Terapi
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {effectiveDays.map(day => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => setFormDay(day)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all text-center ${
                              formDay === day
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Jam / Waktu */}
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Jam / Sesi Waktu
                      </label>
                      <select
                        value={formTime}
                        onChange={(e) => setFormTime(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 font-mono text-xs"
                      >
                        {effectiveTimes.map(time => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Jenis Terapi */}
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5">
                        Jenis Terapi
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {therapyTypes.map(type => {
                          const c = getTherapyColorInfo(type.id);
                          const isSelected = formType === type.id;
                          return (
                            <button
                              key={type.id}
                              type="button"
                              onClick={() => setFormType(type.id)}
                              className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                                isSelected
                                  ? `${c.badge} border-white/20 shadow-md`
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                              }`}
                            >
                              <span>{type.id}</span>
                              <span className="text-[10px] font-normal opacity-80">({type.name})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Terapis PJ */}
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Terapis Penanggung Jawab
                      </label>
                      <select
                        value={formTherapistId}
                        onChange={(e) => setFormTherapistId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 text-xs"
                      >
                        <option value="">-- Belum Ditentukan / Tim Terapis --</option>
                        {therapists.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.specialties?.join(', ') || 'Semua Terapi'})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Catatan Sesi */}
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Catatan / Ruangan (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Ruang Wicara 1, Sensori Integrasi..."
                        value={formNote}
                        onChange={(e) => setFormNote(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 text-xs placeholder-slate-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="pt-4 border-t border-slate-800 flex items-center gap-2 mt-4">
                  {editingSessionIdx !== null ? (
                    <>
                      <button
                        type="button"
                        onClick={handleCancelEditSession}
                        className="flex-1 py-2 px-3 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold transition-all"
                      >
                        Batal Edit
                      </button>
                      <button
                        type="button"
                        disabled={isConflictDetected}
                        onClick={handleAddOrUpdateSession}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                          isConflictDetected
                            ? 'bg-rose-950/70 border border-rose-500/50 text-rose-300 cursor-not-allowed opacity-60 shadow-none'
                            : 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/25 cursor-pointer'
                        }`}
                      >
                        {isConflictDetected ? (
                          <span>Tidak Bisa Disimpan (Bentrok)</span>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Perbarui Sesi</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={isConflictDetected}
                      onClick={handleAddOrUpdateSession}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        isConflictDetected
                          ? 'bg-rose-950/70 border border-rose-500/50 text-rose-300 cursor-not-allowed opacity-60 shadow-none'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25 cursor-pointer'
                      }`}
                    >
                      {isConflictDetected ? (
                        <span>Tidak Bisa Ditambahkan (Jadwal Bentrok)</span>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Tambahkan ke Jadwal</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Pastikan klik <strong>Simpan Perubahan Jadwal</strong> untuk menyimpan jadwal secara permanen.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSchedulingChild(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-xl text-xs font-semibold transition-all"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleSaveAllSchedule}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/25 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Simpan Perubahan Jadwal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ✏️ MODAL EDIT PROFIL ANAK DIDIK */}
      {/* ======================================================== */}
      {editingChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div>
                <h3 className="font-bold text-white text-lg">Edit Profil Siswa</h3>
                <p className="text-xs text-slate-400">Perbarui identitas dan data administratif anak didik</p>
              </div>
              <button onClick={() => setEditingChild(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nama Lengkap Anak</label>
                <input
                  type="text"
                  value={editChildName}
                  onChange={(e) => setEditChildName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={editChildBirthDate}
                    onChange={(e) => setEditChildBirthDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Jenis Kelamin</label>
                  <select
                    value={editChildGender}
                    onChange={(e) => setEditChildGender(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Laki-Laki">Laki-Laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Diagnosis Perkembangan</label>
                <input
                  type="text"
                  value={editChildDiagnosis}
                  onChange={(e) => setEditChildDiagnosis(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nama Ayah / Wali</label>
                  <input
                    type="text"
                    value={editChildParent}
                    onChange={(e) => setEditChildParent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nama Ibu</label>
                  <input
                    type="text"
                    value={editChildMother}
                    onChange={(e) => setEditChildMother(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nomor Telepon / WA</label>
                  <input
                    type="text"
                    value={editChildPhone}
                    onChange={(e) => setEditChildPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Status Pasien</label>
                  <select
                    value={editChildStatus}
                    onChange={(e) => setEditChildStatus(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Alamat Tinggal</label>
                <textarea
                  value={editChildAddress}
                  onChange={(e) => setEditChildAddress(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  const target = editingChild;
                  setEditingChild(null);
                  if (target) handleOpenScheduleModal(target);
                }}
                className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                Atur Jadwal Anak Ini
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingChild(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveChildProfile}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ➕ MODAL PENDAFTARAN ANAK DIDIK BARU */}
      {/* ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
              <div>
                <h3 className="font-bold text-white text-lg">Pendaftaran Anak Didik Baru</h3>
                <p className="text-xs text-slate-400">Tambahkan data pasien baru (jadwal dapat diatur setelah pendaftaran)</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Nama Lengkap Anak</label>
                <input
                  type="text"
                  placeholder="Contoh: Muhammad Rayhan Wijaya"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={newChildBirthDate}
                    onChange={(e) => setNewChildBirthDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Jenis Kelamin</label>
                  <select
                    value={newChildGender}
                    onChange={(e) => setNewChildGender(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Laki-Laki">Laki-Laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Diagnosis Awal Perkembangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Autism Spectrum Disorder (ASD), Speech Delay..."
                  value={newChildDiagnosis}
                  onChange={(e) => setNewChildDiagnosis(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    placeholder="Nama Orang Tua"
                    value={newChildParent}
                    onChange={(e) => setNewChildParent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Nomor WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0812xxxx"
                    value={newChildPhone}
                    onChange={(e) => setNewChildPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-slate-400 hover:text-white rounded-xl text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveNewChild}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all"
              >
                Simpan Data Anak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🔍 DETAIL / PROFIL MODAL */}
      {/* ======================================================== */}
      {selectedChildForDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-base">Profil Lengkap Siswa</h3>
              <button onClick={() => setSelectedChildForDetail(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-5">
              <img
                src={selectedChildForDetail.photoUrl || `https://i.pravatar.cc/120?u=${selectedChildForDetail.id}`}
                alt=""
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/40"
              />
              <div>
                <h4 className="font-bold text-white text-lg">{selectedChildForDetail.name}</h4>
                <p className="text-xs text-slate-400">
                  {calculateAge(selectedChildForDetail.birthDate)} Tahun • {selectedChildForDetail.gender || 'Laki-Laki'} • {selectedChildForDetail.className || 'Kelas Terapi'}
                </p>
                <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Status: {selectedChildForDetail.status || 'Aktif'}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 mb-5">
              <div className="flex justify-between">
                <span className="text-slate-400">Diagnosis:</span>
                <span className="font-semibold text-white">{selectedChildForDetail.diagnosis || 'Speech Delay & Sensory Processing'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nama Ayah / Ibu:</span>
                <span className="font-semibold text-white">{selectedChildForDetail.parentName || 'Bapak/Ibu'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nomor Telepon:</span>
                <span className="font-mono text-white">{selectedChildForDetail.phone || '0812-9448-6889'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Alamat:</span>
                <span className="font-semibold text-white text-right max-w-[260px] truncate">{selectedChildForDetail.address || 'Griya Cinere, Depok'}</span>
              </div>
            </div>

            {/* JADWAL RUTIN WITH DIRECT ATUR JADWAL BUTTON */}
            <div className="flex items-center justify-between mb-2">
              <h5 className="font-bold text-white text-xs">Jadwal Terapi Rutin Mingguan:</h5>
              <button
                type="button"
                onClick={() => {
                  const target = selectedChildForDetail;
                  handleOpenScheduleModal(target);
                }}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg border border-indigo-500/20 transition-all"
              >
                <Calendar className="w-3 h-3" />
                Atur & Edit Jadwal
              </button>
            </div>

            <div className="space-y-1.5 mb-5 max-h-[180px] overflow-y-auto">
              {(selectedChildForDetail.recurringSessions || []).length === 0 ? (
                <p className="text-xs text-slate-500 italic p-3 bg-slate-950/40 rounded-lg border border-slate-800 text-center">
                  Belum ada sesi rutin mingguan. Klik tombol &quot;Atur & Edit Jadwal&quot; di atas untuk menjadwalkan.
                </p>
              ) : (
                selectedChildForDetail.recurringSessions?.map((s, idx) => {
                  const color = getTherapyColorInfo(s.type);
                  const therapistObj = therapists.find(t => t.id === s.therapistId);
                  return (
                    <div key={idx} className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${color.bg} ${color.border}`}>
                      <div>
                        <span className="font-semibold text-white">{s.day} • {s.time}</span>
                        {therapistObj && (
                          <span className="block text-[11px] text-slate-400 mt-0.5">
                            Terapis: {therapistObj.name}
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${color.badge}`}>{color.name}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedChildForDetail;
                    setSelectedChildForDetail(null);
                    handleOpenEditChildModal(target);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit Profil
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedChildForDetail;
                    handleOpenScheduleModal(target);
                  }}
                  className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border border-indigo-500/30"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Kelola Jadwal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedChildForDetail;
                    setDeletingChild(target);
                  }}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border border-rose-500/20"
                  title="Hapus Data Siswa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedChildForDetail(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ⚠️ DEACTIVATE CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {deactivatingChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-white text-base mb-1">Konfirmasi Nonaktifkan Pasien</h3>
            <p className="text-xs text-slate-400 mb-4">
              Anda akan menonaktifkan siswa: <span className="font-bold text-white">{deactivatingChild.name}</span>
            </p>

            <div className="mb-4">
              <label className="block text-xs text-slate-400 font-medium mb-1">Alasan Penonaktifan</label>
              <textarea
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                placeholder="Contoh: Telah lulus evaluasi, pindah kota, penghentian sementara..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 min-h-[80px]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeactivatingChild(null)}
                className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivate}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-all"
              >
                Nonaktifkan Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 🗑️ DELETE CHILD CONFIRMATION MODAL */}
      {/* ======================================================== */}
      {deletingChild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl shadow-rose-950/40 relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30 mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-white text-base text-center mb-1">
              Hapus Data Siswa
            </h3>
            <p className="text-xs text-slate-400 text-center mb-5">
              Apakah Anda yakin ingin menghapus data siswa ini? Tindakan ini akan menghapus data ananda secara permanen dari sistem Manajemen Anak.
            </p>

            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center gap-3 mb-5">
              <img
                src={deletingChild.photoUrl || `https://i.pravatar.cc/80?u=${deletingChild.id}`}
                alt=""
                className="w-11 h-11 rounded-lg object-cover ring-1 ring-slate-700"
              />
              <div className="min-w-0 flex-1">
                <span className="font-bold text-white text-sm block truncate">
                  {deletingChild.name}
                </span>
                <span className="text-[11px] text-slate-400 block truncate">
                  ID: {deletingChild.id} • {deletingChild.diagnosis || 'Diagnosis Klinis'}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">
                  {deletingChild.recurringSessions?.length || 0} Sesi Jadwal Terapi Rutin
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingChild(null)}
                className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-xs font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-rose-900/40 flex items-center gap-2 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Toast Notification */}
      {deleteSuccessToast && (
        <div className="fixed top-20 right-6 z-50 max-w-md bg-emerald-950/95 border border-emerald-500/40 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in backdrop-blur-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{deleteSuccessToast}</span>
          <button
            onClick={() => setDeleteSuccessToast('')}
            className="text-emerald-400 hover:text-white ml-auto p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* UPLOAD MODAL */}
      <UploadChildDataModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={(data) => {
          onAddMultipleChildren(data);
          setIsUploadModalOpen(false);
        }}
      />
    </div>
  );
};

export default ChildManagementPage;
