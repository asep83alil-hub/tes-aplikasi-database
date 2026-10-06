import React, { useState, useMemo } from 'react';
import { Therapist, TherapyDefinition, UserRole, Child, TherapistScheduleDay } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  LayoutGrid, 
  Table as TableIcon, 
  Calendar, 
  Clock, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Edit3, 
  Trash2, 
  X, 
  Printer, 
  Check, 
  Copy, 
  RotateCcw, 
  Award, 
  Sparkles, 
  CalendarDays, 
  Info,
  CalendarCheck,
  Building2,
  RefreshCw,
  Eye,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';

const DAYS_OF_WEEK = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

const STANDARD_TIME_SLOTS = [
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
  '17:00 - 18:00'
];

const DEFAULT_THERAPY_ROOMS = [
  'Ruang Okupasi & SI 1',
  'Ruang Okupasi 2',
  'Ruang Wicara 1',
  'Ruang Wicara 2',
  'Ruang Wicara 3',
  'Ruang Fisioterapi Pediatrik',
  'Ruang Remedial & Kognitif',
  'Kolam Hidroterapi & Fisio',
  'Arena Terapi Berkuda Lazuardi'
];

interface TherapistManagementPageProps {
  therapists: Therapist[];
  onAddTherapist: (therapistData: any) => void;
  onUpdateTherapist: (therapistId: string, updates: Partial<Omit<Therapist, 'id'>>) => void;
  onDeleteTherapist: (therapistId: string) => void;
  therapyTypes: TherapyDefinition[];
  userRole: UserRole;
  allChildren?: Child[];
  logoUrl?: string;
}

export const TherapistManagementPage: React.FC<TherapistManagementPageProps> = ({
  therapists,
  onAddTherapist,
  onUpdateTherapist,
  onDeleteTherapist,
  therapyTypes,
  userRole,
  allChildren = [],
  logoUrl
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialtyFilter, setSelectedSpecialtyFilter] = useState('ALL');
  const [selectedDayFilter, setSelectedDayFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [editingTherapist, setEditingTherapist] = useState<Therapist | null>(null);
  const [activeEditTab, setActiveEditTab] = useState<'profile' | 'schedule' | 'clients'>('schedule');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Determine current day name in Indonesian
  const todayIndonesian = useMemo(() => {
    const dayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday
    const map = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return map[dayIndex];
  }, []);

  // Compute scheduled sessions mapping for all therapists from allChildren
  const therapistClientsMap = useMemo(() => {
    const map: { [therapistId: string]: Array<{ child: Child; day: string; time: string; type: string }> } = {};
    therapists.forEach(t => { map[t.id] = []; });

    allChildren.forEach(child => {
      child.recurringSessions?.forEach(session => {
        if (session.therapistId && map[session.therapistId]) {
          map[session.therapistId].push({
            child,
            day: session.day,
            time: session.time,
            type: session.type
          });
        }
      });
    });

    return map;
  }, [allChildren, therapists]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = therapists.length;
    const active = therapists.filter(t => (t.status || 'Aktif') === 'Aktif').length;
    const onLeave = therapists.filter(t => t.status === 'Cuti').length;
    const activeToday = therapists.filter(t => {
      const days = t.workingDays || (t.scheduleDays ? t.scheduleDays.filter(s => s.active).map(s => s.day) : ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']);
      return days.includes(todayIndonesian) && (t.status || 'Aktif') === 'Aktif';
    }).length;

    // Total unique specialties handled
    const allSpecs = new Set<string>();
    therapists.forEach(t => t.specialties?.forEach(s => allSpecs.add(s)));

    return { total, active, onLeave, activeToday, totalSpecialties: allSpecs.size };
  }, [therapists, todayIndonesian]);

  // Filtered Therapists
  const filteredTherapists = useMemo(() => {
    return therapists.filter(t => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.email && t.email.toLowerCase().includes(q)) ||
        (t.phone && t.phone.toLowerCase().includes(q)) ||
        (t.defaultRoom && t.defaultRoom.toLowerCase().includes(q));

      // Specialty filter
      const matchSpecialty = selectedSpecialtyFilter === 'ALL' || 
        (t.specialties && t.specialties.includes(selectedSpecialtyFilter));

      // Working day filter
      const workingDays = t.workingDays || (t.scheduleDays ? t.scheduleDays.filter(s => s.active).map(s => s.day) : ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']);
      const matchDay = selectedDayFilter === 'ALL' || 
        (selectedDayFilter === 'TODAY' ? workingDays.includes(todayIndonesian) : workingDays.includes(selectedDayFilter));

      // Status filter
      const status = t.status || 'Aktif';
      const matchStatus = selectedStatusFilter === 'ALL' || status === selectedStatusFilter;

      return matchSearch && matchSpecialty && matchDay && matchStatus;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [therapists, searchQuery, selectedSpecialtyFilter, selectedDayFilter, selectedStatusFilter, todayIndonesian]);

  // Action handlers
  const handleOpenEdit = (therapist: Therapist, tab: 'profile' | 'schedule' | 'clients' = 'schedule') => {
    setEditingTherapist(therapist);
    setActiveEditTab(tab);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (therapist: Therapist) => {
    const clientsCount = therapistClientsMap[therapist.id]?.length || 0;
    const warningExtra = clientsCount > 0 
      ? `\n\nPerhatian: Terapis ini saat ini memiliki ${clientsCount} sesi siswa aktif. Jadwal sesi tersebut mungkin perlu dialihkan.` 
      : '';
    
    if (window.confirm(`Apakah Anda yakin ingin menghapus data terapis "${therapist.name}" (${therapist.id})?${warningExtra}`)) {
      onDeleteTherapist(therapist.id);
      showToast(`Terapis ${therapist.name} berhasil dihapus.`);
    }
  };

  // Helper to get therapy color
  const getTherapyBadge = (typeId: string) => {
    const therapy = therapyTypes.find(t => t.id === typeId);
    if (!therapy) {
      return (
        <span key={typeId} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700 text-slate-200 border border-slate-600">
          {typeId}
        </span>
      );
    }
    return (
      <span 
        key={typeId} 
        style={{
          backgroundColor: `${therapy.color}15`,
          borderColor: `${therapy.color}40`,
          color: therapy.color
        }} 
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: therapy.color }} />
        {therapy.name}
      </span>
    );
  };

  return (
    <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in-up">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-indigo-400/40 animate-bounce-short">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface border border-surface-light p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-primary/10 text-primary rounded-2xl border border-primary/20 shrink-0">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">Manajemen Terapis & Jadwal</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-primary/20 text-primary-light border border-primary/30">
                {therapists.length} Terapis
              </span>
            </div>
            <p className="text-sm text-muted mt-1">
              Kelola praktisi, spesialisasi layanan, hari kerja praktik, dan alokasi sesi siswa di Pelangi Lazuardi.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface-light hover:bg-surface-light/80 text-white text-xs font-semibold rounded-xl border border-surface-light/60 transition cursor-pointer"
            title="Pratinjau & Cetak Matriks Jadwal Kerja Terapis"
          >
            <Printer className="w-4 h-4 text-muted" />
            <span>Cetak Jadwal</span>
          </button>

          {(userRole === 'admin' || userRole === 'manager' || userRole === 'super_admin') && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-background font-bold text-xs rounded-xl shadow-lg shadow-primary/25 transition transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Terapis Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-surface border border-surface-light p-4 sm:p-5 rounded-2xl flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted block">Total Terapis</span>
            <span className="text-2xl font-black text-white">{stats.total}</span>
          </div>
        </div>

        <div className="bg-surface border border-surface-light p-4 sm:p-5 rounded-2xl flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted block">Terapis Aktif</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-emerald-400">{stats.active}</span>
              {stats.onLeave > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  {stats.onLeave} Cuti
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-surface border border-surface-light p-4 sm:p-5 rounded-2xl flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted block">Ragam Layanan</span>
            <span className="text-2xl font-black text-purple-300">{stats.totalSpecialties} Terapi</span>
          </div>
        </div>

        <div className="bg-surface border border-surface-light p-4 sm:p-5 rounded-2xl flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-medium text-muted block">Praktik Hari Ini ({todayIndonesian})</span>
            <span className="text-2xl font-black text-amber-400">{stats.activeToday} Terapis</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-surface border border-surface-light p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama terapis, ID, gelar, kontak, atau ruangan..."
            className="w-full bg-background border border-surface-light/60 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white placeholder-muted focus:ring-2 focus:ring-primary focus:border-transparent transition"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Specialty Filter */}
          <select
            value={selectedSpecialtyFilter}
            onChange={(e) => setSelectedSpecialtyFilter(e.target.value)}
            aria-label="Filter berdasarkan spesialisasi terapi"
            className="bg-background border border-surface-light/60 text-white text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="ALL">Semua Spesialisasi</option>
            {therapyTypes.map(therapy => (
              <option key={therapy.id} value={therapy.id}>
                {therapy.name} ({therapy.id})
              </option>
            ))}
          </select>

          {/* Day Filter */}
          <select
            value={selectedDayFilter}
            onChange={(e) => setSelectedDayFilter(e.target.value)}
            aria-label="Filter berdasarkan hari kerja atau jadwal"
            className="bg-background border border-surface-light/60 text-white text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="ALL">Semua Hari Kerja</option>
            <option value="TODAY">Praktik Hari Ini ({todayIndonesian})</option>
            {DAYS_OF_WEEK.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            aria-label="Filter berdasarkan status keaktifan"
            className="bg-background border border-surface-light/60 text-white text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="ALL">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Cuti">Cuti</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-background p-1 rounded-xl border border-surface-light/60">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${viewMode === 'cards' ? 'bg-primary text-background shadow-xs font-bold' : 'text-muted hover:text-white'}`}
              title="Tampilan Grid Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${viewMode === 'table' ? 'bg-primary text-background shadow-xs font-bold' : 'text-muted hover:text-white'}`}
              title="Tampilan Tabel Rinci"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main List Content */}
      {filteredTherapists.length === 0 ? (
        <div className="bg-surface border border-surface-light rounded-3xl p-12 text-center">
          <Stethoscope className="w-12 h-12 text-muted mx-auto mb-3 opacity-40" />
          <h3 className="text-base font-bold text-white mb-1">Tidak ada data terapis yang sesuai</h3>
          <p className="text-xs text-muted max-w-md mx-auto mb-4">
            Coba ubah kata kunci pencarian atau sesuaikan filter spesialisasi dan hari kerja.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSpecialtyFilter('ALL');
              setSelectedDayFilter('ALL');
              setSelectedStatusFilter('ALL');
            }}
            className="px-4 py-2 bg-surface-light hover:bg-surface-light/80 text-white text-xs font-semibold rounded-xl transition"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTherapists.map((therapist) => {
            const workingDays = therapist.workingDays || 
              (therapist.scheduleDays ? therapist.scheduleDays.filter(s => s.active).map(s => s.day) : ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']);
            const isWorkingToday = workingDays.includes(todayIndonesian);
            const clientsCount = therapistClientsMap[therapist.id]?.length || 0;
            const status = therapist.status || 'Aktif';

            return (
              <div 
                key={therapist.id} 
                className="bg-surface border border-surface-light rounded-3xl p-5 shadow-sm hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Card Top: Avatar, Status & ID */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={therapist.photoUrl} 
                          alt={therapist.name} 
                          className="w-13 h-13 rounded-2xl object-cover ring-2 ring-surface-light shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(therapist.name)}&background=4F46E5&color=fff`;
                          }}
                        />
                        {isWorkingToday && status === 'Aktif' && (
                          <span 
                            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-surface rounded-full" 
                            title={`Aktif bertugas hari ini (${todayIndonesian})`}
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-bold text-white truncate hover:text-primary-light transition">
                            {therapist.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-muted font-medium truncate">
                          {therapist.title || 'Praktisi Terapi'}
                        </p>
                        <span className="text-[10px] font-mono text-muted/80 bg-background/60 px-1.5 py-0.5 rounded border border-surface-light/40 inline-block mt-0.5">
                          {therapist.id}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      status === 'Aktif' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                        : status === 'Cuti'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                    }`}>
                      {status}
                    </span>
                  </div>

                  {/* Specialties Pills */}
                  <div className="mb-3.5">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block mb-1.5">
                      Spesialisasi Terapi:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {therapist.specialties && therapist.specialties.length > 0 ? (
                        therapist.specialties.map(specId => getTherapyBadge(specId))
                      ) : (
                        <span className="text-xs text-muted italic">Belum ditentukan</span>
                      )}
                    </div>
                  </div>

                  {/* Working Days Matrix (S S R K J S M) */}
                  <div className="mb-3.5 bg-background/50 p-3 rounded-2xl border border-surface-light/40">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-primary-light" />
                        Jadwal Hari Praktik:
                      </span>
                      {isWorkingToday && status === 'Aktif' ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Hari Ini Praktik
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted">
                          {workingDays.length} Hari / Minggu
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                      {DAYS_OF_WEEK.map((dayName) => {
                        const isWorking = workingDays.includes(dayName);
                        const isToday = dayName === todayIndonesian;
                        const shortLabel = dayName.slice(0, 1); // S, S, R, K, J, S, M

                        return (
                          <div 
                            key={dayName}
                            title={`${dayName}: ${isWorking ? 'Bertugas' : 'Libur'}${isToday ? ' (Hari ini)' : ''}`}
                            className={`py-1.5 rounded-lg text-[10px] font-bold transition flex flex-col items-center justify-center ${
                              isWorking 
                                ? isToday 
                                  ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 font-black' 
                                  : 'bg-primary/20 text-primary-light border border-primary/30'
                                : 'bg-surface-light/30 text-muted/40 border border-transparent'
                            }`}
                          >
                            <span>{shortLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Room & Capacity Details */}
                  <div className="space-y-1.5 text-xs text-muted mb-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-muted shrink-0" />
                        <span>Ruangan:</span>
                      </span>
                      <span className="font-medium text-white truncate max-w-[170px]" title={therapist.defaultRoom || 'Ruang Terapi'}>
                        {therapist.defaultRoom || 'Ruang Terapi Utama'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-muted shrink-0" />
                        <span>Beban Klien:</span>
                      </span>
                      <span className="font-semibold text-primary-light">
                        {clientsCount} Sesi Terjadwal
                      </span>
                    </div>

                    {therapist.phone && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-muted shrink-0" />
                          <span>Kontak:</span>
                        </span>
                        <a 
                          href={`https://wa.me/${therapist.phone.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="font-mono text-emerald-400 hover:underline"
                        >
                          {therapist.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-surface-light/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenEdit(therapist, 'schedule')}
                    className="flex-1 py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary-light rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-primary/20"
                    title="Atur Jadwal & Hari Praktik Terapis Ini"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Atur Jadwal</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(therapist, 'profile')}
                    className="py-2 px-3 bg-surface-light hover:bg-surface-light/80 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                    title="Edit Profil & Spesialisasi"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {(userRole === 'admin' || userRole === 'manager' || userRole === 'super_admin') && (
                    <button
                      onClick={() => handleDeleteClick(therapist)}
                      className="p-2 text-danger hover:bg-danger/10 rounded-xl transition cursor-pointer border border-transparent hover:border-danger/30"
                      title="Hapus Data Terapis"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE LIST VIEW */
        <div className="bg-surface border border-surface-light rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-light text-left text-xs">
              <thead className="bg-background/80 text-muted uppercase font-semibold">
                <tr>
                  <th scope="col" className="px-5 py-4">Terapis</th>
                  <th scope="col" className="px-5 py-4">Spesialisasi</th>
                  <th scope="col" className="px-5 py-4">Hari Praktik</th>
                  <th scope="col" className="px-5 py-4">Ruang & Kontak</th>
                  <th scope="col" className="px-5 py-4 text-center">Beban Klien</th>
                  <th scope="col" className="px-5 py-4 text-center">Status</th>
                  <th scope="col" className="px-5 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-light/60">
                {filteredTherapists.map((therapist) => {
                  const workingDays = therapist.workingDays || 
                    (therapist.scheduleDays ? therapist.scheduleDays.filter(s => s.active).map(s => s.day) : ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']);
                  const isWorkingToday = workingDays.includes(todayIndonesian);
                  const clientsCount = therapistClientsMap[therapist.id]?.length || 0;
                  const status = therapist.status || 'Aktif';

                  return (
                    <tr key={therapist.id} className="hover:bg-surface-light/40 transition">
                      {/* Name & Photo */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={therapist.photoUrl}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover ring-1 ring-surface-light shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(therapist.name)}&background=4F46E5&color=fff`;
                            }}
                          />
                          <div>
                            <div className="font-bold text-white text-sm">{therapist.name}</div>
                            <div className="text-[11px] text-muted">{therapist.title || 'Praktisi Terapi'}</div>
                            <span className="text-[10px] font-mono text-muted/70">{therapist.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Specialties */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {therapist.specialties && therapist.specialties.length > 0 ? (
                            therapist.specialties.map(specId => getTherapyBadge(specId))
                          ) : (
                            <span className="text-muted italic text-[11px]">-</span>
                          )}
                        </div>
                      </td>

                      {/* Working Days */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            {DAYS_OF_WEEK.map((d) => {
                              const isWork = workingDays.includes(d);
                              const isToday = d === todayIndonesian;
                              return (
                                <span
                                  key={d}
                                  title={`${d}: ${isWork ? 'Aktif' : 'Libur'}`}
                                  className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold ${
                                    isWork 
                                      ? isToday 
                                        ? 'bg-emerald-500 text-slate-950 font-black' 
                                        : 'bg-primary/20 text-primary-light border border-primary/30'
                                      : 'bg-surface-light/30 text-muted/30'
                                  }`}
                                >
                                  {d.slice(0, 1)}
                                </span>
                              );
                            })}
                          </div>
                          <div className="text-[10px] text-muted">
                            {isWorkingToday ? (
                              <span className="text-emerald-400 font-semibold">● Praktik Hari Ini</span>
                            ) : (
                              `${workingDays.length} Hari Kerja`
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Room & Contact */}
                      <td className="px-5 py-4 whitespace-nowrap text-muted">
                        <div className="space-y-0.5">
                          <div className="text-white font-medium">{therapist.defaultRoom || 'Ruang Terapi'}</div>
                          {therapist.phone && (
                            <div className="text-[11px] font-mono text-emerald-400">{therapist.phone}</div>
                          )}
                        </div>
                      </td>

                      {/* Scheduled Clients */}
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleOpenEdit(therapist, 'clients')}
                          className="px-2.5 py-1 bg-surface-light hover:bg-surface-light/80 text-white rounded-lg font-bold text-xs inline-flex items-center gap-1.5 transition"
                          title="Lihat daftar siswa yang diampu"
                        >
                          <Users className="w-3 h-3 text-primary-light" />
                          <span>{clientsCount} Sesi</span>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          status === 'Aktif' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : status === 'Cuti'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                        }`}>
                          {status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(therapist, 'schedule')}
                            className="p-1.5 bg-primary/10 hover:bg-primary/20 text-primary-light rounded-lg transition"
                            title="Atur Jadwal & Hari Praktik"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(therapist, 'profile')}
                            className="p-1.5 bg-surface-light hover:bg-surface-light/80 text-white rounded-lg transition"
                            title="Edit Data Profil"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {(userRole === 'admin' || userRole === 'manager' || userRole === 'super_admin') && (
                            <button
                              onClick={() => handleDeleteClick(therapist)}
                              className="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition"
                              title="Hapus Data Terapis"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* ================= MODAL TAMBAH TERAPIS BARU ================= */}
      {isAddModalOpen && (
        <AddTherapistModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={(data) => {
            onAddTherapist(data);
            setIsAddModalOpen(false);
            showToast(`Terapis ${data.name} berhasil ditambahkan!`);
          }}
          therapyTypes={therapyTypes}
          existingTherapistCount={therapists.length}
        />
      )}

      {/* ================= MODAL EDIT TERAPIS & ATUR JADWAL ================= */}
      {isEditModalOpen && editingTherapist && (
        <EditTherapistModal
          isOpen={isEditModalOpen}
          therapist={editingTherapist}
          initialTab={activeEditTab}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(therapistId, updates) => {
            onUpdateTherapist(therapistId, updates);
            setIsEditModalOpen(false);
            showToast(`Data dan jadwal terapis berhasil diperbarui!`);
          }}
          therapyTypes={therapyTypes}
          scheduledClients={therapistClientsMap[editingTherapist.id] || []}
        />
      )}

      {/* ================= MODAL CETAK MATRIKS JADWAL ================= */}
      {isPrintModalOpen && (
        <PrintTherapistScheduleModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          therapists={therapists}
          therapyTypes={therapyTypes}
          logoUrl={logoUrl}
        />
      )}
    </main>
  );
};

/* =========================================================================
   SUB-COMPONENT: AddTherapistModal
   ========================================================================= */

interface AddTherapistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: any) => void;
  therapyTypes: TherapyDefinition[];
  existingTherapistCount: number;
}

const AddTherapistModal: React.FC<AddTherapistModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  therapyTypes,
  existingTherapistCount
}) => {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [photoUrl, setPhotoUrl] = useState(`https://i.pravatar.cc/150?u=therapist_${Date.now()}`);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Cuti' | 'Nonaktif'>('Aktif');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [workingDays, setWorkingDays] = useState<string[]>(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']);
  const [defaultRoom, setDefaultRoom] = useState(DEFAULT_THERAPY_ROOMS[0]);
  const [maxClientsPerDay, setMaxClientsPerDay] = useState(6);
  const [bio, setBio] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('16:00');

  if (!isOpen) return null;

  const handleSpecialtyToggle = (id: string) => {
    setSpecialties(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleDayToggle = (day: string) => {
    setWorkingDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleRandomAvatar = () => {
    const randomSeed = Math.floor(Math.random() * 10000);
    setPhotoUrl(`https://i.pravatar.cc/150?u=therapist_rnd_${randomSeed}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama terapis wajib diisi!');
      return;
    }

    const scheduleDays: TherapistScheduleDay[] = DAYS_OF_WEEK.map(day => {
      const isActive = workingDays.includes(day);
      return {
        day,
        active: isActive,
        startTime,
        endTime,
        timeSlots: isActive ? STANDARD_TIME_SLOTS.slice(1, 8) : [],
        room: defaultRoom
      };
    });

    onAdd({
      name: name.trim(),
      title: title.trim() || 'Praktisi Terapi',
      photoUrl,
      phone: phone.trim(),
      email: email.trim(),
      status,
      specialties: specialties.length > 0 ? specialties : (therapyTypes[0] ? [therapyTypes[0].id] : []),
      workingDays,
      scheduleDays,
      defaultRoom,
      maxClientsPerDay: Number(maxClientsPerDay) || 6,
      bio: bio.trim(),
      username: `terapis_${existingTherapistCount + 1}`,
      password: 'password'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-surface border border-surface-light rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-surface-light flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Tambah Terapis Baru</h2>
              <p className="text-xs text-muted">Lengkapi data praktisi, spesialisasi, dan jadwal kerja</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white p-2 rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Section 1: Profil Dasar */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-primary-light uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Informasi Pribadi & Kualifikasi
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-muted font-medium mb-1">Nama Lengkap & Gelar *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rilla Serando, S.Tr.Kes"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-surface-light/60 rounded-xl px-3 py-2 text-white placeholder-muted focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Gelar / Posisi Spesialisasi</label>
                <input
                  type="text"
                  placeholder="Contoh: Spesialis Okupasi Terapi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-background border border-surface-light/60 rounded-xl px-3 py-2 text-white placeholder-muted focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Photo URL & Avatar Preview */}
            <div className="flex items-center gap-4 p-3 bg-background/50 rounded-2xl border border-surface-light/40">
              <img
                src={photoUrl}
                alt="Preview"
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-primary/40 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Terapis')}&background=4F46E5&color=fff`;
                }}
              />
              <div className="flex-1 min-w-0">
                <label className="block text-muted font-medium mb-1">URL Foto Profil</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="flex-1 bg-surface border border-surface-light/60 rounded-xl px-3 py-1.5 text-white text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={handleRandomAvatar}
                    className="px-3 py-1.5 bg-surface-light hover:bg-surface-light/80 text-white rounded-xl text-[11px] font-semibold transition shrink-0"
                    title="Ganti Foto Acak"
                  >
                    Acak Foto
                  </button>
                </div>
              </div>
            </div>

            {/* Contact & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-muted font-medium mb-1">No. WhatsApp / Telepon</label>
                <input
                  type="text"
                  placeholder="0812-xxxx-xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-background border border-surface-light/60 rounded-xl px-3 py-2 text-white placeholder-muted focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                />
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Email Resmi</label>
                <input
                  type="email"
                  placeholder="nama@lazuardi.sch.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background border border-surface-light/60 rounded-xl px-3 py-2 text-white placeholder-muted focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Status Keaktifan</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-background border border-surface-light/60 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Cuti">Cuti</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Spesialisasi Terapi */}
          <div className="space-y-3 pt-3 border-t border-surface-light/60">
            <h3 className="text-xs font-bold text-primary-light uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" />
              Spesialisasi Terapi (Bisa pilih lebih dari satu)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {therapyTypes.map(therapy => {
                const isChecked = specialties.includes(therapy.id);
                return (
                  <label
                    key={therapy.id}
                    onClick={() => handleSpecialtyToggle(therapy.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition select-none ${
                      isChecked 
                        ? 'border-primary bg-primary/10 shadow-xs' 
                        : 'border-surface-light/60 bg-background/50 hover:bg-surface-light/30'
                    }`}
                  >
                    <div 
                      className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                        isChecked ? 'bg-primary border-primary text-background' : 'border-muted'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <div>
                      <span className="font-bold text-white block">{therapy.name}</span>
                      <span className="text-[10px] text-muted">{therapy.id}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 3: Pengaturan Jadwal & Hari Praktik */}
          <div className="space-y-4 pt-3 border-t border-surface-light/60">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-primary-light uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Hari Kerja Praktik & Jam Operasional
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWorkingDays(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'])}
                  className="text-[10px] text-primary-light hover:underline font-semibold"
                >
                  Senin - Jumat
                </button>
                <span className="text-muted/40">|</span>
                <button
                  type="button"
                  onClick={() => setWorkingDays([...DAYS_OF_WEEK])}
                  className="text-[10px] text-primary-light hover:underline font-semibold"
                >
                  Semua Hari
                </button>
              </div>
            </div>

            {/* Day Selector Buttons */}
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_OF_WEEK.map(day => {
                const isSelected = workingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                      isSelected 
                        ? 'bg-primary text-background shadow-md' 
                        : 'bg-background/80 text-muted hover:text-white border border-surface-light/40'
                    }`}
                  >
                    <span>{day.slice(0, 3)}</span>
                    <span className="text-[9px] font-normal opacity-80 mt-0.5">
                      {isSelected ? 'Aktif' : 'Libur'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Time & Room Configurations */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-muted font-medium mb-1">Jam Praktik Mulai</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-background border border-surface-light/60 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                />
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Jam Praktik Selesai</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-background border border-surface-light/60 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                />
              </div>

              <div>
                <label className="block text-muted font-medium mb-1">Maks. Klien / Hari</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={maxClientsPerDay}
                  onChange={(e) => setMaxClientsPerDay(parseInt(e.target.value) || 6)}
                  className="w-full bg-background border border-surface-light/60 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Ruangan Praktik Utama</label>
              <select
                value={defaultRoom}
                onChange={(e) => setDefaultRoom(e.target.value)}
                className="w-full bg-background border border-surface-light/60 rounded-xl px-3 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {DEFAULT_THERAPY_ROOMS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-muted font-medium mb-1">Bio / Catatan Kompetensi Tambahan</label>
              <textarea
                rows={2}
                placeholder="Catatan mengenai pendekatan terapi, sertifikasi khusus..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-background border border-surface-light/60 rounded-xl p-3 text-white placeholder-muted focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-surface-light flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-muted hover:text-white bg-surface-light/50 hover:bg-surface-light transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-background bg-primary hover:bg-primary-dark transition shadow-lg shadow-primary/20 cursor-pointer"
            >
              Simpan Data Terapis
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================================
   SUB-COMPONENT: EditTherapistModal (With 3 Functional Tabs: Info, Schedule, Clients)
   ========================================================================= */

interface EditTherapistModalProps {
  isOpen: boolean;
  therapist: Therapist;
  initialTab?: 'profile' | 'schedule' | 'clients';
  onClose: () => void;
  onSave: (therapistId: string, updates: Partial<Omit<Therapist, 'id'>>) => void;
  therapyTypes: TherapyDefinition[];
  scheduledClients: Array<{ child: Child; day: string; time: string; type: string }>;
}

const EditTherapistModal: React.FC<EditTherapistModalProps> = ({
  isOpen,
  therapist,
  initialTab = 'schedule',
  onClose,
  onSave,
  therapyTypes,
  scheduledClients
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'schedule' | 'clients'>(initialTab);

  // Profile states
  const [name, setName] = useState(therapist.name || '');
  const [title, setTitle] = useState(therapist.title || '');
  const [photoUrl, setPhotoUrl] = useState(therapist.photoUrl || '');
  const [phone, setPhone] = useState(therapist.phone || '');
  const [email, setEmail] = useState(therapist.email || '');
  const [status, setStatus] = useState<'Aktif' | 'Cuti' | 'Nonaktif'>(therapist.status || 'Aktif');
  const [specialties, setSpecialties] = useState<string[]>(therapist.specialties || []);
  const [defaultRoom, setDefaultRoom] = useState(therapist.defaultRoom || DEFAULT_THERAPY_ROOMS[0]);
  const [maxClientsPerDay, setMaxClientsPerDay] = useState(therapist.maxClientsPerDay || 6);
  const [bio, setBio] = useState(therapist.bio || '');

  // Schedule states per day
  const [scheduleDays, setScheduleDays] = useState<TherapistScheduleDay[]>(() => {
    if (therapist.scheduleDays && therapist.scheduleDays.length > 0) {
      return therapist.scheduleDays;
    }
    // Fallback initialize from workingDays or default
    const existingDays = therapist.workingDays || ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
    return DAYS_OF_WEEK.map(dayName => ({
      day: dayName,
      active: existingDays.includes(dayName),
      startTime: '08:00',
      endTime: '16:00',
      timeSlots: existingDays.includes(dayName) ? STANDARD_TIME_SLOTS.slice(1, 8) : [],
      room: therapist.defaultRoom || DEFAULT_THERAPY_ROOMS[0]
    }));
  });

  const [expandedDay, setExpandedDay] = useState<string>('Senin');

  if (!isOpen) return null;

  // Toggle active day
  const handleToggleDayActive = (dayName: string) => {
    setScheduleDays(prev => prev.map(item => {
      if (item.day === dayName) {
        const nextActive = !item.active;
        return {
          ...item,
          active: nextActive,
          timeSlots: nextActive ? (item.timeSlots && item.timeSlots.length > 0 ? item.timeSlots : STANDARD_TIME_SLOTS.slice(1, 8)) : []
        };
      }
      return item;
    }));
  };

  // Update schedule day field
  const handleUpdateScheduleDay = (dayName: string, updates: Partial<TherapistScheduleDay>) => {
    setScheduleDays(prev => prev.map(item => item.day === dayName ? { ...item, ...updates } : item));
  };

  // Toggle time slot in a day
  const handleToggleTimeSlot = (dayName: string, slot: string) => {
    setScheduleDays(prev => prev.map(item => {
      if (item.day === dayName) {
        const slots = item.timeSlots || [];
        const nextSlots = slots.includes(slot) ? slots.filter(s => s !== slot) : [...slots, slot];
        return { ...item, timeSlots: nextSlots };
      }
      return item;
    }));
  };

  // Preset: Standard Monday to Friday
  const handleSetStandardWorkingDays = () => {
    setScheduleDays(prev => prev.map(item => {
      const isMonToFri = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'].includes(item.day);
      return {
        ...item,
        active: isMonToFri,
        startTime: '08:00',
        endTime: '16:00',
        timeSlots: isMonToFri ? STANDARD_TIME_SLOTS.slice(1, 8) : []
      };
    }));
  };

  // Preset: All 7 days
  const handleSetAllDaysActive = () => {
    setScheduleDays(prev => prev.map(item => ({
      ...item,
      active: true,
      startTime: '08:00',
      endTime: '16:00',
      timeSlots: STANDARD_TIME_SLOTS.slice(1, 8)
    })));
  };

  // Copy schedule from one day to all active days
  const handleCopyDayToAllActive = (sourceDayName: string) => {
    const source = scheduleDays.find(d => d.day === sourceDayName);
    if (!source) return;

    if (window.confirm(`Salin jam kerja (${source.startTime} - ${source.endTime}), slot waktu, dan ruangan dari ${sourceDayName} ke semua hari aktif lainnya?`)) {
      setScheduleDays(prev => prev.map(item => {
        if (item.active && item.day !== sourceDayName) {
          return {
            ...item,
            startTime: source.startTime,
            endTime: source.endTime,
            timeSlots: [...(source.timeSlots || [])],
            room: source.room
          };
        }
        return item;
      }));
    }
  };

  // Specialty toggle
  const handleSpecialtyToggle = (id: string) => {
    setSpecialties(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Save changes
  const handleSave = () => {
    const activeWorkingDays = scheduleDays.filter(d => d.active).map(d => d.day);

    onSave(therapist.id, {
      name: name.trim() || therapist.name,
      title: title.trim(),
      photoUrl,
      phone: phone.trim(),
      email: email.trim(),
      status,
      specialties,
      workingDays: activeWorkingDays,
      scheduleDays,
      defaultRoom,
      maxClientsPerDay: Number(maxClientsPerDay) || 6,
      bio: bio.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-sm animate-fade-in-up">
      <div className="bg-surface border border-surface-light rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-surface-light flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={photoUrl}
              alt=""
              className="w-12 h-12 rounded-2xl object-cover ring-2 ring-primary/40 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff`;
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">{name}</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-background/80 border border-surface-light text-muted">
                  {therapist.id}
                </span>
              </div>
              <p className="text-xs text-muted">Atur spesialisasi, hari kerja, jam operasional, dan beban sesi</p>
            </div>
          </div>

          <button onClick={onClose} className="text-muted hover:text-white p-2 rounded-xl transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-surface-light flex items-center gap-2 bg-background/40">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'schedule' 
                ? 'border-primary text-primary-light' 
                : 'border-transparent text-muted hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Atur Jadwal & Hari Praktik</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'profile' 
                ? 'border-primary text-primary-light' 
                : 'border-transparent text-muted hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Profil & Spesialisasi</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'clients' 
                ? 'border-primary text-primary-light' 
                : 'border-transparent text-muted hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Siswa Terjadwal ({scheduledClients.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* TAB 1: ATUR JADWAL & HARI PRAKTIK (PRIMARY FOCUS) */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {/* Presets Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-background/60 rounded-2xl border border-surface-light/60">
                <div>
                  <h4 className="font-bold text-white text-xs">Konfigurasi Hari Kerja Terapis</h4>
                  <p className="text-[11px] text-muted">Aktifkan hari praktik dan tentukan slot waktu serta ruangan</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSetStandardWorkingDays}
                    className="px-3 py-1.5 bg-surface-light hover:bg-surface-light/80 text-white rounded-xl text-[11px] font-semibold transition"
                  >
                    Senin - Jumat (08:00 - 16:00)
                  </button>
                  <button
                    type="button"
                    onClick={handleSetAllDaysActive}
                    className="px-3 py-1.5 bg-surface-light hover:bg-surface-light/80 text-white rounded-xl text-[11px] font-semibold transition"
                  >
                    Semua Hari Aktif
                  </button>
                </div>
              </div>

              {/* Day-by-Day Accordion / Cards */}
              <div className="space-y-3">
                {scheduleDays.map((dayConfig) => {
                  const isExpanded = expandedDay === dayConfig.day;
                  const activeSlotsCount = dayConfig.timeSlots?.length || 0;

                  return (
                    <div 
                      key={dayConfig.day}
                      className={`border rounded-2xl overflow-hidden transition ${
                        dayConfig.active 
                          ? isExpanded ? 'border-primary/60 bg-surface' : 'border-surface-light bg-surface' 
                          : 'border-surface-light/40 bg-background/30 opacity-75'
                      }`}
                    >
                      {/* Day Header Row */}
                      <div className="p-3.5 flex items-center justify-between gap-3 bg-surface-light/20">
                        <div className="flex items-center gap-3">
                          {/* Active Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => handleToggleDayActive(dayConfig.day)}
                            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition cursor-pointer ${
                              dayConfig.active ? 'bg-primary justify-end' : 'bg-surface-light justify-start'
                            }`}
                            title={dayConfig.active ? 'Klik untuk meliburkan hari ini' : 'Klik untuk mengaktifkan hari ini'}
                          >
                            <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
                          </button>

                          <div>
                            <span className={`text-sm font-bold block ${dayConfig.active ? 'text-white' : 'text-muted'}`}>
                              {dayConfig.day}
                            </span>
                            <span className="text-[10px] text-muted">
                              {dayConfig.active ? (
                                <span className="text-emerald-400 font-semibold">
                                  ● Aktif Praktik • {dayConfig.startTime} - {dayConfig.endTime} ({activeSlotsCount} Slot Sesi)
                                </span>
                              ) : (
                                <span className="text-muted/60">Libur / Tidak Bertugas</span>
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {dayConfig.active && (
                            <button
                              type="button"
                              onClick={() => handleCopyDayToAllActive(dayConfig.day)}
                              className="text-[10px] text-primary-light hover:underline font-semibold flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-lg"
                              title="Terapkan jam & slot hari ini ke semua hari aktif lainnya"
                            >
                              <Copy className="w-3 h-3" />
                              <span>Salin ke Hari Lain</span>
                            </button>
                          )}

                          {dayConfig.active && (
                            <button
                              type="button"
                              onClick={() => setExpandedDay(isExpanded ? '' : dayConfig.day)}
                              className="text-muted hover:text-white p-1 rounded-lg text-xs font-semibold"
                            >
                              {isExpanded ? 'Tutup Detail' : 'Atur Jam & Slot'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Settings for this day */}
                      {dayConfig.active && isExpanded && (
                        <div className="p-4 border-t border-surface-light/60 bg-background/40 space-y-4 animate-fade-in-up">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-muted font-medium mb-1">Jam Mulai</label>
                              <input
                                type="time"
                                value={dayConfig.startTime || '08:00'}
                                onChange={(e) => handleUpdateScheduleDay(dayConfig.day, { startTime: e.target.value })}
                                className="w-full bg-surface border border-surface-light/60 rounded-xl px-3 py-1.5 text-white font-mono text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-muted font-medium mb-1">Jam Selesai</label>
                              <input
                                type="time"
                                value={dayConfig.endTime || '16:00'}
                                onChange={(e) => handleUpdateScheduleDay(dayConfig.day, { endTime: e.target.value })}
                                className="w-full bg-surface border border-surface-light/60 rounded-xl px-3 py-1.5 text-white font-mono text-xs"
                              />
                            </div>

                            <div>
                              <label className="block text-muted font-medium mb-1">Ruangan Praktik</label>
                              <select
                                value={dayConfig.room || defaultRoom}
                                onChange={(e) => handleUpdateScheduleDay(dayConfig.day, { room: e.target.value })}
                                className="w-full bg-surface border border-surface-light/60 rounded-xl px-3 py-1.5 text-white text-xs"
                              >
                                {DEFAULT_THERAPY_ROOMS.map(r => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Time Slots Checklist */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-muted font-medium block">
                                Slot Waktu Tersedia untuk Sesi Terapi ({activeSlotsCount} Dipilih):
                              </label>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateScheduleDay(dayConfig.day, { timeSlots: [...STANDARD_TIME_SLOTS] })}
                                  className="text-[10px] text-primary-light hover:underline font-semibold"
                                >
                                  Pilih Semua
                                </button>
                                <span className="text-muted/40">|</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateScheduleDay(dayConfig.day, { timeSlots: [] })}
                                  className="text-[10px] text-muted hover:underline"
                                >
                                  Kosongkan
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {STANDARD_TIME_SLOTS.map(slot => {
                                const isChecked = dayConfig.timeSlots?.includes(slot);
                                return (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => handleToggleTimeSlot(dayConfig.day, slot)}
                                    className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold flex items-center justify-between border transition cursor-pointer ${
                                      isChecked 
                                        ? 'bg-primary/20 border-primary text-primary-light font-bold' 
                                        : 'bg-surface border-surface-light/50 text-muted hover:text-white'
                                    }`}
                                  >
                                    <span className="font-mono">{slot}</span>
                                    {isChecked && <Check className="w-3 h-3 text-primary" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* General Capacity */}
              <div className="p-4 bg-background/50 rounded-2xl border border-surface-light/60 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white text-xs">Batas Maksimal Beban Klien Harian</h4>
                  <p className="text-[11px] text-muted">Membantu sistem mencegah over-capacity dalam satu hari praktik</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={maxClientsPerDay}
                    onChange={(e) => setMaxClientsPerDay(parseInt(e.target.value) || 6)}
                    className="w-20 bg-surface border border-surface-light/60 rounded-xl px-3 py-1.5 text-white text-center font-bold text-xs"
                  />
                  <span className="text-muted text-xs">Sesi / Hari</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFIL & SPESIALISASI */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-primary-light uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" />
                  Biodata Praktisi & Kontak
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted font-medium mb-1">Nama Lengkap & Gelar *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-background border border-surface-light/60 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-muted font-medium mb-1">Gelar / Posisi Terapi</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-background border border-surface-light/60 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                {/* Photo URL */}
                <div className="flex items-center gap-4 p-3 bg-background/50 rounded-2xl border border-surface-light/40">
                  <img
                    src={photoUrl}
                    alt="Preview"
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-primary/40 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <label className="block text-muted font-medium mb-1">URL Foto Profil</label>
                    <input
                      type="text"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      className="w-full bg-surface border border-surface-light/60 rounded-xl px-3 py-1.5 text-white text-[11px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-muted font-medium mb-1">No. WhatsApp / Telepon</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-background border border-surface-light/60 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-muted font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-background border border-surface-light/60 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-muted font-medium mb-1">Status Keaktifan</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full bg-background border border-surface-light/60 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Cuti">Cuti</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-muted font-medium mb-1">Ruangan Default</label>
                  <select
                    value={defaultRoom}
                    onChange={(e) => setDefaultRoom(e.target.value)}
                    className="w-full bg-background border border-surface-light/60 rounded-xl px-3 py-2 text-white"
                  >
                    {DEFAULT_THERAPY_ROOMS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-muted font-medium mb-1">Bio / Keterangan Terapis</label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-background border border-surface-light/60 rounded-xl p-3 text-white"
                  />
                </div>
              </div>

              {/* Specialties Selection */}
              <div className="space-y-3 pt-3 border-t border-surface-light/60">
                <h3 className="text-xs font-bold text-primary-light uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5" />
                  Keahlian & Spesialisasi Terapi
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {therapyTypes.map(therapy => {
                    const isChecked = specialties.includes(therapy.id);
                    return (
                      <label
                        key={therapy.id}
                        onClick={() => handleSpecialtyToggle(therapy.id)}
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition select-none ${
                          isChecked 
                            ? 'border-primary bg-primary/10 shadow-xs' 
                            : 'border-surface-light/60 bg-background/50 hover:bg-surface-light/30'
                        }`}
                      >
                        <div 
                          className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                            isChecked ? 'bg-primary border-primary text-background' : 'border-muted'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{therapy.name}</span>
                          <span className="text-[10px] text-muted">{therapy.id}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SISWA & SESI TERJADWAL */}
          {activeTab === 'clients' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-xs">Daftar Sesi Siswa yang Ditangani</h4>
                  <p className="text-[11px] text-muted">
                    Total {scheduledClients.length} sesi mingguan terdaftar dalam jadwal operasional
                  </p>
                </div>
              </div>

              {scheduledClients.length === 0 ? (
                <div className="p-8 text-center bg-background/50 rounded-2xl border border-surface-light/40">
                  <Users className="w-10 h-10 text-muted mx-auto mb-2 opacity-40" />
                  <p className="text-xs text-white font-semibold">Belum ada siswa yang terjadwal dengan terapis ini</p>
                  <p className="text-[11px] text-muted max-w-sm mx-auto mt-1">
                    Anda dapat menetapkan terapis ini ke jadwal siswa melalui menu <strong>Manajemen Jadwal</strong> atau <strong>Manajemen Anak</strong>.
                  </p>
                </div>
              ) : (
                <div className="border border-surface-light/60 rounded-2xl overflow-hidden">
                  <table className="min-w-full divide-y divide-surface-light text-left text-xs">
                    <thead className="bg-background/80 text-muted uppercase font-semibold">
                      <tr>
                        <th className="px-4 py-3">Hari & Jam</th>
                        <th className="px-4 py-3">Nama Siswa</th>
                        <th className="px-4 py-3">Jenis Terapi</th>
                        <th className="px-4 py-3">Orang Tua / Kontak</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-light/40">
                      {scheduledClients.map((item, idx) => (
                        <tr key={idx} className="hover:bg-surface-light/30 transition">
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-white">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-primary-light" />
                              <span className="font-bold text-primary-light">{item.day}</span>
                              <span className="font-mono text-muted">({item.time})</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-bold text-white">
                            <div className="flex items-center gap-2">
                              <img
                                src={item.child.photoUrl}
                                alt=""
                                className="w-7 h-7 rounded-lg object-cover ring-1 ring-surface-light"
                              />
                              <div>
                                <span>{item.child.name}</span>
                                <span className="text-[10px] text-muted block font-mono">{item.child.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary-light border border-primary/20">
                              {item.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-muted">
                            <div>{item.child.parentName || item.child.motherName || '-'}</div>
                            {item.child.phone && (
                              <div className="text-[10px] font-mono text-emerald-400">{item.child.phone}</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-surface-light flex items-center justify-between gap-3 bg-surface">
          <div className="text-[11px] text-muted">
            Perubahan akan langsung disimpan ke sistem operasional
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-muted hover:text-white bg-surface-light/50 hover:bg-surface-light transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 rounded-xl text-xs font-bold text-background bg-primary hover:bg-primary-dark transition shadow-lg shadow-primary/20 cursor-pointer"
            >
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   SUB-COMPONENT: PrintTherapistScheduleModal (Matriks Jadwal Mingguan)
   ========================================================================= */

interface PrintTherapistScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  therapists: Therapist[];
  therapyTypes: TherapyDefinition[];
  logoUrl?: string;
}

const PrintTherapistScheduleModal: React.FC<PrintTherapistScheduleModalProps> = ({
  isOpen,
  onClose,
  therapists,
  therapyTypes,
  logoUrl
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm print-preview-modal-root">
      <div className="bg-surface border border-surface-light rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-surface-light flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Pratinjau Matriks Jadwal Praktik Terapis</h2>
              <p className="text-xs text-muted">Format standar cetak jadwal seluruh praktisi Pelangi Lazuardi</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-background font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dokumen</span>
            </button>
            <button onClick={onClose} className="p-2 text-muted hover:text-white rounded-xl">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white text-slate-900 therapy-print-sheet">
          {/* Header Lembaga */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-14 h-14 object-contain" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl">
                  PL
                </div>
              )}
              <div>
                <h1 className="text-lg font-black text-slate-900 tracking-tight">
                  PUSAT TERAPI TUMBUH KEMBANG PELANGI LAZUARDI
                </h1>
                <p className="text-xs text-slate-600">
                  Lazuardi Cordova Global Islamic School • Layanan Terapi Terpadu
                </p>
                <p className="text-[11px] text-slate-500">
                  Jadwal Praktik Praktisi Terapis • Dicetak pada: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
                </p>
              </div>
            </div>
            <div className="text-right text-xs">
              <span className="font-bold text-indigo-700 block">DOKUMEN RESMI</span>
              <span className="text-slate-500 font-mono text-[10px]">DOC-TERAPIS-{new Date().getFullYear()}</span>
            </div>
          </div>

          {/* Schedule Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="min-w-full text-left text-xs divide-y divide-slate-300">
              <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                <tr>
                  <th className="px-3 py-2.5 border-r border-slate-300">No</th>
                  <th className="px-3 py-2.5 border-r border-slate-300">Nama Terapis & Gelar</th>
                  <th className="px-3 py-2.5 border-r border-slate-300">Spesialisasi</th>
                  {DAYS_OF_WEEK.map(d => (
                    <th key={d} className="px-2 py-2.5 text-center border-r border-slate-300 last:border-r-0">
                      {d}
                    </th>
                  ))}
                  <th className="px-3 py-2.5">Ruang Praktik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {therapists.map((t, idx) => {
                  const workingDays = t.workingDays || 
                    (t.scheduleDays ? t.scheduleDays.filter(s => s.active).map(s => s.day) : ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']);
                  return (
                    <tr key={t.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="px-3 py-2 border-r border-slate-200 font-mono text-center text-[11px]">{idx + 1}</td>
                      <td className="px-3 py-2 border-r border-slate-200 font-semibold text-slate-900">
                        <div>{t.name}</div>
                        <div className="text-[10px] text-slate-500">{t.title || 'Praktisi Terapi'}</div>
                      </td>
                      <td className="px-3 py-2 border-r border-slate-200">
                        <div className="flex flex-wrap gap-1">
                          {t.specialties?.map(s => (
                            <span key={s} className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-semibold text-[9px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      {DAYS_OF_WEEK.map(d => {
                        const isWorking = workingDays.includes(d);
                        return (
                          <td key={d} className="px-2 py-2 text-center border-r border-slate-200 last:border-r-0">
                            {isWorking ? (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                                08-16
                              </span>
                            ) : (
                              <span className="text-slate-300 text-[10px]">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2 text-slate-700 text-[11px]">
                        {t.defaultRoom || 'Ruang Terapi'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="mt-8 pt-4 flex justify-between items-end text-xs text-slate-800">
            <div>
              <p className="font-semibold">Catatan:</p>
              <p className="text-[11px] text-slate-500">Perubahan jadwal wajib dikoordinasikan minimal 1x24 jam kepada Koordinator Terapi.</p>
            </div>
            <div className="text-center">
              <p className="text-slate-600 mb-12">Tangerang Selatan, {new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
              <p className="font-bold underline">Koordinator Layanan Terapi</p>
              <p className="text-[10px] text-slate-500">Pelangi Lazuardi</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistManagementPage;
